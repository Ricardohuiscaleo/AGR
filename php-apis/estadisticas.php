<?php
/**
 * API para obtener estadísticas del blog
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

$SUPABASE_URL = 'https://uznvakpuuxnpdhoejrog.supabase.co';
$SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6bnZha3B1dXhucGRob2Vqcm9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwODg0MTAsImV4cCI6MjA2NDY2NDQxMH0.OxbLYkjlgpWFnqd28gaZSwar_NQ6_qUS3U76bqbcXVg';

try {
    // Obtener total de posts
    $urlTotal = $SUPABASE_URL . '/rest/v1/blog_posts?select=id';
    $urlPublished = $SUPABASE_URL . '/rest/v1/blog_posts?select=id&publicado=eq.true';
    $urlViews = $SUPABASE_URL . '/rest/v1/blog_posts?select=vistas';
    $urlLikes = $SUPABASE_URL . '/rest/v1/blog_posts?select=likes';
    $urlReadingTime = $SUPABASE_URL . '/rest/v1/blog_posts?select=tiempo_lectura';
    
    $options = [
        'http' => [
            'header' => [
                "Authorization: Bearer $SUPABASE_ANON_KEY",
                "apikey: $SUPABASE_ANON_KEY"
            ],
            'method' => 'GET'
        ]
    ];
    
    $context = stream_context_create($options);
    
    // Obtener estadísticas
    $totalPosts = json_decode(file_get_contents($urlTotal, false, $context), true);
    $publishedPosts = json_decode(file_get_contents($urlPublished, false, $context), true);
    $viewsData = json_decode(file_get_contents($urlViews, false, $context), true);
    $likesData = json_decode(file_get_contents($urlLikes, false, $context), true);
    $readingTimeData = json_decode(file_get_contents($urlReadingTime, false, $context), true);
    
    // Calcular estadísticas
    $totalViews = 0;
    if ($viewsData) {
        foreach ($viewsData as $post) {
            $totalViews += $post['vistas'] ?? 0;
        }
    }
    
    $totalLikes = 0;
    if ($likesData) {
        foreach ($likesData as $post) {
            $totalLikes += $post['likes'] ?? 0;
        }
    }
    
    $avgReadingTime = 0;
    if ($readingTimeData && count($readingTimeData) > 0) {
        $totalReadingTime = 0;
        foreach ($readingTimeData as $post) {
            $totalReadingTime += $post['tiempo_lectura'] ?? 0;
        }
        $avgReadingTime = round($totalReadingTime / count($readingTimeData), 1);
    }
    
    $estadisticas = [
        'total_posts' => count($totalPosts ?? []),
        'total_published' => count($publishedPosts ?? []),
        'total_views' => $totalViews,
        'total_likes' => $totalLikes,
        'avg_reading_time' => $avgReadingTime
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
            'total_posts' => 0,
            'total_published' => 0,
            'total_views' => 0,
            'total_likes' => 0,
            'avg_reading_time' => 0
        ]
    ]);
}
?>