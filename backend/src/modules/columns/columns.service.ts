import { pool } from "../../config/db";
import {
    Column,
    ColumnRow,
    CreateColumnBody,
    ReorderColumnsBody,
    UpdateColumnBody,
} from "./columns.types";

function mapColumn(row: ColumnRow): Column {
    return {
        id: row.id,
        title: row.title,
        position: row.position,
        wipLimit: row.wip_limit,
        boardId: row.board_id,
        createdAt: row.created_at,
    };
}

async function ensureBoardOwner(boardId: string, userId: string) {
    const result = await pool.query(
        "SELECT id FROM boards WHERE id = $1 AND owner_id = $2",
        [boardId, userId]
    );

    if (result.rows.length === 0) {
        throw new Error("Доска не найдена");
    }
}

export async function getColumnsByBoard(userId: string, boardId: string): Promise<Column[]> {
    await ensureBoardOwner(boardId, userId);

    const result = await pool.query<ColumnRow>(
        `SELECT id, title, position, wip_limit, board_id, created_at
         FROM board_columns
         WHERE board_id = $1
         ORDER BY position ASC`,
        [boardId]
    );

    return result.rows.map(mapColumn);
}

export async function createColumn(userId: string, data: CreateColumnBody): Promise<Column> {
    const title = data.title?.trim();

    if (!title) {
        throw new Error("Название колонки обязательно");
    }

    await ensureBoardOwner(data.boardId, userId);

    const positionResult = await pool.query<{ next_position: number }>(
        `SELECT COALESCE(MAX(position), 0) + 1 AS next_position
         FROM board_columns
         WHERE board_id = $1`,
        [data.boardId]
    );

    const position = positionResult.rows[0].next_position;

    const result = await pool.query<ColumnRow>(
        `INSERT INTO board_columns (title, position, wip_limit, board_id)
         VALUES ($1, $2, $3, $4)
         RETURNING id, title, position, wip_limit, board_id, created_at`,
        [title, position, data.wipLimit ?? null, data.boardId]
    );

    return mapColumn(result.rows[0]);
}

export async function updateColumn(
    userId: string,
    columnId: string,
    data: UpdateColumnBody
): Promise<Column> {
    const title = data.title?.trim();

    if (!title) {
        throw new Error("Название колонки обязательно");
    }

    const result = await pool.query<ColumnRow>(
        `UPDATE board_columns bc
         SET title = $1, wip_limit = $2
         FROM boards b
         WHERE bc.id = $3
           AND bc.board_id = b.id
           AND b.owner_id = $4
         RETURNING bc.id, bc.title, bc.position, bc.wip_limit, bc.board_id, bc.created_at`,
        [title, data.wipLimit ?? null, columnId, userId]
    );

    const column = result.rows[0];

    if (!column) {
        throw new Error("Колонка не найдена");
    }

    return mapColumn(column);
}

export async function reorderColumns(
    userId: string,
    boardId: string,
    data: ReorderColumnsBody
): Promise<void> {
    await ensureBoardOwner(boardId, userId);

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        for (let index = 0; index < data.orderedIds.length; index++) {
            await client.query(
                `UPDATE board_columns
                 SET position = $1
                 WHERE id = $2 AND board_id = $3`,
                [index + 1, data.orderedIds[index], boardId]
            );
        }

        await client.query("COMMIT");
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

export async function deleteColumn(userId: string, columnId: string): Promise<void> {
    const result = await pool.query(
        `DELETE FROM board_columns bc
         USING boards b
         WHERE bc.id = $1
           AND bc.board_id = b.id
           AND b.owner_id = $2
         RETURNING bc.id`,
        [columnId, userId]
    );

    if (result.rows.length === 0) {
        throw new Error("Колонка не найдена");
    }
}