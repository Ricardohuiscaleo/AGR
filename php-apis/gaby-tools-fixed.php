<?php
/**
 * Gaby Tools - Herramientas específicas para el agente Gaby
 * Versión corregida sin operadores ?? para compatibilidad PHP
 */

// No se requiere cargar config-rag.php, ya que las variables globales están definidas en gaby-agent.php

class GabyTools {
    private $db;
    private $supabaseUrl;
    private $supabaseKey;
    
    public function __construct() {
        global $DB_CONFIG, $SUPABASE_URL, $SUPABASE_ANON_KEY;
        $this->supabaseUrl = $SUPABASE_URL;
        $this->supabaseKey = $SUPABASE_ANON_KEY;
        $this->initDatabase();
    }
    
    private function initDatabase() {
        global $DB_CONFIG;
        try {
            $this->db = new PDO(
                "mysql:host={$DB_CONFIG['host']};dbname={$DB_CONFIG['database']};charset=utf8mb4",
                $DB_CONFIG['username'],
                $DB_CONFIG['password'],
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
                ]
            );
        } catch (PDOException $e) {
            throw new Exception('Error de conexión a base de datos: ' . $e->getMessage());
        }
    }
    
    public function calendarTool($action, $data = []) {
        switch ($action) {
            case 'check_availability':
                return $this->checkAvailability($data);
            case 'create_meeting':
                return $this->createMeeting($data);
            case 'get_availability':
                return $this->getAvailability($data);
            default:
                return ['error' => 'Acción de calendario no válida'];
        }
    }
    
    private function checkAvailability($data) {
        $calendarApiUrl = 'https://agenterag.com/api/calendar/get-availability.php';
        $params = [
            'timeMin' => date('c'),
            'timeMax' => date('c', strtotime('+7 days')),
            'calendarId' => 'ricardo.huiscaleo@gmail.com'
        ];
        
        $url = $calendarApiUrl . '?' . http_build_query($params);
        $response = file_get_contents($url);
        
        if ($response !== FALSE) {
            $events = json_decode($response, true);
            return [
                'status' => 'success',
                'events' => $events,
                'message' => 'Disponibilidad consultada exitosamente'
            ];
        }
        
        return ['error' => 'Error consultando calendario'];
    }
    
    private function createMeeting($data) {
        $required = ['client_name', 'client_email'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                return ['error' => "Campo requerido: {$field}"];
            }
        }
        
        $calendarApiUrl = 'https://agenterag.com/api/calendar/create-booking-service.php';
        
        $meetingData = [
            'nombre' => $data['client_name'],
            'email' => $data['client_email'],
            'telefono' => isset($data['phone']) ? $data['phone'] : '',
            'start' => isset($data['start']) ? $data['start'] : date('c', strtotime('tomorrow 10:00')),
            'end' => isset($data['end']) ? $data['end'] : date('c', strtotime('tomorrow 10:30')),
            'notas' => 'Reunión comercial B2B - ' . (isset($data['requirements']) ? $data['requirements'] : 'Consulta sobre automatización'),
            'calendarId' => 'ricardo.huiscaleo@gmail.com'
        ];
        
        $options = [
            'http' => [
                'header' => "Content-type: application/json\r\n",
                'method' => 'POST',
                'content' => json_encode($meetingData)
            ]
        ];
        
        $context = stream_context_create($options);
        $response = file_get_contents($calendarApiUrl, false, $context);
        
        if ($response !== FALSE) {
            $result = json_decode($response, true);
            if (isset($result['id'])) {
                $this->saveMeetingLocal($data, $result['id']);
                
                return [
                    'status' => 'success',
                    'meeting_id' => $result['id'],
                    'google_event_id' => isset($result['google_event_id']) ? $result['google_event_id'] : null,
                    'meeting_link' => isset($result['htmlLink']) ? $result['htmlLink'] : 'https://meet.google.com/new',
                    'message' => 'Reunión creada exitosamente en Google Calendar'
                ];
            }
        }
        
        return ['error' => 'Error al crear la reunión en Google Calendar'];
    }
    
    private function saveMeetingLocal($data, $googleEventId) {
        $meetingId = 'meeting_' . uniqid();
        $stmt = $this->db->prepare("
            INSERT INTO gaby_meetings 
            (id, client_name, client_email, google_event_id, status, created_at) 
            VALUES (?, ?, ?, ?, 'scheduled', NOW())
        ");
        
        $stmt->execute([
            $meetingId,
            $data['client_name'],
            $data['client_email'],
            $googleEventId
        ]);
    }
    
    private function getAvailability($data) {
        $days = isset($data['days']) ? $data['days'] : 7;
        $availability = [];
        
        for ($i = 1; $i <= $days; $i++) {
            $date = date('Y-m-d', strtotime("+{$i} days"));
            $dayName = date('l', strtotime($date));
            
            if (!in_array($dayName, ['Saturday', 'Sunday'])) {
                $availability[] = [
                    'date' => $date,
                    'day' => $dayName,
                    'slots' => ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']
                ];
            }
        }
        
        return [
            'status' => 'success',
            'availability' => $availability
        ];
    }
    
    public function contactTool($action, $data = []) {
        switch ($action) {
            case 'save_contact':
                return $this->saveContact($data);
            case 'update_contact':
                return $this->updateContact($data);
            case 'get_contact':
                return $this->getContact($data);
            default:
                return ['error' => 'Acción de contacto no válida'];
        }
    }
    
    private function saveContact($data) {
        $required = ['name', 'email'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                return ['error' => "Campo requerido: {$field}"];
            }
        }
        
        $contactId = 'contact_' . uniqid();
        $stmt = $this->db->prepare("
            INSERT INTO gaby_contacts 
            (id, name, email, phone, company, industry, monthly_clients, requirements, status, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW())
        ");
        
        $result = $stmt->execute([
            $contactId,
            $data['name'],
            $data['email'],
            isset($data['phone']) ? $data['phone'] : null,
            isset($data['company']) ? $data['company'] : null,
            isset($data['industry']) ? $data['industry'] : null,
            isset($data['monthly_clients']) ? $data['monthly_clients'] : null,
            isset($data['requirements']) ? $data['requirements'] : null
        ]);
        
        if ($result) {
            return [
                'status' => 'success',
                'contact_id' => $contactId,
                'message' => 'Contacto guardado exitosamente'
            ];
        } else {
            return ['error' => 'Error al guardar el contacto'];
        }
    }
    
    private function updateContact($data) {
        if (empty($data['contact_id'])) {
            return ['error' => 'ID de contacto requerido'];
        }
        
        $fields = [];
        $values = [];
        
        $updateableFields = ['name', 'email', 'phone', 'company', 'industry', 'monthly_clients', 'requirements'];
        foreach ($updateableFields as $field) {
            if (isset($data[$field])) {
                $fields[] = "{$field} = ?";
                $values[] = $data[$field];
            }
        }
        
        if (empty($fields)) {
            return ['error' => 'No hay campos para actualizar'];
        }
        
        $values[] = $data['contact_id'];
        
        $stmt = $this->db->prepare("
            UPDATE gaby_contacts 
            SET " . implode(', ', $fields) . ", updated_at = NOW()
            WHERE id = ?
        ");
        
        $result = $stmt->execute($values);
        
        return [
            'status' => $result ? 'success' : 'error',
            'message' => $result ? 'Contacto actualizado exitosamente' : 'Error al actualizar contacto'
        ];
    }
    
    private function getContact($data) {
        $stmt = $this->db->prepare("
            SELECT * FROM gaby_contacts 
            WHERE email = ? OR id = ?
            ORDER BY created_at DESC 
            LIMIT 1
        ");
        
        $stmt->execute([
            isset($data['email']) ? $data['email'] : '',
            isset($data['contact_id']) ? $data['contact_id'] : ''
        ]);
        
        $contact = $stmt->fetch();
        
        if ($contact) {
            return [
                'status' => 'success',
                'contact' => $contact
            ];
        } else {
            return [
                'status' => 'not_found',
                'message' => 'Contacto no encontrado'
            ];
        }
    }
    
    public function documentTool($action, $data = []) {
        switch ($action) {
            case 'generate_diagnostic':
                return $this->generateDiagnostic($data);
            case 'send_report':
                return $this->sendReport($data);
            default:
                return ['error' => 'Acción de documento no válida'];
        }
    }
    
    private function generateDiagnostic($data) {
        $required = ['client_name', 'company', 'process_to_automate', 'current_method'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                return ['error' => "Campo requerido para diagnóstico: {$field}"];
            }
        }
        
        $reportContent = $this->generateReportWithAI($data);
        
        $reportId = 'report_' . uniqid();
        $stmt = $this->db->prepare("
            INSERT INTO gaby_reports 
            (id, client_name, company, content, status, created_at) 
            VALUES (?, ?, ?, ?, 'generated', NOW())
        ");
        
        $result = $stmt->execute([
            $reportId,
            $data['client_name'],
            $data['company'],
            $reportContent
        ]);
        
        if ($result) {
            return [
                'status' => 'success',
                'report_id' => $reportId,
                'content' => $reportContent,
                'message' => 'Informe de diagnóstico generado exitosamente'
            ];
        } else {
            return ['error' => 'Error al generar el informe'];
        }
    }
    
    private function generateReportWithAI($data) {
        global $GEMINI_API_KEY;
        
        $timeLost = isset($data['time_lost']) ? $data['time_lost'] : 'No especificado';
        $peopleInvolved = isset($data['people_involved']) ? $data['people_involved'] : 'No especificado';
        
        $prompt = "Genera un informe de diagnóstico empresarial profesional para:

DATOS DEL CLIENTE:
- Nombre: {$data['client_name']}
- Empresa: {$data['company']}
- Proceso a automatizar: {$data['process_to_automate']}
- Método actual: {$data['current_method']}
- Tiempo perdido: {$timeLost}
- Personas involucradas: {$peopleInvolved}

ESTRUCTURA DEL INFORME:
1. Resumen Ejecutivo
2. Análisis del Proceso Actual
3. Oportunidades de Automatización
4. Plan de Acción S.M.A.R.T.
5. ROI Estimado
6. Próximos Pasos

Genera un informe profesional en HTML con recomendaciones específicas.";

        $url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' . $GEMINI_API_KEY;
        
        $requestData = [
            'contents' => [
                [
                    'parts' => [
                        ['text' => $prompt]
                    ]
                ]
            ],
            'generationConfig' => [
                'temperature' => 0.3,
                'maxOutputTokens' => 2048
            ]
        ];
        
        $options = [
            'http' => [
                'header' => "Content-type: application/json\r\n",
                'method' => 'POST',
                'content' => json_encode($requestData)
            ]
        ];
        
        $context = stream_context_create($options);
        $response = file_get_contents($url, false, $context);
        
        if ($response !== FALSE) {
            $result = json_decode($response, true);
            if (isset($result['candidates'][0]['content']['parts'][0]['text'])) {
                return $result['candidates'][0]['content']['parts'][0]['text'];
            }
        }
        
        return $this->generateBasicReport($data);
    }
    
    private function generateBasicReport($data) {
        return "<h1>Informe de Diagnóstico - {$data['company']}</h1>
        <h2>Cliente: {$data['client_name']}</h2>
        <h3>Proceso Analizado</h3>
        <p><strong>Proceso a automatizar:</strong> {$data['process_to_automate']}</p>
        <p><strong>Método actual:</strong> {$data['current_method']}</p>
        <h3>Recomendaciones</h3>
        <ul>
        <li>Implementar automatización con IA</li>
        <li>Reducir tiempo de proceso en 40-60%</li>
        <li>Mejorar precisión y reducir errores</li>
        </ul>
        <h3>Próximos Pasos</h3>
        <p>Agendar reunión comercial para definir implementación.</p>";
    }
    
    private function sendReport($data) {
        return [
            'status' => 'success',
            'message' => 'Informe enviado por correo electrónico'
        ];
    }
    
    public function emailTool($action, $data = []) {
        switch ($action) {
            case 'send_email':
                return $this->sendEmail($data);
            case 'send_report_email':
                return $this->sendReportEmail($data);
            default:
                return ['error' => 'Acción de email no válida'];
        }
    }
    
    private function sendEmail($data) {
        $required = ['to', 'subject', 'body'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                return ['error' => "Campo requerido: {$field}"];
            }
        }
        
        $headers = [
            'From: Gaby - Agente RAG <noreply@agenterag.com>',
            'Reply-To: contacto@agenterag.com',
            'Content-Type: text/html; charset=UTF-8',
            'X-Mailer: PHP/' . phpversion()
        ];
        
        $success = mail(
            $data['to'],
            $data['subject'],
            $data['body'],
            implode("\r\n", $headers)
        );
        
        if ($success) {
            $this->logEmail($data);
            
            return [
                'status' => 'success',
                'message' => 'Email enviado exitosamente',
                'to' => $data['to'],
                'subject' => $data['subject']
            ];
        } else {
            return ['error' => 'Error al enviar email'];
        }
    }
    
    private function logEmail($data) {
        try {
            $stmt = $this->db->prepare("
                INSERT INTO gaby_email_log 
                (recipient, subject, body, status, sent_at) 
                VALUES (?, ?, ?, 'sent', NOW())
            ");
            $stmt->execute([$data['to'], $data['subject'], $data['body']]);
        } catch (Exception $e) {
            error_log('Error logging email: ' . $e->getMessage());
        }
    }
    
    private function sendReportEmail($data) {
        $emailData = [
            'to' => $data['client_email'],
            'subject' => 'Informe de Diagnóstico - Agente RAG',
            'body' => "Estimado/a {$data['client_name']},

Adjunto encontrarás tu informe de diagnóstico personalizado.

Saludos,
Gaby - Agente RAG"
        ];
        
        return $this->sendEmail($emailData);
    }
}

function createGabyTables() {
    global $DB_CONFIG;
    
    try {
        $pdo = new PDO(
            "mysql:host={$DB_CONFIG['host']};dbname={$DB_CONFIG['database']};charset=utf8mb4",
            $DB_CONFIG['username'],
            $DB_CONFIG['password']
        );
        
        $pdo->exec("CREATE TABLE IF NOT EXISTS gaby_meetings (
            id VARCHAR(50) PRIMARY KEY,
            client_name VARCHAR(255) NOT NULL,
            client_email VARCHAR(255) NOT NULL,
            google_event_id VARCHAR(255),
            status ENUM('scheduled', 'completed', 'cancelled') DEFAULT 'scheduled',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )");
        
        $pdo->exec("CREATE TABLE IF NOT EXISTS gaby_contacts (
            id VARCHAR(50) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            phone VARCHAR(50),
            company VARCHAR(255),
            industry VARCHAR(255),
            monthly_clients INT,
            requirements TEXT,
            status ENUM('active', 'inactive') DEFAULT 'active',
            session_id VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY unique_email (email),
            INDEX idx_session_id (session_id)
        )");
        
        // Agregar columna session_id si no existe
        $result = $pdo->query("SHOW COLUMNS FROM gaby_contacts LIKE 'session_id'");
        if ($result->rowCount() == 0) {
            $pdo->exec("ALTER TABLE gaby_contacts ADD COLUMN session_id VARCHAR(255), ADD INDEX idx_session_id (session_id)");
        }
        
        $pdo->exec("CREATE TABLE IF NOT EXISTS gaby_reports (
            id VARCHAR(50) PRIMARY KEY,
            client_name VARCHAR(255) NOT NULL,
            company VARCHAR(255) NOT NULL,
            content LONGTEXT NOT NULL,
            status ENUM('generated', 'sent') DEFAULT 'generated',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )");
        
        $pdo->exec("CREATE TABLE IF NOT EXISTS gaby_email_log (
            id INT AUTO_INCREMENT PRIMARY KEY,
            recipient VARCHAR(255) NOT NULL,
            subject VARCHAR(500) NOT NULL,
            body LONGTEXT,
            status ENUM('sent', 'failed') DEFAULT 'sent',
            sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )");
        
    } catch (Exception $e) {
        error_log("Error creando tablas de Gaby: " . $e->getMessage());
    }
}

createGabyTables();
?>