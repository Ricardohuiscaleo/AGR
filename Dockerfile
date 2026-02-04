FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./

FROM base AS deps
RUN npm ci

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM php:8.2-fpm-alpine AS runtime

# Instalar nginx y extensiones PHP necesarias
RUN apk add --no-cache nginx supervisor && \
    docker-php-ext-install mysqli pdo pdo_mysql

# Copiar archivos estáticos
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar archivos PHP (API)
COPY api /usr/share/nginx/html/api
COPY config.php /usr/share/nginx/html/config.php

# Configurar Nginx para PHP
RUN echo 'server { \n\
    listen 80; \n\
    root /usr/share/nginx/html; \n\
    index index.html index.php; \n\
    location / { \n\
        try_files $uri $uri/ /index.html; \n\
    } \n\
    location ~ \.php$ { \n\
        fastcgi_pass 127.0.0.1:9000; \n\
        fastcgi_index index.php; \n\
        include fastcgi_params; \n\
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name; \n\
    } \n\
}' > /etc/nginx/http.d/default.conf

# Configurar Supervisor para ejecutar nginx y php-fpm
RUN echo '[supervisord] \n\
nodaemon=true \n\
[program:php-fpm] \n\
command=php-fpm8 -F \n\
[program:nginx] \n\
command=nginx -g "daemon off;"' > /etc/supervisord.conf

EXPOSE 80
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
