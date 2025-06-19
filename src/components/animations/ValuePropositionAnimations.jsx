import { useEffect, useRef } from 'react';
import { initGsap, createScrollAnimation } from '../../utils/animations/gsap-animations';

/**
 * Componente para manejar las animaciones de la sección de propuesta de valor con GSAP
 * Este componente no renderiza nada visible, solo se encarga de las animaciones
 */
export default function ValuePropositionAnimations() {
  const initialized = useRef(false);

  useEffect(() => {
    // Solo inicializa GSAP y las animaciones si no se ha hecho ya
    if (!initialized.current) {
      const setupAnimations = async () => {
        // Inicializar GSAP solo cuando este componente se monta
        const gsapReady = await initGsap();

        if (gsapReady) {
          // Animar la sección de propuesta de valor con scroll trigger
          createScrollAnimation(
            '.value-proposition-section',
            {
              y: 60,
              opacity: 0,
              duration: 1,
              ease: 'power2.out',
            },
            {
              trigger: '.value-proposition-section',
              start: 'top 80%',
              end: 'bottom 20%',
              toggleActions: 'play none none reverse',
            }
          );
        }
      };

      setupAnimations();
      initialized.current = true;
    }
  }, []);

  // Este componente no renderiza nada visible
  return null;
}
