<?php
/**
 * Versión estática de Gaby Agent para depuración
 * No depende de la base de datos ni de la API de Gemini
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
error_log("gaby-static.php: Iniciando procesamiento de solicitud " . $_SERVER['REQUEST_METHOD']);

try {
    // Obtener datos de la solicitud
    $message = '';
    $sessionId = '';
    
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $message = isset($_GET['message']) ? $_GET['message'] : 'Hola';
        $sessionId = isset($_GET['session']) ? $_GET['session'] : 'session-default';
        error_log("gaby-static.php: GET message=" . $message . ", session=" . $sessionId);
    } else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $rawInput = file_get_contents('php://input');
        error_log("gaby-static.php: POST raw=" . $rawInput);
        $input = json_decode($rawInput, true);
        $message = isset($input['message']) ? $input['message'] : 'Hola';
        $sessionId = isset($_SERVER['HTTP_X_SESSION_ID']) ? $_SERVER['HTTP_X_SESSION_ID'] : 'session-default';
        error_log("gaby-static.php: POST message=" . $message . ", session=" . $sessionId);
    } else {
        throw new Exception('Método no permitido');
    }
    
    // Generar respuesta estática basada en el mensaje
    $response = '';
    
    if (stripos($message, 'blog') !== false || stripos($message, 'cuantos') !== false) {
        $response = "Actualmente tenemos 5 blogs publicados en nuestra plataforma. Los temas incluyen IA generativa, RAG (Retrieval Augmented Generation), automatización de procesos y más. ¿Te gustaría saber más sobre algún tema en particular? 😊";
    } else if (stripos($message, 'hola') !== false || stripos($message, 'saludos') !== false) {
        $response = "Hola soy **Gaby** 😊, ejecutiva de atención al cliente de Agente RAG. ¿En qué puedo ayudarte hoy?";
    } else {
        $response = "Gracias por tu mensaje. Soy **Gaby**, ejecutiva de atención al cliente de Agente RAG. Estamos especializados en soluciones de IA para empresas. ¿En qué puedo ayudarte hoy?";
    }
    
    echo json_encode([
        'output' => $response,
        'session_id' => $sessionId,
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    
} catch (Exception $e) {
    error_log("gaby-static.php ERROR: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'error' => 'Error interno del servidor',
        'output' => 'Lo siento, ha ocurrido un error. Por favor intenta nuevamente.',
        'details' => $e->getMessage()
    ]);
}
?>