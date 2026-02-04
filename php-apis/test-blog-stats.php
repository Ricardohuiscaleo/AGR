<?php
/**
 * Script para probar la obtención de estadísticas de blogs
 */

// --- Carga de Configuración Segura ---
$config_path = __DIR__ . '/../../config.php'; 

if (!file_exists($config_path) || !is_readable($config_path)) {
    echo json_encode(['error' => 'No se pudo cargar config.php']);
    exit;
}

$config = require $config_path;

if (empty($config['PUBLIC_SUPABASE_URL']) || empty($config['PUBLIC_SUPABASE_ANON_KEY'])) {
    echo json_encode(['error' => 'Faltan claves de Supabase en config.php']);
    exit;
}

$SUPABASE_URL = $config['PUBLIC_SUPABASE_URL'];
$SUPABASE_ANON_KEY = $config['PUBLIC_SUPABASE_ANON_KEY'];

header('Content-Type: application/json');

try {
    // Método 1: Usar estadisticas.php
    $apiUrl = 'https://agenterag.com/php-apis/estadisticas.php';
    
    $ch = curl_init($apiUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    
    $response = curl_exec($ch);
    $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpcode === 200) {
        $result = json_decode($response, true);
        if (isset($result['success']) && $result['success']) {
            echo json_encode([
                'success' => true,
                'message' => 'Estadísticas obtenidas correctamente desde estadisticas.php',
                'stats' => $result['estadisticas'] ?? []
            ]);
            exit;
        }
    }
    
    // Método 2: Usar directamente Supabase
    $apiUrl = $SUPABASE_URL . '/rest/v1/rpc/get_blog_stats_v2';
    
    $ch = curl_init($apiUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, '{}');
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'apikey: ' . $SUPABASE_ANON_KEY,
        'Authorization: Bearer ' . $SUPABASE_ANON_KEY
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    
    $response = curl_exec($ch);
    $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpcode === 200) {
        $stats_raw = json_decode($response, true);
        
        if (is_array($stats_raw) && !empty($stats_raw)) {
            echo json_encode([
                'success' => true,
                'message' => 'Estadísticas obtenidas correctamente desde Supabase',
                'stats' => $stats_raw[0] ?? []
            ]);
            exit;
        }
    }
    
    // Si llegamos aquí, ambos métodos fallaron
    echo json_encode([
        'error' => 'No se pudieron obtener estadísticas',
        'httpcode_estadisticas' => $httpcode,
        'response' => $response
    ]);
    
} catch (Exception $e) {
    echo json_encode(['error' => 'Error: ' . $e->getMessage()]);
}
?>