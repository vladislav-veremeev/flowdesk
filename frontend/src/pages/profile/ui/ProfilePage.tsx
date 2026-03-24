import { userStore } from '@/entities/user'
import {
    Card,
    CardContent,
    CardDescription,
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
import { useEffect, useState } from 'react'
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
import { formatDateTime } from '@/shared/lib'
import { Pencil, Save, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const profileSchema = z
    .object({
        username: z
            .string()
            .trim()
            .min(1, 'Введите имя пользователя')
            .min(3, 'Имя пользователя должно содержать минимум 3 символа'),

        email: z
            .string()
            .trim()
            .min(1, 'Введите email')
            .email('Некорректный email'),
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
    const navigate = useNavigate()
    const user = userStore((state) => state.user)
    const [isEditing, setIsEditing] = useState<boolean>(false)

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
            const payload = {
                username: data.username,
                email: data.email,
                currentPassword: data.currentPassword || undefined,
                newPassword: data.newPassword || undefined,
            }

            const updatedUser = await updateMe(payload)
            userStore.getState().setUser(updatedUser)

            form.reset({
                username: updatedUser.username,
                email: updatedUser.email,
                currentPassword: '',
                newPassword: '',
            })

            toast.success('Профиль успешно сохранен')
            setIsEditing(false)
        } catch (error: any) {
            toast.error(
                error.response?.data?.message || 'Ошибка обновления профиля'
            )
        }
    }

    const handleDelete = async () => {
        try {
            await deleteMe()
            localStorage.removeItem('token')
            userStore.getState().clearUser()
            navigate('/login')
        } catch (error: any) {
            toast.error(
                error.response?.data?.message || 'Ошибка удаления аккаунта'
            )
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
        <div className="flex justify-center py-6">
            <Card className="w-xl">
                <CardHeader>
                    <CardTitle>
                        {isEditing ? 'Редактирование профиля' : 'Профиль'}
                    </CardTitle>
                    <CardDescription>
                        {isEditing
                            ? 'Измените имя пользователя, почту или пароль.'
                            : 'Данные о пользователе.'}
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form id="form" onSubmit={form.handleSubmit(onSubmit)}>
                        <FieldGroup>
                            {isEditing ? (
                                <>
                                    <Controller
                                        name="username"
                                        control={form.control}
                                        render={({ field, fieldState }) => (
                                            <Field
                                                data-invalid={
                                                    fieldState.invalid
                                                }
                                            >
                                                <FieldLabel htmlFor="username">
                                                    Имя пользователя
                                                </FieldLabel>
                                                <Input
                                                    {...field}
                                                    id="username"
                                                    placeholder="Введите имя пользователя"
                                                    aria-invalid={
                                                        fieldState.invalid
                                                    }
                                                />
                                                {fieldState.invalid && (
                                                    <FieldError
                                                        errors={[
                                                            fieldState.error,
                                                        ]}
                                                    />
                                                )}
                                            </Field>
                                        )}
                                    />

                                    <Controller
                                        name="email"
                                        control={form.control}
                                        render={({ field, fieldState }) => (
                                            <Field
                                                data-invalid={
                                                    fieldState.invalid
                                                }
                                            >
                                                <FieldLabel htmlFor="email">
                                                    Email
                                                </FieldLabel>
                                                <Input
                                                    {...field}
                                                    id="email"
                                                    type="email"
                                                    placeholder="Введите email"
                                                    aria-invalid={
                                                        fieldState.invalid
                                                    }
                                                />
                                                {fieldState.invalid && (
                                                    <FieldError
                                                        errors={[
                                                            fieldState.error,
                                                        ]}
                                                    />
                                                )}
                                            </Field>
                                        )}
                                    />

                                    <Controller
                                        name="currentPassword"
                                        control={form.control}
                                        render={({ field, fieldState }) => (
                                            <Field
                                                data-invalid={
                                                    fieldState.invalid
                                                }
                                            >
                                                <FieldLabel htmlFor="currentPassword">
                                                    Текущий пароль
                                                </FieldLabel>
                                                <Input
                                                    {...field}
                                                    id="currentPassword"
                                                    type="password"
                                                    placeholder="Введите текущий пароль"
                                                    aria-invalid={
                                                        fieldState.invalid
                                                    }
                                                />
                                                {fieldState.invalid && (
                                                    <FieldError
                                                        errors={[
                                                            fieldState.error,
                                                        ]}
                                                    />
                                                )}
                                            </Field>
                                        )}
                                    />

                                    <Controller
                                        name="newPassword"
                                        control={form.control}
                                        render={({ field, fieldState }) => (
                                            <Field
                                                data-invalid={
                                                    fieldState.invalid
                                                }
                                            >
                                                <FieldLabel htmlFor="newPassword">
                                                    Новый пароль
                                                </FieldLabel>
                                                <Input
                                                    {...field}
                                                    id="newPassword"
                                                    type="password"
                                                    placeholder="Введите новый пароль"
                                                    aria-invalid={
                                                        fieldState.invalid
                                                    }
                                                />
                                                {fieldState.invalid && (
                                                    <FieldError
                                                        errors={[
                                                            fieldState.error,
                                                        ]}
                                                    />
                                                )}
                                            </Field>
                                        )}
                                    />
                                </>
                            ) : (
                                <>
                                    <Field>
                                        <FieldLabel>
                                            Имя пользователя
                                        </FieldLabel>
                                        <p className="text-sm">
                                            {user?.username}
                                        </p>
                                    </Field>

                                    <Field>
                                        <FieldLabel>Email</FieldLabel>
                                        <p className="text-sm">{user?.email}</p>
                                    </Field>

                                    <Field>
                                        <FieldLabel>
                                            Дата регистрации
                                        </FieldLabel>
                                        <p className="text-sm">
                                            {formatDateTime(user?.createdAt)}
                                        </p>
                                    </Field>
                                </>
                            )}
                        </FieldGroup>
                    </form>
                </CardContent>

                <CardFooter>
                    <Field orientation="horizontal">
                        {isEditing ? (
                            <>
                                <Button type="submit" form="form">
                                    <Save />
                                    Сохранить
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        form.reset({
                                            username: user?.username ?? '',
                                            email: user?.email ?? '',
                                            currentPassword: '',
                                            newPassword: '',
                                        })
                                        setIsEditing(false)
                                    }}
                                >
                                    Отмена
                                </Button>
                            </>
                        ) : (
                            <Button
                                type="button"
                                onClick={() => setIsEditing(true)}
                                variant="outline"
                            >
                                <Pencil />
                                Редактировать
                            </Button>
                        )}

                        {!isEditing && (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="ml-auto"
                                    >
                                        <Trash2 />
                                        Удалить
                                    </Button>
                                </AlertDialogTrigger>

                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>
                                            Удалить аккаунт?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Это действие нельзя отменить.
                                            Аккаунт и связанные с ним данные
                                            будут удалены.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>

                                    <AlertDialogFooter>
                                        <AlertDialogCancel>
                                            Отмена
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleDelete}
                                            variant="destructive"
                                        >
                                            <Trash2 />
                                            Удалить
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                    </Field>
                </CardFooter>
            </Card>
        </div>
    )
}
