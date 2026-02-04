<?php
// Verificar registro inmediatamente después de crearlo
require_once 'db-connection.php';

if (isset($_GET['id'])) {
    $id = $_GET['id'];
    
    $stmt = $pdo->prepare("SELECT * FROM temp_bookings WHERE id = ?");
    $stmt->execute([$id]);
    $found = $stmt->fetch();
    
    if ($found) {
        echo json_encode([
            'status' => 'FOUND',
            'data' => $found,
            'timestamp' => date('Y-m-d H:i:s')
        ]);
    } else {
        echo json_encode([
            'status' => 'NOT_FOUND',
            'id' => $id,
            'timestamp' => date('Y-m-d H:i:s')
        ]);
    }
} else {
    echo json_encode(['error' => 'ID requerido']);
}
?>