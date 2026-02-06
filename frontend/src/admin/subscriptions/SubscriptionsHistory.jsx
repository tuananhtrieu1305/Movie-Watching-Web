import React, { useState } from "react";
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
} from "antd";
import {
    SearchOutlined,
    CrownOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    ClockCircleOutlined,
    UserOutlined,
} from "@ant-design/icons";

const { Search } = Input;
const { Option } = Select;

// Mock data based on database schema
const mockSubscriptions = [
    {
        id: 1,
        user_id: 2,
        username: "john_doe",
        avatar_url: "/avatars/john.jpg",
        plan_id: 1,
        plan_name: "VIP Basic 1 Tháng",
        plan_code: "vip_1_month",
        start_date: "2024-01-01 00:00:00",
        end_date: "2024-01-31 23:59:59",
        status: "expired",
        auto_renew: true,
        created_at: "2024-01-01 03:30:00",
    },
    {
        id: 2,
        user_id: 3,
        username: "jane_smith",
        avatar_url: "/avatars/jane.jpg",
        plan_id: 2,
        plan_name: "VIP Pro 6 Tháng",
        plan_code: "vip_6_month",
        start_date: "2024-01-02 00:00:00",
        end_date: "2024-07-01 23:59:59",
        status: "active",
        auto_renew: true,
        created_at: "2024-01-02 07:20:00",
    },
    {
        id: 3,
        user_id: 4,
        username: "michael_brown",
        avatar_url: "/avatars/michael.jpg",
        plan_id: 3,
        plan_name: "VIP Premium 1 Năm",
        plan_code: "vip_1_year",
        start_date: "2024-01-03 00:00:00",
        end_date: "2025-01-02 23:59:59",
        status: "active",
        auto_renew: true,
        created_at: "2024-01-03 09:45:00",
    },
    {
        id: 4,
        user_id: 5,
        username: "sarah_jones",
        avatar_url: "/avatars/sarah.jpg",
        plan_id: 1,
        plan_name: "VIP Basic 1 Tháng",
        plan_code: "vip_1_month",
        start_date: "2024-01-04 00:00:00",
        end_date: "2024-02-03 23:59:59",
        status: "cancelled",
        auto_renew: false,
        cancellation_reason: "Không muốn tiếp tục sử dụng",
        created_at: "2024-01-04 04:15:00",
    },
    {
        id: 5,
        user_id: 6,
        username: "david_wilson",
        avatar_url: "/avatars/david.jpg",
        plan_id: 2,
        plan_name: "VIP Pro 6 Tháng",
        plan_code: "vip_6_month",
        start_date: "2024-01-05 00:00:00",
        end_date: "2024-07-04 23:59:59",
        status: "active",
        auto_renew: true,
        created_at: "2024-01-05 02:30:00",
    },
    {
        id: 6,
        user_id: 7,
        username: "lisa_taylor",
        avatar_url: "/avatars/lisa.jpg",
        plan_id: 1,
        plan_name: "VIP Basic 1 Tháng",
        plan_code: "vip_1_month",
        start_date: "2024-01-06 00:00:00",
        end_date: "2024-02-05 23:59:59",
        status: "expired",
        auto_renew: true,
        created_at: "2024-01-06 06:20:00",
    },
];

const SubscriptionsHistory = () => {
    const [subscriptions] = useState(mockSubscriptions);
    const [loading] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [planFilter, setPlanFilter] = useState("all");

    // Filter subscriptions
    const filteredSubscriptions = subscriptions.filter((s) => {
        const matchSearch = s.username
            .toLowerCase()
            .includes(searchText.toLowerCase());
        const matchStatus = statusFilter === "all" || s.status === statusFilter;
        const matchPlan = planFilter === "all" || s.plan_code === planFilter;
        return matchSearch && matchStatus && matchPlan;
    });

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
            active: { color: "success", icon: <CheckCircleOutlined />, text: "Đang hoạt động" },
            expired: { color: "default", icon: <ClockCircleOutlined />, text: "Đã hết hạn" },
            cancelled: { color: "error", icon: <CloseCircleOutlined />, text: "Đã hủy" },
        };
        const config = statusConfig[status];
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
            <Tag color={colors[planCode]} icon={<CrownOutlined />}>
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
                        pageSize: 10,
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
