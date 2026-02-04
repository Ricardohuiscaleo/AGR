<?php
/**
 * API para obtener un blog completo por ID e incrementar su vista. [Versión Final y Corregida]
 * Utiliza la carga de config.php clonada y funciones RPC de Supabase.
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
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(); }

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') { 
        throw new Exception('Solo se permite el método GET.', 405); 
    }

    $blogId = $_GET['id'] ?? null;
    if (!$blogId) { 
        throw new Exception('El parámetro ID del blog es requerido.', 400); 
    }

    // 1. Incrementar la vista usando la función RPC segura.
    // Lo hacemos primero para que no dependa de si el get funciona.
    $rpcUrl = $config['PUBLIC_SUPABASE_URL'] . '/rest/v1/rpc/increment_post_views';
    $ch_rpc = curl_init($rpcUrl);
    curl_setopt($ch_rpc, CURLOPT_POST, true);
    curl_setopt($ch_rpc, CURLOPT_POSTFIELDS, json_encode(['post_id' => $blogId]));
    curl_setopt($ch_rpc, CURLOPT_HTTPHEADER, [ 'Content-Type: application/json', 'apikey: ' . $config['PUBLIC_SUPABASE_ANON_KEY'], 'Authorization: Bearer ' . $config['PUBLIC_SUPABASE_ANON_KEY'] ]);
    curl_setopt($ch_rpc, CURLOPT_RETURNTRANSFER, true);
    curl_exec($ch_rpc); // Ejecutamos pero no necesitamos la respuesta
    curl_close($ch_rpc);

    // 2. Obtener los datos completos del blog.
    $blogUrl = $config['PUBLIC_SUPABASE_URL'] . '/rest/v1/blog_posts?select=*&id=eq.' . urlencode($blogId);
    $ch_get = curl_init($blogUrl);
    curl_setopt($ch_get, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch_get, CURLOPT_HTTPHEADER, [ 
        'apikey: ' . $config['PUBLIC_SUPABASE_ANON_KEY'], 
        'Authorization: Bearer ' . $config['PUBLIC_SUPABASE_ANON_KEY'] 
    ]);
    $response = curl_exec($ch_get);
    $httpcode = curl_getinfo($ch_get, CURLINFO_HTTP_CODE);
    curl_close($ch_get);
    
    if ($httpcode === 200) {
        $blogs = json_decode($response, true);
        if (empty($blogs)) {
            throw new Exception('Blog no encontrado.', 404);
        }
        echo json_encode(['success' => true, 'blog' => $blogs[0]]);
    } else {
        throw new Exception("Error al obtener el blog completo. Código: " . $httpcode);
    }

} catch (Exception $e) {
    $errorCode = $e->getCode();
    http_response_code(is_int($errorCode) && $errorCode >= 400 && $errorCode < 600 ? $errorCode : 500);
    echo json_encode(['success' => false, 'error' => 'CONFESIÓN GET-COMPLETO: ' . $e->getMessage()]);
}
?>