#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🛑 Stopping Space Arcade Game${NC}"
echo "============================="

# Stop and remove containers
docker-compose down

echo -e "${GREEN}✅ All services stopped successfully!${NC}"
echo ""
echo -e "${YELLOW}💡 To remove volumes and data:${NC}"
echo -e "   docker-compose down -v"
echo ""
echo -e "${YELLOW}💡 To remove images:${NC}"
echo -e "   docker-compose down --rmi all"