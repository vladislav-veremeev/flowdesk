export const formatDateTime = (value?: string) => {
    if (!value) return ''

    return new Date(value).toLocaleString('ru-RU', {
        timeZone: 'Europe/Minsk',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    })
}
