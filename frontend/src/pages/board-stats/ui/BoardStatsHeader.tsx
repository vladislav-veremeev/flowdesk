import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Item,
    ItemActions,
    ItemContent,
    ItemDescription,
    ItemTitle,
} from '@/components/ui/item'

type BoardStatsHeaderProps = {
    boardTitle: string
    period: 1 | 7 | 30
    onPeriodChange: (value: 1 | 7 | 30) => void
    boardId: string
}

export const BoardStatsHeader = ({
    boardTitle,
    period,
    onPeriodChange,
    boardId,
}: BoardStatsHeaderProps) => {
    return (
        <Item className="p-0">
            <ItemContent>
                <ItemTitle className="text-xl">
                    Статистика доски: {boardTitle}
                </ItemTitle>
                <ItemDescription>
                    Ключевые метрики за выбранный период.
                </ItemDescription>
            </ItemContent>

            <ItemActions>
                <Select
                    value={String(period)}
                    onValueChange={(value) =>
                        onPeriodChange(Number(value) as 1 | 7 | 30)
                    }
                >
                    <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Период" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="1">1 день</SelectItem>
                        <SelectItem value="7">7 дней</SelectItem>
                        <SelectItem value="30">30 дней</SelectItem>
                    </SelectContent>
                </Select>

                <Button asChild variant="outline">
                    <Link to={`/boards/${boardId}`}>
                        <ArrowLeft />
                        Назад
                    </Link>
                </Button>
            </ItemActions>
        </Item>
    )
}
