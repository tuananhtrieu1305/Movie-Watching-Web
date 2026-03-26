import { useRef, useState } from "react";
import {
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { ProTable } from "@ant-design/pro-components";
import { Button, Drawer, Popconfirm, message, Tooltip } from "antd";

import ModalCreateProduction from "./ModalCreateProduction";
import SeasonManager from "./SeasonManager";
import ProductionDetail from "./ProductionDetail";
import {
  GenreTags,
  PremiumTag,
  TypeTag,
} from "../../components/adminContent/ProductionTags";
import AnonymousBanner from "../../assets/anonymousBanner.png";
import mockDB from "../../modules/streaming/mock/mockDB";

const ContentTable = () => {
  const actionRef = useRef();
  const [modalCreateOpen, setModalCreateOpen] = useState(false);
  const [editingProduction, setEditingProduction] = useState(null);
  const [managerDrawerOpen, setManagerDrawerOpen] = useState(false);
  const [currentManagerItem, setCurrentManagerItem] = useState(null);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [currentDetailItem, setCurrentDetailItem] = useState(null);

  const columns = [
    {
      title: "Poster",
      dataIndex: "poster_url",
      hideInSearch: true,
      width: 80,
      align: "center",
      render: (_, r) => (
        <figure className="flex items-center justify-center">
          <img
            src={r?.poster_url ? r.poster_url : AnonymousBanner}
            alt=""
            className="w-12 h-16 object-cover rounded shadow-sm"
          />
        </figure>
      ),
    },
    {
      title: "Tên",
      dataIndex: "title",
      copyable: true,
      render: (_, r) => (
        <div>
          <div className="font-bold">{r.title}</div>
          <div>
            <GenreTags genres={r.genres} />
          </div>
        </div>
      ),
    },
    {
      title: "Loại",
      dataIndex: "type",
      width: 120,
      align: "center",
      valueEnum: { movie: { text: "Phim Lẻ" }, series: { text: "Phim Bộ" } },
      render: (_, r) => <TypeTag type={r.type} />,
    },
    {
      title: "Chế độ",
      dataIndex: "is_premium",
      width: 100,
      align: "center",
      valueEnum: { true: { text: "VIP Only" }, false: { text: "Miễn phí" } },
      render: (_, r) => <PremiumTag isPremium={r.is_premium} />,
    },
    {
      title: "Ra mắt",
      dataIndex: "release_year",
      valueType: "number",
      width: 150,
      align: "center",
      render: (_, r) => <div>{r.release_year}</div>,
    },
    {
      title: "Hành động",
      valueType: "option",
      width: 180,
      align: "center",
      render: (_, record) => [
        <Tooltip title="Xem chi tiết" key="view">
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => {
              setCurrentDetailItem(record);
              setDetailDrawerOpen(true);
            }}
          />
        </Tooltip>,
        <Tooltip title="Sửa thông tin" key="edit">
          <Button
            type="primary"
            ghost
            icon={<EditOutlined />}
            size="small"
            onClick={() => {
              setEditingProduction(record);
              setModalCreateOpen(true);
            }}
          />
        </Tooltip>,
        <Tooltip title="Quản lý Content" key="manage">
          <Button
            icon={<SettingOutlined />}
            size="small"
            className="text-purple-600 border-purple-600"
            onClick={() => {
              setCurrentManagerItem(record);
              setManagerDrawerOpen(true);
            }}
          >
            {record.type === "series" ? "Mùa" : "File"}
          </Button>
        </Tooltip>,
        <Popconfirm
          key="del"
          title="Xóa phim này?"
          onConfirm={() => {
            message.success("Đã xóa!");
            actionRef.current?.reload();
          }}
          okButtonProps={{ danger: true }}
        >
          <Button danger icon={<DeleteOutlined />} size="small" />
        </Popconfirm>,
      ],
    },
  ];

  return (
    <>
      <ProTable
        columns={columns}
        actionRef={actionRef}
        request={async (params) => {
          let data = mockDB.getAllProductions();
          if (params.title)
            data = data.filter((item) =>
              item.title.toLowerCase().includes(params.title.toLowerCase()),
            );
          if (params.type)
            data = data.filter((item) => item.type === params.type);
          if (params.is_premium)
            data = data.filter(
              (item) => item.is_premium === (params.is_premium === "true"),
            );
          if (params.release_year)
            data = data.filter(
              (item) => item.release_year.toString() === params.release_year,
            );
          return { data: data, success: true };
        }}
        rowKey="id"
        pagination={{ pageSize: 4 }}
        headerTitle="QUẢN LÝ KHO PHIM"
        toolBarRender={() => [
          <Button
            key="add"
            icon={<PlusOutlined />}
            type="primary"
            onClick={() => {
              setEditingProduction(null);
              setModalCreateOpen(true);
            }}
          >
            Thêm Mới
          </Button>,
        ]}
      />
      <ModalCreateProduction
        open={modalCreateOpen}
        setOpen={setModalCreateOpen}
        refreshTable={() => actionRef.current?.reload()}
        initialData={editingProduction}
      />
      <Drawer
        title={`Quản lý: ${currentManagerItem?.title}`}
        width={720}
        open={managerDrawerOpen}
        onClose={() => setManagerDrawerOpen(false)}
        destroyOnClose
      >
        {currentManagerItem && (
          <SeasonManager production={currentManagerItem} />
        )}
      </Drawer>
      <Drawer
        title="Thông tin phim"
        width={1000}
        open={detailDrawerOpen}
        onClose={() => setDetailDrawerOpen(false)}
      >
        {currentDetailItem && <ProductionDetail data={currentDetailItem} />}
      </Drawer>
    </>
  );
};

export default ContentTable;
