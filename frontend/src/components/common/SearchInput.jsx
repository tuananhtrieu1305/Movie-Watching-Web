import React, { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import { Spin } from "antd";

/**
 * Component Tìm kiếm dùng chung với hiệu ứng Debounce
 * @param {Function} onSearch - Hàm callback được gọi khi người dùng gõ (đã được debounce)
 * @param {string} placeholder - Nội dung gợi ý trong ô nhập
 * @param {boolean} loading - Trạng thái đang tìm kiếm để hiển thị Spinner
 * @param {string} className - Các class CSS bổ sung
 */
const SearchInput = ({ 
  onSearch, 
  placeholder = "Tìm kiếm phim...", 
  loading = false,
  className = "" 
}) => {
  const [value, setValue] = useState("");

  useEffect(() => {
    // Nếu giá trị trống, gọi onSearch ngay để reset danh sách
    if (!value.trim()) {
      onSearch("");
      return;
    }

    // Kỹ thuật Debounce: Chờ người dùng ngừng gõ 500ms mới kích hoạt tìm kiếm
    const timer = setTimeout(() => {
      onSearch(value);
    }, 500);

    return () => clearTimeout(timer);
  }, [value, onSearch]);

  return (
    <div className={`relative group ${className}`}>
      {/* Hiệu ứng viền phát sáng khi focus */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-[#ffdd95] to-orange-500 rounded-xl blur opacity-10 group-focus-within:opacity-30 transition duration-300"></div>
      
      <div className="relative flex items-center bg-[#1a1a1a] border border-gray-800 rounded-xl px-4 py-3 focus-within:border-[#ffdd95]/50 transition-all shadow-2xl">
        <FaSearch className="text-gray-500 mr-3" />
        
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="bg-transparent border-none text-white text-lg w-full focus:outline-none placeholder-gray-600"
        />

        {loading && (
          <div className="ml-2">
            <Spin size="small" />
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchInput;
