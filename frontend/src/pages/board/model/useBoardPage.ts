import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import type { Board } from '@/entities/board'
import type { BoardMember } from '@/entities/board-member'
import {
    type Column,
    columnDefaultValues,
    type ColumnFormValues,
    columnSchema,
} from '@/entities/column'
import {
    type Task,
    taskDefaultValues,
    type TaskFormValues,
    taskSchema,
} from '@/entities/task'
import { getBoardMembers } from '@/features/board-members'
import { getBoardById } from '@/features/boards'
import {
    createColumn,
    deleteColumn,
    getColumns,
    updateColumn,
} from '@/features/columns'
import { createTask, deleteTask, getTasks, updateTask } from '@/features/tasks'

import { createBoardInvitation } from '@/features/board-invitations'
import {
    getApiErrorMessage,
    handleApiError,
    normalizeColumnForm,
    normalizeTaskForm,
} from '@/shared/lib'
import {
    inviteDefaultValues,
    type InviteFormValues,
    inviteSchema,
} from '@/entities/board-invitation'

export const useBoardPage = (boardId?: string) => {
    const [board, setBoard] = useState<Board | null>(null)
    const [members, setMembers] = useState<BoardMember[]>([])
    const [columns, setColumns] = useState<Column[]>([])
    const [tasks, setTasks] = useState<Task[]>([])
    const [addColumnOpen, setAddColumnOpen] = useState(false)
    const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
    const [addTaskOpenColumnId, setAddTaskOpenColumnId] = useState<
        string | null
    >(null)
    const [isLoading, setIsLoading] = useState(true)
    const [loadError, setLoadError] = useState<string | null>(null)

    const columnForm = useForm<ColumnFormValues>({
        resolver: zodResolver(columnSchema),
        defaultValues: columnDefaultValues,
    })

    const taskForm = useForm<TaskFormValues>({
        resolver: zodResolver(taskSchema),
        defaultValues: taskDefaultValues,
    })

    const inviteForm = useForm<InviteFormValues>({
        resolver: zodResolver(inviteSchema),
        defaultValues: inviteDefaultValues,
    })

    useEffect(() => {
        const loadBoardPage = async () => {
            if (!boardId) {
                setIsLoading(false)
                setLoadError('Доска не найдена')
                return
            }

            try {
                setIsLoading(true)
                setLoadError(null)

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
                setBoard(null)
                setMembers([])
                setColumns([])
                setTasks([])

                setLoadError(
                    getApiErrorMessage(error, 'Не удалось загрузить доску')
                )
            } finally {
                setIsLoading(false)
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

    const resetInviteForm = () => {
        inviteForm.reset(inviteDefaultValues)
    }

    const handleAddColumn = async (data: ColumnFormValues) => {
        if (!boardId) return

        try {
            const normalized = normalizeColumnForm(data)

            const newColumn = await createColumn({
                title: normalized.title,
                boardId,
                wipLimit: normalized.wipLimit ?? undefined,
            })

            setColumns((current) =>
                [...current, newColumn].sort((a, b) => a.position - b.position)
            )

            toast.success('Колонка успешно создана')
            resetColumnForm()
            setAddColumnOpen(false)
        } catch (error) {
            handleApiError(error, 'Не удалось создать колонку')
        }
    }

    const handleEditColumn = async (
        columnId: string,
        data: ColumnFormValues
    ) => {
        try {
            const normalized = normalizeColumnForm(data)

            const updatedColumn = await updateColumn(columnId, {
                title: normalized.title,
                wipLimit: normalized.wipLimit,
            })

            setColumns((current) =>
                current.map((column) =>
                    column.id === columnId ? updatedColumn : column
                )
            )

            toast.success('Колонка успешно обновлена')
        } catch (error) {
            handleApiError(error, 'Не удалось обновить колонку')
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
            handleApiError(error, 'Не удалось удалить колонку')
        }
    }

    const handleOpenAddTask = (columnId: string) => {
        setAddTaskOpenColumnId(columnId)
        taskForm.reset(taskDefaultValues)
    }

    const handleAddTask = async (columnId: string, data: TaskFormValues) => {
        if (!boardId) return

        try {
            const normalized = normalizeTaskForm(data)

            const newTask = await createTask({
                title: normalized.title,
                description: normalized.description,
                priority: normalized.priority,
                dueDate: normalized.dueDate,
                assigneeId: normalized.assigneeId,
                boardId,
                columnId,
            })

            setTasks((current) =>
                [...current, newTask].sort((a, b) => a.position - b.position)
            )

            toast.success('Задача успешно создана')
            resetTaskForm()
        } catch (error) {
            handleApiError(error, 'Не удалось создать задачу')
        }
    }

    const handleEditTask = async (taskId: string, data: TaskFormValues) => {
        try {
            const normalized = normalizeTaskForm(data)

            const updatedTask = await updateTask(taskId, {
                title: normalized.title,
                description: normalized.description,
                priority: normalized.priority,
                dueDate: normalized.dueDate,
                assigneeId: normalized.assigneeId,
            })

            setTasks((current) =>
                current.map((task) => (task.id === taskId ? updatedTask : task))
            )

            toast.success('Задача успешно обновлена')
        } catch (error) {
            handleApiError(error, 'Не удалось обновить задачу')
        }
    }

    const handleDeleteTask = async (taskId: string) => {
        try {
            await deleteTask(taskId)

            setTasks((current) => current.filter((task) => task.id !== taskId))

            toast.success('Задача успешно удалена')
        } catch (error: any) {
            handleApiError(error, 'Не удалось удалить задачу')
        }
    }

    const handleInviteMember = async (data: InviteFormValues) => {
        if (!boardId) return

        try {
            await createBoardInvitation({
                boardId: boardId,
                inviteeUsername: data.username,
            })

            toast.success('Приглашение успешно отправлено')
            resetInviteForm()
            setInviteDialogOpen(false)
        } catch (error: any) {
            handleApiError(error, 'Не удалось отправить приглашение')
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
        setInviteDialogOpen,
        inviteDialogOpen,
        addTaskOpenColumnId,
        columnForm,
        taskForm,
        inviteForm,
        resetColumnForm,
        resetTaskForm,
        resetInviteForm,
        handleOpenAddTask,
        handleAddColumn,
        handleEditColumn,
        handleDeleteColumn,
        handleInviteMember,
        handleAddTask,
        handleEditTask,
        handleDeleteTask,
        isLoading,
        loadError,
    }
}
