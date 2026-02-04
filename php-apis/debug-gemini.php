<?php
/**
 * Debug para verificar qué está pasando con Gemini
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once 'config-rag.php';

try {
    global $GEMINI_API_KEY;
    
    // Test simple de Gemini
    $url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' . $GEMINI_API_KEY;
    
    $testData = [
        'contents' => [
            ['parts' => [['text' => '¿Qué es un framework? Responde en español de forma simple.']]]
        ],
        'generationConfig' => [
            'temperature' => 0.7,
            'maxOutputTokens' => 200
        ]
    ];
    
    $options = [
        'http' => [
            'method' => 'POST',
            'header' => "Content-Type: application/json\r\n",
            'content' => json_encode($testData),
            'timeout' => 30
        ]
    ];
    
    $context = stream_context_create($options);
    $start = microtime(true);
    $response = file_get_contents($url, false, $context);
    $duration = microtime(true) - $start;
    
    if ($response === FALSE) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Gemini API falló',
            'duration' => $duration,
            'http_response_header' => $http_response_header ?? 'No headers'
        ]);
    } else {
        $result = json_decode($response, true);
        echo json_encode([
            'status' => 'success',
            'duration' => $duration,
            'response_size' => strlen($response),
            'result' => $result,
            'answer' => $result['candidates'][0]['content']['parts'][0]['text'] ?? 'No answer'
        ], JSON_PRETTY_PRINT);
    }
    
} catch (Exception $e) {
    echo json_encode([
        'status' => 'exception',
        'error' => $e->getMessage()
    ]);
}
?>