<?php
/**
 * Script para crear la tabla de caché de web scraping
 */

// --- Carga de Configuración ---
$config_path = __DIR__ . '/../../config.php'; 
$config = require $config_path;

$DB_CONFIG = [
    'host' => $config['rag_db_host'] ?? 'localhost',
    'database' => $config['rag_db_name'] ?? 'agenterag',
    'username' => $config['rag_db_user'] ?? 'root',
    'password' => $config['rag_db_pass'] ?? ''
];

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
    
    // Crear tabla de caché de scraping
    $db->exec("CREATE TABLE IF NOT EXISTS web_scraping_cache (
        id INT AUTO_INCREMENT PRIMARY KEY,
        url VARCHAR(500) NOT NULL,
        url_hash VARCHAR(64) NOT NULL UNIQUE,
        title VARCHAR(500),
        content LONGTEXT,
        meta_description TEXT,
        keywords TEXT,
        scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP,
        status ENUM('success', 'error', 'pending') DEFAULT 'pending',
        error_message TEXT,
        INDEX idx_url_hash (url_hash),
        INDEX idx_expires_at (expires_at),
        INDEX idx_status (status)
    )");
    
    echo "✅ Tabla web_scraping_cache creada exitosamente\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>