import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import {
    closestCorners,
    type CollisionDetection,
    DndContext,
    DragOverlay,
    pointerWithin,
} from '@dnd-kit/core'
import {
    horizontalListSortingStrategy,
    SortableContext,
} from '@dnd-kit/sortable'

import { userStore } from '@/entities/user'
import { ColumnCard } from '@/entities/column'
import { TaskCard } from '@/entities/task'
import { AddColumnPopover } from '@/features/columns'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card.tsx'


import {
    Item,
    ItemActions,
    ItemContent,
    ItemDescription,
    ItemTitle,
} from '@/components/ui/item.tsx'
import { useBoardPage } from '../model/useBoardPage'
import { parseSortableId, useBoardDnd } from '../model/useBoardDnd'


import { BoardPageHeader } from '@/pages/board'

const getColumnSortableId = (columnId: string) => `column-${columnId}`

export const BoardPage = () => {
    const { id } = useParams<{ id: string }>()
    const user = userStore((state) => state.user)

    const collisionDetection: CollisionDetection = (args) => {
        const activeParsed = parseSortableId(args.active.id)

        if (!activeParsed) {
            return closestCorners(args)
        }

        if (activeParsed.type === 'column') {
            const columnContainers = args.droppableContainers.filter(
                (container) => {
                    const parsed = parseSortableId(container.id)
                    return parsed?.type === 'column'
                }
            )

            return closestCorners({
                ...args,
                droppableContainers: columnContainers,
            })
        }

        const pointerCollisions = pointerWithin(args)

        if (pointerCollisions.length > 0) {
            return pointerCollisions
        }

        return closestCorners(args)
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
        inviteForm,
        resetColumnForm,
        resetTaskForm,
        resetInviteForm,
        handleOpenAddTask,
        handleAddColumn,
        handleEditColumn,
        handleDeleteColumn,
        handleAddTask,
        handleEditTask,
        handleDeleteTask,
        handleInviteMember,
        isLoading,
        loadError,
        inviteDialogOpen,
        setInviteDialogOpen,
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

    if (isLoading) {
        return (
            <div className="flex flex-col px-6 py-4">
                <Item className="p-0">
                    <ItemContent>
                        <ItemTitle className="text-xl">
                            Загрузка доски...
                        </ItemTitle>
                        <ItemDescription>
                            Подождите, данные загружаются.
                        </ItemDescription>
                    </ItemContent>
                </Item>
            </div>
        )
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
                            {loadError ||
                                'Возможно, доска была удалена или у вас нет к ней доступа.'}
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
            <BoardPageHeader
                board={board}
                members={members}
                isOwner={isOwner}
                inviteDialogOpen={inviteDialogOpen}
                setInviteDialogOpen={setInviteDialogOpen}
                inviteForm={inviteForm}
                onInviteMember={handleInviteMember}
                onResetInviteForm={resetInviteForm}
            />

            <DndContext
                collisionDetection={collisionDetection}
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
                                members={members}
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
                            members={members}
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
                            members={members}
                            isOverlay
                        />
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    )
}
