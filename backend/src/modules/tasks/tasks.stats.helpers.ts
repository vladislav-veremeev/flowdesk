export type BoardColumnKind = "todo" | "in_progress" | "done";

export type BoardColumnStatMeta = {
    id: string;
    position: number;
};

export function getColumnKind(
    columnPosition: number,
    totalColumns: number
): BoardColumnKind {
    if (columnPosition === 1) {
        return "todo";
    }

    if (columnPosition === totalColumns) {
        return "done";
    }

    return "in_progress";
}

export function getColumnKindById(
    columns: BoardColumnStatMeta[],
    columnId: string
): BoardColumnKind {
    if (columns.length < 2) {
        throw new Error("Для статистики на доске должно быть минимум 2 колонки");
    }

    const column = columns.find((item) => item.id === columnId);

    if (!column) {
        throw new Error("Колонка не найдена");
    }

    return getColumnKind(column.position, columns.length);
}