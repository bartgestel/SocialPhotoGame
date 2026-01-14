# Anonymous Picture Unlocking System

## Overview

This system allows users to upload pictures and share them via links. Recipients don't need to create an account - they simply click the link, play a Unity game, and unlock the picture.

## Features

- ✅ **Anonymous Access**: No login required to unlock pictures
- ✅ **Secure Upload**: Authenticated users can upload pictures
- ✅ **Game-Based Unlocking**: Pictures are unlocked by winning Unity games
- ✅ **Shareable Links**: Each picture gets a unique shareable URL
- ✅ **Expiration & Limits**: Configure max unlocks and expiration dates
- ✅ **Real-time Delivery**: Picture delivered immediately after game win

## How It Works

### For Picture Senders (Authenticated Users)

1. Log in to the application
2. Click "📷 Upload Picture" button in header
3. Select an image file
4. Choose which game recipients must play
5. Set optional limits:
   - Max unlocks (0 = unlimited)
   - Expiration period (days)
6. Get a shareable link

### For Picture Recipients (Anonymous)

1. Receive link via email/messenger: `http://localhost:5173/unlock/abc123xyz`
2. Click link → See locked picture preview
3. Click "Play Game to Unlock"
4. Play and win the Unity game
5. Picture is unlocked and displayed immediately

## API Endpoints

### Pictures

- `POST /api/pictures/upload` - Upload picture (auth required)
- `GET /api/pictures/token/:shareToken` - Get picture info (public)
- `GET /api/pictures/:pictureId/media/:anonymousId` - Get unlocked media (public)
- `GET /api/pictures/my-pictures` - Get user's uploaded pictures (auth required)

### Games

- `POST /api/games/start` - Start game session
  - For picture unlock: include `shareToken` and `anonymousId`
  - For standard game: include `gameId`
- `POST /api/games/verify` - Verify game completion and unlock picture

## Database Schema

### Key Tables

**pictures**

- `pictureId` (text, PK) - Unique identifier
- `senderId` (text, FK → user.id) - Who uploaded it
- `mediaUrl` (text) - Path to the image file
- `shareToken` (text, unique) - Token for shareable link
- `requiredGameId` (int, FK → games.gameId) - Which game to play
- `maxUnlocks` (int) - 0 = unlimited
- `currentUnlocks` (int) - How many times it's been unlocked
- `expiresAt` (timestamp, nullable) - When it expires

**pictureRecipients**

- `recipientRecordId` (text, PK)
- `pictureId` (text, FK → pictures.pictureId)
- `receiverId` (text, nullable, FK → user.id) - Optional for registered users
- `recipientIdentifier` (text, nullable) - For anonymous tracking
- `status` (enum) - LOCKED, UNLOCKED, VIEWED, EXPIRED
- `openedAt` (timestamp) - When unlocked

**unlockAttempts**

- `attemptId` (text, PK)
- `recipientRecordId` (text, FK → pictureRecipients)
- `scoreAchieved` (int)
- `isSuccessful` (boolean)
- `startedAt`, `completedAt` (timestamps)

## Frontend Routes

- `/upload` - Upload picture page (auth required)
- `/unlock/:shareToken` - Anonymous unlock page (public)
- `/game?shareToken=xxx&anonymousId=yyy` - Play game to unlock (public)
- `/home` - Dashboard with upload button (auth required)

## Setup Instructions

### Backend

```bash
cd backend
pnpm install
pnpm exec drizzle-kit push  # Apply schema changes
pnpm run dev
```

### Frontend

```bash
cd frontend
pnpm install
pnpm run dev
```

### Environment Variables

**Backend (.env)**

```
DATABASE_URL=postgresql://...
GAME_SECRET_KEY=your-secret-key
FRONTEND_URL=http://localhost:5173
```

**Frontend**
No special env vars needed for development.

## Anonymous Identification

Recipients are identified using:

1. `anonymousId` stored in browser's localStorage
2. Falls back to crypto.randomUUID() if not present
3. Persists across page reloads
4. Allows checking if user already unlocked a picture

## Security Features

- **HMAC Signature Verification**: Games must provide valid signature to unlock
- **Session Management**: Active game sessions tracked server-side
- **Rate Limiting**: Max unlocks prevents spam
- **Expiration**: Pictures can auto-expire
- **Anonymous Tracking**: Prevents same user unlocking multiple times

## File Storage

Currently uses local filesystem (`backend/uploads/` directory).

For production, consider:

- AWS S3
- Cloudinary
- Cloudflare R2
- Azure Blob Storage

Update `mediaUrl` field to full URLs when using cloud storage.

## Testing the Flow

1. **Upload**: Log in → Upload picture → Copy share link
2. **Share**: Send link via email/messenger
3. **Unlock**: Open link in incognito → Play game → Win → See picture

## Future Enhancements

- [ ] Cloud storage integration
- [ ] Picture analytics (views, attempts, success rate)
- [ ] Multiple game difficulty levels
- [ ] Picture collections/albums
- [ ] Email notifications on unlock
- [ ] QR code generation for links
- [ ] Picture comments/reactions
- [ ] Batch upload
- [ ] Mobile app support
