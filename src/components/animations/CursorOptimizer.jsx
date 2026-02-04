import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

/**
 * Componente que optimiza la activación/desactivación de los cursores en las secciones part1
 * utilizando ScrollTrigger de GSAP para mejorar el rendimiento
 */
export default function CursorOptimizer({ showMarkers = false }) {
  const initialized = useRef(false);
  const logThrottle = useRef({}); // Para throttling de logs

  // Función auxiliar para logs inteligentes (throttled)
  const smartLog = (key, message, type = 'log', throttleMs = 5000) => {
    if (!showMarkers) return; // Solo loggear en modo debug
    
    const now = Date.now();
    if (!logThrottle.current[key] || now - logThrottle.current[key] > throttleMs) {
      console[type](`[CursorOptimizer] ${message}`);
      logThrottle.current[key] = now;
    }
  };

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const setupCursorOptimization = async () => {
      // Registrar ScrollTrigger con GSAP
      gsap.registerPlugin(ScrollTrigger);

      // Personalizar estilos de marcadores para hacerlos más compactos y en línea
      if (showMarkers) {
        const markerStyle = document.createElement('style');
        markerStyle.textContent = `
          .gsap-marker-start, .gsap-marker-end, .gsap-marker-scroller-start, .gsap-marker-scroller-end {
            font-size: 10px !important;
            padding: 2px 5px !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            max-width: 120px !important;
            z-index: 999999 !important;
          }
          /* Colores más diferenciados para distinguir mejor */
          .gsap-marker-start { background-color: #4CAF50 !important; }
          .gsap-marker-end { background-color: #F44336 !important; }
          .gsap-marker-scroller-start { background-color: #2196F3 !important; }
          .gsap-marker-scroller-end { background-color: #FF9800 !important; }
          
          /* Eliminar texto de depuración */
          .section-debug-label {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            pointer-events: none !important;
          }
        `;
        document.head.appendChild(markerStyle);
      } else {
        // Si no estamos en modo debug, añadir estilo para ocultar todos los elementos de depuración
        const cleanupStyle = document.createElement('style');
        cleanupStyle.textContent = `
          /* Eliminar texto de depuración en entorno de producción */
          .gsap-marker-start, .gsap-marker-end, .gsap-marker-scroller-start, .gsap-marker-scroller-end,
          .section-debug-label, .debug-section-overlay, [data-section-label] {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            pointer-events: none !important;
          }
        `;
        document.head.appendChild(cleanupStyle);
      }

      // Esperar a que el DOM esté completamente cargado
      setTimeout(() => {
        // Seleccionar todas las secciones part1 donde están los cursores
        const part1Sections = document.querySelectorAll('[id$="-part1"]');

        // Verificar si hay instancias de cursores en el contexto global
        if (!window._P5CursorInstances) {
          window._P5CursorInstances = {}; // Inicializar si no existe
          smartLog('init', 'Inicializando contexto global de cursores');
          return;
        }

        smartLog('setup', `Configurando optimización para ${part1Sections.length} secciones`);

        // Limpiar cualquier texto de depuración existente
        document
          .querySelectorAll('.section-debug-label, .debug-section-overlay, [data-section-label]')
          .forEach((el) => el.remove());

        // Para cada sección part1, crear un ScrollTrigger que active/desactive su cursor
        part1Sections.forEach((section) => {
          const sectionId = section.id;
          const baseSectionId = sectionId.split('-')[0]; // Obtener ID base (ej: 'hola' de 'hola-part1')

          // Crear un ScrollTrigger para esta sección
          ScrollTrigger.create({
            trigger: section,
            start: 'top 80%', // Comenzar cuando el top de la sección esté al 80% del viewport desde arriba
            end: 'bottom 20%', // Terminar cuando el bottom de la sección esté al 20% del viewport desde abajo
            markers: showMarkers, // Mostrar marcadores visuales solo en debugging
            id: `cursor-${baseSectionId}`, // ID más corto para que no se vea tan largo en los marcadores
            toggleClass: { targets: section, className: 'cursor-active' }, // Agregar clase para debugging visual
            onEnter: () => {
              smartLog(`enter-${baseSectionId}`, `Activando cursor para ${sectionId}`, 'log', 3000);
              activateCursor(sectionId, true);
            },
            onLeave: () => {
              smartLog(`leave-${baseSectionId}`, `Desactivando cursor para ${sectionId}`, 'log', 3000);
              activateCursor(sectionId, false);
            },
            onEnterBack: () => {
              smartLog(`enterback-${baseSectionId}`, `Reactivando cursor para ${sectionId}`, 'log', 3000);
              activateCursor(sectionId, true);
            },
            onLeaveBack: () => {
              smartLog(`leaveback-${baseSectionId}`, `Desactivando cursor para ${sectionId}`, 'log', 3000);
              activateCursor(sectionId, false);
            },
          });
        });

        // También optimizar la sección actual basada en la navegación lateral
        optimizeActiveSectionCursor();
      }, 1500); // Aumentamos a 1500ms para dar más tiempo a que todo esté listo
    };

    // Función auxiliar para activar/desactivar un cursor específico
    const activateCursor = (sectionId, isActive) => {
      const baseSectionId = sectionId.split('-')[0]; // Obtener ID base (ej: 'hola' de 'hola-part1')

      // Verificar que tengamos instancias para trabajar
      if (!window._P5CursorInstances || Object.keys(window._P5CursorInstances).length === 0) {
        smartLog('error-no-instances', 'No hay instancias de cursores disponibles', 'warn', 10000);
        return false;
      }

      // Método 1: Buscar por data-section-id
      const p5Container =
        document.querySelector(`[data-section-id="${sectionId}"]`) ||
        document.querySelector(`[data-section-id="${baseSectionId}"]`);

      if (p5Container) {
        // Obtener directamente el data-react-id del contenedor
        const reactId = p5Container.getAttribute('data-react-id');

        if (reactId && window._P5CursorInstances[reactId]) {
          // Método directo usando el reactId
          try {
            window._P5CursorInstances[reactId].setActive(isActive);

            // Feedback visual solo para debugging
            if (showMarkers) {
              if (isActive) {
                p5Container.style.outline = '2px solid rgba(0, 255, 0, 0.3)';
              } else {
                p5Container.style.outline = 'none';
              }
            }
            smartLog(`success-${baseSectionId}`, `✅ Cursor ${isActive ? 'activado' : 'desactivado'} correctamente`, 'log', 5000);
            return true; // Éxito
          } catch (err) {
            smartLog('error-setactive', `Error al cambiar estado del cursor: ${err.message}`, 'error', 10000);
          }
        }
      }

      // Método 2: Buscar recorriendo todas las instancias
      let found = false;
      for (const id in window._P5CursorInstances) {
        const instance = window._P5CursorInstances[id];

        // Verificar si la instancia es válida y tiene el método setActive
        if (instance && typeof instance.setActive === 'function') {
          const instanceSection = instance.sectionId || '';

          // Comparar con el ID completo y con el ID base
          if (
            instanceSection === sectionId ||
            instanceSection === baseSectionId ||
            instanceSection.includes(baseSectionId) ||
            baseSectionId.includes(instanceSection)
          ) {
            try {
              instance.setActive(isActive);

              // Intentar aplicar feedback visual si podemos encontrar el contenedor
              if (showMarkers) {
                const containerId = `p5-container-${instanceSection}`;
                const container =
                  document.getElementById(containerId) ||
                  document.querySelector(`[data-section-id="${instanceSection}"]`);

                if (container) {
                  if (isActive) {
                    container.style.outline = '2px solid rgba(0, 255, 0, 0.3)';
                  } else {
                    container.style.outline = 'none';
                  }
                }
              }

              found = true;
            } catch (err) {
              smartLog('error-instance', `Error en instancia ${id}: ${err.message}`, 'error', 10000);
            }
          }
        }
      }

      if (!found) {
        // Último intento: activar/desactivar todas las instancias disponibles
        if (baseSectionId === 'hola' || sectionId === 'hola-part1') {
          for (const id in window._P5CursorInstances) {
            try {
              window._P5CursorInstances[id].setActive(isActive);
              found = true;
            } catch (err) {
              smartLog('error-fallback', `Error en fallback: ${err.message}`, 'error', 10000);
            }
          }
        }
      }

      if (!found) {
        smartLog(`notfound-${baseSectionId}`, `⚠️ No se encontró cursor para ${sectionId}`, 'warn', 8000);
      }

      return found;
    };

    // Función para optimizar el cursor de la sección activa basada en la navegación lateral
    const optimizeActiveSectionCursor = () => {
      // Escuchar eventos de cambio de sección activa
      document.addEventListener('navCardStateChanged', (event) => {
        smartLog('nav-change', `Navegación cambió a sección: ${event.detail?.sectionId}`, 'log', 2000);
        
        // Desactivar todos los cursores primero
        if (window._P5CursorInstances) {
          Object.keys(window._P5CursorInstances).forEach((id) => {
            const instance = window._P5CursorInstances[id];
            if (instance && typeof instance.setActive === 'function') {
              instance.setActive(false);
            }
          });
        }

        // Solo activar el cursor para la sección activa
        if (event.detail && event.detail.sectionId) {
          // Los cursores siempre están en -part1
          const targetSectionId = `${event.detail.sectionId}-part1`;
          activateCursor(targetSectionId, true);
        }
      });
    };

    // Ejecutar la configuración
    setupCursorOptimization();

    // Limpiar ScrollTriggers al desmontar
    return () => {
      // Limpiar todos los ScrollTriggers creados por este componente
      ScrollTrigger.getAll()
        .filter((trigger) => trigger.id && trigger.id.startsWith('cursor-'))
        .forEach((trigger) => trigger.kill());
    };
  }, [showMarkers]);

  // Este componente no renderiza nada visible
  return null;
}
