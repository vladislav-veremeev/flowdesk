export const getApiErrorMessage = (
    error: unknown,
    fallback = 'Произошла ошибка'
) => {
    if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof (error as any).response?.data?.message === 'string'
    ) {
        return (error as any).response.data.message
    }

    if (error instanceof Error && error.message) {
        return error.message
    }

    return fallback
}
