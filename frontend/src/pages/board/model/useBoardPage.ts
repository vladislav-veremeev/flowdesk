import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

import type { Board } from '@/entities/board'
import type { BoardMember } from '@/entities/board-member'
import type { Column } from '@/entities/column'
import type { Task } from '@/entities/task'
import { getBoardMembers } from '@/features/board-members'
import { getBoardById } from '@/features/boards'
import {
    createColumn,
    deleteColumn,
    getColumns,
    updateColumn,
} from '@/features/columns'
import { createTask, deleteTask, getTasks, updateTask } from '@/features/tasks'

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

export type ColumnFormValues = z.infer<typeof columnSchema>
export type TaskFormValues = z.infer<typeof taskSchema>

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

export const useBoardPage = (boardId?: string) => {
    const [board, setBoard] = useState<Board | null>(null)
    const [members, setMembers] = useState<BoardMember[]>([])
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
            if (!boardId) {
                return
            }

            try {
                const [boardData, membersData, columnsData, tasksData] =
                    await Promise.all([
                        getBoardById(boardId),
                        getBoardMembers(boardId),
                        getColumns(boardId),
                        getTasks(boardId),
                    ])

                setBoard(boardData)
                setMembers(membersData)
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
    }, [boardId])

    const resetColumnForm = () => {
        columnForm.reset(columnDefaultValues)
    }

    const resetTaskForm = () => {
        taskForm.reset(taskDefaultValues)
        setAddTaskOpenColumnId(null)
    }

    const handleAddColumn = async (data: ColumnFormValues) => {
        if (!boardId) return

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
                boardId,
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
        if (!boardId) return

        try {
            const newTask = await createTask({
                title: data.title.trim(),
                description: data.description?.trim() || undefined,
                priority: data.priority,
                boardId,
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

    return {
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
    }
}
