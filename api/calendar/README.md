# API PHP para BookingCalendar

Esta API PHP reemplaza las funcionalidades de n8n para el sistema de reservas del calendario.

## Configuración

### 1. Google Calendar API

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la Google Calendar API
4. Crea credenciales (API Key)
5. Actualiza `config.php` con tu API Key:

```php
define('GOOGLE_API_KEY', 'AIzaSyDgZf8EY90Oc0qDf6J3ZjXr8S2QFhZBQRQ');
```

### 2. Configuración del servidor

1. Sube los archivos PHP a tu servidor
2. Asegúrate de que PHP tenga habilitado `file_get_contents()` para URLs externas
3. Configura el dominio en `BookingCalendar.jsx`:

```javascript
const API_BASE_URL = 'https://tu-dominio.com/api/calendar';
```

### 3. Permisos del calendario

Para crear eventos, necesitarás usar OAuth2 o Service Account:

#### Opción A: Service Account (Recomendado)

1. Crea un Service Account en Google Cloud Console
2. Descarga el archivo JSON de credenciales
3. Guárdalo como `service-account.json` en el directorio `/api/calendar/`
4. Comparte tu calendario con el email del Service Account

#### Opción B: OAuth2 (Más complejo)

Requiere implementar el flujo completo de OAuth2.

## Endpoints

### GET `/api/calendar/availability`

Obtiene eventos del calendario para calcular disponibilidad.

**Parámetros:**

- `timeMin`: Fecha inicio (ISO 8601)
- `timeMax`: Fecha fin (ISO 8601)
- `calendarId`: ID del calendario (opcional)

### POST `/api/calendar/booking`

Crea una nueva reserva en el calendario.

**Body JSON:**

```json
{
  "nombre": "Juan Pérez",
  "email": "juan@example.com",
  "telefono": "+56 9 1234 5678",
  "start": "2024-01-15T10:00:00-03:00",
  "end": "2024-01-15T10:30:00-03:00",
  "notas": "Consulta sobre IA",
  "calendarId": "ricardo.huiscaleo@gmail.com",
  "timeZone": "America/Santiago"
}
```

### POST `/api/calendar/temp-block/create`

Crea un bloqueo temporal de 10 minutos.

**Body JSON:**

```json
{
  "start": "2024-01-15T10:00:00-03:00",
  "end": "2024-01-15T10:30:00-03:00",
  "summary": "Reserva Temporal",
  "calendarId": "ricardo.huiscaleo@gmail.com"
}
```

### POST `/api/calendar/temp-block/remove`

Elimina un bloqueo temporal.

**Body JSON:**

```json
{
  "eventId": "evento-id-de-google",
  "calendarId": "ricardo.huiscaleo@gmail.com"
}
```

## Funcionalidades

✅ **Obtener disponibilidad** - Lee eventos del calendario
✅ **Crear reservas** - Crea eventos en Google Calendar
✅ **Bloqueos temporales** - Reserva temporal de horarios
✅ **Email de confirmación** - Envía confirmación por email
✅ **CORS habilitado** - Funciona desde el frontend
✅ **Manejo de errores** - Respuestas JSON consistentes

## Limitaciones actuales

- Usa API Key (solo lectura para calendarios públicos)
- Para crear eventos necesita Service Account o OAuth2
- Email básico (sin HTML ni plantillas)

## Próximos pasos

1. Implementar Service Account para crear eventos
2. Mejorar templates de email
3. Agregar validaciones adicionales
4. Implementar rate limiting
5. Agregar logs de auditoría
