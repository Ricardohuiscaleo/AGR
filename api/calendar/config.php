<?php
// Configuración para la API de Google Calendar
// Usar variables de entorno en producción, config.php en desarrollo
if (file_exists(__DIR__ . '/../../../config.php')) {
    $config = require __DIR__ . '/../../../config.php';
    define('GOOGLE_API_KEY', $config['google_calendar_api_key']);
    define('GOOGLE_CLIENT_ID', $config['google_client_id']);
    define('GOOGLE_CLIENT_SECRET', $config['google_client_secret']);
    define('BOOKING_DB_HOST', $config['booking_db_host']);
    define('BOOKING_DB_NAME', $config['booking_db_name']);
    define('BOOKING_DB_USER', $config['booking_db_user']);
    define('BOOKING_DB_PASS', $config['booking_db_pass']);
} else {
    // Producción: usar variables de entorno
    define('GOOGLE_API_KEY', getenv('GOOGLE_CALENDAR_API_KEY') ?: '');
    define('GOOGLE_CLIENT_ID', getenv('GOOGLE_CLIENT_ID') ?: '');
    define('GOOGLE_CLIENT_SECRET', getenv('GOOGLE_CLIENT_SECRET') ?: '');
    define('BOOKING_DB_HOST', getenv('BOOKING_DB_HOST') ?: '172.17.0.1');
    define('BOOKING_DB_NAME', getenv('BOOKING_DB_NAME') ?: 'u958525313_booking');
    define('BOOKING_DB_USER', getenv('BOOKING_DB_USER') ?: 'agenterag');
    define('BOOKING_DB_PASS', getenv('BOOKING_DB_PASS') ?: '');
}

define('GOOGLE_CALENDAR_ID', 'ricardo.huiscaleo@gmail.com');
define('GOOGLE_SERVICE_ACCOUNT_FILE', __DIR__ . '/service-account.json');

// Configuración CORS
header('Access-Control-Allow-Origin: https://agenterag.com');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

// Manejar preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Función para responder con JSON
function jsonResponse($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data);
    exit();
}

// Función para manejar errores
function errorResponse($message, $status = 400) {
    jsonResponse(['error' => $message], $status);
}
?>