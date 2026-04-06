import { useState } from "react";

export default function RatingBar({
  max = 5,
  onChange,
  initialValue = 0,
}) {
  // Store rating as a 0–5 integer
  const [rating, setRating] = useState(
    initialValue > 5 ? Math.round(initialValue / 2) : initialValue
  );
  const [hoverRating, setHoverRating] = useState(0);

  const displayed = hoverRating > 0 ? hoverRating : rating;

  const handleClick = (val) => {
    // Allow de-select by clicking the same star
    const next = val === rating ? 0 : val;
    setRating(next);
    if (onChange) onChange(next * 2); // emit on /10 scale
  };

  const getStarColor = (index) => {
    if (index <= displayed) {
      if (displayed <= 2) return "text-red-500";
      if (displayed <= 3) return "text-yellow-400";
      return "text-yellow-300";
    }
    return "text-gray-600";
  };

  return (
    <div className="w-full">
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-white font-medium text-sm">Your Rating</span>
        <span className="text-lg font-bold text-yellow-300">
          {displayed > 0 ? `${displayed * 2}/10` : "—/10"}
        </span>
      </div>

      {/* Stars row */}
      <div className="flex items-center gap-1">
        {[...Array(max)].map((_, i) => {
          const val = i + 1;
          return (
            <button
              key={val}
              type="button"
              onClick={() => handleClick(val)}
              onMouseEnter={() => setHoverRating(val)}
              onMouseLeave={() => setHoverRating(0)}
              className={`transition-all duration-100 hover:scale-125 focus:outline-none ${getStarColor(val)}`}
              aria-label={`Rate ${val * 2} out of 10`}
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill={val <= displayed ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="1.5"
                className="drop-shadow-sm"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </button>
          );
        })}

        {/* Reset button */}
        {rating > 0 && (
          <button
            type="button"
            onClick={() => { setRating(0); if (onChange) onChange(0); }}
            className="ml-2 text-gray-500 hover:text-gray-300 text-xs transition-colors"
            title="Clear rating"
          >
            ✕
          </button>
        )}
      </div>

      {/* Scale hint */}
      <div className="flex mt-2 text-xs text-gray-600 gap-1">
        <span>Bad</span>
        <span className="flex-1 text-center">···</span>
        <span>Amazing</span>
      </div>
    </div>
  );
}
