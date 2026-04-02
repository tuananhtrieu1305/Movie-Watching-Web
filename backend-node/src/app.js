import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import MainRouter from "./modules/streaming/route/index.js";
import prisma from "./core/database/prisma.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Gắn toàn bộ router vào /api/streaming
app.use("/api/streaming", MainRouter);

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
