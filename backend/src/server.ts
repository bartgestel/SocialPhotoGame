import express from 'express';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './lib/auth.js';
import { db } from './config/db.js';
import { sql } from 'drizzle-orm';
import cors from "cors";
import path from "path";
import { fileURLToPath } from 'url';
import friendRoute from './routes/friendRoute.js';
import userRoute from './routes/userRoute.js';
import gameRoute from './routes/gameRoute.js';
import pictureRoute from './routes/pictureRoute.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express();
const PORT = 3000;

app.use(cors({
    origin: [
        "http://localhost:5173",
        "http://localhost",
        "https://bartvangestel.nl",
        "https://www.bartvangestel.nl",
        "http://bartvangestel.nl",
        "http://www.bartvangestel.nl"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie", "Set-Cookie", "X-Requested-With"],
    exposedHeaders: ["Set-Cookie"],
}));

app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Only log requests in development
if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
        console.log(`Incoming: [${req.method}] ${req.url}`);
        next();
    });
}

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

app.use('/api/games', gameRoute);

app.use('/api/pictures', pictureRoute);

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