import { Server } from "socket.io";

let io;

// Data Structures for Watch Party
// watchParties.get(meetingId) => { hostSocketId, hostParticipantId, currentMovie, currentEpisodeId, isPlaying, currentTime, lastSyncTime }
const watchParties = new Map();
// hostTimers.get(meetingId) => timeoutID (for Grace Period)
const hostTimers = new Map();

export const initSocket = (httpServer, options) => {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    },
    ...options
  });

  io.on("connection", (socket) => {
    // --- LEGACY: COMMENT SYSTEM ---
    socket.on("join_production", (productionId) => {
      if (productionId) {
        socket.join(`production_${productionId}`);
      }
    });

    socket.on("leave_production", (productionId) => {
      if (productionId) {
        socket.leave(`production_${productionId}`);
      }
    });

    // --- WATCH PARTY MODULE ---

    // 1. Join Party
    socket.on("join_party", ({ meetingId, isHost, participantId }) => {
      if (!meetingId) return;
      
      socket.join(`party_${meetingId}`);
      socket.meetingId = meetingId;
      socket.participantId = participantId;
      socket.isHost = isHost;
      
      console.log(`[WatchParty] User ${participantId} joined room party_${meetingId} (isHost: ${isHost})`);

      // Xử lý Host
      if (isHost) {
        // Hủy Grace Period nếu Host quay lại
        if (hostTimers.has(meetingId)) {
          clearTimeout(hostTimers.get(meetingId));
          hostTimers.delete(meetingId);
          console.log(`[Watch Party] Host ${participantId} reconnected to ${meetingId}`);
        }

        const existingState = watchParties.get(meetingId) || {};
        watchParties.set(meetingId, {
          ...existingState,
          hostSocketId: socket.id,
          hostParticipantId: participantId,
        });
      }

      // Trả state về cho người vừa vào (cả host lẫn guest)
      const currentState = watchParties.get(meetingId);
      if (currentState && currentState.currentMovie) {
        socket.emit("party_state", {
          ...currentState,
          serverTime: Date.now()
        });
      }
    });

    // 2. Thay đổi phim/tập (Chỉ Host)
    socket.on("host_change_movie", ({ meetingId, movieSlug, episodeId }) => {
      const state = watchParties.get(meetingId) || {};
      state.currentMovie = movieSlug;
      state.currentEpisodeId = episodeId;
      state.isPlaying = false;
      state.currentTime = 0;
      state.lastSyncTime = Date.now();
      
      watchParties.set(meetingId, state);

      io.to(`party_${meetingId}`).emit("movie_changed", {
        movieSlug,
        episodeId
      });
      console.log(`[WatchParty] Room ${meetingId} changed movie to ${movieSlug}`);
    });

    // 3. Play / Pause / Seek
    socket.on("host_sync_video", ({ meetingId, type, currentTime }) => {
      const state = watchParties.get(meetingId);
      if (!state) return;

      state.currentTime = currentTime;
      state.lastSyncTime = Date.now(); // Để tính RTT cho Late Joiner

      if (type === "play") state.isPlaying = true;
      if (type === "pause") state.isPlaying = false;
      // 'seek' không đổi isPlaying

      // Phát lại cho TOÀN BỘ GUESTS (trừ host)
      console.log(`[WatchParty] Host sync in ${meetingId}: ${type} at ${currentTime}`);
      socket.to(`party_${meetingId}`).emit("guest_sync_video", {
        type, 
        currentTime,
        timestamp: Date.now() // Dùng bù Ping
      });
    });

    // 4. Xử lý Disconnect & Rớt Mạng (Chuyển Host)
    socket.on("disconnect", () => {
      const meetingId = socket.meetingId;
      if (!meetingId) return;

      const state = watchParties.get(meetingId);
      if (state && socket.isHost) {
        console.log(`[Watch Party] Host disconnected from ${meetingId}. Starting Grace Period...`);
        
        const timer = setTimeout(() => {
          // Grace Period đã hết (15s). Kết thúc buổi xem cho tất cả mọi người!
          console.log(`[Watch Party] Grace Period expired for ${meetingId}. Ending party for everyone.`);
          
          // Thông báo cho tất cả Guest còn lại
          io.to(`party_${meetingId}`).emit("party_ended", { 
            message: "Chủ phòng đã thoát. Buổi xem phim kết thúc." 
          });

          // Xóa dữ liệu phòng
          watchParties.delete(meetingId);
          hostTimers.delete(meetingId);
        }, 15000); // 15s Grace Period

        hostTimers.set(meetingId, timer);
      }
    });

  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};
