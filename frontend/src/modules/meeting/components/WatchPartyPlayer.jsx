import React, { useState, useEffect, useRef } from "react";
import {
  getMovies,
  getMovieBySlug,
  searchMovies,
} from "../../../services/movieService";
import { useMeetingContext } from "../MeetingContext";
import { useLocation, useNavigate } from "react-router-dom";
import { getFallbackVideoUrl } from "../../../utils/streaming/fallbackUrl";
import { Spin, Button, Tooltip, message, Card } from "antd";
import {
  FullscreenOutlined,
  FullscreenExitOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import GuestControls from "./GuestControls";
import SearchInput from "../../../components/common/SearchInput";

export default function WatchPartyPlayer({
  meeting,
  isTheaterMode,
  setIsTheaterMode,
  socket,
}) {
  const { isHost, meetingId, setIsHost } = useMeetingContext();
  const location = useLocation();
  const navigate = useNavigate();
  const initialSlug = location.state?.initialSlug;

  // States
  const [partyState, setPartyState] = useState({
    slug: null,
    episodeId: null,
    isPlaying: false,
    currentTime: 0,
  });

  const [movieList, setMovieList] = useState([]);
  const [currentMovie, setCurrentMovie] = useState(null);
  const [currentEpisode, setCurrentEpisode] = useState(null);
  const [currentMovieEpisodes, setCurrentMovieEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [guestWaitingAutoplay, setGuestWaitingAutoplay] = useState(false);
  const [driftMs, setDriftMs] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);

  const videoContainerRef = useRef(null);
  const videoRef = useRef(null);
  const isUpdatingFromSocketRef = useRef(false);
  const hasAutoSelectedRef = useRef(false);

  // 1. Fetch Danh sách Phim
  useEffect(() => {
    fetchMovies();
  }, []);

  useEffect(() => {
    if (
      isHost &&
      initialSlug &&
      socket &&
      !partyState.slug &&
      !hasAutoSelectedRef.current
    ) {
      hasAutoSelectedRef.current = true;
      handleHostSelectMovie(initialSlug);
    }
  }, [socket, isHost, initialSlug]);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const res = await getMovies();
      setMovieList(res.data || res);
    } catch (err) {
      console.error(err);
    } finally {
      if (!initialSlug) setLoading(false);
    }
  };

  // 2. Fetch chi tiết phim
  useEffect(() => {
    if (partyState.slug) {
      loadMovieDetails(partyState.slug, partyState.episodeId);
    } else {
      setCurrentMovie(null);
      setCurrentEpisode(null);
      setCurrentMovieEpisodes([]);
    }
  }, [partyState.slug, partyState.episodeId]);

  const loadMovieDetails = async (slug, episodeId) => {
    try {
      setLoading(true);
      const res = await getMovieBySlug(slug);
      const productionData = res.data || res;
      setCurrentMovie(productionData);

      const epList =
        productionData.episodes && productionData.episodes.length > 0
          ? productionData.episodes
          : productionData.seasons?.[0]?.episodes || [];

      setCurrentMovieEpisodes(epList);
      const ep = episodeId ? epList.find((e) => e.id === episodeId) : epList[0];

      if (ep) {
        const fixedEp = {
          ...ep,
          video_url: getFallbackVideoUrl(
            ep.video_url,
            productionData.type,
            productionData.seasons?.[0]?.season_number || 1,
            ep.episode_number || 1,
          ),
        };
        setCurrentEpisode(fixedEp);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 3. Socket Listeners
  useEffect(() => {
    if (!socket) return;

    socket.on("party_state", (state) => {
      setPartyState({
        slug: state.currentMovie,
        episodeId: state.currentEpisodeId,
        isPlaying: state.isPlaying,
        currentTime: state.currentTime,
      });
      if (state.currentMovie && !isHost) {
        const pingMs = Math.max(0, Date.now() - state.serverTime);
        setPartyState((prev) => ({
          ...prev,
          currentTime: state.currentTime + pingMs / 1000,
        }));
        setGuestWaitingAutoplay(true);
      }
    });

    socket.on("movie_changed", (data) => {
      setPartyState((prev) => ({
        ...prev,
        slug: data.movieSlug,
        episodeId: data.episodeId,
        isPlaying: false,
        currentTime: 0,
      }));
      if (!isHost) setGuestWaitingAutoplay(true);
    });

    socket.on("guest_sync_video", (data) => {
      if (isHost) return;
      const vt = videoRef.current;
      if (!vt) return;

      isUpdatingFromSocketRef.current = true;
      const { type, currentTime, timestamp } = data;
      const latency = Math.max(0, Date.now() - timestamp) / 1000;
      const targetTime = currentTime + latency;

      const drift = vt.currentTime - targetTime;
      const absDrift = Math.abs(drift);

      // --- LOGIC ĐỒNG BỘ KẾT HỢP (The Best Version) ---

      // 1. THAO TÁC CHỦ ĐỘNG (Seek/Play) HOẶC Lệch nặng (> 3s) -> Hard Sync ngay lập tức
      if (type === "seek" || type === "play" || absDrift > 3.0) {
        vt.currentTime = targetTime;
        vt.playbackRate = 1.0;
        setDriftMs(0); // Ẩn ngay nút Bù trễ (Giống bản cũ của bạn)
      }
      // 2. NHỊP ĐẬP HEARTBEAT (Lệch nhẹ 0.3s - 3s) -> Soft Sync mượt mà
      else if (type === "heartbeat") {
        if (absDrift > 0.3) {
          vt.playbackRate = drift < 0 ? 1.5 : 0.9; // Chỉnh tốc độ (Vừa đủ để ko bị méo tiếng)
          setDriftMs(drift * 1000);
        } else {
          vt.playbackRate = 1.0;
          setDriftMs(0);
        }
      }

      if (type === "play") {
        vt.play().catch(() => setGuestWaitingAutoplay(true));
      } else if (type === "pause") {
        vt.pause();
        vt.playbackRate = 1.0;
      }

      setTimeout(() => {
        isUpdatingFromSocketRef.current = false;
      }, 300);
    });

    socket.on("party_ended", (data) => {
      message.info(data.message || "Buổi xem phim đã kết thúc.");
      sessionStorage.removeItem("watch_party_session");
      navigate("/meeting");
    });

    socket.on("assigned_as_host", (data) => {
      message.success(data.message);
      if (setIsHost) setIsHost(true);
    });

    return () => {
      socket.off("party_state");
      socket.off("movie_changed");
      socket.off("guest_sync_video");
      socket.off("party_ended");
      socket.off("assigned_as_host");
    };
  }, [socket, isHost]);

  // 4. Heartbeat Sync
  useEffect(() => {
    if (!isHost || !socket || !currentMovie) return;
    const interval = setInterval(() => {
      const vt = videoRef.current;
      if (vt && !vt.paused) {
        socket.emit("host_sync_video", {
          meetingId,
          type: "heartbeat",
          currentTime: vt.currentTime,
        });
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [isHost, socket, currentMovie, meetingId]);

  // 5. Thao tác Host
  const handleHostSelectMovie = (slug, episodeId = null) => {
    if (!isHost) return;
    socket.emit("host_change_movie", { meetingId, movieSlug: slug, episodeId });
  };
  const handleHostPlay = () => {
    if (!isHost || isUpdatingFromSocketRef.current) return;
    socket.emit("host_sync_video", {
      meetingId,
      type: "play",
      currentTime: videoRef.current?.currentTime || 0,
    });
  };
  const handleHostPause = () => {
    if (!isHost || isUpdatingFromSocketRef.current) return;
    socket.emit("host_sync_video", {
      meetingId,
      type: "pause",
      currentTime: videoRef.current?.currentTime || 0,
    });
  };
  const handleHostSeeked = () => {
    if (!isHost || isUpdatingFromSocketRef.current) return;
    socket.emit("host_sync_video", {
      meetingId,
      type: "seek",
      currentTime: videoRef.current?.currentTime || 0,
    });
  };
  const handleGuestJoinTheater = () => {
    setGuestWaitingAutoplay(false);
    if (!videoRef.current) return;
    videoRef.current.currentTime = partyState.currentTime;
    if (partyState.isPlaying) videoRef.current.play();
  };
  const handleCopyMeetingId = () => {
    if (meetingId) {
      navigator.clipboard.writeText(meetingId);
      message.success("Đã copy mã phòng!");
    }
  };

  const loadingOverlay = loading && partyState.slug && (
    <div className="absolute inset-0 z-[100] bg-[#121212] flex items-center justify-center">
      <div className="text-center">
        <Spin size="large" />
        <div className="mt-4 text-orange-200 font-medium">
          Đang chuẩn bị rạp chiếu...
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full w-full flex flex-col relative bg-[#121212]">
      {loadingOverlay}

      <div className="absolute top-4 right-4 z-50 flex items-center gap-3">
        <div className="flex items-center bg-gray-900/80 border border-gray-700 rounded-full px-4 py-1.5 backdrop-blur-md shadow-2xl">
          <span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mr-2">
            Room ID:
          </span>
          <span className="text-[#ffdd95] font-mono font-bold mr-3">
            {meetingId}
          </span>
          <Button
            type="text"
            size="small"
            icon={<CopyOutlined className="text-gray-400" />}
            onClick={handleCopyMeetingId}
          />
        </div>
        <Button
          type="primary"
          shape="circle"
          icon={
            isTheaterMode ? <FullscreenExitOutlined /> : <FullscreenOutlined />
          }
          onClick={() => setIsTheaterMode(!isTheaterMode)}
        />
        {isHost && partyState.slug && (
          <Button
            type="default"
            onClick={() => handleHostSelectMovie(null)}
            className="bg-white/10 text-white"
          >
            Đổi Phim Khác
          </Button>
        )}
      </div>

      {partyState.slug && currentMovie ? (
        <div className="flex-1 flex flex-col p-4 pt-20 overflow-y-auto custom-scrollbar">
          <div className="p-4 bg-gray-900/50 border border-gray-800 rounded-t-xl flex justify-between items-center shadow-lg">
            <h2 className="text-xl font-bold text-white mb-0">
              {currentMovie.title}{" "}
              {currentEpisode ? ` - Tập ${currentEpisode.episode_number}` : ""}
            </h2>
          </div>

          <div
            ref={videoContainerRef}
            className="flex-1 relative flex items-center justify-center bg-black border border-gray-800 border-t-0 rounded-b-xl overflow-hidden shadow-2xl"
          >
            {guestWaitingAutoplay && !isHost && (
              <div className="absolute inset-0 z-40 bg-black/80 flex flex-col items-center justify-center backdrop-blur-sm">
                <h3 className="text-white text-2xl font-bold mb-4">
                  Rạp đang chiếu phim rồi!
                </h3>
                <Button
                  type="primary"
                  size="large"
                  onClick={handleGuestJoinTheater}
                >
                  Nhấn để xem cùng Host
                </Button>
              </div>
            )}
            {isBuffering && (
              <div className="absolute inset-0 z-30 bg-black/40 flex items-center justify-center">
                <Spin size="large" tip="Đang đồng bộ..." />
              </div>
            )}
            {currentEpisode && (
              <video
                ref={videoRef}
                src={currentEpisode.video_url}
                className="w-full h-full object-contain"
                controls={isHost}
                playsInline
                poster={currentEpisode.thumbnail_url || currentMovie.poster_url}
                onPlay={handleHostPlay}
                onPause={handleHostPause}
                onSeeked={handleHostSeeked}
                onWaiting={() => setIsBuffering(true)}
                onPlaying={() => setIsBuffering(false)}
                onCanPlay={() => setIsBuffering(false)}
              />
            )}
            {!isHost && currentEpisode && (
              <GuestControls
                videoRef={videoRef}
                containerRef={videoContainerRef}
              />
            )}

            {/* CHỈ HIỆN KHI LỆCH QUÁ NẶNG MÀ KO TỰ SỬA ĐƯỢC (Ví dụ Guest treo mạng) */}
            {!isHost && Math.abs(driftMs) > 10000 && (
              <div className="absolute bottom-10 right-10 z-50">
                <Button
                  type="primary"
                  danger
                  shape="round"
                  onClick={() =>
                    socket.emit("join_party", {
                      meetingId,
                      isHost: false,
                      participantId: socket.participantId,
                    })
                  }
                >
                  Lệch nặng: Bù {(driftMs / 1000).toFixed(1)}s
                </Button>
              </div>
            )}
          </div>

          {currentMovieEpisodes.length > 1 && (
            <div className="mt-4 p-5 bg-gray-900/50 border border-gray-800 rounded-xl">
              <h4 className="text-sm font-bold text-white uppercase mb-4">
                Danh sách tập phim
              </h4>
              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {currentMovieEpisodes.map((ep) => (
                  <button
                    key={ep.id}
                    onClick={() =>
                      handleHostSelectMovie(currentMovie.slug, ep.id)
                    }
                    disabled={!isHost}
                    className={`min-w-[50px] h-10 px-3 rounded-lg text-sm font-bold transition-all ${currentEpisode?.id === ep.id ? "bg-[#ffdd95] text-black shadow-[0_0_15px_rgba(255,221,149,0.4)]" : "bg-white/5 text-gray-400 hover:bg-white/10"}`}
                  >
                    {ep.episode_number || "EP"}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 md:p-8 pt-16">
          {isHost ? (
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-extrabold text-[#ffdd95] mb-8">
                Phòng chiếu đã sẵn sàng!
              </h2>
              <SearchInput
                placeholder="Tìm tên phim để bắt đầu..."
                loading={loading && !partyState.slug}
                onSearch={async (val) => {
                  try {
                    if (val.trim()) {
                      setLoading(true);
                      const res = await searchMovies(val);
                      setMovieList(res.data || res);
                    } else {
                      fetchMovies();
                    }
                  } catch (err) {
                    console.error(err);
                  } finally {
                    setLoading(false);
                  }
                }}
              />
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mt-10">
                {movieList.map((movie) => (
                  <Card
                    key={movie.id}
                    hoverable
                    cover={
                      <img
                        alt={movie.title}
                        src={movie.poster_url}
                        className="h-64 object-cover"
                      />
                    }
                    onClick={() => handleHostSelectMovie(movie.slug)}
                    className="bg-[#1a1a1a] border-gray-800"
                  >
                    <div className="truncate text-white font-semibold">
                      {movie.title}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center">
              <div className="w-16 h-16 border-4 border-[#ffdd95] border-t-transparent rounded-full animate-spin mb-6"></div>
              <h2 className="text-3xl font-bold text-white">
                Đang chờ Chủ phòng
              </h2>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
