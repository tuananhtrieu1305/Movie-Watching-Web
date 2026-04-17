import { 
  useRealtimeKitMeeting, 
  useRealtimeKitSelector
} from "@cloudflare/realtimekit-react";
import { 
  RtkSimpleGrid,
  RtkParticipantsAudio,
  RtkNotifications, 
  RtkSetupScreen,
  RtkMicToggle,
  RtkCameraToggle,
  RtkChatToggle,
  RtkParticipantsToggle,
  RtkSettingsToggle,
  RtkLeaveButton
} from "@cloudflare/realtimekit-react-ui";
import { useEffect, useState } from "react";
import WatchPartyPlayer from "./components/WatchPartyPlayer";
import { useMeetingContext } from "./MeetingContext";
import socket from "../../services/socket";

export default function MeetingUI({ meeting }) {
  const roomState = useRealtimeKitSelector((m) => m?.self?.roomState);
  const activeParticipants = useRealtimeKitSelector((m) => m?.participants?.active);
  
  const { meetingId, isHost, participantId } = useMeetingContext();
  const [isTheaterMode, setIsTheaterMode] = useState(false);

  useEffect(() => {
    // Kết nối Socket khi tham gia phòng (sau khi RtkSetupScreen đã xong)
    if (roomState === "joined" && meetingId && participantId) {
      socket.connect();
      socket.emit("join_party", { meetingId, isHost, participantId });

      socket.on("assigned_as_host", (data) => {
        console.log(data.message);
      });
    }

    return () => {
      socket.off("assigned_as_host");
    };
  }, [roomState, meetingId, isHost, participantId]);

  return (
    <div className="flex flex-col h-full w-full bg-[#121212] font-sans text-slate-100 relative">
      
      {/* Main split-screen layout */}
      <div className="flex flex-1 flex-row w-full h-full overflow-hidden">
        {/* Left Side: Video Call Container */}
        <div 
          className={`relative h-full transition-all duration-500 ease-in-out bg-black flex flex-col overflow-hidden ${
            isTheaterMode 
              ? 'absolute top-4 left-4 z-50 w-64 h-auto shadow-2xl rounded-lg border border-gray-700' 
              : 'w-1/3 lg:w-3/12 border-r border-[#2a2a2a] z-10'
          }`}
        >
          {roomState !== "joined" ? (
             <RtkSetupScreen meeting={meeting} />
          ) : (
            <>
              <RtkSimpleGrid 
                participants={activeParticipants ? [meeting.self, ...activeParticipants.toArray()] : [meeting.self]} 
                className="flex-1" 
                meeting={meeting}
              />
              
              {/* CUSTOM CONTROL BAR - Tối ưu cho màn hình nhỏ */}
              <div className="p-2 md:p-4 bg-gray-900/90 backdrop-blur-md border-t border-gray-800 flex flex-wrap items-center justify-center gap-2 md:gap-4 shrink-0">
                <RtkMicToggle meeting={meeting} />
                <RtkCameraToggle meeting={meeting} />
                <RtkChatToggle meeting={meeting} />
                <RtkParticipantsToggle meeting={meeting} />
                <RtkSettingsToggle meeting={meeting} />
                <RtkLeaveButton meeting={meeting} />
              </div>

              <RtkNotifications meeting={meeting} />
              <RtkParticipantsAudio meeting={meeting} />
            </>
          )}
        </div>

        {/* Right Side: Watch Party Container */}
        {roomState === "joined" && (
          <div className={`${isTheaterMode ? 'w-full' : 'w-2/3 lg:w-9/12'} h-full bg-[#0a0a0a] relative transition-all duration-500`}>
            <WatchPartyPlayer 
              meeting={meeting} 
              isTheaterMode={isTheaterMode} 
              setIsTheaterMode={setIsTheaterMode}
              socket={socket}
            />
          </div>
        )}
      </div>
    </div>
  );
}
