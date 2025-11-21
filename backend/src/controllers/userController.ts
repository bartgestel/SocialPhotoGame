import { Request, Response } from "express";
import { db } from "../config/db";
import { user } from "../db/models/schema";
import { ilike, eq } from "drizzle-orm";

export const getUserById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: "User ID is required" });
        }

        const users = await db
            .select({
                id: user.id,
                name: user.name,
                avatarUrl: user.image
            })
            .from(user)
            .where(eq(user.id, id))
            .limit(1);

        if (users.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const foundUser = users[0];
        const mappedUser = {
            id: foundUser.id,
            name: foundUser.name,
            avatarUrl: foundUser.avatarUrl
        };

        res.status(200).json(mappedUser);

    } catch(err) {
        console.error("Error fetching user:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const searchUsers = async (req: Request, res: Response) => {
    try{
        const { name } = req.query;
        if (typeof name !== 'string' || name.trim() === '') {
            return res.status(400).json({ error: "Invalid or missing 'name' query parameter." });
        }

        const users = await db
            .select()
            .from(user)
            .where(ilike(user.name, `%${name}%`))
            .limit(10);

        // Map to match frontend expectations (image -> avatarUrl)
        const mappedUsers = users.map(u => ({
            id: u.id,
            name: u.name,
            avatarUrl: u.image
        }));

        res.status(200).json({ users: mappedUsers });

    }catch(err){
        console.error("Error searching users:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
}