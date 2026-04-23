import { commentService } from "./comment.service.js";

export const commentController = {
  // GET /api/comment/:movieId/comments
  async getRootComments(req, res) {
    try {
      const productionId = parseInt(req.params.movieId);
      if (isNaN(productionId)) {
        return res.status(400).json({ message: "Invalid movie ID" });
      }

      const cursor = req.query.cursor ? parseInt(req.query.cursor) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
      const userId = req.user?.id || null;

      const result = await commentService.getRootComments(productionId, { cursor, limit, userId });
      return res.json(result);
    } catch (error) {
      console.error("getRootComments Error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  // GET /api/comment/comments/:parentId/replies
  async getReplies(req, res) {
    try {
      const parentId = parseInt(req.params.parentId);
      if (isNaN(parentId)) {
        return res.status(400).json({ message: "Invalid parent ID" });
      }

      const cursor = req.query.cursor ? parseInt(req.query.cursor) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
      const userId = req.user?.id || null;

      const result = await commentService.getReplies(parentId, { cursor, limit, userId });
      return res.json(result);
    } catch (error) {
      console.error("getReplies Error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  // POST /api/comment/comments
  async createComment(req, res) {
    try {
      const userId = req.user.id;
      const { productionId, episodeId, content, parentId, isSpoiler, rating } = req.body;

      if (!productionId || !content) {
        return res.status(400).json({ message: "productionId and content are required" });
      }

      const comment = await commentService.createComment({
        userId,
        productionId,
        episodeId,
        content,
        parentId,
        isSpoiler,
        rating,
      });

      return res.status(201).json(comment);
    } catch (error) {
      console.error("createComment Error:", error);
      if (error.message === "Parent comment not found") {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  // PUT /api/comment/comments/:id
  async updateComment(req, res) {
    try {
      const commentId = parseInt(req.params.id);
      if (isNaN(commentId)) {
        return res.status(400).json({ message: "Invalid comment ID" });
      }

      const userId = req.user.id;
      const { content, isSpoiler } = req.body;

      if (!content) {
        return res.status(400).json({ message: "content is required" });
      }

      const comment = await commentService.updateComment(commentId, userId, { content, isSpoiler });
      return res.json(comment);
    } catch (error) {
      console.error("updateComment Error:", error);
      if (error.message === "Comment not found") {
        return res.status(404).json({ message: error.message });
      }
      if (error.message === "Unauthorized") {
        return res.status(403).json({ message: error.message });
      }
      if (error.message === "Cannot edit a deleted comment") {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  // DELETE /api/comment/comments/:id
  async deleteComment(req, res) {
    try {
      const commentId = parseInt(req.params.id);
      if (isNaN(commentId)) {
        return res.status(400).json({ message: "Invalid comment ID" });
      }

      const userId = req.user.id;
      const userRole = req.user.role;

      const result = await commentService.deleteComment(commentId, userId, userRole);
      return res.json(result);
    } catch (error) {
      console.error("deleteComment Error:", error);
      if (error.message === "Comment not found") {
        return res.status(404).json({ message: error.message });
      }
      if (error.message === "Unauthorized") {
        return res.status(403).json({ message: error.message });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  // POST /api/comment/comments/:id/reaction
  async toggleReaction(req, res) {
    try {
      const commentId = parseInt(req.params.id);
      if (isNaN(commentId)) {
        return res.status(400).json({ message: "Invalid comment ID" });
      }

      const userId = req.user.id;
      const { reactType } = req.body;

      if (!reactType) {
        return res.status(400).json({ message: "reactType is required (LIKE or DISLIKE)" });
      }

      const result = await commentService.toggleReaction(commentId, userId, reactType);
      return res.json(result);
    } catch (error) {
      console.error("toggleReaction Error:", error);
      if (error.message === "Comment not found") {
        return res.status(404).json({ message: error.message });
      }
      if (error.message === "Invalid reaction type") {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  },
};
