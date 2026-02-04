<?php
/**
 * Script temporal para verificar la estructura de la base de datos
 */

require_once 'config-rag.php';

try {
    $db = new PDO(
        "mysql:host={$DB_CONFIG['host']};dbname={$DB_CONFIG['database']};charset=utf8mb4",
        $DB_CONFIG['username'],
        $DB_CONFIG['password'],
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]
    );
    
    // Verificar tablas existentes
    $stmt = $db->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    echo "Tablas existentes:\n";
    foreach ($tables as $table) {
        echo "- $table\n";
        
        // Mostrar estructura de cada tabla
        $stmt = $db->query("DESCRIBE $table");
        $columns = $stmt->fetchAll();
        foreach ($columns as $column) {
            echo "  - {$column['Field']} ({$column['Type']})\n";
        }
        echo "\n";
    }
    
    // Verificar si existe la tabla blogs
    $blogTableExists = in_array('blogs', $tables);
    echo "¿Existe la tabla blogs? " . ($blogTableExists ? "Sí" : "No") . "\n";
    
    // Verificar si existe la tabla rag_conversations
    $conversationsTableExists = in_array('rag_conversations', $tables);
    echo "¿Existe la tabla rag_conversations? " . ($conversationsTableExists ? "Sí" : "No") . "\n";
    
    // Verificar si existe la tabla gaby_contacts
    $contactsTableExists = in_array('gaby_contacts', $tables);
    echo "¿Existe la tabla gaby_contacts? " . ($contactsTableExists ? "Sí" : "No") . "\n";
    
    // Verificar si existe la tabla gaby_diagnostics
    $diagnosticsTableExists = in_array('gaby_diagnostics', $tables);
    echo "¿Existe la tabla gaby_diagnostics? " . ($diagnosticsTableExists ? "Sí" : "No") . "\n";
    
} catch (PDOException $e) {
    echo "Error de conexión a base de datos: " . $e->getMessage() . "\n";
}
?>