import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../utils/jwt";

export function authMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const authorizationHeader = req.headers.authorization;

        if (!authorizationHeader) {
            return res.status(401).json({ message: "Токен не передан" });
        }

        const [type, token] = authorizationHeader.split(" ");

        if (type !== "Bearer" || !token) {
            return res.status(401).json({ message: "Некорректный формат токена" });
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