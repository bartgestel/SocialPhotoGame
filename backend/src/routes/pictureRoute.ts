import { Router, type Router as RouterType } from "express";
import multer from "multer";
import path from "path";
import crypto from "crypto";
import { 
    uploadPicture, 
    getPictureByToken, 
    getPictureMedia,
    getMyPictures,
    getPictureById,
    getPicturePieces
} from "../controllers/pictureController.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router: RouterType = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = crypto.randomBytes(16).toString('hex');
        const ext = path.extname(file.originalname);
        cb(null, `${uniqueSuffix}${ext}`);
    }
});

const upload = multer({ 
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept images and videos
        if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image and video files are allowed'));
        }
    }
});

// Upload picture (requires authentication)
router.post("/upload", requireAuth, upload.single('picture'), uploadPicture);

// Get user's uploaded pictures (requires authentication)
router.get("/my-pictures", requireAuth, getMyPictures);

// Get picture by share token (public)
router.get("/token/:shareToken", getPictureByToken);

// Get picture by ID
router.get("/id/:pictureId", getPictureById);

// Get picture media file (public, but checks unlock status)
router.get("/:pictureId/media/:anonymousId", getPictureMedia);

// Get all picture pieces (public)
router.get("/:pictureId/pieces", getPicturePieces);

export default router;
