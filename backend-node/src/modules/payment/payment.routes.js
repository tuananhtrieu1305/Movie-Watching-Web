import express from "express";
import { requireAuth } from "../../core/middleware/auth.middleware.js";
import { paymentController } from "./payment.controller.js";

const router = express.Router();

router.post("/vnpay/create-url", requireAuth, paymentController.createVnpayUrl);
router.get("/vnpay/return", paymentController.handleVnpayReturn);
router.get("/history", requireAuth, paymentController.getUserTransactionHistory);
router.get(
  "/current-subscription",
  requireAuth,
  paymentController.getCurrentSubscription,
);

export default router;
