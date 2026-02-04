<?php
require_once 'config.php';
require_once 'oauth-config.php';

// Crear reserva usando OAuth2
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    errorResponse('Método no permitido', 405);
}

try {
    session_start();
    
    // Verificar si tenemos token de acceso
    if (!isset($_SESSION['google_access_token'])) {
        // Redirigir a OAuth
        $authUrl = GOOGLE_AUTH_URL . '?' . http_build_query([
            'client_id' => GOOGLE_CLIENT_ID,
            'redirect_uri' => GOOGLE_REDIRECT_URI,
            'scope' => GOOGLE_SCOPES,
            'response_type' => 'code',
            'access_type' => 'offline'
        ]);
        
        jsonResponse(['auth_required' => true, 'auth_url' => $authUrl]);
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        errorResponse('Datos inválidos');
    }
    
    // Validar campos requeridos
    $required = ['nombre', 'email', 'start', 'end'];
    foreach ($required as $field) {
        if (empty($input[$field])) {
            errorResponse("Campo requerido: $field");
        }
    }
    
    $calendarId = $input['calendarId'] ?? GOOGLE_CALENDAR_ID;
    
    // Crear evento
    $event = [
        'summary' => "Asesoría con " . $input['nombre'],
        'description' => "Cliente: " . $input['nombre'] . "\n" .
                        "Email: " . $input['email'] . "\n" .
                        "Teléfono: " . ($input['telefono'] ?? 'No proporcionado') . "\n" .
                        "Notas: " . ($input['notas'] ?? 'Sin notas'),
        'start' => [
            'dateTime' => $input['start'],
            'timeZone' => $input['timeZone'] ?? 'America/Santiago'
        ],
        'end' => [
            'dateTime' => $input['end'],
            'timeZone' => $input['timeZone'] ?? 'America/Santiago'
        ],
        'attendees' => [
            ['email' => $input['email']]
        ],
        'reminders' => [
            'useDefault' => false,
            'overrides' => [
                ['method' => 'email', 'minutes' => 1440],
                ['method' => 'popup', 'minutes' => 30]
            ]
        ]
    ];
    
    // Usar token OAuth para crear evento
    $url = "https://www.googleapis.com/calendar/v3/calendars/" . urlencode($calendarId) . "/events";
    
    $context = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => [
                'Content-Type: application/json',
                'Authorization: Bearer ' . $_SESSION['google_access_token']
            ],
            'content' => json_encode($event)
        ]
    ]);
    
    $response = file_get_contents($url, false, $context);
    
    if ($response === false) {
        errorResponse('Error creando evento en Google Calendar');
    }
    
    $data = json_decode($response, true);
    
    if (isset($data['error'])) {
        // Si el token expiró, limpiar sesión
        if ($data['error']['code'] === 401) {
            unset($_SESSION['google_access_token']);
            jsonResponse(['auth_required' => true, 'message' => 'Token expirado']);
        }
        errorResponse('Error de Google Calendar: ' . $data['error']['message']);
    }
    
    jsonResponse([
        'id' => $data['id'],
        'status' => 'confirmed',
        'htmlLink' => $data['htmlLink'] ?? null
    ]);
    
} catch (Exception $e) {
    errorResponse('Error interno: ' . $e->getMessage(), 500);
}
?>