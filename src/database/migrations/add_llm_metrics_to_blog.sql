-- =====================================================
-- 📊 MIGRACIÓN: AGREGAR MÉTRICAS LLM AL SISTEMA DE BLOG
-- =====================================================
-- Fecha: Enero 2025
-- Descripción: Agrega tracking de métricas de generación LLM

-- =====================================================
-- 1. TABLA DE MÉTRICAS DE GENERACIÓN LLM
-- =====================================================
CREATE TABLE IF NOT EXISTS public.blog_generacion_metricas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  
  -- Información del modelo LLM
  modelo_usado VARCHAR(100) NOT NULL,
  proveedor VARCHAR(50) NOT NULL,
  version_modelo VARCHAR(50),
  
  -- Métricas de tokens
  tokens_prompt INTEGER,
  tokens_completion INTEGER,
  tokens_total INTEGER,
  
  -- Métricas de tiempo
  tiempo_generacion_ms INTEGER,
  tiempo_inicio TIMESTAMP WITH TIME ZONE,
  tiempo_fin TIMESTAMP WITH TIME ZONE,
  
  -- Métricas de costo
  costo_usd DECIMAL(10,6),
  costo_tokens_input DECIMAL(10,8),
  costo_tokens_output DECIMAL(10,8),
  
  -- Parámetros de generación
  temperatura DECIMAL(3,2),
  max_tokens INTEGER,
  top_p DECIMAL(3,2),
  
  -- Información de contexto
  tema_seleccionado VARCHAR(100),
  prompt_sistema TEXT,
  prompt_usuario TEXT,
  
  -- Calidad y métricas adicionales
  calidad_estimada INTEGER CHECK (calidad_estimada >= 1 AND calidad_estimada <= 5),
  requiere_revision BOOLEAN DEFAULT false,
  regeneraciones INTEGER DEFAULT 0,
  
  -- Metadatos adicionales
  metadata_llm JSONB,
  errores TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =====================================================
-- 2. TABLA DE HISTORIAL DE REGENERACIONES
-- =====================================================
CREATE TABLE IF NOT EXISTS public.blog_regeneracion_historial (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  generacion_id UUID NOT NULL REFERENCES public.blog_generacion_metricas(id) ON DELETE CASCADE,
  
  contenido_anterior TEXT,
  contenido_nuevo TEXT,
  razon_regeneracion TEXT,
  usuario_accion VARCHAR(100),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =====================================================
-- 3. ÍNDICES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_blog_generacion_post ON public.blog_generacion_metricas(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_generacion_modelo ON public.blog_generacion_metricas(modelo_usado);
CREATE INDEX IF NOT EXISTS idx_blog_generacion_fecha ON public.blog_generacion_metricas(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_generacion_costo ON public.blog_generacion_metricas(costo_usd);
CREATE INDEX IF NOT EXISTS idx_blog_regeneracion_post ON public.blog_regeneracion_historial(post_id);

-- =====================================================
-- 4. ACTUALIZAR VISTAS EXISTENTES
-- =====================================================
CREATE OR REPLACE VIEW public.blog_posts_completo AS
SELECT 
  p.*,
  c.nombre as categoria_nombre,
  c.slug as categoria_slug,
  c.color as categoria_color,
  c.icono as categoria_icono,
  m.modelo_usado,
  m.tokens_total,
  m.tiempo_generacion_ms,
  m.costo_usd,
  m.tema_seleccionado,
  m.calidad_estimada,
  m.regeneraciones
FROM public.blog_posts p
LEFT JOIN public.blog_categorias c ON p.categoria_id = c.id
LEFT JOIN public.blog_generacion_metricas m ON p.id = m.post_id;

-- =====================================================
-- 5. NUEVAS VISTAS PARA MÉTRICAS
-- =====================================================
CREATE OR REPLACE VIEW public.blog_metricas_costo AS
SELECT 
  modelo_usado,
  proveedor,
  COUNT(*) as total_generaciones,
  SUM(tokens_total) as tokens_totales,
  AVG(tokens_total) as tokens_promedio,
  SUM(costo_usd) as costo_total,
  AVG(costo_usd) as costo_promedio,
  AVG(tiempo_generacion_ms) as tiempo_promedio_ms,
  AVG(calidad_estimada) as calidad_promedio
FROM public.blog_generacion_metricas
GROUP BY modelo_usado, proveedor
ORDER BY costo_total DESC;

-- =====================================================
-- 6. POLÍTICAS RLS
-- =====================================================
ALTER TABLE public.blog_generacion_metricas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_regeneracion_historial ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Métricas LLM solo para autenticados" ON public.blog_generacion_metricas
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Historial regeneraciones solo para autenticados" ON public.blog_regeneracion_historial
  FOR SELECT USING (auth.role() = 'authenticated');

-- =====================================================
-- ✅ MIGRACIÓN COMPLETADA
-- =====================================================
