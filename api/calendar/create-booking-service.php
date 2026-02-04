<?php
require_once 'config.php';
require_once 'google-calendar-integration.php';

// Crear reserva usando Service Account (sin OAuth)
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Método no permitido']);
    exit;
}

try {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        http_response_code(400);
        header('Content-Type: application/json');
        echo json_encode(['error' => 'Datos inválidos']);
        exit;
    }
    
    // Validar campos requeridos
    $required = ['nombre', 'email', 'start', 'end'];
    foreach ($required as $field) {
        if (empty($input[$field])) {
            http_response_code(400);
            header('Content-Type: application/json');
            echo json_encode(['error' => "Campo requerido: $field"]);
            exit;
        }
    }
    
    $calendarId = $input['calendarId'] ?? 'ricardo.huiscaleo@gmail.com';
    
    // Usar el sistema integrado de Google Calendar
    $result = createBookingWithGoogleCalendar($input);
    
    if (!$result['success']) {
        throw new Exception($result['error']);
    }
    
    // Log para debug con fechas convertidas
    $startMySQL = date('Y-m-d H:i:s', strtotime($input['start']));
    $endMySQL = date('Y-m-d H:i:s', strtotime($input['end']));
    
    // Respuesta exitosa
    http_response_code(200);
    header('Content-Type: application/json');
    echo json_encode([
        'id' => $result['booking_id'],
        'google_event_id' => $result['google_event_id'],
        'status' => 'confirmed',
        'htmlLink' => "https://calendar.google.com/calendar/event?eid=" . base64_encode($result['google_event_id']),
        'message' => $result['message']
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Error interno: ' . $e->getMessage()]);
}
?>