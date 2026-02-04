<?php
/**
 * Script para probar la API de Gemini
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

// Verificar si la clave de API de Gemini está configurada
if (empty($config['gemini_api_key'])) {
    echo json_encode(['success' => false, 'error' => 'La clave de API de Gemini no está configurada']);
    exit;
}

$GEMINI_API_KEY = $config['gemini_api_key'];

try {
    $url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' . $GEMINI_API_KEY;
    
    $data = [
        'contents' => [
            [
                'parts' => [
                    ['text' => 'Responde brevemente: ¿Cuántos blogs tiene Agente RAG?']
                ]
            ]
        ],
        'generationConfig' => [
            'temperature' => 0.7,
            'maxOutputTokens' => 50
        ]
    ];
    
    $options = [
        'http' => [
            'header' => "Content-type: application/json\r\n",
            'method' => 'POST',
            'content' => json_encode($data),
            'timeout' => 15
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
        echo json_encode([
            'success' => false,
            'error' => 'Formato de respuesta inesperado',
            'response' => $result
        ]);
        exit;
    }
    
    echo json_encode([
        'success' => true,
        'mensaje' => 'API de Gemini funcionando correctamente',
        'respuesta' => $result['candidates'][0]['content']['parts'][0]['text']
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Error: ' . $e->getMessage()
    ]);
}
?>