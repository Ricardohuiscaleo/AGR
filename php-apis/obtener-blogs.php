<?php
/**
 * API para obtener blogs generados por IA - VERSIÓN CORREGIDA
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

// 🔐 FUNCIÓN CORREGIDA para cargar variables de entorno desde ubicación SEGURA
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
            continue; // Ignorar líneas vacías y comentarios
        }
        
        if (strpos($line, '=') === false) {
            continue; // Ignorar líneas sin '='
        }
        
        $parts = explode('=', $line, 2);
        if (count($parts) !== 2) {
            continue;
        }
        
        $name = trim($parts[0]);
        $value = trim($parts[1]);
        
        // Remover comillas si existen
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
    __DIR__ . '/../../.env',           // Dos niveles arriba (ubicación segura)
    __DIR__ . '/../.env',              // Un nivel arriba (fallback)
    $_SERVER['DOCUMENT_ROOT'] . '/../.env'  // Alternativa usando DOCUMENT_ROOT
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
    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 20;
    $limit = max(1, min(100, $limit)); // Limitar entre 1 y 100
    
    // Usar tabla simple en lugar de vista compleja
    $url = $SUPABASE_URL . '/rest/v1/blog_posts?select=*&publicado=eq.true&order=fecha_publicacion.desc&limit=' . $limit;
    
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
    
    if ($response === FALSE) {
        throw new Exception('Error al conectar con Supabase');
    }
    
    $blogs = json_decode($response, true);
    
    if ($blogs === null) {
        throw new Exception('Error al procesar respuesta de Supabase');
    }
    
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