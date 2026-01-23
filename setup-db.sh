#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

CONTAINER_NAME="socialphotogame-db"
DB_NAME="socialphotogame"
DB_USER="postgres"
DB_PORT="5432"
DB_PASSWORD="password"

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
        docker start $CONTAINER_NAME
        echo -e "${GREEN}✓ Container started.${NC}"
        sleep 3
    fi
else
    echo -e "${BLUE}Creating new PostgreSQL container...${NC}"
    $DOCKER_COMPOSE up -d postgres
    echo -e "${GREEN}✓ Container created and started.${NC}"
    sleep 5
fi

# Wait for health check
echo -e "${YELLOW}Verifying database health...${NC}"
RETRY_COUNT=0
MAX_RETRIES=30

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if docker exec $CONTAINER_NAME pg_isready -U $DB_USER &> /dev/null; then
        echo -e "${GREEN}✓ PostgreSQL is healthy and ready!${NC}"
        
        # Create database if it doesn't exist
        echo -e "${BLUE}Creating database '${DB_NAME}' if it doesn't exist...${NC}"
        docker exec $CONTAINER_NAME psql -U $DB_USER -tc "SELECT 1 FROM pg_database WHERE datname = '${DB_NAME}'" | grep -q 1 && \
            echo -e "${GREEN}✓ Database '${DB_NAME}' already exists.${NC}" || \
            (docker exec $CONTAINER_NAME psql -U $DB_USER -c "CREATE DATABASE ${DB_NAME};" && \
             echo -e "${GREEN}✓ Database '${DB_NAME}' created successfully!${NC}")

        echo ""
        echo -e "${GREEN}=== Database Setup Complete ===${NC}"
        echo -e "${BLUE}Connection Details:${NC}"
        echo -e "  Host: localhost"
        echo -e "  Port: ${DB_PORT}"
        echo -e "  Database: ${DB_NAME}"
        echo -e "  User: ${DB_USER}"
        echo -e "  Password: ${DB_PASSWORD}"
        echo ""
        echo -e "${YELLOW}Next Steps:${NC}"
        echo -e "  1. Run migrations: ${BLUE}cd backend && pnpm db:push${NC}"
        echo -e "  2. Seed games data: ${BLUE}pnpm run seed:games${NC}"
        echo -e "  3. Start dev server: ${BLUE}cd .. && ./start-dev.sh${NC}"
        echo ""
        
        exit 0
    fi

    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo -e "${YELLOW}Waiting... ($RETRY_COUNT/$MAX_RETRIES)${NC}"
    sleep 2
done

echo -e "${RED}Error: Database failed to become ready within expected time.${NC}"
exit 1

