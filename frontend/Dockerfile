# Development Dockerfile for React app
FROM node:18-alpine

WORKDIR /app

# Install dependencies first
COPY package*.json ./
RUN npm install

# Copy all source files
COPY . .

# Set environment variables
ENV CHOKIDAR_USEPOLLING=true
ENV WATCHPACK_POLLING=true

# Expose port
EXPOSE 3000

# Start development server
CMD ["npm", "start"]
