import { useEffect, useState } from 'react'
import type { Board } from '@/entities/board'
import type { BoardStats } from '@/entities/board-stats'
import { getBoardById } from '@/features/boards'
import { getBoardStats } from '@/features/board-stats'
import { getApiErrorMessage } from '@/shared/lib'

const BOARD_STATS_PERIOD_KEY = 'board-stats-period'

const getSavedPeriod = (): 1 | 7 | 30 => {
    const savedValue = localStorage.getItem(BOARD_STATS_PERIOD_KEY)

    if (savedValue === '1' || savedValue === '7' || savedValue === '30') {
        return Number(savedValue) as 1 | 7 | 30
    }

    return 7
}

export const useBoardStatsPage = (boardId?: string) => {
    const [board, setBoard] = useState<Board | null>(null)
    const [stats, setStats] = useState<BoardStats | null>(null)
    const [period, setPeriod] = useState<1 | 7 | 30>(getSavedPeriod)
    const [isLoading, setIsLoading] = useState(true)
    const [loadError, setLoadError] = useState<string | null>(null)

    useEffect(() => {
        localStorage.setItem(BOARD_STATS_PERIOD_KEY, String(period))
    }, [period])

    useEffect(() => {
        const load = async () => {
            if (!boardId) {
                setIsLoading(false)
                setLoadError('Доска не найдена')
                return
            }

            try {
                setIsLoading(true)
                setLoadError(null)

                const [boardData, statsData] = await Promise.all([
                    getBoardById(boardId),
                    getBoardStats(boardId, period),
                ])

                setBoard(boardData)
                setStats(statsData)
            } catch (error) {
                setBoard(null)
                setStats(null)
                setLoadError(
                    getApiErrorMessage(
                        error,
                        'Не удалось загрузить статистику доски'
                    )
                )
            } finally {
                setIsLoading(false)
            }
        }

        load()
    }, [boardId, period])

    return {
        board,
        stats,
        period,
        setPeriod,
        isLoading,
        loadError,
    }
}
