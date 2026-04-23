import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FaHistory } from "react-icons/fa";
import { useAuth } from "../../auth/hooks/useAuth";
import { paymentApi } from "../../payment/services/paymentApi";

const TransactionsPage = () => {
  const { accessToken, refreshAccessToken } = useAuth();
  const [searchParams] = useSearchParams();
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const paymentStatus = searchParams.get("paymentStatus");
  const txnRef = searchParams.get("txnRef");
  const message = searchParams.get("message");

  useEffect(() => {
    if (paymentStatus === "success") {
      refreshAccessToken().catch((err) =>
        console.error("Lỗi cập nhật lại token VIP:", err),
      );
    }
  }, [paymentStatus, refreshAccessToken]);

  const statusBanner = useMemo(() => {
    if (paymentStatus === "success") {
      return {
        type: "success",
        text: `Thanh toán thành công${txnRef ? ` - Mã: ${txnRef}` : ""}`,
      };
    }

    if (paymentStatus === "failed") {
      return {
        type: "error",
        text: message || "Thanh toán thất bại. Vui lòng thử lại.",
      };
    }

    return null;
  }, [message, paymentStatus, txnRef]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!accessToken) {
        setErrorMessage("Bạn cần đăng nhập để xem lịch sử giao dịch.");
        setIsLoading(false);
        return;
      }

      try {
        const data = await paymentApi.getTransactionHistory(accessToken);
        setTransactions(data.transactions || []);
      } catch (error) {
        setErrorMessage(
          error.response?.data?.message || "Không tải được lịch sử giao dịch.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [accessToken]);

  const formatDate = (value) => {
    if (!value) return "-";
    return new Date(value).toLocaleString("vi-VN");
  };

  const formatPrice = (value) => {
    if (!value) return "0đ";
    return `${Number(value).toLocaleString("vi-VN")}đ`;
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <FaHistory className="text-xl text-white" />
        <h2 className="text-2xl font-bold text-white">Lịch sử giao dịch</h2>
      </div>

      {statusBanner ? (
        <div
          className={`mb-5 rounded-lg px-4 py-3 text-sm font-medium ${
            statusBanner.type === "success"
              ? "bg-green-500/20 text-green-300 border border-green-500/40"
              : "bg-red-500/20 text-red-300 border border-red-500/40"
          }`}
        >
          {statusBanner.text}
        </div>
      ) : null}

      <div className="bg-[#2a2a2d] rounded-lg p-8 shadow-lg">
        {isLoading ? (
          <p className="text-gray-400 text-center py-10">Đang tải dữ liệu...</p>
        ) : errorMessage ? (
          <p className="text-red-400 text-center py-10">{errorMessage}</p>
        ) : transactions.length === 0 ? (
          <p className="text-gray-400 text-center py-10">
            Bạn chưa có giao dịch nào.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-300">
              <thead className="text-xs uppercase text-gray-400 border-b border-gray-700">
                <tr>
                  <th className="py-3 pr-4">Mã GD</th>
                  <th className="py-3 pr-4">Gói</th>
                  <th className="py-3 pr-4">Số tiền</th>
                  <th className="py-3 pr-4">Trạng thái</th>
                  <th className="py-3 pr-4">Ngày tạo</th>
                  <th className="py-3">Hạn VIP</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((item) => (
                  <tr key={item.id} className="border-b border-gray-800">
                    <td className="py-3 pr-4 text-gray-200">
                      {item.transaction_code}
                    </td>
                    <td className="py-3 pr-4">
                      {item.subscription_plans?.name || "-"}
                    </td>
                    <td className="py-3 pr-4">
                      {formatPrice(item.final_amount)}
                    </td>
                    <td className="py-3 pr-4 capitalize">{item.status}</td>
                    <td className="py-3 pr-4">{formatDate(item.created_at)}</td>
                    <td className="py-3">
                      {item.vip_end_date ? formatDate(item.vip_end_date) : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionsPage;
