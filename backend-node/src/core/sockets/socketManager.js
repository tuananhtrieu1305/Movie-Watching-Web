import { Server } from "socket.io";
import { verifyAccessToken } from "../utils/jwt.js";
import { meetingService } from "../../modules/meeting/meeting.instance.js";

let io;

// Data Structures for Watch Party
// watchParties.get(meetingId) => {
//   hostUserId,        // user.id từ DB — SOURCE OF TRUTH cho identity
//   hostSocketId,      // socket.id hiện tại — chỉ dùng cho emit định hướng
//   currentMovie, currentEpisodeId, isPlaying, currentTime, lastSyncTime
// }
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

  // ===================== LỚP 1: SOCKET AUTHENTICATION =====================
  // Verify JWT tại handshake — chặn kết nối không hợp lệ ngay từ đầu
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error("Unauthorized: Thiếu token"));
    }

    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return next(new Error("Unauthorized: Token không hợp lệ hoặc đã hết hạn"));
    }

    // Gắn user đã xác thực vào socket — dùng cho mọi logic phía sau
    socket.user = {
      id: decoded.userId,
      role: decoded.role,
    };

    next();
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
    socket.on("join_party", ({ meetingId, isHost }) => {
      if (!meetingId) return;

      socket.join(`party_${meetingId}`);
      socket.meetingId = meetingId;

      const userId = socket.user.id; // Lấy từ JWT đã verify
      const existingState = watchParties.get(meetingId) || {};

      console.log(`[WatchParty] User ${userId} joined party_${meetingId} (isHost: ${isHost})`);

      // ===================== LỚP 2: HOST AUTHORIZATION =====================
      if (isHost) {
        // Kiểm tra: chỉ đúng host (theo userId) mới được claim host role
        const isLegitimateHost =
          !existingState.hostUserId || // Phòng mới, chưa có host
          existingState.hostUserId === userId; // Đúng host reconnect

        if (isLegitimateHost) {
          // Hủy Grace Period nếu Host quay lại
          if (hostTimers.has(meetingId)) {
            clearTimeout(hostTimers.get(meetingId));
            hostTimers.delete(meetingId);
            console.log(`[WatchParty] Host ${userId} reconnected to ${meetingId}, grace period cancelled`);
          }

          watchParties.set(meetingId, {
            ...existingState,
            hostUserId: userId,       // Identity dùng userId
            hostSocketId: socket.id,  // Session hiện tại dùng socket.id
          });
        } else {
          console.warn(`[WatchParty] User ${userId} tried to claim host of ${meetingId} but real host is ${existingState.hostUserId}`);
        }
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
      const state = watchParties.get(meetingId);

      // Guard: verify bằng userId — đúng cả sau reconnect
      if (!state || socket.user.id !== state.hostUserId) {
        console.warn(`[WatchParty] Unauthorized host_change_movie from user ${socket.user.id} in ${meetingId}`);
        return;
      }

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

      // Guard: verify bằng userId
      if (!state || socket.user.id !== state.hostUserId) {
        console.warn(`[WatchParty] Unauthorized host_sync_video from user ${socket.user.id} in ${meetingId}`);
        return;
      }

      state.currentTime = currentTime;
      state.lastSyncTime = Date.now();

      if (type === "play") state.isPlaying = true;
      if (type === "pause") state.isPlaying = false;
      // 'seek' không đổi isPlaying

      console.log(`[WatchParty] Host sync in ${meetingId}: ${type} at ${currentTime}`);
      socket.to(`party_${meetingId}`).emit("guest_sync_video", {
        type,
        currentTime,
        timestamp: Date.now() // Dùng bù Ping
      });
    });

    // 4. Xử lý Disconnect & Rớt Mạng
    socket.on("disconnect", () => {
      const meetingId = socket.meetingId;
      if (!meetingId) return;

      const state = watchParties.get(meetingId);
      // Chỉ kích hoạt grace period nếu đây là host thực sự (verify bằng userId)
      if (state && socket.user.id === state.hostUserId) {
        console.log(`[WatchParty] Host ${socket.user.id} disconnected from ${meetingId}. Starting Grace Period...`);

        const timer = setTimeout(async () => {
          console.log(`[WatchParty] Grace Period expired for ${meetingId}. Ending party.`);

          // Thông báo cho tất cả Guest còn lại
          io.to(`party_${meetingId}`).emit("party_ended", {
            message: "Chủ phòng đã thoát. Buổi xem phim kết thúc."
          });

          // Cập nhật DB
          await meetingService.endParty(meetingId);

          // Xóa dữ liệu phòng khỏi RAM
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
