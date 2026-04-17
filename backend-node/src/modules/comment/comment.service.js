import prisma from "../../core/database/prisma.js";
import { getIO } from "../../core/sockets/socketManager.js";

// ─── Constants ───────────────────────────────────────────────────────
const MAX_DEPTH = 2; // 0 = root, 1 = reply, 2 = deepest allowed
const ROOT_PAGE_SIZE = 15;
const REPLY_PAGE_SIZE = 10;

// ─── Helpers ─────────────────────────────────────────────────────────

/** Resolve the actual parent_id to keep max depth = 2 */
async function resolveParentId(parentId) {
  if (!parentId) return null;

  const parent = await prisma.comments.findUnique({
    where: { id: parentId },
    select: { id: true, parent_id: true, users: { select: { username: true } } },
  });

  if (!parent) throw new Error("Parent comment not found");

  // parent is root (depth 0) → reply goes to depth 1 → OK
  if (!parent.parent_id) return { parentId: parent.id, mentionUsername: null };

  // parent is depth 1 → reply should flatten to depth 2 (same parent)
  // Since we cap at depth 2, any deeper reply is also flattened to depth 1's parent
  // Actually: we keep replies as children of the depth-1 comment, but if that depth-1
  // comment itself is a child, we flatten. Let's determine depth properly.
  const grandParent = await prisma.comments.findUnique({
    where: { id: parent.parent_id },
    select: { parent_id: true },
  });

  if (!grandParent) return { parentId: parent.id, mentionUsername: null };

  // If grandParent has no parent → parent is depth 1 → replying creates depth 2 → OK
  if (!grandParent.parent_id) return { parentId: parent.id, mentionUsername: null };

  // grandParent is depth 2+ → flatten: attach to grandParent and prepend @username
  return {
    parentId: parent.parent_id,
    mentionUsername: parent.users.username,
  };
}

/** Shape a comment row for API response */
function formatComment(c, currentUserId = null, overrideReplyCount = null) {
  return {
    id: c.id,
    content: c.content,
    is_spoiler: c.is_spoiler ?? false,
    is_edited: c.created_at?.getTime() !== c.updated_at?.getTime(),
    status: c.status,
    likes_count: c.likes_count ?? 0,
    dislikes_count: c.dislikes_count ?? 0,
    parent_id: c.parent_id,
    production_id: c.production_id,
    episode_id: c.episode_id,
    created_at: c.created_at,
    updated_at: c.updated_at,
    user: c.users
      ? {
          id: c.users.id,
          username: c.users.username,
          avatar_url: c.users.avatar_url,
        }
      : null,
    reply_count: overrideReplyCount !== null ? overrideReplyCount : (c._count?.other_comments ?? 0),
    // Current user's reaction on this comment (null if not logged in)
    my_reaction: c.comment_reactions?.[0]?.type ?? null,
  };
}

// ─── Service ─────────────────────────────────────────────────────────

export const commentService = {
  // ────────────── GET root comments (cursor-based) ──────────────
  async getRootComments(productionId, { cursor, limit = ROOT_PAGE_SIZE, userId = null }) {
    const take = Math.min(limit, 50); // clamp

    const where = {
      production_id: productionId,
      parent_id: null,
    };

    const comments = await prisma.comments.findMany({
      where,
      take: take + 1, // fetch one extra to know if there's a next page
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1, // skip the cursor itself
      }),
      orderBy: { id: "desc" }, // newest first
      include: {
        users: { select: { id: true, username: true, avatar_url: true } },
        _count: { select: { other_comments: true } },
        // Lấy thêm số lượng cháu (depth 2) để tính tổng
        other_comments: {
          select: {
            _count: { select: { other_comments: true } }
          }
        },
        ...(userId && {
          comment_reactions: {
            where: { user_id: userId },
            select: { type: true },
            take: 1,
          },
        }),
      },
    });

    const hasMore = comments.length > take;
    if (hasMore) comments.pop();

    return {
      comments: comments.map((c) => {
        const directChildren = c._count?.other_comments ?? 0;
        const grandChildren = c.other_comments?.reduce((sum, child) => sum + (child._count?.other_comments ?? 0), 0) ?? 0;
        return formatComment(c, userId, directChildren + grandChildren);
      }),
      nextCursor: hasMore ? comments[comments.length - 1].id : null,
    };
  },

  // ────────────── GET replies (cursor-based) ──────────────
  async getReplies(parentId, { cursor, limit = REPLY_PAGE_SIZE, userId = null }) {
    const take = Math.min(limit, 50);

    const comments = await prisma.comments.findMany({
      where: { parent_id: parentId },
      take: take + 1,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
      orderBy: { id: "asc" }, // oldest first for replies
      include: {
        users: { select: { id: true, username: true, avatar_url: true } },
        _count: { select: { other_comments: true } },
        ...(userId && {
          comment_reactions: {
            where: { user_id: userId },
            select: { type: true },
            take: 1,
          },
        }),
      },
    });

    const hasMore = comments.length > take;
    if (hasMore) comments.pop();

    return {
      replies: comments.map((c) => formatComment(c, userId)),
      nextCursor: hasMore ? comments[comments.length - 1].id : null,
    };
  },

  // ────────────── CREATE comment ──────────────
  async createComment({ userId, productionId, episodeId, content, parentId, isSpoiler, rating }) {
    // 1. Resolve depth & flatten if needed
    const resolved = await resolveParentId(parentId);
    const actualParentId = resolved?.parentId ?? null;
    let finalContent = content;
    if (resolved?.mentionUsername) {
      finalContent = `@${resolved.mentionUsername} ${content}`;
    }

    // 2. Create comment
    const comment = await prisma.comments.create({
      data: {
        user_id: userId,
        production_id: productionId,
        episode_id: episodeId || null,
        content: finalContent,
        parent_id: actualParentId,
        is_spoiler: isSpoiler ?? false,
      },
      include: {
        users: { select: { id: true, username: true, avatar_url: true } },
        _count: { select: { other_comments: true } },
      },
    });

    // 3. Upsert rating (independent from comment)
    if (rating && rating >= 1 && rating <= 10) {
      await prisma.ratings.upsert({
        where: {
          user_id_production_id: {
            user_id: userId,
            production_id: productionId,
          },
        },
        create: {
          user_id: userId,
          production_id: productionId,
          rating,
        },
        update: {
          rating,
        },
      });

      // Recalculate avg rating
      const agg = await prisma.ratings.aggregate({
        where: { production_id: productionId },
        _avg: { rating: true },
        _count: { rating: true },
      });

      await prisma.productions.update({
        where: { id: productionId },
        data: {
          rating_avg: agg._avg.rating ? Math.round(agg._avg.rating * 10) / 10 : 0,
          rating_count: agg._count.rating,
        },
      });
    }

    // Tính toán mảng các id tổ tiên để báo cho UI biết
    let ancestor_ids = [];
    if (actualParentId) {
      ancestor_ids.push(actualParentId);
      const parent = await prisma.comments.findUnique({
        where: { id: actualParentId },
        select: { parent_id: true }
      });
      if (parent?.parent_id) {
        ancestor_ids.push(parent.parent_id);
      }
    }
    const formattedComment = formatComment(comment);
    formattedComment.ancestor_ids = ancestor_ids;
    
    // Phát event realtime
    try {
      const io = getIO();
      const room = `production_${productionId}`;
      if (actualParentId) {
        io.to(room).emit("new_reply", formattedComment);
      } else {
        io.to(room).emit("new_comment", formattedComment);
      }
    } catch (e) {
      console.error("Socket emit error:", e);
    }

    return formattedComment;
  },

  // ────────────── UPDATE comment ──────────────
  async updateComment(commentId, userId, { content, isSpoiler }) {
    const existing = await prisma.comments.findUnique({ where: { id: commentId } });
    if (!existing) throw new Error("Comment not found");
    if (existing.user_id !== userId) throw new Error("Unauthorized");
    if (existing.status === "deleted") throw new Error("Cannot edit a deleted comment");

    const comment = await prisma.comments.update({
      where: { id: commentId },
      data: {
        content,
        is_spoiler: isSpoiler ?? existing.is_spoiler,
        updated_at: new Date(),
      },
      include: {
        users: { select: { id: true, username: true, avatar_url: true } },
        _count: { select: { other_comments: true } },
      },
    });

    return formatComment(comment);
  },

  // ────────────── DELETE comment (soft) ──────────────
  async deleteComment(commentId, userId, userRole) {
    const existing = await prisma.comments.findUnique({ where: { id: commentId } });
    if (!existing) throw new Error("Comment not found");
    if (existing.user_id !== userId && userRole !== "admin") {
      throw new Error("Unauthorized");
    }

    await prisma.comments.update({
      where: { id: commentId },
      data: {
        content: "Bình luận đã bị xóa",
        status: "deleted",
        is_spoiler: false,
        updated_at: new Date(),
      },
    });

    return { id: commentId, status: "deleted" };
  },

  // ────────────── REACTION (like / dislike) ──────────────
  async toggleReaction(commentId, userId, reactType) {
    if (!["LIKE", "DISLIKE"].includes(reactType)) {
      throw new Error("Invalid reaction type");
    }

    const comment = await prisma.comments.findUnique({ where: { id: commentId } });
    if (!comment) throw new Error("Comment not found");

    const existing = await prisma.comment_reactions.findUnique({
      where: { user_id_comment_id: { user_id: userId, comment_id: commentId } },
    });

    // Use a transaction for atomic counter updates
    return await prisma.$transaction(async (tx) => {
      if (existing) {
        if (existing.type === reactType) {
          // Same reaction → remove it (toggle off)
          await tx.comment_reactions.delete({
            where: { user_id_comment_id: { user_id: userId, comment_id: commentId } },
          });

          const decField = reactType === "LIKE" ? "likes_count" : "dislikes_count";
          await tx.comments.update({
            where: { id: commentId },
            data: { [decField]: { decrement: 1 } },
          });

          return { action: "removed", type: reactType };
        } else {
          // Different reaction → switch
          await tx.comment_reactions.update({
            where: { user_id_comment_id: { user_id: userId, comment_id: commentId } },
            data: { type: reactType },
          });

          const incField = reactType === "LIKE" ? "likes_count" : "dislikes_count";
          const decField = reactType === "LIKE" ? "dislikes_count" : "likes_count";
          await tx.comments.update({
            where: { id: commentId },
            data: {
              [incField]: { increment: 1 },
              [decField]: { decrement: 1 },
            },
          });

          return { action: "switched", type: reactType };
        }
      } else {
        // New reaction
        await tx.comment_reactions.create({
          data: { user_id: userId, comment_id: commentId, type: reactType },
        });

        const incField = reactType === "LIKE" ? "likes_count" : "dislikes_count";
        await tx.comments.update({
          where: { id: commentId },
          data: { [incField]: { increment: 1 } },
        });

        return { action: "added", type: reactType };
      }
    });
  },
};
