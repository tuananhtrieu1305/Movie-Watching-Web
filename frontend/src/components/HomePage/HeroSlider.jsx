import { useState } from "react";
import { Link } from "react-router-dom";

const HeroSlider = ({ movies = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Mock data nếu không có movies
  const defaultMovies = [
    {
      id: 1,
      title: "Biệt Đội Đáp Phá",
      originalTitle: "The Wrecking Crew",
      slug: "biet-doi-dap-pha",
      description:
        "Hai anh em cùng cha khác mẹ, Jonny và James, đã xa cách từ lâu, buộc phải tái ngộ sau cái chết đầy bí ẩn của người cha. Trong hành trình tìm kiếm sự thật, những bí mật bị chôn vùi dần lộ diện, hé mở một âm mưu có thể xé rạch gia đình họ mãi mãi.",
      backdrop: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1920",
      rating: 6.5,
      year: 2024,
      duration: "2h 04m",
      quality: "4K",
      ageRating: "T16",
      genres: ["Hành Động", "Gia Đình", "Hình Sự", "Bí Ẩn", "Hài", "Phiêu Lưu"],
      thumbnails: [
        "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300",
        "https://images.unsplash.com/photo-1574267432644-f610a6733e3e?w=300",
        "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=300",
        "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=300",
        "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=300",
      ],
    },
  ];

  const displayMovies = movies.length > 0 ? movies : defaultMovies;
  const currentMovie = displayMovies[currentIndex];

  return (
    <div className="hero-slider">
      <div
        className="hero-slide"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.3) 100%), url(${currentMovie.backdrop})`,
        }}
      >
        <div className="hero-content">
          {/* Movie Info */}
          <div className="hero-info">
            <h1 className="hero-title">{currentMovie.title}</h1>
            {currentMovie.originalTitle && (
              <p className="hero-original-title">{currentMovie.originalTitle}</p>
            )}

            {/* Movie Meta */}
            <div className="hero-meta">
              <span className="meta-badge meta-imdb">
                <span className="imdb-label">IMDb</span> {currentMovie.rating}
              </span>
              <span className="meta-badge meta-quality">{currentMovie.quality}</span>
              <span className="meta-badge meta-age">{currentMovie.ageRating}</span>
              <span className="meta-text">{currentMovie.year}</span>
              <span className="meta-text">{currentMovie.duration}</span>
            </div>

            {/* Genres */}
            <div className="hero-genres">
              {currentMovie.genres.map((genre, index) => (
                <Link key={index} to={`/genre/${genre}`} className="genre-tag">
                  {genre}
                </Link>
              ))}
            </div>

            {/* Description */}
            <p className="hero-description">{currentMovie.description}</p>

            {/* Action Buttons */}
            <div className="hero-actions">
              <Link to={`/watch/${currentMovie.slug}`} className="hero-btn hero-btn-play">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
                <span>Xem Ngay</span>
              </Link>
              <button className="hero-btn hero-btn-secondary">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>
              <button className="hero-btn hero-btn-secondary">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Thumbnails Gallery */}
          {currentMovie.thumbnails && currentMovie.thumbnails.length > 0 && (
            <div className="hero-thumbnails">
              {currentMovie.thumbnails.map((thumb, index) => (
                <div key={index} className="hero-thumbnail">
                  <img src={thumb} alt={`Scene ${index + 1}`} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Slider Indicators */}
      {displayMovies.length > 1 && (
        <div className="hero-indicators">
          {displayMovies.map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === currentIndex ? "active" : ""}`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroSlider;
