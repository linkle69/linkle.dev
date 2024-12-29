# Use the official Bun image
FROM oven/bun:latest

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY bun.lockb ./

# Install dependencies
RUN bun install

# Copy source code from src folder only
COPY src ./src

# Expose port
EXPOSE 3000

# Start the application
CMD ["bun", "run", "src/index.ts"]