<?php
require_once 'config.php';
require_once 'oauth-config.php';

// Callback para OAuth2
if (!isset($_GET['code'])) {
    errorResponse('Código de autorización no recibido');
}

try {
    $code = $_GET['code'];
    
    // Intercambiar código por token
    $tokenData = [
        'client_id' => GOOGLE_CLIENT_ID,
        'client_secret' => GOOGLE_CLIENT_SECRET,
        'code' => $code,
        'grant_type' => 'authorization_code',
        'redirect_uri' => GOOGLE_REDIRECT_URI
    ];
    
    $context = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => 'Content-Type: application/x-www-form-urlencoded',
            'content' => http_build_query($tokenData)
        ]
    ]);
    
    $response = file_get_contents(GOOGLE_TOKEN_URL, false, $context);
    
    if ($response === false) {
        errorResponse('Error obteniendo token de acceso');
    }
    
    $tokenInfo = json_decode($response, true);
    
    if (isset($tokenInfo['error'])) {
        errorResponse('Error OAuth: ' . $tokenInfo['error_description']);
    }
    
    // Guardar token en sesión
    session_start();
    $_SESSION['google_access_token'] = $tokenInfo['access_token'];
    $_SESSION['google_refresh_token'] = $tokenInfo['refresh_token'] ?? null;
    $_SESSION['token_expires'] = time() + $tokenInfo['expires_in'];
    $_SESSION['oauth_completed'] = true;
    
    // Forzar escritura de sesión
    session_write_close();
    
    // Debug log
    error_log('OAuth token saved: ' . substr($tokenInfo['access_token'], 0, 20) . '...');
    
    // Redirigir de vuelta a la aplicación
    header('Location: /calendar?auth=success');
    exit();
    
} catch (Exception $e) {
    errorResponse('Error en callback OAuth: ' . $e->getMessage(), 500);
}
?>