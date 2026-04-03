import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../utils/jwt";

export function authMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const token = req.cookies?.accessToken;

        if (!token) {
            return res.status(401).json({ message: "Токен не передан" });
        }

        const payload = verifyAccessToken(token);

        req.user = payload;

        next();
    } catch {
        return res
            .status(401)
            .json({ message: "Недействительный или просроченный токен" });
    }
}