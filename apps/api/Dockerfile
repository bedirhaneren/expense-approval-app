# syntax=docker/dockerfile:1

# ---- deps: all dependencies; postinstall generates the Prisma client ----
FROM node:26-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json prisma.config.ts ./
COPY prisma ./prisma
RUN npm ci

# ---- migrate: one-off job that applies migrations and seeds demo users ----
FROM deps AS migrate
CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed"]

# ---- build: compile TypeScript to dist/ ----
FROM deps AS build
COPY . .
RUN npm run build

# ---- runtime: production dependencies and compiled code only ----
FROM node:26-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force
COPY --from=build /app/dist ./dist
USER node
EXPOSE 3001
HEALTHCHECK --interval=10s --timeout=3s --start-period=10s --retries=5 \
  CMD wget -qO- http://127.0.0.1:3001/health || exit 1
CMD ["node", "dist/main.js"]
