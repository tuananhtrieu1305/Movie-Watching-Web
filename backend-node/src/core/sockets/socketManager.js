import { Server } from "socket.io";
import { verifyAccessToken } from "../utils/jwt.js";
import { registerCommentSocket } from "./comment.socket.js";
import { registerWatchPartySocket } from "./watchParty.socket.js";

let io;

const authenticateSocket = (socket, next) => {
  const token = socket.handshake.auth?.token;

  if (!token) {
    socket.user = null;
    return next();
  }

  const decoded = verifyAccessToken(token);
  if (!decoded) {
    socket.user = null;
    return next();
  }

  socket.user = {
    id: decoded.userId,
    role: decoded.role,
  };

  return next();
};

export const initSocket = (httpServer, options) => {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    ...options,
  });

  io.use(authenticateSocket);

  io.on("connection", (socket) => {
    registerCommentSocket(io, socket);
    registerWatchPartySocket(io, socket);
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};
