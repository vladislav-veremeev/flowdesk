export type TaskPriority = 'low' | 'medium' | 'high'

export interface Task {
    id: string
    title: string
    description: string | null
    priority: TaskPriority
    position: number
    boardId: string
    columnId: string
    assigneeId: string | null
    dueDate: string | null
    createdAt: string
    updatedAt: string
}
