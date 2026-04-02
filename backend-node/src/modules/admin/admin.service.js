import bcrypt from "bcryptjs";
import prisma from "../../core/database/prisma.js";

const userSelect = {
  id: true,
  username: true,
  email: true,
  avatar_url: true,
  role: true,
  vip_expires_at: true,
  total_watch_time: true,
  last_login: true,
  created_at: true,
  updated_at: true,
};

export const adminService = {
  async listUsers() {
    return prisma.users.findMany({
      select: userSelect,
      orderBy: {
        created_at: "desc",
      },
    });
  },

  async createUser({ username, email, password, role = "user", avatar_url = null }) {
    const existed = await prisma.users.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
      select: { id: true, username: true, email: true },
    });

    if (existed?.username === username) {
      throw new Error("Username đã tồn tại");
    }
    if (existed?.email === email) {
      throw new Error("Email đã tồn tại");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    return prisma.users.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role,
        avatar_url,
        provider: "local",
      },
      select: userSelect,
    });
  },

  async updateUser(userId, payload) {
    const existed = await prisma.users.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!existed) {
      throw new Error("Không tìm thấy user");
    }

    const updateData = {};
    if (payload.username !== undefined) updateData.username = payload.username;
    if (payload.email !== undefined) updateData.email = payload.email;
    if (payload.role !== undefined) updateData.role = payload.role;
    if (payload.avatar_url !== undefined) updateData.avatar_url = payload.avatar_url;
    if (payload.vip_expires_at !== undefined) {
      updateData.vip_expires_at = payload.vip_expires_at ? new Date(payload.vip_expires_at) : null;
    }

    if (payload.password) {
      updateData.password = await bcrypt.hash(payload.password, 10);
    }

    return prisma.users.update({
      where: { id: userId },
      data: updateData,
      select: userSelect,
    });
  },

  async deleteUser(userId) {
    await prisma.users.delete({ where: { id: userId } });
  },

  async listTransactions() {
    return prisma.transactions.findMany({
      include: {
        users: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        subscription_plans: {
          select: {
            id: true,
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

  async listSubscriptions() {
    return prisma.user_subscriptions.findMany({
      include: {
        users: {
          select: {
            id: true,
            username: true,
            email: true,
            avatar_url: true,
          },
        },
        subscription_plans: {
          select: {
            id: true,
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
};
