import prisma from "../../../core/database/prisma.js";
import { uploadFileToR2 } from "../../../core/storage/upload.helper.js";
import axios from "axios";

export const uploadMovieService = async (file, metadata) => {
  const { title, description, release_year, is_premium, type } = metadata;

  // 1. Upload video lên R2
  const fileName = await uploadFileToR2(file, "raw/movies");

  const slug = title.toLowerCase().replace(/ /g, "-") + "-" + Date.now();
  let firstEpisodeId = null;

  // 2. Lưu DB
  const newProduction = await prisma.$transaction(async (tx) => {
    const production = await tx.productions.create({
      data: {
        title,
        slug,
        description,
        type: type || "movie",
        release_year: release_year ? parseInt(release_year) : null,
        is_premium: is_premium === "true",
        status: "ongoing",
      },
    });

    if (type === "movie" || !type) {
      await tx.movies.create({ data: { id: production.id, duration: 0 } });
      const episode = await tx.episodes.create({
        data: {
          production_id: production.id,
          episode_number: 1,
          title: "Full Movie",
          video_url: fileName,
          duration: 0,
        },
      });
      firstEpisodeId = episode.id;
    }
    return production;
  });

  // 3. Gọi Python
  try {
    if (firstEpisodeId && fileName) {
      axios
        .post("http://video_service:8001/process-video", {
          file_name: fileName,
          production_id: newProduction.id,
          episode_id: firstEpisodeId,
        })
        .catch((err) => console.error("⚠️ Python Service Error:", err.message));
    }
  } catch (e) {
    console.error("Lỗi gọi Python:", e);
  }

  return newProduction;
};

export const updateProductionService = async (id, metadata) => {
  const {
    title,
    description,
    release_year,
    is_premium,
    status,
    genres,
    actors,
    poster_url,
    banner_url,
    country,
    language,
  } = metadata;

  return await prisma.$transaction(async (tx) => {
    const updateData = { updated_at: new Date() };

    if (title !== undefined) updateData.title = title;
    if (status !== undefined) updateData.status = status;
    if (description !== undefined) updateData.description = description;
    if (release_year !== undefined)
      updateData.release_year = parseInt(release_year);
    if (is_premium !== undefined)
      updateData.is_premium = is_premium === "true" || is_premium === true;
    if (poster_url !== undefined) updateData.poster_url = poster_url;
    if (banner_url !== undefined) updateData.banner_url = banner_url;
    if (country !== undefined) updateData.country = country;
    if (language !== undefined) updateData.language = language;

    const updated = await tx.productions.update({
      where: { id: Number(id) },
      data: updateData,
    });

    // Genres
    if (genres) {
      const genreIds = typeof genres === "string" ? JSON.parse(genres) : genres;
      await tx.production_genres.deleteMany({
        where: { production_id: Number(id) },
      });
      if (genreIds.length > 0) {
        await tx.production_genres.createMany({
          data: genreIds.map((gId) => ({
            production_id: Number(id),
            genre_id: Number(gId),
          })),
        });
      }
    }

    // Actors
    if (actors) {
      const actorList =
        typeof actors === "string" ? JSON.parse(actors) : actors;
      await tx.production_actors.deleteMany({
        where: { production_id: Number(id) },
      });

      for (const [index, actor] of actorList.entries()) {
        const slug =
          actor.name.toLowerCase().replace(/ /g, "-") + "-" + Date.now();
        let dbActor = await tx.actors.findFirst({
          where: { name: actor.name },
        });

        if (!dbActor) {
          dbActor = await tx.actors.create({
            data: { name: actor.name, slug, avatar_url: actor.avatar_url },
          });
        } else {
          if (actor.avatar_url && actor.avatar_url !== dbActor.avatar_url) {
            dbActor = await tx.actors.update({
              where: { id: dbActor.id },
              data: { avatar_url: actor.avatar_url },
            });
          }
        }

        await tx.production_actors.create({
          data: {
            production_id: Number(id),
            actor_id: dbActor.id,
            character_name: actor.character,
            display_order: index,
          },
        });
      }
    }
    return updated;
  });
};

export const deleteProductionService = async (id) => {
  return await prisma.productions.delete({ where: { id: Number(id) } });
};

export const getMoviesService = async () => {
  return await prisma.productions.findMany({
    where: { type: { in: ["movie", "series"] } },
    orderBy: { created_at: "desc" },
  });
};

export const getMovieBySlugService = async (slug) => {
  const production = await prisma.productions.findUnique({
    where: { slug },
    include: {
      movies: true,
      series: {
        include: {
          seasons: {
            include: { productions: true },
            orderBy: { season_number: "asc" },
          },
        },
      },
      seasons: true,
      episodes: { orderBy: { episode_number: "asc" } },
      production_genres: { include: { genres: true } },
      production_actors: { include: { actors: true } },
    },
  });

  if (!production) throw new Error("Không tìm thấy phim!");

  let formattedSeasons = [];
  let formattedEpisodes = production.episodes || [];

  if (production.type === "series" && production.series) {
    formattedSeasons = production.series.seasons.map((s) => ({
      ...s,
      title: s.productions?.title || `Mùa ${s.season_number}`,
    }));

    if (formattedSeasons.length > 0) {
      const defaultSeasonId = formattedSeasons[0].id;
      formattedEpisodes = await prisma.episodes.findMany({
        where: { production_id: defaultSeasonId },
        orderBy: { episode_number: "asc" },
      });
    }
  }

  const genreIds = production.production_genres.map((pg) => pg.genre_id);
  let formattedRelated = [];

  if (genreIds.length > 0) {
    const relatedDb = await prisma.productions.findMany({
      where: {
        id: { not: production.id },
        type: { in: ["movie", "series"] },
        production_genres: {
          some: {
            genre_id: { in: genreIds },
          },
        },
      },
      take: 10,
      orderBy: { rating_avg: "desc" },
      include: {
        episodes: { select: { id: true } },
        movies: true,
        series: true,
      },
    });

    formattedRelated = relatedDb.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      poster: p.poster_url,
      poster_url: p.poster_url,
      type: p.type,
      eps: p.type === "movie" ? 1 : p.episodes.length,
      movies: p.movies,
      series: p.series,
    }));
  }

  return {
    ...production,
    seasons:
      formattedSeasons.length > 0 ? formattedSeasons : production.seasons,
    episodes: formattedEpisodes,
    genres: production.production_genres.map((pg) => pg.genres),
    actors: production.production_actors.map((pa) => ({
      ...pa.actors,
      character_name: pa.character_name,
      role_type: pa.role_type,
    })),
    related: formattedRelated,
  };
};

export const getGenresService = async () => {
  return await prisma.genres.findMany({ orderBy: { name: "asc" } });
};

export const getPopularMoviesService = async () => {
  const popularDb = await prisma.productions.findMany({
    where: {
      type: { in: ["movie", "series"] },
      status: "completed", // Tuỳ chọn: Chỉ lấy các phim đã hoàn thành, hoặc bạn có thể bỏ dòng này
    },
    take: 10, // Lấy top 10
    orderBy: [
      { rating_avg: "desc" }, // Ưu tiên điểm cao
      { rating_count: "desc" }, // Nếu bằng điểm thì ưu tiên lượt vote nhiều hơn
    ],
    include: {
      episodes: { select: { id: true } },
      movies: true,
      series: true,
    },
  });

  // Map data về đúng chuẩn Component của React
  return popularDb.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    poster: p.poster_url,
    poster_url: p.poster_url,
    type: p.type,
    eps: p.type === "movie" ? 1 : p.episodes.length,
    movies: p.movies,
    series: p.series,
  }));
};
