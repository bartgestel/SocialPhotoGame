import type { Request, Response } from "express";
import { db } from "../config/db.js";
import { games, pictures, pictureRecipients, unlockAttempts, user } from "../db/models/schema.js";
import { eq, and, sql } from "drizzle-orm";
import crypto from "crypto";

const SECRET_KEY = process.env.GAME_SECRET_KEY || "A64814991BEEC14ED7747FE2E1AFD";
const activeSessions = new Map<string, { gameId: string, shareToken?: string, recipientRecordId?: string }>();

export const startGame = async(req: Request, res: Response) => {
    const { gameId, shareToken, anonymousId } = req.body;
    
    // If shareToken is provided, this is for unlocking a picture
    let pictureData = null;
    let recipientRecordId = null;
    
    if (shareToken) {
        // Find the picture by share token
        const picture = await db
            .select()
            .from(pictures)
            .where(eq(pictures.shareToken, shareToken))
            .limit(1);

        if (!picture || picture.length === 0) {
            return res.status(404).json({ error: "Picture not found or link expired" });
        }

        pictureData = picture[0];

        // Check if expired
        if (pictureData.expiresAt && new Date() > new Date(pictureData.expiresAt)) {
            return res.status(410).json({ error: "This picture has expired" });
        }

        // Check if max unlocks reached (0 means unlimited)
        if (pictureData.maxUnlocks > 0 && pictureData.currentUnlocks >= pictureData.maxUnlocks) {
            return res.status(403).json({ error: "Maximum unlocks reached for this picture" });
        }

        // Generate or use provided anonymous identifier
        const recipientIdentifier = anonymousId || crypto.randomBytes(16).toString("hex");

        // Check if this anonymous user already unlocked it
        const existingRecipient = await db
            .select()
            .from(pictureRecipients)
            .where(
                and(
                    eq(pictureRecipients.pictureId, pictureData.pictureId),
                    eq(pictureRecipients.recipientIdentifier, recipientIdentifier)
                )
            )
            .limit(1);

        if (existingRecipient.length > 0) {
            recipientRecordId = existingRecipient[0].recipientRecordId;

            // If already unlocked, return the picture immediately
            if (existingRecipient[0].status === 'UNLOCKED' || existingRecipient[0].status === 'VIEWED') {
                const unlockedPicture = await db
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
                    .where(eq(pictures.pictureId, pictureData.pictureId))
                    .limit(1);

                return res.status(200).json({
                    alreadyUnlocked: true,
                    picture: {
                        pictureId: unlockedPicture[0].picture.pictureId,
                        mediaUrl: unlockedPicture[0].picture.mediaUrl,
                        mediaType: unlockedPicture[0].picture.mediaType,
                        createdAt: unlockedPicture[0].picture.createdAt,
                        sender: unlockedPicture[0].sender,
                        unlockedAt: existingRecipient[0].openedAt
                    },
                    anonymousId: recipientIdentifier
                });
            }
        } else {
            // Create new recipient record
            recipientRecordId = crypto.randomBytes(16).toString("hex");
            await db.insert(pictureRecipients).values({
                recipientRecordId,
                pictureId: pictureData.pictureId,
                receiverId: null, // Anonymous
                recipientIdentifier,
                status: 'LOCKED'
            });
        }

        // Use the game ID from the picture
        const gameIdToUse = pictureData.requiredGameId;
        if (!gameIdToUse) {
            return res.status(400).json({ error: "No game configured for this picture" });
        }

        const game = await db.select().from(games).where(eq(games.gameId, gameIdToUse)).limit(1);

        if (!game || game.length === 0) {
            return res.status(404).json({ error: "Game not found" });
        }

        const sessionId = crypto.randomBytes(16).toString("hex");
        const gameIdStr = String(game[0].gameId);
        // Use assetBundleUrl from database, fallback to game name if not set
        const unityScene = game[0].assetBundleUrl || game[0].name;

        activeSessions.set(sessionId, { 
            gameId: gameIdStr, 
            shareToken,
            recipientRecordId 
        });

        // Create unlock attempt record
        const attemptId = crypto.randomBytes(16).toString("hex");
        await db.insert(unlockAttempts).values({
            attemptId,
            recipientRecordId,
            startedAt: new Date()
        });

        return res.status(200).json({ 
            sessionId, 
            unityScene,
            gameId: gameIdStr,
            pictureId: pictureData.pictureId,
            gameData: game[0],
            attemptId,
            anonymousId: recipientIdentifier
        });
    }
    
    // Standard game mode (no picture unlock)
    const gameIdNumber = Number(gameId);
    const queryCondition = isNaN(gameIdNumber) ? eq(games.name, gameId) : eq(games.gameId, gameIdNumber);
    const game = await db.select().from(games).where(queryCondition).limit(1);

    if(!game || game.length === 0) {
        return res.status(404).json({ error: "Game not found" });
    }

    const sessionId = crypto.randomBytes(16).toString("hex");
    const gameIdStr = String(game[0]?.gameId);
    // Use assetBundleUrl from database, fallback to game name if not set
    const unityScene = game[0]?.assetBundleUrl || game[0]?.name;

    activeSessions.set(sessionId, { gameId: gameIdStr });

    res.status(200).json({ 
        sessionId, 
        unityScene,
        gameId: String(game[0]?.gameId),
        gameData: game[0] 
    });
}

export const verifyGame = async(req: Request, res: Response) => {
    const { sessionId, signature, score } = req.body;

    const sessionData = activeSessions.get(sessionId);

    if(!sessionData) {
        return res.status(403).json({ error: "Invalid session" });
    }

    const { gameId: expectedGameId, shareToken, recipientRecordId } = sessionData;

    const game = await db.select().from(games).where(eq(games.gameId, Number(expectedGameId))).limit(1);

    if(!game || game.length === 0) {
        return res.status(404).json({ error: "Game not found" });
    }

    const payloadString = `${sessionId}:${expectedGameId}:WIN`;
    const expectedSignature = crypto.createHmac("sha256", SECRET_KEY).update(payloadString).digest("hex");

    if(signature === expectedSignature) {
        activeSessions.delete(sessionId);
        
        // If this was a picture unlock game
        if (shareToken && recipientRecordId) {
            // Update the unlock attempt as successful
            await db
                .update(unlockAttempts)
                .set({
                    isSuccessful: true,
                    scoreAchieved: score || 0,
                    completedAt: new Date()
                })
                .where(eq(unlockAttempts.recipientRecordId, recipientRecordId));

            // Unlock the picture
            await db
                .update(pictureRecipients)
                .set({
                    status: 'UNLOCKED',
                    openedAt: new Date()
                })
                .where(eq(pictureRecipients.recipientRecordId, recipientRecordId));

            // Increment unlock counter
            await db
                .update(pictures)
                .set({
                    currentUnlocks: sql`${pictures.currentUnlocks} + 1`
                })
                .where(eq(pictures.shareToken, shareToken));

            // Fetch the picture data with sender info
            const pictureData = await db
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

            if (pictureData.length === 0) {
                return res.status(404).json({ error: "Picture not found" });
            }

            const unlockedPicture = pictureData[0];

            return res.status(200).json({ 
                success: true, 
                pictureUnlocked: true,
                message: "Picture unlocked!",
                picture: {
                    pictureId: unlockedPicture.picture.pictureId,
                    mediaUrl: unlockedPicture.picture.mediaUrl,
                    mediaType: unlockedPicture.picture.mediaType,
                    createdAt: unlockedPicture.picture.createdAt,
                    sender: unlockedPicture.sender,
                }
            });
        }
        
        // Standard game completion (no picture)
        return res.status(200).json({ success: true, rewardData: "Test reward" });
    } else {
        // Failed attempt
        if (recipientRecordId) {
            await db
                .update(unlockAttempts)
                .set({
                    isSuccessful: false,
                    scoreAchieved: score || 0,
                    completedAt: new Date()
                })
                .where(eq(unlockAttempts.recipientRecordId, recipientRecordId));
        }
        
        return res.status(403).json({ error: "Verification failed" });
    }
}

export const getActiveGames = async(req: Request, res: Response) => {
    const activeGames = await db
        .select()
        .from(games)
        .where(eq(games.isActive, true));

    // Group games by name and collect their difficulties
    const gameMap = new Map<string, {
        name: string;
        description: string | null;
        difficulties: Array<{
            level: string;
            gameId: number;
            assetBundleUrl: string | null;
            hasPieces: boolean;
            gridSize: number;
        }>;
    }>();

    activeGames.forEach(game => {
        if (!gameMap.has(game.name)) {
            gameMap.set(game.name, {
                name: game.name,
                description: game.description,
                difficulties: []
            });
        }
        
        gameMap.get(game.name)!.difficulties.push({
            level: game.difficultyLevel || 'EASY',
            gameId: game.gameId,
            assetBundleUrl: game.assetBundleUrl,
            hasPieces: game.hasPieces || false,
            gridSize: game.gridSize || 0
        });
    });

    // Convert map to array and sort difficulties
    const groupedGames = Array.from(gameMap.values()).map(game => ({
        ...game,
        difficulties: game.difficulties.sort((a, b) => {
            const order = { 'EASY': 1, 'MEDIUM': 2, 'HARD': 3, 'EXPERT': 4 };
            return (order[a.level as keyof typeof order] || 99) - (order[b.level as keyof typeof order] || 99);
        })
    }));

    res.status(200).json({ games: groupedGames });
}   