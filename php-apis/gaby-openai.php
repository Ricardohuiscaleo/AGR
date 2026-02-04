<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, x-session-id');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Cargar gaby-agent.php
$agentPath = __DIR__ . '/gaby-agent.php';
if (!file_exists($agentPath)) {
    echo json_encode(['error' => 'gaby-agent.php no encontrado']);
    exit;
}

// Cargar gaby-agent.php sin ejecutar
ob_start();
require_once $agentPath;
ob_end_clean();

// Extender GabyAgent para usar OpenAI
class GabyAgentOpenAI extends GabyAgent {
    private $openaiKey;
    
    public function __construct() {
        $this->openaiKey = getenv('OPENAI_API_KEY');
        if (empty($this->openaiKey)) {
            throw new Exception('OPENAI_API_KEY no configurada');
        }
        parent::__construct();
    }
    
    protected function callGeminiAPI($prompt) {
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
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode !== 200) {
            return $this->generateFallbackResponse();
        }
        
        $result = json_decode($response, true);
        return $result['choices'][0]['message']['content'] ?? $this->generateFallbackResponse();
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
