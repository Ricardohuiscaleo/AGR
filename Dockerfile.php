FROM php:8.3-fpm-alpine

# Instalar extensiones PHP necesarias
RUN docker-php-ext-install pdo pdo_mysql mysqli

# Instalar nginx
RUN apk add --no-cache nginx

# Copiar archivos PHP
COPY php-apis /var/www/html/php-apis

# Crear config.php desde variables de entorno
RUN echo '<?php' > /var/www/html/config.php && \
    echo 'return [' >> /var/www/html/config.php && \
    echo '    "booking_db_host" => "172.17.0.1",' >> /var/www/html/config.php && \
    echo '    "booking_db_name" => "u958525313_booking",' >> /var/www/html/config.php && \
    echo '    "booking_db_user" => "agenterag",' >> /var/www/html/config.php && \
    echo '    "booking_db_pass" => "Agente2025!",' >> /var/www/html/config.php && \
    echo '    "rag_db_host" => "172.17.0.1",' >> /var/www/html/config.php && \
    echo '    "rag_db_name" => "u958525313_rag_database",' >> /var/www/html/config.php && \
    echo '    "rag_db_user" => "agenterag",' >> /var/www/html/config.php && \
    echo '    "rag_db_pass" => "Agente2025!"' >> /var/www/html/config.php && \
    echo '];' >> /var/www/html/config.php && \
    echo '?>' >> /var/www/html/config.php

# Configurar nginx
RUN mkdir -p /run/nginx
COPY docker/nginx-php.conf /etc/nginx/http.d/default.conf

# Permisos
RUN chown -R www-data:www-data /var/www/html

EXPOSE 80

# Iniciar PHP-FPM y nginx
CMD php-fpm -D && nginx -g 'daemon off;'
