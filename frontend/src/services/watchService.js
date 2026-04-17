import { listProductions } from "./productionService";

const FALLBACK_VIDEO_URL = "https://www.w3schools.com/html/mov_bbb.mp4";

const toNumber = (value) => {
  if (value == null) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const normalizeSlug = (value) => {
  if (typeof value !== "string") return null;
  const slug = value.trim().toLowerCase();
  return slug !== "" ? slug : null;
};

const normalizeGenres = (production) => {
  if (Array.isArray(production?.genres) && production.genres.length > 0) {
    return production.genres
      .map((genre, index) => {
        if (typeof genre === "string") {
          return {
            id: index + 1,
            name: genre,
          };
        }
        return {
          id: genre?.id ?? index + 1,
          name: genre?.name ?? "Unknown",
        };
      })
      .filter((genre) => typeof genre.name === "string" && genre.name.trim() !== "");
  }

  if (!Array.isArray(production?.production_genres)) return [];

  return production.production_genres
    .map((item, index) => ({
      id: item?.genres?.id ?? index + 1,
      name: item?.genres?.name ?? "Unknown",
    }))
    .filter((genre) => typeof genre.name === "string" && genre.name.trim() !== "");
};

const buildEpisodes = (production) => {
  if (Array.isArray(production?.episodes) && production.episodes.length > 0) {
    return production.episodes.map((episode, index) => ({
      id: episode?.id ?? production.id * 1000 + index + 1,
      episode_number: toNumber(episode?.episode_number) ?? index + 1,
      title:
        typeof episode?.title === "string" && episode.title.trim() !== ""
          ? episode.title
          : production.type === "movie"
            ? "Full Movie"
            : `Episode ${index + 1}`,
      video_url:
        typeof episode?.video_url === "string" && episode.video_url.trim() !== ""
          ? episode.video_url
          : FALLBACK_VIDEO_URL,
      duration: toNumber(episode?.duration) ?? 0,
      views_count: toNumber(episode?.views_count) ?? 0,
      is_active: index === 0,
    }));
  }

  return [
    {
      id: production.id * 1000 + 1,
      episode_number: 1,
      title: production.type === "movie" ? "Full Movie" : "Episode 1",
      video_url: FALLBACK_VIDEO_URL,
      duration: 0,
      views_count: toNumber(production?.total_views) ?? 0,
      is_active: true,
    },
  ];
};

const buildSeasons = (production) => {
  if (!Array.isArray(production?.seasons)) return [];

  return production.seasons.map((season, index) => ({
    id: season?.id ?? production.id * 100 + index + 1,
    season_number: toNumber(season?.season_number) ?? index + 1,
    title:
      typeof season?.title === "string" && season.title.trim() !== ""
        ? season.title
        : `Mùa ${toNumber(season?.season_number) ?? index + 1}`,
    episodes: Array.isArray(season?.episodes)
      ? season.episodes.map((episode, episodeIndex) => ({
          id: episode?.id ?? (season?.id ?? production.id * 100 + index + 1) * 1000 + episodeIndex + 1,
          episode_number: toNumber(episode?.episode_number) ?? episodeIndex + 1,
          title:
            typeof episode?.title === "string" && episode.title.trim() !== ""
              ? episode.title
              : `Episode ${episodeIndex + 1}`,
          video_url:
            typeof episode?.video_url === "string" && episode.video_url.trim() !== ""
              ? episode.video_url
              : FALLBACK_VIDEO_URL,
          duration: toNumber(episode?.duration) ?? 0,
          views_count: toNumber(episode?.views_count) ?? 0,
          is_active: episodeIndex === 0,
        }))
      : [],
  }));
};

const mapRelatedItem = (production) => ({
  id: production.id,
  title: production.title,
  poster: production.poster_url,
  type: production.type === "movie" ? "Movie" : "Series",
  eps: production.type === "series" ? 1 : "Full",
  slug: production.slug,
});

const buildRelated = (allProductions, currentProduction, currentGenres) => {
  const currentSlug = normalizeSlug(currentProduction?.slug);

  const candidates = allProductions.filter(
    (production) => normalizeSlug(production?.slug) !== currentSlug,
  );

  const byGenre = candidates.filter((production) => {
    const genres = normalizeGenres(production);
    return genres.some((genre) =>
      currentGenres.some((currentGenre) =>
        currentGenre.id != null && genre.id != null
          ? currentGenre.id === genre.id
          : currentGenre.name === genre.name,
      ),
    );
  });

  const source = (byGenre.length > 0 ? byGenre : candidates).slice(0, 5);
  return source.map(mapRelatedItem);
};

export const getWatchDataBySlug = async (slug, { signal } = {}) => {
  const targetSlug = normalizeSlug(slug);
  if (!targetSlug) return null;

  const productions = await listProductions({ signal });
  if (!Array.isArray(productions) || productions.length === 0) return null;

  const matchedProduction = productions.find(
    (production) => normalizeSlug(production?.slug) === targetSlug,
  );

  if (!matchedProduction) return null;

  const genres = normalizeGenres(matchedProduction);
  const episodes = buildEpisodes(matchedProduction);
  const seasons = buildSeasons(matchedProduction);

  const mappedProduction = {
    ...matchedProduction,
    slug: targetSlug,
    rating_avg: toNumber(matchedProduction?.rating_avg) ?? 0,
    rating_count: toNumber(matchedProduction?.rating_count) ?? 0,
    is_premium: Boolean(matchedProduction?.is_premium),
    genres,
    actors: Array.isArray(matchedProduction?.actors)
      ? matchedProduction.actors
      : [],
    movie: {
      duration: toNumber(matchedProduction?.movies?.duration) ?? toNumber(episodes[0]?.duration) ?? 0,
      preview_duration: toNumber(matchedProduction?.movies?.preview_duration) ?? 300,
    },
    series: {
      total_seasons: seasons.length > 0 ? seasons.length : matchedProduction.type === "series" ? 1 : 0,
    },
    seasons,
    episodes,
    related: buildRelated(productions, matchedProduction, genres),
  };

  return {
    production: mappedProduction,
    episodes,
    currentEpisode: episodes[0] ?? null,
  };
};
