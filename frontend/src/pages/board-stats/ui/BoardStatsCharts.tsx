import type { BoardStats, StatsSeriesPoint } from '@/entities/board-stats'
import {
    Bar,
    BarChart,
    CartesianGrid,
    Line,
    LineChart,
    XAxis,
    YAxis,
} from 'recharts'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import {
    type ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart'

type BoardStatsChartsProps = {
    stats: BoardStats
}

const leadTimeChartConfig = {
    value: {
        label: 'Время выполнения, ч',
        color: 'var(--chart-1)',
    },
} satisfies ChartConfig

const cycleTimeChartConfig = {
    value: {
        label: 'Продолжительность цикла, ч',
        color: 'var(--chart-2)',
    },
} satisfies ChartConfig

const wipChartConfig = {
    value: {
        label: 'Незавершённая работа',
        color: 'var(--chart-3)',
    },
} satisfies ChartConfig

const throughputChartConfig = {
    value: {
        label: 'Пропускная способность',
        color: 'var(--chart-4)',
    },
} satisfies ChartConfig

const formatBucket = (value: string, bucketType: 'hour' | 'day') => {
    const date = new Date(value)

    if (bucketType === 'hour') {
        return date.toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
    })
}

const mapSeries = (series: StatsSeriesPoint[]) =>
    series.map((point) => ({
        ...point,
        displayValue: point.value,
    }))

type SeriesChartCardProps = {
    title: string
    description: string
    data: StatsSeriesPoint[]
    bucketType: 'hour' | 'day'
    config: ChartConfig
    colorVar: string
    chartType?: 'line' | 'bar'
    yAxisLabel?: string
    allowDecimals?: boolean
}

const SeriesChartCard = ({
    title,
    description,
    data,
    bucketType,
    config,
    colorVar,
    chartType = 'line',
    allowDecimals = true,
}: SeriesChartCardProps) => {
    const chartData = mapSeries(data)

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={config}>
                    {chartType === 'bar' ? (
                        <BarChart accessibilityLayer data={chartData}>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="bucket"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                minTickGap={32}
                                tickFormatter={(value) =>
                                    formatBucket(String(value), bucketType)
                                }
                            />
                            <YAxis allowDecimals={allowDecimals} />
                            <ChartTooltip
                                content={
                                    <ChartTooltipContent
                                        className="w-50"
                                        labelFormatter={(value) =>
                                            formatBucket(
                                                String(value),
                                                bucketType
                                            )
                                        }
                                    />
                                }
                            />
                            <Bar dataKey="value" fill={colorVar} radius={8} />
                        </BarChart>
                    ) : (
                        <LineChart accessibilityLayer data={chartData}>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="bucket"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                minTickGap={32}
                                tickFormatter={(value) =>
                                    formatBucket(String(value), bucketType)
                                }
                            />
                            <YAxis allowDecimals={allowDecimals} />
                            <ChartTooltip
                                content={
                                    <ChartTooltipContent
                                        className="w-50"
                                        labelFormatter={(value) =>
                                            formatBucket(
                                                String(value),
                                                bucketType
                                            )
                                        }
                                    />
                                }
                            />
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke={colorVar}
                                strokeWidth={2}
                            />
                        </LineChart>
                    )}
                </ChartContainer>
            </CardContent>
        </Card>
    )
}

export const BoardStatsCharts = ({ stats }: BoardStatsChartsProps) => {
    return (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <SeriesChartCard
                title="Время выполнения"
                description={`От создания задачи до первого попадания в выполненные.`}
                data={stats.leadTimeSeries}
                bucketType={stats.bucketType}
                config={leadTimeChartConfig}
                colorVar="var(--color-value)"
            />

            <SeriesChartCard
                title="Продолжительность цикла"
                description={`От первого попадания задачи в активную работу до завершения.`}
                data={stats.cycleTimeSeries}
                bucketType={stats.bucketType}
                config={cycleTimeChartConfig}
                colorVar="var(--color-value)"
            />

            <SeriesChartCard
                title="Незавершённая работа"
                description={`Количество задач, находящихся в активной работе.`}
                data={stats.wipSeries}
                bucketType={stats.bucketType}
                config={wipChartConfig}
                colorVar="var(--color-value)"
                chartType="bar"
                allowDecimals={false}
            />

            <SeriesChartCard
                title="Пропускная способность"
                description={`Количество задач, завершённых за интервал.`}
                data={stats.throughputSeries}
                bucketType={stats.bucketType}
                config={throughputChartConfig}
                colorVar="var(--color-value)"
                chartType="bar"
                allowDecimals={false}
            />
        </div>
    )
}
