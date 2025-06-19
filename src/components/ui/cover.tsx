'use client';
import React, { useEffect, useId, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';

export const Cover = ({
  children,
  className,
  autoAnimate = false,
  permanentEffect = false,
}: {
  children?: React.ReactNode;
  className?: string;
  autoAnimate?: boolean;
  permanentEffect?: boolean;
}) => {
  const [hovered, setHovered] = useState(autoAnimate || permanentEffect);
  const [animationPhase, setAnimationPhase] = useState(0); // 0: inicial, 1: reduciendo, 2: velocidad
  const ref = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const [beamPositions, setBeamPositions] = useState<number[]>([]);

  useEffect(() => {
    if (ref.current) {
      setContainerWidth(ref.current?.clientWidth ?? 0);
      setContainerHeight(ref.current?.clientHeight ?? 0);
      const height = ref.current?.clientHeight ?? 0;
      const numberOfBeams = Math.floor(height / 7);
      const positions = Array.from(
        { length: numberOfBeams },
        (_, i) => (i + 1) * (height / (numberOfBeams + 1))
      );
      setBeamPositions(positions);
    }

    // Control de las fases de animación
    if (permanentEffect || autoAnimate) {
      setHovered(true);

      // Fase 1: Inicio y reducción gradual (durante los primeros 3 segundos)
      const phase1Timeout = setTimeout(() => {
        setAnimationPhase(1);
      }, 100);

      // Fase 2: Mantener tamaño pequeño y aumentar velocidad (después de 3 segundos)
      const phase2Timeout = setTimeout(() => {
        setAnimationPhase(2);
      }, 3000);

      return () => {
        clearTimeout(phase1Timeout);
        clearTimeout(phase2Timeout);
      };
    }
  }, [autoAnimate, permanentEffect, ref.current]);

  // Determinar los valores de las animaciones según la fase actual
  const getScaleAnimation = () => {
    // Siempre devuelve 1 para mantener el tamaño original sin reducción
    return 1;
  };

  const getMovementAmplitude = () => {
    if (!hovered) return 0;

    switch (animationPhase) {
      case 0: // Fase inicial
        return 2; // Movimiento sutil al inicio
      case 1: // Fase de reducción
        return 3.5; // Movimiento moderado
      case 2: // Fase de velocidad
        return 5; // Movimiento aumentado para efecto de velocidad
      default:
        return 0;
    }
  };

  const getMovementDuration = () => {
    if (!hovered) return 3;

    switch (animationPhase) {
      case 0: // Fase inicial
        return 3; // Normal
      case 1: // Fase de reducción
        return 2.5; // Algo más rápido
      case 2: // Fase de velocidad
        return 1.8; // Más rápido para efecto de velocidad
      default:
        return 3;
    }
  };

  const amplitude = getMovementAmplitude();

  return (
    <div
      onMouseEnter={() => !permanentEffect && !autoAnimate && setHovered(true)}
      onMouseLeave={() => !permanentEffect && !autoAnimate && setHovered(false)}
      ref={ref}
      className={cn(
        'relative group/cover inline-block transition duration-200 rounded-sm',
        hovered ? 'bg-transparent' : 'dark:bg-transparent bg-transparent',
        'px-2 py-2'
      )}
    >
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={permanentEffect ? undefined : { opacity: 0 }}
            transition={{
              opacity: {
                duration: 0.3,
              },
            }}
            className="h-full w-full overflow-hidden absolute inset-0"
          >
            <motion.div
              animate={{
                x: ['-50%', '0%'],
              }}
              transition={{
                x: {
                  duration: animationPhase === 2 ? 8 : 10, // Más rápido en fase de velocidad
                  ease: 'linear',
                  repeat: Infinity,
                },
              }}
              className="w-[200%] h-full flex"
            >
              {/* Partículas */}
              <div className="w-full h-full bg-transparent relative">
                {Array.from({ length: 100 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute rounded-full dark:bg-neutral-300 bg-neutral-700"
                    initial={{
                      x: Math.random() * containerWidth,
                      y: Math.random() * containerHeight,
                      opacity: Math.random() * 0.7 + 0.3,
                      scale: Math.random() * 0.5 + 0.5,
                    }}
                    animate={{
                      x: Math.random() * containerWidth,
                      y: Math.random() * containerHeight,
                      opacity: [0.3, Math.random() * 0.7 + 0.3, 0.3],
                    }}
                    transition={{
                      duration:
                        animationPhase === 2
                          ? Math.random() * 2 + 1 // Más rápido en fase de velocidad
                          : Math.random() * 3 + 2,
                      repeat: Infinity,
                      repeatType: 'loop',
                    }}
                    style={{
                      width: Math.random() * 3 + 1 + 'px',
                      height: Math.random() * 3 + 1 + 'px',
                    }}
                  />
                ))}
              </div>
              <div className="w-full h-full bg-transparent relative">
                {/* Segunda columna de partículas */}
                {Array.from({ length: 100 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute rounded-full dark:bg-neutral-300 bg-neutral-700"
                    initial={{
                      x: Math.random() * containerWidth,
                      y: Math.random() * containerHeight,
                      opacity: Math.random() * 0.7 + 0.3,
                      scale: Math.random() * 0.5 + 0.5,
                    }}
                    animate={{
                      x: Math.random() * containerWidth,
                      y: Math.random() * containerHeight,
                      opacity: [0.3, Math.random() * 0.7 + 0.3, 0.3],
                    }}
                    transition={{
                      duration:
                        animationPhase === 2
                          ? Math.random() * 2 + 1 // Más rápido en fase de velocidad
                          : Math.random() * 3 + 2,
                      repeat: Infinity,
                      repeatType: 'loop',
                    }}
                    style={{
                      width: Math.random() * 3 + 1 + 'px',
                      height: Math.random() * 3 + 1 + 'px',
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {beamPositions.map((position, index) => (
        <Beam
          key={index}
          hovered={hovered}
          duration={Math.random() * (animationPhase === 2 ? 1 : 2) + 0.5}
          delay={Math.random() * (animationPhase === 2 ? 0.5 : 1) + 0.5}
          width={containerWidth}
          style={{
            top: `${position}px`,
          }}
        />
      ))}

      <motion.span
        initial={{ scale: 1 }}
        animate={{
          scale: getScaleAnimation(),
          x: hovered ? [0, -amplitude, amplitude, -amplitude, amplitude, 0] : 0,
          y: hovered ? [0, amplitude, -amplitude, amplitude, -amplitude, 0] : 0,
        }}
        transition={{
          duration: getMovementDuration(),
          scale: {
            duration: animationPhase === 0 ? 1 : 2.5,
            ease: 'easeInOut',
          },
          x: {
            duration: getMovementDuration(),
            repeat: Infinity,
            repeatType: 'loop',
          },
          y: {
            duration: getMovementDuration() * 1.15, // Ligeramente diferente para dar efecto orgánico
            repeat: Infinity,
            repeatType: 'loop',
          },
        }}
        className={cn(
          'inline-block relative z-20 transition duration-200',
          'cover-text-dark',
          className
        )}
      >
        {children}
      </motion.span>
    </div>
  );
};

export const Beam = ({
  className,
  delay,
  duration,
  hovered,
  width = 600,
  ...svgProps
}: {
  className?: string;
  delay?: number;
  duration?: number;
  hovered?: boolean;
  width?: number;
} & React.ComponentProps<typeof motion.svg>) => {
  const id = useId();

  // Conjunto de colores para los haces de luz
  const colorPairs = [
    { start: '#2EB9DF', middle: '#3b82f6' }, // Azul original
    { start: '#FFD700', middle: '#FFA500' }, // Amarillo
    { start: '#FF69B4', middle: '#FF1493' }, // Rosa
    { start: '#FF00FF', middle: '#DA70D6' }, // Magenta
    { start: '#00FF00', middle: '#32CD32' }, // Verde
  ];

  // Seleccionar aleatoriamente un color usando el id como semilla
  const colorIndex = Math.floor(id.length * Math.random()) % colorPairs.length;
  const colors = colorPairs[colorIndex];

  // Determinar si este haz tiene una estela más larga
  const hasLongTail = Math.random() > 0.6;

  return (
    <motion.svg
      width={width ?? '600'}
      height="1"
      viewBox={`0 0 ${width ?? '600'} 1`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('absolute inset-x-0 w-full', className)}
      {...svgProps}
    >
      <motion.path d={`M0 0.5H${width ?? '600'}`} stroke={`url(#svgGradient-${id})`} />

      <defs>
        <motion.linearGradient
          id={`svgGradient-${id}`}
          gradientUnits="userSpaceOnUse"
          initial={{
            x1: '0%',
            x2: hovered ? '-10%' : '-5%',
            y1: 0,
            y2: 0,
          }}
          animate={{
            x1: '110%',
            x2: hovered ? '100%' : '105%',
            y1: 0,
            y2: 0,
          }}
          transition={{
            duration: hovered ? 0.8 : (duration ?? 2),
            ease: 'linear',
            repeat: Infinity,
            delay: hovered ? Math.random() * (1 - 0.2) + 0.2 : 0,
            repeatDelay: hovered ? Math.random() * (2 - 1) + 1 : (delay ?? 1),
          }}
        >
          <stop stopColor={colors.start} stopOpacity="0" />
          <stop stopColor={colors.middle} />
          <stop offset="1" stopColor={colors.middle} stopOpacity="0" />
        </motion.linearGradient>
      </defs>
    </motion.svg>
  );
};

// Se mantiene la definición del componente CircleIcon por si se quiere usar en otro lugar,
// pero se eliminan las llamadas a este componente en el componente Cover
export const CircleIcon = ({ className, delay }: { className?: string; delay?: number }) => {
  return (
    <motion.div
      animate={{
        opacity: [0.2, 0.8, 0.2],
      }}
      transition={{
        duration: 2,
        delay: delay ?? 0,
        repeat: Infinity,
      }}
      className={cn(
        `pointer-events-none h-2 w-2 rounded-full bg-neutral-600 dark:bg-white opacity-20`,
        className
      )}
    ></motion.div>
  );
};
