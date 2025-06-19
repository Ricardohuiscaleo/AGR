// =====================================================
// 📝 SERVICIO DE BLOG PARA SUPABASE (VERSIÓN FINALÍSIMA, POST-FLAGELACIÓN)
// =====================================================
// Fecha: 17 de junio de 2025
// Descripción: Servicio para consultas del sistema de blog

import { supabase } from '../lib/supabase';

// =====================================================
// 🔧 TIPOS Y INTERFACES
// =====================================================

export interface BlogCategoria {
  id: string;
  nombre: string;
  slug: string;
  descripcion?: string;
  color: string;
  icono: string;
  orden: number;
  activa: boolean;
  created_at: string;
  updated_at: string;
}

export interface BlogPost {
  id: string;
  titulo: string;
  slug: string;
  resumen: string;
  contenido: string;
  imagen_url?: string;
  imagen_alt?: string;
  categoria_id?: string;
  autor: string;
  fecha_publicacion: string;
  tiempo_lectura: number;
  tags: string[];
  publicado: boolean;
  destacado: boolean;
  vistas: number;
  likes: number;
  meta_titulo?: string;
  meta_descripcion?: string;
  created_at: string;
  updated_at: string;
  // Campos de la vista con categoría
  categoria_nombre?: string;
  categoria_slug?: string;
  categoria_color?: string;
  categoria_icono?: string;
}

export interface BlogPostPreview {
  id: string;
  titulo: string;
  slug: string;
  resumen: string;
  imagen_url?: string;
  imagen_alt?: string;
  autor: string;
  fecha_publicacion: string;
  tiempo_lectura: number;
  tags: string[];
  categoria_nombre?: string;
  categoria_color?: string;
  categoria_icono?: string;
}

// Nuevas interfaces para métricas LLM
export interface BlogGeneracionMetricas {
  id: string;
  post_id: string;
  modelo_usado: string;
  proveedor: string;
  version_modelo?: string;
  tokens_prompt?: number;
  tokens_completion?: number;
  tokens_total?: number;
  tiempo_generacion_ms?: number;
  tiempo_inicio?: string;
  tiempo_fin?: string;
  costo_usd?: number;
  costo_tokens_input?: number;
  costo_tokens_output?: number;
  temperatura?: number;
  max_tokens?: number;
  top_p?: number;
  tema_seleccionado?: string;
  prompt_sistema?: string;
  prompt_usuario?: string;
  calidad_estimada?: number;
  requiere_revision: boolean;
  regeneraciones: number;
  metadata_llm?: any;
  errores?: string;
  created_at: string;
}

export interface BlogRegeneracionHistorial {
  id: string;
  post_id: string;
  generacion_id: string;
  contenido_anterior: string;
  contenido_nuevo: string;
  razon_regeneracion: string;
  usuario_accion: string;
  created_at: string;
}

export interface LLMCostStats {
  modelo: string;
  proveedor: string;
  total_posts: number;
  tokens_totales: number;
  costo_total: number;
  costo_promedio: number;
  tiempo_promedio_ms: number;
  calidad_promedio: number;
}

export interface PostConMetricas {
  id: string;
  titulo: string;
  slug: string;
  resumen: string;
  fecha_publicacion: string;
  categoria_nombre: string;
  modelo_usado: string;
  tokens_total: number;
  costo_usd: number;
  calidad_estimada: number;
  regeneraciones: number;
}

// =====================================================
// 📊 SERVICIO PRINCIPAL
// =====================================================

export class BlogService {
  // =====================================================
  // 📋 MÉTODOS PARA CATEGORÍAS
  // =====================================================

  /**
   * Obtener todas las categorías activas
   */
  static async getCategorias(): Promise<BlogCategoria[]> {
    try {
      const { data, error } = await supabase
        .from('blog_categorias')
        .select('*')
        .eq('activa', true)
        .order('orden', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error obteniendo categorías:', error);
      return [];
    }
  }

  /**
   * Método alias para obtenerCategorias (compatibilidad)
   */
  static async obtenerCategorias(): Promise<BlogCategoria[]> {
    return this.getCategorias();
  }

  // =====================================================
  // 📝 MÉTODOS PARA POSTS
  // =====================================================

  /**
   * Crear un nuevo post de blog
   */
  static async crearPost(postData: {
    titulo: string;
    slug: string;
    resumen: string;
    contenido: string;
    categoria_id?: string | null;
    tiempo_lectura: number;
    tags: string[];
    publicado: boolean;
    destacado: boolean;
    autor: string;
    meta_titulo?: string;
    meta_descripcion?: string;
    imagen_url?: string;
    imagen_alt?: string;
  }): Promise<BlogPost> {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .insert([postData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creando post:', error);
      throw error;
    }
  }

  /**
   * Obtener posts destacados (para la página principal)
   */
  static async getPostsDestacados(limit: number = 6): Promise<BlogPostPreview[]> {
    try {
      const { data, error } = await supabase
        .from('blog_posts_con_categoria')
        .select(
          `
          id, titulo, slug, resumen, imagen_url, imagen_alt,
          autor, fecha_publicacion, tiempo_lectura, tags,
          categoria_nombre, categoria_color, categoria_icono
        `
        )
        .eq('publicado', true)
        .eq('destacado', true)
        .order('fecha_publicacion', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error obteniendo posts destacados:', error);
      return [];
    }
  }

  /**
   * Obtener posts recientes
   */
  static async getPostsRecientes(limit: number = 12): Promise<BlogPostPreview[]> {
    try {
      const { data, error } = await supabase
        .from('blog_posts_con_categoria')
        .select(
          `
          id, titulo, slug, resumen, imagen_url, imagen_alt,
          autor, fecha_publicacion, tiempo_lectura, tags,
          categoria_nombre, categoria_color, categoria_icono
        `
        )
        .eq('publicado', true)
        .order('fecha_publicacion', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error obteniendo posts recientes:', error);
      return [];
    }
  }

  /**
   * Obtener posts por categoría
   */
  static async getPostsPorCategoria(
    categoriaSlug: string,
    limit: number = 10
  ): Promise<BlogPostPreview[]> {
    try {
      const { data, error } = await supabase
        .from('blog_posts_con_categoria')
        .select(
          `
          id, titulo, slug, resumen, imagen_url, imagen_alt,
          autor, fecha_publicacion, tiempo_lectura, tags,
          categoria_nombre, categoria_color, categoria_icono
        `
        )
        .eq('publicado', true)
        .eq('categoria_slug', categoriaSlug)
        .order('fecha_publicacion', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error obteniendo posts por categoría:', error);
      return [];
    }
  }

  /**
   * Buscar posts por título, contenido o tags
   */
  static async buscarPosts(termino: string, limit: number = 20): Promise<BlogPostPreview[]> {
    try {
      const { data, error } = await supabase
        .from('blog_posts_con_categoria')
        .select(
          `
          id, titulo, slug, resumen, imagen_url, imagen_alt,
          autor, fecha_publicacion, tiempo_lectura, tags,
          categoria_nombre, categoria_color, categoria_icono
        `
        )
        .eq('publicado', true)
        .or(`titulo.ilike.%${termino}%,resumen.ilike.%${termino}%,contenido.ilike.%${termino}%`)
        .order('fecha_publicacion', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error buscando posts:', error);
      return [];
    }
  }

  /**
   * Obtener un post completo por slug
   */
  static async getPostPorSlug(slug: string): Promise<BlogPost | null> {
    try {
      const { data, error } = await supabase
        .from('blog_posts_con_categoria')
        .select('*')
        .eq('slug', slug)
        .eq('publicado', true)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error obteniendo post por slug:', error);
      return null;
    }
  }

  // =====================================================
  // 📊 MÉTODOS UTILITARIOS
  // =====================================================

  /**
   * Formatear fecha para mostrar
   */
  static formatearFecha(fecha: string): string {
    try {
      const date = new Date(fecha);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      return fecha;
    }
  }

  /**
   * Calcular fecha relativa (hace X tiempo)
   */
  static fechaRelativa(fecha: string): string {
    try {
      const ahora = new Date();
      const fechaPost = new Date(fecha);
      const diffMs = ahora.getTime() - fechaPost.getTime();
      const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDias === 0) return 'Hoy';
      if (diffDias === 1) return 'Ayer';
      if (diffDias < 7) return `Hace ${diffDias} días`;
      if (diffDias < 30) return `Hace ${Math.floor(diffDias / 7)} semanas`;
      if (diffDias < 365) return `Hace ${Math.floor(diffDias / 30)} meses`;
      return `Hace ${Math.floor(diffDias / 365)} años`;
    } catch (error) {
      return BlogService.formatearFecha(fecha);
    }
  }

  /**
   * Generar imagen placeholder si no hay imagen
   */
  static getImagenOPlaceholder(post: BlogPostPreview): string {
    if (post.imagen_url) return post.imagen_url;

    const colores = {
      '#3B82F6': '#3B82F6', // blue
      '#10B981': '#10B981', // green
      '#8B5CF6': '#8B5CF6', // purple
      '#F59E0B': '#F59E0B', // yellow
      '#EF4444': '#EF4444', // red
    };

    const color = colores[post.categoria_color as keyof typeof colores] || '#6B7280'; // gray fallback
    const title = encodeURIComponent(post.titulo.slice(0, 20));

    const svgContent = `
      <svg width="400" height="240" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${color}"/>
        <text x="50%" y="50%" text-anchor="middle" dy="0.35em" 
              fill="white" font-family="Arial, sans-serif" font-size="16" font-weight="bold">
          ${decodeURIComponent(title)}
        </text>
      </svg>
    `;

    return `data:image/svg+xml;base64,${btoa(svgContent)}`;
  }

  /**
   * Truncar texto
   */
  static truncarTexto(texto: string, maxLength: number = 150): string {
    if (texto.length <= maxLength) return texto;
    return texto.slice(0, maxLength).trim() + '...';
  }

  // ========================================================================
  // 📈 MÉTODOS PARA ESTADÍSTICAS (SECCIÓN CORREGIDA POR ÚLTIMA VEZ)
  // ========================================================================

  /**
   * NUEVA FUNCIÓN PRIVADA: Obtiene solo el tiempo de generación promedio desde Supabase.
   */
  private static async obtenerTiempoGeneracionPromedio(): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('get_avg_generation_time');
      if (error) {
        console.error('Error en RPC get_avg_generation_time:', error.message);
        return 0;
      }
      return data || 0;
    } catch (error) {
      console.error('Excepción en obtenerTiempoGeneracionPromedio:', error);
      return 0;
    }
  }

  /**
   * FUNCIÓN MODIFICADA: Ahora obtiene TODAS las estadísticas en una sola llamada.
   */
  static async obtenerEstadisticas(): Promise<{
    total_posts: number;
    total_published: number;
    total_views: number;
    total_likes: number;
    avg_reading_time: number;
    avg_generation_time: number;
  }> {
    const fallbackStats = {
      total_posts: 0,
      total_published: 0,
      total_views: 0,
      total_likes: 0,
      avg_reading_time: 0,
      avg_generation_time: 0,
    };
    try {
      const [statsResult, avgGenTime] = await Promise.all([
        supabase.rpc('get_blog_stats').single(),
        this.obtenerTiempoGeneracionPromedio(),
      ]);

      if (statsResult.error) {
        console.error('Error obteniendo estadísticas del blog:', statsResult.error);
        return { ...fallbackStats, avg_generation_time: avgGenTime };
      }

      // CORRECCIÓN FINAL Y DEFINITIVA ANTI-RATAS:
      // Se trata statsResult.data como el objeto que es, evitando el spread en un posible nulo.
      const baseStats =
        statsResult.data && typeof statsResult.data === 'object'
          ? (statsResult.data as Record<string, any>)
          : {};

      return {
        ...fallbackStats,
        ...baseStats,
        avg_generation_time: avgGenTime,
      };
    } catch (error) {
      console.error('Error en obtenerEstadisticas (combinado):', error);
      return fallbackStats;
    }
  }

  /**
   * Obtener posts por tag específico - VERSIÓN CORREGIDA
   */
  static async obtenerPostsPorTag(tag: string, limite: number = 10): Promise<BlogPostPreview[]> {
    try {
      // 🔧 CORRECCIÓN: Usar consulta directa en lugar de RPC para incluir todos los campos
      const { data, error } = await supabase
        .from('blog_posts_con_categoria')
        .select(
          `
          id,
          titulo,
          slug,
          resumen,
          imagen_url,
          imagen_alt,
          autor,
          fecha_publicacion,
          tiempo_lectura,
          tags,
          categoria_nombre,
          categoria_color,
          categoria_icono,
          vistas,
          likes
        `
        )
        .eq('publicado', true)
        .contains('tags', [tag]) // 🎯 Buscar el tag en el array de tags
        .order('fecha_publicacion', { ascending: false })
        .limit(limite);

      if (error) {
        console.error('Error obteniendo posts por tag:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error en obtenerPostsPorTag:', error);
      return [];
    }
  }

  /**
   * Incrementar vistas de un post
   */
  static async incrementarVistas(postId: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('increment_post_views', {
        post_id: postId,
      });

      if (error) {
        console.error('Error incrementando vistas:', error);
      }
    } catch (error) {
      console.error('Error en incrementarVistas:', error);
    }
  }

  /**
   * Incrementar likes de un post
   */
  static async incrementarLikes(postId: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('increment_post_likes', {
        post_id: postId,
      });

      if (error) {
        console.error('Error incrementando likes:', error);
      }
    } catch (error) {
      console.error('Error en incrementarLikes:', error);
    }
  }

  /**
   * Obtener posts generados por IA (filtro por autor que contiene "IA")
   */
  static async obtenerPostsGeneradosIA(limite: number = 20): Promise<BlogPostPreview[]> {
    try {
      const { data, error } = await supabase
        .from('blog_posts_con_categoria')
        .select(
          `
          id,
          titulo,
          slug,
          resumen,
          imagen_url,
          imagen_alt,
          autor,
          fecha_publicacion,
          tiempo_lectura,
          tags,
          categoria_nombre,
          categoria_color,
          categoria_icono,
          vistas,
          likes
        `
        )
        .eq('publicado', true)
        .ilike('autor', '%IA%')
        .order('fecha_publicacion', { ascending: false })
        .limit(limite);

      if (error) {
        console.error('Error obteniendo posts generados por IA:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error en obtenerPostsGeneradosIA:', error);
      return [];
    }
  }

  // =====================================================
  // 📊 MÉTODOS PARA FILTROS Y BUSQUEDAS
  // =====================================================

  /**
   * Filtrar posts por múltiples criterios
   */
  static async filtrarPosts(
    categoriaSlug?: string,
    tags?: string[],
    autor?: string,
    fechaDesde?: string,
    fechaHasta?: string,
    limite: number = 10
  ): Promise<BlogPostPreview[]> {
    try {
      let query = supabase
        .from('blog_posts_con_categoria')
        .select(
          `
          id, titulo, slug, resumen, imagen_url, imagen_alt,
          autor, fecha_publicacion, tiempo_lectura, tags,
          categoria_nombre, categoria_color, categoria_icono
        `
        )
        .eq('publicado', true)
        .order('fecha_publicacion', { ascending: false })
        .limit(limite);

      if (categoriaSlug) {
        query = query.eq('categoria_slug', categoriaSlug);
      }

      if (tags && tags.length > 0) {
        query = query.or(tags.map((tag) => `tags.ilike.%${tag}%`).join(','));
      }

      if (autor) {
        query = query.ilike('autor', `%${autor}%`);
      }

      if (fechaDesde) {
        query = query.gte('fecha_publicacion', fechaDesde);
      }

      if (fechaHasta) {
        query = query.lte('fecha_publicacion', fechaHasta);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error filtrando posts:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error en filtrarPosts:', error);
      return [];
    }
  }

  // =====================================================
  // 🤖 MÉTODOS PARA MÉTRICAS LLM
  // =====================================================

  /**
   * Registrar métricas de generación LLM
   */
  static async registrarMetricasLLM(metricas: {
    post_id: string;
    modelo_usado: string;
    proveedor: string;
    version_modelo?: string;
    tokens_prompt?: number;
    tokens_completion?: number;
    tokens_total?: number;
    tiempo_generacion_ms?: number;
    tiempo_inicio?: string;
    tiempo_fin?: string;
    costo_usd?: number;
    costo_tokens_input?: number;
    costo_tokens_output?: number;
    temperatura?: number;
    max_tokens?: number;
    top_p?: number;
    tema_seleccionado?: string;
    prompt_sistema?: string;
    prompt_usuario?: string;
    calidad_estimada?: number;
    requiere_revision?: boolean;
    metadata_llm?: any;
    errores?: string;
  }): Promise<string | null> {
    try {
      const { data, error } = await supabase.rpc('registrar_metricas_llm', {
        p_post_id: metricas.post_id,
        p_modelo_usado: metricas.modelo_usado,
        p_proveedor: metricas.proveedor,
        p_version_modelo: metricas.version_modelo,
        p_tokens_prompt: metricas.tokens_prompt,
        p_tokens_completion: metricas.tokens_completion,
        p_tokens_total: metricas.tokens_total,
        p_tiempo_generacion_ms: metricas.tiempo_generacion_ms,
        p_tiempo_inicio: metricas.tiempo_inicio,
        p_tiempo_fin: metricas.tiempo_fin,
        p_costo_usd: metricas.costo_usd,
        p_costo_tokens_input: metricas.costo_tokens_input,
        p_costo_tokens_output: metricas.costo_tokens_output,
        p_temperatura: metricas.temperatura,
        p_max_tokens: metricas.max_tokens,
        p_top_p: metricas.top_p,
        p_tema_seleccionado: metricas.tema_seleccionado,
        p_prompt_sistema: metricas.prompt_sistema,
        p_prompt_usuario: metricas.prompt_usuario,
        p_calidad_estimada: metricas.calidad_estimada,
        p_requiere_revision: metricas.requiere_revision || false,
        p_metadata_llm: metricas.metadata_llm,
        p_errores: metricas.errores,
      });

      if (error) throw error;
      return data; // UUID de la métrica creada
    } catch (error) {
      console.error('Error registrando métricas LLM:', error);
      return null;
    }
  }

  /**
   * Registrar regeneración de contenido
   */
  static async registrarRegeneracion(regeneracion: {
    post_id: string;
    generacion_id: string;
    contenido_anterior: string;
    contenido_nuevo: string;
    razon_regeneracion: string;
    usuario_accion?: string;
  }): Promise<string | null> {
    try {
      const { data, error } = await supabase.rpc('registrar_regeneracion', {
        p_post_id: regeneracion.post_id,
        p_generacion_id: regeneracion.generacion_id,
        p_contenido_anterior: regeneracion.contenido_anterior,
        p_contenido_nuevo: regeneracion.contenido_nuevo,
        p_razon_regeneracion: regeneracion.razon_regeneracion,
        p_usuario_accion: regeneracion.usuario_accion || 'Sistema',
      });

      if (error) throw error;
      return data; // UUID de la regeneración creada
    } catch (error) {
      console.error('Error registrando regeneración:', error);
      return null;
    }
  }

  /**
   * Obtener estadísticas de costos LLM
   */
  static async obtenerEstadisticasLLM(): Promise<LLMCostStats[]> {
    try {
      const { data, error } = await supabase.rpc('get_llm_cost_stats');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error obteniendo estadísticas LLM:', error);
      return [];
    }
  }

  /**
   * Obtener posts con métricas completas
   */
  static async obtenerPostsConMetricas(limite: number = 10): Promise<PostConMetricas[]> {
    try {
      const { data, error } = await supabase.rpc('get_posts_con_metricas', {
        limit_count: limite,
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error obteniendo posts con métricas:', error);
      return [];
    }
  }

  /**
   * Marcar post como que requiere revisión
   */
  static async marcarRequiereRevision(postId: string, requiere: boolean = true): Promise<void> {
    try {
      const { error } = await supabase.rpc('marcar_requiere_revision', {
        p_post_id: postId,
        p_requiere: requiere,
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error marcando revisión:', error);
    }
  }

  /**
   * Obtener métricas de un post específico
   */
  static async obtenerMetricasPost(postId: string): Promise<BlogGeneracionMetricas | null> {
    try {
      const { data, error } = await supabase
        .from('blog_generacion_metricas')
        .select('*')
        .eq('post_id', postId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error obteniendo métricas del post:', error);
      return null;
    }
  }

  /**
   * Obtener historial de regeneraciones de un post
   */
  static async obtenerHistorialRegeneraciones(
    postId: string
  ): Promise<BlogRegeneracionHistorial[]> {
    try {
      const { data, error } = await supabase
        .from('blog_regeneracion_historial')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error obteniendo historial de regeneraciones:', error);
      return [];
    }
  }
}

// =====================================================
// 🛠️ FUNCIONES AUXILIARES
// =====================================================

/**
 * Hook para usar en componentes React (opcional)
 */
export const useBlogData = () => {
  return {
    getPostsDestacados: BlogService.getPostsDestacados,
    getPostsRecientes: BlogService.getPostsRecientes,
    getCategorias: BlogService.getCategorias,
    buscarPosts: BlogService.buscarPosts,
    formatearFecha: BlogService.formatearFecha,
    fechaRelativa: BlogService.fechaRelativa,
    getImagenOPlaceholder: BlogService.getImagenOPlaceholder,
    truncarTexto: BlogService.truncarTexto,
  };
};

// =====================================================
// 📤 EXPORTAR SERVICIO
// =====================================================

export default BlogService;
