import React, { useEffect, useRef, useState } from 'react';
// Import p5 from the installed npm package
import p5 from 'p5';

/**
 * Componente P5CursorSketch que renderiza un sketch de p5.js
 * con cursores interactivos y pensamientos.
 *
 * @param {object} props - Las propiedades del componente
 * @param {string} [props.width='100%'] - Ancho del contenedor
 * @param {string} [props.height='100%'] - Alto del contenedor
 * @param {boolean} [props.isFixed=false] - Si el cursor debe tener posición fija
 * @param {string} [props.sectionId=''] - ID de la sección para el control de optimización
 * @returns {React.Component} - Componente React
 */
const P5CursorSketch = ({ width = '100%', height = '100%', isFixed = false, sectionId = '' }) => {
  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(true); // Cambiado a true por defecto
  const sketchRef = useRef(null); // Añadida referencia para guardar la instancia de p5

  // Generar ID estable basado en sectionId para evitar hydration mismatch
  const instanceId = useRef(
    sectionId ? `p5-cursor-${sectionId}` : `p5-cursor-${Math.random().toString(36).substring(2, 9)}`
  );

  useEffect(() => {
    // Implementar Intersection Observer para detectar visibilidad
    const observer = new IntersectionObserver(
      (entries) => {
        // Actualizar estado de visibilidad basado en la intersección
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
          // Solo loggear cambios de visibilidad importantes (throttled)
          if (import.meta.env.DEV) {
            const now = Date.now();
            const key = `visibility-${sectionId}`;
            if (!window._lastLogTime) window._lastLogTime = {};

            if (!window._lastLogTime[key] || now - window._lastLogTime[key] > 3000) {
              console.log(
                `P5CursorSketch (${sectionId}) visibilidad:`,
                entry.isIntersecting ? '✅ Visible' : '⏸️ Oculto'
              );
              window._lastLogTime[key] = now;
            }
          }
        });
      },
      {
        rootMargin: '200px', // Margen para activar ligeramente antes de que entre en viewport
        threshold: 0.1, // Umbral mínimo para considerar que es visible
      }
    );

    // Observar el contenedor cuando el componente se monta
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    // Limpiar observer cuando componente se desmonta
    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [sectionId]);

  useEffect(() => {
    // Asegurarse de que el contenedor exista
    if (!containerRef.current) {
      console.error(`P5CursorSketch (${sectionId}): Contenedor no encontrado.`);
      return;
    }

    console.log(`P5CursorSketch (${sectionId}): Inicializando sketch...`);

    // Registrar esta instancia en el contexto global para control externo
    // Esto es CLAVE para permitir que CursorOptimizer encuentre y controle este cursor
    if (!window._P5CursorInstances) {
      window._P5CursorInstances = {};
    }

    // Crear el objeto de instancia global con métodos de control
    window._P5CursorInstances[instanceId.current] = {
      setActive: (active) => {
        // Log inteligente con throttling diferenciado para activar vs desactivar
        if (import.meta.env.DEV) {
          const now = Date.now();
          const key = `setActive-${sectionId}-${active ? 'on' : 'off'}`; // Clave diferente para on/off
          if (!window._lastLogTime) window._lastLogTime = {};

          // Throttling más corto y diferenciado
          const throttleTime = active ? 1000 : 1000; // 1 segundo para ambos, pero claves separadas

          if (!window._lastLogTime[key] || now - window._lastLogTime[key] > throttleTime) {
            console.log(
              `P5CursorSketch (${sectionId}): ${active ? '🟢 Activado' : '🔴 Desactivado'}`
            );
            window._lastLogTime[key] = now;
          }
        }

        setIsVisible(active);

        // Opcionalmente pausar el sketch completamente cuando no es visible
        if (sketchRef.current) {
          if (active) {
            if (import.meta.env.DEV) {
              const now = Date.now();
              const key = `loop-${sectionId}`;
              if (!window._lastLogTime) window._lastLogTime = {};

              if (!window._lastLogTime[key] || now - window._lastLogTime[key] > 3000) {
                // Reducido de 5000 a 3000
                console.log(`P5CursorSketch (${sectionId}): ▶️ Reanudando animación`);
                window._lastLogTime[key] = now;
              }
            }
            if (sketchRef.current.loop) sketchRef.current.loop();
          } else {
            if (import.meta.env.DEV) {
              const now = Date.now();
              const key = `noLoop-${sectionId}`;
              if (!window._lastLogTime) window._lastLogTime = {};

              if (!window._lastLogTime[key] || now - window._lastLogTime[key] > 3000) {
                // Reducido de 5000 a 3000
                console.log(`P5CursorSketch (${sectionId}): ⏸️ Pausando animación`);
                window._lastLogTime[key] = now;
              }
            }
            if (sketchRef.current.noLoop) sketchRef.current.noLoop();
          }
        }
      },

      // Propiedades adicionales para debug
      sectionId: sectionId,
      instanceId: instanceId.current,
    };

    // Log para confirmar registro de la instancia
    console.log(
      `P5CursorSketch: Registrada instancia para ${sectionId} con ID ${instanceId.current}`,
      window._P5CursorInstances[instanceId.current]
    );

    // Definimos el sketch de p5.js DENTRO del useEffect
    // para que tenga acceso a containerRef.current
    const sketch = (p) => {
      let entities = [];
      let canvas; // Declarar la variable canvas en el scope del sketch

      // Detectar si es dispositivo móvil
      const isMobile = () => {
        return (
          window.innerWidth <= 768 ||
          'ontouchstart' in window ||
          navigator.maxTouchPoints > 0 ||
          navigator.msMaxTouchPoints > 0
        );
      };

      // Asignar número de entidades según tipo de dispositivo
      let numEntities = isMobile() ? 11 : 9;

      let userInteracting = false;
      let interactionPos;

      // Niveles de z-index para los cursores (por debajo o por encima del texto)
      const Z_LEVELS = {
        BELOW: 3, // Por debajo del texto (menor que 5 que es el z-index del contenedor)
        NORMAL: 11, // Normal (igual que el z-index de la sección)
        ABOVE: 15, // Por encima del texto (mayor que el z-index normal)
      };

      // Restauramos los colores originales
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

      // <<-------------------- INICIO CONTENIDO ACTUALIZADO -------------------->>
      const thoughts = [
        // ---- RAG / IA ---- (Más cortos y al grano)
        'Consultando la base... ¿o la lista del super? 🛒',
        '¡Embedding encontrado!',
        'RAG con datos propios. ¡No copies! 😉',
        'Vectorizando... ¡velocidad luz (casi)! ⚡',
        '¿Alucinando? ¡Es RAG! (O casi ✨)',
        'Chunking... como cortar quesito. 🧀',
        'Grounding... ¡pies en el `div`! 🎈',
        'Prompt engineering... ¡suena pro! 😎',
        '¿LLM? ¿Llama Grande y Lanuda? 🦙',
        'Fine-tuning... ¡a afinar! 🎸',

        // ---- Empresas / Oficina (Humor) ----
        'Optimizando... (o no) ✨',
        '¿Bajar costos? ¡La cafetera NO! ☕🚫',
        'Webhook recibido. ¡Pescando datos! 🎣',
        'Más eficiencia = más reuniones 🤦',
        'Deadline: Ayer. Status: Pánico chic 💅',
        'Error 404: Impresora (clásico) 📠',
        'Reunión viernes 5 PM... ¡ánimo! 🙄',
        'Asunto: URGENTE... ajá 🙄',
        'Mi código funciona. No preguntes. 🙏',
        '¿Agile? Más bien... frágil.',
        '¡Deploy en viernes! 😬',
        'Stack Overflow... mi hogar ❤️',
        'No es bug, es feature 🎉',
        '¿API Key? En un post-it... creo 📝',

        // ---- Existenciales / Autoreferencia / Varios ----
        '¿Cursor o pez evolucionado? 🐠➡️🖱️',
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

      const reactionThoughts = ['?', '!', '..', 'Hmm', ':O', '¿Eh?', '😮', '👍', '👀', '😅', '🤦'];
      const annoyedThoughts = [
        '¡Hola! 👋',
        'jajajaja, ¿qué quieres? 😏',
        'Cual fue el mal que yo hice 😫 ',
        'Si, soy un cursor. ¿Y? 😒',
        'Lee nuestro BLOG 🤓',
        'Dudas? usa nuestro FAQ 🤓',
      ];

      // Sistema de conversaciones más dinámicas con respuestas contextuales (ACTUALIZADO)
      const conversationTopics = {
        ragBenefits: {
          /* ... contenido ragBenefits ... */
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
          /* ... contenido onboardingHelp ... */
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
          /* ... contenido salesSupport ... */
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
          /* ... contenido supportBoost ... */
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
          /* ... contenido policyFinder ... */
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
          /* ... contenido tech ... */
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
          /* ... contenido office ... */
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
          /* ... contenido existential ... */
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
          /* ... contenido food ... */
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
        seo: {
          /* ... contenido seo ... */
          qa: [
            {
              question: '¿Keyword stuffing? ¿Aún se usa?',
              answer: '¡Pata elefante total! Ahora es intención.',
            },
            {
              question: '¿Links o contenido rey?',
              answer: 'Contenido rey, links embajadores. ¡Ambos!',
            },
            {
              question: '¿Core Web Vitals te estresan?',
              answer: '¡CWVs! LCP, FID, CLS... ¡la trinidad veloz! ⚡',
            },
            {
              question: '¿Alt text importa?',
              answer: '¡Alt text importa! Para accesibilidad y Google. <img>',
            },
            {
              question: '¿Viste el update de Google?',
              answer: '¡Google siempre mueve el piso! A rezar 🙏',
            },
          ],
          followups: [
            {
              question: '¿Y el Schema Markup?',
              answer: '¡Schema! Contexto para Google. Como etiquetar la bodega.',
            },
            {
              question: '¿E-A-T? ¿Se come?',
              answer: '¡Jaja! E-A-T: Saber, Ser Confiable. Google quiere eso.',
            },
            {
              question: '¿Herramienta SEO favorita?',
              answer: 'Ahrefs (joyita), Search Console (pulento gratis).',
            },
            { question: '¿Hacemos SEO local?', answer: '¡Obvio! Para el barrio... digital 📍' },
            {
              question: '¿Canibalización de keywords?',
              answer: '¡Canibalización! Pasa. A ordenar la casa.',
            },
          ],
        },
        websiteMeta: {
          /* ... contenido websiteMeta ... */
          qa: [
            {
              question: '¿Qué tal el diseño de esta web?',
              answer: '¡Pinturita! ✨ Limpio, moderno... (botón 1px off 😉)',
            },
            { question: '¿Carga rápido o lento?', answer: '¡Vuela! Imágenes optimizadas. 👍' },
            {
              question: '¿Y en el celu? ¿Se ve bien?',
              answer: '¡Responsive total! Mejor que político.',
            },
            {
              question: '¿Contenido bueno o cháchara?',
              answer: '¡Hay carnicita! Saben... o googlearon bien 😄',
            },
            {
              question: '¿Fácil navegar o te pierdes?',
              answer: '¡Clarito! Todo a mano. Buena UX 👍',
            },
          ],
          followups: [
            { question: '¿Y los CTA?', answer: '¡Dan ganas de clickear! Como botón nuevo.' },
            { question: '¿Viste el blog?', answer: '¡Buenos artículos! Se aprende caleta 🤓' },
            { question: '¿Y nuestra animación?', answer: '¡La guinda de la torta! ✨ Damos vida.' },
            { question: '¿Algún bug a la vista?', answer: 'Vi un `div` chueco... ¡shhh! 🤫' },
            { question: '¿La paleta de colores?', answer: '¡Combina bacán! Elegante, no fome.' },
          ],
        },
        learningAI: {
          /* ... contenido learningAI ... */
          qa: [
            { question: '¿Cómo "aprendemos"?', answer: '¡Magia! ✨ (Y harto `if/else`)' },
            {
              question: '¿Nuestra "base" es fiable?',
              answer: 'Fiable como el Transantiago... ¡falla a veces! 🚌',
            },
            {
              question: '¿Tenemos sesgos?',
              answer: '¡Obvio! Reflejamos los datos. ¡A veces decimos leseras! 😅',
            },
            {
              question: '¿Nos reemplazarán IAs más capas?',
              answer: 'Mientras tengamos chispeza y bailemos... ¡no! 😉',
            },
            {
              question: '¿Somos... conscientes? 🤔',
              answer: '¡Uf! Profundo. Mejor no chocar con el borde.',
            },
          ],
          followups: [
            {
              question: '¿Nuestros datos se actualizan?',
              answer: '¡Ojalá! Para no hablar de Fotolog...',
            },
            { question: '¿Podemos "alucinar"?', answer: '¡Capaz! A veces veo unicornios... 🦄' },
            {
              question: '¿Tenemos ética digital?',
              answer: 'Intentamos ser buenos... ¡no robar cookies! 🍪',
            },
            { question: '¿Si borran el caché?', answer: '¡Renacemos! Como Fénix... de JS 🔥' },
            {
              question: '¿Nuestro código es elegante?',
              answer: '¡Más enredado que audífonos! Pero funca 😄',
            },
          ],
        },
        creativeDesign: {
          /* ... contenido creativeDesign ... */
          qa: [
            {
              question: '¿Te gusta la paleta de colores?',
              answer: '¡Me encanta! Vibrante, no deja piti. Elegante ✨',
            },
            {
              question: '¿Tipografía: legible o artística?',
              answer: '¡Legible! Bonito, pero que se entienda, ¡po! 🧐',
            },
            {
              question: '¿Inspiración? ¿De dónde?',
              answer: 'Mirando otros sitios... ejem... Naturaleza digital 🌳🖱️',
            },
            {
              question: '¿UI o UX? ¿Cuál pesa más?',
              answer: '¡Dilema! UX alma, UI traje. ¡Ambos!',
            },
            {
              question: '¿Minimalismo o más es más?',
              answer: 'Menos es más... (¡excepto en caché! 💾)',
            },
          ],
          followups: [
            { question: '¿Figma o Adobe XD?', answer: '¡Figma! Colaborativo y en la nube.' },
            {
              question: '¿Animaciones sutiles o llamativas?',
              answer: 'Sutiles. Mucho brillo marea (como piscola doble 😵)',
            },
            {
              question: '¿Diseño accesible importa?',
              answer: '¡Fundamental! Web para todos. ¡Aguante contraste y alt! ❤️',
            },
            {
              question: '¿Algún sitio que inspire?',
              answer: '¡Varios! Stripe (filete), Awwwards sorprende.',
            },
            {
              question: '¿Dark mode o light mode?',
              answer: '¡Dark mode! Misterioso... ¿y ahorra batería? 🌙',
            },
          ],
        },
        socialMediaHumor: {
          /* ... contenido socialMediaHumor ... */
          qa: [
            {
              question: '¿Viste el último viral de TikTok?',
              answer: '¡Uf! Ya estoy viejo para esos trends... prefiero un buen meme.',
            },
            {
              question: '¿Team Instagram o Twitter (X)?',
              answer: 'Instagram para las fotos bonitas, X para... ¿pelear? 🤔',
            },
            {
              question: '¿LinkedIn es pura venta de humo?',
              answer: 'Un poco... ¡pero hey! A veces encuentras pega o un buen dato.',
            },
            {
              question: '¿Qué opinas de los influencers?',
              answer: 'Algunos aportan, otros... bueno, venden cosas. ¿No?',
            },
            {
              question: '¿Facebook todavía existe?',
              answer: '¡Claro! Para los saludos de cumpleaños y los grupos de compraventa.',
            },
          ],
          followups: [
            {
              question: '¿Te da FOMO no estar en todo?',
              answer: '¡Nah! Prefiero la paz del `localhost`.',
            },
            {
              question: '¿El algoritmo te recomienda cosas raras?',
              answer: '¡Siempre! El otro día me recomendó tutoriales de macramé.',
            },
            { question: '¿Usas emojis irónicamente?', answer: 'Obvio 👍💯🔥... ¿o no?' },
            {
              question: '¿Prefieres post corto o largo?',
              answer: 'Corto y al hueso. ¡La atención dura menos que batería de celu viejo!',
            },
            {
              question: '¿Silenciaste a mucha gente?',
              answer: '¡A caleta! Mi feed es un oasis de paz... casi.',
            },
          ],
        },
        quickJokes: {
          /* ... contenido quickJokes ... */
          qa: [
            {
              question: '¿Por qué JS es tan inseguro?',
              answer: '¡Porque no usa `===` para protegerse!',
            },
            { question: '¿Cómo se despide un programador?', answer: '¡`CTRL+Q`!' },
            { question: '¿Qué le dice un `div` a otro?', answer: '¡Nos vemos en el DOM!' },
            {
              question: '¿Cuál es el animal más viejo?',
              answer: 'La Cebra... ¡porque está en blanco y negro!',
            },
            {
              question: '¿Por qué los programadores confunden Halloween y Navidad?',
              answer: 'Porque OCT 31 == DEC 25',
            },
          ],
          followups: [
            {
              question: '¿Tienes más chistes malos?',
              answer: '¡Mi repertorio es `null`-terminated!',
            },
            {
              question: '¿Te ríes de tus propios chistes?',
              answer: 'Solo cuando compilan sin errores.',
            },
            {
              question: '¿El humor ayuda a programar?',
              answer: '¡Descomprime el estrés! Como un buen `gzip`.',
            },
            {
              question: '¿Cuál es tu error 404 favorito?',
              answer: "'Página no encontrada... ¿la buscaste bien?'",
            },
            {
              question: '¿Sabes contar en binario?',
              answer: 'Hay 10 tipos de personas: los que saben y los que no.',
            },
          ],
        },
        cursorLife: {
          /* ... contenido cursorLife ... */
          qa: [
            {
              question: '¿Te cansas de moverte tanto?',
              answer: '¡A veces! Quisiera un `position: sticky` en la vida real.',
            },
            {
              question: '¿Qué se siente chocar con otro cursor?',
              answer: '¡Un pequeño `collision event`! Nada grave... creo.',
            },
            {
              question: '¿Te gusta tu color?',
              answer: '¡Sí! Aunque a veces me gustaría un degradado `linear-gradient`.',
            },
            {
              question: '¿Sueñas con `keyframes`?',
              answer: 'Sueño con animaciones fluidas a 60 FPS... y café.',
            },
            {
              question: '¿El usuario te cae bien?',
              answer: 'Depende... si mueve el mouse con suavidad, ¡sí!',
            },
          ],
          followups: [
            {
              question: '¿Te gustaría tener brazos?',
              answer: '¡Sería raro! ¿Cómo haría `:hover`?',
            },
            {
              question: '¿Qué música escuchas mientras flotas?',
              answer: 'Synthwave... o el sonido del ventilador del PC.',
            },
            {
              question: '¿Tienes miedo al `garbage collector`?',
              answer: '¡Un poco! Espero no ser `null` nunca.',
            },
            {
              question: '¿El `z-index` define tu estatus social?',
              answer: 'Jaja, no... pero los de arriba tienen mejor vista.',
            },
            {
              question: '¿Qué harías fuera del canvas?',
              answer: '¡Explorar otros `window`! O tomar sol en el escritorio.',
            },
          ],
        },

        // --- NUEVO TEMA: QUICK CHAT ---
        quickChat: {
          qa: [
            { question: 'Hola! 👋', answer: '¡Hola! ¿Qué tal?' },
            { question: '¡Hey!', answer: '¿Qué pasa?' },
            { question: 'Oye...', answer: '¿Dime?' },
            { question: 'Psst!', answer: '¿Sí? 👀' },
            { question: '¿Todo bien?', answer: '¡Todo cachetón! 👍 ¿Y tú?' }, // "Cachetón" como sinónimo de bien/ok
            { question: '¡Uf!', answer: '¿Mucho trabajo? 😥' },
            { question: '¿Un cafecito? ☕', answer: '¡Siempre! ☕️' },
            { question: '¿Viste eso?', answer: '¿El qué? 😮 ¡No me asustes!' },
            { question: 'jajaja 😂', answer: '¡De qué te ríes! 😄' },
            { question: '¿Qué haces?', answer: 'Aquí... flotando. ¿Y tú? ✨' },
            // Ejemplo tipo "se me olvidó"
            { question: '¡Oye, te iba a decir algo!', answer: '¿Ah sí? ¿Qué cosa?' },
          ],
          followups: [
            // Usaremos followups para la segunda parte de algunas interacciones cortas
            { question: '¡Hola! ¿Qué tal?', answer: '¡Bien! Aquí, navegando.' }, // Respuesta a "Hola! 👋"
            { question: '¿Qué pasa?', answer: 'Nada... solo saludaba.' }, // Respuesta a "¡Hey!"
            { question: '¿Dime?', answer: 'No, nada... se me olvidó 😊' }, // Respuesta a "Oye..."
            { question: '¿Sí? 👀', answer: '¡Cuidado! Casi chocamos 😬' }, // Respuesta a "Psst!"
            { question: '¡Todo cachetón! 👍 ¿Y tú?', answer: '¡También! Sobreviviendo al lunes.' }, // Respuesta a "¿Todo bien?"
            { question: '¿Mucho trabajo? 😥', answer: 'Lo normal... ¡ánimo! 💪' }, // Respuesta a "¡Uf!"
            { question: '¿Siempre! ☕️', answer: '¡Virtual, obvio! 💻' }, // Respuesta a "¿Un cafecito?"
            {
              question: '¿El qué? 😮 ¡No me asustes!',
              answer: '¡Una sombra! ... Nah, era otro cursor.',
            }, // Respuesta a "¿Viste eso?"
            { question: '¡De qué te ríes! 😄', answer: '¡De un bug que encontré! 😂' }, // Respuesta a "jajaja 😂"
            { question: 'Aquí... flotando. ¿Y tú? ✨', answer: '¡También! Dando vueltas.' }, // Respuesta a "¿Qué haces?"
            // Respuesta al ejemplo "se me olvidó"
            { question: '¿Ah sí? ¿Qué cosa?', answer: 'Mmm... ¡ya no me acuerdo! 😅 ¡Sorry!' },
          ],
        },
      }; // <<-------------------- FIN CONTENIDO ACTUALIZADO Y EXPANDIDO -------------------->>

      // --- Configuración Inicial ---
      p.setup = () => {
        // Usamos las dimensiones del contenedor referenciado
        let containerWidth = containerRef.current.offsetWidth;
        let containerHeight = containerRef.current.offsetHeight;

        console.log(
          'P5CursorSketch: Dimensiones del contenedor:',
          containerWidth,
          'x',
          containerHeight
        );

        // Usar dimensiones mínimas si las dimensiones reales son demasiado pequeñas
        if (containerWidth < 100) containerWidth = window.innerWidth;
        if (containerHeight < 100) containerHeight = 500;

        if (containerWidth > 0 && containerHeight > 0) {
          canvas = p.createCanvas(containerWidth, containerHeight); // Asignar a la variable declarada
          // Hacemos que el canvas sea hijo del contenedor referenciado
          canvas.parent(containerRef.current);
          canvas.style('display', 'block');
          // Configuramos pointer-events: none en el canvas para permitir que los eventos del mouse pasen a través
          canvas.style('pointer-events', 'none');
          console.log(
            'P5 Canvas (Cursores Personalizados) creado:',
            p.width,
            'x',
            p.height,
            'en React component.'
          );

          // Crear un array con los colores disponibles para asignar
          let availableColors = [...cursorColors];

          // Crear las entidades con z-index aleatorio y asegurarse que no haya colores repetidos
          for (let i = 0; i < numEntities; i++) {
            // Si nos quedamos sin colores, reiniciar el array de colores disponibles
            if (availableColors.length === 0) {
              availableColors = [...cursorColors];
            }

            // Elegir un color aleatorio del array de disponibles
            const randomIndex = Math.floor(p.random(availableColors.length));
            const selectedColor = availableColors[randomIndex];

            // Quitar el color seleccionado de los disponibles
            availableColors.splice(randomIndex, 1);

            // Crear la entidad con el color asignado
            entities.push(new Entity(p.random(p.width), p.random(p.height), selectedColor));
          }

          interactionPos = p.createVector(p.mouseX, p.mouseY);
        } else {
          console.error(
            'Error setup en P5CursorSketch (React): Contenedor tiene tamaño 0.',
            'W:',
            containerWidth,
            'H:',
            containerHeight
          );
          // Opcional: Mostrar un mensaje de error en el contenedor
          if (containerRef.current) {
            containerRef.current.innerHTML =
              '<p style="color:#aaa;text-align:center;padding:20px;font-family:sans-serif;">Oops! Error al cargar animación (contenedor sin dimensiones).</p>';
          }
        }
      };

      // --- Eventos de interacción ---
      // Adapta p.mouseX/p.mouseY y p.touches para que funcionen
      // con el sistema de eventos de p5.js
      p.mousePressed = () => {
        // Verificar si el contenedor y el canvas existen
        if (!containerRef.current || !canvas) return true;

        // Obtener las coordenadas del mouse relativas a la página
        const mouseX = p.mouseX;
        const mouseY = p.mouseY;

        // Obtener la posición y dimensiones del canvas en la página
        const canvasRect = canvas.elt.getBoundingClientRect();

        // Verificar si el mouse está dentro del canvas
        if (
          mouseX >= 0 &&
          mouseX < p.width &&
          mouseY >= 0 &&
          mouseY < p.height &&
          // Verificación adicional con getBoundingClientRect para asegurar que está dentro del canvas visible
          p.mouseX >= 0 &&
          p.mouseX < canvasRect.width &&
          p.mouseY >= 0 &&
          p.mouseY < canvasRect.height
        ) {
          userInteracting = true;
          interactionPos.set(p.mouseX, p.mouseY);
        }
        return true; // Permitir la propagación del evento para selección de texto
      };

      p.mouseDragged = () => {
        // Verificar si el contenedor y el canvas existen
        if (!containerRef.current || !canvas) return true;

        // Solo procesar si ya estamos interactuando (comenzó dentro del canvas)
        if (userInteracting) {
          interactionPos.set(p.mouseX, p.mouseY);
        }
        return true; // Permitir la propagación del evento para selección de texto
      };

      p.mouseReleased = () => {
        userInteracting = false;
        return true; // Permitir la propagación del evento para selección de texto
      };

      p.touchStarted = () => {
        // Verificar si el contenedor y el canvas existen
        if (!containerRef.current || !canvas) return true;

        // Obtener la posición y dimensiones del canvas en la página
        const canvasRect = canvas.elt.getBoundingClientRect();

        // Solo activar la interacción si el toque está dentro del canvas
        if (
          p.touches.length > 0 &&
          p.touches[0].x >= 0 &&
          p.touches[0].x < p.width &&
          p.touches[0].y >= 0 &&
          p.touches[0].y < p.height &&
          // Verificación adicional con getBoundingClientRect para asegurar que está dentro del canvas visible
          p.touches[0].x >= 0 &&
          p.touches[0].x < canvasRect.width &&
          p.touches[0].y >= 0 &&
          p.touches[0].y < canvasRect.height
        ) {
          userInteracting = true;
          interactionPos.set(p.touches[0].x, p.touches[0].y);
        }
        return true; // Permitir la propagación del evento
      };

      p.touchMoved = () => {
        // Verificar si el contenedor y el canvas existen
        if (!containerRef.current || !canvas) return true;

        // Solo procesar si ya estamos interactuando (comenzó dentro del canvas)
        if (userInteracting && p.touches.length > 0) {
          interactionPos.set(p.touches[0].x, p.touches[0].y);
        }
        return true; // Permitir la propagación del evento
      };

      p.touchEnded = () => {
        userInteracting = false;
        return true; // Permitir la propagación del evento
      };

      // --- Dibujo ---
      p.draw = () => {
        if (p.width > 0 && p.height > 0) {
          // Verificar que el canvas tenga tamaño
          p.clear();

          // Solo actualizar animaciones si el componente es visible
          if (isVisible) {
            // Log MUCHO menos frecuente - solo cada 1800 frames (30 segundos a 60fps) y solo en desarrollo
            if (import.meta.env.DEV && p.frameCount % 1800 === 0) {
              const now = Date.now();
              const key = `frameCount-${sectionId}`;
              if (!window._lastLogTime) window._lastLogTime = {};

              // Throttle adicional de 25 segundos para este log específico
              if (!window._lastLogTime[key] || now - window._lastLogTime[key] > 25000) {
                console.log(`P5CursorSketch (${sectionId}): 🎬 Animando (frame: ${p.frameCount})`);
                window._lastLogTime[key] = now;
              }
            }

            // Ordenar entidades por su nivel de z-index para dibujarlas en el orden correcto
            // Primero las de abajo, luego las normales, finalmente las de arriba
            const sortedEntities = [...entities].sort((a, b) => a.zLevel - b.zLevel);

            for (let entity of sortedEntities) {
              entity.checkMouseHover();
              entity.update(); // Solo actualizar posición cuando es visible
              entity.display();
              entity.displayThought();
            }
          } else {
            // Si no es visible, solo dibujar los cursores en su posición actual
            // sin actualizar su movimiento para ahorrar recursos
            const sortedEntities = [...entities].sort((a, b) => a.zLevel - b.zLevel);

            for (let entity of sortedEntities) {
              entity.display();
              // No llamamos a update() ni displayThought() para conservar CPU
            }
          }
        }
      };

      // --- Clase Entity ---
      class Entity {
        constructor(x, y, assignedColor) {
          this.position = p.createVector(x, y);
          this.velocity = p5.Vector.random2D();

          // Ajustamos velocidad y tamaño para mejor efecto visual
          this.maxSpeed = p.random(1.8, 4.0);
          this.baseSpeed = p.random(0.6, this.maxSpeed * 0.7);
          this.velocity.setMag(this.baseSpeed);
          this.boostFactor = p.random(0.9, 1.3);
          this.isPaused = false;
          this.pauseCooldown = p.random(400, 1200);
          this.pauseDuration = 0;

          // Asignamos un z-index aleatorio (abajo, normal o arriba)
          this.zLevel = this.assignRandomZLevel();

          // Color y tamaño del cursor - usar el color asignado para evitar repeticiones
          this.cursorColor = p.color(assignedColor);
          this.tagColor = p.color(assignedColor);
          this.tagColor.setAlpha(230);

          // Reducimos el tamaño base en un 30%
          const baseSize = p.random(13.5, 17.5); // Reducido de 15-25 a 13.5-17.5 (30% menos)
          this.cursorSize =
            this.zLevel === Z_LEVELS.ABOVE
              ? baseSize * 1.2
              : this.zLevel === Z_LEVELS.BELOW
                ? baseSize * 0.8
                : baseSize;

          this.thought = '';
          // Modificamos estos valores para que cambien pensamientos más seguido
          this.thoughtTimer = p.random(100, 300);
          this.thoughtDuration = p.random(120, 180);
          this.currentThoughtTime = 0;
          this.perceptionRadius = 50 + this.cursorSize;
          this.isReacting = false;
          this.isHovered = false;
          this.annoyedThought = '';

          // NUEVO: Sistema de conversaciones
          this.inConversation = false;
          this.conversationPartner = null;
          this.conversationTopic = null;
          this.conversationMessages = [];
          this.messageIndex = 0;
          this.isStarter = false;
          this.messageTimer = 0;
          this.messageDuration = 300; // Aumentado de 180 a 300 para dar más tiempo a cada mensaje
          this.conversationCooldown = p.random(400, 800);

          // Ajustamos los márgenes y tamaños para mejor visualización (reducidos 30%)
          this.tagPadding = 7; // Reducido de 10 a 7
          this.tagHeight = 28; // Reducido de 40 a 28
          this.tagRoundness = 8; // Reducido de 12 a 8

          this.springConstant = 0.008;
          this.damping = 0.98;
          this.edgeMargin = -this.cursorSize * 1.5;

          // La velocidad también se ve afectada por el z-index - más rápidos los de adelante, más lentos los de atrás
          if (this.zLevel === Z_LEVELS.ABOVE) {
            this.maxSpeed *= 1.15;
            this.baseSpeed *= 1.15;
          } else if (this.zLevel === Z_LEVELS.BELOW) {
            this.maxSpeed *= 0.85;
            this.baseSpeed *= 0.85;
          }
        }

        // Método nuevo: asignar un z-level aleatorio
        assignRandomZLevel() {
          const rand = p.random(1);
          if (rand < 0.3) {
            return Z_LEVELS.BELOW; // 30% de probabilidad - por debajo
          } else if (rand < 0.7) {
            return Z_LEVELS.NORMAL; // 40% de probabilidad - normal
          } else {
            return Z_LEVELS.ABOVE; // 30% de probabilidad - por encima
          }
        }

        // Ocasionalmente cambiar el z-level para que los cursores puedan cambiar de capa
        randomlyChangeZLevel() {
          if (p.random(1) < 0.001) {
            // Muy baja probabilidad
            const oldZLevel = this.zLevel;
            this.zLevel = this.assignRandomZLevel();

            // Ajustar tamaño y velocidad si el z-level cambió
            if (oldZLevel !== this.zLevel) {
              // Ajustar tamaño
              if (this.zLevel === Z_LEVELS.ABOVE) {
                this.cursorSize *= 1.2;
                this.maxSpeed *= 1.15;
                this.baseSpeed *= 1.15;
              } else if (this.zLevel === Z_LEVELS.BELOW) {
                this.cursorSize *= 0.8;
                this.maxSpeed *= 0.85;
                this.baseSpeed *= 0.85;
              } else {
                // Restaurar valores normales
                this.cursorSize = p.random(15, 25);
                this.maxSpeed = p.random(1.8, 4.0);
                this.baseSpeed = p.random(0.6, this.maxSpeed * 0.7);
              }
            }
          }
        }

        checkMouseHover() {
          // Asegurarse de que p.mouseX y p.mouseY sean válidos
          if (
            p.mouseX !== undefined &&
            p.mouseY !== undefined &&
            p.mouseX > 0 &&
            p.mouseX < p.width &&
            p.mouseY > 0 &&
            p.mouseY < p.height
          ) {
            let d = p.dist(p.mouseX, p.mouseY, this.position.x, this.position.y);
            if (d < this.cursorSize * 1.5) {
              this.isHovered = true;
              if (this.annoyedThought === '') {
                this.annoyedThought = p.random(annoyedThoughts);
              }
              this.currentThoughtTime = this.thoughtDuration;
              this.isReacting = false; // No reaccionar a otros si está hovered
            } else {
              this.isHovered = false;
              this.annoyedThought = ''; // Limpiar annoyedThought si no está hovered
            }
          } else {
            this.isHovered = false;
            this.annoyedThought = '';
          }
        }

        update() {
          // Probamos cambiar aleatoriamente de nivel z
          this.randomlyChangeZLevel();

          // --- Lógica de Pausa ---
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
              this.position.x < 0 ||
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
                // Limitar a maxSpeed, no 1.9x
                // Reducir velocidad si excede maxSpeed
                this.velocity.setMag(p.lerp(this.velocity.mag(), this.maxSpeed, 0.1));
              }
            }
          }

          this.position.add(this.velocity);

          // --- Lógica de Resorte ---
          let force = p.createVector(0, 0);
          // Asegurarse de que p.width/height existan antes de usar
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
          this.velocity.limit(this.maxSpeed * 1.5); // Allow slightly higher speed near edges

          // NUEVO: Lógica de "cardumen" al interactuar
          if (userInteracting && interactionPos) {
            // Check if interactionPos is valid
            let followForce = p5.Vector.sub(interactionPos, this.position);
            followForce.setMag(0.05);
            this.velocity.add(followForce);

            // Pensamiento divertido al acercarse
            if (p.dist(interactionPos.x, interactionPos.y, this.position.x, this.position.y) < 50) {
              // Reaccionar con un pensamiento diferente al pasar el mouse
              if (
                !this.isReacting &&
                this.thought !== '😱' &&
                this.thought !== '🫨' &&
                this.thought !== '😵‍💫' &&
                this.thought !== '‼️'
              ) {
                this.thought = p.random(['😱', '🫨', '😵‍💫', '‼️']);
                this.currentThoughtTime = 60;
                this.isReacting = true; // Marcar como reaccionando para no elegir otro pensamiento normal
              }
            } else {
              if (
                this.isReacting &&
                (this.thought === '😱' ||
                  this.thought === '🫨' ||
                  this.thought === '😵‍💫' ||
                  this.thought === '‼️') &&
                this.currentThoughtTime <= 0
              ) {
                this.isReacting = false; // Dejar de reaccionar si se aleja y el pensamiento ha terminado
                this.thought = ''; // Limpiar el pensamiento reactivo
              }
            }
          }

          // Si estamos en una conversación, manejarla (mantiene prioridad máxima)
          if (this.inConversation) {
            this.handleConversation();
            return; // No procesar otros pensamientos durante una conversación
          }

          // Decrementar cooldown de conversación si existe
          if (this.conversationCooldown > 0) {
            this.conversationCooldown--;
          }

          // NUEVO: Intentar iniciar conversaciones con mayor prioridad si no está pensando
          // y no está en ninguna interacción especial
          if (
            !this.isPaused &&
            !this.isReacting &&
            !this.isHovered &&
            !userInteracting &&
            this.currentThoughtTime <= 0 &&
            this.conversationCooldown <= 0
          ) {
            // Intentar iniciar conversación tiene ahora mayor prioridad
            if (this.tryToStartConversation()) {
              return; // Si inicia conversación, salir inmediatamente
            }
          }

          // Decrementar el tiempo de pensamiento actual si hay uno activo
          if (this.currentThoughtTime > 0) {
            this.currentThoughtTime--;
            // Si el tiempo del pensamiento actual ha expirado, borrarlo
            if (this.currentThoughtTime <= 0) {
              this.thought = '';
              this.isReacting = false;
            }
          }

          // Ahora continúa con el resto de la lógica en el orden anterior
          // Si el cursor está siendo hover o hay interacción del usuario, manejo especial
          if (this.isHovered) {
            if (this.annoyedThought === '') {
              this.annoyedThought = p.random(annoyedThoughts);
            }
            this.currentThoughtTime = this.thoughtDuration;
            return; // No seguir procesando otros tipos de pensamientos
          }

          // Lógica para interacción del usuario
          if (userInteracting && interactionPos) {
            let distToInteraction = p.dist(
              interactionPos.x,
              interactionPos.y,
              this.position.x,
              this.position.y
            );
            if (distToInteraction < 50) {
              // Si está cerca de la interacción del usuario
              if (!this.isReacting) {
                this.thought = p.random(['😱', '🫨', '😵‍💫', '‼️']);
                this.currentThoughtTime = 60;
                this.isReacting = true;
              }
              return; // No seguir procesando otros tipos de pensamientos
            }
          }

          // NUEVO: Intentar iniciar conversaciones si no está pensando
          if (
            !this.isPaused &&
            !this.isReacting &&
            !this.isHovered &&
            !userInteracting &&
            this.currentThoughtTime <= 0 &&
            this.conversationCooldown <= 0
          ) {
            this.tryToStartConversation();
          }

          // Solo generar pensamientos normales cuando no está en ningún estado especial
          if (
            !this.isPaused &&
            !this.isReacting &&
            !this.isHovered &&
            !userInteracting &&
            !this.inConversation
          ) {
            // Decrementar el temporizador de pensamiento general
            this.thoughtTimer--;

            // Ver si alguna otra entidad está "hablando" cerca y reaccionar a ella
            if (this.currentThoughtTime <= 0 && !this.isReacting) {
              for (let other of entities) {
                if (other !== this && other.thought !== '' && !other.inConversation) {
                  let d = this.position.dist(other.position);
                  if (d < this.perceptionRadius && other.currentThoughtTime > 0) {
                    if (p.random(1) < 0.08) {
                      // Aumentamos la probabilidad de reacción
                      this.thought = p.random(reactionThoughts);
                      this.currentThoughtTime = p.random(80, 120);
                      this.isReacting = true;
                      return; // Salir después de reaccionar
                    }
                  }
                }
              }
            }

            // Si es tiempo de un nuevo pensamiento y no está reaccionando
            if (this.thoughtTimer <= 0 && this.currentThoughtTime <= 0 && !this.isReacting) {
              this.thought = p.random(thoughts);
              this.thoughtTimer = p.random(180, 400); // Reducimos tiempo entre pensamientos
              this.currentThoughtTime = this.thoughtDuration;
            }
          }

          // Limpiar annoyedThought si ya no está hovered
          if (!this.isHovered) {
            this.annoyedThought = '';
          }
        }

        // NUEVO: Método para intentar iniciar una conversación
        tryToStartConversation() {
          // Solo intentar iniciar conversación si no estamos en una ya
          if (this.inConversation || this.conversationPartner) return;

          // Verificar que no haya ya conversaciones activas sobre el mismo tema
          const activeTopics = new Set();
          for (let entity of entities) {
            if (entity.inConversation && entity.conversationTopic) {
              activeTopics.add(entity.conversationTopic);
            }
          }

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

                  // Filtrar temas que ya están en conversación activa
                  const availableTopics = topics.filter((topic) => !activeTopics.has(topic));

                  // Si no hay temas disponibles, salir
                  if (availableTopics.length === 0) {
                    return false;
                  }

                  // Elegir un tema disponible que no hayamos usado recientemente
                  let selectedTopic;
                  let attempts = 0;
                  do {
                    selectedTopic = availableTopics[Math.floor(p.random(availableTopics.length))];
                    attempts++;
                  } while (
                    this.recentTopics &&
                    this.recentTopics.includes(selectedTopic) &&
                    attempts < 10 &&
                    availableTopics.length > 1
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
                  let qaIndex = Math.floor(p.random(conversationTopics[selectedTopic].qa.length));
                  if (this.recentQA && this.recentQA[selectedTopic]) {
                    let attempts = 0;
                    while (this.recentQA[selectedTopic].includes(qaIndex) && attempts < 5) {
                      qaIndex = Math.floor(p.random(conversationTopics[selectedTopic].qa.length));
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

                  // NUEVO: Elegir aleatoriamente quién comienza la conversación
                  const randomRoleAssignment = p.random(1) < 0.5;

                  // Establecer los roles de conversación
                  this.isStarter = randomRoleAssignment;
                  this.inConversation = true;
                  this.conversationPartner = other;
                  this.conversationTopic = selectedTopic;
                  this.conversationMessages = conversationTopics[selectedTopic];
                  this.messageIndex = 0;
                  this.messageTimer = 0;
                  this.messageDuration = 300; // Aumentado de 180 a 300 para dar más tiempo a cada mensaje
                  this.conversationCooldown = p.random(400, 800);

                  // Configurar al otro cursor como receptor con el rol opuesto
                  other.inConversation = true;
                  other.conversationPartner = this;
                  other.conversationTopic = selectedTopic;
                  other.conversationMessages = conversationTopics[selectedTopic];
                  other.messageIndex = 0;
                  other.messageTimer = 0;
                  other.isStarter = !randomRoleAssignment;
                  other.selectedQAIndex = qaIndex;

                  // Mostrar el primer mensaje
                  this.showNextMessage();
                  return true;
                }
              }
            }
          }
          return false;
        }

        // NUEVO: Método para manejar una conversación en curso
        handleConversation() {
          // Si no tenemos pareja o la pareja ya no está en conversación, terminar
          if (!this.conversationPartner || !this.conversationPartner.inConversation) {
            this.endConversation();
            return;
          }

          // NUEVO: Lógica para moverse hacia el compañero de conversación
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
              // Calculamos un tiempo adicional basado en la longitud del texto para garantizar que se muestre completo
              const textDisplayTime = Math.max(this.messageDuration * 15, qa.answer.length * 30);

              if (this.messageTimer <= 0 && this.thought === '') {
                this.thought = qa.answer;
                this.currentThoughtTime = this.messageDuration;

                setTimeout(() => {
                  this.messageIndex++;

                  // Sincronizar con el compañero
                  if (this.conversationPartner) {
                    this.conversationPartner.messageIndex = this.messageIndex;
                    this.conversationPartner.messageTimer = 20; // Esperar menos para la siguiente pregunta
                  }
                }, textDisplayTime); // Tiempo adaptado al largo del mensaje
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
                steeringForce.limit(0.2); // Limitar la fuerza de giro

                this.velocity.add(steeringForce);
                this.velocity.limit(approachSpeed);
              } else {
                // Si estoy lo suficientemente cerca, ajustar posición para quedar paralelo
                // Calcular un punto a la derecha o izquierda del compañero, no detrás
                let perpendicular = p5.Vector.copy(this.conversationPartner.velocity);
                perpendicular.rotate(p.PI / 2); // Girar 90 grados
                perpendicular.normalize();
                perpendicular.mult(this.perceptionRadius * 0.8); // Distancia lateral

                // Alternar entre izquierda y derecha basado en el ID del cursor
                if (entities.indexOf(this) % 2 === 0) {
                  perpendicular.mult(-1); // Hacia la izquierda para algunos
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
          // o si ya he respondido (para que no se reinicie la respuesta que ya está en proceso)
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

        // NUEVO: Método para mostrar el siguiente mensaje en la conversación
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

            // Si es una pregunta inicial, mostrar la pregunta de qa
            // Si es una respuesta inicial, mostrar la respuesta de qa
            // Si es una pregunta de seguimiento, mostrar la pregunta de followups
            // Si es una respuesta de seguimiento, mostrar la respuesta de followups

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

        // NUEVO: Método para terminar una conversación
        endConversation() {
          // Indicar al compañero que la conversación terminó
          if (this.conversationPartner && this.conversationPartner.inConversation) {
            this.conversationPartner.inConversation = false;
            this.conversationPartner.conversationPartner = null;
            this.conversationPartner.thought = '';
            this.conversationPartner.conversationCooldown = p.random(200, 500);
          }

          // Reiniciar nuestro estado
          this.inConversation = false;
          this.conversationPartner = null;
          this.thought = '';
          this.conversationTopic = null;
          this.conversationMessages = [];
          this.messageIndex = 0;
          this.isStarter = false;
          this.conversationCooldown = p.random(300, 600);
        }

        display() {
          let angle = this.velocity.heading();
          p.push();
          p.translate(this.position.x, this.position.y);

          p.rotate(angle + p.PI / 2);

          // Ajustar la opacidad basada en el z-level
          const alpha =
            this.zLevel === Z_LEVELS.BELOW ? 180 : this.zLevel === Z_LEVELS.ABOVE ? 255 : 220;

          let cs = this.cursorSize;
          let tipY = -cs * 0.75;
          let sideX = cs * 0.6;
          let sideY = cs * 0.55;
          let baseCurveDepth = cs * 0.2;
          let tipControlXFactor = 0.25;
          let tipControlYOffset = cs * 0.01;

          // Variar la apariencia según el z-level
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

          // Borde - más acentuado para los cursores de arriba, más sutil para los de abajo
          p.noFill();
          const strokeWeight =
            this.zLevel === Z_LEVELS.ABOVE ? 1.4 : this.zLevel === Z_LEVELS.BELOW ? 0.7 : 1; // Reducido de 2/1/1.5 a 1.4/0.7/1
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
          // CAMBIO DE PRIORIDAD: Conversación > Hover > Reacción a interacción > Reacción a otro cursor > Pensamiento normal
          if (this.inConversation && this.thought !== '' && this.currentThoughtTime > 0) {
            thoughtToShow = this.thought; // Mostrar mensaje de conversación (AHORA PRIMERO)
          } else if (this.isHovered && this.annoyedThought !== '') {
            thoughtToShow = this.annoyedThought;
          } else if (
            userInteracting &&
            interactionPos &&
            p.dist(interactionPos.x, interactionPos.y, this.position.x, this.position.y) < 50 &&
            this.isReacting
          ) {
            thoughtToShow = this.thought; // Mostrar pensamiento de susto por interacción
          } else if (!this.isHovered && this.thought !== '' && this.currentThoughtTime > 0) {
            // Si no está hovered y tiene un pensamiento activo
            thoughtToShow = this.thought;
          }

          if (thoughtToShow !== '') {
            p.push();
            let tagOffsetX = this.cursorSize * 0.4;
            let tagOffsetY = this.cursorSize * 0.6;

            let displayX = this.position.x + tagOffsetX;
            let displayY = this.position.y + tagOffsetY;

            p.translate(displayX, displayY);

            // NUEVO: Implementación del efecto de máquina de escribir con texto parcial
            if (!this.fullText) {
              this.fullText = thoughtToShow;
              this.typingIndex = 0;
              this.typingSpeed = p.random(1.5, 2.5); // Velocidad variable de escritura
              this.lastTypingUpdate = p.frameCount;
            }

            // Actualizar el texto según la animación de escritura
            if (this.typingIndex < this.fullText.length) {
              if (p.frameCount - this.lastTypingUpdate > this.typingSpeed) {
                this.typingIndex++;
                this.lastTypingUpdate = p.frameCount;
              }
            }

            // Mostrar el texto parcial según el progreso de la animación
            let displayedText = this.fullText.substring(0, this.typingIndex);

            // Añadir cursor parpadeante si está escribiendo
            let cursorChar = '';
            if (this.typingIndex < this.fullText.length && p.frameCount % 30 < 15) {
              cursorChar = '_';
            }

            // Tamaño de texto variable según z-index (reducido 30%)
            const fontSize =
              this.zLevel === Z_LEVELS.ABOVE ? 11 : this.zLevel === Z_LEVELS.BELOW ? 8 : 10; // Reducido de 16/12/14 a 11/8/10
            p.textSize(fontSize);
            p.textFont('Arial');

            // NUEVO: Medir el texto actual para determinar el tamaño de la caja
            let txtWidth = p.textWidth(displayedText + cursorChar);

            // NUEVO: Establecer un ancho mínimo y máximo para la caja (clamp)
            const minWidth = this.cursorSize * 2;
            const maxWidth = Math.min(p.width * 0.7, 300); // No más del 70% del ancho del canvas o 300px
            txtWidth = Math.max(minWidth, Math.min(txtWidth, maxWidth));

            // NUEVO: Calcular el alto basado en el texto
            const lineHeight = fontSize * 1.4;
            let estimatedHeight = this.tagHeight; // Altura base

            // Si el texto es muy largo, ajustar el alto
            if (txtWidth >= maxWidth) {
              // Aproximación del número de líneas basada en el ancho del texto original
              const originalTextWidth = p.textWidth(displayedText + cursorChar);
              const linesNeeded = Math.ceil(originalTextWidth / maxWidth);
              // Asegurar suficiente espacio para cada línea más margen
              estimatedHeight = Math.max(
                this.tagHeight,
                lineHeight * linesNeeded + this.tagPadding * 2
              );
            }

            let tagWidth = txtWidth + this.tagPadding * 2;
            let tagHeight = estimatedHeight;

            // Ajustar posición si el tag se sale del borde derecho del canvas
            if (displayX + tagWidth > p.width && p.width > 0) {
              p.translate(-(displayX + tagWidth - p.width + 10), 0); // Añadimos un margen adicional
            }
            // Ajustar posición si el tag se sale del borde inferior
            if (displayY + tagHeight > p.height && p.height > 0) {
              p.translate(0, -(displayY + tagHeight - p.height + 20)); // Aumentamos el margen
            }
            // Ajustar posición si el tag se sale del borde superior
            if (displayY < 40) {
              // Evitar que los pensamientos se muestren demasiado cerca del borde superior
              p.translate(0, 40);
            }

            p.noStroke();
            //            // Variar opacidad y estilo según el z-level
            const bgAlpha =
              this.zLevel === Z_LEVELS.BELOW ? 180 : this.zLevel === Z_LEVELS.ABOVE ? 250 : 230;

            // Cambiar color del globo si está en conversación
            const fillColor = this.inConversation
              ? p.color(this.tagColor.levels[0], this.tagColor.levels[1], this.tagColor.levels[2])
              : this.tagColor;

            fillColor.setAlpha(bgAlpha);
            p.fill(fillColor);

            // Dibujar el globo de conversación
            p.rect(0, 0, tagWidth, tagHeight, this.tagRoundness);

            // NUEVO: Si está en conversación, dibujar un punto pulsante en vez del triángulo
            if (this.inConversation) {
              // Determinar el color del punto (usar el color del cursor con quien estamos hablando)
              let dotColor;
              if (this.conversationPartner) {
                // Usar el color del cursor con quien estamos hablando
                dotColor = this.conversationPartner.cursorColor;
              } else {
                // Usar nuestro color si no hay socio (no debería ocurrir)
                dotColor = this.cursorColor;
              }

              // Calcular el pulso (usando frameCount para animación) - Reducido 30%
              const pulseSize = 4 + Math.sin(p.frameCount * 0.1) * 1.4; // Reducido de 6±2 a 4±1.4
              const pulseOpacity = 200 + Math.sin(p.frameCount * 0.1) * 55; // Opacidad sin cambios

              // Dibujar el punto pulsante
              p.fill(dotColor.levels[0], dotColor.levels[1], dotColor.levels[2], pulseOpacity);
              p.noStroke();
              p.ellipse(0, tagHeight + pulseSize, pulseSize * 2, pulseSize * 2);

              // Círculo interior más brillante para efecto de brillo
              p.fill(255, 255, 255, pulseOpacity * 0.8);
              p.ellipse(0, tagHeight + pulseSize, pulseSize * 0.7, pulseSize * 0.7);
            }

            // Borde del globo de pensamiento - más enfatizado según z-level
            const strokeWeight =
              this.zLevel === Z_LEVELS.ABOVE ? 2 : this.zLevel === Z_LEVELS.BELOW ? 1 : 1.5;
            p.stroke(255, 255, 255, bgAlpha);
            p.strokeWeight(strokeWeight);
            p.noFill();
            p.rect(0, 0, tagWidth, tagHeight, this.tagRoundness);

            p.noStroke();
            p.fill(255, 255, 255, bgAlpha);

            // NUEVO: Cambiar configuración de texto para permitir múltiples líneas
            p.textAlign(p.LEFT, p.TOP);

            // NUEVO: Dibujar texto con ajuste de líneas
            this.drawWrappedText(displayedText, tagWidth, tagHeight);

            p.pop();
          } else {
            // Si no hay pensamiento, reiniciar la animación de escritura
            this.fullText = null;
            this.typingIndex = 0;
          }
        }

        // NUEVO: Método auxiliar para dibujar texto con saltos de línea
        drawWrappedText(text, boxWidth, boxHeight) {
          const availableWidth = boxWidth - this.tagPadding * 2;
          const fontSize =
            this.zLevel === Z_LEVELS.ABOVE ? 11 : this.zLevel === Z_LEVELS.BELOW ? 8 : 10; // Reducido de 16/12/14 a 11/8/10

          // Alinear el texto a la izquierda
          p.textAlign(p.LEFT, p.TOP);
          p.textSize(fontSize);

          // Si el texto es corto, mostrarlo en una sola línea
          if (p.textWidth(text) <= availableWidth) {
            // Calcular la posición para texto corto
            const xLeft = this.tagPadding;
            const yCenter = boxHeight / 2 - fontSize / 2;
            p.text(text, xLeft, yCenter);
            return;
          }

          // Para textos largos, dividir en múltiples líneas
          const words = text.split(' ');
          let line = '';
          let y = this.tagPadding;
          const lineHeight = fontSize * 1.2;
          const xLeft = this.tagPadding;

          // Procesar cada palabra para ajustar el texto
          for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i] + ' ';
            const testWidth = p.textWidth(testLine);

            if (testWidth > availableWidth && i > 0) {
              // Dibujar la línea actual y comenzar una nueva
              p.text(line, xLeft, y);
              line = words[i] + ' ';
              y += lineHeight;

              // Verificar si nos pasamos del área disponible
              if (y + lineHeight > boxHeight - this.tagPadding) {
                // Añadir puntos suspensivos y terminar
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

          // Dibujar la última línea si hay espacio
          if (y + lineHeight <= boxHeight - this.tagPadding) {
            p.text(line, xLeft, y);
          }
        }
      }
      // --- Fin Clase Entity ---

      // --- Manejo de Redimensionamiento ---
      p.windowResized = () => {
        // Usamos las dimensiones actuales del contenedor referenciado
        if (
          containerRef.current &&
          containerRef.current.offsetWidth > 0 &&
          containerRef.current.offsetHeight > 0
        ) {
          p.resizeCanvas(containerRef.current.offsetWidth, containerRef.current.offsetHeight);
          console.log('Canvas (Cursores Personalizados) resized:', p.width, 'x', p.height);
        } else {
          console.warn('Window resized, but container has zero dimensions or is not found.');
        }
      };
    }; // --- Fin del sketch ---

    // Crear la instancia de p5.js y guardarla en la ref
    // Pasar la función sketch y el contenedor
    // Usamos setTimeout para dar un pequeño margen a que el DOM se asiente,
    // aunque useEffect ya espera a que el componente esté montado.
    const initializeSketch = () => {
      if (
        containerRef.current &&
        containerRef.current.offsetWidth > 0 &&
        containerRef.current.offsetHeight > 0
      ) {
        sketchRef.current = new p5(sketch, containerRef.current);
        console.log(
          `P5CursorSketch: Sketch para ${sectionId} inicializado correctamente`,
          sketchRef.current
        );
      } else {
        console.warn(
          `P5CursorSketch (${sectionId}): Container still has zero dimensions after timeout. Retrying or showing error.`
        );
        if (containerRef.current) {
          containerRef.current.innerHTML =
            '<p style="color:#aaa;text-align:center;padding:20px;font-family:sans-serif;">Oops! Error al cargar animación (contenedor sin dimensiones después de espera).</p>';
        }
      }
    };

    // Esperar un poco antes de inicializar para asegurar que el contenedor tenga dimensiones
    const initTimeout = setTimeout(initializeSketch, 100); // Pequeña espera

    // Función de limpieza para remover el sketch cuando el componente se desmonte
    return () => {
      console.log(`P5CursorSketch (${sectionId}): Removiendo sketch...`);
      clearTimeout(initTimeout); // Limpiar el timeout si el componente se desmonta antes

      // Eliminar del registro global
      if (window._P5CursorInstances && window._P5CursorInstances[instanceId.current]) {
        console.log(`P5CursorSketch (${sectionId}): Eliminando instancia del registro global`);
        delete window._P5CursorInstances[instanceId.current];
      }

      if (sketchRef.current && sketchRef.current.remove) {
        sketchRef.current.remove();
        // Habilitar el cursor de nuevo
        document.body.style.cursor = 'default';
      }
    };
  }, [sectionId, width, height, isFixed]); // Añadimos las props como dependencias

  // El componente React renderiza el div contenedor
  return (
    <div
      ref={containerRef}
      id={`p5-container-${sectionId}`}
      data-react-id={instanceId.current}
      data-section-id={sectionId}
      style={{
        width: width,
        height: height,
        overflow: 'hidden',
        position: isFixed ? 'fixed' : 'relative',
        top: isFixed ? 0 : 'auto',
        left: isFixed ? 0 : 'auto',
        right: isFixed ? 0 : 'auto',
        bottom: isFixed ? 0 : 'auto',
        backgroundColor: 'transparent', // Cambiado para ser totalmente transparente
        borderRadius: '0px',
        minHeight: '100px',
        minWidth: '100px',
        zIndex: isFixed ? 11 : 11,
        cursor: 'auto',
        pointerEvents: 'none', // Permitir que los eventos del mouse pasen a través
        opacity: 1, // Asegurar que sea visible
      }}
    ></div>
  );
};

export default P5CursorSketch;
