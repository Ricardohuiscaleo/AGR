<?php
/**
 * Test de Gaby con sus poderes de scraping para consultas sobre blogs
 */

header('Content-Type: text/plain; charset=utf-8');

echo "=== TEST DE GABY CON PODERES DE SCRAPING 🕷️🤖 ===\n\n";

// Función para hacer consulta a Gaby
function consultarGaby($mensaje, $sessionId = null) {
    if (!$sessionId) {
        $sessionId = 'test-scraping-' . time();
    }
    
    $url = 'https://agenterag.com/php-apis/gaby-agent.php';
    $data = [
        'message' => $mensaje
    ];
    
    $options = [
        'http' => [
            'header' => "Content-type: application/json\r\nx-session-id: {$sessionId}\r\n",
            'method' => 'POST',
            'content' => json_encode($data)
        ]
    ];
    
    $context = stream_context_create($options);
    $response = file_get_contents($url, false, $context);
    
    if ($response) {
        return json_decode($response, true);
    }
    
    return null;
}

$sessionId = 'test-scraping-' . time();

// 1. Consulta sobre cuántos blogs tenemos
echo "1. PREGUNTA: ¿Cuántos blogs tenemos?\n";
echo "   URL que Gaby scrapeará: https://agenterag.com/php-apis/estadisticas.php\n\n";

$respuesta1 = consultarGaby("¿Cuántos blogs tenemos? Consulta en https://agenterag.com/php-apis/estadisticas.php", $sessionId);

if ($respuesta1) {
    echo "🤖 RESPUESTA DE GABY:\n";
    echo $respuesta1['output'] . "\n\n";
    echo "⏱️ Tiempo: " . $respuesta1['timestamp'] . "\n";
    echo "🆔 Session: " . $respuesta1['session_id'] . "\n\n";
} else {
    echo "❌ Error en la consulta\n\n";
}

echo str_repeat("=", 80) . "\n\n";

// 2. Consulta sobre el blog con más likes
echo "2. PREGUNTA: ¿Cuál es el blog con más likes y de qué se trata?\n";
echo "   URL que Gaby scrapeará: https://agenterag.com/php-apis/obtener-blogs.php\n\n";

$respuesta2 = consultarGaby("¿Cuál es el blog con más likes y de qué se trata? Consulta en https://agenterag.com/php-apis/obtener-blogs.php", $sessionId);

if ($respuesta2) {
    echo "🤖 RESPUESTA DE GABY:\n";
    echo $respuesta2['output'] . "\n\n";
    echo "⏱️ Tiempo: " . $respuesta2['timestamp'] . "\n";
    echo "🆔 Session: " . $respuesta2['session_id'] . "\n\n";
} else {
    echo "❌ Error en la consulta\n\n";
}

echo str_repeat("=", 80) . "\n\n";

// 3. Consulta combinada
echo "3. PREGUNTA COMBINADA: Dame un resumen completo de nuestros blogs\n";
echo "   URLs que Gaby scrapeará: estadisticas.php + obtener-blogs.php\n\n";

$respuesta3 = consultarGaby("Dame un resumen completo de nuestros blogs. Consulta https://agenterag.com/php-apis/estadisticas.php y https://agenterag.com/php-apis/obtener-blogs.php para darme información completa", $sessionId);

if ($respuesta3) {
    echo "🤖 RESPUESTA DE GABY:\n";
    echo $respuesta3['output'] . "\n\n";
    echo "⏱️ Tiempo: " . $respuesta3['timestamp'] . "\n";
    echo "🆔 Session: " . $respuesta3['session_id'] . "\n\n";
} else {
    echo "❌ Error en la consulta\n\n";
}

echo "✅ TEST COMPLETADO - Gaby usó sus poderes de scraping 🕷️✨\n";
?>