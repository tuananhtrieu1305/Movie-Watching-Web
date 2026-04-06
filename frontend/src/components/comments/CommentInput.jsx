import { useState } from "react";
import { Send } from "lucide-react";

const MAX_LENGTH = 1000;

function InlineStars({ value, hover, onHover, onLeave, onClick, locked }) {
  return (
    <div className="flex items-center gap-0.5" onMouseLeave={onLeave}>
      {[1, 2, 3, 4, 5].map((star) => {
        const active = star <= (hover > 0 ? hover : value);
        const color = active
          ? value <= 2 ? "text-red-400" : value <= 3 ? "text-orange-400" : "text-yellow-300"
          : "text-gray-600";
        return (
          <button
            key={star}
            type="button"
            disabled={locked}
            onMouseEnter={() => !locked && onHover(star)}
            onClick={() => !locked && onClick(star)}
            className={`transition-all duration-100 focus:outline-none ${color} ${
              locked ? "cursor-default" : "hover:scale-125 cursor-pointer"
            }`}
            aria-label={`${star * 2}/10`}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill={active ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </button>
        );
      })}
    </div>
  );
}

export default function CommentInput({ onSubmit, hasRated = false, savedRating = 0 }) {
  const [text, setText] = useState("");
  const [rating, setRating] = useState(
    savedRating > 5 ? Math.round(savedRating / 2) : savedRating
  );
  const [hoverStar, setHoverStar] = useState(0);

  const handleChange = (e) => {
    if (e.target.value.length <= MAX_LENGTH) setText(e.target.value);
  };

  const handleStarClick = (val) => {
    setRating(val === rating ? 0 : val);
  };

  const handleSubmit = () => {
    if (!text.trim()) return;
    if (onSubmit) onSubmit({ content: text, rating: rating * 2 });
    setText("");
  };

  const handleKeyDown = (e) => {
    if (e.ctrlKey && e.key === "Enter") handleSubmit();
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
      <div className="flex items-center justify-between mt-3 gap-2">

        {/* Center-left: Inline Stars */}
        <div className="flex items-center gap-2">
          <InlineStars
            value={rating}
            hover={hoverStar}
            onHover={setHoverStar}
            onLeave={() => setHoverStar(0)}
            onClick={handleStarClick}
            locked={hasRated}
          />
          <span className={`text-xs font-mono font-bold min-w-[36px] ${
            rating > 0 ? "text-yellow-300" : "text-gray-600"
          }`}>
            {rating > 0 ? `${rating * 2}/10` : "—/10"}
          </span>
          {hasRated && (
            <span className="text-[10px] bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded px-1.5 py-0.5 font-medium">
              Rated
            </span>
          )}
        </div>

        {/* Right: Send Button */}
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
