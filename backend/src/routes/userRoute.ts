import { Router, type Router as RouterType } from "express";
import { searchUsers, getUserById } from "../controllers/userController.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router: RouterType = Router();

// CHAINING LAYERS:
// Path ("/") -> Middleware (requireAuth) -> Controller (createPost)
router.get("/search", requireAuth, searchUsers);
router.get("/:id", requireAuth, getUserById);

export default router;