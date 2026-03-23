import { Router } from "express";
import {
    createBoardController,
    deleteBoardController,
    getBoardsController,
    updateBoardController,
} from "./boards.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.get("/", getBoardsController);
router.post("/", createBoardController);
router.put("/:id", updateBoardController);
router.delete("/:id", deleteBoardController);

export default router;