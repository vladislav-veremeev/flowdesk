import { pool } from "../../config/db";
import { BoardRow, CreateBoardBody, UpdateBoardBody, Board } from "./boards.types";

function mapBoard(row: BoardRow): Board {
    return {
        id: row.id,
        title: row.title,
        description: row.description,
        ownerId: row.owner_id,
        createdAt: row.created_at,
    };
}

export async function getBoardsByUser(userId: string): Promise<Board[]> {
    const result = await pool.query<BoardRow>(
        `SELECT id, title, description, owner_id, created_at
         FROM boards
         WHERE owner_id = $1
         ORDER BY created_at DESC`,
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

    const result = await pool.query<BoardRow>(
        `INSERT INTO boards (title, description, owner_id)
         VALUES ($1, $2, $3)
         RETURNING id, title, description, owner_id, created_at`,
        [title, description, userId]
    );

    return mapBoard(result.rows[0]);
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

    const result = await pool.query<BoardRow>(
        `UPDATE boards
         SET title = $1, description = $2
         WHERE id = $3 AND owner_id = $4
         RETURNING id, title, description, owner_id, created_at`,
        [title, description, boardId, userId]
    );

    const board = result.rows[0];

    if (!board) {
        throw new Error("Доска не найдена");
    }

    return mapBoard(board);
}

export async function deleteBoard(userId: string, boardId: string): Promise<void> {
    const result = await pool.query(
        `DELETE FROM boards
         WHERE id = $1 AND owner_id = $2
         RETURNING id`,
        [boardId, userId]
    );

    if (result.rows.length === 0) {
        throw new Error("Доска не найдена");
    }
}