import { updateVideoWebhookService } from "../services/episode.service.js";

export const webhookVideoController = async (req, res) => {
  try {
    const { production_id, episode_id, m3u8_url } = req.body;

    // Gọi sang service của episode để cập nhật database
    await updateVideoWebhookService(production_id, episode_id, m3u8_url);

    res.json({ message: "Đã cập nhật video URL thành công!" });
  } catch (error) {
    console.error("Webhook Error:", error);
    res.status(500).json({ error: error.message });
  }
};
