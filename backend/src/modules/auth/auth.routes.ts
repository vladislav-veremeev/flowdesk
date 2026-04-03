import { Router } from "express";
import {
    deleteMeController,
    loginController,
    logoutController,
    meController,
    registerController,
    updateMeController,
} from "./auth.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const authRouter = Router();

authRouter.post("/register", registerController);
authRouter.post("/login", loginController);
authRouter.post("/logout", logoutController);

authRouter.get("/me", authMiddleware, meController);
authRouter.put("/me", authMiddleware, updateMeController);
authRouter.delete("/me", authMiddleware, deleteMeController);

export default authRouter;