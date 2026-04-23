import { useState } from "react";
import { Send } from "lucide-react";

const MAX_LENGTH = 1000;

export default function CommentInput({ onSubmit }) {
  const [text, setText] = useState("");

  const handleChange = (e) => {
    if (e.target.value.length <= MAX_LENGTH) setText(e.target.value);
  };

  const handleSubmit = () => {
    if (!text.trim()) return;
    if (onSubmit) onSubmit({ content: text });
    setText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const isNearLimit = text.length > MAX_LENGTH * 0.9;
  const isEmpty = text.trim().length === 0;

  return (
    <div className="w-full bg-[#1a1c22] p-4 rounded-xl shadow-lg">
      {/* INPUT AREA */}
      <div
        className={`
          relative group bg-[#2a2d35] rounded-lg p-3 border border-gray-700
          transition-colors duration-300 ease-in-out
          focus-within:bg-[#202228] focus-within:border-blue-500/50
          focus-within:shadow-[0_0_0_2px_rgba(59,130,246,0.1)]
        `}
      >
        <textarea
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Write your comment here..."
          rows={3}
          className="w-full bg-transparent text-white text-sm placeholder-gray-500 outline-none resize-none pb-6"
        />
        <div
          className={`absolute bottom-2 right-3 text-xs font-medium pointer-events-none select-none transition-colors duration-200 ${
            isNearLimit ? "text-red-500" : "text-gray-500"
          }`}
        >
          {text.length} / {MAX_LENGTH}
        </div>
      </div>

      {/* ACTION BAR */}
      <div className="flex items-center justify-end mt-3 gap-2">

        {/* Send Button */}
        <button
          onClick={handleSubmit}
          disabled={isEmpty}
          className={`
            flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold transition-all duration-200 shrink-0
            ${isEmpty
              ? "bg-gray-700 text-gray-500 cursor-not-allowed opacity-50"
              : "bg-[#d4a017] hover:bg-[#b88b14] text-black shadow-md hover:shadow-lg active:scale-95"
            }
          `}
        >
          Send <Send size={14} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
