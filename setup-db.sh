#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

CONTAINER_NAME="social_photo_game_db"
DB_NAME="social_app"
DB_USER="user"
DB_PORT="5432"

echo -e "${BLUE}=== Database Setup ===${NC}\n"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null 2>&1; then
    echo -e "${RED}Error: Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

# Determine docker compose command
if docker compose version &> /dev/null 2>&1; then
    DOCKER_COMPOSE="docker compose"
else
    DOCKER_COMPOSE="docker-compose"
fi

# Check if container exists
if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo -e "${YELLOW}Container '${CONTAINER_NAME}' already exists.${NC}"

    # Check if it's running
    if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        echo -e "${GREEN}✓ Container is already running.${NC}"
    else
        echo -e "${YELLOW}Starting existing container...${NC}"
        $DOCKER_COMPOSE up -d
        echo -e "${GREEN}✓ Container started.${NC}"
    fi
else
    echo -e "${BLUE}Creating new PostgreSQL container...${NC}"
    $DOCKER_COMPOSE up -d
    echo -e "${GREEN}✓ Container created and started.${NC}"

    # Wait for database to be ready
    echo -e "${YELLOW}Waiting for database to be ready...${NC}"
    sleep 5
fi

# Wait for health check
echo -e "${YELLOW}Verifying database health...${NC}"
RETRY_COUNT=0
MAX_RETRIES=30

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if docker exec $CONTAINER_NAME pg_isready -U $DB_USER -d $DB_NAME &> /dev/null; then
        echo -e "${GREEN}✓ Database is healthy and ready!${NC}"

        # Run migrations
        echo -e "${BLUE}Running database migrations...${NC}"
        cd backend
        if pnpm db:push; then
            echo -e "${GREEN}✓ Migrations completed successfully.${NC}"
        else
            echo -e "${YELLOW}Note: Migration command ran (check output above for details).${NC}"
        fi
        cd ..

        exit 0
    fi

    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo -e "${YELLOW}Waiting... ($RETRY_COUNT/$MAX_RETRIES)${NC}"
    sleep 2
done

echo -e "${RED}Error: Database failed to become ready within expected time.${NC}"
exit 1

