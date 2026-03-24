import { Controller, useForm, type UseFormReturn } from 'react-hook-form'
import { Pencil, Trash2 } from 'lucide-react'
import type { Column } from '@/entities/column'
import { type Task } from '@/entities/task'
import { TaskItem } from '@/entities/task'
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
import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import z from 'zod'
import { ButtonGroup } from '@/components/ui/button-group.tsx'
import {
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
    AlertDialog,
} from '@/components/ui/alert-dialog.tsx'
import { AddTaskPopover } from '@/features/tasks'

export type TaskFormValues = {
    title: string
    description?: string
    priority: 'low' | 'medium' | 'high'
    dueDate?: string
}

type ColumnWithTasks = Column & {
    tasks: Task[]
}

const editColumnSchema = z.object({
    title: z
        .string()
        .trim()
        .min(1, 'Введите название колонки')
        .max(255, 'Название колонки должно содержать не более 255 символов'),
    wipLimit: z.string().optional(),
})

type EditColumnFormValues = z.infer<typeof editColumnSchema>

type ColumnCardProps = {
    column: ColumnWithTasks
    addTaskOpenColumnId: string | null
    taskForm: UseFormReturn<TaskFormValues>
    onOpenAddTask: (columnId: string) => void
    onResetTaskForm: () => void
    onAddTask: (columnId: string, data: TaskFormValues) => void
    onEditTask: (taskId: string, data: TaskFormValues) => Promise<void>
    onDeleteTask: (taskId: string) => Promise<void>
    onEditColumn: (
        columnId: string,
        data: EditColumnFormValues
    ) => Promise<void>
    onDeleteColumn: (columnId: string) => Promise<void>
}

export const ColumnCard = ({
    column,
    addTaskOpenColumnId,
    taskForm,
    onOpenAddTask,
    onResetTaskForm,
    onAddTask,
    onEditTask,
    onEditColumn,
    onDeleteTask,
    onDeleteColumn,
}: ColumnCardProps) => {
    const [editOpen, setEditOpen] = useState(false)

    const editColumnForm = useForm<EditColumnFormValues>({
        resolver: zodResolver(editColumnSchema),
        defaultValues: {
            title: column.title,
            wipLimit: column.wipLimit?.toString() ?? '',
        },
    })

    const tasksCount = column.tasks.length
    const wipLimit = column.wipLimit ?? null
    const hasWipLimit = wipLimit !== null
    const isWipLimitReached = hasWipLimit && tasksCount >= wipLimit

    const handleEditOpenChange = (open: boolean) => {
        setEditOpen(open)

        if (open) {
            editColumnForm.reset({
                title: column.title,
                wipLimit: column.wipLimit?.toString() ?? '',
            })
        }
    }

    const handleEditSubmit = async (data: EditColumnFormValues) => {
        const trimmedWip = data.wipLimit?.trim()

        if (
            trimmedWip &&
            (Number.isNaN(Number(trimmedWip)) || Number(trimmedWip) < 1)
        ) {
            editColumnForm.setError('wipLimit', {
                type: 'manual',
                message: 'Лимит задач должен быть числом больше 0',
            })
            return
        }

        await onEditColumn(column.id, data)
        setEditOpen(false)
    }

    return (
        <Card className="min-w-80 h-fit">
            <CardHeader>
                <CardTitle className="flex gap-2 items-center">
                    {column.title}
                    <Badge variant="outline">
                        {hasWipLimit
                            ? `${tasksCount}/${column.wipLimit}`
                            : `${tasksCount}`}
                    </Badge>
                </CardTitle>

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
                                        Обновите название колонки и лимит задач.
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
                                            render={({ field, fieldState }) => (
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
                                            render={({ field, fieldState }) => (
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
                                                        min={tasksCount}
                                                        placeholder="Введите лимит"
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
                                        Колонка «{column.title}» будет удалена
                                        вместе со всеми её задачами без
                                        возможности восстановления.
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
            </CardHeader>

            <CardContent>
                {column.tasks.length > 0 ? (
                    <ItemGroup className="gap-6">
                        {column.tasks.map((task) => (
                            <TaskItem
                                key={task.id}
                                task={task}
                                onEdit={onEditTask}
                                onDelete={onDeleteTask}
                            />
                        ))}
                    </ItemGroup>
                ) : (
                    <p className="text-sm text-muted-foreground">
                        В колонке пока нет задач
                    </p>
                )}
            </CardContent>

            <CardFooter>
                <AddTaskPopover
                    columnId={column.id}
                    open={addTaskOpenColumnId === column.id}
                    disabled={Boolean(isWipLimitReached)}
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
        </Card>
    )
}
