// ─── Rate Limiter (in-memory, per-user) ─────────────────────────────
// Giới hạn mỗi user chỉ được POST comment tối đa 5 lần/phút
const rateLimitMap = new Map(); // Map<userId, { count, resetTime }>
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 phút
const RATE_LIMIT_MAX = 5;

export const commentRateLimit = (req, res, next) => {
  const userId = req.user?.id;
  if (!userId) return next(); // Will be caught by requireAuth

  const now = Date.now();
  const entry = rateLimitMap.get(userId);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return next();
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return res.status(429).json({
      message: "Bạn đang bình luận quá nhanh. Vui lòng đợi 1 phút.",
    });
  }

  entry.count++;
  return next();
};

// Periodic cleanup (every 5 minutes) to prevent memory leak
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of rateLimitMap) {
    if (now > val.resetTime) rateLimitMap.delete(key);
  }
}, 5 * 60 * 1000);

// ─── Duplicate Check ────────────────────────────────────────────────
// Chặn 2 comment giống hệt nhau trong 30s
const recentComments = new Map(); // Map<userId, { content, timestamp }>
const DUPLICATE_WINDOW_MS = 30 * 1000;

export const duplicateCheck = (req, res, next) => {
  const userId = req.user?.id;
  const content = req.body?.content?.trim();
  if (!userId || !content) return next();

  const now = Date.now();
  const key = `${userId}`;
  const recent = recentComments.get(key);

  if (recent && recent.content === content && now - recent.timestamp < DUPLICATE_WINDOW_MS) {
    return res.status(400).json({
      message: "Bạn đã gửi bình luận này rồi. Vui lòng không gửi trùng lặp.",
    });
  }

  // Store after validation passes (will be called from route, before controller)
  // We update the map here so even if the DB write fails, we still rate-limit
  recentComments.set(key, { content, timestamp: now });
  return next();
};

// Cleanup every 2 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of recentComments) {
    if (now - val.timestamp > DUPLICATE_WINDOW_MS) recentComments.delete(key);
  }
}, 2 * 60 * 1000);

// ─── Sanitize & Validate ───────────────────────────────────────────
const MIN_LENGTH = 1;
const MAX_LENGTH = 1000;

// Simple HTML tag stripper (removes all tags). For production, use `sanitize-html`.
function stripHtml(str) {
  return str.replace(/<[^>]*>/g, "").trim();
}

export const sanitizeAndValidate = (req, res, next) => {
  let { content } = req.body;
  if (!content || typeof content !== "string") {
    return res.status(400).json({ message: "Nội dung bình luận không được để trống." });
  }

  // Anti-XSS: strip HTML tags
  content = stripHtml(content);

  // Validate length
  if (content.length < MIN_LENGTH || content.length > MAX_LENGTH) {
    return res.status(400).json({
      message: `Nội dung bình luận phải từ ${MIN_LENGTH} đến ${MAX_LENGTH} ký tự.`,
    });
  }

  // Overwrite with sanitized content
  req.body.content = content;
  return next();
};

// ─── Optional Auth (for GET requests — extracts user if token present) ──
import { verifyAccessToken } from "../../core/utils/jwt.js";

export const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const decoded = verifyAccessToken(token);
      if (decoded) {
        req.user = { id: decoded.userId, role: decoded.role };
      }
    }
  } catch {
    // Silently ignore — user is just not logged in
  }
  next();
};
