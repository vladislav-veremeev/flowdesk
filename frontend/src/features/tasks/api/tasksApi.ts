import { api } from '@/shared/api'
import type { Task, TaskPriority } from '@/entities/task'

export const getTasks = async (boardId: string) => {
    const response = await api.get<Task[]>('/tasks', {
        params: { boardId },
    })

    return response.data
}

export const createTask = async (payload: {
    title: string
    description?: string
    priority?: TaskPriority | null
    boardId: string
    columnId: string
    dueDate?: string | null
    assigneeId?: string | null
}) => {
    const response = await api.post<Task>('/tasks', payload)
    return response.data
}

export const updateTask = async (
    taskId: string,
    payload: {
        title: string
        description?: string
        priority?: TaskPriority | null
        dueDate?: string | null
        assigneeId?: string | null
    }
) => {
    const response = await api.put<Task>(`/tasks/${taskId}`, payload)
    return response.data
}

export const moveTask = async (
    taskId: string,
    payload: {
        targetColumnId: string
        targetPosition: number
    }
) => {
    const response = await api.patch<Task>(`/tasks/${taskId}/move`, payload)
    return response.data
}

export const deleteTask = async (taskId: string) => {
    const response = await api.delete<{ message: string }>(`/tasks/${taskId}`)
    return response.data
}
