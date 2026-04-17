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

    // Cloudflare v4 API thường bọc dữ liệu trả về trong object 'result'
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
}
