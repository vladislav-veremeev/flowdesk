import {
    loginDefaultValues,
    type LoginFormValues,
    loginSchema,
    useLogin,
} from '@/features/auth'
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card.tsx'
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field.tsx'
import { Controller, useForm } from 'react-hook-form'
import { Input } from '@/components/ui/input.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Link } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { handleApiError } from '@/shared/lib'

export const LoginPage = () => {
    const { handleLogin } = useLogin()

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: loginDefaultValues,
    })

    const onSubmit = async (data: LoginFormValues) => {
        try {
            await handleLogin(data)
        } catch (error) {
            handleApiError(error, 'Не удалось выполнить вход')
        }
    }

    return (
        <div className="flex h-screen items-center justify-center">
            <Card className="w-sm">
                <CardHeader className="text-center">
                    <CardTitle>Вход</CardTitle>
                </CardHeader>

                <CardContent>
                    <form id="form" onSubmit={form.handleSubmit(onSubmit)}>
                        <FieldGroup>
                            <Controller
                                name="username"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="username">
                                            Имя пользователя
                                        </FieldLabel>
                                        <Input
                                            {...field}
                                            id="username"
                                            placeholder="Введите имя пользователя"
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
                                        <FieldLabel htmlFor="password">
                                            Пароль
                                        </FieldLabel>
                                        <Input
                                            {...field}
                                            id="password"
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
                    <Field className="text-center">
                        <Button type="submit" form="form" className="w-full">
                            Войти
                        </Button>
                    </Field>

                    <div className="flex gap-1 text-sm text-muted-foreground">
                        <span>Нет аккаунта?</span>
                        <Button variant="link" className="p-0 h-auto" asChild>
                            <Link to="/register">Зарегистрироваться</Link>
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}
