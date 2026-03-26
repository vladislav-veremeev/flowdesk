import { Request, Response } from "express";
import {
    createBoard,
    deleteBoard, getBoardById,
    getBoardMembers,
    getBoardsByUser, leaveBoard,
    removeBoardMember,
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
    } catch (error) {
        return res.status(400).json({
            message: error instanceof Error ? error.message : "Ошибка получения досок",
        });
    }
}

export async function getBoardByIdController(req: Request, res: Response) {
    try {
        const userId = req.user?.id;
        const boardId = req.params.id as string;

        if (!userId) {
            return res.status(401).json({ message: "Не авторизован" });
        }

        const board = await getBoardById(userId, boardId);
        return res.status(200).json(board);
    } catch (error) {
        return res.status(400).json({
            message: error instanceof Error ? error.message : "Ошибка получения доски",
        });
    }
}

export async function leaveBoardController(req: Request, res: Response) {
    try {
        const userId = req.user?.id;
        const boardId = req.params.boardId as string;

        if (!userId) {
            return res.status(401).json({ message: "Не авторизован" });
        }

        await leaveBoard(userId, boardId);
        return res.status(200).json({ message: "Вы вышли из доски" });
    } catch (error) {
        return res.status(400).json({
            message: error instanceof Error ? error.message : "Ошибка выхода из доски",
        });
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

export async function getBoardMembersController(req: Request, res: Response) {
    try {
        const userId = req.user?.id;
        const boardId = req.params.boardId as string;

        if (!userId) {
            return res.status(401).json({ message: "Не авторизован" });
        }

        const members = await getBoardMembers(userId, boardId);
        return res.status(200).json(members);
    } catch (error) {
        return res.status(400).json({
            message:
                error instanceof Error
                    ? error.message
                    : "Ошибка получения участников доски",
        });
    }
}

export async function removeBoardMemberController(req: Request, res: Response) {
    try {
        const userId = req.user?.id;
        const boardId = req.params.boardId as string;
        const memberUserId = req.params.memberUserId as string;

        if (!userId) {
            return res.status(401).json({ message: "Не авторизован" });
        }

        await removeBoardMember(userId, boardId, memberUserId);
        return res.status(200).json({ message: "Участник удален из доски" });
    } catch (error) {
        return res.status(400).json({
            message:
                error instanceof Error
                    ? error.message
                    : "Ошибка удаления участника",
        });
    }
}