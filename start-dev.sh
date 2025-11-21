#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Kill background processes on script exit
trap 'echo -e "\n${YELLOW}Shutting down servers...${NC}"; kill $(jobs -p) 2>/dev/null' EXIT

echo -e "${BLUE}=== Social Photo Game Development Servers ===${NC}\n"

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo -e "${RED}Error: pnpm is not installed. Please install it first.${NC}"
    exit 1
fi

# Install dependencies if needed
echo -e "${BLUE}[0/4] Checking dependencies...${NC}"

if [ ! -d "backend/node_modules" ]; then
    echo -e "${YELLOW}Installing backend dependencies...${NC}"
    cd backend && pnpm install && cd ..
    echo -e "${GREEN}✓ Backend dependencies installed${NC}"
fi

if [ ! -d "frontend/node_modules" ]; then
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    cd frontend && pnpm install && cd ..
    echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
fi

# Setup database (if not already running)
echo -e "\n${BLUE}[1/4] Checking database...${NC}"
if ./setup-db.sh; then
    echo -e "${GREEN}✓ Database is ready${NC}\n"
else
    echo -e "${RED}Failed to setup database. Exiting.${NC}"
    exit 1
fi

# Start backend
echo -e "${GREEN}[2/4] Starting backend server...${NC}"
cd backend || { echo -e "${RED}Backend directory not found${NC}"; exit 1; }
pnpm dev 2>&1 | sed "s/^/[BACKEND] /" &
BACKEND_PID=$!
cd ..

# Give backend a moment to start
sleep 2

# Start frontend
echo -e "${GREEN}[3/4] Starting frontend server...${NC}"
cd frontend || { echo -e "${RED}Frontend directory not found${NC}"; exit 1; }
pnpm dev 2>&1 | sed "s/^/[FRONTEND] /" &
FRONTEND_PID=$!
cd ..

echo -e "\n${BLUE}=== All services started! ===${NC}"
echo -e "${GREEN}Database: ${NC}PostgreSQL running in Docker (container: social_photo_game_db)"
echo -e "${GREEN}Backend PID: ${NC}$BACKEND_PID"
echo -e "${GREEN}Frontend PID: ${NC}$FRONTEND_PID"
echo -e "\n${YELLOW}Hot-reloading is enabled:${NC}"
echo -e "  • Backend will restart when you save .ts files"
echo -e "  • Frontend will hot-reload when you save any files"
echo -e "\n${BLUE}Press Ctrl+C to stop all servers${NC}\n"

# Wait for all background jobs
wait

