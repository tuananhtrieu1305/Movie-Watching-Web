import express from "express";
import { commentController } from "./comment.controller.js";
import { requireAuth } from "../../core/middleware/auth.middleware.js";
import {
  commentRateLimit,
  duplicateCheck,
  sanitizeAndValidate,
  optionalAuth,
} from "./comment.middleware.js";

const router = express.Router();

// ─── Public (with optional auth to get user's reaction) ──────────
router.get("/:movieId/comments", optionalAuth, commentController.getRootComments);
router.get("/comments/:parentId/replies", optionalAuth, commentController.getReplies);

// ─── Protected ───────────────────────────────────────────────────
router.post(
  "/comments",
  requireAuth,
  commentRateLimit,
  sanitizeAndValidate,
  duplicateCheck,
  commentController.createComment
);

router.put(
  "/comments/:id",
  requireAuth,
  sanitizeAndValidate,
  commentController.updateComment
);

router.delete(
  "/comments/:id",
  requireAuth,
  commentController.deleteComment
);

router.post(
  "/comments/:id/reaction",
  requireAuth,
  commentController.toggleReaction
);

export default router;
