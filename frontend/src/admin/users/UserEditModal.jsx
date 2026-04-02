import React, { useEffect } from "react";
import { Modal, Form, Input, Select, DatePicker } from "antd";
import { UserOutlined, MailOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Option } = Select;

const UserEditModal = ({ visible, user, isCreateMode = false, onCancel, onSave }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (isCreateMode) {
            form.resetFields();
            form.setFieldsValue({
                role: "user",
            });
            return;
        }

        if (user) {
            form.setFieldsValue({
                ...user,
                vip_expires_at: user.vip_expires_at ? dayjs(user.vip_expires_at) : null,
            });
        }
    }, [user, form, isCreateMode]);

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
            title={isCreateMode ? "Tạo người dùng" : "Chỉnh sửa người dùng"}
            open={visible}
            onCancel={onCancel}
            onOk={handleOk}
            okText={isCreateMode ? "Tạo" : "Lưu"}
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

                <Form.Item
                    name="password"
                    label="Mật khẩu"
                    rules={
                        isCreateMode
                            ? [
                                  { required: true, message: "Vui lòng nhập mật khẩu" },
                                  { min: 6, message: "Mật khẩu tối thiểu 6 ký tự" },
                              ]
                            : [{ min: 6, message: "Mật khẩu tối thiểu 6 ký tự" }]
                    }
                >
                    <Input.Password
                        placeholder={
                            isCreateMode
                                ? "Nhập mật khẩu"
                                : "Để trống nếu không đổi mật khẩu"
                        }
                    />
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

            </Form>
        </Modal>
    );
};

export default UserEditModal;
