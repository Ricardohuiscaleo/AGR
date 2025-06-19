import type { APIRoute } from 'astro';
import { supabase } from '../../../../lib/supabase';

export const GET: APIRoute = async ({ params }) => {
  try {
    const { blogId } = params;

    if (!blogId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'ID del blog es requerido',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Obtener post completo por ID
    const { data, error } = await supabase
      .from('blog_posts_con_categoria')
      .select('*')
      .eq('id', blogId)
      .eq('publicado', true)
      .single();

    if (error || !data) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Blog no encontrado',
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        blog: data,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error obteniendo blog completo:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Error interno del servidor',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
