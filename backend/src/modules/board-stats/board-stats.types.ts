export type StatsBucketType = "hour" | "day";

export type StatsSeriesPoint = {
    bucket: string;
    value: number | null;
};

export type BoardStatsResponse = {
    period: 1 | 7 | 30;
    bucketType: StatsBucketType;
    leadTimeSeries: StatsSeriesPoint[];
    cycleTimeSeries: StatsSeriesPoint[];
    wipSeries: StatsSeriesPoint[];
    throughputSeries: StatsSeriesPoint[];
};