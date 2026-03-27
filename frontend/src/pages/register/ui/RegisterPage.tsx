import { useRegister } from '@/features/auth'
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
import { Link } from 'react-router-dom'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

const registerSchema = z.object({
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

type RegisterFormValues = z.infer<typeof registerSchema>

export const RegisterPage = () => {
    const { handleRegister } = useRegister()

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            username: '',
            password: '',
        },
    })

    const onSubmit = async (data: RegisterFormValues) => {
        try {
            await handleRegister(data)
        } catch (error: any) {
            toast.error(error.response?.data?.message)
        }
    }

    return (
        <div className="flex h-screen items-center justify-center">
            <Card className="w-sm">
                <CardHeader className="text-center">
                    <CardTitle>Регистрация</CardTitle>
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
                            Зарегистрироваться
                        </Button>
                    </Field>

                    <div className="flex gap-1 text-sm text-muted-foreground">
                        <span>Уже есть аккаунт?</span>
                        <Button variant="link" className="p-0 h-auto" asChild>
                            <Link to="/login">Войти</Link>
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}
