import { s as supabase } from './supabase_CE7nV3t4.mjs';

class BlogService {
  // =====================================================
  // 📋 MÉTODOS PARA CATEGORÍAS
  // =====================================================
  /**
   * Obtener todas las categorías activas
   */
  static async getCategorias() {
    try {
      const { data, error } = await supabase.from("blog_categorias").select("*").eq("activa", true).order("orden", { ascending: true });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error obteniendo categorías:", error);
      return [];
    }
  }
  /**
   * Método alias para obtenerCategorias (compatibilidad)
   */
  static async obtenerCategorias() {
    return this.getCategorias();
  }
  // =====================================================
  // 📝 MÉTODOS PARA POSTS
  // =====================================================
  /**
   * Crear un nuevo post de blog
   */
  static async crearPost(postData) {
    try {
      const { data, error } = await supabase.from("blog_posts").insert([postData]).select().single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creando post:", error);
      throw error;
    }
  }
  /**
   * Obtener posts destacados (para la página principal)
   */
  static async getPostsDestacados(limit = 6) {
    try {
      const { data, error } = await supabase.from("blog_posts_con_categoria").select(
        `
          id, titulo, slug, resumen, imagen_url, imagen_alt,
          autor, fecha_publicacion, tiempo_lectura, tags,
          categoria_nombre, categoria_color, categoria_icono
        `
      ).eq("publicado", true).eq("destacado", true).order("fecha_publicacion", { ascending: false }).limit(limit);
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error obteniendo posts destacados:", error);
      return [];
    }
  }
  /**
   * Obtener posts recientes
   */
  static async getPostsRecientes(limit = 12) {
    try {
      const { data, error } = await supabase.from("blog_posts_con_categoria").select(
        `
          id, titulo, slug, resumen, imagen_url, imagen_alt,
          autor, fecha_publicacion, tiempo_lectura, tags,
          categoria_nombre, categoria_color, categoria_icono
        `
      ).eq("publicado", true).order("fecha_publicacion", { ascending: false }).limit(limit);
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error obteniendo posts recientes:", error);
      return [];
    }
  }
  /**
   * Obtener posts por categoría
   */
  static async getPostsPorCategoria(categoriaSlug, limit = 10) {
    try {
      const { data, error } = await supabase.from("blog_posts_con_categoria").select(
        `
          id, titulo, slug, resumen, imagen_url, imagen_alt,
          autor, fecha_publicacion, tiempo_lectura, tags,
          categoria_nombre, categoria_color, categoria_icono
        `
      ).eq("publicado", true).eq("categoria_slug", categoriaSlug).order("fecha_publicacion", { ascending: false }).limit(limit);
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error obteniendo posts por categoría:", error);
      return [];
    }
  }
  /**
   * Buscar posts por título, contenido o tags
   */
  static async buscarPosts(termino, limit = 20) {
    try {
      const { data, error } = await supabase.from("blog_posts_con_categoria").select(
        `
          id, titulo, slug, resumen, imagen_url, imagen_alt,
          autor, fecha_publicacion, tiempo_lectura, tags,
          categoria_nombre, categoria_color, categoria_icono
        `
      ).eq("publicado", true).or(`titulo.ilike.%${termino}%,resumen.ilike.%${termino}%,contenido.ilike.%${termino}%`).order("fecha_publicacion", { ascending: false }).limit(limit);
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error buscando posts:", error);
      return [];
    }
  }
  /**
   * Obtener un post completo por slug
   */
  static async getPostPorSlug(slug) {
    try {
      const { data, error } = await supabase.from("blog_posts_con_categoria").select("*").eq("slug", slug).eq("publicado", true).single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error obteniendo post por slug:", error);
      return null;
    }
  }
  // =====================================================
  // 📊 MÉTODOS UTILITARIOS
  // =====================================================
  /**
   * Formatear fecha para mostrar
   */
  static formatearFecha(fecha) {
    try {
      const date = new Date(fecha);
      return date.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });
    } catch (error) {
      return fecha;
    }
  }
  /**
   * Calcular fecha relativa (hace X tiempo)
   */
  static fechaRelativa(fecha) {
    try {
      const ahora = /* @__PURE__ */ new Date();
      const fechaPost = new Date(fecha);
      const diffMs = ahora.getTime() - fechaPost.getTime();
      const diffDias = Math.floor(diffMs / (1e3 * 60 * 60 * 24));
      if (diffDias === 0) return "Hoy";
      if (diffDias === 1) return "Ayer";
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
  static getImagenOPlaceholder(post) {
    if (post.imagen_url) return post.imagen_url;
    const colores = {
      "#3B82F6": "#3B82F6",
      // blue
      "#10B981": "#10B981",
      // green
      "#8B5CF6": "#8B5CF6",
      // purple
      "#F59E0B": "#F59E0B",
      // yellow
      "#EF4444": "#EF4444"
      // red
    };
    const color = colores[post.categoria_color] || "#6B7280";
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
  static truncarTexto(texto, maxLength = 150) {
    if (texto.length <= maxLength) return texto;
    return texto.slice(0, maxLength).trim() + "...";
  }
  // ========================================================================
  // 📈 MÉTODOS PARA ESTADÍSTICAS (SECCIÓN CORREGIDA POR ÚLTIMA VEZ)
  // ========================================================================
  /**
   * NUEVA FUNCIÓN PRIVADA: Obtiene solo el tiempo de generación promedio desde Supabase.
   */
  static async obtenerTiempoGeneracionPromedio() {
    try {
      const { data, error } = await supabase.rpc("get_avg_generation_time");
      if (error) {
        console.error("Error en RPC get_avg_generation_time:", error.message);
        return 0;
      }
      return data || 0;
    } catch (error) {
      console.error("Excepción en obtenerTiempoGeneracionPromedio:", error);
      return 0;
    }
  }
  /**
   * FUNCIÓN MODIFICADA: Ahora obtiene TODAS las estadísticas en una sola llamada.
   */
  static async obtenerEstadisticas() {
    const fallbackStats = {
      total_posts: 0,
      total_published: 0,
      total_views: 0,
      total_likes: 0,
      avg_reading_time: 0,
      avg_generation_time: 0
    };
    try {
      const [statsResult, avgGenTime] = await Promise.all([
        supabase.rpc("get_blog_stats").single(),
        this.obtenerTiempoGeneracionPromedio()
      ]);
      if (statsResult.error) {
        console.error("Error obteniendo estadísticas del blog:", statsResult.error);
        return { ...fallbackStats, avg_generation_time: avgGenTime };
      }
      const baseStats = statsResult.data && typeof statsResult.data === "object" ? statsResult.data : {};
      return {
        ...fallbackStats,
        ...baseStats,
        avg_generation_time: avgGenTime
      };
    } catch (error) {
      console.error("Error en obtenerEstadisticas (combinado):", error);
      return fallbackStats;
    }
  }
  /**
   * Obtener posts por tag específico - VERSIÓN CORREGIDA
   */
  static async obtenerPostsPorTag(tag, limite = 10) {
    try {
      const { data, error } = await supabase.from("blog_posts_con_categoria").select(
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
      ).eq("publicado", true).contains("tags", [tag]).order("fecha_publicacion", { ascending: false }).limit(limite);
      if (error) {
        console.error("Error obteniendo posts por tag:", error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error("Error en obtenerPostsPorTag:", error);
      return [];
    }
  }
  /**
   * Incrementar vistas de un post
   */
  static async incrementarVistas(postId) {
    try {
      const { error } = await supabase.rpc("increment_post_views", {
        post_id: postId
      });
      if (error) {
        console.error("Error incrementando vistas:", error);
      }
    } catch (error) {
      console.error("Error en incrementarVistas:", error);
    }
  }
  /**
   * Incrementar likes de un post
   */
  static async incrementarLikes(postId) {
    try {
      const { error } = await supabase.rpc("increment_post_likes", {
        post_id: postId
      });
      if (error) {
        console.error("Error incrementando likes:", error);
      }
    } catch (error) {
      console.error("Error en incrementarLikes:", error);
    }
  }
  /**
   * Obtener posts generados por IA (filtro por autor que contiene "IA")
   */
  static async obtenerPostsGeneradosIA(limite = 20) {
    try {
      const { data, error } = await supabase.from("blog_posts_con_categoria").select(
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
      ).eq("publicado", true).ilike("autor", "%IA%").order("fecha_publicacion", { ascending: false }).limit(limite);
      if (error) {
        console.error("Error obteniendo posts generados por IA:", error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error("Error en obtenerPostsGeneradosIA:", error);
      return [];
    }
  }
  // =====================================================
  // 📊 MÉTODOS PARA FILTROS Y BUSQUEDAS
  // =====================================================
  /**
   * Filtrar posts por múltiples criterios
   */
  static async filtrarPosts(categoriaSlug, tags, autor, fechaDesde, fechaHasta, limite = 10) {
    try {
      let query = supabase.from("blog_posts_con_categoria").select(
        `
          id, titulo, slug, resumen, imagen_url, imagen_alt,
          autor, fecha_publicacion, tiempo_lectura, tags,
          categoria_nombre, categoria_color, categoria_icono
        `
      ).eq("publicado", true).order("fecha_publicacion", { ascending: false }).limit(limite);
      if (categoriaSlug) {
        query = query.eq("categoria_slug", categoriaSlug);
      }
      if (tags && tags.length > 0) {
        query = query.or(tags.map((tag) => `tags.ilike.%${tag}%`).join(","));
      }
      if (autor) {
        query = query.ilike("autor", `%${autor}%`);
      }
      if (fechaDesde) {
        query = query.gte("fecha_publicacion", fechaDesde);
      }
      if (fechaHasta) {
        query = query.lte("fecha_publicacion", fechaHasta);
      }
      const { data, error } = await query;
      if (error) {
        console.error("Error filtrando posts:", error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error("Error en filtrarPosts:", error);
      return [];
    }
  }
  // =====================================================
  // 🤖 MÉTODOS PARA MÉTRICAS LLM
  // =====================================================
  /**
   * Registrar métricas de generación LLM
   */
  static async registrarMetricasLLM(metricas) {
    try {
      const { data, error } = await supabase.rpc("registrar_metricas_llm", {
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
        p_errores: metricas.errores
      });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error registrando métricas LLM:", error);
      return null;
    }
  }
  /**
   * Registrar regeneración de contenido
   */
  static async registrarRegeneracion(regeneracion) {
    try {
      const { data, error } = await supabase.rpc("registrar_regeneracion", {
        p_post_id: regeneracion.post_id,
        p_generacion_id: regeneracion.generacion_id,
        p_contenido_anterior: regeneracion.contenido_anterior,
        p_contenido_nuevo: regeneracion.contenido_nuevo,
        p_razon_regeneracion: regeneracion.razon_regeneracion,
        p_usuario_accion: regeneracion.usuario_accion || "Sistema"
      });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error registrando regeneración:", error);
      return null;
    }
  }
  /**
   * Obtener estadísticas de costos LLM
   */
  static async obtenerEstadisticasLLM() {
    try {
      const { data, error } = await supabase.rpc("get_llm_cost_stats");
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error obteniendo estadísticas LLM:", error);
      return [];
    }
  }
  /**
   * Obtener posts con métricas completas
   */
  static async obtenerPostsConMetricas(limite = 10) {
    try {
      const { data, error } = await supabase.rpc("get_posts_con_metricas", {
        limit_count: limite
      });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error obteniendo posts con métricas:", error);
      return [];
    }
  }
  /**
   * Marcar post como que requiere revisión
   */
  static async marcarRequiereRevision(postId, requiere = true) {
    try {
      const { error } = await supabase.rpc("marcar_requiere_revision", {
        p_post_id: postId,
        p_requiere: requiere
      });
      if (error) throw error;
    } catch (error) {
      console.error("Error marcando revisión:", error);
    }
  }
  /**
   * Obtener métricas de un post específico
   */
  static async obtenerMetricasPost(postId) {
    try {
      const { data, error } = await supabase.from("blog_generacion_metricas").select("*").eq("post_id", postId).single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error obteniendo métricas del post:", error);
      return null;
    }
  }
  /**
   * Obtener historial de regeneraciones de un post
   */
  static async obtenerHistorialRegeneraciones(postId) {
    try {
      const { data, error } = await supabase.from("blog_regeneracion_historial").select("*").eq("post_id", postId).order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error obteniendo historial de regeneraciones:", error);
      return [];
    }
  }
}

export { BlogService as B };
