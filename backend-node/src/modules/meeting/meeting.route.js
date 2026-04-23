import express from "express";
import meetingController from "./meeting.controller.js";
import { requireAuth } from "../../core/middleware/auth.middleware.js";

const meetingRoutes = express.Router();

// Phải đăng nhập mới được tạo/join phòng
meetingRoutes.post("/create", requireAuth, meetingController.createRoom);
meetingRoutes.post("/:meetingId/join", requireAuth, meetingController.joinRoom);

export default meetingRoutes;
