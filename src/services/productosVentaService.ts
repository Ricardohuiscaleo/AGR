import { supabase } from '../lib/supabase';

// Tipos específicos para productos de venta
export interface ProductoVenta {
  id: string; // Cambiado de number a string para UUID
  nombre_producto: string;
  descripcion?: string;
  costo_calculado_ingredientes: number;
  precio_venta_sugerido_auto: number;
  precio_venta_final_manual: number;
  activo: boolean;
  categoria_producto_id?: string; // Cambiado de number a string para UUID
  imagen_url?: string;
  creado_en: string;
  actualizado_en?: string;
  creado_por?: string;
  actualizado_por?: string;
}

export interface IngredienteReceta {
  id?: string; // Cambiado de number a string para UUID
  producto_venta_id: string; // Cambiado de number a string para UUID
  ingrediente_inventario_id: string; // Cambiado de number a string para UUID
  cantidad_ingrediente: number;
  unidad_medida_ingrediente_en_receta: string;
  // Datos enriquecidos del inventario
  ingrediente_nombre?: string;
  ingrediente_precio_costo?: number;
  ingrediente_unidad_medida?: string;
  costo_proporcional?: number;
}

export interface ProductoVentaCompleto extends ProductoVenta {
  ingredientes: IngredienteReceta[];
  margen_utilidad_porcentaje?: number;
}

export interface ConversionUnidades {
  [key: string]: {
    [key: string]: number; // factor de conversión
  };
}

// Tabla de conversiones de unidades
const CONVERSIONES_UNIDADES: ConversionUnidades = {
  kg: {
    g: 1000,
    gramos: 1000,
    kg: 1,
    kilogramos: 1,
    lb: 2.20462,
    libras: 2.20462,
  },
  g: {
    g: 1,
    gramos: 1,
    kg: 0.001,
    kilogramos: 0.001,
  },
  l: {
    l: 1,
    litros: 1,
    ml: 1000,
    mililitros: 1000,
    cc: 1000,
  },
  ml: {
    ml: 1,
    mililitros: 1,
    cc: 1,
    l: 0.001,
    litros: 0.001,
  },
  unidad: {
    unidad: 1,
    unidades: 1,
    pieza: 1,
    piezas: 1,
    u: 1,
  },
  paquete: {
    paquete: 1,
    paquetes: 1,
    pack: 1,
  },
};

// Clase de error personalizada
export class ProductosVentaError extends Error {
  constructor(
    message: string,
    public originalError?: any
  ) {
    super(message);
    this.name = 'ProductosVentaError';
  }
}

/**
 * Convertir cantidades entre diferentes unidades de medida
 */
export function convertirUnidades(
  cantidad: number,
  unidadOrigen: string,
  unidadDestino: string
): number {
  if (!cantidad || cantidad <= 0) return 0;

  // Normalizar nombres de unidades (minúsculas, sin espacios)
  const origen = unidadOrigen.toLowerCase().trim();
  const destino = unidadDestino.toLowerCase().trim();

  // Si son la misma unidad, no hay conversión
  if (origen === destino) return cantidad;

  // Buscar conversión en la tabla
  const grupoOrigen = Object.keys(CONVERSIONES_UNIDADES).find(
    (grupo) => CONVERSIONES_UNIDADES[grupo][origen] !== undefined
  );

  if (!grupoOrigen) {
    console.warn(
      `Unidad de origen '${origen}' no encontrada en conversiones. Usando cantidad original.`
    );
    return cantidad;
  }

  const factorDestino = CONVERSIONES_UNIDADES[grupoOrigen][destino];
  if (factorDestino === undefined) {
    console.warn(`No se puede convertir de '${origen}' a '${destino}'. Usando cantidad original.`);
    return cantidad;
  }

  // Aplicar conversión: cantidad * (factor_destino / factor_origen)
  const factorOrigen = CONVERSIONES_UNIDADES[grupoOrigen][origen];
  return cantidad * (factorDestino / factorOrigen);
}

/**
 * Limpiar ingredientes huérfanos de recetas
 * Elimina referencias a ingredientes que ya no existen en el inventario
 */
export async function limpiarIngredientesHuerfanos(): Promise<{
  eliminados: number;
  errores: string[];
}> {
  try {
    const errores: string[] = [];
    let eliminados = 0;

    // Obtener todos los ingredientes de recetas
    const { data: ingredientesRecetas, error: errorRecetas } = await supabase
      .from('recetas_ingredientes')
      .select('*');

    if (errorRecetas) {
      throw new ProductosVentaError('Error al obtener ingredientes de recetas', errorRecetas);
    }

    if (!ingredientesRecetas || ingredientesRecetas.length === 0) {
      return { eliminados: 0, errores: [] };
    }

    // Verificar cada ingrediente
    for (const ingrediente of ingredientesRecetas) {
      try {
        const { data: inventarioItem, error: errorInventario } = await supabase
          .from('inventario')
          .select('id')
          .eq('id', ingrediente.ingrediente_inventario_id)
          .single();

        // Si no existe en inventario o está inactivo, eliminar la referencia
        if (errorInventario || !inventarioItem) {
          console.log(
            `🧹 Eliminando ingrediente huérfano: ${ingrediente.ingrediente_inventario_id}`
          );

          const { error: errorEliminar } = await supabase
            .from('recetas_ingredientes')
            .delete()
            .eq('id', ingrediente.id);

          if (errorEliminar) {
            errores.push(
              `Error al eliminar ingrediente ${ingrediente.id}: ${errorEliminar.message}`
            );
          } else {
            eliminados++;
          }
        }
      } catch (error) {
        errores.push(`Error al procesar ingrediente ${ingrediente.id}: ${error.message}`);
      }
    }

    return { eliminados, errores };
  } catch (error) {
    console.error('Error en limpiarIngredientesHuerfanos:', error);
    throw new ProductosVentaError('Error al limpiar ingredientes huérfanos', error);
  }
}

/**
 * Validar integridad de recetas
 * Verifica que todos los ingredientes en las recetas existan y estén activos
 */
export async function validarIntegridadRecetas(): Promise<{
  productosConProblemas: Array<{
    id: string;
    nombre: string;
    ingredientesFaltantes: string[];
  }>;
  resumen: {
    totalProductos: number;
    productosConProblemas: number;
    ingredientesFaltantes: number;
  };
}> {
  try {
    const productos = await obtenerProductosVenta();
    const productosConProblemas = [];
    let totalIngredientesFaltantes = 0;

    for (const producto of productos) {
      const ingredientesFaltantes = [];

      for (const ingrediente of producto.ingredientes) {
        const { data: inventarioItem, error } = await supabase
          .from('inventario')
          .select('id, nombre, estado')
          .eq('id', ingrediente.ingrediente_inventario_id)
          .single();

        if (error || !inventarioItem || inventarioItem.estado !== 'activo') {
          ingredientesFaltantes.push(ingrediente.ingrediente_inventario_id);
          totalIngredientesFaltantes++;
        }
      }

      if (ingredientesFaltantes.length > 0) {
        productosConProblemas.push({
          id: producto.id,
          nombre: producto.nombre_producto,
          ingredientesFaltantes,
        });
      }
    }

    return {
      productosConProblemas,
      resumen: {
        totalProductos: productos.length,
        productosConProblemas: productosConProblemas.length,
        ingredientesFaltantes: totalIngredientesFaltantes,
      },
    };
  } catch (error) {
    console.error('Error en validarIntegridadRecetas:', error);
    throw new ProductosVentaError('Error al validar integridad de recetas', error);
  }
}

/**
 * Calcular el costo total de una receta basado en sus ingredientes (mejorado con mejor manejo de errores)
 */
export async function calcularCostoTotalReceta(ingredientes: IngredienteReceta[]): Promise<number> {
  try {
    let costoTotal = 0;
    const ingredientesEncontrados = [];
    const ingredientesNoEncontrados = [];

    for (const ingrediente of ingredientes) {
      // Obtener información actualizada del inventario
      const { data: itemsInventario, error } = await supabase
        .from('inventario')
        .select('precio_costo, unidad_medida, nombre, estado')
        .eq('id', ingrediente.ingrediente_inventario_id)
        .eq('estado', 'activo'); // Solo ingredientes activos

      if (error) {
        console.error(
          `❌ Error al obtener precio del ingrediente ${ingrediente.ingrediente_inventario_id}:`,
          error
        );
        ingredientesNoEncontrados.push(ingrediente.ingrediente_inventario_id);
        continue;
      }

      // Verificar si se encontró el ingrediente
      if (!itemsInventario || itemsInventario.length === 0) {
        console.warn(
          `⚠️ Ingrediente ${ingrediente.ingrediente_inventario_id} no encontrado o inactivo en inventario`
        );
        ingredientesNoEncontrados.push(ingrediente.ingrediente_inventario_id);
        continue;
      }

      const itemInventario = itemsInventario[0];
      const precioCostoUnitario = itemInventario.precio_costo || 0;
      const unidadInventario = itemInventario.unidad_medida || 'unidad';

      // Convertir la cantidad de la receta a la unidad del inventario
      const cantidadConvertida = convertirUnidades(
        ingrediente.cantidad_ingrediente,
        ingrediente.unidad_medida_ingrediente_en_receta,
        unidadInventario
      );

      // Calcular costo proporcional
      const costoIngrediente = cantidadConvertida * precioCostoUnitario;
      costoTotal += costoIngrediente;

      ingredientesEncontrados.push({
        nombre: itemInventario.nombre,
        cantidad: cantidadConvertida,
        unidad: unidadInventario,
        precio: precioCostoUnitario,
        costo: costoIngrediente,
      });

      console.log(
        `✅ ${itemInventario.nombre}: ${cantidadConvertida} ${unidadInventario} × $${precioCostoUnitario} = $${costoIngrediente}`
      );
    }

    // Mostrar resumen
    if (ingredientesEncontrados.length > 0) {
      console.log(
        `💰 Costo total calculado: $${costoTotal.toFixed(2)} (${ingredientesEncontrados.length} ingredientes)`
      );
    }

    if (ingredientesNoEncontrados.length > 0) {
      console.warn(
        `⚠️ ${ingredientesNoEncontrados.length} ingredientes no encontrados o inactivos`
      );
    }

    return parseFloat(costoTotal.toFixed(2));
  } catch (error) {
    console.error('Error al calcular costo total de receta:', error);
    throw new ProductosVentaError('Error al calcular costo de receta', error);
  }
}

/**
 * Obtener todos los productos de venta con sus recetas
 */
export async function obtenerProductosVenta(): Promise<ProductoVentaCompleto[]> {
  try {
    const { data: productos, error } = await supabase
      .from('productos_venta')
      .select('*')
      .eq('activo', true)
      .order('nombre_producto');

    if (error) {
      throw new ProductosVentaError('Error al obtener productos de venta', error);
    }

    // Para cada producto, obtener sus ingredientes
    const productosCompletos: ProductoVentaCompleto[] = [];

    for (const producto of productos || []) {
      // Obtener ingredientes usando un approach más simple
      const { data: ingredientes, error: errorIngredientes } = await supabase
        .from('recetas_ingredientes')
        .select('*')
        .eq('producto_venta_id', producto.id);

      if (errorIngredientes) {
        console.error(
          `Error al obtener ingredientes del producto ${producto.id}:`,
          errorIngredientes
        );
        continue;
      }

      // Enriquecer ingredientes con datos del inventario de forma separada
      const ingredientesEnriquecidos: IngredienteReceta[] = [];

      for (const ing of ingredientes || []) {
        // CORREGIDO: usar consulta sin .single() para evitar errores PGRST116
        const { data: inventarioItems, error: errorInventario } = await supabase
          .from('inventario')
          .select('id, nombre, precio_costo, unidad_medida')
          .eq('id', ing.ingrediente_inventario_id);

        if (errorInventario) {
          console.error(
            `Error al obtener datos del inventario para ingrediente ${ing.ingrediente_inventario_id}:`,
            errorInventario
          );
          continue;
        }

        // Verificar si se encontró el ingrediente
        if (!inventarioItems || inventarioItems.length === 0) {
          console.warn(
            `⚠️ Ingrediente ${ing.ingrediente_inventario_id} no encontrado en inventario. Saltando...`
          );
          continue;
        }

        const inventarioItem = inventarioItems[0];
        ingredientesEnriquecidos.push({
          ...ing,
          ingrediente_nombre: inventarioItem?.nombre,
          ingrediente_precio_costo: inventarioItem?.precio_costo,
          ingrediente_unidad_medida: inventarioItem?.unidad_medida,
        });
      }

      // Calcular margen de utilidad
      const margen =
        producto.costo_calculado_ingredientes > 0
          ? ((producto.precio_venta_final_manual - producto.costo_calculado_ingredientes) /
              producto.costo_calculado_ingredientes) *
            100
          : 0;

      productosCompletos.push({
        ...producto,
        ingredientes: ingredientesEnriquecidos,
        margen_utilidad_porcentaje: parseFloat(margen.toFixed(1)),
      });
    }

    return productosCompletos;
  } catch (error) {
    console.error('Error en obtenerProductosVenta:', error);
    throw error instanceof ProductosVentaError
      ? error
      : new ProductosVentaError('Error inesperado al obtener productos de venta', error);
  }
}

/**
 * Obtener un producto de venta específico por ID
 */
export async function obtenerProductoVentaPorId(id: string): Promise<ProductoVentaCompleto | null> {
  try {
    const { data: producto, error } = await supabase
      .from('productos_venta')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No encontrado
        return null;
      }
      throw new ProductosVentaError(`Error al obtener producto ${id}`, error);
    }

    // Obtener ingredientes de la receta usando consultas separadas
    const { data: ingredientes, error: errorIngredientes } = await supabase
      .from('recetas_ingredientes')
      .select('*')
      .eq('producto_venta_id', id);

    if (errorIngredientes) {
      throw new ProductosVentaError(
        `Error al obtener ingredientes del producto ${id}`,
        errorIngredientes
      );
    }

    // Enriquecer ingredientes con datos del inventario de forma separada
    const ingredientesEnriquecidos: IngredienteReceta[] = [];

    for (const ing of ingredientes || []) {
      // CORREGIDO: usar consulta sin .single() para evitar errores PGRST116
      const { data: inventarioItems, error: errorInventario } = await supabase
        .from('inventario')
        .select('id, nombre, precio_costo, unidad_medida')
        .eq('id', ing.ingrediente_inventario_id);

      if (errorInventario) {
        console.error(
          `Error al obtener datos del inventario para ingrediente ${ing.ingrediente_inventario_id}:`,
          errorInventario
        );
        continue;
      }

      // Verificar si se encontró el ingrediente
      if (!inventarioItems || inventarioItems.length === 0) {
        console.warn(
          `⚠️ Ingrediente ${ing.ingrediente_inventario_id} no encontrado en inventario. Saltando...`
        );
        continue;
      }

      const inventarioItem = inventarioItems[0];
      ingredientesEnriquecidos.push({
        ...ing,
        ingrediente_nombre: inventarioItem?.nombre,
        ingrediente_precio_costo: inventarioItem?.precio_costo,
        ingrediente_unidad_medida: inventarioItem?.unidad_medida,
      });
    }

    // Calcular margen de utilidad
    const margen =
      producto.costo_calculado_ingredientes > 0
        ? ((producto.precio_venta_final_manual - producto.costo_calculado_ingredientes) /
            producto.costo_calculado_ingredientes) *
          100
        : 0;

    return {
      ...producto,
      ingredientes: ingredientesEnriquecidos,
      margen_utilidad_porcentaje: parseFloat(margen.toFixed(1)),
    };
  } catch (error) {
    console.error(`Error en obtenerProductoVentaPorId(${id}):`, error);
    throw error instanceof ProductosVentaError
      ? error
      : new ProductosVentaError(`Error inesperado al obtener producto ${id}`, error);
  }
}

/**
 * Crear un nuevo producto de venta con su receta
 */
export async function crearProductoVenta(
  datosProducto: Omit<
    ProductoVenta,
    | 'id'
    | 'costo_calculado_ingredientes'
    | 'precio_venta_sugerido_auto'
    | 'creado_en'
    | 'actualizado_en'
  >,
  ingredientesReceta: Omit<IngredienteReceta, 'id' | 'producto_venta_id'>[]
): Promise<ProductoVentaCompleto> {
  try {
    // Calcular costo de la receta
    const costoCalculado = await calcularCostoTotalReceta(
      ingredientesReceta.map((ing) => ({
        ...ing,
        producto_venta_id: '0', // Temporal
        ingrediente_inventario_id: ing.ingrediente_inventario_id,
      }))
    );

    // Calcular precio sugerido (ej. costo × 3)
    const precioSugerido = costoCalculado * 3;

    // Si no se especifica precio final, usar el sugerido
    const precioFinal = datosProducto.precio_venta_final_manual || precioSugerido;

    // Iniciar transacción: crear producto
    const { data: productoCreado, error: errorProducto } = await supabase
      .from('productos_venta')
      .insert({
        ...datosProducto,
        costo_calculado_ingredientes: costoCalculado,
        precio_venta_sugerido_auto: precioSugerido,
        precio_venta_final_manual: precioFinal,
        creado_en: new Date().toISOString(),
        actualizado_en: new Date().toISOString(),
      })
      .select()
      .single();

    if (errorProducto) {
      throw new ProductosVentaError('Error al crear producto de venta', errorProducto);
    }

    // Crear ingredientes de la receta
    if (ingredientesReceta.length > 0) {
      const ingredientesParaInsertar = ingredientesReceta.map((ing) => ({
        ...ing,
        producto_venta_id: productoCreado.id,
        creado_en: new Date().toISOString(),
      }));

      const { error: errorIngredientes } = await supabase
        .from('recetas_ingredientes')
        .insert(ingredientesParaInsertar);

      if (errorIngredientes) {
        // Intentar hacer rollback eliminando el producto creado
        await supabase.from('productos_venta').delete().eq('id', productoCreado.id);
        throw new ProductosVentaError(
          'Error al crear ingredientes de la receta',
          errorIngredientes
        );
      }
    }

    // Retornar el producto completo
    const productoCompleto = await obtenerProductoVentaPorId(productoCreado.id);
    if (!productoCompleto) {
      throw new ProductosVentaError('Error al obtener producto recién creado');
    }

    return productoCompleto;
  } catch (error) {
    console.error('Error en crearProductoVenta:', error);
    throw error instanceof ProductosVentaError
      ? error
      : new ProductosVentaError('Error inesperado al crear producto de venta', error);
  }
}

/**
 * Actualizar un producto de venta y su receta
 */
export async function actualizarProductoVenta(
  id: string,
  datosProducto: Partial<
    Omit<
      ProductoVenta,
      'id' | 'costo_calculado_ingredientes' | 'precio_venta_sugerido_auto' | 'creado_en'
    >
  >,
  ingredientesReceta?: Omit<IngredienteReceta, 'id' | 'producto_venta_id'>[]
): Promise<ProductoVentaCompleto> {
  try {
    let costoCalculado: number | undefined;
    let precioSugerido: number | undefined;

    // Si se proporcionan ingredientes, calcular nuevos costos
    if (ingredientesReceta) {
      costoCalculado = await calcularCostoTotalReceta(
        ingredientesReceta.map((ing) => ({
          ...ing,
          producto_venta_id: id,
        }))
      );
      precioSugerido = costoCalculado * 3;

      // Eliminar ingredientes actuales
      const { error: errorEliminar } = await supabase
        .from('recetas_ingredientes')
        .delete()
        .eq('producto_venta_id', id);

      if (errorEliminar) {
        throw new ProductosVentaError(
          `Error al eliminar ingredientes actuales del producto ${id}`,
          errorEliminar
        );
      }

      // Insertar nuevos ingredientes
      if (ingredientesReceta.length > 0) {
        const ingredientesParaInsertar = ingredientesReceta.map((ing) => ({
          ...ing,
          producto_venta_id: id,
          creado_en: new Date().toISOString(),
        }));

        const { error: errorIngredientes } = await supabase
          .from('recetas_ingredientes')
          .insert(ingredientesParaInsertar);

        if (errorIngredientes) {
          throw new ProductosVentaError(
            `Error al actualizar ingredientes del producto ${id}`,
            errorIngredientes
          );
        }
      }
    }

    // Actualizar producto
    const datosActualizacion: any = {
      ...datosProducto,
      actualizado_en: new Date().toISOString(),
    };

    if (costoCalculado !== undefined) {
      datosActualizacion.costo_calculado_ingredientes = costoCalculado;
      datosActualizacion.precio_venta_sugerido_auto = precioSugerido;
    }

    const { error: errorActualizar } = await supabase
      .from('productos_venta')
      .update(datosActualizacion)
      .eq('id', id);

    if (errorActualizar) {
      throw new ProductosVentaError(`Error al actualizar producto ${id}`, errorActualizar);
    }

    // Retornar producto actualizado
    const productoActualizado = await obtenerProductoVentaPorId(id);
    if (!productoActualizado) {
      throw new ProductosVentaError(`Producto ${id} no encontrado después de actualizar`);
    }

    return productoActualizado;
  } catch (error) {
    console.error(`Error en actualizarProductoVenta(${id}):`, error);
    throw error instanceof ProductosVentaError
      ? error
      : new ProductosVentaError(`Error inesperado al actualizar producto ${id}`, error);
  }
}

/**
 * Eliminar un producto de venta
 */
export async function eliminarProductoVenta(id: string): Promise<boolean> {
  try {
    // Marcar como inactivo en lugar de eliminar físicamente
    const { error } = await supabase
      .from('productos_venta')
      .update({
        activo: false,
        actualizado_en: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      throw new ProductosVentaError(`Error al eliminar producto ${id}`, error);
    }

    return true;
  } catch (error) {
    console.error(`Error en eliminarProductoVenta(${id}):`, error);
    throw error instanceof ProductosVentaError
      ? error
      : new ProductosVentaError(`Error inesperado al eliminar producto ${id}`, error);
  }
}

/**
 * Recalcular costos de todos los productos activos
 * Útil cuando cambian precios en el inventario
 */
export async function recalcularTodosCostos(): Promise<{ actualizados: number; errores: number }> {
  try {
    const productos = await obtenerProductosVenta();
    let actualizados = 0;
    let errores = 0;

    for (const producto of productos) {
      try {
        if (producto.ingredientes.length > 0) {
          const nuevoCosto = await calcularCostoTotalReceta(producto.ingredientes);
          const nuevoPrecioSugerido = nuevoCosto * 3;

          await supabase
            .from('productos_venta')
            .update({
              costo_calculado_ingredientes: nuevoCosto,
              precio_venta_sugerido_auto: nuevoPrecioSugerido,
              actualizado_en: new Date().toISOString(),
            })
            .eq('id', producto.id);

          actualizados++;
        }
      } catch (error) {
        console.error(`Error al recalcular costos del producto ${producto.id}:`, error);
        errores++;
      }
    }

    return { actualizados, errores };
  } catch (error) {
    console.error('Error en recalcularTodosCostos:', error);
    throw new ProductosVentaError('Error al recalcular costos de productos', error);
  }
}

/**
 * Obtener estadísticas de productos de venta
 */
export async function obtenerEstadisticasProductos() {
  try {
    const { data: productos, error } = await supabase
      .from('productos_venta')
      .select('costo_calculado_ingredientes, precio_venta_final_manual')
      .eq('activo', true);

    if (error) {
      throw new ProductosVentaError('Error al obtener estadísticas', error);
    }

    const totalProductos = productos?.length || 0;
    const ingresosPotenciales =
      productos?.reduce((sum, p) => sum + (p.precio_venta_final_manual || 0), 0) || 0;
    const costosTotales =
      productos?.reduce((sum, p) => sum + (p.costo_calculado_ingredientes || 0), 0) || 0;
    const margenPromedio =
      costosTotales > 0 ? ((ingresosPotenciales - costosTotales) / costosTotales) * 100 : 0;

    return {
      totalProductos,
      ingresosPotenciales: parseFloat(ingresosPotenciales.toFixed(2)),
      costosTotales: parseFloat(costosTotales.toFixed(2)),
      margenPromedio: parseFloat(margenPromedio.toFixed(1)),
    };
  } catch (error) {
    console.error('Error en obtenerEstadisticasProductos:', error);
    throw error instanceof ProductosVentaError
      ? error
      : new ProductosVentaError('Error inesperado al obtener estadísticas', error);
  }
}
