<?php
require_once 'config.php';

// Manejar bloqueos temporales
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    errorResponse('Método no permitido', 405);
}

try {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        errorResponse('Datos inválidos');
    }
    
    $action = $_GET['action'] ?? 'create';
    $calendarId = $input['calendarId'] ?? GOOGLE_CALENDAR_ID;
    
    if ($action === 'create') {
        // Crear bloqueo temporal
        $required = ['start', 'end'];
        foreach ($required as $field) {
            if (empty($input[$field])) {
                errorResponse("Campo requerido: $field");
            }
        }
        
        $event = [
            'summary' => $input['summary'] ?? 'Reserva Temporal',
            'description' => 'Bloqueo temporal - Expira en 10 minutos',
            'start' => [
                'dateTime' => $input['start'],
                'timeZone' => $input['timeZone'] ?? 'America/Santiago'
            ],
            'end' => [
                'dateTime' => $input['end'],
                'timeZone' => $input['timeZone'] ?? 'America/Santiago'
            ],
            'transparency' => 'opaque',
            'visibility' => 'private'
        ];
        
        $url = "https://www.googleapis.com/calendar/v3/calendars/" . urlencode($calendarId) . "/events";
        $url .= '?key=' . GOOGLE_API_KEY;
        
        $context = stream_context_create([
            'http' => [
                'method' => 'POST',
                'header' => [
                    'Content-Type: application/json',
                    'Accept: application/json'
                ],
                'content' => json_encode($event)
            ]
        ]);
        
        $response = file_get_contents($url, false, $context);
        
        if ($response === false) {
            errorResponse('Error creando bloqueo temporal');
        }
        
        $data = json_decode($response, true);
        
        if (isset($data['error'])) {
            errorResponse('Error de Google Calendar: ' . $data['error']['message']);
        }
        
        jsonResponse(['id' => $data['id']]);
        
    } elseif ($action === 'remove') {
        // Eliminar bloqueo temporal
        if (empty($input['eventId'])) {
            errorResponse('ID del evento requerido');
        }
        
        $url = "https://www.googleapis.com/calendar/v3/calendars/" . urlencode($calendarId) . "/events/" . urlencode($input['eventId']);
        $url .= '?key=' . GOOGLE_API_KEY;
        
        $context = stream_context_create([
            'http' => [
                'method' => 'DELETE',
                'header' => 'Accept: application/json'
            ]
        ]);
        
        $response = file_get_contents($url, false, $context);
        
        // Google Calendar devuelve 204 No Content para eliminaciones exitosas
        $httpCode = http_response_code();
        if ($httpCode === 204 || $httpCode === 200) {
            jsonResponse(['success' => true]);
        } else {
            errorResponse('Error eliminando bloqueo temporal');
        }
        
    } else {
        errorResponse('Acción no válida');
    }
    
} catch (Exception $e) {
    errorResponse('Error interno: ' . $e->getMessage(), 500);
}
?>