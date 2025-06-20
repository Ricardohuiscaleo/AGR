<?php
/**
 * API para obtener estadísticas del blog - VERSIÓN CORREGIDA
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
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
        
        if (strpos($line, '=') === false) {
            continue;
        }
        
        $parts = explode('=', $line, 2);
        if (count($parts) !== 2) {
            continue;
        }
        
        $name = trim($parts[0]);
        $value = trim($parts[1]);
        
        if ((substr($value, 0, 1) === '"' && substr($value, -1) === '"') ||
            (substr($value, 0, 1) === "'" && substr($value, -1) === "'")) {
            $value = substr($value, 1, -1);
        }
        
        if (!array_key_exists($name, $_ENV)) {
            $_ENV[$name] = $value;
        }
    }
    
    return true;
}

// Variables por defecto (fallback)
$SUPABASE_URL = 'https://uznvakpuuxnpdhoejrog.supabase.co';
$SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6bnZha3B1dHhucGRob2Vqcm9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwODg0MTAsImV4cCI6MjA2NDY2NDQxMH0.OxbLYkjlgpWFnqd28gaZSwar_NQ6_qUS3U76bqbcXVg';

// 🔒 UBICACIÓN SEGURA: Buscar .env FUERA de public_html
$env_paths = [
    __DIR__ . '/../../.env',
    __DIR__ . '/../.env',
    $_SERVER['DOCUMENT_ROOT'] . '/../.env'
];

$env_loaded = false;
foreach ($env_paths as $env_path) {
    if (loadEnvSafe($env_path)) {
        $env_loaded = true;
        break;
    }
}

if ($env_loaded) {
    $SUPABASE_URL = $_ENV['PUBLIC_SUPABASE_URL'] ?? $SUPABASE_URL;
    $SUPABASE_ANON_KEY = $_ENV['PUBLIC_SUPABASE_ANON_KEY'] ?? $SUPABASE_ANON_KEY;
}

try {
    // URLs para diferentes estadísticas
    $urlTotal = $SUPABASE_URL . '/rest/v1/blog_posts?select=id&publicado=eq.true';
    $urlIA = $SUPABASE_URL . '/rest/v1/blog_posts?select=id&publicado=eq.true&autor=like.%F0%9F%A4%96*';
    $urlRecientes = $SUPABASE_URL . '/rest/v1/blog_posts?select=id,fecha_publicacion&publicado=eq.true&fecha_publicacion=gte.' . date('Y-m-d', strtotime('-30 days'));
    
    $options = [
        'http' => [
            'header' => [
                "Authorization: Bearer $SUPABASE_ANON_KEY",
                "apikey: $SUPABASE_ANON_KEY",
                "Content-Type: application/json"
            ],
            'method' => 'GET',
            'timeout' => 30
        ]
    ];
    
    $context = stream_context_create($options);
    
    // Total de posts
    $responseTotal = file_get_contents($urlTotal, false, $context);
    $totalPosts = $responseTotal ? count(json_decode($responseTotal, true)) : 0;
    
    // Posts generados por IA
    $responseIA = file_get_contents($urlIA, false, $context);
    $totalPostsIA = $responseIA ? count(json_decode($responseIA, true)) : 0;
    
    // Posts recientes (últimos 30 días)
    $responseRecientes = file_get_contents($urlRecientes, false, $context);
    $postsRecientes = $responseRecientes ? count(json_decode($responseRecientes, true)) : 0;
    
    // Estadísticas calculadas
    $estadisticas = [
        'total_published' => $totalPosts,
        'total_ia_generated' => $totalPostsIA,
        'posts_last_30_days' => $postsRecientes,
        'total_views' => 0, // Se puede implementar después
        'total_likes' => 0, // Se puede implementar después
        'avg_reading_time' => 5, // Promedio estimado
        'avg_generation_time' => 2.5 // Promedio estimado en minutos
    ];
    
    echo json_encode([
        'success' => true,
        'estadisticas' => $estadisticas
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error al obtener estadísticas',
        'estadisticas' => [
            'total_published' => 0,
            'total_ia_generated' => 0,
            'posts_last_30_days' => 0,
            'total_views' => 0,
            'total_likes' => 0,
            'avg_reading_time' => 0,
            'avg_generation_time' => 0
        ]
    ]);
}
?>