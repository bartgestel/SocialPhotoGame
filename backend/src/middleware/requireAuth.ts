import type { Request, Response, NextFunction } from "express";
import { auth } from "../lib/auth.js";

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Convert Express headers to Headers object
        const headers = new Headers();
        Object.entries(req.headers).forEach(([key, value]) => {
            if (value) {
                headers.append(key, Array.isArray(value) ? value.join(', ') : value);
            }
        });

        const session = await auth.api.getSession({ headers });

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