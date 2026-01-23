import { db } from '../config/db.js';
import { games } from '../db/models/schema.js';
import { eq } from 'drizzle-orm';

async function seedGames() {
    console.log('🌱 Seeding games...');

    const gamesToInsert = [
        {
            name: 'Speurhondenspel',
            description: null,
            difficultyLevel: 'EASY',
            assetBundleUrl: 'Scenes/Speurhondenspel/TestLevel_Easy',
            isActive: true,
            hasPieces: true,
            gridSize: 0,
        },
        {
            name: 'Card Match',
            description: null,
            difficultyLevel: 'EASY',
            assetBundleUrl: 'Scenes/FindTheMatchScenes/Easy',
            isActive: true,
            hasPieces: true,
            gridSize: 0,
        },
        {
            name: 'Card Match',
            description: null,
            difficultyLevel: 'MEDIUM',
            assetBundleUrl: 'Scenes/FindTheMatchScenes/Medium',
            isActive: true,
            hasPieces: true,
            gridSize: 0,
        },
        {
            name: 'Card Match',
            description: null,
            difficultyLevel: 'HARD',
            assetBundleUrl: 'Scenes/FindTheMatchScenes/Hard',
            isActive: true,
            hasPieces: true,
            gridSize: 0,
        },
        {
            name: 'MicroRacer',
            description: null,
            difficultyLevel: 'EASY',
            assetBundleUrl: 'Scenes/MicroRacer/EasyLevel',
            isActive: true,
            hasPieces: false,
            gridSize: 0,
        },
        {
            name: 'MicroRacer',
            description: null,
            difficultyLevel: 'MEDIUM',
            assetBundleUrl: 'Scenes/MicroRacer/MediumLevel',
            isActive: true,
            hasPieces: false,
            gridSize: 0,
        },
        {
            name: 'MicroRacer',
            description: null,
            difficultyLevel: 'HARD',
            assetBundleUrl: 'Scenes/MicroRacer/HardLevel',
            isActive: true,
            hasPieces: false,
            gridSize: 0,
        },
        {
            name: 'MicroRacer',
            description: null,
            difficultyLevel: 'EXPERT',
            assetBundleUrl: 'Scenes/MicroRacer/ExpertLevel',
            isActive: true,
            hasPieces: false,
            gridSize: 0,
        },
        {
            name: 'Speurhondenspel',
            description: null,
            difficultyLevel: 'MEDIUM',
            assetBundleUrl: 'Scenes/Speurhondenspel/TestLevel_Medium',
            isActive: true,
            hasPieces: true,
            gridSize: 0,
        },
        {
            name: 'Speurhondenspel',
            description: null,
            difficultyLevel: 'HARD',
            assetBundleUrl: 'Scenes/Speurhondenspel/TestLevel_Hard',
            isActive: true,
            hasPieces: true,
            gridSize: 0,
        },
        {
            name: 'Xonix',
            description: null,
            difficultyLevel: 'EASY',
            assetBundleUrl: 'Scenes/XonixScenes/Xonix_Easy',
            isActive: true,
            hasPieces: false,
            gridSize: 0,
        },
        {
            name: 'Xonix',
            description: null,
            difficultyLevel: 'MEDIUM',
            assetBundleUrl: 'Scenes/XonixScenes/Xonix_Medium',
            isActive: true,
            hasPieces: false,
            gridSize: 0,
        },
        {
            name: 'Xonix',
            description: null,
            difficultyLevel: 'HARD',
            assetBundleUrl: 'Scenes/XonixScenes/Xonix_Hard',
            isActive: true,
            hasPieces: false,
            gridSize: 0,
        },
    ];

    try {
        for (const game of gamesToInsert) {
            // Check if game already exists by name and difficulty
            const existing = await db.select().from(games).where(
                eq(games.name, game.name)
            ).where(
                eq(games.difficultyLevel, game.difficultyLevel)
            );
            
            if (existing.length === 0) {
                const result = await db.insert(games).values(game).returning();
                console.log(`✅ Inserted: ${game.name} - ${game.difficultyLevel} (ID: ${result[0].gameId})`);
            } else {
                console.log(`⏭️  Skipped: ${game.name} - ${game.difficultyLevel} (already exists)`);
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
