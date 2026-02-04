<?php
// Configuración OAuth2 para Google Calendar
// Cargar configuración centralizada desde la raíz
$config_path = __DIR__ . '/../../../config.php';
if (file_exists($config_path)) {
    $config = require $config_path;
    define('GOOGLE_CLIENT_ID', $config['google_client_id']);
    define('GOOGLE_CLIENT_SECRET', $config['google_client_secret']);
} else {
    throw new Exception('Archivo de configuración no encontrado: ' . $config_path);
}
// Detectar entorno automáticamente
$isLocalhost = isset($_SERVER['HTTP_HOST']) && (strpos($_SERVER['HTTP_HOST'], 'localhost') !== false || strpos($_SERVER['HTTP_HOST'], '127.0.0.1') !== false);
$baseUrl = $isLocalhost ? 'http://localhost:4335' : 'https://agenterag.com';
define('GOOGLE_REDIRECT_URI', $baseUrl . '/api/calendar/oauth-callback.php');

// Scopes necesarios para Google Calendar
define('GOOGLE_SCOPES', 'https://www.googleapis.com/auth/calendar');

// URLs de OAuth
define('GOOGLE_AUTH_URL', 'https://accounts.google.com/o/oauth2/auth');
define('GOOGLE_TOKEN_URL', 'https://oauth2.googleapis.com/token');
?>

<!-- Configuración para Google Cloud Console -->
<!--
Para configurar OAuth2 en Google Cloud Console:

1. Tipo de aplicación: Aplicación web
2. Nombre: BookingCalendar API

3. Orígenes autorizados de JavaScript:
   - https://agenterag.com
   - http://localhost:4335 (para desarrollo)

4. URIs de redireccionamiento autorizados:
   - https://agenterag.com/api/calendar/oauth-callback.php
   - http://localhost:4335/api/calendar/oauth-callback.php (para desarrollo)

5. Después de crear, copia:
   - Client ID → GOOGLE_CLIENT_ID
   - Client Secret → GOOGLE_CLIENT_SECRET
-->