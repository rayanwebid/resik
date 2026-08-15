# Stage 1: Build stage
FROM node:20-alpine AS build_stage
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy code and build
COPY . .
RUN npm run build

# Stage 2: Runtime stage
FROM nginx:alpine
COPY --from=build_stage /app/dist /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
