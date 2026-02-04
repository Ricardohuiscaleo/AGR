#!/bin/bash
# Exportar las 2 bases de datos principales

MYSQL_HOST="srv1438.hstgr.io"

mkdir -p db_exports

echo "Exportando u958525313_booking..."
mysqldump -h "$MYSQL_HOST" -u u958525313_booking -p'BookingRAG2025!' u958525313_booking > db_exports/booking.sql

echo "Exportando u958525313_rag_database..."
mysqldump -h "$MYSQL_HOST" -u u958525313_rag_database -p'RagPassword2025!' u958525313_rag_database > db_exports/rag_database.sql

echo "✅ Exportación completada"
ls -lh db_exports/
