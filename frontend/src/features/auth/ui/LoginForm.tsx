import { useLogin } from '@/features/auth'
import { Controller, useForm } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field'
import { Link } from 'react-router'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const loginSchema = z.object({
    email: z.string().min(1, 'Введите email').email('Некорректный email'),
    password: z
        .string()
        .min(1, 'Введите пароль')
        .min(6, 'Пароль должен содержать минимум 6 символов'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export const LoginForm = () => {
    const { handleLogin } = useLogin()

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    })

    return (
        <Card className="w-sm">
            <CardHeader className="text-center">
                <CardTitle>Вход</CardTitle>
            </CardHeader>

            <CardContent>
                <form id="login-form" onSubmit={form.handleSubmit(handleLogin)}>
                    <FieldGroup>
                        <Controller
                            name="email"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="login-email">
                                        Email
                                    </FieldLabel>
                                    <Input
                                        {...field}
                                        id="login-email"
                                        type="email"
                                        placeholder="Введите email"
                                        aria-invalid={fieldState.invalid}
                                    />
                                    {fieldState.invalid && (
                                        <FieldError
                                            errors={[fieldState.error]}
                                        />
                                    )}
                                </Field>
                            )}
                        />

                        <Controller
                            name="password"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="login-password">
                                        Пароль
                                    </FieldLabel>
                                    <Input
                                        {...field}
                                        id="login-password"
                                        type="password"
                                        placeholder="Введите пароль"
                                        aria-invalid={fieldState.invalid}
                                    />
                                    {fieldState.invalid && (
                                        <FieldError
                                            errors={[fieldState.error]}
                                        />
                                    )}
                                </Field>
                            )}
                        />
                    </FieldGroup>
                </form>
            </CardContent>

            <CardFooter className="flex flex-col gap-3">
                <Button type="submit" form="login-form" className="w-full">
                    Войти
                </Button>

                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <span>Нет аккаунта?</span>
                    <Button variant="link" className="p-0 h-auto" asChild>
                        <Link to="/register">Зарегистрироваться</Link>
                    </Button>
                </div>
            </CardFooter>
        </Card>
    )
}
