import { useEffect, useRef, useState } from 'react';

interface TextPressureProps {
  text?: string;
  fontFamily?: string;
  fontUrl?: string;
  width?: boolean;
  weight?: boolean;
  italic?: boolean;
  alpha?: boolean;
  flex?: boolean;
  stroke?: boolean;
  scale?: boolean;
  textColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  className?: string;
  minFontSize?: number;
  id?: string;
}

const TextPressure: React.FC<TextPressureProps> = ({
  text = 'Compressa',
  fontFamily = 'Compressa VF',
  fontUrl = 'https://res.cloudinary.com/dr6lvwubh/raw/upload/v1529908256/CompressaPRO-GX.woff2',
  width = true,
  weight = true,
  italic = true,
  alpha = false,
  flex = true,
  stroke = false,
  scale = false,
  textColor = '#FFFFFF',
  strokeColor = '#FF0000',
  strokeWidth = 2,
  className = '',
  minFontSize = 24,
  id,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const spansRef = useRef<Array<HTMLSpanElement | null>>([]);

  const mouseRef = useRef({ x: 0, y: 0 });
  const cursorRef = useRef({ x: 0, y: 0 });
  const scrollRef = useRef(0);
  const [isMobile, setIsMobile] = useState(false); // Changed to state

  const [fontSize, setFontSize] = useState(minFontSize);
  const [scaleY, setScaleY] = useState(1);
  const [lineHeight, setLineHeight] = useState(1);
  const [currentTextColor, setCurrentTextColor] = useState(textColor);
  const [currentStrokeColor, setCurrentStrokeColor] = useState(strokeColor);
  const [isLoading, setIsLoading] = useState(true);
  const [fontLoaded, setFontLoaded] = useState(false);
  const [debugInfo, setDebugInfo] = useState<{ fontLoaded: boolean; isLoading: boolean }>({
    fontLoaded: false,
    isLoading: true,
  });

  const chars = text.split('');

  const checkIfMobile = () => {
    // Now updates state
    setIsMobile(window.innerWidth <= 768);
  };

  const dist = (a: { x: number; y: number }, b: { x: number; y: number }) => {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        if (document.fonts.check(`1em "${fontFamily}"`)) {
          console.log(`Fuente ${fontFamily} ya está disponible`);
          setFontLoaded(true);
          setDebugInfo((prev) => ({ ...prev, fontLoaded: true }));
          return;
        }

        const style = document.createElement('style');
        style.textContent = `
          @font-face {
            font-family: "${fontFamily}";
            src: url("${fontUrl}") format("woff2");
            font-weight: 100 900;
            font-style: normal;
            font-display: swap;
          }
        `;
        document.head.appendChild(style);

        const font = new FontFace(fontFamily, `url(${fontUrl})`);

        font
          .load()
          .then((loadedFont) => {
            document.fonts.add(loadedFont);
            console.log(`Fuente ${fontFamily} cargada correctamente`);
            setFontLoaded(true);
            setDebugInfo((prev) => ({ ...prev, fontLoaded: true }));
          })
          .catch((error) => {
            console.error('Error al cargar la fuente con FontFace API:', error);
            setTimeout(() => {
              setFontLoaded(true);
              setDebugInfo((prev) => ({ ...prev, fontLoaded: true }));
            }, 1000);
          });
      } catch (error) {
        console.error('Error general al cargar la fuente:', error);
        setFontLoaded(true);
        setDebugInfo((prev) => ({ ...prev, fontLoaded: true }));
      }
    }
  }, [fontFamily, fontUrl]);

  useEffect(() => {
    checkIfMobile();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = containerRef.current!.getBoundingClientRect();
      cursorRef.current.x = e.clientX - rect.left; // Coordenadas relativas al contenedor
      cursorRef.current.y = e.clientY - rect.top; // Coordenadas relativas al contenedor
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();

      const t = e.touches[0];
      const rect = containerRef.current!.getBoundingClientRect();
      cursorRef.current.x = t.clientX - rect.left; // Coordenadas relativas al contenedor
      cursorRef.current.y = t.clientY - rect.top; // Coordenadas relativas al contenedor
    };

    const handleTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      const rect = containerRef.current!.getBoundingClientRect();
      cursorRef.current.x = t.clientX - rect.left; // Coordenadas relativas al contenedor
      cursorRef.current.y = t.clientY - rect.top; // Coordenadas relativas al contenedor
      mouseRef.current.x = t.clientX - rect.left; // Coordenadas relativas al contenedor
      mouseRef.current.y = t.clientY - rect.top; // Coordenadas relativas al contenedor
    };

    const handleMouseLeave = () => {
      // Al salir el mouse, reseteamos la posición al centro del contenedor
      const rect = containerRef.current!.getBoundingClientRect();
      cursorRef.current.x = rect.width / 2;
      cursorRef.current.y = rect.height / 2;
    };

    const handleScroll = () => {
      // Esta función NO debe actualizar cursorRef.current para el efecto de presión.
      // El efecto de presión debe reaccionar solo a eventos de puntero reales.
      scrollRef.current = window.scrollY;
    };

    const handleResize = () => {
      checkIfMobile();
    };

    const handleUpdateColors = (e: CustomEvent) => {
      const { textColor: newTextColor, strokeColor: newStrokeColor } = e.detail;
      if (newTextColor) setCurrentTextColor(newTextColor);
      if (newStrokeColor) setCurrentStrokeColor(newStrokeColor);
    };

    const checkForColorUpdates = () => {
      if (id) {
        const element = document.getElementById(id);
        if (element) {
          const dataTextColor = element.dataset.textColor;
          const dataStrokeColor = element.dataset.strokeColor;

          if (dataTextColor) setCurrentTextColor(dataTextColor);
          if (dataStrokeColor) setCurrentStrokeColor(dataStrokeColor);
        }
      }
    };

    const container = containerRef.current; // Aseguramos que el contenedor esté disponible
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseleave', handleMouseLeave);
      // Usamos passive: false para touchmove para poder llamar a e.preventDefault()
      container.addEventListener('touchmove', handleTouchMove, { passive: false });
      container.addEventListener('touchstart', handleTouchStart, { passive: false });
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);

    if (id) {
      const element = document.getElementById(id);
      if (element) {
        element.addEventListener('updatePressureColors', handleUpdateColors as EventListener);

        const intervalId = setInterval(checkForColorUpdates, 100);
        return () => {
          clearInterval(intervalId);
          element.removeEventListener('updatePressureColors', handleUpdateColors as EventListener);
        };
      }
    }

    // Centrado inicial de mouseRef y cursorRef relativo al contenedor
    const rect = container.getBoundingClientRect();
    mouseRef.current.x = rect.width / 2;
    mouseRef.current.y = rect.height / 2;
    cursorRef.current.x = mouseRef.current.x;
    cursorRef.current.y = mouseRef.current.y;

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseleave', handleMouseLeave);
        container.removeEventListener('touchmove', handleTouchMove);
        container.removeEventListener('touchstart', handleTouchStart);
      }
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [id]);

  const setSize = () => {
    if (!containerRef.current) {
      console.warn('Container ref no disponible');
      return;
    }

    const { width: containerW, height: containerH } = containerRef.current.getBoundingClientRect();

    let newFontSize = (containerW * 0.9) / (chars.length * 0.5);
    newFontSize = Math.max(newFontSize, minFontSize);
    newFontSize = Math.min(newFontSize, containerW / 2);

    setFontSize(newFontSize);
    setScaleY(1);
    setLineHeight(1);

    setIsLoading(false);
    setDebugInfo((prev) => ({ ...prev, isLoading: false }));

    if (titleRef.current) {
      requestAnimationFrame(() => {
        if (!titleRef.current) return;

        const textRect = titleRef.current.getBoundingClientRect();

        if (textRect.width > containerW * 0.95) {
          setFontSize((prev) => (prev * (containerW * 0.95)) / textRect.width);
        }

        if (scale && textRect.height > 0 && textRect.height < containerH) {
          const yRatio = containerH / textRect.height;
          setScaleY(yRatio);
          setLineHeight(yRatio);
        }
      });
    }
  };

  useEffect(() => {
    if (fontLoaded) {
      console.log('Fuente cargada, configurando tamaño...');
      setSize();
      window.addEventListener('resize', setSize);
      return () => window.removeEventListener('resize', setSize);
    }
  }, [fontLoaded, scale, text]);

  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        console.log('Timeout de seguridad activado para mostrar el texto');
        setIsLoading(false);
        setDebugInfo((prev) => ({ ...prev, isLoading: false }));
        setFontLoaded(true);
        setDebugInfo((prev) => ({ ...prev, fontLoaded: true }));
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  useEffect(() => {
    if (isLoading) return;

    let rafId: number;
    const animate = () => {
      mouseRef.current.x += (cursorRef.current.x - mouseRef.current.x) / 15;
      mouseRef.current.y += (cursorRef.current.y - mouseRef.current.y) / 15;

      if (titleRef.current) {
        const titleRect = titleRef.current.getBoundingClientRect();
        const maxDist = titleRect.width / 2;

        spansRef.current.forEach((span) => {
          if (!span) return;

          const rect = span.getBoundingClientRect();
          const charCenter = {
            x: rect.x + rect.width / 2,
            y: rect.y + rect.height / 2,
          };

          const d = dist(mouseRef.current, charCenter);

          const getAttr = (distance: number, minVal: number, maxVal: number) => {
            const val = maxVal - Math.abs((maxVal * distance) / maxDist);
            return Math.max(minVal, val + minVal);
          };

          const wdth = width ? Math.floor(getAttr(d, 30, 150)) : 100;
          const wght = weight ? Math.floor(getAttr(d, 200, 700)) : 400;
          const italVal = italic ? getAttr(d, 0, 0.8).toFixed(2) : '0';
          const alphaVal = alpha ? getAttr(d, 0, 1).toFixed(2) : '1';

          span.style.opacity = alphaVal;
          span.style.fontVariationSettings = `'wght' ${wght}, 'wdth' ${wdth}, 'ital' ${italVal}`;

          if (span.textContent === 'T') {
            span.style.fontVariationSettings = `'wght' ${Math.min(wght, 600)}, 'wdth' ${Math.max(wdth, 50)}, 'ital' ${italVal}`;
          }
        });
      }

      rafId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(rafId);
  }, [width, weight, italic, alpha, chars.length, isLoading]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-transparent"
      id={id}
    >
      <style>{`
        @font-face {
          font-family: '${fontFamily}';
          src: url('${fontUrl}');
          font-weight: 100 900;
          font-style: normal;
          font-display: swap;
        }
        .stroke span {
          position: relative;
          color: ${currentTextColor};
          transition: color 0.3s ease;
        }
        .stroke span::after {
          content: attr(data-char);
          position: absolute;
          left: 0;
          top: 0;
          color: transparent;
          z-index: -1;
          -webkit-text-stroke-width: ${strokeWidth}px;
          -webkit-text-stroke-color: ${currentStrokeColor};
          transition: -webkit-text-stroke-color 0.3s ease;
        }
      `}</style>

      {isLoading ? (
        <div className="w-full h-full flex items-center justify-center" aria-hidden="true"></div>
      ) : (
        <h1
          ref={titleRef}
          className={`text-pressure-title ${className} ${
            flex ? 'flex justify-between' : ''
          } ${stroke ? 'stroke' : ''} uppercase text-center`}
          style={{
            fontFamily,
            fontSize: fontSize,
            lineHeight,
            transform: `scale(1, ${scaleY})`,
            transformOrigin: 'center top',
            margin: 0,
            fontWeight: 100,
            color: stroke ? undefined : currentTextColor,
            transition: 'color 0.3s ease',
            opacity: 1,
          }}
        >
          {chars.map((char, i) => (
            <span
              key={i}
              ref={(el) => {
                spansRef.current[i] = el;
                return null;
              }}
              data-char={char}
              className="inline-block"
            >
              {char}
            </span>
          ))}
        </h1>
      )}
    </div>
  );
};

export default TextPressure;
