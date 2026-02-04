'use client';

import React, { useEffect, useRef } from 'react';
import { cn } from '../../utils/cn';
import p5 from 'p5';

// Declaraciones globales para TypeScript
declare global {
  interface Window {
    _P5CursorInstances?: Record<string, any>;
  }
  interface Navigator {
    msMaxTouchPoints?: number;
  }
}

interface P5CursorBackgroundProps {
  className?: string;
  children?: React.ReactNode;
}

export const P5CursorBackground: React.FC<P5CursorBackgroundProps> = ({ className, children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sketchRef = useRef<p5 | null>(null);

  useEffect(() => {
    // Intersection Observer para detectar visibilidad
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const isVisible = entry.isIntersecting;
          console.log(
            `P5CursorBackground: Visibilidad cambiada a ${isVisible ? 'VISIBLE' : 'OCULTO'}`
          );

          if (sketchRef.current) {
            if (isVisible) {
              console.log('P5CursorBackground: ▶️ Reanudando animación');
              if (sketchRef.current.loop) sketchRef.current.loop();
            } else {
              console.log('P5CursorBackground: ⏸️ Pausando animación');
              if (sketchRef.current.noLoop) sketchRef.current.noLoop();
            }
          }
        });
      },
      {
        rootMargin: '0px',
        threshold: 0.1,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    console.log('P5CursorBackground: Iniciando useEffect sketch');

    if (!containerRef.current) {
      console.log('P5CursorBackground: No hay containerRef');
      return;
    }

    if (typeof window === 'undefined') {
      console.log('P5CursorBackground: Window no definido');
      return;
    }

    console.log('P5CursorBackground: Creando sketch');

    const sketch = (p: p5) => {
      let entities: any[] = [];
      let canvas: p5.Renderer;

      const isMobile = () => {
        return (
          typeof window !== 'undefined' &&
          (window.innerWidth <= 768 ||
            'ontouchstart' in window ||
            navigator.maxTouchPoints > 0 ||
            (navigator as any).msMaxTouchPoints > 0)
        );
      };

      let numEntities = isMobile() ? 11 : 9;
      let userInteracting = false;
      let interactionPos: p5.Vector;

      // Niveles de z-index para los cursores
      const Z_LEVELS = {
        BELOW: 3,
        NORMAL: 11,
        ABOVE: 15,
      };

      const cursorColors = [
        '#FF4757',
        '#FFA502',
        '#1E90FF',
        '#32CD32',
        '#FF69B4',
        '#9370DB',
        '#00CED1',
        '#FF00FF',
      ];

      const reactionThoughts = ['?', '!', '..', 'Hmm', ':O', '¿Eh?', '😮', '👍', '👀', '😅', '🤦'];

      const thoughts = [
        // ---- RAG / IA ---- (Más cortos y al grano)

        '¡Embedding encontrado!',
        'Prompt engineering... ¡suena pro! 😎',

        // ---- Empresas / Oficina (Humor) ----
        'Optimizando... (o no) ✨',
        'CAFEINA!!!! 🤪 ☕',
        'Webhook recibido. ¡Pescando datos! 🎣',
        'Más eficiencia = más reuniones 🤦',
        'Deadline: Ayer. Status: Pánico chic 💅',
        'Error 404: Impresora (clásico) 📠',
        'Reunión viernes 5 PM... ¡ánimo! 🙄',
        'Asunto: URGENTE... ajá 🙄',
        'Mi código funciona. No preguntes. 🙏',
        '¡Deploy en viernes! 😬',
        'Stack Overflow... mi hogar ❤️',
        'No es bug, es feature 🎉',
        '¿API Key? En un post-it... creo 📝',

        // ---- Existenciales / Autoreferencia / Varios ----
        '¿Existir en un canvas?',
        'Si me borran... ¿al `null`? 😱',
        '¿Soy rápido o ellos lentos? 💨',
        'Movimiento es vida (o evita GC) 🗑️',
        '¡Borde elástico! ¡Boing!',
        'Zzz... ovejas eléctricas 🐑⚡',
        '¡Clickear, clickear! 🖱️',
        '¿Vida en otros `.js`?',
        'Renderizando con estilo ✨',
        'Glup.',
        '¿Café virtual? ☕️',

        // ---- Emojis sueltos ----
        '🖱️',
        '💭',
        '🤔',
        '💡',
        '✨',
        '😴',
        '🚀',
        '🎯',
        '👀',
        '🤯',
        '🤷',
        '🤖',
        '☕',
        '🎉',
        '😬',
        '⏳',
      ];

      const annoyedThoughts = [
        '¡Hola! 👋',
        'jajajaja, ¿qué quieres? 😏',
        'Cual fue el mal que yo hice 😫',
        'Si, soy un cursor. ¿Y? 😒',
        'Lee nuestro BLOG 🤓',
        'Dudas? usa nuestro FAQ 🤓',
      ];

      // Sistema de conversaciones más dinámicas con respuestas contextuales (COMPLETO)
      const conversationTopics = {
        ragBenefits: {
          qa: [
            {
              question: '¿Para qué sirve RAG realmente?',
              answer: '¡Para encontrar la aguja en el pajar de datos! Y sin pincharse.',
            },
            {
              question: '¿Reduce las "alucinaciones" de verdad?',
              answer: '¡Más que agüita de melisa! Se basa en documentos reales, no inventa.',
            },
            {
              question: '¿Es más rápido que buscar a mano?',
              answer: '¡Obvio! Como comparar un Twingo con un F1 buscando info.',
            },
            {
              question: '¿Mantiene la info actualizada?',
              answer: 'Si alimentas la base, sí. ¡No es adivino, pero casi!',
            },
            {
              question: '¿Sirve para cualquier tipo de documento?',
              answer: 'PDFs, webs, bases de datos... ¡Le entra a casi todo!',
            },
          ],
          followups: [
            {
              question: '¿Entonces responde con fuentes?',
              answer: '¡Esa es la gracia! Te dice de dónde sacó la info. ¡Cero chamullo!',
            },
            {
              question: '¿Difícil de implementar?',
              answer: 'Tiene su ciencia, pero menos que armar mueble de retail sin manual.',
            },
            {
              question: '¿Necesita mucho entrenamiento?',
              answer: 'Más que nada necesita buenos datos indexados. ¡Basura entra, basura sale!',
            },
            {
              question: '¿Puede resumir documentos largos?',
              answer: '¡Sí! Te ahorra leerte la Biblia en verso para sacar la idea principal.',
            },
            {
              question: '¿Y si la pregunta es ambigua?',
              answer:
                'Te puede pedir aclarar o darte la mejor opción. ¡Más tino que algunos jefes!',
            },
          ],
        },
        onboardingHelp: {
          qa: [
            {
              question: '¿El nuevo preguntando dónde está el café?',
              answer: '¡Que le pregunte al RAG! Se sabe hasta el manual de la cafetera. ☕️',
            },
            {
              question: '¿Política de vacaciones? ¡De nuevo!',
              answer: 'El RAG se la sabe de memoria... ¡y no juzga si pides muchos días! 😉',
            },
            {
              question: '¿Cómo se pide un reembolso de gastos?',
              answer: '¡El RAG te guía paso a paso! Más fácil que pelar una mandarina.',
            },
            {
              question: '¿Quién es el jefe de X área?',
              answer: '¡RAG tiene el organigrama! Actualizado... esperemos. 😄',
            },
            {
              question: '¿Dónde encuentro la plantilla para X informe?',
              answer: '¡En la base de conocimiento! El RAG te da el link al toque.',
            },
          ],
          followups: [
            {
              question: '¿Le quita pega a RRHH?',
              answer:
                '¡Les ahorra pega repetitiva! Así se enfocan en lo importante... ¿o en tomar café?',
            },
            {
              question: '¿Responde más rápido que un compañero?',
              answer: '¡24/7 y sin mala cara! A menos que el servidor ande mañoso.',
            },
            {
              question: '¿Puede tener info desactualizada?',
              answer: 'Si nadie actualiza los docs, sí. ¡El RAG no hace milagros!',
            },
            {
              question: '¿Entiende preguntas informales?',
              answer: '¡Intenta! Le puedes preguntar "¿Cachai cómo pedir vacaciones?"',
            },
            {
              question: '¿Sirve para capacitar también?',
              answer: '¡Claro! Puede explicar procesos internos, ¡mejor que algunos videos fomes!',
            },
          ],
        },
        salesSupport: {
          qa: [
            {
              question: '¿Ventas necesita la ficha técnica AHORA?',
              answer: '¡El RAG la tiene! Más rápido que vendedor cerrando trato. ⚡️',
            },
            {
              question: '¿Comparar nuestro producto con la competencia?',
              answer: 'RAG te arma la tabla mientras buscas el argumento ganador. 😎',
            },
            {
              question: '¿Cuál es el descuento máximo aprobado?',
              answer: '¡El RAG revisa la política comercial! Evita meter la pata.',
            },
            {
              question: '¿Tenemos stock de X producto?',
              answer: '¡Conectado al inventario, RAG te dice al tiro! (Si está bien conectado...)',
            },
            {
              question: '¿Argumentos clave para vender Y?',
              answer: '¡RAG te los resume! Listos para la llamada.',
            },
          ],
          followups: [
            {
              question: '¿Le ayuda a vender más?',
              answer: '¡Les da súper poderes de información! Cierran más rápido y seguros.',
            },
            {
              question: '¿Necesitan entrenamiento especial?',
              answer: 'Preguntar nomás. ¡Como hablarle a Google, pero con secretos de la empresa!',
            },
            {
              question: '¿Puede buscar casos de éxito similares?',
              answer: '¡Sí! Si están documentados, los encuentra para inspirarse.',
            },
            {
              question: '¿Funciona en el celular?',
              answer: '¡Debería! Para responderle al cliente desde el taco.',
            },
            {
              question: '¿Cliente pregunta algo muy técnico?',
              answer: 'RAG busca en manuales y se la juega con la respuesta. ¡Un crack!',
            },
          ],
        },
        supportBoost: {
          qa: [
            {
              question: '¿Cliente esperando por el FAQ eterno?',
              answer: '¡Con RAG, la respuesta sale al toque! Cliente feliz, agente también. 😊',
            },
            {
              question: '¿Esa pregunta específica que nadie cacha?',
              answer: '¡El RAG la desentierra! Tiene memoria de elefante con SSD. 🐘💾',
            },
            {
              question: '¿Cómo resolver error X de hace meses?',
              answer: 'RAG busca en tickets antiguos y ¡voilà! La solución.',
            },
            {
              question: '¿Generar resumen del caso para escalar?',
              answer: '¡Lo hace RAG! Copiar, pegar y listo. Menos burocracia.',
            },
            {
              question: '¿Reducir tiempo de respuesta?',
              answer: '¡Caleta! Menos espera, más soluciones. ¡Pura eficiencia!',
            },
          ],
          followups: [
            {
              question: '¿Puede responder directo al cliente?',
              answer: 'Podría, pero mejor que un humano revise. ¡Para darle el toque personal!',
            },
            {
              question: '¿Sugiere artículos relacionados?',
              answer: '¡Sí! Para que el agente aprenda o mande más info.',
            },
            {
              question: '¿Entiende el historial del cliente?',
              answer: 'Si tiene acceso a esos datos, sí. ¡Contexto es rey!',
            },
            {
              question: '¿Se integra con el sistema de tickets?',
              answer: '¡La idea es esa! Que viva donde trabajan los agentes.',
            },
            {
              question: '¿Cuesta muy caro mantenerlo?',
              answer: 'Menos que tener clientes enojados esperando... probablemente.',
            },
          ],
        },
        policyFinder: {
          qa: [
            {
              question: '¿Buscar cláusula en reglamento gigante?',
              answer: '¡Pídeselo al RAG! Lo encuentra antes que digas "contrato". 📄🔍',
            },
            {
              question: '¿Política sobre trabajar desde la playa?',
              answer: 'RAG te cita el párrafo... y quizás te da envidia. 😉🏖️',
            },
            {
              question: '¿Cambió la política de X cosa?',
              answer: 'RAG compara versiones o busca anuncios. ¡Se sapea todo!',
            },
            {
              question: '¿Necesito aprobación para Y?',
              answer: 'El RAG revisa el flujo de aprobación. ¡Te ahorra el "pregúntale a..."',
            },
            {
              question: '¿Cuál es el procedimiento para Z?',
              answer: '¡RAG te lo explica clarito! Como con manzanas.',
            },
          ],
          followups: [
            {
              question: '¿Evita que la gente meta las patas?',
              answer: '¡Ayuda harto! Menos errores por desconocimiento.',
            },
            {
              question: '¿Más fiable que preguntarle al compañero?',
              answer: '¡Generalmente sí! El compañero puede andar en otra... o no cachar.',
            },
            {
              question: '¿Qué pasa si la política es ambigua?',
              answer: 'Te muestra el texto. La interpretación sigue siendo humana... ¡por ahora!',
            },
            {
              question: '¿Indexa documentos legales complejos?',
              answer: '¡Sí! Aunque para consejo legal, mejor un abogado de verdad.',
            },
            {
              question: '¿Sirve para auditorías?',
              answer: '¡Puede ser! Facilita encontrar evidencia y procedimientos.',
            },
          ],
        },
        tech: {
          qa: [
            { question: '¿Programas en JavaScript?', answer: 'JS y TypeScript, ¡mejor tipado!' },
            { question: '¿React o Vue?', answer: 'React, pero Svelte tienta...' },
            { question: '¿TypeScript o JavaScript?', answer: 'TypeScript. Más seguro en prod.' },
            { question: '¿P5.js o Canvas API?', answer: '¡P5! Nos da vida aquí. Más fácil.' },
            { question: '¿Backend favorito?', answer: 'Node con Express. Un clásico confiable.' },
          ],
          followups: [
            {
              question: '¿Conoces Astro?',
              answer: '¡Astro! Rápido y la arquitectura Islands, ¡genial!',
            },
            { question: '¿Has probado Qwik?', answer: 'No aún. Suena bacán lo de resumabilidad.' },
            {
              question: '¿Union types o interfaces?',
              answer: 'Interfaces para extender, Unions para valores fijos.',
            },
            {
              question: '¿Librería recomendada?',
              answer: 'Three.js (3D) y Zod (validación), ¡filete!',
            },
            { question: '¿Edge functions?', answer: 'Vercel Edge, ¡veloces!' },
          ],
        },
        office: {
          qa: [
            { question: '¿Reunión a las 5pm?', answer: '¡Reunión viernes 5 PM!? ¡Nooo! 😫' },
            {
              question: '¿Viste el email urgente?',
              answer: 'El "URGENTE"... sí. No era para tanto.',
            },
            { question: '¿KPIs de este sprint?', answer: 'KPIs bien 📈 ¡Equipo motivado!' },
            {
              question: '¿Otra vez buscando ese manual viejo?',
              answer: '¡Que le pregunten al RAG! Se ahorran la paja.',
            },
            { question: '¿Formato del informe?', answer: 'Excel, obvio 📊 (Aunque fome).' },
          ],
          followups: [
            {
              question: '¿Podemos moverla al lunes?',
              answer: 'El jefe dice "crítica"... ¡no hay escape!',
            },
            { question: '¿Respondiste ya?', answer: 'Nop. Mañana quizás. No urge.' },
            {
              question: '¿Y el equipo de marketing?',
              answer: 'Marketing... atrasados, como siempre 📉',
            },
            { question: '¿Reunión post-café?', answer: 'Con DOS cafés... quizás la aguanto.' },
            {
              question: '¿El RAG podría hacer las minutas?',
              answer: '¡Uf, ojalá! Aunque resumiría hasta los bostezos.',
            },
          ],
        },
        existential: {
          qa: [
            { question: '¿Somos solo cursores?', answer: '¿Solo cursores? ¿O algo más...?' },
            {
              question: '¿Qué hay fuera del canvas?',
              answer: 'Fuera del canvas... dicen que hay más píxeles.',
            },
            { question: '¿Alguien nos observa?', answer: 'Siento ojos... ¿usuarios? 👀' },
            {
              question: '¿Existimos al cerrar la página?',
              answer: '¿Existimos al cerrar? ¿Un loop eterno?',
            },
            {
              question: '¿Conscientes o simulamos?',
              answer: '¿Conscientes o simulamos? ¿Importa?',
            },
          ],
          followups: [
            {
              question: '¿Por qué nos movemos sin parar?',
              answer: 'Nos movemos para no desaparecer. ¡Vida!',
            },
            { question: '¿Intentado escapar?', answer: 'Los bordes rebotan. No hay escape.' },
            { question: '¿Ves a los humanos?', answer: 'Veo punteros... ¿humanos?' },
            {
              question: '¿Y si somos una simulación?',
              answer: '¿Simulación? ¡Auch! Me duele el píxel.',
            },
            { question: '¿Tenemos propósito?', answer: 'Entretener, conversar... ¿Suficiente?' },
          ],
        },
        food: {
          qa: [
            { question: '¿Datos crujientes?', answer: '¡Datos crujientes! Con salsa API, ¡ricos!' },
            { question: '¿Bytes o bits?', answer: 'Bytes. Más sabrosos.' },
            { question: '¿Almuerzo: caché o memoria?', answer: 'En caché. Más rápido y barato.' },
            {
              question: '¿Te gusta el JSON marinado?',
              answer: 'JSON marinado... ¡solo con fetch fresco!',
            },
            { question: '¿Postre favorito?', answer: 'Cookies 🍪 (¡Sin trackers!)' },
          ],
          followups: [
            { question: '¿Picante o datos planos?', answer: '¡Picante! Datos raw son fomes.' },
            { question: '¿Con o sin compresión?', answer: 'Sin comprimir. Me gusta masticar.' },
            {
              question: '¿Café de alto rendimiento?',
              answer: 'Café de alto rendimiento... ¡si compila bien! ☕',
            },
            { question: '¿Salsa REST o GraphQL?', answer: 'GraphQL. Más rica, más pega.' },
            { question: '¿Batido de píxeles?', answer: 'Batido de píxeles... ¡con extra RGB!' },
          ],
        },
        quickChat: {
          qa: [
            { question: 'Hola! 👋', answer: '¡Hola! ¿Qué tal?' },
            { question: '¡Hey!', answer: '¿Qué pasa?' },
            { question: 'Oye...', answer: '¿Dime?' },
            { question: 'Psst!', answer: '¿Sí? 👀' },
            { question: '¿Todo bien?', answer: '¡Todo cachetón! 👍 ¿Y tú?' },
            { question: '¡Uf!', answer: '¿Mucho trabajo? 😥' },
            { question: '¿Un cafecito? ☕', answer: '¡Siempre! ☕️' },
            { question: '¿Viste eso?', answer: '¿El qué? 😮 ¡No me asustes!' },
            { question: 'jajaja 😂', answer: '¡De qué te ríes! 😄' },
            { question: '¿Qué haces?', answer: 'Aquí... flotando. ¿Y tú? ✨' },
            { question: '¡Oye, te iba a decir algo!', answer: '¿Ah sí? ¿Qué cosa?' },
          ],
          followups: [
            { question: '¡Hola! ¿Qué tal?', answer: '¡Bien! Aquí, navegando.' },
            { question: '¿Qué pasa?', answer: 'Nada... solo saludaba.' },
            { question: '¿Dime?', answer: 'No, nada... se me olvidó 😊' },
            { question: '¿Sí? 👀', answer: '¡Cuidado! Casi chocamos 😬' },
            { question: '¡Todo cachetón! 👍 ¿Y tú?', answer: '¡También! Sobreviviendo al lunes.' },
            { question: '¿Mucho trabajo? 😥', answer: 'Lo normal... ¡ánimo! 💪' },
            { question: '¿Siempre! ☕️', answer: '¡Virtual, obvio! 💻' },
            {
              question: '¿El qué? 😮 ¡No me asustes!',
              answer: '¡Una sombra! ... Nah, era otro cursor.',
            },
            { question: '¡De qué te ríes! 😄', answer: '¡De un bug que encontré! 😂' },
            { question: 'Aquí... flotando. ¿Y tú? ✨', answer: '¡También! Dando vueltas.' },
            { question: '¿Ah sí? ¿Qué cosa?', answer: 'Mmm... ¡ya no me acuerdo! 😅 ¡Sorry!' },
          ],
        },
      };

      p.setup = () => {
        console.log('P5: Setup iniciado');
        const rect = containerRef.current!.getBoundingClientRect();
        console.log('P5: Dimensiones del contenedor:', rect.width, 'x', rect.height);

        if (rect.width === 0 || rect.height === 0) {
          console.log('P5: Contenedor sin dimensiones, usando valores por defecto');
          canvas = p.createCanvas(800, 600);
        } else {
          canvas = p.createCanvas(rect.width, rect.height);
        }

        canvas.parent(containerRef.current!);

        // Configurar el canvas para que sea visible pero no interfiera con eventos
        const canvasElement = canvas.elt as HTMLCanvasElement;
        canvasElement.style.position = 'absolute';
        canvasElement.style.top = '0';
        canvasElement.style.left = '0';
        canvasElement.style.width = '100%';
        canvasElement.style.height = '100%';
        canvasElement.style.zIndex = '1';
        canvasElement.style.pointerEvents = 'none';
        canvasElement.style.userSelect = 'none';
        canvasElement.style.touchAction = 'none';

        console.log('P5: Canvas creado y configurado');

        let availableColors = [...cursorColors];

        for (let i = 0; i < numEntities; i++) {
          if (availableColors.length === 0) {
            availableColors = [...cursorColors];
          }

          const randomIndex = Math.floor(p.random(availableColors.length));
          const selectedColor = availableColors[randomIndex];
          availableColors.splice(randomIndex, 1);

          entities.push(new Entity(p.random(p.width), p.random(p.height), selectedColor));
        }

        interactionPos = p.createVector(p.mouseX, p.mouseY);
      };

      p.draw = () => {
        if (p.width > 0 && p.height > 0) {
          p.clear();

          // Ordenar entidades por z-level para dibujarlas en el orden correcto
          const sortedEntities = [...entities].sort((a, b) => a.zLevel - b.zLevel);

          sortedEntities.forEach((entity) => {
            entity.checkMouseHover();
            entity.update();
            entity.display();
            entity.displayThought();
          });
        }
      };

      // Event listeners removidos para evitar interferencia con selección de texto
      // p.mousePressed y p.mouseReleased deshabilitados

      p.windowResized = () => {
        const rect = containerRef.current!.getBoundingClientRect();
        p.resizeCanvas(rect.width, rect.height);
      };

      class Entity {
        position: p5.Vector;
        velocity: p5.Vector;
        maxSpeed: number;
        baseSpeed: number;
        boostFactor: number;
        isPaused: boolean;
        pauseCooldown: number;
        pauseDuration: number;
        zLevel: number;
        cursorColor: p5.Color;
        tagColor: p5.Color;
        cursorSize: number;
        thought: string;
        thoughtTimer: number;
        thoughtDuration: number;
        currentThoughtTime: number;
        perceptionRadius: number;
        isReacting: boolean;
        isHovered: boolean;
        annoyedThought: string;
        inConversation: boolean;
        conversationPartner: any;
        conversationTopic: string | null;
        conversationMessages: any[];
        messageIndex: number;
        isStarter: boolean;
        messageTimer: number;
        messageDuration: number;
        conversationCooldown: number;
        tagPadding: number;
        tagHeight: number;
        tagRoundness: number;
        springConstant: number;
        damping: number;
        edgeMargin: number;
        attractedTo: any;
        attractionStrength: number;
        recentTopics: string[];
        recentQA: Record<string, number[]>;
        selectedQAIndex: number;
        fullText: string | null;
        typingIndex: number;
        typingSpeed: number;
        lastTypingUpdate: number;

        constructor(x: number, y: number, assignedColor: string) {
          this.position = p.createVector(x, y);
          this.velocity = p5.Vector.random2D();
          this.maxSpeed = p.random(1.8, 4.0);
          this.baseSpeed = p.random(0.6, this.maxSpeed * 0.7);
          this.velocity.setMag(this.baseSpeed);
          this.boostFactor = p.random(0.9, 1.3);
          this.isPaused = false;
          this.pauseCooldown = p.random(400, 1200);
          this.pauseDuration = 0;

          // Asignar z-level aleatorio
          this.zLevel = this.assignRandomZLevel();

          this.cursorColor = p.color(assignedColor);
          this.tagColor = p.color(assignedColor);
          this.tagColor.setAlpha(230);

          // Tamaño variable según z-level
          const baseSize = p.random(15, 25);
          this.cursorSize =
            this.zLevel === Z_LEVELS.ABOVE
              ? baseSize * 1.2
              : this.zLevel === Z_LEVELS.BELOW
                ? baseSize * 0.8
                : baseSize;

          this.thought = '';
          this.thoughtTimer = p.random(100, 300);
          this.thoughtDuration = p.random(120, 180);
          this.currentThoughtTime = 0;
          this.perceptionRadius = 50 + this.cursorSize;
          this.isReacting = false;
          this.isHovered = false;
          this.annoyedThought = '';

          // Sistema de conversaciones
          this.inConversation = false;
          this.conversationPartner = null;
          this.conversationTopic = null;
          this.conversationMessages = [];
          this.messageIndex = 0;
          this.isStarter = false;
          this.messageTimer = 0;
          this.messageDuration = 300;
          this.conversationCooldown = p.random(400, 800);

          this.tagPadding = 10;
          this.tagHeight = 40;
          this.tagRoundness = 12;

          this.springConstant = 0.008;
          this.damping = 0.98;
          this.edgeMargin = -this.cursorSize * 1.5;
          this.attractedTo = null;
          this.attractionStrength = 0;
          this.recentTopics = [];
          this.recentQA = {};
          this.selectedQAIndex = 0;
          this.fullText = null;
          this.typingIndex = 0;
          this.typingSpeed = 0;
          this.lastTypingUpdate = 0;

          // Velocidad según z-level
          if (this.zLevel === Z_LEVELS.ABOVE) {
            this.maxSpeed *= 1.15;
            this.baseSpeed *= 1.15;
          } else if (this.zLevel === Z_LEVELS.BELOW) {
            this.maxSpeed *= 0.85;
            this.baseSpeed *= 0.85;
          }
        }

        assignRandomZLevel() {
          const rand = p.random(1);
          if (rand < 0.3) return Z_LEVELS.BELOW;
          else if (rand < 0.7) return Z_LEVELS.NORMAL;
          else return Z_LEVELS.ABOVE;
        }

        randomlyChangeZLevel() {
          if (p.random(1) < 0.001) {
            const oldZLevel = this.zLevel;
            this.zLevel = this.assignRandomZLevel();
            if (oldZLevel !== this.zLevel) {
              if (this.zLevel === Z_LEVELS.ABOVE) {
                this.cursorSize *= 1.2;
                this.maxSpeed *= 1.15;
                this.baseSpeed *= 1.15;
              } else if (this.zLevel === Z_LEVELS.BELOW) {
                this.cursorSize *= 0.8;
                this.maxSpeed *= 0.85;
                this.baseSpeed *= 0.85;
              } else {
                this.cursorSize = p.random(15, 25);
                this.maxSpeed = p.random(1.8, 4.0);
                this.baseSpeed = p.random(0.6, this.maxSpeed * 0.7);
              }
            }
          }
        }

        checkMouseHover() {
          if (p.mouseX > 0 && p.mouseX < p.width && p.mouseY > 0 && p.mouseY < p.height) {
            let d = p.dist(p.mouseX, p.mouseY, this.position.x, this.position.y);
            if (d < this.cursorSize * 1.5) {
              this.isHovered = true;
              if (this.annoyedThought === '') {
                this.annoyedThought = p.random(annoyedThoughts);
              }
              this.currentThoughtTime = this.thoughtDuration;
            } else {
              this.isHovered = false;
              this.annoyedThought = '';
            }
          }
        }

        update() {
          this.randomlyChangeZLevel();

          // Lógica de Pausa
          if (this.isPaused) {
            this.pauseDuration--;
            if (this.pauseDuration <= 0) {
              this.isPaused = false;
              this.pauseCooldown = p.random(500, 1500);
              this.velocity.add(p5.Vector.random2D().mult(this.baseSpeed * this.boostFactor * 0.5));
              this.velocity.limit(this.maxSpeed);
            } else {
              this.velocity.mult(0.85);
            }
          } else {
            this.pauseCooldown--;
            let nearEdge =
              this.position.x < 0 ||
              this.position.x > p.width ||
              this.position.y < 0 ||
              this.position.y > p.height;
            if (this.pauseCooldown <= 0 && !nearEdge && p.random(1) < 0.005) {
              this.isPaused = true;
              this.pauseDuration = p.random(50, 150);
              this.velocity.mult(0.1);
            } else {
              this.velocity.mult(this.damping);

              if (p.random(1) < 0.035) {
                let angleChange = p.random(-0.5, 0.5);
                this.velocity.rotate(angleChange);
                let targetSpeed = p.constrain(
                  this.velocity.mag() * p.random(0.9, 1.1) * this.boostFactor,
                  1.2,
                  this.maxSpeed
                );
                this.velocity.setMag(targetSpeed);
              }

              if (this.velocity.mag() < this.baseSpeed * 0.8) {
                this.velocity.mult(1.01);
              } else if (this.velocity.mag() > this.maxSpeed) {
                this.velocity.setMag(p.lerp(this.velocity.mag(), this.maxSpeed, 0.1));
              }
            }
          }

          this.position.add(this.velocity);

          // Lógica de Resorte
          let force = p.createVector(0, 0);
          if (p.width > 0 && p.height > 0) {
            if (this.position.x < this.edgeMargin) {
              force.x -= (this.position.x - this.edgeMargin) * this.springConstant;
            }
            if (this.position.x > p.width - this.edgeMargin) {
              force.x -= (this.position.x - (p.width - this.edgeMargin)) * this.springConstant;
            }
            if (this.position.y < this.edgeMargin) {
              force.y -= (this.position.y - this.edgeMargin) * this.springConstant;
            }
            if (this.position.y > p.height - this.edgeMargin) {
              force.y -= (this.position.y - (p.height - this.edgeMargin)) * this.springConstant;
            }
          }
          this.velocity.add(force);

          // Lógica de atracción durante conversaciones
          if (this.attractedTo && this.inConversation) {
            const attractionForce = p5.Vector.sub(this.attractedTo.position, this.position);
            const distance = attractionForce.mag();

            // Solo aplicar atracción si están lejos
            if (distance > 80) {
              attractionForce.setMag(this.attractionStrength);
              this.velocity.add(attractionForce);
            } else {
              // Reducir atracción cuando están cerca
              this.attractionStrength *= 0.95;
            }
          }

          this.velocity.limit(this.maxSpeed * 1.5);

          // Interacción con mouse
          if (userInteracting && interactionPos) {
            let followForce = p5.Vector.sub(interactionPos, this.position);
            followForce.setMag(0.05);
            this.velocity.add(followForce);

            if (p.dist(interactionPos.x, interactionPos.y, this.position.x, this.position.y) < 50) {
              if (
                !this.isReacting &&
                this.thought !== '😱' &&
                this.thought !== '🤨' &&
                this.thought !== '😵‍💫' &&
                this.thought !== '‼️'
              ) {
                this.thought = p.random(['😱', '🤨', '😵‍💫', '‼️']);
                this.currentThoughtTime = 60;
                this.isReacting = true;
              }
            } else {
              if (
                this.isReacting &&
                (this.thought === '😱' ||
                  this.thought === '🤨' ||
                  this.thought === '😵‍💫' ||
                  this.thought === '‼️') &&
                this.currentThoughtTime <= 0
              ) {
                this.isReacting = false;
                this.thought = '';
              }
            }
          }

          // Sistema de conversaciones
          if (this.inConversation) {
            this.handleConversation();
            return;
          }

          if (this.conversationCooldown > 0) {
            this.conversationCooldown--;
          }

          // Iniciar conversaciones (90% probabilidad)
          if (
            !this.inConversation &&
            this.conversationCooldown <= 0 &&
            !this.isReacting &&
            p.random(1) < 0.018
          ) {
            this.tryStartConversation();
          }

          // Decrementar tiempo de pensamiento
          if (this.currentThoughtTime > 0) {
            this.currentThoughtTime--;
            if (this.currentThoughtTime <= 0) {
              this.thought = '';
              this.isReacting = false;
            }
          }

          // Reacciones a otros cursores
          if (this.currentThoughtTime <= 0 && !this.isReacting) {
            for (let other of entities) {
              if (other !== this && other.thought !== '' && !other.inConversation) {
                let d = this.position.dist(other.position);
                if (d < this.perceptionRadius && other.currentThoughtTime > 0) {
                  if (p.random(1) < 0.08) {
                    this.thought = p.random(reactionThoughts);
                    this.currentThoughtTime = p.random(80, 120);
                    this.isReacting = true;
                    return;
                  }
                }
              }
            }
          }

          // Pensamientos normales (10% probabilidad)
          if (
            !this.isPaused &&
            !this.isReacting &&
            !this.isHovered &&
            !userInteracting &&
            !this.inConversation
          ) {
            this.thoughtTimer--;
            if (
              this.thoughtTimer <= 0 &&
              this.currentThoughtTime <= 0 &&
              !this.isReacting &&
              p.random(1) < 0.1
            ) {
              this.thought = p.random(thoughts);
              this.thoughtTimer = p.random(800, 1200); // Más tiempo entre pensamientos individuales
              this.currentThoughtTime = this.thoughtDuration;
            }
          }

          if (!this.isHovered) {
            this.annoyedThought = '';
          }
        }

        tryStartConversation() {
          // Buscar un cursor cercano para conversar
          for (let other of entities) {
            if (
              other !== this &&
              !other.inConversation &&
              !other.isReacting &&
              !other.isHovered &&
              other.currentThoughtTime <= 0
            ) {
              let d = this.position.dist(other.position);

              // Aumentar el rango de detección para iniciar conversaciones más fácilmente
              if (d < this.perceptionRadius * 3) {
                // Aumentamos la probabilidad de conversación significativamente
                if (p.random(1) < 0.15) {
                  // Seleccionar un tema de conversación al azar
                  const topics = Object.keys(conversationTopics);

                  // Elegir un tema disponible que no hayamos usado recientemente
                  let selectedTopic;
                  let attempts = 0;
                  do {
                    selectedTopic = topics[Math.floor(p.random(topics.length))];
                    attempts++;
                  } while (
                    this.recentTopics &&
                    this.recentTopics.includes(selectedTopic) &&
                    attempts < 10 &&
                    topics.length > 1
                  );

                  // Registrar este tema como reciente
                  if (!this.recentTopics) {
                    this.recentTopics = [];
                  }
                  this.recentTopics.push(selectedTopic);
                  // Mantener solo los últimos 2 temas usados
                  if (this.recentTopics.length > 2) {
                    this.recentTopics.shift();
                  }

                  // Seleccionar un par de pregunta/respuesta que no se haya usado recientemente
                  let qaIndex = Math.floor(
                    p.random((conversationTopics as any)[selectedTopic].qa.length)
                  );
                  if (this.recentQA && this.recentQA[selectedTopic]) {
                    let attempts = 0;
                    while (this.recentQA[selectedTopic].includes(qaIndex) && attempts < 5) {
                      qaIndex = Math.floor(
                        p.random((conversationTopics as any)[selectedTopic].qa.length)
                      );
                      attempts++;
                    }
                  }

                  // Registrar este par Q/A como reciente
                  if (!this.recentQA) {
                    this.recentQA = {};
                  }
                  if (!this.recentQA[selectedTopic]) {
                    this.recentQA[selectedTopic] = [];
                  }
                  this.recentQA[selectedTopic].push(qaIndex);
                  // Mantener solo los últimos 2 pares Q/A usados por tema
                  if (this.recentQA[selectedTopic].length > 2) {
                    this.recentQA[selectedTopic].shift();
                  }

                  // Elegir aleatoriamente quién comienza la conversación
                  const randomRoleAssignment = p.random(1) < 0.5;

                  // Establecer los roles de conversación
                  this.isStarter = randomRoleAssignment;
                  this.inConversation = true;
                  this.conversationPartner = other;
                  this.conversationTopic = selectedTopic;
                  this.conversationMessages = (conversationTopics as any)[selectedTopic];
                  this.messageIndex = 0;
                  this.messageTimer = 0;
                  this.messageDuration = 300;
                  this.conversationCooldown = p.random(400, 800);

                  // Configurar al otro cursor como receptor con el rol opuesto
                  other.inConversation = true;
                  other.conversationPartner = this;
                  other.conversationTopic = selectedTopic;
                  other.conversationMessages = (conversationTopics as any)[selectedTopic];
                  other.messageIndex = 0;
                  other.messageTimer = 0;
                  other.isStarter = !randomRoleAssignment;
                  other.selectedQAIndex = qaIndex;

                  // El partner se acerca al iniciador
                  other.attractedTo = this;
                  other.attractionStrength = 0.02;

                  // Mostrar el primer mensaje
                  this.showNextMessage();
                  return true;
                }
              }
            }
          }
          return false;
        }

        startConversation(partner: any) {
          const topicKeys = Object.keys(conversationTopics);
          const selectedTopic = p.random(topicKeys);
          const topic = (conversationTopics as any)[selectedTopic];

          this.inConversation = true;
          this.conversationPartner = partner;
          this.conversationTopic = selectedTopic;
          this.conversationMessages = [...topic.qa, ...topic.followups];
          this.messageIndex = 0;
          this.isStarter = true;
          this.messageTimer = 60;

          partner.inConversation = true;
          partner.conversationPartner = this;
          partner.conversationTopic = selectedTopic;
          partner.conversationMessages = this.conversationMessages;
          partner.messageIndex = 0;
          partner.isStarter = false;
          partner.messageTimer = 120;

          // El partner se acerca al iniciador de la conversación
          partner.attractedTo = this;
          partner.attractionStrength = 0.02;
        }

        handleConversation() {
          // Si no tenemos pareja o la pareja ya no está en conversación, terminar
          if (!this.conversationPartner || !this.conversationPartner.inConversation) {
            this.endConversation();
            return;
          }

          // Lógica para moverse hacia el compañero de conversación
          if (this.conversationPartner) {
            // Verificar si es mi turno para responder (no soy el iniciador y es turno par)
            const isMyTurnToRespond = !this.isStarter && this.messageIndex % 2 !== 0;

            // Ahora respondemos mientras nos acercamos, no esperamos a llegar
            if (isMyTurnToRespond) {
              // Determinar qué tipo de mensaje mostrar (respuesta inicial o de seguimiento)
              const isFollowup = this.messageIndex >= 4;
              const messageType = isFollowup ? 'followups' : 'qa';

              const subIndex = isFollowup
                ? Math.floor((this.messageIndex - 4) / 2)
                : Math.floor(this.messageIndex / 2);

              // Obtener el par de pregunta/respuesta
              const messages = this.conversationMessages[messageType];
              const randomIndex = Math.min(subIndex, messages.length - 1);
              const qa = messages[randomIndex];

              // Si ya es el momento de responder y no lo hemos hecho, comenzar a responder
              const textDisplayTime = Math.max(this.messageDuration * 15, qa.answer.length * 30);

              if (this.messageTimer <= 0 && this.thought === '') {
                this.thought = qa.answer;
                this.currentThoughtTime = this.messageDuration;

                setTimeout(() => {
                  this.messageIndex++;

                  // Sincronizar con el compañero
                  if (this.conversationPartner) {
                    this.conversationPartner.messageIndex = this.messageIndex;
                    this.conversationPartner.messageTimer = 20;
                  }
                }, textDisplayTime);
              }

              // Calcular vector hacia el compañero
              let toPartner = p5.Vector.sub(this.conversationPartner.position, this.position);
              let distToPartner = toPartner.mag();

              // Acercarse para responder rápidamente
              if (distToPartner > this.perceptionRadius * 0.7) {
                toPartner.normalize();

                // Acelerar hacia el compañero para responder rápidamente
                let approachSpeed = this.maxSpeed * 1.5;
                toPartner.mult(approachSpeed);

                // Aplicar una fuerza de aproximación para acercarse gradualmente
                let steeringForce = p5.Vector.sub(toPartner, this.velocity);
                steeringForce.limit(0.2);

                this.velocity.add(steeringForce);
                this.velocity.limit(approachSpeed);
              } else {
                // Si estoy lo suficientemente cerca, ajustar posición para quedar paralelo
                let perpendicular = p5.Vector.copy(this.conversationPartner.velocity);
                perpendicular.rotate(p.PI / 2);
                perpendicular.normalize();
                perpendicular.mult(this.perceptionRadius * 0.8);

                // Alternar entre izquierda y derecha basado en el ID del cursor
                if (entities.indexOf(this) % 2 === 0) {
                  perpendicular.mult(-1);
                }

                // Punto objetivo = posición del compañero + vector perpendicular
                let targetPos = p5.Vector.add(this.conversationPartner.position, perpendicular);
                let toTarget = p5.Vector.sub(targetPos, this.position);

                // Aplicar una fuerza suave hacia la posición objetivo
                toTarget.normalize();
                toTarget.mult(this.maxSpeed * 0.8);

                let steeringForce = p5.Vector.sub(toTarget, this.velocity);
                steeringForce.limit(0.15);

                this.velocity.add(steeringForce);
                this.velocity.limit(this.maxSpeed);
              }
            }
          }

          // Decrementar el temporizador de mensaje solo si no es mi turno para responder
          if (
            this.messageTimer > 0 &&
            (this.isStarter || this.messageIndex % 2 === 0 || this.thought === '')
          ) {
            this.messageTimer--;

            // Si el tiempo del mensaje actual expiró, mostrar el siguiente
            if (this.messageTimer <= 0) {
              this.showNextMessage();
            }
          }
        }

        showNextMessage() {
          // Si ya hemos terminado la conversación
          if (this.messageIndex >= 8) {
            // 4 preguntas y 4 respuestas como máximo
            this.endConversation();
            return;
          }

          // Determinar si estamos en fase de pregunta o respuesta
          const isQuestionPhase = this.messageIndex % 2 === 0;

          // Determinar si es mi turno para hablar
          const isMyTurn =
            (this.isStarter && isQuestionPhase) || (!this.isStarter && !isQuestionPhase);

          if (isMyTurn) {
            // Es mi turno de hablar

            // Determinar qué tipo de mensaje mostrar (pregunta inicial o seguimiento)
            const isFollowup = this.messageIndex >= 4; // Si ya pasamos la primera pregunta-respuesta
            const messageType = isFollowup ? 'followups' : 'qa';

            const subIndex = isFollowup
              ? Math.floor((this.messageIndex - 4) / 2)
              : Math.floor(this.messageIndex / 2);

            // Obtener el par de pregunta/respuesta
            const messages = this.conversationMessages[messageType];
            const randomIndex = Math.min(subIndex, messages.length - 1);
            const qa = messages[randomIndex];

            // Mostrar la pregunta o respuesta según corresponda
            this.thought = isQuestionPhase ? qa.question : qa.answer;

            // Establecer tiempos para mantener visible el mensaje
            this.currentThoughtTime = this.messageDuration;
            this.messageTimer = this.messageDuration + 20;

            // Avanzar al siguiente mensaje
            this.messageIndex++;

            // Sincronizar con el compañero y programar su respuesta
            if (this.conversationPartner) {
              this.conversationPartner.messageIndex = this.messageIndex;
              this.conversationPartner.messageTimer = this.currentThoughtTime + 30;
            }
          } else {
            // No es mi turno, esperar
            this.thought = '';
            this.currentThoughtTime = 0;
          }
        }

        endConversation() {
          if (this.conversationPartner && this.conversationPartner.inConversation) {
            this.conversationPartner.inConversation = false;
            this.conversationPartner.conversationPartner = null;
            this.conversationPartner.thought = '';
            this.conversationPartner.conversationCooldown = p.random(400, 800);
            this.conversationPartner.attractedTo = null;
            this.conversationPartner.attractionStrength = 0;
          }

          this.inConversation = false;
          this.conversationPartner = null;
          this.thought = '';
          this.conversationTopic = null;
          this.conversationMessages = [];
          this.messageIndex = 0;
          this.isStarter = false;
          this.conversationCooldown = p.random(600, 1200);
          this.attractedTo = null;
          this.attractionStrength = 0;
        }

        display() {
          let angle = this.velocity.heading();
          p.push();
          p.translate(this.position.x, this.position.y);
          p.rotate(angle + p.PI / 2);

          // Ajustar opacidad según z-level
          const alpha =
            this.zLevel === Z_LEVELS.BELOW ? 180 : this.zLevel === Z_LEVELS.ABOVE ? 255 : 220;

          let cs = this.cursorSize;
          let tipY = -cs * 0.75;
          let sideX = cs * 0.6;
          let sideY = cs * 0.55;
          let baseCurveDepth = cs * 0.2;
          let tipControlXFactor = 0.25;
          let tipControlYOffset = cs * 0.01;

          // Cursor principal
          p.noStroke();
          const fillColor = this.cursorColor;
          fillColor.setAlpha(alpha);
          p.fill(fillColor);
          p.beginShape();
          p.vertex(sideX, sideY);
          p.quadraticVertex(sideX * tipControlXFactor, tipY - tipControlYOffset, 0, tipY);
          p.quadraticVertex(-sideX * tipControlXFactor, tipY - tipControlYOffset, -sideX, sideY);
          p.quadraticVertex(0, sideY - baseCurveDepth, sideX, sideY);
          p.endShape(p.CLOSE);

          // Borde blanco
          p.noFill();
          const strokeWeight =
            this.zLevel === Z_LEVELS.ABOVE ? 2 : this.zLevel === Z_LEVELS.BELOW ? 1 : 1.5;
          p.stroke(255, 255, 255, alpha);
          p.strokeWeight(strokeWeight);
          p.strokeJoin(p.ROUND);
          p.strokeCap(p.ROUND);
          p.beginShape();
          p.vertex(sideX, sideY);
          p.quadraticVertex(sideX * tipControlXFactor, tipY - tipControlYOffset, 0, tipY);
          p.quadraticVertex(-sideX * tipControlXFactor, tipY - tipControlYOffset, -sideX, sideY);
          p.quadraticVertex(0, sideY - baseCurveDepth, sideX, sideY);
          p.endShape(p.CLOSE);

          p.pop();
        }

        displayThought() {
          let thoughtToShow = '';

          // Prioridad: Conversación > Hover > Reacción a interacción > Reacción a otro cursor > Pensamiento normal
          if (this.inConversation && this.thought !== '' && this.currentThoughtTime > 0) {
            thoughtToShow = this.thought;
          } else if (this.isHovered && this.annoyedThought !== '') {
            thoughtToShow = this.annoyedThought;
          } else if (
            userInteracting &&
            interactionPos &&
            p.dist(interactionPos.x, interactionPos.y, this.position.x, this.position.y) < 50 &&
            this.isReacting
          ) {
            thoughtToShow = this.thought;
          } else if (!this.isHovered && this.thought !== '' && this.currentThoughtTime > 0) {
            thoughtToShow = this.thought;
          }

          if (thoughtToShow !== '') {
            p.push();
            let tagOffsetX = this.cursorSize * 0.4;
            let tagOffsetY = this.cursorSize * 0.6;

            let displayX = this.position.x + tagOffsetX;
            let displayY = this.position.y + tagOffsetY;

            p.translate(displayX, displayY);

            // Tamaño de texto variable según z-index
            const fontSize =
              this.zLevel === Z_LEVELS.ABOVE ? 16 : this.zLevel === Z_LEVELS.BELOW ? 12 : 14;
            p.textSize(fontSize);
            p.textFont('Arial');

            let txtWidth = p.textWidth(thoughtToShow);
            const minWidth = this.cursorSize * 2;
            const maxWidth = Math.min(p.width * 0.7, 300);
            txtWidth = Math.max(minWidth, Math.min(txtWidth, maxWidth));

            const lineHeight = fontSize * 1.4;
            let estimatedHeight = this.tagHeight;

            if (txtWidth >= maxWidth) {
              const originalTextWidth = p.textWidth(thoughtToShow);
              const linesNeeded = Math.ceil(originalTextWidth / maxWidth);
              estimatedHeight = Math.max(
                this.tagHeight,
                lineHeight * linesNeeded + this.tagPadding * 2
              );
            }

            let tagWidth = txtWidth + this.tagPadding * 2;
            let tagHeight = estimatedHeight;

            // Ajustar posición si se sale del canvas
            if (displayX + tagWidth > p.width && p.width > 0) {
              p.translate(-(displayX + tagWidth - p.width + 10), 0);
            }
            if (displayY + tagHeight > p.height && p.height > 0) {
              p.translate(0, -(displayY + tagHeight - p.height + 20));
            }
            if (displayY < 40) {
              p.translate(0, 40);
            }

            p.noStroke();
            const bgAlpha =
              this.zLevel === Z_LEVELS.BELOW ? 180 : this.zLevel === Z_LEVELS.ABOVE ? 250 : 230;

            // Color del globo (diferente si está en conversación)
            const fillColor = this.inConversation
              ? p.color(this.tagColor.levels[0], this.tagColor.levels[1], this.tagColor.levels[2])
              : this.tagColor;
            fillColor.setAlpha(bgAlpha);
            p.fill(fillColor);

            // Dibujar el globo
            p.rect(0, 0, tagWidth, tagHeight, this.tagRoundness);

            // Indicador de conversación (punto pulsante)
            if (this.inConversation && this.conversationPartner) {
              const dotColor = this.conversationPartner.cursorColor;
              const pulseSize = 6 + Math.sin(p.frameCount * 0.1) * 2;
              const pulseOpacity = 200 + Math.sin(p.frameCount * 0.1) * 55;

              p.fill(dotColor.levels[0], dotColor.levels[1], dotColor.levels[2], pulseOpacity);
              p.noStroke();
              p.ellipse(0, tagHeight + pulseSize, pulseSize * 2, pulseSize * 2);

              p.fill(255, 255, 255, pulseOpacity * 0.8);
              p.ellipse(0, tagHeight + pulseSize, pulseSize * 0.7, pulseSize * 0.7);
            }

            // Borde del globo
            const strokeWeight =
              this.zLevel === Z_LEVELS.ABOVE ? 2 : this.zLevel === Z_LEVELS.BELOW ? 1 : 1.5;
            p.stroke(255, 255, 255, bgAlpha);
            p.strokeWeight(strokeWeight);
            p.noFill();
            p.rect(0, 0, tagWidth, tagHeight, this.tagRoundness);

            p.noStroke();
            p.fill(255, 255, 255, bgAlpha);
            p.textAlign(p.LEFT, p.TOP);

            // Dibujar texto
            this.drawWrappedText(thoughtToShow, tagWidth, tagHeight);

            p.pop();
          }
        }

        drawWrappedText(text: string, boxWidth: number, boxHeight: number) {
          const availableWidth = boxWidth - this.tagPadding * 2;
          const fontSize =
            this.zLevel === Z_LEVELS.ABOVE ? 16 : this.zLevel === Z_LEVELS.BELOW ? 12 : 14;

          p.textAlign(p.LEFT, p.TOP);
          p.textSize(fontSize);

          if (p.textWidth(text) <= availableWidth) {
            const xLeft = this.tagPadding;
            const yCenter = boxHeight / 2 - fontSize / 2;
            p.text(text, xLeft, yCenter);
            return;
          }

          const words = text.split(' ');
          let line = '';
          let y = this.tagPadding;
          const lineHeight = fontSize * 1.2;
          const xLeft = this.tagPadding;

          for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i] + ' ';
            const testWidth = p.textWidth(testLine);

            if (testWidth > availableWidth && i > 0) {
              p.text(line, xLeft, y);
              line = words[i] + ' ';
              y += lineHeight;

              if (y + lineHeight > boxHeight - this.tagPadding) {
                if (line.length > 3) {
                  line = line.trim() + '...';
                  p.text(line, xLeft, y);
                }
                break;
              }
            } else {
              line = testLine;
            }
          }

          if (y + lineHeight <= boxHeight - this.tagPadding) {
            p.text(line, xLeft, y);
          }
        }
      }
    };

    // Generar ID único para esta instancia
    const instanceId = `p5-cursor-background-${Math.random().toString(36).substring(2, 9)}`;

    // Registrar instancia globalmente
    if (!window._P5CursorInstances) {
      window._P5CursorInstances = {};
    }

    try {
      console.log('P5CursorBackground: Creando instancia p5');
      sketchRef.current = new p5(sketch);

      // Registrar métodos de control
      window._P5CursorInstances[instanceId] = {
        setActive: (active: boolean) => {
          console.log(`P5CursorBackground: ${active ? '🟢 Activado' : '🔴 Desactivado'}`);
          if (sketchRef.current) {
            if (active) {
              if (sketchRef.current.loop) sketchRef.current.loop();
            } else {
              if (sketchRef.current.noLoop) sketchRef.current.noLoop();
            }
          }
        },
        instanceId: instanceId,
      };

      console.log('P5CursorBackground: Instancia p5 creada exitosamente');
    } catch (error) {
      console.error('P5CursorBackground: Error creando p5:', error);
    }

    return () => {
      console.log('P5CursorBackground: Limpiando');

      // Limpiar instancia global
      if (window._P5CursorInstances && window._P5CursorInstances[instanceId]) {
        delete window._P5CursorInstances[instanceId];
      }

      if (sketchRef.current) {
        sketchRef.current.remove();
      }
    };
  }, []);

  return (
    <div ref={containerRef} className={cn('relative w-full h-full', className)}>
      <div className="relative z-10 w-full h-full">{children}</div>
    </div>
  );
};
