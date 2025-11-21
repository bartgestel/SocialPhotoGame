import express from 'express';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './lib/auth';
import { db } from './config/db';
import { sql } from 'drizzle-orm';
import cors from "cors";
import friendRoute from './routes/friendRoute';
import userRoute from './routes/userRoute';


const app = express();
const PORT = 3000;

app.use(cors({
    origin: ["http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

app.use((req, res, next) => {
    console.log(`Incoming: [${req.method}] ${req.url}`);
    next();
});

app.all(/\/api\/auth\/*/, async (req, res) => {
    try {
        await toNodeHandler(auth)(req, res);
    } catch (e) {
        console.error("Internal Auth Error:", e);
        res.status(500).send("Auth Crash");
    }
});

app.use('/api/friends', friendRoute);

app.use('/api/users', userRoute);

async function start() {
    try {
        await db.execute(sql`SELECT 1`);
        console.log("Database Connected");
        app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
    } catch (e) {
        console.error("Database Failed:", e);
    }
}
start();