import { api } from '@/shared/api'
import type { Board } from '@/entities/board'

type BoardPayload = {
    title: string
    description?: string
}

export const getBoards = async () => {
    const response = await api.get<Board[]>('/boards')
    return response.data
}

export const createBoard = async (payload: BoardPayload) => {
    const response = await api.post<Board>('/boards', payload)
    return response.data
}

export const updateBoard = async (boardId: string, payload: BoardPayload) => {
    const response = await api.put<Board>(`/boards/${boardId}`, payload)
    return response.data
}

export const deleteBoard = async (boardId: string) => {
    const response = await api.delete<{ message: string }>(`/boards/${boardId}`)
    return response.data
}

export const getBoardById = async (boardId: string) => {
    const response = await api.get(`/boards/${boardId}`)
    return response.data
}
