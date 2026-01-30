import { useState } from "react";
import { Collapse, Button, Empty, message, Popconfirm } from "antd";
import {
  PlayCircleOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

import ModalSaveSeason from "./ModalSaveSeason";
import ModalSaveEpisode from "./ModalSaveEpisode";
import EpisodeList from "../../components/adminContent/EpisodeList";

const { Panel } = Collapse;

const SeasonManager = ({ production }) => {
  const [isSeasonModalOpen, setSeasonModalOpen] = useState(false);
  const [isEpisodeModalOpen, setEpisodeModalOpen] = useState(false);
  const [currentEditingEpisode, setCurrentEditingEpisode] = useState(null);

  const handleEditEpisode = (episode) => {
    setCurrentEditingEpisode(episode);
    setEpisodeModalOpen(true);
  };

  const handleAddEpisode = (e) => {
    e?.stopPropagation();
    setCurrentEditingEpisode(null);
    setEpisodeModalOpen(true);
  };

  // Logic hiển thị cho MOVIE
  if (production.type === "movie") {
    const movieAsEpisode = {
      id: production.movie?.id || 1,
      episode_number: 1,
      title: "Full Movie",
      duration: production.movie?.duration || 0,
      video_url: "source.mp4",
    };
    return (
      <div>
        <div className="font-bold text-lg mb-4">Quản lý File Phim Lẻ</div>
        <div className="border p-4 rounded shadow-sm flex justify-between">
          <div className="flex gap-4">
            <div className="w-24 h-16 bg-black rounded flex items-center justify-center text-white">
              <PlayCircleOutlined className="text-2xl" />
            </div>
            <div>
              <div className="font-bold">{production.title}</div>
              <div className="text-xs text-gray-500 mt-1">
                {Math.floor(movieAsEpisode.duration / 60)} phút
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              icon={<EditOutlined />}
              onClick={() => handleEditEpisode(movieAsEpisode)}
            >
              Sửa File
            </Button>
            <Popconfirm
              title="Xóa file này?"
              onConfirm={() => message.success("Đã xóa file")}
              okButtonProps={{ danger: true }}
            >
              <Button danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </div>
        </div>
        <ModalSaveEpisode
          open={isEpisodeModalOpen}
          onCancel={() => setEpisodeModalOpen(false)}
          initialData={currentEditingEpisode}
        />
      </div>
    );
  }

  // Logic hiển thị cho SERIES
  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h3 className="font-bold text-lg m-0">Danh sách Mùa</h3>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setSeasonModalOpen(true)}
        >
          Thêm Mùa
        </Button>
      </div>
      {!production.seasons?.length ? (
        <Empty description="Chưa có mùa nào" />
      ) : (
        <Collapse accordion defaultActiveKey={["1"]}>
          {production.seasons.map((season) => (
            <Panel
              header={
                <span className="font-semibold">
                  {season.title || `Mùa ${season.season_number}`}
                </span>
              }
              key={season.id}
              extra={
                <Button
                  type="primary"
                  size="small"
                  ghost
                  icon={<PlusOutlined />}
                  onClick={handleAddEpisode}
                >
                  Thêm tập
                </Button>
              }
            >
              <EpisodeList
                seasonId={season.id}
                onEditEpisode={handleEditEpisode}
              />
            </Panel>
          ))}
        </Collapse>
      )}
      <ModalSaveSeason
        open={isSeasonModalOpen}
        onCancel={() => setSeasonModalOpen(false)}
      />
      <ModalSaveEpisode
        open={isEpisodeModalOpen}
        onCancel={() => setEpisodeModalOpen(false)}
        initialData={currentEditingEpisode}
      />
    </div>
  );
};

export default SeasonManager;
