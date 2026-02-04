# 🔄 Migración de Gemini a Ollama

## Archivos Modificados

### 1. **php-apis/generar-blog.php** ✅
- Reemplazado `generarBlogConGemini()` por `generarBlogConOllama()`
- Cambiado endpoint de Gemini a Ollama: `http://agenterag-com_ollama:11434/api/generate`
- Actualizado formato de request/response para Ollama
- Métricas ahora registran `ollama_model` y proveedor `Ollama`

### 2. **php-apis/generar-blog-ollama.php** ✅ (NUEVO)
- Versión standalone del generador de blogs con Ollama
- Usa variables de entorno: `OLLAMA_URL`, `OLLAMA_MODEL`
- Fallback a config.php si no hay variables de entorno

### 3. **src/services/ollamaService.ts** ✅ (NUEVO)
- Servicio TypeScript para Ollama (reemplazo de geminiService.ts)
- Mantiene misma interfaz que geminiService
- Usa `OLLAMA_URL` y `OLLAMA_MODEL` de variables de entorno

### 4. **php-apis/gaby-agent.php** ✅
- Reemplazado `$GEMINI_API_KEY` por `$OLLAMA_URL` y `$OLLAMA_MODEL`
- Actualizado `callGeminiAPI()` para usar endpoint de Ollama
- Cambiado procesamiento de respuesta de Gemini a Ollama

### 5. **php-apis/agente-rag.php** ✅
- Reemplazado `$geminiApiKey` por `$ollamaUrl` y `$ollamaModel`
- Actualizado `generateResponse()` para usar Ollama API
- Cambiado manejo de errores para formato de Ollama

## Variables de Entorno Requeridas

Configura estas variables en Easypanel:

```env
# Ollama Configuration
OLLAMA_URL=http://agenterag-com_ollama:11434
OLLAMA_MODEL=llama3.2:3b

# Database (ya existentes)
PUBLIC_SUPABASE_URL=your-supabase-url
PUBLIC_SUPABASE_ANON_KEY=your-supabase-key
UNSPLASH_ACCESS_KEY=your-unsplash-key

# MySQL RAG Database
RAG_DB_HOST=host.docker.internal
RAG_DB_NAME=u958525313_rag_database
RAG_DB_USER=agenterag
RAG_DB_PASS=your-password

# MySQL Booking Database
BOOKING_DB_HOST=host.docker.internal
BOOKING_DB_NAME=u958525313_booking
BOOKING_DB_USER=agenterag
BOOKING_DB_PASS=your-password
```

## Diferencias Clave: Gemini vs Ollama

### Request Format

**Gemini:**
```json
{
  "contents": [{
    "parts": [{"text": "prompt"}]
  }],
  "generationConfig": {
    "temperature": 0.7,
    "topK": 40
  }
}
```

**Ollama:**
```json
{
  "model": "llama3.2:3b",
  "prompt": "prompt",
  "stream": false,
  "options": {
    "temperature": 0.7,
    "top_k": 40
  }
}
```

### Response Format

**Gemini:**
```json
{
  "candidates": [{
    "content": {
      "parts": [{"text": "response"}]
    }
  }]
}
```

**Ollama:**
```json
{
  "response": "response text",
  "model": "llama3.2:3b",
  "done": true
}
```

## Archivos que NO se modificaron

Estos archivos de prueba aún usan Gemini (no afectan producción):
- `php-apis/test-gemini-blogs.php`
- `php-apis/debug-gemini.php`
- `php-apis/test-gemini-api.php`
- `php-apis/test-gemini.php`
- `php-apis/test-flujo-completo.php`

## Testing

Para probar la migración:

1. **Generar blog con Ollama:**
```bash
curl -X POST https://agenterag.com/php-apis/generar-blog.php \
  -H "Content-Type: application/json" \
  -d '{"temaId":"llm"}'
```

2. **Probar Gaby Agent:**
```bash
curl -X POST https://agenterag.com/php-apis/gaby-agent.php \
  -H "Content-Type: application/json" \
  -d '{"message":"Hola, ¿qué es RAG?"}'
```

3. **Probar Agente RAG:**
```bash
curl -X POST https://agenterag.com/php-apis/agente-rag.php \
  -H "Content-Type: application/json" \
  -d '{"message":"¿Cómo puedo automatizar mi empresa?"}'
```

## Ventajas de Ollama

✅ **Gratis**: No hay costos de API  
✅ **Local**: Datos no salen del VPS  
✅ **Privacidad**: Sin enviar datos a Google  
✅ **Control**: Modelo propio en tu infraestructura  
✅ **Sin límites**: No hay rate limits de API  

## Desventajas vs Gemini

⚠️ **Velocidad**: Ollama puede ser más lento (depende del hardware)  
⚠️ **Calidad**: Llama 3.2 3B es más pequeño que Gemini 2.0 Flash  
⚠️ **Recursos**: Consume RAM/CPU del VPS  

## Rollback a Gemini

Si necesitas volver a Gemini:

1. Restaurar archivos originales desde Git
2. Configurar `GOOGLE_GEMINI_API_KEY` en Easypanel
3. Redeploy

## Próximos Pasos

1. ✅ Configurar variables de entorno en Easypanel
2. ✅ Deploy y probar generación de blogs
3. ✅ Verificar que Gaby Agent funciona correctamente
4. ✅ Monitorear performance y calidad de respuestas
5. ⏳ Considerar upgrade a modelo más grande si es necesario (llama3.2:7b o llama3.1:8b)

---

**Fecha de migración**: 2025-02-04  
**Modelo Ollama**: llama3.2:3b  
**Modelo anterior**: gemini-2.0-flash
