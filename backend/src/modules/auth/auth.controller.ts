import { Request, Response } from "express";
import {
    deleteCurrentUser,
    getCurrentUser,
    loginUser,
    registerUser,
    updateCurrentUser,
} from "./auth.service";

function getAuthCookieOptions() {
    const isProduction = process.env.NODE_ENV === "production";

    return {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax" as const,
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    };
}

function clearAuthCookie(res: Response) {
    const isProduction = process.env.NODE_ENV === "production";

    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        path: "/",
    });
}

export async function registerController(req: Request, res: Response) {
    try {
        const result = await registerUser(req.body);

        res.cookie("accessToken", result.token, getAuthCookieOptions());

        return res.status(201).json({
            user: result.user,
        });
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Ошибка регистрации";

        return res.status(400).json({ message });
    }
}

export async function loginController(req: Request, res: Response) {
    try {
        const result = await loginUser(req.body);

        res.cookie("accessToken", result.token, getAuthCookieOptions());

        return res.status(200).json({
            user: result.user,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Ошибка входа";

        return res.status(401).json({ message });
    }
}

export async function logoutController(_req: Request, res: Response) {
    clearAuthCookie(res);

    return res.status(200).json({ message: "Вы вышли из системы" });
}

export async function meController(req: Request, res: Response) {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: "Не авторизован" });
        }

        const user = await getCurrentUser(userId);

        if (!user) {
            return res.status(404).json({ message: "Пользователь не найден" });
        }

        return res.status(200).json(user);
    } catch {
        return res.status(500).json({ message: "Внутренняя ошибка сервера" });
    }
}

export async function updateMeController(req: Request, res: Response) {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: "Не авторизован" });
        }

        const updatedUser = await updateCurrentUser(userId, req.body);

        return res.status(200).json(updatedUser);
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Ошибка обновления профиля";

        return res.status(400).json({ message });
    }
}

export async function deleteMeController(req: Request, res: Response) {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: "Не авторизован" });
        }

        await deleteCurrentUser(userId);
        clearAuthCookie(res);

        return res.status(200).json({ message: "Аккаунт удалён" });
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Ошибка удаления аккаунта";

        return res.status(400).json({ message });
    }
}