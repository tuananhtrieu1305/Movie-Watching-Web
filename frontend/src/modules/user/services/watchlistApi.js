import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "http://localhost:3000";

const withAuth = (accessToken) => ({
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
  withCredentials: true,
});

export const watchlistApi = {
  async getMyWatchlist(accessToken) {
    const { data } = await axios.get(
      `${API_BASE_URL}/api/v1/watchlist`,
      withAuth(accessToken),
    );
    return data;
  },

  async addToWatchlist(accessToken, productionId) {
    const { data } = await axios.post(
      `${API_BASE_URL}/api/v1/watchlist`,
      { productionId },
      withAuth(accessToken),
    );
    return data;
  },

  async removeFromWatchlist(accessToken, productionId) {
    const { data } = await axios.delete(
      `${API_BASE_URL}/api/v1/watchlist/${productionId}`,
      withAuth(accessToken),
    );
    return data;
  },

  async checkInWatchlist(accessToken, productionId) {
    const { data } = await axios.get(
      `${API_BASE_URL}/api/v1/watchlist/check/${productionId}`,
      withAuth(accessToken),
    );
    return data;
  },
};
