import { adminService } from "./admin.service.js";

export const adminController = {
  async getUsers(_req, res) {
    try {
      const users = await adminService.listUsers();
      return res.status(200).json({ users });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  },

  async createUser(req, res) {
    try {
      const { username, email, password, role, avatar_url } = req.body;
      if (!username || !email || !password) {
        return res.status(400).json({ message: "Thiếu username/email/password" });
      }

      const user = await adminService.createUser({
        username,
        email,
        password,
        role,
        avatar_url,
      });

      return res.status(201).json({ user });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  },

  async updateUser(req, res) {
    try {
      const userId = Number(req.params.id);
      if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({ message: "User ID không hợp lệ" });
      }

      if (req.user?.id === userId && req.body?.role && req.body.role !== "admin") {
        return res.status(400).json({ message: "Không thể tự hạ quyền chính mình" });
      }

      const user = await adminService.updateUser(userId, req.body || {});
      return res.status(200).json({ user });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  },

  async deleteUser(req, res) {
    try {
      const userId = Number(req.params.id);
      if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({ message: "User ID không hợp lệ" });
      }

      if (req.user?.id === userId) {
        return res.status(400).json({ message: "Không thể xóa chính mình" });
      }

      await adminService.deleteUser(userId);
      return res.status(200).json({ message: "Đã xóa user" });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  },

  async getTransactions(_req, res) {
    try {
      const transactions = await adminService.listTransactions();
      return res.status(200).json({ transactions });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  },

  async getSubscriptions(_req, res) {
    try {
      const subscriptions = await adminService.listSubscriptions();
      return res.status(200).json({ subscriptions });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  },
};
