<?php
/**
 * Script para corregir el método determineConversationStage en gaby-agent.php
 */

// Configurar cabeceras para JSON
header('Content-Type: application/json');

// Ruta al archivo gaby-agent.php
$archivo = __DIR__ . '/gaby-agent.php';

// Verificar si el archivo existe
if (!file_exists($archivo)) {
    echo json_encode([
        'success' => false,
        'error' => 'El archivo gaby-agent.php no existe'
    ]);
    exit;
}

// Leer el contenido del archivo
$contenido = file_get_contents($archivo);

// Buscar el método determineConversationStage
$patron = '/private function determineConversationStage\(\$history, \$hasName\) \{(.*?)if \(empty\(\$history\)\) return \'greeting\';(.*?)if \(em/s';
if (preg_match($patron, $contenido, $coincidencias)) {
    // El método está truncado, vamos a corregirlo
    $metodoTruncado = $coincidencias[0];
    $metodoCompleto = 'private function determineConversationStage($history, $hasName) {
        if (empty($history)) return \'greeting\';
        if (empty($hasName)) return \'name_collection\';
        
        // Analizar últimos mensajes para determinar etapa
        $recentMessages = array_slice($history, -5);
        $content = implode(\' \', array_column($recentMessages, \'content\'));
        
        if (strpos($content, \'diagnóstico\') !== false) return \'diagnostic_flow\';
        if (strpos($content, \'reunión\') !== false) return \'meeting_flow\';
        if (strpos($content, \'correo\') !== false) return \'contact_collection\';
        
        return \'service_selection\';
    }';
    
    // Reemplazar el método truncado con el método completo
    $contenidoCorregido = str_replace($metodoTruncado, $metodoCompleto, $contenido);
    
    // Guardar el archivo corregido
    file_put_contents($archivo, $contenidoCorregido);
    
    echo json_encode([
        'success' => true,
        'mensaje' => 'El método determineConversationStage ha sido corregido'
    ]);
} else {
    echo json_encode([
        'success' => false,
        'mensaje' => 'No se encontró el método determineConversationStage truncado'
    ]);
}
?>