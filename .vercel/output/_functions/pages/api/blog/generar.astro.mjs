import { GoogleGenerativeAI } from '@google/generative-ai';
import { B as BlogService } from '../../../chunks/blogService_C2-nrjpO.mjs';
export { renderers } from '../../../renderers.mjs';

const apiKey = "AIzaSyCc1bdkzVLHXxxKOBndV3poK2KQikLJ6DI";
const genAI = new GoogleGenerativeAI(apiKey);
const TEMAS_PREDEFINIDOS = [
  {
    id: "llm",
    nombre: "Large Language Models",
    emoji: "🧠",
    descripcion: "Modelos de lenguaje y sus aplicaciones",
    keywords: ["LLM", "GPT", "Transformers", "NLP", "ChatGPT", "Claude", "Gemini"],
    prompt: "Escribe un artículo completo y actualizado sobre Large Language Models (LLM). Incluye los últimos avances, modelos más populares como GPT-4, Claude, Gemini, aplicaciones prácticas, beneficios, desafíos y tendencias futuras. El artículo debe ser informativo, profesional y accesible."
  },
  {
    id: "rag",
    nombre: "RAG (Retrieval Augmented Generation)",
    emoji: "🔍",
    descripcion: "Sistemas de generación aumentada por recuperación",
    keywords: ["RAG", "Vector DB", "Embeddings", "Retrieval", "Knowledge Base"],
    prompt: "Crea un artículo detallado sobre RAG (Retrieval Augmented Generation). Explica cómo funciona, sus ventajas sobre modelos tradicionales, casos de uso empresariales, implementación técnica, herramientas populares y mejores prácticas. Incluye ejemplos reales y comparaciones."
  },
  {
    id: "ia-generativa",
    nombre: "IA Generativa",
    emoji: "🎨",
    descripción: "Inteligencia artificial para crear contenido",
    keywords: ["Generative AI", "DALL-E", "Midjourney", "Stable Diffusion", "Content Creation"],
    prompt: "Desarrolla un artículo sobre IA Generativa. Cubre la generación de texto, imágenes, código, música y video. Analiza herramientas como DALL-E, Midjourney, Runway, impacto en industrias creativas, consideraciones éticas y el futuro de la creatividad artificial."
  },
  {
    id: "machine-learning",
    nombre: "Machine Learning",
    emoji: "⚡",
    descripcion: "Aprendizaje automático y algoritmos",
    keywords: [
      "ML",
      "Deep Learning",
      "Neural Networks",
      "Supervised Learning",
      "Unsupervised Learning"
    ],
    prompt: "Escribe un artículo completo sobre Machine Learning. Incluye conceptos fundamentales, tipos de aprendizaje, algoritmos populares, aplicaciones en la industria, herramientas y frameworks, y las últimas tendencias en ML para 2025."
  },
  {
    id: "computer-vision",
    nombre: "Computer Vision",
    emoji: "👁️",
    descripcion: "Visión por computadora y análisis de imágenes",
    keywords: [
      "Computer Vision",
      "Image Recognition",
      "Object Detection",
      "OCR",
      "Medical Imaging"
    ],
    prompt: "Crea un artículo sobre Computer Vision. Explica técnicas de procesamiento de imágenes, reconocimiento de objetos, detección facial, aplicaciones en medicina, automoción, seguridad, y los últimos avances en visión artificial."
  },
  {
    id: "nlp",
    nombre: "Procesamiento de Lenguaje Natural",
    emoji: "💬",
    descripcion: "NLP y comprensión del lenguaje humano",
    keywords: [
      "NLP",
      "Natural Language Processing",
      "Sentiment Analysis",
      "Text Mining",
      "Chatbots"
    ],
    prompt: "Desarrolla un artículo sobre Procesamiento de Lenguaje Natural (NLP). Cubre análisis de sentimientos, traducción automática, chatbots, extracción de información, y cómo el NLP está revolucionando la comunicación humano-máquina."
  },
  {
    id: "automatizacion-ia",
    nombre: "Automatización con IA",
    emoji: "🤖",
    descripcion: "Automatización de procesos con inteligencia artificial",
    keywords: ["RPA", "Automation", "Process Mining", "Workflow", "Business Intelligence"],
    prompt: "Escribe sobre Automatización con IA. Analiza RPA (Robotic Process Automation), automatización de workflows, impacto en empleos, casos de éxito empresarial, herramientas como n8n, Zapier, y el futuro del trabajo automatizado."
  },
  {
    id: "etica-ia",
    nombre: "Ética en IA",
    emoji: "⚖️",
    descripcion: "Consideraciones éticas y responsables en IA",
    keywords: ["AI Ethics", "Bias", "Fairness", "Transparency", "Responsible AI"],
    prompt: "Crea un artículo sobre Ética en IA. Discute sesgos algorítmicos, transparencia, responsabilidad, regulaciones como el AI Act de la UE, privacidad de datos, y cómo desarrollar IA de manera ética y responsable."
  }
];
class GeminiAIService {
  static {
    this.model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  }
  /**
   * Limpiar contenido generado eliminando bloques de código markdown innecesarios
   */
  static limpiarContenido(contenido) {
    return contenido.replace(/^```markdown\s*/i, "").replace(/\s*```\s*$/i, "").replace(/^```\s*/i, "").replace(/\s*```\s*$/i, "").trim();
  }
  /**
   * Generar URL de imagen desde Unsplash basada en keywords del tema
   */
  static async generarImagenURL(tema, keywords) {
    try {
      const accessKey = process.env.UNSPLASH_ACCESS_KEY || "BanqJYPHGfqqCACbct84AzuSYYJ3mGxme_O5j-rA8as";
      console.log("🔑 Unsplash Access Key presente:", !!accessKey);
      if (!accessKey) ;
      const getVisualTerms = (keywords2) => {
        const visualMapping = {
          // AI/ML Terms -> Visual concepts
          LLM: ["artificial intelligence", "technology", "computer science", "future tech"],
          GPT: ["ai technology", "computer brain", "digital innovation"],
          "AI Ethics": ["ethics", "balance", "justice", "responsibility"],
          Bias: ["balance", "equality", "fairness", "justice"],
          Fairness: ["balance", "equality", "scales", "justice"],
          Transparency: ["glass", "clear", "transparency", "crystal"],
          RAG: ["search", "database", "information", "research"],
          "Vector DB": ["data", "network", "connections", "abstract"],
          Embeddings: ["network", "connections", "abstract patterns"],
          "Generative AI": ["creativity", "art", "creation", "digital art"],
          "DALL-E": ["digital art", "creativity", "artificial art"],
          Midjourney: ["art", "creativity", "digital creation"],
          "Deep Learning": ["neural network", "brain", "technology"],
          "Neural Networks": ["network", "connections", "brain patterns"],
          "Computer Vision": ["eyes", "vision", "cameras", "surveillance"],
          "Image Recognition": ["camera", "lens", "photography", "eyes"],
          NLP: ["communication", "language", "speech", "conversation"],
          Chatbots: ["conversation", "communication", "chat", "messaging"],
          RPA: ["automation", "robots", "machinery", "efficiency"],
          Automation: ["robots", "machinery", "gear", "efficiency"],
          "Machine Learning": ["learning", "education", "technology", "computer"]
        };
        const visualTerms2 = [];
        keywords2.forEach((keyword) => {
          const mapped = visualMapping[keyword];
          if (mapped) {
            visualTerms2.push(...mapped);
          } else {
            visualTerms2.push("technology", "digital", "innovation");
          }
        });
        return Array.from(new Set(visualTerms2));
      };
      const visualTerms = getVisualTerms(keywords);
      const searchTerms = [
        // Términos específicos mapeados
        ...visualTerms.slice(0, 3),
        // Términos genéricos de tecnología con alta probabilidad
        "technology",
        "computer",
        "digital",
        "innovation",
        "business",
        "office",
        "modern",
        "abstract",
        "network",
        "data"
      ].filter(Boolean);
      console.log("🎯 Términos de búsqueda optimizados:", searchTerms.slice(0, 5));
      for (const searchTerm of searchTerms) {
        console.log(`🔍 Buscando imagen en Unsplash para: "${searchTerm}"`);
        try {
          const response = await fetch(
            `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchTerm)}&per_page=10&orientation=landscape&order_by=relevant`,
            {
              headers: {
                Authorization: `Client-ID ${accessKey}`
              }
            }
          );
          if (!response.ok) {
            console.error("❌ Error de Unsplash API:", response.status, response.statusText);
            continue;
          }
          const data = await response.json();
          console.log(`📊 Resultados de Unsplash para "${searchTerm}":`, data.results?.length || 0);
          if (data.results && data.results.length > 0) {
            const randomIndex = Math.floor(Math.random() * Math.min(data.results.length, 10));
            const image = data.results[randomIndex];
            const imageUrl = image.urls.regular;
            console.log("✅ Imagen encontrada:", imageUrl);
            console.log("📷 Fotógrafo:", image.user.name);
            return imageUrl;
          }
        } catch (fetchError) {
          console.error(`❌ Error buscando "${searchTerm}":`, fetchError);
          continue;
        }
      }
      console.log("⚠️ No se encontraron resultados para ningún término de búsqueda");
      return `https://via.placeholder.com/800x400/3b82f6/ffffff?text=${encodeURIComponent(tema.split(" ")[0])}`;
    } catch (error) {
      console.error("❌ Error general obteniendo imagen de Unsplash:", error);
      return `https://via.placeholder.com/800x400/ef4444/ffffff?text=${encodeURIComponent("Error")}`;
    }
  }
  /**
   * 🆕 NUEVA FUNCIONALIDAD: Generar títulos únicos y diversos
   */
  static async generarTituloUnico(tema, fechaActual) {
    const enfoques = {
      "etica-ia": [
        "Construyendo IA Responsable: El Futuro de la Tecnología Ética",
        "Sesgos Algorítmicos: Cómo Crear Sistemas Justos e Inclusivos",
        "IA Transparente: Principios para el Desarrollo Responsable",
        "El Dilema Ético de la Inteligencia Artificial en {año}",
        "Regulación vs Innovación: El Balance Perfecto en IA",
        "Privacidad Digital: Protegiendo Datos en la Era de la IA",
        "IA Inclusiva: Eliminando Sesgos de Género y Raza",
        "El Código de Ética que Toda Empresa de IA Necesita"
      ],
      llm: [
        "GPT-4 vs Claude vs Gemini: La Batalla de los Titanes LLM",
        "Large Language Models: Revolucionando la Comunicación Humana",
        "El Poder Oculto de los Modelos de Lenguaje Masivos",
        "LLM en Empresas: Casos de Uso que Transforman Industrias",
        "Optimizando Prompts: El Arte de Comunicarse con IA",
        "Multimodalidad en LLM: Texto, Imagen y Audio Unificados",
        "Fine-Tuning de Modelos: Personalización Empresarial Avanzada",
        "El Futuro del Trabajo con Large Language Models"
      ],
      rag: [
        "RAG vs Fine-Tuning: ¿Cuál Elegir para tu Proyecto?",
        "Vector Databases: El Motor Secreto detrás de RAG",
        "Implementando RAG: De Prototipo a Producción",
        "Embeddings Avanzados: Mejorando la Precisión de RAG",
        "RAG Multimodal: Combinando Texto, Imágenes y Documentos",
        "Chunking Strategies: Optimizando Datos para RAG",
        "RAG en Tiempo Real: Sistemas de Conocimiento Dinámicos",
        "Evaluando Performance: Métricas Clave para Sistemas RAG"
      ],
      "ia-generativa": [
        "Dall-E 3 vs Midjourney vs Stable Diffusion: Comparativa {año}",
        "IA Generativa en Marketing: Creatividad Sin Límites",
        "Generación de Código con IA: El Desarrollador del Futuro",
        "Arte Digital Revolucionario: Cuando la IA Se Vuelve Creativa",
        "Video Generativo: Sora y el Futuro del Contenido Audiovisual",
        "Música Creada por IA: Compositores Artificiales Emergentes",
        "Copyright y IA Generativa: Navegando Aguas Legales",
        "Workflows Creativos: Integrando IA en Procesos Artísticos"
      ],
      "machine-learning": [
        "AutoML: Democratizando el Aprendizaje Automático",
        "Deep Learning sin Código: Herramientas No-Code para ML",
        "MLOps en {año}: DevOps para Modelos de Machine Learning",
        "Edge AI: Llevando Machine Learning a Dispositivos Móviles",
        "Federated Learning: ML Distribuido y Privacidad por Diseño",
        "Explainable AI: Modelos Transparentes y Comprensibles",
        "Transfer Learning: Reutilizando Conocimiento en ML",
        "ML en la Nube: AWS vs Azure vs Google Cloud"
      ],
      "computer-vision": [
        "Visión por Computadora en Medicina: Diagnósticos del Futuro",
        "Reconocimiento Facial Ético: Tecnología con Responsabilidad",
        "Computer Vision en Retail: Revolucionando la Experiencia",
        "Realidad Aumentada con IA: Fusionando Mundos Virtuales",
        "Detección de Objetos en Tiempo Real: YOLO y Más Allá",
        "OCR Inteligente: Extrayendo Datos de Documentos Complejos",
        "Análisis de Video con IA: Seguridad y Vigilancia Avanzada",
        "Vision Transformers: La Nueva Era del Procesamiento Visual"
      ],
      nlp: [
        "Análisis de Sentimientos: Entendiendo Emociones en Texto",
        "Chatbots Conversacionales: Más Allá de las Respuestas Simples",
        "Traducción Neural: Rompiendo Barreras Idiomáticas",
        "NLP Multilingüe: Procesando 100+ Idiomas Simultáneamente",
        "Named Entity Recognition: Extrayendo Información Clave",
        "Summarización Automática: Condensando Información Masiva",
        "Question Answering: Sistemas que Realmente Comprenden",
        "Text-to-Speech Emocional: Voces Sintéticas con Sentimiento"
      ],
      "automatizacion-ia": [
        "RPA + IA: La Automatización Inteligente del Futuro",
        "Workflows Autónomos: Procesos que Se Optimizan Solos",
        "Automatización de Documentos: De PDF a Datos Estructurados",
        "IA en Manufacturing: Fábricas Autónomas e Inteligentes",
        "Process Mining con IA: Descubriendo Ineficiencias Ocultas",
        "Automatización Cognitiva: Cuando los Bots Piensan",
        "No-Code Automation: Automatización Sin Programación",
        "Hiperautomatización: El Ecosistema Completo Automatizado"
      ]
    };
    const titulosDisponibles = enfoques[tema.id] || [
      `${tema.nombre}: Innovaciones y Tendencias {año}`,
      `El Futuro de ${tema.nombre}: Perspectivas {año}`,
      `Dominando ${tema.nombre}: Guía Práctica Actualizada`,
      `${tema.nombre} en la Práctica: Casos de Uso Reales`,
      `Revolucionando con ${tema.nombre}: Estrategias Avanzadas`
    ];
    const tituloAleatorio = titulosDisponibles[Math.floor(Math.random() * titulosDisponibles.length)];
    const añoActual = (/* @__PURE__ */ new Date()).getFullYear();
    return tituloAleatorio.replace("{año}", añoActual.toString());
  }
  /**
   * Genera un blog completo usando Gemini AI con imagen, título único y contenido dinámico
   */
  static async generarBlog(temaId) {
    const tema = TEMAS_PREDEFINIDOS.find((t) => t.id === temaId);
    if (!tema) {
      throw new Error("Tema no encontrado");
    }
    try {
      const fechaActual = (/* @__PURE__ */ new Date()).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });
      const enfoqueDinamico = this.generarEnfoqueDinamico(tema);
      const estructuraDinamica = this.generarEstructuraDinamica();
      const elementosVariabilidad = this.generarElementosVariabilidad();
      const semillaAleatoria = Math.floor(Math.random() * 1e3);
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
      console.log("🎯 Generando contenido con enfoque:", enfoqueDinamico.substring(0, 100) + "...");
      const result = await this.model.generateContent(promptPrincipal);
      let contenido = result.response.text();
      contenido = this.limpiarContenido(contenido);
      const tituloMatch = contenido.match(/^#\s+(.+)$/m);
      const tituloGenerado = tituloMatch ? tituloMatch[1] : null;
      const tituloUnico = await this.generarTituloUnico(tema, fechaActual);
      if (tituloGenerado && tituloGenerado !== tituloUnico) {
        contenido = contenido.replace(/^#\s+.+$/m, `# ${tituloUnico}`);
      }
      const promptResumen = `
Basándote en este artículo específico sobre ${tema.nombre}, genera un resumen de máximo 200 caracteres que capture la esencia ÚNICA de este artículo en particular.

Artículo:
${contenido.substring(0, 1e3)}...

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
      const imagenURL = await this.generarImagenURL(tema.nombre, tema.keywords);
      const palabras = contenido.split(" ").length;
      const tiempo_lectura = Math.max(1, Math.ceil(palabras / 250));
      console.log("✅ Blog generado con variabilidad máxima:", {
        titulo: tituloUnico,
        palabras,
        tiempo_lectura,
        semilla: semillaAleatoria
      });
      return {
        titulo: tituloUnico,
        contenido,
        resumen: resumen.substring(0, 200),
        tags: tema.keywords,
        tiempo_lectura,
        meta_titulo: tituloUnico,
        meta_descripcion: resumen.substring(0, 160),
        imagen_url: imagenURL
      };
    } catch (error) {
      console.error("Error generando blog con Gemini:", error);
      throw new Error("Error al generar el contenido del blog");
    }
  }
  /**
   * 🆕 NUEVA FUNCIONALIDAD: Generar enfoques dinámicos y diversos para el contenido
   */
  static generarEnfoqueDinamico(tema) {
    const enfoquesPorTema = {
      "etica-ia": [
        {
          enfoque: "Casos de estudio y ejemplos reales",
          prompt: "Enfócate en casos reales de problemas éticos en IA que han ocurrido en empresas como Amazon, Google, Microsoft. Analiza qué salió mal y cómo se solucionó. Incluye ejemplos específicos de sesgos algorítmicos en contratación, reconocimiento facial, y sistemas de justicia.",
          estilo: "narrativo y basado en casos"
        },
        {
          enfoque: "Marco regulatorio y compliance",
          prompt: "Enfócate en las regulaciones actuales como el AI Act de la UE, GDPR, y marcos normativos emergentes. Explica cómo las empresas pueden implementar compliance y qué significa para el desarrollo de IA. Incluye requisitos específicos y multas por incumplimiento.",
          estilo: "técnico-legal"
        },
        {
          enfoque: "Implementación práctica en empresas",
          prompt: "Enfócate en cómo las empresas pueden implementar ética en IA de forma práctica. Incluye frameworks, herramientas, procesos de auditoría, comités de ética, y métricas para medir fairness. Proporciona una guía paso a paso para CTOs y equipos de desarrollo.",
          estilo: "guía práctica"
        },
        {
          enfoque: "Futuro y tendencias emergentes",
          prompt: "Enfócate en las tendencias futuras de ética en IA: IA explicable, auditorías automáticas, certificaciones de IA ética, impacto social, y cómo evolucionará la regulación. Analiza qué viene después del AI Act y cómo se preparan las empresas.",
          estilo: "prospectivo y visionario"
        }
      ],
      llm: [
        {
          enfoque: "Comparativa técnica detallada",
          prompt: "Realiza una comparativa técnica profunda entre GPT-4, Claude-3, Gemini-2.0, y otros LLMs. Analiza arquitectura, capacidades, limitaciones, costos, APIs, y casos de uso específicos. Incluye benchmarks reales y métricas de performance.",
          estilo: "técnico-comparativo"
        },
        {
          enfoque: "Implementación empresarial",
          prompt: "Enfócate en cómo las empresas están implementando LLMs: desde startups hasta Fortune 500. Analiza casos de uso reales, ROI, integración con sistemas existentes, desafíos de implementación, y lecciones aprendidas.",
          estilo: "business-oriented"
        },
        {
          enfoque: "Desarrollo y fine-tuning",
          prompt: "Enfócate en el aspecto técnico de desarrollo: fine-tuning, prompt engineering, RAG integration, vector databases, embedding strategies, y optimización de performance. Incluye código y ejemplos prácticos.",
          estilo: "técnico-práctico"
        },
        {
          enfoque: "Impacto social y futuro del trabajo",
          prompt: "Analiza cómo los LLMs están transformando el trabajo: automatización de tareas, nuevos roles profesionales, impacto en educación, creatividad, y productividad. Discute el futuro del trabajo humano-IA colaborativo.",
          estilo: "sociológico-prospectivo"
        }
      ],
      rag: [
        {
          enfoque: "Arquitectura e implementación técnica",
          prompt: "Enfócate en la arquitectura técnica de RAG: vector databases (Pinecone, Weaviate, Chroma), embedding models, chunking strategies, retrieval algorithms, y optimización de performance. Incluye diagramas y código.",
          estilo: "técnico-arquitectural"
        },
        {
          enfoque: "Casos de uso empresariales",
          prompt: "Analiza implementaciones reales de RAG en empresas: chatbots corporativos, sistemas de soporte, knowledge management, análisis de documentos, y customer service. Incluye métricas de éxito y ROI.",
          estilo: "business cases"
        },
        {
          enfoque: "Comparativa con otras tecnologías",
          prompt: "Compara RAG vs fine-tuning, RAG vs traditional search, RAG vs knowledge graphs. Analiza cuándo usar cada aproximación, ventajas, desventajas, y hybrid approaches.",
          estilo: "comparativo-analítico"
        },
        {
          enfoque: "Mejores prácticas y optimización",
          prompt: "Enfócate en mejores prácticas: data preparation, chunk optimization, retrieval tuning, evaluation metrics, monitoring, y troubleshooting. Proporciona una guía completa de implementación.",
          estilo: "guía de mejores prácticas"
        }
      ]
    };
    const enfoques = enfoquesPorTema[tema.id] || [
      {
        enfoque: "Análisis técnico profundo",
        prompt: `Enfócate en los aspectos técnicos avanzados de ${tema.nombre}. Incluye implementaciones, herramientas, frameworks, y ejemplos de código prácticos.`,
        estilo: "técnico-profundo"
      },
      {
        enfoque: "Casos de uso empresariales",
        prompt: `Analiza cómo las empresas están implementando ${tema.nombre} en el mundo real. Incluye casos de éxito, ROI, y lecciones aprendidas.`,
        estilo: "business-oriented"
      },
      {
        enfoque: "Tendencias y futuro",
        prompt: `Explora las tendencias emergentes y el futuro de ${tema.nombre}. Analiza hacia dónde se dirige la tecnología y qué viene después.`,
        estilo: "prospectivo"
      }
    ];
    const enfoqueSeleccionado = enfoques[Math.floor(Math.random() * enfoques.length)];
    return enfoqueSeleccionado.prompt;
  }
  /**
   * 🆕 NUEVA FUNCIONALIDAD: Generar variaciones de estructura del artículo
   */
  static generarEstructuraDinamica() {
    const estructuras = [
      {
        nombre: "Estructura Clásica",
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
[Resume los puntos clave y proporciona reflexiones finales]`
      },
      {
        nombre: "Estructura Problem-Solution",
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
[Resume y motiva a la acción]`
      },
      {
        nombre: "Estructura Comparativa",
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
[Personaliza las recomendaciones]`
      },
      {
        nombre: "Estructura de Guía Paso a Paso",
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
[Cómo continuar mejorando]`
      }
    ];
    const estructuraSeleccionada = estructuras[Math.floor(Math.random() * estructuras.length)];
    return estructuraSeleccionada.template;
  }
  /**
   * 🆕 NUEVA FUNCIONALIDAD: Generar elementos de variabilidad adicional
   */
  static generarElementosVariabilidad() {
    const elementos = [
      "Incluye estadísticas y datos específicos de 2025",
      "Menciona herramientas y empresas reales del sector",
      "Incorpora citas de expertos reconocidos en el campo",
      "Agrega ejemplos de código o implementación cuando sea relevante",
      "Incluye métricas de performance y benchmarks",
      "Menciona regulaciones y compliance relevantes",
      "Incorpora análisis de costos y ROI",
      "Agrega perspectivas de diferentes industrias",
      "Incluye roadmap y timeline de implementación",
      "Menciona riesgos y mitigaciones específicas"
    ];
    const elementosSeleccionados = elementos.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 2) + 3);
    return elementosSeleccionados.map((elemento) => `- ${elemento}`).join("\n");
  }
  /**
   * Generar slug a partir del título
   */
  static generarSlug(titulo) {
    return titulo.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-").substring(0, 50);
  }
  /**
   * Obtener tema por ID
   */
  static obtenerTema(temaId) {
    return TEMAS_PREDEFINIDOS.find((t) => t.id === temaId);
  }
}

const POST = async ({ request }) => {
  try {
    const { temaId } = await request.json();
    if (!temaId) {
      return new Response(JSON.stringify({ error: "Tema ID es requerido" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const tema = GeminiAIService.obtenerTema(temaId);
    if (!tema) {
      return new Response(JSON.stringify({ error: "Tema no encontrado" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    const tiempoInicio = Date.now();
    const fechaInicio = (/* @__PURE__ */ new Date()).toISOString();
    console.log(`🤖 Generando blog sobre: ${tema.nombre}...`);
    const blogGenerado = await GeminiAIService.generarBlog(temaId);
    const tiempoFin = Date.now();
    const fechaFin = (/* @__PURE__ */ new Date()).toISOString();
    const tiempoGeneracionMs = tiempoFin - tiempoInicio;
    const tituloLimitado = blogGenerado.titulo.length > 60 ? blogGenerado.titulo.substring(0, 57) + "..." : blogGenerado.titulo;
    const baseSlug = GeminiAIService.generarSlug(tituloLimitado);
    const timestamp = Date.now().toString().slice(-6);
    const slugCompleto = `${baseSlug}-${timestamp}`;
    const slug = slugCompleto.length > 60 ? slugCompleto.substring(0, 60) : slugCompleto;
    const categorias = await BlogService.obtenerCategorias();
    let categoriaId = categorias.find((c) => c.slug === "ia")?.id;
    if (!categoriaId && categorias.length > 0) {
      categoriaId = categorias[0].id;
    }
    const autorCompleto = `🤖 IA - ${tema.nombre}`;
    const autor = autorCompleto.length > 60 ? autorCompleto.substring(0, 57) + "..." : autorCompleto;
    const nuevoPost = await BlogService.crearPost({
      titulo: tituloLimitado,
      slug,
      resumen: blogGenerado.resumen.substring(0, 200),
      // Limitar resumen también
      contenido: blogGenerado.contenido,
      categoria_id: categoriaId,
      tiempo_lectura: blogGenerado.tiempo_lectura,
      tags: blogGenerado.tags,
      publicado: true,
      destacado: false,
      meta_titulo: (blogGenerado.meta_titulo || tituloLimitado).substring(0, 60),
      meta_descripcion: (blogGenerado.meta_descripcion || blogGenerado.resumen).substring(0, 160),
      autor,
      imagen_url: blogGenerado.imagen_url
      // 🖼️ Nueva propiedad agregada
    });
    if (nuevoPost && nuevoPost.id) {
      try {
        await BlogService.registrarMetricasLLM({
          post_id: nuevoPost.id,
          modelo_usado: "gemini-2.0-flash",
          proveedor: "Google",
          version_modelo: "2.0-flash",
          // Métricas de tiempo
          tiempo_generacion_ms: tiempoGeneracionMs,
          tiempo_inicio: fechaInicio,
          tiempo_fin: fechaFin,
          // Contexto de generación
          tema_seleccionado: tema.nombre,
          prompt_sistema: "Sistema de generación de blogs con Gemini AI",
          prompt_usuario: tema.prompt,
          // Calidad estimada (basada en longitud del contenido)
          calidad_estimada: blogGenerado.contenido.length > 1500 ? 5 : blogGenerado.contenido.length > 1e3 ? 4 : 3,
          requiere_revision: false,
          // Metadatos adicionales
          metadata_llm: {
            tema_id: temaId,
            palabras_generadas: blogGenerado.contenido.split(" ").length,
            caracteres_generados: blogGenerado.contenido.length,
            tiempo_lectura_calculado: blogGenerado.tiempo_lectura
          }
        });
        console.log(`📊 Métricas LLM registradas para el post: ${nuevoPost.id}`);
      } catch (errorMetricas) {
        console.error("⚠️ Error registrando métricas LLM:", errorMetricas);
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
          palabras: blogGenerado.contenido.split(" ").length
        }
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Error generando blog:", error);
    return new Response(
      JSON.stringify({
        error: "Error interno del servidor al generar el blog",
        details: error instanceof Error ? error.message : "Error desconocido"
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
