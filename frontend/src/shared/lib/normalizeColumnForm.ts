import type { ColumnFormValues } from '@/entities/column'

export const normalizeColumnForm = (data: ColumnFormValues) => {
    const trimmedWip = data.wipLimit?.trim()

    return {
        title: data.title.trim(),
        wipLimit: trimmedWip ? Number(trimmedWip) : null,
    }
}
