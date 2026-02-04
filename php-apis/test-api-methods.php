<?php
/**
 * Script para probar la API con diferentes métodos HTTP
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, x-session-id');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Registrar información de depuración
error_log("TEST-API-METHODS: Método de solicitud: " . $_SERVER['REQUEST_METHOD']);

// Responder según el método
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $message = isset($_GET['message']) ? $_GET['message'] : 'Mensaje predeterminado';
    $sessionId = isset($_GET['session']) ? $_GET['session'] : 'session-default';
    
    echo json_encode([
        'success' => true,
        'method' => 'GET',
        'message_received' => $message,
        'session_id' => $sessionId,
        'output' => "Respuesta a GET: Recibí tu mensaje \"$message\" con session_id \"$sessionId\"",
        'timestamp' => date('Y-m-d H:i:s')
    ]);
} else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $rawInput = file_get_contents('php://input');
    error_log("TEST-API-METHODS: Datos POST brutos: " . $rawInput);
    
    $input = json_decode($rawInput, true);
    $message = isset($input['message']) ? $input['message'] : 'Mensaje predeterminado';
    $sessionId = isset($_SERVER['HTTP_X_SESSION_ID']) ? $_SERVER['HTTP_X_SESSION_ID'] : 'session-default';
    
    echo json_encode([
        'success' => true,
        'method' => 'POST',
        'message_received' => $message,
        'session_id' => $sessionId,
        'output' => "Respuesta a POST: Recibí tu mensaje \"$message\" con session_id \"$sessionId\"",
        'timestamp' => date('Y-m-d H:i:s')
    ]);
} else {
    echo json_encode([
        'error' => 'Método no soportado',
        'method' => $_SERVER['REQUEST_METHOD']
    ]);
}
?>