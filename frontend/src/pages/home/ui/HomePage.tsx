import { useEffect, useState } from 'react'
import { z } from 'zod'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Pencil, Plus, Save, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import type { Board } from '@/entities/board'
import {
    createBoard,
    deleteBoard,
    getBoards,
    updateBoard,
} from '@/features/boards'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
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
import { Input } from '@/components/ui/input'
import { formatDateTime } from '@/shared/lib'
import {
    Popover,
    PopoverContent,
    PopoverDescription,
    PopoverHeader,
    PopoverTitle,
    PopoverTrigger,
} from '@/components/ui/popover.tsx'
import { Textarea } from '@/components/ui/textarea.tsx'
import { Link } from 'react-router-dom'

const boardSchema = z.object({
    title: z
        .string()
        .trim()
        .min(1, 'Введите название доски')
        .max(100, 'Название доски должно содержать не более 100 символов'),
    description: z
        .string()
        .max(500, 'Описание должно содержать не более 500 символов'),
})

type BoardFormValues = z.infer<typeof boardSchema>

const defaultValues: BoardFormValues = {
    title: '',
    description: '',
}

export const HomePage = () => {
    const [boards, setBoards] = useState<Board[]>([])
    const [editingBoard, setEditingBoard] = useState<Board | null>(null)
    const [createOpen, setCreateOpen] = useState(false)
    const [editOpenBoardId, setEditOpenBoardId] = useState<string | null>(null)

    const createForm = useForm<BoardFormValues>({
        resolver: zodResolver(boardSchema),
        defaultValues,
    })

    const editForm = useForm<BoardFormValues>({
        resolver: zodResolver(boardSchema),
        defaultValues,
    })

    const loadBoards = async () => {
        try {
            const data = await getBoards()
            setBoards(data)
        } catch (error: any) {
            toast.error(
                error.response?.data?.message || 'Не удалось загрузить доски'
            )
        }
    }

    useEffect(() => {
        loadBoards()
    }, [])

    const resetCreateForm = () => {
        createForm.reset(defaultValues)
    }

    const resetEditForm = () => {
        editForm.reset(defaultValues)
        setEditingBoard(null)
        setEditOpenBoardId(null)
    }

    const handleOpenEdit = (board: Board) => {
        setEditingBoard(board)
        setEditOpenBoardId(board.id)
        editForm.reset({
            title: board.title,
            description: board.description ?? '',
        })
    }

    const handleEdit = async (data: BoardFormValues) => {
        if (!editingBoard) return

        try {
            const payload = {
                title: data.title.trim(),
                description: data.description.trim() || undefined,
            }

            const updatedBoard = await updateBoard(editingBoard.id, payload)
            setBoards((current) =>
                current.map((board) =>
                    board.id === updatedBoard.id ? updatedBoard : board
                )
            )
            toast.success('Доска успешно обновлена')

            resetEditForm()
        } catch (error: any) {
            toast.error(
                error.response?.data?.message || 'Не удалось сохранить доску'
            )
        }
    }

    const handleAdd = async (data: BoardFormValues) => {
        try {
            const payload = {
                title: data.title.trim(),
                description: data.description.trim() || undefined,
            }

            const newBoard = await createBoard(payload)
            setBoards((current) => [newBoard, ...current])
            toast.success('Доска успешно создана')

            resetCreateForm()
            setCreateOpen(false)
        } catch (error: any) {
            toast.error(
                error.response?.data?.message || 'Не удалось добавить доску'
            )
        }
    }

    const handleDelete = async (boardId: string) => {
        try {
            await deleteBoard(boardId)
            setBoards((current) =>
                current.filter((board) => board.id !== boardId)
            )

            if (editingBoard?.id === boardId) {
                resetEditForm()
            }

            toast.success('Доска удалена')
        } catch (error: any) {
            toast.error(
                error.response?.data?.message || 'Не удалось удалить доску'
            )
        }
    }

    return (
        <div className="flex flex-col py-6 px-6 gap-6">
            <h1 className="font-medium text-xl">Мои доски</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {boards.map((board) => (
                    <Card key={board.id} className="h-fit">
                        <Link to={'/profile'}>
                            <CardHeader>
                                <CardTitle>{board.title}</CardTitle>
                                <CardDescription>
                                    Создана {formatDateTime(board.createdAt)}
                                </CardDescription>
                            </CardHeader>
                        </Link>

                        <CardContent>
                            <p className="text-muted-foreground wrap-break-word">
                                {board.description || 'Описание отсутствует'}
                            </p>
                        </CardContent>

                        <CardFooter>
                            <Field orientation="horizontal">
                                <Popover
                                    open={editOpenBoardId === board.id}
                                    onOpenChange={(open) => {
                                        if (open) {
                                            handleOpenEdit(board)
                                        } else if (
                                            editOpenBoardId === board.id
                                        ) {
                                            resetEditForm()
                                        }
                                    }}
                                >
                                    <PopoverTrigger asChild>
                                        <Button type="button" variant="outline">
                                            <Pencil />
                                            Редактировать
                                        </Button>
                                    </PopoverTrigger>

                                    <PopoverContent className="flex flex-col gap-4">
                                        <PopoverHeader>
                                            <PopoverTitle>
                                                Редактирование доски
                                            </PopoverTitle>
                                            <PopoverDescription>
                                                Измените название и описание
                                                выбранной доски
                                            </PopoverDescription>
                                        </PopoverHeader>

                                        <form
                                            id={`edit-board-form-${board.id}`}
                                            onSubmit={editForm.handleSubmit(
                                                handleEdit
                                            )}
                                        >
                                            <FieldGroup className="gap-4">
                                                <Controller
                                                    name="title"
                                                    control={editForm.control}
                                                    render={({
                                                        field,
                                                        fieldState,
                                                    }) => (
                                                        <Field
                                                            data-invalid={
                                                                fieldState.invalid
                                                            }
                                                        >
                                                            <FieldLabel
                                                                htmlFor={`edit-board-title-${board.id}`}
                                                            >
                                                                Название
                                                            </FieldLabel>
                                                            <Input
                                                                {...field}
                                                                id={`edit-board-title-${board.id}`}
                                                                placeholder="Введите название"
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
                                                    name="description"
                                                    control={editForm.control}
                                                    render={({
                                                        field,
                                                        fieldState,
                                                    }) => (
                                                        <Field
                                                            data-invalid={
                                                                fieldState.invalid
                                                            }
                                                        >
                                                            <FieldLabel
                                                                htmlFor={`edit-board-description-${board.id}`}
                                                            >
                                                                Описание
                                                            </FieldLabel>
                                                            <Textarea
                                                                {...field}
                                                                id={`edit-board-description-${board.id}`}
                                                                placeholder="Введите описание"
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
                                            </FieldGroup>
                                        </form>

                                        <Field orientation="horizontal">
                                            <Button
                                                type="submit"
                                                form={`edit-board-form-${board.id}`}
                                                variant="outline"
                                            >
                                                <Save />
                                                Сохранить
                                            </Button>

                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={resetEditForm}
                                            >
                                                Отмена
                                            </Button>
                                        </Field>
                                    </PopoverContent>
                                </Popover>

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => handleDelete(board.id)}
                                >
                                    <Trash2 />
                                    Удалить
                                </Button>
                            </Field>
                        </CardFooter>
                    </Card>
                ))}

                <Card className="p-0 min-h-50">
                    <Popover
                        open={createOpen}
                        onOpenChange={(open) => {
                            setCreateOpen(open)

                            if (!open) {
                                resetCreateForm()
                            }
                        }}
                    >
                        <PopoverTrigger asChild>
                            <Button variant="ghost" className="w-full h-full">
                                <Plus />
                                <p className="text-base">Создать</p>
                            </Button>
                        </PopoverTrigger>

                        <PopoverContent className="flex flex-col gap-4">
                            <PopoverHeader>
                                <PopoverTitle>Новая доска</PopoverTitle>
                                <PopoverDescription>
                                    Создайте доску для задач, заметок или
                                    командной работы.
                                </PopoverDescription>
                            </PopoverHeader>

                            <form
                                id="create-board-form"
                                onSubmit={createForm.handleSubmit(handleAdd)}
                            >
                                <FieldGroup className="gap-4">
                                    <Controller
                                        name="title"
                                        control={createForm.control}
                                        render={({ field, fieldState }) => (
                                            <Field
                                                data-invalid={
                                                    fieldState.invalid
                                                }
                                            >
                                                <FieldLabel htmlFor="create-board-title">
                                                    Название
                                                </FieldLabel>
                                                <Input
                                                    {...field}
                                                    id="create-board-title"
                                                    placeholder="Введите название"
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
                                        name="description"
                                        control={createForm.control}
                                        render={({ field, fieldState }) => (
                                            <Field
                                                data-invalid={
                                                    fieldState.invalid
                                                }
                                            >
                                                <FieldLabel htmlFor="create-board-description">
                                                    Описание
                                                </FieldLabel>
                                                <Textarea
                                                    {...field}
                                                    id="create-board-description"
                                                    placeholder="Введите описание"
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
                                </FieldGroup>
                            </form>

                            <Field orientation="horizontal">
                                <Button
                                    type="submit"
                                    form="create-board-form"
                                    variant="outline"
                                >
                                    <Plus />
                                    Создать
                                </Button>
                            </Field>
                        </PopoverContent>
                    </Popover>
                </Card>
            </div>
        </div>
    )
}
