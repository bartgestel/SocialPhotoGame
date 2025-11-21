import { Request, Response, NextFunction } from "express";
import { auth } from "../lib/auth";

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const session = await auth.api.getSession({ headers: req.headers });

        if (!session) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // Attach user info to request
        req.user = session.user;
        next();
    } catch (err) {
        console.error("Auth error:", err);
        res.status(401).json({ error: "Unauthorized" });
    }
};