import { useState, useRef } from "react";

export default function RatingBar({
  max = 10,
  onChange, // Hàm callback để gửi giá trị ra ngoài
  initialValue = 0,
}) {
  const [rating, setRating] = useState(initialValue);
  const [hoverRating, setHoverRating] = useState(0);
  const barRef = useRef(null);

  // Tính toán giá trị dựa trên vị trí chuột
  const calculateRating = (e) => {
    if (!barRef.current) return 0;

    const { left, width } = barRef.current.getBoundingClientRect();
    // Tính tọa độ X của chuột so với thanh bar
    const x = e.clientX - left;

    // Tính phần trăm và quy đổi ra thang điểm max (ví dụ 10)
    let newRating = Math.ceil((x / width) * max);

    // Giới hạn giá trị trong khoảng 0 -> max
    if (newRating < 0) newRating = 0;
    if (newRating > max) newRating = max;

    return newRating;
  };

  const handleMouseMove = (e) => {
    const val = calculateRating(e);
    setHoverRating(val);
  };

  const handleClick = (e) => {
    const val = calculateRating(e);
    setRating(val);
    if (onChange) onChange(val); // Gửi giá trị ra ngoài component cha
  };

  const handleMouseLeave = () => {
    setHoverRating(0); // Reset hover khi chuột rời đi
  };

  // Giá trị hiển thị: Nếu đang hover thì lấy hoverRating, nếu không thì lấy rating đã chọn
  const displayRating = hoverRating > 0 ? hoverRating : rating;

  // Tính % độ rộng của thanh màu
  const fillPercentage = (displayRating / max) * 100;

  // Màu sắc: Thay đổi màu dựa trên điểm số (tùy chọn)
  const getColor = (value) => {
    if (value <= 4) return "bg-red-500";
    if (value <= 7) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="w-full max-w-md mx-auto p-4">
      {/* Hiển thị số điểm */}
      <div className="flex justify-between mb-2 text-white font-medium">
        <span>Đánh giá của bạn</span>
        <span className="text-xl">
          {displayRating}/{max}
        </span>
      </div>

      {/* Vùng thanh trượt */}
      <div
        ref={barRef}
        className="relative h-4 w-full bg-gray-700 rounded-full cursor-pointer overflow-hidden group"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        {/* Layer 1: Các vạch chia (Grid) - để trang trí */}
        <div className="absolute inset-0 z-10 flex justify-between px-[1px]">
          {[...Array(max)].map((_, i) => (
            <div
              key={i}
              className="w-[1px] h-full bg-[#1a1c22]/50 first:hidden"
            />
          ))}
        </div>

        {/* Layer 2: Thanh hiển thị (Fill) */}
        <div
          className={`h-full transition-all duration-75 ease-out rounded-full ${getColor(displayRating)}`}
          style={{ width: `${fillPercentage}%` }}
        />

        {/* Layer 3: Hiệu ứng bóng mờ khi hover (Optional) */}
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </div>

      <div className="flex justify-between mt-1 text-xs text-gray-500">
        <span>0</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
