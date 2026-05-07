import axios from "axios";

const BASE = `${import.meta.env.VITE_API_URL}/api/comment`;

// Helper: attach Bearer token nếu có
const authHeaders = (token) =>
  token ? { Authorization: `Bearer ${token}` } : {};

/**
 * Lấy danh sách comment gốc của 1 production (có cursor-based pagination)
 * GET /api/comment/:movieId/comments?cursor=&limit=
 */
export const getComments = async (productionId, { cursor, limit = 10 } = {}, token = null) => {
  const params = { limit };
  if (cursor) params.cursor = cursor;

  const res = await axios.get(`${BASE}/${productionId}/comments`, {
    params,
    headers: authHeaders(token),
  });
  return res.data; // { comments: [], nextCursor: null | number }
};

/**
 * Lấy replies của 1 comment cha
 * GET /api/comment/comments/:parentId/replies
 */
export const getReplies = async (parentId, { cursor, limit = 5 } = {}, token = null) => {
  const params = { limit };
  if (cursor) params.cursor = cursor;

  const res = await axios.get(`${BASE}/comments/${parentId}/replies`, {
    params,
    headers: authHeaders(token),
  });
  return res.data;
};

/**
 * Tạo comment mới (yêu cầu đăng nhập)
 * POST /api/comment/comments
 */
export const createComment = async ({ productionId, content, parentId, isSpoiler = false }, token) => {
  const res = await axios.post(
    `${BASE}/comments`,
    { productionId, content, parentId, isSpoiler },
    { headers: authHeaders(token) }
  );
  return res.data;
};

/**
 * Toggle reaction (LIKE / DISLIKE)
 * POST /api/comment/comments/:id/reaction
 */
export const toggleReaction = async (commentId, reactType, token) => {
  const res = await axios.post(
    `${BASE}/comments/${commentId}/reaction`,
    { reactType },
    { headers: authHeaders(token) }
  );
  return res.data;
};

/**
 * Xoá comment
 * DELETE /api/comment/comments/:id
 */
export const deleteComment = async (commentId, token) => {
  const res = await axios.delete(`${BASE}/comments/${commentId}`, {
    headers: authHeaders(token),
  });
  return res.data;
};
