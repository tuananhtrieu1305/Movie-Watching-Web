import React, { useState } from "react";
import { Modal, Button, Input, message } from "antd";
import { TeamOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useMeetingContext } from "../MeetingContext";
import { joinMeetingApi } from "../MeetingApi";

const WatchPartyModal = ({ open, onCancel, production }) => {
  const navigate = useNavigate();
  const [joinId, setJoinId] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  // Context Meeting
  const { 
    createRoom, 
    setToken, 
    setIsHost, 
    setParticipantId, 
    setMeetingId: setGlobalMeetingId 
  } = useMeetingContext();

  const handleCreateWatchParty = async () => {
    try {
      setIsCreating(true);
      const data = await createRoom(`Phòng xem ${production.title}`);
      navigate(`/meeting/${data.id}`, { state: { initialSlug: production.slug } });
    } catch (error) {
      message.error("Lỗi khi tạo phòng Watch Party. Vui lòng thử lại!");
    } finally {
      setIsCreating(false);
      onCancel();
    }
  };

  const handleJoinWatchParty = async () => {
    if (!joinId.trim()) return;
    try {
      setIsJoining(true);
      const cleanId = joinId.trim();
      const data = await joinMeetingApi(cleanId);
      
      if (data && data.token) {
        setToken(data.token);
        setIsHost(false);
        setGlobalMeetingId(cleanId);
        setParticipantId(data.participant?.id || "guest-temp");
        navigate(`/meeting/${cleanId}`, { state: { initialSlug: production.slug } });
      }
    } catch (error) {
      message.error(error.message || "Không thể vào phòng. Mã sai hoặc phòng đã đóng.");
    } finally {
      setIsJoining(false);
      onCancel();
    }
  };

  return (
    <Modal
      title={null}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={500}
      centered
      closeIcon={<span className="text-gray-400 hover:text-white transition-colors">✖</span>}
      classNames={{
        content: '!bg-[#1a1a1a] !border !border-gray-800 !rounded-2xl',
      }}
    >
      <div className="py-6">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full bg-[#ffdd95]/20 flex items-center justify-center text-[#ffdd95] mb-4">
            <TeamOutlined className="text-3xl" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Watch Party</h2>
          <p className="text-gray-400 text-center">
            Tạo phòng riêng hoặc nhập mã để cùng xem siêu phẩm{" "}
            <span className="text-[#ffdd95] font-semibold">{production?.title}</span>
          </p>
        </div>

        <div className="space-y-6">
          {/* Tạo phòng */}
          <div className="bg-[#242424] p-5 rounded-xl border border-gray-700 hover:border-gray-600 transition-colors">
            <h3 className="text-lg font-bold text-white mb-2">Tạo phòng mới</h3>
            <p className="text-sm text-gray-500 mb-4">
              Bạn sẽ là Chủ phòng (Host), có quyền chọn tập và làm chủ thanh trình chiếu.
            </p>
            <Button
              type="primary"
              block
              size="large"
              loading={isCreating}
              onClick={handleCreateWatchParty}
              className="!bg-[#ffdd95] !text-[#111] border-none !font-bold"
            >
              Tạo phòng ngay
            </Button>
          </div>

          <div className="flex items-center">
            <div className="flex-1 h-px bg-gray-800"></div>
            <span className="px-4 text-gray-500 text-sm font-medium">HOẶC</span>
            <div className="flex-1 h-px bg-gray-800"></div>
          </div>

          {/* Tham gia phòng */}
          <div className="bg-[#242424] p-5 rounded-xl border border-gray-700">
            <h3 className="text-lg font-bold text-white mb-3">Tham gia phòng có sẵn</h3>
            <div className="flex gap-2">
              <Input
                placeholder="Nhập mã phòng (VD: meet-...)"
                size="large"
                value={joinId}
                onChange={(e) => setJoinId(e.target.value)}
                onPressEnter={handleJoinWatchParty}
                className="!bg-[#111] !border-gray-700 !text-white placeholder:text-gray-600 focus:!border-[#ffdd95] focus:!ring-1 focus:!ring-[#ffdd95]"
              />
              <Button
                type="primary"
                size="large"
                loading={isJoining}
                disabled={!joinId.trim()}
                onClick={handleJoinWatchParty}
                className="!bg-blue-600 !text-white border-none font-bold px-6"
              >
                Vào
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default WatchPartyModal;
