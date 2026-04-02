import express from "express";
import prisma from "./src/core/database/prisma.js";

const app = express();
app.get("/", (req, res) => res.send("test"));

async function run() {
  await prisma.$connect();
  console.log("Prisma connected");
  app.listen(3005, () => console.log("Server running"));
}
run();
