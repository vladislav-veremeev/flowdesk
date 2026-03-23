import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import {
    createColumnController,
    deleteColumnController,
    getColumnsController,
    reorderColumnsController,
    updateColumnController,
} from "./columns.controller";

const router = Router();

router.use(authMiddleware);

router.get("/", getColumnsController);
router.post("/", createColumnController);
router.put("/:id", updateColumnController);
router.patch("/reorder/:boardId", reorderColumnsController);
router.delete("/:id", deleteColumnController);

export default router;