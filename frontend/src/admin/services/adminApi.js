import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "http://localhost:3000";

const withAuth = (accessToken) => ({
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
  withCredentials: true,
});

export const adminApi = {
  async getUsers(accessToken) {
    const { data } = await axios.get(
      `${API_BASE_URL}/api/v1/admin/users`,
      withAuth(accessToken),
    );
    return data;
  },

  async createUser(accessToken, payload) {
    const { data } = await axios.post(
      `${API_BASE_URL}/api/v1/admin/users`,
      payload,
      withAuth(accessToken),
    );
    return data;
  },

  async updateUser(accessToken, userId, payload) {
    const { data } = await axios.put(
      `${API_BASE_URL}/api/v1/admin/users/${userId}`,
      payload,
      withAuth(accessToken),
    );
    return data;
  },

  async deleteUser(accessToken, userId) {
    const { data } = await axios.delete(
      `${API_BASE_URL}/api/v1/admin/users/${userId}`,
      withAuth(accessToken),
    );
    return data;
  },

  async getTransactions(accessToken) {
    const { data } = await axios.get(
      `${API_BASE_URL}/api/v1/admin/transactions`,
      withAuth(accessToken),
    );
    return data;
  },

  async getSubscriptions(accessToken) {
    const { data } = await axios.get(
      `${API_BASE_URL}/api/v1/admin/subscriptions`,
      withAuth(accessToken),
    );
    return data;
  },
};
