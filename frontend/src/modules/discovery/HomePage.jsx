import HeroSlider from "../../components/HomePage/HeroSlider";
import CategoryTabs from "../../components/HomePage/CategoryTabs";
import CategorySection from "../../components/HomePage/CategorySection";
import TrendingSection from "../../components/HomePage/TrendingSection";

import { useEffect, useMemo, useRef, useState } from "react";
import AnonymousBanner from "../../assets/anonymousBanner.png";
import { listProductions } from "../../services/productionService";

const toNumber = (value) => {
  if (value == null) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const normalizeText = (value) =>
  typeof value === "string" ? value.trim().toLowerCase() : "";

const getSqlSlug = (value) => {
  if (typeof value !== "string") return null;
  const slug = value.trim();
  return slug !== "" ? slug : null;
};

const asHttpUrlOrNull = (value) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed !== "" ? trimmed : null;
};

const resolvePosterUrl = (value) => asHttpUrlOrNull(value) || AnonymousBanner;

const getProductionGenres = (production) => {
  const fromGenres = Array.isArray(production?.genres)
    ? production.genres
        .map((genre) => (typeof genre === "string" ? genre : genre?.name))
        .filter((name) => typeof name === "string" && name.trim() !== "")
    : [];

  if (fromGenres.length > 0) return fromGenres;

  if (!Array.isArray(production?.production_genres)) return [];
  return production.production_genres
    .map((item) => item?.genres?.name)
    .filter((name) => typeof name === "string" && name.trim() !== "");
};

const getTotalViews = (production) => {
  const totalViews = toNumber(production?.total_views);
  if (totalViews != null) return totalViews;

  if (!Array.isArray(production?.episodes)) return 0;
  return production.episodes.reduce(
    (sum, episode) => sum + (toNumber(episode?.views_count) ?? 0),
    0,
  );
};

const formatCompactNumber = (value) => {
  const safeValue = toNumber(value) ?? 0;
  return new Intl.NumberFormat("vi-VN", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(safeValue);
};

const mapProductionToCard = (p) => ({
  id: p.id,
  title: p.title,
  originalTitle: p.title,
  slug: getSqlSlug(p.slug),
  poster: resolvePosterUrl(p.poster_url),
  year: p.release_year || null,
  rating: toNumber(p.rating_avg) ?? null,
  genres: getProductionGenres(p),
});

const mapProductionToHero = (p) => ({
  id: p.id,
  title: p.title,
  originalTitle: p.title,
  slug: getSqlSlug(p.slug),
  description: p.description || "",
  poster: resolvePosterUrl(p.poster_url),
  backdrop: asHttpUrlOrNull(p.banner_url) || AnonymousBanner,
  year: p.release_year || null,
  rating: toNumber(p.rating_avg) ?? null,
  genres: getProductionGenres(p),
});

const mapProductionToTrending = (p, idx) => ({
  id: p.id,
  rank: idx + 1,
  title: p.title,
  originalTitle: p.title,
  slug: getSqlSlug(p.slug),
  poster: resolvePosterUrl(p.poster_url),
  rating: toNumber(p.rating_avg) ?? 0,
  year: p.release_year || "",
  views: formatCompactNumber(getTotalViews(p)),
  trend: "same",
});

const filterByGenreKeywords = (productions, keywords) => {
  if (!Array.isArray(productions) || !Array.isArray(keywords)) return [];
  const normalizedKeywords = keywords.map(normalizeText).filter(Boolean);

  return productions.filter((production) => {
    const genres = getProductionGenres(production).map(normalizeText);
    return genres.some((genre) =>
      normalizedKeywords.some((keyword) => genre.includes(keyword)),
    );
  });
};

const HomePage = () => {
  const [productions, setProductions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const abortRef = useRef(null);

  useEffect(() => {
    abortRef.current?.abort?.();
    abortRef.current = new AbortController();

    const run = async () => {
      setIsLoading(true);
      try {
        const data = await listProductions({ signal: abortRef.current.signal });
        setProductions(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Failed to load productions:", e);
        setProductions([]);
      } finally {
        setIsLoading(false);
      }
    };

    run();
    return () => abortRef.current?.abort?.();
  }, []);

  const visibleProductions = useMemo(
    () =>
      productions.filter(
        (p) => p.type !== "season" && getSqlSlug(p.slug) != null,
      ),
    [productions],
  );

  const trendingSortedProductions = useMemo(() => {
    return [...visibleProductions].sort((a, b) => {
      const av = getTotalViews(a);
      const bv = getTotalViews(b);
      if (bv !== av) return bv - av;

      const ar = toNumber(a.rating_avg) ?? 0;
      const br = toNumber(b.rating_avg) ?? 0;
      return br - ar;
    });
  }, [visibleProductions]);

  const heroMovies = useMemo(
    () => trendingSortedProductions.slice(0, 5).map(mapProductionToHero),
    [trendingSortedProductions],
  );

  const sortedByRating = useMemo(() => {
    return [...visibleProductions].sort((a, b) => {
      const ar = toNumber(a.rating_avg) ?? 0;
      const br = toNumber(b.rating_avg) ?? 0;
      return br - ar;
    });
  }, [visibleProductions]);

  const sortedByNewest = useMemo(() => {
    return [...visibleProductions].sort((a, b) => {
      const ay = toNumber(a.release_year) ?? 0;
      const by = toNumber(b.release_year) ?? 0;
      if (by !== ay) return by - ay;

      const at = Date.parse(a.created_at || "") || 0;
      const bt = Date.parse(b.created_at || "") || 0;
      return bt - at;
    });
  }, [visibleProductions]);

  const trendingToday = useMemo(() => {
    return trendingSortedProductions.slice(0, 10).map(mapProductionToTrending);
  }, [trendingSortedProductions]);

  const trendingWeek = useMemo(() => {
    const sorted = [...visibleProductions].sort((a, b) => {
      const ac = toNumber(a.rating_count) ?? 0;
      const bc = toNumber(b.rating_count) ?? 0;
      if (bc !== ac) return bc - ac;

      const ar = toNumber(a.rating_avg) ?? 0;
      const br = toNumber(b.rating_avg) ?? 0;
      return br - ar;
    });

    return sorted.slice(0, 10).map(mapProductionToTrending);
  }, [visibleProductions]);

  const trendingMonth = useMemo(() => {
    return sortedByNewest.slice(0, 10).map(mapProductionToTrending);
  }, [sortedByNewest]);

  const trendingData = useMemo(
    () => ({ today: trendingToday, week: trendingWeek, month: trendingMonth }),
    [trendingMonth, trendingToday, trendingWeek],
  );

  const topGenreTabs = useMemo(() => {
    const counts = new Map();

    visibleProductions.forEach((production) => {
      getProductionGenres(production).forEach((genreName) => {
        const normalized = normalizeText(genreName);
        if (!normalized) return;

        const current = counts.get(normalized) || {
          name: genreName,
          total: 0,
        };
        current.total += 1;
        counts.set(normalized, current);
      });
    });

    return [...counts.values()]
      .sort((a, b) => b.total - a.total)
      .slice(0, 8)
      .map((item) => {
        const slug = item.name
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/đ/g, 'd')
          .replace(/Đ/g, 'D')
          .toLowerCase()
          .replace(/\s+/g, '-');
        return {
          name: item.name,
          link: `/movies?genre=${slug}`,
        };
      });
  }, [visibleProductions]);

  const recommended = useMemo(
    () => sortedByRating.slice(0, 6).map(mapProductionToCard),
    [sortedByRating],
  );
  const newReleases = useMemo(
    () => sortedByNewest.slice(0, 6).map(mapProductionToCard),
    [sortedByNewest],
  );
  const seriesHot = useMemo(
    () =>
      visibleProductions
        .filter((p) => p.type === "series")
        .map(mapProductionToCard)
        .slice(0, 6),
    [visibleProductions],
  );

  const actionMovies = useMemo(() => {
    const matched = filterByGenreKeywords(visibleProductions, [
      "action",
      "hanh dong",
      "hành động",
    ]);
    if (matched.length > 0) return matched.slice(0, 6).map(mapProductionToCard);
    return sortedByRating.slice(0, 6).map(mapProductionToCard);
  }, [visibleProductions, sortedByRating]);

  const animationMovies = useMemo(() => {
    const matched = filterByGenreKeywords(visibleProductions, [
      "animation",
      "anime",
      "hoat hinh",
      "hoạt hình",
    ]);
    if (matched.length > 0) return matched.slice(0, 6).map(mapProductionToCard);
    return sortedByNewest.slice(0, 6).map(mapProductionToCard);
  }, [visibleProductions, sortedByNewest]);

  return (
    <div className="homepage">
      {/* Hero Slider */}
      <HeroSlider movies={heroMovies} />

      {/* Main Content */}
      <div className="homepage-content">
        {/* Category Tabs */}
        <CategoryTabs categories={topGenreTabs} />

        {/* Trending Section */}
        <TrendingSection trendingData={trendingData} />

        {/* Movie Sections */}
        <CategorySection
          title="Phim Đề Xuất Cho Bạn"
          viewAllLink="/movies?sort=rating"
          movies={recommended}
        />

        <CategorySection
          title="Phim Mới Cập Nhật"
          viewAllLink="/movies?sort=newest"
          movies={newReleases}
        />

        <CategorySection
          title="Phim Bộ Hot"
          viewAllLink="/series?sort=trending"
          movies={seriesHot}
        />

        <CategorySection
          title="Phim Hành Động"
          viewAllLink="/movies?genre=hanh-dong"
          movies={actionMovies}
        />

        <CategorySection
          title="Phim Hoạt Hình"
          viewAllLink="/movies?genre=hoat-hinh"
          movies={animationMovies}
        />

        {isLoading && (
          <div className="text-white/70 text-sm px-5 pb-6">
            Đang tải dữ liệu...
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
