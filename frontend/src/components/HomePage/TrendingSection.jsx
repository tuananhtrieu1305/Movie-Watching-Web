import { useState } from "react";
import { Link } from "react-router-dom";

const TrendingSection = ({ trendingData = {} }) => {
  const [activeTab, setActiveTab] = useState("today");

  const currentData = Array.isArray(trendingData?.[activeTab])
    ? trendingData[activeTab]
    : [];

  const tabs = [
    { id: "today", label: "Today" },
    { id: "week", label: "This Week" },
    { id: "month", label: "This Month" },
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
        {currentData.length > 0 ? (
          currentData.map((movie) => (
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
          ))
        ) : (
          <div className="text-white/70 text-sm">Chưa có dữ liệu top trending.</div>
        )}
      </div>

      <Link to="/movies?trending=true&sort=rating" className="trending-view-all">
        View All Top 100
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
        </svg>
      </Link>
    </section>
  );
};

export default TrendingSection;