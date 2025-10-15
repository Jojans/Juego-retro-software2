#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Debugging Frontend Container${NC}"
echo "==============================="

# Check if container is running
echo -e "${YELLOW}📊 Container Status:${NC}"
docker ps | grep space-arcade-frontend

echo ""
echo -e "${YELLOW}📁 Files in container:${NC}"
docker exec space-arcade-frontend ls -la /app/src/

echo ""
echo -e "${YELLOW}📄 App.tsx content:${NC}"
docker exec space-arcade-frontend cat /app/src/App.tsx | head -10

echo ""
echo -e "${YELLOW}📄 index.tsx content:${NC}"
docker exec space-arcade-frontend cat /app/src/index.tsx

echo ""
echo -e "${YELLOW}📊 Container logs:${NC}"
docker logs space-arcade-frontend --tail 20

echo ""
echo -e "${YELLOW}🔧 Package.json scripts:${NC}"
docker exec space-arcade-frontend cat /app/package.json | grep -A 10 '"scripts"'
