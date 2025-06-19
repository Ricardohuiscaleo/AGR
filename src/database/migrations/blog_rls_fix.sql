-- =====================================================
-- 🔒 POLÍTICAS RLS ADICIONALES PARA BLOG SYSTEM
-- =====================================================
-- Fecha: 17 de junio de 2025
-- Descripción: Políticas adicionales para permitir inserción de posts

-- =====================================================
-- POLÍTICAS PARA INSERCIÓN DE POSTS
-- =====================================================

-- Permitir inserción de posts desde la API (usando service_role key)
CREATE POLICY "Permitir inserción de posts via API" ON public.blog_posts
  FOR INSERT 
  WITH CHECK (true);

-- Permitir inserción de categorías (si es necesario)
CREATE POLICY "Permitir inserción de categorías via API" ON public.blog_categorias
  FOR INSERT 
  WITH CHECK (true);

-- Permitir actualización de posts existentes (para estadísticas)
CREATE POLICY "Permitir actualización de estadísticas" ON public.blog_posts
  FOR UPDATE 
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- OTORGAR PERMISOS NECESARIOS
-- =====================================================

-- Otorgar permisos a usuarios anónimos para insertar posts
GRANT INSERT ON public.blog_posts TO anon;
GRANT INSERT ON public.blog_categorias TO anon;
GRANT UPDATE ON public.blog_posts TO anon;

-- Otorgar permisos a usuarios autenticados
GRANT INSERT ON public.blog_posts TO authenticated;
GRANT INSERT ON public.blog_categorias TO authenticated;
GRANT UPDATE ON public.blog_posts TO authenticated;

-- =====================================================
-- VERIFICACIÓN DE POLÍTICAS
-- =====================================================

-- Mostrar todas las políticas actuales
SELECT 
  tablename,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'blog_%'
ORDER BY tablename, policyname;