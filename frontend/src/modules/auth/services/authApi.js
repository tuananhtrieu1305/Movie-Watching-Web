import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "http://localhost:3000";

const authClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1/auth`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const authApi = {
  async register(payload) {
    const { data } = await authClient.post("/register", payload);
    return data;
  },

  async login(payload) {
    const { data } = await authClient.post("/login", payload);
    return data;
  },

  async google(credential) {
    const { data } = await authClient.post("/google", { credential });
    return data;
  },

  async refreshToken() {
    const { data } = await authClient.post("/refresh-token");
    return data;
  },

  async logout() {
    const { data } = await authClient.post("/logout");
    return data;
  },

  async updateProfile(token, { username, password, avatar_url }) {
    const { data } = await authClient.put("/profile", { username, password, avatar_url }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  },
};

