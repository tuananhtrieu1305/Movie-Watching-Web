import prisma from "../database/prisma.js";
import { meetingService } from "../../modules/meeting/meeting.instance.js";

const watchParties = new Map();
const hostTimers = new Map();

const isAuthenticatedSocket = (socket, eventName) => {
  if (socket.user?.id) return true;

  socket.emit("socket_error", {
    event: eventName,
    message: "Authentication required",
  });
  return false;
};

export const registerWatchPartySocket = (io, socket) => {
  socket.on("join_party", async ({ meetingId, isHost }) => {
    if (!isAuthenticatedSocket(socket, "join_party")) return;
    if (!meetingId) return;

    socket.join(`party_${meetingId}`);
    socket.meetingId = meetingId;
    socket.isHost = isHost;

    const userId = socket.user.id;
    const existingState = watchParties.get(meetingId) || {
      isPlaying: false,
      currentTime: 0,
    };

    console.log(
      `[WatchParty] User ${userId} joined party_${meetingId} (isHost: ${isHost})`,
    );

    try {
      const party = await prisma.watch_parties.findUnique({
        where: { id: meetingId },
        include: { productions: true },
      });

      if (party && party.production_id) {
        socket.emit("party_state", {
          currentMovie: party.productions?.slug,
          currentEpisodeId: party.episode_id,
          isPlaying: existingState.isPlaying,
          currentTime: existingState.currentTime,
          serverTime: Date.now(),
        });
      }
    } catch (err) {
      console.error("[Socket] Failed to load party state:", err);
    }

    if (isHost) {
      const isLegitimateHost =
        !existingState.hostUserId || existingState.hostUserId === userId;

      if (isLegitimateHost) {
        if (hostTimers.has(meetingId)) {
          clearTimeout(hostTimers.get(meetingId));
          hostTimers.delete(meetingId);
          console.log(
            `[WatchParty] Host ${userId} reconnected to ${meetingId}, grace period cancelled`,
          );
        }

        watchParties.set(meetingId, {
          ...existingState,
          hostUserId: userId,
          hostSocketId: socket.id,
        });
      } else {
        console.warn(
          `[WatchParty] User ${userId} tried to claim host of ${meetingId} but real host is ${existingState.hostUserId}`,
        );
      }
    }

    const currentState = watchParties.get(meetingId);
    if (currentState && currentState.currentMovie) {
      socket.emit("party_state", {
        ...currentState,
        serverTime: Date.now(),
      });
    }
  });

  socket.on("host_change_movie", async (data) => {
    if (!isAuthenticatedSocket(socket, "host_change_movie")) return;

    const { meetingId, movieSlug, episodeId } = data;

    if (!socket.isHost) {
      console.warn(
        `[WatchParty] Unauthorized movie change attempt by user ${socket.user?.id}`,
      );
      return;
    }

    try {
      let updateData = {
        production_id: null,
        episode_id: null,
      };

      let finalMovieSlug = null;
      let finalEpisodeId = null;

      if (movieSlug) {
        const production = await prisma.productions.findUnique({
          where: { slug: movieSlug },
          include: {
            episodes: { orderBy: { episode_number: "asc" }, take: 1 },
          },
        });

        if (production) {
          finalMovieSlug = movieSlug;
          finalEpisodeId =
            episodeId ||
            (production.episodes.length > 0 ? production.episodes[0].id : null);
          updateData = {
            production_id: production.id,
            episode_id: finalEpisodeId,
          };
        } else {
          console.error(`[WatchParty] Movie not found: ${movieSlug}`);
          return;
        }
      }

      await prisma.watch_parties.update({
        where: { id: meetingId },
        data: updateData,
      });

      const state = watchParties.get(meetingId) || {
        currentTime: 0,
        isPlaying: false,
      };
      state.currentMovie = finalMovieSlug;
      state.currentEpisodeId = finalEpisodeId;
      state.hostUserId = socket.user?.id;
      watchParties.set(meetingId, state);

      io.to(`party_${meetingId}`).emit("movie_changed", {
        movieSlug: finalMovieSlug,
        episodeId: finalEpisodeId,
      });

      console.log(
        `[WatchParty] Room ${meetingId} ${
          movieSlug ? `changed movie to ${movieSlug}` : "reset to lobby"
        }`,
      );
    } catch (err) {
      console.error("[WatchParty] Failed to change movie:", err);
    }
  });

  socket.on("host_sync_video", ({ meetingId, type, currentTime }) => {
    if (!isAuthenticatedSocket(socket, "host_sync_video")) return;

    const state = watchParties.get(meetingId);

    if (!state || socket.user.id !== state.hostUserId) {
      console.warn(
        `[WatchParty] Unauthorized host_sync_video from user ${socket.user.id} in ${meetingId}`,
      );
      return;
    }

    state.currentTime = currentTime;
    state.lastSyncTime = Date.now();

    if (type === "play") state.isPlaying = true;
    if (type === "pause") state.isPlaying = false;

    console.log(
      `[WatchParty] Host sync in ${meetingId}: ${type} at ${currentTime}`,
    );
    socket.to(`party_${meetingId}`).emit("guest_sync_video", {
      type,
      currentTime,
      timestamp: Date.now(),
    });
  });

  socket.on("disconnect", () => {
    if (!socket.user?.id) return;

    const meetingId = socket.meetingId;
    if (!meetingId) return;

    const state = watchParties.get(meetingId);
    if (state && socket.user.id === state.hostUserId) {
      console.log(
        `[WatchParty] Host ${socket.user.id} disconnected from ${meetingId}. Starting grace period...`,
      );

      const timer = setTimeout(async () => {
        console.log(
          `[WatchParty] Grace period expired for ${meetingId}. Ending party.`,
        );

        io.to(`party_${meetingId}`).emit("party_ended", {
          message: "Host left. The watch party has ended.",
        });

        await meetingService.endParty(meetingId);

        watchParties.delete(meetingId);
        hostTimers.delete(meetingId);
      }, 15000);

      hostTimers.set(meetingId, timer);
    }
  });
};
