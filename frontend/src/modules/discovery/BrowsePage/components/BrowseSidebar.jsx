import React from "react";
import { GENRES, TYPES, COUNTRIES } from "../constants";
import { SidebarSection, SidebarChip } from "./FilterComponents";

export function BrowseSidebar({
  selectedGenres,
  toggleGenre,
  selectedType,
  setSelectedType,
  selectedCountry,
  setSelectedCountry,
  activeFiltersCount,
  clearAll,
}) {
  return (
    <aside className="hidden lg:flex flex-col w-52 shrink-0">
      <div className="sticky top-24 space-y-1">
        {/* Genre */}
        <SidebarSection title="Thể loại">
          <div className="space-y-0.5">
            {GENRES.map((g) => (
              <SidebarChip
                key={g.value}
                label={g.label}
                active={selectedGenres.includes(g.value)}
                onClick={() => toggleGenre(g.value)}
              />
            ))}
          </div>
        </SidebarSection>

        {/* Type */}
        <SidebarSection title="Định dạng">
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
        <SidebarSection title="Quốc gia">
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


        {/* Clear all */}
        {activeFiltersCount > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="w-full text-xs text-gray-500 hover:text-red-400 transition-colors font-medium py-2 focus-visible:ring-1 focus-visible:ring-red-400 rounded"
          >
            Xóa tất cả bộ lọc
          </button>
        )}
      </div>
    </aside>
  );
}
