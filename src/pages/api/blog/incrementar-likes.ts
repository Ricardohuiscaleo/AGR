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

    // Incrementar likes usando el servicio
    await BlogService.incrementarLikes(postId);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Like incrementado correctamente',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error incrementando likes:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Error al incrementar like',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
