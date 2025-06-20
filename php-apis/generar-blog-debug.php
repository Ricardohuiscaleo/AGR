<?php
/**
 * DEBUG para generar-blog.php
 * Versión simplificada para diagnosticar errores 500
 */

// Habilitar reporte de errores para debug
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit();
}

try {
    $debug_info = [
        'paso' => 1,
        'mensaje' => 'DEBUG generar-blog iniciado',
        'timestamp' => date('Y-m-d H:i:s'),
        'dir' => __DIR__,
        'request_method' => $_SERVER['REQUEST_METHOD']
    ];

    // PASO 2: Verificar método
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        $debug_info['error'] = 'Método incorrecto: ' . $_SERVER['REQUEST_METHOD'];
        throw new Exception('Solo se permite método POST');
    }

    // PASO 3: Obtener datos del request
    $debug_info['paso'] = 3;
    $input_raw = file_get_contents('php://input');
    $debug_info['input_raw'] = $input_raw;
    $debug_info['input_length'] = strlen($input_raw);

    $input = json_decode($input_raw, true);
    $debug_info['input_decoded'] = $input;
    $debug_info['json_last_error'] = json_last_error();

    if (!$input || !isset($input['temaId'])) {
        $debug_info['error'] = 'Input inválido o temaId faltante';
        throw new Exception('Tema ID requerido');
    }

    $debug_info['tema_id'] = $input['temaId'];

    // PASO 4: Verificar ubicaciones del .env
    $env_paths = [
        __DIR__ . '/../../.env',
        __DIR__ . '/../.env',
        $_SERVER['DOCUMENT_ROOT'] . '/../.env'
    ];
    
    $debug_info['paso'] = 4;
    $debug_info['env_paths_probadas'] = [];
    
    foreach ($env_paths as $index => $path) {
        $exists = file_exists($path);
        $debug_info['env_paths_probadas'][] = [
            'path' => $path,
            'existe' => $exists,
            'readable' => $exists ? is_readable($path) : false
        ];
    }

    // PASO 5: Variables hardcodeadas para debug
    $GEMINI_API_KEY = 'AIzaSyCc1bdkzVLHXxxKOBndV3poK2KQikLJ6DI';
    $SUPABASE_URL = 'https://uznvakpuuxnpdhoejrog.supabase.co';
    $SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6bnZha3B1dXhucGRob2Vqcm9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwODg0MTAsImV4cCI6MjA2NDY2NDQxMH0.OxbLYkjlgpWFnqd28gaZSwar_NQ6_qUS3U76bqbcXVg';
    
    $debug_info['paso'] = 5;
    $debug_info['has_gemini_key'] = !empty($GEMINI_API_KEY);
    $debug_info['has_supabase_url'] = !empty($SUPABASE_URL);

    // PASO 6: Verificar tema
    $temas = [
        'llm' => ['nombre' => 'Large Language Models', 'prompt' => 'Escribe sobre LLM...'],
        'rag' => ['nombre' => 'RAG', 'prompt' => 'Escribe sobre RAG...'],
        'ia-generativa' => ['nombre' => 'IA Generativa', 'prompt' => 'Escribe sobre IA Generativa...']
    ];
    
    $temaId = $input['temaId'];
    $debug_info['paso'] = 6;
    $debug_info['tema_existe'] = isset($temas[$temaId]);
    
    if (!isset($temas[$temaId])) {
        $debug_info['error'] = 'Tema no encontrado: ' . $temaId;
        $debug_info['temas_disponibles'] = array_keys($temas);
        throw new Exception('Tema no encontrado');
    }

    $tema = $temas[$temaId];
    $debug_info['tema_seleccionado'] = $tema['nombre'];

    // PASO 7: Test simple de Gemini (sin generar blog completo)
    $debug_info['paso'] = 7;
    $gemini_url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' . $GEMINI_API_KEY;
    
    $simple_prompt = "Responde solo con: {\"titulo\":\"Test\",\"resumen\":\"Test exitoso\"}";
    
    $gemini_data = [
        'contents' => [
            ['parts' => [['text' => $simple_prompt]]]
        ],
        'generationConfig' => [
            'temperature' => 0.1,
            'maxOutputTokens' => 100
        ]
    ];
    
    $gemini_options = [
        'http' => [
            'header' => "Content-type: application/json\r\n",
            'method' => 'POST',
            'content' => json_encode($gemini_data),
            'timeout' => 10
        ]
    ];
    
    $context = stream_context_create($gemini_options);
    $gemini_response = file_get_contents($gemini_url, false, $context);
    
    $debug_info['gemini_test_success'] = ($gemini_response !== FALSE);
    $debug_info['gemini_response_length'] = $gemini_response ? strlen($gemini_response) : 0;

    // RESPUESTA EXITOSA
    echo json_encode([
        'success' => true,
        'mensaje' => 'DEBUG completado exitosamente',
        'tema' => $tema['nombre'],
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