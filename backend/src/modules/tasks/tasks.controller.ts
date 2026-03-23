import { Request, Response } from "express";
import {
    createTask,
    deleteTask,
    getTasksByBoard,
    moveTask,
    updateTask,
} from "./tasks.service";

export async function getTasksController(req: Request, res: Response) {
    try {
        const userId = req.user?.id;
        const boardId = req.query.boardId as string;

        if (!userId) {
            return res.status(401).json({ message: "Не авторизован" });
        }

        const tasks = await getTasksByBoard(userId, boardId);
        return res.status(200).json(tasks);
    } catch (error) {
        return res.status(400).json({
            message: error instanceof Error ? error.message : "Ошибка получения задач",
        });
    }
}

export async function createTaskController(req: Request, res: Response) {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: "Не авторизован" });
        }

        const task = await createTask(userId, req.body);
        return res.status(201).json(task);
    } catch (error) {
        return res.status(400).json({
            message: error instanceof Error ? error.message : "Ошибка создания задачи",
        });
    }
}

export async function updateTaskController(req: Request, res: Response) {
    try {
        const userId = req.user?.id;
        const taskId = req.params.id as string;

        if (!userId) {
            return res.status(401).json({ message: "Не авторизован" });
        }

        const task = await updateTask(userId, taskId, req.body);
        return res.status(200).json(task);
    } catch (error) {
        return res.status(400).json({
            message: error instanceof Error ? error.message : "Ошибка обновления задачи",
        });
    }
}

export async function moveTaskController(req: Request, res: Response) {
    try {
        const userId = req.user?.id;
        const taskId = req.params.id as string;

        if (!userId) {
            return res.status(401).json({ message: "Не авторизован" });
        }

        const task = await moveTask(userId, taskId, req.body);
        return res.status(200).json(task);
    } catch (error) {
        return res.status(400).json({
            message: error instanceof Error ? error.message : "Ошибка перемещения задачи",
        });
    }
}

export async function deleteTaskController(req: Request, res: Response) {
    try {
        const userId = req.user?.id;
        const taskId = req.params.id as string;

        if (!userId) {
            return res.status(401).json({ message: "Не авторизован" });
        }

        await deleteTask(userId, taskId);
        return res.status(200).json({ message: "Задача удалена" });
    } catch (error) {
        return res.status(400).json({
            message: error instanceof Error ? error.message : "Ошибка удаления задачи",
        });
    }
}