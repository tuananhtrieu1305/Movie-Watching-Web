import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "http://localhost:3000";

const meetingClient = axios.create({
  baseURL: `${API_BASE_URL}/api/meeting`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Tự động đính kèm Bearer token vào mọi request
meetingClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Tạo phòng Watch Party.
 * @param {string} title - Tên phòng
 * @param {number|null} productionId - ID phim đang xem (từ DB)
 * @param {number|null} episodeId - ID tập phim (null nếu host chưa chọn)
 * @returns {{ meetingId, token, userId, role }}
 */
export const createMeeetingApi = async (title, productionId = null, episodeId = null) => {
  try {
    const { data } = await meetingClient.post("/create", {
      title: title || "Phòng xem phim",
      productionId,
      episodeId,
    });
    return data.data; // { meetingId, token, userId, role }
  } catch (error) {
    console.error("Lỗi gọi API createMeeeting: ", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Join phòng Watch Party.
 * @param {string} meetingId - Cloudflare meeting ID
 * @returns {{ meetingId, token, userId, role }}
 */
export const joinMeetingApi = async (meetingId) => {
  try {
    const { data } = await meetingClient.post(`/${meetingId}/join`);
    return data.data; // { meetingId, token, userId, role }
  } catch (error) {
    console.error(`Lỗi gọi API joinMeeting cho phòng ${meetingId}: `, error.response?.data || error.message);
    throw error.response?.data || error;
  }
};
