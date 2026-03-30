import { z } from 'zod'

export const loginSchema = z.object({
    username: z
        .string()
        .trim()
        .min(1, 'Введите имя пользователя')
        .min(3, 'Имя пользователя должно содержать минимум 3 символа'),
    password: z
        .string()
        .min(1, 'Введите пароль')
        .min(6, 'Пароль должен содержать минимум 6 символов'),
})

export type LoginFormValues = z.infer<typeof loginSchema>

export const loginDefaultValues: LoginFormValues = {
    username: '',
    password: '',
}

export const registerSchema = z.object({
    username: z
        .string()
        .trim()
        .min(1, 'Введите имя пользователя')
        .min(3, 'Имя пользователя должно содержать минимум 3 символа'),
    password: z
        .string()
        .min(1, 'Введите пароль')
        .min(6, 'Пароль должен содержать минимум 6 символов'),
})

export type RegisterFormValues = z.infer<typeof registerSchema>

export const registerDefaultValues: RegisterFormValues = {
    username: '',
    password: '',
}
