import { Router } from "express";
import { addFriend, getFriends, getFriendRequests, respondToFriendRequest } from "../controllers/friendController";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

// CHAINING LAYERS:
// Path ("/") -> Middleware (requireAuth) -> Controller (createPost)
router.post("/add", requireAuth, addFriend);
router.get("/", requireAuth, getFriends);
router.get("/requests", requireAuth, getFriendRequests);
router.post("/respond", requireAuth, respondToFriendRequest);

export default router;