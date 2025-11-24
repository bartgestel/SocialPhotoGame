// src/types/express.d.ts
import { User } from "better-auth";

declare global {
    namespace Express {
        interface Request {
            user?: User;
        }
    }
}

export {};
