import { useEffect, useRef } from 'react';
import { initGsap, animateElement } from '../../utils/animations/gsap-animations';

/**
 * Componente para manejar las animaciones de la sección hero con GSAP
 * Este componente no renderiza nada visible, solo se encarga de las animaciones
 */
export default function HeroAnimations() {
  const initialized = useRef(false);

  useEffect(() => {
    // Solo inicializa GSAP y las animaciones si no se ha hecho ya
    if (!initialized.current) {
      const setupAnimations = async () => {
        // Inicializar GSAP solo cuando este componente se monta
        const gsapReady = await initGsap();

        if (gsapReady) {
          // Animar elementos del hero usando selectores específicos
          animateElement('.hero-text-container .phrase-container', {
            y: 50,
            opacity: 0,
            duration: 0.8,
            stagger: 0.2,
            ease: 'power2.out',
          });

          animateElement('.skills-text', {
            y: 30,
            opacity: 0,
            duration: 0.8,
            delay: 0.6,
            ease: 'back.out',
          });

          animateElement('.hero-gradient-text', {
            y: 40,
            opacity: 0,
            duration: 1,
            delay: 0.8,
            ease: 'power3.out',
          });
        }
      };

      setupAnimations();
      initialized.current = true;
    }
  }, []);

  // Este componente no renderiza nada visible
  return null;
}
