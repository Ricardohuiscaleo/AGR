'use client';
import React, { useEffect, useRef, useState } from 'react';
import { cn } from '../../utils/cn';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import GradientText from '../text/GradientText';

// Usando JSDoc para tipos
/**
 * @typedef {Object} TimelineEntry
 * @property {string} title - Título del elemento
 * @property {string} [date] - Fecha opcional del elemento
 * @property {any} content - Contenido del elemento (string HTML o React component)
 */

/**
 * Componente Timeline que muestra una línea de tiempo con efectos de scroll
 * @param {Object} props - Propiedades del componente
 * @param {TimelineEntry[]} props.data - Array de elementos para mostrar en la línea de tiempo
 * @param {string} [props.title] - Título principal de la línea de tiempo
 * @param {string} [props.subtitle] - Subtítulo de la línea de tiempo
 * @param {string} [props.className] - Clases adicionales para el contenedor principal
 * @param {string} [props.titleColor='text-white'] - Color para el título principal
 * @param {string} [props.dateColor='text-neutral-400'] - Color para las fechas
 * @param {string} [props.lineColor='bg-gradient-to-t from-indigo-600 via-blue-400 to-transparent'] - Clase de color para la línea de progreso
 * @param {string} [props.lineBaseColor='bg-[linear-gradient(to_bottom,var(--tw-gradient-stops))] from-transparent from-[0%] via-neutral-500 dark:via-neutral-600 to-transparent to-[99%]'] - Clase de color para la línea base
 * @param {string} [props.sectionId='usage-part1'] - ID de la sección que contiene la línea de tiempo
 * @param {number} [props.lineOffset=5] - Offset para la posición de la línea
 * @param {string} [props.titleClassName] - Clases adicionales para el título principal
 * @param {Object} [props.style] - Estilos inline para aplicar al componente
 * @param {boolean} [props.usePageScroll=false] - Usar scroll de página en lugar de scroll interno
 */
export const Timeline = ({
  data,
  title,
  subtitle,
  className,
  titleColor = 'text-white',
  dateColor = 'text-neutral-400',
  lineColor = 'bg-gradient-to-t from-indigo-600 via-blue-400 to-transparent',
  lineBaseColor = 'bg-[linear-gradient(to_bottom,var(--tw-gradient-stops))] from-transparent from-[0%] via-neutral-500 dark:via-neutral-600 to-transparent to-[99%]',
  sectionId = 'usage-part1',
  lineOffset = 5,
  titleClassName,
  style,
  usePageScroll = false, // Nueva propiedad para usar el scroll de página
}) => {
  const ref = useRef(null);
  const containerRef = useRef(null);
  const lineRef = useRef(null);
  const itemRefs = useRef([]);
  const [height, setHeight] = useState(0);
  const [activeIndex, setActiveIndex] = useState(-1);
  const initialized = useRef(false);
  const animationsCreated = useRef(false);
  const scrollListenerSet = useRef(false);

  // Registrar los plugins de GSAP
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
  }, []);

  // Inicializar los refs para los elementos del timeline
  useEffect(() => {
    itemRefs.current = Array(data.length)
      .fill()
      .map((_, i) => itemRefs.current[i] || React.createRef());
  }, [data]);

  // Actualizar altura cuando el componente se monta
  useEffect(() => {
    if (ref.current) {
      const updateHeight = () => {
        const rect = ref.current.getBoundingClientRect();
        setHeight(rect.height);
      };

      updateHeight();
      window.addEventListener('resize', updateHeight);

      return () => {
        window.removeEventListener('resize', updateHeight);
      };
    }
  }, []);

  // Configurar la sección para scroll - ELIMINAR COMPLETAMENTE el scroll interno cuando usePageScroll=true
  useEffect(() => {
    const section = document.getElementById(sectionId);
    if (!section) return;

    if (usePageScroll) {
      // IMPORTANTE: La clave es eliminar completamente el scroll y comportamiento de overflow
      section.style.height = 'auto'; // Altura automática basada en contenido
      section.style.overflowY = 'visible'; // No scroll interno
      section.style.overflowX = 'hidden'; // Prevenir overflow horizontal
      section.style.position = 'relative'; // Mantener position relative para posicionamiento interno

      // Añadir clase para estilos especiales de scroll global
      section.classList.add('use-page-scroll');
      section.classList.add('timeline-global-scroll');

      console.log(
        `Timeline: Sección ${sectionId} configurada con scroll de página global, sin scroll interno`
      );
    } else {
      // Configuración original con scroll interno (solo para compatibilidad con versiones anteriores)
      const dynamicHeight = Math.max(1400, data.length * 500);
      section.style.height = `${dynamicHeight}px`;
      section.style.overflowY = 'auto';
      section.style.overflowX = 'hidden';
      section.style.position = 'relative';

      // Quitar clases de scroll global
      section.classList.remove('use-page-scroll');
      section.classList.remove('timeline-global-scroll');
    }

    // Añadir clase común para todos los timelines
    section.classList.add('timeline-container');
  }, [sectionId, data.length, usePageScroll]);

  // Implementar nuevo sistema de detección de visibilidad basado en Intersection Observer para scroll de página
  useEffect(() => {
    if (!usePageScroll || !data.length) return;

    const section = document.getElementById(sectionId);
    if (!section) return;

    console.log(`Configurando Intersection Observer para ${sectionId}`);

    // Crear un observador para cada elemento del timeline
    const observers = [];

    // Configuración del observador
    const observerOptions = {
      root: null, // Usar el viewport como referencia
      rootMargin: '-20% 0px -30% 0px', // Margen para activar un poco antes
      threshold: [0, 0.25, 0.5, 0.75, 1], // Múltiples umbrales para detección precisa
    };

    // Para cada elemento del timeline, crear un observador
    data.forEach((_, index) => {
      const callback = (entries) => {
        entries.forEach((entry) => {
          // Obtener elementos a animar
          const circleEl = document.querySelector(`#timeline-circle-${index}`);
          const titleEl = document.querySelector(`#timeline-title-${index}`);
          const mobileTitleEl = document.querySelector(`#timeline-title-mobile-${index}`);
          const contentEl = document.querySelector(`#timeline-content-${index}`);

          if (!circleEl || !contentEl) return;

          // Determinar si elemento es visible (con mayor umbral para activación)
          const isVisible = entry.isIntersecting && entry.intersectionRatio > 0.25;

          // Activar/desactivar elementos
          if (isVisible) {
            console.log(`Elemento ${index} visible en ${sectionId}`);

            // Activar elementos
            circleEl.classList.add('active');
            if (titleEl) titleEl.classList.add('active');
            if (mobileTitleEl) mobileTitleEl.classList.add('active');
            if (contentEl) contentEl.classList.add('active');

            // Actualizar indice activo
            if (index > activeIndex) {
              setActiveIndex(index);
            }

            // Aplicar animaciones GSAP
            updateElementAnimations(index, true);
          } else {
            // Solo desactivar si el elemento está por encima del viewport (ya lo pasamos)
            const rect = entry.boundingClientRect;
            const isPastViewport = rect.bottom < 0;

            if (!isPastViewport) {
              circleEl.classList.remove('active');
              if (titleEl) titleEl.classList.remove('active');
              if (mobileTitleEl) mobileTitleEl.classList.remove('active');
              if (contentEl) contentEl.classList.remove('active');

              // Aplicar animaciones GSAP
              updateElementAnimations(index, false);
            }
          }
        });
      };

      // Crear un nuevo observador para este elemento
      const observer = new IntersectionObserver(callback, observerOptions);

      // Buscar el elemento que queremos observar (contenido principal)
      const contentEl = document.querySelector(`#timeline-content-${index}`);
      if (contentEl) {
        observer.observe(contentEl);
        observers.push(observer);
      }
    });

    // Limpiar observadores cuando se desmonte el componente
    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, [data, sectionId, activeIndex, usePageScroll]);

  // Inicializar la barra de progreso - con soporte para scroll global
  useEffect(() => {
    if (!ref.current || !lineRef.current) return;

    const section = document.getElementById(sectionId);
    if (!section) return;

    // Crear el contenedor de la barra de progreso si no existe
    let progressContainer = document.querySelector(`#${sectionId} .timeline-progress-container`);

    if (!progressContainer) {
      // Obtener la posición exacta de los círculos para alinear la línea de progreso
      const firstCircle = document
        .querySelector(`#${sectionId} [id^="timeline-circle-"]`)
        ?.closest('div');

      // Calcular la posición correcta para la línea de progreso
      let circleOffset = 15; // Valor por defecto si no se puede calcular - aumentado para visibilidad

      if (firstCircle) {
        const circleRect = firstCircle.getBoundingClientRect();
        const sectionRect = section.getBoundingClientRect();

        // Calcular la posición centro-izquierda del círculo relativa a la sección
        circleOffset = circleRect.left + circleRect.width / 2 - sectionRect.left;
        console.log(`Posición calculada del círculo: ${circleOffset}px desde el borde izquierdo`);
      } else {
        console.log(
          `No se encontraron círculos en ${sectionId}, usando posición por defecto: ${circleOffset}px`
        );
      }

      progressContainer = document.createElement('div');
      progressContainer.className = `timeline-progress-container ${usePageScroll ? 'global-scroll' : ''} fixed z-20`;

      // Posicionar la barra de progreso adecuadamente - ALINEADA CON LOS CÍRCULOS
      progressContainer.style.position = usePageScroll ? 'fixed' : 'absolute';
      progressContainer.style.left = `${circleOffset}px`; // Posición calculada para alinear con círculos
      progressContainer.style.width = '6px'; // Aumentar el ancho para mayor visibilidad
      progressContainer.style.background = 'rgba(107, 114, 128, 0.6)'; // Mayor opacidad para mejor visibilidad
      progressContainer.style.borderRadius = '4px';
      progressContainer.style.overflow = 'hidden';
      progressContainer.style.display = 'block'; // Forzar visualización
      progressContainer.style.opacity = '1'; // Forzar opacidad total
      progressContainer.style.visibility = 'visible'; // Forzar visibilidad
      progressContainer.style.zIndex = '30'; // Asegurar que esté por encima de otros elementos

      // Altura específica según modo de scroll
      if (usePageScroll) {
        progressContainer.style.height = '80vh';
        progressContainer.style.top = '10vh'; // Centrada verticalmente
        progressContainer.style.position = 'fixed'; // Asegurar que esté fixed
      } else {
        progressContainer.style.height = '90%';
        progressContainer.style.top = '5%';
      }

      // Crear la barra de progreso
      const progressBar = document.createElement('div');
      progressBar.id =
        sectionId && (sectionId.includes('hola-part3') || sectionId.includes('hola-part4'))
          ? 'timeline-progress-orange'
          : 'timeline-progress';
      progressBar.style.position = 'absolute';
      progressBar.style.width = '100%';
      progressBar.style.height = '0%';
      progressBar.style.display = 'block !important'; // Forzar visualización
      progressBar.style.opacity = '1 !important'; // Forzar opacidad total
      progressBar.style.zIndex = '10';

      // Determinar el color de la barra basado en la sección
      if (sectionId && (sectionId.includes('hola-part3') || sectionId.includes('hola-part4'))) {
        progressBar.style.background = 'linear-gradient(to bottom, #22ff6c, #ffb6c1, #65f0ff)';
        progressBar.style.boxShadow = '0 0 12px rgba(34, 255, 108, 1)'; // Aumentar intensidad del resplandor
      } else {
        progressBar.className = lineColor;
        progressBar.style.boxShadow = '0 0 10px rgba(99, 102, 241, 0.8)'; // Añadir resplandor para otras secciones
      }

      progressBar.style.transition = 'height 0.3s ease-out';
      progressBar.style.borderRadius = '4px';

      // Añadir la barra al contenedor
      progressContainer.appendChild(progressBar);

      // Añadir el contenedor a la sección
      section.appendChild(progressContainer);

      // Añadir un debug visual temporal que muestre la barra por 3 segundos
      progressContainer.style.border = '1px dashed yellow';
      setTimeout(() => {
        progressContainer.style.border = 'none';
      }, 3000);

      console.log(`Barra de progreso creada para ${sectionId} con circleOffset: ${circleOffset}px`);
    }

    // Función para actualizar la barra de progreso
    const updateProgressBar = () => {
      const bar = document.querySelector(
        `#${sectionId} #${sectionId && (sectionId.includes('hola-part3') || sectionId.includes('hola-part4')) ? 'timeline-progress-orange' : 'timeline-progress'}`
      );
      if (!bar) return;

      if (usePageScroll) {
        // Versión para scroll de página: calcular progreso basado en la posición de la sección en el viewport
        const sectionRect = section.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        // La posición relativa de la sección respecto al viewport
        const sectionTop = sectionRect.top;
        const sectionBottom = sectionRect.bottom;
        const sectionHeight = sectionRect.height;

        // Calcular el porcentaje de scroll
        let scrollPercent = 0;

        // Si la sección está completamente por encima del viewport
        if (sectionBottom <= 0) {
          scrollPercent = 100; // Completamente scrolleada
        }
        // Si la sección está completamente por debajo del viewport
        else if (sectionTop >= windowHeight) {
          scrollPercent = 0; // No scrolleada aún
        }
        // Si la sección está parcialmente visible
        else {
          // Porcentaje de la sección que ya ha pasado por la ventana
          // Ajustamos para que empiece a mostrar progreso cuando la sección entra en viewport
          const visiblePortion = Math.min(windowHeight, sectionBottom) - Math.max(0, sectionTop);
          const maxVisiblePortion = Math.min(windowHeight, sectionHeight);

          // El progreso es qué porción de la sección visible máxima está actualmente visible
          scrollPercent = Math.min(100, Math.max(0, (visiblePortion / maxVisiblePortion) * 100));

          // Amplificar el rango para que sea más visible
          scrollPercent = Math.max(5, Math.min(99, scrollPercent * 1.1));
        }

        // Aplicar el porcentaje calculado
        bar.style.height = `${scrollPercent}%`;

        // Añadir debug si es necesario
        const debugEl = document.getElementById('timeline-debug');
        if (debugEl) {
          debugEl.textContent = `${scrollPercent.toFixed(1)}%`;
        } else {
          // Crear un elemento de debug temporal
          const debugElement = document.createElement('div');
          debugElement.id = 'timeline-debug';
          debugElement.style.position = 'fixed';
          debugElement.style.top = '10px';
          debugElement.style.right = '10px';
          debugElement.style.background = 'rgba(0,0,0,0.7)';
          debugElement.style.color = 'white';
          debugElement.style.padding = '5px';
          debugElement.style.borderRadius = '4px';
          debugElement.style.fontSize = '12px';
          debugElement.style.zIndex = '9999';
          debugElement.textContent = `${scrollPercent.toFixed(1)}%`;
          document.body.appendChild(debugElement);

          // Remover después de 30 segundos
          setTimeout(() => {
            debugElement.remove();
          }, 30000);
        }
      } else {
        // Versión original para scroll interno
        const { scrollTop, scrollHeight, clientHeight } = section;
        const maxScroll = scrollHeight - clientHeight;
        const scrollPercent = maxScroll > 0 ? scrollTop / maxScroll : 0;
        const heightPercent = Math.min(100, Math.max(0, scrollPercent * 100));

        bar.style.height = `${heightPercent}%`;
      }
    };

    // Configurar el evento de scroll según el modo
    if (usePageScroll) {
      // Para scroll de página, escuchar el scroll global
      const handleGlobalScroll = () => {
        requestAnimationFrame(updateProgressBar);
      };

      window.addEventListener('scroll', handleGlobalScroll, { passive: true });
      window.addEventListener('resize', handleGlobalScroll, { passive: true });

      // Actualización inicial
      setTimeout(updateProgressBar, 100);
      // Y otra actualización después de un segundo para asegurarnos
      setTimeout(updateProgressBar, 1000);

      // Limpieza
      return () => {
        window.removeEventListener('scroll', handleGlobalScroll);
        window.removeEventListener('resize', handleGlobalScroll);
      };
    } else {
      // Para scroll interno, escuchar el scroll de la sección
      section.addEventListener('scroll', updateProgressBar);

      // Actualización inicial
      setTimeout(updateProgressBar, 100);

      // Limpieza
      return () => {
        section.removeEventListener('scroll', updateProgressBar);
      };
    }
  }, [ref, lineRef, sectionId, usePageScroll, lineColor, lineOffset]);

  // Función para crear y actualizar las animaciones de los elementos basada en scroll global
  const updateElementAnimations = (index, activate = true) => {
    if (index < 0 || index >= data.length) return;

    // Añadir log para debug de las secciones de Hola (Parte 3 y Parte 4)
    if (sectionId && (sectionId.includes('hola-part3') || sectionId.includes('hola-part4'))) {
      console.log(
        `Timeline ${sectionId}: ${activate ? 'Activando' : 'Desactivando'} elemento ${index}`
      );
    }

    // Función para obtener elementos por ID o clase
    const getElement = (selector) => document.querySelector(selector);

    // Elementos a animar
    const circleEl = getElement(`#timeline-circle-${index}`);
    const titleEl = getElement(`#timeline-title-${index}`);
    const mobileTitleEl = getElement(`#timeline-title-mobile-${index}`);
    const contentEl = getElement(`#timeline-content-${index}`);

    // Configuración según estado
    const config = activate
      ? {
          bg:
            sectionId && (sectionId.includes('hola-part3') || sectionId.includes('hola-part4'))
              ? '#22ff6c'
              : '#4f46e5',
          scale: 1.2,
          color: '#ffffff',
          weight: 700,
          opacity: 1,
          blur: 'blur(0px)', // Sin blur cuando está activo
          rotation: 0, // Sin rotación cuando está activo
          ease: 'back.out(1.7)',
        }
      : {
          bg: '#525252',
          scale: 1.0,
          color: '#737373',
          weight: 400,
          opacity: 0.5,
          blur: 'blur(12px)', // Aumentamos el blur cuando está inactivo
          rotation: 0, // Rotación ligera cuando está inactivo
          ease: 'power1.inOut',
        };

    // Animar elementos si existen
    if (circleEl) {
      // Gestionar la clase 'active' para permitir animaciones CSS
      if (activate) {
        circleEl.classList.add('active');
      } else {
        circleEl.classList.remove('active');
      }

      // Agregar un pequeño efecto de pulso para los círculos cuando se activan
      if (
        activate &&
        sectionId &&
        (sectionId.includes('hola-part3') || sectionId.includes('hola-part4'))
      ) {
        // Secuencia de animación especial para la sección hola-part3 y hola-part4
        gsap
          .timeline()
          .to(circleEl, {
            backgroundColor: config.bg,
            scale: 1.4, // Escala mayor para el efecto de pulso
            duration: 0.3,
            ease: 'power2.out',
            borderColor: '#65f0ff', // Color de borde específico para hola-part3/4
            boxShadow: '0 0 15px rgba(34, 255, 108, 0.8)', // Resplandor verde para hola-part3/4
          })
          .to(circleEl, {
            scale: config.scale, // Volver a escala normal
            duration: 0.2,
            ease: 'power2.in',
          });
      } else {
        // Animación estándar para otros casos
        gsap.to(circleEl, {
          backgroundColor: config.bg,
          scale: config.scale,
          duration: 0.4,
          ease: config.ease,
          borderColor: activate
            ? sectionId && (sectionId.includes('hola-part3') || sectionId.includes('hola-part4'))
              ? '#65f0ff'
              : '#a5b4fc'
            : '#6b7280',
          boxShadow: activate
            ? sectionId && (sectionId.includes('hola-part3') || sectionId.includes('hola-part4'))
              ? '0 0 12px rgba(34, 255, 108, 0.7)' // Resplandor verde para hola-part3/4
              : '0 0 12px rgba(99, 102, 241, 0.5)' // Resplandor indigo para otras secciones
            : 'none',
        });
      }
    }

    if (titleEl) {
      // Manejar clase active para CSS
      if (activate) {
        titleEl.classList.add('active');
      } else {
        titleEl.classList.remove('active');
      }

      gsap.to(titleEl, {
        color: config.color,
        fontWeight: config.weight,
        filter: config.blur, // Añadir o quitar blur
        rotation: config.rotation, // Aplicar rotación
        duration: 0.4,
      });
    }

    if (mobileTitleEl) {
      // Manejar clase active para CSS
      if (activate) {
        mobileTitleEl.classList.add('active');
      } else {
        mobileTitleEl.classList.remove('active');
      }

      gsap.to(mobileTitleEl, {
        color: config.color,
        fontWeight: config.weight,
        filter: config.blur, // Añadir o quitar blur
        rotation: config.rotation, // Aplicar rotación
        duration: 0.4,
      });
    }

    if (contentEl) {
      // Manejar clase active para CSS
      if (activate) {
        contentEl.classList.add('active');
      } else {
        contentEl.classList.remove('active');
      }

      gsap.to(contentEl, {
        opacity: config.opacity,
        filter: config.blur, // Añadir o quitar blur
        rotation: config.rotation, // Aplicar rotación
        duration: 0.4,
      });
    }
  };

  const renderHTML = (htmlContent) => {
    return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
  };

  return (
    <div
      className={cn('w-full dark:bg-transparent font-sans', className)}
      ref={containerRef}
      style={{ paddingLeft: `${lineOffset}px` }}
    >
      {/* Título y subtítulo */}
      {(title || subtitle) && (
        <div className="w-full mx-0 pt-[80px] pb-10 md:pt-[100px] md:pb-20 px-0" style={style}>
          {title && (
            <h2
              className={cn(
                'text-lg md:text-4xl mb-4 w-full font-bold',
                titleColor,
                titleClassName
              )}
            >
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-sm md:text-base lg:text-lg w-full pr-4">
              {/* Dividir el texto y aplicar el efecto solo a "inteligencia artificial RAG" */}
              {subtitle.includes('inteligencia artificial RAG') ? (
                <>
                  Te explicamos cómo, la{' '}
                  <GradientText
                    client:load={true}
                    className="animated-gradient-text inline"
                    // Usar los mismos colores verdes que la barra de progreso, ahora con rosa claro
                    colors={
                      sectionId &&
                      (sectionId.includes('hola-part3') || sectionId.includes('hola-part4'))
                        ? [
                            '#22ff6c',
                            '#ffb6c1', // Rosa claro (Light Pink)
                            'rgb(255, 225, 0)',
                            'rgb(0, 247, 255)',
                            'rgb(0, 247, 255)',
                            '#FF77FF', // Rosa claro (Light Pink)
                            '#22ff6c',
                          ]
                        : ['#9C8AC0', '#78A8D6', '#ACDED8', '#ED645A', '#FF8C00']
                    }
                    darkModeColors={
                      sectionId &&
                      (sectionId.includes('hola-part3') || sectionId.includes('hola-part4'))
                        ? [
                            '#22ff6c',
                            '#ffb6c1', // Rosa claro (Light Pink)
                            '#65f0ff',
                            'rgb(0, 247, 255)',
                            '#ffb6c1', // Rosa claro (Light Pink)
                            '#22ff6c',
                          ]
                        : ['#9C8AC0', '#78A8D6', '#ACDED8', '#ED645A', '#FF8C00']
                    }
                    animationSpeed={8.5} // Aumentar la velocidad de animación (valor por defecto es 1)
                    showShimmer={true}
                    shimmerIntensity="low"
                    shimmerSpeed={2.0} // Aumentar también la velocidad del brillo
                    enhancedContrast={false}
                  >
                    inteligencia artificial RAG
                  </GradientText>{' '}
                  es el estándar{' '}
                  <span
                    style={{
                      display: 'inline-block',
                      transform: 'rotate(-3deg)',
                      fontStyle: 'italic',
                      fontWeight: 'bold',
                      color: 'rgb(0, 247, 255)',
                      textShadow: '0 0 3px rgba(192, 192, 134, 0.7)',
                    }}
                  >
                    low-cost
                  </span>{' '}
                  que debes implementar en tus operaciones.
                </>
              ) : (
                subtitle
              )}
            </p>
          )}
        </div>
      )}

      {/* Espaciado superior */}
      <div className="h-[10vh]"></div>

      {/* Contenido principal del timeline que será visible con scroll global o interno */}
      <div
        ref={ref}
        className={`relative w-full mx-0 pb-20 ${usePageScroll ? 'use-page-scroll' : ''}`}
        style={usePageScroll ? { overflow: 'visible' } : {}}
      >
        {data.map((item, index) => (
          <div
            key={index}
            className={`flex justify-start ${
              sectionId && (sectionId.includes('hola-part3') || sectionId.includes('hola-part4'))
                ? 'pt-32 md:pt-60' // Más espacio vertical para hola-part3 y hola-part4
                : 'pt-20 md:pt-40' // Espaciado normal para otras secciones
            } md:gap-0 timeline-item timeline-item-${index}`}
            ref={(el) => (itemRefs.current[index] = el)}
          >
            {/* Círculo del timeline (siempre visible) */}
            <div
              className={`h-10 absolute left-0 w-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center z-40 ${
                sectionId && (sectionId.includes('hola-part3') || sectionId.includes('hola-part4'))
                  ? 'timeline-circle-container'
                  : ''
              }${usePageScroll ? ' page-scroll-circle' : ''}`}
            >
              <div
                id={`timeline-circle-${index}`}
                className={cn(
                  'h-4 w-4 rounded-full transition-all duration-300',
                  index <= activeIndex
                    ? sectionId &&
                      (sectionId.includes('hola-part3') || sectionId.includes('hola-part4'))
                      ? 'bg-[#22ff6c] border-[#65f0ff]'
                      : 'bg-indigo-500 dark:bg-indigo-400 border-indigo-300'
                    : 'bg-neutral-400 dark:bg-neutral-600 border-neutral-500',
                  'border-2'
                )}
                data-index={index}
                style={{
                  boxShadow:
                    index <= activeIndex
                      ? sectionId &&
                        (sectionId.includes('hola-part3') || sectionId.includes('hola-part4'))
                        ? '0 0 12px rgba(34, 255, 108, 0.7)'
                        : '0 0 12px rgba(99, 102, 241, 0.5)'
                      : 'none',
                }}
              />
            </div>

            {/* Título (responsive - solo visible en desktop a la izquierda) */}
            <div
              className={`hidden md:block w-[30%] pr-6 z-40 self-start ${
                usePageScroll ? '' : 'sticky top-40'
              }`}
            >
              <h3
                id={`timeline-title-${index}`}
                className={cn(
                  'text-xl md:pl-16 md:text-5xl font-bold transition-all duration-300',
                  index <= activeIndex ? 'text-white' : 'text-neutral-500'
                )}
                data-index={index}
              >
                {item.title}
              </h3>
            </div>

            {/* Contenido principal (ocupa todo el ancho en móviles, 70% en desktop) */}
            <div className="relative w-full md:w-[70%] pl-16 pr-4">
              {/* Título móvil - solo visible en móviles */}
              <div className="md:hidden mb-4">
                <h3
                  id={`timeline-title-mobile-${index}`}
                  className={cn(
                    'text-2xl font-bold transition-colors duration-300',
                    index <= activeIndex ? 'text-white' : 'text-neutral-500'
                  )}
                  data-index={index}
                >
                  {item.title}
                </h3>
              </div>

              {/* Contenido principal */}
              <div
                id={`timeline-content-${index}`}
                className={cn(
                  'transition-opacity duration-500',
                  index <= activeIndex ? 'opacity-100' : 'opacity-50'
                )}
                data-index={index}
              >
                {/* Fecha al inicio del contenido */}
                {item.date && (
                  <div className="mb-4">
                    <span className={cn('text-xl font-semibold', dateColor)}>{item.date}</span>
                  </div>
                )}

                {typeof item.content === 'string' ? renderHTML(item.content) : item.content}
              </div>
            </div>
          </div>
        ))}

        {/* La barra de progreso se inyecta dinámicamente */}
      </div>

      {/* Espaciado inferior */}
      <div className="h-[10vh]"></div>
    </div>
  );
};
