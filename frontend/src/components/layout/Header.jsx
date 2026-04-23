import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaBars,
  FaUserPlus,
  FaSignInAlt,
  FaPlayCircle,
} from "react-icons/fa";
import { TeamOutlined } from "@ant-design/icons";
import { Spin } from "antd";
import UserMenu from "../common/UserMenu";
import { useAuth } from "../../modules/auth/hooks/useAuth";
import WatchPartyModal from "../../modules/meeting/components/WatchPartyModal";
import { searchMovies } from "../../services/movieService";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isWatchPartyModalOpen, setIsWatchPartyModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  const searchRef = useRef(null);
  const { isAuthenticated, isBootstrapping } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Xử lý Search Debounce
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      setShowResults(true);
      try {
        const results = await searchMovies(searchQuery);
        setSearchResults(results);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleResultClick = (slug) => {
    setSearchQuery("");
    setShowResults(false);
    navigate(`/watch/${slug}`);
  };

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

          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-[#ffdd95] ${
                  location.pathname === link.path
                    ? "text-white font-bold"
                    : "text-gray-300"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
            {/* SEARCH BAR CONTAINER */}
            <div className="relative" ref={searchRef}>
              <div className="hidden md:flex items-center bg-white/10 hover:bg-white/15 transition-colors rounded-full px-4 py-1.5 gap-2 min-w-[200px] lg:min-w-[350px] border border-white/5 focus-within:border-[#ffdd95]/50 focus-within:bg-white/20">
                <FaSearch className="text-gray-400 text-xs" />
                <input
                  type="text"
                  placeholder="Tìm phim, diễn viên..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
                  className="bg-transparent border-none text-white text-sm w-full focus:outline-none placeholder-gray-500"
                />
                {isSearching && <Spin size="small" />}
              </div>

              {/* SEARCH RESULTS DROPDOWN */}
              {showResults && (
                <div className="absolute top-full left-0 w-full mt-2 bg-[#1a1a1a] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden max-h-[450px] overflow-y-auto backdrop-blur-xl">
                  {searchResults.length > 0 ? (
                    <div className="p-2">
                      <div className="px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                        Kết quả tìm kiếm
                      </div>
                      {searchResults.map((movie) => (
                        <div
                          key={movie.id}
                          onClick={() => handleResultClick(movie.slug)}
                          className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-xl cursor-pointer transition-colors group"
                        >
                          <img
                            src={movie.poster_url}
                            alt={movie.title}
                            className="w-12 h-16 object-cover rounded-md shadow-lg"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-white truncate group-hover:text-[#ffdd95] transition-colors">
                              {movie.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] px-1.5 py-0.5 bg-gray-800 text-gray-400 rounded uppercase">
                                {movie.type === 'movie' ? 'Phim lẻ' : 'Phim bộ'}
                              </span>
                              <span className="text-[11px] text-gray-500">
                                {movie.release_year}
                              </span>
                            </div>
                          </div>
                          <FaPlayCircle className="text-gray-600 group-hover:text-[#ffdd95] opacity-0 group-hover:opacity-100 transition-all transform group-hover:scale-110" />
                        </div>
                      ))}
                    </div>
                  ) : !isSearching ? (
                    <div className="p-8 text-center">
                      <p className="text-gray-500 text-sm">Không tìm thấy kết quả nào cho "{searchQuery}"</p>
                    </div>
                  ) : null}
                </div>
              )}
            </div>

          <div className="flex items-center gap-3">
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
      
      <WatchPartyModal 
        open={isWatchPartyModalOpen} 
        onCancel={() => setIsWatchPartyModalOpen(false)} 
        production={null}
      />
    </>
  );
};

export default Header;
