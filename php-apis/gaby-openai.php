<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, x-session-id');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Cargar configuración
$config_path = __DIR__ . '/../../config.php';
$config = file_exists($config_path) ? require $config_path : [];

// Configurar OpenAI en lugar de Gemini
$OPENAI_API_KEY = $config['OPENAI_API_KEY'] ?? getenv('OPENAI_API_KEY');
if (empty($OPENAI_API_KEY)) {
    http_response_code(500);
    echo json_encode(['error' => 'OPENAI_API_KEY no configurada']);
    exit;
}

// Sobrescribir la variable global de Gemini con OpenAI
$GEMINI_API_KEY = $OPENAI_API_KEY; // Hack temporal

// Cargar gaby-agent.php (solo clases, no se ejecuta)
$agentPath = __DIR__ . '/gaby-agent.php';
if (!file_exists($agentPath)) {
    echo json_encode(['error' => 'gaby-agent.php no encontrado']);
    exit;
}
require_once $agentPath;

// Extender GabyAgent para usar OpenAI
class GabyAgentOpenAI extends GabyAgent {
    private $openaiKey;
    
    public function __construct() {
        global $OPENAI_API_KEY;
        $this->openaiKey = $OPENAI_API_KEY;
        
        // Llamar constructor padre (usará las variables globales)
        parent::__construct();
    }
    
    // Sobrescribir el método que llama a Gemini para usar OpenAI
    protected function callGeminiAPI($prompt) {
        error_log("[OpenAI] Llamando a OpenAI API con prompt: " . substr($prompt, 0, 100));
        
        $ch = curl_init('https://api.openai.com/v1/chat/completions');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
            'model' => 'gpt-4o-mini',
            'messages' => [
                ['role' => 'system', 'content' => 'Eres Gaby de Agente RAG.'],
                ['role' => 'user', 'content' => $prompt]
            ],
            'temperature' => 0.7,
            'max_tokens' => 1024
        ]));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $this->openaiKey
        ]);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);
        
        if ($response === false) {
            error_log("[OpenAI] Error cURL: " . $curlError);
            return $this->generateFallbackResponse();
        }
        
        if ($httpCode !== 200) {
            error_log("[OpenAI] Error HTTP {$httpCode}: " . $response);
            return $this->generateFallbackResponse();
        }
        
        $result = json_decode($response, true);
        
        if (isset($result['choices'][0]['message']['content'])) {
            error_log("[OpenAI] Respuesta exitosa");
            return $result['choices'][0]['message']['content'];
        }
        
        error_log("[OpenAI] Respuesta sin contenido: " . $response);
        return $this->generateFallbackResponse();
    }
}

// Procesar request
try {
    $input = json_decode(file_get_contents('php://input'), true);
    $message = $input['message'] ?? $_GET['message'] ?? '';
    $sessionId = $input['session'] ?? $_GET['session'] ?? bin2hex(random_bytes(16));
    
    if (empty($message)) {
        throw new Exception('Mensaje requerido');
    }
    
    $agent = new GabyAgentOpenAI();
    $response = $agent->processMessage($message, $sessionId);
    
    echo json_encode([
        'output' => $response,
        'session_id' => $sessionId,
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    
} catch (Exception $e) {
    error_log("Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'error' => 'Error interno',
        'output' => 'Lo siento, ha ocurrido un error.',
        'details' => $e->getMessage()
    ]);
}
