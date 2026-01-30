import express from "express";
import multer from "multer";
import {
  uploadMovieController,
  getListMoviesController,
} from "../controllers/movie.controller.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload-video", upload.single("video"), uploadMovieController);

router.get("/list", getListMoviesController);

export default router;
