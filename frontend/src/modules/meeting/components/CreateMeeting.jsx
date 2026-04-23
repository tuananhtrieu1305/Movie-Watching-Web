import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMeetingContext } from "../MeetingContext";

export default function CreateMeeting() {
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [meetingData, setMeetingData] = useState(null);
  const [copied, setCopied] = useState(false);

  const navigate = useNavigate();
  const { createRoom } = useMeetingContext();

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Gọi lên Context để fetch token
      const data = await createRoom(title || "Phòng họp mới");

      // QUAN TRỌNG: Cập nhật state để UI chuyển sang bước "Phòng đã sẵn sàng"
      setMeetingData(data);
      console.log("Room created:", data);
    } catch (error) {
      console.error("Lỗi tạo phòng:", error);
      alert("Không thể tạo phòng, vui lòng thử lại!");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (meetingData) {
      navigator.clipboard.writeText(meetingData.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col h-full transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Tạo cuộc gọi mới</h2>
      </div>

      {!meetingData ? (
        <form
          onSubmit={handleCreate}
          className="flex-1 flex flex-col justify-between"
        >
          <div className="mb-8">
            <label htmlFor="title" className="block text-sm font-semibold text-slate-600 mb-3">
              Tiêu đề cuộc gọi
            </label>
            <div className="relative">
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: Phỏng vấn Backend Engineer…"
                autoComplete="off"
                className="w-full pl-4 pr-4 py-3.5 bg-slate-50 rounded-2xl border border-slate-200 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all duration-300 text-slate-700 font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-2xl transition-all duration-300 shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:transform-none flex items-center justify-center gap-3"
          >
            {isLoading ? "Đang khởi tạo…" : "Tạo phòng họp"}
          </button>
        </form>
      ) : (
        <div className="flex-1 flex flex-col justify-center items-center text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-5 shadow-sm">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">
            Phòng đã sẵn sàng!
          </h3>
          <p className="text-slate-500 text-sm mb-6">
            Gửi mã này cho những người tham gia khác
          </p>

          <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between mb-8 transition-colors hover:border-blue-300">
            <span className="text-slate-700 font-mono text-base font-semibold tracking-wide truncate">
              {meetingData.id}
            </span>
            <button
              onClick={copyToClipboard}
              className={`ml-4 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                copied
                  ? "bg-emerald-500 text-white"
                  : "bg-white text-blue-600 border border-blue-100 hover:bg-blue-50"
              }`}
            >
              {copied ? "Đã chép ✓" : "Copy"}
            </button>
          </div>

          <button
            onClick={() => navigate(`/meeting/${meetingData.id}`)}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-4 rounded-2xl transition-all duration-300 shadow-lg shadow-slate-900/20 transform hover:-translate-y-0.5"
          >
            Tham gia ngay
          </button>
        </div>
      )}
    </div>
  );
}
