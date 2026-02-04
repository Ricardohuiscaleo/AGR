<?php
/**
 * Versión optimizada de Gaby Agent para respuestas rápidas
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, x-session-id');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// --- Carga de Configuración ---
$config_path = __DIR__ . '/../../config.php'; 
$config = require $config_path;

$GEMINI_API_KEY = $config['gemini_api_key'] ?? '';

try {
    // Obtener datos de la solicitud
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $message = isset($_GET['message']) ? $_GET['message'] : 'Hola';
        $sessionId = isset($_GET['session']) ? $_GET['session'] : bin2hex(random_bytes(8));
    } else {
        $rawInput = file_get_contents('php://input');
        $input = json_decode($rawInput, true);
        $message = isset($input['message']) ? $input['message'] : 'Hola';
        $sessionId = isset($_SERVER['HTTP_X_SESSION_ID']) ? $_SERVER['HTTP_X_SESSION_ID'] : bin2hex(random_bytes(8));
    }
    
    // Generar respuesta rápida
    $response = generateFastResponse($message, $GEMINI_API_KEY);
    
    echo json_encode([
        'output' => $response,
        'session_id' => $sessionId,
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Error interno del servidor',
        'output' => 'Lo siento, ha ocurrido un error. Por favor intenta nuevamente.',
        'details' => $e->getMessage()
    ]);
}

function generateFastResponse($message, $apiKey) {
    // Respuestas predefinidas para consultas comunes
    $message = strtolower($message);
    
    if (strpos($message, 'blog') !== false || strpos($message, 'cuantos') !== false) {
        return "Actualmente tenemos 5 blogs publicados sobre IA, RAG y automatización. Han recibido más de 120 vistas y 45 likes en total. ¿Te interesa algún tema específico? 😊";
    }
    
    if (strpos($message, 'hola') !== false || strpos($message, 'saludos') !== false) {
        return "Hola soy **Gaby** 😊, ejecutiva de atención al cliente de Agente RAG. ¿En qué puedo ayudarte hoy?";
    }
    
    // Para otros mensajes, usar Gemini con prompt corto
    return callGeminiFast($message, $apiKey);
}

function callGeminiFast($message, $apiKey) {
    $url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' . $apiKey;
    
    $data = [
        'contents' => [
            [
                'parts' => [
                    ['text' => "Eres Gaby de Agente RAG. Responde en máximo 50 palabras: {$message}"]
                ]
            ]
        ],
        'generationConfig' => [
            'temperature' => 0.7,
            'maxOutputTokens' => 150
        ]
    ];
    
    $options = [
        'http' => [
            'header' => "Content-type: application/json\r\n",
            'method' => 'POST',
            'content' => json_encode($data),
            'timeout' => 8
        ]
    ];
    
    $context = stream_context_create($options);
    $response = file_get_contents($url, false, $context);
    
    if ($response === FALSE) {
        return "Soy **Gaby** de Agente RAG. Estamos especializados en soluciones de IA para empresas. ¿En qué puedo ayudarte?";
    }
    
    $result = json_decode($response, true);
    
    if (!isset($result['candidates'][0]['content']['parts'][0]['text'])) {
        return "Soy **Gaby** de Agente RAG. Estamos especializados en soluciones de IA para empresas. ¿En qué puedo ayudarte?";
    }
    
    return $result['candidates'][0]['content']['parts'][0]['text'];
}
?>