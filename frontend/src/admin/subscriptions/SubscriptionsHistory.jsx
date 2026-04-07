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
  Avatar,
  Switch,
  message,
} from "antd";
import {
  SearchOutlined,
  CrownOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../modules/auth/hooks/useAuth";
import { adminApi } from "../services/adminApi";

const { Search } = Input;
const { Option } = Select;

const SubscriptionsHistory = () => {
  const { accessToken } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");

  const loadSubscriptions = async () => {
    if (!accessToken) return;

    setLoading(true);
    try {
      const data = await adminApi.getSubscriptions(accessToken);
      const normalized = (data.subscriptions || []).map((item) => ({
        ...item,
        username: item.users?.username || "-",
        avatar_url: item.users?.avatar_url || null,
        plan_name: item.subscription_plans?.name || "-",
        plan_code: item.subscription_plans?.code || "",
      }));
      setSubscriptions(normalized);
    } catch (error) {
      message.error(error.response?.data?.message || "Không tải được lịch sử subscription");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscriptions();
  }, [accessToken]);

  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((s) => {
      const matchSearch = s.username.toLowerCase().includes(searchText.toLowerCase());
    const matchStatus = statusFilter === "all" || s.status === statusFilter;
    const matchPlan = planFilter === "all" || s.plan_code === planFilter;
    return matchSearch && matchStatus && matchPlan;
    });
  }, [subscriptions, searchText, statusFilter, planFilter]);

  // Statistics
  const stats = {
    total: subscriptions.length,
    active: subscriptions.filter((s) => s.status === "active").length,
    expired: subscriptions.filter((s) => s.status === "expired").length,
    cancelled: subscriptions.filter((s) => s.status === "cancelled").length,
  };

  // Get status tag
  const getStatusTag = (status) => {
    const statusConfig = {
      active: {
        color: "success",
        icon: <CheckCircleOutlined />,
        text: "Đang hoạt động",
      },
      expired: {
        color: "default",
        icon: <ClockCircleOutlined />,
        text: "Đã hết hạn",
      },
      cancelled: {
        color: "error",
        icon: <CloseCircleOutlined />,
        text: "Đã hủy",
      },
    };
    const config = statusConfig[status] || statusConfig.active;
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  // Get plan tag
  const getPlanTag = (planCode, planName) => {
    const colors = {
      vip_1_month: "blue",
      vip_6_month: "purple",
      vip_1_year: "gold",
    };
    return (
      <Tag color={colors[planCode] || "default"} icon={<CrownOutlined />}>
        {planName}
      </Tag>
    );
  };

  // Calculate remaining days
  const getRemainingDays = (endDate, status) => {
    if (status !== "active") return "-";
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return <Tag color="red">Đã hết hạn</Tag>;
    if (diffDays <= 7) return <Tag color="warning">{diffDays} ngày</Tag>;
    return <Tag color="success">{diffDays} ngày</Tag>;
  };

  // Table columns
  const columns = [
    {
      title: "Người dùng",
      key: "user",
      render: (_, record) => (
        <Space>
          <Avatar src={record.avatar_url} icon={<UserOutlined />} />
          <span className="font-medium">{record.username}</span>
        </Space>
      ),
    },
    {
      title: "Gói VIP",
      key: "plan",
      render: (_, record) => getPlanTag(record.plan_code, record.plan_name),
    },
    {
      title: "Ngày bắt đầu",
      dataIndex: "start_date",
      key: "start_date",
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
      sorter: (a, b) => new Date(a.start_date) - new Date(b.start_date),
    },
    {
      title: "Ngày kết thúc",
      dataIndex: "end_date",
      key: "end_date",
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Còn lại",
      key: "remaining",
      render: (_, record) => getRemainingDays(record.end_date, record.status),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => getStatusTag(status),
    },
    {
      title: "Tự động gia hạn",
      dataIndex: "auto_renew",
      key: "auto_renew",
      render: (autoRenew) => (
        <Switch checked={autoRenew} disabled size="small" />
      ),
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Lịch sử đăng ký VIP</h2>

      {/* Statistics Cards */}
      <Row gutter={16} className="mb-6">
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng đăng ký"
              value={stats.total}
              prefix={<CrownOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đang hoạt động"
              value={stats.active}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đã hết hạn"
              value={stats.expired}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#8c8c8c" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đã hủy"
              value={stats.cancelled}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: "#cf1322" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-4">
        <Space wrap>
          <Search
            placeholder="Tìm theo tên người dùng..."
            allowClear
            style={{ width: 280 }}
            prefix={<SearchOutlined />}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Select
            placeholder="Trạng thái"
            style={{ width: 160 }}
            value={statusFilter}
            onChange={setStatusFilter}
          >
            <Option value="all">Tất cả trạng thái</Option>
            <Option value="active">Đang hoạt động</Option>
            <Option value="expired">Đã hết hạn</Option>
            <Option value="cancelled">Đã hủy</Option>
          </Select>
          <Select
            placeholder="Gói VIP"
            style={{ width: 180 }}
            value={planFilter}
            onChange={setPlanFilter}
          >
            <Option value="all">Tất cả gói</Option>
            <Option value="vip_1_month">VIP Basic 1 Tháng</Option>
            <Option value="vip_6_month">VIP Pro 6 Tháng</Option>
            <Option value="vip_1_year">VIP Premium 1 Năm</Option>
          </Select>
        </Space>
      </Card>

      {/* Subscriptions Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredSubscriptions}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 8,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} đăng ký`,
          }}
        />
      </Card>
    </div>
  );
};

export default SubscriptionsHistory;
