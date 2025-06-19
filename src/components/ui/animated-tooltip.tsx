'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useTransform, AnimatePresence, useMotionValue, useSpring } from 'motion/react';
import { cn } from '../../utils/cn';

// Tipos para las posiciones del tooltip
type TooltipPosition = 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

interface SmartTooltipPosition {
  x: number;
  y: number;
  position: TooltipPosition;
  transform: string;
}

// Hook para detectar colisiones y calcular la mejor posición
const useSmartTooltipPosition = (
  triggerElement: HTMLElement | null,
  tooltipElement: HTMLElement | null,
  isVisible: boolean
): SmartTooltipPosition => {
  const [position, setPosition] = useState<SmartTooltipPosition>({
    x: 0,
    y: 0,
    position: 'top',
    transform: 'translate(-50%, -100%)'
  });

  useEffect(() => {
    if (!triggerElement || !tooltipElement || !isVisible) return;

    const calculateBestPosition = (): SmartTooltipPosition => {
      const triggerRect = triggerElement.getBoundingClientRect();
      const tooltipRect = tooltipElement.getBoundingClientRect();
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight,
        scrollX: window.scrollX,
        scrollY: window.scrollY
      };

      const gap = 12; // Espacio entre el trigger y el tooltip
      const padding = 16; // Padding del viewport

      // Posiciones posibles
      const positions: Array<{
        position: TooltipPosition;
        x: number;
        y: number;
        transform: string;
        priority: number;
      }> = [
        // Top (preferida)
        {
          position: 'top',
          x: triggerRect.left + triggerRect.width / 2,
          y: triggerRect.top - gap,
          transform: 'translate(-50%, -100%)',
          priority: 1
        },
        // Bottom
        {
          position: 'bottom',
          x: triggerRect.left + triggerRect.width / 2,
          y: triggerRect.bottom + gap,
          transform: 'translate(-50%, 0%)',
          priority: 2
        },
        // Right
        {
          position: 'right',
          x: triggerRect.right + gap,
          y: triggerRect.top + triggerRect.height / 2,
          transform: 'translate(0%, -50%)',
          priority: 3
        },
        // Left
        {
          position: 'left',
          x: triggerRect.left - gap,
          y: triggerRect.top + triggerRect.height / 2,
          transform: 'translate(-100%, -50%)',
          priority: 4
        },
        // Top-right (esquinas como fallback)
        {
          position: 'top-right',
          x: triggerRect.right,
          y: triggerRect.top - gap,
          transform: 'translate(-100%, -100%)',
          priority: 5
        },
        // Top-left
        {
          position: 'top-left',
          x: triggerRect.left,
          y: triggerRect.top - gap,
          transform: 'translate(0%, -100%)',
          priority: 6
        },
        // Bottom-right
        {
          position: 'bottom-right',
          x: triggerRect.right,
          y: triggerRect.bottom + gap,
          transform: 'translate(-100%, 0%)',
          priority: 7
        },
        // Bottom-left
        {
          position: 'bottom-left',
          x: triggerRect.left,
          y: triggerRect.bottom + gap,
          transform: 'translate(0%, 0%)',
          priority: 8
        }
      ];

      // Función para verificar si una posición está dentro del viewport
      const isInViewport = (pos: typeof positions[0]): boolean => {
        // Calcular dónde estaría el tooltip con esta posición
        const tooltipLeft = pos.x + (pos.transform.includes('-50%') ? -tooltipRect.width / 2 : 
                                    pos.transform.includes('-100%') ? -tooltipRect.width : 0);
        const tooltipTop = pos.y + (pos.transform.includes('-50%') ? -tooltipRect.height / 2 : 
                                   pos.transform.includes('-100%') ? -tooltipRect.height : 0);

        return (
          tooltipLeft >= padding &&
          tooltipTop >= padding &&
          tooltipLeft + tooltipRect.width <= viewport.width - padding &&
          tooltipTop + tooltipRect.height <= viewport.height - padding
        );
      };

      // Encontrar la mejor posición que esté dentro del viewport
      const validPositions = positions.filter(isInViewport);
      const bestPosition = validPositions.length > 0 
        ? validPositions.reduce((best, current) => 
            current.priority < best.priority ? current : best
          )
        : positions[0]; // Fallback a top si ninguna posición es válida

      // Si ninguna posición es perfecta, ajustar la posición para que esté dentro del viewport
      let finalX = bestPosition.x;
      let finalY = bestPosition.y;
      let finalTransform = bestPosition.transform;

      if (validPositions.length === 0) {
        // Ajuste horizontal
        const tooltipLeft = finalX - tooltipRect.width / 2;
        const tooltipRight = finalX + tooltipRect.width / 2;
        
        if (tooltipLeft < padding) {
          finalX = padding + tooltipRect.width / 2;
        } else if (tooltipRight > viewport.width - padding) {
          finalX = viewport.width - padding - tooltipRect.width / 2;
        }

        // Ajuste vertical
        const tooltipTop = finalY - tooltipRect.height;
        const tooltipBottom = finalY;
        
        if (tooltipTop < padding) {
          finalY = triggerRect.bottom + gap;
          finalTransform = 'translate(-50%, 0%)';
        } else if (tooltipBottom > viewport.height - padding) {
          finalY = triggerRect.top - gap;
          finalTransform = 'translate(-50%, -100%)';
        }
      }

      return {
        x: finalX,
        y: finalY,
        position: bestPosition.position,
        transform: finalTransform
      };
    };

    const newPosition = calculateBestPosition();
    setPosition(newPosition);
  }, [triggerElement, tooltipElement, isVisible]);

  return position;
};

// Componente de flecha inteligente que se adapta a la posición
const SmartArrow: React.FC<{ position: TooltipPosition }> = ({ position }) => {
  const getArrowClasses = () => {
    const baseClasses = "absolute h-2 w-2 bg-white border-gray-200";
    
    switch (position) {
      case 'top':
      case 'top-left':
      case 'top-right':
        return `${baseClasses} -bottom-1 left-1/2 -translate-x-1/2 rotate-45 border-r border-b`;
      case 'bottom':
      case 'bottom-left':
      case 'bottom-right':
        return `${baseClasses} -top-1 left-1/2 -translate-x-1/2 rotate-45 border-l border-t`;
      case 'left':
        return `${baseClasses} -right-1 top-1/2 -translate-y-1/2 rotate-45 border-r border-t`;
      case 'right':
        return `${baseClasses} -left-1 top-1/2 -translate-y-1/2 rotate-45 border-l border-b`;
      default:
        return `${baseClasses} -bottom-1 left-1/2 -translate-x-1/2 rotate-45 border-r border-b`;
    }
  };

  return <div className={getArrowClasses()} />;
};

// Versión inteligente del SimpleAnimatedTooltip
export const SmartAnimatedTooltip = ({
  content,
  children,
  className,
  disabled = false,
}: {
  content: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  
  const springConfig = { stiffness: 100, damping: 5 };
  const x = useMotionValue(0);

  // Efectos de rotación y traslación basados en la posición del mouse
  const rotate = useSpring(useTransform(x, [-100, 100], [-45, 45]), springConfig);
  const translateX = useSpring(useTransform(x, [-100, 100], [-50, 50]), springConfig);

  // Usar el hook para calcular la posición inteligente
  const smartPosition = useSmartTooltipPosition(
    triggerRef.current,
    tooltipRef.current,
    isHovered && !disabled
  );

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return;
    const element = event.currentTarget;
    const halfWidth = element.offsetWidth / 2;
    x.set(event.nativeEvent.offsetX - halfWidth);
  };

  const handleMouseEnter = () => {
    if (disabled) return;
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div
      ref={triggerRef}
      className={cn('group relative', className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      <AnimatePresence mode="wait">
        {isHovered && !disabled && (
          <motion.div
            ref={tooltipRef}
            initial={{ opacity: 0, y: 20, scale: 0.6 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              transition: { type: 'spring', stiffness: 260, damping: 10 },
            }}
            exit={{ opacity: 0, y: 20, scale: 0.6 }}
            style={{
              translateX: translateX,
              rotate: rotate,
              whiteSpace: typeof content === 'string' ? 'nowrap' : 'normal',
              minWidth: '220px',
              maxWidth: '300px',
              position: 'fixed',
              left: smartPosition.x,
              top: smartPosition.y,
              transform: smartPosition.transform,
              zIndex: 999999,
            }}
            className="flex flex-col items-center justify-center rounded-md bg-white border border-gray-200 px-4 py-3 text-xs shadow-xl"
          >
            {/* Efectos decorativos */}
            <div className="absolute inset-x-10 -bottom-px z-30 h-px w-[20%] bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
            <div className="absolute -bottom-px left-10 z-30 h-px w-[40%] bg-gradient-to-r from-transparent via-sky-500 to-transparent" />

            {/* Contenido del tooltip */}
            <div className="relative z-30 text-base text-gray-800 w-full">{content}</div>

            {/* Flecha inteligente */}
            <SmartArrow position={smartPosition.position} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="transition duration-500 group-hover:z-30 group-hover:scale-105">
        {children}
      </div>
    </div>
  );
};

// Versión completa para múltiples items (igual que el ejemplo original)
export const AnimatedTooltip = ({
  items,
}: {
  items: {
    id: number;
    name: string;
    designation: string;
    image: string;
  }[];
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const springConfig = { stiffness: 100, damping: 5 };
  const x = useMotionValue(0); // going to set this value on mouse move
  // rotate the tooltip
  const rotate = useSpring(useTransform(x, [-100, 100], [-45, 45]), springConfig);
  // translate the tooltip
  const translateX = useSpring(useTransform(x, [-100, 100], [-50, 50]), springConfig);
  const handleMouseMove = (event: React.MouseEvent<HTMLImageElement>) => {
    const element = event.currentTarget;
    const halfWidth = element.offsetWidth / 2;
    x.set(event.nativeEvent.offsetX - halfWidth); // set the x value, which is then used in transform and rotate
  };

  return (
    <>
      {items.map((item) => (
        <div
          className="group relative -mr-4"
          key={item.name}
          onMouseEnter={() => setHoveredIndex(item.id)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence mode="popLayout">
            {hoveredIndex === item.id && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.6 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: {
                    type: 'spring',
                    stiffness: 260,
                    damping: 10,
                  },
                }}
                exit={{ opacity: 0, y: 20, scale: 0.6 }}
                style={{
                  translateX: translateX,
                  rotate: rotate,
                  whiteSpace: 'nowrap',
                }}
                className="absolute -top-16 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center justify-center rounded-md bg-black px-4 py-2 text-xs shadow-xl"
              >
                <div className="absolute inset-x-10 -bottom-px z-30 h-px w-[20%] bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
                <div className="absolute -bottom-px left-10 z-30 h-px w-[40%] bg-gradient-to-r from-transparent via-sky-500 to-transparent" />
                <div className="relative z-30 text-base font-bold text-white">{item.name}</div>
                <div className="text-xs text-white">{item.designation}</div>
                {/* Flecha del tooltip */}
                <div className="absolute -bottom-2 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 transform bg-black" />
              </motion.div>
            )}
          </AnimatePresence>
          <img
            onMouseMove={handleMouseMove}
            height={100}
            width={100}
            src={item.image}
            alt={item.name}
            className="relative !m-0 h-14 w-14 rounded-full border-2 border-white object-cover object-top !p-0 transition duration-500 group-hover:z-30 group-hover:scale-105"
          />
        </div>
      ))}
    </>
  );
};

// Mantener la versión original como alias para compatibilidad
export const SimpleAnimatedTooltip = SmartAnimatedTooltip;
