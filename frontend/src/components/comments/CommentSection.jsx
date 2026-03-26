import React, { useState } from "react";
import { USERS, COMMENTS } from "../../utils/MockData";
import CommentInput from "./CommentInput";
import CommentItem from "./CommentItem";
const CommentSection = () => {
  // 1. STATE: Quản lý danh sách comment
  // Khởi tạo bằng dữ liệu mẫu
  const [comments, setComments] = useState(COMMENTS);

  // Lấy User hiện tại (Giả lập đang login)
  const currentUser = USERS["current_user"];

  // 2. LOGIC: Thêm comment mới
  const handleNewComment = (inputData) => {
    // inputData = { text, rating, isSpoiler } từ CommentInput gửi ra

    const newComment = {
      id: Date.now(), // Tạo ID tạm
      authorId: currentUser.id, // Link với user đang login
      content: {
        text: inputData.text,
        rating: inputData.rating,
        isSpoiler: inputData.isSpoiler,
        episodeTag: null, // Mặc định comment mới không gắn tag tập (hoặc tùy logic app)
      },
      time: "Vừa xong",
      stats: {
        likes: 0,
        dislikes: 0,
        repliesCount: 0,
      },
      interaction: {
        hasLiked: false,
        hasDisliked: false,
      },
      replies: [],
    };

    // Cập nhật State: Thêm comment mới lên đầu danh sách
    setComments([newComment, ...comments]);
  };

  return (
    <div className="bg-[#0f1014] min-h-screen text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* HEADER: Tiêu đề & Số lượng */}
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-xl font-bold text-white">Bình luận</h2>
          <span className="bg-[#1a1c22] text-gray-300 px-3 py-1 rounded-full text-xs font-mono border border-gray-700">
            {comments.length}
          </span>
        </div>

        {/* INPUT: Khu vực nhập liệu */}
        <CommentInput currentUser={currentUser} onSubmit={handleNewComment} />

        {/* LIST: Danh sách comment */}
        <div className="flex flex-col gap-2">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              data={comment}
              userMap={USERS} // Truyền User Map xuống để CommentItem tra cứu Avatar/Tên
            />
          ))}
        </div>

        {/* LOADING / EMPTY STATE (Nếu cần) */}
        {comments.length === 0 && (
          <div className="text-center text-gray-500 py-10">
            Chưa có bình luận nào. Hãy là người đầu tiên!
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
