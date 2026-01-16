#!/bin/bash
# Script to manually create the database if needed

set -e

echo "Creating database 'socialphotogame' if it doesn't exist..."

docker exec -it socialphotogame-db psql -U postgres -c "SELECT 'CREATE DATABASE socialphotogame' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'socialphotogame')\gexec" || {
    echo "Trying alternative method..."
    docker exec -it socialphotogame-db psql -U postgres -tc "SELECT 1 FROM pg_database WHERE datname = 'socialphotogame'" | grep -q 1 || docker exec -it socialphotogame-db psql -U postgres -c "CREATE DATABASE socialphotogame;"
}

echo "✅ Database created/verified!"
echo "Now restarting backend to run migrations..."

docker compose restart backend

echo "✅ Done! Check logs with: docker compose logs -f backend"
