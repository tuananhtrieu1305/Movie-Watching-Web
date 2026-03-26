import { Modal, Form, Input, Button, Select, message, Tabs } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import { uploadMovie } from "../../services/movieService";
import GeneralInfoTab from "./GeneralInfoTab";
import ActorsTab from "./ActorsTab";

const ModalCreateProduction = ({
  open,
  setOpen,
  refreshTable,
  initialData,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState("movie");

  useEffect(() => {
    if (open) {
      if (initialData) {
        form.setFieldsValue({
          ...initialData,
          genres: initialData.genres?.map((g) => g.id) || [],
          type: initialData.type,
          status: initialData.status || "ongoing",
          actors:
            initialData.actors?.map((a) => ({
              name: a.name,
              character: a.character_name,
              avatar_url: a.avatar_url || "",
            })) || [],
        });
        setType(initialData.type);
      } else {
        form.resetFields();
        setType("movie");
      }
    }
  }, [open, initialData, form]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("type", type);
      formData.append("status", values.status);
      formData.append("genres", JSON.stringify(values.genres));
      formData.append(
        "poster_url",
        values.poster_url || "https://via.placeholder.com/150",
      );
      formData.append(
        "banner_url",
        values.banner_url || "https://via.placeholder.com/150",
      );
      formData.append("is_premium", values.is_premium);

      if (values.actors && values.actors.length > 0) {
        formData.append("actors", JSON.stringify(values.actors));
      }

      await uploadMovie(formData);

      message.success(
        initialData ? "Cập nhật thành công!" : "Thêm mới thành công!",
      );
      form.resetFields();
      setOpen(false);
      refreshTable();
    } catch (error) {
      console.error(error);
      message.error("Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={initialData ? `Sửa: ${initialData.title}` : "Thêm Nội Dung Mới"}
      open={open}
      onCancel={() => setOpen(false)}
      footer={null}
      width={720}
      destroyOnClose
      maskClosable={false}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          type: "movie",
          release_year: new Date().getFullYear(),
          is_premium: false,
          status: "ongoing",
        }}
      >
        <Tabs
          defaultActiveKey="1"
          items={[
            {
              key: "1",
              label: "Thông tin chung",
              children: (
                <GeneralInfoTab
                  type={type}
                  setType={setType}
                  initialData={initialData}
                  status={status}
                />
              ),
            },
            { key: "2", label: "Diễn viên (Cast)", children: <ActorsTab /> },
          ]}
        />

        <div className="flex justify-end gap-2 ">
          <Button onClick={() => setOpen(false)}>Hủy</Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            icon={<UploadOutlined />}
            onClick={() => setOpen(false)}
          >
            {initialData ? "Lưu Thay Đổi" : "Tạo Mới"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default ModalCreateProduction;
