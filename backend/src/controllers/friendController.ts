import type { Request, Response } from "express";
import { db } from "../config/db";
import { friendships } from "../db/models/schema";
import { or, and, eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export const addFriend = async (req: Request, res: Response) => {
    const { friendId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try{
        // Check if the friendship already exists (in either direction)
        const existingFriendship = await db.select({
            friendshipId: friendships.friendshipId,
            requesterId: friendships.requesterId,
            addresseeId: friendships.addresseeId,
            status: friendships.status
        }).from(friendships).where(
            or(
                and(eq(friendships.requesterId, userId), eq(friendships.addresseeId, friendId)),
                and(eq(friendships.requesterId, friendId), eq(friendships.addresseeId, userId))
            )
        ).limit(1);

        if(existingFriendship.length > 0){
            if(existingFriendship[0].status == "PENDING"){
                await db.update(friendships).set({status: 'ACCEPTED'}).where(
                    eq(friendships.friendshipId, existingFriendship[0].friendshipId),
                );

                return res.status(200).json({ message: "Friend request updated successfully" });
            }
            return res.status(400).json({ error: "Friendship already exists" });
        }

        // Insert new friendship with requester as current user
        await db.insert(friendships).values({
            friendshipId: randomUUID(),
            requesterId: userId,
            addresseeId: friendId,
            status: 'PENDING'
        });

        res.status(201).json({ message: "Friend request sent successfully" });
    }catch (error) {
        console.error("Error adding friend:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const getFriends = async (req: Request, res: Response) => {
    const userId = req.user?.id;

    try{
        const friends = await db.select({
            friendshipId: friendships.friendshipId,
            requesterId: friendships.requesterId,
            addresseeId: friendships.addresseeId,
            status: friendships.status
        }).from(friendships).where(
            and(
                or(
                    eq(friendships.requesterId, userId),
                    eq(friendships.addresseeId, userId)
                ),
                eq(friendships.status, 'ACCEPTED'
                )
            )
        );

        res.status(200).json({ friends });
    }catch (error) {
        console.error("Error retrieving friends:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const getFriendRequests = async (req: Request, res: Response) => {
    const userId = req.user?.id;

    try{
        const requests = await db.select({
            friendshipId: friendships.friendshipId,
            requesterId: friendships.requesterId,
            addresseeId: friendships.addresseeId,
            status: friendships.status
        }).from(friendships).where(
            and(
                eq(friendships.addresseeId, userId),
                eq(friendships.status, 'PENDING')
            )
        );

        res.status(200).json({ requests });
    }catch (error) {
        console.error("Error retrieving friend requests:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

export const respondToFriendRequest = async (req: Request, res: Response) => {
    const { friendshipId, accept } = req.body;
    const userId = req.user?.id;

    try{
        const friendship = await db.select().from(friendships).where(
            and(
                eq(friendships.friendshipId, friendshipId),
                eq(friendships.addresseeId, userId),
                eq(friendships.status, 'PENDING')
            )
        ).limit(1);

        if(friendship.length === 0){
            return res.status(404).json({ error: "Friend request not found" });
        }

        if(accept){
            await db.update(friendships).set({status: 'ACCEPTED'}).where(
                eq(friendships.friendshipId, friendshipId),
            );
            return res.status(200).json({ message: "Friend request accepted" });
        } else {
            await db.delete(friendships).where(
                eq(friendships.friendshipId, friendshipId),
            );
            return res.status(200).json({ message: "Friend request declined" });
        }
    }catch (error) {
        console.error("Error responding to friend request:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};