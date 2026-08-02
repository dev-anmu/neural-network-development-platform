# Base stage for shared steps
FROM node:23-alpine AS base
WORKDIR /app
COPY frontend/package*.json ./

# Development stage
FROM base AS development
RUN npm install
COPY frontend/ ./
EXPOSE 4200
CMD ["npm", "run", "start", "--", "--host", "0.0.0.0", "--poll", "500"]

# Build stage
FROM base AS build
ARG BASE_HREF=/
RUN npm install
COPY frontend/ ./
RUN npm run build -- --configuration=production --base-href=${BASE_HREF}

# Production stage — static SPA behind nginx on 8080
FROM nginx:alpine AS production
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/webnet-builder-frontend/browser /usr/share/nginx/html
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
