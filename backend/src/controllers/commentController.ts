import type { Request, Response } from "express";
import { db } from "../config/db.js";
import { pictureComments, user } from "../db/models/schema.js";
import { eq, desc } from "drizzle-orm";
import crypto from "crypto";

export const getCommentsForPicture = async (req: Request, res: Response) => {
    const { pictureId } = req.params;

    try {
        const comments = await db
            .select({
                commentId: pictureComments.commentId,
                commenterId: pictureComments.commenterId,
                content: pictureComments.content,
                createdAt: pictureComments.createdAt,
                username: user.username,
            })
            .from(pictureComments)
            .innerJoin(user, eq(pictureComments.commenterId, user.id))
            .where(eq(pictureComments.pictureId, pictureId))
            .orderBy(desc(pictureComments.createdAt));

        res.status(200).json({ comments });
    } catch (error) {
        console.error("Error retrieving comments:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

export const addCommentToPicture = async (req: Request, res: Response) => {
    const { pictureId } = req.params;
    const { content, anonymousName } = req.body;
    const commenterId = req.user?.id;

    if (!content || content.trim() === "") {
        return res.status(400).json({ error: "Comment content cannot be empty" });
    }

    try {
        let finalCommenterId = commenterId;
        let username: string | null = null;

        if (commenterId) {
            // Authenticated user - get their username
            const userRecord = await db
                .select({ username: user.username, name: user.name })
                .from(user)
                .where(eq(user.id, commenterId))
                .limit(1);
            username = userRecord[0]?.username || userRecord[0]?.name || "User";
        } else {
            // Anonymous user - create or get a system "anonymous" user
            const anonymousUser = await db
                .select()
                .from(user)
                .where(eq(user.email, "anonymous@system.local"))
                .limit(1);

            if (anonymousUser.length === 0) {
                // Create anonymous system user if doesn't exist
                const newAnonymousUser = await db
                    .insert(user)
                    .values({
                        id: "anonymous-user",
                        name: "Anonymous",
                        email: "anonymous@system.local",
                        emailVerified: false,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    })
                    .returning();
                finalCommenterId = newAnonymousUser[0].id;
            } else {
                finalCommenterId = anonymousUser[0].id;
            }
            username = anonymousName || "Anonymous";
        }

        const newComment = await db.insert(pictureComments).values({
            commentId: crypto.randomBytes(16).toString('hex'),
            pictureId,
            commenterId: finalCommenterId,
            content: content.trim(),
            createdAt: new Date()
        }).returning();

        // Return the comment with the determined username
        res.status(201).json({ 
            comment: {
                commentId: newComment[0].commentId,
                commenterId: finalCommenterId,
                content: newComment[0].content,
                createdAt: newComment[0].createdAt,
                username: username
            }
        });
    } catch (error) {
        console.error("Error adding comment:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}