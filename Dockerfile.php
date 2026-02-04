FROM php:8.3-fpm-alpine

# Instalar extensiones PHP necesarias
RUN docker-php-ext-install pdo pdo_mysql mysqli

# Instalar nginx
RUN apk add --no-cache nginx

# Copiar archivos PHP
COPY php-apis /var/www/html/php-apis
COPY config.php /var/www/html/config.php

# Configurar nginx
RUN mkdir -p /run/nginx
COPY docker/nginx-php.conf /etc/nginx/http.d/default.conf

# Permisos
RUN chown -R www-data:www-data /var/www/html

EXPOSE 80

# Iniciar PHP-FPM y nginx
CMD php-fpm -D && nginx -g 'daemon off;'
