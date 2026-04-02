import crypto from "crypto";
import prisma from "../../core/database/prisma.js";

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}${month}${day}${hours}${minutes}${seconds}`;
};

const buildSignData = (params) => {
  const sortedKeys = Object.keys(params).sort();

  return sortedKeys
    .map(
      (key) =>
        `${key}=${encodeURIComponent(String(params[key])).replace(/%20/g, "+")}`,
    )
    .join("&");
};

const getClientIp = (request) => {
  const forwardedFor = request.headers["x-forwarded-for"];

  if (forwardedFor) {
    const ip = String(forwardedFor).split(",")[0].trim();
    if (ip.startsWith("::ffff:")) {
      return ip.replace("::ffff:", "");
    }
    if (ip === "::1" || ip === "::") {
      return "127.0.0.1";
    }
    return ip;
  }

  const socketIp = request.socket?.remoteAddress || "127.0.0.1";
  if (socketIp.startsWith("::ffff:")) {
    return socketIp.replace("::ffff:", "");
  }
  if (socketIp === "::1" || socketIp === "::") {
    return "127.0.0.1";
  }

  return socketIp;
};

export const paymentService = {
  async createVnpayPaymentUrl({ planCode, userId, request }) {
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

    const tmnCode = process.env.VNPAY_TMN_CODE;
    const hashSecret = process.env.VNPAY_HASH_SECRET;
    const vnpUrl = process.env.VNPAY_URL;
    const backendBaseUrl =
      process.env.BACKEND_BASE_URL?.replace(/\/$/, "") || "http://localhost:3000";
    const returnUrl =
      process.env.VNPAY_RETURN_URL ||
      `${backendBaseUrl}/api/v1/payments/vnpay/return`;

    if (!tmnCode || !hashSecret || !vnpUrl) {
      throw new Error("Thiếu cấu hình VNPay trên server");
    }

    const txnRef = `${normalizedPlanCode}-${userId}-${Date.now()}`;
    const createDate = formatDate(new Date());
    const ipAddr = getClientIp(request);

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

    const params = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: tmnCode,
      vnp_Locale: "vn",
      vnp_CurrCode: "VND",
      vnp_TxnRef: txnRef,
      vnp_OrderInfo: `Thanh toan goi ${normalizedPlanCode.toUpperCase()} cho user ${userId}`,
      vnp_OrderType: "other",
      vnp_Amount: amount * 100,
      vnp_ReturnUrl: returnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate,
    };

    const signData = buildSignData(params);
    const secureHash = crypto
      .createHmac("sha512", hashSecret)
      .update(Buffer.from(signData, "utf-8"))
      .digest("hex");

    return `${vnpUrl}?${signData}&vnp_SecureHash=${secureHash}`;
  },

  async processVnpayReturn(vnpParams) {
    const params = { ...vnpParams };
    const receivedHash = params.vnp_SecureHash;

    delete params.vnp_SecureHash;
    delete params.vnp_SecureHashType;

    if (!receivedHash) {
      throw new Error("Thiếu chữ ký VNPay");
    }

    const hashSecret = process.env.VNPAY_HASH_SECRET;
    if (!hashSecret) {
      throw new Error("Thiếu VNPAY_HASH_SECRET");
    }

    const signData = buildSignData(params);
    const expectedHash = crypto
      .createHmac("sha512", hashSecret)
      .update(Buffer.from(signData, "utf-8"))
      .digest("hex");

    if (expectedHash !== receivedHash) {
      throw new Error("Sai chữ ký VNPay");
    }

    const transactionCode = params.vnp_TxnRef;
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

    const isSuccess =
      params.vnp_ResponseCode === "00" && params.vnp_TransactionStatus === "00";

    if (!isSuccess) {
      await prisma.transactions.update({
        where: { id: transaction.id },
        data: {
          status: "failed",
          payment_gateway_response: JSON.stringify(vnpParams),
        },
      });

      return {
        success: false,
        transactionCode,
      };
    }

    await prisma.$transaction(async (tx) => {
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
          payment_gateway_response: JSON.stringify(vnpParams),
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
    });

    return {
      success: true,
      transactionCode,
      alreadyProcessed: false,
    };
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
