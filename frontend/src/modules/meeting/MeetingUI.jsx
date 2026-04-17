import { 
  useRealtimeKitMeeting, 
  useRealtimeKitSelector
} from "@cloudflare/realtimekit-react";
import { 
  RtkSimpleGrid,
  RtkControlbar,
  RtkParticipantsAudio,
  RtkNotifications, 
  RtkPluginMain,
  RtkSetupScreen
} from "@cloudflare/realtimekit-react-ui";
import { useEffect, useState } from "react";

export default function MeetingUI({ meeting }) {
  // Check if whiteboard plugin is active
  const roomState = useRealtimeKitSelector((m) => m?.self?.roomState);
  const activeParticipants = useRealtimeKitSelector((m) => m?.participants?.active);
  const activePlugins = useRealtimeKitSelector((m) => m?.plugins?.active);
  const isWhiteboardActive = activePlugins?.toArray()?.some(p => p.name === "Whiteboard");
  // Memoize or cache the array lookup if possible, but keeping it simple here
  const whiteboardPluginDefinition = activePlugins?.toArray()?.find(p => p.name === "Whiteboard");

  const toggleWhiteboard = async () => {
    if (!meeting) return;
    const whiteboardPlugin = meeting.plugins.all.toArray().find(p => p.name === "Whiteboard");
    
    if (whiteboardPlugin) {
      if (isWhiteboardActive) {
        await whiteboardPlugin.deactivate();
      } else {
        await whiteboardPlugin.activate();
      }
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-950 font-sans text-slate-100 relative">
      {/* HUD: Top action bar overlaid on top of the call */}
      <div className="absolute top-6 left-6 z-50">
        <button 
          onClick={toggleWhiteboard}
          aria-pressed={isWhiteboardActive}
          className={`flex items-center gap-2.5 px-5 py-2.5 pl-4 rounded-full font-medium text-sm transition-all duration-300 shadow-xl border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 ${
            isWhiteboardActive 
              ? "bg-rose-500 hover:bg-rose-600 text-white border-rose-400 focus:ring-rose-500 shadow-rose-500/20" 
              : "bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border-white/10 focus:ring-white/50"
          }`}
        >
          {isWhiteboardActive ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          )}
          <span>{isWhiteboardActive ? "Đóng Bảng Trắng" : "Mở Bảng Trắng"}</span>
        </button>
      </div>

      {/* Main split-screen layout */}
      <div className="flex flex-1 flex-row w-full h-full overflow-hidden">
        {/* Left Side: Video Call Container */}
        <div 
          className={`relative h-full transition-all duration-500 ease-in-out bg-black flex flex-col ${
            isWhiteboardActive ? 'w-1/2 lg:w-5/12 border-r border-slate-800 shadow-[4px_0_24px_rgba(0,0,0,0.5)] z-10' : 'w-full'
          }`}
        >
          {roomState !== "joined" ? (
             <RtkSetupScreen meeting={meeting} />
          ) : (
            <>
              {/* RtkSimpleGrid does not auto-inject plugins like RtkGrid does */}
              <RtkSimpleGrid 
                participants={activeParticipants ? [meeting.self, ...activeParticipants.toArray()] : [meeting.self]} 
                className="flex-1" 
                meeting={meeting}
              />
              <RtkControlbar meeting={meeting} />
              <RtkNotifications meeting={meeting} />
              <RtkParticipantsAudio meeting={meeting} />
            </>
          )}
        </div>

        {/* Right Side: Whiteboard Plugin Container */}
        {isWhiteboardActive && (
          <div className="w-1/2 lg:w-7/12 h-full bg-[#f8f9fa] relative animate-in slide-in-from-right-8 fade-in duration-500">
            <RtkPluginMain meeting={meeting} plugin={whiteboardPluginDefinition} />
          </div>
        )}
      </div>
    </div>
  );
}
