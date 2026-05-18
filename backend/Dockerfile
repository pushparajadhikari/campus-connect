FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:22-alpine
WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY --from=builder /app/node_modules ./node_modules
COPY . .
RUN mkdir -p uploads && chown -R appuser:appgroup /app
USER appuser
EXPOSE 5000
CMD ["node", "src/server.js"]
