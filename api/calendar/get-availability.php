<?php
require_once 'config.php';

// Obtener disponibilidad del calendario
try {
    $timeMin = $_GET['timeMin'] ?? date('c');
    $timeMax = $_GET['timeMax'] ?? date('c', strtotime('+14 days'));
    $calendarId = $_GET['calendarId'] ?? GOOGLE_CALENDAR_ID;
    
    // URL de la API de Google Calendar
    $url = "https://www.googleapis.com/calendar/v3/calendars/" . urlencode($calendarId) . "/events";
    $params = [
        'key' => GOOGLE_API_KEY,
        'timeMin' => $timeMin,
        'timeMax' => $timeMax,
        'singleEvents' => 'true',
        'orderBy' => 'startTime',
        'maxResults' => 100
    ];
    
    $url .= '?' . http_build_query($params);
    
    // Hacer petición a Google Calendar API
    $context = stream_context_create([
        'http' => [
            'method' => 'GET',
            'header' => 'Accept: application/json'
        ]
    ]);
    
    $response = file_get_contents($url, false, $context);
    
    if ($response === false) {
        errorResponse('Error conectando con Google Calendar');
    }
    
    $data = json_decode($response, true);
    
    if (isset($data['error'])) {
        errorResponse('Error de Google Calendar: ' . $data['error']['message']);
    }
    
    // Devolver los eventos
    jsonResponse($data['items'] ?? []);
    
} catch (Exception $e) {
    errorResponse('Error interno: ' . $e->getMessage(), 500);
}
?>