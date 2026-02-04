<?php
/**
 * API para obtener las estadísticas del blog. [Versión Final y Corregida]
 * Utiliza la carga de config.php clonada y la función RPC get_blog_stats_v2.
 */

// --- Carga de Configuración Segura (LÓGICA CLONADA DEL TEST EXITOSO) ---
$config_path = __DIR__ . '/../../config.php'; 

if (!file_exists($config_path) || !is_readable($config_path)) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'error' => 'Error Crítico: No se pudo cargar config.php desde la ruta verificada.']);
    exit;
}

$config = require $config_path;

if (empty($config['PUBLIC_SUPABASE_URL']) || empty($config['PUBLIC_SUPABASE_ANON_KEY'])) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'error' => 'Error Crítico: Faltan claves de Supabase en el config.php cargado.']);
    exit;
}

// --- Script Principal ---
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); 

try {
    // Apuntamos a la función v2 que incluye todas las métricas.
    $apiUrl = $config['PUBLIC_SUPABASE_URL'] . '/rest/v1/rpc/get_blog_stats_v2';

    $ch = curl_init($apiUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    // Para llamar a una función RPC sin parámetros, POST es más robusto.
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'apikey: ' . $config['PUBLIC_SUPABASE_ANON_KEY'],
        'Authorization: Bearer ' . $config['PUBLIC_SUPABASE_ANON_KEY']
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);

    $response = curl_exec($ch);
    $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpcode === 200) {
        $stats_raw = json_decode($response, true);
        // La respuesta de RPC suele ser un array con un solo objeto, lo extraemos.
        $stats = $stats_raw[0] ?? null;

        if ($stats) {
            echo json_encode(['success' => true, 'estadisticas' => $stats]);
        } else {
             throw new Exception('La función RPC get_blog_stats_v2 no devolvió un objeto de estadísticas válido.');
        }
    } else {
        throw new Exception("Error al llamar a la RPC get_blog_stats_v2. Código de respuesta: " . $httpcode);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'CONFESIÓN STATS: ' . $e->getMessage()]);
}
?>