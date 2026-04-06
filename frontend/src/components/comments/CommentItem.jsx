import React, { useState } from "react";
import {
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Star,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import CommentInput from "./CommentInput"; // Đảm bảo bạn đã có file này

const CommentItem = ({ data, userMap }) => {
  // --- 1. TRA CỨU THÔNG TIN NGƯỜI DÙNG ---
  // Dùng authorId từ data để lấy thông tin chi tiết từ userMap
  const author = userMap[data.authorId] || {
    name: "Anonymous",
    avatar: "https://ui-avatars.com/api/?name=Hidden&background=333",
    roles: [],
    profileUrl: "#",
  };

  // Destructuring dữ liệu để code gọn hơn
  const { content, time, stats, replies } = data;

  // --- 2. LOCAL STATE (TRẠNG THÁI NỘI BỘ) ---

  // Quản lý ẩn/hiện Spoil (Nếu isSpoiler = true thì mặc định ẩn)
  const [isContentVisible, setIsContentVisible] = useState(!content.isSpoiler);

  // Quản lý khung trả lời
  const [isReplying, setIsReplying] = useState(false);
  const [showReplies, setShowReplies] = useState(false);

  // Quản lý tương tác (Like/Dislike) - Giả lập Client-side
  const [interaction, setInteraction] = useState(data.interaction);
  const [likesCount, setLikesCount] = useState(stats.likes);
  const [dislikesCount, setDislikesCount] = useState(stats.dislikes);

  // --- 3. XỬ LÝ SỰ KIỆN ---

  const handleLike = () => {
    if (interaction.hasLiked) {
      // Đang like -> Bỏ like
      setInteraction({ ...interaction, hasLiked: false });
      setLikesCount((prev) => prev - 1);
    } else {
      // Chưa like -> Like (Nếu đang dislike thì bỏ dislike luôn)
      setInteraction({ hasLiked: true, hasDisliked: false });
      setLikesCount((prev) => prev + 1);
      if (interaction.hasDisliked) setDislikesCount((prev) => prev - 1);
    }
    // TODO: Gọi API cập nhật like
  };

  const handleDislike = () => {
    if (interaction.hasDisliked) {
      setInteraction({ ...interaction, hasDisliked: false });
      setDislikesCount((prev) => prev - 1);
    } else {
      setInteraction({ hasLiked: false, hasDisliked: true });
      setDislikesCount((prev) => prev + 1);
      if (interaction.hasLiked) setLikesCount((prev) => prev - 1);
    }
  };

  const handleSubmitReply = (replyInput) => {
    console.log("Gửi trả lời cho comment:", data.id, replyInput);
    setIsReplying(false);
    setShowReplies(true);
    // TODO: Gọi API thêm comment con
  };

  return (
    <div className="flex gap-3 sm:gap-4 p-4 border-b border-gray-800/50 hover:bg-white/[0.02] transition-colors rounded-lg group animate-in fade-in duration-300">
      {/* --- AVATAR --- */}
      <div className="flex-shrink-0">
        <a
          href={author.profileUrl}
          className="block relative hover:opacity-80 transition-opacity"
        >
          <img
            src={author.avatar}
            alt={author.name}
            className="w-10 h-10 rounded-full object-cover border border-gray-700"
          />
        </a>
      </div>

      {/* --- NỘI DUNG CHÍNH --- */}
      <div className="flex-1 min-w-0">
        {/* HEADER: Tên + Badge + Thời gian + Tag Tập */}
        <div className="flex flex-wrap items-center gap-2 mb-1.5">
          <span className="font-bold text-white text-sm hover:text-blue-400 cursor-pointer transition-colors">
            {author.name}
          </span>

          {/* Badge VIP/Admin */}
          {author.roles.includes("vip") && (
            <span className="text-yellow-500 text-xs" title="VIP Member">
              ♾️
            </span>
          )}

          <span className="text-gray-500 text-xs">• {time}</span>

          {/* Tag Tập Phim (Nếu có) */}
          {content.episodeTag && (
            <span className="bg-gray-800 text-gray-300 text-[10px] px-2 py-0.5 rounded border border-gray-700 ml-auto sm:ml-0 font-medium">
              {content.episodeTag}
            </span>
          )}
        </div>

        {/* BODY: Rating + Text + Spoil */}
        <div className="mb-2">
          {/* Hiển thị Sao đánh giá (Nếu rating khác null) */}
          {content.rating && (
            <div className="flex items-center gap-0.5 mb-1.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  className={
                    i < content.rating
                      ? "fill-yellow-500 text-yellow-500"
                      : "text-gray-700"
                  }
                />
              ))}
            </div>
          )}

          {/* Nội dung Text (Có xử lý Spoil) */}
          <div className="relative group/spoil">
            <p
              className={`text-gray-300 text-sm leading-relaxed whitespace-pre-line transition-all duration-300
                ${!isContentVisible ? "blur-sm select-none opacity-50" : ""}
              `}
            >
              {content.text}
            </p>

            {/* Nút bấm hiện Spoil */}
            {!isContentVisible && (
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={() => setIsContentVisible(true)}
                  className="bg-gray-800/90 hover:bg-red-900/80 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg transition-all transform hover:scale-105 backdrop-blur-sm flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  Spoiler — Click to reveal
                </button>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER: Actions (Like/Dislike/Reply) */}
        <div className="flex items-center gap-4 text-gray-400 text-xs font-medium select-none">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 transition-colors group/like ${interaction.hasLiked ? "text-blue-500" : "hover:text-white"}`}
          >
            <ThumbsUp
              size={14}
              className={`transition-transform group-active/like:scale-75 ${interaction.hasLiked ? "fill-blue-500" : ""}`}
            />
            <span>{likesCount > 0 ? likesCount : "Like"}</span>
          </button>

          <button
            onClick={handleDislike}
            className={`flex items-center gap-1.5 transition-colors group/dislike ${interaction.hasDisliked ? "text-red-500" : "hover:text-white"}`}
          >
            <ThumbsDown
              size={14}
              className={`transition-transform group-active/dislike:scale-75 ${interaction.hasDisliked ? "fill-red-500" : ""}`}
            />
            <span>{dislikesCount > 0 ? dislikesCount : ""}</span>
          </button>

          <button
            onClick={() => setIsReplying(!isReplying)}
            className={`flex items-center gap-1.5 hover:text-white transition-colors ${isReplying ? "text-blue-400" : ""}`}
          >
            <MessageSquare size={14} />
            <span>Reply</span>
          </button>

          <button className="ml-auto hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreHorizontal size={16} />
          </button>
        </div>

        {/* --- KHUNG NHẬP TRẢ LỜI --- */}
        {isReplying && (
          <div className="mt-3 ml-2 pl-3 border-l-2 border-gray-800">
            <CommentInput
              currentUser={userMap["current_user"]} // Lấy user hiện tại từ Map
              onSubmit={handleSubmitReply}
              // Có thể thêm prop placeholder để tùy biến
            />
          </div>
        )}

        {/* --- DANH SÁCH REPLY (Recursive) --- */}
        {replies && replies.length > 0 && (
          <div className="mt-3">
            {!showReplies ? (
              <button
                onClick={() => setShowReplies(true)}
                className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 font-semibold pl-2 border-l-2 border-transparent hover:border-gray-700 transition-all"
              >
                <div className="w-4 h-[1px] bg-gray-600"></div>
                View {replies.length} {replies.length === 1 ? "reply" : "replies"} <ChevronDown size={14} />
              </button>
            ) : (
              <div className="pl-4 border-l-2 border-gray-800 space-y-4 pt-2">
                {replies.map((reply) => (
                  // QUAN TRỌNG: Gọi đệ quy và truyền userMap xuống dưới
                  <CommentItem key={reply.id} data={reply} userMap={userMap} />
                ))}

                <button
                  onClick={() => setShowReplies(false)}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-white mt-2 pb-2"
                >
                  <ChevronUp size={12} /> Collapse
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentItem;
