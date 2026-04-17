import { createContext, useContext, useState, useMemo } from "react";
import { createMeeetingApi } from "./MeetingApi";

const MeetingAppContext = createContext();
export const useMeetingContext = () => useContext(MeetingAppContext);
export default function MeetingContext({ children }) {
  // Chỉ lưu trữ dữ liệu, không gọi hook của Cloudflare ở đây
  const [token, setToken] = useState(null);
  const [meetingId, setMeetingId] = useState(null);
  const [participantId, setParticipantId] = useState(null);
  const [isHost, setIsHost] = useState(false);

  const createRoom = async (title) => {
    try {
      const res = await createMeeetingApi(title);
      setToken(res.token);
      setMeetingId(res.id);
      setParticipantId(res.participant?.id || "host-temp");
      setIsHost(true); // Người tạo phòng mặc định là Host
      return res;
    } catch (error) {
      console.error("Lỗi khi gọi API tạo phòng:", error);
      throw error;
    }
  };

  const value = useMemo(() => ({ 
    createRoom, 
    token, setToken, 
    meetingId, setMeetingId,
    participantId, setParticipantId,
    isHost, setIsHost 
  }), [token, meetingId, participantId, isHost]);

  return (
    <MeetingAppContext.Provider value={value}>
      {children}
    </MeetingAppContext.Provider>
  );
}
