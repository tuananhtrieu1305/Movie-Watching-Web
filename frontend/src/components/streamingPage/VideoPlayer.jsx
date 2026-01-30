import {
  SettingOutlined,
  ExpandOutlined,
  StepForwardOutlined,
  BulbOutlined,
  PlayCircleFilled,
} from "@ant-design/icons";
import { Switch, Button, Tooltip, message } from "antd";
import { useEffect, useRef } from "react";

const VideoPlayer = (props) => {
  const {
    currentEpisode,
    isLightOff,
    setLightOff,
    onNextEpisode,
    settings,
    setSettings,
  } = props;
  const videoRef = useRef(null);

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
    if (settings.autoNext) {
      message.loading("Tự động chuyển tập tiếp theo sau 3s...", 2);
      setTimeout(() => {
        onNextEpisode();
      }, 3000); // Đợi 3 giây rồi chuyển
    }
  };

  // 3. Hàm cập nhật toggle
  const toggleSetting = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    message.success(`Đã ${!settings[key] ? "bật" : "tắt"} ${key}`);
  };

  return (
    <div
      className={`relative w-full bg-black rounded-xl overflow-hidden shadow-2xl transition-all duration-300 ${isLightOff ? "z-50" : ""}`}
    >
      {/* 1. Màn hình Video */}
      <div className="aspect-video w-full bg-black relative group">
        <video
          ref={videoRef}
          key={currentEpisode.video_url}
          src={currentEpisode.video_url}
          controls
          className="w-full h-full object-contain"
          poster="https://wallpapers.com/images/hd/stranger-things-4-poster-vkd6148332151654.jpg"
          onEnded={handleVideoEnded}
        />
      </div>

      {/* 2. Control Bar (Dưới video) */}
      <div className="bg-[#18181b] p-3 flex flex-wrap items-center justify-between border-b border-gray-800 gap-2">
        <div className="flex items-center gap-4 text-gray-300 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-[#ffdd95] font-bold">Bạn đang xem:</span>
            <span className="text-white font-medium">
              Tập {currentEpisode.episode_number}
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
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Auto Skip Intro</span>
              <Switch
                size="small"
                checked={settings.autoSkipIntro}
                onChange={() => toggleSetting("autoSkipIntro")}
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
            Tập tiếp theo
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
