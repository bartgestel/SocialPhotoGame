import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../config/db";
import * as schema from "../db/models/schema";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: { ...schema }
    }),

    trustedOrigins: ["http://localhost:3000", "http://localhost:5173"],

    advanced: {
        defaultCookieAttributes: {
            secure: false,
            sameSite: "lax"
        }
    },
    emailAndPassword: { enabled: true },
    logger: { disabled: false, level: "debug" }
});