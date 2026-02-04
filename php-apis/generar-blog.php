<?php
/**
 * API para generar blogs. Versión 15.0 - "La Portable".
 *
 * Utiliza la ruta relativa verificada para config.php, haciéndolo
 * inmune a cambios de dominio o de servidor.
 */

// 1. Damos tiempo suficiente para que las APIs externas trabajen.
set_time_limit(180);

// --- CONFIGURACIÓN INICIAL Y DE ERRORES ---
ini_set('display_errors', 0); error_reporting(E_ALL);
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(); }

// ====> ¡LA ÚNICA CORRECCIÓN NECESARIA! <====
// --- CARGA DE CONFIGURACIÓN SEGURA Y PORTABLE ---
$config_path = __DIR__ . '/../../config.php'; 

$config = @require $config_path;
if (!$config) { http_response_code(500); echo json_encode(['success' => false, 'error' => 'Error Crítico v15: No se pudo cargar config.php.']); exit; }
$required_keys = ['PUBLIC_SUPABASE_URL', 'PUBLIC_SUPABASE_ANON_KEY', 'gemini_api_key', 'unsplash_access_key'];
foreach ($required_keys as $key) {
    if (empty($config[$key])) { http_response_code(500); echo json_encode(['success' => false, 'error' => "Error Crítico v15: La clave '$key' no se encontró."]); exit; }
}

// ==========================================================
// SECCIÓN DE FUNCIONES AUXILIARES COMPLETAS
// ==========================================================

function generarEnfoqueDinamico($tema) {
    $enfoquesPorTema = [
        'etica-ia' => ['Enfócate en casos reales de problemas éticos en IA que han ocurrido en empresas como Amazon, Google, Microsoft.', 'Enfócate en las regulaciones actuales como el AI Act de la UE y GDPR.', 'Enfócate en cómo las empresas pueden implementar ética en IA de forma práctica, con frameworks y procesos de auditoría.', 'Enfócate en las tendencias futuras de ética en IA: IA explicable, auditorías automáticas y certificaciones.'],
        'llm' => ['Realiza una comparativa técnica profunda entre GPT-4, Claude-3, y Gemini-2.0.', 'Enfócate en cómo las empresas están implementando LLMs, con casos de uso reales y ROI.', 'Enfócate en el aspecto técnico de desarrollo: fine-tuning, prompt engineering, y RAG.', 'Analiza cómo los LLMs están transformando el trabajo, creando nuevos roles y automatizando tareas.'],
        'rag' => ['Enfócate en la arquitectura técnica de RAG: vector databases, embedding models, y chunking strategies.', 'Analiza implementaciones reales de RAG en empresas para chatbots y knowledge management.', 'Compara RAG vs fine-tuning, y RAG vs traditional search.', 'Enfócate en mejores prácticas para la implementación de RAG: preparación de datos y evaluación.'],
        'ia-generativa' => ['Realiza una comparativa entre DALL-E 3, Midjourney y Stable Diffusion.', 'Enfócate en el uso de IA Generativa en Marketing y Publicidad.', 'Analiza el impacto de la generación de video con IA (Sora) en la industria del cine.', 'Discute los desafíos de copyright y propiedad intelectual con el arte generado por IA.'],
        'machine-learning' => ['Enfócate en AutoML y la democratización del aprendizaje automático.', 'Compara las plataformas de ML en la nube: AWS, Azure y Google Cloud.', 'Explica MLOps y por qué es crucial para llevar modelos a producción.', 'Detalla el concepto de Federated Learning y su importancia para la privacidad.'],
        'computer-vision' => ['Enfócate en el uso de Computer Vision en medicina para diagnósticos avanzados.', 'Analiza el papel de la visión por computadora en los vehículos autónomos.', 'Explica qué son los Vision Transformers (ViT) y por qué están revolucionando el campo.', 'Detalla aplicaciones prácticas de OCR inteligente en la automatización de documentos.'],
        'nlp' => ['Enfócate en el análisis de sentimientos para entender la voz del cliente.', 'Compara diferentes arquitecturas de chatbots conversacionales.', 'Explica cómo funciona la traducción neural automática y sus limitaciones.', 'Detalla los últimos avances en Named Entity Recognition (NER).'],
        'automatizacion-ia' => ['Compara RPA tradicional con la Hiperautomatización impulsada por IA.', 'Analiza casos de éxito de Process Mining para descubrir ineficiencias en empresas.', 'Explica cómo construir workflows autónomos que se optimizan solos.', 'Detalla el impacto de la automatización en el sector financiero y de seguros.']
    ];
    $enfoques = $enfoquesPorTema[$tema['id']] ?? ['Enfócate en los aspectos técnicos avanzados y casos de uso de ' . $tema['nombre']];
    return $enfoques[array_rand($enfoques)];
}

function generarEstructuraDinamica() {
    $estructuras = [ "Estructura Clásica: Introducción, Fundamentos, Aplicaciones, Desafíos, Futuro, Conclusión.", "Estructura Problema-Solución: El Problema, Por Qué Importa, La Solución (el tema), Cómo Funciona, Casos de Éxito, Obstáculos, Conclusión.", "Estructura Comparativa: Panorama Actual, Opción A vs Opción B, Ventajas del Tema, Cuándo Usar Cada Uno, Conclusión.", "Estructura de Guía Paso a Paso: Prerrequisitos, Paso 1 (Evaluación), Paso 2 (Diseño), Paso 3 (Implementación), Errores Comunes, Próximos Pasos." ];
    return $estructuras[array_rand($estructuras)];
}

function generarElementosVariabilidad() {
    $elementos = [ 'Incluye estadísticas y datos específicos de ' . date("Y") . '.', 'Menciona herramientas y empresas reales del sector.', 'Incorpora citas de expertos reconocidos en el campo.', 'Agrega ejemplos de código o implementación cuando sea relevante.', 'Incluye métricas de performance y benchmarks.', 'Menciona regulaciones y compliance relevantes.', 'Incorpora análisis de costos y ROI.', 'Agrega perspectivas de diferentes industrias.', 'Incluye un roadmap o timeline de implementación.', 'Menciona riesgos y estrategias de mitigación específicas.' ];
    shuffle($elementos);
    return "- " . implode("\n- ", array_slice($elementos, 0, rand(3, 4)));
}

function generarBlogConGemini($tema, $apiKey) {
    $enfoque = generarEnfoqueDinamico($tema);
    $estructura = generarEstructuraDinamica();
    $elementos = generarElementosVariabilidad();
    $semilla = rand(0, 1000);
    $prompt = "SEMILLA DE VARIACIÓN: $semilla. TEMA BASE: {$tema['nombre']}. ENFOQUE ESPECÍFICO: $enfoque. ESTRUCTURA: $estructura. ELEMENTOS ADICIONALES:\n$elementos\n\nREQUISITOS: Escribe en español un artículo profesional y único de mínimo 1800 palabras. Usa formato Markdown limpio. La respuesta DEBE ser un único objeto JSON válido y nada más, con esta estructura: {\"titulo\":\"...\",\"resumen\":\"...\",\"contenido\":\"...\",\"tiempo_lectura\":5,\"tags\":[\"...\"],\"meta_titulo\":\"...\",\"meta_descripcion\":\"...\"}";
    $url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' . $apiKey;
    $data = ['contents' => [['parts' => [['text' => $prompt]]]], 'generationConfig' => ['response_mime_type' => 'application/json']];
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    $response = curl_exec($ch);
    if (curl_errno($ch)) { throw new Exception('Error cURL Gemini: ' . curl_error($ch)); }
    curl_close($ch);
    $result = json_decode($response, true);
    if (!isset($result['candidates'][0]['content']['parts'][0]['text'])) { throw new Exception('Respuesta inválida de Gemini AI: ' . ($result['error']['message'] ?? 'Formato inesperado.')); }
    $blogData = json_decode($result['candidates'][0]['content']['parts'][0]['text'], true);
    if (json_last_error() !== JSON_ERROR_NONE) { throw new Exception('Gemini no devolvió un JSON válido. Error: ' . json_last_error_msg()); }
    return $blogData;
}

function generarImagenConUnsplash($keywords, $apiKey) {
    $searchTerm = !empty($keywords) ? $keywords[array_rand($keywords)] : 'technology abstract';
    $url = "https://api.unsplash.com/search/photos?query=" . urlencode($searchTerm) . "&per_page=10&orientation=landscape";
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); curl_setopt($ch, CURLOPT_HTTPHEADER, ['Authorization: Client-ID ' . $apiKey]);
    $response = curl_exec($ch);
    if (curl_errno($ch)) { return null; }
    curl_close($ch);
    $data = json_decode($response, true);
    return !empty($data['results']) ? ($data['results'][array_rand($data['results'])]['urls']['regular'] ?? null) : null;
}

function guardarEnSupabase($blogData, $temaSeleccionado, $imagenUrl, $config) {
    $tagsLimpios = $temaSeleccionado['keywords'];
    $titulo_truncado = mb_substr($blogData['titulo'], 0, 200, 'UTF-8');
    $meta_titulo_truncado = mb_substr($blogData['meta_titulo'] ?? $titulo_truncado, 0, 60, 'UTF-8');
    $meta_descripcion_truncada = mb_substr($blogData['meta_descripcion'] ?? $blogData['resumen'], 0, 160, 'UTF-8');
    $autor_truncado = mb_substr("🤖 IA - {$temaSeleccionado['nombre']}", 0, 100, 'UTF-8');
    $resumen_truncado = mb_substr($blogData['resumen'], 0, 1000, 'UTF-8');
    $baseSlug = strtolower(preg_replace('/[^a-z0-9]+/', '-', $titulo_truncado));
    $slug = substr($baseSlug, 0, 40) . '-' . substr(bin2hex(random_bytes(4)), 0, 8);
    $postData = [ 'titulo' => $titulo_truncado, 'slug' => $slug, 'resumen' => $resumen_truncado, 'contenido' => $blogData['contenido'], 'tiempo_lectura' => $blogData['tiempo_lectura'] ?? 7, 'tags' => $tagsLimpios, 'publicado' => true, 'destacado' => false, 'meta_titulo' => $meta_titulo_truncado, 'meta_descripcion' => $meta_descripcion_truncada, 'autor' => $autor_truncado, 'imagen_url' => $imagenUrl, 'categoria_id' => 'cbc153ea-a127-40ea-bf34-69f35a153c5a' ];
    $url = $config['PUBLIC_SUPABASE_URL'] . '/rest/v1/blog_posts';
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($postData));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [ 'Content-Type: application/json', 'Authorization: Bearer ' . $config['PUBLIC_SUPABASE_ANON_KEY'], 'apikey: ' . $config['PUBLIC_SUPABASE_ANON_KEY'], 'Prefer: return=representation' ]);
    $response = curl_exec($ch);
    if (curl_errno($ch)) { throw new Exception('Error cURL Supabase (Guardar): ' . curl_error($ch)); }
    curl_close($ch);
    $result = json_decode($response, true);
    if (!$result || !isset($result[0]['id'])) { throw new Exception('Error de Supabase al guardar: ' . ($result['message'] ?? 'Respuesta inesperada.')); }
    return $result[0];
}

function registrarMetricas($postId, $datos, $config) {
    $rpcUrl = $config['PUBLIC_SUPABASE_URL'] . '/rest/v1/rpc/registrar_metricas_llm';
    $ch = curl_init($rpcUrl);
    curl_setopt($ch, CURLOPT_POST, true); curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($datos));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [ 'Content-Type: application/json', 'Authorization: Bearer ' . $config['PUBLIC_SUPABASE_ANON_KEY'], 'apikey: ' . $config['PUBLIC_SUPABASE_ANON_KEY'] ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_exec($ch);
    curl_close($ch);
}

// ==========================================================
// LÓGICA PRINCIPAL DEL SCRIPT
// ==========================================================
try {
    $input = json_decode(file_get_contents('php://input'), true);
    $temaId = $input['temaId'] ?? null;
    if (!$temaId) { throw new Exception('Falta temaId en la petición.', 400); }

    $temas = [
        'llm' => ['nombre' => 'Large Language Models', 'keywords' => ['LLM', 'GPT', 'Transformers', 'NLP', 'ChatGPT', 'Claude', 'Gemini'], 'prompt' => 'Explica los modelos más populares y sus aplicaciones empresariales.'],
        'rag' => ['nombre' => 'RAG', 'keywords' => ['RAG', 'Vector DB', 'Embeddings', 'Retrieval', 'Knowledge Base'], 'prompt' => 'Detalla la arquitectura RAG y compárala con el fine-tuning.'],
        'ia-generativa' => ['nombre' => 'IA Generativa', 'keywords' => ['Generative AI', 'DALL-E', 'Midjourney', 'Stable Diffusion', 'Content Creation'], 'prompt' => 'Cubre la generación de texto, imágenes y video, y su impacto creativo.'],
        'machine-learning' => ['nombre' => 'Machine Learning', 'keywords' => ['ML', 'Deep Learning', 'Neural Networks', 'Supervised Learning', 'Unsupervised Learning'], 'prompt' => 'Explica conceptos, tipos de aprendizaje y aplicaciones en la industria.'],
        'computer-vision' => ['nombre' => 'Computer Vision', 'keywords' => ['Computer Vision', 'Image Recognition', 'Object Detection', 'OCR', 'Medical Imaging'], 'prompt' => 'Detalla técnicas de procesamiento de imágenes y sus usos en medicina y automoción.'],
        'nlp' => ['nombre' => 'Procesamiento de Lenguaje Natural', 'keywords' => ['NLP', 'Natural Language Processing', 'Sentiment Analysis', 'Text Mining', 'Chatbots'], 'prompt' => 'Cubre análisis de sentimientos, traducción automática y el rol de los chatbots.'],
        'automatizacion-ia' => ['nombre' => 'Automatización con IA', 'keywords' => ['RPA', 'Automation', 'Process Mining', 'Workflow', 'Business Intelligence'], 'prompt' => 'Analiza RPA, optimización de workflows y el futuro del trabajo automatizado.'],
        'etica-ia' => ['nombre' => 'Ética en IA', 'keywords' => ['AI Ethics', 'Bias', 'Fairness', 'Transparency', 'Responsible AI'], 'prompt' => 'Discute sesgos algorítmicos, transparencia y regulaciones como el AI Act de la UE.']
    ];
    
    if (!isset($temas[$temaId])) { throw new Exception('El "temaId" (' . htmlspecialchars($temaId) . ') no es válido.', 400); }
    $temaSeleccionado = $temas[$temaId];

    $tiempoInicio = microtime(true);
    $fechaInicio = date('c');

    $blogGenerado = generarBlogConGemini($temaSeleccionado, $config['gemini_api_key']);
    $imagenUrl = generarImagenConUnsplash($temaSeleccionado['keywords'], $config['unsplash_access_key']);
    $postCreado = guardarEnSupabase($blogGenerado, $temaSeleccionado, $imagenUrl, $config);

    $tiempoGeneracionMs = round((microtime(true) - $tiempoInicio) * 1000);
    
    registrarMetricas($postCreado['id'], [
        'p_post_id' => $postCreado['id'], 'p_modelo_usado' => 'gemini-2.0-flash', 'p_proveedor' => 'Google',
        'p_tiempo_generacion_ms' => $tiempoGeneracionMs, 'p_tiempo_inicio' => $fechaInicio, 'p_tiempo_fin' => date('c'),
        'p_tema_seleccionado' => $temaSeleccionado['nombre']
    ], $config);

    echo json_encode(['success' => true, 'post' => $postCreado]);

} catch (Exception $e) {
    $errorCode = $e->getCode();
    http_response_code(is_int($errorCode) && $errorCode >= 400 && $errorCode < 600 ? $errorCode : 500);
    echo json_encode(['success' => false, 'error' => 'CONFESIÓN v14: ' . $e->getMessage()]);
}
?>