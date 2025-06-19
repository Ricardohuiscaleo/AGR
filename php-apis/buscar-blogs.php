<?php
/**
 * API para buscar blogs por tema/keywords
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit();
}

$SUPABASE_URL = 'https://uznvakpuuxnpdhoejrog.supabase.co';
$SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6bnZha3B1dXhucGRob2Vqcm9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwODg0MTAsImV4cCI6MjA2NDY2NDQxMH0.OxbLYkjlgpWFnqd28gaZSwar_NQ6_qUS3U76bqbcXVg';

try {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['keywords']) || !is_array($input['keywords'])) {
        throw new Exception('Keywords son requeridas y deben ser un array');
    }
    
    $keywords = $input['keywords'];
    $blogsEncontrados = [];
    
    // Buscar por cada keyword
    foreach ($keywords as $keyword) {
        $keywordEncoded = urlencode($keyword);
        $url = $SUPABASE_URL . "/rest/v1/blog_posts_con_categoria?select=*&publicado=eq.true&or=(tags.cs.%7B%22$keywordEncoded%22%7D,titulo.ilike.*$keywordEncoded*,contenido.ilike.*$keywordEncoded*)&order=fecha_publicacion.desc&limit=10";
        
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
        
        if ($response !== FALSE) {
            $blogs = json_decode($response, true);
            $blogsEncontrados = array_merge($blogsEncontrados, $blogs);
        }
    }
    
    // Eliminar duplicados por ID
    $blogsUnicos = [];
    $idsVistos = [];
    
    foreach ($blogsEncontrados as $blog) {
        if (!in_array($blog['id'], $idsVistos)) {
            $blogsUnicos[] = $blog;
            $idsVistos[] = $blog['id'];
        }
    }
    
    // Ordenar por fecha
    usort($blogsUnicos, function($a, $b) {
        return strtotime($b['fecha_publicacion']) - strtotime($a['fecha_publicacion']);
    });
    
    echo json_encode([
        'success' => true,
        'blogs' => $blogsUnicos,
        'total' => count($blogsUnicos),
        'keywords_buscadas' => $keywords
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error al buscar blogs por tema',
        'blogs' => []
    ]);
}
?>