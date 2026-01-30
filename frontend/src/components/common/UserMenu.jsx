import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUser, FaHistory, FaHeart, FaBell, FaFileImport, FaCog, FaSignOutAlt, FaArrowRight } from 'react-icons/fa';
import { FaCrown } from 'react-icons/fa6';

const UserMenu = () => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    // Xử lý click ra ngoài thì đóng menu
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const menuItems = [
        { icon: <FaUser />, label: 'Tài Khoản', path: '/user/profile' },
        { icon: <FaHistory />, label: 'Lịch Sử', path: '/user/history' },
        { icon: <FaHeart />, label: 'Yêu Thích', path: '/user/favorites' },
        { icon: <FaCrown />, label: 'Nâng Cấp VIP', path: '/user/plans' },
        { icon: <FaBell />, label: 'Thông Báo', path: '/user/notifications' },
        { icon: <FaCog />, label: 'Cài Đặt', path: '/user/settings' },
    ];

    return (
        <div className="relative" ref={menuRef}>
            {/* 1. Avatar Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 hover:bg-gray-800 p-1 rounded-full transition-colors focus:outline-none border border-transparent hover:border-gray-700"
            >
                <img
                    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100"
                    alt="User Avatar"
                    className="w-9 h-9 rounded-full object-cover border border-gray-600"
                />
            </button>

            {/* 2. Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-[#1e1e1e] border border-gray-800 rounded-2xl shadow-2xl p-4 z-50 transform origin-top-right animate-in fade-in zoom-in-95 duration-200">

                    {/* Header Info */}
                    <div className="mb-4 px-2">
                        <p className="text-base text-[#ffdd95] font-bold truncate">vinhngu</p>
                        <p className="text-sm text-white truncate mt-0.5">student@gmail.com</p>
                    </div>

                    {/* Menu Items */}
                    <div className="flex flex-col gap-2">
                        {menuItems.map((item, index) => (
                            <Link
                                key={index}
                                to={item.path}
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-4 px-4 py-3 bg-[#2d2d2d] hover:bg-[#3d3d3d] rounded-full text-white text-sm font-medium transition-colors"
                            >
                                <span className="text-lg">{item.icon}</span>
                                {item.label}
                            </Link>
                        ))}
                    </div>

                    {/* Logout Button */}
                    <div className="mt-4 flex justify-end">
                        <Link
                            to="/login"
                            className="flex items-center gap-2 text-white hover:text-gray-300 text-sm font-bold transition-colors px-2 py-1"
                        >
                            Đăng Xuất <FaArrowRight />
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserMenu;