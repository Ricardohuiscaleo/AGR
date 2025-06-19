import type { APIRoute } from 'astro';
import { GeminiAIService } from '../../../services/geminiService';
import { BlogService } from '../../../services/blogService';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { temaId } = await request.json();

    if (!temaId) {
      return new Response(JSON.stringify({ error: 'Tema ID es requerido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Verificar que el tema existe
    const tema = GeminiAIService.obtenerTema(temaId);
    if (!tema) {
      return new Response(JSON.stringify({ error: 'Tema no encontrado' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 🕐 Medir tiempo de generación - INICIO
    const tiempoInicio = Date.now();
    const fechaInicio = new Date().toISOString();

    // Generar el blog con Gemini AI
    console.log(`🤖 Generando blog sobre: ${tema.nombre}...`);
    const blogGenerado = await GeminiAIService.generarBlog(temaId);

    // 🕐 Medir tiempo de generación - FIN
    const tiempoFin = Date.now();
    const fechaFin = new Date().toISOString();
    const tiempoGeneracionMs = tiempoFin - tiempoInicio;

    // Limitar título a 60 caracteres máximo
    const tituloLimitado =
      blogGenerado.titulo.length > 60
        ? blogGenerado.titulo.substring(0, 57) + '...'
        : blogGenerado.titulo;

    // Generar slug único y limitado
    const baseSlug = GeminiAIService.generarSlug(tituloLimitado);
    const timestamp = Date.now().toString().slice(-6); // Solo últimos 6 dígitos
    const slugCompleto = `${baseSlug}-${timestamp}`;
    const slug = slugCompleto.length > 60 ? slugCompleto.substring(0, 60) : slugCompleto;

    // Buscar categoría relacionada (IA por defecto)
    const categorias = await BlogService.obtenerCategorias();
    let categoriaId = categorias.find((c) => c.slug === 'ia')?.id;

    // Si no existe la categoría IA, usar la primera disponible
    if (!categoriaId && categorias.length > 0) {
      categoriaId = categorias[0].id;
    }

    // Autor limitado a 60 caracteres
    const autorCompleto = `🤖 IA - ${tema.nombre}`;
    const autor =
      autorCompleto.length > 60 ? autorCompleto.substring(0, 57) + '...' : autorCompleto;

    // Crear el post en Supabase
    const nuevoPost = await BlogService.crearPost({
      titulo: tituloLimitado,
      slug,
      resumen: blogGenerado.resumen.substring(0, 200), // Limitar resumen también
      contenido: blogGenerado.contenido,
      categoria_id: categoriaId,
      tiempo_lectura: blogGenerado.tiempo_lectura,
      tags: blogGenerado.tags,
      publicado: true,
      destacado: false,
      meta_titulo: (blogGenerado.meta_titulo || tituloLimitado).substring(0, 60),
      meta_descripcion: (blogGenerado.meta_descripcion || blogGenerado.resumen).substring(0, 160),
      autor,
      imagen_url: blogGenerado.imagen_url, // 🖼️ Nueva propiedad agregada
    });

    // 📊 REGISTRAR MÉTRICAS LLM - NUEVA FUNCIONALIDAD
    if (nuevoPost && nuevoPost.id) {
      try {
        await BlogService.registrarMetricasLLM({
          post_id: nuevoPost.id,
          modelo_usado: 'gemini-2.0-flash',
          proveedor: 'Google',
          version_modelo: '2.0-flash',

          // Métricas de tiempo
          tiempo_generacion_ms: tiempoGeneracionMs,
          tiempo_inicio: fechaInicio,
          tiempo_fin: fechaFin,

          // Contexto de generación
          tema_seleccionado: tema.nombre,
          prompt_sistema: 'Sistema de generación de blogs con Gemini AI',
          prompt_usuario: tema.prompt,

          // Calidad estimada (basada en longitud del contenido)
          calidad_estimada:
            blogGenerado.contenido.length > 1500 ? 5 : blogGenerado.contenido.length > 1000 ? 4 : 3,
          requiere_revision: false,

          // Metadatos adicionales
          metadata_llm: {
            tema_id: temaId,
            palabras_generadas: blogGenerado.contenido.split(' ').length,
            caracteres_generados: blogGenerado.contenido.length,
            tiempo_lectura_calculado: blogGenerado.tiempo_lectura,
          },
        });

        console.log(`📊 Métricas LLM registradas para el post: ${nuevoPost.id}`);
      } catch (errorMetricas) {
        console.error('⚠️ Error registrando métricas LLM:', errorMetricas);
        // No fallar la creación del post si las métricas fallan
      }
    }

    console.log(`✅ Blog generado exitosamente: ${tituloLimitado} (${tiempoGeneracionMs}ms)`);

    return new Response(
      JSON.stringify({
        success: true,
        post: nuevoPost,
        tema: tema.nombre,
        mensaje: `¡Blog sobre "${tema.nombre}" generado exitosamente!`,
        metricas: {
          tiempo_generacion_ms: tiempoGeneracionMs,
          palabras: blogGenerado.contenido.split(' ').length,
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error generando blog:', error);

    return new Response(
      JSON.stringify({
        error: 'Error interno del servidor al generar el blog',
        details: error instanceof Error ? error.message : 'Error desconocido',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
