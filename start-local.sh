#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting Space Arcade Game Locally${NC}"
echo "=================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose.${NC}"
    exit 1
fi

echo -e "${YELLOW}📦 Building and starting services...${NC}"

# Create .env files if they don't exist
if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}📝 Creating backend .env file...${NC}"
    cp env.example backend/.env
fi

if [ ! -f "frontend/.env" ]; then
    echo -e "${YELLOW}📝 Creating frontend .env file...${NC}"
    cp frontend/env.example frontend/.env
fi

# Start services with no cache to ensure fresh build
docker-compose up --build --force-recreate -d

echo -e "${GREEN}✅ Services started successfully!${NC}"
echo ""
echo -e "${BLUE}🌐 Access the application:${NC}"
echo -e "   Frontend: ${GREEN}http://localhost:3000${NC}"
echo -e "   Backend API: ${GREEN}http://localhost:4000${NC}"
echo -e "   Database: ${GREEN}localhost:5432${NC}"
echo ""
echo -e "${YELLOW}📊 To view logs:${NC}"
echo -e "   docker-compose logs -f"
echo ""
echo -e "${YELLOW}🛑 To stop services:${NC}"
echo -e "   docker-compose down"
echo ""
echo -e "${GREEN}🎮 Ready to play!${NC}"