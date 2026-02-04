<?php
/**
 * Debug endpoint para diagnosticar problemas con Gaby
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$debug = [
    'timestamp' => date('Y-m-d H:i:s'),
    'php_version' => PHP_VERSION,
    'memory_limit' => ini_get('memory_limit'),
    'max_execution_time' => ini_get('max_execution_time'),
    'errors' => []
];

try {
    // 1. Verificar config-rag.php
    $debug['step'] = 'Loading config-rag.php';
    if (file_exists('config-rag.php')) {
        require_once 'config-rag.php';
        $debug['config_loaded'] = true;
        $debug['db_config_exists'] = isset($DB_CONFIG);
        $debug['gemini_key_exists'] = isset($GEMINI_API_KEY) && !empty($GEMINI_API_KEY);
    } else {
        $debug['errors'][] = 'config-rag.php not found';
    }
    
    // 2. Verificar conexión a base de datos
    $debug['step'] = 'Testing database connection';
    if (isset($DB_CONFIG)) {
        try {
            $pdo = new PDO(
                "mysql:host={$DB_CONFIG['host']};dbname={$DB_CONFIG['database']};charset=utf8mb4",
                $DB_CONFIG['username'],
                $DB_CONFIG['password']
            );
            $debug['database_connection'] = 'success';
            
            // Verificar tablas
            $tables = $pdo->query("SHOW TABLES LIKE 'rag_%'")->fetchAll();
            $debug['rag_tables'] = count($tables);
            
        } catch (Exception $e) {
            $debug['database_connection'] = 'failed';
            $debug['errors'][] = 'Database error: ' . $e->getMessage();
        }
    }
    
    // 3. Verificar gaby-tools-fixed.php
    $debug['step'] = 'Loading gaby-tools-fixed.php';
    if (file_exists('gaby-tools-fixed.php')) {
        require_once 'gaby-tools-fixed.php';
        $debug['gaby_tools_loaded'] = true;
        $debug['gaby_tools_class_exists'] = class_exists('GabyTools');
    } else {
        $debug['errors'][] = 'gaby-tools-fixed.php not found';
    }
    
    // 4. Test simple de Gemini API
    $debug['step'] = 'Testing Gemini API';
    if (isset($GEMINI_API_KEY) && !empty($GEMINI_API_KEY)) {
        $url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' . $GEMINI_API_KEY;
        $testData = [
            'contents' => [
                ['parts' => [['text' => 'Responde solo: "Test OK"']]]
            ],
            'generationConfig' => ['maxOutputTokens' => 10]
        ];
        
        $context = stream_context_create([
            'http' => [
                'method' => 'POST',
                'header' => "Content-Type: application/json\r\n",
                'content' => json_encode($testData),
                'timeout' => 10
            ]
        ]);
        
        $response = file_get_contents($url, false, $context);
        $debug['gemini_api_test'] = $response !== FALSE ? 'success' : 'failed';
        
        if ($response === FALSE) {
            $debug['errors'][] = 'Gemini API connection failed';
        }
    }
    
    // 5. Test creación de GabyAgent
    $debug['step'] = 'Testing GabyAgent creation';
    if (class_exists('GabyTools')) {
        try {
            $tools = new GabyTools();
            $debug['gaby_tools_creation'] = 'success';
        } catch (Exception $e) {
            $debug['gaby_tools_creation'] = 'failed';
            $debug['errors'][] = 'GabyTools creation error: ' . $e->getMessage();
        }
    }
    
    $debug['status'] = empty($debug['errors']) ? 'OK' : 'ERRORS_FOUND';
    
} catch (Exception $e) {
    $debug['fatal_error'] = $e->getMessage();
    $debug['status'] = 'FATAL_ERROR';
}

echo json_encode($debug, JSON_PRETTY_PRINT);
?>