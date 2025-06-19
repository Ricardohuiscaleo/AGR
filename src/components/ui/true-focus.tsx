'use client';
import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { motion } from 'framer-motion';

interface TrueFocusProps {
  sentence?: string;
  manualMode?: boolean;
  blurAmount?: number;
  borderColor?: string;
  glowColor?: string;
  animationDuration?: number;
  pauseBetweenAnimations?: number;
  className?: string;
  initialAnimation?: boolean; // Nueva prop para controlar la animación inicial
}

interface FocusRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

const TrueFocus: React.FC<TrueFocusProps> = ({
  sentence = 'True Focus',
  manualMode = false,
  blurAmount = 5,
  borderColor = 'green',
  glowColor = 'rgba(0, 255, 0, 0.6)',
  animationDuration = 0.5,
  pauseBetweenAnimations = 1,
  className = '',
  initialAnimation = true, // Por defecto, realizar la animación inicial
}) => {
  const words = sentence.split(' ');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [lastActiveIndex, setLastActiveIndex] = useState<number | null>(null);
  const [showAllWords, setShowAllWords] = useState<boolean>(false); // Estado para mostrar todas las palabras
  const [initialAnimationComplete, setInitialAnimationComplete] = useState<boolean>(false);
  const containerRef: RefObject<HTMLDivElement> = useRef(null);
  const wordRefs: React.MutableRefObject<(HTMLSpanElement | null)[]> = useRef([]);
  const [focusRect, setFocusRect] = useState<FocusRect>({ x: 0, y: 0, width: 0, height: 0 });

  // Animación inicial que recorre todas las palabras y luego las muestra todas
  useEffect(() => {
    if (initialAnimation && !initialAnimationComplete) {
      // Primero, recorrer todas las palabras una por una
      let currentWordIndex = 0;

      const animateWords = () => {
        if (currentWordIndex < words.length) {
          setCurrentIndex(currentWordIndex);
          currentWordIndex++;
          // Aumentado en un 30% (de 300ms a 390ms adicionales)
          setTimeout(animateWords, animationDuration * 1000 + 390);
        } else {
          // Después de mostrar la última palabra, mostrar todas
          // Aumentado en un 30% (de 500ms a 650ms)
          setTimeout(() => {
            setShowAllWords(true);
            setInitialAnimationComplete(true);

            // Después de un tiempo, regresar al modo normal si no está en modo manual
            if (!manualMode) {
              // Aumentado en un 30% (de 2000ms a 2600ms)
              setTimeout(() => {
                setShowAllWords(false);
                // Iniciar ciclo normal
                setCurrentIndex(0);
              }, 2600);
            }
          }, 650);
        }
      };

      // Iniciar la animación
      animateWords();
    }
  }, [initialAnimation, words.length, animationDuration, manualMode]);

  // Ciclo automático normal (solo si no está en modo manual y la animación inicial ya terminó)
  useEffect(() => {
    if (!manualMode && initialAnimationComplete && !showAllWords) {
      const interval = setInterval(
        () => {
          setCurrentIndex((prev) => (prev + 1) % words.length);
        },
        (animationDuration + pauseBetweenAnimations) * 1000
      );

      return () => clearInterval(interval);
    }
  }, [
    manualMode,
    initialAnimationComplete,
    showAllWords,
    animationDuration,
    pauseBetweenAnimations,
    words.length,
  ]);

  // Efecto para calcular el rectángulo de enfoque
  useEffect(() => {
    if (showAllWords) {
      // Si estamos mostrando todas las palabras, calcular un rectángulo que abarque todas
      if (!containerRef.current || wordRefs.current.length === 0) return;

      const parentRect = containerRef.current.getBoundingClientRect();

      // Encontrar los límites extremos de todas las palabras
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;

      wordRefs.current.forEach((wordRef) => {
        if (!wordRef) return;

        const rect = wordRef.getBoundingClientRect();
        minX = Math.min(minX, rect.left - parentRect.left);
        minY = Math.min(minY, rect.top - parentRect.top);
        maxX = Math.max(maxX, rect.right - parentRect.left);
        maxY = Math.max(maxY, rect.bottom - parentRect.top);
      });

      // Establecer un rectángulo que abarque todas las palabras
      setFocusRect({
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
      });
    } else if (currentIndex !== null && currentIndex !== -1) {
      // Enfoque normal para una sola palabra
      if (!wordRefs.current[currentIndex] || !containerRef.current) return;

      const parentRect = containerRef.current.getBoundingClientRect();
      const activeRect = wordRefs.current[currentIndex]!.getBoundingClientRect();

      setFocusRect({
        x: activeRect.left - parentRect.left,
        y: activeRect.top - parentRect.top,
        width: activeRect.width,
        height: activeRect.height,
      });
    }
  }, [currentIndex, words.length, showAllWords]);

  // Handlers for manual mode (hover)
  const handleMouseEnter = (index: number) => {
    if (manualMode) {
      setLastActiveIndex(index);
      setCurrentIndex(index);
      setShowAllWords(false); // Desactivar el modo "mostrar todo" al interactuar
    }
  };

  const handleMouseLeave = () => {
    if (manualMode) {
      setCurrentIndex(lastActiveIndex ?? 0);
    }
  };

  // Handler para activar/desactivar el modo "mostrar todo" al hacer clic en el contenedor
  const handleContainerClick = () => {
    if (manualMode) {
      setShowAllWords((prev) => !prev);
    }
  };

  return (
    <div
      className={`focus-container ${className}`}
      ref={containerRef}
      onClick={handleContainerClick}
    >
      {words.map((word, index) => {
        const isActive = showAllWords || index === currentIndex;
        return (
          <span
            key={index}
            ref={(el) => {
              wordRefs.current[index] = el;
            }}
            className={`focus-word ${manualMode ? 'manual' : ''} ${
              (isActive && !manualMode) || showAllWords ? 'active' : ''
            }`}
            style={
              {
                filter: showAllWords
                  ? 'blur(0px)'
                  : manualMode
                    ? isActive
                      ? `blur(0px)`
                      : `blur(${blurAmount}px)`
                    : isActive
                      ? `blur(0px)`
                      : `blur(${blurAmount}px)`,
                transition: `filter ${animationDuration}s ease`,
                '--border-color': borderColor,
                '--glow-color': glowColor,
              } as React.CSSProperties
            }
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
          >
            {word}
          </span>
        );
      })}

      <motion.div
        className="focus-frame"
        animate={{
          x: focusRect.x,
          y: focusRect.y,
          width: focusRect.width,
          height: focusRect.height,
          opacity: currentIndex >= 0 || showAllWords ? 1 : 0,
          scale: 1, // Eliminada la escala, siempre es 1
        }}
        transition={{
          duration: animationDuration,
          scale: {
            duration: 0.3,
            ease: 'easeOut',
          },
        }}
        style={
          {
            '--border-color': borderColor,
            '--glow-color': glowColor,
          } as React.CSSProperties
        }
      >
        <span className="corner top-left"></span>
        <span className="corner top-right"></span>
        <span className="corner bottom-left"></span>
        <span className="corner bottom-right"></span>
      </motion.div>
    </div>
  );
};

export default TrueFocus;
