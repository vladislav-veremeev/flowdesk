import { pool } from "../../config/db";
import {
    CreateTaskBody,
    MoveTaskBody,
    Task,
    TaskRow,
    UpdateTaskBody,
} from "./tasks.types";
import { ensureBoardMember } from "../boards/boards.access";

function mapTask(row: TaskRow): Task {
    return {
        id: row.id,
        title: row.title,
        description: row.description,
        priority: row.priority,
        position: row.position,
        boardId: row.board_id,
        columnId: row.column_id,
        assigneeId: row.assignee_id,
        dueDate: row.due_date,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

async function ensureColumnBelongsToBoard(columnId: string, boardId: string) {
    const result = await pool.query(
        "SELECT id, wip_limit FROM board_columns WHERE id = $1 AND board_id = $2",
        [columnId, boardId]
    );

    if (result.rows.length === 0) {
        throw new Error("Колонка не найдена");
    }

    return result.rows[0];
}

async function checkWipLimit(columnId: string) {
    const columnResult = await pool.query<{ wip_limit: number | null }>(
        `SELECT wip_limit FROM board_columns WHERE id = $1`,
        [columnId]
    );

    const wipLimit = columnResult.rows[0]?.wip_limit;

    if (!wipLimit) {
        return;
    }

    const countResult = await pool.query<{ count: string }>(
        `SELECT COUNT(*)::text AS count FROM tasks WHERE column_id = $1`,
        [columnId]
    );

    const currentCount = Number(countResult.rows[0].count);

    if (currentCount >= wipLimit) {
        throw new Error("Превышен лимит задач колонки");
    }
}

async function ensureAssigneeIsBoardMember(
    boardId: string,
    assigneeId: string | null | undefined
) {
    if (!assigneeId) {
        return;
    }

    const result = await pool.query(
        `SELECT 1
         FROM board_members
         WHERE board_id = $1 AND user_id = $2`,
        [boardId, assigneeId]
    );

    if (result.rows.length === 0) {
        throw new Error("Исполнитель должен быть участником доски");
    }
}

export async function getTasksByBoard(userId: string, boardId: string): Promise<Task[]> {
    await ensureBoardMember(boardId, userId);

    const result = await pool.query<TaskRow>(
        `SELECT id, title, description, priority, position, board_id, column_id,
                assignee_id, due_date, created_at, updated_at
         FROM tasks
         WHERE board_id = $1
         ORDER BY column_id, position ASC`,
        [boardId]
    );

    return result.rows.map(mapTask);
}

export async function createTask(userId: string, data: CreateTaskBody): Promise<Task> {
    const title = data.title?.trim();

    if (!title) {
        throw new Error("Название задачи обязательно");
    }

    await ensureBoardMember(data.boardId, userId);
    await ensureColumnBelongsToBoard(data.columnId, data.boardId);
    await ensureAssigneeIsBoardMember(data.boardId, data.assigneeId);
    await checkWipLimit(data.columnId);

    const positionResult = await pool.query<{ next_position: number }>(
        `SELECT COALESCE(MAX(position), 0) + 1 AS next_position
         FROM tasks
         WHERE column_id = $1`,
        [data.columnId]
    );

    const position = positionResult.rows[0].next_position;

    const result = await pool.query<TaskRow>(
        `INSERT INTO tasks (
            title, description, priority, position, board_id, column_id, assignee_id, due_date
        )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING id, title, description, priority, position, board_id, column_id,
                   assignee_id, due_date, created_at, updated_at`,
        [
            title,
            data.description?.trim() || null,
            data.priority || "medium",
            position,
            data.boardId,
            data.columnId,
            data.assigneeId ?? null,
            data.dueDate ?? null,
        ]
    );

    return mapTask(result.rows[0]);
}

export async function updateTask(
    userId: string,
    taskId: string,
    data: UpdateTaskBody
): Promise<Task> {
    const title = data.title?.trim();

    if (!title) {
        throw new Error("Название задачи обязательно");
    }

    const taskResult = await pool.query<{ board_id: string }>(
        `SELECT board_id
         FROM tasks
         WHERE id = $1`,
        [taskId]
    );

    const task = taskResult.rows[0];

    if (!task) {
        throw new Error("Задача не найдена");
    }

    await ensureBoardMember(task.board_id, userId);
    await ensureAssigneeIsBoardMember(task.board_id, data.assigneeId);

    const result = await pool.query<TaskRow>(
        `UPDATE tasks
         SET title = $1,
             description = $2,
             priority = $3,
             assignee_id = $4,
             due_date = $5,
             updated_at = NOW()
         WHERE id = $6
         RETURNING id, title, description, priority, position, board_id, column_id,
                   assignee_id, due_date, created_at, updated_at`,
        [
            title,
            data.description?.trim() || null,
            data.priority || "medium",
            data.assigneeId ?? null,
            data.dueDate ?? null,
            taskId,
        ]
    );

    return mapTask(result.rows[0]);
}

export async function moveTask(
    userId: string,
    taskId: string,
    data: MoveTaskBody
): Promise<Task> {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const taskResult = await client.query<TaskRow>(
            `SELECT id, title, description, priority, position, board_id, column_id,
                    assignee_id, due_date, created_at, updated_at
             FROM tasks
             WHERE id = $1`,
            [taskId]
        );

        const task = taskResult.rows[0];

        if (!task) {
            throw new Error("Задача не найдена");
        }

        const memberResult = await client.query(
            `SELECT 1
             FROM board_members
             WHERE board_id = $1 AND user_id = $2`,
            [task.board_id, userId]
        );

        if (memberResult.rows.length === 0) {
            throw new Error("Доска не найдена или нет доступа");
        }

        await ensureColumnBelongsToBoard(data.targetColumnId, task.board_id);

        if (task.column_id !== data.targetColumnId) {
            await checkWipLimit(data.targetColumnId);
        }

        await client.query(
            `UPDATE tasks
             SET position = position - 1
             WHERE column_id = $1 AND position > $2`,
            [task.column_id, task.position]
        );

        await client.query(
            `UPDATE tasks
             SET position = position + 1
             WHERE column_id = $1 AND position >= $2`,
            [data.targetColumnId, data.targetPosition]
        );

        const updatedResult = await client.query<TaskRow>(
            `UPDATE tasks
             SET column_id = $1, position = $2, updated_at = NOW()
             WHERE id = $3
                 RETURNING id, title, description, priority, position, board_id, column_id,
                       assignee_id, due_date, created_at, updated_at`,
            [data.targetColumnId, data.targetPosition, taskId]
        );

        await client.query("COMMIT");

        return mapTask(updatedResult.rows[0]);
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

export async function deleteTask(userId: string, taskId: string): Promise<void> {
    const taskResult = await pool.query<{ board_id: string }>(
        `SELECT board_id
         FROM tasks
         WHERE id = $1`,
        [taskId]
    );

    const task = taskResult.rows[0];

    if (!task) {
        throw new Error("Задача не найдена");
    }

    await ensureBoardMember(task.board_id, userId);

    const result = await pool.query(
        `DELETE FROM tasks
         WHERE id = $1
         RETURNING id`,
        [taskId]
    );

    if (result.rows.length === 0) {
        throw new Error("Задача не найдена");
    }
}