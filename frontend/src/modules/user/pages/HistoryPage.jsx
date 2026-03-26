import React from 'react';
import { FaHistory } from 'react-icons/fa';

const HistoryPage = () => {
    return (
        <div>
            {/* Section Title */}
            <div className="flex items-center gap-2 mb-6">
                <FaHistory className="text-xl text-white" />
                <h2 className="text-2xl font-bold text-white">Continue Watching</h2>
            </div>

            {/* Content */}
            <div className="bg-[#2a2a2d] rounded-lg p-8 shadow-lg">
                <p className="text-gray-400 text-center py-10">
                    Bạn chưa xem phim nào gần đây.
                </p>
            </div>
        </div>
    );
};

export default HistoryPage;
