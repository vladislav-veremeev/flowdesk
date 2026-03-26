import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, LogOut, MailPlus, Send } from 'lucide-react'
import { closestCorners, DndContext, DragOverlay } from '@dnd-kit/core'
import {
    horizontalListSortingStrategy,
    SortableContext,
} from '@dnd-kit/sortable'
import { toast } from 'sonner'

import { userStore } from '@/entities/user'
import { ColumnCard } from '@/entities/column'
import { TaskCard } from '@/entities/task'
import { AddColumnPopover } from '@/features/columns'
import { createBoardInvitation } from '@/features/board-invitations'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card.tsx'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
    Item,
    ItemActions,
    ItemContent,
    ItemDescription,
    ItemTitle,
} from '@/components/ui/item.tsx'
import { useBoardPage } from '../model/useBoardPage'
import { useBoardDnd } from '../model/useBoardDnd'
import { Field, FieldError, FieldLabel } from '@/components/ui/field.tsx'
import { Controller, useForm } from 'react-hook-form'
import z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { leaveBoard } from '@/features/board-members'
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

const getColumnSortableId = (columnId: string) => `column-${columnId}`

const inviteSchema = z.object({
    email: z
        .string()
        .trim()
        .min(1, 'Введите email')
        .email('Некорректный email'),
})

type InviteFormValues = z.infer<typeof inviteSchema>

const inviteDefaultValues: InviteFormValues = {
    email: '',
}

export const BoardPage = () => {
    const { id } = useParams<{ id: string }>()
    const user = userStore((state) => state.user)
    const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
    const navigate = useNavigate()

    const inviteForm = useForm<InviteFormValues>({
        resolver: zodResolver(inviteSchema),
        defaultValues: inviteDefaultValues,
    })

    const resetInviteForm = () => {
        inviteForm.reset(inviteDefaultValues)
    }

    const {
        board,
        members,
        columns,
        tasks,
        setColumns,
        setTasks,
        addColumnOpen,
        setAddColumnOpen,
        addTaskOpenColumnId,
        columnForm,
        taskForm,
        resetColumnForm,
        resetTaskForm,
        handleOpenAddTask,
        handleAddColumn,
        handleEditColumn,
        handleDeleteColumn,
        handleAddTask,
        handleEditTask,
        handleDeleteTask,
    } = useBoardPage(id)

    const {
        sensors,
        sortedColumns,
        tasksByColumn,
        activeColumn,
        activeTask,
        handleDragStart,
        handleDragOver,
        handleDragCancel,
        handleDragEnd,
    } = useBoardDnd({
        boardId: id,
        columns,
        tasks,
        setColumns,
        setTasks,
    })

    const isOwner = !!board && !!user && board.ownerId === user.id

    const handleInviteMember = async (data: InviteFormValues) => {
        if (!id) return

        try {
            await createBoardInvitation({
                boardId: id,
                inviteeEmail: data.email,
            })

            toast.success('Приглашение успешно отправлено')
            resetInviteForm()
            setInviteDialogOpen(false)
        } catch (error: any) {
            toast.error(
                error.response?.data?.message ||
                    'Не удалось отправить приглашение'
            )
        }
    }

    const handleLeaveBoard = async () => {
        if (!id) return

        try {
            await leaveBoard(id)
            toast.success('Вы вышли из доски')
            navigate('/')
        } catch (error: any) {
            toast.error(
                error.response?.data?.message || 'Не удалось выйти из доски'
            )
        }
    }

    if (!id || !board) {
        return (
            <div className="flex flex-col px-6 py-4">
                <Item className="p-0">
                    <ItemContent>
                        <ItemTitle className="text-xl">
                            Доска не найдена
                        </ItemTitle>

                        <ItemDescription>
                            Возможно, доска была удалена или у вас нет к ней
                            доступа.
                        </ItemDescription>
                    </ItemContent>

                    <ItemActions>
                        <Button asChild variant="outline">
                            <Link to="/">
                                <ArrowLeft />
                                Назад
                            </Link>
                        </Button>
                    </ItemActions>
                </Item>
            </div>
        )
    }

    return (
        <div className="flex flex-col px-6 py-4 gap-4 h-[calc(100vh-69px)]">
            <Item className="p-0">
                <ItemContent>
                    <ItemTitle className="text-xl">
                        {board.title}

                        {members.map((member) => (
                            <Badge
                                key={member.userId}
                                variant={
                                    member.role === 'owner'
                                        ? 'default'
                                        : 'outline'
                                }
                                className={
                                    member.role === 'member'
                                        ? 'bg-background'
                                        : ''
                                }
                            >
                                {member.username}
                            </Badge>
                        ))}
                    </ItemTitle>

                    {board.description && (
                        <ItemDescription>{board.description}</ItemDescription>
                    )}
                </ItemContent>

                <ItemActions>
                    {isOwner ? (
                        <Dialog
                            open={inviteDialogOpen}
                            onOpenChange={(open) => {
                                setInviteDialogOpen(open)

                                if (!open) {
                                    resetInviteForm()
                                }
                            }}
                        >
                            <DialogTrigger asChild>
                                <Button variant="outline">
                                    <MailPlus />
                                    Пригласить
                                </Button>
                            </DialogTrigger>

                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>
                                        Пригласить участника
                                    </DialogTitle>
                                    <DialogDescription>
                                        Введите email пользователя, которого
                                        хотите пригласить на доску.
                                    </DialogDescription>
                                </DialogHeader>

                                <form
                                    id="invite-form"
                                    onSubmit={inviteForm.handleSubmit(
                                        handleInviteMember
                                    )}
                                >
                                    <Controller
                                        name="email"
                                        control={inviteForm.control}
                                        render={({ field, fieldState }) => (
                                            <Field
                                                data-invalid={
                                                    fieldState.invalid
                                                }
                                            >
                                                <FieldLabel htmlFor={`email`}>
                                                    Email
                                                </FieldLabel>
                                                <Input
                                                    {...field}
                                                    id={`email`}
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
                                </form>

                                <DialogFooter>
                                    <DialogClose>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => resetInviteForm()}
                                        >
                                            Отмена
                                        </Button>
                                    </DialogClose>

                                    <Button type="submit" form="invite-form">
                                        <Send />
                                        Отправить
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
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
                                        вернуться, вас нужно будет пригласить
                                        снова.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>

                                <AlertDialogFooter>
                                    <AlertDialogCancel>
                                        Отмена
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleLeaveBoard}
                                    >
                                        Выйти
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}

                    <Button asChild variant="outline">
                        <Link to="/">
                            <ArrowLeft />
                            Назад
                        </Link>
                    </Button>
                </ItemActions>
            </Item>

            <DndContext
                collisionDetection={closestCorners}
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragCancel={handleDragCancel}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={sortedColumns.map((column) =>
                        getColumnSortableId(column.id)
                    )}
                    strategy={horizontalListSortingStrategy}
                >
                    <div className="flex overflow-x-auto h-full gap-6">
                        {tasksByColumn.map((column) => (
                            <ColumnCard
                                canManageColumn={isOwner}
                                key={column.id}
                                column={column}
                                addTaskOpenColumnId={addTaskOpenColumnId}
                                taskForm={taskForm}
                                onOpenAddTask={handleOpenAddTask}
                                onResetTaskForm={resetTaskForm}
                                onAddTask={handleAddTask}
                                onEditTask={handleEditTask}
                                onDeleteTask={handleDeleteTask}
                                onEditColumn={handleEditColumn}
                                onDeleteColumn={handleDeleteColumn}
                            />
                        ))}

                        {isOwner && (
                            <Card className="p-0 min-w-80 h-fit">
                                <AddColumnPopover
                                    open={addColumnOpen}
                                    onOpenChange={setAddColumnOpen}
                                    form={columnForm}
                                    onSubmit={handleAddColumn}
                                    onReset={resetColumnForm}
                                />
                            </Card>
                        )}
                    </div>
                </SortableContext>

                <DragOverlay>
                    {activeColumn ? (
                        <ColumnCard
                            column={activeColumn}
                            addTaskOpenColumnId={null}
                            taskForm={taskForm}
                            onOpenAddTask={handleOpenAddTask}
                            onResetTaskForm={resetTaskForm}
                            onAddTask={handleAddTask}
                            onEditTask={handleEditTask}
                            onDeleteTask={handleDeleteTask}
                            onEditColumn={handleEditColumn}
                            onDeleteColumn={handleDeleteColumn}
                            isOverlay
                        />
                    ) : activeTask ? (
                        <TaskCard
                            task={activeTask}
                            onEdit={handleEditTask}
                            onDelete={handleDeleteTask}
                            isOverlay
                        />
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    )
}
