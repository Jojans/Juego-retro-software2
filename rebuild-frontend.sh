#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔄 Rebuilding Frontend Container${NC}"
echo "================================"

# Stop and remove existing containers
echo -e "${YELLOW}🛑 Stopping existing containers...${NC}"
docker-compose down

# Remove frontend container and image
echo -e "${YELLOW}🗑️ Removing frontend container and image...${NC}"
docker rm space-arcade-frontend 2>/dev/null || true
docker rmi juego_software-frontend 2>/dev/null || true

# Rebuild and start
echo -e "${YELLOW}🔨 Rebuilding frontend...${NC}"
docker-compose build --no-cache frontend

echo -e "${YELLOW}🚀 Starting services...${NC}"
docker-compose up -d

echo -e "${GREEN}✅ Frontend rebuilt successfully!${NC}"
echo ""
echo -e "${BLUE}🌐 Access the application:${NC}"
echo -e "   Frontend: ${GREEN}http://localhost:3000${NC}"
echo -e "   Backend API: ${GREEN}http://localhost:4000${NC}"
echo ""
echo -e "${YELLOW}📊 To view logs:${NC}"
echo -e "   docker-compose logs -f frontend"
