# ----------- Build 阶段 ------------------
FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY pnpm-lock.yaml ./
COPY package.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./
# 复制 prisma 目录（包含 schema.prisma）
COPY prisma ./prisma

RUN pnpm install 

# 生成 Prisma Client
RUN pnpm prisma generate

COPY . .


RUN pnpm build


# ----------- Production 阶段 ------------------
FROM node:22-alpine AS runner

ENV NODE_ENV=production

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
# 复制 prisma 目录（某些场景下运行时可能需要）
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD ["node", "dist/src/main"]