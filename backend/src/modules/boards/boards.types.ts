export type BoardRow = {
    id: string;
    title: string;
    description: string | null;
    owner_id: string;
    created_at: string;
};

export type Board = {
    id: string;
    title: string;
    description: string | null;
    ownerId: string;
    createdAt: string;
};

export type CreateBoardBody = {
    title: string;
    description?: string | null;
};

export type UpdateBoardBody = {
    title: string;
    description?: string | null;
};

export type BoardMemberRole = "owner" | "member";

export type BoardMemberRow = {
    user_id: string;
    username: string;
    email: string;
    role: BoardMemberRole;
    joined_at: string;
};

export type BoardMember = {
    userId: string;
    username: string;
    email: string;
    role: BoardMemberRole;
    joinedAt: string;
};