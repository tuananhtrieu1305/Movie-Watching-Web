import { useState } from "react";

/**
 * GuestControls - Thanh điều khiển cá nhân dành cho Guest.
 * Chỉ bao gồm: Mute/Volume và Fullscreen.
 * Không ảnh hưởng đến trạng thái phát của Host.
 *
 * @param {{ videoRef: React.RefObject, containerRef: React.RefObject }} props
 */
export default function GuestControls({ videoRef, containerRef }) {
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleToggleMute = () => {
    const vt = videoRef.current;
    if (!vt) return;
    const newMuted = !isMuted;
    vt.muted = newMuted;
    setIsMuted(newMuted);
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    const vt = videoRef.current;
    if (!vt) return;
    vt.volume = val;
    setVolume(val);
    if (val === 0) {
      vt.muted = true;
      setIsMuted(true);
    } else {
      vt.muted = false;
      setIsMuted(false);
    }
  };

  const handleToggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen().catch((e) => console.error(e));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const showMuted = isMuted || volume === 0;

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center gap-3 px-4 py-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
      {/* Nút Mute/Unmute */}
      <button
        onClick={handleToggleMute}
        className="text-white hover:text-[#ffdd95] transition-colors p-1"
        title={showMuted ? "Bật âm thanh" : "Tắt âm thanh"}
      >
        {showMuted ? (
          /* Icon loa bị tắt */
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13 4.879L7.586 10H4v4h3.586L13 19.121V4.879zm-2.293-2.586A1 1 0 0112 3v18a1 1 0 01-1.707.707L4.586 16H3a1 1 0 01-1-1v-6a1 1 0 011-1h1.586L10.293 2.293a1 1 0 01.414 0zM17.293 9.293a1 1 0 011.414 1.414L17.414 12l1.293 1.293a1 1 0 01-1.414 1.414L16 13.414l-1.293 1.293a1 1 0 01-1.414-1.414L14.586 12l-1.293-1.293a1 1 0 011.414-1.414L16 10.586l1.293-1.293z" />
          </svg>
        ) : (
          /* Icon loa đang bật */
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13 4.879L7.586 10H4v4h3.586L13 19.121V4.879zm-2.293-2.586A1 1 0 0112 3v18a1 1 0 01-1.707.707L4.586 16H3a1 1 0 01-1-1v-6a1 1 0 011-1h1.586L10.293 2.293a1 1 0 01.414 0zM18 7a1 1 0 011 1 8 8 0 010 8 1 1 0 01-1.414-1.414A6 6 0 0019 12a6 6 0 00-1.414-5.586A1 1 0 0118 7zm-3 3a1 1 0 011 1 3 3 0 010 2 1 1 0 01-1.414-1.414A1 1 0 0015 12a1 1 0 00-.414-.586A1 1 0 0115 10z" />
          </svg>
        )}
      </button>

      {/* Thanh âm lượng */}
      <input
        type="range"
        min="0"
        max="1"
        step="0.05"
        value={showMuted ? 0 : volume}
        onChange={handleVolumeChange}
        className="w-20 h-1 accent-[#ffdd95] cursor-pointer"
      />

      <div className="flex-1" />

      {/* Nút Fullscreen */}
      <button
        onClick={handleToggleFullscreen}
        className="text-white hover:text-[#ffdd95] transition-colors p-1"
        title={isFullscreen ? "Thoát toàn màn hình" : "Phóng to toàn màn hình"}
      >
        {isFullscreen ? (
          /* Icon thu nhỏ */
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V5m0 4H5m4 0L4 4m11 5h4m-4 0V5m0 4l5-5M9 15H5m4 0v4m0-4l-5 5m11-5h4m-4 0v4m0-4l5 5" />
          </svg>
        ) : (
          /* Icon phóng to */
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        )}
      </button>
    </div>
  );
}
