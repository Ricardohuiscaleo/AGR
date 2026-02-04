<?php
/**
 * API Agente RAG - Reemplazo del webhook n8n
 * Sistema RAG completo con Google Gemini y MySQL
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, x-session-id');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit();
}

// Cargar configuración
require_once 'config-rag.php';

try {
    // Obtener datos del request
    $input = json_decode(file_get_contents('php://input'), true);
    $sessionId = $_SERVER['HTTP_X_SESSION_ID'] ?? null;
    
    if (!$input || !isset($input['message'])) {
        throw new Exception('Mensaje es requerido');
    }
    
    $userMessage = trim($input['message']);
    
    if (empty($userMessage)) {
        throw new Exception('Mensaje no puede estar vacío');
    }
    
    // Generar session_id si no existe
    if (!$sessionId) {
        $sessionId = generateSessionId();
    }
    
    // Inicializar agente RAG
    $ragAgent = new RAGAgent();
    
    // Procesar mensaje con RAG
    $response = $ragAgent->processMessage($userMessage, $sessionId);
    
    // Respuesta exitosa
    echo json_encode([
        'output' => $response,
        'session_id' => $sessionId,
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Error interno del servidor',
        'output' => 'Lo siento, ha ocurrido un error. Por favor intenta nuevamente.',
        'details' => $e->getMessage()
    ]);
}

function generateSessionId() {
    return bin2hex(random_bytes(16));
}

class RAGAgent {
    private $db;
    private $ollamaUrl;
    private $ollamaModel;
    private $supabaseUrl;
    private $supabaseKey;
    
    public function __construct() {
        global $DB_CONFIG, $SUPABASE_URL, $SUPABASE_ANON_KEY;
        $this->ollamaUrl = getenv('OLLAMA_URL') ?: 'http://agenterag-com_ollama:11434';
        $this->ollamaModel = getenv('OLLAMA_MODEL') ?: 'llama3.2:3b';
        $this->supabaseUrl = $SUPABASE_URL;
        $this->supabaseKey = $SUPABASE_ANON_KEY;
        $this->initDatabase();
    }
    
    private function initDatabase() {
        global $DB_CONFIG;
        try {
            $this->db = new PDO(
                "mysql:host={$DB_CONFIG['host']};dbname={$DB_CONFIG['database']};charset=utf8mb4",
                $DB_CONFIG['username'],
                $DB_CONFIG['password'],
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
                ]
            );
        } catch (PDOException $e) {
            throw new Exception('Error de conexión a base de datos: ' . $e->getMessage());
        }
    }
    
    public function processMessage($message, $sessionId) {
        // 1. Guardar mensaje del usuario
        $this->saveMessage($sessionId, 'user', $message);
        
        // 2. Obtener contexto de conversación
        $conversationHistory = $this->getConversationHistory($sessionId);
        
        // 3. Buscar información relevante (RAG Retrieval)
        $relevantInfo = $this->retrieveRelevantInfo($message);
        
        // 4. Generar respuesta con Gemini (RAG Generation)
        $response = $this->generateResponse($message, $conversationHistory, $relevantInfo);
        
        // 4.1 Fallback si Gemini falla
        if (strpos($response, 'Error') === 0 || strpos($response, 'Lo siento') === 0) {
            $response = $this->generateFallbackResponse($message, $relevantInfo);
        }
        
        // 5. Guardar respuesta del bot
        $this->saveMessage($sessionId, 'assistant', $response);
        
        return $response;
    }
    
    private function saveMessage($sessionId, $role, $content) {
        $stmt = $this->db->prepare("
            INSERT INTO rag_conversations (session_id, role, content, created_at) 
            VALUES (?, ?, ?, NOW())
        ");
        $stmt->execute([$sessionId, $role, $content]);
    }
    
    private function getConversationHistory($sessionId, $limit = 10) {
        $stmt = $this->db->prepare("
            SELECT role, content, created_at 
            FROM rag_conversations 
            WHERE session_id = ? 
            ORDER BY created_at DESC 
            LIMIT " . (int)$limit . "
        ");
        $stmt->execute([$sessionId]);
        return array_reverse($stmt->fetchAll());
    }
    
    private function retrieveRelevantInfo($query) {
        $relevantInfo = [];
        
        // 1. Buscar en base de conocimientos RAG
        $stmt = $this->db->prepare("
            SELECT title, content, category, relevance_score, 'knowledge_base' as source
            FROM rag_knowledge_base 
            WHERE MATCH(title, content, keywords) AGAINST(? IN NATURAL LANGUAGE MODE)
            OR title LIKE ? OR content LIKE ? OR keywords LIKE ?
            ORDER BY relevance_score DESC, created_at DESC
            LIMIT 3
        ");
        
        $searchTerm = "%{$query}%";
        $stmt->execute([$query, $searchTerm, $searchTerm, $searchTerm]);
        $relevantInfo = array_merge($relevantInfo, $stmt->fetchAll());
        
        // 2. Buscar en blogs de Supabase (TOOL)
        $blogResults = $this->searchBlogsTool($query);
        $relevantInfo = array_merge($relevantInfo, $blogResults);
        
        return $relevantInfo;
    }
    
    // TOOL: Buscar en blogs existentes
    private function searchBlogsTool($query) {
        $url = $this->supabaseUrl . '/rest/v1/blog_posts?select=titulo,resumen,contenido,tags,created_at&publicado=eq.true&limit=3';
        
        // Buscar por título o contenido
        $searchUrl = $url . '&or=(titulo.ilike.*' . urlencode($query) . '*,resumen.ilike.*' . urlencode($query) . '*)';
        
        $options = [
            'http' => [
                'header' => [
                    "Authorization: Bearer {$this->supabaseKey}",
                    "apikey: {$this->supabaseKey}",
                    "Content-Type: application/json"
                ],
                'method' => 'GET'
            ]
        ];
        
        $context = stream_context_create($options);
        $response = file_get_contents($searchUrl, false, $context);
        
        if ($response === FALSE) {
            return [];
        }
        
        $blogs = json_decode($response, true);
        if (!$blogs) {
            return [];
        }
        
        // Formatear resultados para que coincidan con el formato esperado
        $formattedBlogs = [];
        foreach ($blogs as $blog) {
            $formattedBlogs[] = [
                'title' => $blog['titulo'],
                'content' => substr($blog['resumen'] . ' ' . strip_tags($blog['contenido']), 0, 500),
                'category' => 'blog',
                'relevance_score' => 8.0,
                'source' => 'blog',
                'created_at' => $blog['created_at']
            ];
        }
        
        return $formattedBlogs;
    }
    
    private function generateResponse($userMessage, $history, $relevantInfo) {
        $url = rtrim($this->ollamaUrl, '/') . '/api/generate';
        
        $contextInfo = $this->buildContext($relevantInfo);
        $conversationContext = $this->buildConversationContext($history);
        
        $systemPrompt = "Eres un agente RAG especializado en automatización, ahorro de costos y consultoría empresarial. \n\nINFORMACIÓN RELEVANTE:\n{$contextInfo}\n\nHISTORIAL DE CONVERSACIÓN:\n{$conversationContext}\n\nINSTRUCCIONES:\n- Responde de manera profesional y útil\n- Usa la información proporcionada cuando sea relevante\n- Si no tienes información específica, sé honesto al respecto\n- Enfócate en automatización, ahorro de costos y eficiencia empresarial\n- Usa formato HTML para respuestas estructuradas cuando sea apropiado\n- Mantén un tono conversacional pero profesional\n\nMENSAJE DEL USUARIO: {$userMessage}\n\nResponde de manera directa y útil:";

        $data = [
            'model' => $this->ollamaModel,
            'prompt' => $systemPrompt,
            'stream' => false,
            'options' => [
                'temperature' => 0.7,
                'top_k' => 40,
                'top_p' => 0.95,
                'num_predict' => 1024
            ]
        ];
        
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        
        $response = curl_exec($ch);
        
        if ($response === FALSE) {
            $error = curl_error($ch);
            curl_close($ch);
            error_log("Ollama API Error: " . $error);
            return "Error de conexión con Ollama API. Intenta nuevamente.";
        }
        
        curl_close($ch);
        $result = json_decode($response, true);
        
        if (!$result) {
            error_log("Ollama JSON Error: " . json_last_error_msg());
            return "Error al procesar respuesta de Ollama. Intenta nuevamente.";
        }
        
        if (isset($result['error'])) {
            error_log("Ollama API Error: " . json_encode($result['error']));
            return "Error de Ollama API: " . ($result['error'] ?? 'Error desconocido');
        }
        
        if (!isset($result['response'])) {
            error_log("Ollama Structure Error: " . json_encode($result));
            return "Respuesta inesperada de Ollama. Intenta nuevamente.";
        }
        
        return $result['response'];
    }
    
    private function buildContext($relevantInfo) {
        if (empty($relevantInfo)) {
            return "No se encontró información específica en la base de conocimientos.";
        }
        
        $context = "Información relevante encontrada:\n\n";
        foreach ($relevantInfo as $info) {
            $context .= "**{$info['title']}** ({$info['category']})\n";
            $context .= substr($info['content'], 0, 300) . "...\n\n";
        }
        
        return $context;
    }
    
    private function buildConversationContext($history) {
        if (empty($history)) {
            return "Esta es una nueva conversación.";
        }
        
        $context = "Mensajes anteriores:\n";
        foreach (array_slice($history, -6) as $msg) {
            $role = $msg['role'] === 'user' ? 'Usuario' : 'Asistente';
            $content = substr($msg['content'], 0, 150);
            $context .= "{$role}: {$content}\n";
        }
        
        return $context;
    }
    
    private function generateFallbackResponse($message, $relevantInfo) {
        $message = strtolower($message);
        
        // Respuestas específicas para preguntas comunes
        if (strpos($message, 'rag') !== false || strpos($message, 'que es') !== false) {
            return "<p><strong>RAG (Retrieval-Augmented Generation)</strong> es un sistema de IA que combina:</p>
            <ul>
            <li><strong>Recuperación:</strong> Busca información relevante en bases de datos</li>
            <li><strong>Generación:</strong> Crea respuestas contextualizadas usando esa información</li>
            </ul>
            <p>En nuestro caso, te ayudo con <strong>automatización, ahorro de costos y consultoría empresarial</strong> usando información específica de nuestra base de conocimientos.</p>";
        }
        
        if (strpos($message, 'automatizacion') !== false || strpos($message, 'automatizar') !== false) {
            return "<p>La <strong>automatización empresarial</strong> puede reducir costos hasta un 40%. Incluye:</p>
            <ul>
            <li>Automatización de procesos repetitivos</li>
            <li>Workflows inteligentes</li>
            <li>Reducción de errores humanos</li>
            <li>Mayor eficiencia operativa</li>
            </ul>
            <p>¿Te gustaría saber más sobre algún aspecto específico?</p>";
        }
        
        if (strpos($message, 'costo') !== false || strpos($message, 'ahorro') !== false) {
            return "<p>Nuestras soluciones de <strong>ahorro de costos</strong> incluyen:</p>
            <ul>
            <li>Análisis de procesos ineficientes</li>
            <li>Implementación de IA para optimización</li>
            <li>ROI típico de 200-300% en el primer año</li>
            <li>Reducción de personal en tareas repetitivas</li>
            </ul>
            <p>¿Qué área de tu empresa te gustaría optimizar?</p>";
        }
        
        // Respuesta genérica con información relevante si existe
        if (!empty($relevantInfo)) {
            $response = "<p>Basándome en nuestra base de conocimientos, puedo ayudarte con:</p><ul>";
            foreach (array_slice($relevantInfo, 0, 3) as $info) {
                $response .= "<li><strong>{$info['title']}</strong> - " . substr(strip_tags($info['content']), 0, 100) . "...</li>";
            }
            $response .= "</ul><p>¿Sobre cuál te gustaría saber más?</p>";
            return $response;
        }
        
        // Respuesta por defecto
        return "<p>Como agente RAG especializado en <strong>automatización y ahorro de costos</strong>, puedo ayudarte con:</p>
        <ul>
        <li>Optimización de procesos empresariales</li>
        <li>Implementación de IA para reducir costos</li>
        <li>Automatización de tareas repetitivas</li>
        <li>Consultoría en transformación digital</li>
        </ul>
        <p>¿En qué área específica te gustaría que te ayude?</p>";
    }
}
?>
            $context .= "**{$info['title']}** ({$info['category']})\n";
            $context .= substr($info['content'], 0, 300) . "...\n\n";
        }
        
        return $context;
    }
    
    private function buildConversationContext($history) {
        if (empty($history)) {
            return "Esta es una nueva conversación.";
        }
        
        $context = "Mensajes anteriores:\n";
        foreach (array_slice($history, -6) as $msg) {
            $role = $msg['role'] === 'user' ? 'Usuario' : 'Asistente';
            $content = substr($msg['content'], 0, 150);
            $context .= "{$role}: {$content}\n";
        }
        
        return $context;
    }
    
    private function generateFallbackResponse($message, $relevantInfo) {
        $message = strtolower($message);
        
        // Respuestas específicas para preguntas comunes
        if (strpos($message, 'rag') !== false || strpos($message, 'que es') !== false) {
            return "<p><strong>RAG (Retrieval-Augmented Generation)</strong> es un sistema de IA que combina:</p>
            <ul>
            <li><strong>Recuperación:</strong> Busca información relevante en bases de datos</li>
            <li><strong>Generación:</strong> Crea respuestas contextualizadas usando esa información</li>
            </ul>
            <p>En nuestro caso, te ayudo con <strong>automatización, ahorro de costos y consultoría empresarial</strong> usando información específica de nuestra base de conocimientos.</p>";
        }
        
        if (strpos($message, 'automatizacion') !== false || strpos($message, 'automatizar') !== false) {
            return "<p>La <strong>automatización empresarial</strong> puede reducir costos hasta un 40%. Incluye:</p>
            <ul>
            <li>Automatización de procesos repetitivos</li>
            <li>Workflows inteligentes</li>
            <li>Reducción de errores humanos</li>
            <li>Mayor eficiencia operativa</li>
            </ul>
            <p>¿Te gustaría saber más sobre algún aspecto específico?</p>";
        }
        
        if (strpos($message, 'costo') !== false || strpos($message, 'ahorro') !== false) {
            return "<p>Nuestras soluciones de <strong>ahorro de costos</strong> incluyen:</p>
            <ul>
            <li>Análisis de procesos ineficientes</li>
            <li>Implementación de IA para optimización</li>
            <li>ROI típico de 200-300% en el primer año</li>
            <li>Reducción de personal en tareas repetitivas</li>
            </ul>
            <p>¿Qué área de tu empresa te gustaría optimizar?</p>";
        }
        
        // Respuesta genérica con información relevante si existe
        if (!empty($relevantInfo)) {
            $response = "<p>Basándome en nuestra base de conocimientos, puedo ayudarte con:</p><ul>";
            foreach (array_slice($relevantInfo, 0, 3) as $info) {
                $response .= "<li><strong>{$info['title']}</strong> - " . substr(strip_tags($info['content']), 0, 100) . "...</li>";
            }
            $response .= "</ul><p>¿Sobre cuál te gustaría saber más?</p>";
            return $response;
        }
        
        // Respuesta por defecto
        return "<p>Como agente RAG especializado en <strong>automatización y ahorro de costos</strong>, puedo ayudarte con:</p>
        <ul>
        <li>Optimización de procesos empresariales</li>
        <li>Implementación de IA para reducir costos</li>
        <li>Automatización de tareas repetitivas</li>
        <li>Consultoría en transformación digital</li>
        </ul>
        <p>¿En qué área específica te gustaría que te ayude?</p>";
    }
}
?>