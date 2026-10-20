# Stage 1: Build the static web app from monorepo workspace
FROM node:20-alpine AS builder
WORKDIR /workspace

# Copy root package manifests and workspace manifests for efficient caching
COPY package.json package-lock.json ./
COPY packages/design-tokens/package.json ./packages/design-tokens/
COPY apps/mobile/package.json ./apps/mobile/

# Install dependencies across all workspaces
RUN npm ci

# Copy source code
COPY packages/design-tokens/ ./packages/design-tokens/
COPY apps/mobile/ ./apps/mobile/

# Build design tokens
RUN npm run build --workspace=@tutorzen/design-tokens

# Export static web bundle
WORKDIR /workspace/apps/mobile
RUN npx expo export --platform web

# Stage 2: Serve using high-performance Nginx
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Custom nginx configuration for SPA routing & port 8081
COPY apps/mobile/nginx.conf /etc/nginx/conf.d/default.conf

# Copy exported web build artifacts from builder
COPY --from=builder /workspace/apps/mobile/dist/ .

EXPOSE 8081

CMD ["nginx", "-g", "daemon off;"]

