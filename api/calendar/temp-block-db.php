<?php
// Debug log con timestamp
$timestamp = date('Y-m-d H:i:s');
error_log("temp-block-db.php: Iniciando script - $timestamp");

// Log COMPLETO de la request
file_put_contents('/tmp/calendar-debug.log', "\n=== " . date('Y-m-d H:i:s') . " ===\n", FILE_APPEND);
file_put_contents('/tmp/calendar-debug.log', "Method: " . $_SERVER['REQUEST_METHOD'] . "\n", FILE_APPEND);
file_put_contents('/tmp/calendar-debug.log', "Headers: " . json_encode(getallheaders()) . "\n", FILE_APPEND);
file_put_contents('/tmp/calendar-debug.log', "Raw Input: " . file_get_contents('php://input') . "\n", FILE_APPEND);
file_put_contents('/tmp/calendar-debug.log', "GET: " . json_encode($_GET) . "\n", FILE_APPEND);
file_put_contents('/tmp/calendar-debug.log', "POST: " . json_encode($_POST) . "\n", FILE_APPEND);

require_once 'db-connection.php';

// DEBUG: Verificar conexión MySQL
$dbInfo = $pdo->query("SELECT DATABASE() as db_name, USER() as db_user, @@hostname as db_host")->fetch();
error_log("temp-block-db.php: Conectado a DB = " . $dbInfo['db_name'] . ", User = " . $dbInfo['db_user'] . ", Host = " . $dbInfo['db_host']);

// Debug: Log del método y datos
error_log("temp-block-db.php: Método = " . $_SERVER['REQUEST_METHOD']);
error_log("temp-block-db.php: Input = " . file_get_contents('php://input'));

// Crear bloqueo temporal con base de datos
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    error_log("temp-block-db.php: Método no permitido");
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido', 'method' => $_SERVER['REQUEST_METHOD']]);
    exit;
}

try {
    $rawInput = file_get_contents('php://input');
    error_log("temp-block-db.php: Raw input = " . $rawInput);
    
    $input = json_decode($rawInput, true);
    error_log("temp-block-db.php: Parsed input = " . json_encode($input));
    
    if (!$input) {
        error_log("temp-block-db.php: Datos inválidos");
        http_response_code(400);
        echo json_encode(['error' => 'Datos inválidos', 'raw' => $rawInput]);
        exit;
    }
    
    $action = $_GET['action'] ?? 'create';
    error_log("temp-block-db.php: Action = " . $action);
    
    if ($action === 'create') {
        $required = ['start', 'end'];
        foreach ($required as $field) {
            if (empty($input[$field])) {
                http_response_code(400);
                echo json_encode(['error' => "Campo requerido: $field"]);
                exit;
            }
        }
        
        // Crear en base de datos
        $tempId = 'temp_' . uniqid() . '_' . time();
        $expiresAt = date('Y-m-d H:i:s', time() + (10 * 60)); // 10 minutos
        
        // Convertir fechas ISO a MySQL datetime
        $startMySQL = date('Y-m-d H:i:s', strtotime($input['start']));
        $endMySQL = date('Y-m-d H:i:s', strtotime($input['end']));
        
        error_log("temp-block-db.php: Creando registro con ID = " . $tempId);
        error_log("temp-block-db.php: Start ISO = " . $input['start'] . " -> MySQL = " . $startMySQL);
        error_log("temp-block-db.php: End ISO = " . $input['end'] . " -> MySQL = " . $endMySQL);
        error_log("temp-block-db.php: Summary = " . ($input['summary'] ?? 'N/A'));
        
        // Generar session_id si no existe
        session_start();
        $sessionId = session_id();
        
        $stmt = $pdo->prepare("
            INSERT INTO temp_bookings 
            (id, session_id, calendar_id, start_datetime, end_datetime, client_name, client_email, client_phone, notes, expires_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $result = $stmt->execute([
            $tempId,
            $sessionId,
            $input['calendarId'] ?? null,
            $startMySQL,
            $endMySQL,
            $input['summary'] ?? 'Reserva Temporal',
            $input['client_email'] ?? null,
            $input['client_phone'] ?? null,
            $input['notes'] ?? null,
            $expiresAt
        ]);
        
        error_log("temp-block-db.php: Insert result = " . ($result ? 'SUCCESS' : 'FAILED'));
        
        // VERIFICAR REALMENTE si se insertó
        $checkStmt = $pdo->prepare("SELECT id FROM temp_bookings WHERE id = ?");
        $checkStmt->execute([$tempId]);
        $found = $checkStmt->fetch();
        
        $reallyInserted = $found ? true : false;
        error_log("temp-block-db.php: Verificación real = " . ($reallyInserted ? 'ENCONTRADO' : 'NO_ENCONTRADO'));
        
        if (!$reallyInserted) {
            error_log("temp-block-db.php: ERROR CRÍTICO - Execute SUCCESS pero registro no existe");
            error_log("temp-block-db.php: Error info: " . json_encode($stmt->errorInfo()));
        }
        
        http_response_code(200);
        echo json_encode([
            'id' => $tempId, 
            'debug' => 'created_successfully',
            'timestamp' => date('Y-m-d H:i:s'),
            'mysql_result' => $result ? 'SUCCESS' : 'FAILED',
            'real_verification' => $reallyInserted ? 'FOUND' : 'NOT_FOUND',
            'db_info' => $dbInfo,
            'version' => 'v2.2_db_debug'
        ]);
        
    } elseif ($action === 'update') {
        // Actualizar datos del formulario en bloqueo temporal
        if (empty($input['id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'ID requerido para actualizar']);
            exit;
        }
        
        session_start();
        $sessionId = session_id();
        
        error_log("temp-block-db.php: UPDATE - ID = " . $input['id'] . ", Session = " . $sessionId);
        error_log("temp-block-db.php: UPDATE - Datos = " . json_encode($input));
        
        // Verificar que el registro existe y pertenece a esta sesión
        $checkStmt = $pdo->prepare("SELECT id FROM temp_bookings WHERE id = ? AND session_id = ? AND expires_at > NOW()");
        $checkStmt->execute([$input['id'], $sessionId]);
        $exists = $checkStmt->fetch();
        
        if (!$exists) {
            error_log("temp-block-db.php: UPDATE - Registro no encontrado o expirado");
            http_response_code(404);
            echo json_encode(['error' => 'Registro no encontrado o expirado']);
            exit;
        }
        
        $stmt = $pdo->prepare("
            UPDATE temp_bookings 
            SET client_name = ?, client_email = ?, client_phone = ?, notes = ?
            WHERE id = ? AND session_id = ? AND expires_at > NOW()
        ");
        
        $result = $stmt->execute([
            $input['client_name'] ?? null,
            $input['client_email'] ?? null,
            $input['client_phone'] ?? null,
            $input['notes'] ?? null,
            $input['id'],
            $sessionId
        ]);
        
        $rowsUpdated = $stmt->rowCount();
        error_log("temp-block-db.php: UPDATE - Resultado = " . ($result ? 'SUCCESS' : 'FAILED') . ", Filas = " . $rowsUpdated);
        
        http_response_code(200);
        echo json_encode([
            'success' => $result,
            'updated' => $rowsUpdated > 0,
            'rows_affected' => $rowsUpdated
        ]);
        
    } elseif ($action === 'remove') {
        // Simular eliminación exitosa
        http_response_code(200);
        echo json_encode(['success' => true]);
        
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'Acción no válida']);
    }
    
} catch (Exception $e) {
    error_log("Error en temp-block-db: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Error interno: ' . $e->getMessage()]);
}
?>