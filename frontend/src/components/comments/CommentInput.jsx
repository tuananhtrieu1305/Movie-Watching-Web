import { useState } from "react";
import { Send, AlertCircle } from "lucide-react"; // Thêm icon cảnh báo nếu cần

const MAX_LENGTH = 1000;

export default function CommentInput({ onSubmit }) {
  const [text, setText] = useState("");
  const [isSpoiler, setIsSpoiler] = useState(false);

  // --- LOGIC HANDLERS ---

  const handleChange = (e) => {
    const newValue = e.target.value;
    if (newValue.length <= MAX_LENGTH) {
      setText(newValue);
    }
  };

  const handleSubmit = () => {
    // 1. Validation: Không gửi nếu text rỗng hoặc chỉ toàn khoảng trắng
    if (!text.trim()) return;

    // 2. Gửi dữ liệu ra ngoài cho Parent xử lý
    if (onSubmit) {
      onSubmit({ content: text, isSpoiler });
    }

    // 3. Reset form về trạng thái ban đầu
    setText("");
    setIsSpoiler(false);
  };

  // Tính năng UX: Nhấn Ctrl + Enter để gửi
  const handleKeyDown = (e) => {
    if (e.ctrlKey && e.key === "Enter") {
      handleSubmit();
    }
  };

  // --- DERIVED STATE (Tính toán giao diện) ---

  const isNearLimit = text.length > MAX_LENGTH * 0.9;
  const isEmpty = text.trim().length === 0;

  return (
    <div className="w-full max-w-2xl mx-auto bg-[#1a1c22] p-4 rounded-xl shadow-lg">
      {/* 1. INPUT AREA WRAPPER */}
      <div
        className={`
          relative group
          bg-[#2a2d35] rounded-lg p-3 border border-gray-700
          transition-colors duration-300 ease-in-out
          focus-within:bg-[#202228] focus-within:border-blue-500/50
          focus-within:shadow-[0_0_0_2px_rgba(59,130,246,0.1)]
        `}
      >
        <textarea
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Viết bình luận của bạn tại đây..."
          rows={3}
          className="
            w-full bg-transparent text-white text-sm
            placeholder-gray-500 
            outline-none resize-none
            pb-6 /* Chừa chỗ cho bộ đếm */
          "
        />

        {/* Character Counter */}
        <div
          className={`
            absolute bottom-2 right-3 text-xs font-medium
            pointer-events-none select-none transition-colors duration-200
            ${isNearLimit ? "text-red-500" : "text-gray-500"}
          `}
        >
          {text.length} / {MAX_LENGTH}
        </div>
      </div>

      {/* 2. ACTION BAR (TOOLBAR) */}
      <div className="flex justify-between items-center mt-3">
        {/* Left: Spoiler Toggle */}
        <button
          onClick={() => setIsSpoiler(!isSpoiler)}
          className="flex items-center gap-2 group cursor-pointer focus:outline-none"
          type="button" // Quan trọng: prevent submit form nếu nằm trong form tag
        >
          <div
            className={`
              w-10 h-5 rounded-full p-1 transition-colors duration-300
              ${isSpoiler ? "bg-blue-600" : "bg-gray-600 group-hover:bg-gray-500"}
            `}
          >
            <div
              className={`
                w-3 h-3 bg-white rounded-full shadow-sm 
                transform transition-transform duration-300
                ${isSpoiler ? "translate-x-5" : "translate-x-0"}
              `}
            />
          </div>
          <span
            className={`text-sm select-none transition-colors ${isSpoiler ? "text-blue-400" : "text-gray-400"}`}
          >
            Tiết lộ nội dung
          </span>
        </button>

        {/* Right: Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={isEmpty}
          className={`
            flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold transition-all duration-200
            ${
              isEmpty
                ? "bg-gray-700 text-gray-500 cursor-not-allowed opacity-50"
                : "bg-[#d4a017] hover:bg-[#b88b14] text-black shadow-md hover:shadow-lg active:scale-95"
            }
          `}
        >
          Gửi <Send size={14} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
