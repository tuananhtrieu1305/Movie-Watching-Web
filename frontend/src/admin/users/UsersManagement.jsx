import React, { useState } from "react";
import {
    Table,
    Input,
    Button,
    Space,
    Tag,
    Avatar,
    Dropdown,
    Modal,
    message,
    Tooltip,
    Select,
    Card,
    Row,
    Col,
    Statistic,
} from "antd";
import {
    SearchOutlined,
    EditOutlined,
    DeleteOutlined,
    StopOutlined,
    CheckCircleOutlined,
    UserOutlined,
    CrownOutlined,
    MoreOutlined,
    ExclamationCircleOutlined,
} from "@ant-design/icons";
import UserEditModal from "./UserEditModal";

const { Search } = Input;
const { Option } = Select;
const { confirm } = Modal;

// Mock data based on database schema
const mockUsers = [
    {
        id: 1,
        username: "admin",
        email: "admin@moviehub.com",
        avatar_url: "/avatars/admin.jpg",
        role: "admin",
        vip_expires_at: "2025-12-31 23:59:59",
        is_banned: false,
        total_watch_time: 86400,
        last_login: "2026-01-22 07:36:26",
        created_at: "2026-01-22 00:36:26",
    },
    {
        id: 2,
        username: "john_doe",
        email: "john.doe@email.com",
        avatar_url: "/avatars/john.jpg",
        role: "user",
        vip_expires_at: "2024-12-31 23:59:59",
        is_banned: false,
        total_watch_time: 43200,
        last_login: "2026-01-22 07:36:26",
        created_at: "2026-01-22 00:36:26",
    },
    {
        id: 3,
        username: "jane_smith",
        email: "jane.smith@email.com",
        avatar_url: "/avatars/jane.jpg",
        role: "user",
        vip_expires_at: "2024-11-30 23:59:59",
        is_banned: true,
        total_watch_time: 64800,
        last_login: "2026-01-22 07:36:26",
        created_at: "2026-01-22 00:36:26",
    },
    {
        id: 4,
        username: "michael_brown",
        email: "michael.b@email.com",
        avatar_url: "/avatars/michael.jpg",
        role: "user",
        vip_expires_at: null,
        is_banned: false,
        total_watch_time: 21600,
        last_login: "2026-01-22 07:36:26",
        created_at: "2026-01-22 00:36:26",
    },
    {
        id: 5,
        username: "sarah_jones",
        email: "sarah.j@email.com",
        avatar_url: "/avatars/sarah.jpg",
        role: "user",
        vip_expires_at: "2024-10-31 23:59:59",
        is_banned: false,
        total_watch_time: 72000,
        last_login: "2026-01-22 07:36:26",
        created_at: "2026-01-22 00:36:26",
    },
];

const UsersManagement = () => {
    const [users, setUsers] = useState(mockUsers);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    // Filter users based on search and filters
    const filteredUsers = users.filter((user) => {
        const matchSearch =
            user.username.toLowerCase().includes(searchText.toLowerCase()) ||
            user.email.toLowerCase().includes(searchText.toLowerCase());
        const matchRole = roleFilter === "all" || user.role === roleFilter;
        const matchStatus =
            statusFilter === "all" ||
            (statusFilter === "banned" && user.is_banned) ||
            (statusFilter === "active" && !user.is_banned) ||
            (statusFilter === "vip" && user.vip_expires_at);
        return matchSearch && matchRole && matchStatus;
    });

    // Statistics
    const stats = {
        total: users.length,
        admins: users.filter((u) => u.role === "admin").length,
        vipUsers: users.filter((u) => u.vip_expires_at).length,
        bannedUsers: users.filter((u) => u.is_banned).length,
    };

    // Handle ban/unban user
    const handleToggleBan = (user) => {
        const action = user.is_banned ? "bỏ cấm" : "cấm";
        confirm({
            title: `Bạn có chắc muốn ${action} người dùng "${user.username}"?`,
            icon: <ExclamationCircleOutlined />,
            okText: "Xác nhận",
            cancelText: "Hủy",
            okType: user.is_banned ? "primary" : "danger",
            onOk() {
                setUsers((prev) =>
                    prev.map((u) =>
                        u.id === user.id ? { ...u, is_banned: !u.is_banned } : u
                    )
                );
                message.success(`Đã ${action} người dùng ${user.username}`);
            },
        });
    };

    // Handle change role
    const handleChangeRole = (user, newRole) => {
        confirm({
            title: `Thay đổi quyền của "${user.username}" thành ${newRole}?`,
            icon: <ExclamationCircleOutlined />,
            okText: "Xác nhận",
            cancelText: "Hủy",
            onOk() {
                setUsers((prev) =>
                    prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u))
                );
                message.success(`Đã thay đổi quyền thành ${newRole}`);
            },
        });
    };

    // Handle delete user
    const handleDelete = (user) => {
        confirm({
            title: `Xóa người dùng "${user.username}"?`,
            icon: <ExclamationCircleOutlined />,
            content: "Hành động này không thể hoàn tác!",
            okText: "Xóa",
            cancelText: "Hủy",
            okType: "danger",
            onOk() {
                setUsers((prev) => prev.filter((u) => u.id !== user.id));
                message.success(`Đã xóa người dùng ${user.username}`);
            },
        });
    };

    // Handle edit user
    const handleEdit = (user) => {
        setSelectedUser(user);
        setEditModalVisible(true);
    };

    // Handle save edited user
    const handleSaveUser = (updatedUser) => {
        setUsers((prev) =>
            prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
        );
        setEditModalVisible(false);
        message.success("Cập nhật thông tin thành công!");
    };

    // Format watch time
    const formatWatchTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        return `${hours} giờ`;
    };

    // Table columns
    const columns = [
        {
            title: "Người dùng",
            key: "user",
            render: (_, record) => (
                <Space>
                    <Avatar src={record.avatar_url} icon={<UserOutlined />} />
                    <div>
                        <div className="font-medium">{record.username}</div>
                        <div className="text-gray-500 text-xs">{record.email}</div>
                    </div>
                </Space>
            ),
        },
        {
            title: "Vai trò",
            dataIndex: "role",
            key: "role",
            render: (role) => (
                <Tag color={role === "admin" ? "purple" : "blue"}>
                    {role === "admin" ? (
                        <>
                            <CrownOutlined /> Admin
                        </>
                    ) : (
                        "User"
                    )}
                </Tag>
            ),
        },
        {
            title: "Trạng thái",
            key: "status",
            render: (_, record) => (
                <Space direction="vertical" size={0}>
                    {record.is_banned ? (
                        <Tag color="red">Đã cấm</Tag>
                    ) : (
                        <Tag color="green">Hoạt động</Tag>
                    )}
                    {record.vip_expires_at && (
                        <Tag color="gold">
                            <CrownOutlined /> VIP
                        </Tag>
                    )}
                </Space>
            ),
        },
        {
            title: "Thời gian xem",
            dataIndex: "total_watch_time",
            key: "watch_time",
            render: (time) => formatWatchTime(time),
            sorter: (a, b) => a.total_watch_time - b.total_watch_time,
        },
        {
            title: "Đăng nhập cuối",
            dataIndex: "last_login",
            key: "last_login",
            render: (date) => new Date(date).toLocaleDateString("vi-VN"),
        },
        {
            title: "Hành động",
            key: "actions",
            render: (_, record) => {
                const menuItems = [
                    {
                        key: "edit",
                        label: "Chỉnh sửa",
                        icon: <EditOutlined />,
                        onClick: () => handleEdit(record),
                    },
                    {
                        key: "ban",
                        label: record.is_banned ? "Bỏ cấm" : "Cấm người dùng",
                        icon: record.is_banned ? <CheckCircleOutlined /> : <StopOutlined />,
                        onClick: () => handleToggleBan(record),
                    },
                    {
                        key: "role",
                        label: record.role === "admin" ? "Đặt làm User" : "Đặt làm Admin",
                        icon: <CrownOutlined />,
                        onClick: () =>
                            handleChangeRole(
                                record,
                                record.role === "admin" ? "user" : "admin"
                            ),
                    },
                    { type: "divider" },
                    {
                        key: "delete",
                        label: "Xóa",
                        icon: <DeleteOutlined />,
                        danger: true,
                        onClick: () => handleDelete(record),
                    },
                ];

                return (
                    <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
                        <Button type="text" icon={<MoreOutlined />} />
                    </Dropdown>
                );
            },
        },
    ];

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Quản lý người dùng</h2>

            {/* Statistics Cards */}
            <Row gutter={16} className="mb-6">
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Tổng người dùng"
                            value={stats.total}
                            prefix={<UserOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Quản trị viên"
                            value={stats.admins}
                            prefix={<CrownOutlined />}
                            valueStyle={{ color: "#722ed1" }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Thành viên VIP"
                            value={stats.vipUsers}
                            prefix={<CrownOutlined />}
                            valueStyle={{ color: "#faad14" }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Đã bị cấm"
                            value={stats.bannedUsers}
                            prefix={<StopOutlined />}
                            valueStyle={{ color: "#cf1322" }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Filters */}
            <Card className="mb-4">
                <Space wrap>
                    <Search
                        placeholder="Tìm theo tên hoặc email..."
                        allowClear
                        style={{ width: 280 }}
                        prefix={<SearchOutlined />}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                    <Select
                        placeholder="Vai trò"
                        style={{ width: 140 }}
                        value={roleFilter}
                        onChange={setRoleFilter}
                    >
                        <Option value="all">Tất cả vai trò</Option>
                        <Option value="admin">Admin</Option>
                        <Option value="user">User</Option>
                    </Select>
                    <Select
                        placeholder="Trạng thái"
                        style={{ width: 160 }}
                        value={statusFilter}
                        onChange={setStatusFilter}
                    >
                        <Option value="all">Tất cả trạng thái</Option>
                        <Option value="active">Hoạt động</Option>
                        <Option value="banned">Đã cấm</Option>
                        <Option value="vip">VIP</Option>
                    </Select>
                </Space>
            </Card>

            {/* Users Table */}
            <Card>
                <Table
                    columns={columns}
                    dataSource={filteredUsers}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} của ${total} người dùng`,
                    }}
                />
            </Card>

            {/* Edit Modal */}
            <UserEditModal
                visible={editModalVisible}
                user={selectedUser}
                onCancel={() => setEditModalVisible(false)}
                onSave={handleSaveUser}
            />
        </div>
    );
};

export default UsersManagement;
