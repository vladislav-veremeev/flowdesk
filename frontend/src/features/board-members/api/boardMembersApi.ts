import { api } from '@/shared/api'
import type { BoardMember } from '@/entities/board-member'

export const getBoardMembers = async (boardId: string) => {
    const response = await api.get<BoardMember[]>(`/boards/${boardId}/members`)
    return response.data
}

export const removeBoardMember = async (
    boardId: string,
    memberUserId: string
) => {
    const response = await api.delete(
        `/boards/${boardId}/members/${memberUserId}`
    )
    return response.data
}

export const leaveBoard = async (boardId: string) => {
    const response = await api.delete(`/boards/${boardId}/leave`)
    return response.data
}
