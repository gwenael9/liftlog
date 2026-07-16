FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine AS production

WORKDIR /app

# Install Tailscale
RUN apk add --no-cache tailscale curl

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist

EXPOSE 3000

# Script de démarrage avec Tailscale
CMD ["sh", "-c", "tailscale up --authkey=${TAILSCALE_AUTH_KEY} --hostname=liftlog-api && sleep 5 && node dist/main"]