/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../modules/auth/hooks/useAuth";
import { watchlistApi } from "../../modules/user/services/watchlistApi";

export default function useWatchlist(productionId) {
  const { accessToken, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && accessToken && productionId) {
      checkStatus();
    }
  }, [isAuthenticated, accessToken, productionId]);

  const checkStatus = async () => {
    try {
      const { inWatchlist } = await watchlistApi.checkInWatchlist(
        accessToken,
        productionId,
      );
      setIsInWatchlist(inWatchlist);
    } catch (error) {
      console.error("Lỗi kiểm tra watchlist", error);
    }
  };

  const toggleWatchlist = async () => {
    if (!isAuthenticated || !accessToken) {
      message.info("Vui lòng đăng nhập để thêm vào danh sách");
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      if (isInWatchlist) {
        await watchlistApi.removeFromWatchlist(accessToken, productionId);
        setIsInWatchlist(false);
        message.success("Đã xoá khỏi danh sách yêu thích");
      } else {
        await watchlistApi.addToWatchlist(accessToken, productionId);
        setIsInWatchlist(true);
        message.success("Đã thêm vào danh sách yêu thích");
      }
    } catch (error) {
      message.error("Có lỗi xảy ra, vui lòng thử lại sau!");
    } finally {
      setLoading(false);
    }
  };

  return { isInWatchlist, toggleWatchlist, loading };
}
