import { useState } from "react";
import { Link } from "react-router-dom";

const TrendingSection = () => {
  const [activeTab, setActiveTab] = useState("today");

  // Mock trending data
  const trendingData = {
    today: [
      {
        id: 1,
        rank: 1,
        title: "Biệt Đội Đáp Phá",
        originalTitle: "The Wrecking Crew",
        slug: "biet-doi-dap-pha",
        poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&h=450&fit=crop",
        rating: 8.5,
        year: 2024,
        views: "2.5M",
        trend: "up",
      },
      {
        id: 2,
        rank: 2,
        title: "Avatar: The Way of Water",
        originalTitle: "Avatar 2",
        slug: "avatar-2",
        poster: "https://images.unsplash.com/photo-1574267432644-f610a6733e3e?w=300&h=450&fit=crop",
        rating: 8.2,
        year: 2024,
        views: "2.1M",
        trend: "up",
      },
      {
        id: 3,
        rank: 3,
        title: "John Wick 4",
        originalTitle: "John Wick: Chapter 4",
        slug: "john-wick-4",
        poster: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=300&h=450&fit=crop",
        rating: 8.8,
        year: 2024,
        views: "1.9M",
        trend: "up",
      },
      {
        id: 4,
        rank: 4,
        title: "The Batman",
        originalTitle: "The Batman",
        slug: "the-batman",
        poster: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=300&h=450&fit=crop",
        rating: 8.3,
        year: 2024,
        views: "1.7M",
        trend: "down",
      },
      {
        id: 5,
        rank: 5,
        title: "Spider-Man: No Way Home",
        originalTitle: "Spider-Man",
        slug: "spiderman-no-way-home",
        poster: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=300&h=450&fit=crop",
        rating: 8.9,
        year: 2024,
        views: "1.5M",
        trend: "same",
      },
      {
        id: 6,
        rank: 6,
        title: "Dune: Part Two",
        originalTitle: "Dune 2",
        slug: "dune-2",
        poster: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=300&h=450&fit=crop",
        rating: 8.6,
        year: 2024,
        views: "1.4M",
        trend: "up",
      },
      {
        id: 7,
        rank: 7,
        title: "Oppenheimer",
        originalTitle: "Oppenheimer",
        slug: "oppenheimer",
        poster: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=300&h=450&fit=crop",
        rating: 8.7,
        year: 2024,
        views: "1.3M",
        trend: "up",
      },
      {
        id: 8,
        rank: 8,
        title: "Guardians of the Galaxy 3",
        originalTitle: "GOTG Vol. 3",
        slug: "gotg-3",
        poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&h=450&fit=crop",
        rating: 8.1,
        year: 2024,
        views: "1.2M",
        trend: "down",
      },
      {
        id: 9,
        rank: 9,
        title: "The Flash",
        originalTitle: "The Flash",
        slug: "the-flash",
        poster: "https://images.unsplash.com/photo-1574267432644-f610a6733e3e?w=300&h=450&fit=crop",
        rating: 7.8,
        year: 2024,
        views: "1.1M",
        trend: "same",
      },
      {
        id: 10,
        rank: 10,
        title: "Mission: Impossible 7",
        originalTitle: "Dead Reckoning",
        slug: "mi-7",
        poster: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=300&h=450&fit=crop",
        rating: 8.4,
        year: 2024,
        views: "1.0M",
        trend: "up",
      },
    ],
    week: [],
    month: [],
  };

  const currentData = trendingData[activeTab];

  const tabs = [
    { id: "today", label: "Hôm Nay" },
    { id: "week", label: "Tuần Này" },
    { id: "month", label: "Tháng Này" },
  ];

  const getTrendIcon = (trend) => {
    if (trend === "up") {
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="trend-icon trend-up">
          <path d="M7 14l5-5 5 5z" />
        </svg>
      );
    } else if (trend === "down") {
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="trend-icon trend-down">
          <path d="M7 10l5 5 5-5z" />
        </svg>
      );
    }
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="trend-icon trend-same">
        <path d="M8 12h8" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  };

  return (
    <section className="trending-section">
      <div className="trending-header">
        <h2 className="trending-title">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="trending-title-icon">
            <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" />
          </svg>
          Top Trending
        </h2>
        <div className="trending-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`trending-tab ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="trending-list">
        {currentData.map((movie) => (
          <Link
            key={movie.id}
            to={`/watch/${movie.slug}`}
            className="trending-item"
          >
            <div className="trending-rank">
              <span className={`rank-number ${movie.rank <= 3 ? "rank-top" : ""}`}>
                {movie.rank}
              </span>
              {getTrendIcon(movie.trend)}
            </div>

            <div className="trending-poster">
              <img src={movie.poster} alt={movie.title} loading="lazy" />
              <div className="trending-overlay">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>

            <div className="trending-info">
              <h3 className="trending-movie-title">{movie.title}</h3>
              <p className="trending-original">{movie.originalTitle}</p>
              <div className="trending-meta">
                <span className="trending-rating">⭐ {movie.rating}</span>
                <span className="trending-year">{movie.year}</span>
                <span className="trending-views">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                  </svg>
                  {movie.views}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <Link to="/trending" className="trending-view-all">
        Xem Toàn Bộ Top 100
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
        </svg>
      </Link>
    </section>
  );
};

export default TrendingSection;
