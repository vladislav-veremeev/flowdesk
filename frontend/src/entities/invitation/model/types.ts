export type InvitationStatus = 'pending' | 'accepted' | 'declined'

export interface IncomingInvitation {
    id: string
    boardId: string
    boardTitle: string
    inviterId: string
    inviterUsername: string
    inviteeId: string
    status: InvitationStatus
    createdAt: string
    respondedAt: string | null
}
