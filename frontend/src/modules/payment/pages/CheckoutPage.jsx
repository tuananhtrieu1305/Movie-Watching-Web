import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FaQrcode, FaArrowLeft, FaCheck, FaLock } from 'react-icons/fa';
import { paymentApi } from '../services/paymentApi';
import { useAuth } from '../../auth/hooks/useAuth';

const CheckoutPage = () => {
    const [searchParams] = useSearchParams();
    const selectedPlan = searchParams.get('plan') || 'vip';
    const [paymentMethod] = useState('vnpay');
    const [isPaying, setIsPaying] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const { accessToken } = useAuth();

    // Plan details — must match DB subscription_plans codes
    const plans = {
        vip_1_month: { name: 'VIP Basic 1 Tháng', price: '69.000đ', originalPrice: '99.000đ', duration: '30 ngày' },
        vip_6_month: { name: 'VIP Pro 6 Tháng',   price: '399.000đ', originalPrice: '540.000đ', duration: '180 ngày' },
        vip_1_year:  { name: 'VIP Premium 1 Năm', price: '699.000đ', originalPrice: '990.000đ', duration: '365 ngày' },
    };

    const plan = plans[selectedPlan] || plans.vip_1_month;

    const paymentMethods = [
        { id: 'vnpay', name: 'VNPay QR', icon: <FaQrcode className="text-blue-600" />, desc: 'Quét mã QR ngân hàng' },
    ];

    const handlePayment = async () => {
        setErrorMessage('');

        if (!accessToken) {
            setErrorMessage('Bạn cần đăng nhập trước khi thanh toán.');
            return;
        }

        setIsPaying(true);

        try {
            const { paymentUrl } = await paymentApi.createVnpayUrl(accessToken, selectedPlan);
            window.location.href = paymentUrl;
        } catch (error) {
            setErrorMessage(error.response?.data?.message || 'Không tạo được link VNPay.');
            setIsPaying(false);
        }
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
                                    <span className="text-white">{plan.duration}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Giá gốc</span>
                                    <span className="text-gray-500 line-through">{plan.originalPrice}</span>
                                </div>
                                <div className="border-t border-gray-700 pt-3 flex justify-between">
                                    <span className="text-gray-400">Tổng cộng</span>
                                    <span className="text-2xl font-bold text-[#ffdd95]">{plan.price}</span>
                                </div>
                            </div>

                            {/* Pay Button */}
                            <button
                                onClick={handlePayment}
                                disabled={isPaying}
                                className="w-full bg-[#ffdd95] hover:bg-[#ffe6aa] disabled:opacity-70 text-black font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                <FaLock /> {isPaying ? 'Đang chuyển đến VNPay...' : 'Thanh toán ngay'}
                            </button>

                            {errorMessage ? (
                                <p className="text-xs text-red-400 text-center mt-3">{errorMessage}</p>
                            ) : null}

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
