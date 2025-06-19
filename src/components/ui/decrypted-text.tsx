'use client';
import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface DecryptedTextProps {
  text: string;
  speed?: number;
  maxIterations?: number;
  sequential?: boolean;
  revealDirection?: 'start' | 'end' | 'center';
  useOriginalCharsOnly?: boolean;
  characters?: string;
  className?: string;
  encryptedClassName?: string;
  parentClassName?: string;
  animateOn?: 'view' | 'hover';
  cyberpunkColors?: boolean;
  [key: string]: any;
}

// Paleta de colores ciberpunk neón
const CYBERPUNK_COLORS = [
  'text-[#00FFFF]', // cyan
  'text-[#FF00FF]', // magenta
  'text-[#FF3366]', // rosa neón
  'text-[#14F195]', // verde neón
  'text-[#FFD300]', // amarillo neón
  'text-[#FF6600]', // naranja neón
  'text-[#FF0055]', // fucsia
  'text-[#00DDFF]', // azul eléctrico
  'text-[#00FF66]', // verde lima
  'text-[#FF00AA]', // rosa brillante
];

// Lista de emojis por defecto para la animación
const DEFAULT_EMOJI_CHARS = '🚀💡🔥✨🌟🔮⚡️💫🌈🛠️👨‍💻🧠💾🎮🎯🔧🔍💪🧩🎲🧪';

export default function DecryptedText({
  text,
  speed = 100,
  maxIterations = 30,
  sequential = false,
  revealDirection = 'start',
  useOriginalCharsOnly = false,
  characters = '1234567890qwertyuiopasdfghjklñzxcvbnm,✓✗★☆■□▲▼►◄●○♦♠♥♣!?$%&#@+-*/=' +
    DEFAULT_EMOJI_CHARS,
  className = '',
  parentClassName = '',
  encryptedClassName = '',
  animateOn = 'hover',
  cyberpunkColors = true,
  ...props
}: DecryptedTextProps) {
  const [displayText, setDisplayText] = useState<string>(text);
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const [isScrambling, setIsScrambling] = useState<boolean>(false);
  const [revealedIndices, setRevealedIndices] = useState<Set<number>>(new Set());
  const [hasAnimated, setHasAnimated] = useState<boolean>(false);
  const containerRef = useRef<HTMLSpanElement>(null);

  // Estado para guardar colores aleatorios para cada posición
  const [charColors, setCharColors] = useState<string[]>([]);

  // Generar colores aleatorios para cada carácter
  useEffect(() => {
    if (cyberpunkColors) {
      const colors = Array(text.length)
        .fill('')
        .map(() => CYBERPUNK_COLORS[Math.floor(Math.random() * CYBERPUNK_COLORS.length)]);
      setCharColors(colors);
    }
  }, [text.length, cyberpunkColors]);

  // Función para obtener un carácter aleatorio, incluido soporte mejorado para emojis
  const getRandomChar = (availableChars: string[], excludeSpaces: boolean = true) => {
    // Si no hay caracteres disponibles, devuelve un carácter básico
    if (!availableChars.length) return '?';

    // Selecciona un carácter aleatorio de los disponibles
    return availableChars[Math.floor(Math.random() * availableChars.length)];
  };

  // Preprocesar caracteres para dividirlos correctamente, incluyendo emojis
  const preprocessCharactersList = (charStr: string): string[] => {
    // Usa el iterador de segmentos de grafemas para dividir correctamente, incluidos emojis
    return Array.from(charStr);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let currentIteration = 0;

    const getNextIndex = (revealedSet: Set<number>): number => {
      const textLength = text.length;
      switch (revealDirection) {
        case 'start':
          return revealedSet.size;
        case 'end':
          return textLength - 1 - revealedSet.size;
        case 'center': {
          const middle = Math.floor(textLength / 2);
          const offset = Math.floor(revealedSet.size / 2);
          const nextIndex = revealedSet.size % 2 === 0 ? middle + offset : middle - offset - 1;

          if (nextIndex >= 0 && nextIndex < textLength && !revealedSet.has(nextIndex)) {
            return nextIndex;
          }
          for (let i = 0; i < textLength; i++) {
            if (!revealedSet.has(i)) return i;
          }
          return 0;
        }
        default:
          return revealedSet.size;
      }
    };

    // Dividir los caracteres de manera correcta, incluyendo emojis
    const availableChars = useOriginalCharsOnly
      ? Array.from(new Set(Array.from(text).filter((char) => char !== ' ')))
      : preprocessCharactersList(characters);

    const shuffleText = (originalText: string, currentRevealed: Set<number>): string => {
      // Dividir el texto correctamente para manejar emojis
      const originalChars = Array.from(originalText);

      if (useOriginalCharsOnly) {
        const positions = originalChars.map((char, i) => ({
          char,
          isSpace: char === ' ',
          index: i,
          isRevealed: currentRevealed.has(i),
        }));

        const nonSpaceChars = positions
          .filter((p) => !p.isSpace && !p.isRevealed)
          .map((p) => p.char);

        for (let i = nonSpaceChars.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [nonSpaceChars[i], nonSpaceChars[j]] = [nonSpaceChars[j], nonSpaceChars[i]];
        }

        let charIndex = 0;
        return positions
          .map((p) => {
            if (p.isSpace) return ' ';
            if (p.isRevealed) return originalChars[p.index];
            return nonSpaceChars[charIndex++] || getRandomChar(availableChars);
          })
          .join('');
      } else {
        return originalChars
          .map((char, i) => {
            if (char === ' ') return ' ';
            if (currentRevealed.has(i)) return originalChars[i];
            return getRandomChar(availableChars);
          })
          .join('');
      }
    };

    if (isHovering) {
      setIsScrambling(true);
      interval = setInterval(() => {
        // Rotar los colores ciberpunk para dar efecto de parpadeo
        if (cyberpunkColors) {
          setCharColors((prevColors) =>
            prevColors.map(
              () => CYBERPUNK_COLORS[Math.floor(Math.random() * CYBERPUNK_COLORS.length)]
            )
          );
        }

        setRevealedIndices((prevRevealed) => {
          if (sequential) {
            if (prevRevealed.size < text.length) {
              const nextIndex = getNextIndex(prevRevealed);
              const newRevealed = new Set(prevRevealed);
              newRevealed.add(nextIndex);
              setDisplayText(shuffleText(text, newRevealed));
              return newRevealed;
            } else {
              clearInterval(interval);
              setIsScrambling(false);
              return prevRevealed;
            }
          } else {
            setDisplayText(shuffleText(text, prevRevealed));
            currentIteration++;
            if (currentIteration >= maxIterations) {
              clearInterval(interval);
              setIsScrambling(false);
              setDisplayText(text);
            }
            return prevRevealed;
          }
        });
      }, speed);
    } else {
      setDisplayText(text);
      setRevealedIndices(new Set());
      setIsScrambling(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [
    isHovering,
    text,
    speed,
    maxIterations,
    sequential,
    revealDirection,
    characters,
    useOriginalCharsOnly,
    cyberpunkColors,
  ]);

  useEffect(() => {
    if (animateOn !== 'view') return;

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !hasAnimated) {
          setIsHovering(true);
          setHasAnimated(true);
        }
      });
    };

    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1,
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    const currentRef = containerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [animateOn, hasAnimated]);

  const hoverProps =
    animateOn === 'hover'
      ? {
          onMouseEnter: () => setIsHovering(true),
          onMouseLeave: () => setIsHovering(false),
        }
      : {};

  // Dividir el texto para renderizar, asegurando soporte para emojis
  const displayChars = Array.from(displayText);

  return (
    <motion.span
      ref={containerRef}
      className={`inline-block whitespace-pre-wrap ${parentClassName}`}
      {...hoverProps}
      {...props}
    >
      <span className="sr-only">{displayText}</span>

      <span aria-hidden="true">
        {displayChars.map((char, index) => {
          const isRevealedOrDone = revealedIndices.has(index) || !isScrambling || !isHovering;

          // Aplicar color ciberpunk aleatorio si está activado o usar clase regular
          const charColorClass =
            cyberpunkColors && !isRevealedOrDone
              ? charColors[index % charColors.length]
              : isRevealedOrDone
                ? className
                : encryptedClassName;

          return (
            <span key={index} className={charColorClass}>
              {char}
            </span>
          );
        })}
      </span>
    </motion.span>
  );
}
