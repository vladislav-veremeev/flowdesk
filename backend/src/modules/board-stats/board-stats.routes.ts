import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { getBoardStatsController } from "./board-stats.controller";

const router = Router();

router.use(authMiddleware);

router.get("/:boardId", getBoardStatsController);

export default router;