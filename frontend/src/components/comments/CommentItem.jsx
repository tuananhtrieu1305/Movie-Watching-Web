import React, { useState, useEffect, useContext } from "react";
import {
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  Trash2,
} from "lucide-react";
import { AuthContext } from "../../modules/auth/context/AuthContext";
import { toggleReaction, getReplies, createComment, deleteComment } from "../../services/commentService";
import CommentInput from "./CommentInput";
import socket from "../../services/socket";

// ── Helper: format thời gian ─────────────────────────────────────────
function formatTime(isoString) {
  if (!isoString) return "";
  const diff = Date.now() - new Date(isoString).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (m < 1) return "Vừa xong";
  if (m < 60) return `${m} phút trước`;
  if (h < 24) return `${h} giờ trước`;
  if (d < 7) return `${d} ngày trước`;
  return new Date(isoString).toLocaleDateString("vi-VN");
}

// ── Helper: avatar fallback ──────────────────────────────────────────
function avatarSrc(url, name = "?") {
  if (url && !url.startsWith("/default")) return url;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1a1c22&color=d4a017&bold=true`;
}

// ─────────────────────────────────────────────────────────────────────
const CommentItem = ({ data, productionId, accessToken, currentUserId, depth = 0 }) => {
  const { isAuthenticated, refreshAccessToken } = useContext(AuthContext);

  // ── Author info (từ API: data.user) ─────────────────────────────
  const author = data.user || { id: null, username: "Anonymous", avatar_url: null };

  // ── Local state ──────────────────────────────────────────────────
  const [isContentVisible, setIsContentVisible] = useState(!data.is_spoiler);
  const [isReplying, setIsReplying]     = useState(false);
  const [showReplies, setShowReplies]   = useState(false);
  const [replies, setReplies]           = useState([]);
  const [replyCursor, setReplyCursor]   = useState(null);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [replyCount, setReplyCount]     = useState(data.reply_count || 0);
  const [deleted, setDeleted]           = useState(false);

  // ── Reaction state (từ API: my_reaction = "LIKE" | "DISLIKE" | null) ──
  const [myReaction, setMyReaction] = useState(data.my_reaction); // "LIKE" | "DISLIKE" | null
  const [likesCount, setLikesCount]     = useState(data.likes_count || 0);
  const [dislikesCount, setDislikesCount] = useState(data.dislikes_count || 0);

  // ── Handle Realtime Reply ───────────────────────────────────────
  useEffect(() => {
    const handleNewReply = (reply) => {
      // 1. Bình luận con trực tiếp: thêm vào đầu list
      if (reply.parent_id === data.id) {
        setReplies((prev) => {
          if (prev.some((r) => r.id === reply.id)) return prev;
          setReplyCount(c => c + 1);
          return [reply, ...prev];
        });
      } 
      // 2. Bình luận cháu chắt: chỉ cần biết để tăng số lượng tổng, không add vào view
      else if (reply.ancestor_ids && reply.ancestor_ids.includes(data.id)) {
        setReplyCount(c => c + 1);
      }
    };

    socket.on("new_reply", handleNewReply);

    return () => {
      socket.off("new_reply", handleNewReply);
    };
  }, [data.id]);

  // ── Handlers ────────────────────────────────────────────────────

  const handleReact = async (type) => {
    if (!isAuthenticated) return;
    const prev = myReaction;
    // Optimistic update
    if (prev === type) {
      // Toggle off
      setMyReaction(null);
      if (type === "LIKE") setLikesCount(c => c - 1);
      else setDislikesCount(c => c - 1);
    } else {
      setMyReaction(type);
      if (type === "LIKE") {
        setLikesCount(c => c + 1);
        if (prev === "DISLIKE") setDislikesCount(c => c - 1);
      } else {
        setDislikesCount(c => c + 1);
        if (prev === "LIKE") setLikesCount(c => c - 1);
      }
    }
    try {
      await toggleReaction(data.id, type, accessToken);
    } catch {
      // Rollback nếu lỗi
      setMyReaction(prev);
      setLikesCount(data.likes_count || 0);
      setDislikesCount(data.dislikes_count || 0);
    }
  };

  const handleLoadReplies = async () => {
    if (showReplies) { setShowReplies(false); return; }
    setLoadingReplies(true);
    try {
      const res = await getReplies(data.id, { limit: 5 }, accessToken);
      setReplies(res.replies || []);
      setReplyCursor(res.nextCursor || null);
      setShowReplies(true);
    } catch (e) {
      console.error("load replies error:", e);
    } finally {
      setLoadingReplies(false);
    }
  };

  const handleLoadMoreReplies = async () => {
    if (!replyCursor) return;
    setLoadingReplies(true);
    try {
      const res = await getReplies(data.id, { cursor: replyCursor, limit: 5 }, accessToken);
      setReplies(prev => [...prev, ...(res.replies || [])]);
      setReplyCursor(res.nextCursor || null);
    } catch (e) {
      console.error("load more replies error:", e);
    } finally {
      setLoadingReplies(false);
    }
  };

  const handleSubmitReply = async (inputData) => {
    if (!isAuthenticated) return;
    try {
      const newReply = await createComment(
        { productionId, content: inputData.content, parentId: data.id, isSpoiler: false },
        accessToken
      );
      setReplies(prev => {
        if (prev.some(r => r.id === newReply.id)) return prev;
        setReplyCount(c => c + 1);
        return [newReply, ...prev];
      });
      setIsReplying(false);
      setShowReplies(true);
    } catch (e) {
      if (e?.response?.status === 401 && refreshAccessToken) {
        try {
          const newToken = await refreshAccessToken();
          const newReplyRetry = await createComment(
            { productionId, content: inputData.content, parentId: data.id, isSpoiler: false },
            newToken
          );
          setReplies(prev => {
            if (prev.some(r => r.id === newReplyRetry.id)) return prev;
            setReplyCount(c => c + 1);
            return [newReplyRetry, ...prev];
          });
          setIsReplying(false);
          setShowReplies(true);
          return;
        } catch (retryErr) {
          alert("Phiên đăng nhập đã hết hạn. Vui lòng tải lại trang.");
          return;
        }
      }
      console.error("reply error:", e);
      alert(e?.response?.data?.message || "Gửi trả lời thất bại.");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Xoá bình luận này?")) return;
    try {
      await deleteComment(data.id, accessToken);
      setDeleted(true);
    } catch (e) {
      console.error("delete error:", e);
    }
  };

  if (deleted) return null;

  const isOwner = currentUserId && author.id === currentUserId;

  return (
    <div className={`flex gap-3 sm:gap-4 p-4 border-b border-gray-800/50 hover:bg-white/[0.02] transition-colors rounded-lg group animate-in fade-in duration-300 ${depth > 0 ? "ml-10 border-l border-gray-800 pl-4" : ""}`}>

      {/* AVATAR */}
      <div className="flex-shrink-0">
        <img
          src={avatarSrc(author.avatar_url, author.username)}
          alt={author.username}
          className="w-9 h-9 rounded-full object-cover border border-gray-700"
        />
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 min-w-0">

        {/* HEADER */}
        <div className="flex flex-wrap items-center gap-2 mb-1.5">
          <span className="font-bold text-white text-sm">
            {author.username}
          </span>
          {data.is_edited && (
            <span className="text-gray-600 text-[10px] italic">(đã chỉnh sửa)</span>
          )}
          <span className="text-gray-500 text-xs">• {formatTime(data.created_at)}</span>
        </div>

        {/* BODY: Spoiler + Content */}
        <div className="mb-2">
          {data.is_spoiler && (
            <span className="inline-block text-[10px] bg-red-900/30 text-red-400 border border-red-800/50 px-2 py-0.5 rounded mb-1.5 font-medium">
              ⚠️ Spoiler
            </span>
          )}

          <div className="relative">
            <p className={`text-gray-300 text-sm leading-relaxed whitespace-pre-line transition-all duration-300 ${!isContentVisible ? "blur-sm select-none opacity-40" : ""}`}>
              {data.content}
            </p>
            {!isContentVisible && (
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={() => setIsContentVisible(true)}
                  className="bg-gray-800/90 hover:bg-red-900/80 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg transition-all hover:scale-105 backdrop-blur-sm flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  Spoiler — Click để xem
                </button>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="flex items-center gap-4 text-gray-400 text-xs font-medium select-none">

          {/* Like */}
          <button
            onClick={() => handleReact("LIKE")}
            title={!isAuthenticated ? "Đăng nhập để thích" : ""}
            className={`flex items-center gap-1.5 transition-colors group/like ${myReaction === "LIKE" ? "text-blue-400" : "hover:text-white"} ${!isAuthenticated ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <ThumbsUp size={14} className={`transition-transform group-active/like:scale-75 ${myReaction === "LIKE" ? "fill-blue-400" : ""}`} />
            {likesCount > 0 && <span>{likesCount}</span>}
          </button>

          {/* Dislike */}
          <button
            onClick={() => handleReact("DISLIKE")}
            title={!isAuthenticated ? "Đăng nhập để dislike" : ""}
            className={`flex items-center gap-1.5 transition-colors group/dislike ${myReaction === "DISLIKE" ? "text-red-400" : "hover:text-white"} ${!isAuthenticated ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <ThumbsDown size={14} className={`transition-transform group-active/dislike:scale-75 ${myReaction === "DISLIKE" ? "fill-red-400" : ""}`} />
            {dislikesCount > 0 && <span>{dislikesCount}</span>}
          </button>

          {/* Reply */}
          {depth < 2 && (
            <button
              onClick={() => isAuthenticated && setIsReplying(!isReplying)}
              title={!isAuthenticated ? "Đăng nhập để trả lời" : ""}
              className={`flex items-center gap-1.5 hover:text-white transition-colors ${isReplying ? "text-yellow-400" : ""} ${!isAuthenticated ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <MessageSquare size={14} />
            </button>
          )}

          {/* Delete (chỉ owner) */}
          {isOwner && (
            <button
              onClick={handleDelete}
              className="flex items-center gap-1 text-gray-600 hover:text-red-400 transition-colors ml-auto opacity-0 group-hover:opacity-100"
            >
              <Trash2 size={13} />
            </button>
          )}

          {/* More */}
          {!isOwner && (
            <button className="ml-auto hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreHorizontal size={16} />
            </button>
          )}
        </div>

        {/* REPLY INPUT */}
        {isReplying && (
          <div className="mt-3 ml-2 pl-3 border-l-2 border-gray-800">
            <CommentInput onSubmit={handleSubmitReply} />
          </div>
        )}

        {/* REPLIES SECTION */}
        {replyCount > 0 && (
          <div className="mt-2">
            <button
              onClick={handleLoadReplies}
              className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 font-semibold pl-2 border-l-2 border-transparent hover:border-gray-700 transition-all"
            >
              <div className="w-4 h-[1px] bg-gray-600"></div>
              {showReplies ? (
                <><ChevronUp size={14} /> Ẩn trả lời</>
              ) : (
                <><ChevronDown size={14} /> {loadingReplies ? "Đang tải..." : `Xem ${replyCount} trả lời`}</>
              )}
            </button>

            {showReplies && (
              <div className="mt-3 space-y-1">
                {replies.map((reply) => (
                  <CommentItem
                    key={reply.id}
                    data={reply}
                    productionId={productionId}
                    accessToken={accessToken}
                    currentUserId={currentUserId}
                    depth={depth + 1}
                  />
                ))}

                {replyCursor && (
                  <button
                    onClick={handleLoadMoreReplies}
                    disabled={loadingReplies}
                    className="text-xs text-gray-500 hover:text-yellow-400 mt-2 pl-4 transition-colors disabled:opacity-50"
                  >
                    {loadingReplies ? "Đang tải..." : "Xem thêm trả lời..."}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentItem;
