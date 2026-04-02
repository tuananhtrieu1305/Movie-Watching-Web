import express from "express";
import { authController } from "./auth.controller.js";
import { requireAuth } from "../../core/middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", authController.register);

router.post("/login", authController.login);

router.post("/google", authController.googleAuth);

router.post("/refresh-token", authController.refreshToken);

router.post("/logout", authController.logout);

router.put("/profile", requireAuth, authController.updateProfile);

export default router;
