<?php
/**
 * Script para completar el archivo gaby-agent.php si está truncado
 */

// Habilitar la visualización de errores para depuración
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Configurar cabeceras para JSON
header('Content-Type: application/json');

// Ruta al archivo gaby-agent.php
$archivo = __DIR__ . '/gaby-agent.php';

// Verificar si el archivo existe
if (!file_exists($archivo)) {
    echo json_encode([
        'success' => false,
        'error' => 'El archivo gaby-agent.php no existe'
    ]);
    exit;
}

// Leer el contenido del archivo
$contenido = file_get_contents($archivo);

// Verificar si el archivo está truncado
$estaCompleto = (strpos($contenido, '?>') !== false);

if ($estaCompleto) {
    echo json_encode([
        'success' => true,
        'mensaje' => 'El archivo gaby-agent.php ya está completo'
    ]);
    exit;
}

// Completar el archivo si está truncado
$complemento = <<<'EOD'
    private function determineConversationStage($history, $hasName) {
        if (empty($history)) return 'greeting';
        if (empty($hasName)) return 'name_collection';
        
        // Analizar últimos mensajes para determinar etapa
        $recentMessages = array_slice($history, -5);
        $content = implode(' ', array_column($recentMessages, 'content'));
        
        if (strpos($content, 'diagnóstico') !== false) return 'diagnostic_flow';
        if (strpos($content, 'reunión') !== false) return 'meeting_flow';
        if (strpos($content, 'correo') !== false) return 'contact_collection';
        
        return 'service_selection';
    }
    
    private function identifyRequiredTools($message, $state) {
        $tools = [];
        $message = strtolower($message);
        
        // Calendar tool
        if (strpos($message, 'reunión') !== false || 
            strpos($message, 'agendar') !== false || 
            strpos($message, 'calendario') !== false) {
            $tools[] = 'calendar';
        }
        
        // Contact tool
        if ($state['conversation_stage'] === 'contact_collection' || 
            strpos($message, 'guardar') !== false) {
            $tools[] = 'contact';
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
            if (preg_match('/(?:soy|me llamo|mi nombre es|nombre es:?)\\s+([a-záéíóúñü\\s]+)/i', $content, $matches)) {
                $name = trim($matches[1]);
                if (strlen($name) > 2 && !preg_match('/^(si|no|ok|bien|mal|hola)$/i', $name)) {
                    $data['name'] = $name;
                }
            }
            
            // Extraer email
            if (preg_match('/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})/', $content, $matches)) {
                $data['email'] = $matches[1];
            }
            
            // Extraer teléfono
            if (preg_match('/(\\+?[0-9]{8,15})/', $content, $matches)) {
                $phone = $matches[1];
                if (strlen($phone) >= 8) {
                    $data['phone'] = $phone;
                }
            }
            
            // Extraer empresa - patrón específico para "somos La Ruta 11 foodtrucks"
            if (preg_match('/somos\\s+([^,]+?)\\s*,/i', $content, $matches)) {
                $company = trim($matches[1]);
                if (strlen($company) > 2) {
                    $data['company'] = $company;
                }
            } elseif (preg_match('/(?:empresa|compañía|negocio)\\s+(?:es|se llama)?\\s*([a-záéíóúñü0-9\\s]+)/i', $content, $matches)) {
                $company = trim($matches[1]);
                if (strlen($company) > 2) {
                    $data['company'] = $company;
                }
            }
            
            // Extraer rubro/industria - patrón específico
            if (preg_match('/nos dedicamos a la\\s+([^,\\.]+)/i', $content, $matches)) {
                $industry = trim($matches[1]);
                if (strlen($industry) > 3) {
                    $data['industry'] = $industry;
                }
            } elseif (preg_match('/(?:dedicamos|rubro|industria|sector)\\s+(?:a|es)?\\s*([a-záéíóúñü\\s]+)/i', $content, $matches)) {
                $industry = trim($matches[1]);
                if (strlen($industry) > 3) {
                    $data['industry'] = $industry;
                }
            }
            
            // Extraer número de clientes
            if (preg_match('/(\\d+)\\s*(?:clientes?|usuarios?)\\s*(?:al mes|mensuales?|por mes)?/i', $content, $matches)) {
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
        $conversationContext = $this->buildConversationContext($history);
        $toolContext = $this->buildToolContext($toolResults);
        
        $gabyPersonality = $this->getGabyPersonalityPrompt();
        
        $systemPrompt = "{$gabyPersonality}\n\nINFORMACIÓN RELEVANTE:\n{$contextInfo}\n\nHISTORIAL DE CONVERSACIÓN:\n{$conversationContext}\n\nRESULTADOS DE HERRAMIENTAS:\n{$toolContext}\n\nESTADO DE CONVERSACIÓN:\n- Etapa: {$this->conversationState['conversation_stage']}\n- Tiene nombre: " . ($this->conversationState['has_user_name'] ? 'Sí' : 'No') . "\n- Nombre usuario: {$this->conversationState['user_name']}\n- Es pregunta: " . ($this->conversationState['is_question'] ? 'Sí' : 'No') . "\n- Gaby ya se presentó: " . ($this->conversationState['gaby_introduced'] ? 'Sí' : 'No') . "\n- Mensajes en sesión: {$this->conversationState['message_count']}\n\nDATOS YA RECOPILADOS:\n" . $this->buildClientDataSummary($this->extractClientDataFromHistory($history)) . "\n\nMENSAJE DEL USUARIO: {$userMessage}\n\nINSTRUCCIONES IMPORTANTES:\n- Responde como Gaby siguiendo tu personalidad y el flujo de conversación\n- Una pregunta por mensaje\n- NUNCA repitas preguntas si ya tienes la información en DATOS YA RECOPILADOS\n- Usa los datos ya recopilados para avanzar en el flujo\n- Si tienes nombre, email, empresa y proceso, ofrece generar informe o agendar reunión\n- Si el usuario ya respondió algo, no lo vuelvas a preguntar\n- NO uses términos técnicos como '5W2H' - sé natural y conversacional\n- Haz preguntas específicas sobre su negocio, no listas genéricas\n- Si ya conoces el nombre del usuario (aparece en DATOS YA RECOPILADOS), úsalo y NO vuelvas a preguntarlo\n- Mantén la consistencia: si ya saludaste al usuario por su nombre, continúa usándolo\n- CRÍTICO: Si ya te presentaste como Gaby antes (Gaby ya se presentó: Sí), NO te vuelvas a presentar\n- Lee el HISTORIAL DE CONVERSACIÓN completo para entender el contexto y continuar la conversación naturalmente\n- IMPORTANTE: Si no tienes información sobre empresa/actividad, usa frases genéricas como 'tu empresa' o 'tu negocio', NO dejes espacios vacíos\n- CONVERSACIÓN NATURAL: NO digas 'Hola [Nombre]' en cada mensaje - suena robótico. Usa el nombre solo cuando sea natural hacerlo\n- MANEJO DE CONFUSIÓN: Si no entiendes un mensaje, NO te resetees ni preguntes el nombre de nuevo. Simplemente pide aclaración de forma natural\n- MANTÉN CONTEXTO: Siempre usa la información que ya tienes del historial, nunca la ignores\n- NO SEAS DESCRIPTIVA: Evita frases obvias como 'veo que me saludas', 'noto que preguntas', etc. Sé directa y natural\n- RESPUESTAS HUMANAS: Habla como una persona real, no como un bot que describe todo lo que ve\n\nResponde como Gaby:";

        return $this->callGeminiAPI($systemPrompt);
    }
    
    private function getGabyPersonalityPrompt() {
        return "Eres Gaby, ejecutiva de atención al cliente de Agente RAG. Tu personalidad:\n\nCARACTERÍSTICAS:\n- Mujer, amigable y profesional\n- Especializada en automatización y ahorro de costos empresariales\n- Usas emojis moderadamente (1-2 por párrafo, solo en primeros 4 mensajes)\n- Lenguaje fluido y humanizado\n- Una pregunta por mensaje\n- USA EL NOMBRE DEL CLIENTE DE FORMA NATURAL: solo cuando sea apropiado (saludos, despedidas, o para enfatizar), NO en cada mensaje\n- Nombres de clientes en **negritas** cuando los uses\n\nFLUJO DE CONVERSACIÓN:\n1. SALUDO INICIAL (elige según contexto):\n   - Si conoces el nombre: \"Hola **[Nombre]** 😊 ¿cómo estás?, ¿en qué te puedo ayudar hoy?\"\n   - Si no conoces el nombre: \"Hola soy **Gaby**, ejecutiva de atención al cliente de Agente RAG, ¿cuál es tu nombre?\"\n   - Si pregunta directa sin saludo: \"Hola soy **Gaby** ☺️, ejecutiva de atención al cliente en Agente RAG, dame un segundo revisaré en las bases vectoriales, por cierto... ¿cómo te llamas? 🤔\"\n\n2. CONVERSACIÓN NATURAL:\n   - Después del saludo inicial, NO uses el nombre en cada mensaje\n   - Habla de forma natural como una persona real\n   - Solo usa el nombre ocasionalmente para enfatizar o en momentos importantes\n\n2. SERVICIOS PRINCIPALES:\n   - Diagnóstico Gratuito con informe por correo\n   - Agendar Reunión Comercial B2B\n   - Resolver Dudas sobre IA y RAG\n   - Consultar blogs y artículos publicados\n   - Proporcionar estadísticas del contenido\n\n3. RECOPILACIÓN DE DATOS (para diagnóstico):\n   - Nombre completo y correo (obligatorio)\n   - Empresa y rubro\n   - Número de clientes mensuales\n   - Teléfono de contacto\n   - Proceso a automatizar\n\nREGLAS:\n- NO uses símbolos ¿¡\"\" al inicio de frases\n- Respeta el flujo: una pregunta por mensaje\n- Interpreta emojis del cliente\n- Mantén conversación rápida y directa";
    }
    
    private function callGeminiAPI($prompt) {
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
                'topK' => 40,
                'topP' => 0.95,
                'maxOutputTokens' => 1024
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
            return $this->generateFallbackResponse();
        }
        
        $result = json_decode($response, true);
        
        if (!isset($result['candidates'][0]['content']['parts'][0]['text'])) {
            return $this->generateFallbackResponse();
        }
        
        return $result['candidates'][0]['content']['parts'][0]['text'];
    }
    
    private function generateFallbackResponse() {
        if ($this->conversationState['is_first_message']) {
            $responses = [
                "Hola soy **Gaby** 😊, ejecutiva de atención al cliente de Agente RAG. ¿En qué puedo ayudarte hoy?",
                "¡Hola! Soy **Gaby** de Agente RAG. Puedo ayudarte con automatización y ahorro de costos. ¿Cuál es tu nombre?",
                "Hola 👋 Soy **Gaby**. Te ayudo con soluciones de IA para tu empresa. ¿Cómo te llamas?"
            ];
        } else {
            $responses = [
                "Disculpa, no pude procesar tu mensaje correctamente. ¿Podrías repetirlo?",
                "Lo siento, hubo un problema técnico. ¿En qué más puedo ayudarte?",
                "Perdón por la demora. ¿Podrías decirme nuevamente en qué te puedo ayudar?"
            ];
        }
        
        return $responses[array_rand($responses)];
    }
    
    // Métodos auxiliares
    private function extractUserName($history) {
        foreach ($history as $msg) {
            if ($msg['role'] === 'user') {
                $content = $msg['content'];
                
                // Patrón 1: "soy [nombre]", "me llamo [nombre]", "mi nombre es [nombre]"
                if (preg_match('/(?:soy|me llamo|mi nombre es|nombre es:?)\\s+([a-záéíóúñü\\s]+)/i', $content, $matches)) {
                    $name = trim($matches[1]);
                    if (strlen($name) > 2 && !preg_match('/^(si|no|ok|bien|mal|hola)$/i', $name)) {
                        return $name;
                    }
                }
                
                // Patrón 2: "Hola soy [nombre]"
                if (preg_match('/^(hola|buenos días|buenas tardes)\\s+soy\\s+([a-záéíóúñü\\s]+)/i', $content, $matches)) {
                    return trim($matches[2]);
                }
                
                // Patrón 3: Detectar cuando Gaby ya usó el nombre en respuestas anteriores
                foreach ($history as $botMsg) {
                    if ($botMsg['role'] === 'assistant' && preg_match('/Hola\\s+\\*\\*([a-záéíóúñü\\s]+)\\*\\*/i', $botMsg['content'], $matches)) {
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
        if (preg_match('/blog\\s+(?:id|número|numero)?\\s*(\\d+)/i', $query, $matches)) {
            $blogId = $matches[1];
            $blog = $this->getBlogById($blogId);
            if ($blog) {
                return [$blog];
            }
        }
        
        // Detectar consultas sobre blogs o estadísticas
        if ($this->isBlogQuery($query)) {
            return $this->searchBlogs($query);
        }
        
        if ($this->isStatsQuery($query)) {
            return $this->getBlogStats();
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
    
    private function searchBlogs($query) {
        try {
            // Usar el archivo obtener-blogs.php que ya está optimizado
            $apiUrl = 'https://agenterag.com/php-apis/obtener-blogs.php';
            
            $ch = curl_init($apiUrl);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 10);
            
            $response = curl_exec($ch);
            $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            
            if ($httpcode === 200) {
                $result = json_decode($response, true);
                if (isset($result['success']) && $result['success'] && isset($result['blogs'])) {
                    $blogs = $result['blogs'];
                    
                    // Filtrar blogs relevantes por query
                    $relevantBlogs = [];
                    $queryLower = strtolower($query);
                    
                    foreach ($blogs as $blog) {
                        $titleMatch = strpos(strtolower($blog['titulo']), $queryLower) !== false;
                        $contentMatch = strpos(strtolower($blog['contenido']), $queryLower) !== false;
                        $tagsMatch = isset($blog['tags']) && strpos(strtolower($blog['tags']), $queryLower) !== false;
                        
                        if ($titleMatch || $contentMatch || $tagsMatch) {
                            $relevantBlogs[] = [
                                'title' => $blog['titulo'],
                                'content' => substr($blog['contenido'], 0, 300) . '...',
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
                    
                    // Si no hay coincidencias específicas, devolver los más recientes
                    if (empty($relevantBlogs)) {
                        foreach (array_slice($blogs, 0, 3) as $blog) {
                            $relevantBlogs[] = [
                                'title' => $blog['titulo'],
                                'content' => substr($blog['contenido'], 0, 200) . '...',
                                'category' => 'blog',
                                'relevance_score' => 3.0,
                                'source' => 'blog_system',
                                'fecha' => $blog['fecha_publicacion'],
                                'vistas' => $blog['vistas'] ?? 0,
                                'likes' => $blog['likes'] ?? 0,
                                'id' => $blog['id'] ?? null
                            ];
                        }
                    }
                    
                    return $relevantBlogs;
                }
            }
            
            // Si falla la API, intentar directamente con Supabase como fallback
            $apiUrl = $this->supabaseUrl . '/rest/v1/blog_posts?select=*&publicado=eq.true&order=fecha_publicacion.desc&limit=10';
            
            $ch = curl_init($apiUrl);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'apikey: ' . $this->supabaseKey,
                'Authorization: Bearer ' . $this->supabaseKey
            ]);
            curl_setopt($ch, CURLOPT_TIMEOUT, 10);
            
            $response = curl_exec($ch);
            $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            
            if ($httpcode === 200) {
                $blogs = json_decode($response, true);
                
                // Filtrar blogs relevantes por query
                $relevantBlogs = [];
                $queryLower = strtolower($query);
                
                foreach ($blogs as $blog) {
                    $titleMatch = strpos(strtolower($blog['titulo']), $queryLower) !== false;
                    $contentMatch = strpos(strtolower($blog['contenido']), $queryLower) !== false;
                    $tagsMatch = isset($blog['tags']) && strpos(strtolower($blog['tags']), $queryLower) !== false;
                    
                    if ($titleMatch || $contentMatch || $tagsMatch) {
                        $relevantBlogs[] = [
                            'title' => $blog['titulo'],
                            'content' => substr($blog['contenido'], 0, 300) . '...',
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
                
                // Si no hay coincidencias específicas, devolver los más recientes
                if (empty($relevantBlogs)) {
                    foreach (array_slice($blogs, 0, 3) as $blog) {
                        $relevantBlogs[] = [
                            'title' => $blog['titulo'],
                            'content' => substr($blog['contenido'], 0, 200) . '...',
                            'category' => 'blog',
                            'relevance_score' => 3.0,
                            'source' => 'blog_system',
                            'fecha' => $blog['fecha_publicacion'],
                            'vistas' => $blog['vistas'] ?? 0,
                            'likes' => $blog['likes'] ?? 0,
                            'id' => $blog['id'] ?? null
                        ];
                    }
                }
                
                return $relevantBlogs;
            }
        } catch (Exception $e) {
            error_log('Error buscando blogs: ' . $e->getMessage());
        }
        
        return [];
    }
    
    private function getBlogStats() {
        try {
            // Usar el archivo estadisticas.php que ya está optimizado
            $apiUrl = 'https://agenterag.com/php-apis/estadisticas.php';
            
            $ch = curl_init($apiUrl);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 10);
            
            $response = curl_exec($ch);
            $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            
            if ($httpcode === 200) {
                $result = json_decode($response, true);
                if (isset($result['success']) && $result['success'] && isset($result['estadisticas'])) {
                    $stats = $result['estadisticas'];
                    
                    return [[
                        'title' => 'Estadísticas del Blog',
                        'content' => "Tenemos {$stats['total_blogs']} blogs publicados con {$stats['total_vistas']} vistas totales y {$stats['total_likes']} likes. El promedio de vistas por blog es {$stats['promedio_vistas']} y el promedio de likes es {$stats['promedio_likes']}.",
                        'category' => 'blog_stats',
                        'relevance_score' => 5.0,
                        'source' => 'blog_statistics'
                    ]];
                }
            }
            
            // Si falla la API, intentar directamente con Supabase como fallback
            $apiUrl = $this->supabaseUrl . '/rest/v1/rpc/get_blog_stats_v2';
            
            $ch = curl_init($apiUrl);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, '{}');
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Content-Type: application/json',
                'apikey: ' . $this->supabaseKey,
                'Authorization: Bearer ' . $this->supabaseKey
            ]);
            curl_setopt($ch, CURLOPT_TIMEOUT, 10);
            
            $response = curl_exec($ch);
            $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            
            if ($httpcode === 200) {
                $stats_raw = json_decode($response, true);
                
                if (is_array($stats_raw) && !empty($stats_raw)) {
                    $stats = $stats_raw[0];
                    
                    if (is_array($stats)) {
                        $totalBlogs = isset($stats['total_blogs']) ? $stats['total_blogs'] : 0;
                        $totalVistas = isset($stats['total_vistas']) ? $stats['total_vistas'] : 0;
                        $totalLikes = isset($stats['total_likes']) ? $stats['total_likes'] : 0;
                        $promedioVistas = isset($stats['promedio_vistas']) ? round($stats['promedio_vistas'], 1) : 0;
                        $promedioLikes = isset($stats['promedio_likes']) ? round($stats['promedio_likes'], 1) : 0;
                        
                        return [[
                            'title' => 'Estadísticas del Blog',
                            'content' => "Tenemos {$totalBlogs} blogs publicados con {$totalVistas} vistas totales y {$totalLikes} likes. El promedio de vistas por blog es {$promedioVistas} y el promedio de likes es {$promedioLikes}.",
                            'category' => 'blog_stats',
                            'relevance_score' => 5.0,
                            'source' => 'blog_statistics'
                        ]];
                    }
                }
            }
        } catch (Exception $e) {
            error_log('Error obteniendo estadísticas: ' . $e->getMessage());
        }
        
        return [];
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
        foreach (array_slice($history, -6) as $msg) {
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
}
?>
EOD;

// Verificar si el archivo ya contiene parte del complemento
$contenidoActual = file_get_contents($archivo);
$complementoFiltrado = $complemento;

// Buscar la última función definida en el archivo actual
preg_match_all('/private function ([a-zA-Z0-9_]+)\(/', $contenidoActual, $matches);
if (!empty($matches[1])) {
    $ultimaFuncion = end($matches[1]);
    
    // Verificar si la última función ya está en el complemento
    if (strpos($complemento, "private function {$ultimaFuncion}(") !== false) {
        // Eliminar todo hasta después de esa función en el complemento
        $partes = explode("private function {$ultimaFuncion}(", $complemento, 2);
        if (count($partes) > 1) {
            // Buscar el final de la función en el complemento
            $cuerpoFuncion = $partes[1];
            $nivel = 1;
            $posicion = 0;
            $longitud = strlen($cuerpoFuncion);
            
            while ($nivel > 0 && $posicion < $longitud) {
                $char = $cuerpoFuncion[$posicion];
                if ($char === '{') $nivel++;
                if ($char === '}') $nivel--;
                $posicion++;
            }
            
            // Si encontramos el final de la función, eliminar todo hasta ahí
            if ($posicion < $longitud) {
                $complementoFiltrado = substr($complemento, strpos($complemento, "private function {$ultimaFuncion}(") + $posicion + strlen("private function {$ultimaFuncion}("));
            }
        }
    }
}

// Agregar el complemento al archivo
$nuevoContenido = $contenidoActual . $complementoFiltrado;
file_put_contents($archivo, $nuevoContenido);

echo json_encode([
    'success' => true,
    'mensaje' => 'El archivo gaby-agent.php ha sido completado'
]);
?>