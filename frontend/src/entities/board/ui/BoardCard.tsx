import { Controller, type UseFormReturn } from 'react-hook-form'
import { LogOut, Pencil, Save, Trash2, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Board, BoardFormValues } from '@/entities/board'
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
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card.tsx'
import { userStore } from '@/entities/user'
import { Badge } from '@/components/ui/badge.tsx'
import { getBoardMembers, leaveBoard } from '@/features/board-members'
import { toast } from 'sonner'
import { useEffect, useState } from 'react'
import type { BoardMember } from '@/entities/board-member'

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
    const user = userStore((state) => state.user)
    const isOwner = !!board && !!user && board.ownerId === user.id
    const [members, setMembers] = useState<BoardMember[]>([])

    useEffect(() => {
        const loadMembers = async () => {
            if (!board.id) return

            try {
                const membersData = await getBoardMembers(board.id)
                setMembers(membersData)
            } catch (error) {
                console.error('Ошибка при загрузке участников доски:', error)
            }
        }

        loadMembers()
    }, [board.id])

    const handleLeaveBoard = async () => {
        if (!board.id) return

        try {
            await leaveBoard(board.id)
            toast.success('Вы вышли из доски')
        } catch (error: any) {
            toast.error(
                error.response?.data?.message || 'Не удалось выйти из доски'
            )
        }
    }

    return (
        <Card className="h-fit">
            <CardHeader>
                <Link to={`/boards/${board.id}`}>
                    <CardTitle>{board.title}</CardTitle>
                </Link>
                <CardDescription className="flex gap-2">
                    {members.map((member) => (
                        <Badge key={member.userId} variant="outline">
                            <UserRound />
                            {member.role === 'owner'
                                ? `${member.username} - владелец`
                                : member.username}
                        </Badge>
                    ))}
                </CardDescription>
            </CardHeader>

            {board.description && (
                <CardContent className="text-sm">
                    {board.description}
                </CardContent>
            )}

            <CardFooter>
                {isOwner ? (
                    <Field orientation="horizontal">
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
                                    Редактировать
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
                                    Удалить
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
                    </Field>
                ) : (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="outline">
                                <LogOut />
                                Выйти из доски
                            </Button>
                        </AlertDialogTrigger>

                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    Выйти из доски?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    Вы потеряете доступ к этой доске. Чтобы
                                    вернуться, вас нужно будет пригласить снова.
                                </AlertDialogDescription>
                            </AlertDialogHeader>

                            <AlertDialogFooter>
                                <AlertDialogCancel>Отмена</AlertDialogCancel>
                                <AlertDialogAction
                                    variant="destructive"
                                    onClick={handleLeaveBoard}
                                >
                                    Выйти
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </CardFooter>
        </Card>
    )
}
