import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import MovieRouter from "./modules/streaming/route/movie.route.js";
import AdminAnalyticsRouter from "./modules/admin/analytics/route/analytics.route.js";
import prisma from "./core/database/prisma.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/streaming", MovieRouter);
app.use("/api/admin/analytics", AdminAnalyticsRouter);

app.get("/", (req, res) => {
  res.send("Hello from Movie Streaming Backend!");
});

const PORT = process.env.PORT || 3000;
async function startServer() {
  try {
    // Thử kết nối
    await prisma.$connect();
    console.log("✅ KẾT NỐI DATABASE THÀNH CÔNG!");
    
    // Thử query nhẹ một cái (ví dụ đếm số user) - Optional
    const userCount = await prisma.users.count();
    console.log(`📊 Hiện có ${userCount} users trong DB.`);

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ LỖI KẾT NỐI DATABASE:", error);
    process.exit(1); // Tắt server luôn nếu lỗi DB
  }
}

startServer();