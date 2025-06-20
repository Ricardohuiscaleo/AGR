<?php
/**
 * DEBUG: API para estadísticas del blog
 * Para identificar problemas en el cálculo de métricas
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

// Debug data collector
$debug_info = [
    'timestamp' => date('Y-m-d H:i:s'),
    'request_method' => $_SERVER['REQUEST_METHOD'],
    'php_version' => PHP_VERSION,
    'memory_usage' => memory_get_usage(true),
    'env_loaded' => false,
    'supabase_connection' => false,
    'queries_executed' => [],
    'errors' => []
];

try {
    // 🔒 Buscar .env en ubicaciones seguras
    $env_paths = [
        __DIR__ . '/../../.env',
        __DIR__ . '/../.env',
        $_SERVER['DOCUMENT_ROOT'] . '/../.env'
    ];

    foreach ($env_paths as $env_path) {
        if (loadEnvSafe($env_path)) {
            $debug_info['env_loaded'] = true;
            $debug_info['env_path'] = $env_path;
            break;
        }
    }

    // Variables de Supabase
    $SUPABASE_URL = $_ENV['PUBLIC_SUPABASE_URL'] ?? 'https://uznvakpuuxnpdhoejrog.supabase.co';
    $SUPABASE_ANON_KEY = $_ENV['PUBLIC_SUPABASE_ANON_KEY'] ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6bnZha3B1dHhucGRob2Vqcm9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwODg0MTAsImV4cCI6MjA2NDY2NDQxMH0.OxbLYkjlgpWFnqd28gaZSwar_NQ6_qUS3U76bqbcXVg';

    $debug_info['supabase_url'] = substr($SUPABASE_URL, 0, 30) . '...';
    $debug_info['supabase_key_length'] = strlen($SUPABASE_ANON_KEY);

    // 📊 1. ESTADÍSTICAS BÁSICAS DE POSTS
    $debug_info['queries_executed'][] = 'Obteniendo estadísticas básicas de posts';
    
    $basic_stats_url = $SUPABASE_URL . '/rest/v1/blog_posts?select=id,publicado,vistas,likes,tiempo_lectura';
    $context = stream_context_create([
        'http' => [
            'header' => [
                "Authorization: Bearer $SUPABASE_ANON_KEY",
                "apikey: $SUPABASE_ANON_KEY",
                "Content-Type: application/json"
            ]
        ]
    ]);

    $response = file_get_contents($basic_stats_url, false, $context);
    
    if ($response === FALSE) {
        throw new Exception('Error conectando con Supabase para estadísticas básicas');
    }

    $posts_data = json_decode($response, true);
    $debug_info['supabase_connection'] = true;
    $debug_info['total_posts_in_db'] = count($posts_data);

    // Calcular estadísticas básicas
    $total_posts = count($posts_data);
    $total_published = 0;
    $total_views = 0;
    $total_likes = 0;
    $total_reading_time = 0;
    $published_posts = [];

    foreach ($posts_data as $post) {
        if ($post['publicado']) {
            $total_published++;
            $total_views += intval($post['vistas'] ?? 0);
            $total_likes += intval($post['likes'] ?? 0);
            $total_reading_time += intval($post['tiempo_lectura'] ?? 0);
            $published_posts[] = $post['id'];
        }
    }

    $avg_reading_time = $total_published > 0 ? round($total_reading_time / $total_published, 1) : 0;

    $debug_info['basic_stats'] = [
        'total_posts' => $total_posts,
        'total_published' => $total_published,
        'total_views' => $total_views,
        'total_likes' => $total_likes,
        'avg_reading_time' => $avg_reading_time
    ];

    // 📊 2. ESTADÍSTICAS DE MÉTRICAS LLM
    $debug_info['queries_executed'][] = 'Obteniendo métricas de generación LLM';
    
    $llm_metrics_url = $SUPABASE_URL . '/rest/v1/blog_generacion_metricas?select=tiempo_generacion_ms,post_id';
    $llm_response = file_get_contents($llm_metrics_url, false, $context);

    $avg_generation_time = 0;
    $generation_count = 0;

    if ($llm_response !== FALSE) {
        $llm_data = json_decode($llm_response, true);
        $debug_info['llm_metrics_found'] = count($llm_data);
        
        $total_generation_time = 0;
        foreach ($llm_data as $metric) {
            if (isset($metric['tiempo_generacion_ms']) && $metric['tiempo_generacion_ms'] > 0) {
                $total_generation_time += intval($metric['tiempo_generacion_ms']);
                $generation_count++;
            }
        }
        
        $avg_generation_time = $generation_count > 0 ? round($total_generation_time / $generation_count) : 0;
        
        $debug_info['llm_stats'] = [
            'total_metrics' => count($llm_data),
            'valid_generation_times' => $generation_count,
            'avg_generation_time_ms' => $avg_generation_time,
            'sample_metrics' => array_slice($llm_data, 0, 3)
        ];
    } else {
        $debug_info['llm_metrics_error'] = 'No se pudieron obtener métricas LLM';
        $debug_info['llm_metrics_found'] = 0;
    }

    // 📊 3. VERIFICAR POSTS GENERADOS POR IA
    $debug_info['queries_executed'][] = 'Verificando posts generados por IA';
    
    $ai_posts_url = $SUPABASE_URL . '/rest/v1/blog_posts?select=id,autor,fecha_publicacion&publicado=eq.true&autor=ilike.*IA*&order=fecha_publicacion.desc&limit=10';
    $ai_response = file_get_contents($ai_posts_url, false, $context);
    
    if ($ai_response !== FALSE) {
        $ai_posts = json_decode($ai_response, true);
        $debug_info['ai_posts_found'] = count($ai_posts);
        $debug_info['sample_ai_posts'] = array_slice($ai_posts, 0, 3);
    } else {
        $debug_info['ai_posts_error'] = 'Error obteniendo posts de IA';
    }

    // 📊 4. RESPUESTA FINAL CON ESTADÍSTICAS
    $final_stats = [
        'total_published' => $total_published,
        'total_views' => $total_views,
        'total_likes' => $total_likes,
        'avg_reading_time' => $avg_reading_time,
        'avg_generation_time' => $avg_generation_time
    ];

    // Respuesta exitosa con debug completo
    echo json_encode([
        'success' => true,
        'estadisticas' => $final_stats,
        'debug_info' => $debug_info,
        'timestamp' => date('Y-m-d H:i:s')
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    $debug_info['errors'][] = $e->getMessage();
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error interno del servidor',
        'message' => $e->getMessage(),
        'debug_info' => $debug_info
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
}
?>