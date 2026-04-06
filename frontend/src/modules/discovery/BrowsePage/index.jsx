import React, { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import { TYPES, COUNTRIES, SORT_OPTIONS } from "./constants";
import { MOCK_MOVIES } from "./mockData";
import { ActiveFilterBadge } from "./components/FilterComponents";
import { BrowseSidebar } from "./components/BrowseSidebar";
import { MovieGrid } from "./components/MovieGrid";

export default function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const prevPathname = useRef(location.pathname);

  // Initialize state from URL
  const [selectedGenres, setSelectedGenres] = useState(() => {
    const genres = searchParams.get("genre");
    return genres ? genres.split(",") : [];
  });

  const [selectedType, setSelectedType] = useState(() => {
    const typeParam = searchParams.get("type");
    if (typeParam) return typeParam;
    if (location.pathname.includes("/series")) return "series";
    // Defaults to null (All) for /movies or other paths
    return null;
  });

  const [selectedCountry, setSelectedCountry] = useState(
    searchParams.get("country") || null,
  );
  const [selectedLanguage, setSelectedLanguage] = useState(
    searchParams.get("lang") || null,
  );
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "trending");
  const [onlyTrending, setOnlyTrending] = useState(
    searchParams.get("trending") === "true",
  );

  // Update URL when state changes
  useEffect(() => {
    const params = {};
    if (selectedGenres.length) params.genre = selectedGenres.join(",");
    if (selectedType) params.type = selectedType;
    if (selectedCountry) params.country = selectedCountry;
    if (selectedLanguage) params.lang = selectedLanguage;
    if (sortBy !== "trending") params.sort = sortBy;
    if (onlyTrending) params.trending = "true";

    setSearchParams(params, { replace: true });
  }, [
    selectedGenres,
    selectedType,
    selectedCountry,
    selectedLanguage,
    sortBy,
    onlyTrending,
    setSearchParams,
  ]);

  // Handle path changes (e.g., clicking 'Series' in header while on /movies)
  // Only resets type if the path actually changes and no type is in URL
  useEffect(() => {
    if (prevPathname.current !== location.pathname) {
      const typeParam = searchParams.get("type");
      if (!typeParam) {
        if (location.pathname.includes("/series")) setSelectedType("series");
        else setSelectedType(null); // Defaults to All for /movies or others
      }
      prevPathname.current = location.pathname;
    }
  }, [location.pathname, searchParams]);

  const toggleGenre = (g) =>
    setSelectedGenres((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g],
    );

  const results = useMemo(() => {
    let list = MOCK_MOVIES;
    if (selectedGenres.length)
      list = list.filter((m) => selectedGenres.some((g) => m.genre.includes(g)));
    if (selectedType) list = list.filter((m) => m.type === selectedType);
    if (selectedCountry)
      list = list.filter((m) => m.country === selectedCountry);
    if (selectedLanguage)
      list = list.filter((m) => m.language === selectedLanguage);
    if (onlyTrending) list = list.filter((m) => m.trending);

    return [...list].sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "newest") return b.year - a.year;
      if (sortBy === "title") return a.title.localeCompare(b.title);
      return b.trending - a.trending || b.rating - a.rating;
    });
  }, [
    selectedGenres,
    selectedType,
    selectedCountry,
    selectedLanguage,
    sortBy,
    onlyTrending,
  ]);

  const activeFilters = [
    ...selectedGenres.map((g) => ({ label: g, onRemove: () => toggleGenre(g) })),
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
    ...(selectedLanguage
      ? [{ label: selectedLanguage, onRemove: () => setSelectedLanguage(null) }]
      : []),
    ...(onlyTrending
      ? [{ label: "🔥 Trending", onRemove: () => setOnlyTrending(false) }]
      : []),
  ];

  const clearAll = () => {
    setSelectedGenres([]);
    setSelectedType(null);
    setSelectedCountry(null);
    setSelectedLanguage(null);
    setOnlyTrending(false);
  };

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
            selectedLanguage={selectedLanguage}
            setSelectedLanguage={setSelectedLanguage}
            onlyTrending={onlyTrending}
            setOnlyTrending={setOnlyTrending}
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
                title{results.length !== 1 ? "s" : ""}
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
                  Active:
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
            <MovieGrid results={results} clearAll={clearAll} />
          </div>
        </div>
      </div>
    </div>
  );
}
