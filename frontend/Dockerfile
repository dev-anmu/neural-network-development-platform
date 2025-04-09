# Base stage for shared steps
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./

# Development stage
FROM base AS development
RUN npm install
COPY . .
EXPOSE 4200
CMD ["npm", "run", "start", "--", "--host", "0.0.0.0", "--poll", "500"]

# Build stage
FROM base AS build
RUN npm install
COPY . .
RUN npm run build --prod

# Production stage
FROM nginx:alpine AS production
COPY --from=build /app/dist/* /usr/share/nginx/html/
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"] 