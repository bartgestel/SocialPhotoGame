import { Router, type Router as RouterType } from "express";
import { getCommentsForPicture, addCommentToPicture } from "../controllers/commentController.js";
import { optionalAuth } from "../middleware/requireAuth.js";

const router: RouterType = Router();

// Get comments for a picture (public - anyone with pictureId can view)
router.get("/:pictureId", getCommentsForPicture);

// Add comment to a picture (allows both authenticated and anonymous users)
router.post("/:pictureId", optionalAuth, addCommentToPicture);

export default router;
