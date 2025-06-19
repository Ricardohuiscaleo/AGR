import { B as BlogService } from '../../../chunks/blogService_BiazTkZp.mjs';
export { renderers } from '../../../renderers.mjs';

const POST = async ({ request }) => {
  try {
    const { postId } = await request.json();
    if (!postId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "ID del post es requerido"
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    await BlogService.incrementarVistas(postId);
    return new Response(
      JSON.stringify({
        success: true,
        message: "Vista incrementada correctamente"
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Error incrementando vistas:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Error al incrementar vista"
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
