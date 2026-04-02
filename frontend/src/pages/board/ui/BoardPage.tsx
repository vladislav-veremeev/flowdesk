import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { closestCorners, DndContext, DragOverlay } from '@dnd-kit/core'

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
import { BoardPageHeader } from '@/pages/board'

import { useBoardPage } from '../model/useBoardPage'
import { useBoardDnd } from '../model/useBoardDnd'

export const BoardPage = () => {
    const { id } = useParams<{ id: string }>()
    const user = userStore((state) => state.user)

    const {
        board,
        members,
        columns,
        tasks,
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
        tasksByColumn,
        activeTask,
        handleDragStart,
        handleDragOver,
        handleDragCancel,
        handleDragEnd,
    } = useBoardDnd({
        boardId: id,
        columns,
        tasks,
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
                collisionDetection={closestCorners}
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragCancel={handleDragCancel}
                onDragEnd={handleDragEnd}
            >
                <div className="flex h-full gap-6 overflow-x-auto">
                    {tasksByColumn.map((column) => (
                        <ColumnCard
                            key={column.id}
                            column={column}
                            canManageColumn={isOwner}
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
                        <Card className="h-fit min-w-80 p-0">
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

                <DragOverlay>
                    {activeTask ? (
                        <TaskCard
                            task={activeTask}
                            members={members}
                            onEdit={handleEditTask}
                            onDelete={handleDeleteTask}
                            isOverlay
                        />
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    )
}
