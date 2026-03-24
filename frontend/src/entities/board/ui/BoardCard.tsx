import { Controller, type UseFormReturn } from 'react-hook-form'
import { Pencil, Save, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Board } from '@/entities/board'
import { Button } from '@/components/ui/button'
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
    Popover,
    PopoverContent,
    PopoverDescription,
    PopoverHeader,
    PopoverTitle,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Textarea } from '@/components/ui/textarea'
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
} from '@/components/ui/alert-dialog'
import { ButtonGroup } from '@/components/ui/button-group'
import {
    Card,
    CardAction,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card.tsx'

export type BoardFormValues = {
    title: string
    description: string
}

type BoardCardProps = {
    board: Board
    editOpenBoardId: string | null
    editForm: UseFormReturn<BoardFormValues>
    onOpenEdit: (board: Board) => void
    onResetEditForm: () => void
    onEdit: (data: BoardFormValues) => void
    onDelete: (boardId: string) => void
}

export const BoardCard = ({
    board,
    editOpenBoardId,
    editForm,
    onOpenEdit,
    onResetEditForm,
    onEdit,
    onDelete,
}: BoardCardProps) => {
    return (
        <Card className="h-fit">
            <CardHeader>
                <Link to={`/boards/${board.id}`}>
                    <CardTitle>{board.title}</CardTitle>
                </Link>

                <CardDescription
                    className="line-clamp-2"
                    title={board.description || 'Описание отсутствует'}
                >
                    {board.description || 'Описание отсутствует'}
                </CardDescription>

                <CardAction>
                    <ButtonGroup>
                        <Popover
                            open={editOpenBoardId === board.id}
                            onOpenChange={(open) => {
                                if (open) {
                                    onOpenEdit(board)
                                } else if (editOpenBoardId === board.id) {
                                    onResetEditForm()
                                }
                            }}
                        >
                            <PopoverTrigger asChild>
                                <Button type="button" variant="outline">
                                    <Pencil />
                                </Button>
                            </PopoverTrigger>

                            <PopoverContent className="flex flex-col gap-4">
                                <PopoverHeader>
                                    <PopoverTitle>
                                        Редактирование доски
                                    </PopoverTitle>
                                    <PopoverDescription>
                                        Измените название и описание выбранной
                                        доски
                                    </PopoverDescription>
                                </PopoverHeader>

                                <form
                                    id={`edit-board-form-${board.id}`}
                                    onSubmit={editForm.handleSubmit(onEdit)}
                                >
                                    <FieldGroup className="gap-4">
                                        <Controller
                                            name="title"
                                            control={editForm.control}
                                            render={({ field, fieldState }) => (
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
                                            render={({ field, fieldState }) => (
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
                                    >
                                        <Save />
                                        Сохранить
                                    </Button>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={onResetEditForm}
                                    >
                                        Отмена
                                    </Button>
                                </Field>
                            </PopoverContent>
                        </Popover>

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="outline" type="button">
                                    <Trash2 />
                                </Button>
                            </AlertDialogTrigger>

                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>
                                        Удалить доску?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Доска «{board.title}» будет удалена без
                                        возможности восстановления.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>

                                <AlertDialogFooter>
                                    <AlertDialogCancel>
                                        Отмена
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={() => onDelete(board.id)}
                                        variant="destructive"
                                    >
                                        <Trash2 />
                                        Удалить
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </ButtonGroup>
                </CardAction>
            </CardHeader>
        </Card>
    )
}
