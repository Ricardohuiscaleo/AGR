<?php
/**
 * API para administrar la base de conocimientos RAG
 * CRUD para gestionar información del agente
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'config-rag.php';

try {
    $db = new PDO(
        "mysql:host={$DB_CONFIG['host']};dbname={$DB_CONFIG['database']};charset=utf8mb4",
        $DB_CONFIG['username'],
        $DB_CONFIG['password'],
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    
    $method = $_SERVER['REQUEST_METHOD'];
    $input = json_decode(file_get_contents('php://input'), true);
    
    switch ($method) {
        case 'GET':
            handleGet($db);
            break;
        case 'POST':
            handlePost($db, $input);
            break;
        case 'PUT':
            handlePut($db, $input);
            break;
        case 'DELETE':
            handleDelete($db, $input);
            break;
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Método no permitido']);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}

function handleGet($db) {
    $category = $_GET['category'] ?? null;
    $search = $_GET['search'] ?? null;
    $page = (int)($_GET['page'] ?? 1);
    $limit = (int)($_GET['limit'] ?? 20);
    $offset = ($page - 1) * $limit;
    
    $where = [];
    $params = [];
    
    if ($category) {
        $where[] = "category = ?";
        $params[] = $category;
    }
    
    if ($search) {
        $where[] = "(title LIKE ? OR content LIKE ? OR keywords LIKE ?)";
        $searchTerm = "%{$search}%";
        $params = array_merge($params, [$searchTerm, $searchTerm, $searchTerm]);
    }
    
    $whereClause = empty($where) ? '' : 'WHERE ' . implode(' AND ', $where);
    
    // Obtener total de registros
    $countStmt = $db->prepare("SELECT COUNT(*) FROM rag_knowledge_base {$whereClause}");
    $countStmt->execute($params);
    $total = $countStmt->fetchColumn();
    
    // Obtener registros paginados
    $stmt = $db->prepare("
        SELECT id, title, content, keywords, category, relevance_score, created_at, updated_at
        FROM rag_knowledge_base 
        {$whereClause}
        ORDER BY relevance_score DESC, updated_at DESC
        LIMIT ? OFFSET ?
    ");
    $stmt->execute(array_merge($params, [$limit, $offset]));
    $items = $stmt->fetchAll();
    
    echo json_encode([
        'success' => true,
        'data' => $items,
        'pagination' => [
            'page' => $page,
            'limit' => $limit,
            'total' => $total,
            'pages' => ceil($total / $limit)
        ]
    ]);
}

function handlePost($db, $input) {
    if (!$input || !isset($input['title'], $input['content'])) {
        throw new Exception('Título y contenido son requeridos');
    }
    
    $stmt = $db->prepare("
        INSERT INTO rag_knowledge_base (title, content, keywords, category, relevance_score)
        VALUES (?, ?, ?, ?, ?)
    ");
    
    $stmt->execute([
        $input['title'],
        $input['content'],
        $input['keywords'] ?? '',
        $input['category'] ?? 'general',
        $input['relevance_score'] ?? 5.0
    ]);
    
    $id = $db->lastInsertId();
    
    echo json_encode([
        'success' => true,
        'message' => 'Conocimiento agregado exitosamente',
        'id' => $id
    ]);
}

function handlePut($db, $input) {
    if (!$input || !isset($input['id'])) {
        throw new Exception('ID es requerido para actualizar');
    }
    
    $fields = [];
    $params = [];
    
    if (isset($input['title'])) {
        $fields[] = "title = ?";
        $params[] = $input['title'];
    }
    
    if (isset($input['content'])) {
        $fields[] = "content = ?";
        $params[] = $input['content'];
    }
    
    if (isset($input['keywords'])) {
        $fields[] = "keywords = ?";
        $params[] = $input['keywords'];
    }
    
    if (isset($input['category'])) {
        $fields[] = "category = ?";
        $params[] = $input['category'];
    }
    
    if (isset($input['relevance_score'])) {
        $fields[] = "relevance_score = ?";
        $params[] = $input['relevance_score'];
    }
    
    if (empty($fields)) {
        throw new Exception('No hay campos para actualizar');
    }
    
    $params[] = $input['id'];
    
    $stmt = $db->prepare("
        UPDATE rag_knowledge_base 
        SET " . implode(', ', $fields) . ", updated_at = NOW()
        WHERE id = ?
    ");
    
    $stmt->execute($params);
    
    echo json_encode([
        'success' => true,
        'message' => 'Conocimiento actualizado exitosamente'
    ]);
}

function handleDelete($db, $input) {
    if (!$input || !isset($input['id'])) {
        throw new Exception('ID es requerido para eliminar');
    }
    
    $stmt = $db->prepare("DELETE FROM rag_knowledge_base WHERE id = ?");
    $stmt->execute([$input['id']]);
    
    if ($stmt->rowCount() === 0) {
        throw new Exception('No se encontró el registro para eliminar');
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Conocimiento eliminado exitosamente'
    ]);
}
?>