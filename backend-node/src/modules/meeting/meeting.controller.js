import { meetingService } from "./meeting.instance.js";
class MeetingController {
  // Xử lý tạo phòng
  async createRoom(req, res) {
    try {
      const { title } = req.body;
      const meetingData = await meetingService.createCloudflareMeeting(title);

      const joinMeetingData = await meetingService.generateParticipantToken(
        meetingData.id,
        "group_call_host",
      );

      return res.status(201).json({
        success: true,
        message: "Tạo phòng họp thành công",
        data: {
          id: meetingData.id,
          token: joinMeetingData.token,
          participant: joinMeetingData
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
      const { userName } = req.body;

      const participantData =
        await meetingService.generateParticipantToken(meetingId);

      return res.status(200).json({
        success: true,
        message: "Lấy token thành công",
        data: participantData,
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
