import type { BoardFormValues } from '@/entities/board'

export const normalizeBoardForm = (data: BoardFormValues) => ({
    title: data.title.trim(),
    description: data.description.trim() || undefined,
})
