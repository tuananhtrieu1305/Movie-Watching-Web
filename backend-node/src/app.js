import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import MovieRouter from "./modules/streaming/route/movie.route.js";
import authRoutes from "./modules/auth/auth.routes.js";
import paymentRoutes from "./modules/payment/payment.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";
import watchlistRoutes from "./modules/watchlist/watchlist.routes.js";
import prisma from "./core/database/prisma.js";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/watchlist", watchlistRoutes);
app.use("/api/streaming", MovieRouter);

app.get("/", (req, res) => {
  res.send("Hello from Movie Streaming Backend!");
});

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await prisma.$connect();
    console.log("✅ KẾT NỐI DATABASE THÀNH CÔNG!");

    const userCount = await prisma.users.count();
    console.log(`📊 Hiện có ${userCount} users trong DB.`);

    // Lưu server vào một biến
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
    });

    // Thêm đoạn này để bắt lỗi nếu server không thể duy trì
    server.on('error', (e) => {
      console.error("❌ Lỗi server:", e);
    });

  } catch (error) {
    console.error("❌ LỖI KHỞI ĐỘNG:", error);
  }
}

startServer();