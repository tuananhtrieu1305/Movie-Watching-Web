import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaSearch,
  FaBars,
  FaUserPlus,
  FaSignInAlt,
} from "react-icons/fa";
import { TeamOutlined } from "@ant-design/icons";
import UserMenu from "../common/UserMenu";
import { useAuth } from "../../modules/auth/hooks/useAuth";
import WatchPartyModal from "../../modules/meeting/components/WatchPartyModal";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isWatchPartyModalOpen, setIsWatchPartyModalOpen] = useState(false);
  const { isAuthenticated, isBootstrapping } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Trang chủ", path: "/" },
    { name: "Phim bộ", path: "/movies?type=series" },
    { name: "Phim lẻ", path: "/movies?type=movie" },
    { name: "Mới nhất", path: "/movies?sort=newest" },
  ];

  return (
    <>
      <header
        className={`fixed top-0 z-50 w-full transition-all duration-500 ease-in-out ${
          isScrolled
            ? "bg-gray-950/60 shadow-lg shadow-black/30 backdrop-blur-md py-3"
            : "bg-gradient-to-b from-black/80 to-transparent py-4"
        }`}
      >
        <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="text-2xl font-black text-[#ffdd95] tracking-tight hover:opacity-90 transition-opacity"
            >
              NETFLICK
            </Link>

            <div className="hidden md:flex items-center bg-white/10 hover:bg-white/15 transition-colors rounded-full px-4 py-1.5 gap-2 min-w-[200px] lg:min-w-[300px]">
              <FaSearch className="text-gray-400 text-xs" />
              <input
                type="text"
                placeholder="Tìm phim, diễn viên..."
                className="bg-transparent border-none text-white text-sm w-full focus:outline-none placeholder-gray-500"
              />
            </div>

            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-[14px] font-semibold transition-all hover:text-[#ffdd95] ${
                    location.pathname === link.path
                      ? "text-[#ffdd95]"
                      : "text-gray-200"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {/* Watch Party Button */}
            <button 
              onClick={() => setIsWatchPartyModalOpen(true)}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm font-bold transition-all border border-white/10 hover:border-white/30"
            >
              <TeamOutlined className="text-lg text-[#ffdd95]" />
              <span className="hidden sm:inline">Watch Party</span>
            </button>

            {isBootstrapping ? null : isAuthenticated ? (
              <UserMenu />
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-4 py-1.5 text-sm font-bold text-white hover:text-[#ffdd95] transition-colors"
                >
                  <FaSignInAlt />
                  <span className="hidden sm:inline">Đăng nhập</span>
                </Link>

                <Link
                  to="/register"
                  className="flex items-center gap-2 px-4 py-1.5 text-sm font-bold bg-[#ffdd95] text-gray-950 rounded-full hover:bg-[#ffd175] transition-transform active:scale-95 shadow-lg shadow-[#ffdd95]/10"
                >
                  <FaUserPlus />
                  <span className="hidden sm:inline">Đăng ký</span>
                </Link>
              </div>
            )}

            <button className="lg:hidden text-white text-2xl ml-1">
              <FaBars />
            </button>
          </div>
        </div>
      </header>
      
      {/* Watch Party Modal */}
      <WatchPartyModal 
        open={isWatchPartyModalOpen} 
        onCancel={() => setIsWatchPartyModalOpen(false)} 
        production={null} // Truyền null vì mở từ header không có context phim cụ thể
      />
    </>
  );
};

export default Header;
