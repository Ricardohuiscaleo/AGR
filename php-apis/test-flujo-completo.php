<?php
/**
 * Script para simular un flujo completo de conversación con debug detallado
 */

// Habilitar la visualización de errores
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Configurar cabeceras para JSON
header('Content-Type: application/json');

echo "=== INICIANDO SIMULACIÓN DE FLUJO COMPLETO ===\n\n";

try {
    // 1. CARGAR CONFIGURACIÓN
    echo "PASO 1: Cargando configuración...\n";
    $config_path = __DIR__ . '/../../config.php'; 
    
    if (!file_exists($config_path)) {
        throw new Exception("config.php no existe en: {$config_path}");
    }
    
    $config = require $config_path;
    echo "✅ Configuración cargada correctamente\n";
    
    // 2. DEFINIR VARIABLES GLOBALES
    echo "\nPASO 2: Definiendo variables globales...\n";
    $SUPABASE_URL = $config['PUBLIC_SUPABASE_URL'];
    $SUPABASE_ANON_KEY = $config['PUBLIC_SUPABASE_ANON_KEY'];
    $GEMINI_API_KEY = $config['gemini_api_key'] ?? '';
    $DB_CONFIG = [
        'host' => $config['rag_db_host'] ?? 'localhost',
        'database' => $config['rag_db_name'] ?? 'agenterag',
        'username' => $config['rag_db_user'] ?? 'root',
        'password' => $config['rag_db_pass'] ?? ''
    ];
    
    echo "✅ Variables globales definidas\n";
    echo "- SUPABASE_URL: " . substr($SUPABASE_URL, 0, 20) . "...\n";
    echo "- GEMINI_API_KEY: " . (empty($GEMINI_API_KEY) ? "NO CONFIGURADO" : "CONFIGURADO") . "\n";
    echo "- DB_HOST: {$DB_CONFIG['host']}\n";
    echo "- DB_NAME: {$DB_CONFIG['database']}\n";
    
    // 3. CARGAR GABY-TOOLS-FIXED.PHP
    echo "\nPASO 3: Cargando gaby-tools-fixed.php...\n";
    require_once 'gaby-tools-fixed.php';
    echo "✅ gaby-tools-fixed.php cargado correctamente\n";
    
    // 4. DEFINIR FUNCIÓN GENERATESESSIONID
    echo "\nPASO 4: Definiendo función generateSessionId...\n";
    function generateSessionId() {
        return bin2hex(random_bytes(16));
    }
    echo "✅ Función generateSessionId definida\n";
    
    // 5. CREAR CLASE GABYAGENT SIMPLIFICADA PARA DEBUG
    echo "\nPASO 5: Definiendo clase GabyAgent para debug...\n";
    
    class GabyAgentDebug {
        private $db;
        private $geminiApiKey;
        private $supabaseUrl;
        private $supabaseKey;
        private $tools;
        private $conversationState;
        
        public function __construct() {
            global $DB_CONFIG, $GEMINI_API_KEY, $SUPABASE_URL, $SUPABASE_ANON_KEY;
            echo "  - Inicializando GabyAgent...\n";
            
            $this->geminiApiKey = $GEMINI_API_KEY;
            $this->supabaseUrl = $SUPABASE_URL;
            $this->supabaseKey = $SUPABASE_ANON_KEY;
            
            echo "  - Creando instancia de GabyTools...\n";
            $this->tools = new GabyTools();
            echo "  - ✅ GabyTools creado\n";
            
            echo "  - Inicializando base de datos...\n";
            $this->initDatabase();
            echo "  - ✅ Base de datos inicializada\n";
        }
        
        private function initDatabase() {
            global $DB_CONFIG;
            $this->db = new PDO(
                "mysql:host={$DB_CONFIG['host']};dbname={$DB_CONFIG['database']};charset=utf8mb4",
                $DB_CONFIG['username'],
                $DB_CONFIG['password'],
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
                ]
            );
        }
        
        public function processMessage($message, $sessionId) {
            echo "\n--- PROCESANDO MENSAJE ---\n";
            echo "Mensaje: {$message}\n";
            echo "Session ID: {$sessionId}\n";
            
            // 1. Guardar mensaje del usuario
            echo "1. Guardando mensaje del usuario...\n";
            $this->saveMessage($sessionId, 'user', $message);
            echo "✅ Mensaje guardado\n";
            
            // 2. Obtener historial de conversación
            echo "2. Obteniendo historial de conversación...\n";
            $conversationHistory = $this->getConversationHistory($sessionId);
            echo "✅ Historial obtenido: " . count($conversationHistory) . " mensajes\n";
            
            // 3. Analizar estado de conversación
            echo "3. Analizando estado de conversación...\n";
            $this->conversationState = $this->analyzeConversationState($conversationHistory, $message);
            echo "✅ Estado analizado: {$this->conversationState['conversation_stage']}\n";
            
            // 4. Buscar información relevante (RAG)
            echo "4. Buscando información relevante...\n";
            $relevantInfo = $this->retrieveRelevantInfo($message);
            echo "✅ Información encontrada: " . count($relevantInfo) . " elementos\n";
            
            if (!empty($relevantInfo)) {
                foreach ($relevantInfo as $info) {
                    echo "  - {$info['title']}: " . substr($info['content'], 0, 50) . "...\n";
                }
            }
            
            // 5. Generar respuesta
            echo "5. Generando respuesta con Gemini...\n";
            $startTime = microtime(true);
            $response = $this->generateGabyResponse($message, $conversationHistory, $relevantInfo);
            $endTime = microtime(true);
            $generationTime = ($endTime - $startTime) * 1000;
            echo "✅ Respuesta generada en {$generationTime}ms\n";
            
            // 6. Guardar respuesta
            echo "6. Guardando respuesta...\n";
            $this->saveMessage($sessionId, 'assistant', $response);
            echo "✅ Respuesta guardada\n";
            
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
        
        private function analyzeConversationState($history, $currentMessage) {
            $messageCount = count($history);
            $hasName = $this->extractUserName($history);
            $isQuestion = $this->isQuestion($currentMessage);
            
            return [
                'message_count' => $messageCount,
                'is_first_message' => $messageCount <= 2,
                'has_user_name' => !empty($hasName),
                'user_name' => $hasName,
                'is_question' => $isQuestion,
                'conversation_stage' => $this->determineConversationStage($history, $hasName),
                'gaby_introduced' => false
            ];
        }
        
        private function determineConversationStage($history, $hasName) {
            if (empty($history)) return 'greeting';
            if (empty($hasName)) return 'name_collection';
            return 'service_selection';
        }
        
        private function extractUserName($history) {
            foreach ($history as $msg) {
                if ($msg['role'] === 'user') {
                    $content = $msg['content'];
                    if (preg_match('/(?:soy|me llamo|mi nombre es)\s+([a-záéíóúñü\s]+)/i', $content, $matches)) {
                        $name = trim($matches[1]);
                        if (strlen($name) > 2) {
                            return $name;
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
        
        private function retrieveRelevantInfo($query) {
            echo "  - Detectando tipo de consulta...\n";
            
            // Detectar consultas sobre blogs o estadísticas
            if ($this->isBlogQuery($query)) {
                echo "  - Es consulta sobre blogs\n";
                return $this->searchBlogs($query);
            }
            
            if ($this->isStatsQuery($query)) {
                echo "  - Es consulta sobre estadísticas\n";
                return $this->getBlogStats();
            }
            
            echo "  - Consulta general\n";
            return [];
        }
        
        private function isBlogQuery($query) {
            $blogKeywords = ['blog', 'artículo', 'post', 'contenido', 'publicación'];
            $queryLower = strtolower($query);
            
            foreach ($blogKeywords as $keyword) {
                if (strpos($queryLower, $keyword) !== false) {
                    return true;
                }
            }
            
            return false;
        }
        
        private function isStatsQuery($query) {
            $statsKeywords = ['estadística', 'cuántos', 'cantidad', 'número', 'total'];
            $queryLower = strtolower($query);
            
            foreach ($statsKeywords as $keyword) {
                if (strpos($queryLower, $keyword) !== false) {
                    return true;
                }
            }
            
            return false;
        }
        
        private function searchBlogs($query) {
            echo "  - Llamando a obtener-blogs.php...\n";
            $startTime = microtime(true);
            
            try {
                $apiUrl = 'https://agenterag.com/php-apis/obtener-blogs.php';
                
                $ch = curl_init($apiUrl);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_TIMEOUT, 10);
                
                $response = curl_exec($ch);
                $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                curl_close($ch);
                
                $endTime = microtime(true);
                $apiTime = ($endTime - $startTime) * 1000;
                echo "  - API respondió en {$apiTime}ms con código {$httpcode}\n";
                
                if ($httpcode === 200) {
                    $result = json_decode($response, true);
                    if (isset($result['success']) && $result['success'] && isset($result['blogs'])) {
                        echo "  - ✅ Encontrados " . count($result['blogs']) . " blogs\n";
                        return [[
                            'title' => 'Blogs Disponibles',
                            'content' => 'Tenemos ' . count($result['blogs']) . ' blogs publicados sobre IA, RAG y automatización.',
                            'category' => 'blog'
                        ]];
                    }
                }
                
                echo "  - ❌ Error en respuesta de API\n";
            } catch (Exception $e) {
                echo "  - ❌ Error: " . $e->getMessage() . "\n";
            }
            
            return [];
        }
        
        private function getBlogStats() {
            echo "  - Llamando a estadisticas.php...\n";
            $startTime = microtime(true);
            
            try {
                $apiUrl = 'https://agenterag.com/php-apis/estadisticas.php';
                
                $ch = curl_init($apiUrl);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_TIMEOUT, 10);
                
                $response = curl_exec($ch);
                $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                curl_close($ch);
                
                $endTime = microtime(true);
                $apiTime = ($endTime - $startTime) * 1000;
                echo "  - API respondió en {$apiTime}ms con código {$httpcode}\n";
                
                if ($httpcode === 200) {
                    $result = json_decode($response, true);
                    if (isset($result['success']) && $result['success'] && isset($result['estadisticas'])) {
                        $stats = $result['estadisticas'];
                        echo "  - ✅ Estadísticas obtenidas: {$stats['total_blogs']} blogs\n";
                        
                        return [[
                            'title' => 'Estadísticas del Blog',
                            'content' => "Tenemos {$stats['total_blogs']} blogs publicados con {$stats['total_vistas']} vistas totales y {$stats['total_likes']} likes.",
                            'category' => 'blog_stats'
                        ]];
                    }
                }
                
                echo "  - ❌ Error en respuesta de API\n";
            } catch (Exception $e) {
                echo "  - ❌ Error: " . $e->getMessage() . "\n";
            }
            
            return [];
        }
        
        private function generateGabyResponse($userMessage, $history, $relevantInfo) {
            $contextInfo = $this->buildContext($relevantInfo);
            
            // Prompt simplificado para debug
            $systemPrompt = "Eres Gaby, ejecutiva de Agente RAG. Responde de forma amigable y profesional.\n\nContexto: {$contextInfo}\n\nMensaje: {$userMessage}\n\nResponde como Gaby (máximo 100 palabras):";
            
            echo "  - Prompt enviado a Gemini (" . strlen($systemPrompt) . " caracteres)\n";
            
            return $this->callGeminiAPI($systemPrompt);
        }
        
        private function buildContext($relevantInfo) {
            if (empty($relevantInfo)) {
                return "No se encontró información específica.";
            }
            
            $context = "";
            foreach ($relevantInfo as $info) {
                $context .= "{$info['title']}: {$info['content']}\n";
            }
            
            return $context;
        }
        
        private function callGeminiAPI($prompt) {
            echo "  - Llamando a API de Gemini...\n";
            $startTime = microtime(true);
            
            $url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' . $this->geminiApiKey;
            
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
                    'topK' => 20,
                    'topP' => 0.8,
                    'maxOutputTokens' => 256
                ]
            ];
            
            $options = [
                'http' => [
                    'header' => "Content-type: application/json\r\n",
                    'method' => 'POST',
                    'content' => json_encode($data),
                    'timeout' => 15
                ]
            ];
            
            $context = stream_context_create($options);
            $response = file_get_contents($url, false, $context);
            
            $endTime = microtime(true);
            $geminiTime = ($endTime - $startTime) * 1000;
            echo "  - Gemini respondió en {$geminiTime}ms\n";
            
            if ($response === FALSE) {
                echo "  - ❌ Error en llamada a Gemini\n";
                return "Hola, soy Gaby de Agente RAG. ¿En qué puedo ayudarte hoy?";
            }
            
            $result = json_decode($response, true);
            
            if (!isset($result['candidates'][0]['content']['parts'][0]['text'])) {
                echo "  - ❌ Formato de respuesta inesperado de Gemini\n";
                return "Hola, soy Gaby de Agente RAG. ¿En qué puedo ayudarte hoy?";
            }
            
            $responseText = $result['candidates'][0]['content']['parts'][0]['text'];
            echo "  - ✅ Respuesta de Gemini (" . strlen($responseText) . " caracteres)\n";
            
            return $responseText;
        }
    }
    
    echo "✅ Clase GabyAgentDebug definida\n";
    
    // 6. CREAR INSTANCIA Y PROBAR
    echo "\nPASO 6: Creando instancia de GabyAgent...\n";
    $gabyAgent = new GabyAgentDebug();
    echo "✅ Instancia creada correctamente\n";
    
    // 7. SIMULAR FLUJO DE CONVERSACIÓN
    echo "\n=== SIMULANDO FLUJO DE CONVERSACIÓN ===\n";
    
    $sessionId = generateSessionId();
    echo "Session ID generado: {$sessionId}\n";
    
    // Mensaje 1: Consulta sobre estadísticas
    echo "\n--- MENSAJE 1: Consulta sobre estadísticas ---\n";
    $totalStartTime = microtime(true);
    $response1 = $gabyAgent->processMessage("¿Cuántos blogs tienen publicados?", $sessionId);
    $totalEndTime = microtime(true);
    $totalTime1 = ($totalEndTime - $totalStartTime) * 1000;
    
    echo "\n🎯 RESPUESTA 1 (Tiempo total: {$totalTime1}ms):\n";
    echo $response1 . "\n";
    
    // Mensaje 2: Consulta sobre blogs
    echo "\n--- MENSAJE 2: Consulta sobre blogs ---\n";
    $totalStartTime = microtime(true);
    $response2 = $gabyAgent->processMessage("¿Qué blogs tienen disponibles?", $sessionId);
    $totalEndTime = microtime(true);
    $totalTime2 = ($totalEndTime - $totalStartTime) * 1000;
    
    echo "\n🎯 RESPUESTA 2 (Tiempo total: {$totalTime2}ms):\n";
    echo $response2 . "\n";
    
    echo "\n=== RESUMEN DE TIEMPOS ===\n";
    echo "Mensaje 1 (estadísticas): {$totalTime1}ms\n";
    echo "Mensaje 2 (blogs): {$totalTime2}ms\n";
    echo "Promedio: " . (($totalTime1 + $totalTime2) / 2) . "ms\n";
    
    echo "\n✅ SIMULACIÓN COMPLETADA EXITOSAMENTE\n";
    
} catch (Exception $e) {
    echo "\n❌ ERROR DURANTE LA SIMULACIÓN:\n";
    echo "Mensaje: " . $e->getMessage() . "\n";
    echo "Archivo: " . $e->getFile() . "\n";
    echo "Línea: " . $e->getLine() . "\n";
    echo "Trace:\n" . $e->getTraceAsString() . "\n";
}
?>