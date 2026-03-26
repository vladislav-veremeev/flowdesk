import { useEffect, useState } from 'react'
import { z } from 'zod'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import type { Board } from '@/entities/board'
import { BoardCard, type BoardFormValues } from '@/entities/board'
import {
    createBoard,
    deleteBoard,
    getBoards,
    updateBoard,
} from '@/features/boards'
import {
    Item,
    ItemActions,
    ItemContent,
    ItemTitle,
} from '@/components/ui/item.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Plus } from 'lucide-react'
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Textarea } from '@/components/ui/textarea.tsx'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog.tsx'

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
        <div className="flex flex-col px-6 py-4 gap-4">
            <Item className="p-0">
                <ItemContent>
                    <ItemTitle className="text-xl">Мои доски</ItemTitle>
                </ItemContent>

                <ItemActions>
                    <Dialog
                        open={createOpen}
                        onOpenChange={(nextOpen) => {
                            setCreateOpen(nextOpen)

                            if (!nextOpen) {
                                resetCreateForm()
                            }
                        }}
                    >
                        <DialogTrigger asChild>
                            <Button>
                                <Plus />
                                Создать новую доску
                            </Button>
                        </DialogTrigger>

                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Новая доска</DialogTitle>
                                <DialogDescription>
                                    Создайте доску для задач, заметок или
                                    командной работы.
                                </DialogDescription>
                            </DialogHeader>

                            <form
                                id="create-board-form"
                                onSubmit={createForm.handleSubmit(handleAdd)}
                            >
                                <FieldGroup>
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

                            <Field>
                                <Button type="submit" form="create-board-form">
                                    <Plus />
                                    Создать
                                </Button>
                            </Field>
                        </DialogContent>
                    </Dialog>
                </ItemActions>
            </Item>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {boards.map((board) => (
                    <BoardCard
                        key={board.id}
                        board={board}
                        editOpenBoardId={editOpenBoardId}
                        editForm={editForm}
                        onOpenEdit={handleOpenEdit}
                        onResetEditForm={resetEditForm}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                ))}
            </div>
        </div>
    )
}
