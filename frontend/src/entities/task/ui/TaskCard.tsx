import { useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Pencil, Trash2, User } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import {
    type Task,
    taskDefaultValues,
    type TaskFormValues,
    TaskPriorityBadge,
    taskSchema,
} from '@/entities/task'
import type { BoardMember } from '@/entities/board-member'
import { formatDateTime, toDateTimeLocalValue } from '@/shared/lib'
import { ButtonGroup } from '@/components/ui/button-group.tsx'
import { Button } from '@/components/ui/button.tsx'
import {
    Popover,
    PopoverContent,
    PopoverDescription,
    PopoverHeader,
    PopoverTitle,
    PopoverTrigger,
} from '@/components/ui/popover'
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
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
import { cn } from '@/lib/utils.ts'
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card.tsx'
import { Badge } from '@/components/ui/badge.tsx'

type TaskCardProps = {
    task: Task
    members: BoardMember[]
    onEdit: (taskId: string, data: TaskFormValues) => Promise<void>
    onDelete: (taskId: string) => Promise<void>
    isOverlay?: boolean
}

const getTaskSortableId = (taskId: string) => `task-${taskId}`

export const TaskCard = ({
    task,
    members,
    onEdit,
    onDelete,
    isOverlay = false,
}: TaskCardProps) => {
    const [editOpen, setEditOpen] = useState(false)

    const assignee = members.find((member) => member.userId === task.assigneeId)

    const editForm = useForm<TaskFormValues>({
        resolver: zodResolver(taskSchema),
        defaultValues: taskDefaultValues,
    })

    const {
        attributes,
        listeners,
        setActivatorNodeRef,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: getTaskSortableId(task.id),
        data: {
            type: 'task',
            taskId: task.id,
            columnId: task.columnId,
        },
        disabled: isOverlay,
    })

    const style = useMemo(
        () => ({
            transform: CSS.Transform.toString(transform),
            transition,
        }),
        [transform, transition]
    )

    const handleEditOpenChange = (open: boolean) => {
        setEditOpen(open)

        if (open) {
            editForm.reset({
                title: task.title,
                description: task.description ?? '',
                priority: task.priority,
                dueDate: toDateTimeLocalValue(task.dueDate),
                assigneeId: task.assigneeId ?? undefined,
            })
        }
    }

    const handleSubmit = async (data: TaskFormValues) => {
        await onEdit(task.id, data)
        setEditOpen(false)
    }

    const now = toDateTimeLocalValue(new Date().toISOString())

    return (
        <Card
            ref={setNodeRef}
            style={style}
            className={cn(
                'py-4 gap-4',
                isDragging ? 'opacity-50' : '',
                isOverlay ? 'shadow-lg' : ''
            )}
        >
            <CardHeader className="px-4">
                <CardTitle
                    className="flex gap-2 items-center cursor-grab"
                    ref={setActivatorNodeRef}
                    {...attributes}
                    {...listeners}
                >
                    {task.title}
                </CardTitle>

                <CardDescription className="flex flex-wrap gap-2">
                    <TaskPriorityBadge priority={task.priority} />
                    {task.dueDate && (
                        <Badge variant="outline">
                            До {formatDateTime(task.dueDate)}
                        </Badge>
                    )}

                    {assignee && (
                        <Badge variant="outline" className="gap-1">
                            <User className="size-3" />
                            {assignee.username}
                        </Badge>
                    )}
                </CardDescription>

                <CardAction>
                    <ButtonGroup>
                        <Popover
                            open={editOpen}
                            onOpenChange={handleEditOpenChange}
                        >
                            <PopoverTrigger asChild>
                                <Button variant="outline" size="icon-sm">
                                    <Pencil />
                                </Button>
                            </PopoverTrigger>

                            <PopoverContent className="flex flex-col gap-4">
                                <PopoverHeader>
                                    <PopoverTitle>
                                        Редактирование задачи
                                    </PopoverTitle>
                                    <PopoverDescription>
                                        Обновите название, описание, приоритет,
                                        исполнителя и срок.
                                    </PopoverDescription>
                                </PopoverHeader>

                                <form
                                    id={`edit-task-form-${task.id}`}
                                    onSubmit={editForm.handleSubmit(
                                        handleSubmit
                                    )}
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
                                                        htmlFor={`edit-task-title-${task.id}`}
                                                    >
                                                        Название
                                                    </FieldLabel>
                                                    <Input
                                                        {...field}
                                                        id={`edit-task-title-${task.id}`}
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
                                                        htmlFor={`edit-task-description-${task.id}`}
                                                    >
                                                        Описание
                                                    </FieldLabel>
                                                    <Textarea
                                                        {...field}
                                                        value={
                                                            field.value ?? ''
                                                        }
                                                        id={`edit-task-description-${task.id}`}
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

                                        <Controller
                                            name="priority"
                                            control={editForm.control}
                                            render={({ field, fieldState }) => (
                                                <Field
                                                    data-invalid={
                                                        fieldState.invalid
                                                    }
                                                >
                                                    <FieldLabel
                                                        htmlFor={`edit-task-priority-${task.id}`}
                                                    >
                                                        Приоритет
                                                    </FieldLabel>
                                                    <Select
                                                        name={field.name}
                                                        value={field.value}
                                                        onValueChange={
                                                            field.onChange
                                                        }
                                                    >
                                                        <SelectTrigger
                                                            id={`edit-task-priority-${task.id}`}
                                                            aria-invalid={
                                                                fieldState.invalid
                                                            }
                                                        >
                                                            <SelectValue placeholder="Выберите приоритет" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="low">
                                                                Низкий
                                                            </SelectItem>
                                                            <SelectItem value="medium">
                                                                Средний
                                                            </SelectItem>
                                                            <SelectItem value="high">
                                                                Высокий
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
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
                                            name="assigneeId"
                                            control={editForm.control}
                                            render={({ field, fieldState }) => (
                                                <Field
                                                    data-invalid={
                                                        fieldState.invalid
                                                    }
                                                >
                                                    <FieldLabel
                                                        htmlFor={`edit-task-assignee-${task.id}`}
                                                    >
                                                        Исполнитель
                                                    </FieldLabel>
                                                    <Select
                                                        name={field.name}
                                                        value={
                                                            field.value ??
                                                            'unassigned'
                                                        }
                                                        onValueChange={(
                                                            value
                                                        ) =>
                                                            field.onChange(
                                                                value ===
                                                                    'unassigned'
                                                                    ? undefined
                                                                    : value
                                                            )
                                                        }
                                                    >
                                                        <SelectTrigger
                                                            id={`edit-task-assignee-${task.id}`}
                                                            aria-invalid={
                                                                fieldState.invalid
                                                            }
                                                        >
                                                            <SelectValue placeholder="Выберите исполнителя" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="unassigned">
                                                                Не назначен
                                                            </SelectItem>
                                                            {members.map(
                                                                (member) => (
                                                                    <SelectItem
                                                                        key={
                                                                            member.userId
                                                                        }
                                                                        value={
                                                                            member.userId
                                                                        }
                                                                    >
                                                                        {
                                                                            member.username
                                                                        }
                                                                    </SelectItem>
                                                                )
                                                            )}
                                                        </SelectContent>
                                                    </Select>
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
                                            name="dueDate"
                                            control={editForm.control}
                                            render={({ field, fieldState }) => (
                                                <Field
                                                    data-invalid={
                                                        fieldState.invalid
                                                    }
                                                >
                                                    <FieldLabel
                                                        htmlFor={`edit-task-due-date-${task.id}`}
                                                    >
                                                        Срок
                                                    </FieldLabel>
                                                    <Input
                                                        {...field}
                                                        value={
                                                            field.value ?? ''
                                                        }
                                                        id={`edit-task-due-date-${task.id}`}
                                                        type="datetime-local"
                                                        min={now}
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
                                        form={`edit-task-form-${task.id}`}
                                    >
                                        Сохранить
                                    </Button>
                                </Field>
                            </PopoverContent>
                        </Popover>

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="outline" size="icon-sm">
                                    <Trash2 />
                                </Button>
                            </AlertDialogTrigger>

                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>
                                        Удалить задачу?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Задача «{task.title}» будет удалена без
                                        возможности восстановления.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>

                                <AlertDialogFooter>
                                    <AlertDialogCancel>
                                        Отмена
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                        variant="destructive"
                                        onClick={() => onDelete(task.id)}
                                    >
                                        Удалить
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </ButtonGroup>
                </CardAction>
            </CardHeader>

            {task.description && (
                <CardContent className="px-4 text-sm">
                    {task.description}
                </CardContent>
            )}
        </Card>
    )
}
