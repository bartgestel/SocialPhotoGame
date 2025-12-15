import type { Request, Response } from "express";
import { db } from "../config/db.js";
import { pictureComments } from "../db/models/schema.js";
import { or, and, eq, desc } from "drizzle-orm";
import crypto from "crypto";

export const getCommentsForPicture = async (req: Request, res: Response) => {
    const { pictureId } = req.params;

    try {
        const comments = await db.select({
            commentId: pictureComments.commentId,
            commenterId: pictureComments.commenterId,
            content: pictureComments.content,
            createdAt: pictureComments.createdAt
        }).from(pictureComments).where(
            eq(pictureComments.pictureId, pictureId)
        ).orderBy(desc(pictureComments.createdAt));

        res.status(200).json({ comments });
    } catch (error) {
        console.error("Error retrieving comments:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

export const addCommentToPicture = async (req: Request, res: Response) => {
    const { pictureId } = req.params;
    const { content } = req.body;
    const commenterId = req.user?.id;

    if (!commenterId) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    if (!content || content.trim() === "") {
        return res.status(400).json({ error: "Comment content cannot be empty" });
    }

    try {
        const newComment = await db.insert(pictureComments).values({
            commentId: crypto.randomBytes(16).toString('hex'),
            pictureId,
            commenterId,
            content: content.trim(),
            createdAt: new Date()
        }).returning();

        res.status(201).json({ comment: newComment[0] });
    } catch (error) {
        console.error("Error adding comment:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}