import type { APIRoute } from 'astro';
import { BlogService } from '../../../services/blogService';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const { postId } = await request.json();

    if (!postId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'ID del post es requerido',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Incrementar vistas usando el servicio
    await BlogService.incrementarVistas(postId);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Vista incrementada correctamente',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error incrementando vistas:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Error al incrementar vista',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
