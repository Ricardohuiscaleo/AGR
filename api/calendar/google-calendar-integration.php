<?php
/**
 * Integración completa con Google Calendar - VERSIÓN CORREGIDA
 */

require_once 'config.php';
require_once 'db-connection.php';

function createBookingWithGoogleCalendar($bookingData) {
    global $pdo;
    
    try {
        $googleEventId = createGoogleCalendarEvent($bookingData);
        $bookingId = saveBookingToDatabase($bookingData, $googleEventId);
        
        return [
            'success' => true,
            'booking_id' => $bookingId,
            'google_event_id' => $googleEventId,
            'message' => 'Reserva creada exitosamente'
        ];
        
    } catch (Exception $e) {
        error_log('Error creando reserva: ' . $e->getMessage());
        return [
            'success' => false,
            'error' => $e->getMessage()
        ];
    }
}

function createGoogleCalendarEvent($bookingData) {
    $serviceAccountFile = __DIR__ . '/service-account.json';
    
    if (!file_exists($serviceAccountFile)) {
        throw new Exception('Service Account no configurado');
    }
    
    $credentials = json_decode(file_get_contents($serviceAccountFile), true);
    $accessToken = getGoogleAccessToken($credentials);
    
    if (!$accessToken) {
        error_log('❌ No se pudo obtener access token');
        throw new Exception('No se pudo obtener access token');
    }
    
    error_log('✅ Access token obtenido: ' . substr($accessToken, 0, 20) . '...');
    
    // Usar la misma estructura del debug que funciona
    $event = [
        'summary' => "Asesoría con " . $bookingData['nombre'],
        'description' => "Cliente: " . $bookingData['nombre'] . "\nEmail: " . $bookingData['email'] . "\nTeléfono: " . ($bookingData['telefono'] ?? 'No proporcionado') . "\nNotas: " . ($bookingData['notas'] ?? 'Sin notas'),
        'start' => [
            'dateTime' => $bookingData['start'],
            'timeZone' => 'America/Santiago'
        ],
        'end' => [
            'dateTime' => $bookingData['end'],
            'timeZone' => 'America/Santiago'
        ]
    ];
    
    // Usar la función exacta del debug
    return createTestEvent($event, $accessToken);
}

// Copiar la función exacta del debug que SÍ funciona
function createTestEvent($event, $accessToken) {
    $calendarId = 'ricardo.huiscaleo@gmail.com';
    $url = "https://www.googleapis.com/calendar/v3/calendars/" . urlencode($calendarId) . "/events";
    
    $context = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => [
                'Authorization: Bearer ' . $accessToken,
                'Content-Type: application/json'
            ],
            'content' => json_encode($event)
        ]
    ]);
    
    $response = file_get_contents($url, false, $context);
    
    if ($response === false) {
        error_log('❌ Error en la llamada HTTP');
        throw new Exception('Error en la llamada HTTP');
    }
    
    $data = json_decode($response, true);
    
    if (isset($data['error'])) {
        error_log('❌ Google Calendar API Error: ' . json_encode($data['error']));
        throw new Exception('Google Calendar API Error: ' . json_encode($data['error']));
    }
    
    if (isset($data['id'])) {
        error_log('🎉 Evento creado EXITOSAMENTE: ' . $data['id']);
        return $data['id'];
    }
    
    error_log('❌ Respuesta inesperada: ' . $response);
    throw new Exception('Respuesta inesperada de Google Calendar API');
}

function getGoogleAccessToken($credentials) {
    $now = time();
    $expiry = $now + 3600;
    
    $header = json_encode(['alg' => 'RS256', 'typ' => 'JWT']);
    $payload = json_encode([
        'iss' => $credentials['client_email'],
        'scope' => 'https://www.googleapis.com/auth/calendar',
        'aud' => 'https://oauth2.googleapis.com/token',
        'exp' => $expiry,
        'iat' => $now
    ]);
    
    $headerEncoded = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    $payloadEncoded = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
    
    $data = $headerEncoded . '.' . $payloadEncoded;
    $signature = '';
    
    if (openssl_sign($data, $signature, $credentials['private_key'], OPENSSL_ALGO_SHA256)) {
        $signatureEncoded = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
        $jwt = $data . '.' . $signatureEncoded;
        
        $postData = http_build_query([
            'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            'assertion' => $jwt
        ]);
        
        $context = stream_context_create([
            'http' => [
                'method' => 'POST',
                'header' => 'Content-Type: application/x-www-form-urlencoded',
                'content' => $postData
            ]
        ]);
        
        $response = file_get_contents('https://oauth2.googleapis.com/token', false, $context);
        
        if ($response !== false) {
            error_log('📥 Token response: ' . $response);
            $tokenData = json_decode($response, true);
            if (isset($tokenData['access_token'])) {
                return $tokenData['access_token'];
            } else {
                error_log('❌ No access_token in response: ' . json_encode($tokenData));
            }
        } else {
            error_log('❌ Token request failed');
        }
    }
    
    return false;
}

function saveBookingToDatabase($bookingData, $googleEventId) {
    global $pdo;
    
    $bookingId = 'booking_' . uniqid() . '_' . time();
    $startMySQL = date('Y-m-d H:i:s', strtotime($bookingData['start']));
    $endMySQL = date('Y-m-d H:i:s', strtotime($bookingData['end']));
    
    $stmt = $pdo->prepare("
        INSERT INTO bookings 
        (id, google_event_id, calendar_id, start_datetime, end_datetime, 
         client_name, client_email, client_phone, notes, status, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', NOW())
    ");
    
    $result = $stmt->execute([
        $bookingId, $googleEventId, 'ricardo.huiscaleo@gmail.com',
        $startMySQL, $endMySQL, $bookingData['nombre'], $bookingData['email'],
        $bookingData['telefono'] ?? null, $bookingData['notas'] ?? null
    ]);
    
    if (!$result) {
        throw new Exception('Error guardando reserva en base de datos');
    }
    
    return $bookingId;
}

function ensureBookingsTable() {
    global $pdo;
    $sql = "CREATE TABLE IF NOT EXISTS bookings (
        id VARCHAR(100) PRIMARY KEY,
        google_event_id VARCHAR(255),
        calendar_id VARCHAR(255),
        start_datetime DATETIME NOT NULL,
        end_datetime DATETIME NOT NULL,
        client_name VARCHAR(255) NOT NULL,
        client_email VARCHAR(255) NOT NULL,
        client_phone VARCHAR(50),
        notes TEXT,
        status ENUM('confirmed', 'cancelled', 'completed') DEFAULT 'confirmed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    $pdo->exec($sql);
}

ensureBookingsTable();
?>