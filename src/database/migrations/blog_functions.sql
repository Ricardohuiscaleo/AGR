-- =====================================================
-- 📊 FUNCIONES ADICIONALES PARA ESTADÍSTICAS DEL BLOG
-- =====================================================
-- Fecha: 17 de junio de 2025
-- Descripción: Funciones para incrementar vistas y likes

-- =====================================================
-- 🔢 FUNCIÓN PARA INCREMENTAR VISTAS
-- =====================================================
CREATE OR REPLACE FUNCTION increment_post_views(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.blog_posts 
  SET vistas = vistas + 1
  WHERE id = post_id AND publicado = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 👍 FUNCIÓN PARA INCREMENTAR LIKES
-- =====================================================
CREATE OR REPLACE FUNCTION increment_post_likes(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.blog_posts 
  SET likes = likes + 1
  WHERE id = post_id AND publicado = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 📈 FUNCIÓN PARA OBTENER ESTADÍSTICAS DEL BLOG
-- =====================================================
CREATE OR REPLACE FUNCTION get_blog_stats()
RETURNS TABLE(
  total_posts BIGINT,
  total_published BIGINT,
  total_views BIGINT,
  total_likes BIGINT,
  avg_reading_time NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_posts,
    COUNT(CASE WHEN publicado = true THEN 1 END) as total_published,
    COALESCE(SUM(vistas), 0) as total_views,
    COALESCE(SUM(likes), 0) as total_likes,
    COALESCE(AVG(tiempo_lectura), 0) as avg_reading_time
  FROM public.blog_posts;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 🏷️ FUNCIÓN PARA OBTENER POSTS POR TAG
-- =====================================================
CREATE OR REPLACE FUNCTION get_posts_by_tag(tag_name TEXT, limit_count INTEGER DEFAULT 10)
RETURNS TABLE(
  id UUID,
  titulo VARCHAR(200),
  slug VARCHAR(200),
  resumen TEXT,
  fecha_publicacion TIMESTAMP WITH TIME ZONE,
  tiempo_lectura INTEGER,
  categoria_nombre VARCHAR(100),
  categoria_color VARCHAR(7)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.titulo,
    p.slug,
    p.resumen,
    p.fecha_publicacion,
    p.tiempo_lectura,
    c.nombre as categoria_nombre,
    c.color as categoria_color
  FROM public.blog_posts p
  LEFT JOIN public.blog_categorias c ON p.categoria_id = c.id
  WHERE p.publicado = true 
    AND tag_name = ANY(p.tags)
  ORDER BY p.fecha_publicacion DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 🤖 FUNCIONES PARA MÉTRICAS LLM
-- =====================================================

-- Función para obtener el tiempo promedio de generación LLM
CREATE OR REPLACE FUNCTION get_avg_generation_time()
RETURNS NUMERIC AS $$
BEGIN
  RETURN COALESCE(
    (SELECT AVG(tiempo_generacion_ms) FROM public.blog_generacion_metricas),
    0
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para registrar métricas de generación LLM
CREATE OR REPLACE FUNCTION registrar_metricas_llm(
  p_post_id UUID,
  p_modelo_usado VARCHAR(100),
  p_proveedor VARCHAR(50),
  p_version_modelo VARCHAR(50) DEFAULT NULL,
  p_tokens_prompt INTEGER DEFAULT NULL,
  p_tokens_completion INTEGER DEFAULT NULL,
  p_tokens_total INTEGER DEFAULT NULL,
  p_tiempo_generacion_ms INTEGER DEFAULT NULL,
  p_tiempo_inicio TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_tiempo_fin TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_costo_usd DECIMAL(10,6) DEFAULT NULL,
  p_costo_tokens_input DECIMAL(10,8) DEFAULT NULL,
  p_costo_tokens_output DECIMAL(10,8) DEFAULT NULL,
  p_temperatura DECIMAL(3,2) DEFAULT NULL,
  p_max_tokens INTEGER DEFAULT NULL,
  p_top_p DECIMAL(3,2) DEFAULT NULL,
  p_tema_seleccionado VARCHAR(100) DEFAULT NULL,
  p_prompt_sistema TEXT DEFAULT NULL,
  p_prompt_usuario TEXT DEFAULT NULL,
  p_calidad_estimada INTEGER DEFAULT NULL,
  p_requiere_revision BOOLEAN DEFAULT false,
  p_metadata_llm JSONB DEFAULT NULL,
  p_errores TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  nueva_metrica_id UUID;
BEGIN
  INSERT INTO public.blog_generacion_metricas (
    post_id, modelo_usado, proveedor, version_modelo,
    tokens_prompt, tokens_completion, tokens_total,
    tiempo_generacion_ms, tiempo_inicio, tiempo_fin,
    costo_usd, costo_tokens_input, costo_tokens_output,
    temperatura, max_tokens, top_p,
    tema_seleccionado, prompt_sistema, prompt_usuario,
    calidad_estimada, requiere_revision,
    metadata_llm, errores
  ) VALUES (
    p_post_id, p_modelo_usado, p_proveedor, p_version_modelo,
    p_tokens_prompt, p_tokens_completion, p_tokens_total,
    p_tiempo_generacion_ms, p_tiempo_inicio, p_tiempo_fin,
    p_costo_usd, p_costo_tokens_input, p_costo_tokens_output,
    p_temperatura, p_max_tokens, p_top_p,
    p_tema_seleccionado, p_prompt_sistema, p_prompt_usuario,
    p_calidad_estimada, p_requiere_revision,
    p_metadata_llm, p_errores
  ) RETURNING id INTO nueva_metrica_id;
  
  RETURN nueva_metrica_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para registrar regeneración de contenido
CREATE OR REPLACE FUNCTION registrar_regeneracion(
  p_post_id UUID,
  p_generacion_id UUID,
  p_contenido_anterior TEXT,
  p_contenido_nuevo TEXT,
  p_razon_regeneracion TEXT,
  p_usuario_accion VARCHAR(100) DEFAULT 'Sistema'
)
RETURNS UUID AS $$
DECLARE
  nueva_regeneracion_id UUID;
BEGIN
  -- Incrementar contador de regeneraciones en métricas
  UPDATE public.blog_generacion_metricas 
  SET regeneraciones = regeneraciones + 1
  WHERE id = p_generacion_id;
  
  -- Registrar el historial
  INSERT INTO public.blog_regeneracion_historial (
    post_id, generacion_id, contenido_anterior, contenido_nuevo,
    razon_regeneracion, usuario_accion
  ) VALUES (
    p_post_id, p_generacion_id, p_contenido_anterior, p_contenido_nuevo,
    p_razon_regeneracion, p_usuario_accion
  ) RETURNING id INTO nueva_regeneracion_id;
  
  RETURN nueva_regeneracion_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener estadísticas de costos LLM
CREATE OR REPLACE FUNCTION get_llm_cost_stats()
RETURNS TABLE(
  modelo VARCHAR(100),
  proveedor VARCHAR(50),
  total_posts BIGINT,
  tokens_totales BIGINT,
  costo_total NUMERIC,
  costo_promedio NUMERIC,
  tiempo_promedio_ms NUMERIC,
  calidad_promedio NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.modelo_usado,
    m.proveedor,
    COUNT(*) as total_posts,
    COALESCE(SUM(m.tokens_total), 0) as tokens_totales,
    COALESCE(SUM(m.costo_usd), 0) as costo_total,
    COALESCE(AVG(m.costo_usd), 0) as costo_promedio,
    COALESCE(AVG(m.tiempo_generacion_ms), 0) as tiempo_promedio_ms,
    COALESCE(AVG(m.calidad_estimada), 0) as calidad_promedio
  FROM public.blog_generacion_metricas m
  GROUP BY m.modelo_usado, m.proveedor
  ORDER BY costo_total DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener posts con métricas completas
CREATE OR REPLACE FUNCTION get_posts_con_metricas(limit_count INTEGER DEFAULT 10)
RETURNS TABLE(
  id UUID,
  titulo VARCHAR(200),
  slug VARCHAR(200),
  resumen TEXT,
  fecha_publicacion TIMESTAMP WITH TIME ZONE,
  categoria_nombre VARCHAR(100),
  modelo_usado VARCHAR(100),
  tokens_total INTEGER,
  costo_usd DECIMAL(10,6),
  calidad_estimada INTEGER,
  regeneraciones INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.titulo,
    p.slug,
    p.resumen,
    p.fecha_publicacion,
    c.nombre as categoria_nombre,
    m.modelo_usado,
    m.tokens_total,
    m.costo_usd,
    m.calidad_estimada,
    m.regeneraciones
  FROM public.blog_posts p
  LEFT JOIN public.blog_categorias c ON p.categoria_id = c.id
  LEFT JOIN public.blog_generacion_metricas m ON p.id = m.post_id
  WHERE p.publicado = true
  ORDER BY p.fecha_publicacion DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para marcar post como que requiere revisión
CREATE OR REPLACE FUNCTION marcar_requiere_revision(p_post_id UUID, p_requiere BOOLEAN DEFAULT true)
RETURNS void AS $$
BEGIN
  UPDATE public.blog_generacion_metricas 
  SET requiere_revision = p_requiere
  WHERE post_id = p_post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- ✅ OTORGAR PERMISOS A USUARIO ANÓNIMO
-- =====================================================
GRANT EXECUTE ON FUNCTION increment_post_views(UUID) TO anon;
GRANT EXECUTE ON FUNCTION increment_post_likes(UUID) TO anon;
GRANT EXECUTE ON FUNCTION get_blog_stats() TO anon;
GRANT EXECUTE ON FUNCTION get_posts_by_tag(TEXT, INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION get_avg_generation_time() TO anon;

-- =====================================================
-- ✅ OTORGAR PERMISOS ADICIONALES
-- =====================================================
GRANT EXECUTE ON FUNCTION registrar_metricas_llm(UUID, VARCHAR, VARCHAR, VARCHAR, INTEGER, INTEGER, INTEGER, INTEGER, TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE, DECIMAL, DECIMAL, DECIMAL, DECIMAL, INTEGER, DECIMAL, VARCHAR, TEXT, TEXT, INTEGER, BOOLEAN, JSONB, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION registrar_regeneracion(UUID, UUID, TEXT, TEXT, TEXT, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION get_llm_cost_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_posts_con_metricas(INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION marcar_requiere_revision(UUID, BOOLEAN) TO authenticated;