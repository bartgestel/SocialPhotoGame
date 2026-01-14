import { pgTable, text, timestamp, boolean, integer, pgEnum, unique, index, jsonb, foreignKey } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { number } from "better-auth";

// --------------------------------------------------------------------------------
// 1. ENUMS
// --------------------------------------------------------------------------------
export const friendshipStatusEnum = pgEnum('friendship_status', ['PENDING', 'ACCEPTED', 'BLOCKED']);
export const pictureStatusEnum = pgEnum('picture_status', ['LOCKED', 'UNLOCKED', 'VIEWED', 'EXPIRED']);
export const difficultyEnum = pgEnum('difficulty_level', ['EASY', 'MEDIUM', 'HARD', 'EXPERT']);

// --------------------------------------------------------------------------------
// 2. AUTHENTICATION TABLES (From your provided schema)
// --------------------------------------------------------------------------------

export const user = pgTable("user", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    image: text("image"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").notNull().$onUpdate(() => new Date()),

    // [Added for SnapGame]
    // Username is distinct from 'name' (display name) and needed for friend requests
    username: text('username').unique(),
    currentStreak: integer('current_streak').default(0),
    lastActiveAt: timestamp('last_active_at', { withTimezone: true }).defaultNow(),
});

export const session = pgTable("session", {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").notNull().$onUpdate(() => new Date()),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
}, (table) => ({
    userIdx: index('idx_session_user').on(table.userId),
}));

export const account = pgTable("account", {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").notNull().$onUpdate(() => new Date()),
});

export const verification = pgTable("verification", {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").notNull().$onUpdate(() => new Date()),
});

// --------------------------------------------------------------------------------
// 3. SOCIAL & GAME TABLES
// --------------------------------------------------------------------------------

// Friendships Table
export const friendships = pgTable('friendships', {
    friendshipId: text('friendship_id').primaryKey(), // Changed to text to match schema style
    requesterId: text('requester_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
    addresseeId: text('addressee_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
    status: friendshipStatusEnum('status').default('PENDING'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
    uniqueFriendship: unique('unique_friendship').on(table.requesterId, table.addresseeId),
    lookupIdx: index('idx_friendships_lookup').on(table.requesterId, table.addresseeId),
    // Partial indexes for querying active friend lists efficiently
    activeRequesterIdx: index('idx_active_friends_req').on(table.requesterId).where(sql`status = 'ACCEPTED'`),
    activeAddresseeIdx: index('idx_active_friends_addr').on(table.addresseeId).where(sql`status = 'ACCEPTED'`),
}));

// Games Library Table
export const games = pgTable('games', {
    gameId: integer('game_id').primaryKey().generatedAlwaysAsIdentity(),
    name: text('name').notNull(), // Changed varchar to text for consistency, though varchar is fine
    description: text('description'),
    difficultyLevel: difficultyEnum('difficulty_level').default('EASY'),
    assetBundleUrl: text('asset_bundle_url'),
    isActive: boolean('is_active').default(true),
    hasPieces: boolean('has_pieces').default(false),
    gridSize: integer('grid_size').default(0),
});

// Pictures Table (Content)
export const pictures = pgTable('pictures', {
    pictureId: text('picture_id').primaryKey(),
    senderId: text('sender_id').notNull().references(() => user.id, { onDelete: 'cascade' }),

    // Content
    mediaUrl: text('media_url').notNull(),
    mediaType: text('media_type').default('IMAGE'),

    // Game Config
    requiredGameId: integer('required_game_id').references(() => games.gameId),
    gameConfig: jsonb('game_config'),

    // Sharing via link
    shareToken: text('share_token').unique().notNull(),
    maxUnlocks: integer('max_unlocks').default(0), // 0 = unlimited
    currentUnlocks: integer('current_unlocks').default(0),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
}, (table) => ({
    cleanupIdx: index('idx_pictures_cleanup').on(table.expiresAt),
    shareTokenIdx: index('idx_pictures_share_token').on(table.shareToken),
}));

// Picture Recipients Table (Delivery Status)
export const pictureRecipients = pgTable('picture_recipients', {
    recipientRecordId: text('recipient_record_id').primaryKey(),
    pictureId: text('picture_id').notNull().references(() => pictures.pictureId, { onDelete: 'cascade' }),

    // OPTIONAL: Can be null for anonymous recipients
    receiverId: text('receiver_id').references(() => user.id, { onDelete: 'cascade' }),

    // For tracking anonymous users
    recipientIdentifier: text('recipient_identifier'), // Session ID, fingerprint, or anonymous ID

    status: pictureStatusEnum('status').default('LOCKED'),

    receivedAt: timestamp('received_at', { withTimezone: true }).defaultNow(),
    openedAt: timestamp('opened_at', { withTimezone: true }),
}, (table) => ({
    inboxFeedIdx: index('idx_inbox_feed').on(table.receiverId, table.status).where(sql`receiver_id IS NOT NULL AND status IN ('LOCKED', 'UNLOCKED')`),
    pictureIdx: index('idx_recipients_by_picture').on(table.pictureId),
}));

// Unlock Attempts (Game Sessions)
export const unlockAttempts = pgTable('unlock_attempts', {
    attemptId: text('attempt_id').primaryKey(),
    recipientRecordId: text('recipient_record_id').notNull().references(() => pictureRecipients.recipientRecordId, { onDelete: 'cascade' }),

    scoreAchieved: integer('score_achieved').default(0),
    isSuccessful: boolean('is_successful').default(false),

    startedAt: timestamp('started_at', { withTimezone: true }).defaultNow(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
}, (table) => ({
    recipientIdx: index('idx_attempts_by_recipient').on(table.recipientRecordId),
}));

export const pictureComments = pgTable('picture_comments', {
    commentId: text('comment_id').primaryKey(),
    pictureId: text('picture_id').notNull().references(() => pictures.pictureId, { onDelete: 'cascade' }),
    commenterId: text('commenter_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
    content: text('content').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
    pictureIdx: index('idx_comments_by_picture').on(table.pictureId),
}));