<?php
/**
 * Script para probar la API de Gemini
 */

// --- Carga de Configuración Segura ---
$config_path = __DIR__ . '/../../config.php'; 

if (!file_exists($config_path) || !is_readable($config_path)) {
    echo json_encode(['error' => 'No se pudo cargar config.php']);
    exit;
}

$config = require $config_path;

if (empty($config['gemini_api_key'])) {
    echo json_encode(['error' => 'Falta la clave de API de Gemini en config.php']);
    exit;
}

$GEMINI_API_KEY = $config['gemini_api_key'];

header('Content-Type: application/json');

try {
    $url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' . $GEMINI_API_KEY;
    
    $data = [
        'contents' => [
            [
                'parts' => [
                    ['text' => 'Responde en español: ¿Cuántos blogs tiene Agente RAG?']
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
        echo json_encode(['error' => 'Error al llamar a la API de Gemini']);
        exit;
    }
    
    $result = json_decode($response, true);
    
    if (!isset($result['candidates'][0]['content']['parts'][0]['text'])) {
        echo json_encode(['error' => 'Formato de respuesta inesperado', 'response' => $result]);
        exit;
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'API de Gemini funcionando correctamente',
        'response' => $result['candidates'][0]['content']['parts'][0]['text']
    ]);
    
} catch (Exception $e) {
    echo json_encode(['error' => 'Error: ' . $e->getMessage()]);
}
?>