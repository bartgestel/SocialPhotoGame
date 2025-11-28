import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../config/db.js";
import * as schema from "../db/models/schema.js";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: { ...schema }
    }),

    trustedOrigins: ["http://localhost:3000", "http://localhost:5173", "http://51.210.96.168"],

    advanced: {
        defaultCookieAttributes: {
            sameSite: "lax",
            secure: false
        }
    },
    emailAndPassword: { enabled: true },
    logger: { disabled: false, level: "debug" }
});