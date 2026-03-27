import { useMemo, useRef, useState } from 'react'
import {
    KeyboardSensor,
    PointerSensor,
    type DragEndEvent,
    type DragOverEvent,
    type DragStartEvent,
    useSensor,
    useSensors,
} from '@dnd-kit/core'
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { toast } from 'sonner'

import type { Column } from '@/entities/column'
import type { Task } from '@/entities/task'
import { reorderColumns } from '@/features/columns'
import { moveTask as moveTaskApi } from '@/features/tasks'

export const parseSortableId = (sortableId: string | number) => {
    const value = String(sortableId)

    if (value.startsWith('column-')) {
        return {
            type: 'column' as const,
            id: value.replace('column-', ''),
        }
    }

    if (value.startsWith('task-')) {
        return {
            type: 'task' as const,
            id: value.replace('task-', ''),
        }
    }

    return null
}

type UseBoardDndParams = {
    boardId?: string
    columns: Column[]
    tasks: Task[]
    setColumns: React.Dispatch<React.SetStateAction<Column[]>>
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>
}

export const useBoardDnd = ({
    boardId,
    columns,
    tasks,
    setColumns,
    setTasks,
}: UseBoardDndParams) => {
    const [activeColumnId, setActiveColumnId] = useState<string | null>(null)
    const [activeTaskId, setActiveTaskId] = useState<string | null>(null)

    const previousColumnsRef = useRef<Column[]>([])
    const previousTasksRef = useRef<Task[]>([])

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 6,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const sortedColumns = useMemo(
        () => [...columns].sort((a, b) => a.position - b.position),
        [columns]
    )

    const tasksByColumn = useMemo(() => {
        return sortedColumns.map((column) => ({
            ...column,
            tasks: tasks
                .filter((task) => task.columnId === column.id)
                .sort((a, b) => a.position - b.position),
        }))
    }, [sortedColumns, tasks])

    const findTaskById = (taskId: string) => {
        return tasks.find((task) => task.id === taskId) ?? null
    }

    const findColumnByTaskId = (taskId: string) => {
        const task = findTaskById(taskId)
        return task?.columnId ?? null
    }

    const findContainerId = (sortableId: string | number) => {
        const parsed = parseSortableId(sortableId)

        if (!parsed) {
            return null
        }

        if (parsed.type === 'column') {
            return parsed.id
        }

        return findColumnByTaskId(parsed.id)
    }

    const buildTasksWithPositions = (items: Task[]) => {
        const positionsByColumn = new Map<string, number>()

        return items.map((task) => {
            const nextPosition = (positionsByColumn.get(task.columnId) ?? 0) + 1
            positionsByColumn.set(task.columnId, nextPosition)

            return {
                ...task,
                position: nextPosition,
            }
        })
    }

    const moveTaskInState = ({
        activeTaskId,
        overId,
    }: {
        activeTaskId: string
        overId: string | number
    }) => {
        const activeTask = findTaskById(activeTaskId)

        if (!activeTask) {
            return
        }

        const overContainerId = findContainerId(overId)

        if (!overContainerId) {
            return
        }

        setTasks((currentTasks) => {
            const currentActiveTask = currentTasks.find(
                (task) => task.id === activeTaskId
            )

            if (!currentActiveTask) {
                return currentTasks
            }

            const sourceTasks = currentTasks.filter(
                (task) => task.columnId === currentActiveTask.columnId
            )
            const destinationTasks = currentTasks.filter(
                (task) => task.columnId === overContainerId
            )

            const activeIndex = sourceTasks.findIndex(
                (task) => task.id === activeTaskId
            )

            if (activeIndex === -1) {
                return currentTasks
            }

            const overParsed = parseSortableId(overId)

            if (currentActiveTask.columnId === overContainerId) {
                if (!overParsed || overParsed.type !== 'task') {
                    return currentTasks
                }

                const overIndex = sourceTasks.findIndex(
                    (task) => task.id === overParsed.id
                )

                if (overIndex === -1 || overIndex === activeIndex) {
                    return currentTasks
                }

                const reorderedColumnTasks = arrayMove(
                    sourceTasks,
                    activeIndex,
                    overIndex
                )

                const otherTasks = currentTasks.filter(
                    (task) => task.columnId !== currentActiveTask.columnId
                )

                return buildTasksWithPositions([
                    ...otherTasks,
                    ...reorderedColumnTasks,
                ])
            }

            const nextTask: Task = {
                ...currentActiveTask,
                columnId: overContainerId,
            }

            const sourceWithoutActive = sourceTasks.filter(
                (task) => task.id !== activeTaskId
            )

            const overIndex =
                overParsed?.type === 'task'
                    ? destinationTasks.findIndex(
                          (task) => task.id === overParsed.id
                      )
                    : destinationTasks.length

            const nextDestinationTasks = [...destinationTasks]
            nextDestinationTasks.splice(
                overIndex >= 0 ? overIndex : nextDestinationTasks.length,
                0,
                nextTask
            )

            const otherTasks = currentTasks.filter(
                (task) =>
                    task.columnId !== currentActiveTask.columnId &&
                    task.columnId !== overContainerId
            )

            return buildTasksWithPositions([
                ...otherTasks,
                ...sourceWithoutActive,
                ...nextDestinationTasks,
            ])
        })
    }

    const handleDragStart = (event: DragStartEvent) => {
        const parsed = parseSortableId(event.active.id)

        previousColumnsRef.current = columns
        previousTasksRef.current = tasks

        if (!parsed) {
            return
        }

        if (parsed.type === 'column') {
            setActiveColumnId(parsed.id)
        }

        if (parsed.type === 'task') {
            setActiveTaskId(parsed.id)
        }
    }

    const handleDragOver = (event: DragOverEvent) => {
        if (!activeTaskId || !event.over) {
            return
        }

        const activeParsed = parseSortableId(event.active.id)
        const overParsed = parseSortableId(event.over.id)

        if (!activeParsed || activeParsed.type !== 'task' || !overParsed) {
            return
        }

        moveTaskInState({
            activeTaskId: activeParsed.id,
            overId: event.over.id,
        })
    }

    const handleDragCancel = () => {
        setColumns(previousColumnsRef.current)
        setTasks(previousTasksRef.current)
        setActiveColumnId(null)
        setActiveTaskId(null)
    }

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event

        setActiveColumnId(null)
        setActiveTaskId(null)

        if (!over) {
            setColumns(previousColumnsRef.current)
            setTasks(previousTasksRef.current)
            return
        }

        const activeParsed = parseSortableId(active.id)
        const overParsed = parseSortableId(over.id)

        if (!activeParsed || !overParsed) {
            setColumns(previousColumnsRef.current)
            setTasks(previousTasksRef.current)
            return
        }

        if (activeParsed.type === 'column' && overParsed.type === 'column') {
            const oldIndex = sortedColumns.findIndex(
                (column) => column.id === activeParsed.id
            )
            const newIndex = sortedColumns.findIndex(
                (column) => column.id === overParsed.id
            )

            if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
                return
            }

            const reorderedColumns = arrayMove(
                sortedColumns,
                oldIndex,
                newIndex
            ).map((column, index) => ({
                ...column,
                position: index + 1,
            }))

            setColumns(reorderedColumns)

            try {
                if (!boardId) {
                    throw new Error('Board id is required')
                }

                await reorderColumns(
                    boardId,
                    reorderedColumns.map((column) => column.id)
                )
            } catch (error: any) {
                setColumns(previousColumnsRef.current)
                toast.error(
                    error.response?.data?.message ||
                        'Не удалось сохранить порядок колонок'
                )
            }

            return
        }

        if (activeParsed.type === 'task') {
            const movedTask = tasks.find((task) => task.id === activeParsed.id)

            if (!movedTask) {
                setTasks(previousTasksRef.current)
                return
            }

            const targetColumnId = movedTask.columnId
            const targetPosition =
                tasks
                    .filter((task) => task.columnId === targetColumnId)
                    .sort((a, b) => a.position - b.position)
                    .findIndex((task) => task.id === movedTask.id) + 1

            if (!targetColumnId || targetPosition < 1) {
                setTasks(previousTasksRef.current)
                return
            }

            try {
                const updatedTask = await moveTaskApi(activeParsed.id, {
                    targetColumnId,
                    targetPosition,
                })

                setTasks((current) =>
                    current.map((task) =>
                        task.id === activeParsed.id ? updatedTask : task
                    )
                )
            } catch (error: any) {
                setTasks(previousTasksRef.current)
                toast.error(
                    error.response?.data?.message ||
                        'Не удалось сохранить перемещение задачи'
                )
            }
        }
    }

    const activeColumn = activeColumnId
        ? (tasksByColumn.find((column) => column.id === activeColumnId) ?? null)
        : null

    const activeTask = activeTaskId
        ? (tasks.find((task) => task.id === activeTaskId) ?? null)
        : null

    return {
        sensors,
        sortedColumns,
        tasksByColumn,
        activeColumn,
        activeTask,
        handleDragStart,
        handleDragOver,
        handleDragCancel,
        handleDragEnd,
    }
}
