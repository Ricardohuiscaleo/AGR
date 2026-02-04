<?php
/**
 * Test con preguntas naturales como haría un usuario real
 */

header('Content-Type: text/plain; charset=utf-8');

echo "=== TEST CON PREGUNTAS NATURALES 🗣️ ===\n\n";

function consultarGaby($mensaje, $sessionId) {
    $url = 'https://agenterag.com/php-apis/gaby-agent.php?' . http_build_query([
        'message' => $mensaje,
        'session' => $sessionId
    ]);
    
    $response = file_get_contents($url);
    return $response ? json_decode($response, true) : null;
}

$sessionId = 'natural-' . time();

// PASO 1: Presentarse
echo "👤 USUARIO: Hola, soy María\n\n";
$respuesta1 = consultarGaby("Hola, soy María", $sessionId);
if ($respuesta1) {
    echo "🤖 GABY: " . $respuesta1['output'] . "\n\n";
}

echo str_repeat("-", 80) . "\n\n";

// PASO 2: Pregunta natural sobre cantidad de blogs
echo "👤 USUARIO: ¿Cuántos blogs tienen publicados?\n\n";
$respuesta2 = consultarGaby("¿Cuántos blogs tienen publicados?", $sessionId);
if ($respuesta2) {
    echo "🤖 GABY: " . $respuesta2['output'] . "\n\n";
}

echo str_repeat("-", 80) . "\n\n";

// PASO 3: Pregunta natural sobre popularidad
echo "👤 USUARIO: ¿Cuál es el blog más popular?\n\n";
$respuesta3 = consultarGaby("¿Cuál es el blog más popular?", $sessionId);
if ($respuesta3) {
    echo "🤖 GABY: " . $respuesta3['output'] . "\n\n";
}

echo str_repeat("-", 80) . "\n\n";

// PASO 4: Pregunta sobre contenido específico
echo "👤 USUARIO: ¿De qué trata ese blog?\n\n";
$respuesta4 = consultarGaby("¿De qué trata ese blog?", $sessionId);
if ($respuesta4) {
    echo "🤖 GABY: " . $respuesta4['output'] . "\n\n";
}

echo str_repeat("=", 80) . "\n";
echo "✅ TEST NATURAL COMPLETADO\n";
echo "🆔 Session ID: " . $sessionId . "\n";
?>