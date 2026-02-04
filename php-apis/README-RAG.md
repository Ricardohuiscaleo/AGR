# 🤖 Sistema RAG en PHP - Migración desde n8n

Sistema completo de Retrieval-Augmented Generation usando PHP, Google Gemini API y MySQL para reemplazar el webhook de n8n.

## 🚀 Instalación en Hostinger

### 1. Configurar Base de Datos MySQL

1. Accede a tu panel de Hostinger
2. Ve a **Bases de Datos MySQL**
3. Crea una nueva base de datos (ej: `rag_database`)
4. Ejecuta el script `setup-database.sql` en phpMyAdmin

### 2. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz de tu proyecto (fuera de public_html):

```env
# Base de datos MySQL
DB_HOST=localhost
DB_NAME=tu_base_de_datos
DB_USER=tu_usuario
DB_PASSWORD=tu_password

# Google Gemini API
GOOGLE_GEMINI_API_KEY=tu_api_key_de_gemini
```

### 3. Subir Archivos PHP

Sube los siguientes archivos a tu carpeta `public_html/php-apis/`:

- `agente-rag.php` - API principal del agente RAG
- `config-rag.php` - Configuración del sistema
- `admin-knowledge.php` - Administración de conocimientos

### 4. Actualizar Frontend

En tu componente `ChatInterfaceDark.jsx`, cambia la URL:

```javascript
const RAG_API_URL = 'https://tu-dominio.com/php-apis/agente-rag.php';
```

## 📊 Estructura de la Base de Datos

### Tabla `rag_conversations`
Almacena el historial de conversaciones por sesión.

### Tabla `rag_knowledge_base`
Base de conocimientos con información sobre automatización y costos.

### Tabla `rag_analytics`
Métricas y analytics del sistema.

## 🔧 Uso de las APIs

### API Principal del Agente RAG

**Endpoint:** `POST /php-apis/agente-rag.php`

**Headers:**
```
Content-Type: application/json
x-session-id: session_id_del_usuario
```

**Body:**
```json
{
  "message": "¿Cómo puedo automatizar mi empresa?"
}
```

**Respuesta:**
```json
{
  "output": "Respuesta del agente RAG...",
  "session_id": "abc123...",
  "timestamp": "2025-01-XX XX:XX:XX"
}
```

### API de Administración de Conocimientos

**Obtener conocimientos:**
```
GET /php-apis/admin-knowledge.php?category=automatizacion&search=costos&page=1&limit=20
```

**Agregar conocimiento:**
```
POST /php-apis/admin-knowledge.php
{
  "title": "Nuevo tema",
  "content": "Contenido detallado...",
  "keywords": "palabra1, palabra2",
  "category": "automatizacion",
  "relevance_score": 9.5
}
```

## 🎯 Características del Sistema RAG

### Retrieval (Recuperación)
- Búsqueda por texto completo en MySQL
- Búsqueda por palabras clave
- Ranking por relevancia
- Filtrado por categorías

### Generation (Generación)
- Integración con Google Gemini 2.0 Flash
- Contexto de conversación
- Información relevante de la base de conocimientos
- Respuestas en HTML estructurado

### Persistencia
- Sesiones de conversación
- Historial completo
- Analytics y métricas
- Base de conocimientos actualizable

## 🔐 Seguridad

- Variables de entorno fuera de public_html
- Validación de entrada
- Sanitización de datos
- Headers CORS configurables
- Límites de tokens y tiempo

## 📈 Ventajas vs n8n

✅ **Control total** del código y lógica
✅ **Menor latencia** (sin webhooks externos)
✅ **Costos reducidos** (sin suscripción n8n)
✅ **Escalabilidad** en tu propio servidor
✅ **Personalización completa** del comportamiento
✅ **Base de datos propia** para conocimientos
✅ **Analytics integrados**

## 🛠️ Mantenimiento

### Agregar Nuevos Conocimientos
Usa la API `admin-knowledge.php` o inserta directamente en MySQL:

```sql
INSERT INTO rag_knowledge_base (title, content, keywords, category, relevance_score) 
VALUES ('Título', 'Contenido...', 'palabras,clave', 'categoria', 9.0);
```

### Monitorear Conversaciones
```sql
SELECT session_id, COUNT(*) as messages, MAX(created_at) as last_activity
FROM rag_conversations 
GROUP BY session_id 
ORDER BY last_activity DESC;
```

### Limpiar Datos Antiguos
```sql
DELETE FROM rag_conversations WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY);
```

## 🚀 Próximos Pasos

1. **Implementar autenticación** para admin-knowledge.php
2. **Agregar más categorías** de conocimiento
3. **Implementar embeddings** para mejor búsqueda semántica
4. **Dashboard de analytics** para métricas
5. **API de feedback** para mejorar respuestas

¡Tu sistema RAG está listo para reemplazar completamente n8n! 🎉