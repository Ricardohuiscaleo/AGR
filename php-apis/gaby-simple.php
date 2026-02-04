<?php
/**
 * Versión simplificada de Gaby Agent para depuración
 */

// --- Configuración de cabeceras ---
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, x-session-id');

// --- Manejo de solicitud OPTIONS (CORS preflight) ---
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// --- Registro de depuración ---
error_log("gaby-simple.php: Iniciando procesamiento de solicitud " . $_SERVER['REQUEST_METHOD']);

try {
    // Obtener datos de la solicitud
    $message = '';
    $sessionId = '';
    
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $message = isset($_GET['message']) ? $_GET['message'] : 'Hola';
        $sessionId = isset($_GET['session']) ? $_GET['session'] : 'session-default';
        error_log("gaby-simple.php: GET message=" . $message . ", session=" . $sessionId);
    } else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $rawInput = file_get_contents('php://input');
        error_log("gaby-simple.php: POST raw=" . $rawInput);
        $input = json_decode($rawInput, true);
        $message = isset($input['message']) ? $input['message'] : 'Hola';
        $sessionId = isset($_SERVER['HTTP_X_SESSION_ID']) ? $_SERVER['HTTP_X_SESSION_ID'] : 'session-default';
        error_log("gaby-simple.php: POST message=" . $message . ", session=" . $sessionId);
    } else {
        throw new Exception('Método no permitido');
    }
    
    // Generar respuesta simple
    $response = [
        'output' => "Hola, soy Gaby. Recibí tu mensaje: \"{$message}\". Actualmente tenemos 5 blogs publicados con un total de 120 vistas y 45 likes.",
        'session_id' => $sessionId,
        'timestamp' => date('Y-m-d H:i:s')
    ];
    
    echo json_encode($response);
    
} catch (Exception $e) {
    error_log("gaby-simple.php ERROR: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'error' => 'Error interno del servidor',
        'output' => 'Lo siento, ha ocurrido un error. Por favor intenta nuevamente.',
        'details' => $e->getMessage()
    ]);
}
?>