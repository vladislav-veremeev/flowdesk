import { pool } from "../../config/db";
import {
    Column,
    ColumnRow,
    CreateColumnBody,
    ReorderColumnsBody,
    UpdateColumnBody,
} from "./columns.types";
import { ensureBoardMember, ensureBoardOwner } from "../boards/boards.access";

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

export async function getColumnsByBoard(userId: string, boardId: string): Promise<Column[]> {
    await ensureBoardMember(boardId, userId);

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

    const columnResult = await pool.query<{ board_id: string }>(
        `SELECT board_id
         FROM board_columns
         WHERE id = $1`,
        [columnId]
    );

    const column = columnResult.rows[0];

    if (!column) {
        throw new Error("Колонка не найдена");
    }

    await ensureBoardOwner(column.board_id, userId);

    const result = await pool.query<ColumnRow>(
        `UPDATE board_columns
         SET title = $1, wip_limit = $2
         WHERE id = $3
             RETURNING id, title, position, wip_limit, board_id, created_at`,
        [title, data.wipLimit ?? null, columnId]
    );

    return mapColumn(result.rows[0]);
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
    const columnResult = await pool.query<{ board_id: string }>(
        `SELECT board_id
         FROM board_columns
         WHERE id = $1`,
        [columnId]
    );

    const column = columnResult.rows[0];

    if (!column) {
        throw new Error("Колонка не найдена");
    }

    await ensureBoardOwner(column.board_id, userId);

    const result = await pool.query(
        `DELETE FROM board_columns
         WHERE id = $1
         RETURNING id`,
        [columnId]
    );

    if (result.rows.length === 0) {
        throw new Error("Колонка не найдена");
    }
}