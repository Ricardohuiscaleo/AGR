<?php
/**
 * API: Obtener blog completo por ID
 * Equivalente a: src/pages/api/blog/obtener-completo/[blogId].ts
 * Ruta: /php-apis/obtener-completo-blog.php?id=BLOG_ID
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Manejar preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit();
}

// 🔐 FUNCIÓN SEGURA para cargar variables de entorno
function loadEnvSafe($path) {
    if (!file_exists($path)) {
        return false;
    }
    
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    if ($lines === false) {
        return false;
    }
    
    foreach ($lines as $line) {
        $line = trim($line);
        if (empty($line) || strpos($line, '#') === 0) {
            continue;
        }
        
        if (strpos($line, '=') !== false) {
            list($key, $value) = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value, '"\'');
            $_ENV[$key] = $value;
            putenv("$key=$value");
        }
    }
    return true;
}

try {
    // Validar método
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        throw new Exception('Solo se permite método GET');
    }

    // Obtener ID del blog
    $blogId = $_GET['id'] ?? '';
    if (empty($blogId)) {
        throw new Exception('ID del blog es requerido');
    }

    // 🔒 Buscar .env en ubicaciones seguras
    $env_paths = [
        __DIR__ . '/../../.env',
        __DIR__ . '/../.env',
        $_SERVER['DOCUMENT_ROOT'] . '/../.env'
    ];

    foreach ($env_paths as $env_path) {
        if (loadEnvSafe($env_path)) {
            break;
        }
    }

    // Variables de Supabase
    $SUPABASE_URL = $_ENV['PUBLIC_SUPABASE_URL'] ?? 'https://uznvakpuuxnpdhoejrog.supabase.co';
    $SUPABASE_ANON_KEY = $_ENV['PUBLIC_SUPABASE_ANON_KEY'] ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6bnZha3B1dHhucGRob2Vqcm9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwODg0MTAsImV4cCI6MjA2NDY2NDQxMH0.OxbLYkjlgpWFnqd28gaZSwar_NQ6_qUS3U76bqbcXVg';

    // 📖 Obtener blog específico por ID
    $blog_url = $SUPABASE_URL . '/rest/v1/blog_posts?select=*&id=eq.' . urlencode($blogId) . '&publicado=eq.true';
    
    $context = stream_context_create([
        'http' => [
            'header' => [
                "Authorization: Bearer $SUPABASE_ANON_KEY",
                "apikey: $SUPABASE_ANON_KEY",
                "Content-Type: application/json"
            ]
        ]
    ]);

    $response = file_get_contents($blog_url, false, $context);
    
    if ($response === FALSE) {
        throw new Exception('Error conectando con Supabase');
    }

    $blogs = json_decode($response, true);
    
    if (empty($blogs)) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'error' => 'Blog no encontrado'
        ]);
        exit;
    }

    $blog = $blogs[0];

    // 📊 Incrementar vistas automáticamente al obtener el blog completo
    $update_url = $SUPABASE_URL . '/rest/v1/blog_posts?id=eq.' . urlencode($blogId);
    $current_views = intval($blog['vistas'] ?? 0);
    $new_views = $current_views + 1;
    
    $update_context = stream_context_create([
        'http' => [
            'method' => 'PATCH',
            'header' => [
                "Authorization: Bearer $SUPABASE_ANON_KEY",
                "apikey: $SUPABASE_ANON_KEY",
                "Content-Type: application/json",
                "Prefer: return=minimal"
            ],
            'content' => json_encode(['vistas' => $new_views])
        ]
    ]);

    // Intentar actualizar vistas (no crítico si falla)
    @file_get_contents($update_url, false, $update_context);
    
    // Actualizar el valor en la respuesta
    $blog['vistas'] = $new_views;

    // Respuesta exitosa
    echo json_encode([
        'success' => true,
        'blog' => $blog
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error interno del servidor',
        'message' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>