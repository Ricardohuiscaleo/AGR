import type { APIRoute } from 'astro';
import { BlogService } from '../../../services/blogService';

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    // Obtener posts generados por IA
    const blogs = await BlogService.obtenerPostsGeneradosIA(20);

    return new Response(
      JSON.stringify({
        success: true,
        blogs,
        total: blogs.length,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error obteniendo blogs generados:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Error al obtener blogs generados',
        blogs: [],
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
