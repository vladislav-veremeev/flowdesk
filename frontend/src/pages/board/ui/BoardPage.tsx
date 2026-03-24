import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

import type { Board } from '@/entities/board'
import { ColumnCard, type TaskFormValues } from '@/entities/column'
import type { Column } from '@/entities/column'
import type { Task } from '@/entities/task'
import { getBoards } from '@/features/boards'
import {
    createColumn,
    AddColumnCard,
    deleteColumn,
    getColumns,
    updateColumn,
} from '@/features/columns'
import { createTask, deleteTask, getTasks, updateTask } from '@/features/tasks'
import { Button } from '@/components/ui/button'
import {
    Item,
    ItemActions,
    ItemContent,
    ItemDescription,
    ItemTitle,
} from '@/components/ui/item.tsx'

const columnSchema = z.object({
    title: z
        .string()
        .trim()
        .min(1, 'Введите название колонки')
        .max(255, 'Название колонки должно содержать не более 255 символов'),
    wipLimit: z.string().optional(),
})

const taskSchema = z.object({
    title: z
        .string()
        .trim()
        .min(1, 'Введите название задачи')
        .max(255, 'Название задачи должно содержать не более 255 символов'),
    description: z.string().max(5000, 'Описание слишком длинное').optional(),
    priority: z.enum(['low', 'medium', 'high']),
    dueDate: z.string().optional(),
})

type ColumnFormValues = z.infer<typeof columnSchema>

const columnDefaultValues: ColumnFormValues = {
    title: '',
    wipLimit: '',
}

const taskDefaultValues: TaskFormValues = {
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
}

export const BoardPage = () => {
    const { id } = useParams<{ id: string }>()

    const [board, setBoard] = useState<Board | null>(null)
    const [columns, setColumns] = useState<Column[]>([])
    const [tasks, setTasks] = useState<Task[]>([])
    const [addColumnOpen, setAddColumnOpen] = useState(false)
    const [addTaskOpenColumnId, setAddTaskOpenColumnId] = useState<
        string | null
    >(null)

    const columnForm = useForm<ColumnFormValues>({
        resolver: zodResolver(columnSchema),
        defaultValues: columnDefaultValues,
    })

    const taskForm = useForm<TaskFormValues>({
        resolver: zodResolver(taskSchema),
        defaultValues: taskDefaultValues,
    })

    useEffect(() => {
        const loadBoardPage = async () => {
            if (!id) {
                return
            }

            try {
                const [boardsData, columnsData, tasksData] = await Promise.all([
                    getBoards(),
                    getColumns(id),
                    getTasks(id),
                ])

                const currentBoard =
                    boardsData.find((boardItem) => boardItem.id === id) ?? null

                setBoard(currentBoard)
                setColumns(columnsData)
                setTasks(tasksData)
            } catch (error: any) {
                toast.error(
                    error.response?.data?.message ||
                        'Не удалось загрузить доску'
                )
            }
        }

        loadBoardPage()
    }, [id])

    const resetColumnForm = () => {
        columnForm.reset(columnDefaultValues)
    }

    const resetTaskForm = () => {
        taskForm.reset(taskDefaultValues)
        setAddTaskOpenColumnId(null)
    }

    const handleAddColumn = async (data: ColumnFormValues) => {
        if (!id) return

        try {
            const trimmedWip = data.wipLimit?.trim()

            if (
                trimmedWip &&
                (Number.isNaN(Number(trimmedWip)) || Number(trimmedWip) < 1)
            ) {
                columnForm.setError('wipLimit', {
                    type: 'manual',
                    message: 'WIP-лимит должен быть числом больше 0',
                })
                return
            }

            const newColumn = await createColumn({
                title: data.title.trim(),
                boardId: id,
                wipLimit: trimmedWip ? Number(trimmedWip) : undefined,
            })

            setColumns((current) =>
                [...current, newColumn].sort((a, b) => a.position - b.position)
            )

            toast.success('Колонка успешно создана')
            resetColumnForm()
            setAddColumnOpen(false)
        } catch (error: any) {
            toast.error(
                error.response?.data?.message || 'Не удалось создать колонку'
            )
        }
    }

    const handleEditColumn = async (
        columnId: string,
        data: ColumnFormValues
    ) => {
        try {
            const trimmedWip = data.wipLimit?.trim()

            // if (
            //     trimmedWip &&
            //     (Number.isNaN(Number(trimmedWip)) || Number(trimmedWip) < 1)
            // ) {
            //     throw new Error('WIP-лимит должен быть числом больше 0')
            // }

            const updatedColumn = await updateColumn(columnId, {
                title: data.title.trim(),
                wipLimit: trimmedWip ? Number(trimmedWip) : null,
            })

            setColumns((current) =>
                current.map((column) =>
                    column.id === columnId ? updatedColumn : column
                )
            )

            toast.success('Колонка успешно обновлена')
        } catch (error: any) {
            toast.error(
                error.response?.data?.message ||
                    error.message ||
                    'Не удалось обновить колонку'
            )
            throw error
        }
    }

    const handleDeleteColumn = async (columnId: string) => {
        try {
            await deleteColumn(columnId)

            setColumns((current) =>
                current.filter((column) => column.id !== columnId)
            )
            setTasks((current) =>
                current.filter((task) => task.columnId !== columnId)
            )

            toast.success('Колонка успешно удалена')
        } catch (error: any) {
            toast.error(
                error.response?.data?.message || 'Не удалось удалить колонку'
            )
        }
    }

    const handleOpenAddTask = (columnId: string) => {
        setAddTaskOpenColumnId(columnId)
        taskForm.reset(taskDefaultValues)
    }

    const handleAddTask = async (columnId: string, data: TaskFormValues) => {
        if (!id) return

        try {
            const newTask = await createTask({
                title: data.title.trim(),
                description: data.description?.trim() || undefined,
                priority: data.priority,
                boardId: id,
                columnId,
                dueDate: data.dueDate
                    ? new Date(data.dueDate).toISOString()
                    : null,
            })

            setTasks((current) => [...current, newTask])

            toast.success('Задача успешно создана')
            resetTaskForm()
        } catch (error: any) {
            toast.error(
                error.response?.data?.message || 'Не удалось создать задачу'
            )
        }
    }

    const handleEditTask = async (taskId: string, data: TaskFormValues) => {
        try {
            const updatedTask = await updateTask(taskId, {
                title: data.title.trim(),
                description: data.description?.trim() || undefined,
                priority: data.priority,
                dueDate: data.dueDate
                    ? new Date(data.dueDate).toISOString()
                    : null,
            })

            setTasks((current) =>
                current.map((task) => (task.id === taskId ? updatedTask : task))
            )

            toast.success('Задача успешно обновлена')
        } catch (error: any) {
            toast.error(
                error.response?.data?.message || 'Не удалось обновить задачу'
            )
        }
    }

    const handleDeleteTask = async (taskId: string) => {
        try {
            await deleteTask(taskId)

            setTasks((current) => current.filter((task) => task.id !== taskId))

            toast.success('Задача успешно удалена')
        } catch (error: any) {
            toast.error(
                error.response?.data?.message || 'Не удалось удалить задачу'
            )
        }
    }

    const tasksByColumn = useMemo(() => {
        return columns.map((column) => ({
            ...column,
            tasks: tasks
                .filter((task) => task.columnId === column.id)
                .sort((a, b) => a.position - b.position),
        }))
    }, [columns, tasks])

    if (!id || !board) {
        return (
            <div className="flex flex-col gap-6 px-6 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-3">
                        <h1 className="text-xl font-medium">
                            Доска не найдена
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Возможно, доска была удалена или у вас нет к ней
                            доступа.
                        </p>
                    </div>

                    <Button asChild variant="outline">
                        <Link to="/">
                            <ArrowLeft />
                            Назад
                        </Link>
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col">
            <Item className="p-6">
                <ItemContent className="flex-row gap-2 items-center">
                    <ItemTitle className="text-xl">{board.title}</ItemTitle>
                    <ItemDescription>
                        {board.description || 'Описание отсутствует'}
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

            <div className="flex overflow-x-auto gap-6 px-6 pb-6">
                {tasksByColumn.map((column) => (
                    <ColumnCard
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

                <AddColumnCard
                    open={addColumnOpen}
                    onOpenChange={setAddColumnOpen}
                    form={columnForm}
                    onSubmit={handleAddColumn}
                    onReset={resetColumnForm}
                />
            </div>
        </div>
    )
}
