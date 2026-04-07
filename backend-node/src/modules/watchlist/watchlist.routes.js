import express from "express";
import { requireAuth } from "../../core/middleware/auth.middleware.js";
import { watchlistController } from "./watchlist.controller.js";

const router = express.Router();

router.get("/", requireAuth, watchlistController.getMyWatchlist);
router.post("/", requireAuth, watchlistController.addToWatchlist);
router.delete("/:productionId", requireAuth, watchlistController.removeFromWatchlist);
router.get("/check/:productionId", requireAuth, watchlistController.checkInWatchlist);

export default router;
