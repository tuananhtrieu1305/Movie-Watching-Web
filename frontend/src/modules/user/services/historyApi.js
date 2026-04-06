import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "http://localhost:3000";

const withAuth = (accessToken) => ({
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
  withCredentials: true,
});

export const historyApi = {
  async getMyHistory(accessToken) {
    const { data } = await axios.get(
      `${API_BASE_URL}/api/v1/history`,
      withAuth(accessToken),
    );
    return data;
  },

  async updateHistory(accessToken, payload) {
    const { data } = await axios.post(
      `${API_BASE_URL}/api/v1/history`,
      payload,
      withAuth(accessToken),
    );
    return data;
  },
};
