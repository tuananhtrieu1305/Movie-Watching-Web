import React, { useEffect } from "react";
import { Modal, Form, Input, Select, Switch, DatePicker } from "antd";
import { UserOutlined, MailOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Option } = Select;

const UserEditModal = ({ visible, user, onCancel, onSave }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (user) {
            form.setFieldsValue({
                ...user,
                vip_expires_at: user.vip_expires_at ? dayjs(user.vip_expires_at) : null,
            });
        }
    }, [user, form]);

    const handleOk = () => {
        form.validateFields().then((values) => {
            onSave({
                ...user,
                ...values,
                vip_expires_at: values.vip_expires_at
                    ? values.vip_expires_at.format("YYYY-MM-DD HH:mm:ss")
                    : null,
            });
        });
    };

    return (
        <Modal
            title="Chỉnh sửa người dùng"
            open={visible}
            onCancel={onCancel}
            onOk={handleOk}
            okText="Lưu"
            cancelText="Hủy"
            width={500}
        >
            <Form form={form} layout="vertical" className="mt-4">
                <Form.Item
                    name="username"
                    label="Tên người dùng"
                    rules={[{ required: true, message: "Vui lòng nhập tên người dùng" }]}
                >
                    <Input prefix={<UserOutlined />} placeholder="Tên người dùng" />
                </Form.Item>

                <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                        { required: true, message: "Vui lòng nhập email" },
                        { type: "email", message: "Email không hợp lệ" },
                    ]}
                >
                    <Input prefix={<MailOutlined />} placeholder="Email" />
                </Form.Item>

                <Form.Item name="role" label="Vai trò">
                    <Select>
                        <Option value="user">User</Option>
                        <Option value="admin">Admin</Option>
                    </Select>
                </Form.Item>

                <Form.Item name="vip_expires_at" label="VIP hết hạn">
                    <DatePicker
                        showTime
                        format="YYYY-MM-DD HH:mm:ss"
                        style={{ width: "100%" }}
                        placeholder="Chọn ngày hết hạn VIP"
                    />
                </Form.Item>

                <Form.Item name="is_banned" label="Trạng thái cấm" valuePropName="checked">
                    <Switch checkedChildren="Đã cấm" unCheckedChildren="Hoạt động" />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default UserEditModal;
