import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Pencil, Trash2 } from 'lucide-react'

import {
    taskPriorityLabels,
    type Task,
    TaskPriorityBadge,
} from '@/entities/task'
import { formatDateTime, toDateTimeLocalValue } from '@/shared/lib'
import {
    Item,
    ItemActions,
    ItemContent,
    ItemDescription,
    ItemTitle,
} from '@/components/ui/item'
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

const editTaskSchema = z.object({
    title: z
        .string()
        .trim()
        .min(1, 'Введите название задачи')
        .max(255, 'Название задачи должно содержать не более 255 символов'),
    description: z.string().max(5000, 'Описание слишком длинное').optional(),
    priority: z.enum(['low', 'medium', 'high']),
    dueDate: z.string().optional(),
})

type EditTaskFormValues = z.infer<typeof editTaskSchema>

type TaskItemProps = {
    task: Task
    onEdit: (taskId: string, data: EditTaskFormValues) => Promise<void>
    onDelete: (taskId: string) => Promise<void>
}

export const TaskItem = ({ task, onEdit, onDelete }: TaskItemProps) => {
    const [editOpen, setEditOpen] = useState(false)

    const editForm = useForm<EditTaskFormValues>({
        resolver: zodResolver(editTaskSchema),
        defaultValues: {
            title: task.title,
            description: task.description ?? '',
            priority: task.priority,
            dueDate: toDateTimeLocalValue(task.dueDate),
        },
    })

    const handleEditOpenChange = (open: boolean) => {
        setEditOpen(open)

        if (open) {
            editForm.reset({
                title: task.title,
                description: task.description ?? '',
                priority: task.priority,
                dueDate: toDateTimeLocalValue(task.dueDate),
            })
        }
    }

    const handleSubmit = async (data: EditTaskFormValues) => {
        await onEdit(task.id, data)
        setEditOpen(false)
    }

    return (
        <Item variant="outline" className="bg-background">
            <ItemContent>
                <ItemTitle className="text-base">
                    {task.title}
                    <TaskPriorityBadge priority={task.priority} />
                </ItemTitle>

                <ItemDescription>
                    {task.description || 'Описание отсутствует'}
                </ItemDescription>

                {task.dueDate && (
                    <ItemTitle>До {formatDateTime(task.dueDate)}</ItemTitle>
                )}
            </ItemContent>

            <ItemActions>
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
                                    Редактирование задачи
                                </PopoverTitle>
                                <PopoverDescription>
                                    Обновите название, описание, приоритет и
                                    срок.
                                </PopoverDescription>
                            </PopoverHeader>

                            <form
                                id={`edit-task-form-${task.id}`}
                                onSubmit={editForm.handleSubmit(handleSubmit)}
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
                                                            {
                                                                taskPriorityLabels.low
                                                            }
                                                        </SelectItem>
                                                        <SelectItem value="medium">
                                                            {
                                                                taskPriorityLabels.medium
                                                            }
                                                        </SelectItem>
                                                        <SelectItem value="high">
                                                            {
                                                                taskPriorityLabels.high
                                                            }
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
                                                    id={`edit-task-due-date-${task.id}`}
                                                    type="datetime-local"
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
                            <Button variant="outline">
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
                                <AlertDialogCancel>Отмена</AlertDialogCancel>
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
            </ItemActions>
        </Item>
    )
}
