export type BoardMemberRole = 'owner' | 'member'

export interface BoardMember {
    userId: string
    username: string
    role: BoardMemberRole
    joinedAt: string
}
