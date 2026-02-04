#!/bin/bash
# Subir archivos PHP al VPS

VPS_IP="76.13.126.63"

echo "Subiendo archivos PHP al VPS..."

# Crear tar de php-apis
cd "/Users/ricardohuiscaleollafquen/Copia de Agente RAG Website 4"
tar -czf php-apis.tar.gz php-apis/ config.php

# Subir al VPS
scp php-apis.tar.gz root@$VPS_IP:/tmp/

# Descomprimir en VPS
ssh root@$VPS_IP << 'ENDSSH'
cd /var/www/agenterag
tar -xzf /tmp/php-apis.tar.gz
chown -R www-data:www-data /var/www/agenterag
rm /tmp/php-apis.tar.gz
echo "✅ Archivos PHP instalados"
ls -la /var/www/agenterag/
ENDSSH

rm php-apis.tar.gz
echo "✅ Migración de PHP completada"
