import {
  Modal,
  Form,
  Input,
  InputNumber,
  message,
  Row,
  Col,
  Upload,
  Button,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { createEpisode, updateEpisode } from "../../services/movieService";

const ModalSaveEpisode = ({ open, onCancel, initialData }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const isEdit = !!initialData;
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    if (open) {
      if (initialData) {
        form.setFieldsValue({
          ...initialData,
          // Không set file trực tiếp vào form, chỉ set link cũ vào ô nhập text
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, initialData, form]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Dùng FormData vì có chứa file
      const formData = new FormData();
      formData.append("production_id", targetSeasonId);
      formData.append("episode_number", values.episode_number);
      formData.append("title", values.title);
      formData.append("duration", values.duration || 0);

      // Xử lý file video nếu người dùng có chọn file
      if (
        values.video &&
        values.video.fileList &&
        values.video.fileList.length > 0
      ) {
        formData.append("video", values.video.fileList[0].originFileObj);
      } else if (values.video_url) {
        // Fallback: Nếu không upload mà nhập link ngoài (m3u8/mp4)
        formData.append("video_url", values.video_url);
      }

      if (isEdit) {
        await updateEpisode(initialData.id, formData);
        messageApi.success("Cập nhật thành công!");
      } else {
        await createEpisode(formData);
        messageApi.success("Thêm tập thành công! Video đang được xử lý ngầm.");
      }
      form.resetFields();
      onCancel(true); // Đóng modal và ép reload data
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.error || "Có lỗi xảy ra!";
      messageApi.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const normFile = (e) => {
    if (Array.isArray(e)) return e;
    return e?.fileList;
  };

  return (
    <>
      {contextHolder}
      <Modal
        title={isEdit ? "Chỉnh sửa Video/Tập" : "Thêm tập phim mới"}
        open={open}
        onCancel={() => onCancel(false)}
        onOk={form.submit}
        okText="Lưu"
        confirmLoading={loading}
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
              <Form.Item
                name="video"
                label="Upload Video (MP4/MKV)"
                valuePropName="fileList"
                getValueFromEvent={normFile}
              >
                <Upload
                  maxCount={1}
                  accept="video/mp4,video/x-matroska"
                  beforeUpload={() => false}
                >
                  <Button icon={<UploadOutlined />}>
                    Chọn File từ máy tính
                  </Button>
                </Upload>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
};

export default ModalSaveEpisode;
