import express from "express";
import cors from "cors";
import authRouter from "./modules/auth/auth.routes";

const app = express();

app.use(
    cors({
        origin: process.env.CLIENT_URL,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

app.use(express.json());

app.get("/health", (_req, res) => {
    res.status(200).json({ ok: true });
});

app.use("/auth", authRouter);

export default app;