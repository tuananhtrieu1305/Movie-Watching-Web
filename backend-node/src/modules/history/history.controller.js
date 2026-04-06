import { historyService } from "./history.service.js";

export const historyController = {
  async getMyHistory(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const items = await historyService.getUserHistory(userId);

      // Xử lý dữ liệu để loại bỏ những tập phim trùng (chỉ để lại tập mới nhất của mỗi tác phẩm series/movie)
      const mapped = new Map();
      for (const item of items) {
        const prodId = item.episodes?.production?.id;
        if (!prodId) continue;

        // Vì list đã được sort DESC theo last_watched_at từ DB,
        // bản ghi gặp đầu tiên của mỗi phim sẽ là tập mới nhất được xem
        if (!mapped.has(prodId)) {
          mapped.set(prodId, item);
        }
      }

      return res.status(200).json({ history: Array.from(mapped.values()) });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  },

  async updateHistory(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const data = req.body; // chứa episode_id, last_position, watched_duration
      if (!data.episode_id) {
        return res.status(400).json({ message: "Thiếu episode_id" });
      }

      const item = await historyService.updateHistory(userId, data);
      return res
        .status(200)
        .json({ message: "Cập nhật tiến trình thành công", data: item });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  },
};
