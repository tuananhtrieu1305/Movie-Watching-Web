import { Upload } from "@aws-sdk/lib-storage";
import axios from "axios";
import prisma from "../../../core/database/prisma.js";
import s3 from "../../../core/storage/r2.js";

export const uploadMovieService = async (file, metadata) => {
  const { title, description, release_year, is_premium, type } = metadata;

  // 1. Tạo tên file
  const fileExtension = file.originalname.split(".").pop();
  const fileName = `raw/${Date.now()}-${title.replace(/\s+/g, "-")}.${fileExtension}`;

  // 2. Upload lên R2
  const upload = new Upload({
    client: s3,
    params: {
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
    },
  });
  await upload.done();

  // 3. Lưu DB (Transaction)
  const slug = title.toLowerCase().replace(/ /g, "-") + "-" + Date.now();

  const newProduction = await prisma.$transaction(async (tx) => {
    const production = await tx.productions.create({
      data: {
        title,
        slug,
        description,
        type: type || "movie",
        release_year: parseInt(release_year),
        is_premium: is_premium === "true",
        status: "ongoing",
      },
    });

    if (type === "movie" || !type) {
      await tx.movies.create({
        data: { id: production.id, duration: 0 },
      });
      await tx.episodes.create({
        data: {
          production_id: production.id,
          episode_number: 1,
          title: "Full Movie",
          video_url: fileName,
          duration: 0,
        },
      });
    }
    return production;
  });

  // 4. Gọi Python (Không await để chạy ngầm)
  try {
    axios
      .post("http://video_service:8001/process-video", {
        file_name: fileName,
        production_id: newProduction.id,
      })
      .catch((err) => console.error("⚠️ Python Service Error:", err.message));
  } catch (e) {
    console.error("Lỗi gọi Python:", e);
  }

  return newProduction;
};

// Logic lấy danh sách phim
export const getMoviesService = async ({ scope } = {}) => {
  const isHomeScope = scope === "home";

  const where = isHomeScope
    ? {
        type: {
          in: ["movie", "series"],
        },
        poster_url: {
          startsWith: "http",
        },
        banner_url: {
          startsWith: "http",
        },
      }
    : undefined;

  const productions = await prisma.productions.findMany({
    where,
    orderBy: { created_at: "desc" },
    include: {
      production_genres: {
        select: {
          genres: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
      episodes: {
        select: {
          views_count: true,
        },
      },
    },
  });

  return productions.map((production) => {
    const totalViews = Array.isArray(production.episodes)
      ? production.episodes.reduce(
          (sum, ep) => sum + (Number(ep?.views_count) || 0),
          0,
        )
      : 0;

    const genres = Array.isArray(production.production_genres)
      ? production.production_genres
          .map((item) => item?.genres)
          .filter(Boolean)
      : [];

    return {
      ...production,
      total_views: totalViews,
      genres,
    };
  });
};
