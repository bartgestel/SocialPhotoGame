// Test setup file
// This file runs before all tests

// Mock environment variables
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
process.env.BETTER_AUTH_SECRET = 'test-secret-key-for-testing-purposes';
process.env.BETTER_AUTH_URL = 'http://localhost:3000';
process.env.FRONTEND_URL = 'http://localhost:5173';
process.env.GAME_SECRET_KEY = 'test-game-secret-key';
process.env.NODE_ENV = 'test';

export {};
