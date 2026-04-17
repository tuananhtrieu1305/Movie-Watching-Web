const DEFAULT_CHAT_BASE_URL = "http://localhost:8002";
const DEFAULT_CHAT_PATH = "/api/v1/chat";

const buildEndpoint = (baseOrEndpoint) => {
  if (typeof baseOrEndpoint !== "string") return null;
  const raw = baseOrEndpoint.trim();
  if (!raw) return null;

  // If user provides full endpoint (/api/v1/chat included), keep it.
  if (raw.includes("/api/")) return raw;

  try {
    return new URL(DEFAULT_CHAT_PATH, raw.endsWith("/") ? raw : `${raw}/`).toString();
  } catch {
    return null;
  }
};

const getChatEndpoint = () => {
  const endpointOrBase =
    import.meta.env.VITE_AI_CHATBOT_API_URL ||
    import.meta.env.VITE_AI_CHATBOT_BASE_URL;

  return (
    buildEndpoint(endpointOrBase) ||
    buildEndpoint(DEFAULT_CHAT_BASE_URL) ||
    `${DEFAULT_CHAT_BASE_URL}${DEFAULT_CHAT_PATH}`
  );
};

const safeJson = async (response) => {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

export const sendChatMessage = async ({ userId, message, conversationId, signal }) => {
  const endpoint = getChatEndpoint();
  let response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: userId,
        message,
        conversation_id: conversationId ?? null,
      }),
      signal,
    });
  } catch (err) {
    if (err?.name === "AbortError") throw err;
    throw new Error(
      `Failed to fetch (${endpoint}). Kiểm tra backend đang chạy và CORS/URL đúng.`,
    );
  }

  const data = await safeJson(response);

  if (!response.ok) {
    const detail = data?.detail;
    const errorMessage =
      typeof detail === "string" && detail.trim() !== ""
        ? detail
        : `Request failed (${response.status})`;
    throw new Error(errorMessage);
  }

  return data;
};
