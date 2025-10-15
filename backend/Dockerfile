# Development Dockerfile for backend (no build, uses ts-node)
FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source files
COPY . .

# Expose port
EXPOSE 4000

# Default command uses nodemon for hot reload
CMD ["npx", "nodemon", "--legacy-watch", "--exec", "npx ts-node src/index.ts"]

