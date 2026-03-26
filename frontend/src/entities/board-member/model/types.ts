export type BoardMemberRole = 'owner' | 'member'

export interface BoardMember {
    userId: string
    username: string
    email: string
    role: BoardMemberRole
    joinedAt: string
}
