export const TEMAS_PREDEFINIDOS = [
  { id: 'llm', nombre: 'Large Language Models', emoji: '🧠', descripcion: 'Modelos de lenguaje y sus aplicaciones', keywords: ['LLM', 'GPT', 'Transformers', 'NLP', 'ChatGPT', 'Claude', 'Gemini'] },
  { id: 'rag', nombre: 'RAG (Retrieval Augmented Generation)', emoji: '🔍', descripcion: 'Sistemas de generación aumentada por recuperación', keywords: ['RAG', 'Vector DB', 'Embeddings', 'Retrieval', 'Knowledge Base'] },
  { id: 'ia-generativa', nombre: 'IA Generativa', emoji: '🎨', descripción: 'Inteligencia artificial para crear contenido', keywords: ['Generative AI', 'DALL-E', 'Midjourney', 'Stable Diffusion', 'Content Creation'] },
  { id: 'machine-learning', nombre: 'Machine Learning', emoji: '⚡', descripcion: 'Aprendizaje automático y algoritmos', keywords: ['ML', 'Deep Learning', 'Neural Networks', 'Supervised Learning', 'Unsupervised Learning'] },
  { id: 'computer-vision', nombre: 'Computer Vision', emoji: '👁️', descripcion: 'Visión por computadora y análisis de imágenes', keywords: ['Computer Vision', 'Image Recognition', 'Object Detection', 'OCR', 'Medical Imaging'] },
  { id: 'nlp', nombre: 'Procesamiento de Lenguaje Natural', emoji: '💬', descripcion: 'NLP y comprensión del lenguaje humano', keywords: ['NLP', 'Natural Language Processing', 'Sentiment Analysis', 'Text Mining', 'Chatbots'] },
  { id: 'automatizacion-ia', nombre: 'Automatización con IA', emoji: '🤖', descripcion: 'Automatización de procesos con inteligencia artificial', keywords: ['RPA', 'Automation', 'Process Mining', 'Workflow', 'Business Intelligence'] },
  { id: 'etica-ia', nombre: 'Ética en IA', emoji: '⚖️', descripcion: 'Consideraciones éticas y responsables en IA', keywords: ['AI Ethics', 'Bias', 'Fairness', 'Transparency', 'Responsible AI'] },
];

interface BlogGenerado {
  titulo: string;
  contenido: string;
  resumen: string;
  tags: string[];
  tiempo_lectura: number;
  meta_titulo: string;
  meta_descripcion: string;
  imagen_url: string;
}

export class OllamaService {
  private static ollamaUrl = import.meta.env.OLLAMA_URL || 'http://agenterag-com_ollama:11434';
  private static ollamaModel = import.meta.env.OLLAMA_MODEL || 'llama3.2:3b';

  static async generarImagenURL(tema: string, keywords: string[]): Promise<string> {
    try {
      const accessKey = import.meta.env.UNSPLASH_ACCESS_KEY;
      if (!accessKey) {
        return `https://via.placeholder.com/800x400/1f2937/ffffff?text=${encodeURIComponent(tema)}`;
      }

      const searchTerm = keywords[Math.floor(Math.random() * keywords.length)] || 'technology';
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchTerm)}&per_page=10&orientation=landscape`,
        { headers: { Authorization: `Client-ID ${accessKey}` } }
      );

      if (!response.ok) return `https://via.placeholder.com/800x400/3b82f6/ffffff?text=${encodeURIComponent(tema)}`;

      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const randomIndex = Math.floor(Math.random() * Math.min(data.results.length, 10));
        return data.results[randomIndex].urls.regular;
      }

      return `https://via.placeholder.com/800x400/3b82f6/ffffff?text=${encodeURIComponent(tema)}`;
    } catch (error) {
      console.error('Error obteniendo imagen:', error);
      return `https://via.placeholder.com/800x400/ef4444/ffffff?text=Error`;
    }
  }

  static async generarBlog(temaId: string): Promise<BlogGenerado> {
    const tema = TEMAS_PREDEFINIDOS.find((t) => t.id === temaId);
    if (!tema) throw new Error('Tema no encontrado');

    try {
      const semilla = Math.floor(Math.random() * 1000);
      const prompt = `SEMILLA: ${semilla}. TEMA: ${tema.nombre}.\n\nEscribe en español un artículo profesional de mínimo 1800 palabras sobre ${tema.nombre}. Usa formato Markdown limpio. La respuesta DEBE ser un único objeto JSON válido con esta estructura: {"titulo":"...","resumen":"...","contenido":"...","tiempo_lectura":5,"tags":["..."],"meta_titulo":"...","meta_descripcion":"..."}`;

      const response = await fetch(`${this.ollamaUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: this.ollamaModel, prompt, stream: false, format: 'json' }),
      });

      if (!response.ok) throw new Error(`Error de Ollama: ${response.statusText}`);

      const result = await response.json();
      if (!result.response) throw new Error('Respuesta inválida de Ollama');

      const blogData = JSON.parse(result.response);
      const imagenURL = await this.generarImagenURL(tema.nombre, tema.keywords);

      return {
        titulo: blogData.titulo,
        contenido: blogData.contenido,
        resumen: blogData.resumen.substring(0, 200),
        tags: tema.keywords,
        tiempo_lectura: blogData.tiempo_lectura ?? 7,
        meta_titulo: blogData.meta_titulo ?? blogData.titulo,
        meta_descripcion: blogData.meta_descripcion ?? blogData.resumen.substring(0, 160),
        imagen_url: imagenURL,
      };
    } catch (error) {
      console.error('Error generando blog con Ollama:', error);
      throw new Error('Error al generar el contenido del blog');
    }
  }

  static generarSlug(titulo: string): string {
    return titulo
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 50);
  }

  static obtenerTema(temaId: string) {
    return TEMAS_PREDEFINIDOS.find((t) => t.id === temaId);
  }
}
