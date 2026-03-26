import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import {
    createBoardController,
    deleteBoardController, getBoardByIdController,
    getBoardMembersController,
    getBoardsController, leaveBoardController,
    removeBoardMemberController,
    updateBoardController,
} from "./boards.controller";

const router = Router();

router.use(authMiddleware);

router.get("/", getBoardsController);
router.post("/", createBoardController);

router.get("/:id", getBoardByIdController);
router.put("/:id", updateBoardController);
router.delete("/:id", deleteBoardController);

router.get("/:boardId/members", getBoardMembersController);
router.delete("/:boardId/members/:memberUserId", removeBoardMemberController);
router.delete("/:boardId/leave", leaveBoardController);

export default router;