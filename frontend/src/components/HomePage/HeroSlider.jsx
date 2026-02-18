import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const HeroSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);

  // Cố định 5 bộ phim đề xuất
  const featuredMovies = [
    {
      id: 1,
      title: "The Dark Knight",
      originalTitle: "The Dark Knight",
      slug: "the-dark-knight",
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
        "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=300",
      ],
    },
    {
      id: 2,
      title: "Inception",
      originalTitle: "Inception",
      slug: "inception",
      description:
        "Gru và gia đình đối mặt với một kẻ thù mới đầy nguy hiểm trong cuộc phiêu lưu hoành tráng nhất từ trước đến nay. Cùng với đội quân Minions trung thành, họ phải ngăn chặn một âm mưu đe dọa cả thế giới.",
      backdrop: "https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=1920",
      rating: 7.2,
      year: 2024,
      duration: "1h 34m",
      quality: "4K",
      ageRating: "P",
      genres: ["Hoạt Hình", "Hài", "Gia Đình", "Phiêu Lưu"],
      thumbnails: [
        "https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=300",
        "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=300",
        "https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=300",
        "https://images.unsplash.com/photo-1571847140471-1d7766e825ea?w=300",
        "https://images.unsplash.com/photo-1608889476561-6242cfdbf622?w=300",
        "https://images.unsplash.com/photo-1567095761054-7a02e69e5c43?w=300",
      ],
    },
    {
      id: 3,
      title: "Parasite",
      originalTitle: "Parasite",
      slug: "parasite",
      description:
        "Quay trở lại ngày đầu tiên của cuộc xâm lược, khi thế giới biết đến những sinh vật săn mồi bằng âm thanh. Một cô gái phải tìm cách sống sót trong thành phố New York đầy hỗn loạn và chết chóc.",
      backdrop: "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=1920",
      rating: 7.8,
      year: 2024,
      duration: "1h 39m",
      quality: "4K",
      ageRating: "T16",
      genres: ["Kinh Dị", "Khoa Học Viễn Tưởng", "Hồi Hộp"],
      thumbnails: [
        "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=300",
        "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=300",
        "https://images.unsplash.com/photo-1574267432644-15fb4e1e8e43?w=300",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300",
        "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300",
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300",
      ],
    },
    {
      id: 4,
      title: "Spirited Away",
      originalTitle: "Spirited Away",
      slug: "spirited-away",
      description:
        "Wade Wilson đối mặt với một mối đe dọa lớn hơn bao giờ hết và phải hợp tác với một phiên bản Wolverine từ vũ trụ khác. Cùng nhau, họ phải ngăn chặn một kế hoạch có thể hủy diệt đa vũ trụ.",
      backdrop: "https://images.unsplash.com/photo-1549989476-69a92fa57c36?w=1920",
      rating: 8.5,
      year: 2024,
      duration: "2h 08m",
      quality: "4K",
      ageRating: "T18",
      genres: ["Hành Động", "Hài", "Khoa Học Viễn Tưởng", "Siêu Anh Hùng"],
      thumbnails: [
        "https://images.unsplash.com/photo-1549989476-69a92fa57c36?w=300",
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300",
        "https://images.unsplash.com/photo-1557862921-37829c790f19?w=300",
        "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300",
        "https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=300",
        "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=300",
      ],
    },
    {
      id: 5,
      title: "Avengers: Endgame",
      originalTitle: "Avengers: Endgame",
      slug: "avengers-endgame",
      description:
        "Paul Atreides đoàn tụ với Chani và người Fremen trong cuộc hành trình báo thù những kẻ đã hủy hoại gia đình mình. Đối mặt với sự lựa chọn giữa tình yêu và số phận của vũ trụ, anh phải ngăn chặn một tương lai khủng khiếp mà chỉ mình anh có thể nhìn thấy.",
      backdrop: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920",
      rating: 8.9,
      year: 2024,
      duration: "2h 46m",
      quality: "4K",
      ageRating: "T13",
      genres: ["Khoa Học Viễn Tưởng", "Phiêu Lưu", "Hành Động", "Chính Kịch"],
      thumbnails: [
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300",
        "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=300",
        "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=300",
        "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=300",
        "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=300",
        "https://images.unsplash.com/photo-1464802686167-b939a6910659?w=300",
      ],
    },
  ];

  // Thêm slide đầu tiên vào cuối để tạo infinite loop
  const slidesWithClone = [...featuredMovies, featuredMovies[0]];

  const currentMovie = featuredMovies[currentIndex];

  // Auto-play slider với infinite loop
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => prevIndex + 1);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  // Reset về slide đầu tiên khi đến slide clone
  useEffect(() => {
    if (currentIndex === featuredMovies.length) {
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

  return (
    <div className="hero-slider">
      <div 
        className="hero-slides-container" 
        style={{ 
          transform: `translateX(-${currentIndex * 100}%)`,
          transition: isTransitioning ? 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)' : 'none'
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
                  <span className="meta-badge meta-imdb">
                    <span className="imdb-label">IMDb</span> {movie.rating}
                  </span>
                  <span className="meta-badge meta-quality">{movie.quality}</span>
                  <span className="meta-badge meta-age">{movie.ageRating}</span>
                  <span className="meta-text">{movie.year}</span>
                  <span className="meta-text">{movie.duration}</span>
                </div>

                {/* Genres */}
                <div className="hero-genres">
                  {movie.genres.map((genre, idx) => (
                    <Link key={idx} to={`/genre/${genre}`} className="genre-tag">
                      {genre}
                    </Link>
                  ))}
                </div>

                {/* Description */}
                <p className="hero-description">{movie.description}</p>

                {/* Action Buttons */}
                <div className="hero-actions">
                  <Link to={`/watch/${movie.slug}`} className="hero-btn hero-btn-play">
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
