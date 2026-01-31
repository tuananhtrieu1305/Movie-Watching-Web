import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import MovieRouter from "./modules/streaming/route/movie.route.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/streaming", MovieRouter);

app.get("/", (req, res) => {
  res.send("Hello from Movie Streaming Backend!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
