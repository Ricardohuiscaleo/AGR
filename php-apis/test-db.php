<?php
/**
 * Script para probar la conexión a la base de datos
 */

// Configurar cabeceras para JSON
header('Content-Type: application/json');

// --- Carga de Configuración Segura ---
$config_path = __DIR__ . '/../../config.php'; 

if (!file_exists($config_path) || !is_readable($config_path)) {
    echo json_encode(['success' => false, 'error' => 'No se pudo cargar config.php']);
    exit;
}

$config = require $config_path;

// Definir variables globales para compatibilidad con el código existente
$DB_CONFIG = [
    'host' => $config['rag_db_host'] ?? 'localhost',
    'database' => $config['rag_db_name'] ?? 'agenterag',
    'username' => $config['rag_db_user'] ?? 'root',
    'password' => $config['rag_db_pass'] ?? ''
];

try {
    // Conectar a la base de datos
    $db = new PDO(
        "mysql:host={$DB_CONFIG['host']};dbname={$DB_CONFIG['database']};charset=utf8mb4",
        $DB_CONFIG['username'],
        $DB_CONFIG['password'],
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]
    );
    
    // Verificar tablas
    $tablas = ['rag_conversations', 'rag_knowledge_base', 'gaby_contacts'];
    $resultados = [];
    
    foreach ($tablas as $tabla) {
        $stmt = $db->query("SHOW TABLES LIKE '{$tabla}'");
        if ($stmt->rowCount() == 0) {
            $resultados[] = [
                'tabla' => $tabla,
                'existe' => false
            ];
        } else {
            $resultados[] = [
                'tabla' => $tabla,
                'existe' => true
            ];
        }
    }
    
    echo json_encode([
        'success' => true,
        'mensaje' => 'Conexión a la base de datos exitosa',
        'config' => [
            'host' => $DB_CONFIG['host'],
            'database' => $DB_CONFIG['database'],
            'username' => $DB_CONFIG['username']
        ],
        'tablas' => $resultados
    ]);
    
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Error de conexión a la base de datos: ' . $e->getMessage(),
        'config' => [
            'host' => $DB_CONFIG['host'],
            'database' => $DB_CONFIG['database'],
            'username' => $DB_CONFIG['username']
        ]
    ]);
}
?>