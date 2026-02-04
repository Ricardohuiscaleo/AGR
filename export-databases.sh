#!/bin/bash
# Script para exportar todas las bases de datos desde Hostinger

MYSQL_HOST="srv1438.hstgr.io"  # Host remoto de Hostinger

# Bases de datos a exportar
declare -A databases=(
    ["u958525313_usuariosruta11"]="u958525313_usuariosruta11"
    ["u958525313_Calcularuta11"]="u958525313_Calcularuta11"
    ["u958525313_Ruta11check"]="u958525313_Ruta11check"
    ["u958525313_ruta11APP"]="u958525313_ruta11APP"
    ["u958525313_ruta11game"]="u958525313_ruta11game"
    ["u958525313_rag_database"]="u958525313_rag_database:RagPassword2025!"
    ["u958525313_booking"]="u958525313_booking:BookingRAG2025!"
    ["u958525313_cotizaruta11_d"]="u958525313_ruta11"
)

mkdir -p db_exports

echo "Exportando bases de datos..."

for db in "${!databases[@]}"; do
    IFS=':' read -r user pass <<< "${databases[$db]}"
    echo "Exportando $db..."
    
    if [ -z "$pass" ]; then
        read -sp "Contraseña para $user: " pass
        echo
    fi
    
    mysqldump -h "$MYSQL_HOST" -u "$user" -p"$pass" "$db" > "db_exports/${db}.sql"
    
    if [ $? -eq 0 ]; then
        echo "✅ $db exportada"
    else
        echo "❌ Error exportando $db"
    fi
done

echo "Exportación completada. Archivos en: db_exports/"
