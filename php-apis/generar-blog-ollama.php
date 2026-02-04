<?php
set_time_limit(180);
ini_set('display_errors', 0); error_reporting(E_ALL);
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(); }

$config_path = __DIR__ . '/../../config.php';
$config = @require $config_path;
if (!$config) {
    $config = [
        'PUBLIC_SUPABASE_URL' => getenv('PUBLIC_SUPABASE_URL'),
        'PUBLIC_SUPABASE_ANON_KEY' => getenv('PUBLIC_SUPABASE_ANON_KEY'),
        'unsplash_access_key' => getenv('UNSPLASH_ACCESS_KEY'),
        'ollama_url' => getenv('OLLAMA_URL') ?: 'http://agenterag-com_ollama:11434',
        'ollama_model' => getenv('OLLAMA_MODEL') ?: 'llama3.2:3b'
    ];
}

function generarEnfoqueDinamico($tema) {
    $enfoquesPorTema = [
        'etica-ia' => ['Enfócate en casos reales de problemas éticos en IA que han ocurrido en empresas como Amazon, Google, Microsoft.', 'Enfócate en las regulaciones actuales como el AI Act de la UE y GDPR.', 'Enfócate en cómo las empresas pueden implementar ética en IA de forma práctica.', 'Enfócate en las tendencias futuras de ética en IA.'],
        'llm' => ['Realiza una comparativa técnica profunda entre GPT-4, Claude-3, y Gemini-2.0.', 'Enfócate en cómo las empresas están implementando LLMs.', 'Enfócate en el aspecto técnico de desarrollo: fine-tuning, prompt engineering, y RAG.', 'Analiza cómo los LLMs están transformando el trabajo.'],
        'rag' => ['Enfócate en la arquitectura técnica de RAG: vector databases, embedding models, y chunking strategies.', 'Analiza implementaciones reales de RAG en empresas.', 'Compara RAG vs fine-tuning, y RAG vs traditional search.', 'Enfócate en mejores prácticas para la implementación de RAG.'],
        'ia-generativa' => ['Realiza una comparativa entre DALL-E 3, Midjourney y Stable Diffusion.', 'Enfócate en el uso de IA Generativa en Marketing.', 'Analiza el impacto de la generación de video con IA.', 'Discute los desafíos de copyright con el arte generado por IA.'],
        'machine-learning' => ['Enfócate en AutoML y la democratización del aprendizaje automático.', 'Compara las plataformas de ML en la nube.', 'Explica MLOps y por qué es crucial.', 'Detalla el concepto de Federated Learning.'],
        'computer-vision' => ['Enfócate en el uso de Computer Vision en medicina.', 'Analiza el papel de la visión por computadora en vehículos autónomos.', 'Explica qué son los Vision Transformers.', 'Detalla aplicaciones prácticas de OCR inteligente.'],
        'nlp' => ['Enfócate en el análisis de sentimientos.', 'Compara diferentes arquitecturas de chatbots.', 'Explica cómo funciona la traducción neural automática.', 'Detalla los últimos avances en Named Entity Recognition.'],
        'automatizacion-ia' => ['Compara RPA tradicional con la Hiperautomatización impulsada por IA.', 'Analiza casos de éxito de Process Mining.', 'Explica cómo construir workflows autónomos.', 'Detalla el impacto de la automatización en el sector financiero.']
    ];
    $enfoques = $enfoquesPorTema[$tema['id']] ?? ['Enfócate en los aspectos técnicos avanzados de ' . $tema['nombre']];
    return $enfoques[array_rand($enfoques)];
}

function generarBlogConOllama($tema, $ollamaUrl, $ollamaModel) {
    $enfoque = generarEnfoqueDinamico($tema);
    $semilla = rand(0, 1000);
    $prompt = "SEMILLA: $semilla. TEMA: {$tema['nombre']}. ENFOQUE: $enfoque.\n\nEscribe en español un artículo profesional de mínimo 1800 palabras sobre {$tema['nombre']}. Usa formato Markdown limpio. La respuesta DEBE ser un único objeto JSON válido con esta estructura: {\"titulo\":\"...\",\"resumen\":\"...\",\"contenido\":\"...\",\"tiempo_lectura\":5,\"tags\":[\"...\"],\"meta_titulo\":\"...\",\"meta_descripcion\":\"...\"}";
    
    $url = rtrim($ollamaUrl, '/') . '/api/generate';
    $data = ['model' => $ollamaModel, 'prompt' => $prompt, 'stream' => false, 'format' => 'json'];
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_TIMEOUT, 120);
    
    $response = curl_exec($ch);
    if (curl_errno($ch)) { throw new Exception('Error cURL Ollama: ' . curl_error($ch)); }
    curl_close($ch);
    
    $result = json_decode($response, true);
    if (!isset($result['response'])) { throw new Exception('Respuesta inválida de Ollama: ' . json_encode($result)); }
    
    $blogData = json_decode($result['response'], true);
    if (json_last_error() !== JSON_ERROR_NONE) { throw new Exception('Ollama no devolvió un JSON válido: ' . json_last_error_msg()); }
    
    return $blogData;
}

function generarImagenConUnsplash($keywords, $apiKey) {
    $searchTerm = !empty($keywords) ? $keywords[array_rand($keywords)] : 'technology abstract';
    $url = "https://api.unsplash.com/search/photos?query=" . urlencode($searchTerm) . "&per_page=10&orientation=landscape";
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Authorization: Client-ID ' . $apiKey]);
    $response = curl_exec($ch);
    if (curl_errno($ch)) { return null; }
    curl_close($ch);
    $data = json_decode($response, true);
    return !empty($data['results']) ? ($data['results'][array_rand($data['results'])]['urls']['regular'] ?? null) : null;
}

function guardarEnSupabase($blogData, $temaSeleccionado, $imagenUrl, $config) {
    $titulo_truncado = mb_substr($blogData['titulo'], 0, 200, 'UTF-8');
    $meta_titulo_truncado = mb_substr($blogData['meta_titulo'] ?? $titulo_truncado, 0, 60, 'UTF-8');
    $meta_descripcion_truncada = mb_substr($blogData['meta_descripcion'] ?? $blogData['resumen'], 0, 160, 'UTF-8');
    $autor_truncado = mb_substr("🤖 IA - {$temaSeleccionado['nombre']}", 0, 100, 'UTF-8');
    $resumen_truncado = mb_substr($blogData['resumen'], 0, 1000, 'UTF-8');
    $baseSlug = strtolower(preg_replace('/[^a-z0-9]+/', '-', $titulo_truncado));
    $slug = substr($baseSlug, 0, 40) . '-' . substr(bin2hex(random_bytes(4)), 0, 8);
    
    $postData = [
        'titulo' => $titulo_truncado,
        'slug' => $slug,
        'resumen' => $resumen_truncado,
        'contenido' => $blogData['contenido'],
        'tiempo_lectura' => $blogData['tiempo_lectura'] ?? 7,
        'tags' => $temaSeleccionado['keywords'],
        'publicado' => true,
        'destacado' => false,
        'meta_titulo' => $meta_titulo_truncado,
        'meta_descripcion' => $meta_descripcion_truncada,
        'autor' => $autor_truncado,
        'imagen_url' => $imagenUrl,
        'categoria_id' => 'cbc153ea-a127-40ea-bf34-69f35a153c5a'
    ];
    
    $url = $config['PUBLIC_SUPABASE_URL'] . '/rest/v1/blog_posts';
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($postData));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $config['PUBLIC_SUPABASE_ANON_KEY'],
        'apikey: ' . $config['PUBLIC_SUPABASE_ANON_KEY'],
        'Prefer: return=representation'
    ]);
    $response = curl_exec($ch);
    if (curl_errno($ch)) { throw new Exception('Error cURL Supabase: ' . curl_error($ch)); }
    curl_close($ch);
    
    $result = json_decode($response, true);
    if (!$result || !isset($result[0]['id'])) { throw new Exception('Error de Supabase al guardar: ' . ($result['message'] ?? 'Respuesta inesperada.')); }
    return $result[0];
}

function registrarMetricas($postId, $datos, $config) {
    $rpcUrl = $config['PUBLIC_SUPABASE_URL'] . '/rest/v1/rpc/registrar_metricas_llm';
    $ch = curl_init($rpcUrl);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($datos));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $config['PUBLIC_SUPABASE_ANON_KEY'],
        'apikey: ' . $config['PUBLIC_SUPABASE_ANON_KEY']
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_exec($ch);
    curl_close($ch);
}

try {
    $input = json_decode(file_get_contents('php://input'), true);
    $temaId = $input['temaId'] ?? null;
    if (!$temaId) { throw new Exception('Falta temaId en la petición.', 400); }

    $temas = [
        'llm' => ['nombre' => 'Large Language Models', 'keywords' => ['LLM', 'GPT', 'Transformers', 'NLP', 'ChatGPT', 'Claude', 'Gemini']],
        'rag' => ['nombre' => 'RAG', 'keywords' => ['RAG', 'Vector DB', 'Embeddings', 'Retrieval', 'Knowledge Base']],
        'ia-generativa' => ['nombre' => 'IA Generativa', 'keywords' => ['Generative AI', 'DALL-E', 'Midjourney', 'Stable Diffusion', 'Content Creation']],
        'machine-learning' => ['nombre' => 'Machine Learning', 'keywords' => ['ML', 'Deep Learning', 'Neural Networks', 'Supervised Learning', 'Unsupervised Learning']],
        'computer-vision' => ['nombre' => 'Computer Vision', 'keywords' => ['Computer Vision', 'Image Recognition', 'Object Detection', 'OCR', 'Medical Imaging']],
        'nlp' => ['nombre' => 'Procesamiento de Lenguaje Natural', 'keywords' => ['NLP', 'Natural Language Processing', 'Sentiment Analysis', 'Text Mining', 'Chatbots']],
        'automatizacion-ia' => ['nombre' => 'Automatización con IA', 'keywords' => ['RPA', 'Automation', 'Process Mining', 'Workflow', 'Business Intelligence']],
        'etica-ia' => ['nombre' => 'Ética en IA', 'keywords' => ['AI Ethics', 'Bias', 'Fairness', 'Transparency', 'Responsible AI']]
    ];
    
    if (!isset($temas[$temaId])) { throw new Exception('El temaId no es válido.', 400); }
    $temaSeleccionado = $temas[$temaId];
    $temaSeleccionado['id'] = $temaId;

    $tiempoInicio = microtime(true);
    $fechaInicio = date('c');

    $blogGenerado = generarBlogConOllama($temaSeleccionado, $config['ollama_url'], $config['ollama_model']);
    $imagenUrl = generarImagenConUnsplash($temaSeleccionado['keywords'], $config['unsplash_access_key']);
    $postCreado = guardarEnSupabase($blogGenerado, $temaSeleccionado, $imagenUrl, $config);

    $tiempoGeneracionMs = round((microtime(true) - $tiempoInicio) * 1000);
    
    registrarMetricas($postCreado['id'], [
        'p_post_id' => $postCreado['id'],
        'p_modelo_usado' => $config['ollama_model'],
        'p_proveedor' => 'Ollama',
        'p_tiempo_generacion_ms' => $tiempoGeneracionMs,
        'p_tiempo_inicio' => $fechaInicio,
        'p_tiempo_fin' => date('c'),
        'p_tema_seleccionado' => $temaSeleccionado['nombre']
    ], $config);

    echo json_encode(['success' => true, 'post' => $postCreado]);

} catch (Exception $e) {
    $errorCode = $e->getCode();
    http_response_code(is_int($errorCode) && $errorCode >= 400 && $errorCode < 600 ? $errorCode : 500);
    echo json_encode(['success' => false, 'error' => 'Error Ollama: ' . $e->getMessage()]);
}
?>
