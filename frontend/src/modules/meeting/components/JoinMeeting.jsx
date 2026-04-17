import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMeetingContext } from "../MeetingContext"; // Nhớ import Context
import { joinMeetingApi } from "../MeetingApi"; // Nhớ import hàm API của bạn

export default function JoinMeeting() {
  const [meetingId, setMeetingId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Lấy hàm setToken từ Context để lưu chìa khóa WebRTC
  const { setToken } = useMeetingContext();

  const handleJoin = async (e) => {
    e.preventDefault();
    const cleanMeetingId = meetingId.trim();

    if (!cleanMeetingId) return;

    setIsLoading(true);
    setError(""); // Xóa lỗi cũ nếu có

    try {
      // 1. Gọi API xin vào phòng
      const data = await joinMeetingApi(cleanMeetingId);

      // 2. Lưu token nhận được vào Context
      // Giả sử API trả về object có chứa token: { token: "..." }
      if (data && data.token) {
        setToken(data.token);

        // 3. Đã có đủ "vũ khí", giờ mới tự tin bước vào phòng!
        navigate(`/meeting/${cleanMeetingId}`);
      } else {
        throw new Error("Backend không trả về Token");
      }
    } catch (err) {
      console.error("Lỗi tham gia phòng:", err);
      setError(
        err.message ||
          "Không thể tham gia. Mã phòng không hợp lệ hoặc đã đóng.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col h-full transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
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
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Tham gia cuộc gọi</h2>
      </div>

      <form
        onSubmit={handleJoin}
        className="flex-1 flex flex-col justify-between"
      >
        <div className="mb-4">
          <label htmlFor="meetingId" className="block text-sm font-semibold text-slate-600 mb-3">
            Mã phòng (Meeting ID)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              id="meetingId"
              value={meetingId}
              onChange={(e) => {
                setMeetingId(e.target.value);
                setError(""); // User gõ phím thì ẩn thông báo lỗi đi
              }}
              disabled={isLoading}
              autoComplete="off"
              placeholder="Nhập mã cuộc gọi… (VD: meet-abc)"
              className="w-full pl-11 pr-4 py-3.5 bg-slate-50 rounded-2xl border border-slate-200 focus:bg-white focus:ring-4 focus:ring-slate-200 focus:border-slate-400 outline-none transition-all duration-300 text-slate-700 font-medium font-mono disabled:opacity-50"
            />
          </div>

          {/* Hiển thị thông báo lỗi nếu có */}
          {error && (
            <p className="mt-3 text-sm text-red-500 font-medium animate-pulse" aria-live="polite">
              {error}
            </p>
          )}
        </div>

        {/* Nút Submit kèm Spinner Loading */}
        <button
          type="submit"
          disabled={!meetingId.trim() || isLoading}
          className="w-full bg-slate-900 text-white border-2 border-slate-900 hover:bg-slate-800 hover:border-slate-800 font-semibold py-3.5 rounded-2xl transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Đang xác thực…
            </>
          ) : (
            "Tham gia phòng"
          )}
        </button>
      </form>
    </div>
  );
}
