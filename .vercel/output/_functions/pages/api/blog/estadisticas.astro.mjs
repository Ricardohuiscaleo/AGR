import { B as BlogService } from '../../../chunks/blogService_BiazTkZp.mjs';
export { renderers } from '../../../renderers.mjs';

const GET = async () => {
  try {
    const estadisticas = await BlogService.obtenerEstadisticas();
    return new Response(
      JSON.stringify({
        success: true,
        estadisticas
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Error obteniendo estadísticas:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Error al obtener estadísticas",
        estadisticas: {
          total_posts: 0,
          total_published: 0,
          total_views: 0,
          total_likes: 0,
          avg_reading_time: 0
        }
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
