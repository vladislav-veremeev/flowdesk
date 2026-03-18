import { userStore } from '@/entities/user'
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card.tsx'
import { Button } from '@/components/ui/button.tsx'
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field.tsx'
import { deleteMe, updateMe } from '@/features/auth'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import z from 'zod'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog.tsx'
import { Input } from '@/components/ui/input.tsx'
import { toast } from 'sonner'

const profileSchema = z
    .object({
        username: z
            .string()
            .min(1, 'Введите имя пользователя')
            .min(3, 'Имя пользователя должно содержать минимум 3 символа'),

        email: z.string().min(1, 'Введите email').email('Некорректный email'),
        currentPassword: z.string().optional(),
        newPassword: z.string().optional(),
    })
    .superRefine((data, ctx) => {
        const wantsToChangePassword =
            !!data.currentPassword || !!data.newPassword

        if (!wantsToChangePassword) {
            return
        }

        if (!data.currentPassword) {
            ctx.addIssue({
                code: 'custom',
                path: ['currentPassword'],
                message: 'Введите текущий пароль',
            })
        }

        if (!data.newPassword) {
            ctx.addIssue({
                code: 'custom',
                path: ['newPassword'],
                message: 'Введите новый пароль',
            })
        } else if (data.newPassword.length < 6) {
            ctx.addIssue({
                code: 'custom',
                path: ['newPassword'],
                message: 'Новый пароль должен содержать минимум 6 символов',
            })
        }
    })

type ProfileFormValues = z.infer<typeof profileSchema>

export const ProfilePage = () => {
    const user = userStore((state) => state.user)

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            username: '',
            email: '',
            currentPassword: '',
            newPassword: '',
        },
    })

    const onSubmit = async (data: ProfileFormValues) => {
        try {
            const updatedUser = await updateMe(data)
            userStore.getState().setUser(updatedUser)
            toast.success('Профиль успешно сохранен')
        } catch (error: any) {
            toast.error(error.response?.data?.message)
        }
    }

    const handleLogout = () => {
        localStorage.removeItem('token')
        userStore.getState().clearUser()
    }

    const handleDelete = async () => {
        try {
            await deleteMe()
            localStorage.removeItem('token')
            userStore.getState().clearUser()
        } catch (error: any) {
            toast.error(error.response?.data?.message)
        }
    }

    useEffect(() => {
        form.reset({
            username: user?.username ?? '',
            email: user?.email ?? '',
            currentPassword: '',
            newPassword: '',
        })
    }, [user, form])

    return (
        <div className="flex justify-center py-8">
            <Card className="w-xl">
                <CardHeader>
                    <CardTitle>Профиль</CardTitle>
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
                                name="email"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="email">
                                            Email
                                        </FieldLabel>
                                        <Input
                                            {...field}
                                            id="email"
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
                                name="currentPassword"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="currentPassword">
                                            Текущий пароль
                                        </FieldLabel>
                                        <Input
                                            {...field}
                                            id="currentPassword"
                                            type="password"
                                            placeholder="Введите текущий пароль"
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
                                name="newPassword"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="newPassword">
                                            Новый пароль
                                        </FieldLabel>
                                        <Input
                                            {...field}
                                            id="newPassword"
                                            type="password"
                                            placeholder="Введите новый пароль"
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
                    <Field orientation="horizontal">
                        <Button type="submit" form="form">
                            Сохранить
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            className="ml-auto"
                            onClick={handleLogout}
                        >
                            Выйти
                        </Button>

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button type="button" variant="outline">
                                    Удалить аккаунт
                                </Button>
                            </AlertDialogTrigger>

                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>
                                        Удалить аккаунт?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Это действие нельзя отменить. Аккаунт и
                                        связанные с ним данные будут удалены.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>

                                <AlertDialogFooter>
                                    <AlertDialogCancel>
                                        Отмена
                                    </AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDelete}>
                                        Удалить
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </Field>
                </CardFooter>
            </Card>
        </div>
    )
}
