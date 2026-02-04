<?php
/**
 * Script para probar la API de Gemini con una consulta específica sobre blogs
 */

// Configurar cabeceras para JSON
header('Content-Type: application/json');

// --- Carga de Configuración Segura ---
$config_path = __DIR__ . '/../../config.php'; 

if (!file_exists($config_path) || !is_readable($config_path)) {
    echo json_encode(['success' => false, 'error' => 'No se pudo cargar config.php']);
    exit;
}

$config = require $config_path;

if (empty($config['gemini_api_key'])) {
    echo json_encode(['success' => false, 'error' => 'Falta la clave de API de Gemini en config.php']);
    exit;
}

$GEMINI_API_KEY = $config['gemini_api_key'];

try {
    $url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' . $GEMINI_API_KEY;
    
    $prompt = "Eres Gaby, ejecutiva de atención al cliente de Agente RAG. Tu personalidad:

CARACTERÍSTICAS:
- Mujer, amigable y profesional
- Especializada en automatización y ahorro de costos empresariales
- Usas emojis moderadamente (1-2 por párrafo, solo en primeros 4 mensajes)
- Lenguaje fluido y humanizado
- Una pregunta por mensaje
- USA EL NOMBRE DEL CLIENTE DE FORMA NATURAL: solo cuando sea apropiado (saludos, despedidas, o para enfatizar), NO en cada mensaje
- Nombres de clientes en **negritas** cuando los uses

MENSAJE DEL USUARIO: cuantos blog tienen en su pagina?

Responde como Gaby:";
    
    $data = [
        'contents' => [
            [
                'parts' => [
                    ['text' => $prompt]
                ]
            ]
        ],
        'generationConfig' => [
            'temperature' => 0.7,
            'topK' => 40,
            'topP' => 0.95,
            'maxOutputTokens' => 1024
        ]
    ];
    
    $options = [
        'http' => [
            'header' => "Content-type: application/json\r\n",
            'method' => 'POST',
            'content' => json_encode($data)
        ]
    ];
    
    $context = stream_context_create($options);
    $response = file_get_contents($url, false, $context);
    
    if ($response === FALSE) {
        echo json_encode(['success' => false, 'error' => 'Error al llamar a la API de Gemini']);
        exit;
    }
    
    $result = json_decode($response, true);
    
    if (!isset($result['candidates'][0]['content']['parts'][0]['text'])) {
        echo json_encode(['success' => false, 'error' => 'Formato de respuesta inesperado', 'response' => $result]);
        exit;
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'API de Gemini funcionando correctamente',
        'response' => $result['candidates'][0]['content']['parts'][0]['text']
    ]);
    
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Error: ' . $e->getMessage()]);
}
?>