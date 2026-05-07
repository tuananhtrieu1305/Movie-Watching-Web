export const registerCommentSocket = (_io, socket) => {
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
};
