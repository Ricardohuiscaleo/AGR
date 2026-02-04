<?php
/**
 * Test final simple y directo del sistema de intenciones
 */

header('Content-Type: text/plain; charset=utf-8');

echo "=== TEST FINAL SIMPLE 🎯 ===\n\n";

function consultarGaby($mensaje, $sessionId) {
    $url = 'https://agenterag.com/php-apis/gaby-agent.php?' . http_build_query([
        'message' => $mensaje,
        'session' => $sessionId
    ]);
    
    $response = file_get_contents($url);
    return $response ? json_decode($response, true) : null;
}

// TEST RÁPIDO DE CADA MODO
$tests = [
    [
        'modo' => '❓ FAQ',
        'session' => 'faq-final-' . time(),
        'mensajes' => [
            'Hola, soy Pedro',
            '¿Qué es un chatbot con IA?'
        ]
    ],
    [
        'modo' => '🔍 INFO',
        'session' => 'info-final-' . time(),
        'mensajes' => [
            'Hola, soy Laura',
            '¿Cuántos blogs tienen?'
        ]
    ],
    [
        'modo' => '💼 VENTAS',
        'session' => 'ventas-final-' . time(),
        'mensajes' => [
            'Hola, soy Miguel',
            'Quiero automatizar mi negocio'
        ]
    ],
    [
        'modo' => '💬 CASUAL',
        'session' => 'casual-final-' . time(),
        'mensajes' => [
            'Hola, ¿cómo estás?',
            'Me llamo Sofia'
        ]
    ]
];

foreach ($tests as $test) {
    echo "{$test['modo']} TEST:\n";
    echo str_repeat("-", 40) . "\n";
    
    foreach ($test['mensajes'] as $mensaje) {
        echo "👤 USER: {$mensaje}\n";
        
        $respuesta = consultarGaby($mensaje, $test['session']);
        if ($respuesta) {
            $output = $respuesta['output'];
            // Limitar longitud para visualización
            if (strlen($output) > 150) {
                $output = substr($output, 0, 150) . "...";
            }
            echo "🤖 GABY: {$output}\n\n";
        } else {
            echo "❌ ERROR\n\n";
        }
    }
    
    echo str_repeat("=", 50) . "\n\n";
}

echo "✅ TEST FINAL COMPLETADO\n\n";
echo "🎯 EVALUACIÓN:\n";
echo "- FAQ: ¿Respuesta técnica concisa?\n";
echo "- INFO: ¿Datos específicos (11 blogs)?\n";
echo "- VENTAS: ¿Pregunta comercial?\n";
echo "- CASUAL: ¿Conversación natural?\n";
?>