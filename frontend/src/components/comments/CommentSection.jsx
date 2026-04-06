import React, { useState } from "react";
import { USERS, COMMENTS } from "../../utils/MockData";
import CommentInput from "./CommentInput";
import CommentItem from "./CommentItem";

const CommentSection = () => {
  const [comments, setComments] = useState(COMMENTS);
  const currentUser = USERS["current_user"];

  // One-rating-per-user: track if current user has submitted a rated comment
  const [hasRated, setHasRated] = useState(false);
  const [savedRating, setSavedRating] = useState(0);

  const handleNewComment = (inputData) => {
    // inputData = { content, rating } from CommentInput
    const newComment = {
      id: Date.now(),
      authorId: currentUser.id,
      content: {
        text: inputData.content,
        rating: inputData.rating,
        isSpoiler: false,
        episodeTag: null,
      },
      time: "Just now",
      stats: { likes: 0, dislikes: 0, repliesCount: 0 },
      interaction: { hasLiked: false, hasDisliked: false },
      replies: [],
    };

    setComments([newComment, ...comments]);

    // Lock rating after first rated submission
    if (inputData.rating > 0 && !hasRated) {
      setHasRated(true);
      setSavedRating(inputData.rating);
    }
  };

  return (
    <div className="text-white pt-6">
      <div>
        {/* HEADER */}
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-xl font-bold text-white">Comments</h2>
          <span className="bg-[#1a1c22] text-gray-300 px-3 py-1 rounded-full text-xs font-mono border border-gray-700">
            {comments.length}
          </span>
        </div>

        {/* INPUT (stars now live inside action bar) */}
        <CommentInput
          currentUser={currentUser}
          onSubmit={handleNewComment}
          hasRated={hasRated}
          savedRating={savedRating}
        />

        {/* COMMENT LIST */}
        <div className="flex flex-col gap-2 mt-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              data={comment}
              userMap={USERS}
            />
          ))}
        </div>

        {/* EMPTY STATE */}
        {comments.length === 0 && (
          <div className="text-center text-gray-500 py-10">
            No comments yet. Be the first to comment!
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
