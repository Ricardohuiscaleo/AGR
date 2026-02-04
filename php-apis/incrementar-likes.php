<?php
/**
 * API para incrementar likes de un blog. [Versión Final y Corregida]
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
header('Access-Control-Allow-Headers: Content-Type, Authorization'); // Header importante para CORS
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
    
    // 1. Llamar a la función RPC para incrementar el like
    $apiUrl = $config['PUBLIC_SUPABASE_URL'] . '/rest/v1/rpc/increment_post_likes';
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

    // 2. Si la RPC fue exitosa (204 No Content), obtener el nuevo total de likes
    if ($httpcode === 204) {
        $getLikesUrl = $config['PUBLIC_SUPABASE_URL'] . '/rest/v1/blog_posts?select=likes&id=eq.' . urlencode($postId);
        $get_ch = curl_init($getLikesUrl);
        curl_setopt($get_ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($get_ch, CURLOPT_HTTPHEADER, [ 
            'apikey: ' . $config['PUBLIC_SUPABASE_ANON_KEY'], 
            'Authorization: Bearer ' . $config['PUBLIC_SUPABASE_ANON_KEY'] 
        ]);
        $getResult = curl_exec($get_ch);
        curl_close($get_ch);
        $likesData = json_decode($getResult, true);
        
        // Devolver la respuesta final al frontend
        echo json_encode(['success' => true, 'likes' => $likesData[0]['likes'] ?? 0]);
    } else {
        throw new Exception("Error al llamar a la RPC increment_post_likes. Código de respuesta: " . $httpcode);
    }
} catch (Exception $e) {
    $errorCode = $e->getCode();
    http_response_code(is_int($errorCode) && $errorCode >= 400 && $errorCode < 600 ? $errorCode : 500);
    echo json_encode(['success' => false, 'error' => 'CONFESIÓN LIKES: ' . $e->getMessage()]);
}
?>