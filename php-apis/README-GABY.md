# 🤖 Gaby Agent - Sistema RAG Avanzado

Agente conversacional inteligente que replica la funcionalidad completa del sistema n8n con personalidad, tools y flujo de conversación estructurado.

## 🚀 Características

- **🎭 Personalidad definida**: Gaby, ejecutiva de atención al cliente
- **🛠️ Tools integradas**: Calendar, Contact, Document, Email
- **🧠 Memoria conversacional**: Mantiene contexto entre mensajes
- **📊 Base de conocimientos RAG**: Búsqueda inteligente de información
- **🔄 Flujo estructurado**: Recopilación de datos y generación de informes
- **💬 Respuestas contextuales**: Adapta el tono según la etapa de conversación

## 📁 Archivos del Sistema

### Archivos Principales
- `gaby-agent.php` - Agente principal con lógica de conversación
- `gaby-tools.php` - Herramientas específicas (Calendar, Contact, Document, Email)
- `test-gaby.php` - Endpoint de prueba
- `config-rag.php` - Configuración centralizada

### Archivos de Soporte
- `agente-rag.php` - Sistema RAG básico (versión simple)
- `admin-knowledge.php` - Administración de base de conocimientos
- `setup-database.sql` - Script de creación de tablas

## 🔧 Configuración

### 1. Base de Datos MySQL

Ejecuta el script SQL para crear las tablas necesarias:

```sql
-- Tablas principales del sistema RAG
SOURCE setup-database.sql;

-- Tablas específicas de Gaby (se crean automáticamente)
-- gaby_meetings, gaby_contacts, gaby_reports
```

### 2. Variables de Entorno

Asegúrate de tener configurado en tu `config.php`:

```php
return [
    // Base de datos RAG
    'rag_db_host' => 'localhost',
    'rag_db_name' => 'tu_base_rag',
    'rag_db_user' => 'tu_usuario',
    'rag_db_pass' => 'tu_password',
    
    // Google Gemini API
    'gemini_api_key' => 'tu_api_key_gemini',
    
    // Supabase (para blogs)
    'PUBLIC_SUPABASE_URL' => 'tu_supabase_url',
    'PUBLIC_SUPABASE_ANON_KEY' => 'tu_supabase_key'
];
```

## 🎯 Uso del Sistema

### Endpoint Principal

```
POST /php-apis/gaby-agent.php
```

**Headers:**
```
Content-Type: application/json
x-session-id: session_id_del_usuario (opcional)
```

**Body:**
```json
{
  "message": "Hola, soy Juan y necesito automatizar mi empresa"
}
```

**Respuesta:**
```json
{
  "output": "Hola **Juan** 😊 ¡Perfecto! Te ayudo con la automatización...",
  "session_id": "abc123...",
  "timestamp": "2025-01-XX XX:XX:XX"
}
```

### Endpoint de Prueba

```
GET /php-apis/test-gaby.php?message=Hola&session=test123
```

## 🤖 Personalidad de Gaby

### Características
- **Nombre**: Gaby
- **Rol**: Ejecutiva de atención al cliente de Agente RAG
- **Especialidad**: Automatización y ahorro de costos empresariales
- **Tono**: Amigable, profesional, conversacional

### Flujo de Conversación

1. **Saludo Inicial** (3 variantes según contexto)
2. **Recopilación de Nombre** (si no lo conoce)
3. **Presentación de Servicios**:
   - Diagnóstico Gratuito
   - Agendar Reunión Comercial
   - Resolver Dudas sobre IA/RAG
4. **Recopilación de Datos** (para diagnóstico)
5. **Generación de Informe** (con IA)
6. **Agendamiento de Reunión**

### Reglas de Personalidad
- ✅ Usa emojis moderadamente (1-2 por párrafo, solo primeros 4 mensajes)
- ✅ Nombres de clientes en **negritas**
- ✅ Una pregunta por mensaje
- ✅ Lenguaje fluido y humanizado
- ❌ NO usa símbolos ¿¡"" al inicio de frases

## 🛠️ Tools Disponibles

### 1. Calendar Tool
```php
$tools->calendarTool('check_availability');
$tools->calendarTool('create_meeting', $data);
$tools->calendarTool('get_availability', ['days' => 7]);
```

### 2. Contact Tool
```php
$tools->contactTool('save_contact', $data);
$tools->contactTool('update_contact', $data);
$tools->contactTool('get_contact', $data);
```

### 3. Document Tool
```php
$tools->documentTool('generate_diagnostic', $data);
$tools->documentTool('send_report', $data);
```

### 4. Email Tool
```php
$tools->emailTool('send_email', $data);
$tools->emailTool('send_report_email', $data);
```

## 📊 Base de Conocimientos

### Información Preinstalada
- Automatización de procesos empresariales
- Ahorro de costos con IA
- Chatbots y atención al cliente
- Sistemas RAG para empresas
- Automatización de marketing digital
- Optimización de inventarios con IA
- Consultoría en transformación digital

### Agregar Nuevo Conocimiento

```php
POST /php-apis/admin-knowledge.php
{
  "title": "Nuevo tema",
  "content": "Contenido detallado...",
  "keywords": "palabra1, palabra2",
  "category": "automatizacion",
  "relevance_score": 9.5
}
```

## 🔍 Funcionalidades RAG

### Retrieval (Recuperación)
- Búsqueda por texto completo en MySQL
- Búsqueda por palabras clave
- Ranking por relevancia
- Integración con blogs de Supabase

### Generation (Generación)
- Google Gemini 2.0 Flash
- Contexto conversacional
- Personalidad consistente
- Respuestas en HTML estructurado

### Augmentation (Aumento)
- Información de base de conocimientos
- Historial de conversación
- Resultados de tools
- Estado de conversación

## 🧪 Testing

### Prueba Básica
```bash
curl -X GET "https://tu-dominio.com/php-apis/test-gaby.php?message=Hola&session=test123"
```

### Prueba de Conversación
```bash
curl -X POST "https://tu-dominio.com/php-apis/gaby-agent.php" \
  -H "Content-Type: application/json" \
  -H "x-session-id: test-session-123" \
  -d '{"message": "Hola soy María y quiero automatizar mi restaurante"}'
```

### Secuencia de Prueba Completa
1. Saludo inicial
2. Proporcionar nombre
3. Seleccionar diagnóstico gratuito
4. Proporcionar datos de empresa
5. Confirmar generación de informe
6. Agendar reunión

## 📈 Ventajas vs n8n

✅ **Control total** del código y lógica  
✅ **Menor latencia** (sin webhooks externos)  
✅ **Costos reducidos** (sin suscripción n8n)  
✅ **Escalabilidad** en tu propio servidor  
✅ **Personalización completa** del comportamiento  
✅ **Base de datos propia** para conocimientos  
✅ **Analytics integrados**  
✅ **Memoria conversacional persistente**  

## 🚀 Próximos Pasos

1. **Integrar con Google Calendar real** para agendamiento
2. **Conectar con servicio de email** (SendGrid, etc.)
3. **Implementar analytics avanzados**
4. **Agregar más tools** (CRM, WhatsApp, etc.)
5. **Dashboard de administración** para Gaby
6. **Integración con frontend** del sitio web

¡Tu agente Gaby está listo para reemplazar completamente n8n! 🎉