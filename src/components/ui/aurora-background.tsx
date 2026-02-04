'use client';
import { cn } from '../../utils/cn';
import React, { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
  children: ReactNode;
  showRadialGradient?: boolean;
  fullHeight?: boolean;
  mouseActivatedOnDesktop?: boolean;
  sectionId?: string; // Nuevo: identificador de sección para control centralizado
}

// Tipo para el registro global de instancias de aurora
interface AuroraInstance {
  setActive: (active: boolean) => void;
  sectionId?: string;
}

// Ampliar el objeto Window para incluir nuestro registro de instancias
declare global {
  interface Window {
    _AuroraInstances?: Record<string, AuroraInstance>;
    _activeAuroras?: Set<string>;
  }
}

export const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  fullHeight = true,
  mouseActivatedOnDesktop = true,
  sectionId = 'default-aurora', // ID por defecto
  ...props
}: AuroraBackgroundProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(1);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(0);
  const animationSpeedRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const instanceIdRef = useRef<string>(
    sectionId
      ? `aurora-${sectionId}`
      : `aurora-default-aurora-${Math.random().toString(36).substr(2, 9)}`
  );

  // Registrar instancia en el sistema global
  useEffect(() => {
    // Inicializar el registro global si no existe
    if (!window._AuroraInstances) {
      window._AuroraInstances = {};
    }

    if (!window._activeAuroras) {
      window._activeAuroras = new Set();
    }

    // Registrar esta instancia
    window._AuroraInstances[instanceIdRef.current] = {
      setActive: (active: boolean) => {
        if (active) {
          setIsInView(true);
          setScrollProgress(1);
          window._activeAuroras?.add(instanceIdRef.current);
        } else {
          setIsInView(false);
          setScrollProgress(0);
          window._activeAuroras?.delete(instanceIdRef.current);
        }
      },
      sectionId: sectionId,
    };

    // Limpiar al desmontar
    return () => {
      if (window._AuroraInstances && instanceIdRef.current) {
        delete window._AuroraInstances[instanceIdRef.current];
        window._activeAuroras?.delete(instanceIdRef.current);
      }
    };
  }, [sectionId]);

  // Detectar tipo de dispositivo al montar el componente
  useEffect(() => {
    const checkIsDesktop = () => {
      const minDesktopWidth = 1024;
      return window.innerWidth >= minDesktopWidth;
    };

    setIsDesktop(checkIsDesktop());

    const handleResize = () => {
      setIsDesktop(checkIsDesktop());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Configurar Intersection Observer para detectar cuando el elemento está en vista
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        // Cambio clave: usar el sistema centralizado para activar/desactivar
        if (entry.isIntersecting) {
          setIsInView(true);
          setScrollProgress(entry.intersectionRatio);
          window._activeAuroras?.add(instanceIdRef.current);

          // Añadir clase para debuggin visual
          if (containerRef.current) {
            containerRef.current.classList.add('aurora-active');
          }
        } else {
          setScrollProgress((prev) => Math.max(0, prev - 0.1));

          // Solo desactivar completamente después de desaparecer totalmente
          if (entry.intersectionRatio === 0) {
            setIsInView(false);
            window._activeAuroras?.delete(instanceIdRef.current);

            // Eliminar clase de debugging
            if (containerRef.current) {
              containerRef.current.classList.remove('aurora-active');
            }
          }
        }
      });
    }, options);

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  // Manejadores de eventos para hover con captura de eventos
  const handleMouseEnter = (e: React.MouseEvent) => {
    setIsHovered(true);
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    setIsHovered(false);
  };

  // Manejador global para movimiento del mouse (alternativa a enter/leave)
  useEffect(() => {
    if (!isDesktop || !mouseActivatedOnDesktop || !containerRef.current) return;

    const checkMousePosition = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const isInside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;

      if (isInside !== isHovered) {
        setIsHovered(isInside);
      }
    };

    window.addEventListener('mousemove', checkMousePosition);
    return () => window.removeEventListener('mousemove', checkMousePosition);
  }, [isDesktop, mouseActivatedOnDesktop, isHovered]);

  // Actualizar la animación usando requestAnimationFrame - Optimizado
  useEffect(() => {
    if (!containerRef.current) return;

    const auroraElement = containerRef.current.querySelector('.aurora-element') as HTMLElement;
    if (!auroraElement) return;

    // Cancelar cualquier animación previa
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    let lastTimestamp = 0;

    // Determinar velocidad objetivo
    const targetSpeed = isInView && (!isDesktop || (mouseActivatedOnDesktop && isHovered)) ? 1 : 0;

    // Función para animar suavemente con throttling mejorado
    const animateSpeed = (timestamp: number) => {
      if (!lastTimestamp) lastTimestamp = timestamp;
      const deltaTime = timestamp - lastTimestamp;

      // Solo actualizar si han pasado al menos 16ms (aproximadamente 60fps) para optimizar rendimiento
      if (deltaTime >= 16) {
        lastTimestamp = timestamp;

        // Ajustar velocidad - más rápido al iniciar (250ms), más lento al detener (500ms)
        const speedStep =
          targetSpeed > animationSpeedRef.current
            ? Math.min(0.004 * deltaTime, 1)
            : Math.min(0.002 * deltaTime, 1);

        if (Math.abs(targetSpeed - animationSpeedRef.current) < 0.01) {
          animationSpeedRef.current = targetSpeed;
        } else if (targetSpeed > animationSpeedRef.current) {
          animationSpeedRef.current += speedStep;
        } else {
          animationSpeedRef.current -= speedStep;
        }

        setAnimationSpeed(animationSpeedRef.current);

        // Aplicar animación según velocidad
        if (animationSpeedRef.current <= 0.01) {
          auroraElement.style.animationPlayState = 'paused';
        } else {
          // Ajustar velocidades: más rápido en escritorio, más lento en móvil
          const baseDuration = isDesktop ? 5 : 30; // 5s para escritorio, 30s para móvil
          const slowdownFactor = 4;
          const currentDuration =
            baseDuration + (1 - animationSpeedRef.current) * baseDuration * slowdownFactor;

          auroraElement.style.animationDuration = `${currentDuration}s`;
          auroraElement.style.animationPlayState = 'running';
        }
      }

      // Continuar animando si no hemos llegado al objetivo o si está en proceso
      if (
        animationSpeedRef.current !== targetSpeed ||
        Math.abs(targetSpeed - animationSpeedRef.current) >= 0.01
      ) {
        animationFrameRef.current = requestAnimationFrame(animateSpeed);
      } else {
        animationFrameRef.current = null;
      }
    };

    // Iniciar animación
    animationFrameRef.current = requestAnimationFrame(animateSpeed);

    // Limpiar
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [scrollProgress, isInView, isDesktop, isHovered, mouseActivatedOnDesktop]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'transition-bg relative flex flex-col items-center justify-center bg-zinc-50 text-slate-950 dark:bg-zinc-900',
        fullHeight ? 'h-[100vh]' : '',
        className,
        // Agregar clase para asegurar que capture eventos de mouse
        'pointer-events-auto',
        // Añadir data-attribute para el sistema centralizado
        `aurora-container`
      )}
      data-section-id={sectionId}
      data-aurora-id={instanceIdRef.current}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ pointerEvents: 'auto' }}
      {...props}
    >
      <div
        className="absolute inset-0 overflow-hidden"
        style={
          {
            '--aurora':
              'repeating-linear-gradient(100deg,#3b82f6_10%,#a5b4fc_15%,#93c5fd_20%,#ddd6fe_25%,#60a5fa_30%)',
            '--dark-gradient':
              'repeating-linear-gradient(100deg,#000_0%,#000_7%,transparent_10%,transparent_12%,#000_16%)',
            '--white-gradient':
              'repeating-linear-gradient(100deg,#fff_0%,#fff_7%,transparent_10%,transparent_12%,#fff_16%)',
            '--blue-300': '#93c5fd',
            '--blue-400': '#60a5fa',
            '--blue-500': '#3b82f6',
            '--indigo-300': '#a5b4fc',
            '--violet-200': '#ddd6fe',
            '--black': '#000',
            '--white': '#fff',
            '--transparent': 'transparent',
            '--opacity': isInView ? Math.min(0.5, scrollProgress * 0.5) : 0,
          } as React.CSSProperties
        }
      >
        <div
          className={cn(
            `aurora-element after:animate-aurora pointer-events-none absolute -inset-[10px] 
            [background-image:var(--white-gradient),var(--aurora)] 
            [background-size:300%,_200%] 
            [background-position:50%_50%,50%_50%] 
            blur-[10px] 
            invert 
            filter 
            will-change-transform 
            [--aurora:repeating-linear-gradient(100deg,var(--blue-500)_10%,var(--indigo-300)_15%,var(--blue-300)_20%,var(--violet-200)_25%,var(--blue-400)_30%)] 
            [--dark-gradient:repeating-linear-gradient(100deg,var(--black)_0%,var(--black)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--black)_16%)] 
            [--white-gradient:repeating-linear-gradient(100deg,var(--white)_0%,var(--white)_7%,transparent_10%,transparent_12%,var(--white)_16%)] 
            after:absolute 
            after:inset-0 
            after:[background-image:var(--white-gradient),var(--aurora)] 
            after:[background-size:200%,_100%] 
            after:[background-attachment:fixed] 
            after:mix-blend-difference 
            after:content-[""] 
            dark:[background-image:var(--dark-gradient),var(--aurora)] 
            dark:invert-0 
            after:dark:[background-image:var(--dark-gradient),var(--aurora)]`,

            showRadialGradient &&
              `[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,var(--transparent)_70%)]`
          )}
          style={{
            opacity: `var(--opacity)`,
            transition: 'opacity 0.5s ease-in-out',
          }}
        ></div>
      </div>
      {children}
    </div>
  );
};
