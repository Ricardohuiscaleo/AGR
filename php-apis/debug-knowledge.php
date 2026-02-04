<?php
/**
 * Debug para verificar la base de conocimientos RAG
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once 'config-rag.php';

try {
    global $DB_CONFIG;
    $pdo = new PDO(
        "mysql:host={$DB_CONFIG['host']};dbname={$DB_CONFIG['database']};charset=utf8mb4",
        $DB_CONFIG['username'],
        $DB_CONFIG['password']
    );
    
    // Contar registros totales
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM rag_knowledge_base");
    $total = $stmt->fetch()['total'];
    
    // Buscar "framework"
    $stmt = $pdo->prepare("
        SELECT title, content, category 
        FROM rag_knowledge_base 
        WHERE MATCH(title, content, keywords) AGAINST(? IN NATURAL LANGUAGE MODE)
        OR title LIKE ? OR content LIKE ? OR keywords LIKE ?
        LIMIT 5
    ");
    
    $searchTerm = "%framework%";
    $stmt->execute(['framework', $searchTerm, $searchTerm, $searchTerm]);
    $frameworkResults = $stmt->fetchAll();
    
    // Obtener algunas muestras
    $stmt = $pdo->query("SELECT title, category FROM rag_knowledge_base LIMIT 10");
    $samples = $stmt->fetchAll();
    
    echo json_encode([
        'total_records' => $total,
        'framework_results' => $frameworkResults,
        'sample_records' => $samples,
        'search_performed' => 'framework'
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    echo json_encode([
        'error' => $e->getMessage()
    ]);
}
?>