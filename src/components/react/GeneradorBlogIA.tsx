import React, { useState, useEffect, useCallback } from 'react';

// =====================================================================
// DEFINICIONES DE TIPOS Y CONSTANTES
// =====================================================================
interface Tema {
  id: string;
  nombre: string;
  emoji: string;
  descripcion: string;
  keywords: string[];
}

interface Blog {
  id: string;
  titulo: string;
  resumen: string;
  contenido: string;
  fecha_publicacion: string;
  tiempo_lectura: number;
  vistas: number;
  likes: number;
  tags?: string[];
  autor?: string;
  imagen_url?: string; // 🖼️ Nueva propiedad agregada
}

// Interfaz actualizada para incluir el tiempo de generación
interface Estadisticas {
  total_published: number;
  total_views: number;
  total_likes: number;
  avg_reading_time: number;
  avg_generation_time: number;
}

interface EstadoGeneracion {
  estado: 'inicial' | 'generando' | 'exito' | 'error';
  mensaje?: string;
  blogGenerado?: {
    id: string;
    titulo: string;
    tema: string;
    emoji: string;
  } | null;
}

const TEMAS_PREDEFINIDOS: Tema[] = [
  {
    id: 'llm',
    nombre: 'Large Language Models',
    emoji: '🧠',
    descripcion: 'Modelos de lenguaje y sus aplicaciones',
    keywords: ['LLM', 'GPT', 'Transformers', 'NLP', 'ChatGPT', 'Claude', 'Gemini'],
  },
  {
    id: 'rag',
    nombre: 'RAG',
    emoji: '🔍',
    descripcion: 'Generación aumentada por recuperación',
    keywords: ['RAG', 'Vector DB', 'Embeddings', 'Retrieval', 'Knowledge Base'],
  },
  {
    id: 'ia-generativa',
    nombre: 'IA Generativa',
    emoji: '🎨',
    descripcion: 'Creación de contenido con IA',
    keywords: ['Generative AI', 'DALL-E', 'Midjourney', 'Stable Diffusion', 'Content Creation'],
  },
  {
    id: 'machine-learning',
    nombre: 'Machine Learning',
    emoji: '⚡',
    descripcion: 'Aprendizaje automático y algoritmos',
    keywords: [
      'ML',
      'Deep Learning',
      'Neural Networks',
      'Supervised Learning',
      'Unsupervised Learning',
    ],
  },
  {
    id: 'computer-vision',
    nombre: 'Computer Vision',
    emoji: '👁️',
    descripcion: 'Análisis de imágenes por computadora',
    keywords: ['Computer Vision', 'Image Recognition', 'Object Detection'],
  },
  {
    id: 'nlp',
    nombre: 'Procesamiento de Lenguaje Natural',
    emoji: '💬',
    descripcion: 'Comprensión del lenguaje humano',
    keywords: ['NLP', 'Sentiment Analysis', 'Text Mining', 'Chatbots'],
  },
  {
    id: 'automatizacion-ia',
    nombre: 'Automatización con IA',
    emoji: '🤖',
    descripcion: 'Automatización de procesos con IA',
    keywords: ['RPA', 'Automation', 'Process Mining', 'Workflow'],
  },
  {
    id: 'etica-ia',
    nombre: 'Ética en IA',
    emoji: '⚖️',
    descripcion: 'Consideraciones éticas y responsables',
    keywords: ['AI Ethics', 'Bias', 'Fairness', 'Transparency'],
  },
];

const BlogModal: React.FC<{ blog: Blog; onClose: () => void; onLike: (id: string) => void }> = ({
  blog,
  onClose,
  onLike,
}) => {
  const renderMarkdown = (markdown: string) => {
    if (!markdown) return '';

    // 🧹 LIMPIEZA ADICIONAL - Eliminar bloques de código markdown
    const contenidoLimpio = markdown
      .replace(/^```markdown\s*/i, '')
      .replace(/\s*```\s*$/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```\s*$/i, '')
      .trim();

    const html = contenidoLimpio
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold text-white mb-6">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold text-white mb-4 mt-8">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold text-white mb-3 mt-6">$1</h3>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-semibold text-white">$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em class="italic">$1</em>')
      .replace(
        /^- (.*$)/gim,
        '<li class="mb-2 pl-4 relative before:content-[\'•\'] before:absolute before:left-0 before:text-blue-400">$1</li>'
      )
      .replace(/<p><ul>/g, '<ul>')
      .replace(/<\/ul><\/p>/g, '</ul>')
      .replace(/\n/g, '<br />');
    return `<div class="prose prose-invert max-w-none text-gray-300 leading-relaxed">${html.replace(/<p><br \/><\/p>/g, '')}</div>`;
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 border border-gray-600 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-6 border-b border-gray-600 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="text-3xl">
              {TEMAS_PREDEFINIDOS.find((t) => blog.tags?.some((tag) => t.keywords.includes(tag)))
                ?.emoji || '📝'}
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-white truncate">{blog.titulo}</h2>
              <p className="text-gray-400 text-sm">
                {blog.autor || 'IA'} •{' '}
                {new Date(blog.fecha_publicacion).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}{' '}
                • {blog.tiempo_lectura} min
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-3xl transition-colors"
          >
            ×
          </button>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          {/* 🖼️ NUEVA SECCIÓN: Imagen principal del blog */}
          {blog.imagen_url && (
            <div className="relative mb-6 rounded-lg overflow-hidden">
              <img
                src={blog.imagen_url}
                alt={blog.titulo}
                className="w-full h-64 object-cover"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.parentElement.style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </div>
          )}
          <div dangerouslySetInnerHTML={{ __html: renderMarkdown(blog.contenido) }} />
        </main>
        <footer className="flex items-center justify-between p-6 border-t border-gray-600 bg-gray-800/50 flex-shrink-0">
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span>👁️ {blog.vistas || 0} vistas</span>
            <span>❤️ {blog.likes || 0} likes</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onLike(blog.id)}
              className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-lg text-sm transition-colors flex items-center gap-2"
            >
              ❤️ Me gusta
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg text-sm transition-colors"
            >
              Cerrar
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default function GeneradorBlogIA() {
  const [temaSeleccionado, setTemaSeleccionado] = useState<string>('');
  const [estadoGeneracion, setEstadoGeneracion] = useState<EstadoGeneracion>({ estado: 'inicial' });
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [estadisticas, setEstadisticas] = useState<Estadisticas>({
    total_published: 0,
    total_views: 0,
    total_likes: 0,
    avg_reading_time: 0,
    avg_generation_time: 0,
  });
  const [blogSeleccionado, setBlogSeleccionado] = useState<Blog | null>(null);

  useEffect(() => {
    const styles = `
      @keyframes fade-in {
        from { opacity: 0; transform: scale(0.95); }
        to { opacity: 1; transform: scale(1); }
      }
      .animate-fade-in {
        animation: fade-in 0.3s ease-out;
      }
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
      .animate-shimmer {
        animation: shimmer 3s ease-in-out infinite;
      }
    `;
    const styleSheet = document.createElement('style');
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);

    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  const cargarDatos = useCallback(async (temaId = '') => {
    try {
      const temaInfo = TEMAS_PREDEFINIDOS.find((t) => t.id === temaId);
      const esBusquedaPorTema = temaId && temaInfo;

      // 🔧 CORREGIDO: Usar rutas /api/ que están en .htaccess
      const blogsUrl = esBusquedaPorTema
        ? '/api/buscar-blogs' // ✅ Usar ruta /api/ del .htaccess
        : '/api/obtener-blogs'; // ✅ Usar ruta /api/ del .htaccess

      const blogsMethod = esBusquedaPorTema ? 'GET' : 'GET';

      // En GeneradorBlogIA.tsx, dentro de la función cargarDatos

      // ✅ CORRECCIÓN FINAL: buscar-blogs.php espera el ID del tema, no su nombre
      const blogsUrlFinal = esBusquedaPorTema
        ? `${blogsUrl}?tema=${encodeURIComponent(temaInfo.id)}` // <-- LA LÍNEA DE LA GLORIA
        : blogsUrl;

      const [blogsRes, statsRes] = await Promise.all([
        fetch(blogsUrlFinal, {
          method: blogsMethod,
          headers: { 'Content-Type': 'application/json' },
        }),
        fetch('/api/estadisticas'), // ✅ Usar ruta /api/ del .htaccess
      ]);

      const blogsData = await blogsRes.json();
      const statsData = await statsRes.json();

      // 🔧 CORREGIDO: Adaptar a la respuesta de las APIs PHP
      setBlogs(blogsData.blogs || blogsData.resultados || []);
      setEstadisticas(
        statsData.estadisticas || {
          total_published: 0,
          total_views: 0,
          total_likes: 0,
          avg_reading_time: 0,
          avg_generation_time: 0,
        }
      );
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
  }, []);

  useEffect(() => {
    cargarDatos(temaSeleccionado);
  }, [temaSeleccionado, cargarDatos]);

  const handleGenerarBlog = async () => {
    if (!temaSeleccionado) {
      setEstadoGeneracion({ estado: 'error', mensaje: 'Por favor selecciona un tema' });
      return;
    }
    setEstadoGeneracion({ estado: 'generando' });
    try {
      // 🔧 CORREGIDO: Usar la ruta /api/ que está configurada en .htaccess
      const response = await fetch('/api/generar-blog', {
        // ✅ Cambiar a ruta /api/ del .htaccess
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ temaId: temaSeleccionado }),
      });
      const result = await response.json();
      if (result.success) {
        setEstadoGeneracion({ estado: 'exito', blogGenerado: result.post });
        await cargarDatos(temaSeleccionado);
        setTimeout(() => setEstadoGeneracion({ estado: 'inicial' }), 4000);
      } else {
        setEstadoGeneracion({ estado: 'error', mensaje: result.error || 'Error desconocido' });
      }
    } catch (error) {
      console.error('Error generando blog:', error);
      setEstadoGeneracion({ estado: 'error', mensaje: 'Error de conexión' });
    }
  };

  const abrirBlog = async (blogId: string) => {
    try {
      // 🚀 CORREGIDO: Usar rutas /api/ del .htaccess
      await fetch('/api/incrementar-vistas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: blogId }),
      });

      const response = await fetch(`/api/obtener-completo-blog?id=${blogId}`);
      const data = await response.json();

      if (data.success) {
        setBlogSeleccionado(data.blog);
        cargarDatos(temaSeleccionado); // Recargar datos para reflejar las vistas actualizadas
      } else {
        // 🔧 FALLBACK: Si falla la API, buscar en datos locales
        const blog = blogs.find((b) => b.id === blogId);
        if (blog) {
          setBlogSeleccionado(blog);
        }
      }
    } catch (error) {
      console.error('Error abriendo blog:', error);
      // 🔧 FALLBACK: Buscar el blog en los datos ya cargados
      const blog = blogs.find((b) => b.id === blogId);
      if (blog) {
        setBlogSeleccionado(blog);
      }
    }
  };

  const darLike = async (blogId: string) => {
    try {
      // 🚀 CORREGIDO: Usar rutas /api/ del .htaccess
      const response = await fetch('/api/incrementar-likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: blogId }),
      });

      const data = await response.json();

      if (data.success) {
        // 🎯 Actualizar likes con el valor real de la base de datos
        if (blogSeleccionado && blogSeleccionado.id === blogId) {
          setBlogSeleccionado((prev) => (prev ? { ...prev, likes: data.likes } : null));
        }
        const blogIndex = blogs.findIndex((b) => b.id === blogId);
        if (blogIndex > -1) {
          const newBlogs = [...blogs];
          newBlogs[blogIndex].likes = data.likes;
          setBlogs(newBlogs);
        }
        cargarDatos(temaSeleccionado); // Recargar datos para reflejar estadísticas actualizadas
      } else {
        // 🔧 FALLBACK: Si falla la API, actualizar localmente
        if (blogSeleccionado && blogSeleccionado.id === blogId) {
          setBlogSeleccionado((prev) => (prev ? { ...prev, likes: (prev.likes || 0) + 1 } : null));
        }
        const blogIndex = blogs.findIndex((b) => b.id === blogId);
        if (blogIndex > -1) {
          const newBlogs = [...blogs];
          newBlogs[blogIndex].likes = (newBlogs[blogIndex].likes || 0) + 1;
          setBlogs(newBlogs);
        }
      }
    } catch (error) {
      console.error('Error dando like:', error);
      // 🔧 FALLBACK: Actualizar localmente en caso de error
      if (blogSeleccionado && blogSeleccionado.id === blogId) {
        setBlogSeleccionado((prev) => (prev ? { ...prev, likes: (prev.likes || 0) + 1 } : null));
      }
      const blogIndex = blogs.findIndex((b) => b.id === blogId);
      if (blogIndex > -1) {
        const newBlogs = [...blogs];
        newBlogs[blogIndex].likes = (newBlogs[blogIndex].likes || 0) + 1;
        setBlogs(newBlogs);
      }
    }
  };

  const temaActual = TEMAS_PREDEFINIDOS.find((t) => t.id === temaSeleccionado);
  const blogsAMostrar = blogs;

  return (
    <>
      {blogSeleccionado && (
        <BlogModal
          blog={blogSeleccionado}
          onClose={() => setBlogSeleccionado(null)}
          onLike={darLike}
        />
      )}

      <div className={`${blogSeleccionado ? 'opacity-20 pointer-events-none' : ''}`}>
        <div className="text-left mb-8">
          <h2 className="text-5xl md:text-9xl font-bold text-white mb-6 leading-tight">
            Automatizamos la generación de contenido de tú empresa
          </h2>

          <div className="max-w-7xl">
            <p className="text-base sm:text-lg md:text-2xl lg:text-3xl xl:text-4xl text-blue-200 leading-relaxeds">
              Hoy{' '}
              {new Date().toLocaleDateString('es-ES', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}{' '}
              con{' '}
              <span
                className="relative inline-block font-semibold px-2 py-1 rounded-md"
                style={{
                  backgroundImage:
                    'linear-gradient(45deg, #22ff6c 0%, #43ffba 25%, #65f0ff 50%, #43ffba 75%, #22ff6c 100%)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                  display: 'inline',
                  textShadow: 'none',
                  fontWeight: '600',
                }}
              >
                inteligencia artificial RAG
              </span>{' '}
              generar un blog{' '}
              <span className="inline-block bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 bg-[length:200%_100%] text-transparent bg-clip-text font-semibold italic transform -rotate-1 animate-shimmer">
                automatizado
              </span>{' '}
              es 100% real no fake 👇.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-blue-500/10 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-blue-300">{estadisticas.total_published}</div>
            <div className="text-xs text-blue-200">Publicados</div>
          </div>
          <div className="bg-green-500/10 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-300">{estadisticas.total_views}</div>
            <div className="text-xs text-green-200">Vistas</div>
          </div>
          <div className="bg-purple-500/10 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-purple-300">{estadisticas.total_likes}</div>
            <div className="text-xs text-purple-200">Likes</div>
          </div>
          <div className="bg-orange-500/10 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-orange-300">
              {Math.round(estadisticas.avg_reading_time)}
            </div>
            <div className="text-xs text-orange-200">Min. Lectura</div>
          </div>
          <div className="bg-yellow-500/10 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-yellow-300">
              {(estadisticas.avg_generation_time / 1000).toFixed(1)}s
            </div>
            <div className="text-xs text-yellow-200">T. Gen. Prom.</div>
          </div>
          <div className="bg-pink-500/10 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-pink-300">{estadisticas.total_published}</div>
            <div className="text-xs text-pink-200">Blogs Generados</div>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-white font-semibold mb-4">
            Selecciona un tema para generar o ver blogs:
          </label>

          {/* 🎨 CINTA HORIZONTAL DE TEMAS */}
          <div className="relative">
            {/* Gradientes de desvanecimiento adaptativos */}
            <div
              className="absolute left-0 top-0 bottom-0 w-12 z-10 pointer-events-none"
              style={{
                background:
                  'linear-gradient(to right, rgb(29 78 216 / 0.9), rgb(29 78 216 / 0.6), transparent)',
              }}
            ></div>
            <div
              className="absolute right-0 top-0 bottom-0 w-12 z-10 pointer-events-none"
              style={{
                background:
                  'linear-gradient(to left, rgb(29 78 216 / 0.9), rgb(29 78 216 / 0.6), transparent)',
              }}
            ></div>

            {/* Contenedor de scroll horizontal para temas */}
            <div className="flex gap-4 overflow-x-auto py-2 pb-4 px-1 scrollbar-hide hover:scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-500/50">
              {TEMAS_PREDEFINIDOS.map((tema, index) => (
                <button
                  key={tema.id}
                  onClick={() => setTemaSeleccionado(tema.id === temaSeleccionado ? '' : tema.id)}
                  className={`flex-shrink-0 w-52 p-4 rounded-xl border-2 transition-all duration-300 text-left hover:scale-[1.02] group ${
                    temaSeleccionado === tema.id
                      ? 'border-blue-400 bg-blue-500/30 shadow-lg shadow-blue-500/20 scale-[1.02]'
                      : 'border-blue-600/40 bg-blue-800/30 hover:border-blue-400/60 hover:bg-blue-500/20 hover:shadow-lg hover:shadow-blue-500/10'
                  }`}
                  style={{
                    animationDelay: `${index * 0.05}s`,
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`text-3xl transition-transform duration-300 ${
                        temaSeleccionado === tema.id ? 'scale-110' : 'group-hover:scale-105'
                      }`}
                    >
                      {tema.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className={`font-semibold text-sm mb-1 transition-colors ${
                          temaSeleccionado === tema.id
                            ? 'text-blue-100'
                            : 'text-white group-hover:text-blue-200'
                        }`}
                      >
                        {tema.nombre}
                      </div>
                      <div
                        className={`text-xs leading-relaxed transition-colors ${
                          temaSeleccionado === tema.id
                            ? 'text-blue-200'
                            : 'text-blue-300 group-hover:text-blue-100'
                        }`}
                      >
                        {tema.descripcion}
                      </div>
                    </div>
                  </div>

                  {/* Indicador de selección */}
                  {temaSeleccionado === tema.id && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-blue-200">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                      <span>Tema seleccionado</span>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Indicador de scroll para temas */}
            <div className="flex justify-center mt-2">
              <div className="text-xs text-blue-400 bg-blue-800/20 px-2 py-1 rounded-full border border-blue-600/20">
                Desliza para explorar temas →
              </div>
            </div>
          </div>
        </div>

        {estadoGeneracion.estado === 'inicial' && temaSeleccionado && (
          <div className="text-center mb-6 animate-fade-in">
            <button
              onClick={handleGenerarBlog}
              disabled={!temaSeleccionado}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <span className="flex items-center gap-2">
                <span>🚀</span>
                <span>Generar Blog sobre {temaActual?.nombre}</span>
              </span>
            </button>
          </div>
        )}
        {estadoGeneracion.estado === 'generando' && (
          <div className="text-center py-8 mb-6">
            <div className="inline-block relative mb-4">
              <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg">🤖</span>
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Generando artículo...</h3>
            <p className="text-blue-200 text-sm">Creando contenido sobre {temaActual?.nombre}</p>
          </div>
        )}
        {estadoGeneracion.estado === 'exito' && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6 text-center animate-fade-in">
            <div className="text-4xl mb-2">🎉</div>
            <h3 className="text-lg font-bold text-white mb-2">¡Blog generado exitosamente!</h3>
            <p className="text-green-200 text-sm">El artículo ha sido publicado y aparece abajo.</p>
          </div>
        )}
        {estadoGeneracion.estado === 'error' && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 text-center animate-fade-in">
            <div className="text-4xl mb-2">❌</div>
            <h3 className="text-lg font-bold text-white mb-2">Error al generar el blog</h3>
            <p className="text-red-200 text-sm mb-3">{estadoGeneracion.mensaje}</p>
            <button
              onClick={() => setEstadoGeneracion({ estado: 'inicial' })}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm transition-colors"
            >
              Intentar de nuevo
            </button>
          </div>
        )}

        <div className="border-t border-gray-600/30 pt-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">
              {temaSeleccionado
                ? `Blogs sobre ${temaActual?.nombre}`
                : 'Blogs Generados Recientemente'}
            </h3>
            {temaSeleccionado && (
              <button
                onClick={() => setTemaSeleccionado('')}
                className="text-blue-300 hover:text-blue-200 text-sm underline"
              >
                Ver todos
              </button>
            )}
          </div>

          {/* 🎞️ CINTA HORIZONTAL DE BLOGS MEJORADA */}
          <div className="relative">
            {/* Gradientes adaptativos que coinciden con el color de fondo actual */}
            <div
              className="absolute left-0 top-0 bottom-0 w-12 z-10 pointer-events-none"
              style={{
                background:
                  'linear-gradient(to right, rgb(29 78 216 / 0.9), rgb(29 78 216 / 0.6), transparent)',
              }}
            ></div>
            <div
              className="absolute right-0 top-0 bottom-0 w-12 z-10 pointer-events-none"
              style={{
                background:
                  'linear-gradient(to left, rgb(29 78 216 / 0.9), rgb(29 78 216 / 0.6), transparent)',
              }}
            ></div>

            {/* Contenedor de scroll horizontal más elegante */}
            <div className="flex gap-4 overflow-x-auto py-2 pb-6 px-1 scrollbar-hide hover:scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-500/50">
              {blogsAMostrar.length > 0 ? (
                blogsAMostrar.slice(0, 12).map((blog, index) => (
                  <div
                    key={blog.id}
                    onClick={() => abrirBlog(blog.id)}
                    className="flex-shrink-0 w-72 bg-blue-800/40 backdrop-blur-sm border border-blue-600/50 rounded-lg overflow-hidden hover:border-blue-400/60 transition-all duration-300 cursor-pointer hover:scale-[1.03] hover:shadow-lg hover:shadow-blue-500/10 group"
                  >
                    {/* Imagen optimizada */}
                    {blog.imagen_url ? (
                      <div className="relative h-40 overflow-hidden">
                        <img
                          src={blog.imagen_url}
                          alt={blog.titulo}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <div className="absolute top-2 left-2 text-xl bg-black/60 backdrop-blur-sm rounded-full p-1.5">
                          {TEMAS_PREDEFINIDOS.find((t) =>
                            blog.tags?.some((tag) => t.keywords.includes(tag))
                          )?.emoji || '📝'}
                        </div>
                        {/* 🏷️ Badge del tema en la esquina superior derecha */}
                        <div className="absolute top-2 right-2 px-2 py-1 bg-blue-600/90 backdrop-blur-sm rounded-full text-xs text-white font-medium border border-blue-400/30">
                          {TEMAS_PREDEFINIDOS.find((t) =>
                            blog.tags?.some((tag) => t.keywords.includes(tag))
                          )?.nombre || 'General'}
                        </div>
                      </div>
                    ) : (
                      <div className="h-40 bg-gradient-to-br from-blue-700 to-blue-800 flex items-center justify-center relative">
                        <div className="text-4xl opacity-60">
                          {TEMAS_PREDEFINIDOS.find((t) =>
                            blog.tags?.some((tag) => t.keywords.includes(tag))
                          )?.emoji || '📝'}
                        </div>
                        {/* 🏷️ Badge del tema para blogs sin imagen */}
                        <div className="absolute top-2 right-2 px-2 py-1 bg-blue-600/90 backdrop-blur-sm rounded-full text-xs text-white font-medium border border-blue-400/30">
                          {TEMAS_PREDEFINIDOS.find((t) =>
                            blog.tags?.some((tag) => t.keywords.includes(tag))
                          )?.nombre || 'General'}
                        </div>
                      </div>
                    )}

                    {/* Contenido compacto */}
                    <div className="p-4">
                      <h4 className="text-white font-semibold text-sm mb-2 line-clamp-2 leading-tight group-hover:text-blue-300 transition-colors">
                        {blog.titulo}
                      </h4>
                      <p className="text-blue-100 text-xs line-clamp-2 leading-relaxed mb-3">
                        {blog.resumen}
                      </p>

                      {/* Metadatos compactos */}
                      <div className="flex items-center justify-between text-xs text-blue-300">
                        <span>
                          {new Date(blog.fecha_publicacion).toLocaleDateString('es-ES', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        <span>{blog.tiempo_lectura} min</span>
                      </div>

                      {/* Estadísticas con badge adicional del tema */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-blue-400">👁️ {blog.vistas}</span>
                          <span className="text-pink-400">❤️ {blog.likes}</span>
                        </div>
                        {/* 🏷️ Badge pequeño del tema en la parte inferior */}
                        <div className="flex items-center gap-1 text-xs">
                          <span className="text-lg">
                            {TEMAS_PREDEFINIDOS.find((t) =>
                              blog.tags?.some((tag) => t.keywords.includes(tag))
                            )?.emoji || '📝'}
                          </span>
                          <span className="text-blue-300 text-xs truncate max-w-20">
                            {TEMAS_PREDEFINIDOS.find((t) =>
                              blog.tags?.some((tag) => t.keywords.includes(tag))
                            )?.nombre || 'General'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex-shrink-0 w-72 h-56 border border-dashed border-blue-500 rounded-lg flex flex-col items-center justify-center text-blue-300">
                  <div className="text-3xl mb-2">📝</div>
                  <p className="text-sm text-center px-4">
                    {temaSeleccionado
                      ? `No hay blogs sobre ${temaActual?.nombre}`
                      : 'No hay blogs generados aún'}
                  </p>
                </div>
              )}
            </div>

            {/* Indicador sutil adaptado al tema azul */}
            {blogsAMostrar.length > 3 && (
              <div className="flex justify-center mt-3">
                <div className="text-xs text-blue-300 bg-blue-800/30 px-2 py-1 rounded-full border border-blue-600/30">
                  Desliza para ver más →
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-600/30 text-center">
          <p className="text-gray-400 text-sm">
            Generados con información actualizada y almacenan base de datos automáticamente
          </p>
          <p className="text-gray-400 text-xs mt-1">⚡ Powered by agenterag.com</p>
        </div>
      </div>
    </>
  );
}
