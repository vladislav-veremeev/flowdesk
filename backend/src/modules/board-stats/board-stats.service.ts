import { pool } from "../../config/db";
import { ensureBoardMember } from "../boards/boards.access";
import { BoardStatsResponse, StatsBucketType, StatsSeriesPoint } from "./board-stats.types";

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

function roundToTwo(value: number | null): number | null {
    if (value === null) {
        return null;
    }

    return Math.round(value * 100) / 100;
}

function toHourBucket(date: Date) {
    return `${date.toISOString().slice(0, 13)}:00:00.000Z`;
}

function toDayBucket(date: Date) {
    return `${date.toISOString().slice(0, 10)}T00:00:00.000Z`;
}

function getBucketKey(date: Date, bucketType: StatsBucketType) {
    return bucketType === "hour" ? toHourBucket(date) : toDayBucket(date);
}

function buildBucketRange(period: 1 | 7 | 30, bucketType: StatsBucketType) {
    const now = new Date();
    const buckets: string[] = [];

    if (bucketType === "hour") {
        const currentHour = new Date(now);
        currentHour.setUTCMinutes(0, 0, 0);

        for (let index = 23; index >= 0; index--) {
            const bucketDate = new Date(currentHour);
            bucketDate.setUTCHours(currentHour.getUTCHours() - index);
            buckets.push(toHourBucket(bucketDate));
        }
    } else {
        const currentDay = new Date(now);
        currentDay.setUTCHours(0, 0, 0, 0);

        for (let index = period - 1; index >= 0; index--) {
            const bucketDate = new Date(currentDay);
            bucketDate.setUTCDate(currentDay.getUTCDate() - index);
            buckets.push(toDayBucket(bucketDate));
        }
    }

    return buckets;
}

function getRangeStart(period: 1 | 7 | 30, bucketType: StatsBucketType) {
    const buckets = buildBucketRange(period, bucketType);
    return new Date(buckets[0]);
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

        const average = values.reduce((sum, value) => sum + value, 0) / values.length;

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
    const rangeStart = getRangeStart(period, bucketType);

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
    const wipChanges = new Map<string, number>();

    for (const [, taskEvents] of eventsByTask) {
        let createdAt: Date | null = null;
        let firstInProgressAt: Date | null = null;
        let firstDoneAt: Date | null = null;

        for (const event of taskEvents) {
            if (event.eventType === "created" && !createdAt) {
                createdAt = event.occurredAt;
            }

            if (
                !firstInProgressAt &&
                event.toStage === "in_progress"
            ) {
                firstInProgressAt = event.occurredAt;
            }

            if (!firstDoneAt && event.toStage === "done") {
                firstDoneAt = event.occurredAt;
            }

            const leftInProgress = event.fromStage === "in_progress" && event.toStage !== "in_progress";
            const enteredInProgress =
                event.fromStage !== "in_progress" && event.toStage === "in_progress";

            if (enteredInProgress) {
                const bucket = getBucketKey(event.occurredAt, bucketType);
                wipChanges.set(bucket, (wipChanges.get(bucket) ?? 0) + 1);
            }

            if (leftInProgress) {
                const bucket = getBucketKey(event.occurredAt, bucketType);
                wipChanges.set(bucket, (wipChanges.get(bucket) ?? 0) - 1);
            }
        }

        if (createdAt && firstDoneAt) {
            const leadTimeHours =
                (firstDoneAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

            if (firstDoneAt >= rangeStart) {
                const bucket = getBucketKey(firstDoneAt, bucketType);
                const current = leadTimeValuesByBucket.get(bucket) ?? [];
                current.push(leadTimeHours);
                leadTimeValuesByBucket.set(bucket, current);

                throughputByBucket.set(bucket, (throughputByBucket.get(bucket) ?? 0) + 1);
            }
        }

        if (firstInProgressAt && firstDoneAt && firstDoneAt >= firstInProgressAt) {
            const cycleTimeHours =
                (firstDoneAt.getTime() - firstInProgressAt.getTime()) / (1000 * 60 * 60);

            if (firstDoneAt >= rangeStart) {
                const bucket = getBucketKey(firstDoneAt, bucketType);
                const current = cycleTimeValuesByBucket.get(bucket) ?? [];
                current.push(cycleTimeHours);
                cycleTimeValuesByBucket.set(bucket, current);
            }
        }
    }

    let currentWip = 0;

    for (const [, taskEvents] of eventsByTask) {
        let latestStageBeforeRange: "todo" | "in_progress" | "done" | null = null;

        for (const event of taskEvents) {
            if (event.occurredAt >= rangeStart) {
                break;
            }

            latestStageBeforeRange = event.toStage;
        }

        if (latestStageBeforeRange === "in_progress") {
            currentWip += 1;
        }
    }

    const wipSeries: StatsSeriesPoint[] = [];
    for (const bucket of buckets) {
        currentWip += wipChanges.get(bucket) ?? 0;
        wipSeries.push({
            bucket,
            value: currentWip,
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