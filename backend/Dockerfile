FROM node:20-alpine AS base

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
FROM base AS dependencies
RUN pnpm install --frozen-lockfile

# Build stage
FROM base AS build
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN pnpm run build

# Production stage
FROM node:20-alpine AS production

RUN npm install -g pnpm

WORKDIR /app

# Copy package files and install production dependencies only
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

# Install drizzle-kit for migrations (needed at runtime)
RUN pnpm add -D drizzle-kit

# Copy built files
COPY --from=build /app/dist ./dist

# Copy drizzle config and schema for migrations
COPY drizzle.config.ts ./
COPY --from=build /app/src/db ./src/db

# Create uploads directory
RUN mkdir -p /app/uploads

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)}).on('error', () => process.exit(1))"

# Create startup script that runs migrations then starts server
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'set -e' >> /app/start.sh && \
    echo 'echo "Waiting for database to be ready..."' >> /app/start.sh && \
    echo 'sleep 5' >> /app/start.sh && \
    echo 'echo "Running database migrations..."' >> /app/start.sh && \
    echo 'pnpm drizzle-kit push --force || { echo "Migration failed"; exit 1; }' >> /app/start.sh && \
    echo 'echo "Migrations completed successfully!"' >> /app/start.sh && \
    echo 'echo "Starting server..."' >> /app/start.sh && \
    echo 'exec node dist/server.js' >> /app/start.sh && \
    chmod +x /app/start.sh

CMD ["/app/start.sh"]
