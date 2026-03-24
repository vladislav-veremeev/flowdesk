import { useEffect, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import type { Board } from '@/entities/board'
import { BoardCard, type BoardFormValues } from '@/entities/board'
import {
    createBoard,
    CreateBoardCard,
    deleteBoard,
    getBoards,
    updateBoard,
} from '@/features/boards'

const boardSchema = z.object({
    title: z
        .string()
        .trim()
        .min(1, 'Введите название доски')
        .max(100, 'Название доски должно содержать не более 100 символов'),
    description: z
        .string()
        .max(500, 'Описание должно содержать не более 500 символов'),
})

const defaultValues: BoardFormValues = {
    title: '',
    description: '',
}

export const HomePage = () => {
    const [boards, setBoards] = useState<Board[]>([])
    const [editingBoard, setEditingBoard] = useState<Board | null>(null)
    const [createOpen, setCreateOpen] = useState(false)
    const [editOpenBoardId, setEditOpenBoardId] = useState<string | null>(null)

    const createForm = useForm<BoardFormValues>({
        resolver: zodResolver(boardSchema),
        defaultValues,
    })

    const editForm = useForm<BoardFormValues>({
        resolver: zodResolver(boardSchema),
        defaultValues,
    })

    const loadBoards = async () => {
        try {
            const data = await getBoards()
            setBoards(data)
        } catch (error: any) {
            toast.error(
                error.response?.data?.message || 'Не удалось загрузить доски'
            )
        }
    }

    useEffect(() => {
        loadBoards()
    }, [])

    const resetCreateForm = () => {
        createForm.reset(defaultValues)
    }

    const resetEditForm = () => {
        editForm.reset(defaultValues)
        setEditingBoard(null)
        setEditOpenBoardId(null)
    }

    const handleOpenEdit = (board: Board) => {
        setEditingBoard(board)
        setEditOpenBoardId(board.id)
        editForm.reset({
            title: board.title,
            description: board.description ?? '',
        })
    }

    const handleEdit = async (data: BoardFormValues) => {
        if (!editingBoard) return

        try {
            const payload = {
                title: data.title.trim(),
                description: data.description.trim() || undefined,
            }

            const updatedBoard = await updateBoard(editingBoard.id, payload)
            setBoards((current) =>
                current.map((board) =>
                    board.id === updatedBoard.id ? updatedBoard : board
                )
            )
            toast.success('Доска успешно обновлена')

            resetEditForm()
        } catch (error: any) {
            toast.error(
                error.response?.data?.message || 'Не удалось сохранить доску'
            )
        }
    }

    const handleAdd = async (data: BoardFormValues) => {
        try {
            const payload = {
                title: data.title.trim(),
                description: data.description.trim() || undefined,
            }

            const newBoard = await createBoard(payload)
            setBoards((current) => [newBoard, ...current])
            toast.success('Доска успешно создана')

            resetCreateForm()
            setCreateOpen(false)
        } catch (error: any) {
            toast.error(
                error.response?.data?.message || 'Не удалось добавить доску'
            )
        }
    }

    const handleDelete = async (boardId: string) => {
        try {
            await deleteBoard(boardId)
            setBoards((current) =>
                current.filter((board) => board.id !== boardId)
            )

            if (editingBoard?.id === boardId) {
                resetEditForm()
            }

            toast.success('Доска удалена')
        } catch (error: any) {
            toast.error(
                error.response?.data?.message || 'Не удалось удалить доску'
            )
        }
    }

    return (
        <div className="flex flex-col p-6 gap-6">
            <h1 className="font-medium text-xl">Мои доски</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {boards.map((board) => (
                    <BoardCard
                        key={board.id}
                        board={board}
                        editOpenBoardId={editOpenBoardId}
                        editForm={editForm}
                        onOpenEdit={handleOpenEdit}
                        onResetEditForm={resetEditForm}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                ))}

                <CreateBoardCard
                    open={createOpen}
                    onOpenChange={setCreateOpen}
                    form={createForm}
                    onSubmit={handleAdd}
                    onReset={resetCreateForm}
                />
            </div>
        </div>
    )
}
