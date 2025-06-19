# 🍔 Módulo de Productos de Venta

## 📋 Resumen del Plan de Implementación

Este módulo permite gestionar productos de venta con **cálculo automático de costos** basado en recetas e ingredientes del inventario existente.

### ✅ Estado Actual: **Fase 1 - Implementación en Supabase**

---

## 🚀 Instrucciones de Implementación en Supabase

### Paso 1: Preparación

1. **Accede a tu panel de Supabase**: https://app.supabase.com
2. **Selecciona tu proyecto** donde ya tienes el sistema de inventario
3. **Ve al SQL Editor** (icono de consola en el menú lateral)

### Paso 2: Ejecutar Migración Principal

1. **Crea un nuevo script** en el SQL Editor
2. **Copia y pega** todo el contenido del archivo:
   ```
   src/database/migrations/create_productos_venta_tables.sql
   ```
3. **Ejecuta el script** (botón "Run" o Ctrl+Enter)

Este script creará:

- ✅ **Tabla `productos_venta`** - Productos finales con costos calculados
- ✅ **Tabla `recetas_ingredientes`** - Recetas con ingredientes del inventario
- ✅ **Tabla `categorias_productos`** - Categorías para organizar productos
- ✅ **Vistas optimizadas** - Para consultas complejas
- ✅ **Políticas RLS** - Seguridad de datos
- ✅ **Funciones y triggers** - Automatización

### Paso 3: Verificar Implementación

1. **Crea otro script** en el SQL Editor
2. **Copia y pega** el contenido del archivo:
   ```
   src/database/migrations/verificacion_productos_venta.sql
   ```
3. **Ejecuta la verificación**

Deberías ver:

- ✅ Confirmación de tablas creadas
- ✅ Estructura de columnas correcta
- ✅ Relaciones (foreign keys) establecidas
- ✅ Índices y políticas RLS activas

### Paso 4: Cargar Datos de Prueba

1. **Crea un tercer script** en el SQL Editor
2. **Copia y pega** el contenido del archivo:
   ```
   src/database/migrations/datos_prueba_productos_venta.sql
   ```
3. **Ejecuta el script**

Esto creará:

- 🍔 **4 productos de venta** (hamburguesas, papas, combo)
- 📋 **Recetas completas** con ingredientes reales del inventario
- 💰 **Costos calculados automáticamente**
- 📊 **Márgenes de utilidad** calculados

---

## 🔍 Verificación Final

Después de ejecutar todos los scripts, puedes validar que todo funciona ejecutando estas consultas:

```sql
-- Ver productos con costos calculados
SELECT
    nombre_producto,
    costo_calculado_ingredientes,
    precio_venta_final_manual,
    ROUND(((precio_venta_final_manual - costo_calculado_ingredientes) / costo_calculado_ingredientes) * 100, 1) as margen_porcentaje
FROM productos_venta
WHERE activo = true;

-- Ver recetas detalladas
SELECT
    p.nombre_producto,
    i.nombre as ingrediente,
    r.cantidad_ingrediente,
    r.unidad_medida_ingrediente_en_receta,
    i.precio_costo,
    ROUND(r.cantidad_ingrediente * i.precio_costo, 2) as costo_ingrediente
FROM productos_venta p
JOIN recetas_ingredientes r ON p.id = r.producto_venta_id
JOIN inventario i ON r.ingrediente_inventario_id = i.id
ORDER BY p.nombre_producto;
```

---

## 📂 Archivos Creados

### Migraciones de Base de Datos:

- `src/database/migrations/create_productos_venta_tables.sql` - **Migración principal**
- `src/database/migrations/verificacion_productos_venta.sql` - **Script de verificación**
- `src/database/migrations/datos_prueba_productos_venta.sql` - **Datos de prueba**

### Servicios Backend:

- `src/services/productosVentaService.ts` - **Servicio completo con CRUD y cálculos**

---

## 🎯 Funcionalidades Implementadas

### ✅ Gestión de Productos

- Crear productos de venta con descripción y categoría
- Definir precios manuales o usar precios sugeridos automáticos
- Activar/desactivar productos sin eliminar datos

### ✅ Sistema de Recetas

- Vincular ingredientes del inventario existente
- Especificar cantidades y unidades por ingrediente
- Conversión automática entre unidades de medida

### ✅ Cálculo Automático de Costos

- Suma automática de costos de todos los ingredientes
- Precio sugerido basado en margen configurable (default: 180%)
- Actualización en tiempo real al modificar recetas

### ✅ Análisis de Rentabilidad

- Cálculo de margen de utilidad por producto
- Estadísticas generales de productos
- Función para recalcular todos los costos

---

## 🔄 Próximos Pasos del Plan

### Fase 2: Servicios Backend ✅

- [x] Servicio `productosVentaService.ts` implementado
- [x] CRUD completo para productos de venta
- [x] Funciones de cálculo automático de costos
- [x] Sistema de conversión de unidades

### Fase 3: Frontend (Siguiente)

- [ ] Página `/dashboard/productos`
- [ ] Modal de crear/editar productos
- [ ] Constructor de recetas visual
- [ ] Dashboard con métricas de rentabilidad

---

## 🛠️ Comandos de Mantenimiento

```sql
-- Recalcular costos de todos los productos
SELECT calcular_costo_producto(id) FROM productos_venta WHERE activo = true;

-- Ver productos con mayor margen
SELECT nombre_producto,
       ROUND(((precio_venta_final_manual - costo_calculado_ingredientes) / costo_calculado_ingredientes) * 100, 1) as margen
FROM productos_venta
WHERE activo = true AND costo_calculado_ingredientes > 0
ORDER BY margen DESC;

-- Backup de productos
SELECT * FROM productos_venta WHERE activo = true;
SELECT * FROM recetas_ingredientes;
```

---

## 📞 Soporte

Si encuentras algún error durante la implementación:

1. **Revisa los logs** en el SQL Editor de Supabase
2. **Verifica** que la tabla `inventario` existe y tiene datos
3. **Confirma** que tienes permisos de escritura en la base de datos
4. **Ejecuta** el script de verificación para diagnosticar problemas

---

**🎉 ¡El módulo está listo para implementar en Supabase!**

Sigue los pasos en orden y tendrás un sistema completo de gestión de productos con cálculo automático de costos.
