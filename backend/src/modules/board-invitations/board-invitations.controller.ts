import { Request, Response } from "express";
import {
    acceptBoardInvitation,
    createBoardInvitation,
    declineBoardInvitation,
    deleteBoardInvitation,
    getMyInvitations,
} from "./board-invitations.service";

export async function createBoardInvitationController(
    req: Request,
    res: Response
) {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: "Не авторизован" });
        }

        const invitation = await createBoardInvitation(userId, req.body);
        return res.status(201).json(invitation);
    } catch (error) {
        return res.status(400).json({
            message:
                error instanceof Error
                    ? error.message
                    : "Ошибка создания приглашения",
        });
    }
}

export async function getMyInvitationsController(
    req: Request,
    res: Response
) {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: "Не авторизован" });
        }

        const invitations = await getMyInvitations(userId);
        return res.status(200).json(invitations);
    } catch (error) {
        return res.status(400).json({
            message:
                error instanceof Error
                    ? error.message
                    : "Ошибка получения приглашений",
        });
    }
}

export async function acceptBoardInvitationController(
    req: Request,
    res: Response
) {
    try {
        const userId = req.user?.id;
        const invitationId = req.params.id as string;

        if (!userId) {
            return res.status(401).json({ message: "Не авторизован" });
        }

        const invitation = await acceptBoardInvitation(userId, invitationId);
        return res.status(200).json(invitation);
    } catch (error) {
        return res.status(400).json({
            message:
                error instanceof Error
                    ? error.message
                    : "Ошибка принятия приглашения",
        });
    }
}

export async function declineBoardInvitationController(
    req: Request,
    res: Response
) {
    try {
        const userId = req.user?.id;
        const invitationId = req.params.id as string;

        if (!userId) {
            return res.status(401).json({ message: "Не авторизован" });
        }

        const invitation = await declineBoardInvitation(userId, invitationId);
        return res.status(200).json(invitation);
    } catch (error) {
        return res.status(400).json({
            message:
                error instanceof Error
                    ? error.message
                    : "Ошибка отклонения приглашения",
        });
    }
}

export async function deleteBoardInvitationController(
    req: Request,
    res: Response
) {
    try {
        const userId = req.user?.id;
        const invitationId = req.params.id as string;

        if (!userId) {
            return res.status(401).json({ message: "Не авторизован" });
        }

        const result = await deleteBoardInvitation(userId, invitationId);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(400).json({
            message:
                error instanceof Error
                    ? error.message
                    : "Ошибка удаления приглашения",
        });
    }
}