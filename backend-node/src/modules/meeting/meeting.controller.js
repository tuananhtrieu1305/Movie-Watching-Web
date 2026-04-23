import { meetingService } from "./meeting.instance.js";

class MeetingController {
  // Xử lý tạo phòng
  async createRoom(req, res) {
    try {
      const { title, productionId, episodeId } = req.body;
      const hostUserId = req.user.id; // Lấy từ requireAuth middleware

      // 1. Tạo phòng trên Cloudflare
      const meetingData = await meetingService.createCloudflareMeeting(title);
      const meetingId = meetingData.id;

      // 2. Lấy token cho host
      const joinMeetingData = await meetingService.generateParticipantToken(
        meetingId,
        "host",
      );

      // 3. Lưu phòng + host vào DB trong 1 transaction
      await meetingService.createPartyWithHost(
        meetingId,
        hostUserId,
        title,
        productionId ? Number(productionId) : null,
        episodeId ? Number(episodeId) : null,
      );

      return res.status(201).json({
        success: true,
        message: "Tạo phòng họp thành công",
        data: {
          meetingId,
          token: joinMeetingData.token,
          userId: hostUserId,
          role: "host",
        },
      });
    } catch (error) {
      console.error("Lỗi ở createRoom:", error.message);
      return res.status(500).json({
        success: false,
        message: "Lỗi server khi tạo phòng",
        error: error.message,
      });
    }
  }

  // Xử lý join phòng và cấp token
  async joinRoom(req, res) {
    try {
      const { meetingId } = req.params;
      const userId = req.user.id; // Lấy từ requireAuth middleware

      // 1. Kiểm tra phòng có hợp lệ không
      const { valid, reason } = await meetingService.getValidParty(meetingId);
      if (!valid) {
        return res.status(400).json({
          success: false,
          message: reason,
        });
      }

      // 2. Cấp token Cloudflare
      const participantData = await meetingService.generateParticipantToken(meetingId, "participant");

      // 3. Ghi participant vào DB (upsert — an toàn khi F5)
      await meetingService.addOrUpdateParticipant(meetingId, userId, "participant");

      return res.status(200).json({
        success: true,
        message: "Lấy token thành công",
        data: {
          meetingId,
          token: participantData.token,
          userId,
          role: "participant",
        },
      });
    } catch (error) {
      console.error("Lỗi ở joinRoom:", error.message);
      return res.status(500).json({
        success: false,
        message: "Lỗi server khi join phòng",
        error: error.message,
      });
    }
  }
}

export default new MeetingController();
