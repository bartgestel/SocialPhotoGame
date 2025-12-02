# Social Photo Game

A full-stack social photo game application built with React, Express, PostgreSQL, and Better Auth.

## 🏗️ Tech Stack

### Frontend

- **React** 19.2 with TypeScript
- **Vite** - Fast development server with HMR
- **Tailwind CSS** - Utility-first styling
- **Better Auth** - Authentication client

### Backend

- **Express** 5.1 with TypeScript
- **Better Auth** - Authentication server
- **Drizzle ORM** - Type-safe database ORM
- **PostgreSQL** - Primary database
- **Node.js** with tsx and nodemon for hot-reloading

### Infrastructure

- **Docker & Docker Compose** - Full containerization for production
- **Nginx** - Reverse proxy and static file serving
- **pnpm** - Fast, disk space efficient package manager

## 📋 Prerequisites

Before running the app, make sure you have the following installed:

1. **Node.js** (v20 or higher recommended)
2. **pnpm** (v10.14.0 or higher)
   ```bash
   npm install -g pnpm
   ```
3. **Docker** and **Docker Compose**
   - [Install Docker](https://docs.docker.com/get-docker/)
   - Docker Compose v2 (use `docker compose` instead of `docker-compose`)

## 🚀 Quick Start

### Local Development

#### Option 1: One-Command Startup (Recommended)

Run everything with a single script:

```bash
./start-dev.sh
```

This command will:

1. ✅ Check and install dependencies
2. ✅ Start PostgreSQL database in Docker
3. ✅ Run database migrations
4. ✅ Start backend server with hot-reloading
5. ✅ Start frontend server with hot-reloading

Both servers will automatically restart when you save changes to files!

**Access the app:**

- Frontend: http://localhost:5173 (Vite dev server with proxy)
- Backend: http://localhost:3000
- Database: localhost:5432

#### Option 2: Manual Setup

If you prefer to run services separately:

**1. Setup Database**

```bash
./setup-db.sh
```

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
   git checkout Unity_Minigames
   ```

2. **Create environment file:**

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

## 🗄️ Database Management

### View Database Logs

```bash
docker logs social_photo_game_db
```

### Access PostgreSQL CLI

```bash
docker exec -it social_photo_game_db psql -U user -d social_app
```

### Stop Database

```bash
docker-compose down
```

### Remove Database & Data (⚠️ destructive)

```bash
docker-compose down -v
```

### Open Drizzle Studio (Database GUI)

```bash
cd backend
pnpm db:studio
```

### Generate New Migration

After modifying `backend/src/db/models/schema.ts`:

```bash
cd backend
pnpm db:generate
pnpm db:push
```

## 🔧 Available Scripts

### Backend Scripts

```bash
cd backend

pnpm dev           # Start dev server with hot-reload
pnpm db:generate   # Generate migration from schema changes
pnpm db:migrate    # Run migrations
pnpm db:push       # Push schema changes directly to database
pnpm db:studio     # Open Drizzle Studio GUI
```

### Frontend Scripts

```bash
cd frontend

pnpm dev           # Start dev server with HMR
pnpm build         # Build for production
pnpm preview       # Preview production build
pnpm lint          # Run ESLint
```

## 📁 Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── server.ts              # Express server entry point
│   │   ├── config/
│   │   │   └── db.ts              # Database configuration
│   │   ├── controllers/
│   │   │   └── friends.ts         # Friend-related logic
│   │   ├── db/
│   │   │   ├── migrations/        # Drizzle migrations
│   │   │   └── models/
│   │   │       └── schema.ts      # Database schema
│   │   ├── lib/
│   │   │   └── auth.ts            # Better Auth configuration
│   │   ├── middleware/
│   │   │   └── requireAuth.ts     # Auth middleware
│   │   └── routes/
│   │       └── friendRoutes.ts    # Friend routes
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── main.tsx               # React entry point
│   │   ├── App.tsx                # Main app component
│   │   ├── lib/
│   │   │   └── auth-client.ts     # Better Auth client
│   │   └── assets/
│   └── package.json
│
├── docker-compose.yml             # PostgreSQL container config
├── setup-db.sh                    # Database setup script
├── start-dev.sh                   # All-in-one dev startup script
└── README.md                      # This file
```

## 🔥 Hot-Reloading

Both frontend and backend support hot-reloading:

- **Frontend**: Vite's HMR updates the browser instantly when you save files
- **Backend**: Nodemon watches for `.ts` file changes and restarts the server automatically

## 🐛 Troubleshooting

### Port Already in Use

If you get a "port already in use" error:

```bash
# Find and kill the process using the port
lsof -ti:5432 | xargs kill -9  # For database
lsof -ti:5173 | xargs kill -9  # For frontend
```

### Docker Container Issues

```bash
# Stop and remove the container
docker-compose down

# Start fresh
./setup-db.sh
```

### Database Connection Failed

Make sure the PostgreSQL container is running:

```bash
docker ps | grep social_photo_game_db
```

If not running, start it:

```bash
./setup-db.sh
```

### Dependencies Out of Sync

```bash
# Reinstall all dependencies
cd backend && pnpm install
cd ../frontend && pnpm install
```

### Script Permission Denied

```bash
# Make scripts executable
chmod +x setup-db.sh start-dev.sh
```

## 📚 Additional Resources

- [Better Auth Documentation](https://www.better-auth.com/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Express Documentation](https://expressjs.com/)

## 📄 License

ISC

## 🤝 Contributing

1. Make your changes
2. Test locally with `./start-dev.sh`
3. Ensure hot-reloading works for your changes
4. Submit your pull request

---

For detailed development setup instructions, see [DEV_SETUP.md](./DEV_SETUP.md).
