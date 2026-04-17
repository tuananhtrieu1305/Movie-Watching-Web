import { createContext, useContext, useState, useMemo } from "react";
import { createMeeetingApi } from "./MeetingApi";

const MeetingAppContext = createContext();
export const useMeetingContext = () => useContext(MeetingAppContext);
export default function MeetingContext({ children }) {
  // Chỉ lưu trữ dữ liệu, không gọi hook của Cloudflare ở đây
  const [token, setToken] = useState(null);
  const [meetingId, setMeetingId] = useState(null);
  const [hostId, setHostId] = useState(null);
  const createRoom = async (title) => {
    try {
      const res = await createMeeetingApi(title);
      setToken(res.token);
      setMeetingId(res.id);
      setHostId(res.participant.id); // Save the creator's participant ID as the Host ID
      return res;
    } catch (error) {
      console.error("Lỗi khi gọi API tạo phòng:", error);
      throw error;
    }
  };

const value = useMemo(() => ({ createRoom, token, setToken, meetingId, hostId }), [token, meetingId, hostId]);

  return (
    <MeetingAppContext.Provider value={value}>
      {/* Context giờ rất nhẹ, chỉ truyền dữ liệu xuống dưới */}
      {children}
    </MeetingAppContext.Provider>
  );
}
