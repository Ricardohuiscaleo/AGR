'use client';
import { cn } from '../../utils/cn';
import { useMotionValue, motion, useMotionTemplate } from 'framer-motion';
import React, { useEffect, useState } from 'react';

export const HeroHighlight = ({
  children,
  className,
  containerClassName,
}: {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
}) => {
  let mouseX = useMotionValue(0);
  let mouseY = useMotionValue(0);
  const [isHovering, setIsHovering] = useState(false);

  // SVG patterns for different circle sizes to create magnification effect
  // The circles increase in size as they get closer to the cursor
  const createDotPattern = (color: string, size: number, opacity: number = 1) => {
    return `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='16' height='16' fill='none'%3E%3Ccircle fill='${encodeURIComponent(
      color
    )}' opacity='${opacity}' id='pattern-circle' cx='10' cy='10' r='${size}'%3E%3C/circle%3E%3C/svg%3E")`;
  };

  // SVG patterns for different states and themes with size variations
  const dotPatterns = {
    light: {
      default: createDotPattern('#d4d4d4', 2.5, 0.5),
      hover: {
        small: createDotPattern('#6366f1', 2, 0.8),
        medium: createDotPattern('#6366f1', 3, 0.9),
        large: createDotPattern('#6366f1', 4, 1),
      },
    },
    dark: {
      default: createDotPattern('#404040', 2.5, 0.5),
      hover: {
        small: createDotPattern('#8183f4', 2, 0.8),
        medium: createDotPattern('#8183f4', 3, 0.9),
        large: createDotPattern('#8183f4', 4, 1),
      },
    },
  };

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent<HTMLDivElement>) {
    if (!currentTarget) return;
    let { left, top } = currentTarget.getBoundingClientRect();

    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
    setIsHovering(true);
  }

  function handleMouseEnter() {
    setIsHovering(true);
  }

  function handleMouseLeave() {
    setIsHovering(false);
  }

  // Detecta eventos de ratón globales para dispositivos móviles
  useEffect(() => {
    const highlightContainer = document.querySelector('.highlight-container');

    if (highlightContainer) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        // Verificar si el cursor está dentro del contenedor
        const rect = highlightContainer.getBoundingClientRect();

        if (
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom
        ) {
          mouseX.set(e.clientX - rect.left);
          mouseY.set(e.clientY - rect.top);
          setIsHovering(true);
        } else {
          setIsHovering(false);
        }
      };

      // Escuchar eventos globales
      document.addEventListener('mousemove', handleGlobalMouseMove);

      // Eliminar listener al desmontar
      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
      };
    }
  }, [mouseX, mouseY]);

  return (
    <div
      className={cn('group relative w-full flex bg-transparent px-0 mx-0', containerClassName)}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        touchAction: 'none',
        width: '100%',
        paddingLeft: 0,
        paddingRight: 0,
        top: 0,
        left: 0,
        right: 0,
        zIndex: 4 /* Mismo z-index que el wrapper para mantener coherencia */,
        pointerEvents: 'auto',
        position: 'relative',
        height: '100%',
        display: 'flex',
        justifyContent: 'center' /* Centrado horizontal */,
      }}
    >
      {/* Fondo de puntos estático para el modo claro */}
      <div
        className="pointer-events-none absolute inset-0 w-full left-0 right-0 dark:hidden"
        style={{
          backgroundImage: dotPatterns.light.default,
          marginLeft: 0,
          marginRight: 0,
        }}
      />

      {/* Fondo de puntos estático para el modo oscuro */}
      <div
        className="pointer-events-none absolute inset-0 w-full left-0 right-0 hidden dark:block"
        style={{
          backgroundImage: dotPatterns.dark.default,
          marginLeft: 0,
          marginRight: 0,
        }}
      />

      {/* Capa 1: Puntos pequeños - Exterior del círculo (modo claro) */}
      <motion.div
        className={cn(
          'pointer-events-none absolute inset-0 w-full left-0 right-0 dark:hidden transition duration-300',
          isHovering ? 'opacity-100' : 'opacity-0'
        )}
        style={{
          backgroundImage: dotPatterns.light.hover.small,
          WebkitMaskImage: useMotionTemplate`
            radial-gradient(
              300px circle at ${mouseX}px ${mouseY}px,
              black 0%,
              transparent 70%
            )
          `,
          maskImage: useMotionTemplate`
            radial-gradient(
              300px circle at ${mouseX}px ${mouseY}px,
              black 0%,
              transparent 70%
            )
          `,
          marginLeft: 0,
          marginRight: 0,
        }}
      />

      {/* Capa 2: Puntos medianos - Zona media del círculo (modo claro) */}
      <motion.div
        className={cn(
          'pointer-events-none absolute inset-0 w-full left-0 right-0 dark:hidden transition duration-300',
          isHovering ? 'opacity-100' : 'opacity-0'
        )}
        style={{
          backgroundImage: dotPatterns.light.hover.medium,
          WebkitMaskImage: useMotionTemplate`
            radial-gradient(
              200px circle at ${mouseX}px ${mouseY}px,
              black 0%,
              transparent 70%
            )
          `,
          maskImage: useMotionTemplate`
            radial-gradient(
              200px circle at ${mouseX}px ${mouseY}px,
              black 0%,
              transparent 70%
            )
          `,
          marginLeft: 0,
          marginRight: 0,
        }}
      />

      {/* Capa 3: Puntos grandes - Centro del círculo (modo claro) */}
      <motion.div
        className={cn(
          'pointer-events-none absolute inset-0 w-full left-0 right-0 dark:hidden transition duration-300',
          isHovering ? 'opacity-100' : 'opacity-0'
        )}
        style={{
          backgroundImage: dotPatterns.light.hover.large,
          WebkitMaskImage: useMotionTemplate`
            radial-gradient(
              100px circle at ${mouseX}px ${mouseY}px,
              black 0%,
              transparent 70%
            )
          `,
          maskImage: useMotionTemplate`
            radial-gradient(
              100px circle at ${mouseX}px ${mouseY}px,
              black 0%,
              transparent 70%
            )
          `,
          marginLeft: 0,
          marginRight: 0,
        }}
      />

      {/* Capa 1: Puntos pequeños - Exterior del círculo (modo oscuro) */}
      <motion.div
        className={cn(
          'pointer-events-none absolute inset-0 w-full left-0 right-0 hidden dark:block transition duration-300',
          isHovering ? 'opacity-100' : 'opacity-0'
        )}
        style={{
          backgroundImage: dotPatterns.dark.hover.small,
          WebkitMaskImage: useMotionTemplate`
            radial-gradient(
              300px circle at ${mouseX}px ${mouseY}px,
              black 0%,
              transparent 70%
            )
          `,
          maskImage: useMotionTemplate`
            radial-gradient(
              300px circle at ${mouseX}px ${mouseY}px,
              black 0%,
              transparent 70%
            )
          `,
          marginLeft: 0,
          marginRight: 0,
        }}
      />

      {/* Capa 2: Puntos medianos - Zona media del círculo (modo oscuro) */}
      <motion.div
        className={cn(
          'pointer-events-none absolute inset-0 w-full left-0 right-0 hidden dark:block transition duration-300',
          isHovering ? 'opacity-100' : 'opacity-0'
        )}
        style={{
          backgroundImage: dotPatterns.dark.hover.medium,
          WebkitMaskImage: useMotionTemplate`
            radial-gradient(
              200px circle at ${mouseX}px ${mouseY}px,
              black 0%,
              transparent 70%
            )
          `,
          maskImage: useMotionTemplate`
            radial-gradient(
              200px circle at ${mouseX}px ${mouseY}px,
              black 0%,
              transparent 70%
            )
          `,
          marginLeft: 0,
          marginRight: 0,
        }}
      />

      {/* Capa 3: Puntos grandes - Centro del círculo (modo oscuro) */}
      <motion.div
        className={cn(
          'pointer-events-none absolute inset-0 w-full left-0 right-0 hidden dark:block transition duration-300',
          isHovering ? 'opacity-100' : 'opacity-0'
        )}
        style={{
          backgroundImage: dotPatterns.dark.hover.large,
          WebkitMaskImage: useMotionTemplate`
            radial-gradient(
              100px circle at ${mouseX}px ${mouseY}px,
              black 0%,
              transparent 70%
            )
          `,
          maskImage: useMotionTemplate`
            radial-gradient(
              100px circle at ${mouseX}px ${mouseY}px,
              black 0%,
              transparent 70%
            )
          `,
          marginLeft: 0,
          marginRight: 0,
        }}
      />

      <div className={cn('relative z-10 flex justify-center w-full', className)}>{children}</div>
    </div>
  );
};

export const Highlight = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <motion.span
      initial={{
        backgroundSize: '0% 100%',
      }}
      animate={{
        backgroundSize: '100% 100%',
      }}
      transition={{
        duration: 2,
        ease: 'linear',
        delay: 0.5,
      }}
      style={{
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'left center',
        display: 'inline',
      }}
      className={cn(
        `relative inline-block rounded-lg bg-gradient-to-r from-indigo-300 to-purple-300 px-1 pb-1 dark:from-indigo-500 dark:to-purple-500`,
        className
      )}
    >
      {children}
    </motion.span>
  );
};
