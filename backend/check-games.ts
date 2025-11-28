import { db } from './src/config/db.js';
import { games } from './src/db/models/schema.js';

async function checkGames() {
    try {
        const allGames = await db.select().from(games);
        console.log('\n📋 Games in production database:\n');
        allGames.forEach(game => {
            console.log(`  ${game.gameId}. ${game.name}`);
            console.log(`     └─ ${game.description}`);
            console.log(`     └─ Difficulty: ${game.difficultyLevel} | Active: ${game.isActive}`);
            console.log(`     └─ URL: ${game.assetBundleUrl}\n`);
        });
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkGames();
