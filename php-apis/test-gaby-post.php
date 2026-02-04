<?php
/**
 * Script para simular exactamente la solicitud POST que hace el componente React
 */

// --- Carga de Configuración Segura ---
$config_path = __DIR__ . '/../../config.php'; 

if (!file_exists($config_path) || !is_readable($config_path)) {
    echo "Error: No se pudo cargar config.php\n";
    exit;
}

$config = require $config_path;

// Simular la solicitud POST exacta que hace el componente React
$url = 'https://agenterag.com/php-apis/gaby-agent.php';
$sessionId = '52c81e2883234e969734cda7e1afbf45'; // El mismo session_id del error
$data = [
    'message' => 'cuantos blogs tienen actualmente?',
    'agent_context' => null
];

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'x-session-id: ' . $sessionId
]);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

echo "Enviando solicitud POST a {$url}...\n";
echo "Datos: " . json_encode($data) . "\n";
echo "Headers: Content-Type: application/json, x-session-id: {$sessionId}\n\n";

$response = curl_exec($ch);
$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

echo "Código de respuesta HTTP: {$httpcode}\n";

if ($error) {
    echo "Error de cURL: {$error}\n";
}

if ($httpcode >= 200 && $httpcode < 300) {
    echo "Respuesta exitosa:\n";
    $result = json_decode($response, true);
    echo json_encode($result, JSON_PRETTY_PRINT);
} else {
    echo "Error en la respuesta:\n";
    echo $response;
}
?>