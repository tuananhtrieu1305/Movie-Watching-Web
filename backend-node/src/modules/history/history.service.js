import prisma from "../../core/database/prisma.js";

export const historyService = {
  // Lấy lịch sử xem (gom nhóm theo phim hoặc tập gần nhất)
  async getUserHistory(userId) {
    // Lấy danh sách phim đang xem sắp xếp theo thời gian mới nhất
    return prisma.watch_history.findMany({
      where: { user_id: userId },
      include: {
        episodes: {
          include: {
            production: {
              include: {
                seasons: {
                  include: {
                    series: {
                      include: {
                        productions: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { last_watched_at: "desc" },
    });
  },

  // Cập nhật hoặc tạo lịch sử xem
  async updateHistory(userId, data) {
    const episode_id = Number(data.episode_id);
    const { last_position, watched_duration, total_duration, is_completed } =
      data;

    // Kiểm tra tập phim
    const episode = await prisma.episodes.findUnique({
      where: { id: episode_id },
    });

    if (!episode) {
      // Nếu id tập phim là id giả (do frontend tự sinh) thì bỏ qua không lưu lịch sử để tránh lỗi 400
      return {
        success: true,
        message: "Bỏ qua lưu lịch sử cho tập phim không có thực trong DB",
      };
    }

    let watched_percent = 0;
    const finalDuration =
      total_duration && total_duration > 0 ? total_duration : episode.duration;
    if (finalDuration && finalDuration > 0) {
      watched_percent = Math.min((last_position / finalDuration) * 100, 100);
    }

    // Cập nhật lại duration thực tế vào database cho tập phim để phần hiển thị luôn chuẩn xác
    if (
      total_duration &&
      total_duration > 0 &&
      Math.abs(episode.duration - total_duration) > 5
    ) {
      await prisma.episodes
        .update({
          where: { id: episode_id },
          data: { duration: total_duration },
        })
        .catch((err) => console.error("Lỗi update duration:", err));
    }

    const isCompleted = is_completed || watched_percent >= 90; // coi như > 90% là xem xong

    return prisma.watch_history.upsert({
      where: {
        user_id_episode_id: {
          user_id: userId,
          episode_id: episode_id,
        },
      },
      create: {
        user_id: userId,
        episode_id: episode_id,
        last_position: last_position || 0,
        watched_duration: watched_duration || 0,
        watched_percent: watched_percent,
        is_completed: isCompleted,
        last_watched_at: new Date(),
      },
      update: {
        last_position: last_position || 0,
        watched_duration: watched_duration || 0,
        watched_percent: watched_percent,
        is_completed: isCompleted,
        last_watched_at: new Date(),
      },
    });
  },
};
