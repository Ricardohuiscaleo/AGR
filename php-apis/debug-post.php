<?php
/**
 * Script para depurar solicitudes POST a gaby-agent.php
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, x-session-id');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Registrar información de depuración
error_log("DEBUG-POST: Método de solicitud: " . $_SERVER['REQUEST_METHOD']);

// Manejar tanto GET como POST
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $input = ['message' => isset($_GET['message']) ? $_GET['message'] : 'Hola'];
    $sessionId = isset($_GET['session']) ? $_GET['session'] : null;
    error_log("DEBUG-POST: Datos GET: " . json_encode($input));
} else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $rawInput = file_get_contents('php://input');
    error_log("DEBUG-POST: Datos POST brutos: " . $rawInput);
    $input = json_decode($rawInput, true);
    $sessionId = isset($_SERVER['HTTP_X_SESSION_ID']) ? $_SERVER['HTTP_X_SESSION_ID'] : null;
    error_log("DEBUG-POST: Datos POST decodificados: " . json_encode($input));
    error_log("DEBUG-POST: Session ID del header: " . $sessionId);
} else {
    echo json_encode(['error' => 'Método no permitido']);
    exit();
}

// Verificar si tenemos un mensaje
if (!$input || !isset($input['message'])) {
    echo json_encode(['error' => 'Mensaje es requerido']);
    exit();
}

$userMessage = trim($input['message']);

if (empty($userMessage)) {
    echo json_encode(['error' => 'Mensaje no puede estar vacío']);
    exit();
}

// Generar una respuesta simple
$response = [
    'output' => "DEBUG: Recibí tu mensaje: \"{$userMessage}\" mediante " . $_SERVER['REQUEST_METHOD'],
    'session_id' => $sessionId ?: bin2hex(random_bytes(16)),
    'timestamp' => date('Y-m-d H:i:s')
];

echo json_encode($response);
?>