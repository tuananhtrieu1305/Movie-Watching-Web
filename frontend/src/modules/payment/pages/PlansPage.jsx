import { useNavigate } from "react-router-dom";
import { FaCrown, FaCheck } from "react-icons/fa";

const PlansPage = () => {
  const navigate = useNavigate();
  const plans = [
    {
      code: "free",
      name: "Free",
      subtitle: "Vĩnh viễn",
      price: "0đ",
      originalPrice: "0đ",
      period: "/tháng",
      features: [
        "Xem phim có quảng cáo",
        "Chất lượng tối đa 720p",
        "Xem trên 1 thiết bị",
      ],
      isCurrent: true,
      buttonText: "Đang sử dụng",
      buttonStyle: "bg-gray-600 cursor-not-allowed",
    },
    {
      code: "vip_1_month",
      name: "VIP Basic",
      subtitle: "1 Tháng",
      price: "69.000đ",
      originalPrice: "99.000đ",
      period: "/tháng",
      features: [
        "Không quảng cáo",
        "Chất lượng Full HD 1080p",
        "Xem trên 2 thiết bị",
        "Tải phim xem offline",
      ],
      isCurrent: false,
      buttonText: "Nâng cấp ngay",
      buttonStyle: "bg-yellow-500 hover:bg-yellow-400 text-black",
      highlight: true,
    },
    {
      code: "vip_6_month",
      name: "VIP Pro",
      subtitle: "6 Tháng",
      price: "399.000đ",
      originalPrice: "540.000đ",
      period: "/6 tháng",
      features: [
        "Không quảng cáo",
        "Chất lượng Full HD 1080p",
        "Xem trên 3 thiết bị",
        "Tải phim xem offline",
        "Tiết kiệm 26% so với tháng lẻ",
      ],
      isCurrent: false,
      buttonText: "Nâng cấp ngay",
      buttonStyle:
        "bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400",
    },
    {
      code: "vip_1_year",
      name: "VIP Premium",
      subtitle: "1 Năm",
      price: "699.000đ",
      originalPrice: "990.000đ",
      period: "/năm",
      features: [
        "Không quảng cáo",
        "Chất lượng 4K Ultra HD",
        "Xem trên 4 thiết bị",
        "Tải phim xem offline",
        "Xem phim sớm nhất",
        "Hỗ trợ ưu tiên 24/7",
        "Tiết kiệm 29% so với tháng lẻ",
      ],
      isCurrent: false,
      buttonText: "Nâng cấp ngay",
      buttonStyle:
        "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500",
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-[#2a2a2d] rounded-2xl p-6 shadow-lg border transition-transform hover:scale-[1.03] ${
                plan.highlight
                  ? "border-yellow-500 shadow-yellow-500/20"
                  : "border-gray-700"
              } flex flex-col`}
            >
              {/* Popular Badge */}
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-black text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
                  PHỔ BIẾN NHẤT
                </div>
              )}

              {/* Plan Name + Subtitle */}
              <div className="mb-4">
                <h3 className="text-xl font-bold text-white leading-tight">
                  {plan.name}
                </h3>
                {plan.subtitle && (
                  <p className="text-sm text-gray-400 mt-0.5">
                    {plan.subtitle}
                  </p>
                )}
              </div>

              {/* Price */}
              <div className="mb-5 pb-5 border-b border-gray-700">
                {plan.originalPrice && (
                  <p className="text-xs text-gray-500 line-through mb-0.5">
                    {plan.originalPrice}
                  </p>
                )}
                <p className="text-3xl font-black text-white leading-none">
                  {plan.price}
                </p>
                {plan.period && (
                  <p className="text-sm text-gray-400 mt-1">{plan.period}</p>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-2.5 mb-6 flex-1">
                {plan.features.map((feature, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-sm text-gray-300"
                  >
                    <FaCheck className="text-green-500 mt-0.5 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Button */}
              <button
                className={`w-full py-2.5 px-4 rounded-lg font-bold cursor-pointer transition-all text-sm ${plan.buttonStyle}`}
                disabled={plan.isCurrent}
                onClick={() =>
                  !plan.isCurrent &&
                  navigate(`/user/checkout?plan=${plan.code}`)
                }
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <p className="text-center text-gray-500 text-sm mt-10">
          Thanh toán an toàn qua PayOS. Hủy bất cứ lúc nào.
        </p>
      </div>
    </div>
  );
};

export default PlansPage;
