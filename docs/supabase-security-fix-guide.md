# 🔒 Guía para Resolver Errores de Seguridad en Supabase

## 📋 Resumen de Problemas Detectados

Supabase ha detectado los siguientes errores críticos de seguridad:

### 1. Security Definer Views (ERROR)

- `vista_estadisticas_inventario`
- `vista_recetas_detalladas`
- `vista_productos_completos`

**Problema**: Las vistas están definidas con `SECURITY DEFINER`, lo que puede causar escalación de privilegios.

### 2. RLS Disabled in Public (ERROR)

- `inventario_categorias`
- `inventario_subcategorias`
- `inventario`
- `proveedores`
- `inventario_movimientos`

**Problema**: Las tablas públicas no tienen Row Level Security (RLS) habilitado, permitiendo acceso sin restricciones.

## 🚀 Pasos para Aplicar las Correcciones

### Paso 1: Ejecutar la Migración Principal

1. Ve al **SQL Editor** en tu dashboard de Supabase
2. Ejecuta el contenido del archivo `fix_security_issues.sql`
3. Este script:
   - ✅ Elimina las vistas con `SECURITY DEFINER`
   - ✅ Las recrea sin esa propiedad peligrosa
   - ✅ Habilita RLS en todas las tablas críticas
   - ✅ Crea políticas RLS básicas

### Paso 2: Aplicar Políticas RLS Avanzadas

1. Ejecuta el contenido del archivo `advanced_rls_policies.sql`
2. Este script:
   - 🔒 Implementa control de acceso basado en roles
   - 👥 Diferencia entre admin, manager y usuarios regulares
   - 🛡️ Crea funciones de utilidad para verificar permisos
   - 📊 Proporciona reportes de verificación

## 🎯 Estructura de Permisos Implementada

### Categorías y Subcategorías

- **Lectura**: 🌐 Pública (todos pueden leer)
- **Modificación**: 👑 Solo administradores

### Inventario

- **Lectura**: 🔐 Solo usuarios autenticados
- **Inserción/Actualización**: 👥 Admin y Manager
- **Eliminación**: 👑 Solo administradores

### Proveedores

- **Lectura**: 🔐 Solo usuarios autenticados
- **Modificación**: 👥 Admin y Manager

### Movimientos de Inventario

- **Lectura**: 🔐 Solo usuarios autenticados
- **Inserción**: 👥 Admin y Manager
- **Modificación/Eliminación**: 👑 Solo administradores

## ⚠️ Consideraciones Importantes

### Antes de Ejecutar

1. **Haz backup de tu base de datos**
2. Verifica que tienes la tabla `user_roles` creada
3. Asegúrate de que tu usuario tiene permisos de administrador

### Después de Ejecutar

1. Verifica que las aplicaciones siguen funcionando
2. Revisa los logs por posibles errores de permisos
3. Confirma que los errores desaparecen del dashboard de Supabase

## 🔍 Verificación Post-Migración

### Comandos de Verificación

```sql
-- Verificar RLS habilitado
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- Verificar políticas creadas
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public';

-- Verificar vistas sin SECURITY DEFINER
SELECT viewname, definition
FROM pg_views
WHERE schemaname = 'public';
```

### Indicadores de Éxito

- ✅ No más alertas de "Security Definer View"
- ✅ No más alertas de "RLS Disabled in Public"
- ✅ Usuarios pueden seguir accediendo según sus roles
- ✅ Las vistas funcionan correctamente

## 🆘 Resolución de Problemas

### Si aparecen errores de permisos:

1. Verifica que la tabla `user_roles` existe
2. Confirma que los usuarios tienen roles asignados
3. Revisa que las funciones `check_user_role()` e `is_admin_or_manager()` se crearon

### Si las vistas no funcionan:

1. Ejecuta nuevamente la recreación de vistas del primer script
2. Verifica que todas las tablas referenciadas existen

### Para rollback de emergencia:

```sql
-- Deshabilitar RLS temporalmente si hay problemas
ALTER TABLE public.inventario DISABLE ROW LEVEL SECURITY;
-- (Repetir para otras tablas según necesidad)
```

## 📞 Próximos Pasos de Seguridad

1. **Implementar auditoría**: Logs de cambios en datos sensibles
2. **Rotación de tokens**: Establecer políticas de renovación
3. **Monitoreo**: Alertas por actividades sospechosas
4. **2FA**: Implementar autenticación de dos factores
5. **Backups seguros**: Encriptar respaldos de datos

---

**⚡ Fecha de creación**: 3 de junio de 2025  
**🔄 Última actualización**: 3 de junio de 2025  
**👤 Autor**: Sistema de Migración Automática
