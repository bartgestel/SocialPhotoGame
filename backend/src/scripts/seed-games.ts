import { db } from '../config/db.js';
import { games } from '../db/models/schema.js';
import { eq } from 'drizzle-orm';

async function seedGames() {
    console.log('🌱 Seeding games...');

    const gamesToInsert = [
        {
            name: 'robbie',
            description: '',
            difficultyLevel: 1,
            assetBundleUrl: '',
            isActive: true,
        },
        {
            name: 'pipe',
            description: 'Tap the targets before time runs out! Quick reflexes required.',
            difficultyLevel: 2,
            assetBundleUrl: '/game/tap-master',
            isActive: true,
        },
        {
            name: 'quickmath',
            description: 'Test your reaction time! Click when the screen turns green.',
            difficultyLevel: 1,
            assetBundleUrl: '/game/reaction-test',
            isActive: true,
        },
    ];

    try {
        for (const game of gamesToInsert) {
            // Check if game already exists by name
            const existing = await db.select().from(games).where(eq(games.name, game.name));
            
            if (existing.length === 0) {
                const result = await db.insert(games).values(game).returning();
                console.log(`✅ Inserted: ${game.name} (ID: ${result[0].gameId})`);
            } else {
                console.log(`⏭️  Skipped: ${game.name} (already exists)`);
            }
        }

        console.log('✨ Games seeding completed!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding games:', error);
        process.exit(1);
    }
}

seedGames();
