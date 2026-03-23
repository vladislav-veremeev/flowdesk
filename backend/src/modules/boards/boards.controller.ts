import { Request, Response } from "express";
import {
    createBoard,
    deleteBoard,
    getBoardsByUser,
    updateBoard,
} from "./boards.service";

export async function getBoardsController(req: Request, res: Response) {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: "Не авторизован" });
        }

        const boards = await getBoardsByUser(userId);
        return res.status(200).json(boards);
    } catch {
        return res.status(500).json({ message: "Внутренняя ошибка сервера" });
    }
}

export async function createBoardController(req: Request, res: Response) {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: "Не авторизован" });
        }

        const board = await createBoard(userId, req.body);
        return res.status(201).json(board);
    } catch (error) {
        return res.status(400).json({
            message: error instanceof Error ? error.message : "Ошибка создания доски",
        });
    }
}

export async function updateBoardController(req: Request, res: Response) {
    try {
        const userId = req.user?.id;
        const boardId = req.params.id as string;

        if (!userId) {
            return res.status(401).json({ message: "Не авторизован" });
        }

        const board = await updateBoard(userId, boardId, req.body);
        return res.status(200).json(board);
    } catch (error) {
        return res.status(400).json({
            message: error instanceof Error ? error.message : "Ошибка обновления доски",
        });
    }
}

export async function deleteBoardController(req: Request, res: Response) {
    try {
        const userId = req.user?.id;
        const boardId = req.params.id as string;

        if (!userId) {
            return res.status(401).json({ message: "Не авторизован" });
        }

        await deleteBoard(userId, boardId);
        return res.status(200).json({ message: "Доска удалена" });
    } catch (error) {
        return res.status(400).json({
            message: error instanceof Error ? error.message : "Ошибка удаления доски",
        });
    }
}