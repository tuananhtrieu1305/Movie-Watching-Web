import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaSearch, FaBell, FaBars } from 'react-icons/fa';
import UserMenu from '../common/UserMenu'; // Đảm bảo bạn đã tạo file này ở bước trước

const Header = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Trang chủ', path: '/' },
        { name: 'Phim bộ', path: '/series' },
        { name: 'Phim lẻ', path: '/movies' },
        { name: 'Mới nhất', path: '/latest' },
    ];

    return (
        <header
            className={`fixed top-0 z-50 w-full transition-all duration-500 ease-in-out ${isScrolled
                ? 'bg-gray-950/40 shadow-lg shadow-black/30 backdrop-blur-md py-3'
                : 'bg-transparent py-4'
                }`}
        >
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 flex items-center justify-between">

                {/* --- LEFT: Logo & Search & Nav --- */}
                <div className="flex items-center gap-6">
                    {/* Logo */}
                    <Link to="/" className="text-2xl font-black text-[#ffdd95] tracking-tight hover:opacity-90 transition-opacity">
                        NETFLICK
                    </Link>

                    {/* Search Bar - Ngay sau Logo, kiểu như RoPhim */}
                    <div className="hidden sm:flex items-center bg-gray-800/80 rounded-full px-4 py-2 gap-2 min-w-[200px] lg:min-w-[280px]">
                        <FaSearch className="text-gray-400 text-sm" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm phim, diễn viên"
                            className="bg-transparent border-none text-white text-sm w-full focus:outline-none placeholder-gray-500"
                        />
                    </div>

                    {/* Desktop Menu */}
                    <nav className="hidden lg:flex items-center gap-6">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`text-sm font-medium transition-colors hover:text-[#ffdd95] ${location.pathname === link.path ? 'text-white font-bold' : 'text-gray-300'
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* --- RIGHT: Search, Noti, User --- */}
                <div className="flex items-center gap-5">


                    {/* Notification */}
                    <button className="relative p-2 text-gray-300 hover:text-white transition-colors">
                        <FaBell className="text-xl" />
                        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-gray-900"></span>
                    </button>

                    {/* User Menu Dropdown (Component con) */}
                    <UserMenu />

                    {/* Mobile Menu Toggle */}
                    <button className="lg:hidden text-white text-2xl ml-2">
                        <FaBars />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;