import { api } from '@/shared/api'
import type { Column } from '@/entities/column'

type CreateColumnDto = {
    title: string
    boardId: string
    wipLimit?: number | null
}

type UpdateColumnDto = {
    title: string
    wipLimit?: number | null
}

export const getColumns = async (boardId: string) => {
    const response = await api.get<Column[]>('/columns', {
        params: { boardId },
    })

    return response.data
}

export const createColumn = async (payload: CreateColumnDto) => {
    const response = await api.post<Column>('/columns', payload)
    return response.data
}

export const updateColumn = async (
    columnId: string,
    payload: UpdateColumnDto
) => {
    const response = await api.put<Column>(`/columns/${columnId}`, payload)
    return response.data
}

export const deleteColumn = async (columnId: string) => {
    await api.delete(`/columns/${columnId}`)
}
