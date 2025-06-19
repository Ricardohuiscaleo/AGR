import { B as BlogService } from '../../../chunks/blogService_BiazTkZp.mjs';
export { renderers } from '../../../renderers.mjs';

const POST = async ({ request }) => {
  try {
    const { keywords } = await request.json();
    if (!keywords || !Array.isArray(keywords)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Keywords son requeridas y deben ser un array",
          blogs: []
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    let blogsEncontrados = [];
    for (const keyword of keywords) {
      const blogsPorTag = await BlogService.obtenerPostsPorTag(keyword, 10);
      blogsEncontrados = [...blogsEncontrados, ...blogsPorTag];
    }
    const blogsUnicos = blogsEncontrados.filter(
      (blog, index, array) => array.findIndex((b) => b.id === blog.id) === index
    );
    blogsUnicos.sort(
      (a, b) => new Date(b.fecha_publicacion).getTime() - new Date(a.fecha_publicacion).getTime()
    );
    return new Response(
      JSON.stringify({
        success: true,
        blogs: blogsUnicos,
        total: blogsUnicos.length,
        keywords_buscadas: keywords
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Error buscando blogs por tema:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Error al buscar blogs por tema",
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
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
