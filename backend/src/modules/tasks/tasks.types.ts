export type TaskPriority = "low" | "medium" | "high";

export type TaskRow = {
    id: string;
    title: string;
    description: string | null;
    priority: TaskPriority | null;
    position: number;
    board_id: string;
    column_id: string;
    due_date: string | null;
    assignee_id: string | null;
    created_at: string;
    updated_at: string;
};

export type CreateTaskBody = {
    title: string;
    description?: string;
    priority?: TaskPriority | null;
    boardId: string;
    columnId: string;
    dueDate?: string | null;
    assigneeId?: string | null;
};

export type UpdateTaskBody = {
    title: string;
    description?: string;
    priority?: TaskPriority | null;
    dueDate?: string | null;
    assigneeId?: string | null;
};

export type MoveTaskBody = {
    targetColumnId: string;
    targetPosition: number;
};

export type Task = {
    id: string;
    title: string;
    description: string | null;
    priority: TaskPriority | null;
    position: number;
    boardId: string;
    columnId: string;
    dueDate: string | null;
    assigneeId: string | null;
    createdAt: string;
    updatedAt: string;
};