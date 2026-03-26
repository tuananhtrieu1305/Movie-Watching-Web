import { useSearchParams } from "react-router-dom";
import WatchPage from "./WatchPage";
import MovieInfoPage from "../../components/streamingDetailPage/MovieInfoPage";

const WatchPageWrapper = () => {
  const [searchParams] = useSearchParams();
  const episode = searchParams.get("ep"); // Kiểm tra tham số ?ep=...

  // Logic điều hướng:
  // 1. Nếu có ?ep=... => Render trang Xem phim (Player)
  // 2. Nếu KHÔNG có => Render trang Chi tiết (Info)
  if (episode) {
    return <WatchPage />;
  } else {
    return <MovieInfoPage />;
  }
};

export default WatchPageWrapper;
