import type { Request, Response } from "express";
import { db } from "../config/db.js";
import { pictures, pictureRecipients, user } from "../db/models/schema.js";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";
import path from "path";
import fs from "fs";
import sharp from "sharp";

// Upload a picture with game lock
export const uploadPicture = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: "Authentication required" });
        }

        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const { requiredGameId, maxUnlocks, expiresInDays } = req.body;

        // Generate unique IDs
        const pictureId = crypto.randomBytes(16).toString("hex");
        const shareToken = crypto.randomBytes(16).toString("hex");

        // Calculate expiration date
        let expiresAt = null;
        if (expiresInDays && !isNaN(parseInt(expiresInDays))) {
            expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + parseInt(expiresInDays));
        }

        // Store relative path for mediaUrl
        const mediaUrl = `/uploads/${req.file.filename}`;

        // Create picture record
        await db.insert(pictures).values({
            pictureId,
            senderId: userId,
            mediaUrl,
            mediaType: req.file.mimetype.startsWith('image/') ? 'IMAGE' : 'VIDEO',
            requiredGameId: requiredGameId ? parseInt(requiredGameId) : null,
            shareToken,
            maxUnlocks: maxUnlocks ? parseInt(maxUnlocks) : 0,
            currentUnlocks: 0,
            expiresAt
        });

        // Generate shareable link
        const shareLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/unlock/${shareToken}`;

        res.status(201).json({
            pictureId,
            shareToken,
            shareLink,
            mediaUrl,
            expiresAt
        });
    } catch (error) {
        console.error("Error uploading picture:", error);
        res.status(500).json({ error: "Failed to upload picture" });
    }
};

// Get picture info by share token (public endpoint)
export const getPictureByToken = async (req: Request, res: Response) => {
    try {
        const { shareToken } = req.params;

        const picture = await db
            .select({
                picture: pictures,
                sender: {
                    id: user.id,
                    name: user.name,
                    username: user.username,
                    image: user.image
                }
            })
            .from(pictures)
            .innerJoin(user, eq(pictures.senderId, user.id))
            .where(eq(pictures.shareToken, shareToken))
            .limit(1);

        if (!picture || picture.length === 0) {
            return res.status(404).json({ error: "Picture not found" });
        }

        const pictureData = picture[0];

        // Check if expired
        if (pictureData.picture.expiresAt && new Date() > new Date(pictureData.picture.expiresAt)) {
            return res.status(410).json({ error: "This picture has expired" });
        }

        // Check if max unlocks reached
        if (pictureData.picture.maxUnlocks > 0 && pictureData.picture.currentUnlocks >= pictureData.picture.maxUnlocks) {
            return res.status(403).json({ error: "Maximum unlocks reached for this picture" });
        }

        res.status(200).json({
            pictureId: pictureData.picture.pictureId,
            requiredGameId: pictureData.picture.requiredGameId,
            sender: pictureData.sender,
            createdAt: pictureData.picture.createdAt,
            expiresAt: pictureData.picture.expiresAt,
            maxUnlocks: pictureData.picture.maxUnlocks,
            currentUnlocks: pictureData.picture.currentUnlocks
        });
    } catch (error) {
        console.error("Error fetching picture:", error);
        res.status(500).json({ error: "Failed to fetch picture" });
    }
};

// Get unlocked picture media (public, but checks unlock status)
export const getPictureMedia = async (req: Request, res: Response) => {
    try {
        const { pictureId, anonymousId } = req.params;

        // Check if this user has unlocked the picture
        const recipient = await db
            .select()
            .from(pictureRecipients)
            .where(
                and(
                    eq(pictureRecipients.pictureId, pictureId),
                    eq(pictureRecipients.recipientIdentifier, anonymousId)
                )
            )
            .limit(1);

        if (!recipient || recipient.length === 0) {
            return res.status(403).json({ error: "Picture not unlocked" });
        }

        if (recipient[0].status !== 'UNLOCKED' && recipient[0].status !== 'VIEWED') {
            return res.status(403).json({ error: "Picture is still locked. Play the game to unlock!" });
        }

        // Get picture
        const picture = await db
            .select()
            .from(pictures)
            .where(eq(pictures.pictureId, pictureId))
            .limit(1);

        if (!picture || picture.length === 0) {
            return res.status(404).json({ error: "Picture not found" });
        }

        // Mark as viewed if not already
        if (recipient[0].status === 'UNLOCKED') {
            await db
                .update(pictureRecipients)
                .set({ status: 'VIEWED' })
                .where(eq(pictureRecipients.recipientRecordId, recipient[0].recipientRecordId));
        }

        // Serve the file
        const filePath = path.join(process.cwd(), picture[0].mediaUrl);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: "Media file not found" });
        }

        res.sendFile(filePath);
    } catch (error) {
        console.error("Error serving picture media:", error);
        res.status(500).json({ error: "Failed to serve picture" });
    }
};

// Get all pictures uploaded by authenticated user
export const getMyPictures = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: "Authentication required" });
        }

        const myPictures = await db
            .select()
            .from(pictures)
            .where(eq(pictures.senderId, userId))
            .orderBy(pictures.createdAt)
            .limit(100);  // Prevent unbounded result sets

        res.status(200).json({ pictures: myPictures });
    } catch (error) {
        console.error("Error fetching user pictures:", error);
        res.status(500).json({ error: "Failed to fetch pictures" });
    }
};

export const getPicturePieces = async (req: Request, res: Response) => {
    try {
        const { pictureId } = req.params;
        const gridSize = parseInt(req.query.gridSize as string) || 3; // Default to 3x3 grid

        // Validate grid size
        if (gridSize < 2 || gridSize > 10) {
            return res.status(400).json({ error: "Grid size must be between 2 and 10" });
        }

        // Get picture
        const picture = await db
            .select()
            .from(pictures)
            .where(eq(pictures.pictureId, pictureId))
            .limit(1);

        if (!picture || picture.length === 0) {
            return res.status(404).json({ error: "Picture not found" });
        }

        const inputFilePath = path.join(process.cwd(), picture[0].mediaUrl);

        if (!fs.existsSync(inputFilePath)) {
            return res.status(404).json({ error: "Media file not found" });
        }

        // Load image and get metadata
        const image = sharp(inputFilePath);
        const metadata = await image.metadata();

        if (!metadata.width || !metadata.height) {
            return res.status(500).json({ error: "Could not read image dimensions" });
        }

        // Calculate tile dimensions
        const tileWidth = Math.floor(metadata.width / gridSize);
        const tileHeight = Math.floor(metadata.height / gridSize);

        // Create output directory for tiles
        const tilesDir = path.join(process.cwd(), 'uploads', 'tiles', pictureId, `grid-${gridSize}`);
        if (!fs.existsSync(tilesDir)) {
            fs.mkdirSync(tilesDir, { recursive: true });
        }

        // Generate all tiles and collect their paths
        const tilePaths = [];
        let count = 0;

        for (let r = 0; r < gridSize; r++) {
            for (let c = 0; c < gridSize; c++) {
                const left = c * tileWidth;
                const top = r * tileHeight;

                const tilePath = path.join(tilesDir, `tile_${count}.jpg`);

                // Only generate if doesn't exist
                if (!fs.existsSync(tilePath)) {
                    await image
                        .clone()
                        .extract({ left, top, width: tileWidth, height: tileHeight })
                        .jpeg({ quality: 90 })
                        .toFile(tilePath);
                }

                tilePaths.push(tilePath);
                count++;
            }
        }

        // Read all tiles and send as JSON with base64 data
        const tiles = await Promise.all(
            tilePaths.map(async (tilePath, index) => {
                const buffer = await fs.promises.readFile(tilePath);
                return {
                    index,
                    row: Math.floor(index / gridSize),
                    col: index % gridSize,
                    data: buffer.toString('base64')
                };
            })
        );

        res.status(200).json({
            pictureId,
            gridSize,
            totalPieces: tiles.length,
            imageWidth: metadata.width,
            imageHeight: metadata.height,
            tileWidth,
            tileHeight,
            tiles
        });

    } catch (error) {
        console.error("Error generating picture pieces:", error);
        res.status(500).json({ error: "Failed to generate picture pieces" });
    }
};
