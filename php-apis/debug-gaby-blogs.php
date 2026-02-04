<?php
/**
 * Debug script para identificar el error en gaby-agent.php
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

try {
    echo json_encode(['step' => 1, 'message' => 'Iniciando debug...']);
    
    // Test 1: Cargar config
    require_once 'config-rag.php';
    echo json_encode(['step' => 2, 'message' => 'Config cargado correctamente']);
    
    // Test 2: Verificar variables globales
    global $DB_CONFIG, $GEMINI_API_KEY, $SUPABASE_URL, $SUPABASE_ANON_KEY;
    
    if (empty($DB_CONFIG)) {
        throw new Exception('DB_CONFIG está vacío');
    }
    
    if (empty($GEMINI_API_KEY)) {
        throw new Exception('GEMINI_API_KEY está vacío');
    }
    
    if (empty($SUPABASE_URL)) {
        throw new Exception('SUPABASE_URL está vacío');
    }
    
    echo json_encode(['step' => 3, 'message' => 'Variables globales OK']);
    
    // Test 3: Conexión a base de datos
    $db = new PDO(
        "mysql:host={$DB_CONFIG['host']};dbname={$DB_CONFIG['database']};charset=utf8mb4",
        $DB_CONFIG['username'],
        $DB_CONFIG['password'],
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]
    );
    
    echo json_encode(['step' => 4, 'message' => 'Conexión DB OK']);
    
    // Test 4: Verificar tabla rag_knowledge_base
    $stmt = $db->query("SELECT COUNT(*) as count FROM rag_knowledge_base");
    $count = $stmt->fetch()['count'];
    
    echo json_encode(['step' => 5, 'message' => "Tabla rag_knowledge_base tiene {$count} registros"]);
    
    // Test 5: Test de búsqueda FAQ
    $query = "cuantos blogs";
    $stmt = $db->prepare("
        SELECT title, content, category 
        FROM rag_knowledge_base 
        WHERE category LIKE 'faq-%'
        AND (title LIKE ? OR content LIKE ?)
        LIMIT 3
    ");
    
    $searchTerm = "%{$query}%";
    $stmt->execute([$searchTerm, $searchTerm]);
    $results = $stmt->fetchAll();
    
    echo json_encode(['step' => 6, 'message' => 'Búsqueda FAQ OK', 'results' => count($results)]);
    
    // Test 6: Test de Supabase
    $apiUrl = $SUPABASE_URL . '/rest/v1/rpc/get_blog_stats_v2';
    
    $ch = curl_init($apiUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'apikey: ' . $SUPABASE_ANON_KEY,
        'Authorization: Bearer ' . $SUPABASE_ANON_KEY
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    
    $response = curl_exec($ch);
    $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    echo json_encode(['step' => 7, 'message' => 'Test Supabase', 'http_code' => $httpcode]);
    
    echo json_encode(['step' => 'FINAL', 'message' => 'Todos los tests pasaron correctamente']);
    
} catch (Exception $e) {
    echo json_encode([
        'error' => true,
        'message' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ]);
}
?>