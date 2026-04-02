import { api } from '@/shared/api'
import type { BoardStats } from '@/entities/board-stats'

export const getBoardStats = async (
    boardId: string,
    period: 1 | 7 | 30 = 7
) => {
    const response = await api.get<BoardStats>(`/board-stats/${boardId}`, {
        params: { period },
    })

    return response.data
}
