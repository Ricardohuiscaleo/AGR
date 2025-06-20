<?php
/**
 * API DEBUG para obtener blogs generados por IA
 * Versión simplificada para diagnosticar errores 500
 */

// Habilitar reporte de errores para debug
error_reporting(E_ALL);
ini_set('display_errors', 1);

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

try {
    // 🔧 PASO 1: Verificar que llegamos hasta aquí
    $debug_info = [
        'paso' => 1,
        'mensaje' => 'API iniciada correctamente',
        'timestamp' => date('Y-m-d H:i:s'),
        'dir' => __DIR__
    ];

    // 🔒 PASO 2: Verificar ubicaciones SEGURAS del archivo .env
    $env_paths = [
        __DIR__ . '/../../.env',                    // Dos niveles arriba (SEGURO)
        __DIR__ . '/../.env',                       // Un nivel arriba (fallback)
        $_SERVER['DOCUMENT_ROOT'] . '/../.env',     // Usando DOCUMENT_ROOT
        __DIR__ . '/.env'                           // INSEGURO - solo para debug
    ];
    
    $debug_info['paso'] = 2;
    $debug_info['env_paths_probadas'] = [];
    
    foreach ($env_paths as $index => $path) {
        $exists = file_exists($path);
        $debug_info['env_paths_probadas'][] = [
            'path' => $path,
            'existe' => $exists,
            'segura' => ($index < 3) // Los primeros 3 son seguros
        ];
    }
    
    // Determinar qué archivo .env usar
    $env_file_to_use = current(array_filter($env_paths, 'file_exists'));
    $debug_info['env_file_usado'] = $env_file_to_use;

    // 🔧 PASO 3: Usar variables hardcodeadas como fallback
    $SUPABASE_URL = 'https://uznvakpuuxnpdhoejrog.supabase.co';
    $SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6bnZha3B1dHhucGRob2Vqcm9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwODg0MTAsImV4cCI6MjA2NDY2NDQxMH0.OxbLYkjlgpWFnqd28gaZSwar_NQ6_qUS3U76bqbcXVg';
    
    $debug_info['paso'] = 3;
    $debug_info['supabase_url'] = $SUPABASE_URL;

    // 🔧 PASO 4: Preparar URL de Supabase
    $limit = $_GET['limit'] ?? 20;
    $url = $SUPABASE_URL . '/rest/v1/blog_posts?select=*&publicado=eq.true&order=fecha_publicacion.desc&limit=' . $limit;
    
    $debug_info['paso'] = 4;
    $debug_info['supabase_request_url'] = $url;

    // 🔧 PASO 5: Hacer request a Supabase
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
    $debug_info['paso'] = 5;
    
    $response = file_get_contents($url, false, $context);
    
    if ($response === FALSE) {
        $debug_info['error'] = 'Error al obtener datos de Supabase';
        $debug_info['http_response_header'] = $http_response_header ?? 'No disponible';
        throw new Exception('Error de conexión a Supabase');
    }
    
    $debug_info['paso'] = 6;
    $debug_info['response_length'] = strlen($response);
    
    $blogs = json_decode($response, true);
    
    if ($blogs === null) {
        $debug_info['error'] = 'Error al decodificar JSON de Supabase';
        $debug_info['raw_response'] = substr($response, 0, 500); // Primeros 500 caracteres
        throw new Exception('Error en formato de respuesta de Supabase');
    }
    
    $debug_info['paso'] = 7;
    $debug_info['blogs_count'] = count($blogs);

    // 🎉 RESPUESTA EXITOSA
    echo json_encode([
        'success' => true,
        'blogs' => $blogs,
        'total' => count($blogs),
        'debug' => $debug_info
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'debug' => $debug_info ?? ['error' => 'Error antes de inicializar debug'],
        'line' => $e->getLine(),
        'file' => $e->getFile()
    ]);
}
?>