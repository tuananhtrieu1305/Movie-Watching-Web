import {
  uploadMovieService,
  getMoviesService,
} from "../services/movie.service.js";

export const uploadMovieController = async (req, res) => {
  try {
    if (!req.file) return res.status(400).send("Chưa chọn file video!");

    const result = await uploadMovieService(req.file, req.body);

    res.json({
      message: "Upload thành công! Đang xử lý video ngầm.",
      data: result,
    });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).send("Lỗi Server: " + error.message);
  }
};

export const getListMoviesController = async (req, res) => {
  try {
    const movies = await getMoviesService();
    res.json(movies);
  } catch (error) {
    console.error("Get List Error:", error);
    res.status(500).json({ error: error.message });
  }
};
