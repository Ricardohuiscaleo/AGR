FROM php:8.3-fpm-alpine AS php-base
RUN apk add --no-cache nginx

FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./

FROM base AS deps
RUN npm ci

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM php-base AS runtime
COPY --from=build /app/dist /usr/share/nginx/html
COPY php-apis /usr/share/nginx/html/php-apis

# Configurar Nginx
RUN echo 'server { \n\
    listen 80; \n\
    root /usr/share/nginx/html; \n\
    index index.html; \n\
    location / { \n\
        try_files $uri $uri/ /index.html; \n\
    } \n\
    location ~ \\.php$ { \n\
        fastcgi_pass 127.0.0.1:9000; \n\
        fastcgi_index index.php; \n\
        include fastcgi_params; \n\
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name; \n\
    } \n\
}' > /etc/nginx/http.d/default.conf

EXPOSE 80
CMD php-fpm -D && nginx -g 'daemon off;'
