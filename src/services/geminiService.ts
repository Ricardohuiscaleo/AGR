import { GoogleGenerativeAI } from '@google/generative-ai';

// Configurar Gemini AI con la API key desde variables de entorno
const apiKey = import.meta.env.GOOGLE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error('GOOGLE_GEMINI_API_KEY no está configurada en las variables de entorno');
}

const genAI = new GoogleGenerativeAI(apiKey);

// Temas predefinidos para evitar entradas de texto libre
export const TEMAS_PREDEFINIDOS = [
  {
    id: 'llm',
    nombre: 'Large Language Models',
    emoji: '🧠',
    descripcion: 'Modelos de lenguaje y sus aplicaciones',
    keywords: ['LLM', 'GPT', 'Transformers', 'NLP', 'ChatGPT', 'Claude', 'Gemini'],
    prompt:
      'Escribe un artículo completo y actualizado sobre Large Language Models (LLM). Incluye los últimos avances, modelos más populares como GPT-4, Claude, Gemini, aplicaciones prácticas, beneficios, desafíos y tendencias futuras. El artículo debe ser informativo, profesional y accesible.',
  },
  {
    id: 'rag',
    nombre: 'RAG (Retrieval Augmented Generation)',
    emoji: '🔍',
    descripcion: 'Sistemas de generación aumentada por recuperación',
    keywords: ['RAG', 'Vector DB', 'Embeddings', 'Retrieval', 'Knowledge Base'],
    prompt:
      'Crea un artículo detallado sobre RAG (Retrieval Augmented Generation). Explica cómo funciona, sus ventajas sobre modelos tradicionales, casos de uso empresariales, implementación técnica, herramientas populares y mejores prácticas. Incluye ejemplos reales y comparaciones.',
  },
  {
    id: 'ia-generativa',
    nombre: 'IA Generativa',
    emoji: '🎨',
    descripción: 'Inteligencia artificial para crear contenido',
    keywords: ['Generative AI', 'DALL-E', 'Midjourney', 'Stable Diffusion', 'Content Creation'],
    prompt:
      'Desarrolla un artículo sobre IA Generativa. Cubre la generación de texto, imágenes, código, música y video. Analiza herramientas como DALL-E, Midjourney, Runway, impacto en industrias creativas, consideraciones éticas y el futuro de la creatividad artificial.',
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
    prompt:
      'Escribe un artículo completo sobre Machine Learning. Incluye conceptos fundamentales, tipos de aprendizaje, algoritmos populares, aplicaciones en la industria, herramientas y frameworks, y las últimas tendencias en ML para 2025.',
  },
  {
    id: 'computer-vision',
    nombre: 'Computer Vision',
    emoji: '👁️',
    descripcion: 'Visión por computadora y análisis de imágenes',
    keywords: [
      'Computer Vision',
      'Image Recognition',
      'Object Detection',
      'OCR',
      'Medical Imaging',
    ],
    prompt:
      'Crea un artículo sobre Computer Vision. Explica técnicas de procesamiento de imágenes, reconocimiento de objetos, detección facial, aplicaciones en medicina, automoción, seguridad, y los últimos avances en visión artificial.',
  },
  {
    id: 'nlp',
    nombre: 'Procesamiento de Lenguaje Natural',
    emoji: '💬',
    descripcion: 'NLP y comprensión del lenguaje humano',
    keywords: [
      'NLP',
      'Natural Language Processing',
      'Sentiment Analysis',
      'Text Mining',
      'Chatbots',
    ],
    prompt:
      'Desarrolla un artículo sobre Procesamiento de Lenguaje Natural (NLP). Cubre análisis de sentimientos, traducción automática, chatbots, extracción de información, y cómo el NLP está revolucionando la comunicación humano-máquina.',
  },
  {
    id: 'automatizacion-ia',
    nombre: 'Automatización con IA',
    emoji: '🤖',
    descripcion: 'Automatización de procesos con inteligencia artificial',
    keywords: ['RPA', 'Automation', 'Process Mining', 'Workflow', 'Business Intelligence'],
    prompt:
      'Escribe sobre Automatización con IA. Analiza RPA (Robotic Process Automation), automatización de workflows, impacto en empleos, casos de éxito empresarial, herramientas como n8n, Zapier, y el futuro del trabajo automatizado.',
  },
  {
    id: 'etica-ia',
    nombre: 'Ética en IA',
    emoji: '⚖️',
    descripcion: 'Consideraciones éticas y responsables en IA',
    keywords: ['AI Ethics', 'Bias', 'Fairness', 'Transparency', 'Responsible AI'],
    prompt:
      'Crea un artículo sobre Ética en IA. Discute sesgos algorítmicos, transparencia, responsabilidad, regulaciones como el AI Act de la UE, privacidad de datos, y cómo desarrollar IA de manera ética y responsable.',
  },
];

interface BlogGenerado {
  titulo: string;
  contenido: string;
  resumen: string;
  tags: string[];
  tiempo_lectura: number;
  meta_titulo: string;
  meta_descripcion: string;
  imagen_url: string; // 🆕 Nueva propiedad agregada
}

export class GeminiAIService {
  private static model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  /**
   * Limpiar contenido generado eliminando bloques de código markdown innecesarios
   */
  private static limpiarContenido(contenido: string): string {
    return (
      contenido
        // Eliminar bloques de código markdown al inicio y final
        .replace(/^```markdown\s*/i, '')
        .replace(/\s*```\s*$/i, '')
        // Eliminar otros bloques de código comunes
        .replace(/^```\s*/i, '')
        .replace(/\s*```\s*$/i, '')
        // Limpiar espacios extra al inicio y final
        .trim()
    );
  }

  /**
   * Generar URL de imagen desde Unsplash basada en keywords del tema
   */
  static async generarImagenURL(tema: string, keywords: string[]): Promise<string> {
    try {
      // 🔧 CORRECCIÓN: Acceder a variables de entorno correctamente en servidor
      const accessKey = process.env.UNSPLASH_ACCESS_KEY || import.meta.env.UNSPLASH_ACCESS_KEY;

      console.log('🔑 Unsplash Access Key presente:', !!accessKey);

      // Si no hay API key, devolver una imagen placeholder
      if (!accessKey) {
        console.warn('⚠️ UNSPLASH_ACCESS_KEY no configurada, usando placeholder');
        return `https://via.placeholder.com/800x400/1f2937/ffffff?text=${encodeURIComponent(tema)}`;
      }

      // 🆕 MAPEO OPTIMIZADO: Convertir keywords técnicos a términos visuales efectivos
      const getVisualTerms = (keywords: string[]) => {
        const visualMapping = {
          // AI/ML Terms -> Visual concepts
          LLM: ['artificial intelligence', 'technology', 'computer science', 'future tech'],
          GPT: ['ai technology', 'computer brain', 'digital innovation'],
          'AI Ethics': ['ethics', 'balance', 'justice', 'responsibility'],
          Bias: ['balance', 'equality', 'fairness', 'justice'],
          Fairness: ['balance', 'equality', 'scales', 'justice'],
          Transparency: ['glass', 'clear', 'transparency', 'crystal'],
          RAG: ['search', 'database', 'information', 'research'],
          'Vector DB': ['data', 'network', 'connections', 'abstract'],
          Embeddings: ['network', 'connections', 'abstract patterns'],
          'Generative AI': ['creativity', 'art', 'creation', 'digital art'],
          'DALL-E': ['digital art', 'creativity', 'artificial art'],
          Midjourney: ['art', 'creativity', 'digital creation'],
          'Deep Learning': ['neural network', 'brain', 'technology'],
          'Neural Networks': ['network', 'connections', 'brain patterns'],
          'Computer Vision': ['eyes', 'vision', 'cameras', 'surveillance'],
          'Image Recognition': ['camera', 'lens', 'photography', 'eyes'],
          NLP: ['communication', 'language', 'speech', 'conversation'],
          Chatbots: ['conversation', 'communication', 'chat', 'messaging'],
          RPA: ['automation', 'robots', 'machinery', 'efficiency'],
          Automation: ['robots', 'machinery', 'gear', 'efficiency'],
          'Machine Learning': ['learning', 'education', 'technology', 'computer'],
        };

        const visualTerms: string[] = [];

        keywords.forEach((keyword) => {
          const mapped = visualMapping[keyword as keyof typeof visualMapping];
          if (mapped) {
            visualTerms.push(...mapped);
          } else {
            // Para keywords no mapeados, usar términos genéricos relacionados
            visualTerms.push('technology', 'digital', 'innovation');
          }
        });

        return Array.from(new Set(visualTerms)); // Eliminar duplicados usando Array.from()
      };

      const visualTerms = getVisualTerms(keywords);

      // 🎯 ESTRATEGIA DE BÚSQUEDA: Términos ordenados por probabilidad de éxito
      const searchTerms = [
        // Términos específicos mapeados
        ...visualTerms.slice(0, 3),
        // Términos genéricos de tecnología con alta probabilidad
        'technology',
        'computer',
        'digital',
        'innovation',
        'business',
        'office',
        'modern',
        'abstract',
        'network',
        'data',
      ].filter(Boolean);

      console.log('🎯 Términos de búsqueda optimizados:', searchTerms.slice(0, 5));

      // Intentar con cada término hasta encontrar resultados
      for (const searchTerm of searchTerms) {
        console.log(`🔍 Buscando imagen en Unsplash para: "${searchTerm}"`);

        try {
          const response = await fetch(
            `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchTerm)}&per_page=10&orientation=landscape&order_by=relevant`,
            {
              headers: {
                Authorization: `Client-ID ${accessKey}`,
              },
            }
          );

          if (!response.ok) {
            console.error('❌ Error de Unsplash API:', response.status, response.statusText);
            continue; // Intentar con el siguiente término
          }

          const data = await response.json();
          console.log(`📊 Resultados de Unsplash para "${searchTerm}":`, data.results?.length || 0);

          // Si encontramos imágenes, usar una aleatoria de las primeras 10
          if (data.results && data.results.length > 0) {
            const randomIndex = Math.floor(Math.random() * Math.min(data.results.length, 10));
            const image = data.results[randomIndex];
            const imageUrl = image.urls.regular; // Usar 'regular' que es 1080px de ancho
            console.log('✅ Imagen encontrada:', imageUrl);
            console.log('📷 Fotógrafo:', image.user.name);
            return imageUrl;
          }
        } catch (fetchError) {
          console.error(`❌ Error buscando "${searchTerm}":`, fetchError);
          continue; // Intentar con el siguiente término
        }
      }

      // Si no encontramos nada con ningún término, usar placeholder temático mejorado
      console.log('⚠️ No se encontraron resultados para ningún término de búsqueda');
      return `https://via.placeholder.com/800x400/3b82f6/ffffff?text=${encodeURIComponent(tema.split(' ')[0])}`;
    } catch (error) {
      console.error('❌ Error general obteniendo imagen de Unsplash:', error);
      // Fallback en caso de error
      return `https://via.placeholder.com/800x400/ef4444/ffffff?text=${encodeURIComponent('Error')}`;
    }
  }

  /**
   * 🆕 NUEVA FUNCIONALIDAD: Generar títulos únicos y diversos
   */
  private static async generarTituloUnico(tema: any, fechaActual: string): Promise<string> {
    // Crear variaciones de enfoques para el mismo tema
    const enfoques = {
      'etica-ia': [
        'Construyendo IA Responsable: El Futuro de la Tecnología Ética',
        'Sesgos Algorítmicos: Cómo Crear Sistemas Justos e Inclusivos',
        'IA Transparente: Principios para el Desarrollo Responsable',
        'El Dilema Ético de la Inteligencia Artificial en {año}',
        'Regulación vs Innovación: El Balance Perfecto en IA',
        'Privacidad Digital: Protegiendo Datos en la Era de la IA',
        'IA Inclusiva: Eliminando Sesgos de Género y Raza',
        'El Código de Ética que Toda Empresa de IA Necesita',
      ],
      llm: [
        'GPT-4 vs Claude vs Gemini: La Batalla de los Titanes LLM',
        'Large Language Models: Revolucionando la Comunicación Humana',
        'El Poder Oculto de los Modelos de Lenguaje Masivos',
        'LLM en Empresas: Casos de Uso que Transforman Industrias',
        'Optimizando Prompts: El Arte de Comunicarse con IA',
        'Multimodalidad en LLM: Texto, Imagen y Audio Unificados',
        'Fine-Tuning de Modelos: Personalización Empresarial Avanzada',
        'El Futuro del Trabajo con Large Language Models',
      ],
      rag: [
        'RAG vs Fine-Tuning: ¿Cuál Elegir para tu Proyecto?',
        'Vector Databases: El Motor Secreto detrás de RAG',
        'Implementando RAG: De Prototipo a Producción',
        'Embeddings Avanzados: Mejorando la Precisión de RAG',
        'RAG Multimodal: Combinando Texto, Imágenes y Documentos',
        'Chunking Strategies: Optimizando Datos para RAG',
        'RAG en Tiempo Real: Sistemas de Conocimiento Dinámicos',
        'Evaluando Performance: Métricas Clave para Sistemas RAG',
      ],
      'ia-generativa': [
        'Dall-E 3 vs Midjourney vs Stable Diffusion: Comparativa {año}',
        'IA Generativa en Marketing: Creatividad Sin Límites',
        'Generación de Código con IA: El Desarrollador del Futuro',
        'Arte Digital Revolucionario: Cuando la IA Se Vuelve Creativa',
        'Video Generativo: Sora y el Futuro del Contenido Audiovisual',
        'Música Creada por IA: Compositores Artificiales Emergentes',
        'Copyright y IA Generativa: Navegando Aguas Legales',
        'Workflows Creativos: Integrando IA en Procesos Artísticos',
      ],
      'machine-learning': [
        'AutoML: Democratizando el Aprendizaje Automático',
        'Deep Learning sin Código: Herramientas No-Code para ML',
        'MLOps en {año}: DevOps para Modelos de Machine Learning',
        'Edge AI: Llevando Machine Learning a Dispositivos Móviles',
        'Federated Learning: ML Distribuido y Privacidad por Diseño',
        'Explainable AI: Modelos Transparentes y Comprensibles',
        'Transfer Learning: Reutilizando Conocimiento en ML',
        'ML en la Nube: AWS vs Azure vs Google Cloud',
      ],
      'computer-vision': [
        'Visión por Computadora en Medicina: Diagnósticos del Futuro',
        'Reconocimiento Facial Ético: Tecnología con Responsabilidad',
        'Computer Vision en Retail: Revolucionando la Experiencia',
        'Realidad Aumentada con IA: Fusionando Mundos Virtuales',
        'Detección de Objetos en Tiempo Real: YOLO y Más Allá',
        'OCR Inteligente: Extrayendo Datos de Documentos Complejos',
        'Análisis de Video con IA: Seguridad y Vigilancia Avanzada',
        'Vision Transformers: La Nueva Era del Procesamiento Visual',
      ],
      nlp: [
        'Análisis de Sentimientos: Entendiendo Emociones en Texto',
        'Chatbots Conversacionales: Más Allá de las Respuestas Simples',
        'Traducción Neural: Rompiendo Barreras Idiomáticas',
        'NLP Multilingüe: Procesando 100+ Idiomas Simultáneamente',
        'Named Entity Recognition: Extrayendo Información Clave',
        'Summarización Automática: Condensando Información Masiva',
        'Question Answering: Sistemas que Realmente Comprenden',
        'Text-to-Speech Emocional: Voces Sintéticas con Sentimiento',
      ],
      'automatizacion-ia': [
        'RPA + IA: La Automatización Inteligente del Futuro',
        'Workflows Autónomos: Procesos que Se Optimizan Solos',
        'Automatización de Documentos: De PDF a Datos Estructurados',
        'IA en Manufacturing: Fábricas Autónomas e Inteligentes',
        'Process Mining con IA: Descubriendo Ineficiencias Ocultas',
        'Automatización Cognitiva: Cuando los Bots Piensan',
        'No-Code Automation: Automatización Sin Programación',
        'Hiperautomatización: El Ecosistema Completo Automatizado',
      ],
    };

    const titulosDisponibles = enfoques[tema.id as keyof typeof enfoques] || [
      `${tema.nombre}: Innovaciones y Tendencias {año}`,
      `El Futuro de ${tema.nombre}: Perspectivas {año}`,
      `Dominando ${tema.nombre}: Guía Práctica Actualizada`,
      `${tema.nombre} en la Práctica: Casos de Uso Reales`,
      `Revolucionando con ${tema.nombre}: Estrategias Avanzadas`,
    ];

    // Seleccionar título aleatorio y personalizar con fecha
    const tituloAleatorio =
      titulosDisponibles[Math.floor(Math.random() * titulosDisponibles.length)];
    const añoActual = new Date().getFullYear();

    return tituloAleatorio.replace('{año}', añoActual.toString());
  }

  /**
   * Genera un blog completo usando Gemini AI con imagen, título único y contenido dinámico
   */
  static async generarBlog(temaId: string): Promise<BlogGenerado> {
    const tema = TEMAS_PREDEFINIDOS.find((t) => t.id === temaId);
    if (!tema) {
      throw new Error('Tema no encontrado');
    }

    try {
      // Obtener fecha actual
      const fechaActual = new Date().toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      // 🆕 GENERAR ENFOQUE DINÁMICO
      const enfoqueDinamico = this.generarEnfoqueDinamico(tema);

      // 🆕 GENERAR ESTRUCTURA DINÁMICA
      const estructuraDinamica = this.generarEstructuraDinamica();

      // 🆕 GENERAR ELEMENTOS DE VARIABILIDAD
      const elementosVariabilidad = this.generarElementosVariabilidad();

      // 🆕 CREAR SEMILLA DE ALEATORIEDAD
      const semillaAleatoria = Math.floor(Math.random() * 1000);

      // 🆕 PROMPT DINÁMICO Y VARIABLE
      const promptPrincipal = `
FECHA ACTUAL: ${fechaActual}
SEMILLA DE VARIACIÓN: ${semillaAleatoria}

ENFOQUE ESPECÍFICO PARA ESTE ARTÍCULO:
${enfoqueDinamico}

TEMA BASE: ${tema.nombre}
DESCRIPCIÓN: ${tema.descripcion}

ELEMENTOS ADICIONALES A INCLUIR:
${elementosVariabilidad}

ESTRUCTURA A SEGUIR:
${estructuraDinamica}

REQUISITOS ESPECÍFICOS:
- Escribe en español con un estilo único y distintivo
- Mínimo 1800 palabras para asegurar profundidad
- Usa formato Markdown limpio y profesional
- Información actualizada a ${fechaActual}
- Ejemplos concretos y datos específicos
- Tono profesional pero accesible
- Evita frases cliché o repetitivas
- Cada sección debe aportar valor único

DIRECTRICES DE ORIGINALIDAD:
- Comienza con un gancho diferente e inesperado
- Usa analogías creativas para explicar conceptos complejos
- Incluye perspectivas contrarias o debates actuales
- Proporciona insights únicos no encontrados en otros artículos
- Termina con una reflexión profunda sobre el impacto futuro

IMPORTANTE: 
- Responde SOLO con el artículo en formato Markdown
- NO uses frases genéricas como "La IA ha dejado de ser..."
- Sé específico y concreto en cada afirmación
- Cada párrafo debe aportar información valiosa y única
- Evita repetir estructuras de introducción similares
      `;

      console.log('🎯 Generando contenido con enfoque:', enfoqueDinamico.substring(0, 100) + '...');

      // Generar el contenido con máxima variabilidad
      const result = await this.model.generateContent(promptPrincipal);
      let contenido = result.response.text();

      // 🧹 LIMPIAR CONTENIDO
      contenido = this.limpiarContenido(contenido);

      // Extraer título del contenido generado
      const tituloMatch = contenido.match(/^#\s+(.+)$/m);
      const tituloGenerado = tituloMatch ? tituloMatch[1] : null;

      // 🆕 USAR TÍTULO ÚNICO PREDEFINIDO (más control sobre variabilidad)
      const tituloUnico = await this.generarTituloUnico(tema, fechaActual);

      // 🆕 REEMPLAZAR TÍTULO EN CONTENIDO SI ES NECESARIO
      if (tituloGenerado && tituloGenerado !== tituloUnico) {
        contenido = contenido.replace(/^#\s+.+$/m, `# ${tituloUnico}`);
      }

      // Generar resumen único y específico
      const promptResumen = `
Basándote en este artículo específico sobre ${tema.nombre}, genera un resumen de máximo 200 caracteres que capture la esencia ÚNICA de este artículo en particular.

Artículo:
${contenido.substring(0, 1000)}...

El resumen debe:
- Ser específico a este artículo, no genérico
- Mencionar el enfoque particular usado
- Ser atractivo para redes sociales
- Evitar frases cliché

Responde SOLO con el resumen, sin comillas ni texto adicional.
      `;

      const resumenResult = await this.model.generateContent(promptResumen);
      let resumen = resumenResult.response.text().trim();
      resumen = this.limpiarContenido(resumen);

      // 🖼️ GENERAR URL DE IMAGEN
      const imagenURL = await this.generarImagenURL(tema.nombre, tema.keywords);

      // Calcular tiempo de lectura
      const palabras = contenido.split(' ').length;
      const tiempo_lectura = Math.max(1, Math.ceil(palabras / 250));

      console.log('✅ Blog generado con variabilidad máxima:', {
        titulo: tituloUnico,
        palabras,
        tiempo_lectura,
        semilla: semillaAleatoria,
      });

      return {
        titulo: tituloUnico,
        contenido,
        resumen: resumen.substring(0, 200),
        tags: tema.keywords,
        tiempo_lectura,
        meta_titulo: tituloUnico,
        meta_descripcion: resumen.substring(0, 160),
        imagen_url: imagenURL,
      };
    } catch (error) {
      console.error('Error generando blog con Gemini:', error);
      throw new Error('Error al generar el contenido del blog');
    }
  }

  /**
   * 🆕 NUEVA FUNCIONALIDAD: Generar enfoques dinámicos y diversos para el contenido
   */
  private static generarEnfoqueDinamico(tema: any): string {
    // Enfoques diversos para cada tema que cambian la perspectiva y estructura del artículo
    const enfoquesPorTema = {
      'etica-ia': [
        {
          enfoque: 'Casos de estudio y ejemplos reales',
          prompt:
            'Enfócate en casos reales de problemas éticos en IA que han ocurrido en empresas como Amazon, Google, Microsoft. Analiza qué salió mal y cómo se solucionó. Incluye ejemplos específicos de sesgos algorítmicos en contratación, reconocimiento facial, y sistemas de justicia.',
          estilo: 'narrativo y basado en casos',
        },
        {
          enfoque: 'Marco regulatorio y compliance',
          prompt:
            'Enfócate en las regulaciones actuales como el AI Act de la UE, GDPR, y marcos normativos emergentes. Explica cómo las empresas pueden implementar compliance y qué significa para el desarrollo de IA. Incluye requisitos específicos y multas por incumplimiento.',
          estilo: 'técnico-legal',
        },
        {
          enfoque: 'Implementación práctica en empresas',
          prompt:
            'Enfócate en cómo las empresas pueden implementar ética en IA de forma práctica. Incluye frameworks, herramientas, procesos de auditoría, comités de ética, y métricas para medir fairness. Proporciona una guía paso a paso para CTOs y equipos de desarrollo.',
          estilo: 'guía práctica',
        },
        {
          enfoque: 'Futuro y tendencias emergentes',
          prompt:
            'Enfócate en las tendencias futuras de ética en IA: IA explicable, auditorías automáticas, certificaciones de IA ética, impacto social, y cómo evolucionará la regulación. Analiza qué viene después del AI Act y cómo se preparan las empresas.',
          estilo: 'prospectivo y visionario',
        },
      ],
      llm: [
        {
          enfoque: 'Comparativa técnica detallada',
          prompt:
            'Realiza una comparativa técnica profunda entre GPT-4, Claude-3, Gemini-2.0, y otros LLMs. Analiza arquitectura, capacidades, limitaciones, costos, APIs, y casos de uso específicos. Incluye benchmarks reales y métricas de performance.',
          estilo: 'técnico-comparativo',
        },
        {
          enfoque: 'Implementación empresarial',
          prompt:
            'Enfócate en cómo las empresas están implementando LLMs: desde startups hasta Fortune 500. Analiza casos de uso reales, ROI, integración con sistemas existentes, desafíos de implementación, y lecciones aprendidas.',
          estilo: 'business-oriented',
        },
        {
          enfoque: 'Desarrollo y fine-tuning',
          prompt:
            'Enfócate en el aspecto técnico de desarrollo: fine-tuning, prompt engineering, RAG integration, vector databases, embedding strategies, y optimización de performance. Incluye código y ejemplos prácticos.',
          estilo: 'técnico-práctico',
        },
        {
          enfoque: 'Impacto social y futuro del trabajo',
          prompt:
            'Analiza cómo los LLMs están transformando el trabajo: automatización de tareas, nuevos roles profesionales, impacto en educación, creatividad, y productividad. Discute el futuro del trabajo humano-IA colaborativo.',
          estilo: 'sociológico-prospectivo',
        },
      ],
      rag: [
        {
          enfoque: 'Arquitectura e implementación técnica',
          prompt:
            'Enfócate en la arquitectura técnica de RAG: vector databases (Pinecone, Weaviate, Chroma), embedding models, chunking strategies, retrieval algorithms, y optimización de performance. Incluye diagramas y código.',
          estilo: 'técnico-arquitectural',
        },
        {
          enfoque: 'Casos de uso empresariales',
          prompt:
            'Analiza implementaciones reales de RAG en empresas: chatbots corporativos, sistemas de soporte, knowledge management, análisis de documentos, y customer service. Incluye métricas de éxito y ROI.',
          estilo: 'business cases',
        },
        {
          enfoque: 'Comparativa con otras tecnologías',
          prompt:
            'Compara RAG vs fine-tuning, RAG vs traditional search, RAG vs knowledge graphs. Analiza cuándo usar cada aproximación, ventajas, desventajas, y hybrid approaches.',
          estilo: 'comparativo-analítico',
        },
        {
          enfoque: 'Mejores prácticas y optimización',
          prompt:
            'Enfócate en mejores prácticas: data preparation, chunk optimization, retrieval tuning, evaluation metrics, monitoring, y troubleshooting. Proporciona una guía completa de implementación.',
          estilo: 'guía de mejores prácticas',
        },
      ],
    };

    // Obtener enfoques para el tema específico o usar genéricos
    const enfoques = enfoquesPorTema[tema.id as keyof typeof enfoquesPorTema] || [
      {
        enfoque: 'Análisis técnico profundo',
        prompt: `Enfócate en los aspectos técnicos avanzados de ${tema.nombre}. Incluye implementaciones, herramientas, frameworks, y ejemplos de código prácticos.`,
        estilo: 'técnico-profundo',
      },
      {
        enfoque: 'Casos de uso empresariales',
        prompt: `Analiza cómo las empresas están implementando ${tema.nombre} en el mundo real. Incluye casos de éxito, ROI, y lecciones aprendidas.`,
        estilo: 'business-oriented',
      },
      {
        enfoque: 'Tendencias y futuro',
        prompt: `Explora las tendencias emergentes y el futuro de ${tema.nombre}. Analiza hacia dónde se dirige la tecnología y qué viene después.`,
        estilo: 'prospectivo',
      },
    ];

    // Seleccionar un enfoque aleatorio
    const enfoqueSeleccionado = enfoques[Math.floor(Math.random() * enfoques.length)];

    return enfoqueSeleccionado.prompt;
  }

  /**
   * 🆕 NUEVA FUNCIONALIDAD: Generar variaciones de estructura del artículo
   */
  private static generarEstructuraDinamica(): string {
    const estructuras = [
      {
        nombre: 'Estructura Clásica',
        template: `
# [Título del Artículo]

## Introducción
[Contextualiza el tema y explica por qué es importante ahora]

## Fundamentos y Conceptos Clave
[Explica los conceptos básicos de manera clara]

## Estado Actual y Tendencias
[Analiza la situación actual y tendencias emergentes]

## Casos de Uso y Aplicaciones Prácticas
[Proporciona ejemplos reales y casos de uso]

## Desafíos y Consideraciones
[Discute los principales retos y limitaciones]

## Futuro y Perspectivas
[Analiza hacia dónde se dirige la tecnología]

## Conclusión
[Resume los puntos clave y proporciona reflexiones finales]`,
      },
      {
        nombre: 'Estructura Problem-Solution',
        template: `
# [Título del Artículo]

## El Problema que Estamos Enfrentando
[Define claramente el problema o desafío actual]

## ¿Por Qué Importa Ahora?
[Explica la urgencia y relevancia del problema]

## La Solución: [Tema Principal]
[Introduce la tecnología/concepto como solución]

## Cómo Funciona en la Práctica
[Explica la implementación y funcionamiento]

## Casos de Éxito Reales
[Proporciona ejemplos específicos de implementaciones exitosas]

## Obstáculos y Cómo Superarlos
[Identifica desafíos comunes y estrategias para resolverlos]

## Implementación: Pasos Siguientes
[Guía práctica para comenzar]

## Conclusión y Llamada a la Acción
[Resume y motiva a la acción]`,
      },
      {
        nombre: 'Estructura Comparativa',
        template: `
# [Título del Artículo]

## Panorama Actual del Sector
[Establece el contexto y landscape actual]

## Opción A vs Opción B vs [Tema Principal]
[Compara diferentes aproximaciones o tecnologías]

## Ventajas Competitivas de [Tema Principal]
[Destaca los beneficios únicos]

## Cuándo Usar Cada Aproximación
[Proporciona criterios de decisión]

## Análisis de Costos y ROI
[Compara aspectos económicos]

## Estudios de Caso Comparativos
[Ejemplos reales de diferentes implementaciones]

## Recomendaciones Basadas en Escenarios
[Guía para diferentes situaciones empresariales]

## Conclusión: La Mejor Estrategia para Ti
[Personaliza las recomendaciones]`,
      },
      {
        nombre: 'Estructura de Guía Paso a Paso',
        template: `
# [Título del Artículo]

## Antes de Comenzar: Lo Que Necesitas Saber
[Prerrequisitos y contexto necesario]

## Paso 1: Evaluación y Preparación
[Primera fase de implementación]

## Paso 2: Diseño y Planificación
[Planificación detallada del proyecto]

## Paso 3: Implementación Inicial
[Primeros pasos prácticos]

## Paso 4: Optimización y Ajustes
[Mejora y refinamiento]

## Paso 5: Escalamiento y Producción
[Llevar la solución a gran escala]

## Errores Comunes y Cómo Evitarlos
[Lecciones aprendidas y pitfalls]

## Herramientas y Recursos Recomendados
[Stack tecnológico y recursos útiles]

## Próximos Pasos y Evolución
[Cómo continuar mejorando]`,
      },
    ];

    // Seleccionar estructura aleatoria
    const estructuraSeleccionada = estructuras[Math.floor(Math.random() * estructuras.length)];
    return estructuraSeleccionada.template;
  }

  /**
   * 🆕 NUEVA FUNCIONALIDAD: Generar elementos de variabilidad adicional
   */
  private static generarElementosVariabilidad(): string {
    const elementos = [
      'Incluye estadísticas y datos específicos de 2025',
      'Menciona herramientas y empresas reales del sector',
      'Incorpora citas de expertos reconocidos en el campo',
      'Agrega ejemplos de código o implementación cuando sea relevante',
      'Incluye métricas de performance y benchmarks',
      'Menciona regulaciones y compliance relevantes',
      'Incorpora análisis de costos y ROI',
      'Agrega perspectivas de diferentes industrias',
      'Incluye roadmap y timeline de implementación',
      'Menciona riesgos y mitigaciones específicas',
    ];

    // Seleccionar 3-4 elementos aleatorios
    const elementosSeleccionados = elementos
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 2) + 3);

    return elementosSeleccionados.map((elemento) => `- ${elemento}`).join('\n');
  }

  /**
   * Generar slug a partir del título
   */
  static generarSlug(titulo: string): string {
    return titulo
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remover acentos
      .replace(/[^a-z0-9\s-]/g, '') // Solo letras, números, espacios y guiones
      .trim()
      .replace(/\s+/g, '-') // Reemplazar espacios con guiones
      .replace(/-+/g, '-') // Eliminar guiones múltiples
      .substring(0, 50); // Limitar longitud
  }

  /**
   * Obtener tema por ID
   */
  static obtenerTema(temaId: string) {
    return TEMAS_PREDEFINIDOS.find((t) => t.id === temaId);
  }
}
