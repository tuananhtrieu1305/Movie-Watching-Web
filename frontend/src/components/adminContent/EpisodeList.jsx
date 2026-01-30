import { useState, useEffect } from "react";
import { List, Button, Empty, Spin, Popconfirm, message } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import { getEpisodesBySeason } from "../../modules/streaming/mock/watchData";

const EpisodeList = ({ seasonId, onEditEpisode }) => {
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEpisodes = async () => {
      setLoading(true);
      try {
        const res = await getEpisodesBySeason(seasonId);
        setEpisodes(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchEpisodes();
  }, [seasonId]);

  if (loading)
    return (
      <div className="text-center p-2">
        <Spin />
      </div>
    );

  console.log(episodes);

  if (episodes.length === 0)
    return <Empty description="Trống" image={Empty.PRESENTED_IMAGE_SIMPLE} />;

  return (
    <List
      size="small"
      dataSource={episodes}
      renderItem={(item) => (
        <List.Item
          actions={[
            <Button
              key="edit"
              type="text"
              icon={<EditOutlined />}
              size="small"
              className="text-blue-600"
              onClick={() => onEditEpisode(item)}
            >
              Sửa
            </Button>,
            <Popconfirm
              key="del"
              title="Xóa tập này?"
              onConfirm={() => message.success("Đã xóa")}
              okButtonProps={{ danger: true }}
            >
              <Button type="text" danger icon={<DeleteOutlined />} size="small">
                Xóa
              </Button>
            </Popconfirm>,
          ]}
        >
          <List.Item.Meta
            avatar={
              <PlayCircleOutlined className="text-xl text-gray-400 mt-2" />
            }
            title={
              <span className="font-medium">
                Tập {item.episode_number}: {item.title}
              </span>
            }
            description={`${Math.floor(item.duration / 60)} phút - ${item.views_count || 0} views`}
          />
        </List.Item>
      )}
    />
  );
};

export default EpisodeList;
