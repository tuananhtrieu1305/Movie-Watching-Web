import { createContext, useContext, useState, useMemo, useEffect } from "react";
import { createMeeetingApi } from "./MeetingApi";

const MeetingAppContext = createContext();
export const useMeetingContext = () => useContext(MeetingAppContext);

const SESSION_KEY = "watch_party_session";

export default function MeetingContext({ children }) {
  // 1. Khởi tạo state từ sessionStorage nếu có (để hỗ trợ F5)
  const [session, setSession] = useState(() => {
    const saved = sessionStorage.getItem(SESSION_KEY);
    return saved ? JSON.parse(saved) : {
      token: null,
      meetingId: null,
      participantId: null,
      isHost: false,
    };
  });

  // Tách các state ra để tiện sử dụng như cũ (hoặc dùng trực tiếp session)
  const [token, setToken] = useState(session.token);
  const [meetingId, setMeetingId] = useState(session.meetingId);
  const [participantId, setParticipantId] = useState(session.participantId);
  const [isHost, setIsHost] = useState(session.isHost);

  // 2. Lưu vào sessionStorage mỗi khi có thay đổi quan trọng
  useEffect(() => {
    if (meetingId) {
      const dataToSave = { token, meetingId, participantId, isHost };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(dataToSave));
    }
  }, [token, meetingId, participantId, isHost]);

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
