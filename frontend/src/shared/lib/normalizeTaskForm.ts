import type { TaskFormValues } from '@/entities/task'

export const normalizeTaskForm = (data: TaskFormValues) => ({
    title: data.title.trim(),
    description: data.description?.trim() || undefined,
    priority: data.priority,
    dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
    assigneeId: data.assigneeId || null,
})
