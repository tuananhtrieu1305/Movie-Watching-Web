import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "http://localhost:3000";

export const paymentApi = {
  async createPayosUrl(accessToken, planCode) {
    const { data } = await axios.post(
      `${API_BASE_URL}/api/v1/payments/payos/create-url`,
      { planCode },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        withCredentials: true,
      },
    );

    return data;
  },

  async getTransactionHistory(accessToken) {
    const { data } = await axios.get(`${API_BASE_URL}/api/v1/payments/history`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      withCredentials: true,
    });

    return data;
  },

  async getCurrentSubscription(accessToken) {
    const { data } = await axios.get(
      `${API_BASE_URL}/api/v1/payments/current-subscription`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        withCredentials: true,
      },
    );

    return data;
  },
};
