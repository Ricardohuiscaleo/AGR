<?php
/**
 * Test directo del scraping sin confundir a Gaby
 */

header('Content-Type: text/plain; charset=utf-8');

echo "=== TEST DIRECTO DE SCRAPING 🕷️ ===\n\n";

// Función para hacer consulta GET directa
function consultarGabyGET($mensaje, $sessionId = null) {
    if (!$sessionId) {
        $sessionId = 'scraping-test-' . time();
    }
    
    $url = 'https://agenterag.com/php-apis/gaby-agent.php?' . http_build_query([
        'message' => $mensaje,
        'session' => $sessionId
    ]);
    
    $response = file_get_contents($url);
    
    if ($response) {
        return json_decode($response, true);
    }
    
    return null;
}

$sessionId = 'scraping-test-' . time();

// Test 1: URL simple para activar scraping
echo "1. TEST: URL directa para activar scraping\n";
echo "   Mensaje: https://agenterag.com/php-apis/estadisticas.php\n\n";

$respuesta1 = consultarGabyGET("https://agenterag.com/php-apis/estadisticas.php", $sessionId);

if ($respuesta1) {
    echo "🤖 RESPUESTA DE GABY:\n";
    echo $respuesta1['output'] . "\n\n";
    echo "⏱️ Tiempo: " . $respuesta1['timestamp'] . "\n\n";
} else {
    echo "❌ Error en la consulta\n\n";
}

echo str_repeat("=", 60) . "\n\n";

// Test 2: Pregunta con URL incluida
echo "2. TEST: Pregunta con URL incluida\n";
echo "   Mensaje: Revisa esta información: https://agenterag.com/php-apis/obtener-blogs.php\n\n";

$respuesta2 = consultarGabyGET("Revisa esta información: https://agenterag.com/php-apis/obtener-blogs.php", $sessionId);

if ($respuesta2) {
    echo "🤖 RESPUESTA DE GABY:\n";
    echo $respuesta2['output'] . "\n\n";
    echo "⏱️ Tiempo: " . $respuesta2['timestamp'] . "\n\n";
} else {
    echo "❌ Error en la consulta\n\n";
}

echo str_repeat("=", 60) . "\n\n";

// Test 3: Múltiples URLs
echo "3. TEST: Múltiples URLs\n";
echo "   URLs: estadisticas.php + obtener-blogs.php\n\n";

$respuesta3 = consultarGabyGET("https://agenterag.com/php-apis/estadisticas.php https://agenterag.com/php-apis/obtener-blogs.php", $sessionId);

if ($respuesta3) {
    echo "🤖 RESPUESTA DE GABY:\n";
    echo $respuesta3['output'] . "\n\n";
    echo "⏱️ Tiempo: " . $respuesta3['timestamp'] . "\n\n";
} else {
    echo "❌ Error en la consulta\n\n";
}

echo "✅ TEST COMPLETADO\n";
?>