import React, { useEffect, useMemo, useState } from "react";
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
  UserOutlined,
  CrownOutlined,
  MoreOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import UserEditModal from "./UserEditModal";
import { useAuth } from "../../modules/auth/hooks/useAuth";
import { adminApi } from "../services/adminApi";

const { Search } = Input;
const { Option } = Select;
const { confirm } = Modal;

const UsersManagement = () => {
  const { accessToken, user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isCreateMode, setIsCreateMode] = useState(false);

  const loadUsers = async () => {
    if (!accessToken) return;

    setLoading(true);
    try {
      const data = await adminApi.getUsers(accessToken);
      setUsers(data.users || []);
    } catch (error) {
      message.error(error.response?.data?.message || "Không tải được danh sách users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [accessToken]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchSearch =
        user.username.toLowerCase().includes(searchText.toLowerCase()) ||
        user.email.toLowerCase().includes(searchText.toLowerCase());
      const matchRole = roleFilter === "all" || user.role === roleFilter;
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "active") ||
        (statusFilter === "vip" && user.vip_expires_at && new Date(user.vip_expires_at) > new Date());
      return matchSearch && matchRole && matchStatus;
    });
  }, [users, searchText, roleFilter, statusFilter]);

  const stats = useMemo(
    () => ({
      total: users.length,
      admins: users.filter((u) => u.role === "admin").length,
      vipUsers: users.filter((u) => u.vip_expires_at && new Date(u.vip_expires_at) > new Date()).length,
    }),
    [users],
  );

  const handleChangeRole = (record, newRole) => {
    confirm({
      title: `Thay đổi quyền của "${record.username}" thành ${newRole}?`,
      icon: <ExclamationCircleOutlined />,
      okText: "Xác nhận",
      cancelText: "Hủy",
      async onOk() {
        try {
          await adminApi.updateUser(accessToken, record.id, { role: newRole });
          message.success(`Đã đổi quyền thành ${newRole}`);
          loadUsers();
        } catch (error) {
          message.error(error.response?.data?.message || "Không đổi được quyền user");
        }
      },
    });
  };

  const handleDelete = (record) => {
    confirm({
      title: `Xóa người dùng "${record.username}"?`,
      icon: <ExclamationCircleOutlined />,
      content: "Hành động này không thể hoàn tác!",
      okText: "Xóa",
      cancelText: "Hủy",
      okType: "danger",
      async onOk() {
        try {
          await adminApi.deleteUser(accessToken, record.id);
          message.success(`Đã xóa người dùng ${record.username}`);
          loadUsers();
        } catch (error) {
          message.error(error.response?.data?.message || "Không thể xóa user");
        }
      },
    });
  };

  const handleEdit = (record) => {
    setIsCreateMode(false);
    setSelectedUser(record);
    setEditModalVisible(true);
  };

  const handleCreate = () => {
    setIsCreateMode(true);
    setSelectedUser(null);
    setEditModalVisible(true);
  };

  const handleSaveUser = async (payload) => {
    try {
      if (isCreateMode) {
        await adminApi.createUser(accessToken, {
          username: payload.username,
          email: payload.email,
          password: payload.password,
          role: payload.role,
          avatar_url: payload.avatar_url || null,
        });
        message.success("Tạo user thành công");
      } else {
        await adminApi.updateUser(accessToken, payload.id, {
          username: payload.username,
          email: payload.email,
          role: payload.role,
          avatar_url: payload.avatar_url,
          vip_expires_at: payload.vip_expires_at,
          ...(payload.password ? { password: payload.password } : {}),
        });
        message.success("Cập nhật thông tin thành công");
      }

      setEditModalVisible(false);
      loadUsers();
    } catch (error) {
      message.error(error.response?.data?.message || "Không thể lưu thông tin user");
    }
  };

  const formatWatchTime = (seconds = 0) => {
    const hours = Math.floor(Number(seconds) / 3600);
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
        <Space direction="horizontal" size={0}>
          <Tag color="green">Hoạt động</Tag>
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
      sorter: (a, b) => (a.total_watch_time || 0) - (b.total_watch_time || 0),
    },
    {
      title: "Đăng nhập cuối",
      dataIndex: "last_login",
      key: "last_login",
      render: (date) => (date ? new Date(date).toLocaleDateString("vi-VN") : "-"),
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => {
        const isSelf = Number(currentUser?.id) === Number(record.id);

        const handleMenuClick = ({ key }) => {
          if (key === "edit") {
            handleEdit(record);
            return;
          }

          if (key === "role") {
            handleChangeRole(
              record,
              record.role === "admin" ? "user" : "admin",
            );
            return;
          }

          if (key === "delete") {
            handleDelete(record);
          }
        };

        const menuItems = [
          {
            key: "edit",
            label: "Chỉnh sửa",
            icon: <EditOutlined />,
          },
          {
            key: "role",
            label: record.role === "admin" ? "Đặt làm User" : "Đặt làm Admin",
            icon: <CrownOutlined />,
            disabled: isSelf,
          },
          { type: "divider" },
          {
            key: "delete",
            label: "Xóa",
            icon: <DeleteOutlined />,
            danger: true,
            disabled: isSelf,
          },
        ];

        return (
          <Dropdown
            menu={{
              items: menuItems,
              onClick: handleMenuClick,
            }}
            trigger={["click"]}
          >
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Quản lý người dùng</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Tạo user
        </Button>
      </div>

      {/* Statistics Cards */}
      <Row gutter={16} className="mb-6">
        <Col span={8}>
          <Card>
            <Statistic
              title="Tổng người dùng"
              value={stats.total}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Quản trị viên"
              value={stats.admins}
              prefix={<CrownOutlined />}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Thành viên VIP"
              value={stats.vipUsers}
              prefix={<CrownOutlined />}
              valueStyle={{ color: "#faad14" }}
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
            pageSize: 8,
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
        isCreateMode={isCreateMode}
        onCancel={() => setEditModalVisible(false)}
        onSave={handleSaveUser}
      />
    </div>
  );
};

export default UsersManagement;
