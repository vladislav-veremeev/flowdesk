import { z } from 'zod'

export const taskSchema = z.object({
    title: z
        .string()
        .trim()
        .min(1, 'Введите название задачи')
        .max(255, 'Название задачи должно содержать не более 255 символов'),
    description: z.string().max(5000, 'Описание слишком длинное').optional(),
    priority: z.enum(['low', 'medium', 'high']),
    dueDate: z.string().optional(),
    assigneeId: z.string().optional(),
})

export type TaskFormValues = z.infer<typeof taskSchema>

export const taskDefaultValues: TaskFormValues = {
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    assigneeId: undefined,
}
