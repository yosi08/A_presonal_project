# =============================================
# Stage 1: Build
# =============================================
FROM node:20-alpine AS builder

WORKDIR /app

# 의존성 설치 (package.json 변경이 없으면 캐시 재사용)
COPY package*.json ./
RUN npm ci

# 소스 복사 후 TypeScript 컴파일
COPY tsconfig.json ./
COPY prisma ./prisma/
COPY src ./src/

# Prisma Client 생성 + 빌드
RUN npx prisma generate
RUN npm run build

# =============================================
# Stage 2: Production
# =============================================
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

# openssl 설치 (Prisma 엔진 런타임 의존성)
RUN apk add --no-cache openssl

# 프로덕션 의존성만 설치
COPY package*.json ./
RUN npm ci --omit=dev

# Prisma Client 재생성 (프로덕션 node_modules 기준)
COPY prisma ./prisma/
RUN npx prisma generate

# 빌드 결과물만 복사
COPY --from=builder /app/dist ./dist

# 보안: non-root 유저로 실행
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 8080

# 컨테이너 헬스체크
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:8080/health || exit 1

CMD ["node", "dist/server.js"]
