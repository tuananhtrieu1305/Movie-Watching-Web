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

const DB_CONNECT_MAX_RETRIES = Number(process.env.DB_CONNECT_MAX_RETRIES || 20);
const DB_CONNECT_RETRY_DELAY_MS = Number(
  process.env.DB_CONNECT_RETRY_DELAY_MS || 3000,
);

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function startServer() {
  let attempt = 0;

  while (attempt < DB_CONNECT_MAX_RETRIES) {
    try {
      attempt += 1;

      await prisma.$connect();
      console.log("✅ KẾT NỐI DATABASE THÀNH CÔNG!");

      const userCount = await prisma.users.count();
      console.log(`📊 Hiện có ${userCount} users trong DB.`);

      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
      return;
    } catch (error) {
      const retriesLeft = DB_CONNECT_MAX_RETRIES - attempt;
      console.error("❌ LỖI KẾT NỐI DATABASE:", error?.message || error);

      if (retriesLeft <= 0) {
        console.error("⛔ Đã hết số lần thử kết nối DB. Dừng server.");
        process.exit(1);
      }

      console.log(
        `🔁 Thử kết nối lại DB sau ${DB_CONNECT_RETRY_DELAY_MS}ms (${retriesLeft} lần còn lại)...`,
      );
      await wait(DB_CONNECT_RETRY_DELAY_MS);
    }
  }
}

startServer();