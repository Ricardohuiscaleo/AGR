import type { APIRoute } from 'astro';
import { BlogService } from '../../../services/blogService';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const { keywords } = await request.json();

    if (!keywords || !Array.isArray(keywords)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Keywords son requeridas y deben ser un array',
          blogs: [],
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Buscar blogs por múltiples tags/keywords
    let blogsEncontrados = [];

    for (const keyword of keywords) {
      const blogsPorTag = await BlogService.obtenerPostsPorTag(keyword, 10);
      blogsEncontrados = [...blogsEncontrados, ...blogsPorTag];
    }

    // Eliminar duplicados basados en el ID
    const blogsUnicos = blogsEncontrados.filter(
      (blog, index, array) => array.findIndex((b) => b.id === blog.id) === index
    );

    // Ordenar por fecha de publicación (más recientes primero)
    blogsUnicos.sort(
      (a, b) => new Date(b.fecha_publicacion).getTime() - new Date(a.fecha_publicacion).getTime()
    );

    return new Response(
      JSON.stringify({
        success: true,
        blogs: blogsUnicos,
        total: blogsUnicos.length,
        keywords_buscadas: keywords,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error buscando blogs por tema:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Error al buscar blogs por tema',
        blogs: [],
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
