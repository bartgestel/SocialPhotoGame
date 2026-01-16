#!/bin/bash
set -e

echo "🛑 Stopping containers..."
docker compose down

echo "🗑️  Removing old volumes (this will delete your database data)..."
docker volume rm socialphotogame_postgres_data 2>/dev/null || echo "Volume doesn't exist, skipping..."

echo "🔨 Rebuilding containers..."
docker compose build --no-cache

echo "🚀 Starting services..."
docker compose up -d

echo "📊 Viewing logs (Ctrl+C to exit, containers will keep running)..."
docker compose logs -f
