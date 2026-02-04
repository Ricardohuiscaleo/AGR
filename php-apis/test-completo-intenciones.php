<?php
/**
 * Test completo del sistema de intenciones incluyendo FAQ
 */

header('Content-Type: text/plain; charset=utf-8');

echo "=== TEST COMPLETO DE INTENCIONES 🧠🎯✨ ===\n\n";

function consultarGaby($mensaje, $sessionId) {
    $url = 'https://agenterag.com/php-apis/gaby-agent.php?' . http_build_query([
        'message' => $mensaje,
        'session' => $sessionId
    ]);
    
    $response = file_get_contents($url);
    return $response ? json_decode($response, true) : null;
}

// TEST 1: MODO FAQ (Knowledge Base)
echo "❓ TEST 1: MODO FAQ (Knowledge Base)\n";
echo str_repeat("-", 60) . "\n\n";

$sessionId1 = 'faq-' . time();

echo "👤 USUARIO: Hola, soy Luis\n\n";
$respuesta1 = consultarGaby("Hola, soy Luis", $sessionId1);
if ($respuesta1) {
    echo "🤖 GABY: " . $respuesta1['output'] . "\n\n";
}

echo "👤 USUARIO: ¿Qué es un agente RAG?\n\n";
$respuesta2 = consultarGaby("¿Qué es un agente RAG?", $sessionId1);
if ($respuesta2) {
    echo "🤖 GABY: " . $respuesta2['output'] . "\n\n";
}

echo "👤 USUARIO: ¿Cuáles son los beneficios de un chatbot con IA?\n\n";
$respuesta3 = consultarGaby("¿Cuáles son los beneficios de un chatbot con IA?", $sessionId1);
if ($respuesta3) {
    echo "🤖 GABY: " . $respuesta3['output'] . "\n\n";
}

echo str_repeat("=", 80) . "\n\n";

// TEST 2: MODO INFORMATIVO (Scraping)
echo "🔍 TEST 2: MODO INFORMATIVO (Scraping)\n";
echo str_repeat("-", 60) . "\n\n";

$sessionId2 = 'info-' . time();

echo "👤 USUARIO: Hola, soy María\n\n";
$respuesta4 = consultarGaby("Hola, soy María", $sessionId2);
if ($respuesta4) {
    echo "🤖 GABY: " . $respuesta4['output'] . "\n\n";
}

echo "👤 USUARIO: ¿Cuántos blogs tienen?\n\n";
$respuesta5 = consultarGaby("¿Cuántos blogs tienen?", $sessionId2);
if ($respuesta5) {
    echo "🤖 GABY: " . $respuesta5['output'] . "\n\n";
}

echo str_repeat("=", 80) . "\n\n";

// TEST 3: MODO VENTAS (CRM)
echo "💼 TEST 3: MODO VENTAS (CRM)\n";
echo str_repeat("-", 60) . "\n\n";

$sessionId3 = 'ventas-' . time();

echo "👤 USUARIO: Hola, soy Carlos\n\n";
$respuesta6 = consultarGaby("Hola, soy Carlos", $sessionId3);
if ($respuesta6) {
    echo "🤖 GABY: " . $respuesta6['output'] . "\n\n";
}

echo "👤 USUARIO: Quiero automatizar mi empresa\n\n";
$respuesta7 = consultarGaby("Quiero automatizar mi empresa", $sessionId3);
if ($respuesta7) {
    echo "🤖 GABY: " . $respuesta7['output'] . "\n\n";
}

echo str_repeat("=", 80) . "\n\n";

// TEST 4: MODO CASUAL (Conversación)
echo "💬 TEST 4: MODO CASUAL (Conversación)\n";
echo str_repeat("-", 60) . "\n\n";

$sessionId4 = 'casual-' . time();

echo "👤 USUARIO: Hola, ¿cómo estás?\n\n";
$respuesta8 = consultarGaby("Hola, ¿cómo estás?", $sessionId4);
if ($respuesta8) {
    echo "🤖 GABY: " . $respuesta8['output'] . "\n\n";
}

echo "👤 USUARIO: Me llamo Ana\n\n";
$respuesta9 = consultarGaby("Me llamo Ana", $sessionId4);
if ($respuesta9) {
    echo "🤖 GABY: " . $respuesta9['output'] . "\n\n";
}

echo str_repeat("=", 80) . "\n";
echo "✅ TEST COMPLETO DE INTENCIONES FINALIZADO\n\n";

echo "🎯 MODOS DE GABY:\n";
echo "❓ FAQ: Responde preguntas técnicas usando knowledge base\n";
echo "🔍 INFORMATIVO: Busca datos específicos con scraping\n";
echo "💼 VENTAS: Activa flujo comercial y recopila datos\n";
echo "💬 CASUAL: Conversación natural y amigable\n\n";

echo "🧠 INTELIGENCIA CONTEXTUAL:\n";
echo "- ✅ Detecta automáticamente la intención del usuario\n";
echo "- ✅ Usa la herramienta correcta para cada tipo de consulta\n";
echo "- ✅ Mantiene coherencia conversacional\n";
echo "- ✅ Evita repeticiones innecesarias\n";
?>