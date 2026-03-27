export type TaskPriority = 'low' | 'medium' | 'high'

export interface Task {
    id: string
    title: string
    description: string | null
    priority: TaskPriority
    position: number
    boardId: string
    columnId: string
    dueDate: string | null
    assigneeId: string | null
    createdAt: string
    updatedAt: string
}
