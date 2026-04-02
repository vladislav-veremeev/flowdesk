import { Request, Response } from "express";
import { getBoardStats } from "./board-stats.service";

export async function getBoardStatsController(req: Request, res: Response) {
    try {
        const userId = req.user?.id;
        const boardId = req.params.boardId as string;
        const period = Number(req.query.period ?? 7) as 1 | 7 | 30;

        if (!userId) {
            return res.status(401).json({ message: "Не авторизован" });
        }

        if (![1, 7, 30].includes(period)) {
            return res.status(400).json({
                message: "Допустимые значения периода: 1, 7, 30",
            });
        }

        const stats = await getBoardStats(userId, boardId, period);

        return res.status(200).json(stats);
    } catch (error) {
        return res.status(400).json({
            message:
                error instanceof Error
                    ? error.message
                    : "Ошибка получения статистики доски",
        });
    }
}