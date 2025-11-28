#!/bin/bash

echo "🚀 Deploying SocialPhotoGame..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "📝 Creating .env from .env.example..."
    cp .env.example .env
    echo "⚠️  Please edit .env with your credentials before continuing!"
    exit 1
fi

# Pull latest code
echo "📦 Pulling latest code..."
git pull

# Build and start containers
echo "🐳 Building and starting Docker containers..."
docker compose down
docker compose build --no-cache
docker compose up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to start..."
sleep 15

# Check container status
echo "📊 Container Status:"
docker compose ps

# Show logs
echo "📜 Recent logs:"
docker compose logs --tail=50

echo ""
echo "✅ Deployment complete!"
echo "🌐 Frontend: http://localhost"
echo "🔌 Backend API: http://localhost:3000"
echo ""
echo "📊 View logs: docker-compose logs -f"
echo "🛑 Stop: docker-compose down"
echo "🔄 Restart: docker-compose restart"
echo "🔍 Check status: docker-compose ps"
