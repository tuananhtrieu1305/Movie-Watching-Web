import { useEffect } from "react";
import { useRealtimeKitSelector } from "@cloudflare/realtimekit-react";

export default function WhiteboardController({ meeting, hostId }) {
  // Lắng nghe xem Whiteboard có đang được mở không
  const activePlugins = useRealtimeKitSelector((m) => m?.plugins?.active);

  useEffect(() => {
    if (!meeting || !activePlugins) return;

    // 1. Tìm plugin Whiteboard trong danh sách các plugin đang hoạt động
    const whiteboard = activePlugins
      .toArray()
      .find((p) => p.name === "Whiteboard");
    if (!whiteboard) return;

    // 2. HÀM CẤU HÌNH WHITEBOARD (Đọc từ tài liệu Cloudflare)
    const lockWhiteboardToViewer = (targetHostId) => {
      console.log("🔒 Đang khóa Whiteboard, ép xem theo Host...");
      whiteboard.sendData({
        eventName: "config",
        data: {
          eventName: "config",
          follow: targetHostId, // Màn hình tự cuộn theo Host
          role: "viewer", // Chỉ được xem, không được vẽ
          autoScale: true, // Tự động thu phóng
        },
      });
    };

    // 3. XỬ LÝ TRƯỜNG HỢP 1: Host vào phòng SAU học sinh (Dùng Event Listener)
    const handleParticipantJoined = (participant) => {
      // Nếu người vừa vào chính là Host, thì khóa bảng của mình lại và follow Host
      if (participant.id === hostId) {
        lockWhiteboardToViewer(hostId);
      }
    };
    meeting.participants.on("participantJoined", handleParticipantJoined);

    // 4. XỬ LÝ TRƯỜNG HỢP 2 (Vá lỗi tài liệu): Học sinh vào phòng SAU Host
    // Kiểm tra xem Host đã có sẵn trong phòng chưa
    const isHostAlreadyInRoom = meeting.participants.joined
      .toArray()
      .some((p) => p.id === hostId);
    if (isHostAlreadyInRoom) {
      lockWhiteboardToViewer(hostId);
    }

    // 5. DỌN DẸP SỰ KIỆN KHI UNMOUNT
    return () => {
      meeting.participants.removeListener(
        "participantJoined",
        handleParticipantJoined,
      );
    };
  }, [meeting, activePlugins, hostId]);

  return null; // Tàng hình trên giao diện
}
