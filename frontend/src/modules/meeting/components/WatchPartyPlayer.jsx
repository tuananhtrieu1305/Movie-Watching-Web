import React, { useState, useEffect, useRef } from "react";
import { getMovies, getMovieBySlug } from "../../../services/movieService";
import { useMeetingContext } from "../MeetingContext";
import { useLocation } from "react-router-dom";
import { getFallbackVideoUrl } from "../../../utils/streaming/fallbackUrl";
import { Spin, Button, Tooltip, message, Card, Badge } from "antd";
import { FullscreenOutlined, FullscreenExitOutlined, CopyOutlined } from "@ant-design/icons";

export default function WatchPartyPlayer({ meeting, isTheaterMode, setIsTheaterMode, socket }) {
  const { isHost, meetingId } = useMeetingContext();
  const location = useLocation();
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
  const [loading, setLoading] = useState(true);
  const [guestWaitingAutoplay, setGuestWaitingAutoplay] = useState(false);
  const [driftMs, setDriftMs] = useState(0); // Để tính độ lệch nếu guest mạng yếu
  const [isBuffering, setIsBuffering] = useState(false); 

  const videoRef = useRef(null);
  const isUpdatingFromSocketRef = useRef(false); 
  const hasAutoSelectedRef = useRef(false); // Cờ để tránh auto-select nhiều lần khi render lại

  // 1. Fetch Danh sách Phim ban đầu (cho Lobby) và Auto-Select nếu có slug
  useEffect(() => {
    fetchMovies();
  }, []);

  useEffect(() => {
    if (isHost && initialSlug && socket && !partyState.slug && !hasAutoSelectedRef.current) {
      console.log(`[WatchParty] Auto-selecting initial movie: ${initialSlug}`);
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
      console.error("Lỗi fetch movies", err);
    } finally {
      if (!initialSlug) setLoading(false); // Chỉ tắt loading ở đây nếu không có auto-select
    }
  };

  // 2. Fetch chi tiết phim khi Host chọn hoặc phòng thay đổi
  useEffect(() => {
    if (partyState.slug) {
      loadMovieDetails(partyState.slug, partyState.episodeId);
    } else {
      setCurrentMovie(null);
      setCurrentEpisode(null);
    }
  }, [partyState.slug, partyState.episodeId]);

  const loadMovieDetails = async (slug, episodeId) => {
    try {
      setLoading(true);
      const res = await getMovieBySlug(slug);
      const productionData = res.data || res;
      setCurrentMovie(productionData);
      
      // Tìm danh sách tập phim (xử lý cả Movie và Series)
      let episodes = [];
      let seasonNum = 1;
      
      if (productionData.type === "series") {
        const currentSeason = productionData.seasons?.[0];
        episodes = currentSeason?.episodes || productionData.episodes || [];
        seasonNum = currentSeason?.season_number || 1;
      } else {
        // Đối với Movie, episodes có thể nằm ngay ở root hoặc trong mảng episodes
        episodes = productionData.episodes || [];
      }
      
      const ep = episodeId 
        ? episodes.find(e => e.id === episodeId) 
        : episodes[0];
      
      if (ep) {
        // Áp dụng Fallback URL để tránh lỗi video lỗi không xác định
        const fixedEp = {
          ...ep,
          video_url: getFallbackVideoUrl(
            ep.video_url, 
            productionData.type, 
            seasonNum, 
            ep.episode_number || 1
          )
        };
        setCurrentEpisode(fixedEp);
      } else {
        message.warning("Không tìm thấy tập phim nào cho bộ này.");
      }
    } catch (error) {
      console.error("Lỗi load phim:", error);
      message.error("Không thể tải thông tin phim.");
    } finally {
      setLoading(false);
    }
  };

  // 3. Socket Listeners
  useEffect(() => {
    if (!socket) return;

    socket.on("party_state", (state) => {
      console.log("[WatchParty] >>> Nhận Sync khi mới vào phòng:", state);
      setPartyState({
        slug: state.currentMovie,
        episodeId: state.currentEpisodeId,
        isPlaying: state.isPlaying,
        currentTime: state.currentTime,
      });

      // Bù ping (Latency compensation)
      if (state.currentMovie) {
        const pingMs = Math.max(0, Date.now() - state.serverTime);
        const compensatedTime = state.currentTime + (pingMs / 1000);
        
        if (!isHost) {
          console.log(`[WatchParty] Guest bù ping: ${pingMs}ms, nhảy tới ${compensatedTime}`);
          setGuestWaitingAutoplay(true);
          setPartyState(prev => ({...prev, currentTime: compensatedTime}));
        }
      }
    });

    socket.on("movie_changed", (data) => {
      console.log("[WatchParty] >>> Đổi phim:", data);
      setPartyState(prev => ({
        ...prev, 
        slug: data.movieSlug, 
        episodeId: data.episodeId,
        isPlaying: false,
        currentTime: 0
      }));
      if (!isHost) setGuestWaitingAutoplay(true);
    });

    socket.on("guest_sync_video", (data) => {
      console.log("[WatchParty] >>> Nhận lệnh Sync từ Host:", data);
      if (isHost) return;

      const vt = videoRef.current;
      if (!vt) return;

      isUpdatingFromSocketRef.current = true;

      const { type, currentTime, timestamp } = data;
      // Bù ping cho các thao tác sync
      const latencySeconds = Math.max(0, Date.now() - timestamp) / 1000;
      const targetTime = currentTime + latencySeconds;

      if (type === "seek" || type === "play" || type === "heartbeat") {
        // Áp dụng Dung Sai (Tolerance): 2.5 giây
        const drift = Math.abs(vt.currentTime - targetTime);
        if (drift > 2.5) {
          console.log(`[WatchParty] Lệch ${drift.toFixed(2)}s. Ép đồng bộ... (target: ${targetTime})`);
          vt.currentTime = targetTime;
          setDriftMs(0);
        } else {
          setDriftMs(drift * 1000);
        }
      }

      if (type === "play") {
        vt.play().catch(e => {
          console.warn("Trình duyệt chặn Autoplay", e);
          setGuestWaitingAutoplay(true);
        });
      } else if (type === "pause") {
        vt.pause();
      }

      setTimeout(() => {
        isUpdatingFromSocketRef.current = false;
      }, 300); // Khóa cờ ngắn để tránh gửi ngược lại
    });

    return () => {
      socket.off("party_state");
      socket.off("movie_changed");
      socket.off("guest_sync_video");
    };
  }, [socket, isHost]);


  // 4. Heartbeat Sync (Chỉ Host gửi mỗi 5s)
  useEffect(() => {
    if (!isHost || !socket || !currentMovie) return;

    const interval = setInterval(() => {
      const vt = videoRef.current;
      if (vt && !vt.paused) {
        console.log("[WatchParty] <<< Gửi Heartbeat Sync:", vt.currentTime);
        socket.emit("host_sync_video", { 
          meetingId, 
          type: "heartbeat", 
          currentTime: vt.currentTime 
        });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isHost, socket, currentMovie, meetingId]);

  // 5. Các thao tác của Host
  const handleHostSelectMovie = (slug) => {
    if (!isHost) return;
    console.log("[WatchParty] <<< Host đổi phim:", slug);
    socket.emit("host_change_movie", { meetingId, movieSlug: slug, episodeId: null });
  };

  const handleHostPlay = () => {
    if (!isHost || isUpdatingFromSocketRef.current) return;
    console.log("[WatchParty] <<< Host bấm Play tại:", videoRef.current?.currentTime);
    socket.emit("host_sync_video", { meetingId, type: "play", currentTime: videoRef.current?.currentTime || 0 });
  };

  const handleHostPause = () => {
    if (!isHost || isUpdatingFromSocketRef.current) return;
    console.log("[WatchParty] <<< Host bấm Pause tại:", videoRef.current?.currentTime);
    socket.emit("host_sync_video", { meetingId, type: "pause", currentTime: videoRef.current?.currentTime || 0 });
  };

  const handleHostSeeked = () => {
    if (!isHost || isUpdatingFromSocketRef.current) return;
    console.log("[WatchParty] <<< Host tua tới:", videoRef.current?.currentTime);
    socket.emit("host_sync_video", { meetingId, type: "seek", currentTime: videoRef.current?.currentTime || 0 });
  };

  const handleGuestJoinTheater = () => {
    console.log("[WatchParty] Guest bắt đầu vào rạp, nhảy tới:", partyState.currentTime);
    setGuestWaitingAutoplay(false);
    if (!videoRef.current) return;
    
    // Áp dụng thời gian nhảy
    videoRef.current.currentTime = partyState.currentTime;
    if (partyState.isPlaying) {
      videoRef.current.play().catch(e => console.error(e));
    }
  };


  const handleCopyMeetingId = () => {
    if (!meetingId) return;
    navigator.clipboard.writeText(meetingId);
    message.success("Đã copy mã phòng!");
  };

  // ===================== RENDER GIÁO DIỆN =====================

  if (loading && !currentMovie && !movieList.length) {
    return <div className="h-full flex items-center justify-center"><Spin size="large" /></div>;
  }

  return (
    <div className="h-full w-full flex flex-col relative bg-[#121212]">
      
      {/* HUD GÓC PHẢI DÀNH CHO CẢ LOBBY LẪN THEATER */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-3">
        {/* Widget Copy mã phòng */}
        <div className="flex items-center bg-gray-900/80 border border-gray-700 rounded-full px-4 py-1.5 backdrop-blur-md shadow-2xl group transition-all hover:border-[#ffdd95]">
          <span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mr-2">Room ID:</span>
          <span className="text-[#ffdd95] font-mono font-bold mr-3">{meetingId}</span>
          <Tooltip title="Copy mã phòng">
            <Button 
              type="text" 
              size="small"
              icon={<CopyOutlined className="text-gray-400 group-hover:text-[#ffdd95]" />} 
              onClick={handleCopyMeetingId}
              className="p-0 border-none bg-transparent hover:scale-110 transition-transform"
            />
          </Tooltip>
        </div>

        <Tooltip title={isTheaterMode ? "Thu nhỏ phòng chiếu" : "Phóng to toàn màn hình"}>
          <Button 
            type="primary" 
            shape="circle" 
            icon={isTheaterMode ? <FullscreenExitOutlined /> : <FullscreenOutlined />} 
            onClick={() => setIsTheaterMode(!isTheaterMode)}
          />
        </Tooltip>
      </div>

      {partyState.slug && currentMovie ? (
        // --- 1. MÀN HÌNH XEM PHIM CHO CẢ HOST LẪN GUEST
        <div className="flex-1 flex flex-col p-4 pt-16">
          <div className="p-4 bg-gray-900/50 border border-gray-800 rounded-t-xl flex justify-between items-center shadow-lg">
            <h2 className="text-xl font-bold text-white mb-0">{currentMovie.title} {currentEpisode ? ` - Tập ${currentEpisode.episode_number}` : ''}</h2>
            
            {/* Nếu là Host, cho phép đổi phim (Quay lại Lobby) */}
            {isHost && (
              <Button type="default" size="small" onClick={() => handleHostSelectMovie(null)}>
                Đổi Phim Khác
              </Button>
            )}
          </div>

          <div className="flex-1 relative flex items-center justify-center bg-black border border-gray-800 border-t-0 rounded-b-xl overflow-hidden shadow-2xl">
            {/* Rào cản Autoplay cho Guest */}
            {guestWaitingAutoplay && !isHost && (
              <div className="absolute inset-0 z-40 bg-black/80 flex flex-col items-center justify-center backdrop-blur-sm">
                <h3 className="text-white text-2xl font-bold mb-4 drop-shadow-lg">Rạp đang chiếu phim rồi!</h3>
                <Button type="primary" size="large" className="animate-bounce !bg-[#ffdd95] !text-[#111] border-none !font-bold" onClick={handleGuestJoinTheater}>
                  Nhấn vào đây để xem cùng Host
                </Button>
              </div>
            )}

            {/* Màn hình Buffering (Xoay tròn khi tua hoặc mạng yếu) */}
            {isBuffering && (
              <div className="absolute inset-0 z-30 bg-black/40 flex flex-col items-center justify-center backdrop-blur-[2px] transition-all">
                <Spin size="large" tip="Đang bắt kịp Host..." />
                <div className="mt-4 text-[#ffdd95] font-medium animate-pulse">Đang đồng bộ phim...</div>
              </div>
            )}

            {currentEpisode ? (
              <video
                ref={videoRef}
                src={currentEpisode.video_url}
                className="w-full h-full object-contain"
                controls={isHost} // Chỉ Host mới thấy thanh điều khiển
                playsInline
                poster={currentEpisode.thumbnail_url || currentMovie.poster_url}
                onPlay={handleHostPlay}
                onPause={handleHostPause}
                onSeeked={handleHostSeeked}
                onWaiting={() => setIsBuffering(true)}
                onPlaying={() => setIsBuffering(false)}
                onCanPlay={() => setIsBuffering(false)}
              />
            ) : (
                <div className="text-gray-500">Video lỗi không xác định</div>
            )}

            {/* Badge Báo Lag (Khách xem tự giác) */}
            {!isHost && driftMs > 2500 && (
              <div className="absolute bottom-10 right-10 z-50">
                <Button type="primary" danger shape="round" className="shadow-lg" onClick={() => {
                  socket.emit("join_party", { meetingId, isHost: false, participantId: socket.participantId }); // Xin lại state
                  message.info("Đang đồng bộ lại với Host...");
                }}>
                  Bạn đang chậm {(driftMs/1000).toFixed(1)}s. Bấm bắt kịp
                </Button>
              </div>
            )}
          </div>
        </div>
      ) : (
        // --- 2. MÀN HÌNH LOBBY CHỜ KHI CHƯA CHỌN PHIM
        <div className="flex-1 overflow-y-auto p-4 md:p-8 pt-16">
           {isHost ? (
             <>
               <div className="text-center mb-10">
                  <h2 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#ffdd95] to-orange-400">
                    Phòng chiếu đã sẵn sàng!
                  </h2>
                  <p className="text-gray-400 mt-2 text-lg">Bạn là Chủ Phòng. Hãy chọn một bộ phim dưới đây để bắt đầu phát cho mọi người.</p>
               </div>
               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                 {movieList.map(movie => (
                   <Card
                     key={movie.id}
                     hoverable
                     cover={<img alt={movie.title} src={movie.poster_url} className="h-64 object-cover" />}
                     bodyStyle={{ padding: "12px", background: "#1a1a1a", borderTop: "1px solid #333" }}
                     className="border-gray-800 overflow-hidden transform transition duration-300 hover:scale-105"
                     onClick={() => handleHostSelectMovie(movie.slug)}
                   >
                     <div className="truncate text-white font-semibold text-lg">{movie.title}</div>
                     <div className="text-gray-500 text-sm mt-1">{movie.release_year}</div>
                   </Card>
                 ))}
               </div>
             </>
           ) : (
             <div className="h-full flex flex-col items-center justify-center animate-pulse">
                <div className="w-16 h-16 border-4 border-[#ffdd95] border-t-transparent rounded-full animate-spin mb-6 shadow-[0_0_15px_#ffdd95]"></div>
                <h2 className="text-3xl font-bold text-white mb-2">Đang chờ Chủ phòng</h2>
                <p className="text-gray-400 text-lg">Bạn đã vào phòng thành công. Phim sẽ bắt đầu ngay khi chủ phòng lựa chọn.</p>
             </div>
           )}
        </div>
      )}
    </div>
  );
}
