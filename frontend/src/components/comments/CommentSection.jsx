import React, { useState, useEffect, useContext, useCallback } from "react";
import { AuthContext } from "../../modules/auth/context/AuthContext";
import { getComments, createComment } from "../../services/commentService";
import socket from "../../services/socket";
import CommentInput from "./CommentInput";
import CommentItem from "./CommentItem";

const CommentSection = ({ productionId }) => {
  const { accessToken, user, isAuthenticated, refreshAccessToken } = useContext(AuthContext);

  const [comments, setComments] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  // ── Fetch initial comments ────────────────────────────
  const fetchComments = useCallback(async () => {
    if (!productionId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getComments(productionId, { limit: 10 }, accessToken);
      setComments(data.comments || []);
      setNextCursor(data.nextCursor || null);
    } catch (err) {
      console.error("fetchComments error:", err);
      setError("Không thể tải bình luận. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [productionId, accessToken]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // ── Socket realtime connection ────────────────────────
  useEffect(() => {
    if (!productionId) return;

    socket.connect();
    socket.emit("join_production", productionId);

    const handleNewComment = (comment) => {
      if (comment.production_id !== productionId) return;
      setComments((prev) => {
        if (prev.some((c) => c.id === comment.id)) return prev;
        return [comment, ...prev];
      });
    };

    socket.on("new_comment", handleNewComment);

    return () => {
      socket.emit("leave_production", productionId);
      socket.off("new_comment", handleNewComment);
      socket.disconnect();
    };
  }, [productionId]);

  // ── Load more (cursor pagination) ────────────────────
  const handleLoadMore = async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const data = await getComments(productionId, { cursor: nextCursor, limit: 10 }, accessToken);
      setComments((prev) => [...prev, ...(data.comments || [])]);
      setNextCursor(data.nextCursor || null);
    } catch (err) {
      console.error("loadMore error:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  // ── Submit new comment ────────────────────────────────
  const handleNewComment = async (inputData) => {
    if (!isAuthenticated) {
      setSubmitError("Bạn cần đăng nhập để bình luận.");
      return;
    }
    setSubmitError(null);
    try {
      const newComment = await createComment(
        {
          productionId,
          content: inputData.content,
          isSpoiler: inputData.isSpoiler || false,
        },
        accessToken
      );
      // Prepend mới vào đầu danh sách nếu chưa tồn tại (tránh trùng với socket)
      setComments((prev) => {
        if (prev.some(c => c.id === newComment.id)) return prev;
        return [newComment, ...prev];
      });
    } catch (err) {
      if (err?.response?.status === 401) {
        try {
          const newToken = await refreshAccessToken();
          const newCommentRetry = await createComment(
            {
              productionId,
              content: inputData.content,
              isSpoiler: inputData.isSpoiler || false,
            },
            newToken
          );
          setComments((prev) => {
            if (prev.some(c => c.id === newCommentRetry.id)) return prev;
            return [newCommentRetry, ...prev];
          });
          return;
        } catch (refreshErr) {
          setSubmitError("Phiên đăng nhập đã hết hạn. Vui lòng tải lại trang.");
          return;
        }
      }

      const msg = err?.response?.data?.message || "Gửi bình luận thất bại.";
      setSubmitError(msg);
      console.error("createComment error:", err);
    }
  };

  // ── Render ────────────────────────────────────────────
  return (
    <div className="text-white pt-6">
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-xl font-bold text-white">Bình luận</h2>
        <span className="bg-[#1a1c22] text-gray-300 px-3 py-1 rounded-full text-xs font-mono border border-gray-700">
          {comments.length}{nextCursor ? "+" : ""}
        </span>
      </div>

      {/* INPUT — chỉ hiện nếu đã login */}
      {isAuthenticated ? (
        <CommentInput
          currentUser={user}
          onSubmit={handleNewComment}
        />
      ) : (
        <div className="bg-[#1a1c22] border border-gray-700 rounded-xl p-4 text-center text-gray-400 text-sm mb-4">
          <span>Vui lòng </span>
          <a href="/login" className="text-yellow-400 hover:underline font-medium">đăng nhập</a>
          <span> để bình luận.</span>
        </div>
      )}

      {/* Submit error */}
      {submitError && (
        <div className="mt-2 text-red-400 text-sm bg-red-900/20 border border-red-800 rounded-lg px-4 py-2">
          {submitError}
        </div>
      )}

      {/* COMMENT LIST */}
      <div className="flex flex-col gap-2 mt-4">
        {loading && (
          <div className="text-center text-gray-500 py-8 animate-pulse">
            Đang tải bình luận...
          </div>
        )}

        {error && !loading && (
          <div className="text-center text-red-400 py-6">
            {error}
            <button
              onClick={fetchComments}
              className="ml-2 text-yellow-400 underline text-sm"
            >
              Thử lại
            </button>
          </div>
        )}

        {!loading && !error && comments.map((comment) => (
          <CommentItem
            key={comment.id}
            data={comment}
            productionId={productionId}
            accessToken={accessToken}
            currentUserId={user?.id}
          />
        ))}

        {/* EMPTY STATE */}
        {!loading && !error && comments.length === 0 && (
          <div className="text-center text-gray-500 py-10">
            Chưa có bình luận nào. Hãy là người đầu tiên!
          </div>
        )}
      </div>

      {/* LOAD MORE */}
      {nextCursor && !loading && (
        <div className="text-center mt-6">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="px-6 py-2 rounded-lg bg-[#1a1c22] border border-gray-700 text-gray-300 text-sm hover:border-yellow-500 hover:text-yellow-400 transition-all disabled:opacity-50"
          >
            {loadingMore ? "Đang tải..." : "Xem thêm bình luận"}
          </button>
        </div>
      )}
    </div>
  );
};

export default CommentSection;
