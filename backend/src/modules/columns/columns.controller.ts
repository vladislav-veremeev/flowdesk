import { Request, Response } from "express";
import {
    createColumn,
    deleteColumn,
    getColumnsByBoard,
    reorderColumns,
    updateColumn,
} from "./columns.service";

export async function getColumnsController(req: Request, res: Response) {
    try {
        const userId = req.user?.id;
        const boardId = req.query.boardId as string;

        if (!userId) {
            return res.status(401).json({ message: "Не авторизован" });
        }

        if (!boardId) {
            return res.status(400).json({ message: "boardId обязателен" });
        }

        const columns = await getColumnsByBoard(userId, boardId);

        return res.status(200).json(columns);
    } catch (error) {
        return res.status(400).json({
            message:
                error instanceof Error
                    ? error.message
                    : "Ошибка получения колонок",
        });
    }
}

export async function createColumnController(req: Request, res: Response) {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: "Не авторизован" });
        }

        const column = await createColumn(userId, req.body);

        return res.status(201).json(column);
    } catch (error) {
        return res.status(400).json({
            message:
                error instanceof Error
                    ? error.message
                    : "Ошибка создания колонки",
        });
    }
}

export async function updateColumnController(req: Request, res: Response) {
    try {
        const userId = req.user?.id;
        const columnId = req.params.id as string;

        if (!userId) {
            return res.status(401).json({ message: "Не авторизован" });
        }

        const column = await updateColumn(userId, columnId, req.body);

        return res.status(200).json(column);
    } catch (error) {
        return res.status(400).json({
            message:
                error instanceof Error
                    ? error.message
                    : "Ошибка обновления колонки",
        });
    }
}

export async function reorderColumnsController(req: Request, res: Response) {
    try {
        const userId = req.user?.id;
        const boardId = req.params.boardId as string;

        if (!userId) {
            return res.status(401).json({ message: "Не авторизован" });
        }

        await reorderColumns(userId, boardId, req.body);

        return res.status(200).json({ message: "Колонки переупорядочены" });
    } catch (error) {
        return res.status(400).json({
            message:
                error instanceof Error
                    ? error.message
                    : "Ошибка изменения порядка колонок",
        });
    }
}

export async function deleteColumnController(req: Request, res: Response) {
    try {
        const userId = req.user?.id;
        const columnId = req.params.id as string;

        if (!userId) {
            return res.status(401).json({ message: "Не авторизован" });
        }

        await deleteColumn(userId, columnId);

        return res.status(200).json({ message: "Колонка удалена" });
    } catch (error) {
        return res.status(400).json({
            message:
                error instanceof Error
                    ? error.message
                    : "Ошибка удаления колонки",
        });
    }
}