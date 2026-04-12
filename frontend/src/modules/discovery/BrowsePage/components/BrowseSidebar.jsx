import React from "react";
import { GENRES, TYPES, COUNTRIES, LANGUAGES } from "../constants";
import { SidebarSection, SidebarChip } from "./FilterComponents";

export function BrowseSidebar({
  selectedGenres,
  toggleGenre,
  selectedType,
  setSelectedType,
  selectedCountry,
  setSelectedCountry,
  selectedLanguage,
  setSelectedLanguage,
  onlyTrending,
  setOnlyTrending,
  activeFiltersCount,
  clearAll,
}) {
  return (
    <aside className="hidden lg:flex flex-col w-52 shrink-0">
      <div className="sticky top-24 space-y-1">
        {/* Genre */}
        <SidebarSection title="Genre">
          <div className="space-y-0.5">
            {GENRES.map((g) => (
              <SidebarChip
                key={g}
                label={g}
                active={selectedGenres.includes(g)}
                onClick={() => toggleGenre(g)}
              />
            ))}
          </div>
        </SidebarSection>

        {/* Type */}
        <SidebarSection title="Type">
          <div className="space-y-0.5">
            {TYPES.map((t) => (
              <SidebarChip
                key={t.value}
                label={t.label}
                active={selectedType === t.value}
                onClick={() =>
                  setSelectedType(selectedType === t.value ? null : t.value)
                }
              />
            ))}
          </div>
        </SidebarSection>

        {/* Country */}
        <SidebarSection title="Country">
          <div className="space-y-0.5">
            {COUNTRIES.map((c) => (
              <SidebarChip
                key={c.value}
                label={c.label}
                active={selectedCountry === c.value}
                onClick={() =>
                  setSelectedCountry(
                    selectedCountry === c.value ? null : c.value,
                  )
                }
              />
            ))}
          </div>
        </SidebarSection>

        {/* Language */}
        <SidebarSection title="Language">
          <div className="space-y-0.5">
            {LANGUAGES.map((l) => (
              <SidebarChip
                key={l.value}
                label={l.label}
                active={selectedLanguage === l.value}
                onClick={() =>
                  setSelectedLanguage(
                    selectedLanguage === l.value ? null : l.value,
                  )
                }
              />
            ))}
          </div>
        </SidebarSection>

        {/* Trending toggle */}
        <SidebarSection title="More">
          <SidebarChip
            label="🔥 Trending Only"
            active={onlyTrending}
            onClick={() => setOnlyTrending(!onlyTrending)}
          />
        </SidebarSection>

        {/* Clear all */}
        {activeFiltersCount > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="w-full text-xs text-gray-500 hover:text-red-400 transition-colors font-medium py-2 focus-visible:ring-1 focus-visible:ring-red-400 rounded"
          >
            Clear all filters
          </button>
        )}
      </div>
    </aside>
  );
}
