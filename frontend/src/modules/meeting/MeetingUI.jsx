import {
  useRealtimeKitSelector,
} from "@cloudflare/realtimekit-react";
import {
  RtkParticipantsAudio,
  RtkNotifications,
  RtkSetupScreen,
  RtkMicToggle,
  RtkCameraToggle,
  RtkChatToggle,
  RtkParticipantsToggle,
  RtkSettingsToggle,
  RtkLeaveButton,
  RtkLeaveMeeting,
  RtkGrid,
  RtkGridPagination,
  RtkChat,
  RtkParticipants,
  RtkSettings,
} from "@cloudflare/realtimekit-react-ui";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import WatchPartyPlayer from "./components/WatchPartyPlayer";
import { useMeetingContext } from "./MeetingContext";
import socket from "../../services/socket";

export default function MeetingUI({ meeting }) {
  const navigate = useNavigate();
  const roomState = useRealtimeKitSelector((m) => m?.self?.roomState);
  const activeParticipants = useRealtimeKitSelector(
    (m) => m?.participants?.active,
  );

  // Quản lý trạng thái thanh bên bằng Local State vì SDK không expose thuộc tính reactive cho UI panels
  const [sidebarState, setSidebarState] = useState({
    activeSidebar: false,
    sidebar: "chat",
    activeLeaveConfirmation: false,
    page: 1,
    maxPeers: 6, // Hiển thị 6 người trên 1 trang để phù hợp cột 20%
  });

  const handleStateUpdate = (e) => {
    // Merge toàn bộ payload từ SDK vào local state
    setSidebarState((prev) => {
      const newState = { ...prev, ...e.detail };
      
      // Đặc biệt xử lý toggle cho Leave Confirmation: 
      // Nếu SDK gửi activeLeaveConfirmation: true mà state hiện tại ĐÃ LÀ true -> hiểu là người dùng bấm lại để đóng.
      if (e.detail.activeLeaveConfirmation === true && prev.activeLeaveConfirmation === true) {
        newState.activeLeaveConfirmation = false;
      }
      
      return newState;
    });
  };

  const isChatOpen =
    sidebarState.activeSidebar && sidebarState.sidebar === "chat";
  const isParticipantsOpen =
    sidebarState.activeSidebar && sidebarState.sidebar === "participants";
  const isSettingsOpen =
    sidebarState.activeSidebar && sidebarState.sidebar === "settings";

  const isAnyPanelOpen = sidebarState.activeSidebar;

  const { meetingId, isHost, participantId } = useMeetingContext();
  const [isTheaterMode, setIsTheaterMode] = useState(false);

  useEffect(() => {
    // Kết nối Socket khi tham gia phòng (sau khi RtkSetupScreen đã xong)
    if (roomState === "joined" && meetingId && participantId) {
      socket.connect();
      socket.emit("join_party", { meetingId, isHost, participantId });
    }

    return () => {
      // Cleanup nếu cần
    };
  }, [roomState, meetingId, isHost, participantId]);

  // Tự động quay về trang trước khi rời phòng (Leave) hoặc bị Kick/End Meeting
  useEffect(() => {
    if (roomState === "left") {
      navigate(-1); // Quay lại trang chi tiết phim hoặc trang chủ
    }
  }, [roomState, navigate]);

  // 1. Tách Setup Screen ra riêng - Render Full Width trước khi vào giao diện chính
  if (roomState !== "joined") {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#121212] px-4">
        {/* Force white color for titles and identifiers in the setup screen */}
        <div className="w-full max-w-5xl rtk-setup-screen-container">
          <RtkSetupScreen meeting={meeting} />
        </div>
      </div>
    );
  }

  // 2. Giao diện chính (Chỉ render khi đã joined)
  return (
    <div className="flex flex-col h-full w-full bg-[#121212] font-sans text-slate-100 relative">
      <div className="flex flex-1 flex-row w-full h-full overflow-hidden">
        
        {/* CỘT 1: Video Call Container */}
        <div
          className={`relative h-full transition-all duration-500 ease-in-out bg-black flex flex-col overflow-hidden shrink-0 ${
            isTheaterMode
              ? "absolute top-4 left-4 z-50 w-64 h-auto shadow-2xl rounded-lg border border-gray-700"
              : "w-1/3 lg:w-3/12 border-r border-[#2a2a2a] z-10"
          }`}
        >
          <div className="flex-1 flex flex-col min-h-0">
            <RtkGrid
              meeting={meeting}
              states={sidebarState}
              onRtkStateUpdate={handleStateUpdate}
              className="flex-1"
            />
            
            {/* Phân trang Video */}
            <div className="bg-black/50 py-1">
              <RtkGridPagination
                meeting={meeting}
                states={sidebarState}
              />
            </div>
          </div>

          {/* CUSTOM CONTROL BAR */}
          <div className="p-2 md:p-4 bg-gray-900/90 backdrop-blur-md border-t border-gray-800 flex flex-wrap items-center justify-center gap-2 md:gap-4 shrink-0">
            <RtkMicToggle meeting={meeting} />
            <RtkCameraToggle meeting={meeting} />
            <RtkChatToggle
              meeting={meeting}
              states={sidebarState}
              onRtkStateUpdate={handleStateUpdate}
            />
            <RtkParticipantsToggle
              meeting={meeting}
              states={sidebarState}
              onRtkStateUpdate={handleStateUpdate}
            />
        
            <RtkLeaveButton onRtkStateUpdate={handleStateUpdate} />
          </div>

          <RtkNotifications meeting={meeting} />
          <RtkParticipantsAudio meeting={meeting} />
          
          {/* Dialog xác nhận thoát — chỉ mount khi bấm nút Leave */}
          {sidebarState.activeLeaveConfirmation && (
            <div className="absolute inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-2">
              <div className="w-full max-w-full overflow-hidden scale-90 origin-center">
                <RtkLeaveMeeting
                  meeting={meeting}
                  states={sidebarState}
                  onRtkStateUpdate={handleStateUpdate}
                />
              </div>
            </div>
          )}
        </div>

        {/* CỘT 2: Watch Party Container (Màn hình chính - Tự động co giãn) */}
        <div
          className={`flex-1 h-full bg-[#0a0a0a] relative transition-all duration-500 ease-in-out`}
        >
          <WatchPartyPlayer
            meeting={meeting}
            isTheaterMode={isTheaterMode}
            setIsTheaterMode={setIsTheaterMode}
            socket={socket}
          />
        </div>

        {/* CỘT 3: Side Panel (Chat / Participants / Settings) */}
        <div
          className={`h-full bg-[#1a1a1a] border-l border-gray-800 transition-all duration-500 ease-in-out overflow-hidden shrink-0 ${
            isAnyPanelOpen ? "w-1/5" : "w-0 border-none"
          }`}
        >
          <div className="w-full h-full flex flex-col">
            {isChatOpen && (
              <div className="flex-1 flex flex-col h-full">
                <div className="p-4 border-b border-gray-800 bg-gray-900/50 flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">
                    Trò chuyện
                  </h3>
                  <button
                    onClick={() =>
                      setSidebarState((s) => ({ ...s, activeSidebar: false }))
                    }
                    className="text-gray-400 hover:text-white"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
                <RtkChat
                  meeting={meeting}
                  states={sidebarState}
                  className="flex-1"
                  onRtkStateUpdate={handleStateUpdate}
                />
              </div>
            )}

            {isParticipantsOpen && (
              <div className="flex-1 flex flex-col h-full">
                <div className="p-4 border-b border-gray-800 bg-gray-900/50 flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">
                    Thành viên
                  </h3>
                  <button
                    onClick={() =>
                      setSidebarState((s) => ({ ...s, activeSidebar: false }))
                    }
                    className="text-gray-400 hover:text-white"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
                <RtkParticipants
                  meeting={meeting}
                  states={sidebarState}
                  className="flex-1"
                  onRtkStateUpdate={handleStateUpdate}
                />
              </div>
            )}

            {isSettingsOpen && (
              <div className="flex-1 flex flex-col h-full">
                <div className="p-4 border-b border-gray-800 bg-gray-900/50 flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">
                    Cài đặt
                  </h3>
                  <button
                    onClick={() =>
                      setSidebarState((s) => ({ ...s, activeSidebar: false }))
                    }
                    className="text-gray-400 hover:text-white"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  <RtkSettings
                    meeting={meeting}
                    states={sidebarState}
                    onRtkStateUpdate={handleStateUpdate}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
