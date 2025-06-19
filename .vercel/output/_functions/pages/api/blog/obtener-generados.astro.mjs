import { B as BlogService } from '../../../chunks/blogService_BiazTkZp.mjs';
export { renderers } from '../../../renderers.mjs';

const GET = async () => {
  try {
    const blogs = await BlogService.obtenerPostsGeneradosIA(20);
    return new Response(
      JSON.stringify({
        success: true,
        blogs,
        total: blogs.length
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Error obteniendo blogs generados:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Error al obtener blogs generados",
        blogs: []
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
