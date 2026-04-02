import { Link, useParams } from 'react-router-dom'
import { BoardStatsHeader } from './BoardStatsHeader'
import { BoardStatsCharts } from './BoardStatsCharts'
import { useBoardStatsPage } from '../model'
import {
    Item,
    ItemActions,
    ItemContent,
    ItemDescription,
    ItemTitle,
} from '@/components/ui/item.tsx'
import { Button } from '@/components/ui/button.tsx'
import { ArrowLeft } from 'lucide-react'

export const BoardStatsPage = () => {
    const { id } = useParams<{ id: string }>()

    const { board, stats, period, setPeriod, isLoading, loadError } =
        useBoardStatsPage(id)

    if (isLoading) {
        return (
            <div className="flex flex-col px-6 py-4">
                <Item className="p-0">
                    <ItemContent>
                        <ItemTitle className="text-xl">
                            Загрузка статистики...
                        </ItemTitle>
                        <ItemDescription>
                            Подождите, данные загружаются.
                        </ItemDescription>
                    </ItemContent>
                </Item>
            </div>
        )
    }

    if (loadError || !board || !stats || !id) {
        return (
            <div className="flex flex-col px-6 py-4">
                <Item className="p-0">
                    <ItemContent>
                        <ItemTitle className="text-xl">
                            Статистика не найдена
                        </ItemTitle>

                        <ItemDescription>
                            {loadError ||
                                'Возможно, доска была удалена или у вас нет к ней доступа.'}
                        </ItemDescription>
                    </ItemContent>

                    <ItemActions>
                        <Button asChild variant="outline">
                            <Link to={`/boards/${id}`}>
                                <ArrowLeft />
                                Назад
                            </Link>
                        </Button>
                    </ItemActions>
                </Item>
            </div>
        )
    }

    return (
        <div className="flex flex-col px-6 py-4 gap-4">
            <BoardStatsHeader
                boardId={id}
                boardTitle={board.title}
                period={period}
                onPeriodChange={setPeriod}
            />

            <BoardStatsCharts stats={stats} />
        </div>
    )
}
