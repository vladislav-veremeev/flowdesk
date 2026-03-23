export type BoardRow = {
    id: string;
    title: string;
    description: string | null;
    owner_id: string;
    created_at: string;
};

export type CreateBoardBody = {
    title: string;
    description?: string;
};

export type UpdateBoardBody = {
    title: string;
    description?: string;
};

export type Board = {
    id: string;
    title: string;
    description: string | null;
    ownerId: string;
    createdAt: string;
};