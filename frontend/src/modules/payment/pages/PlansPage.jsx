import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCrown, FaCheck } from 'react-icons/fa';

const PlansPage = () => {
    const navigate = useNavigate();
    const plans = [
        {
            name: 'Free',
            price: '0đ',
            period: '/tháng',
            features: [
                'Xem phim có quảng cáo',
                'Chất lượng tối đa 720p',
                'Xem trên 1 thiết bị',
            ],
            isCurrent: true,
            buttonText: 'Đang sử dụng',
            buttonStyle: 'bg-gray-600 cursor-not-allowed',
        },
        {
            name: 'VIP',
            price: '79.000đ',
            period: '/tháng',
            features: [
                'Không quảng cáo',
                'Chất lượng Full HD 1080p',
                'Xem trên 2 thiết bị',
                'Tải phim xem offline',
            ],
            isCurrent: false,
            buttonText: 'Nâng cấp ngay',
            buttonStyle: 'bg-yellow-500 hover:bg-yellow-400 text-black',
            highlight: true,
        },
        {
            name: 'Premium',
            price: '149.000đ',
            period: '/tháng',
            features: [
                'Không quảng cáo',
                'Chất lượng 4K Ultra HD',
                'Xem trên 4 thiết bị',
                'Tải phim xem offline',
                'Xem phim sớm nhất',
                'Hỗ trợ ưu tiên 24/7',
            ],
            isCurrent: false,
            buttonText: 'Nâng cấp ngay',
            buttonStyle: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500',
        },
    ];

    return (
        <div className="min-h-screen bg-[#1a1a1d] text-gray-200 py-16 px-4">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <FaCrown className="text-4xl text-yellow-500" />
                        <h1 className="text-4xl font-bold text-white">Nâng Cấp VIP</h1>
                    </div>
                    <p className="text-gray-400 text-lg">
                        Chọn gói phù hợp để trải nghiệm xem phim tốt nhất
                    </p>
                </div>

                {/* Plans Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plans.map((plan, index) => (
                        <div
                            key={index}
                            className={`relative bg-[#2a2a2d] rounded-2xl p-8 shadow-lg border transition-transform hover:scale-105 ${plan.highlight
                                ? 'border-yellow-500 shadow-yellow-500/20'
                                : 'border-gray-700'
                                }`}
                        >
                            {/* Popular Badge */}
                            {plan.highlight && (
                                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-black text-xs font-bold px-4 py-1 rounded-full">
                                    PHỔ BIẾN NHẤT
                                </div>
                            )}

                            {/* Plan Name */}
                            <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>

                            {/* Price */}
                            <div className="mb-6">
                                <span className="text-4xl font-black text-white">{plan.price}</span>
                                <span className="text-gray-400">{plan.period}</span>
                            </div>

                            {/* Features */}
                            <ul className="space-y-3 mb-8">
                                {plan.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-center gap-3 text-gray-300">
                                        <FaCheck className="text-green-500 flex-shrink-0" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            {/* Button */}
                            <button
                                className={`w-full py-3 px-6 rounded-lg font-bold transition-all ${plan.buttonStyle}`}
                                disabled={plan.isCurrent}
                                onClick={() => !plan.isCurrent && navigate(`/user/checkout?plan=${plan.name.toLowerCase()}`)}
                            >
                                {plan.buttonText}
                            </button>
                        </div>
                    ))}
                </div>

                {/* Footer Note */}
                <p className="text-center text-gray-500 text-sm mt-10">
                    Thanh toán an toàn qua MoMo, ZaloPay, Visa/Mastercard. Hủy bất cứ lúc nào.
                </p>
            </div>
        </div>
    );
};

export default PlansPage;
