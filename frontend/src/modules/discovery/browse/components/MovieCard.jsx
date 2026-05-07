import React from "react";
import { Link } from "react-router-dom";
import { FaStar, FaFire } from "react-icons/fa";

export function MovieCard({ movie }) {
  return (
    <Link
      to={`/watch/${movie.slug}`}
      className="group relative block rounded-xl overflow-hidden bg-gray-900 border border-gray-800
        hover:border-[#ffdd95]/40 hover:shadow-xl hover:shadow-black/50 hover:-translate-y-1
        transition-all duration-300 ease-out focus-visible:ring-2 focus-visible:ring-[#ffdd95] focus-visible:outline-none"
    >
      <div className="relative aspect-[2/3] overflow-hidden">
        <img
          src={movie.poster}
          alt={movie.title}
          loading="lazy"
          width={300}
          height={450}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <span className="absolute top-2 left-2 bg-[#ffdd95] text-gray-900 text-[10px] font-black px-1.5 py-0.5 rounded">
          {movie.quality}
        </span>
        {movie.trending && (
          <span className="absolute top-2 right-2 flex items-center gap-1 bg-red-500/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
            <FaFire size={8} /> HOT
          </span>
        )}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>
      <div className="p-3">
        <h3
          className="text-white font-semibold text-sm leading-tight truncate min-w-0"
          title={movie.title}
        >
          {movie.title}
        </h3>
        <div className="flex items-center justify-between mt-1.5 text-xs text-gray-500">
          <span>{movie.year}</span>
          <span className="flex items-center gap-1 text-yellow-400 font-medium">
            <FaStar size={10} /> {movie.rating}
          </span>
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {movie.genre.slice(0, 2).map((g) => (
            <span
              key={g}
              className="text-[10px] bg-gray-800 text-gray-400 rounded px-1.5 py-0.5"
            >
              {g}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
