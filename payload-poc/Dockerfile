# syntax=docker/dockerfile:1
# Production image for the Payload + Next.js app. Based on the official Payload
# template / Next.js "with-docker" example: multi-stage, standalone output, non-root.
# Build context: this directory (payload-poc/).

ARG NODE_VERSION=24.22.3

FROM node:${NODE_VERSION}-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# 1. Dependencies, cached until package.json or the lockfile change.
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    corepack enable pnpm && pnpm install --frozen-lockfile

# 2. Build. Pages render per request (force-dynamic), so no database is needed here.
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_OPTIONS="--no-deprecation --max-old-space-size=3072"
RUN corepack enable pnpm && pnpm run build

# 3. Runtime: only the traced standalone server and static assets.
FROM base AS runner
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    MEDIA_DIR=/app/media

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Upload directory. Mount a volume here in production (deploy/compose.yml does).
RUN mkdir -p /app/media && chown nextjs:nodejs /app/media

# Set by CI from the git tag, exposed on /healthz.
ARG APP_VERSION=dev
ENV APP_VERSION=${APP_VERSION}

USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=15s --timeout=5s --start-period=60s --retries=4 \
  CMD node -e "fetch('http://127.0.0.1:3000/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# Pending migrations run while Payload initialises (src/instrumentation.ts → prodMigrations).
CMD ["node", "server.js"]
