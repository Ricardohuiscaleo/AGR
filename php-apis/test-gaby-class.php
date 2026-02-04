<?php
/**
 * Script para probar la clase GabyAgent aisladamente
 */

// Configurar cabeceras para JSON
header('Content-Type: application/json');

// Habilitar la visualización de errores
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

try {
    // --- Carga de Configuración ---
    $config_path = __DIR__ . '/../../config.php'; 
    $config = require $config_path;

    // Definir variables globales
    $SUPABASE_URL = $config['PUBLIC_SUPABASE_URL'];
    $SUPABASE_ANON_KEY = $config['PUBLIC_SUPABASE_ANON_KEY'];
    $GEMINI_API_KEY = $config['gemini_api_key'] ?? '';
    $DB_CONFIG = [
        'host' => $config['rag_db_host'] ?? 'localhost',
        'database' => $config['rag_db_name'] ?? 'agenterag',
        'username' => $config['rag_db_user'] ?? 'root',
        'password' => $config['rag_db_pass'] ?? ''
    ];

    echo json_encode([
        'step' => 1,
        'message' => 'Configuración cargada correctamente'
    ]);

    // Cargar gaby-tools-fixed.php
    require_once 'gaby-tools-fixed.php';
    
    echo json_encode([
        'step' => 2,
        'message' => 'gaby-tools-fixed.php cargado correctamente'
    ]);

    // Definir función generateSessionId
    function generateSessionId() {
        return bin2hex(random_bytes(16));
    }

    // Definir clase GabyAgent simplificada
    class GabyAgentTest {
        private $db;
        private $geminiApiKey;
        private $supabaseUrl;
        private $supabaseKey;
        private $tools;
        
        public function __construct() {
            global $DB_CONFIG, $GEMINI_API_KEY, $SUPABASE_URL, $SUPABASE_ANON_KEY;
            $this->geminiApiKey = $GEMINI_API_KEY;
            $this->supabaseUrl = $SUPABASE_URL;
            $this->supabaseKey = $SUPABASE_ANON_KEY;
            $this->tools = new GabyTools();
            $this->initDatabase();
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
        
        public function testMessage($message) {
            return "Hola, recibí tu mensaje: {$message}";
        }
    }

    echo json_encode([
        'step' => 3,
        'message' => 'Clase GabyAgentTest definida correctamente'
    ]);

    // Crear instancia de GabyAgentTest
    $gabyAgent = new GabyAgentTest();
    
    echo json_encode([
        'step' => 4,
        'message' => 'Instancia de GabyAgentTest creada correctamente'
    ]);

    // Probar método
    $response = $gabyAgent->testMessage('Hola mundo');
    
    echo json_encode([
        'step' => 5,
        'message' => 'Método testMessage ejecutado correctamente',
        'response' => $response
    ]);

} catch (Exception $e) {
    echo json_encode([
        'error' => true,
        'message' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ]);
}
?>