<?php
/**
 * API para incrementar las vistas de un blog. [Versión Final y Corregida]
 * Utiliza la carga de config.php clonada y la función RPC de Supabase.
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
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(); }

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') { 
        throw new Exception('Solo se permite el método POST.', 405); 
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    $postId = $data['postId'] ?? null;
    
    if (!$postId) { 
        throw new Exception('El parámetro postId es requerido.', 400); 
    }
    
    // Llamar a la función RPC para incrementar las vistas
    $apiUrl = $config['PUBLIC_SUPABASE_URL'] . '/rest/v1/rpc/increment_post_views';
    $ch = curl_init($apiUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['post_id' => $postId]));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [ 
        'Content-Type: application/json', 
        'apikey: ' . $config['PUBLIC_SUPABASE_ANON_KEY'], 
        'Authorization: Bearer ' . $config['PUBLIC_SUPABASE_ANON_KEY'] 
    ]);
    curl_exec($ch);
    $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    // La RPC 'increment_post_views' devuelve 204 No Content si tiene éxito.
    if ($httpcode === 204) {
        echo json_encode(['success' => true, 'message' => 'Vista incrementada.']);
    } else {
        throw new Exception("Error al llamar a la RPC increment_post_views. Código de respuesta: " . $httpcode);
    }
} catch (Exception $e) {
    $errorCode = $e->getCode();
    http_response_code(is_int($errorCode) && $errorCode >= 400 && $errorCode < 600 ? $errorCode : 500);
    echo json_encode(['success' => false, 'error' => 'CONFESIÓN VISTAS: ' . $e->getMessage()]);
}
?>