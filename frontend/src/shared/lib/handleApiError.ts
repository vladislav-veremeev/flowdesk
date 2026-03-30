import { toast } from 'sonner'
import { getApiErrorMessage } from './getApiErrorMessage'

export const handleApiError = (
    error: unknown,
    fallback = 'Произошла ошибка'
) => {
    toast.error(getApiErrorMessage(error, fallback))
}
