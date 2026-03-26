import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { FaUser, FaHistory, FaHeart, FaBell, FaCog } from 'react-icons/fa';
import { FaCrown } from 'react-icons/fa6';

const UserLayout = () => {
    // Danh sách tabs navigation
    const tabs = [
        { id: 'profile', icon: <FaUser />, label: 'Profile', path: '/user/profile' },
        { id: 'history', icon: <FaHistory />, label: 'Continue Watching', path: '/user/history' },
        { id: 'favorites', icon: <FaHeart />, label: 'Watch List', path: '/user/favorites' },
        { id: 'plans', icon: <FaCrown />, label: 'Nâng Cấp VIP', path: '/user/plans' },
        { id: 'notifications', icon: <FaBell />, label: 'Notification', path: '/user/notifications' },
        { id: 'settings', icon: <FaCog />, label: 'Settings', path: '/user/settings' },
    ];

    return (
        <div className="min-h-screen bg-[#1a1a1d] text-gray-200 font-sans pb-20">

            {/* 1. Top Header - Greeting */}
            <div className="pt-24 pb-6 text-center">
                <h1 className="text-3xl font-medium text-white">Hi, vinhngu</h1>
            </div>

            {/* 2. Navigation Tabs */}
            <div className="flex justify-center border-b border-gray-700 mb-10 overflow-x-auto">
                <div className="flex space-x-8 px-4">
                    {tabs.map((tab) => (
                        <NavLink
                            key={tab.id}
                            to={tab.path}
                            className={({ isActive }) =>
                                `flex items-center gap-2 pb-3 px-1 text-sm font-medium transition-all relative ${isActive
                                    ? 'text-[#ffdd95]'
                                    : 'text-gray-400 hover:text-white'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    {tab.icon}
                                    <span>{tab.label}</span>
                                    {/* Active Indicator Line */}
                                    {isActive && (
                                        <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#ffdd95]"></span>
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                </div>
            </div>

            {/* 3. Main Content - Outlet for child routes */}
            <div className="max-w-4xl mx-auto px-4">
                <Outlet />
            </div>
        </div>
    );
};

export default UserLayout;
