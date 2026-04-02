import { useState } from 'react'
import { Controller, useForm, type UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Pencil, Trash2 } from 'lucide-react'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'

import {
    type Column,
    type ColumnFormValues,
    columnSchema,
} from '@/entities/column'
import type { BoardMember } from '@/entities/board-member'
import { type Task, type TaskFormValues, TaskCard } from '@/entities/task'
import {
    Card,
    CardAction,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
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
import { ItemGroup } from '@/components/ui/item'
import { Badge } from '@/components/ui/badge.tsx'
import { ButtonGroup } from '@/components/ui/button-group.tsx'
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
import { AddTaskPopover } from '@/features/tasks'

type ColumnWithTasks = Column & {
    tasks: Task[]
}

type ColumnCardProps = {
    column: ColumnWithTasks
    addTaskOpenColumnId: string | null
    taskForm: UseFormReturn<TaskFormValues>
    members: BoardMember[]
    onOpenAddTask: (columnId: string) => void
    onResetTaskForm: () => void
    onAddTask: (columnId: string, data: TaskFormValues) => void
    onEditTask: (taskId: string, data: TaskFormValues) => Promise<void>
    onDeleteTask: (taskId: string) => Promise<void>
    onEditColumn: (columnId: string, data: ColumnFormValues) => Promise<void>
    onDeleteColumn: (columnId: string) => Promise<void>
    canManageColumn?: boolean
    canAddTask?: boolean
}

const getTaskSortableId = (taskId: string) => `task-${taskId}`

export const ColumnCard = ({
    column,
    addTaskOpenColumnId,
    taskForm,
    members,
    onOpenAddTask,
    onResetTaskForm,
    onAddTask,
    onEditTask,
    onEditColumn,
    onDeleteTask,
    onDeleteColumn,
    canManageColumn,
    canAddTask,
}: ColumnCardProps) => {
    const [editOpen, setEditOpen] = useState(false)

    const { setNodeRef } = useDroppable({
        id: column.id,
        data: {
            type: 'column',
            columnId: column.id,
        },
    })

    const editColumnForm = useForm<ColumnFormValues>({
        resolver: zodResolver(columnSchema),
        defaultValues: {
            title: column.title,
            wipLimit: column.wipLimit?.toString() ?? '',
        },
    })

    const tasksCount = column.tasks.length
    const wipLimit = column.wipLimit ?? null
    const hasWipLimit = wipLimit !== null
    const isWipLimitExceeded = hasWipLimit && tasksCount > wipLimit

    const handleEditOpenChange = (open: boolean) => {
        setEditOpen(open)

        if (open) {
            editColumnForm.reset({
                title: column.title,
                wipLimit: column.wipLimit?.toString() ?? '',
            })
        }
    }

    const handleEditSubmit = async (data: ColumnFormValues) => {
        await onEditColumn(column.id, data)
        setEditOpen(false)
    }

    return (
        <Card className={`min-w-80 h-fit py-4 gap-4`}>
            <CardHeader className="px-4">
                <CardTitle className="flex items-center gap-2">
                    {column.title}
                    <Badge
                        variant={isWipLimitExceeded ? 'destructive' : 'outline'}
                    >
                        {hasWipLimit
                            ? `${tasksCount}/${column.wipLimit} задач`
                            : `${tasksCount} задач`}
                    </Badge>
                </CardTitle>

                {canManageColumn && (
                    <CardAction>
                        <ButtonGroup>
                            <Popover
                                open={editOpen}
                                onOpenChange={handleEditOpenChange}
                            >
                                <PopoverTrigger asChild>
                                    <Button variant="outline">
                                        <Pencil />
                                    </Button>
                                </PopoverTrigger>

                                <PopoverContent className="flex flex-col gap-4">
                                    <PopoverHeader>
                                        <PopoverTitle>
                                            Редактирование колонки
                                        </PopoverTitle>
                                        <PopoverDescription>
                                            Обновите название колонки и лимит
                                            задач.
                                        </PopoverDescription>
                                    </PopoverHeader>

                                    <form
                                        id={`edit-column-form-${column.id}`}
                                        onSubmit={editColumnForm.handleSubmit(
                                            handleEditSubmit
                                        )}
                                    >
                                        <FieldGroup className="gap-4">
                                            <Controller
                                                name="title"
                                                control={editColumnForm.control}
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
                                                            htmlFor={`edit-column-title-${column.id}`}
                                                        >
                                                            Название
                                                        </FieldLabel>
                                                        <Input
                                                            {...field}
                                                            id={`edit-column-title-${column.id}`}
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
                                                name="wipLimit"
                                                control={editColumnForm.control}
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
                                                            htmlFor={`edit-column-wip-limit-${column.id}`}
                                                        >
                                                            Лимит задач
                                                        </FieldLabel>
                                                        <Input
                                                            {...field}
                                                            id={`edit-column-wip-limit-${column.id}`}
                                                            type="number"
                                                            placeholder="Введите лимит"
                                                            min={0}
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
                                        <Button
                                            type="submit"
                                            form={`edit-column-form-${column.id}`}
                                        >
                                            Сохранить
                                        </Button>
                                    </Field>
                                </PopoverContent>
                            </Popover>

                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="outline">
                                        <Trash2 />
                                    </Button>
                                </AlertDialogTrigger>

                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>
                                            Удалить колонку?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Колонка «{column.title}» будет
                                            удалена вместе со всеми её задачами
                                            без возможности восстановления.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>

                                    <AlertDialogFooter>
                                        <AlertDialogCancel>
                                            Отмена
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                            variant="destructive"
                                            onClick={() =>
                                                onDeleteColumn(column.id)
                                            }
                                        >
                                            Удалить
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </ButtonGroup>
                    </CardAction>
                )}
            </CardHeader>

            <CardContent ref={setNodeRef} className="px-4">
                <SortableContext
                    items={column.tasks.map((task) =>
                        getTaskSortableId(task.id)
                    )}
                    strategy={verticalListSortingStrategy}
                >
                    {column.tasks.length > 0 ? (
                        <ItemGroup className="gap-4">
                            {column.tasks.map((task) => (
                                <TaskCard
                                    key={task.id}
                                    task={task}
                                    onEdit={onEditTask}
                                    onDelete={onDeleteTask}
                                    members={members}
                                />
                            ))}
                        </ItemGroup>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            В колонке пока нет задач
                        </p>
                    )}
                </SortableContext>
            </CardContent>

            {canAddTask && (
                <CardFooter className="px-4">
                    <AddTaskPopover
                        columnId={column.id}
                        open={addTaskOpenColumnId === column.id}
                        members={members}
                        form={taskForm}
                        onOpenChange={(open) => {
                            if (open) {
                                onOpenAddTask(column.id)
                            } else if (addTaskOpenColumnId === column.id) {
                                onResetTaskForm()
                            }
                        }}
                        onSubmit={onAddTask}
                    />
                </CardFooter>
            )}
        </Card>
    )
}
