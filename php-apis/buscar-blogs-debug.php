<?php
/**
 * DEBUG para buscar-blogs.php
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

try {
    $debug_info = [
        'paso' => 1,
        'mensaje' => 'DEBUG buscar-blogs iniciado',
        'timestamp' => date('Y-m-d H:i:s'),
        'dir' => __DIR__,
        'request_method' => $_SERVER['REQUEST_METHOD']
    ];

    // PASO 2: Verificar parámetros
    $debug_info['paso'] = 2;
    $debug_info['get_params'] = $_GET;
    $debug_info['tema_recibido'] = $_GET['tema'] ?? 'NO_TEMA';

    if (empty($_GET['tema'])) {
        $debug_info['error'] = 'Parámetro tema vacío o no existe';
        throw new Exception('Parámetro tema requerido');
    }

    // PASO 3: Verificar ubicaciones del .env
    $env_paths = [
        __DIR__ . '/../../.env',
        __DIR__ . '/../.env',
        $_SERVER['DOCUMENT_ROOT'] . '/../.env'
    ];
    
    $debug_info['paso'] = 3;
    $debug_info['env_paths_probadas'] = [];
    
    foreach ($env_paths as $index => $path) {
        $exists = file_exists($path);
        $debug_info['env_paths_probadas'][] = [
            'path' => $path,
            'existe' => $exists,
            'readable' => $exists ? is_readable($path) : false
        ];
    }

    // PASO 4: Variables de Supabase (hardcodeadas para debug)
    $SUPABASE_URL = 'https://uznvakpuuxnpdhoejrog.supabase.co';
    $SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6bnZha3B1dHhucGRob2Vqcm9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwODg0MTAsImV4cCI6MjA2NDY2NDQxMH0.OxbLYkjlgpWFnqd28gaZSwar_NQ6_qUS3U76bqbcXVg';
    
    $debug_info['paso'] = 4;
    $debug_info['supabase_url'] = $SUPABASE_URL;

    // PASO 5: Preparar búsqueda simplificada
    $tema = $_GET['tema'];
    $tema_sanitizado = preg_replace('/[^a-zA-Z0-9\s\-_áéíóúñüÁÉÍÓÚÑÜ]/', '', $tema);
    
    // Usar tabla simple en lugar de vista compleja
    $url = $SUPABASE_URL . '/rest/v1/blog_posts?select=*&publicado=eq.true&titulo.ilike.*' . urlencode($tema_sanitizado) . '*&order=fecha_publicacion.desc&limit=10';
    
    $debug_info['paso'] = 5;
    $debug_info['tema_original'] = $tema;
    $debug_info['tema_sanitizado'] = $tema_sanitizado;
    $debug_info['supabase_request_url'] = $url;

    // PASO 6: Hacer request a Supabase
    $options = [
        'http' => [
            'header' => [
                "Authorization: Bearer $SUPABASE_ANON_KEY",
                "apikey: $SUPABASE_ANON_KEY"
            ],
            'method' => 'GET',
            'timeout' => 10
        ]
    ];
    
    $context = stream_context_create($options);
    $debug_info['paso'] = 6;
    
    $response = file_get_contents($url, false, $context);
    
    if ($response === FALSE) {
        $debug_info['error'] = 'Error al obtener datos de Supabase';
        $debug_info['http_response_header'] = $http_response_header ?? 'No disponible';
        throw new Exception('Error de conexión a Supabase');
    }
    
    $debug_info['paso'] = 7;
    $debug_info['response_length'] = strlen($response);
    
    $resultados = json_decode($response, true);
    
    if ($resultados === null) {
        $debug_info['error'] = 'Error al decodificar JSON de Supabase';
        $debug_info['raw_response'] = substr($response, 0, 500);
        throw new Exception('Error en formato de respuesta de Supabase');
    }
    
    $debug_info['paso'] = 8;
    $debug_info['resultados_count'] = count($resultados);

    // RESPUESTA EXITOSA
    echo json_encode([
        'success' => true,
        'resultados' => $resultados,
        'total' => count($resultados),
        'tema_buscado' => $tema,
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