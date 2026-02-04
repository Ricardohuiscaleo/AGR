#!/bin/bash
# Script automático para migrar DBs desde Hostinger al VPS
# Ejecutar en el VPS

echo "=== MIGRACIÓN AUTOMÁTICA DE BASES DE DATOS ==="

# Instalar cliente MySQL si no existe
if ! command -v mysqldump &> /dev/null; then
    echo "Instalando mysql-client..."
    apt install mysql-client -y
fi

# Credenciales Hostinger
HOSTINGER_HOST="srv1438.hstgr.io"

# Crear directorio temporal
mkdir -p /tmp/db_migration

echo "1. Exportando desde Hostinger..."
mysqldump -h "$HOSTINGER_HOST" -u u958525313_booking -p'BookingRAG2025!' u958525313_booking > /tmp/db_migration/booking.sql
mysqldump -h "$HOSTINGER_HOST" -u u958525313_rag_database -p'RagPassword2025!' u958525313_rag_database > /tmp/db_migration/rag_database.sql

echo "2. Creando bases de datos en VPS..."
mysql -u root <<EOF
CREATE DATABASE IF NOT EXISTS u958525313_booking;
CREATE DATABASE IF NOT EXISTS u958525313_rag_database;
GRANT ALL PRIVILEGES ON u958525313_booking.* TO 'agenterag'@'%';
GRANT ALL PRIVILEGES ON u958525313_rag_database.* TO 'agenterag'@'%';
FLUSH PRIVILEGES;
EOF

echo "3. Importando datos..."
mysql -u root u958525313_booking < /tmp/db_migration/booking.sql
mysql -u root u958525313_rag_database < /tmp/db_migration/rag_database.sql

echo "4. Limpiando archivos temporales..."
rm -rf /tmp/db_migration

echo "✅ Migración completada!"
echo ""
echo "Bases de datos disponibles:"
mysql -u root -e "SHOW DATABASES;"
