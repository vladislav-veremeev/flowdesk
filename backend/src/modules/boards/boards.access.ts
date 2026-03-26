import { pool } from "../../config/db";

export type BoardMemberRole = "owner" | "member";

export async function ensureBoardMember(
    boardId: string,
    userId: string
): Promise<{ boardId: string; userId: string; role: BoardMemberRole }> {
    const result = await pool.query<{
        board_id: string;
        user_id: string;
        role: BoardMemberRole;
    }>(
        `SELECT board_id, user_id, role
         FROM board_members
         WHERE board_id = $1 AND user_id = $2`,
        [boardId, userId]
    );

    const member = result.rows[0];

    if (!member) {
        throw new Error("Доска не найдена или нет доступа");
    }

    return {
        boardId: member.board_id,
        userId: member.user_id,
        role: member.role,
    };
}

export async function ensureBoardOwner(
    boardId: string,
    userId: string
): Promise<void> {
    const result = await pool.query(
        `SELECT 1
         FROM board_members
         WHERE board_id = $1 AND user_id = $2 AND role = 'owner'`,
        [boardId, userId]
    );

    if (result.rows.length === 0) {
        throw new Error("Недостаточно прав");
    }
}