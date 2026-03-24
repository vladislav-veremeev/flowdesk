import type { TaskPriority } from '@/entities/task'

export const taskPriorityLabels: Record<TaskPriority, string> = {
    low: 'Низкий',
    medium: 'Средний',
    high: 'Высокий',
}

export const getTaskPriorityLabel = (priority: TaskPriority) => {
    return taskPriorityLabels[priority]
}
