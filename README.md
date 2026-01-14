# Social Photo Game

A full-stack social media application where users share pictures that can only be unlocked by playing mini-games. Built with React, Express, PostgreSQL, Unity WebGL, and Better Auth.

## 📖 About The Project

Social Photo Game is an interactive social media platform that gamifies picture sharing. Users can:

- 📸 Upload pictures locked behind mini-games
- 🎮 Play Unity WebGL games to unlock pictures
- 💬 Comment on unlocked pictures
- 🔗 Share unlock links with friends
- 👥 Manage friends and social connections

### Key Features

- **Game-Locked Pictures**: Upload photos that require completing a mini-game to view
- **Multiple Mini-Games**: Card Match, MicroRacer, Speurhondenspel with multiple difficulty levels
- **Share System**: Generate shareable links for pictures with configurable unlock limits and expiration
- **Anonymous & Authenticated Access**: Non-registered users can unlock and comment, registered users get full features
- **Real-time Comments**: Leave comments on pictures after unlocking
- **Responsive Design**: Mobile-first design with desktop support
- **Progress Tracking**: Track who has unlocked your pictures and their game attempts

## 🏗️ Tech Stack

### Frontend

- **React 19.2** with TypeScript
- **Vite** - Fast development server with HMR
- **Tailwind CSS** - Utility-first styling
- **React Router** - Client-side routing
- **Better Auth Client** - Authentication
- **Unity WebGL** - Game rendering

### Backend

- **Express 5.1** with TypeScript
- **Better Auth** - Secure authentication server
- **Drizzle ORM** - Type-safe database queries
- **PostgreSQL** - Relational database
- **Multer** - File upload handling
- **Sharp** - Image processing
- **Node.js** with tsx and nodemon for hot-reloading

### Unity Games

- **Unity 2021+** - WebGL game builds
- **C# Scripts** - Game logic and coordination
- Multiple mini-games with difficulty progression

### Infrastructure

- **Docker & Docker Compose** - Full containerization
- **Nginx** - Reverse proxy and static file serving
- **pnpm** - Fast, disk space efficient package manager

## 📋 Prerequisites

Before running the app, make sure you have the following installed:

1. **Node.js** (v20 or higher recommended)
   ```bash
   node --version  # Should be v20+
   ```

2. **pnpm** (v10.14.0 or higher)
   ```bash
   npm install -g pnpm
   pnpm --version
   ```

3. **Docker** and **Docker Compose**
   - [Install Docker Desktop](https://docs.docker.com/get-docker/)
   - Docker Compose v2 (included with Docker Desktop)
   ```bash
   docker --version
   docker compose version
   ```

4. **PostgreSQL** (optional - can use Docker instead)
   - Required only if not using Docker for the database

## 🚀 Quick Start

### Local Development (Recommended)

#### Step 1: Clone and Install

```bash
# Clone the repository
git clone https://github.com/bartgestel/SocialPhotoGame.git
cd SocialPhotoGame

# Install dependencies (this will install both backend and frontend)
pnpm install
```

#### Step 2: One-Command Startup

Run everything with a single script:

```bash
./start-dev.sh
```

This command will:

1. ✅ Check and install dependencies
2. ✅ Start PostgreSQL database in Docker
3. ✅ Run database migrations
4. ✅ Start backend server with hot-reloading (localhost:3000)
5. ✅ Start frontend server with hot-reloading (localhost:5173)

Both servers will automatically restart when you save changes to files!

**Access the app:**

- **Frontend**: http://localhost:5173 (Vite dev server with API proxy)
- **Backend API**: http://localhost:3000
- **Database**: localhost:5432

#### Step 3: Create an Account

1. Navigate to http://localhost:5173
2. Click "Sign Up" and create an account
3. Sign in and start uploading pictures!

### Manual Setup (Alternative)

If you prefer to run services separately:

**1. Setup Database**

```bash
./setup-db.sh
```

This starts PostgreSQL in Docker on port 5432.

**2. Install Dependencies**

```bash
# Backend dependencies
cd backend
pnpm install

# Frontend dependencies
cd ../frontend
pnpm install
```

**3. Run Database Migrations**

```bash
cd backend
pnpm db:push
```

**4. Start Development Servers**

Open two terminal windows:

**Terminal 1 - Backend:**

```bash
cd backend
pnpm dev
```

**Terminal 2 - Frontend:**

```bash
cd frontend
pnpm dev
```

## 🔧 Environment Variables

### Backend (.env in /backend)

Create a `.env` file in the `backend/` directory:

```env
# Database Configuration
DATABASE_URL=postgresql://postgres:password@localhost:5432/socialphotogame

# Better Auth Configuration
BETTER_AUTH_SECRET=your-secret-key-here-change-in-production
BETTER_AUTH_URL=http://localhost:3000

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Node Environment
NODE_ENV=development
```

### Frontend (.env in /frontend)

The frontend uses Vite's proxy configuration, so no `.env` file is needed for local development. API requests to `/api` and `/uploads` are automatically proxied to `localhost:3000`.

### Production Environment Variables

For production deployment, update these values:

```env
# Backend .env
DATABASE_URL=postgresql://postgres:secure_password@db:5432/socialphotogame
BETTER_AUTH_SECRET=generate-a-secure-random-string-here
BETTER_AUTH_URL=https://yourdomain.com
FRONTEND_URL=https://yourdomain.com
NODE_ENV=production
```

## 🗄️ Database Schema

The application uses the following main tables:

- **users** - User accounts and authentication
- **pictures** - Uploaded pictures with game and share settings
- **pictureRecipients** - Tracks who has unlocked each picture
- **unlockAttempts** - Game completion attempts and verification
- **pictureComments** - Comments on unlocked pictures (supports authenticated and anonymous users)
- **friends** - Friend relationships between users

### Running Migrations

```bash
cd backend

# Push schema changes to database
pnpm db:push

# Generate migration files
pnpm db:generate

# Apply migrations
pnpm db:migrate
```

## 🎮 Unity Games Integration

The application includes Unity WebGL mini-games that users must complete to unlock pictures. Games are located in `/frontend/public/game/`.

### Available Games

1. **Card Match** - Memory matching game (Easy, Medium, Hard)
2. **MicroRacer** - Racing game with time trials
3. **Speurhondenspel** - Detective search game

### Game Completion Flow

1. User receives share link (e.g., `/unlock/abc123`)
2. Frontend loads Unity WebGL game in iframe
3. User completes the game
4. Unity calls `window.parent.handleUnityGameComplete()` via ReactBridge.jslib
5. Backend verifies completion at `/api/games/verify`
6. Picture is unlocked and revealed to the user
7. User can now comment on the picture

### Already-Unlocked Detection

If a user has already completed a game:
- The system checks `anonymousId` (stored in localStorage) or user session
- If picture is already unlocked, it's immediately revealed
- No need to replay the game

## 📡 API Documentation

### Key Endpoints

#### Authentication
- `POST /api/auth/sign-up` - Create new account
- `POST /api/auth/sign-in` - Login
- `POST /api/auth/sign-out` - Logout
- `GET /api/auth/session` - Get current session

#### Pictures
- `GET /api/pictures/my-pictures` - Get user's uploaded pictures
- `POST /api/pictures` - Upload a new picture
- `GET /api/pictures/id/:pictureId` - Get picture by ID (requires unlock)
- `GET /api/pictures/token/:shareToken` - Get picture info by share token (checks unlock status)
- `GET /api/pictures/:id/recipients` - Get list of users who unlocked the picture

#### Comments
- `GET /api/comments/:pictureId` - Get all comments for a picture
- `POST /api/comments/:pictureId` - Add comment (supports authenticated and anonymous users)

#### Games
- `POST /api/games/verify` - Verify game completion and unlock picture

### Authentication Modes

The API supports two authentication modes:

1. **requireAuth**: Requires valid session (returns 401 if not authenticated)
2. **optionalAuth**: Sets user if session exists, but allows anonymous access

Example: Comment endpoints use `optionalAuth` so both logged-in users and anonymous visitors can comment on unlocked pictures.

## 🚢 Production Deployment

### Docker Deployment (Recommended)

The application is fully containerized for production deployment with Docker Compose.

#### Prerequisites

- Docker and Docker Compose installed on your VPS
- Git installed
- Port 80 available (or configure a different port)

#### Quick Deploy

1. **Clone the repository on your VPS:**

   ```bash
   git clone https://github.com/bartgestel/SocialPhotoGame.git
   cd SocialPhotoGame
   ```

2. **Create production environment file:**

   ```bash
   cp .env.example .env
   nano .env
   ```

   **Configure your `.env` file:**

   ```env
   # Database
   DB_PASSWORD=your_secure_database_password_here

   # Backend Auth
   BETTER_AUTH_SECRET=your_secret_key_minimum_32_characters_long
   BETTER_AUTH_URL=http://your-vps-ip/
   GAME_SECRET_KEY=your_game_secret_key_here

   # Frontend (MUST be empty for Docker!)
   VITE_API_URL=
   ```

   **Generate secure secrets:**

   ```bash
   # Generate BETTER_AUTH_SECRET
   openssl rand -base64 32

   # Generate DB_PASSWORD
   openssl rand -base64 24
   ```

3. **Deploy with automated script:**

   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

   The deploy script will:

   - ✅ Check for `.env` file
   - ✅ Pull latest code from Git
   - ✅ Build and start all Docker containers
   - ✅ Show container status and logs

#### Docker Architecture

The deployment consists of 3 containers:

- **`socialphotogame-db`** - PostgreSQL 16 database with health checks
- **`socialphotogame-backend`** - Node.js/Express API server
- **`socialphotogame-frontend`** - Nginx serving React app with reverse proxy

**Access the app:**

- Frontend: `http://your-vps-ip/` (port 80)
- Backend API: Proxied through Nginx at `/api/*`
- Database: Internal network only (not exposed)

#### Useful Docker Commands

```bash
# View container status
docker compose ps

# View logs
docker compose logs -f

# View specific service logs
docker compose logs -f frontend
docker compose logs -f backend
docker compose logs -f postgres

# Restart all services
docker compose restart

# Stop all services
docker compose down

# Rebuild and restart
./deploy.sh

# Access backend container shell
docker exec -it socialphotogame-backend sh

# Access database
docker exec -it socialphotogame-db psql -U postgres -d socialphotogame
```

#### Running Database Migrations in Production

Migrations are typically run locally and committed to Git. If you need to run them on production:

```bash
# Option 1: SSH into backend container
docker exec -it socialphotogame-backend sh
pnpm add -D drizzle-kit
pnpm exec drizzle-kit push

# Option 2: Run from your local machine with DATABASE_URL pointing to production
cd backend
DATABASE_URL="postgresql://postgres:password@your-vps-ip:5432/socialphotogame" pnpm db:push
```

### SSL/HTTPS Setup (Production)

For production, you should enable HTTPS using Let's Encrypt:

1. **Install Certbot:**

   ```bash
   sudo apt update
   sudo apt install certbot python3-certbot-nginx
   ```

2. **Get SSL certificate:**

   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

3. **Update `.env`:**

   ```env
   BETTER_AUTH_URL=https://your-domain.com/
   ```

4. **Redeploy:**
   ```bash
   ./deploy.sh
   ```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed production deployment guide.

## 🛠️ Development

### Project Structure

```
SocialPhotoGame/
├── backend/                    # Express backend
│   ├── src/
│   │   ├── controllers/       # Request handlers
│   │   ├── db/               # Database schema (Drizzle)
│   │   ├── middleware/       # Auth and other middleware
│   │   ├── routes/           # API routes
│   │   └── index.ts          # Server entry point
│   ├── uploads/              # User-uploaded pictures
│   └── package.json
├── frontend/                  # React frontend
│   ├── public/
│   │   └── game/            # Unity WebGL builds
│   │       ├── CardMatch/
│   │       ├── MicroRacer/
│   │       └── Speurhondenspel/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── lib/            # API client and utilities
│   │   ├── pages/          # Route pages
│   │   └── App.tsx
│   └── package.json
├── 2d-minigames/             # Unity project source
│   ├── Assets/
│   │   ├── Plugins/        # ReactBridge.jslib
│   │   ├── Scripts/        # Game logic (C#)
│   │   └── Scenes/         # Unity scenes
│   └── Build/              # WebGL builds (copy to frontend/public/game)
└── docker-compose.yml        # Production deployment
```

### Adding a New Unity Game

1. **Build the Unity game to WebGL:**
   - In Unity, go to File → Build Settings
   - Select WebGL platform
   - Build to `2d-minigames/Build/YourGameName/`

2. **Copy build to frontend:**
   ```bash
   cp -r 2d-minigames/Build/YourGameName/ frontend/public/game/YourGameName/
   ```

3. **Update backend game types:**
   - Add game name to `backend/src/db/schema.ts` in the `game` enum
   - Run migration: `cd backend && pnpm db:push`

4. **Update frontend game loading:**
   - Modify `frontend/src/pages/UnlockPicture.tsx` to handle the new game type

### Backend Development

```bash
cd backend

# Install dependencies
pnpm install

# Run in development mode (hot-reload)
pnpm dev

# Build for production
pnpm build

# Run production build
pnpm start

# Database operations
pnpm db:push        # Push schema changes
pnpm db:generate    # Generate migration files
pnpm db:migrate     # Run migrations
pnpm db:studio      # Open Drizzle Studio (visual DB editor)

# Testing
pnpm test           # Run all tests
pnpm test:watch     # Run tests in watch mode
pnpm test:coverage  # Run tests with coverage report
```

### Frontend Development

```bash
cd frontend

# Install dependencies
pnpm install

# Run dev server with hot-reload
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Lint code
pnpm lint
```

## 🧪 Testing

The backend includes a comprehensive test suite using Jest and TypeScript.

### Running Tests

```bash
cd backend

# Run all tests
pnpm test

# Run tests in watch mode (auto-rerun on changes)
pnpm test:watch

# Run tests with coverage report
pnpm test:coverage
```

### Test Coverage

The test suite includes:

- **Unit Tests**: Controllers, middleware, utilities
- **Integration Tests**: API endpoints, database operations
- **Mocked Dependencies**: Database, authentication, file uploads

Coverage areas:
- ✅ User controller (CRUD operations)
- ✅ Comment controller (authenticated & anonymous)
- ✅ Picture controller (upload, retrieval, expiration)
- ✅ Game controller (session management, verification)
- ✅ Auth middleware (required & optional auth)

See [`backend/src/__tests__/README.md`](backend/src/__tests__/README.md) for detailed testing documentation.

### Testing Unity Integration Locally

1. Ensure backend is running on `localhost:3000`
2. Frontend dev server proxies `/api` requests to backend
3. Unity games call `/api/games/verify` after completion
4. Test with: Navigate to `/unlock/<shareToken>` and complete a game

## 🔍 Troubleshooting

### Common Issues

#### Database Connection Failed

**Problem:** Backend can't connect to PostgreSQL

**Solution:**
```bash
# Check if Docker container is running
docker ps | grep postgres

# Restart database container
docker stop social_photo_game_db
./setup-db.sh

# Verify DATABASE_URL in backend/.env
DATABASE_URL=postgresql://postgres:password@localhost:5432/socialphotogame
```

#### Unity Game Not Loading

**Problem:** Game shows blank screen or loading forever

**Solution:**
1. Check browser console for errors
2. Ensure Unity build is in correct location: `frontend/public/game/<GameName>/`
3. Verify `index.html` exists in game build folder
4. Clear browser cache and reload

#### Picture Not Revealing After Game Completion

**Problem:** Game completes but picture doesn't unlock

**Solution:**
1. Open browser DevTools console
2. Check for errors in Network tab during game completion
3. Verify `ReactBridge.jslib` is calling `window.parent.handleUnityGameComplete`
4. Ensure backend `/api/games/verify` endpoint is accessible
5. Check backend logs for verification errors

#### Anonymous Comments Not Working

**Problem:** Comments always show as "Anonymous" even when logged in

**Solution:**
1. Verify session cookie is being sent with requests
2. Check that `api.addComment()` includes `credentials: 'include'`
3. Ensure backend uses `optionalAuth` middleware on comment routes
4. Clear browser cookies and re-login

#### "Already Unlocked" Not Working

**Problem:** Users have to replay games even if they already completed them

**Solution:**
1. Check browser localStorage for `anonymousId`
2. Verify backend checks both `anonymousId` and `userId` in `getPictureByToken`
3. Ensure `anonymousId` is set before calling `loadPictureInfo()` in UnlockPicture.tsx

#### Port Already in Use

**Problem:** `Error: listen EADDRINUSE :::3000`

**Solution:**
```bash
# Find process using port 3000
lsof -ti:3000

# Kill the process
kill -9 $(lsof -ti:3000)

# Or use a different port in backend/.env
PORT=3001
```

#### Docker Build Fails

**Problem:** Docker Compose fails to build or start

**Solution:**
```bash
# Remove all containers and volumes
docker compose down -v

# Rebuild from scratch
docker compose build --no-cache

# Start services
docker compose up -d
```

### Getting Help

If you encounter issues not listed here:

1. Check the browser console and backend logs
2. Review [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment-specific issues
3. Open an issue on GitHub with error logs and steps to reproduce

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with [Better Auth](https://better-auth.com) for secure authentication
- Unity WebGL for game integration
- React and Express for full-stack development

---

**Happy Gaming! 🎮📸**
