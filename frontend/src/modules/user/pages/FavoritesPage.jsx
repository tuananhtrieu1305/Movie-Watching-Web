import React, { useEffect, useState } from 'react';
import { FaHeart, FaTrash } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { watchlistApi } from '../services/watchlistApi';
import { useAuth } from '../../auth/hooks/useAuth';

const FavoritesPage = () => {
    const { accessToken } = useAuth();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadWatchlist = async () => {
        if (!accessToken) return;

        setLoading(true);
        try {
            const data = await watchlistApi.getMyWatchlist(accessToken);
            setItems(data.items || []);
        } catch (error) {
            console.error('Get watchlist error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadWatchlist();
    }, [accessToken]);

    const handleRemove = async (productionId) => {
        if (!accessToken) return;

        try {
            await watchlistApi.removeFromWatchlist(accessToken, productionId);
            setItems((prev) => prev.filter((item) => item.production_id !== productionId));
        } catch (error) {
            console.error('Remove watchlist error:', error);
        }
    };

    return (
        <div>
            {/* Section Title */}
            <div className="flex items-center gap-2 mb-6">
                <FaHeart className="text-xl text-white" />
                <h2 className="text-2xl font-bold text-white">Watch List</h2>
            </div>

            {/* Content */}
            <div className="bg-[#2a2a2d] rounded-lg p-8 shadow-lg">
                {loading ? (
                    <p className="text-gray-400 text-center py-10">Đang tải watch list...</p>
                ) : items.length === 0 ? (
                    <p className="text-gray-400 text-center py-10">
                        Danh sách yêu thích của bạn đang trống.
                    </p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {items.map((item) => (
                            <div
                                key={`${item.user_id}-${item.production_id}`}
                                className="bg-[#1f1f22] border border-gray-700 rounded-lg overflow-hidden"
                            >
                                <img
                                    src={item.productions?.poster_url || '/default-avatar.png'}
                                    alt={item.productions?.title}
                                    className="w-full h-56 object-cover"
                                />
                                <div className="p-4">
                                    <h3 className="text-white font-semibold mb-3 line-clamp-2 min-h-[48px]">
                                        {item.productions?.title}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <Link
                                            to={`/watch/${item.productions?.slug}`}
                                            className="flex-1 bg-[#ffdd95] text-black text-sm font-semibold text-center rounded-md px-3 py-2 hover:bg-[#ffe6aa]"
                                        >
                                            Xem ngay
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => handleRemove(item.production_id)}
                                            className="bg-red-600 text-white rounded-md px-3 py-2 hover:bg-red-500"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FavoritesPage;
