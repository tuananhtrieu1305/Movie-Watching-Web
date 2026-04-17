import { useEffect, useState, useRef } from "react";
import {
  useRealtimeKitClient,
  RealtimeKitProvider,
} from "@cloudflare/realtimekit-react";
import { useMeetingContext } from "../MeetingContext";
import MeetingUI from "../MeetingUI";
import WhiteboardController from "./WhiteboardController";

export default function ActiveMeeting() {
  const { token, hostId } = useMeetingContext();
  const [meeting, initMeeting] = useRealtimeKitClient();
  const [isJoined, setIsJoined] = useState(false);
  const hasInit = useRef(false);

  // 1. KHỞI TẠO SDK (Chỉ 1 lần)
  useEffect(() => {
    let isMounted = true;
    if (token && !hasInit.current) {
      hasInit.current = true;
      initMeeting({
        authToken: token,
        defaults: { audio: false, video: false },
      }).catch((err) => {
        if (isMounted) {
          console.error("Lỗi init:", err);
          hasInit.current = false; // Cho phép thử lại nếu call api lỗi
        }
      });
    }
    return () => { isMounted = false; };
  }, [token, initMeeting]);

  // 2. ÉP JOIN PHÒNG NGẦM VỚI DELAY (Fix lỗi Race Condition Socket)
   useEffect(() => {
    let isMounted = true;
    if (meeting && !isJoined) {
      meeting
        .joinRoom("Khách tham gia") // Bạn có thể truyền tên thật của user vào đây
        .then(() => {
          if (isMounted) {
            console.log("Ép Join thành công!");
            setIsJoined(true); // Kích hoạt render UI
          }
        })
        .catch((err) => {
          if (isMounted) console.error("Lỗi joinRoom:", err);
        });
    }
    return () => { isMounted = false; };
  }, [meeting, isJoined]);


  // 3. MÀN HÌNH CHỜ TRONG LÚC ĐANG ÉP JOIN
  if (!isJoined) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-slate-900 text-white gap-4">
        <div 
          className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
          aria-hidden="true"
        ></div>
        <p className="font-medium text-lg">
          Đang thiết lập phòng họp an toàn…
        </p>
      </div>
    );
  }

  // 4. KHI ĐÃ JOIN XONG, RENDER GIAO DIỆN CHÍNH
  return (
    <div className="h-screen w-full bg-black">
      <RealtimeKitProvider value={meeting}>
        <MeetingUI meeting={meeting} />
        <WhiteboardController meeting={meeting} hostId={hostId} />
      </RealtimeKitProvider>
    </div>
  );
}
