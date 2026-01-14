import { Router, type Router as RouterType } from "express";
import { addFriend, getFriends, getFriendRequests, respondToFriendRequest } from "../controllers/friendController.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router: RouterType = Router();

// CHAINING LAYERS:
// Path ("/") -> Middleware (requireAuth) -> Controller (createPost)
router.post("/add", requireAuth, addFriend);
router.get("/", requireAuth, getFriends);
router.get("/requests", requireAuth, getFriendRequests);
router.post("/respond", requireAuth, respondToFriendRequest);

export default router;