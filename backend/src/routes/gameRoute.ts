import { Router } from "express";
import { startGame, verifyGame } from "../controllers/gameController.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

// CHAINING LAYERS:
// Path ("/") -> Middleware (requireAuth) -> Controller (createPost)
router.post("/start", startGame);
router.post("/verify", verifyGame);

export default router;