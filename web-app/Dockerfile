# Build stage
FROM node:18-alpine AS build
WORKDIR /app

COPY mobile-app/package*.json ./
RUN npm ci

ARG VITE_API_BASE_URL=http://localhost:8080
ARG VITE_DATA_SOURCE=api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_DATA_SOURCE=$VITE_DATA_SOURCE

COPY mobile-app ./
RUN npm run build

# Production stage avec Nginx
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Supprimer les fichiers par défaut de Nginx
RUN rm -rf ./*

# Copier les fichiers buildés depuis le stage de build
COPY --from=build /app/dist .

# Copier la configuration Nginx personnalisée
COPY web-app/nginx.conf /etc/nginx/conf.d/default.conf

# Exposer le port
EXPOSE 80

# Démarrer Nginx
CMD ["nginx", "-g", "daemon off;"]
