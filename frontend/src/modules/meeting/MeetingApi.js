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

export const createMeeetingApi = async (title) => {
  try {
    const { data } = await meetingClient.post("/create", {
      title: title || "Phòng họp mới",
    });
    return data.data;
  } catch (error) {
    console.error("Lỗi gọi API createMeeeting: ", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const joinMeetingApi = async (meetingId, participantName = "Khách") => {
  try {
    const { data } = await meetingClient.post(`/${meetingId}/join`, {
      userName: participantName,
    });
    return data.data || data.token;
  } catch (error) {
    console.error(`Lỗi gọi API joinMeeting cho phòng ${meetingId}: `, error.response?.data || error.message);
    throw error.response?.data || error;
  }
};
