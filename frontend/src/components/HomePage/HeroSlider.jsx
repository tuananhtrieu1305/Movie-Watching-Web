import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const HeroSlider = ({ movies = [] }) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);

  const featuredMovies = useMemo(() => movies.slice(0, 5), [movies]);

  // Thêm slide đầu tiên vào cuối để tạo infinite loop
  const slidesWithClone =
    featuredMovies.length > 0 ? [...featuredMovies, featuredMovies[0]] : [];

  // Auto-play slider với infinite loop
  useEffect(() => {
    if (featuredMovies.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => prevIndex + 1);
    }, 6000);

    return () => clearInterval(interval);
  }, [featuredMovies.length]);

  // Reset về slide đầu tiên khi đến slide clone
  useEffect(() => {
    if (featuredMovies.length > 0 && currentIndex === featuredMovies.length) {
      // Chờ transition hoàn tất
      setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(0);
        // Bật lại transition sau khi reset
        setTimeout(() => {
          setIsTransitioning(true);
        }, 50);
      }, 800); // Thời gian khớp với CSS transition
    }
  }, [currentIndex]);

  const handleIndicatorClick = (index) => {
    if (index === currentIndex) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
  };

  if (featuredMovies.length === 0) {
    return (
      <div className="hero-slider">
        <div className="text-white/70 text-sm p-6">Đang tải dữ liệu...</div>
      </div>
    );
  }

  return (
    <div className="hero-slider">
      <div
        className="hero-slides-container"
        style={{
          transform: `translateX(-${currentIndex * 100}%)`,
          transition: isTransitioning
            ? "transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)"
            : "none",
        }}
      >
        {slidesWithClone.map((movie, index) => (
          <div
            key={`${movie.id}-${index}`}
            className="hero-slide"
            style={{
              backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.3) 100%), url(${movie.backdrop})`,
            }}
          >
            <div className="hero-content">
              <div className="hero-info">
                <h1 className="hero-title">{movie.title}</h1>
                {movie.originalTitle && (
                  <p className="hero-original-title">{movie.originalTitle}</p>
                )}

                {/* Movie Meta */}
                <div className="hero-meta">
                  {movie.rating != null && (
                    <span className="meta-badge meta-imdb">
                      <span className="imdb-label">IMDb</span> {movie.rating}
                    </span>
                  )}
                  {movie.quality && (
                    <span className="meta-badge meta-quality">
                      {movie.quality}
                    </span>
                  )}
                  {movie.ageRating && (
                    <span className="meta-badge meta-age">
                      {movie.ageRating}
                    </span>
                  )}
                  {movie.year && (
                    <span className="meta-text">{movie.year}</span>
                  )}
                  {movie.duration && (
                    <span className="meta-text">{movie.duration}</span>
                  )}
                </div>

                {/* Genres */}
                {Array.isArray(movie.genres) && movie.genres.length > 0 && (
                  <div className="hero-genres">
                    {movie.genres.map((genre, idx) => (
                      <Link
                        key={idx}
                        to={`/genre/${genre}`}
                        className="genre-tag"
                      >
                        {genre}
                      </Link>
                    ))}
                  </div>
                )}

                {/* Description */}
                {movie.description && (
                  <p className="hero-description">{movie.description}</p>
                )}

                {/* Action Buttons */}
                <div className="hero-actions">
                  <Link
                    to={`/watch/${movie.slug}`}
                    className="hero-btn hero-btn-play"
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    <span>Watch Now</span>
                  </Link>

                  <button
                    className="hero-btn hero-btn-secondary"
                    onClick={() => navigate(`/watch/${movie.slug}`)}
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Slider Indicators */}
      <div className="hero-indicators">
        {featuredMovies.map((_, index) => (
          <button
            key={index}
            className={`indicator ${index === currentIndex ? "active" : ""}`}
            onClick={() => handleIndicatorClick(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;
