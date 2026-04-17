const DEFAULT_ADMIN_API_BASE = "/api/admin";
const DEFAULT_ADMIN_API_HTTP_FALLBACK = "http://localhost:3000/api/admin";

const normalizeBase = (value) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.replace(/\/$/, "");
};

const getAdminApiBases = () => {
  const bases = [];

  const adminBase = normalizeBase(import.meta.env.VITE_ADMIN_API_URL);
  if (adminBase) bases.push(adminBase);

  const apiBase = normalizeBase(import.meta.env.VITE_API_URL);
  if (apiBase) bases.push(`${apiBase}/api/admin`);

  bases.push(DEFAULT_ADMIN_API_BASE);
  bases.push(DEFAULT_ADMIN_API_HTTP_FALLBACK);

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

export const getAdminDashboardData = async ({ range = "7days", signal } = {}) => {
  const errors = [];

  for (const base of getAdminApiBases()) {
    const endpoint = `${base}/analytics/dashboard?range=${encodeURIComponent(range)}`;

    let response;
    try {
      response = await fetch(endpoint, { method: "GET", signal });
    } catch (error) {
      if (error?.name === "AbortError") throw error;
      errors.push(`Fetch failed (${endpoint})`);
      continue;
    }

    const payload = await safeJson(response);

    if (response.ok) {
      if (payload && typeof payload === "object") {
        if (payload.data && typeof payload.data === "object") {
          return payload.data;
        }
        return payload;
      }
      return null;
    }

    const errorMessage =
      typeof payload?.error === "string"
        ? payload.error
        : typeof payload?.message === "string"
          ? payload.message
          : `Request failed (${response.status})`;
    errors.push(`${endpoint}: ${errorMessage}`);
  }

  throw new Error(errors[0] || "Unable to load admin dashboard data");
};
