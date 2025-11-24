import { Router } from "express";
import { searchUsers, getUserById } from "../controllers/userController";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

// CHAINING LAYERS:
// Path ("/") -> Middleware (requireAuth) -> Controller (createPost)
router.get("/search", requireAuth, searchUsers);
router.get("/:id", requireAuth, getUserById);

export default router;