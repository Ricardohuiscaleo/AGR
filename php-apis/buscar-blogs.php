<?php
/**
 * API para buscar blogs por tema. [Versión 5.2 - CORREGIDO, nombres de clave correctos]
 * Usa la ruta de config absoluta y los nombres de clave correctos.
 */

// --- Carga de Configuración Segura (LÓGICA CLONADA DEL TEST EXITOSO) ---
$config_path = __DIR__ . '/../../config.php'; 

if (!file_exists($config_path) || !is_readable($config_path)) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'error' => 'Error Crítico: No se pudo cargar config.php desde la ruta verificada.']);
    exit;
}

$config = require $config_path;

if (empty($config['PUBLIC_SUPABASE_URL']) || empty($config['PUBLIC_SUPABASE_ANON_KEY'])) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'error' => 'Error Crítico: Faltan claves de Supabase en el config.php cargado.']);
    exit;
}

// --- Script Principal ---
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); 

try {
    $temas_predefinidos = [
        'llm' => ['nombre' => 'Large Language Models', 'keywords' => ['LLM', 'GPT', 'Transformers', 'NLP', 'ChatGPT', 'Claude', 'Gemini']],
        'rag' => ['nombre' => 'RAG (Retrieval Augmented Generation)', 'keywords' => ['RAG', 'Vector DB', 'Embeddings', 'Retrieval', 'Knowledge Base']],
        'ia-generativa' => ['nombre' => 'IA Generativa', 'keywords' => ['Generative AI', 'DALL-E', 'Midjourney', 'Stable Diffusion', 'Content Creation']],
        'machine-learning' => ['nombre' => 'Machine Learning', 'keywords' => ['ML', 'Deep Learning', 'Neural Networks', 'Supervised Learning', 'Unsupervised Learning']],
        'computer-vision' => ['nombre' => 'Computer Vision', 'keywords' => ['Computer Vision', 'Image Recognition', 'Object Detection', 'OCR', 'Medical Imaging']],
        'nlp' => ['nombre' => 'Procesamiento de Lenguaje Natural', 'keywords' => ['NLP', 'Natural Language Processing', 'Sentiment Analysis', 'Text Mining', 'Chatbots']],
        'automatizacion-ia' => ['nombre' => 'Automatización con IA', 'keywords' => ['RPA', 'Automation', 'Process Mining', 'Workflow', 'Business Intelligence']],
        'etica-ia' => ['nombre' => 'Ética en IA', 'keywords' => ['AI Ethics', 'Bias', 'Fairness', 'Transparency', 'Responsible AI']],
    ];
    
    if (empty($_GET['tema'])) { throw new Exception('Parámetro "tema" no proporcionado.', 400); }
    
    $tema_id = strtolower(trim(urldecode($_GET['tema'])));

    if (!isset($temas_predefinidos[$tema_id])) {
        echo json_encode(['success' => true, 'blogs' => [], 'message' => 'Tema no encontrado.']);
        exit;
    }
    
    $finalKeywords = $temas_predefinidos[$tema_id]['keywords'];
    $tagsQuery = '{' . implode(',', $finalKeywords) . '}';
    
    // ====> ¡Y AQUÍ! <====
    $apiUrl = $config['PUBLIC_SUPABASE_URL'] 
            . '/rest/v1/blog_posts?select=*'
            . '&publicado=eq.true'
            . '&tags=ov.' . urlencode($tagsQuery)
            . '&order=fecha_publicacion.desc'
            . '&limit=20';

    $ch = curl_init($apiUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        // ====> ¡Y AQUÍ! <====
        'apikey: ' . $config['PUBLIC_SUPABASE_ANON_KEY'],
        'Authorization: Bearer ' . $config['PUBLIC_SUPABASE_ANON_KEY']
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);

    $response = curl_exec($ch);
    $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpcode >= 200 && $httpcode < 300) {
        $blogs = json_decode($response, true);
        echo json_encode(['success' => true, 'blogs' => $blogs ?? []]);
    } else {
        throw new Exception('Error de la API de Supabase (' . $httpcode . ')');
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'CONFESIÓN: ' . $e->getMessage()]);
}
?>