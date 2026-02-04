<?php
/**
 * Script para verificar las tablas necesarias para el agente Gaby
 */

// --- Carga de Configuración Segura ---
$config_path = __DIR__ . '/../../config.php'; 

if (!file_exists($config_path) || !is_readable($config_path)) {
    echo "Error: No se pudo cargar config.php\n";
    exit;
}

$config = require $config_path;

if (empty($config['rag_db_host']) || empty($config['rag_db_name']) || empty($config['rag_db_user'])) {
    echo "Error: Faltan configuraciones de base de datos RAG en config.php\n";
    exit;
}

try {
    // Conectar a la base de datos
    $db = new PDO(
        "mysql:host={$config['rag_db_host']};dbname={$config['rag_db_name']};charset=utf8mb4",
        $config['rag_db_user'],
        $config['rag_db_pass'],
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]
    );
    
    echo "✅ Conexión a la base de datos exitosa\n";
    
    // Verificar tabla rag_conversations
    $stmt = $db->query("SHOW TABLES LIKE 'rag_conversations'");
    if ($stmt->rowCount() == 0) {
        echo "❌ La tabla rag_conversations no existe. Creándola...\n";
        
        $db->exec("CREATE TABLE rag_conversations (
            id INT AUTO_INCREMENT PRIMARY KEY,
            session_id VARCHAR(50) NOT NULL,
            role ENUM('user', 'assistant', 'system') NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_session_id (session_id)
        )");
        
        echo "✅ Tabla rag_conversations creada exitosamente\n";
    } else {
        echo "✅ La tabla rag_conversations existe\n";
        
        // Verificar estructura
        $stmt = $db->query("DESCRIBE rag_conversations");
        $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        $requiredColumns = ['id', 'session_id', 'role', 'content', 'created_at'];
        $missingColumns = array_diff($requiredColumns, $columns);
        
        if (!empty($missingColumns)) {
            echo "❌ Faltan columnas en la tabla rag_conversations: " . implode(', ', $missingColumns) . "\n";
        } else {
            echo "✅ La estructura de la tabla rag_conversations es correcta\n";
        }
    }
    
    // Verificar tabla rag_knowledge_base
    $stmt = $db->query("SHOW TABLES LIKE 'rag_knowledge_base'");
    if ($stmt->rowCount() == 0) {
        echo "❌ La tabla rag_knowledge_base no existe. Creándola...\n";
        
        $db->exec("CREATE TABLE rag_knowledge_base (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            content TEXT NOT NULL,
            category VARCHAR(50) NOT NULL,
            keywords VARCHAR(255),
            relevance_score FLOAT DEFAULT 1.0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FULLTEXT KEY idx_search (title, content, keywords)
        )");
        
        echo "✅ Tabla rag_knowledge_base creada exitosamente\n";
    } else {
        echo "✅ La tabla rag_knowledge_base existe\n";
    }
    
    // Verificar tabla gaby_contacts
    $stmt = $db->query("SHOW TABLES LIKE 'gaby_contacts'");
    if ($stmt->rowCount() == 0) {
        echo "❌ La tabla gaby_contacts no existe. Creándola...\n";
        
        $db->exec("CREATE TABLE gaby_contacts (
            id VARCHAR(50) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            phone VARCHAR(50),
            company VARCHAR(255),
            industry VARCHAR(255),
            monthly_clients INT,
            requirements TEXT,
            status ENUM('active', 'inactive') DEFAULT 'active',
            session_id VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY unique_email (email),
            INDEX idx_session_id (session_id)
        )");
        
        echo "✅ Tabla gaby_contacts creada exitosamente\n";
    } else {
        echo "✅ La tabla gaby_contacts existe\n";
    }
    
    echo "\nVerificación de tablas completada.\n";
    
} catch (PDOException $e) {
    echo "❌ Error de conexión a la base de datos: " . $e->getMessage() . "\n";
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>