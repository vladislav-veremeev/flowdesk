import { pool } from "../../config/db";
import { ensureBoardMember } from "../boards/boards.access";
import {
    BoardStatsResponse,
    StatsBucketType,
    StatsSeriesPoint,
} from "./board-stats.types";

type TaskHistoryEventRow = {
    task_ref: string;
    event_type: "created" | "moved" | "deleted";
    occurred_at: string;
    from_stage: "todo" | "in_progress" | "done" | null;
    to_stage: "todo" | "in_progress" | "done" | null;
};

type TaskTimelineEvent = {
    eventType: "created" | "moved" | "deleted";
    occurredAt: Date;
    fromStage: "todo" | "in_progress" | "done" | null;
    toStage: "todo" | "in_progress" | "done" | null;
};

type WipChangeEvent = {
    occurredAt: Date;
    delta: number;
};

function roundToTwo(value: number | null): number | null {
    if (value === null) {
        return null;
    }

    return Math.round(value * 100) / 100;
}

function toHourBucket(date: Date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
    )}-${String(date.getDate()).padStart(2, "0")}T${String(
        date.getHours()
    ).padStart(2, "0")}:00:00`;
}

function toDayBucket(date: Date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
    )}-${String(date.getDate()).padStart(2, "0")}T00:00:00`;
}

function getBucketKey(date: Date, bucketType: StatsBucketType) {
    return bucketType === "hour" ? toHourBucket(date) : toDayBucket(date);
}

function buildBucketRange(period: 1 | 7 | 30, bucketType: StatsBucketType) {
    const now = new Date();
    const buckets: string[] = [];

    if (bucketType === "hour") {
        const currentHour = new Date(now);
        currentHour.setMinutes(0, 0, 0);

        for (let index = 23; index >= 0; index--) {
            const bucketDate = new Date(currentHour);
            bucketDate.setHours(currentHour.getHours() - index);
            buckets.push(toHourBucket(bucketDate));
        }
    } else {
        const currentDay = new Date(now);
        currentDay.setHours(0, 0, 0, 0);

        for (let index = period - 1; index >= 0; index--) {
            const bucketDate = new Date(currentDay);
            bucketDate.setDate(currentDay.getDate() - index);
            buckets.push(toDayBucket(bucketDate));
        }
    }

    return buckets;
}

function groupEventsByTask(events: TaskHistoryEventRow[]) {
    const eventsByTask = new Map<string, TaskTimelineEvent[]>();

    for (const event of events) {
        const current = eventsByTask.get(event.task_ref) ?? [];

        current.push({
            eventType: event.event_type,
            occurredAt: new Date(event.occurred_at),
            fromStage: event.from_stage,
            toStage: event.to_stage,
        });

        eventsByTask.set(event.task_ref, current);
    }

    for (const [taskRef, taskEvents] of eventsByTask) {
        taskEvents.sort(
            (left, right) =>
                left.occurredAt.getTime() - right.occurredAt.getTime()
        );
        eventsByTask.set(taskRef, taskEvents);
    }

    return eventsByTask;
}

function buildAverageSeries(
    buckets: string[],
    valuesByBucket: Map<string, number[]>
): StatsSeriesPoint[] {
    return buckets.map((bucket) => {
        const values = valuesByBucket.get(bucket) ?? [];

        if (values.length === 0) {
            return {
                bucket,
                value: null,
            };
        }

        const average =
            values.reduce((sum, value) => sum + value, 0) / values.length;

        return {
            bucket,
            value: roundToTwo(average),
        };
    });
}

function buildCountSeries(
    buckets: string[],
    valuesByBucket: Map<string, number>
): StatsSeriesPoint[] {
    return buckets.map((bucket) => ({
        bucket,
        value: valuesByBucket.get(bucket) ?? 0,
    }));
}

export async function getBoardStats(
    userId: string,
    boardId: string,
    period: 1 | 7 | 30
): Promise<BoardStatsResponse> {
    await ensureBoardMember(boardId, userId);

    const bucketType: StatsBucketType = period === 1 ? "hour" : "day";
    const buckets = buildBucketRange(period, bucketType);
    const rangeStart = new Date(buckets[0]);

    const eventsResult = await pool.query<TaskHistoryEventRow>(
        `SELECT task_ref, event_type, occurred_at, from_stage, to_stage
         FROM task_history_events
         WHERE board_id = $1
         ORDER BY occurred_at ASC`,
        [boardId]
    );

    const eventsByTask = groupEventsByTask(eventsResult.rows);

    const leadTimeValuesByBucket = new Map<string, number[]>();
    const cycleTimeValuesByBucket = new Map<string, number[]>();
    const throughputByBucket = new Map<string, number>();
    const wipChangeEvents: WipChangeEvent[] = [];

    for (const [, taskEvents] of eventsByTask) {
        let createdAt: Date | null = null;
        let firstInProgressAt: Date | null = null;
        let firstDoneAt: Date | null = null;

        for (const event of taskEvents) {
            if (event.eventType === "created" && !createdAt) {
                createdAt = event.occurredAt;
            }

            if (!firstInProgressAt && event.toStage === "in_progress") {
                firstInProgressAt = event.occurredAt;
            }

            if (!firstDoneAt && event.toStage === "done") {
                firstDoneAt = event.occurredAt;
            }

            const enteredInProgress =
                event.fromStage !== "in_progress" &&
                event.toStage === "in_progress";

            const leftInProgress =
                event.fromStage === "in_progress" &&
                event.toStage !== "in_progress";

            if (enteredInProgress) {
                wipChangeEvents.push({
                    occurredAt: event.occurredAt,
                    delta: 1,
                });
            }

            if (leftInProgress) {
                wipChangeEvents.push({
                    occurredAt: event.occurredAt,
                    delta: -1,
                });
            }
        }

        if (createdAt && firstDoneAt && firstDoneAt >= rangeStart) {
            const leadTimeHours =
                (firstDoneAt.getTime() - createdAt.getTime()) /
                (1000 * 60 * 60);

            const bucket = getBucketKey(firstDoneAt, bucketType);
            const current = leadTimeValuesByBucket.get(bucket) ?? [];
            current.push(leadTimeHours);
            leadTimeValuesByBucket.set(bucket, current);

            throughputByBucket.set(
                bucket,
                (throughputByBucket.get(bucket) ?? 0) + 1
            );
        }

        if (
            firstInProgressAt &&
            firstDoneAt &&
            firstDoneAt >= firstInProgressAt &&
            firstDoneAt >= rangeStart
        ) {
            const cycleTimeHours =
                (firstDoneAt.getTime() - firstInProgressAt.getTime()) /
                (1000 * 60 * 60);

            const bucket = getBucketKey(firstDoneAt, bucketType);
            const current = cycleTimeValuesByBucket.get(bucket) ?? [];
            current.push(cycleTimeHours);
            cycleTimeValuesByBucket.set(bucket, current);
        }
    }

    wipChangeEvents.sort(
        (left, right) => left.occurredAt.getTime() - right.occurredAt.getTime()
    );

    let currentWipAtRangeStart = 0;

    for (const [, taskEvents] of eventsByTask) {
        let latestStageBeforeRange: "todo" | "in_progress" | "done" | null =
            null;

        for (const event of taskEvents) {
            if (event.occurredAt >= rangeStart) {
                break;
            }

            latestStageBeforeRange = event.toStage;
        }

        if (latestStageBeforeRange === "in_progress") {
            currentWipAtRangeStart += 1;
        }
    }

    const wipSeries: StatsSeriesPoint[] = [];
    let currentWip = currentWipAtRangeStart;
    let wipEventIndex = 0;

    for (let index = 0; index < buckets.length; index++) {
        const bucket = buckets[index];
        const bucketStart = new Date(bucket);

        const bucketEnd =
            index < buckets.length - 1
                ? new Date(buckets[index + 1])
                : new Date(
                    bucketType === "hour"
                        ? bucketStart.getTime() + 60 * 60 * 1000
                        : bucketStart.getTime() + 24 * 60 * 60 * 1000
                );

        let bucketMaxWip = currentWip;

        while (
            wipEventIndex < wipChangeEvents.length &&
            wipChangeEvents[wipEventIndex].occurredAt < bucketEnd
            ) {
            if (wipChangeEvents[wipEventIndex].occurredAt >= bucketStart) {
                currentWip += wipChangeEvents[wipEventIndex].delta;
                bucketMaxWip = Math.max(bucketMaxWip, currentWip);
            }

            wipEventIndex += 1;
        }

        wipSeries.push({
            bucket,
            value: bucketMaxWip,
        });
    }

    return {
        period,
        bucketType,
        leadTimeSeries: buildAverageSeries(buckets, leadTimeValuesByBucket),
        cycleTimeSeries: buildAverageSeries(buckets, cycleTimeValuesByBucket),
        wipSeries,
        throughputSeries: buildCountSeries(buckets, throughputByBucket),
    };
}