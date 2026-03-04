# ----------- Build 阶段 ------------------
FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY pnpm-lock.yaml ./
COPY package.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

RUN pnpm install 


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

EXPOSE 3000

CMD ["node", "dist/src/main"]