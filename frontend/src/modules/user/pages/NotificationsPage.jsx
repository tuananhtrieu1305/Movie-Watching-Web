import React from 'react';
import { FaBell } from 'react-icons/fa';

const NotificationsPage = () => {
    return (
        <div>
            {/* Section Title */}
            <div className="flex items-center gap-2 mb-6">
                <FaBell className="text-xl text-white" />
                <h2 className="text-2xl font-bold text-white">Notification</h2>
            </div>

            {/* Content */}
            <div className="bg-[#2a2a2d] rounded-lg p-8 shadow-lg">
                <p className="text-gray-400 text-center py-10">
                    Không có thông báo mới.
                </p>
            </div>
        </div>
    );
};

export default NotificationsPage;
