import prisma from "../../core/database/prisma.js";

export const watchlistService = {
  async getUserWatchlist(userId) {
    return prisma.bookmarks.findMany({
      where: { user_id: userId },
      include: {
        productions: {
          select: {
            id: true,
            title: true,
            slug: true,
            poster_url: true,
            banner_url: true,
            type: true,
            release_year: true,
            is_premium: true,
            rating_avg: true,
            country: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    });
  },

  async addToWatchlist(userId, productionId) {
    const production = await prisma.productions.findUnique({
      where: { id: productionId },
      select: { id: true },
    });

    if (!production) {
      throw new Error("Không tìm thấy phim");
    }

    return prisma.bookmarks.upsert({
      where: {
        user_id_production_id: {
          user_id: userId,
          production_id: productionId,
        },
      },
      create: {
        user_id: userId,
        production_id: productionId,
      },
      update: {},
      include: {
        productions: {
          select: {
            id: true,
            title: true,
            slug: true,
            poster_url: true,
            banner_url: true,
            type: true,
            release_year: true,
            is_premium: true,
            rating_avg: true,
            country: true,
          },
        },
      },
    });
  },

  async removeFromWatchlist(userId, productionId) {
    const existed = await prisma.bookmarks.findUnique({
      where: {
        user_id_production_id: {
          user_id: userId,
          production_id: productionId,
        },
      },
    });

    if (!existed) {
      return null;
    }

    return prisma.bookmarks.delete({
      where: {
        user_id_production_id: {
          user_id: userId,
          production_id: productionId,
        },
      },
    });
  },

  async checkInWatchlist(userId, productionId) {
    const bookmark = await prisma.bookmarks.findUnique({
      where: {
        user_id_production_id: {
          user_id: userId,
          production_id: productionId,
        },
      },
      select: {
        user_id: true,
        production_id: true,
      },
    });

    return Boolean(bookmark);
  },
};
