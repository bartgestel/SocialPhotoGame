import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../db/models/schema.js'; // Import all tables
import * as dotenv from 'dotenv';

dotenv.config();

// Use DATABASE_URL if available (Docker), otherwise individual env vars (local dev)
const connectionString = process.env.DATABASE_URL;

const pool = connectionString 
    ? new Pool({ connectionString, ssl: false })
    : new Pool({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: 5432,
        ssl: false
    });

export const db = drizzle(pool, { schema } as any,);