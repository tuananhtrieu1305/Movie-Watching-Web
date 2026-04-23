import express from "express";
import { requireAuth } from "../../core/middleware/auth.middleware.js";
import { paymentController } from "./payment.controller.js";

const router = express.Router();

router.post("/payos/create-url", requireAuth, paymentController.createPayosUrl);
router.get("/payos/return", paymentController.handlePayosReturn);
router.post("/payos/webhook", paymentController.handlePayosWebhook);
router.get(
  "/history",
  requireAuth,
  paymentController.getUserTransactionHistory,
);
router.get(
  "/current-subscription",
  requireAuth,
  paymentController.getCurrentSubscription,
);

export default router;
