import { db } from "./src/config/db.js";
import { games } from "./src/db/models/schema.js";

async function checkGames() {
    const allGames = await db.select().from(games);
    console.log("All games:", JSON.stringify(allGames, null, 2));
}

checkGames().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
});
