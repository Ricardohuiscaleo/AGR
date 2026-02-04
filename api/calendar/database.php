<?php
// Cargar configuración centralizada desde la raíz
$config_path = __DIR__ . '/../../../config.php';
if (!file_exists($config_path)) {
    throw new Exception('Archivo de configuración no encontrado: ' . $config_path);
}

$config = require $config_path;

// Definir constantes desde configuración centralizada
define('DB_HOST', $config['booking_db_host']);
define('DB_NAME', $config['booking_db_name']);
define('DB_USER', $config['booking_db_user']);
define('DB_PASS', $config['booking_db_pass']);

class BookingDatabase {
    private $pdo;
    
    public function __construct() {
        try {
            $this->pdo = new PDO(
                "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
                DB_USER,
                DB_PASS,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
                ]
            );
        } catch (PDOException $e) {
            throw new Exception('Error de conexión: ' . $e->getMessage());
        }
    }
    
    // Crear sesión de reserva
    public function createSession($userIP, $userAgent) {
        $sessionId = 'session_' . uniqid() . '_' . time();
        $expiresAt = date('Y-m-d H:i:s', time() + (30 * 60)); // 30 minutos
        
        $stmt = $this->pdo->prepare("
            INSERT INTO booking_sessions (id, user_ip, user_agent, expires_at) 
            VALUES (?, ?, ?, ?)
        ");
        
        $stmt->execute([$sessionId, $userIP, $userAgent, $expiresAt]);
        return $sessionId;
    }
    
    // Crear reserva temporal
    public function createTempBooking($data) {
        $tempId = 'temp_' . uniqid() . '_' . time();
        $expiresAt = date('Y-m-d H:i:s', time() + (10 * 60)); // 10 minutos
        
        $stmt = $this->pdo->prepare("
            INSERT INTO temp_bookings 
            (id, session_id, start_datetime, end_datetime, client_name, client_email, expires_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $tempId,
            $data['session_id'] ?? null,
            $data['start_datetime'],
            $data['end_datetime'],
            $data['client_name'] ?? '',
            $data['client_email'] ?? '',
            $expiresAt
        ]);
        
        return $tempId;
    }
    
    // Confirmar reserva
    public function confirmBooking($tempId, $finalData) {
        $stmt = $this->pdo->prepare("
            UPDATE temp_bookings 
            SET status = 'confirmed', client_name = ?, client_email = ?, client_phone = ?, notes = ?
            WHERE id = ? AND status = 'temp' AND expires_at > NOW()
        ");
        
        return $stmt->execute([
            $finalData['client_name'],
            $finalData['client_email'],
            $finalData['client_phone'] ?? '',
            $finalData['notes'] ?? '',
            $tempId
        ]);
    }
}
?>