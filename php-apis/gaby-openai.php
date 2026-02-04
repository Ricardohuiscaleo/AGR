<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, x-session-id');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$apiKey = getenv('OPENAI_API_KEY');
if (!$apiKey) {
    echo json_encode(['error' => 'OPENAI_API_KEY no configurada']);
    exit;
}

// Leer body JSON
$input = json_decode(file_get_contents('php://input'), true);
$message = $input['message'] ?? $_GET['message'] ?? '';
$session = $input['session'] ?? $_GET['session'] ?? '';

if (empty($message)) {
    echo json_encode(['error' => 'Mensaje requerido']);
    exit;
}

$data = [
    'model' => 'gpt-4o-mini',
    'messages' => [
        [
            'role' => 'system',
            'content' => 'Eres Gaby, asistente virtual de Agente RAG. Respondes de forma amigable, profesional y concisa en español.'
        ],
        [
            'role' => 'user',
            'content' => $message
        ]
    ],
    'temperature' => 0.7,
    'max_tokens' => 150
];

$ch = curl_init('https://api.openai.com/v1/chat/completions');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer ' . $apiKey
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200) {
    echo json_encode(['error' => 'Error de OpenAI', 'details' => $response]);
    exit;
}

$result = json_decode($response, true);
$output = $result['choices'][0]['message']['content'] ?? 'Sin respuesta';

echo json_encode([
    'output' => $output,
    'session_id' => $session,
    'timestamp' => date('Y-m-d H:i:s')
]);
