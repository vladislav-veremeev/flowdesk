import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import {
    createTaskController,
    deleteTaskController,
    getTasksController,
    moveTaskController,
    updateTaskController,
} from "./tasks.controller";

const router = Router();

router.use(authMiddleware);

router.get("/", getTasksController);
router.post("/", createTaskController);
router.put("/:id", updateTaskController);
router.patch("/:id/move", moveTaskController);
router.delete("/:id", deleteTaskController);

export default router;