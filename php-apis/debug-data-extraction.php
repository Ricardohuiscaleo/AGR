<?php
/**
 * Debug para verificar extracción de datos del historial
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once 'config-rag.php';
require_once 'gaby-agent.php';

$sessionId = '3436c11aba794169ad564049c4a780d7';

try {
    $gabyAgent = new GabyAgent();
    
    // Usar reflexión para acceder a métodos privados
    $reflection = new ReflectionClass($gabyAgent);
    
    $getHistoryMethod = $reflection->getMethod('getConversationHistory');
    $getHistoryMethod->setAccessible(true);
    
    $extractDataMethod = $reflection->getMethod('extractClientDataFromHistory');
    $extractDataMethod->setAccessible(true);
    
    $buildSummaryMethod = $reflection->getMethod('buildClientDataSummary');
    $buildSummaryMethod->setAccessible(true);
    
    // Obtener historial
    $history = $getHistoryMethod->invoke($gabyAgent, $sessionId);
    
    // Extraer datos
    $clientData = $extractDataMethod->invoke($gabyAgent, $history);
    
    // Construir resumen
    $summary = $buildSummaryMethod->invoke($gabyAgent, $clientData);
    
    echo json_encode([
        'session_id' => $sessionId,
        'history_count' => count($history),
        'extracted_data' => $clientData,
        'data_summary' => $summary,
        'last_messages' => array_slice($history, -3)
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    echo json_encode([
        'error' => $e->getMessage(),
        'session_id' => $sessionId
    ]);
}
?>