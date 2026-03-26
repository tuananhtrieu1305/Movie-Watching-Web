import { Link } from "react-router-dom";

const MovieCard = ({ movie }) => {
  return (
    <Link to={`/watch/${movie.slug}`} className="movie-card">
      <div className="movie-card-poster">
        <img src={movie.poster} alt={movie.title} loading="lazy" />
        <div className="movie-card-overlay">
          <button className="movie-card-play">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        </div>
        {movie.quality && <span className="movie-card-quality">{movie.quality}</span>}
        {movie.episode && <span className="movie-card-episode">{movie.episode}</span>}
      </div>
      <div className="movie-card-info">
        <h3 className="movie-card-title">{movie.title}</h3>
        {movie.originalTitle && (
          <p className="movie-card-original">{movie.originalTitle}</p>
        )}
        <div className="movie-card-meta">
          {movie.year && <span>{movie.year}</span>}
          {movie.rating && (
            <span className="movie-rating">
              ⭐ {movie.rating}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

const CategorySection = ({ title, movies = [], viewAllLink }) => {
  // Mock data nếu không có movies
  const defaultMovies = Array.from({ length: 6 }, (_, i) => ({
    id: i + 1,
    title: `Phim ${i + 1}`,
    originalTitle: `Movie ${i + 1}`,
    slug: `movie-${i + 1}`,
    poster: `https://images.unsplash.com/photo-${1536440136628 + i * 100000}-849c177e76a1?w=300&h=450&fit=crop`,
    quality: i % 2 === 0 ? "HD" : "4K",
    year: 2024,
    rating: (7 + Math.random() * 2).toFixed(1),
    episode: i % 3 === 0 ? `Tập ${i + 1}` : null,
  }));

  const displayMovies = movies.length > 0 ? movies : defaultMovies;

  return (
    <section className="category-section">
      <div className="category-header">
        <h2 className="category-title">{title}</h2>
        {viewAllLink && (
          <Link to={viewAllLink} className="category-view-all">
            Xem tất cả
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
            </svg>
          </Link>
        )}
      </div>
      <div className="category-grid">
        {displayMovies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </section>
  );
};

export default CategorySection;
