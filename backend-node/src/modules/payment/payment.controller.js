import { paymentService } from "./payment.service.js";

export const paymentController = {
  async createPayosUrl(req, res) {
    try {
      const { planCode } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (!planCode) {
        return res.status(400).json({ message: "Thiếu planCode" });
      }

      const paymentUrl = await paymentService.createPayosPaymentUrl({
        planCode,
        userId,
      });

      return res.status(200).json({ paymentUrl });
    } catch (error) {
      console.error("Create PayOS URL Error:", error);
      return res.status(400).json({ message: error.message });
    }
  },

  async handlePayosReturn(req, res) {
    try {
      const result = await paymentService.processPayosReturn(req.query);

      const frontendResultUrl =
        process.env.FRONTEND_PAYMENT_RESULT_URL ||
        "http://localhost:5173/user/transactions";

      const redirectUrl = new URL(frontendResultUrl);
      redirectUrl.searchParams.set(
        "paymentStatus",
        result.success ? "success" : "failed",
      );
      redirectUrl.searchParams.set("txnRef", result.transactionCode || "");

      return res.redirect(redirectUrl.toString());
    } catch (error) {
      console.error("PayOS Return Error:", error);

      const frontendResultUrl =
        process.env.FRONTEND_PAYMENT_RESULT_URL ||
        "http://localhost:5173/user/transactions";
      const redirectUrl = new URL(frontendResultUrl);
      redirectUrl.searchParams.set("paymentStatus", "failed");
      redirectUrl.searchParams.set("message", error.message || "Payment error");

      return res.redirect(redirectUrl.toString());
    }
  },

  async handlePayosWebhook(req, res) {
    try {
      await paymentService.processPayosWebhook(req.body);
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error("PayOS Webhook Error:", error);
      return res.status(400).json({ success: false, message: error.message });
    }
  },

  async getUserTransactionHistory(req, res) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const transactions = await paymentService.getUserTransactionHistory(userId);

      return res.status(200).json({ transactions });
    } catch (error) {
      console.error("Get Transaction History Error:", error);
      return res.status(400).json({ message: error.message });
    }
  },

  async getCurrentSubscription(req, res) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const subscription = await paymentService.getCurrentSubscription(userId);
      return res.status(200).json({ subscription });
    } catch (error) {
      console.error("Get Current Subscription Error:", error);
      return res.status(400).json({ message: error.message });
    }
  },
};
