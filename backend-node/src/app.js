import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import MainRouter from "./modules/streaming/route/index.js";
import authRoutes from "./modules/auth/auth.routes.js";
import paymentRoutes from "./modules/payment/payment.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";
import watchlistRoutes from "./modules/watchlist/watchlist.routes.js";
import historyRoutes from "./modules/history/history.routes.js";
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
    origin: [allowedOrigins, "https://netflick.fun"],
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

app.get("/", (req, res) => {
  res.send("Hello from Movie Streaming Backend!");
});

async function startServer() {
  try {
    await prisma.$connect();
    console.log("✅ KẾT NỐI DATABASE THÀNH CÔNG!");
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ LỖI KẾT NỐI DATABASE:", error);
    process.exit(1);
  }
}

startServer();
