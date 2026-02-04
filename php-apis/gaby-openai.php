<?php
// Importar toda la lógica de gaby-agent.php pero cambiar Gemini por OpenAI
require_once 'gaby-agent.php';

// Sobrescribir solo el método callGeminiAPI para usar OpenAI
class GabyAgentOpenAI extends GabyAgent {
    private $openaiApiKey;
    
    public function __construct() {
        parent::__construct();
        $this->openaiApiKey = getenv('OPENAI_API_KEY');
        
        if (empty($this->openaiApiKey)) {
            throw new Exception('OPENAI_API_KEY no configurada');
        }
    }
    
    protected function callGeminiAPI($prompt) {
        $data = [
            'model' => 'gpt-4o-mini',
            'messages' => [
                ['role' => 'system', 'content' => 'Eres Gaby de Agente RAG.'],
                ['role' => 'user', 'content' => $prompt]
            ],
            'temperature' => 0.7,
            'max_tokens' => 1024
        ];
        
        $ch = curl_init('https://api.openai.com/v1/chat/completions');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $this->openaiApiKey
        ]);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode !== 200) {
            error_log("OpenAI API error: HTTP {$httpCode}");
            return $this->generateFallbackResponse();
        }
        
        $result = json_decode($response, true);
        return $result['choices'][0]['message']['content'] ?? $this->generateFallbackResponse();
    }
}

// Usar GabyAgentOpenAI en lugar de GabyAgent
try {
    $input = json_decode(file_get_contents('php://input'), true);
    $message = $input['message'] ?? $_GET['message'] ?? '';
    $sessionId = $input['session'] ?? $_GET['session'] ?? null;
    
    if (empty($message)) {
        throw new Exception('Mensaje requerido');
    }
    
    if (!$sessionId) {
        $sessionId = bin2hex(random_bytes(16));
    }
    
    $gabyAgent = new GabyAgentOpenAI();
    $response = $gabyAgent->processMessage($message, $sessionId);
    
    echo json_encode([
        'output' => $response,
        'session_id' => $sessionId,
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    
} catch (Exception $e) {
    error_log("Error en gaby-openai: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'error' => 'Error interno',
        'output' => 'Lo siento, ha ocurrido un error. Por favor intenta nuevamente.',
        'details' => $e->getMessage()
    ]);
}
