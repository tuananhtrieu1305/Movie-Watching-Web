/* eslint-disable no-unused-vars */
import { StepForwardOutlined, BulbOutlined } from "@ant-design/icons";
import { Switch, Button, Tooltip, message, Modal } from "antd";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../modules/auth/hooks/useAuth";
import { historyApi } from "../../modules/user/services/historyApi";

const VideoPlayer = (props) => {
  const {
    currentEpisode,
    isLightOff,
    setLightOff,
    onNextEpisode,
    onDurationUpdate,
    settings,
    setSettings,
  } = props;
  const videoRef = useRef(null);
  console.log(currentEpisode);

  const { isAuthenticated, accessToken, user } = useAuth();
  const navigate = useNavigate();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const isPreview =
    new URLSearchParams(window.location.search).get("preview") === "true";

  // Ref để tracking debounce update lịch sử
  const lastSyncTimeRef = useRef(0);
  const watchedDurationRef = useRef(0);

  // Sync lịch sử khi pause hoặc mỗi 10 giây
  const syncHistory = async (
    currentTime,
    force = false,
    isCompleted = false,
  ) => {
    if (!isAuthenticated || !accessToken || !currentEpisode?.id) return;

    const now = Date.now();
    // Gửi sync nếu force hoặc đã qua 10s kể từ lần gửi cuối
    if (force || now - lastSyncTimeRef.current > 10000) {
      try {
        await historyApi.updateHistory(accessToken, {
          episode_id: currentEpisode.id,
          last_position: Math.floor(currentTime),
          watched_duration: Math.floor(watchedDurationRef.current),
          total_duration: videoRef.current?.duration
            ? Math.floor(videoRef.current.duration)
            : 0,
          is_completed: isCompleted,
        });
        lastSyncTimeRef.current = now;
      } catch (err) {
        console.error("Lỗi đồng bộ lịch sử:", err);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const { currentTime } = videoRef.current;

    // Nếu đang ở chế độ preview và xem tới 30 giây thì dừng và hiện modal
    if (isPreview && currentTime >= 30) {
      videoRef.current.pause();
      setIsModalVisible(true);
    }

    // Tăng thời gian đã xem (thêm 0.25s mỗi event timeupdate tùy browsers)
    // Tạm bỏ qua độ chính xác tuyệt đối, chỉ đếm cho event
    // Cách an toàn hơn: gửi thẳng currentTime lên
    syncHistory(currentTime);
  };

  const handlePause = () => {
    if (videoRef.current) {
      syncHistory(videoRef.current.currentTime, true);
    }
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;

    if (onDurationUpdate && currentEpisode?.id) {
      if (videoRef.current.duration && !isNaN(videoRef.current.duration)) {
        onDurationUpdate(
          currentEpisode.id,
          Math.floor(videoRef.current.duration),
        );
      }
    }

    // Nếu có tham số pos trên URL (từ trang lịch sử truyền sang)
    const searchParams = new URLSearchParams(window.location.search);
    const pos = searchParams.get("pos");
    if (pos && !isNaN(pos)) {
      videoRef.current.currentTime = Number(pos);
    }
  };

  // 1. Xử lý Autoplay mỗi khi đổi tập
  useEffect(() => {
    if (videoRef.current && settings.autoPlay) {
      // Ép video chạy. Lưu ý: Trình duyệt có thể chặn nếu chưa có tương tác trước đó.
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.log("Autoplay prevented:", error);
        });
      }
    }
  }, [currentEpisode, settings.autoPlay]);

  // 2. Xử lý khi video kết thúc (Auto Next)
  const handleVideoEnded = () => {
    if (videoRef.current) {
      syncHistory(videoRef.current.currentTime, true, true);
    }

    if (settings.autoNext) {
      message.loading("Auto-playing next episode in 3s...", 2);
      setTimeout(() => {
        onNextEpisode();
      }, 3000); // Đợi 3 giây rồi chuyển
    }
  };

  // 3. Hàm cập nhật toggle
  const toggleSetting = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    message.success(`${key} ${!settings[key] ? "enabled" : "disabled"}`);
  };

  return (
    <div
      className={`relative w-full bg-black rounded-xl overflow-hidden shadow-2xl transition-all duration-300 ${isLightOff ? "z-50" : ""}`}
    >
      <Modal
        // test
        title={
          <span className="text-xl font-bold text-yellow-500">
            Yêu cầu đăng ký VIP
          </span>
        }
        open={isModalVisible}
        closable={false}
        centered
        footer={[
          <Button
            key="register"
            type="primary"
            size="large"
            className="bg-yellow-500 hover:!bg-yellow-600 text-black border-none font-bold"
            onClick={() => navigate("/user/plans")}
          >
            Đăng ký gói VIP
          </Button>,
        ]}
      >
        <p className="text-white text-base py-4 font-medium">
          Bạn đã xem hết 30s xem trước. Để tiếp tục xem trọn bộ phim VIP này,
          vui lòng đăng ký gói VIP.
        </p>
      </Modal>

      {/* 1. Màn hình Video */}
      <div className="aspect-video w-full bg-black relative group">
        <video
          ref={videoRef}
          key={currentEpisode.video_url}
          src={currentEpisode.video_url}
          controls
          className="w-full h-full object-contain"
          poster={currentEpisode.thumbnail_url}
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onPause={handlePause}
          onEnded={handleVideoEnded}
        />
      </div>

      {/* 2. Control Bar (Dưới video) */}
      <div className="bg-[#18181b] p-3 flex flex-wrap items-center justify-between border-b border-gray-800 gap-2">
        <div className="flex items-center gap-4 text-gray-300 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-[#ffdd95] font-bold">You are watching:</span>
            <span className="text-white font-medium">
              Episode {currentEpisode.episode_number}
            </span>
          </div>
          <div className="hidden md:flex items-center gap-4 ml-4 border-l border-gray-700 pl-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Auto Play</span>
              <Switch
                size="small"
                checked={settings.autoPlay}
                onChange={() => toggleSetting("autoPlay")}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Auto Next</span>
              <Switch
                size="small"
                checked={settings.autoNext}
                onChange={() => toggleSetting("autoNext")}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Nút Light On/Off */}
          <Tooltip title={isLightOff ? "Turn Light On" : "Turn Light Off"}>
            <Button
              type="text"
              icon={
                <BulbOutlined
                  className={isLightOff ? "text-yellow-400" : "text-gray-400"}
                />
              }
              onClick={() => setLightOff(!isLightOff)}
              className="hover:bg-gray-700"
            />
          </Tooltip>
          <Button
            type="primary"
            shape="round"
            icon={<StepForwardOutlined />}
            size="small"
            className="!bg-[#ffdd95] !text-[#111] border-[#ffdd95] hover:!bg-[#ffdd95]/80"
            onClick={onNextEpisode}
          >
            Next Episode
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
