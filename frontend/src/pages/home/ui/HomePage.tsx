import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { type Board, boardDefaultValues, boardSchema } from '@/entities/board'
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
import { handleApiError, normalizeBoardForm } from '@/shared/lib'

export const HomePage = () => {
    const [boards, setBoards] = useState<Board[]>([])
    const [editingBoard, setEditingBoard] = useState<Board | null>(null)
    const [createOpen, setCreateOpen] = useState(false)
    const [editOpenBoardId, setEditOpenBoardId] = useState<string | null>(null)

    const createForm = useForm<BoardFormValues>({
        resolver: zodResolver(boardSchema),
        defaultValues: boardDefaultValues,
    })

    const editForm = useForm<BoardFormValues>({
        resolver: zodResolver(boardSchema),
        defaultValues: boardDefaultValues,
    })

    const loadBoards = async () => {
        try {
            const data = await getBoards()
            setBoards(data)
        } catch (error: any) {
            handleApiError(error, 'Не удалось загрузить доски')
        }
    }

    useEffect(() => {
        loadBoards()
    }, [])

    const resetCreateForm = () => {
        createForm.reset(boardDefaultValues)
    }

    const resetEditForm = () => {
        editForm.reset(boardDefaultValues)
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
            const updatedBoard = await updateBoard(
                editingBoard.id,
                normalizeBoardForm(data)
            )

            setBoards((current) =>
                current.map((board) =>
                    board.id === updatedBoard.id ? updatedBoard : board
                )
            )

            toast.success('Доска успешно обновлена')
            resetEditForm()
        } catch (error) {
            handleApiError(error, 'Не удалось сохранить доску')
        }
    }

    const handleAdd = async (data: BoardFormValues) => {
        try {
            const newBoard = await createBoard(normalizeBoardForm(data))
            setBoards((current) => [newBoard, ...current])
            toast.success('Доска успешно создана')

            resetCreateForm()
            setCreateOpen(false)
        } catch (error) {
            handleApiError(error, 'Не удалось добавить доску')
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
        } catch (error) {
            handleApiError(error, 'Не удалось удалить доску')
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
