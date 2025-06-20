import type { APIRoute } from 'astro';
import { BlogService } from '../../../services/blogService';

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    // Obtener estadísticas del blog
    const estadisticas = await BlogService.obtenerEstadisticas();

    return new Response(
      JSON.stringify({
        success: true,
        estadisticas,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Error al obtener estadísticas',
        estadisticas: {
          total_posts: 0,
          total_published: 0,
          total_views: 0,
          total_likes: 0,
          avg_reading_time: 0,
        },
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
