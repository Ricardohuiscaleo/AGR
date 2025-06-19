/**
 * Utilidad para virtualización de secciones basada en Intersection Observer
 * Similar a react-window pero optimizada para Astro
 */

// Definición de tipos para importMeta.env
interface ImportMetaEnv {
  DEV: boolean;
  PROD: boolean;
  SSR: boolean;
  [key: string]: any;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Opciones de configuración para la virtualización
interface VirtualizationOptions {
  rootMargin?: string; // Margen para precarga (ej: "200px")
  threshold?: number; // Umbral de visibilidad (0-1)
  unloadOffscreen?: boolean; // Si se debe descargar el contenido fuera de pantalla
  lazyEffects?: boolean; // Si se deben cargar efectos visuales con retraso
}

/**
 * Inicializa la virtualización de secciones
 */
export const initSectionVirtualization = (
  selector: string = '.content-section',
  options: VirtualizationOptions = {}
): void => {
  // Valores predeterminados
  const {
    rootMargin = '200px 0px',
    threshold = 0.1,
    unloadOffscreen = false,
    lazyEffects = true,
  } = options;

  // Crear observer cuando el DOM esté listo
  document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll<HTMLElement>(selector);
    if (!sections.length) return;

    // Preparar las secciones
    sections.forEach((section) => {
      // No virtualizar secciones pequeñas (como las intro)
      if (section.clientHeight < 100) return;

      // Marcar secciones como no inicializadas
      section.dataset.virtualized = 'pending';

      // Pre-ocultar efectos pesados si lazyEffects está activado
      if (lazyEffects) {
        // Efectos Aurora
        const aurora = section.querySelector('.aurora-background-container');
        if (aurora && aurora instanceof HTMLElement) {
          aurora.style.opacity = '0';
          aurora.dataset.effectType = 'aurora';
        }

        // Efectos P5
        const p5container = section.querySelector('.p5-container');
        if (p5container && p5container instanceof HTMLElement) {
          p5container.style.opacity = '0';
          p5container.dataset.effectType = 'p5';
        }

        // Otros efectos visuales pesados
        const heavyAnimations = section.querySelectorAll(
          '.glow-effect, .feature-card, .animated-gradient-text'
        );
        heavyAnimations.forEach((anim) => {
          if (anim instanceof HTMLElement) {
            anim.style.opacity = '0';
            anim.dataset.effectType = 'animation';
          }
        });
      }
    });

    // Crear observador que detecta cuando las secciones entran en el viewport
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const section = entry.target as HTMLElement;

          // Sección entrando en el viewport
          if (entry.isIntersecting) {
            // Activar la sección si no estaba ya activada
            if (section.dataset.virtualized !== 'active') {
              activateSection(section);
            }
          }
          // Sección saliendo del viewport
          else if (unloadOffscreen && section.dataset.virtualized === 'active') {
            deactivateSection(section);
          }
        });
      },
      { rootMargin, threshold }
    );

    // Observar todas las secciones
    sections.forEach((section) => observer.observe(section));

    // Función para activar una sección
    function activateSection(section: HTMLElement): void {
      section.dataset.virtualized = 'active';

      // Activar efectos con una pequeña transición
      if (lazyEffects) {
        // Recuperar todos los efectos y animarlos suavemente
        const effects = section.querySelectorAll('[data-effect-type]');

        effects.forEach((effect, index) => {
          if (effect instanceof HTMLElement) {
            // Retraso progresivo para que no todo aparezca a la vez
            const delay = index * 100;

            setTimeout(() => {
              effect.style.transition = 'opacity 0.5s ease-in-out';
              effect.style.opacity = '1';
            }, delay);
          }
        });
      }
    }

    // Función para desactivar una sección (si unloadOffscreen es true)
    function deactivateSection(section: HTMLElement): void {
      if (!unloadOffscreen) return;

      section.dataset.virtualized = 'inactive';

      // Desactivar efectos pesados para liberar recursos
      if (lazyEffects) {
        const effects = section.querySelectorAll('[data-effect-type]');

        effects.forEach((effect) => {
          if (effect instanceof HTMLElement) {
            effect.style.opacity = '0';
          }
        });
      }
    }
  });
};

/**
 * Mide el rendimiento de la página y registra métricas clave
 */
export const measurePerformance = (): void => {
  // Esperar a que la página se cargue completamente
  window.addEventListener('load', () => {
    // Obtener métricas de rendimiento
    setTimeout(() => {
      if (window.performance) {
        const perfEntries = window.performance.getEntriesByType('navigation');
        if (perfEntries.length > 0 && perfEntries[0] instanceof PerformanceNavigationTiming) {
          const timing = perfEntries[0];

          // Calcular métricas principales usando las propiedades correctas
          const loadTime = timing.loadEventEnd - timing.startTime;
          const domContentLoaded = timing.domContentLoadedEventEnd - timing.startTime;
          const firstPaint = window.performance.getEntriesByName('first-paint')[0]?.startTime || 0;
          const firstContentfulPaint =
            window.performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0;

          // Verificar si estamos en desarrollo usando una comprobación alternativa
          const isDev =
            typeof import.meta !== 'undefined' &&
            // @ts-ignore
            import.meta.env?.DEV === true;

          // Registrar métricas en consola (solo en entorno de desarrollo - deshabilitado)
          /*
          if (isDev) {
            console.group('📊 Métricas de rendimiento:');
            console.log(`⏱️ Tiempo de carga total: ${Math.round(loadTime)}ms`);
            console.log(`🔄 DOM Content Loaded: ${Math.round(domContentLoaded)}ms`);
            console.log(`🎨 First Paint: ${Math.round(firstPaint)}ms`);
            console.log(`🖼️ First Contentful Paint: ${Math.round(firstContentfulPaint)}ms`);
            console.groupEnd();
          }
          */

          // Opcional: enviar métricas a un servicio de análisis
          // sendPerformanceMetricsToAnalytics({ loadTime, domContentLoaded, firstPaint, firstContentfulPaint });
        }
      }
    }, 0);
  });
};

/**
 * Optimiza los manejadores de eventos de scroll para mejorar el rendimiento
 */
export const optimizeScrollHandlers = (): void => {
  // Usar requestAnimationFrame para limitar las actualizaciones del scroll
  let ticking = false;

  // Reemplazar todos los listeners de scroll con versiones optimizadas
  const originalAddEventListener = EventTarget.prototype.addEventListener;

  // Sobrescribir addEventListener para optimizar listeners de scroll
  EventTarget.prototype.addEventListener = function (
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ) {
    if (type === 'scroll') {
      // Versión optimizada para scroll
      const optimizedListener = function (this: any, event: Event) {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            if (typeof listener === 'function') {
              listener.call(this, event);
            } else if (
              typeof listener === 'object' &&
              listener !== null &&
              'handleEvent' in listener
            ) {
              listener.handleEvent(event);
            }
            ticking = false;
          });
          ticking = true;
        }
      };

      // Aplicar listener optimizado
      return originalAddEventListener.call(this, type, optimizedListener, options);
    }

    // Para otros tipos de eventos, usar el comportamiento normal
    return originalAddEventListener.call(this, type, listener, options);
  };
};
