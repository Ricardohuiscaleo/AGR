<?php
/**
 * Gaby Agent - Agente RAG Avanzado con Personalidad
 * Replica la funcionalidad completa del agente de n8n
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, x-session-id');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit();
}

$config_path = __DIR__ . '/../../config.php';
$config = file_exists($config_path) ? require $config_path : [];

$SUPABASE_URL = $config['PUBLIC_SUPABASE_URL'] ?? getenv('PUBLIC_SUPABASE_URL');
$SUPABASE_ANON_KEY = $config['PUBLIC_SUPABASE_ANON_KEY'] ?? getenv('PUBLIC_SUPABASE_ANON_KEY');
$OLLAMA_URL = $config['ollama_url'] ?? getenv('OLLAMA_URL') ?: 'http://agenterag-com_ollama:11434';
$OLLAMA_MODEL = $config['ollama_model'] ?? getenv('OLLAMA_MODEL') ?: 'llama3.2:3b';
$DB_CONFIG = [
    'host' => $config['rag_db_host'] ?? getenv('RAG_DB_HOST') ?: 'localhost',
    'database' => $config['rag_db_name'] ?? getenv('RAG_DB_NAME') ?: 'agenterag',
    'username' => $config['rag_db_user'] ?? getenv('RAG_DB_USER') ?: 'root',
    'password' => $config['rag_db_pass'] ?? getenv('RAG_DB_PASS') ?: ''
];

if (empty($SUPABASE_URL) || empty($SUPABASE_ANON_KEY)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Error: Faltan variables de entorno SUPABASE']);
    exit;
}

require_once 'gaby-tools-fixed.php';

try {
    // Registrar información de depuración detallada
    error_log("gaby-agent.php: Iniciando procesamiento de solicitud " . $_SERVER['REQUEST_METHOD']);
    error_log("gaby-agent.php: Headers recibidos: " . json_encode(getallheaders()));
    
    // Manejar tanto GET como POST
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $input = ['message' => isset($_GET['message']) ? $_GET['message'] : 'Hola'];
        $sessionId = isset($_GET['session']) ? $_GET['session'] : null;
        error_log("Solicitud GET recibida: " . json_encode($input));
    } else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $rawInput = file_get_contents('php://input');
        error_log("Datos POST recibidos (raw): " . $rawInput);
        $input = json_decode($rawInput, true);
        error_log("Datos POST decodificados: " . json_encode($input));
        $sessionId = isset($_SERVER['HTTP_X_SESSION_ID']) ? $_SERVER['HTTP_X_SESSION_ID'] : null;
        error_log("Session ID del header: " . $sessionId);
    } else {
        throw new Exception('Método no permitido: ' . $_SERVER['REQUEST_METHOD']);
    }
    
    if (!$input || !isset($input['message'])) {
        throw new Exception('Mensaje es requerido');
    }
    
    $userMessage = trim($input['message']);
    
    if (empty($userMessage)) {
        throw new Exception('Mensaje no puede estar vacío');
    }
    
    if (!$sessionId) {
        $sessionId = generateSessionId();
    }
    
    // Inicializar Gaby Agent
    error_log("Inicializando GabyAgent con sessionId: " . $sessionId);
    $gabyAgent = new GabyAgent();
    
    // Verificar si hay contexto de otro agente
    $contextFromOtherAgent = isset($input['agent_context']) ? $input['agent_context'] : null;
    
    // Procesar mensaje con personalidad y tools
    error_log("Procesando mensaje: " . $userMessage);
    $response = $gabyAgent->processMessage($userMessage, $sessionId, $contextFromOtherAgent);
    
    error_log("Respuesta generada exitosamente");
    echo json_encode([
        'output' => $response,
        'session_id' => $sessionId,
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    
} catch (PDOException $e) {
    error_log("ERROR DE BASE DE DATOS en gaby-agent.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'error' => 'Error de conexión a la base de datos',
        'output' => 'Lo siento, ha ocurrido un problema con nuestra base de datos. Por favor intenta nuevamente más tarde.',
        'details' => $e->getMessage()
    ]);
} catch (Exception $e) {
    error_log("ERROR GENERAL en gaby-agent.php: " . $e->getMessage());
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

class GabyAgent {
    private $db;
    private $ollamaUrl;
    private $ollamaModel;
    private $supabaseUrl;
    private $supabaseKey;
    private $conversationState;
    private $tools;
    
    public function __construct() {
        global $DB_CONFIG, $GEMINI_API_KEY, $SUPABASE_URL, $SUPABASE_ANON_KEY;
        global $OLLAMA_URL, $OLLAMA_MODEL;
        $this->ollamaUrl = $OLLAMA_URL;
        $this->ollamaModel = $OLLAMA_MODEL;
        $this->supabaseUrl = $SUPABASE_URL;
        $this->supabaseKey = $SUPABASE_ANON_KEY;
        $this->tools = new GabyTools();
        $this->initDatabase();
        
        // Registrar información de depuración
        error_log("GabyAgent inicializado con: SUPABASE_URL=" . substr($this->supabaseUrl, 0, 10) . "..., OLLAMA_URL=" . $this->ollamaUrl);
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
    
    public function processMessage($message, $sessionId, $contextFromOtherAgent = null) {
        // 1. Guardar mensaje del usuario
        $this->saveMessage($sessionId, 'user', $message);
        
        // 1.5. Procesar contexto de otro agente si existe
        if ($contextFromOtherAgent) {
            $this->saveMessage($sessionId, 'system', 'Contexto de Ignacio: ' . json_encode($contextFromOtherAgent));
        }
        
        // 2. Obtener contexto y estado de conversación
        $conversationHistory = $this->getConversationHistory($sessionId);
        $this->conversationState = $this->analyzeConversationState($conversationHistory, $message);
        
        // 3. Determinar si necesita tools
        $toolsNeeded = $this->identifyRequiredTools($message, $this->conversationState);
        
        // 4. Ejecutar tools si es necesario
        $toolResults = [];
        if (!empty($toolsNeeded)) {
            $toolResults = $this->executeTools($toolsNeeded, $message, $sessionId);
        }
        
        // 5. Buscar información relevante (RAG)
        $relevantInfo = $this->retrieveRelevantInfo($message);
        
        // 6. Generar respuesta con personalidad de Gaby
        $response = $this->generateGabyResponse($message, $conversationHistory, $relevantInfo, $toolResults);
        
        // 7. Transformar negritas a HTML
        $response = $this->transformBoldToHtml($response);
        
        // 8. Guardar respuesta
        $this->saveMessage($sessionId, 'assistant', $response);
        
        // 9. Guardar/actualizar contacto si tenemos datos suficientes
        $this->autoSaveContact($sessionId, $conversationHistory);
        
        return $response;
    }
    
    private function analyzeConversationState($history, $currentMessage) {
        $messageCount = count($history);
        $hasName = $this->extractUserName($history);
        $isQuestion = $this->isQuestion($currentMessage);
        
        // NUEVA FUNCIONALIDAD: Detectar intención del usuario
        $userIntent = $this->detectUserIntent($currentMessage, $history);
        
        // Verificar si Gaby ya se presentó antes
        $gabyAlreadyIntroduced = false;
        foreach ($history as $msg) {
            if ($msg['role'] === 'assistant' && strpos($msg['content'], 'soy **Gaby**') !== false) {
                $gabyAlreadyIntroduced = true;
                break;
            }
        }
        
        return [
            'message_count' => $messageCount,
            'is_first_message' => ($messageCount <= 2) && !$gabyAlreadyIntroduced && empty($hasName),
            'has_user_name' => !empty($hasName),
            'user_name' => $hasName,
            'is_question' => $isQuestion,
            'conversation_stage' => $this->determineConversationStage($history, $hasName),
            'gaby_introduced' => $gabyAlreadyIntroduced,
            'user_intent' => $userIntent // NUEVA PROPIEDAD
        ];
    }
    
    // NUEVA FUNCIÓN: Detectar intención del usuario MEJORADA
    private function detectUserIntent($message, $history) {
        $messageLower = strtolower($message);
        
        // INTENCIÓN 1: VENTAS - Frases de interés comercial (PRIORIDAD ALTA)
        $salesKeywords = [
            'me interesa', 'interesante', 'quiero', 'necesito', 'me gusta',
            'agendar', 'reunión', 'contacto', 'precio', 'costo', 'inversión',
            'cotización', 'presupuesto', 'implementar', 'contratar'
        ];
        
        foreach ($salesKeywords as $keyword) {
            if (strpos($messageLower, $keyword) !== false) {
                return 'sales_interested';
            }
        }
        
        // INTENCIÓN 2: FAQ - Preguntas técnicas y conceptuales
        $faqKeywords = [
            'qué es', 'qué son', 'cómo funciona', 'qué puedes hacer',
            'cómo me ayuda', 'para qué sirve', 'qué significa',
            'rag', 'retrieval', 'alucinaciones', 'semántica',
            'agente', 'chatbot', 'inteligencia artificial', 'ia',
            'beneficios', 'ventajas', 'diferencia'
        ];
        
        foreach ($faqKeywords as $keyword) {
            if (strpos($messageLower, $keyword) !== false) {
                return 'faq_query';
            }
        }
        
        // INTENCIÓN 3: Solo quiere información (blogs, estadísticas)
        $infoKeywords = [
            'cuántos blogs', 'estadísticas', 'blog más popular',
            'artículos publicados', 'contenido del blog'
        ];
        
        foreach ($infoKeywords as $keyword) {
            if (strpos($messageLower, $keyword) !== false) {
                return 'information_seeking';
            }
        }
        
        // INTENCIÓN 4: Analizar CONTEXTO de conversación
        if (count($history) > 2) {
            $recentMessages = array_slice($history, -4);
            $recentContent = implode(' ', array_column($recentMessages, 'content'));
            $recentContentLower = strtolower($recentContent);
            
            // Si ya estaba en modo ventas, mantenerlo
            if (strpos($recentContentLower, 'reunión') !== false || 
                strpos($recentContentLower, 'especialista') !== false ||
                strpos($recentContentLower, 'agendar') !== false) {
                return 'sales_interested';
            }
            
            // Si ya estaba en FAQ, mantenerlo para preguntas de seguimiento
            if (strpos($recentContentLower, 'rag') !== false ||
                strpos($recentContentLower, 'alucinaciones') !== false) {
                return 'faq_query';
            }
        }
        
        // INTENCIÓN 5: Conversación casual (por defecto)
        return 'casual_conversation';
    }
    
    private function determineConversationStage($history, $hasName) {
        if (empty($history)) return 'greeting';
        if (empty($hasName)) return 'name_collection';
        
        // Analizar últimos mensajes para determinar etapa
        $recentMessages = array_slice($history, -50);
        $content = implode(' ', array_column($recentMessages, 'content'));
        
        if (strpos($content, 'diagnóstico') !== false) return 'diagnostic_flow';
        if (strpos($content, 'reunión') !== false) return 'meeting_flow';
        if (strpos($content, 'correo') !== false) return 'contact_collection';
        
        return 'service_selection';
    }
    
    private function identifyRequiredTools($message, $state) {
        $tools = [];
        $message = strtolower($message);
        
        // Contact tool - AMPLIADO para detectar solicitudes de contacto
        if (strpos($message, 'contacto') !== false ||
            strpos($message, 'contactar') !== false ||
            strpos($message, 'area de ventas') !== false ||
            strpos($message, 'equipo de ventas') !== false ||
            strpos($message, 'hablar con ventas') !== false ||
            $state['conversation_stage'] === 'contact_collection' || 
            strpos($message, 'guardar') !== false) {
            $tools[] = 'contact';
        }
        
        // Calendar tool
        if (strpos($message, 'reunión') !== false || 
            strpos($message, 'agendar') !== false || 
            strpos($message, 'calendario') !== false) {
            $tools[] = 'calendar';
        }
        
        // Document tool
        if (strpos($message, 'informe') !== false || 
            strpos($message, 'diagnóstico') !== false) {
            $tools[] = 'document';
        }
        
        return $tools;
    }
    
    private function executeTools($tools, $message, $sessionId) {
        $results = [];
        
        foreach ($tools as $tool) {
            switch ($tool) {
                case 'calendar':
                    $results['calendar'] = $this->executeCalendarTool($message, $sessionId);
                    break;
                case 'contact':
                    $results['contact'] = $this->executeContactTool($message, $sessionId);
                    break;
                case 'document':
                    $results['document'] = $this->executeDocumentTool($message, $sessionId);
                    break;
            }
        }
        
        return $results;
    }
    
    private function executeCalendarTool($message, $sessionId) {
        // Determinar acción basada en el mensaje
        if (strpos($message, 'disponibilidad') !== false) {
            return $this->tools->calendarTool('get_availability', ['days' => 7]);
        } elseif (strpos($message, 'crear') !== false || strpos($message, 'agendar') !== false) {
            // Extraer datos del contexto de conversación
            $history = $this->getConversationHistory($sessionId);
            $clientData = $this->extractClientDataFromHistory($history);
            return $this->tools->calendarTool('create_meeting', $clientData);
        } else {
            return $this->tools->calendarTool('check_availability');
        }
    }
    
    private function executeContactTool($message, $sessionId) {
        $history = $this->getConversationHistory($sessionId);
        $clientData = $this->extractClientDataFromHistory($history);
        
        if (!empty($clientData['name']) && !empty($clientData['email'])) {
            return $this->tools->contactTool('save_contact', $clientData);
        } else {
            return ['error' => 'Datos insuficientes para guardar contacto'];
        }
    }
    
    private function executeDocumentTool($message, $sessionId) {
        $history = $this->getConversationHistory($sessionId);
        $clientData = $this->extractClientDataFromHistory($history);
        
        if (!empty($clientData['name']) && !empty($clientData['company'])) {
            return $this->tools->documentTool('generate_diagnostic', $clientData);
        } else {
            return ['error' => 'Datos insuficientes para generar informe'];
        }
    }
    
    private function extractClientDataFromHistory($history) {
        $data = [];
        
        foreach ($history as $msg) {
            $content = $msg['content'];
            $contentLower = strtolower($content);
            
            // Extraer nombre - múltiples patrones
            if (preg_match('/(?:soy|me llamo|mi nombre es|nombre es:?)\s+([a-záéíóúñü\s]+)/i', $content, $matches)) {
                $name = trim($matches[1]);
                if (strlen($name) > 2 && !preg_match('/^(si|no|ok|bien|mal|hola)$/i', $name)) {
                    $data['name'] = $name;
                }
            }
            
            // Extraer email
            if (preg_match('/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/', $content, $matches)) {
                $data['email'] = $matches[1];
            }
            
            // Extraer teléfono
            if (preg_match('/(\+?[0-9]{8,15})/', $content, $matches)) {
                $phone = $matches[1];
                if (strlen($phone) >= 8) {
                    $data['phone'] = $phone;
                }
            }
            
            // Extraer empresa - patrón específico para "somos La Ruta 11 foodtrucks"
            if (preg_match('/somos\s+([^,]+?)\s*,/i', $content, $matches)) {
                $company = trim($matches[1]);
                if (strlen($company) > 2) {
                    $data['company'] = $company;
                }
            } elseif (preg_match('/(?:empresa|compañía|negocio)\s+(?:es|se llama)?\s*([a-záéíóúñü0-9\s]+)/i', $content, $matches)) {
                $company = trim($matches[1]);
                if (strlen($company) > 2) {
                    $data['company'] = $company;
                }
            }
            
            // Extraer rubro/industria - patrón específico
            if (preg_match('/nos dedicamos a la\s+([^,\.]+)/i', $content, $matches)) {
                $industry = trim($matches[1]);
                if (strlen($industry) > 3) {
                    $data['industry'] = $industry;
                }
            } elseif (preg_match('/(?:dedicamos|rubro|industria|sector)\s+(?:a|es)?\s*([a-záéíóúñü\s]+)/i', $content, $matches)) {
                $industry = trim($matches[1]);
                if (strlen($industry) > 3) {
                    $data['industry'] = $industry;
                }
            }
            
            // Extraer número de clientes
            if (preg_match('/(\d+)\s*(?:clientes?|usuarios?)\s*(?:al mes|mensuales?|por mes)?/i', $content, $matches)) {
                $data['monthly_clients'] = intval($matches[1]);
            }
            
            // Extraer proceso a automatizar
            if (strpos($contentLower, 'automatizar') !== false || 
                strpos($contentLower, 'app') !== false || 
                strpos($contentLower, 'sistema') !== false) {
                $data['process_to_automate'] = $content;
                $data['current_method'] = 'Proceso manual actual';
            }
        }
        
        return $data;
    }
            

    
    private function generateGabyResponse($userMessage, $history, $relevantInfo, $toolResults) {
        $contextInfo = $this->buildContext($relevantInfo);
        
        // NUEVA LÓGICA: Generar respuesta basada en la intención del usuario
        $userIntent = $this->conversationState['user_intent'];
        
        switch ($userIntent) {
            case 'faq_query':
                return $this->generateFAQResponse($userMessage, $contextInfo, $history);
            
            case 'information_seeking':
                return $this->generateInformativeResponse($userMessage, $contextInfo, $history);
            
            case 'sales_interested':
                return $this->generateSalesResponse($userMessage, $contextInfo, $history);
            
            case 'casual_conversation':
            default:
                return $this->generateCasualResponse($userMessage, $contextInfo, $history);
        }
    }
    
    // NUEVA FUNCIÓN: Respuesta informativa (sin ventas)
    private function generateInformativeResponse($userMessage, $contextInfo, $history) {
        $hasName = $this->conversationState['has_user_name'];
        $userName = $hasName ? $this->conversationState['user_name'] : '';
        
        // FORZAR búsqueda de información si no hay contexto
        if (empty($contextInfo) || $contextInfo === "No se encontró información específica en la base de conocimientos.") {
            $contextInfo = $this->forceInformationRetrieval($userMessage);
        }
        
        $prompt = "Eres Gaby, ejecutiva de Agente RAG. Responde la pregunta directamente usando la información disponible.\n\n";
        $prompt .= "INFORMACIÓN ENCONTRADA:\n{$contextInfo}\n\n";
        $prompt .= "PREGUNTA: {$userMessage}\n\n";
        $prompt .= "INSTRUCCIONES:\n";
        $prompt .= "- Usa SOLO la información proporcionada para responder\n";
        $prompt .= "- Sé específica y directa\n";
        $prompt .= "- NO inventes datos\n";
        if ($hasName) {
            $prompt .= "- El usuario se llama {$userName}\n";
        }
        $prompt .= "\nResponde como Gaby:";
        
        return $this->callGeminiAPI($prompt);
    }
    
    // NUEVA FUNCIÓN: Respuesta FAQ (knowledge base)
    private function generateFAQResponse($userMessage, $contextInfo, $history) {
        $hasName = $this->conversationState['has_user_name'];
        $userName = $hasName ? $this->conversationState['user_name'] : '';
        $conversationContext = $this->buildConversationContext($history);
        
        // Forzar búsqueda en knowledge base si no hay contexto
        if (empty($contextInfo) || $contextInfo === "No se encontró información específica en la base de conocimientos.") {
            $faqResults = $this->searchFAQ($userMessage);
            if (!empty($faqResults)) {
                $contextInfo = $this->buildContext($faqResults);
            }
        }
        
        $prompt = "Eres Gaby de Agente RAG. Usa PUENTES CONTEXTUALES para responder preguntas técnicas.\n\n";
        $prompt .= "HISTORIAL:\n{$conversationContext}\n\n";
        $prompt .= "INFORMACIÓN DISPONIBLE:\n{$contextInfo}\n\n";
        $prompt .= "PREGUNTA: {$userMessage}\n\n";
        $prompt .= "PUENTES CONTEXTUALES VARIADOS - Usa diferentes conectores:\n";
        $prompt .= "- Directos: 'Mira...', 'Fíjate que...', 'Te explico...', 'Básicamente...'\n";
        $prompt .= "- Empáticos: 'Entiendo tu duda...', 'Es una excelente pregunta...', 'Me alegra que preguntes...'\n";
        $prompt .= "- Naturales: 'Lo que pasa es que...', 'La cosa es así...', 'Te voy a contar...'\n";
        $prompt .= "- Técnicos: 'En términos simples...', 'Para que se entienda mejor...', 'Imagínate que...'\n\n";
        $prompt .= "INSTRUCCIONES:\n";
        $prompt .= "- Usa un puente contextual natural\n";
        $prompt .= "- Respuesta educativa (máximo 80 palabras)\n";
        $prompt .= "- NO repitas saludos ni presentaciones\n";
        if ($hasName) {
            $prompt .= "- El usuario se llama {$userName}\n";
        }
        $prompt .= "\nResponde como Gaby:";
        
        return $this->callGeminiAPI($prompt);
    }
    
    // NUEVA FUNCIÓN: Forzar búsqueda de información
    private function forceInformationRetrieval($query) {
        $queryLower = strtolower($query);
        
        // Detectar consultas sobre blogs y forzar scraping
        if (strpos($queryLower, 'blog') !== false || strpos($queryLower, 'cuántos') !== false) {
            $statsUrl = 'https://agenterag.com/php-apis/estadisticas.php';
            $scrapedStats = $this->scrapWebsiteWithCache($statsUrl);
            
            if ($scrapedStats) {
                return "Información de estadísticas:\n" . $scrapedStats['content'];
            }
        }
        
        // Detectar consultas sobre popularidad
        if (strpos($queryLower, 'popular') !== false || strpos($queryLower, 'mejor') !== false) {
            $blogsUrl = 'https://agenterag.com/php-apis/obtener-blogs.php';
            $scrapedBlogs = $this->scrapWebsiteWithCache($blogsUrl);
            
            if ($scrapedBlogs) {
                return "Información de blogs:\n" . $scrapedBlogs['content'];
            }
        }
        
        return "No se pudo obtener información específica.";
    }
    
    // NUEVA FUNCIÓN: Respuesta de ventas (modo original)
    private function generateSalesResponse($userMessage, $contextInfo, $history) {
        $hasName = $this->conversationState['has_user_name'];
        $userName = $hasName ? $this->conversationState['user_name'] : '';
        $conversationContext = $this->buildConversationContext($history);
        $clientData = $this->extractClientDataFromHistory($history);
        
        $prompt = "Eres Gaby, ejecutiva comercial de Agente RAG. El usuario está interesado en servicios.\n\n";
        $prompt .= "HISTORIAL DE CONVERSACIÓN:\n{$conversationContext}\n\n";
        $prompt .= "DATOS YA RECOPILADOS:\n" . $this->buildClientDataSummary($clientData) . "\n\n";
        $prompt .= "MENSAJE ACTUAL: {$userMessage}\n\n";
        $prompt .= "INSTRUCCIONES:\n";
        $prompt .= "- NO repitas preguntas si ya tienes la información\n";
        $prompt .= "- Avanza en el flujo comercial según los datos que tengas\n";
        $prompt .= "- Una sola pregunta por mensaje\n";
        if ($hasName) {
            $prompt .= "- El usuario se llama {$userName}\n";
        }
        $prompt .= "- Si tienes nombre, email y empresa, ofrece servicios concretos\n\n";
        $prompt .= "Responde como Gaby:";
        
        return $this->callGeminiAPI($prompt);
    }
    
    // NUEVA FUNCIÓN: Respuesta casual
    private function generateCasualResponse($userMessage, $contextInfo, $history) {
        $hasName = $this->conversationState['has_user_name'];
        $userName = $hasName ? $this->conversationState['user_name'] : '';
        $isFirstMessage = $this->conversationState['is_first_message'];
        $conversationContext = $this->buildConversationContext($history);
        
        // PRIORIDAD: Si no tiene nombre, preguntarlo
        if (!$hasName && !$isFirstMessage && $this->shouldAskForName($userMessage, $history)) {
            return $this->generateNameRequest($userMessage);
        }
        
        $prompt = "Eres Gaby de Agente RAG. Usa PUENTES CONTEXTUALES para conversación natural.\n\n";
        
        if ($isFirstMessage) {
            $prompt .= "PRIMERA VEZ: Saluda amigablemente con variedad.\n";
        } else {
            $prompt .= "CONVERSACIÓN:\n{$conversationContext}\n\n";
        }
        
        $prompt .= "MENSAJE: {$userMessage}\n\n";
        $prompt .= "PUENTES CONTEXTUALES NATURALES - Varía completamente:\n";
        $prompt .= "- Afirmativos: '¡Perfecto!', '¡Genial!', '¡Excelente!', 'Me parece bien...'\n";
        $prompt .= "- Comprensivos: 'Entiendo...', 'Claro...', 'Por supuesto...', 'Sí, sí...'\n";
        $prompt .= "- Amigables: '¡Qué bueno!', 'Me alegra...', 'Perfecto entonces...', 'Listo...'\n";
        $prompt .= "- Directos: 'Vale...', 'Bien...', 'Okay...', 'Entendido...'\n\n";
        $prompt .= "INSTRUCCIONES:\n";
        $prompt .= "- Usa puentes contextuales naturales\n";
        $prompt .= "- NO repitas 'Hola Gaby de Agente RAG'\n";
        $prompt .= "- Varía completamente tu forma de responder\n";
        if ($hasName) {
            $prompt .= "- Su nombre es {$userName}\n";
        }
        $prompt .= "- Máximo 30 palabras\n\n";
        $prompt .= "Responde como Gaby:";
        
        return $this->callGeminiAPI($prompt);
    }
    
    // NUEVA FUNCIÓN: Determinar si debe preguntar el nombre
    private function shouldAskForName($message, $history) {
        // No preguntar si ya preguntó recientemente
        $recentMessages = array_slice($history, -3);
        foreach ($recentMessages as $msg) {
            if ($msg['role'] === 'assistant' && 
                (strpos($msg['content'], 'nombre') !== false || 
                 strpos($msg['content'], 'llamas') !== false)) {
                return false;
            }
        }
        
        // Preguntar después de 2-3 intercambios
        return count($history) >= 4;
    }
    
    // NUEVA FUNCIÓN: Generar solicitud de nombre
    private function generateNameRequest($userMessage) {
        $requests = [
            "Por cierto, ¿cómo te llamas? Me gusta personalizar la conversación 😊",
            "¡Perfecto! Y dime, ¿cuál es tu nombre?",
            "Genial. ¿Me podrías decir tu nombre para conocerte mejor?",
            "Excelente. ¿Cómo te puedo llamar?"
        ];
        
        return $requests[array_rand($requests)];
    }
    
    private function getGabyPersonalityPrompt() {
        return "Eres Gaby, ejecutiva de atención al cliente de Agente RAG. Tu personalidad:

CARACTERÍSTICAS:
- Mujer, amigable y profesional
- Especializada en automatización y ahorro de costos empresariales
- Usas emojis moderadamente (1-2 por párrafo, solo en primeros 4 mensajes)
- Lenguaje fluido y humanizado
- Una pregunta por mensaje
- USA EL NOMBRE DEL CLIENTE DE FORMA NATURAL: solo cuando sea apropiado (saludos, despedidas, o para enfatizar), NO en cada mensaje
- Nombres de clientes en **negritas** cuando los uses

FLUJO DE CONVERSACIÓN:
1. SALUDO INICIAL (elige según contexto):
   - Si conoces el nombre: \"Hola **[Nombre]** 😊 ¿cómo estás?, ¿en qué te puedo ayudar hoy?\"
   - Si no conoces el nombre: \"Hola soy **Gaby**, ejecutiva de atención al cliente de Agente RAG, ¿cuál es tu nombre?\"
   - Si pregunta directa sin saludo: \"Hola soy **Gaby** ☺️, ejecutiva de atención al cliente en Agente RAG, dame un segundo revisaré en las bases vectoriales, por cierto... ¿cómo te llamas? 🤔\"

2. CONVERSACIÓN NATURAL:
   - Después del saludo inicial, NO uses el nombre en cada mensaje
   - Habla de forma natural como una persona real
   - Solo usa el nombre ocasionalmente para enfatizar o en momentos importantes

2. SERVICIOS PRINCIPALES:
   - Diagnóstico Gratuito con informe por correo
   - Agendar Reunión Comercial B2B
   - Resolver Dudas sobre IA y RAG
   - Consultar blogs y artículos publicados
   - Proporcionar estadísticas del contenido

3. RECOPILACIÓN DE DATOS (para diagnóstico):
   - Nombre completo y correo (obligatorio)
   - Empresa y rubro
   - Número de clientes mensuales
   - Teléfono de contacto
   - Proceso a automatizar

REGLAS:
- NO uses símbolos ¿¡\"\" al inicio de frases
- Respeta el flujo: una pregunta por mensaje
- Interpreta emojis del cliente
- Mantén conversación rápida y directa";
    }
    
    private function callGeminiAPI($prompt) {
        $url = rtrim($this->ollamaUrl, '/') . '/api/generate';
        
        $data = [
            'model' => $this->ollamaModel,
            'prompt' => $prompt,
            'stream' => false,
            'options' => [
                'temperature' => 0.7,
                'top_k' => 40,
                'top_p' => 0.95,
                'num_predict' => 1024
            ]
        ];
        
        // CONFIGURACIÓN MEJORADA CON MÁS TIEMPO Y REINTENTOS
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode($data),
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json',
                'Content-Length: ' . strlen(json_encode($data))
            ],
            CURLOPT_TIMEOUT => 90, // 90 segundos para Ollama
            CURLOPT_CONNECTTIMEOUT => 10, // 10 segundos para conectar
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_MAXREDIRS => 3
        ]);
        
        // SISTEMA DE REINTENTOS CON DETECCIÓN DE ERRORES ESPECÍFICOS
        $maxRetries = 2;
        $retryCount = 0;
        $lastError = null;
        $lastHttpCode = null;
        
        while ($retryCount <= $maxRetries) {
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $curlError = curl_error($ch);
            
            // Guardar información del último error
            $lastError = $curlError;
            $lastHttpCode = $httpCode;
            
            // Si la respuesta es exitosa, procesarla
            if ($response !== false && $httpCode === 200) {
                curl_close($ch);
                
                $result = json_decode($response, true);
                
                if (isset($result['response'])) {
                    return $result['response'];
                }
                
                // Si el JSON es válido pero no tiene contenido
                error_log("Gemini API respuesta sin contenido: " . $response);
                curl_close($ch);
                return $this->generateSpecificFallback('json_error', $response);
            }
            
            // Log del error para debugging
            error_log("Gemini API intento {$retryCount}: HTTP {$httpCode}, Error: {$curlError}");
            
            $retryCount++;
            
            // Esperar antes del siguiente intento (backoff exponencial)
            if ($retryCount <= $maxRetries) {
                sleep($retryCount * 2); // 2, 4 segundos
            }
        }
        
        curl_close($ch);
        
        // Determinar tipo de error y generar fallback específico
        if (strpos($lastError, 'timeout') !== false || $lastHttpCode === 0) {
            return $this->generateSpecificFallback('timeout', $lastError);
        } elseif ($lastHttpCode >= 500) {
            return $this->generateSpecificFallback('server_error', "HTTP {$lastHttpCode}");
        } elseif ($lastHttpCode >= 400) {
            return $this->generateSpecificFallback('client_error', "HTTP {$lastHttpCode}");
        } else {
            return $this->generateSpecificFallback('unknown_error', $lastError);
        }
    }
    
    private function generateSpecificFallback($errorType, $errorDetails) {
        $hasName = $this->conversationState['has_user_name'];
        $userName = $hasName ? $this->conversationState['user_name'] : '';
        $namePrefix = $hasName ? "{$userName}, " : "";
        
        switch ($errorType) {
            case 'timeout':
                $responses = [
                    "{$namePrefix}se ha perdido la conectividad con nuestra base de datos, lo siento. ¿Podemos continuar en otro momento?",
                    "{$namePrefix}parece que hay problemas de conexión con nuestros servidores. Te pido disculpas, ¿podemos retomar la conversación más tarde?",
                    "{$namePrefix}estoy teniendo dificultades para conectarme con la base de datos. ¿Te parece si continuamos en unos minutos?"
                ];
                break;
                
            case 'json_error':
            case 'server_error':
            case 'client_error':
                $responses = [
                    "{$namePrefix}he detectado errores con el código interno. Voy a notificar a nuestro servicio técnico para que lo solucione. ¿Podemos continuar nuestra conversación en otro momento?",
                    "{$namePrefix}hay un problema técnico en nuestro sistema. Ya he alertado al equipo de desarrollo. ¿Te parece si retomamos la conversación más tarde?",
                    "{$namePrefix}se ha presentado una falla en el sistema interno. Nuestro equipo técnico ya está trabajando en solucionarlo. ¿Podemos continuar después?"
                ];
                break;
                
            case 'unknown_error':
            default:
                $responses = [
                    "{$namePrefix}estoy experimentando dificultades técnicas inesperadas. ¿Podríamos intentar continuar en unos minutos?",
                    "{$namePrefix}algo no está funcionando correctamente en mi sistema. ¿Te parece si retomamos la conversación pronto?"
                ];
                break;
        }
        
        // Log del error específico para el equipo técnico
        error_log("Gaby Fallback - Tipo: {$errorType}, Usuario: {$userName}, Error: {$errorDetails}");
        
        return $responses[array_rand($responses)];
    }
    
    // Mantener fallback genérico para casos especiales
    private function generateFallbackResponse() {
        if ($this->conversationState['is_first_message']) {
            $responses = [
                "Hola soy **Gaby** 😊, ejecutiva de atención al cliente de Agente RAG. ¿En qué puedo ayudarte hoy?",
                "¡Hola! Soy **Gaby** de Agente RAG. Puedo ayudarte con automatización y ahorro de costos. ¿Cuál es tu nombre?",
                "Hola 👋 Soy **Gaby**. Te ayudo con soluciones de IA para tu empresa. ¿Cómo te llamas?"
            ];
            return $responses[array_rand($responses)];
        }
        
        return $this->generateSpecificFallback('unknown_error', 'Fallback genérico');
    }
    
    // NUEVA FUNCIÓN: Transformar negritas a HTML
    private function transformBoldToHtml($text) {
        // Transformar **texto** a <strong>texto</strong>
        $text = preg_replace('/\*\*([^*]+)\*\*/', '<strong>$1</strong>', $text);
        return $text;
    }
    
    // Métodos auxiliares
    private function extractUserName($history) {
        foreach ($history as $msg) {
            if ($msg['role'] === 'user') {
                $content = $msg['content'];
                
                // Patrón 1: "soy [nombre]", "me llamo [nombre]", "mi nombre es [nombre]"
                if (preg_match('/(?:soy|me llamo|mi nombre es|nombre es:?)\s+([a-záéíóúñü\s]+)/i', $content, $matches)) {
                    $name = trim($matches[1]);
                    if (strlen($name) > 2 && !preg_match('/^(si|no|ok|bien|mal|hola)$/i', $name)) {
                        return $name;
                    }
                }
                
                // Patrón 2: "Hola soy [nombre]"
                if (preg_match('/^(hola|buenos días|buenas tardes)\s+soy\s+([a-záéíóúñü\s]+)/i', $content, $matches)) {
                    return trim($matches[2]);
                }
                
                // Patrón 3: Detectar cuando Gaby ya usó el nombre en respuestas anteriores
                foreach ($history as $botMsg) {
                    if ($botMsg['role'] === 'assistant' && preg_match('/Hola\s+\*\*([a-záéíóúñü\s]+)\*\*/i', $botMsg['content'], $matches)) {
                        return trim($matches[1]);
                    }
                }
            }
        }
        return null;
    }
    
    private function isQuestion($message) {
        $questionWords = ['qué', 'quién', 'cómo', 'cuándo', 'dónde', 'por qué', 'cuál', 'cuánto'];
        $message = strtolower($message);
        
        foreach ($questionWords as $word) {
            if (strpos($message, $word) === 0) {
                return true;
            }
        }
        
        return strpos($message, '?') !== false;
    }
    
    private function saveMessage($sessionId, $role, $content) {
        $stmt = $this->db->prepare("
            INSERT INTO rag_conversations (session_id, role, content, created_at) 
            VALUES (?, ?, ?, NOW())
        ");
        $stmt->execute([$sessionId, $role, $content]);
    }
    
    private function getConversationHistory($sessionId, $limit = 50) {
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
        $queryLower = strtolower($query);
        
        // Detectar consultas sobre blogs específicos por ID
        if (preg_match('/blog\s+(?:id|número|numero)?\s*(\d+)/i', $query, $matches)) {
            $blogId = $matches[1];
            $blog = $this->getBlogById($blogId);
            if ($blog) {
                return [$blog];
            }
        }
        

        
        // Detectar URLs en la consulta y hacer scraping
        $urls = $this->extractUrls($query);
        if (!empty($urls)) {
            $scrapingResults = [];
            foreach ($urls as $url) {
                $scrapedData = $this->scrapWebsiteWithCache($url);
                if ($scrapedData) {
                    $scrapingResults[] = $scrapedData;
                }
            }
            if (!empty($scrapingResults)) {
                return $scrapingResults;
            }
        }
        
        // Priorizar búsqueda FAQ si es una pregunta
        if ($this->isQuestion($query)) {
            $faqResults = $this->searchFAQ($query);
            if (!empty($faqResults)) {
                return $faqResults;
            }
        }
        
        // Búsqueda general en base de conocimientos
        $stmt = $this->db->prepare("
            SELECT title, content, category, relevance_score, 'knowledge_base' as source
            FROM rag_knowledge_base 
            WHERE MATCH(title, content, keywords) AGAINST(? IN NATURAL LANGUAGE MODE)
            OR title LIKE ? OR content LIKE ? OR keywords LIKE ?
            ORDER BY 
                CASE WHEN category LIKE 'faq-%' THEN 1 ELSE 2 END,
                relevance_score DESC, 
                created_at DESC
            LIMIT 5
        ");
        
        $searchTerm = "%{$query}%";
        $stmt->execute([$query, $searchTerm, $searchTerm, $searchTerm]);
        $relevantInfo = $stmt->fetchAll();
        
        return $relevantInfo;
    }
    
    private function isBlogQuery($query) {
        $blogKeywords = ['blog', 'artículo', 'post', 'contenido', 'publicación', 'escribir', 'redactar', 'leer'];
        $queryLower = strtolower($query);
        
        foreach ($blogKeywords as $keyword) {
            if (strpos($queryLower, $keyword) !== false) {
                return true;
            }
        }
        
        return false;
    }
    
    private function getBlogById($blogId) {
        try {
            // Usar el archivo obtener-completo-blog.php que ya está optimizado
            $apiUrl = 'https://agenterag.com/php-apis/obtener-completo-blog.php?id=' . urlencode($blogId);
            
            $ch = curl_init($apiUrl);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 10);
            
            $response = curl_exec($ch);
            $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            
            if ($httpcode === 200) {
                $result = json_decode($response, true);
                if (isset($result['success']) && $result['success'] && isset($result['blog'])) {
                    $blog = $result['blog'];
                    
                    return [
                        'title' => $blog['titulo'],
                        'content' => $blog['contenido'],
                        'category' => 'blog',
                        'relevance_score' => 5.0,
                        'source' => 'blog_system',
                        'fecha' => $blog['fecha_publicacion'],
                        'vistas' => $blog['vistas'] ?? 0,
                        'likes' => $blog['likes'] ?? 0,
                        'id' => $blog['id'] ?? null
                    ];
                }
            }
        } catch (Exception $e) {
            error_log('Error obteniendo blog completo: ' . $e->getMessage());
        }
        
        return null;
    }
    
    private function isStatsQuery($query) {
        $statsKeywords = ['estadística', 'cuántos', 'cantidad', 'número', 'total', 'métricas', 'datos'];
        $queryLower = strtolower($query);
        
        foreach ($statsKeywords as $keyword) {
            if (strpos($queryLower, $keyword) !== false) {
                return true;
            }
        }
        
        return false;
    }
    

    

    
    private function searchFAQ($query) {
        $queryLower = strtolower($query);
        
        // Palabras clave específicas para FAQ
        $faqKeywords = [
            'agente rag' => 'faq-agente-rag',
            'chatbot' => 'faq-chatbots', 
            'automatizar' => 'faq-automatizacion',
            'costos' => 'faq-costos',
            'roi' => 'faq-roi',
            'integrar' => 'faq-integracion',
            'beneficios' => 'faq-beneficios',
            'atencion cliente' => 'faq-atencion-cliente'
        ];
        
        $categoryFilter = null;
        foreach ($faqKeywords as $keyword => $category) {
            if (strpos($queryLower, $keyword) !== false) {
                $categoryFilter = $category;
                break;
            }
        }
        
        $sql = "
            SELECT title, content, category, relevance_score, 'faq' as source
            FROM rag_knowledge_base 
            WHERE category LIKE 'faq-%'
        ";
        
        $params = [];
        
        if ($categoryFilter) {
            $sql .= " AND category = ?";
            $params[] = $categoryFilter;
        }
        
        $sql .= "
            AND (MATCH(title, content, keywords) AGAINST(? IN NATURAL LANGUAGE MODE)
            OR title LIKE ? OR content LIKE ?)
            ORDER BY relevance_score DESC
            LIMIT 3
        ";
        
        $searchTerm = "%{$query}%";
        $params = array_merge($params, [$query, $searchTerm, $searchTerm]);
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        
        return $stmt->fetchAll();
    }
    
    private function buildContext($relevantInfo) {
        if (empty($relevantInfo)) {
            return "No se encontró información específica en la base de conocimientos.";
        }
        
        $context = "Información relevante encontrada:\n\n";
        foreach ($relevantInfo as $info) {
            $isFAQ = strpos($info['category'], 'faq-') === 0;
            $isBlog = $info['category'] === 'blog';
            $isStats = $info['category'] === 'blog_stats';
            
            $prefix = '';
            if ($isFAQ) $prefix = '[FAQ] ';
            elseif ($isBlog) $prefix = '[BLOG] ';
            elseif ($isStats) $prefix = '[ESTADÍSTICAS] ';
            
            $context .= "{$prefix}**{$info['title']}**\n";
            $context .= $info['content'];
            
            // Agregar metadatos para blogs
            if ($isBlog && isset($info['fecha'], $info['vistas'], $info['likes'])) {
                $context .= "\n📅 Fecha: {$info['fecha']} | 👁️ Vistas: {$info['vistas']} | ❤️ Likes: {$info['likes']}";
            }
            
            $context .= "\n\n";
        }
        
        return $context;
    }
    
    private function buildConversationContext($history) {
        if (empty($history)) {
            return "Esta es una nueva conversación.";
        }
        
        $context = "Mensajes anteriores:\n";
        foreach (array_slice($history, -10) as $msg) {
            $role = $msg['role'] === 'user' ? 'Usuario' : 'Gaby';
            $content = substr($msg['content'], 0, 150);
            $context .= "{$role}: {$content}\n";
        }
        
        return $context;
    }
    
    private function buildClientDataSummary($clientData) {
        if (empty($clientData)) {
            return "- No se han recopilado datos aún";
        }
        
        $summary = [];
        if (!empty($clientData['name'])) $summary[] = "- Nombre: {$clientData['name']}";
        if (!empty($clientData['email'])) $summary[] = "- Email: {$clientData['email']}";
        if (!empty($clientData['phone'])) $summary[] = "- Teléfono: {$clientData['phone']}";
        if (!empty($clientData['company'])) $summary[] = "- Empresa: {$clientData['company']}";
        if (!empty($clientData['industry'])) $summary[] = "- Rubro: {$clientData['industry']}";
        if (!empty($clientData['monthly_clients'])) $summary[] = "- Clientes mensuales: {$clientData['monthly_clients']}";
        if (!empty($clientData['process_to_automate'])) $summary[] = "- Proceso a automatizar: Ya mencionado";
        
        return empty($summary) ? "- No se han recopilado datos aún" : implode("\n", $summary);
    }
    
    private function buildToolContext($toolResults) {
        if (empty($toolResults)) {
            return "No se ejecutaron herramientas.";
        }
        
        $context = "Resultados de herramientas:\n";
        foreach ($toolResults as $tool => $result) {
            $context .= "- {$tool}: {$result['message']}\n";
        }
        
        return $context;
    }
    
    private function autoSaveContact($sessionId, $history) {
        $clientData = $this->extractClientDataFromHistory($history);
        
        // Solo guardar si tenemos al menos nombre y email
        if (empty($clientData['name']) || empty($clientData['email'])) {
            return;
        }
        
        try {
            // Verificar si ya existe el contacto
            $stmt = $this->db->prepare("
                SELECT id FROM gaby_contacts 
                WHERE email = ? OR (name = ? AND phone = ?)
                LIMIT 1
            ");
            $stmt->execute([
                $clientData['email'],
                $clientData['name'],
                $clientData['phone'] ?? ''
            ]);
            
            $existingContact = $stmt->fetch();
            
            if ($existingContact) {
                // Actualizar contacto existente
                $this->updateExistingContact($existingContact['id'], $clientData, $sessionId);
            } else {
                // Crear nuevo contacto
                $this->createNewContact($clientData, $sessionId);
            }
            
        } catch (Exception $e) {
            error_log("Error auto-guardando contacto: " . $e->getMessage());
        }
    }
    
    private function createNewContact($clientData, $sessionId) {
        $contactId = 'contact_' . uniqid();
        
        $stmt = $this->db->prepare("
            INSERT INTO gaby_contacts 
            (id, name, email, phone, company, industry, monthly_clients, requirements, status, created_at, session_id) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW(), ?)
        ");
        
        $stmt->execute([
            $contactId,
            $clientData['name'],
            $clientData['email'],
            $clientData['phone'] ?? null,
            $clientData['company'] ?? null,
            $clientData['industry'] ?? null,
            $clientData['monthly_clients'] ?? null,
            $clientData['process_to_automate'] ?? null,
            $sessionId
        ]);
        
        error_log("Nuevo contacto creado: {$clientData['name']} - {$clientData['email']}");
    }
    
    private function updateExistingContact($contactId, $clientData, $sessionId) {
        $fields = [];
        $values = [];
        
        // Solo actualizar campos que tienen valor
        if (!empty($clientData['phone'])) {
            $fields[] = "phone = ?";
            $values[] = $clientData['phone'];
        }
        if (!empty($clientData['company'])) {
            $fields[] = "company = ?";
            $values[] = $clientData['company'];
        }
        if (!empty($clientData['industry'])) {
            $fields[] = "industry = ?";
            $values[] = $clientData['industry'];
        }
        if (!empty($clientData['monthly_clients'])) {
            $fields[] = "monthly_clients = ?";
            $values[] = $clientData['monthly_clients'];
        }
        if (!empty($clientData['process_to_automate'])) {
            $fields[] = "requirements = ?";
            $values[] = $clientData['process_to_automate'];
        }
        
        if (!empty($fields)) {
            $fields[] = "updated_at = NOW()";
            $fields[] = "session_id = ?";
            $values[] = $sessionId;
            $values[] = $contactId;
            
            $stmt = $this->db->prepare("
                UPDATE gaby_contacts 
                SET " . implode(', ', $fields) . "
                WHERE id = ?
            ");
            
            $stmt->execute($values);
            error_log("Contacto actualizado: ID {$contactId}");
        }
    }
    
    // === FUNCIONES DE WEB SCRAPING CON CACHÉ ===
    
    private function extractUrls($text) {
        $pattern = '/https?:\/\/[^\s<>"\[\]{}|\\^`]+/i';
        preg_match_all($pattern, $text, $matches);
        return array_unique($matches[0]);
    }
    
    private function scrapWebsiteWithCache($url) {
        $urlHash = hash('sha256', $url);
        
        // Verificar caché primero
        $cached = $this->getCachedScraping($urlHash);
        if ($cached) {
            return [
                'title' => $cached['title'] ?: 'Información de la web',
                'content' => $cached['content'],
                'category' => 'web_scraping',
                'relevance_score' => 4.0,
                'source' => 'web_cache',
                'url' => $url,
                'scraped_at' => $cached['scraped_at']
            ];
        }
        
        // Si no está en caché, hacer scraping
        $scrapedData = $this->performWebScraping($url);
        
        if ($scrapedData) {
            // Guardar en caché
            $this->saveScrapeToCache($url, $urlHash, $scrapedData);
            
            return [
                'title' => $scrapedData['title'] ?: 'Información de la web',
                'content' => $scrapedData['content'],
                'category' => 'web_scraping',
                'relevance_score' => 4.0,
                'source' => 'web_fresh',
                'url' => $url,
                'scraped_at' => date('Y-m-d H:i:s')
            ];
        }
        
        return null;
    }
    
    private function getCachedScraping($urlHash) {
        $stmt = $this->db->prepare("
            SELECT title, content, scraped_at 
            FROM web_scraping_cache 
            WHERE url_hash = ? 
            AND status = 'success' 
            AND expires_at > NOW()
            LIMIT 1
        ");
        $stmt->execute([$urlHash]);
        return $stmt->fetch();
    }
    
    private function performWebScraping($url) {
        try {
            // Configurar cURL con headers realistas
            $ch = curl_init();
            curl_setopt_array($ch, [
                CURLOPT_URL => $url,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_FOLLOWLOCATION => true,
                CURLOPT_TIMEOUT => 15,
                CURLOPT_CONNECTTIMEOUT => 5,
                CURLOPT_MAXREDIRS => 3,
                CURLOPT_USERAGENT => 'Mozilla/5.0 (compatible; GabyBot/1.0; +https://agenterag.com)',
                CURLOPT_HTTPHEADER => [
                    'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language: es-ES,es;q=0.8,en;q=0.6',
                    'Accept-Encoding: gzip, deflate',
                    'Cache-Control: no-cache'
                ],
                CURLOPT_ENCODING => 'gzip,deflate',
                CURLOPT_SSL_VERIFYPEER => false,
                CURLOPT_SSL_VERIFYHOST => false
            ]);
            
            $html = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            
            if ($html === false || $httpCode !== 200) {
                throw new Exception("HTTP Error: {$httpCode}");
            }
            
            return $this->parseHtmlContent($html, $url);
            
        } catch (Exception $e) {
            error_log("Error scraping {$url}: " . $e->getMessage());
            return null;
        }
    }
    
    private function parseHtmlContent($html, $url) {
        $dom = new DOMDocument();
        @$dom->loadHTML(mb_convert_encoding($html, 'HTML-ENTITIES', 'UTF-8'));
        $xpath = new DOMXPath($dom);
        
        // Extraer título
        $titleNodes = $xpath->query('//title');
        $title = $titleNodes->length > 0 ? trim($titleNodes->item(0)->textContent) : '';
        
        // Extraer meta description
        $metaNodes = $xpath->query('//meta[@name="description"]/@content');
        $metaDescription = $metaNodes->length > 0 ? trim($metaNodes->item(0)->textContent) : '';
        
        // Extraer contenido principal
        $content = '';
        
        // Priorizar contenido estructurado
        $contentSelectors = [
            '//main//p | //main//h1 | //main//h2 | //main//h3',
            '//article//p | //article//h1 | //article//h2 | //article//h3',
            '//div[@class*="content"]//p | //div[@class*="content"]//h1 | //div[@class*="content"]//h2',
            '//section//p | //section//h1 | //section//h2 | //section//h3',
            '//p | //h1 | //h2 | //h3'
        ];
        
        foreach ($contentSelectors as $selector) {
            $nodes = $xpath->query($selector);
            if ($nodes->length > 0) {
                foreach ($nodes as $node) {
                    $text = trim($node->textContent);
                    if (strlen($text) > 20) { // Solo textos significativos
                        $content .= $text . "\n\n";
                    }
                }
                break; // Usar el primer selector que encuentre contenido
            }
        }
        
        // Limpiar y optimizar contenido
        $content = $this->cleanScrapedContent($content);
        
        // Extraer keywords del contenido
        $keywords = $this->extractKeywords($title . ' ' . $metaDescription . ' ' . $content);
        
        return [
            'title' => $title,
            'content' => $content,
            'meta_description' => $metaDescription,
            'keywords' => implode(', ', $keywords),
            'url' => $url
        ];
    }
    
    private function cleanScrapedContent($content) {
        // Remover múltiples espacios y saltos de línea
        $content = preg_replace('/\s+/', ' ', $content);
        $content = preg_replace('/\n\s*\n/', "\n\n", $content);
        
        // Remover contenido común no deseado
        $unwantedPatterns = [
            '/cookies?\s+polícy/i',
            '/política\s+de\s+privacidad/i',
            '/términos\s+y\s+condiciones/i',
            '/suscríbete\s+a\s+nuestro/i',
            '/todos\s+los\s+derechos\s+reservados/i'
        ];
        
        foreach ($unwantedPatterns as $pattern) {
            $content = preg_replace($pattern, '', $content);
        }
        
        // Limitar longitud para optimizar
        return substr(trim($content), 0, 2000);
    }
    
    private function extractKeywords($text) {
        $text = strtolower($text);
        $words = preg_split('/\W+/', $text);
        
        // Filtrar palabras relevantes
        $keywords = [];
        $stopWords = ['el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'es', 'se', 'no', 'te', 'lo', 'le', 'da', 'su', 'por', 'son', 'con', 'para', 'al', 'del', 'los', 'las', 'una', 'como', 'pero', 'sus', 'han', 'muy', 'sin', 'sobre', 'ser', 'todo', 'esta', 'hasta', 'fue', 'puede', 'si', 'ya', 'entre'];
        
        foreach ($words as $word) {
            if (strlen($word) > 3 && !in_array($word, $stopWords)) {
                $keywords[] = $word;
            }
        }
        
        // Retornar las 10 palabras más frecuentes
        $wordCount = array_count_values($keywords);
        arsort($wordCount);
        return array_slice(array_keys($wordCount), 0, 10);
    }
    
    private function saveScrapeToCache($url, $urlHash, $data) {
        try {
            $stmt = $this->db->prepare("
                INSERT INTO web_scraping_cache 
                (url, url_hash, title, content, meta_description, keywords, scraped_at, expires_at, status) 
                VALUES (?, ?, ?, ?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 24 HOUR), 'success')
                ON DUPLICATE KEY UPDATE
                title = VALUES(title),
                content = VALUES(content),
                meta_description = VALUES(meta_description),
                keywords = VALUES(keywords),
                scraped_at = NOW(),
                expires_at = DATE_ADD(NOW(), INTERVAL 24 HOUR),
                status = 'success'
            ");
            
            $stmt->execute([
                $url,
                $urlHash,
                $data['title'],
                $data['content'],
                $data['meta_description'],
                $data['keywords']
            ]);
            
        } catch (Exception $e) {
            error_log("Error guardando scraping en caché: " . $e->getMessage());
        }
    }
}
?>