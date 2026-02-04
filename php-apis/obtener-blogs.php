<?php
/**
 * API para obtener TODOS los blogs. [Versión Final y Corregida]
 * Utiliza la carga de config.php clonada.
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
    $apiUrl = $config['PUBLIC_SUPABASE_URL'] . '/rest/v1/blog_posts?select=*&publicado=eq.true&order=fecha_publicacion.desc&limit=20';

    $ch = curl_init($apiUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'apikey: ' . $config['PUBLIC_SUPABASE_ANON_KEY'],
        'Authorization: Bearer ' . $config['PUBLIC_SUPABASE_ANON_KEY']
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);

    $response = curl_exec($ch);
    $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpcode >= 200 && $httpcode < 300) {
        $blogs = json_decode($response, true);
        echo json_encode(['success' => true, 'blogs' => $blogs ?? []]);
    } else {
        throw new Exception("Error al llamar a la API de Supabase. Código de respuesta: " . $httpcode);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'CONFESIÓN OBTENER-BLOGS: ' . $e->getMessage()
    ]);
}
?>