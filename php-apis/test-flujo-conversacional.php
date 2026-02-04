<?php
/**
 * Test de flujo conversacional natural con Gaby
 */

header('Content-Type: text/plain; charset=utf-8');

echo "=== FLUJO CONVERSACIONAL CON GABY 🤖💬 ===\n\n";

function consultarGaby($mensaje, $sessionId) {
    $url = 'https://agenterag.com/php-apis/gaby-agent.php?' . http_build_query([
        'message' => $mensaje,
        'session' => $sessionId
    ]);
    
    $response = file_get_contents($url);
    return $response ? json_decode($response, true) : null;
}

$sessionId = 'flujo-conversacional-' . time();

// PASO 1: Presentarse a Gaby
echo "👤 USUARIO: Hola, soy Ricardo\n\n";

$respuesta1 = consultarGaby("Hola, soy Ricardo", $sessionId);
if ($respuesta1) {
    echo "🤖 GABY: " . $respuesta1['output'] . "\n\n";
}

echo str_repeat("-", 80) . "\n\n";

// PASO 2: Ahora que Gaby ya nos conoce, hacer consulta con URL
echo "👤 USUARIO: ¿Puedes revisar cuántos blogs tenemos? Consulta https://agenterag.com/php-apis/estadisticas.php\n\n";

$respuesta2 = consultarGaby("¿Puedes revisar cuántos blogs tenemos? Consulta https://agenterag.com/php-apis/estadisticas.php", $sessionId);
if ($respuesta2) {
    echo "🤖 GABY: " . $respuesta2['output'] . "\n\n";
}

echo str_repeat("-", 80) . "\n\n";

// PASO 3: Consulta sobre el blog más popular
echo "👤 USUARIO: Ahora dime cuál es el blog con más likes. Revisa https://agenterag.com/php-apis/obtener-blogs.php\n\n";

$respuesta3 = consultarGaby("Ahora dime cuál es el blog con más likes. Revisa https://agenterag.com/php-apis/obtener-blogs.php", $sessionId);
if ($respuesta3) {
    echo "🤖 GABY: " . $respuesta3['output'] . "\n\n";
}

echo str_repeat("-", 80) . "\n\n";

// PASO 4: Consulta combinada
echo "👤 USUARIO: Dame un resumen completo usando ambas URLs\n\n";

$respuesta4 = consultarGaby("Dame un resumen completo usando https://agenterag.com/php-apis/estadisticas.php y https://agenterag.com/php-apis/obtener-blogs.php", $sessionId);
if ($respuesta4) {
    echo "🤖 GABY: " . $respuesta4['output'] . "\n\n";
}

echo str_repeat("=", 80) . "\n";
echo "✅ FLUJO CONVERSACIONAL COMPLETADO\n";
echo "🆔 Session ID: " . $sessionId . "\n";
?>