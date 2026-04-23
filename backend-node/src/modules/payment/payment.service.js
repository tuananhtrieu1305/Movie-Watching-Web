import PayOS from "@payos/node";
import prisma from "../../core/database/prisma.js";

const createPayosClient = () => {
  const clientId = process.env.PAYOS_CLIENT_ID;
  const apiKey = process.env.PAYOS_API_KEY;
  const checksumKey = process.env.PAYOS_CHECKSUM_KEY;
  if (!clientId || !apiKey || !checksumKey) {
    throw new Error("Thiếu cấu hình PayOS trên server");
  }
  return new PayOS(clientId, apiKey, checksumKey);
};

const normalizeGatewayStatus = (status) => {
  if (!status) return "failed";
  const normalized = String(status).toUpperCase();

  if (["PAID", "SUCCESS", "SUCCEEDED"].includes(normalized)) {
    return "success";
  }

  if (["PENDING", "PROCESSING"].includes(normalized)) {
    return "pending";
  }
  if (["CANCELLED", "CANCELED"].includes(normalized)) {
    return "cancelled";
  }

  return "failed";
};

const applySuccessfulPayment = async ({ tx, transaction, gatewayPayload }) => {
  const now = new Date();
  const latestSubscription = await tx.user_subscriptions.findFirst({
    where: {
      user_id: transaction.user_id,
      status: "active",
      end_date: { gte: now },
    },
    orderBy: { end_date: "desc" },
  });

  const startDate =
    latestSubscription?.end_date && latestSubscription.end_date > now
      ? latestSubscription.end_date
      : now;

  const endDate = new Date(startDate);
  endDate.setDate(
    endDate.getDate() + Number(transaction.subscription_plans.duration_days),
  );

  await tx.transactions.update({
    where: { id: transaction.id },
    data: {
      status: "success",
      vip_start_date: startDate,
      vip_end_date: endDate,
      payment_gateway_response: JSON.stringify(gatewayPayload),
    },
  });

  await tx.user_subscriptions.create({
    data: {
      user_id: transaction.user_id,
      plan_id: transaction.plan_id,
      transaction_id: transaction.id,
      start_date: startDate,
      end_date: endDate,
      status: "active",
      auto_renew: false,
    },
  });

  await tx.users.update({
    where: { id: transaction.user_id },
    data: {
      vip_expires_at: endDate,
    },
  });
};

export const paymentService = {
  async createPayosPaymentUrl({ planCode, userId }) {
    const normalizedPlanCode = planCode?.toLowerCase();
    const plan = await prisma.subscription_plans.findFirst({
      where: {
        code: normalizedPlanCode,
        is_active: true,
      },
    });

    if (!plan) {
      throw new Error("Plan không hợp lệ");
    }

    const amount = Number(plan.discount_price ?? plan.price);
    if (!Number.isFinite(amount)) {
      throw new Error("Giá gói không hợp lệ");
    }

    const returnUrl =
      process.env.PAYOS_RETURN_URL ||
      `${backendBaseUrl}/api/v1/payments/payos/return`;
    const cancelUrl = process.env.PAYOS_CANCEL_URL || returnUrl;

    const payos = createPayosClient();

    const orderCode = Date.now() * 100 + Math.floor(Math.random() * 100);
    const txnRef = `payos-${orderCode}`;
    const description = `Thanh toan ${normalizedPlanCode}`.slice(0, 25);

    await prisma.transactions.create({
      data: {
        transaction_code: txnRef,
        user_id: userId,
        plan_id: plan.id,
        amount,
        discount_amount: 0,
        final_amount: amount,
        status: "pending",
        payment_method: "vnpay",
      },
    });

    const paymentLink = await payos.createPaymentLink({
      orderCode,
      amount: Math.round(amount),
      description,
      returnUrl,
      cancelUrl,
      items: [
        {
          name: plan.name,
          quantity: 1,
          price: Math.round(amount),
        },
      ],
      buyerName: `user_${userId}`,
    });

    return paymentLink.checkoutUrl;
  },

  async processPayosPayment({ orderCode, gatewayPayload }) {
    const numericOrderCode = Number(orderCode);
    if (!Number.isFinite(numericOrderCode)) {
      throw new Error("Mã đơn thanh toán không hợp lệ");
    }

    const transactionCode = `payos-${numericOrderCode}`;
    const transaction = await prisma.transactions.findUnique({
      where: { transaction_code: transactionCode },
      include: {
        subscription_plans: true,
      },
    });

    if (!transaction) {
      throw new Error("Không tìm thấy giao dịch");
    }

    if (transaction.status === "success") {
      return {
        success: true,
        transactionCode,
        alreadyProcessed: true,
      };
    }

    const status = normalizeGatewayStatus(gatewayPayload?.status);

    if (status !== "success") {
      const failedStatus = status === "cancelled" ? "cancelled" : "failed";
      await prisma.transactions.update({
        where: { id: transaction.id },
        data: {
          status: failedStatus,
          payment_gateway_response: JSON.stringify(gatewayPayload),
        },
      });

      return {
        success: false,
        transactionCode,
      };
    }

    await prisma.$transaction(async (tx) => {
      await applySuccessfulPayment({
        tx,
        transaction,
        gatewayPayload,
      });
    });

    return {
      success: true,
      transactionCode,
      alreadyProcessed: false,
    };
  },

  async processPayosReturn(queryParams) {
    const payos = createPayosClient();
    const orderCode = Number(queryParams.orderCode);

    if (!Number.isFinite(orderCode)) {
      throw new Error("Thiếu orderCode từ PayOS");
    }

    const paymentInfo = await payos.getPaymentLinkInformation(orderCode);
    return this.processPayosPayment({
      orderCode,
      gatewayPayload: {
        source: "payos-return",
        query: queryParams,
        info: paymentInfo,
        status: paymentInfo?.status,
      },
    });
  },

  async processPayosWebhook(payload) {
    const payos = createPayosClient();
    const webhookData = payos.verifyPaymentWebhookData(payload);

    return this.processPayosPayment({
      orderCode: webhookData.orderCode,
      gatewayPayload: {
        source: "payos-webhook",
        data: webhookData,
        status: webhookData?.status,
      },
    });
  },

  async getUserTransactionHistory(userId) {
    return prisma.transactions.findMany({
      where: { user_id: userId },
      include: {
        subscription_plans: {
          select: {
            name: true,
            code: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });
  },

  async getCurrentSubscription(userId) {
    const now = new Date();

    const currentSubscription = await prisma.user_subscriptions.findFirst({
      where: {
        user_id: userId,
        status: "active",
        end_date: { gte: now },
      },
      include: {
        subscription_plans: {
          select: {
            id: true,
            name: true,
            code: true,
            duration_days: true,
          },
        },
      },
      orderBy: {
        end_date: "desc",
      },
    });

    if (!currentSubscription) {
      return {
        hasActiveSubscription: false,
        planName: null,
        planCode: null,
        remainingDays: 0,
        endDate: null,
      };
    }

    const millisecondsLeft =
      new Date(currentSubscription.end_date).getTime() - now.getTime();
    const remainingDays = Math.max(
      0,
      Math.ceil(millisecondsLeft / (1000 * 60 * 60 * 24)),
    );

    return {
      hasActiveSubscription: true,
      planName: currentSubscription.subscription_plans?.name || null,
      planCode: currentSubscription.subscription_plans?.code || null,
      remainingDays,
      endDate: currentSubscription.end_date,
    };
  },
};
