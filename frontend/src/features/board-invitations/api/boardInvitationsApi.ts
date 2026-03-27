import { api } from '@/shared/api'
import type { IncomingInvitation } from '@/entities/invitation'

export const getMyInvitations = async () => {
    const response = await api.get<IncomingInvitation[]>(
        '/board-invitations/my'
    )
    return response.data
}

export const createBoardInvitation = async (payload: {
    boardId: string
    inviteeUsername: string
}) => {
    const response = await api.post('/board-invitations', payload)
    return response.data
}

export const acceptBoardInvitation = async (invitationId: string) => {
    const response = await api.patch(
        `/board-invitations/${invitationId}/accept`
    )
    return response.data
}

export const declineBoardInvitation = async (invitationId: string) => {
    const response = await api.patch(
        `/board-invitations/${invitationId}/decline`
    )
    return response.data
}

export const deleteBoardInvitation = async (invitationId: string) => {
    const response = await api.delete(`/board-invitations/${invitationId}`)
    return response.data
}
