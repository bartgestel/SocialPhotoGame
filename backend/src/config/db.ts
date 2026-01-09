import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../db/models/schema.js'; // Import all tables
import * as dotenv from 'dotenv';

dotenv.config();

// Use DATABASE_URL if available (Docker), otherwise individual env vars (local dev)
const connectionString = process.env.DATABASE_URL;

const pool = connectionString
    ? new Pool({
        connectionString,
        ssl: false,
        max: 20,                        // Maximum pool size
        idleTimeoutMillis: 30000,       // Close idle connections after 30s
        connectionTimeoutMillis: 2000,  // Timeout if can't connect
    })
    : new Pool({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: 5432,
        ssl: false,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
    });

export const db = drizzle(pool, { schema } as any,);