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

function validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password: string): boolean {
    return password.length >= 6;
}

export async function registerUser(data: RegisterBody) {
    const username = data.username.trim();
    const email = data.email.trim().toLowerCase();
    const password = data.password;

    if (!validateUsername(username)) {
        throw new Error("Username должен быть не короче 3 символов");
    }

    if (!validateEmail(email)) {
        throw new Error("Некорректный email");
    }

    if (!validatePassword(password)) {
        throw new Error("Пароль должен быть не короче 6 символов");
    }

    const existingByUsername = await pool.query<UserRow>(
        "SELECT id, username, email, password_hash FROM users WHERE username = $1",
        [username]
    );

    if (existingByUsername.rows.length > 0) {
        throw new Error("Пользователь с таким username уже существует");
    }

    const existingByEmail = await pool.query<UserRow>(
        "SELECT id, username, email, password_hash FROM users WHERE email = $1",
        [email]
    );

    if (existingByEmail.rows.length > 0) {
        throw new Error("Пользователь с таким email уже существует");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const createdUserResult = await pool.query<UserRow>(
        `
            INSERT INTO users (username, email, password_hash)
            VALUES ($1, $2, $3)
                RETURNING id, username, email, password_hash
        `,
        [username, email, passwordHash]
    );

    const user = createdUserResult.rows[0];

    const token = signAccessToken({
        id: user.id,
        username: user.username,
        email: user.email,
    });

    return {
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
        } satisfies SafeUser,
        token,
    };
}

export async function loginUser(data: LoginBody) {
    const email = data.email.trim().toLowerCase();
    const password = data.password;

    const userResult = await pool.query<UserRow>(
        "SELECT id, username, email, password_hash FROM users WHERE email = $1",
        [email]
    );

    const user = userResult.rows[0];

    if (!user) {
        throw new Error("Неверный email или пароль");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
        throw new Error("Неверный email или пароль");
    }

    const token = signAccessToken({
        id: user.id,
        username: user.username,
        email: user.email,
    });

    return {
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
        } satisfies SafeUser,
        token,
    };
}

export async function getCurrentUser(userId: string): Promise<SafeUser | null> {
    const result = await pool.query<SafeUser>(
        "SELECT id, username, email FROM users WHERE id = $1",
        [userId]
    );

    return result.rows[0] || null;
}

export async function updateCurrentUser(
    userId: string,
    data: UpdateProfileBody
): Promise<SafeUser> {
    const username = data.username.trim();
    const email = data.email.trim().toLowerCase();
    const currentPassword = data.currentPassword?.trim();
    const newPassword = data.newPassword?.trim();

    if (!validateUsername(username)) {
        throw new Error("Username должен быть не короче 3 символов");
    }

    if (!validateEmail(email)) {
        throw new Error("Некорректный email");
    }

    const currentUserResult = await pool.query<UserRow>(
        "SELECT id, username, email, password_hash FROM users WHERE id = $1",
        [userId]
    );

    const currentUser = currentUserResult.rows[0];

    if (!currentUser) {
        throw new Error("Пользователь не найден");
    }

    const existingByUsername = await pool.query<SafeUser>(
        "SELECT id, username, email FROM users WHERE username = $1 AND id <> $2",
        [username, userId]
    );

    if (existingByUsername.rows.length > 0) {
        throw new Error("Пользователь с таким username уже существует");
    }

    const existingByEmail = await pool.query<SafeUser>(
        "SELECT id, username, email FROM users WHERE email = $1 AND id <> $2",
        [email, userId]
    );

    if (existingByEmail.rows.length > 0) {
        throw new Error("Пользователь с таким email уже существует");
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

    const updatedUserResult = await pool.query<SafeUser>(
        `
            UPDATE users
            SET username = $1, email = $2, password_hash = $3
            WHERE id = $4
                RETURNING id, username, email
        `,
        [username, email, passwordHash, userId]
    );

    const updatedUser = updatedUserResult.rows[0];

    if (!updatedUser) {
        throw new Error("Не удалось обновить пользователя");
    }

    return updatedUser;
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