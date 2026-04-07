import React, { useEffect, useState } from "react";
import { FaHistory } from "react-icons/fa";
import { Link } from "react-router-dom";
import { historyApi } from "../services/historyApi";
import { useAuth } from "../../auth/hooks/useAuth";

const HistoryPage = () => {
  const { accessToken } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadHistory = async () => {
    if (!accessToken) return;

    setLoading(true);
    try {
      const data = await historyApi.getMyHistory(accessToken);
      setItems(data.history || []);
    } catch (error) {
      console.error("Get history error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [accessToken]);

  return (
    <div>
      {/* Section Title */}
      <div className="flex items-center gap-2 mb-6">
        <FaHistory className="text-xl text-white" />
        <h2 className="text-2xl font-bold text-white">Continue Watching</h2>
      </div>

      {/* Content */}
      <div className="bg-[#2a2a2d] rounded-lg p-8 shadow-lg">
        {loading ? (
          <p className="text-gray-400 text-center py-10">
            Đang tải lịch sử xem...
          </p>
        ) : items.length === 0 ? (
          <p className="text-gray-400 text-center py-10">
            Bạn chưa xem phim nào gần đây.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <div
                key={`${item.user_id}-${item.episode_id}`}
                className="bg-[#1f1f22] border border-gray-700 rounded-lg overflow-hidden relative"
              >
                <img
                  src={
                    item.episodes?.production?.poster_url ||
                    "/default-avatar.png"
                  }
                  alt={item.episodes?.production?.title}
                  className="w-full h-56 object-cover"
                />

                {/* Thanh progress màu vàng bên dưới ảnh */}
                <div className="absolute top-56 left-0 right-0 h-1 bg-gray-800 -mt-1 z-10 w-full">
                  <div
                    className="h-full bg-[#ffdd95]"
                    style={{
                      width: `${Math.min(Number(item.watched_percent) || 0, 100)}%`,
                    }}
                  />
                </div>

                <div className="p-4 pt-5">
                  <h3 className="text-white font-semibold mb-1 line-clamp-1">
                    {item.episodes?.production?.seasons 
                      ? `${item.episodes.production.seasons.series?.productions?.title} - ${item.episodes.production.title}`
                      : item.episodes?.production?.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-3">
                    Tập {item.episodes?.episode_number} - Đã xem{" "}
                    {Math.round(item.watched_percent)}%
                  </p>

                  <div className="flex items-center gap-2">
                    {(() => {
                      const production = item.episodes?.production;
                      const isSeason = !!production?.seasons;
                      const slug = isSeason
                        ? production.seasons.series?.productions?.slug
                        : production?.slug;
                      const seasonQuery = isSeason 
                        ? `ss=${production.seasons.season_number}&` 
                        : "";
                      const epQuery = `ep=${item.episodes?.episode_number}&pos=${item.last_position || 0}`;
                      
                      return (
                        <Link
                          to={`/watch/${slug}?${seasonQuery}${epQuery}`}
                          className="flex-1 bg-[#ffdd95] text-black text-sm font-semibold text-center rounded-md px-3 py-2 hover:bg-[#ffe6aa]"
                        >
                          Tiếp tục
                        </Link>
                      );
                    })()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
