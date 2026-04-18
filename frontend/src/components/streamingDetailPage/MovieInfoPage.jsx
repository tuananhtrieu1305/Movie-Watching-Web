import { useEffect, useState } from "react";
import { Spin, message } from "antd";
import { useParams } from "react-router-dom";
import { getMovieBySlug, getPopularMovies } from "../../services/movieService";
import { getWatchDataBySlug } from "../../services/watchService";

import InfoHero from "./InfoHero";
import RelatedMovies from "../streamingPage/RelatedMovies";
import RecommendedList from "../streamingPage/RecommendedList";
import CommentSection from "../comments/CommentSection";

const MovieInfoPage = () => {
  const { slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [productionData, setProductionData] = useState(null);
  const [popularList, setPopularList] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    window.scrollTo(0, 0);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    // Fetch song song 2 API
    Promise.all([getMovieBySlug(slug), getPopularMovies()])
      .then(([movieData, popularData]) => {
        setProductionData(movieData);
        setPopularList(popularData); // Lưu data popular
      })
      .catch((err) => {
        console.error(err);
        messageApi.error("Lỗi tải thông tin phim!");
      })
      .finally(() => {
        setLoading(false);
      });
    const controller = new AbortController();

    const load = async () => {
      setLoading(true);

      try {
        const data = await getWatchDataBySlug(slug, {
          signal: controller.signal,
        });

        if (controller.signal.aborted) return;
        setProductionData(data?.production ?? null);
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error("Failed to load movie info by slug:", error);
        setProductionData(null);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    load();

    return () => controller.abort();
  }, [slug]);

  if (loading)
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <Spin size="large" tip="Loading Info..." />
      </div>
    );

  if (!productionData) {
    return (
      <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Không tìm thấy phim</h2>
          <p className="text-white/70">Slug: {slug}</p>
        </div>
      </div>
    );
  }

  const related = Array.isArray(productionData.related)
    ? productionData.related
    : [];

  return (
    <>
      {contextHolder}
      <div className="min-h-screen bg-[#121212] text-gray-300 font-sans pb-10">
        {/* 1. HERO SECTION  */}
        <InfoHero production={productionData} />

        {/* 2. MAIN CONTENT LAYOUT */}
        <div className="container mx-auto px-4 max-w-[1400px]">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            {/* --- CỘT TRÁI --- */}
            <div className="xl:col-span-9 space-y-10">
              <div className="border-t border-gray-800 pt-6">
                <RelatedMovies movies={related} />
              </div>

              <CommentSection />
            </div>

            {/* --- CỘT PHẢI --- */}
            <div className="xl:col-span-3">
              <div className="sticky top-4">
                <RecommendedList list={popularList} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MovieInfoPage;
