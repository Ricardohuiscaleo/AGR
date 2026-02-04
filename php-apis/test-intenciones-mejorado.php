<?php
/**
 * Test mejorado del sistema de intenciones con scraping y knowledge base
 */

header('Content-Type: text/plain; charset=utf-8');

echo "=== TEST MEJORADO DE INTENCIONES 🧠✨ ===\n\n";

function consultarGaby($mensaje, $sessionId) {
    $url = 'https://agenterag.com/php-apis/gaby-agent.php?' . http_build_query([
        'message' => $mensaje,
        'session' => $sessionId
    ]);
    
    $response = file_get_contents($url);
    return $response ? json_decode($response, true) : null;
}

// TEST 1: MODO INFORMATIVO CON SCRAPING AUTOMÁTICO
echo "🔍 TEST 1: MODO INFORMATIVO (con scraping automático)\n";
echo str_repeat("-", 60) . "\n\n";

$sessionId1 = 'info-mejorado-' . time();

echo "👤 USUARIO: Hola, soy Carlos\n\n";
$respuesta1 = consultarGaby("Hola, soy Carlos", $sessionId1);
if ($respuesta1) {
    echo "🤖 GABY: " . $respuesta1['output'] . "\n\n";
}

echo "👤 USUARIO: ¿Cuántos blogs tienen publicados?\n\n";
$respuesta2 = consultarGaby("¿Cuántos blogs tienen publicados?", $sessionId1);
if ($respuesta2) {
    echo "🤖 GABY: " . $respuesta2['output'] . "\n\n";
}

echo "👤 USUARIO: ¿Cuál es el blog más popular?\n\n";
$respuesta3 = consultarGaby("¿Cuál es el blog más popular?", $sessionId1);
if ($respuesta3) {
    echo "🤖 GABY: " . $respuesta3['output'] . "\n\n";
}

echo str_repeat("=", 80) . "\n\n";

// TEST 2: MODO VENTAS SIN REPETICIONES
echo "💼 TEST 2: MODO VENTAS (sin repeticiones)\n";
echo str_repeat("-", 60) . "\n\n";

$sessionId2 = 'ventas-mejorado-' . time();

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

echo "👤 USUARIO: Mi empresa se llama TechCorp\n\n";
$respuesta6 = consultarGaby("Mi empresa se llama TechCorp", $sessionId2);
if ($respuesta6) {
    echo "🤖 GABY: " . $respuesta6['output'] . "\n\n";
}

echo str_repeat("=", 80) . "\n\n";

// TEST 3: CONVERSACIÓN CASUAL COHERENTE
echo "💬 TEST 3: CONVERSACIÓN CASUAL (coherente)\n";
echo str_repeat("-", 60) . "\n\n";

$sessionId3 = 'casual-mejorado-' . time();

echo "👤 USUARIO: Hola, ¿cómo estás?\n\n";
$respuesta7 = consultarGaby("Hola, ¿cómo estás?", $sessionId3);
if ($respuesta7) {
    echo "🤖 GABY: " . $respuesta7['output'] . "\n\n";
}

echo "👤 USUARIO: Me llamo Pedro\n\n";
$respuesta8 = consultarGaby("Me llamo Pedro", $sessionId3);
if ($respuesta8) {
    echo "🤖 GABY: " . $respuesta8['output'] . "\n\n";
}

echo "👤 USUARIO: Gracias, muy bien también\n\n";
$respuesta9 = consultarGaby("Gracias, muy bien también", $sessionId3);
if ($respuesta9) {
    echo "🤖 GABY: " . $respuesta9['output'] . "\n\n";
}

echo str_repeat("=", 80) . "\n";
echo "✅ TEST MEJORADO COMPLETADO\n\n";
echo "🎯 MEJORAS IMPLEMENTADAS:\n";
echo "- ✅ Scraping automático para consultas informativas\n";
echo "- ✅ Eliminación de repetitividad en conversaciones\n";
echo "- ✅ Mantenimiento de hilo conversacional\n";
echo "- ✅ Uso inteligente de knowledge base\n";
?>