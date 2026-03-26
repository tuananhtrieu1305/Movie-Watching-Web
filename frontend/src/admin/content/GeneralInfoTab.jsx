import {
  FolderAddOutlined,
  UploadOutlined,
  VideoCameraAddOutlined,
} from "@ant-design/icons";
import {
  Button,
  Col,
  Form,
  Input,
  Radio,
  Row,
  Select,
  Switch,
  Upload,
} from "antd";
import TextArea from "antd/es/input/TextArea";
import mockDB from "../../modules/streaming/mock/mockDB";

const GeneralInfoTab = (props) => {
  const { initialData, type, setType } = props;
  const allGenres = mockDB.genres;
  return (
    <>
      <Form.Item name="type" className="mb-2 text-center">
        <Radio.Group
          buttonStyle="solid"
          size="large"
          onChange={(e) => setType(e.target.value)}
          value={type}
          disabled={!!initialData}
        >
          <Radio.Button value="movie">
            <VideoCameraAddOutlined className="mr-2" />
            Phim Lẻ
          </Radio.Button>
          <Radio.Button value="series">
            <FolderAddOutlined className="mr-2" />
            Phim Bộ
          </Radio.Button>
        </Radio.Group>
      </Form.Item>

      <Row gutter={10}>
        <Col span={24}>
          <Form.Item
            name="title"
            label="Tên Phim / Series"
            rules={[{ required: true, message: "Nhập tên phim" }]}
          >
            <Input placeholder="Ví dụ: Đào, Phở và Piano..." />
          </Form.Item>
        </Col>

        <Col span={24}>
          <Form.Item
            name="genres"
            label="Thể loại"
            rules={[{ required: true, message: "Chọn thể loại" }]}
          >
            <Select mode="multiple" placeholder="Chọn thể loại..." allowClear>
              {allGenres.map((g) => (
                <Option key={g.id} value={g.id}>
                  {g.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item name="release_year" label="Năm SX">
            <Input type="number" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: "Chọn trạng thái" }]}
          >
            <Select placeholder="Chọn...">
              <Option value="ongoing">Đang tiến hành</Option>
              <Option value="completed">Đã hoàn thành</Option>
              <Option value="upcoming">Sắp chiếu</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={4}>
          <Form.Item
            name="is_premium"
            label="Chế độ VIP"
            valuePropName="checked"
          >
            <Switch checkedChildren="VIP" unCheckedChildren="Free" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="poster_url" label="Link Poster">
            <Input prefix={<UploadOutlined />} placeholder="https://..." />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="banner_url" label="Link Banner">
            <Input prefix={<UploadOutlined />} placeholder="https://..." />
          </Form.Item>
        </Col>

        <Col span={24}>
          <Form.Item name="description" label="Mô tả / Cốt truyện">
            <TextArea rows={3} placeholder="Nội dung chính..." />
          </Form.Item>
        </Col>
      </Row>

      {!initialData && type === "movie" && (
        <div>
          <Form.Item name="video" label="Upload Video (MP4)">
            <Upload maxCount={1} accept="video/mp4" beforeUpload={() => false}>
              <Button icon={<UploadOutlined />}>Chọn File từ máy tính</Button>
            </Upload>
          </Form.Item>
        </div>
      )}
    </>
  );
};
export default GeneralInfoTab;
