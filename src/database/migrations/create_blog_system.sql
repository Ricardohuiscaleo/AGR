-- =====================================================
-- 📝 SISTEMA DE BLOG PARA AGENTE RAG WEBSITE
-- =====================================================
-- Fecha: 17 de junio de 2025
-- Descripción: Estructura completa para sistema de blog dinámico

-- =====================================================
-- 1. TABLA DE CATEGORÍAS DE BLOG
-- =====================================================
CREATE TABLE IF NOT EXISTS public.blog_categorias (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT,
  color VARCHAR(7) DEFAULT '#6B7280', -- Color hex para la categoría
  icono VARCHAR(50) DEFAULT '📄', -- Emoji o nombre de icono
  orden INTEGER DEFAULT 0,
  activa BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =====================================================
-- 2. TABLA DE ENTRADAS DE BLOG
-- =====================================================
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo VARCHAR(200) NOT NULL,
  slug VARCHAR(200) NOT NULL UNIQUE,
  resumen TEXT NOT NULL, -- Descripción corta para cards
  contenido TEXT NOT NULL, -- Contenido completo en markdown
  imagen_url TEXT, -- URL de imagen principal
  imagen_alt VARCHAR(200), -- Alt text para la imagen
  categoria_id UUID REFERENCES public.blog_categorias(id) ON DELETE SET NULL,
  autor VARCHAR(100) DEFAULT 'Agente RAG Team',
  fecha_publicacion TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  tiempo_lectura INTEGER DEFAULT 5, -- Minutos de lectura estimados
  tags TEXT[] DEFAULT '{}', -- Array de tags
  publicado BOOLEAN DEFAULT false,
  destacado BOOLEAN DEFAULT false, -- Para posts destacados
  vistas INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  meta_titulo VARCHAR(60), -- SEO title
  meta_descripcion VARCHAR(160), -- SEO description
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =====================================================
-- 3. TABLA DE COMENTARIOS (OPCIONAL)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.blog_comentarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  autor_nombre VARCHAR(100) NOT NULL,
  autor_email VARCHAR(200) NOT NULL,
  contenido TEXT NOT NULL,
  aprobado BOOLEAN DEFAULT false,
  parent_id UUID REFERENCES public.blog_comentarios(id) ON DELETE CASCADE, -- Para respuestas
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =====================================================
-- 4. FUNCIONES DE UTILIDAD
-- =====================================================
c.blog_posts(categoria_id);
-- Función para actualizar updated_at automáticamenteado ON public.blog_posts(publicado);
CREATE OR REPLACE FUNCTION update_updated_at_column()stacado);
RETURNS TRIGGER AS $$EATE INDEX IF NOT EXISTS idx_blog_posts_fecha ON public.blog_posts(fecha_publicacion DESC);
BEGINblog_posts_slug ON public.blog_posts(slug);
  NEW.updated_at = timezone('utc'::text, now());orias(slug);
  RETURN NEW;ntarios(post_id);
END;
$$ LANGUAGE plpgsql; =====================================================
IDAD
-- Triggers para actualizar updated_at===
CREATE TRIGGER update_blog_categorias_updated_at
  BEFORE UPDATE ON public.blog_categoriasente
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();EATE OR REPLACE FUNCTION update_updated_at_column()

CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
D;
-- =====================================================
-- 5. TABLA DE MÉTRICAS DE GENERACIÓN LLM (NUEVA)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.blog_generacion_metricas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,BEFORE UPDATE ON public.blog_categorias
  post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,ON update_updated_at_column();
  
  -- Información del modelo LLM
  modelo_usado VARCHAR(100) NOT NULL,
  proveedor VARCHAR(50) NOT NULL,FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  version_modelo VARCHAR(50),
  
  -- Métricas de tokens
  tokens_prompt INTEGER,
  tokens_completion INTEGER,
  tokens_total INTEGER,e categoría
  
  -- Métricas de tiempo
  tiempo_generacion_ms INTEGER,
  tiempo_inicio TIMESTAMP WITH TIME ZONE,c.nombre as categoria_nombre,
  tiempo_fin TIMESTAMP WITH TIME ZONE,,
  
  -- Métricas de costo
  costo_usd DECIMAL(10,6),OM public.blog_posts p
  costo_tokens_input DECIMAL(10,8),
  costo_tokens_output DECIMAL(10,8),
  -- Vista de posts destacados
  -- Parámetros de generación
  temperatura DECIMAL(3,2),
  max_tokens INTEGER,
  top_p DECIMAL(3,2),
  
  -- Información de contexto
  tema_seleccionado VARCHAR(100),
  prompt_sistema TEXT,EATE OR REPLACE VIEW public.blog_posts_recientes AS
  prompt_usuario TEXT,
  
  -- Calidad y métricas adicionales
  calidad_estimada INTEGER CHECK (calidad_estimada >= 1 AND calidad_estimada <= 5),
  requiere_revision BOOLEAN DEFAULT false,MIT 10;
  regeneraciones INTEGER DEFAULT 0,
  
  -- Metadatos adicionales 7. DATOS DE EJEMPLO PARA PRUEBAS
  metadata_llm JSONB,
  errores TEXT,
  -- Insertar categorías de ejemplo
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULLpcion, color, icono, orden) VALUES
);sobre IA y Machine Learning', '#3B82F6', '🤖', 1),
ration', '#10B981', '🔍', 2),
-- =====================================================
-- 6. TABLA DE HISTORIAL DE REGENERACIONES (NUEVA)', '💼', 4),
-- =====================================================
CREATE TABLE IF NOT EXISTS public.blog_regeneracion_historial (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  generacion_id UUID NOT NULL REFERENCES public.blog_generacion_metricas(id) ON DELETE CASCADE,
    titulo, slug, resumen, contenido, categoria_id, tiempo_lectura, tags, publicado, destacado,
  contenido_anterior TEXT,
  contenido_nuevo TEXT,
  razon_regeneracion TEXT,
  usuario_accion VARCHAR(100),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULLia artificial, combinando búsqueda y generación.',
);  '# Introducción a los Agentes RAG\n\nLos Agentes RAG (Retrieval Augmented Generation) representan una evolución significativa en el campo de la inteligencia artificial...\n\n## ¿Qué son los Agentes RAG?\n\nUn Agente RAG combina las capacidades de búsqueda de información con la generación de texto...',
ag'),
-- =====================================================
-- 4. ÍNDICES PARA OPTIMIZACIÓN (ACTUALIZADO)
-- =====================================================  true,
CREATE INDEX IF NOT EXISTS idx_blog_posts_categoria ON public.blog_posts(categoria_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_publicado ON public.blog_posts(publicado);ente RAG',
CREATE INDEX IF NOT EXISTS idx_blog_posts_destacado ON public.blog_posts(destacado);ubre cómo los Agentes RAG transforman la IA combinando búsqueda y generación de contenido inteligente.'
CREATE INDEX IF NOT EXISTS idx_blog_posts_fecha ON public.blog_posts(fecha_publicacion DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_categorias_slug ON public.blog_categorias(slug);Empresa: Guía Completa',
CREATE INDEX IF NOT EXISTS idx_blog_comentarios_post ON public.blog_comentarios(post_id);ia',
lementar sistemas RAG en entornos empresariales, desde la planificación hasta el deployment.',
-- Nuevos índices para métricas LLMo RAG en tu Empresa\n\nLa implementación de sistemas RAG en entornos empresariales requiere una planificación cuidadosa...\n\n## Fases de Implementación\n\n### 1. Análisis de Necesidades\n...',
CREATE INDEX IF NOT EXISTS idx_blog_generacion_post ON public.blog_generacion_metricas(post_id); public.blog_categorias WHERE slug = 'tutoriales'),
CREATE INDEX IF NOT EXISTS idx_blog_generacion_modelo ON public.blog_generacion_metricas(modelo_usado);
CREATE INDEX IF NOT EXISTS idx_blog_generacion_fecha ON public.blog_generacion_metricas(created_at DESC); 'Empresa', 'Implementación', 'Guía'],
CREATE INDEX IF NOT EXISTS idx_blog_generacion_costo ON public.blog_generacion_metricas(costo_usd);
CREATE INDEX IF NOT EXISTS idx_blog_regeneracion_post ON public.blog_regeneracion_historial(post_id);
Implementar RAG en tu Empresa | Agente RAG',
-- =====================================================paso para implementar sistemas RAG en entornos empresariales con éxito.'
-- 6. VISTAS ÚTILES (ACTUALIZADO)
-- =====================================================
  'Casos de Éxito: RAG en el Sector Legal',
-- Vista de posts con información de categoría Y métricas LLM
CREATE OR REPLACE VIEW public.blog_posts_completo AS RAG en despachos legales y cómo han transformado su productividad.',
SELECT sos de Éxito en el Sector Legal\n\nEl sector legal ha sido uno de los primeros en adoptar tecnologías RAG...\n\n## Caso 1: Despacho Internacional\n...',
  p.*,OM public.blog_categorias WHERE slug = 'casos-uso'),
  c.nombre as categoria_nombre,
  c.slug as categoria_slug,', 'Productividad'],
  c.color as categoria_color,
  c.icono as categoria_icono,
  m.modelo_usado, Éxito Reales | Agente RAG',
  m.tokens_total,les están revolucionando su trabajo con sistemas RAG.'
  m.tiempo_generacion_ms,
  m.costo_usd,
  m.tema_seleccionado,25',
  m.calidad_estimada,
  m.regeneracionesles tendencias en inteligencia artificial que definirán el 2025 y más allá.',
FROM public.blog_posts p  '# El Futuro de la IA: Tendencias 2025\n\nEl panorama de la inteligencia artificial continúa evolucionando...\n\n## Tendencias Principales\n\n### 1. Agentes Autónomos\n...',
LEFT JOIN public.blog_categorias c ON p.categoria_id = c.idias WHERE slug = 'ia'),
LEFT JOIN public.blog_generacion_metricas m ON p.id = m.post_id;
['Futuro', 'Tendencias', 'IA', '2025'],
-- Vista de métricas de costos por modelo
CREATE OR REPLACE VIEW public.blog_metricas_costo AS
SELECT  Tendencias 2025 | Agente RAG',
  modelo_usado,cias en IA que definirán 2025: agentes autónomos, RAG avanzado y más.'
  proveedor,
  COUNT(*) as total_generaciones,) DO NOTHING;
  SUM(tokens_total) as tokens_totales,
  AVG(tokens_total) as tokens_promedio,================================
  SUM(costo_usd) as costo_total,
  AVG(costo_usd) as costo_promedio,
  AVG(tiempo_generacion_ms) as tiempo_promedio_ms,
  AVG(calidad_estimada) as calidad_promedio
FROM public.blog_generacion_metricasURITY;
GROUP BY modelo_usado, proveedorALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ORDER BY costo_total DESC;URITY;

-- Vista de regeneraciones frecuentes
CREATE OR REPLACE VIEW public.blog_posts_problematicos ASCREATE POLICY "Categorías son públicas para lectura" ON public.blog_categorias
SELECT NG (activa = true);
  p.titulo,
  p.slug,cos)
  m.regeneraciones,osts
  m.calidad_estimada,  FOR SELECT USING (publicado = true);
  m.requiere_revision,
  m.modelo_usado,
  COUNT(h.id) as historial_regeneracioness son públicos" ON public.blog_comentarios
FROM public.blog_posts p  FOR SELECT USING (aprobado = true);
JOIN public.blog_generacion_metricas m ON p.id = m.post_id
LEFT JOIN public.blog_regeneracion_historial h ON p.id = h.post_id
WHERE m.regeneraciones > 2 OR m.calidad_estimada <= 3
GROUP BY p.titulo, p.slug, m.regeneraciones, m.calidad_estimada, m.requiere_revision, m.modelo_usado-- =====================================================
ORDER BY m.regeneraciones DESC, m.calidad_estimada ASC;
ts del blog';
-- ===================================================== 'Entradas principales del blog con contenido completo';
-- 8. POLÍTICAS RLS (ROW LEVEL SECURITY) (ACTUALIZADO)COMMENT ON TABLE public.blog_comentarios IS 'Sistema de comentarios para los posts';
-- =====================================================

-- Habilitar RLS
ALTER TABLE public.blog_categorias ENABLE ROW LEVEL SECURITY;-- =====================================================
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_comentarios ENABLE ROW LEVEL SECURITY;

-- Políticas para categorías (solo lectura pública)-- 3. Pega este código completo
CREATE POLICY "Categorías son públicas para lectura" ON public.blog_categorias
  FOR SELECT USING (activa = true);
-- Esto creará:
-- Políticas para posts (solo posts publicados son públicos)
CREATE POLICY "Posts publicados son públicos" ON public.blog_posts
  FOR SELECT USING (publicado = true);
-- ✅ Datos de ejemplo
-- Políticas para comentarios (solo comentarios aprobados son públicos)
CREATE POLICY "Comentarios aprobados son públicos" ON public.blog_comentarios  FOR SELECT USING (aprobado = true);-- Nuevas políticas para métricas LLM (solo administradores)ALTER TABLE public.blog_generacion_metricas ENABLE ROW LEVEL SECURITY;ALTER TABLE public.blog_regeneracion_historial ENABLE ROW LEVEL SECURITY;-- Solo lectura para usuarios autenticados (métricas son sensibles)CREATE POLICY "Métricas LLM solo para autenticados" ON public.blog_generacion_metricas  FOR SELECT USING (auth.role() = 'authenticated');CREATE POLICY "Historial regeneraciones solo para autenticados" ON public.blog_regeneracion_historial  FOR SELECT USING (auth.role() = 'authenticated');-- =====================================================-- 9. COMENTARIOS Y DOCUMENTACIÓN-- =====================================================COMMENT ON TABLE public.blog_categorias IS 'Categorías para organizar los posts del blog';
COMMENT ON TABLE public.blog_posts IS 'Entradas principales del blog con contenido completo';
COMMENT ON TABLE public.blog_comentarios IS 'Sistema de comentarios para los posts';

-- =====================================================
-- ✅ SCRIPT COMPLETADO
-- =====================================================
-- Para ejecutar este script:
-- 1. Ve a tu panel de Supabase
-- 2. Navega al SQL Editor
-- 3. Pega este código completo
-- 4. Ejecuta con "Run" o Ctrl+Enter
-- 
-- Esto creará:
-- ✅ Tablas optimizadas para blog
-- ✅ Índices para performance
-- ✅ Vistas útiles para consultas
-- ✅ Datos de ejemplo
-- ✅ Políticas de seguridad RLS
-- ✅ Funciones de utilidad