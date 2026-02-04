<?php
/**
 * Debug mejorado para verificar session-id y historial
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once 'config-rag.php';

$sessionId = $_GET['session'] ?? 'no-session';

try {
    global $DB_CONFIG;
    $pdo = new PDO(
        "mysql:host={$DB_CONFIG['host']};dbname={$DB_CONFIG['database']};charset=utf8mb4",
        $DB_CONFIG['username'],
        $DB_CONFIG['password']
    );
    
    if ($sessionId !== 'no-session') {
        // Obtener historial de la sesión específica
        $stmt = $pdo->prepare("
            SELECT session_id, role, content, created_at 
            FROM rag_conversations 
            WHERE session_id = ? 
            ORDER BY created_at ASC
        ");
        $stmt->execute([$sessionId]);
        $history = $stmt->fetchAll();
    } else {
        $history = [];
    }
    
    // Obtener todas las sesiones recientes (últimas 24 horas)
    $stmt = $pdo->prepare("
        SELECT DISTINCT session_id, COUNT(*) as message_count, 
               MIN(created_at) as first_message, MAX(created_at) as last_message
        FROM rag_conversations 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        GROUP BY session_id 
        ORDER BY last_message DESC 
        LIMIT 10
    ");
    $stmt->execute();
    $recentSessions = $stmt->fetchAll();
    
    // Obtener estadísticas generales
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM rag_conversations");
    $totalMessages = $stmt->fetch()['total'];
    
    $stmt = $pdo->query("SELECT COUNT(DISTINCT session_id) as total FROM rag_conversations");
    $totalSessions = $stmt->fetch()['total'];
    
    echo json_encode([
        'session_id' => $sessionId,
        'history_count' => count($history),
        'history' => $history,
        'recent_sessions' => $recentSessions,
        'stats' => [
            'total_messages' => $totalMessages,
            'total_sessions' => $totalSessions
        ],
        'timestamp' => date('Y-m-d H:i:s')
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    echo json_encode([
        'error' => $e->getMessage(),
        'session_id' => $sessionId
    ]);
}
?>