import { Modal, Form, Input, InputNumber, message, Row, Col } from "antd";
import { PlayCircleOutlined } from "@ant-design/icons";
import { useEffect } from "react";

const ModalSaveEpisode = ({ open, onCancel, initialData }) => {
  const [form] = Form.useForm();
  const isEdit = !!initialData;

  useEffect(() => {
    if (open) {
      initialData ? form.setFieldsValue(initialData) : form.resetFields();
    }
  }, [open, initialData, form]);

  const onFinish = (values) => {
    console.log("Saving Episode:", values);
    message.success(isEdit ? "Cập nhật thành công!" : "Thêm mới thành công!");
    onCancel();
  };

  return (
    <Modal
      title={isEdit ? "Chỉnh sửa Video/Tập" : "Thêm tập phim mới"}
      open={open}
      onCancel={onCancel}
      onOk={form.submit}
      okText="Lưu"
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={15}>
          <Col span={12}>
            <Form.Item
              name="episode_number"
              label="Tập số"
              rules={[{ required: true }]}
            >
              <InputNumber min={1} className="!w-full" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="duration" label="Thời lượng (giây)">
              <InputNumber min={0} className="!w-full" step={60} />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              name="title"
              label="Tiêu đề"
              rules={[{ required: true }]}
            >
              <Input className="!w-full" />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item name="video_url" label="Link Video Source">
              <Input prefix={<PlayCircleOutlined />} className="!w-full" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default ModalSaveEpisode;
