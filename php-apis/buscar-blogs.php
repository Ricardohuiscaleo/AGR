<?php
/**
 * API para buscar blogs por tema - VERSIÓN CORREGIDA para frontend
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

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
    $keywords = [];
    
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Manejar POST con JSON (como envía el frontend)
        $input = json_decode(file_get_contents('php://input'), true);
        if ($input && isset($input['keywords']) && is_array($input['keywords'])) {
            $keywords = $input['keywords'];
        }
    } else {
        // Manejar GET con parámetro tema (compatibilidad)
        $tema = $_GET['tema'] ?? '';
        if (!empty($tema)) {
            $keywords = [$tema];
        }
    }
    
    if (empty($keywords)) {
        throw new Exception('Keywords son requeridas');
    }
    
    $resultados = [];
    
    // Buscar por cada keyword
    foreach ($keywords as $keyword) {
        $keyword_sanitizado = preg_replace('/[^a-zA-Z0-9\s\-_áéíóúñüÁÉÍÓÚÑÜ]/', '', $keyword);
        
        // Buscar en tabla simple
        $url = $SUPABASE_URL . '/rest/v1/blog_posts?select=*&publicado=eq.true&titulo.ilike.*' . urlencode($keyword_sanitizado) . '*&order=fecha_publicacion.desc&limit=10';
        
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
        $response = file_get_contents($url, false, $context);
        
        if ($response !== FALSE) {
            $blogs = json_decode($response, true);
            if ($blogs && is_array($blogs)) {
                $resultados = array_merge($resultados, $blogs);
            }
        }
    }
    
    // Eliminar duplicados por ID
    $blogsUnicos = [];
    $idsVisto = [];
    
    foreach ($resultados as $blog) {
        if (!in_array($blog['id'], $idsVisto)) {
            $idsVisto[] = $blog['id'];
            $blogsUnicos[] = $blog;
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
        'error' => 'Error al buscar blogs',
        'blogs' => []
    ]);
}
?>