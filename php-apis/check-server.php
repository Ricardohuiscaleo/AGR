<?php
/**
 * Script de Diagnóstico del Servidor PHP
 *
 * Este script comprueba la versión de PHP y si las extensiones críticas
 * (curl, json, openssl) están habilitadas en el servidor.
 * Devuelve un reporte en formato JSON.
 */

// Establecer la cabecera para devolver una respuesta JSON clara.
header('Content-Type: application/json');

// Crear un array para el reporte del estado del servidor.
$report = [
    'servidor' => 'Hostinger',
    'estado_general' => 'OK',
    'php_version' => phpversion(),
    'extensiones' => []
];

// Lista de extensiones de PHP que son absolutamente necesarias para que el script principal funcione.
$required_extensions = ['curl', 'json', 'openssl'];
$all_extensions_ok = true;

// Recorrer la lista y verificar si cada extensión está cargada.
foreach ($required_extensions as $ext) {
    $is_loaded = extension_loaded($ext);
    $report['extensiones'][$ext] = [
        'requerida' => true,
        'habilitada' => $is_loaded
    ];
    if (!$is_loaded) {
        $all_extensions_ok = false;
    }
}

// Actualizar el estado general si falta alguna extensión.
if (!$all_extensions_ok) {
    $report['estado_general'] = 'ERROR';
    $report['mensaje_error'] = 'Faltan una o más extensiones de PHP críticas. Por favor, habilítalas en tu panel de Hostinger.';
    http_response_code(500);
}

// Imprimir el reporte en formato JSON.
// JSON_PRETTY_PRINT hace que la salida sea fácil de leer en el navegador.
echo json_encode($report, JSON_PRETTY_PRINT);
?>
