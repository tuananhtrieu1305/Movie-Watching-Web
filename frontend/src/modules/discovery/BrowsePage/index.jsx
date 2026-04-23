import React, { useMemo, useState, useEffect } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import { GENRES, TYPES, COUNTRIES, SORT_OPTIONS } from "./constants";
import { getMovies } from "../../../services/movieService";
import { Spin } from "antd";
import { ActiveFilterBadge } from "./components/FilterComponents";
import { BrowseSidebar } from "./components/BrowseSidebar";
import { MovieGrid } from "./components/MovieGrid";

export default function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  // Initialize state from URL
  const selectedGenres = useMemo(() => {
    const genres = searchParams.get("genre");
    return genres ? genres.split(",") : [];
  }, [searchParams]);

  const selectedType = useMemo(() => {
    const typeParam = searchParams.get("type");
    if (typeParam) return typeParam;
    if (location.pathname.includes("/series")) return "series";
    return null;
  }, [searchParams, location.pathname]);

  const selectedCountry = searchParams.get("country");
  const sortBy = searchParams.get("sort") || "newest";

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch data từ API khi filters thay đổi
  useEffect(() => {
    let isMounted = true;
    const fetchFilteredMovies = async () => {
      try {
        setLoading(true);
        // Build query params
        const filters = {};
        if (selectedGenres.length > 0) filters.genre = selectedGenres.join(",");
        if (selectedType) filters.type = selectedType;
        if (selectedCountry) filters.country = selectedCountry;
        
        // Map UI sort to API sort
        if (sortBy === "rating") {
          filters.sort = "rating";
        } else if (sortBy === "trending") {
          filters.sort = "popular";
        } else if (sortBy === "title") {
          filters.sort = "title";
        } else {
          filters.sort = "latest"; // Cho newest hoặc mặc định
        }

        const data = await getMovies(filters);
        
        if (isMounted) {
          // Map data chuẩn hoá cho MovieGrid
          const mappedData = data.map((item) => ({
            id: item.id,
            title: item.title,
            slug: item.slug,
            poster: item.poster_url,
            quality: "HD", 
            trending: item.total_views > 1000,
            year: item.release_year,
            rating: item.rating_avg || "0.0",
            genre: (item.genres || []).map((g) => g.name),
            type: item.type,
            country: item.country
          }));
          setMovies(mappedData);
        }
      } catch (err) {
        console.error("Lỗi khi filter phim:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchFilteredMovies();
    return () => { isMounted = false; };
  }, [selectedGenres, selectedType, selectedCountry, sortBy]);

  // Helper method to update URLSearchParams
  const updateFilters = (updates) => {
    const newParams = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (
        value === null ||
        value === false ||
        value === undefined ||
        value === "" ||
        (Array.isArray(value) && value.length === 0)
      ) {
        newParams.delete(key);
      } else {
        newParams.set(
          key,
          Array.isArray(value) ? value.join(",") : String(value),
        );
      }
    });

    if (newParams.get("sort") === "newest") {
      newParams.delete("sort"); // keep URL clean since it's the default
    }

    setSearchParams(newParams, { replace: true });
  };

  const toggleGenre = (g) => {
    const nextGenres = selectedGenres.includes(g)
      ? selectedGenres.filter((x) => x !== g)
      : [...selectedGenres, g];
    updateFilters({ genre: nextGenres });
  };

  const setSelectedType = (type) => updateFilters({ type });
  const setSelectedCountry = (country) => updateFilters({ country });
  const setSortBy = (sort) => updateFilters({ sort });

  const clearAll = () => {
    setSearchParams({}, { replace: true });
  };

  const results = movies;

  const activeFilters = [
    ...selectedGenres.map((g) => ({
      label: GENRES.find((genre) => genre.value === g)?.label || g,
      onRemove: () => toggleGenre(g),
    })),
    ...(selectedType
      ? [
          {
            label: TYPES.find((t) => t.value === selectedType)?.label,
            onRemove: () => setSelectedType(null),
          },
        ]
      : []),
    ...(selectedCountry
      ? [
          {
            label: COUNTRIES.find((c) => c.value === selectedCountry)?.label,
            onRemove: () => setSelectedCountry(null),
          },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white pt-20 pb-16">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex gap-8">
          {/* ── LEFT SIDEBAR ── */}
          <BrowseSidebar
            selectedGenres={selectedGenres}
            toggleGenre={toggleGenre}
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            selectedCountry={selectedCountry}
            setSelectedCountry={setSelectedCountry}
            activeFiltersCount={activeFilters.length}
            clearAll={clearAll}
          />

          {/* ── MAIN CONTENT ── */}
          <div className="flex-1 min-w-0">
            {/* Sort + result count bar */}
            <div className="flex items-center justify-between mb-5 gap-4">
              <p className="text-sm text-gray-500 shrink-0">
                <span className="text-white font-semibold">
                  {results.length}
                </span>{" "}
                phim
              </p>
              <div className="flex gap-2 flex-wrap justify-end">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSortBy(opt.value)}
                    className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200
                      ${
                        sortBy === opt.value
                          ? "bg-[#ffdd95] text-gray-900"
                          : "bg-gray-900 text-gray-400 border border-gray-800 hover:border-gray-600 hover:text-white"
                      }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Active filter badges */}
            {activeFilters.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap mb-4 p-3 bg-gray-900/50 rounded-xl border border-gray-800">
                <span className="text-xs text-gray-500 font-medium">
                  Đang chọn:
                </span>
                {activeFilters.map((f, i) => (
                  <ActiveFilterBadge
                    key={i}
                    label={f.label}
                    onRemove={f.onRemove}
                  />
                ))}
              </div>
            )}

            {/* Grid */}
            {loading ? (
              <div className="flex justify-center items-center py-32">
                <Spin size="large" />
              </div>
            ) : (
              <MovieGrid results={results} clearAll={clearAll} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
