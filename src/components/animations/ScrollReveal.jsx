import { useEffect, useRef, useMemo, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

import './ScrollReveal.css';

gsap.registerPlugin(ScrollTrigger);

const ScrollReveal = ({
  children,
  scrollContainerRef = null,
  enableBlur = true,
  baseOpacity = 0.1,
  baseRotation = 3,
  blurStrength = 4,
  containerClassName = '',
  textClassName = '',
  rotationEnd = 'bottom center',
  wordAnimationEnd = 'bottom center',
}) => {
  const containerRef = useRef(null);
  const wordsRef = useRef([]);
  const [inView, setInView] = useState(false);
  const [gsapInitialized, setGsapInitialized] = useState(false);
  const animationsRef = useRef([]);

  const splitText = useMemo(() => {
    const text = typeof children === 'string' ? children : '';
    return text.split(/(\s+)/).map((word, index) => {
      if (word.match(/^\s+$/)) return word;
      return (
        <span
          className="word"
          key={index}
          ref={(el) => {
            if (el) wordsRef.current[index] = el;
          }}
          style={{
            '--word-index': index,
            // Aplicar estilos iniciales directamente para asegurar estado visual correcto
            opacity: baseOpacity,
            filter: enableBlur ? `blur(${blurStrength}px)` : 'none',
            transform: 'translateY(20px) scale(0.95)',
          }}
        >
          {word}
        </span>
      );
    });
  }, [children, baseOpacity, enableBlur, blurStrength]);

  // Limpiar animaciones previas
  const cleanupGSAP = () => {
    // Limpiar animaciones GSAP existentes
    if (animationsRef.current.length) {
      animationsRef.current.forEach((animation) => {
        if (animation.scrollTrigger) {
          animation.scrollTrigger.kill();
        }
        animation.kill();
      });
      animationsRef.current = [];
    }

    // Limpiar ScrollTriggers directamente
    ScrollTrigger.getAll().forEach((trigger) => {
      if (trigger.vars.trigger === containerRef.current) {
        trigger.kill();
      }
    });
  };

  // Configurar las animaciones GSAP
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Limpieza previa
    cleanupGSAP();

    // Asegurarse que el container tenga el estado inicial
    gsap.set(container, {
      rotation: baseRotation,
      transformOrigin: '0% 50%',
    });

    // Asegurarse que las palabras tengan el estado inicial
    const wordElements = wordsRef.current.filter(Boolean);
    gsap.set(wordElements, {
      opacity: baseOpacity,
      y: 20,
      scale: 0.95,
      filter: enableBlur ? `blur(${blurStrength}px)` : 'none',
    });

    // Esperar un momento para que la página se estabilice
    const initTimeout = setTimeout(() => {
      // Crear ScrollTrigger para rotación
      const rotationAnimation = gsap.to(container, {
        rotation: 0,
        ease: 'power1.out',
        scrollTrigger: {
          trigger: container,
          start: 'top bottom-=100',
          end: 'bottom center',
          toggleActions: 'play none none reverse', // Importante!
          scrub: 1.5, // Suavizado para seguir el scroll
          onEnter: () => {
            console.log('ScrollReveal: Container entering viewport', container);
            setInView(true);
          },
          onLeaveBack: () => {
            console.log('ScrollReveal: Container leaving viewport backwards');
            setInView(false);
          },
          markers: false,
        },
      });

      // Crear ScrollTrigger para palabras
      const wordAnimation = gsap.to(wordElements, {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: 'blur(0px)',
        stagger: 0.05,
        duration: 1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: container,
          start: 'top bottom-=100',
          end: 'center center',
          toggleActions: 'play none none reverse', // Importante!
          scrub: false, // No queremos scrub para las palabras
          onEnter: () => {
            console.log('ScrollReveal: Words animation triggered');
          },
          markers: false,
        },
      });

      // Guardar referencias para limpieza
      animationsRef.current = [rotationAnimation, wordAnimation];
      setGsapInitialized(true);

      console.log('ScrollReveal: GSAP initialized for', container);
    }, 500); // Pequeño retraso para evitar problemas con la carga inicial

    return () => {
      clearTimeout(initTimeout);
      cleanupGSAP();
    };
  }, [baseOpacity, baseRotation, blurStrength, enableBlur]);

  return (
    <h2
      ref={containerRef}
      className={`scroll-reveal ${inView ? 'in-view' : ''} ${containerClassName}`}
      data-rotation={baseRotation}
      data-opacity={baseOpacity}
      data-blur={blurStrength}
    >
      <p className={`scroll-reveal-text ${textClassName}`}>{splitText}</p>
    </h2>
  );
};

export default ScrollReveal;
