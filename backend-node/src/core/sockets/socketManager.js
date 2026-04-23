import { Server } from "socket.io";
import { verifyAccessToken } from "../utils/jwt.js";
import { meetingService } from "../../modules/meeting/meeting.instance.js";
import prisma from "../database/prisma.js";

let io;
const watchParties = new Map();
const hostTimers = new Map();

export const initSocket = (httpServer, options) => {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    },
    ...options
  });

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

    socket.on("join_party", async ({ meetingId, isHost }) => {
      if (!meetingId) return;

      socket.join(`party_${meetingId}`);
      socket.meetingId = meetingId;
      socket.isHost = isHost;

      const userId = socket.user.id;
      const existingState = watchParties.get(meetingId) || { isPlaying: false, currentTime: 0 };

      console.log(`[WatchParty] User ${userId} joined party_${meetingId} (isHost: ${isHost})`);

      // 2. Lấy thông tin phim hiện tại từ DB để gửi cho người mới vào
      try {
        const party = await prisma.watch_parties.findUnique({
          where: { id: meetingId },
          include: { productions: true }
        });

        if (party && party.production_id) {
          socket.emit("party_state", {
            currentMovie: party.productions?.slug,
            currentEpisodeId: party.episode_id,
            isPlaying: existingState.isPlaying,
            currentTime: existingState.currentTime,
            serverTime: Date.now()
          });
        }
      } catch (err) {
        console.error("[Socket] Lỗi lấy party state:", err);
      }


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
    socket.on("host_change_movie", async (data) => {
      const { meetingId, movieSlug, episodeId } = data;

      // Guard: Chỉ Host mới được đổi phim
      if (!socket.isHost) {
        console.warn(`[WatchParty] Unauthorized movie change attempt by user ${socket.user?.id}`);
        return;
      }

      try {
        let updateData = {
          production_id: null,
          episode_id: null
        };

        let finalMovieSlug = null;
        let finalEpisodeId = null;

        // Nếu có chọn phim mới
        if (movieSlug) {
          const production = await prisma.productions.findUnique({
            where: { slug: movieSlug },
            include: { episodes: { orderBy: { episode_number: "asc" }, take: 1 } }
          });

          if (production) {
            finalMovieSlug = movieSlug;
            finalEpisodeId = episodeId || (production.episodes.length > 0 ? production.episodes[0].id : null);
            updateData = {
              production_id: production.id,
              episode_id: finalEpisodeId
            };
          } else {
            console.error(`[WatchParty] Movie not found: ${movieSlug}`);
            return;
          }
        }

        // 1. Cập nhật Database
        await prisma.watch_parties.update({
          where: { id: meetingId },
          data: updateData
        });

        // 2. Cập nhật trạng thái trong RAM
        const state = watchParties.get(meetingId) || { currentTime: 0, isPlaying: false };
        state.currentMovie = finalMovieSlug;
        state.currentEpisodeId = finalEpisodeId;
        state.hostUserId = socket.user?.id;
        watchParties.set(meetingId, state);

        // 3. Thông báo cho mọi người trong phòng
        io.to(`party_${meetingId}`).emit("movie_changed", {
          movieSlug: finalMovieSlug,
          episodeId: finalEpisodeId
        });
        
        console.log(`[WatchParty] Room ${meetingId} ${movieSlug ? 'changed movie to ' + movieSlug : 'reset to lobby'}`);
      } catch (err) {
        console.error("[WatchParty] Lỗi đổi phim:", err);
      }
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
