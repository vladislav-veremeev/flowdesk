export type ColumnRow = {
    id: string;
    title: string;
    position: number;
    wip_limit: number | null;
    board_id: string;
    created_at: string;
};

export type CreateColumnBody = {
    title: string;
    boardId: string;
    wipLimit?: number | null;
};

export type UpdateColumnBody = {
    title: string;
    wipLimit?: number | null;
};

export type Column = {
    id: string;
    title: string;
    position: number;
    wipLimit: number | null;
    boardId: string;
    createdAt: string;
};