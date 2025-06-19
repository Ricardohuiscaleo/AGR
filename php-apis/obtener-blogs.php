<?php
/**
 * API para obtener blogs generados por IA
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
    $limit = $_GET['limit'] ?? 20;
    
    $url = $SUPABASE_URL . '/rest/v1/blog_posts_con_categoria?select=*&publicado=eq.true&autor=like.%F0%9F%A4%96*&order=fecha_publicacion.desc&limit=' . $limit;
    
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
    $response = file_get_contents($url, false, $context);
    
    if ($response === FALSE) {
        throw new Exception('Error al obtener blogs de Supabase');
    }
    
    $blogs = json_decode($response, true);
    
    echo json_encode([
        'success' => true,
        'blogs' => $blogs,
        'total' => count($blogs)
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error al obtener blogs generados',
        'blogs' => []
    ]);
}
?>