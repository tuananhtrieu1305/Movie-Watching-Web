import { Router } from "express";
import { historyController } from "./history.controller.js";
import { requireAuth } from "../../core/middleware/auth.middleware.js";

const router = Router();

router.get("/", requireAuth, historyController.getMyHistory);
router.post("/", requireAuth, historyController.updateHistory);

export default router;
