# SocialPhotoGame - Docker Deployment Guide

## Quick Start (Local Testing)

1. **Clone the repository:**

```bash
git clone https://github.com/bartgestel/SocialPhotoGame.git
cd SocialPhotoGame
```

2. **Create environment file:**

```bash
cp .env.example .env
nano .env  # Edit with your values
```

3. **Start with Docker Compose:**

```bash
./deploy.sh
```

That's it! The app will be available at:

- Frontend: http://localhost
- Backend API: http://localhost:3000

## VPS Deployment

### Prerequisites

- VPS with Ubuntu 20.04+ or similar
- Docker and Docker Compose installed
- Domain name pointed to your VPS (optional but recommended)
- At least 2GB RAM and 20GB disk space

### Step 1: Install Docker on VPS

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add your user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Install Docker Compose (if not included)
sudo apt-get update
sudo apt-get install docker-compose-plugin
```

### Step 2: Clone and Configure

```bash
# Clone repository
git clone https://github.com/bartgestel/SocialPhotoGame.git
cd SocialPhotoGame

# Create .env file
cp .env.example .env
nano .env
```

Edit `.env` with your production values:

```env
# Database
DB_PASSWORD=use_a_very_strong_password_here

# Backend Auth
BETTER_AUTH_SECRET=generate_random_32_chars_or_more
BETTER_AUTH_URL=https://yourdomain.com
GAME_SECRET_KEY=A64814991BEEC14ED7747FE2E1AFD

# Frontend
VITE_API_URL=https://yourdomain.com
```

**Generate secure secrets:**

```bash
# Generate BETTER_AUTH_SECRET
openssl rand -base64 32

# Generate DB_PASSWORD
openssl rand -base64 24
```

### Step 3: Deploy

```bash
# Make deploy script executable
chmod +x deploy.sh

# Deploy
./deploy.sh
```

### Step 4: Setup Nginx Reverse Proxy (for HTTPS)

If you want HTTPS with your domain:

```bash
sudo apt-get install nginx certbot python3-certbot-nginx

# Create nginx config
sudo nano /etc/nginx/sites-available/socialphotogame
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable and get SSL:

```bash
sudo ln -s /etc/nginx/sites-available/socialphotogame /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com
```

## Management Commands

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Check Status

```bash
docker-compose ps
```

### Restart Services

```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
```

### Stop Services

```bash
docker-compose down
```

### Update After Code Changes

```bash
git pull
./deploy.sh
```

### Database Management

```bash
# Access PostgreSQL
docker-compose exec postgres psql -U postgres -d socialphotogame

# Backup database
docker-compose exec postgres pg_dump -U postgres socialphotogame > backup.sql

# Restore database
cat backup.sql | docker-compose exec -T postgres psql -U postgres socialphotogame
```

### Clean Everything (WARNING: Deletes all data)

```bash
docker-compose down -v
```

## Environment Variables

| Variable             | Description            | Example                       |
| -------------------- | ---------------------- | ----------------------------- |
| `DB_PASSWORD`        | PostgreSQL password    | Strong random password        |
| `BETTER_AUTH_SECRET` | Auth encryption key    | 32+ character random string   |
| `BETTER_AUTH_URL`    | Public URL of your app | https://yourdomain.com        |
| `GAME_SECRET_KEY`    | Game verification key  | A64814991BEEC14ED7747FE2E1AFD |
| `VITE_API_URL`       | Backend API URL        | https://yourdomain.com        |

## Troubleshooting

### Backend won't start

```bash
# Check logs
docker-compose logs backend

# Common issues:
# - Database not ready: Wait 30s and check again
# - Migration failed: Run manually:
docker-compose exec backend pnpm exec drizzle-kit push
```

### Frontend shows 502 errors

```bash
# Check if backend is running
docker-compose ps

# Check backend logs
docker-compose logs backend

# Restart backend
docker-compose restart backend
```

### Database connection issues

```bash
# Check if postgres is running
docker-compose ps postgres

# Check postgres logs
docker-compose logs postgres

# Restart postgres (WARNING: May cause downtime)
docker-compose restart postgres
```

### Upload directory permissions

```bash
# Fix permissions
docker-compose exec backend chown -R node:node /app/uploads
docker-compose restart backend
```

## Security Best Practices

1. **Use strong passwords** for `DB_PASSWORD`
2. **Generate unique `BETTER_AUTH_SECRET`** (never reuse)
3. **Use HTTPS** in production (via Certbot/Let's Encrypt)
4. **Regular backups** of database and uploads
5. **Keep Docker images updated:**
   ```bash
   docker-compose pull
   docker-compose up -d
   ```
6. **Monitor logs** for suspicious activity
7. **Set up firewall:**
   ```bash
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw allow 22/tcp
   sudo ufw enable
   ```

## Performance Tuning

### For Production

Edit `docker-compose.yml`:

```yaml
backend:
  deploy:
    resources:
      limits:
        cpus: "1"
        memory: 1G
      reservations:
        memory: 512M
```

### Database Optimization

```bash
# Connect to postgres
docker-compose exec postgres psql -U postgres -d socialphotogame

# Run vacuum
VACUUM ANALYZE;
```

## Monitoring

### Resource Usage

```bash
docker stats
```

### Disk Usage

```bash
docker system df
docker volume ls
```

## Support

For issues or questions:

- GitHub Issues: https://github.com/bartgestel/SocialPhotoGame/issues
- Check logs first: `docker-compose logs -f`
