import { pool } from "../../config/db";
import {
    BoardRow,
    CreateBoardBody,
    UpdateBoardBody,
    Board,
    BoardMember,
    BoardMemberRow,
} from "./boards.types";
import { ensureBoardMember, ensureBoardOwner } from "./boards.access";

function mapBoard(row: BoardRow): Board {
    return {
        id: row.id,
        title: row.title,
        description: row.description,
        ownerId: row.owner_id,
        createdAt: row.created_at,
    };
}

export async function getBoardById(userId: string, boardId: string): Promise<Board> {
    await ensureBoardMember(boardId, userId);

    const result = await pool.query<BoardRow>(
        `SELECT id, title, description, owner_id, created_at
         FROM boards
         WHERE id = $1`,
        [boardId]
    );

    const board = result.rows[0];

    if (!board) {
        throw new Error("Доска не найдена");
    }

    return mapBoard(board);
}

function mapBoardMember(row: BoardMemberRow): BoardMember {
    return {
        userId: row.user_id,
        username: row.username,
        role: row.role,
        joinedAt: row.joined_at,
    };
}

export async function leaveBoard(userId: string, boardId: string): Promise<void> {
    const membership = await ensureBoardMember(boardId, userId);

    if (membership.role === "owner") {
        throw new Error("Владелец доски не может выйти из нее");
    }

    const result = await pool.query(
        `DELETE FROM board_members
         WHERE board_id = $1 AND user_id = $2
             RETURNING user_id`,
        [boardId, userId]
    );

    if (result.rows.length === 0) {
        throw new Error("Вы не являетесь участником этой доски");
    }

    await pool.query(
        `UPDATE tasks
         SET assignee_id = NULL,
             updated_at = NOW()
         WHERE board_id = $1 AND assignee_id = $2`,
        [boardId, userId]
    );

    await pool.query(
        `DELETE FROM board_invitations
         WHERE board_id = $1 AND invitee_id = $2`,
        [boardId, userId]
    );
}

export async function getBoardsByUser(userId: string): Promise<Board[]> {
    const result = await pool.query<BoardRow>(
        `SELECT DISTINCT b.id, b.title, b.description, b.owner_id, b.created_at
         FROM boards b
                  JOIN board_members bm ON bm.board_id = b.id
         WHERE bm.user_id = $1
         ORDER BY b.created_at DESC`,
        [userId]
    );

    return result.rows.map(mapBoard);
}

export async function createBoard(userId: string, data: CreateBoardBody): Promise<Board> {
    const title = data.title?.trim();
    const description = data.description?.trim() || null;

    if (!title) {
        throw new Error("Название доски обязательно");
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const result = await client.query<BoardRow>(
            `INSERT INTO boards (title, description, owner_id)
             VALUES ($1, $2, $3)
                 RETURNING id, title, description, owner_id, created_at`,
            [title, description, userId]
        );

        const board = result.rows[0];

        await client.query(
            `INSERT INTO board_members (board_id, user_id, role)
             VALUES ($1, $2, 'owner')
                 ON CONFLICT (board_id, user_id) DO NOTHING`,
            [board.id, userId]
        );

        await client.query("COMMIT");

        return mapBoard(board);
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

export async function updateBoard(
    userId: string,
    boardId: string,
    data: UpdateBoardBody
): Promise<Board> {
    const title = data.title?.trim();
    const description = data.description?.trim() || null;

    if (!title) {
        throw new Error("Название доски обязательно");
    }

    await ensureBoardOwner(boardId, userId);

    const result = await pool.query<BoardRow>(
        `UPDATE boards
         SET title = $1, description = $2
         WHERE id = $3
             RETURNING id, title, description, owner_id, created_at`,
        [title, description, boardId]
    );

    const board = result.rows[0];

    if (!board) {
        throw new Error("Доска не найдена");
    }

    return mapBoard(board);
}

export async function deleteBoard(userId: string, boardId: string): Promise<void> {
    await ensureBoardOwner(boardId, userId);

    const result = await pool.query(
        `DELETE FROM boards
         WHERE id = $1
             RETURNING id`,
        [boardId]
    );

    if (result.rows.length === 0) {
        throw new Error("Доска не найдена");
    }
}

export async function getBoardMembers(
    userId: string,
    boardId: string
): Promise<BoardMember[]> {
    await ensureBoardMember(boardId, userId);

    const result = await pool.query<BoardMemberRow>(
        `SELECT
             u.id AS user_id,
             u.username,
             bm.role,
             bm.created_at AS joined_at
         FROM board_members bm
                  JOIN users u ON u.id = bm.user_id
         WHERE bm.board_id = $1
         ORDER BY
             CASE WHEN bm.role = 'owner' THEN 0 ELSE 1 END,
             bm.created_at ASC`,
        [boardId]
    );

    return result.rows.map(mapBoardMember);
}

export async function removeBoardMember(
    ownerUserId: string,
    boardId: string,
    memberUserId: string
): Promise<void> {
    await ensureBoardOwner(boardId, ownerUserId);

    const boardResult = await pool.query<{ owner_id: string }>(
        `SELECT owner_id
         FROM boards
         WHERE id = $1`,
        [boardId]
    );

    const board = boardResult.rows[0];

    if (!board) {
        throw new Error("Доска не найдена");
    }

    if (board.owner_id === memberUserId) {
        throw new Error("Нельзя удалить владельца доски");
    }

    const result = await pool.query(
        `DELETE FROM board_members
         WHERE board_id = $1 AND user_id = $2
             RETURNING user_id`,
        [boardId, memberUserId]
    );

    if (result.rows.length === 0) {
        throw new Error("Участник не найден");
    }

    await pool.query(
        `DELETE FROM board_invitations
         WHERE board_id = $1 AND invitee_id = $2`,
        [boardId, memberUserId]
    );

    await pool.query(
        `UPDATE tasks
         SET assignee_id = NULL,
             updated_at = NOW()
         WHERE board_id = $1 AND assignee_id = $2`,
        [boardId, memberUserId]
    );
}