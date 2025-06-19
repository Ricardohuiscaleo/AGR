# Resolución de Alertas de Seguridad en Supabase

Este documento proporciona instrucciones para resolver las alertas de seguridad detectadas en el panel de Supabase.

## 1. Function Search Path Mutable

**Problema:** Esta alerta indica que hay funciones SQL en la base de datos que tienen permisos para modificar el `search_path`. Esto puede ser un riesgo de seguridad ya que permitiría a la función acceder a esquemas no intencionados.

**Solución:**

1. Inicia sesión en el dashboard de Supabase.
2. Ve a la sección "SQL Editor".
3. Ejecuta la siguiente consulta para identificar las funciones con problemas:

```sql
SELECT
  n.nspname as schema_name,
  p.proname as function_name
FROM
  pg_catalog.pg_proc p,
  pg_catalog.pg_namespace n
WHERE
  p.pronamespace = n.oid
  AND p.prosecdef = false
  AND p.proowner != 10
  AND n.nspname NOT LIKE 'pg_%'
  AND n.nspname != 'information_schema';
```

4. Para cada función identificada, modifica su definición añadiendo `SECURITY DEFINER` o eliminando los permisos para modificar el search_path:

```sql
-- Ejemplo para una función llamada 'my_function' en el esquema 'public'
CREATE OR REPLACE FUNCTION public.my_function()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- Añadir esta línea
AS $$
BEGIN
  -- Código de la función
END;
$$;
```

## 2. Auth OTP Long Expiry

**Problema:** El tiempo de expiración para los tokens OTP (One-Time Password) utilizado en la autenticación es demasiado largo, lo que representa un riesgo de seguridad.

**Solución:**

1. Inicia sesión en el dashboard de Supabase.
2. Ve a "Authentication" > "Settings".
3. Busca la sección "Email & Phone Auth".
4. Reduce el valor de "OTP expiry" (recomendado: 5-15 minutos).
5. Haz clic en "Save" para aplicar los cambios.

## 3. Leaked Password Protection Disabled

**Problema:** La protección contra contraseñas filtradas está desactivada, lo que significa que Supabase no está verificando si las contraseñas de los usuarios han sido comprometidas en filtraciones de datos conocidas.

**Solución:**

1. Inicia sesión en el dashboard de Supabase.
2. Ve a "Authentication" > "Settings".
3. Busca la sección "Security & Protection".
4. Activa la opción "Enable leaked password protection".
5. Haz clic en "Save" para aplicar los cambios.

## Configuración Adicional de Seguridad

Además de resolver los warnings específicos, es recomendable implementar estas medidas adicionales:

### 1. Configurar políticas RLS (Row Level Security)

```sql
-- Ejemplo: Política RLS para tabla 'documents' que solo permite leer documentos propios
CREATE POLICY "Users can read their own documents"
ON public.documents
FOR SELECT
USING (auth.uid() = user_id);

-- Política para permitir actualizar solo documentos propios
CREATE POLICY "Users can update their own documents"
ON public.documents
FOR UPDATE
USING (auth.uid() = user_id);
```

### 2. Configurar expiración de sesiones más segura

1. Ve a "Authentication" > "Settings" > "Auth Session".
2. Configura la duración de la sesión entre 1-7 días (en lugar de los 30 días predeterminados).

### 3. Activar MFA (Autenticación Multi-Factor)

1. Ve a "Authentication" > "Settings" > "MFA".
2. Activa la autenticación de 2 factores.
3. Configura las opciones de recuperación de cuenta.

### 4. Configurar límites de intentos de inicio de sesión

1. Ve a "Authentication" > "Settings" > "Security & Protection".
2. Configura "Max Sign In Attempts" a un valor entre 3-5 intentos.

### 5. Filtrar acceso por IP (opcional para entornos de producción)

1. Ve a "Settings" > "API".
2. En la sección "API Security", restringe el acceso por IP si tu aplicación siempre se conecta desde las mismas direcciones IP.
