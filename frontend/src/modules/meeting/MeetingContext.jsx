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
      userId: null,
      isHost: false,
    };
  });

  // Tách các state ra để tiện sử dụng (Mapping: userId từ backend chính là identity của participant)
  const [token, setToken] = useState(session.token);
  const [meetingId, setMeetingId] = useState(session.meetingId);
  const [participantId, setParticipantId] = useState(session.userId); // Dùng userId làm participant ID định danh
  const [isHost, setIsHost] = useState(session.isHost);

  // 2. Lưu vào sessionStorage mỗi khi có thay đổi quan trọng
  useEffect(() => {
    if (meetingId) {
      const dataToSave = { token, meetingId, userId: participantId, isHost };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(dataToSave));
    }
  }, [token, meetingId, participantId, isHost]);

  /**
   * Tạo phòng Watch Party
   * @param {string} title 
   * @param {number} productionId 
   * @param {number} episodeId 
   */
  const createRoom = async (title, productionId = null, episodeId = null) => {
    try {
      const res = await createMeeetingApi(title, productionId, episodeId);
      
      // Cập nhật state từ response backend { meetingId, token, userId, role }
      setToken(res.token);
      setMeetingId(res.meetingId);
      setParticipantId(res.userId); 
      setIsHost(res.role === "host");
      
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
    participantId, setParticipantId, // Vẫn giữ tên participantId cho layer UI nhưng giá trị là userId thực
    isHost, setIsHost 
  }), [token, meetingId, participantId, isHost]);

  return (
    <MeetingAppContext.Provider value={value}>
      {children}
    </MeetingAppContext.Provider>
  );
}
