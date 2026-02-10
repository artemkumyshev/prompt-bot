# =============================================================================
# Stage 1: Build
# =============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Зависимости (кэш слоя при неизменных package*.json)
COPY package.json package-lock.json* ./
RUN npm ci

# Конфигурация и схема Prisma
COPY tsconfig*.json nest-cli.json ./
COPY prisma ./prisma/

RUN npx prisma generate

# Исходный код и сборка
COPY src ./src/
RUN npm run build

# Проверка точки входа (Nest с rootDir: src даёт dist/src/main.js)
RUN test -f dist/src/main.js || (echo "Build output missing." && ls -laR dist && exit 1)

# =============================================================================
# Stage 2: Production
# =============================================================================
FROM node:20-alpine AS production

RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001 -G nodejs

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Только production-зависимости
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev && npm cache clean --force

# Артефакты из builder
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma

USER nodejs

EXPOSE 3000

CMD ["node", "dist/src/main.js"]
