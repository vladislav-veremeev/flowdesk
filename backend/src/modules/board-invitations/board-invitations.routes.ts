import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import {
    acceptBoardInvitationController,
    createBoardInvitationController,
    declineBoardInvitationController,
    deleteBoardInvitationController,
    getMyInvitationsController,
} from "./board-invitations.controller";

const router = Router();

router.use(authMiddleware);

router.post("/", createBoardInvitationController);
router.get("/my", getMyInvitationsController);
router.patch("/:id/accept", acceptBoardInvitationController);
router.patch("/:id/decline", declineBoardInvitationController);
router.delete("/:id", deleteBoardInvitationController);

export default router;