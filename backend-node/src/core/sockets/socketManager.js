import { Server } from "socket.io";

let io;

export const initSocket = (httpServer, options) => {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    },
    ...options
  });

  io.on("connection", (socket) => {
    // Join room for a specific production
    socket.on("join_production", (productionId) => {
      if (productionId) {
        socket.join(`production_${productionId}`);
      }
    });

    // Leave room
    socket.on("leave_production", (productionId) => {
      if (productionId) {
        socket.leave(`production_${productionId}`);
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
