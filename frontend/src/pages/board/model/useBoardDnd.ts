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
import { moveTask as moveTaskApi } from '@/features/tasks'

export const parseSortableId = (sortableId: string | number) => {
    const value = String(sortableId)

    if (value.startsWith('task-')) {
        return value.replace('task-', '')
    }

    return null
}

type UseBoardDndParams = {
    boardId?: string
    columns: Column[]
    tasks: Task[]
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>
}

export const useBoardDnd = ({
    boardId,
    columns,
    tasks,
    setTasks,
}: UseBoardDndParams) => {
    const [activeTaskId, setActiveTaskId] = useState<string | null>(null)
    const previousTasksRef = useRef<Task[]>([])

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 10,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const orderedColumns = useMemo(
        () => [...columns].sort((a, b) => a.position - b.position),
        [columns]
    )

    const tasksByColumn = useMemo(() => {
        return orderedColumns.map((column) => ({
            ...column,
            tasks: tasks
                .filter((task) => task.columnId === column.id)
                .sort((a, b) => a.position - b.position),
        }))
    }, [orderedColumns, tasks])

    const findTaskById = (taskId: string) => {
        return tasks.find((task) => task.id === taskId) ?? null
    }

    const findColumnByTaskId = (taskId: string) => {
        const task = findTaskById(taskId)
        return task?.columnId ?? null
    }

    const findContainerId = (id: string | number) => {
        const taskId = parseSortableId(id)

        if (taskId) {
            return findColumnByTaskId(taskId)
        }

        return String(id)
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
        setTasks((currentTasks) => {
            const currentActiveTask = currentTasks.find(
                (task) => task.id === activeTaskId
            )

            if (!currentActiveTask) {
                return currentTasks
            }

            const overTaskId = parseSortableId(overId)
            const overContainerId = overTaskId
                ? currentTasks.find((task) => task.id === overTaskId)?.columnId
                : String(overId)

            if (!overContainerId) {
                return currentTasks
            }

            const sourceTasks = currentTasks
                .filter((task) => task.columnId === currentActiveTask.columnId)
                .sort((a, b) => a.position - b.position)

            const destinationTasks = currentTasks
                .filter((task) => task.columnId === overContainerId)
                .sort((a, b) => a.position - b.position)

            const activeIndex = sourceTasks.findIndex(
                (task) => task.id === activeTaskId
            )

            if (activeIndex === -1) {
                return currentTasks
            }

            if (currentActiveTask.columnId === overContainerId) {
                if (!overTaskId) {
                    return currentTasks
                }

                const overIndex = sourceTasks.findIndex(
                    (task) => task.id === overTaskId
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

            const overIndex = overTaskId
                ? destinationTasks.findIndex((task) => task.id === overTaskId)
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
        const taskId = parseSortableId(event.active.id)

        if (!taskId) {
            return
        }

        previousTasksRef.current = tasks
        setActiveTaskId(taskId)
    }

    const handleDragOver = (event: DragOverEvent) => {
        if (!event.over) {
            return
        }

        const activeTaskId = parseSortableId(event.active.id)

        if (!activeTaskId) {
            return
        }

        moveTaskInState({
            activeTaskId,
            overId: event.over.id,
        })
    }

    const handleDragCancel = () => {
        setTasks(previousTasksRef.current)
        setActiveTaskId(null)
    }

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event
        const activeTaskId = parseSortableId(active.id)

        setActiveTaskId(null)

        if (!activeTaskId || !over) {
            setTasks(previousTasksRef.current)
            return
        }

        const movedTask = tasks.find((task) => task.id === activeTaskId)

        if (!movedTask) {
            setTasks(previousTasksRef.current)
            return
        }

        const targetColumnId = findContainerId(over.id)

        if (!targetColumnId) {
            setTasks(previousTasksRef.current)
            return
        }

        const targetPosition =
            tasks
                .filter((task) => task.columnId === movedTask.columnId)
                .sort((a, b) => a.position - b.position)
                .findIndex((task) => task.id === movedTask.id) + 1

        if (targetPosition < 1) {
            setTasks(previousTasksRef.current)
            return
        }

        try {
            if (!boardId) {
                throw new Error('Board id is required')
            }

            const updatedTask = await moveTaskApi(activeTaskId, {
                targetColumnId,
                targetPosition,
            })

            setTasks((currentTasks) =>
                currentTasks.map((task) =>
                    task.id === activeTaskId ? updatedTask : task
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

    const activeTask = activeTaskId
        ? (tasks.find((task) => task.id === activeTaskId) ?? null)
        : null

    return {
        sensors,
        tasksByColumn,
        activeTask,
        handleDragStart,
        handleDragOver,
        handleDragCancel,
        handleDragEnd,
    }
}
