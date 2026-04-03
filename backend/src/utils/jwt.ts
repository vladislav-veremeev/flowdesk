import jwt from "jsonwebtoken";

export type AccessTokenPayload = {
    id: string;
    username: string;
};

export function signAccessToken(payload: AccessTokenPayload): string {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error("JWT_SECRET is not defined");
    }

    return jwt.sign(payload, secret, {
        expiresIn: process.env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error("JWT_SECRET is not defined");
    }

    return jwt.verify(token, secret) as AccessTokenPayload;
}