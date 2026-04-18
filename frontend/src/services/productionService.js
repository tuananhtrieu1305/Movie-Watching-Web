const DEFAULT_STREAMING_API_BASE = "/api/streaming";
const DEFAULT_STREAMING_API_HTTP_FALLBACK = "http://localhost:3000/api/streaming";

const normalizeBase = (value) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.replace(/\/$/, "");
};

const getStreamingApiBases = () => {
  const bases = [];

  const streamingBase = normalizeBase(import.meta.env.VITE_STREAMING_API_URL);
  if (streamingBase) bases.push(streamingBase);

  const apiBase = normalizeBase(import.meta.env.VITE_API_URL);
  if (apiBase) bases.push(`${apiBase}/api/streaming`);

  bases.push(DEFAULT_STREAMING_API_BASE);
  bases.push(DEFAULT_STREAMING_API_HTTP_FALLBACK);

  return [...new Set(bases)];
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

export const listProductions = async ({ signal } = {}) => {
  const errors = [];

  for (const base of getStreamingApiBases()) {
    const endpoint = `${base}/list?scope=home`;

    let response;
    try {
      response = await fetch(endpoint, { method: "GET", signal });
    } catch (err) {
      if (err?.name === "AbortError") throw err;
      errors.push(`Fetch failed (${endpoint})`);
      continue;
    }

    const data = await safeJson(response);

    if (response.ok) {
      if (!Array.isArray(data)) return [];
      return data;
    }

    const errorMessage =
      typeof data?.error === "string" && data.error.trim() !== ""
        ? data.error
        : `Request failed (${response.status})`;
    errors.push(`${endpoint}: ${errorMessage}`);
  }

  throw new Error(errors[0] || "Unable to load productions");
};
