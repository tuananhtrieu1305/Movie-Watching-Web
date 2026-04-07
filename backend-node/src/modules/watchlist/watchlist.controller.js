import { watchlistService } from "./watchlist.service.js";

export const watchlistController = {
  async getMyWatchlist(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const items = await watchlistService.getUserWatchlist(userId);
      return res.status(200).json({ items });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  },

  async addToWatchlist(req, res) {
    try {
      const userId = req.user?.id;
      const productionId = Number(req.body?.productionId);

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (!Number.isInteger(productionId) || productionId <= 0) {
        return res.status(400).json({ message: "productionId không hợp lệ" });
      }

      const item = await watchlistService.addToWatchlist(userId, productionId);
      return res.status(201).json({ item, message: "Đã thêm vào watch list" });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  },

  async removeFromWatchlist(req, res) {
    try {
      const userId = req.user?.id;
      const productionId = Number(req.params.productionId);

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (!Number.isInteger(productionId) || productionId <= 0) {
        return res.status(400).json({ message: "productionId không hợp lệ" });
      }

      await watchlistService.removeFromWatchlist(userId, productionId);
      return res.status(200).json({ message: "Đã xóa khỏi watch list" });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  },

  async checkInWatchlist(req, res) {
    try {
      const userId = req.user?.id;
      const productionId = Number(req.params.productionId);

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (!Number.isInteger(productionId) || productionId <= 0) {
        return res.status(400).json({ message: "productionId không hợp lệ" });
      }

      const inWatchlist = await watchlistService.checkInWatchlist(userId, productionId);
      return res.status(200).json({ inWatchlist });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  },
};
