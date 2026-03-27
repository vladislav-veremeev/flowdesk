import bcrypt from "bcrypt";
import { pool } from "../../config/db";
import { signAccessToken } from "../../utils/jwt";
import {
    LoginBody,
    RegisterBody,
    SafeUser,
    UpdateProfileBody,
    UserRow,
} from "./auth.types";

function validateUsername(username: string): boolean {
    return username.trim().length >= 3;
}

function validatePassword(password: string): boolean {
    return password.length >= 6;
}

function toSafeUser(user: Pick<UserRow, "id" | "username" | "created_at">): SafeUser {
    return {
        id: user.id,
        username: user.username,
        createdAt: user.created_at,
    };
}

export async function registerUser(data: RegisterBody) {
    const username = data.username.trim();
    const password = data.password;

    if (!validateUsername(username)) {
        throw new Error("Username должен быть не короче 3 символов");
    }

    if (!validatePassword(password)) {
        throw new Error("Пароль должен быть не короче 6 символов");
    }

    const existingByUsername = await pool.query<UserRow>(
        "SELECT id, username, password_hash, created_at FROM users WHERE username = $1",
        [username]
    );

    if (existingByUsername.rows.length > 0) {
        throw new Error("Пользователь с таким username уже существует");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const createdUserResult = await pool.query<UserRow>(
        `
            INSERT INTO users (username, password_hash)
            VALUES ($1, $2)
            RETURNING id, username, password_hash, created_at
        `,
        [username, passwordHash]
    );

    const user = createdUserResult.rows[0];

    const token = signAccessToken({
        id: user.id,
        username: user.username,
    });

    return {
        user: toSafeUser(user),
        token,
    };
}

export async function loginUser(data: LoginBody) {
    const username = data.username.trim();
    const password = data.password;

    const userResult = await pool.query<UserRow>(
        "SELECT id, username, password_hash, created_at FROM users WHERE username = $1",
        [username]
    );

    const user = userResult.rows[0];

    if (!user) {
        throw new Error("Неверный username или пароль");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
        throw new Error("Неверный username или пароль");
    }

    const token = signAccessToken({
        id: user.id,
        username: user.username,
    });

    return {
        user: toSafeUser(user),
        token,
    };
}

export async function getCurrentUser(userId: string): Promise<SafeUser | null> {
    const result = await pool.query<UserRow>(
        "SELECT id, username, password_hash, created_at FROM users WHERE id = $1",
        [userId]
    );

    const user = result.rows[0];

    return user ? toSafeUser(user) : null;
}

export async function updateCurrentUser(
    userId: string,
    data: UpdateProfileBody
): Promise<SafeUser> {
    const username = data.username.trim();
    const currentPassword = data.currentPassword?.trim();
    const newPassword = data.newPassword?.trim();

    if (!validateUsername(username)) {
        throw new Error("Username должен быть не короче 3 символов");
    }

    const currentUserResult = await pool.query<UserRow>(
        "SELECT id, username, password_hash, created_at FROM users WHERE id = $1",
        [userId]
    );

    const currentUser = currentUserResult.rows[0];

    if (!currentUser) {
        throw new Error("Пользователь не найден");
    }

    const existingByUsername = await pool.query<UserRow>(
        "SELECT id, username, password_hash, created_at FROM users WHERE username = $1 AND id <> $2",
        [username, userId]
    );

    if (existingByUsername.rows.length > 0) {
        throw new Error("Пользователь с таким username уже существует");
    }

    let passwordHash = currentUser.password_hash;

    if (newPassword) {
        if (!currentPassword) {
            throw new Error("Введите текущий пароль");
        }

        if (!validatePassword(newPassword)) {
            throw new Error("Новый пароль должен быть не короче 6 символов");
        }

        const isCurrentPasswordValid = await bcrypt.compare(
            currentPassword,
            currentUser.password_hash
        );

        if (!isCurrentPasswordValid) {
            throw new Error("Текущий пароль неверный");
        }

        passwordHash = await bcrypt.hash(newPassword, 10);
    }

    const updatedUserResult = await pool.query<UserRow>(
        `
            UPDATE users
            SET username = $1, password_hash = $2
            WHERE id = $3
            RETURNING id, username, password_hash, created_at
        `,
        [username, passwordHash, userId]
    );

    const updatedUser = updatedUserResult.rows[0];

    if (!updatedUser) {
        throw new Error("Не удалось обновить пользователя");
    }

    return toSafeUser(updatedUser);
}

export async function deleteCurrentUser(userId: string): Promise<void> {
    const result = await pool.query(
        "DELETE FROM users WHERE id = $1 RETURNING id",
        [userId]
    );

    if (result.rows.length === 0) {
        throw new Error("Пользователь не найден");
    }
}
