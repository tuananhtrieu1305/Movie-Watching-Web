import React from 'react';
import { FaHeart } from 'react-icons/fa';

const FavoritesPage = () => {
    return (
        <div>
            {/* Section Title */}
            <div className="flex items-center gap-2 mb-6">
                <FaHeart className="text-xl text-white" />
                <h2 className="text-2xl font-bold text-white">Watch List</h2>
            </div>

            {/* Content */}
            <div className="bg-[#2a2a2d] rounded-lg p-8 shadow-lg">
                <p className="text-gray-400 text-center py-10">
                    Danh sách yêu thích của bạn đang trống.
                </p>
            </div>
        </div>
    );
};

export default FavoritesPage;
