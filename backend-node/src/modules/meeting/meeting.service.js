import prisma from "../../core/database/prisma.js";

export default class MeetingService {
  constructor() {
    this.accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    this.appId = process.env.CLOUDFLARE_APP_ID;
    this.apiToken = process.env.CLOUDFLARE_API_TOKEN;
    if (!this.accountId || !this.appId || !this.apiToken) {
      throw new Error(
        "Thiếu cấu hình Cloudflare (CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_APP_ID, CLOUDFLARE_API_TOKEN) trong file .env"
      );
    }
  }

  // Tạo Base URL chuẩn của Cloudflare API v4 cho RealtimeKit
  get baseUrl() {
    return `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/realtime/kit/${this.appId}`;
  }

  // Header chuẩn dùng Bearer Token
  get headers() {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.apiToken}`,
    };
  }

  async createCloudflareMeeting(title) {
    const response = await fetch(`${this.baseUrl}/meetings`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify({
        title: title || "Phòng họp RealtimeKit v4",
      }),
    });

    const json = await response.json();

    if (!response.ok || !json.success) {
      throw new Error(
        `Lỗi từ Cloudflare v4 (Tạo phòng): ${JSON.stringify(json.errors)}`,
      );
    }

    return json.data;
  }

  async generateParticipantToken(meetingId, role) {
    // API cấp token bằng cách thêm participant vào meeting
    const response = await fetch(
      `${this.baseUrl}/meetings/${meetingId}/participants`,
      {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify({
          preset_name: "group_call_host",
          custom_participant_id: "tmp",
        }),
      },
    );
    console.log(response);

    const json = await response.json();

    if (!response.ok || !json.success) {
      throw new Error(
        `Lỗi từ Cloudflare v4 (Tạo Token): ${JSON.stringify(json.errors)}`,
      );
    }

    return json.data;
  }

  // ===================== DB METHODS =====================

  /**
   * Tạo watch_parties + thêm host participant trong 1 transaction.
   * Đảm bảo atomicity: nếu bước nào lỗi, toàn bộ rollback.
   */
  async createPartyWithHost(meetingId, hostUserId, title, productionId, episodeId) {
    return await prisma.$transaction(async (tx) => {
      // 1. Tạo record phòng
      const party = await tx.watch_parties.create({
        data: {
          id: meetingId,
          host_id: hostUserId,
          title: title || "Phòng xem phim",
          production_id: productionId,
          episode_id: episodeId,
          status: "waiting",
        },
      });

      // 2. Thêm host vào danh sách participants
      await tx.watch_party_participants.create({
        data: {
          party_id: meetingId,
          user_id: hostUserId,
          role: "host",
        },
      });

      return party;
    });
  }

  /**
   * Thêm hoặc cập nhật participant khi join phòng.
   * Dùng upsert để tránh duplicate khi user F5 (an toàn nhờ composite PK).
   */
  async addOrUpdateParticipant(meetingId, userId, role = "participant") {
    return await prisma.watch_party_participants.upsert({
      where: {
        party_id_user_id: {
          party_id: meetingId,
          user_id: userId,
        },
      },
      update: {
        last_active_at: new Date(),
      },
      create: {
        party_id: meetingId,
        user_id: userId,
        role,
      },
    });
  }

  /**
   * Đánh dấu phòng đã kết thúc trong DB.
   * meetingId === watch_parties.id (Cloudflare ID là PK).
   */
  async endParty(meetingId) {
    try {
      return await prisma.watch_parties.update({
        where: { id: meetingId },
        data: {
          status: "ended",
          expires_at: new Date(),
        },
      });
    } catch (err) {
      // Không throw nếu record không tồn tại (phòng chưa được lưu vào DB)
      console.error(`[WatchParty] endParty error for ${meetingId}:`, err.message);
    }
  }

  /**
   * Kiểm tra phòng có hợp lệ để join không.
   * Trả về party record hoặc null nếu không hợp lệ.
   */
  async getValidParty(meetingId) {
    const party = await prisma.watch_parties.findUnique({
      where: { id: meetingId },
    });

    if (!party) return { valid: false, reason: "Phòng không tồn tại" };
    if (party.status === "ended") return { valid: false, reason: "Phòng đã kết thúc" };
    if (party.expires_at && party.expires_at < new Date()) {
      return { valid: false, reason: "Phòng đã hết hạn" };
    }

    return { valid: true, party };
  }
}
