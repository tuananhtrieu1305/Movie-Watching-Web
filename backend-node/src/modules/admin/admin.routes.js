import express from "express";
import { requireAuth, requireAdmin } from "../../core/middleware/auth.middleware.js";
import { adminController } from "./admin.controller.js";

const router = express.Router();

router.use(requireAuth, requireAdmin);

router.get("/users", adminController.getUsers);
router.post("/users", adminController.createUser);
router.put("/users/:id", adminController.updateUser);
router.delete("/users/:id", adminController.deleteUser);

router.get("/transactions", adminController.getTransactions);
router.get("/subscriptions", adminController.getSubscriptions);

export default router;
