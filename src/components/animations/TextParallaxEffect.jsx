import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

/**
 * Componente para crear un efecto de parallax sincronizado con el scroll para los textos SOMOS, AGENTE y RAG
 * usando GSAP y ScrollTrigger
 */
export default function TextParallaxEffect({ sectionId = 'hola-part2' }) {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;

    const setupParallaxEffects = async () => {
      // Registrar ScrollTrigger con GSAP
      gsap.registerPlugin(ScrollTrigger);

      // Esperar un momento para asegurarnos de que los elementos estén renderizados
      setTimeout(() => {
        // Seleccionar la sección y los textos
        const section = document.getElementById(sectionId);
        if (!section) {
          console.error(`La sección con ID ${sectionId} no fue encontrada`);
          return;
        }

        // Configurar los elementos para el efecto parallax
        const somosText = document.getElementById('somos-text');
        const agenteText = document.getElementById('agente-text');
        const ragText = document.getElementById('rag-text');

        // También obtener la descripción para evitar superposición
        const descriptionBox = agenteText?.closest('.grid-row')?.querySelector('.description-box');

        // Detectar si estamos en móvil
        const isMobile = window.innerWidth < 768;

        console.log('TextParallaxEffect - Elementos:', {
          section: !!section,
          somosText: !!somosText,
          agenteText: !!agenteText,
          ragText: !!ragText,
          descriptionBox: !!descriptionBox,
          isMobile,
        });

        if (somosText && agenteText && ragText) {
          // Inicialmente los textos están completamente visibles
          gsap.set(somosText, { opacity: 1, x: 0 });
          gsap.set(agenteText, { opacity: 1, x: 0 });
          gsap.set(ragText, { opacity: 1, x: 0 });

          // Calcular un límite seguro para el texto "Agente" para evitar superposición
          // Este límite previene que el texto se mueva demasiado hacia la derecha (solo en escritorio)
          let agenteMaxOffset = 120; // Valor original completo para móvil

          if (!isMobile && descriptionBox) {
            // Solo en escritorio, calculamos un límite que evite superposición
            const agenteRect = agenteText.getBoundingClientRect();
            const descRect = descriptionBox.getBoundingClientRect();

            // El límite es la distancia entre el borde derecho del texto "Agente"
            // y el borde izquierdo de la descripción, menos un margen de seguridad
            const availableSpace = Math.max(20, descRect.left - agenteRect.right - 30);
            agenteMaxOffset = Math.min(agenteMaxOffset, availableSpace);
            console.log('Limite de desplazamiento para AGENTE (escritorio):', agenteMaxOffset);
          } else {
            console.log('En móvil: usando desplazamiento completo para AGENTE');
          }

          // Un único ScrollTrigger que controla todo el efecto parallax
          ScrollTrigger.create({
            trigger: section,
            // Puntos de inicio y fin más amplios para un efecto más suave
            start: 'top 90%', // Comienza cuando el tope de la sección está en el 90% de la ventana (casi entrando)
            end: 'bottom 10%', // Termina cuando el fondo está en el 10% (casi saliendo)
            scrub: 1, // Valor de suavizado (1 = suave, 0 = inmediato)
            markers: false, // Desactivar marcadores para evitar confusión con los del optimizador de cursores
            id: 'parallax-effect', // ID único para este ScrollTrigger
            onUpdate: (self) => {
              // Calcular la posición relativa dentro de la sección
              // 0 = apenas entrando, 0.5 = a la mitad, 1 = casi saliendo
              const progress = self.progress;

              // Crear una curva de efecto más controlada para AGENTE (solo en escritorio)
              // Esta función ajustada hace que el movimiento se detenga antes
              const createControlledCurve = (progress, threshold = 0.3) => {
                if (isMobile) {
                  // En móvil, usar la curva estándar sin limitación
                  return 1 - progress * 2;
                }

                if (progress <= threshold) {
                  // En la primera parte, usar una curva normal
                  return 1 - progress / threshold;
                } else {
                  // Después del umbral, mantener la posición estable (0)
                  return 0;
                }
              };

              // Determinar si estamos en la primera mitad (entrando) o segunda mitad (saliendo)
              const isEntering = progress < 0.5;

              // Calcular efecto para cada texto basado en si estamos entrando o saliendo
              if (isEntering) {
                // Efecto al entrar: textos vienen desde fuera hacia su posición
                const somosEntryEffect = 1 - progress * 2; // 1->0 mientras entramos
                const agenteEntryEffect = isMobile
                  ? somosEntryEffect
                  : createControlledCurve(progress); // Usar curva estándar en móvil
                const ragEntryEffect = 1 - progress * 2; // 1->0 mientras entramos

                gsap.to(somosText, {
                  x: somosEntryEffect * 100,
                  opacity: 1 - somosEntryEffect * 0.5, // No oscurecer completamente
                  duration: 0,
                  overwrite: 'auto',
                });

                gsap.to(agenteText, {
                  // En móvil, usar el efecto completo; en escritorio, limitar
                  x: -agenteEntryEffect * (isMobile ? 120 : agenteMaxOffset),
                  opacity: 1 - agenteEntryEffect * (isMobile ? 0.5 : 0.3), // Efecto completo en móvil
                  duration: 0,
                  overwrite: 'auto',
                });

                gsap.to(ragText, {
                  x: ragEntryEffect * 150,
                  opacity: 1 - ragEntryEffect * 0.5,
                  duration: 0,
                  overwrite: 'auto',
                });
              } else {
                // Efecto al salir: textos se desplazan hacia fuera desde su posición
                const exitEffect = (progress - 0.5) * 2; // 0->1 mientras salimos

                gsap.to(somosText, {
                  x: exitEffect * -100,
                  opacity: 1 - exitEffect * 0.5,
                  duration: 0,
                  overwrite: 'auto',
                });

                // Para el texto "Agente" al salir, aplicamos diferentes límites según el dispositivo
                gsap.to(agenteText, {
                  // En móvil usar el efecto completo, en escritorio limitar
                  x: exitEffect * (isMobile ? 120 : Math.min(agenteMaxOffset, 40)),
                  opacity: 1 - exitEffect * (isMobile ? 0.5 : 0.3),
                  duration: 0,
                  overwrite: 'auto',
                });

                gsap.to(ragText, {
                  x: exitEffect * -150,
                  opacity: 1 - exitEffect * 0.5,
                  duration: 0,
                  overwrite: 'auto',
                });
              }
            },
          });

          console.log('TextParallaxEffect - Configuración completada (versión optimizada)');
          initialized.current = true;
        }
      }, 500);
    };

    // Ejecutar la configuración de los efectos de parallax
    setupParallaxEffects();

    // Limpiar los ScrollTriggers cuando el componente se desmonte
    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill(true));
    };
  }, [sectionId]);

  // Este componente no renderiza nada visible, solo aplica efectos
  return null;
}
