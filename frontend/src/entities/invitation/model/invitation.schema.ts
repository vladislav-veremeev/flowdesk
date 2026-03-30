import z from 'zod'

export const inviteSchema = z.object({
    username: z
        .string()
        .trim()
        .min(1, 'Введите имя пользователя')
        .min(3, 'Имя пользователя должно содержать минимум 3 символа'),
})

export type InviteFormValues = z.infer<typeof inviteSchema>

export const inviteDefaultValues: InviteFormValues = {
    username: '',
}
