# ==============================================================================
# PRASADAM DINE - BACKEND PRODUCTION DOCKERFILE
# Multi-stage production build for NestJS application
# ==============================================================================

# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package*.json ./
RUN npm ci

# Copy source and config files
COPY tsconfig*.json nest-cli.json ./
COPY src ./src

# Compile TypeScript to JavaScript in /app/dist
RUN npm run build

# Stage 2: Production Runtime
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

# Install curl for Docker health check
RUN apk add --no-cache curl

# Add non-root system user for security
RUN addgroup -S prasadam && adduser -S prasadam -G prasadam

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy compiled build output from builder
COPY --from=builder --chown=prasadam:prasadam /app/dist ./dist

# Create uploads directory for fallback local storage with non-root permissions
RUN mkdir -p /app/uploads && chown -R prasadam:prasadam /app/uploads

USER prasadam

EXPOSE 4000

# Production Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:4000/api/v1/health || exit 1

CMD ["node", "dist/main.js"]
