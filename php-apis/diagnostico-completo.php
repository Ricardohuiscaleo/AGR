<?php
/**
 * Script de diagnóstico completo para el sistema Agente RAG
 * Este script verifica todas las dependencias y configuraciones necesarias
 */

// Habilitar la visualización de errores para depuración
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Configurar cabeceras para JSON
header('Content-Type: application/json');

// Función para verificar si un archivo existe y es legible
function verificarArchivo($ruta, $descripcion) {
    if (!file_exists($ruta)) {
        return [
            'estado' => 'error',
            'mensaje' => "El archivo {$descripcion} no existe en la ruta: {$ruta}"
        ];
    }
    
    if (!is_readable($ruta)) {
        return [
            'estado' => 'error',
            'mensaje' => "El archivo {$descripcion} no es legible en la ruta: {$ruta}"
        ];
    }
    
    return [
        'estado' => 'ok',
        'mensaje' => "El archivo {$descripcion} existe y es legible"
    ];
}

// Función para verificar la configuración
function verificarConfiguracion($config) {
    $resultados = [];
    
    // Verificar claves de Supabase
    if (empty($config['PUBLIC_SUPABASE_URL'])) {
        $resultados[] = [
            'estado' => 'error',
            'mensaje' => "Falta la clave PUBLIC_SUPABASE_URL en la configuración"
        ];
    } else {
        $resultados[] = [
            'estado' => 'ok',
            'mensaje' => "La clave PUBLIC_SUPABASE_URL está configurada: " . substr($config['PUBLIC_SUPABASE_URL'], 0, 10) . "..."
        ];
    }
    
    if (empty($config['PUBLIC_SUPABASE_ANON_KEY'])) {
        $resultados[] = [
            'estado' => 'error',
            'mensaje' => "Falta la clave PUBLIC_SUPABASE_ANON_KEY en la configuración"
        ];
    } else {
        $resultados[] = [
            'estado' => 'ok',
            'mensaje' => "La clave PUBLIC_SUPABASE_ANON_KEY está configurada: " . substr($config['PUBLIC_SUPABASE_ANON_KEY'], 0, 10) . "..."
        ];
    }
    
    // Verificar clave de Gemini
    if (empty($config['gemini_api_key'])) {
        $resultados[] = [
            'estado' => 'error',
            'mensaje' => "Falta la clave gemini_api_key en la configuración"
        ];
    } else {
        $resultados[] = [
            'estado' => 'ok',
            'mensaje' => "La clave gemini_api_key está configurada: " . substr($config['gemini_api_key'], 0, 10) . "..."
        ];
    }
    
    // Verificar configuración de base de datos
    $dbKeys = ['rag_db_host', 'rag_db_name', 'rag_db_user', 'rag_db_pass'];
    foreach ($dbKeys as $key) {
        if (empty($config[$key])) {
            $resultados[] = [
                'estado' => 'error',
                'mensaje' => "Falta la clave {$key} en la configuración"
            ];
        } else {
            $resultados[] = [
                'estado' => 'ok',
                'mensaje' => "La clave {$key} está configurada" . ($key !== 'rag_db_pass' ? ": " . $config[$key] : "")
            ];
        }
    }
    
    return $resultados;
}

// Función para verificar la conexión a la base de datos
function verificarBaseDatos($config) {
    try {
        $db = new PDO(
            "mysql:host={$config['rag_db_host']};dbname={$config['rag_db_name']};charset=utf8mb4",
            $config['rag_db_user'],
            $config['rag_db_pass'],
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
            ]
        );
        
        // Verificar tablas
        $tablas = ['rag_conversations', 'rag_knowledge_base', 'gaby_contacts'];
        $resultados = [];
        
        foreach ($tablas as $tabla) {
            $stmt = $db->query("SHOW TABLES LIKE '{$tabla}'");
            if ($stmt->rowCount() == 0) {
                $resultados[] = [
                    'estado' => 'error',
                    'mensaje' => "La tabla {$tabla} no existe en la base de datos"
                ];
            } else {
                $resultados[] = [
                    'estado' => 'ok',
                    'mensaje' => "La tabla {$tabla} existe en la base de datos"
                ];
            }
        }
        
        return [
            'estado' => 'ok',
            'mensaje' => "Conexión a la base de datos exitosa",
            'tablas' => $resultados
        ];
    } catch (PDOException $e) {
        return [
            'estado' => 'error',
            'mensaje' => "Error de conexión a la base de datos: " . $e->getMessage()
        ];
    }
}

// Función para verificar la API de Gemini
function verificarGeminiAPI($apiKey) {
    try {
        $url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' . $apiKey;
        
        $data = [
            'contents' => [
                [
                    'parts' => [
                        ['text' => 'Responde brevemente: ¿Estás funcionando?']
                    ]
                ]
            ],
            'generationConfig' => [
                'temperature' => 0.7,
                'maxOutputTokens' => 50
            ]
        ];
        
        $options = [
            'http' => [
                'header' => "Content-type: application/json\r\n",
                'method' => 'POST',
                'content' => json_encode($data),
                'timeout' => 15
            ]
        ];
        
        $context = stream_context_create($options);
        $response = file_get_contents($url, false, $context);
        
        if ($response === FALSE) {
            return [
                'estado' => 'error',
                'mensaje' => "Error al llamar a la API de Gemini: No se pudo obtener respuesta"
            ];
        }
        
        $result = json_decode($response, true);
        
        if (!isset($result['candidates'][0]['content']['parts'][0]['text'])) {
            return [
                'estado' => 'error',
                'mensaje' => "Error al llamar a la API de Gemini: Formato de respuesta inesperado",
                'respuesta' => $result
            ];
        }
        
        return [
            'estado' => 'ok',
            'mensaje' => "API de Gemini funcionando correctamente",
            'respuesta' => $result['candidates'][0]['content']['parts'][0]['text']
        ];
    } catch (Exception $e) {
        return [
            'estado' => 'error',
            'mensaje' => "Error al llamar a la API de Gemini: " . $e->getMessage()
        ];
    }
}

// Función para verificar la API de Supabase
function verificarSupabaseAPI($supabaseUrl, $supabaseKey) {
    try {
        $url = $supabaseUrl . '/rest/v1/blog_posts?select=count&limit=1';
        
        $options = [
            'http' => [
                'header' => "apikey: {$supabaseKey}\r\nAuthorization: Bearer {$supabaseKey}\r\n",
                'method' => 'GET',
                'timeout' => 15
            ]
        ];
        
        $context = stream_context_create($options);
        $response = file_get_contents($url, false, $context);
        
        if ($response === FALSE) {
            return [
                'estado' => 'error',
                'mensaje' => "Error al llamar a la API de Supabase: No se pudo obtener respuesta"
            ];
        }
        
        $result = json_decode($response, true);
        
        return [
            'estado' => 'ok',
            'mensaje' => "API de Supabase funcionando correctamente",
            'respuesta' => $result
        ];
    } catch (Exception $e) {
        return [
            'estado' => 'error',
            'mensaje' => "Error al llamar a la API de Supabase: " . $e->getMessage()
        ];
    }
}

// Función para verificar la integridad del archivo gaby-agent.php
function verificarIntegridadArchivo($ruta) {
    $contenido = file_get_contents($ruta);
    
    // Verificar si el archivo está completo (tiene la llave de cierre de la clase y del archivo)
    if (strpos($contenido, '?>') === false || strpos($contenido, '}') === false) {
        return [
            'estado' => 'error',
            'mensaje' => "El archivo parece estar incompleto o truncado"
        ];
    }
    
    // Verificar si hay errores de sintaxis
    try {
        $tempFile = tempnam(sys_get_temp_dir(), 'php_check_');
        file_put_contents($tempFile, $contenido);
        
        $output = [];
        $returnVar = 0;
        exec("php -l {$tempFile} 2>&1", $output, $returnVar);
        unlink($tempFile);
        
        if ($returnVar !== 0) {
            return [
                'estado' => 'error',
                'mensaje' => "Error de sintaxis en el archivo: " . implode("\n", $output)
            ];
        }
        
        return [
            'estado' => 'ok',
            'mensaje' => "El archivo parece estar completo y sin errores de sintaxis"
        ];
    } catch (Exception $e) {
        return [
            'estado' => 'error',
            'mensaje' => "Error al verificar la sintaxis del archivo: " . $e->getMessage()
        ];
    }
}

// Ejecutar diagnóstico
try {
    $resultados = [];
    
    // 1. Verificar archivos
    $archivos = [
        ['ruta' => __DIR__ . '/../../config.php', 'descripcion' => 'config.php'],
        ['ruta' => __DIR__ . '/gaby-tools-fixed.php', 'descripcion' => 'gaby-tools-fixed.php'],
        ['ruta' => __DIR__ . '/gaby-agent.php', 'descripcion' => 'gaby-agent.php']
    ];
    
    foreach ($archivos as $archivo) {
        $resultados['archivos'][] = verificarArchivo($archivo['ruta'], $archivo['descripcion']);
    }
    
    // 2. Verificar configuración
    $config_path = __DIR__ . '/../../config.php';
    if (file_exists($config_path) && is_readable($config_path)) {
        $config = require $config_path;
        $resultados['configuracion'] = verificarConfiguracion($config);
        
        // 3. Verificar base de datos
        $resultados['base_datos'] = verificarBaseDatos($config);
        
        // 4. Verificar API de Gemini
        if (!empty($config['gemini_api_key'])) {
            $resultados['gemini_api'] = verificarGeminiAPI($config['gemini_api_key']);
        }
        
        // 5. Verificar API de Supabase
        if (!empty($config['PUBLIC_SUPABASE_URL']) && !empty($config['PUBLIC_SUPABASE_ANON_KEY'])) {
            $resultados['supabase_api'] = verificarSupabaseAPI($config['PUBLIC_SUPABASE_URL'], $config['PUBLIC_SUPABASE_ANON_KEY']);
        }
    }
    
    // 6. Verificar integridad del archivo gaby-agent.php
    $resultados['integridad_archivo'] = verificarIntegridadArchivo(__DIR__ . '/gaby-agent.php');
    
    // 7. Información del sistema
    $resultados['sistema'] = [
        'php_version' => phpversion(),
        'extensions' => get_loaded_extensions(),
        'server' => $_SERVER['SERVER_SOFTWARE'] ?? 'Desconocido',
        'request_method' => $_SERVER['REQUEST_METHOD'] ?? 'Desconocido',
        'request_time' => date('Y-m-d H:i:s')
    ];
    
    // Devolver resultados
    echo json_encode([
        'success' => true,
        'resultados' => $resultados
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Error durante el diagnóstico: ' . $e->getMessage()
    ]);
}
?>