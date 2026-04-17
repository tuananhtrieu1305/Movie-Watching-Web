import express from "express";
import meetingController from "./meeting.controller.js"; // Bắt buộc có đuôi .js

const meetingRoutes = express.Router();

// API tạo phòng họp mới (lấy meetingId)
meetingRoutes.post("/create", meetingController.createRoom);

// API tham gia phòng họp (lấy Auth Token cho user)
meetingRoutes.post("/:meetingId/join", meetingController.joinRoom);

export default meetingRoutes;
