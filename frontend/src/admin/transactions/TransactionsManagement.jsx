import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  Input,
  Space,
  Tag,
  Select,
  Card,
  Row,
  Col,
  Statistic,
  Button,
  Modal,
  Descriptions,
  message,
} from "antd";
import {
  SearchOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../modules/auth/hooks/useAuth";
import { adminApi } from "../services/adminApi";

const { Search } = Input;
const { Option } = Select;

const TransactionsManagement = () => {
  const { accessToken } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const loadTransactions = async () => {
    if (!accessToken) return;

    setLoading(true);
    try {
      const data = await adminApi.getTransactions(accessToken);
      const normalized = (data.transactions || []).map((item) => ({
        ...item,
        username: item.users?.username || "-",
        plan_name: item.subscription_plans?.name || "-",
        amount: Number(item.amount ?? 0),
        discount_amount: Number(item.discount_amount ?? 0),
        final_amount: Number(item.final_amount ?? 0),
      }));
      setTransactions(normalized);
    } catch (error) {
      message.error(
        error.response?.data?.message || "Không tải được danh sách giao dịch",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [accessToken]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchSearch =
        t.transaction_code.toLowerCase().includes(searchText.toLowerCase()) ||
        t.username.toLowerCase().includes(searchText.toLowerCase());
      const matchStatus = statusFilter === "all" || t.status === statusFilter;
      const matchMethod =
        methodFilter === "all" || t.payment_method === methodFilter;
      return matchSearch && matchStatus && matchMethod;
    });
  }, [transactions, searchText, statusFilter, methodFilter]);

  // Statistics
  const stats = {
    total: transactions.length,
    success: transactions.filter((t) => t.status === "success").length,
    totalRevenue: transactions
      .filter((t) => t.status === "success")
      .reduce((sum, t) => sum + Number(t.final_amount ?? 0), 0),
    pending: transactions.filter((t) => t.status === "pending").length,
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Get status tag
  const getStatusTag = (status) => {
    const statusConfig = {
      success: {
        color: "success",
        icon: <CheckCircleOutlined />,
        text: "Thành công",
      },
      pending: {
        color: "warning",
        icon: <ClockCircleOutlined />,
        text: "Đang xử lý",
      },
      failed: {
        color: "error",
        icon: <CloseCircleOutlined />,
        text: "Thất bại",
      },
      cancelled: {
        color: "default",
        icon: <CloseCircleOutlined />,
        text: "Đã hủy",
      },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  // Get payment method tag
  const getPaymentMethodTag = (method) => {
    const colors = {
      momo: "magenta",
      vnpay: "blue",
      zalopay: "green",
      credit_card: "gold",
    };
    const labels = {
      momo: "MoMo",
      vnpay: "VNPay",
      zalopay: "ZaloPay",
      credit_card: "Thẻ tín dụng",
    };
    return (
      <Tag color={colors[method] || "default"}>{labels[method] || method}</Tag>
    );
  };

  // View transaction details
  const handleViewDetail = (record) => {
    setSelectedTransaction(record);
    setDetailVisible(true);
  };

  // Table columns
  const columns = [
    {
      title: "Mã giao dịch",
      dataIndex: "transaction_code",
      key: "transaction_code",
      render: (code) => <span className="font-mono font-medium">{code}</span>,
    },
    {
      title: "Người dùng",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "Gói VIP",
      dataIndex: "plan_name",
      key: "plan_name",
    },
    {
      title: "Số tiền",
      dataIndex: "final_amount",
      key: "final_amount",
      render: (amount) => (
        <span className="font-medium text-green-600">
          {formatCurrency(amount)}
        </span>
      ),
      sorter: (a, b) => a.final_amount - b.final_amount,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => getStatusTag(status),
    },
    {
      title: "Phương thức",
      dataIndex: "payment_method",
      key: "payment_method",
      render: (method) => getPaymentMethodTag(method),
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      key: "created_at",
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Button
          type="text"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(record)}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Quản lý giao dịch</h2>

      {/* Statistics Cards */}
      <Row gutter={16} className="mb-6">
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng giao dịch"
              value={stats.total}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Thành công"
              value={stats.success}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Doanh thu"
              value={stats.totalRevenue}
              prefix="₫"
              valueStyle={{ color: "#1890ff" }}
              formatter={(value) =>
                new Intl.NumberFormat("vi-VN").format(value)
              }
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đang xử lý"
              value={stats.pending}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-4">
        <Space wrap>
          <Search
            placeholder="Tìm theo mã GD hoặc username..."
            allowClear
            style={{ width: 280 }}
            prefix={<SearchOutlined />}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Select
            placeholder="Trạng thái"
            style={{ width: 150 }}
            value={statusFilter}
            onChange={setStatusFilter}
          >
            <Option value="all">Tất cả trạng thái</Option>
            <Option value="success">Thành công</Option>
            <Option value="pending">Đang xử lý</Option>
            <Option value="failed">Thất bại</Option>
            <Option value="cancelled">Đã hủy</Option>
          </Select>
          <Select
            placeholder="Phương thức"
            style={{ width: 150 }}
            value={methodFilter}
            onChange={setMethodFilter}
          >
            <Option value="all">Tất cả PT</Option>
            <Option value="vnpay">VNPay</Option>
          </Select>
        </Space>
      </Card>

      {/* Transactions Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredTransactions}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 8,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} giao dịch`,
          }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết giao dịch"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={600}
      >
        {selectedTransaction && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Mã giao dịch">
              {selectedTransaction.transaction_code}
            </Descriptions.Item>
            <Descriptions.Item label="Người dùng">
              {selectedTransaction.username}
            </Descriptions.Item>
            <Descriptions.Item label="Gói VIP">
              {selectedTransaction.plan_name}
            </Descriptions.Item>
            <Descriptions.Item label="Giá gốc">
              {formatCurrency(selectedTransaction.amount)}
            </Descriptions.Item>
            <Descriptions.Item label="Giảm giá">
              {formatCurrency(selectedTransaction.discount_amount)}
            </Descriptions.Item>
            <Descriptions.Item label="Thanh toán">
              <span className="font-bold text-green-600">
                {formatCurrency(selectedTransaction.final_amount)}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              {getStatusTag(selectedTransaction.status)}
            </Descriptions.Item>
            <Descriptions.Item label="Phương thức">
              {getPaymentMethodTag(selectedTransaction.payment_method)}
            </Descriptions.Item>
            <Descriptions.Item label="VIP từ ngày">
              {selectedTransaction.vip_start_date || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="VIP đến ngày">
              {selectedTransaction.vip_end_date || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              {new Date(selectedTransaction.created_at).toLocaleString("vi-VN")}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default TransactionsManagement;
