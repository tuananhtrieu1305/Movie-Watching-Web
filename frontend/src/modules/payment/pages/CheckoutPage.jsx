import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FaCreditCard, FaWallet, FaQrcode, FaArrowLeft, FaCheck, FaLock } from 'react-icons/fa';

const CheckoutPage = () => {
    const [searchParams] = useSearchParams();
    const selectedPlan = searchParams.get('plan') || 'vip';
    const [paymentMethod, setPaymentMethod] = useState('momo');

    // Plan details
    const plans = {
        vip: { name: 'VIP', price: '79.000đ', period: '/tháng' },
        premium: { name: 'Premium', price: '149.000đ', period: '/tháng' },
    };

    const plan = plans[selectedPlan] || plans.vip;

    const paymentMethods = [
        { id: 'momo', name: 'MoMo', icon: <FaWallet className="text-pink-500" />, desc: 'Ví điện tử MoMo' },
        { id: 'zalopay', name: 'ZaloPay', icon: <FaWallet className="text-blue-500" />, desc: 'Ví điện tử ZaloPay' },
        { id: 'vnpay', name: 'VNPay QR', icon: <FaQrcode className="text-blue-600" />, desc: 'Quét mã QR ngân hàng' },
        { id: 'card', name: 'Visa/Mastercard', icon: <FaCreditCard className="text-yellow-500" />, desc: 'Thẻ tín dụng/ghi nợ quốc tế' },
    ];

    const handlePayment = () => {
        alert(`Đang xử lý thanh toán gói ${plan.name} qua ${paymentMethod.toUpperCase()}...`);
        // TODO: Integrate with payment gateway
    };

    return (
        <div className="min-h-screen bg-[#1a1a1d] text-gray-200 py-10 px-4">
            <div className="max-w-2xl mx-auto">

                {/* Back Button */}
                <Link
                    to="/user/plans"
                    className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
                >
                    <FaArrowLeft /> Quay lại chọn gói
                </Link>

                {/* Header */}
                <h1 className="text-3xl font-bold text-white mb-8">Thanh toán</h1>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">

                    {/* LEFT: Payment Methods */}
                    <div className="md:col-span-3 space-y-4">
                        <h2 className="text-lg font-semibold text-white mb-4">Chọn phương thức thanh toán</h2>

                        {paymentMethods.map((method) => (
                            <button
                                key={method.id}
                                onClick={() => setPaymentMethod(method.id)}
                                className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${paymentMethod === method.id
                                        ? 'border-[#ffdd95] bg-[#ffdd95]/10'
                                        : 'border-gray-700 bg-[#2a2a2d] hover:border-gray-500'
                                    }`}
                            >
                                <span className="text-2xl">{method.icon}</span>
                                <div className="text-left flex-1">
                                    <p className="font-semibold text-white">{method.name}</p>
                                    <p className="text-sm text-gray-400">{method.desc}</p>
                                </div>
                                {paymentMethod === method.id && (
                                    <FaCheck className="text-[#ffdd95]" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* RIGHT: Order Summary */}
                    <div className="md:col-span-2">
                        <div className="bg-[#2a2a2d] rounded-xl p-6 border border-gray-700 sticky top-6">
                            <h2 className="text-lg font-semibold text-white mb-4">Đơn hàng</h2>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Gói đăng ký</span>
                                    <span className="text-white font-medium">{plan.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Thời hạn</span>
                                    <span className="text-white">1 tháng</span>
                                </div>
                                <div className="border-t border-gray-700 pt-3 flex justify-between">
                                    <span className="text-gray-400">Tổng cộng</span>
                                    <span className="text-2xl font-bold text-[#ffdd95]">{plan.price}</span>
                                </div>
                            </div>

                            {/* Pay Button */}
                            <button
                                onClick={handlePayment}
                                className="w-full bg-[#ffdd95] hover:bg-[#ffe6aa] text-black font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                <FaLock /> Thanh toán ngay
                            </button>

                            <p className="text-xs text-gray-500 text-center mt-4">
                                Thanh toán được bảo mật bởi SSL 256-bit
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
