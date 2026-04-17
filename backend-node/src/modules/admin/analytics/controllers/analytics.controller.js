import { getAnalyticsDashboardService } from "../services/analytics.service.js";

export const getAnalyticsDashboardController = async (req, res) => {
  try {
    const range = typeof req.query?.range === "string" ? req.query.range.trim() : "";
    const data = await getAnalyticsDashboardService({ range });

    res.json({
      message: "Lấy dữ liệu dashboard thành công",
      data,
    });
  } catch (error) {
    console.error("Get admin analytics dashboard error:", error);
    res.status(500).json({
      message: "Không thể tải dữ liệu dashboard",
      error: error.message,
    });
  }
};
