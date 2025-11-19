import * as dotenv from "dotenv";
import { defineConfig} from "drizzle-kit";

dotenv.config({ path: ".env" });

export default defineConfig({
    schema: "./src/db/models/schema.ts",
    out: "./src/db/migrations",
    dialect: "postgresql",
    dbCredentials: {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: false,
    },
});