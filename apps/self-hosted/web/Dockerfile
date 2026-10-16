# ==============================
#  Stage 1: Build frontend
# ==============================
FROM node:20-slim AS builder

WORKDIR /app

# Cài đặt dependencies
# (retry flags: registry.npmjs.org thỉnh thoảng timeout trong môi trường build)
# NOTE: image node:* mặc định NODE_ENV=production nên npm ci sẽ bỏ qua
# devDependencies (vite, legacy plugin...) → phải --include=dev thì build mới chạy.
COPY package*.json ./
RUN npm ci --include=dev --fetch-retries=5 --fetch-retry-mintimeout=20000 --fetch-retry-maxtimeout=120000

# Copy source code
COPY . .

# Build ở chế độ production
# Lưu ý: các biến VITE_* sẽ được đọc từ .env.production nếu file này tồn tại trong context
ENV NODE_ENV=production
# Doctor + self-heal: in ra chẩn đoán để debug, cài lại nếu thiếu vite.
RUN echo "=== doctor ===" && node --version && npm --version && echo "omit config: $(npm config get omit)" && echo "bin count: $(ls node_modules/.bin 2>/dev/null | wc -l)" && ls -la node_modules/.bin/vite 2>&1; if [ ! -x node_modules/.bin/vite ]; then echo "VITE MISSING -> reinstalling dev deps..."; npm ci --include=dev --fetch-retries=5 --fetch-retry-mintimeout=20000 --fetch-retry-maxtimeout=120000; echo "after reinstall:"; ls -la node_modules/.bin/vite; fi
RUN test -x node_modules/.bin/vite && npm run build

# ==============================
#  Stage 2: Serve build (Vite preview)
# ==============================
FROM node:20-slim AS runner

WORKDIR /app
ENV NODE_ENV=production

# Copy package info + node_modules để dùng script npm preview
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

# Copy thư mục build
COPY --from=builder /app/dist ./dist

# (Tùy chọn) copy thêm vite.config nếu Vite cần khi preview
COPY --from=builder /app/vite.config.js ./vite.config.js

EXPOSE 5173

# Chạy Vite preview, listen 0.0.0.0 để truy cập từ ngoài
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "5173"]
