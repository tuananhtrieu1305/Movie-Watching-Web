import { Modal, Form, InputNumber, message, Row, Col } from "antd";

const ModalSaveSeason = ({ open, onCancel }) => {
  const [form] = Form.useForm();

  const onFinish = () => {
    message.success("Tạo mùa mới thành công!");
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title="Thêm Mùa Mới"
      open={open}
      onCancel={onCancel}
      onOk={form.submit}
      okText="Tạo"
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={15}>
          <Col span={24}>
            <Form.Item
              name="season_number"
              label="Thứ tự mùa"
              rules={[{ required: true }]}
            >
              <InputNumber min={1} className="!w-full" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default ModalSaveSeason;
