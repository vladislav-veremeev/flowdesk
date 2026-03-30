import { z } from 'zod'

export const boardSchema = z.object({
    title: z
        .string()
        .trim()
        .min(1, 'Введите название доски')
        .max(100, 'Название доски должно содержать не более 100 символов'),
    description: z
        .string()
        .max(500, 'Описание должно содержать не более 500 символов'),
})

export type BoardFormValues = z.infer<typeof boardSchema>

export const boardDefaultValues: BoardFormValues = {
    title: '',
    description: '',
}
