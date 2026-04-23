import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { initSocket } from "./core/sockets/socketManager.js";
import MainRouter from "./modules/streaming/route/index.js";
import authRoutes from "./modules/auth/auth.routes.js";
import paymentRoutes from "./modules/payment/payment.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";
import watchlistRoutes from "./modules/watchlist/watchlist.routes.js";
import historyRoutes from "./modules/history/history.routes.js";
import AdminAnalyticsRouter from "./modules/admin/analytics/route/analytics.route.js";
import commentRoutes from "./modules/comment/comment.routes.js";
import meetingRoutes from "./modules/meeting/meeting.route.js";
import prisma from "./core/database/prisma.js";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
const httpServer = createServer(app);

const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const finalCorsOrigins = [
  ...allowedOrigins,
  "https://netflick.fun",
  "https://www.netflick.fun",
];

initSocket(httpServer, {
  cors: {
    origin: finalCorsOrigins,
    credentials: true,
  },
});

app.use(
  cors({
    origin: finalCorsOrigins,
    credentials: true,
  }),
);
app.use(express.json());

app.use("/api/streaming", MainRouter);
app.use(cookieParser());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/watchlist", watchlistRoutes);
app.use("/api/v1/history", historyRoutes);
app.use("/api/admin/analytics", AdminAnalyticsRouter);
app.use("/api/comment", commentRoutes);
app.use("/api/meeting", meetingRoutes);

app.get("/", (req, res) => {
  res.send("Hello from Movie Streaming Backend!");
});

async function startServer() {
  try {
    await prisma.$connect();
    console.log("✅ KẾT NỐI DATABASE THÀNH CÔNG!");
    const PORT = process.env.PORT || 3000;
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ LỖI KẾT NỐI DATABASE:", error);
    process.exit(1);
  }
}

startServer();
