import express from "express";
import { getAnalyticsDashboardController } from "../controllers/analytics.controller.js";

const router = express.Router();

router.get("/dashboard", getAnalyticsDashboardController);

export default router;
