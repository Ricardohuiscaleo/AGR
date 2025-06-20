<?php
/**
 * API para generar blogs usando Google Gemini AI
 * Para usar en Hostinguer con variables de entorno seguras
 */

// Configurar headers CORS y JSON
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Cambiar por tu dominio en producción
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Manejar preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Solo permitir POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
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
$GEMINI_API_KEY = 'AIzaSyCc1bdkzVLHXxxKOBndV3poK2KQikLJ6DI';
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
    $GEMINI_API_KEY = $_ENV['GOOGLE_GEMINI_API_KEY'] ?? $_ENV['GEMINI_API_KEY'] ?? $GEMINI_API_KEY;
    $SUPABASE_URL = $_ENV['PUBLIC_SUPABASE_URL'] ?? $SUPABASE_URL;
    $SUPABASE_ANON_KEY = $_ENV['PUBLIC_SUPABASE_ANON_KEY'] ?? $SUPABASE_ANON_KEY;
}

// Obtener variables de entorno
$GEMINI_API_KEY = $_ENV['GOOGLE_GEMINI_API_KEY'] ?? $_ENV['GEMINI_API_KEY'];
$SUPABASE_URL = $_ENV['PUBLIC_SUPABASE_URL'];
$SUPABASE_ANON_KEY = $_ENV['PUBLIC_SUPABASE_ANON_KEY'];

try {
    // Obtener datos del request
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['temaId'])) {
        throw new Exception('Tema ID es requerido');
    }
    
    $temaId = $input['temaId'];
    
    // Temas disponibles (mismos que en tu GeminiService)
    $temas = [
        'ia-marketing' => [
            'nombre' => 'IA en Marketing Digital',
            'prompt' => 'Escribe un artículo sobre cómo la inteligencia artificial está revolucionando el marketing digital...'
        ],
        'automatizacion' => [
            'nombre' => 'Automatización de Procesos',
            'prompt' => 'Explica cómo la automatización puede mejorar la eficiencia empresarial...'
        ],
        'desarrollo-web' => [
            'nombre' => 'Desarrollo Web Moderno',
            'prompt' => 'Habla sobre las últimas tendencias en desarrollo web...'
        ]
    ];
    
    if (!isset($temas[$temaId])) {
        throw new Exception('Tema no encontrado');
    }
    
    $tema = $temas[$temaId];
    
    // Generar blog con Gemini AI
    $blogGenerado = generarBlogConGemini($tema, $GEMINI_API_KEY);
    
    // Guardar en Supabase
    $postCreado = guardarEnSupabase($blogGenerado, $tema, $SUPABASE_URL, $SUPABASE_ANON_KEY);
    
    // Respuesta exitosa
    echo json_encode([
        'success' => true,
        'post' => $postCreado,
        'tema' => $tema['nombre'],
        'mensaje' => "¡Blog sobre '{$tema['nombre']}' generado exitosamente!"
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Error interno del servidor',
        'details' => $e->getMessage()
    ]);
}

function generarBlogConGemini($tema, $apiKey) {
    $url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' . $apiKey;
    
    $prompt = "Genera un blog completo sobre: {$tema['nombre']}
    
{$tema['prompt']}

Responde SOLO con un JSON válido con esta estructura exacta:
{
    \"titulo\": \"Título del blog (máximo 60 caracteres)\",
    \"resumen\": \"Resumen breve del contenido (máximo 200 caracteres)\",
    \"contenido\": \"Contenido completo del blog en HTML con <h2>, <p>, <ul>, etc.\",
    \"tiempo_lectura\": 5,
    \"tags\": [\"tag1\", \"tag2\", \"tag3\"],
    \"meta_titulo\": \"Meta título para SEO\",
    \"meta_descripcion\": \"Meta descripción para SEO\",
    \"imagen_url\": \"https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800\"
}";

    $data = [
        'contents' => [
            [
                'parts' => [
                    ['text' => $prompt]
                ]
            ]
        ],
        'generationConfig' => [
            'temperature' => 0.7,
            'topK' => 40,
            'topP' => 0.95,
            'maxOutputTokens' => 2048
        ]
    ];
    
    $options = [
        'http' => [
            'header' => "Content-type: application/json\r\n",
            'method' => 'POST',
            'content' => json_encode($data)
        ]
    ];
    
    $context = stream_context_create($options);
    $response = file_get_contents($url, false, $context);
    
    if ($response === FALSE) {
        throw new Exception('Error al comunicarse con Gemini AI');
    }
    
    $result = json_decode($response, true);
    
    if (!isset($result['candidates'][0]['content']['parts'][0]['text'])) {
        throw new Exception('Respuesta inválida de Gemini AI');
    }
    
    $blogText = $result['candidates'][0]['content']['parts'][0]['text'];
    
    // Limpiar y parsear JSON
    $blogText = trim($blogText);
    $blogText = preg_replace('/^```json\s*/', '', $blogText);
    $blogText = preg_replace('/\s*```$/', '', $blogText);
    
    $blogData = json_decode($blogText, true);
    
    if (!$blogData) {
        throw new Exception('No se pudo parsear la respuesta de Gemini AI');
    }
    
    return $blogData;
}

function guardarEnSupabase($blogData, $tema, $supabaseUrl, $supabaseKey) {
    // Generar slug único
    $baseSlug = strtolower(preg_replace('/[^a-zA-Z0-9]/', '-', $blogData['titulo']));
    $timestamp = substr(time(), -6);
    $slug = substr($baseSlug . '-' . $timestamp, 0, 60);
    
    $postData = [
        'titulo' => substr($blogData['titulo'], 0, 60),
        'slug' => $slug,
        'resumen' => substr($blogData['resumen'], 0, 200),
        'contenido' => $blogData['contenido'],
        'tiempo_lectura' => $blogData['tiempo_lectura'] ?? 5,
        'tags' => $blogData['tags'] ?? [],
        'publicado' => true,
        'destacado' => false,
        'meta_titulo' => substr($blogData['meta_titulo'] ?? $blogData['titulo'], 0, 60),
        'meta_descripcion' => substr($blogData['meta_descripcion'] ?? $blogData['resumen'], 0, 160),
        'autor' => "🤖 IA - {$tema['nombre']}",
        'imagen_url' => $blogData['imagen_url'] ?? null,
        'categoria_id' => 1 // Asumiendo categoría IA por defecto
    ];
    
    $url = $supabaseUrl . '/rest/v1/blog_posts';
    
    $options = [
        'http' => [
            'header' => [
                "Content-Type: application/json",
                "Authorization: Bearer $supabaseKey",
                "apikey: $supabaseKey",
                "Prefer: return=representation"
            ],
            'method' => 'POST',
            'content' => json_encode($postData)
        ]
    ];
    
    $context = stream_context_create($options);
    $response = file_get_contents($url, false, $context);
    
    if ($response === FALSE) {
        throw new Exception('Error al guardar en Supabase');
    }
    
    $result = json_decode($response, true);
    
    if (!$result || (isset($result['error']) && $result['error'])) {
        throw new Exception('Error de Supabase: ' . ($result['message'] ?? 'Error desconocido'));
    }
    
    return $result[0] ?? $result;
}
?>