import mockDB from "./mockDB";

// --- HÀM 1: LẤY DỮ LIỆU WATCH PAGE ---
export const getWatchDataBySlug = (slug) => {
  // 1. Tìm phim trong DB
  const production = mockDB.productions.find((p) => p.slug === slug);
  if (!production) return null;

  // 2. Chuẩn bị dữ liệu tập phim (Episodes)
  let episodes = [];
  let currentEpisode = null;

  // Link video giả để demo (vì DB đang null)
  const FAKE_VIDEO_URL = "https://www.w3schools.com/html/mov_bbb.mp4";

  if (production.type === "movie") {
    // --- MOVIE ---
    // Lấy tập từ mảng episodes của movie
    if (production.episodes && production.episodes.length > 0) {
      episodes = production.episodes.map((ep) => ({
        ...ep,
        video_url: ep.video_url || FAKE_VIDEO_URL, // Inject video nếu null
        is_active: true,
      }));
      currentEpisode = episodes[0];
    }
  } else {
    // --- SERIES ---
    // Mặc định lấy Season 1 hoặc Season đầu tiên
    const firstSeason = production.seasons?.[0];
    if (firstSeason && firstSeason.episodes) {
      episodes = firstSeason.episodes.map((ep, index) => ({
        ...ep,
        video_url: ep.video_url || FAKE_VIDEO_URL,
        is_active: index === 0,
      }));
      currentEpisode = episodes[0];
    }
  }

  // 3. Tính toán Related Movies (Dựa trên Genre đầu tiên)
  const firstGenreId = production.genres?.[0]?.id;
  const related = mockDB.productions
    .filter(
      (p) =>
        p.id !== production.id && p.genres.some((g) => g.id === firstGenreId),
    )
    .slice(0, 5)
    .map((p) => ({
      id: p.id,
      title: p.title,
      poster: p.poster_url,
      type: p.type === "movie" ? "Movie" : "TV",
      eps: p.type === "series" ? `${p.series?.total_seasons} Seasons` : "Full",
      slug: p.slug,
    }));

  // 4. Trả về format WatchPage cần
  return {
    production: {
      ...production,
      related: related, // Gắn list gợi ý
      // Tính toán duration hiển thị (string)
      display_duration:
        production.type === "movie"
          ? `${Math.floor((production.movie?.duration || 0) / 60)} min`
          : `${production.series?.total_seasons} Seasons`,
      // Map genres sang mảng string tên nếu cần hiển thị đơn giản
      genres_list: production.genres.map((g) => g.name),
    },
    episodes,
    currentEpisode,
  };
};

// --- HÀM 2: LẤY TẬP THEO MÙA (API GIẢ) ---
export const getEpisodesBySeason = (seasonId) => {
  // 1. Tìm season trong toàn bộ mockDB
  let foundSeason = null;

  for (const prod of mockDB.productions) {
    if (prod.seasons) {
      const s = prod.seasons.find((sea) => sea.id === seasonId);
      if (s) {
        foundSeason = s;
        break;
      }
    }
  }

  // Nếu không thấy season, trả về mảng rỗng
  if (!foundSeason) return { data: [] };

  // 2. Map dữ liệu để inject video url (đảm bảo player chạy được)
  const episodesWithSeason = foundSeason.episodes.map((ep) => ({
    ...ep,
    season_number: foundSeason.season_number,
    video_url: ep.video_url || "https://www.w3schools.com/html/mov_bbb.mp4",
  }));

  // 3. Trả về đúng format { data: ... }
  return {
    data: episodesWithSeason,
  };
};
