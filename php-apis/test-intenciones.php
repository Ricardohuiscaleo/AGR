<?php
/**
 * Test del nuevo sistema de intenciones de Gaby
 */

header('Content-Type: text/plain; charset=utf-8');

echo "=== TEST DEL SISTEMA DE INTENCIONES 🧠🎯 ===\n\n";

function consultarGaby($mensaje, $sessionId) {
    $url = 'https://agenterag.com/php-apis/gaby-agent.php?' . http_build_query([
        'message' => $mensaje,
        'session' => $sessionId
    ]);
    
    $response = file_get_contents($url);
    return $response ? json_decode($response, true) : null;
}

$sessionId = 'intenciones-' . time();

// TEST 1: INTENCIÓN INFORMATIVA
echo "🔍 TEST 1: INTENCIÓN INFORMATIVA\n";
echo "Usuario busca información sin interés comercial\n\n";

echo "👤 USUARIO: Hola, soy Carlos\n\n";
$respuesta1 = consultarGaby("Hola, soy Carlos", $sessionId);
if ($respuesta1) {
    echo "🤖 GABY: " . $respuesta1['output'] . "\n\n";
}

echo "👤 USUARIO: ¿Cuántos blogs tienen publicados?\n\n";
$respuesta2 = consultarGaby("¿Cuántos blogs tienen publicados?", $sessionId);
if ($respuesta2) {
    echo "🤖 GABY: " . $respuesta2['output'] . "\n\n";
}

echo "👤 USUARIO: ¿Cuál es el blog más popular?\n\n";
$respuesta3 = consultarGaby("¿Cuál es el blog más popular?", $sessionId);
if ($respuesta3) {
    echo "🤖 GABY: " . $respuesta3['output'] . "\n\n";
}

echo str_repeat("=", 80) . "\n\n";

// TEST 2: INTENCIÓN DE VENTAS
$sessionId2 = 'ventas-' . time();
echo "💼 TEST 2: INTENCIÓN DE VENTAS\n";
echo "Usuario interesado en servicios empresariales\n\n";

echo "👤 USUARIO: Hola, soy Ana\n\n";
$respuesta4 = consultarGaby("Hola, soy Ana", $sessionId2);
if ($respuesta4) {
    echo "🤖 GABY: " . $respuesta4['output'] . "\n\n";
}

echo "👤 USUARIO: Necesito automatizar procesos en mi empresa\n\n";
$respuesta5 = consultarGaby("Necesito automatizar procesos en mi empresa", $sessionId2);
if ($respuesta5) {
    echo "🤖 GABY: " . $respuesta5['output'] . "\n\n";
}

echo str_repeat("=", 80) . "\n\n";

// TEST 3: CONVERSACIÓN CASUAL
$sessionId3 = 'casual-' . time();
echo "💬 TEST 3: CONVERSACIÓN CASUAL\n";
echo "Usuario solo quiere conversar\n\n";

echo "👤 USUARIO: Hola, ¿cómo estás?\n\n";
$respuesta6 = consultarGaby("Hola, ¿cómo estás?", $sessionId3);
if ($respuesta6) {
    echo "🤖 GABY: " . $respuesta6['output'] . "\n\n";
}

echo "👤 USUARIO: Gracias, muy bien también\n\n";
$respuesta7 = consultarGaby("Gracias, muy bien también", $sessionId3);
if ($respuesta7) {
    echo "🤖 GABY: " . $respuesta7['output'] . "\n\n";
}

echo str_repeat("=", 80) . "\n";
echo "✅ TEST DE INTENCIONES COMPLETADO\n";
echo "\n🎯 RESUMEN:\n";
echo "- Modo Informativo: Responde preguntas directamente\n";
echo "- Modo Ventas: Activa flujo comercial\n";
echo "- Modo Casual: Conversación natural\n";
?>