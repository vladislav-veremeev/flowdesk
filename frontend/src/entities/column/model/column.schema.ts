import { z } from 'zod'

export const columnSchema = z.object({
    title: z
        .string()
        .trim()
        .min(1, 'Введите название колонки')
        .max(255, 'Название колонки должно содержать не более 255 символов'),
    wipLimit: z
        .string()
        .optional()
        .refine(
            (value) => {
                if (!value || value.trim() === '') return true // поле не заполнено — ок
                return Number(value) > 0 // если заполнено — должно быть > 0
            },
            {
                message: 'Лимит должен быть больше 0',
            }
        ),
})

export type ColumnFormValues = z.infer<typeof columnSchema>

export const columnDefaultValues: ColumnFormValues = {
    title: '',
    wipLimit: '',
}
