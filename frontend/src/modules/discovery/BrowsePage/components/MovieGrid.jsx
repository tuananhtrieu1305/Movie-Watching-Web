import React from "react";
import { MovieCard } from "./MovieCard";

export function MovieGrid({ results, clearAll }) {
  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="text-6xl mb-4">🎬</div>
        <h3 className="text-xl font-bold text-white mb-2">No results found</h3>
        <p className="text-gray-500 text-sm mb-6">
          Try adjusting or clearing your filters
        </p>
        <button
          type="button"
          onClick={clearAll}
          className="px-6 py-2.5 bg-[#ffdd95] text-gray-900 font-bold rounded-xl hover:bg-[#ffd175] transition-colors"
        >
          Clear all filters
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {results.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  );
}
