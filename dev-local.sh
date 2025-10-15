#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting Space Arcade Game in Development Mode${NC}"
echo "=============================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+ first.${NC}"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed. Please install npm first.${NC}"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version 18+ is required. Current version: $(node -v)${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node -v) detected${NC}"

# Create .env files if they don't exist
if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}📝 Creating backend .env file...${NC}"
    cp env.example backend/.env
fi

if [ ! -f "frontend/.env" ]; then
    echo -e "${YELLOW}📝 Creating frontend .env file...${NC}"
    cp frontend/env.example frontend/.env
fi

# Install dependencies
echo -e "${YELLOW}📦 Installing backend dependencies...${NC}"
cd backend
if [ ! -d "node_modules" ]; then
    npm install
fi

echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
cd ../frontend
if [ ! -d "node_modules" ]; then
    npm install
fi

cd ..

# Start PostgreSQL with Docker if not running
echo -e "${YELLOW}🐘 Starting PostgreSQL...${NC}"
if ! docker ps | grep -q postgres-space-arcade; then
    docker run -d --name postgres-space-arcade \
        -e POSTGRES_DB=space_arcade \
        -e POSTGRES_USER=spacearcade \
        -e POSTGRES_PASSWORD=password123 \
        -p 5432:5432 postgres:15-alpine
    echo -e "${GREEN}✅ PostgreSQL started${NC}"
else
    echo -e "${GREEN}✅ PostgreSQL already running${NC}"
fi

# Wait for PostgreSQL to be ready
echo -e "${YELLOW}⏳ Waiting for PostgreSQL to be ready...${NC}"
sleep 5

# Start backend
echo -e "${YELLOW}🔧 Starting backend...${NC}"
cd backend
npm run dev &
BACKEND_PID=$!

# Start frontend
echo -e "${YELLOW}🎨 Starting frontend...${NC}"
cd ../frontend
npm start &
FRONTEND_PID=$!

cd ..

echo -e "${GREEN}✅ Development servers started!${NC}"
echo ""
echo -e "${BLUE}🌐 Access the application:${NC}"
echo -e "   Frontend: ${GREEN}http://localhost:3000${NC}"
echo -e "   Backend API: ${GREEN}http://localhost:4000${NC}"
echo -e "   Database: ${GREEN}localhost:5432${NC}"
echo ""
echo -e "${YELLOW}🛑 To stop servers:${NC}"
echo -e "   Press Ctrl+C or run: kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo -e "${GREEN}🎮 Ready to develop!${NC}"

# Wait for user to stop
wait
