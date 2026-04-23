import React from "react";
import CreateMeeting from "./components/CreateMeeting";
import JoinMeeting from "./components/JoinMeeting";

export default function MeetingPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Realtime Group Call
          </h1>
          <p className="text-gray-500 text-base md:text-lg">
            Kết nối mọi người với video call chất lượng cao
          </p>
        </div>

        {/* Card container */}
        <div className="bg-white shadow-xl rounded-2xl p-6 md:p-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CreateMeeting />
            <JoinMeeting />
          </div>
        </div>
      </div>
    </div>
  );
}
