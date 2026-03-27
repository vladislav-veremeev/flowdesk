import { pool } from "../../config/db";
import { ensureBoardOwner } from "../boards/boards.access";
import {
    BoardInvitation,
    BoardInvitationRow,
    CreateBoardInvitationBody,
    IncomingBoardInvitation,
    IncomingBoardInvitationRow,
} from "./board-invitations.types";

function mapInvitation(row: BoardInvitationRow): BoardInvitation {
    return {
        id: row.id,
        boardId: row.board_id,
        inviterId: row.inviter_id,
        inviteeId: row.invitee_id,
        status: row.status,
        createdAt: row.created_at,
        respondedAt: row.responded_at,
    };
}

function mapIncomingInvitation(
    row: IncomingBoardInvitationRow
): IncomingBoardInvitation {
    return {
        id: row.id,
        boardId: row.board_id,
        boardTitle: row.board_title,
        inviterId: row.inviter_id,
        inviterUsername: row.inviter_username,
        inviteeId: row.invitee_id,
        status: row.status,
        createdAt: row.created_at,
        respondedAt: row.responded_at,
    };
}

export async function createBoardInvitation(
    userId: string,
    data: CreateBoardInvitationBody
): Promise<BoardInvitation> {
    const boardId = data.boardId?.trim();
    const inviteeUsername = data.inviteeUsername?.trim();

    if (!boardId) {
        throw new Error("boardId обязателен");
    }

    if (!inviteeUsername) {
        throw new Error("Username приглашенного обязателен");
    }

    await ensureBoardOwner(boardId, userId);

    const inviteeResult = await pool.query<{ id: string; username: string }>(
        `SELECT id, username
         FROM users
         WHERE username = $1`,
        [inviteeUsername]
    );

    const invitee = inviteeResult.rows[0];

    if (!invitee) {
        throw new Error("Пользователь с таким username не найден");
    }

    if (invitee.id === userId) {
        throw new Error("Нельзя пригласить самого себя");
    }

    const memberCheck = await pool.query(
        `SELECT 1
         FROM board_members
         WHERE board_id = $1 AND user_id = $2`,
        [boardId, invitee.id]
    );

    if (memberCheck.rows.length > 0) {
        throw new Error("Этот пользователь уже является участником доски");
    }

    const result = await pool.query<BoardInvitationRow>(
        `INSERT INTO board_invitations (
            board_id,
            inviter_id,
            invitee_id,
            status,
            created_at,
            responded_at
        )
         VALUES ($1, $2, $3, 'pending', NOW(), NULL)
             ON CONFLICT (board_id, invitee_id)
         DO UPDATE SET
            inviter_id = EXCLUDED.inviter_id,
                             status = 'pending',
                             created_at = NOW(),
                             responded_at = NULL
                             RETURNING id, board_id, inviter_id, invitee_id, status, created_at, responded_at`,
        [boardId, userId, invitee.id]
    );

    return mapInvitation(result.rows[0]);
}

export async function getMyInvitations(
    userId: string
): Promise<IncomingBoardInvitation[]> {
    const result = await pool.query<IncomingBoardInvitationRow>(
        `SELECT
             bi.id,
             bi.board_id,
             bi.inviter_id,
             bi.invitee_id,
             bi.status,
             bi.created_at,
             bi.responded_at,
             b.title AS board_title,
             u.username AS inviter_username
         FROM board_invitations bi
                  JOIN boards b ON b.id = bi.board_id
                  JOIN users u ON u.id = bi.inviter_id
         WHERE bi.invitee_id = $1
         ORDER BY bi.created_at DESC`,
        [userId]
    );

    return result.rows.map(mapIncomingInvitation);
}

export async function acceptBoardInvitation(
    userId: string,
    invitationId: string
): Promise<BoardInvitation> {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const invitationResult = await client.query<BoardInvitationRow>(
            `SELECT id, board_id, inviter_id, invitee_id, status, created_at, responded_at
             FROM board_invitations
             WHERE id = $1`,
            [invitationId]
        );

        const invitation = invitationResult.rows[0];

        if (!invitation) {
            throw new Error("Приглашение не найдено");
        }

        if (invitation.invitee_id !== userId) {
            throw new Error("Нет доступа к этому приглашению");
        }

        if (invitation.status !== "pending") {
            throw new Error("Это приглашение уже обработано");
        }

        const memberCheck = await client.query(
            `SELECT 1
             FROM board_members
             WHERE board_id = $1 AND user_id = $2`,
            [invitation.board_id, userId]
        );

        if (memberCheck.rows.length === 0) {
            await client.query(
                `INSERT INTO board_members (board_id, user_id, role)
                 VALUES ($1, $2, 'member')
                     ON CONFLICT (board_id, user_id) DO NOTHING`,
                [invitation.board_id, userId]
            );
        }

        const updatedResult = await client.query<BoardInvitationRow>(
            `UPDATE board_invitations
             SET status = 'accepted',
                 responded_at = NOW()
             WHERE id = $1
                 RETURNING id, board_id, inviter_id, invitee_id, status, created_at, responded_at`,
            [invitationId]
        );

        await client.query("COMMIT");

        return mapInvitation(updatedResult.rows[0]);
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

export async function declineBoardInvitation(
    userId: string,
    invitationId: string
): Promise<BoardInvitation> {
    const result = await pool.query<BoardInvitationRow>(
        `UPDATE board_invitations
         SET status = 'declined',
             responded_at = NOW()
         WHERE id = $1
           AND invitee_id = $2
           AND status = 'pending'
             RETURNING id, board_id, inviter_id, invitee_id, status, created_at, responded_at`,
        [invitationId, userId]
    );

    const invitation = result.rows[0];

    if (!invitation) {
        throw new Error("Приглашение не найдено или уже обработано");
    }

    return mapInvitation(invitation);
}

export async function deleteBoardInvitation(
    userId: string,
    invitationId: string
): Promise<{ message: string }> {
    const invitationResult = await pool.query<BoardInvitationRow>(
        `SELECT id, board_id, inviter_id, invitee_id, status, created_at, responded_at
         FROM board_invitations
         WHERE id = $1`,
        [invitationId]
    );

    const invitation = invitationResult.rows[0];

    if (!invitation) {
        throw new Error("Приглашение не найдено");
    }

    if (invitation.invitee_id !== userId) {
        throw new Error("Нет доступа к этому приглашению");
    }

    if (invitation.status === "pending") {
        throw new Error("Нельзя удалить приглашение, пока оно ожидает ответа");
    }

    await pool.query(
        `DELETE FROM board_invitations
         WHERE id = $1`,
        [invitationId]
    );

    return { message: "Приглашение удалено" };
}
