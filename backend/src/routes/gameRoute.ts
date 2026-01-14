import { Router, type Router as RouterType } from "express";
import { startGame, verifyGame, getActiveGames } from "../controllers/gameController.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router: RouterType = Router();

// CHAINING LAYERS:
// Path ("/") -> Middleware (requireAuth) -> Controller (createPost)
router.post("/start", startGame);
router.post("/verify", verifyGame);
router.get("/active", getActiveGames);

export default router;