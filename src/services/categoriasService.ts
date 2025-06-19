import { supabaseBrowserClient } from '../lib/supabase';

/**
 * @typedef {Object} Categoria
 * @property {string} id
 * @property {string} nombre
 */

/**
 * @typedef {Object} Subcategoria
 * @property {string} id
 * @property {string} nombre
 * @property {string} categoria_id
 */

/**
 * Obtener todas las categorías
 * @returns {Promise<Array<Categoria>>}
 */
export async function obtenerCategorias() {
  try {
    const { data, error } = await supabaseBrowserClient
      .from('inventario_categorias')
      .select('*')
      .order('nombre', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    return [];
  }
}

/**
 * Obtener todas las subcategorías
 * @returns {Promise<Array<Subcategoria>>}
 */
export async function obtenerSubcategorias() {
  try {
    const { data, error } = await supabaseBrowserClient
      .from('inventario_subcategorias')
      .select('*')
      .order('nombre', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error al obtener subcategorías:', error);
    return [];
  }
}

/**
 * Obtener las subcategorías de una categoría específica
 * @param {string} categoriaId - ID de la categoría
 * @returns {Promise<Array<Subcategoria>>}
 */
export async function obtenerSubcategoriasPorCategoria(categoriaId) {
  try {
    const { data, error } = await supabaseBrowserClient
      .from('inventario_subcategorias')
      .select('*')
      .eq('categoria_id', categoriaId)
      .order('nombre', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error(`Error al obtener subcategorías para categoría ${categoriaId}:`, error);
    return [];
  }
}

/**
 * Crear una nueva categoría
 * @param {string} nombre - Nombre de la categoría
 * @returns {Promise<{success: boolean, data: any, error: any}>}
 */
export async function crearCategoria(nombre) {
  try {
    // Verificar si ya existe una categoría con ese nombre
    const { data: categoriaExistente } = await supabaseBrowserClient
      .from('inventario_categorias')
      .select('id')
      .eq('nombre', nombre)
      .maybeSingle();

    if (categoriaExistente) {
      return {
        success: false,
        data: null,
        error: { message: 'Ya existe una categoría con ese nombre' },
      };
    }

    const { data, error } = await supabaseBrowserClient
      .from('inventario_categorias')
      .insert({ nombre })
      .select()
      .single();

    return {
      success: !error,
      data,
      error,
    };
  } catch (error) {
    console.error('Error al crear categoría:', error);
    return {
      success: false,
      data: null,
      error,
    };
  }
}

/**
 * Crear una nueva subcategoría
 * @param {string} nombre - Nombre de la subcategoría
 * @param {string} categoriaId - ID de la categoría a la que pertenece
 * @returns {Promise<{success: boolean, data: any, error: any}>}
 */
export async function crearSubcategoria(nombre, categoriaId) {
  try {
    // Verificar si ya existe esta subcategoría en esta categoría
    const { data: subcategoriaExistente } = await supabaseBrowserClient
      .from('inventario_subcategorias')
      .select('id')
      .eq('nombre', nombre)
      .eq('categoria_id', categoriaId)
      .maybeSingle();

    if (subcategoriaExistente) {
      return {
        success: false,
        data: null,
        error: { message: 'Ya existe una subcategoría con ese nombre en esta categoría' },
      };
    }

    const { data, error } = await supabaseBrowserClient
      .from('inventario_subcategorias')
      .insert({
        nombre,
        categoria_id: categoriaId,
      })
      .select()
      .single();

    return {
      success: !error,
      data,
      error,
    };
  } catch (error) {
    console.error('Error al crear subcategoría:', error);
    return {
      success: false,
      data: null,
      error,
    };
  }
}

/**
 * Obtener un mapa de subcategorías por categoría
 * @returns {Promise<Record<string, Array<Subcategoria>>>}
 */
export async function obtenerMapaSubcategorias() {
  try {
    const subcategorias = await obtenerSubcategorias();
    const subcategoriasPorCategoria = {};

    subcategorias.forEach((sub) => {
      if (!subcategoriasPorCategoria[sub.categoria_id]) {
        subcategoriasPorCategoria[sub.categoria_id] = [];
      }
      subcategoriasPorCategoria[sub.categoria_id].push(sub);
    });

    return subcategoriasPorCategoria;
  } catch (error) {
    console.error('Error al obtener mapa de subcategorías:', error);
    return {};
  }
}

/**
 * Eliminar una categoría y sus subcategorías
 * @param {string} categoriaId - ID de la categoría a eliminar
 * @returns {Promise<{success: boolean, error: any}>}
 */
export async function eliminarCategoria(categoriaId) {
  try {
    // Primero eliminar todas las subcategorías asociadas
    const { error: errorSubcategorias } = await supabaseBrowserClient
      .from('inventario_subcategorias')
      .delete()
      .eq('categoria_id', categoriaId);

    if (errorSubcategorias) throw errorSubcategorias;

    // Luego eliminar la categoría
    const { error } = await supabaseBrowserClient
      .from('inventario_categorias')
      .delete()
      .eq('id', categoriaId);

    return { success: !error, error };
  } catch (error) {
    console.error(`Error al eliminar categoría ${categoriaId}:`, error);
    return { success: false, error };
  }
}

/**
 * Actualizar una categoría
 * @param {string} categoriaId - ID de la categoría
 * @param {string} nuevoNombre - Nuevo nombre para la categoría
 * @returns {Promise<{success: boolean, error: any}>}
 */
export async function actualizarCategoria(categoriaId, nuevoNombre) {
  try {
    const { error } = await supabaseBrowserClient
      .from('inventario_categorias')
      .update({ nombre: nuevoNombre })
      .eq('id', categoriaId);

    return { success: !error, error };
  } catch (error) {
    console.error(`Error al actualizar categoría ${categoriaId}:`, error);
    return { success: false, error };
  }
}
