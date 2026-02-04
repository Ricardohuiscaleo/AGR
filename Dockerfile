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
COPY php-apis /var/www/html/php-apis
COPY config.php /var/www/html/

# Configurar Nginx
RUN echo 'server { listen 80; root /usr/share/nginx/html; index index.html; location / { try_files \$uri \$uri/ =404; } location ~ \.php\$ { fastcgi_pass 127.0.0.1:9000; fastcgi_index index.php; include fastcgi_params; fastcgi_param SCRIPT_FILENAME \$document_root\$fastcgi_script_name; } }' > /etc/nginx/http.d/default.conf

EXPOSE 80
CMD php-fpm -D && nginx -g 'daemon off;'
