import { supabaseBrowserClient } from '../lib/supabase';

/**
 * @typedef {Object} Proveedor
 * @property {string} id
 * @property {string} nombre
 * @property {string} [email]
 * @property {string} [telefono]
 * @property {string} [direccion]
 * @property {string} [notas]
 * @property {string} [created_at]
 * @property {string} [updated_at]
 */

/**
 * Obtener todos los proveedores
 * @returns {Promise<Array<Proveedor>>}
 */
export async function obtenerProveedores() {
  try {
    const { data, error } = await supabaseBrowserClient
      .from('proveedores')
      .select('*')
      .order('nombre', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error al obtener proveedores:', error);
    return [];
  }
}

/**
 * Obtener un proveedor por su ID
 * @param {string} id - ID del proveedor
 * @returns {Promise<Proveedor|null>}
 */
export async function obtenerProveedorPorId(id) {
  try {
    const { data, error } = await supabaseBrowserClient
      .from('proveedores')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error al obtener proveedor con ID ${id}:`, error);
    return null;
  }
}

/**
 * Obtener un proveedor por su nombre
 * @param {string} nombre - Nombre del proveedor
 * @returns {Promise<Proveedor|null>}
 */
export async function obtenerProveedorPorNombre(nombre) {
  try {
    const { data, error } = await supabaseBrowserClient
      .from('proveedores')
      .select('*')
      .eq('nombre', nombre)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error al obtener proveedor con nombre ${nombre}:`, error);
    return null;
  }
}

/**
 * Crear un nuevo proveedor
 * @param {Proveedor} proveedor - Datos del proveedor
 * @returns {Promise<{success: boolean, data: Proveedor|null, error: any}>}
 */
export async function crearProveedor(proveedor) {
  try {
    // Verificar si ya existe un proveedor con ese nombre
    const proveedorExistente = await obtenerProveedorPorNombre(proveedor.nombre);

    if (proveedorExistente) {
      return {
        success: false,
        data: null,
        error: { message: 'Ya existe un proveedor con ese nombre' },
      };
    }

    const { data, error } = await supabaseBrowserClient
      .from('proveedores')
      .insert(proveedor)
      .select()
      .single();

    return {
      success: !error,
      data,
      error,
    };
  } catch (error) {
    console.error('Error al crear proveedor:', error);
    return {
      success: false,
      data: null,
      error,
    };
  }
}

/**
 * Actualizar un proveedor existente
 * @param {string} id - ID del proveedor
 * @param {Proveedor} proveedor - Nuevos datos del proveedor
 * @returns {Promise<{success: boolean, data: Proveedor|null, error: any}>}
 */
export async function actualizarProveedor(id, proveedor) {
  try {
    const { data, error } = await supabaseBrowserClient
      .from('proveedores')
      .update(proveedor)
      .eq('id', id)
      .select()
      .single();

    return {
      success: !error,
      data,
      error,
    };
  } catch (error) {
    console.error(`Error al actualizar proveedor con ID ${id}:`, error);
    return {
      success: false,
      data: null,
      error,
    };
  }
}

/**
 * Eliminar un proveedor
 * @param {string} id - ID del proveedor a eliminar
 * @returns {Promise<{success: boolean, error: any}>}
 */
export async function eliminarProveedor(id) {
  try {
    const { error } = await supabaseBrowserClient.from('proveedores').delete().eq('id', id);

    return { success: !error, error };
  } catch (error) {
    console.error(`Error al eliminar proveedor con ID ${id}:`, error);
    return { success: false, error };
  }
}

/**
 * Buscar o crear un proveedor por nombre
 * Si el proveedor existe, devuelve su ID
 * Si no existe, lo crea y devuelve el ID del nuevo proveedor
 * @param {string} nombre - Nombre del proveedor
 * @returns {Promise<{id: string|null, error: any}>}
 */
export async function buscarOCrearProveedor(nombre) {
  try {
    // Verificar si ya existe
    const proveedorExistente = await obtenerProveedorPorNombre(nombre);

    if (proveedorExistente) {
      return { id: proveedorExistente.id, error: null };
    }

    // Crear nuevo proveedor
    const { data, error } = await supabaseBrowserClient
      .from('proveedores')
      .insert({ nombre })
      .select()
      .single();

    if (error) throw error;

    return { id: data?.id || null, error: null };
  } catch (error) {
    console.error('Error en buscarOCrearProveedor:', error);
    return { id: null, error };
  }
}
