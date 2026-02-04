-- Script SQL para crear las tablas necesarias para el sistema RAG
-- Ejecutar en MySQL de Hostinger

-- Tabla para almacenar conversaciones
CREATE TABLE IF NOT EXISTS rag_conversations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(32) NOT NULL,
    role ENUM('user', 'assistant') NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_session_id (session_id),
    INDEX idx_created_at (created_at)
);

-- Tabla para la base de conocimientos
CREATE TABLE IF NOT EXISTS rag_knowledge_base (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    keywords TEXT,
    category VARCHAR(100) DEFAULT 'general',
    relevance_score DECIMAL(3,2) DEFAULT 1.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FULLTEXT(title, content, keywords),
    INDEX idx_category (category),
    INDEX idx_relevance (relevance_score)
);

-- Insertar datos iniciales de conocimiento sobre automatización y costos
INSERT INTO rag_knowledge_base (title, content, keywords, category, relevance_score) VALUES
('Automatización de Procesos Empresariales', 
'La automatización de procesos empresariales puede reducir costos operativos hasta en un 40%. Incluye automatización de tareas repetitivas, workflows, y procesos de negocio. Los beneficios incluyen: reducción de errores humanos, mayor eficiencia, ahorro de tiempo, y mejor experiencia del cliente.',
'automatización, procesos, eficiencia, ahorro, costos, workflows, RPA',
'automatizacion', 9.5),

('Ahorro de Costos con IA', 
'La implementación de inteligencia artificial puede generar ahorros significativos: reducción de personal en tareas repetitivas, optimización de recursos, predicción de demanda, mantenimiento predictivo. ROI típico de 200-300% en el primer año.',
'IA, inteligencia artificial, ahorro, costos, ROI, optimización, predicción',
'ia-costos', 9.8),

('Chatbots y Atención al Cliente', 
'Los chatbots pueden manejar hasta 80% de consultas básicas, reduciendo costos de atención al cliente en 60%. Disponibilidad 24/7, respuestas instantáneas, escalamiento automático a agentes humanos cuando es necesario.',
'chatbots, atención cliente, automatización, ahorro, 24/7, escalamiento',
'chatbots', 9.2),

('Sistemas RAG para Empresas', 
'Los sistemas RAG (Retrieval-Augmented Generation) permiten crear asistentes inteligentes con conocimiento específico de la empresa. Reducen tiempo de búsqueda de información en 70%, mejoran la toma de decisiones y centralizan el conocimiento organizacional.',
'RAG, retrieval, generation, asistentes, conocimiento, información, decisiones',
'rag-sistemas', 9.7),

('Automatización de Marketing Digital', 
'La automatización de marketing puede aumentar leads en 50% y reducir costos de adquisición en 30%. Incluye: email marketing automatizado, segmentación inteligente, nurturing de leads, scoring automático.',
'marketing, automatización, leads, email, segmentación, nurturing, scoring',
'marketing', 8.9),

('Optimización de Inventarios con IA', 
'Los sistemas de IA para inventarios pueden reducir costos de almacenamiento en 25% y evitar roturas de stock. Predicción de demanda, optimización de compras, gestión automática de proveedores.',
'inventarios, IA, predicción, demanda, almacenamiento, proveedores, stock',
'inventarios', 8.7),

('Consultoría en Transformación Digital', 
'La transformación digital bien planificada puede generar ahorros del 20-40% en costos operativos. Incluye análisis de procesos, identificación de oportunidades de automatización, implementación gradual y medición de ROI.',
'transformación digital, consultoría, análisis, procesos, ROI, implementación',
'consultoria', 9.3);

-- Tabla para métricas y analytics
CREATE TABLE IF NOT EXISTS rag_analytics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(32),
    query_text TEXT,
    response_time_ms INT,
    relevant_docs_found INT,
    user_satisfaction TINYINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_session_id (session_id),
    INDEX idx_created_at (created_at)
);

-- Tabla para configuración del sistema
CREATE TABLE IF NOT EXISTS rag_config (
    id INT AUTO_INCREMENT PRIMARY KEY,
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value TEXT,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insertar configuraciones iniciales
INSERT INTO rag_config (config_key, config_value, description) VALUES
('system_prompt', 'Eres un agente especializado en automatización y ahorro de costos empresariales.', 'Prompt base del sistema'),
('max_tokens', '1024', 'Máximo de tokens en respuestas'),
('temperature', '0.7', 'Temperatura para generación de respuestas'),
('session_timeout', '3600', 'Tiempo de vida de sesión en segundos');