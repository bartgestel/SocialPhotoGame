import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../config/db.js";
import * as schema from "../db/models/schema.js";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: { ...schema }
    }),

    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
    
    trustedOrigins: [
        "http://localhost:3000", 
        "http://localhost:5173", 
        "http://localhost", 
        "http://51.210.96.168", 
        "http://51.210.96.168:3000",
        "https://51.210.96.168",
        "https://51.210.96.168:443"
    ],

    session: {
        cookieCache: {
            enabled: true,
            maxAge: 5 * 60 // 5 minutes
        }
    },

    advanced: {
        defaultCookieAttributes: {
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            path: "/",
            httpOnly: true,
            domain: undefined // Let browser determine domain
        }
    },
    emailAndPassword: { enabled: true },
    logger: { disabled: false, level: "debug" }
});