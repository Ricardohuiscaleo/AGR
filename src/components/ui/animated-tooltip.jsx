import { useState, useRef, useEffect } from 'react';

export function SimpleAnimatedTooltip({
  content,
  children,
  side = 'top',
  align = 'center',
  showArrow = true,
  delay = 100,
  offset = 8,
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef(null);
  const tooltipRef = useRef(null);
  const timeoutRef = useRef(null);

  // Detectar si estamos en vista móvil
  useEffect(() => {
    const checkMobile = () => {
      // Verificar tanto el ancho de pantalla como si es un dispositivo táctil
      const isMobileScreen = window.innerWidth <= 768;
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsMobile(isMobileScreen || isTouchDevice);
    };

    // Verificar al montar el componente
    checkMobile();

    // Agregar listener para cambios de tamaño de ventana
    window.addEventListener('resize', checkMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Calculate position based on trigger element and tooltip dimensions
  const calculatePosition = () => {
    if (!containerRef.current || !tooltipRef.current) return;

    const trigger = containerRef.current.getBoundingClientRect();
    const tooltip = tooltipRef.current.getBoundingClientRect();

    let top = 0;
    let left = 0;

    // Position based on side
    switch (side) {
      case 'top':
        top = -tooltip.height - offset;
        break;
      case 'bottom':
        top = trigger.height + offset;
        break;
      case 'left':
        left = -tooltip.width - offset;
        top = (trigger.height - tooltip.height) / 2;
        break;
      case 'right':
        left = trigger.width + offset;
        top = (trigger.height - tooltip.height) / 2;
        break;
      default:
        top = -tooltip.height - offset;
    }

    // Adjust horizontal alignment
    if (side === 'top' || side === 'bottom') {
      switch (align) {
        case 'start':
          left = 0;
          break;
        case 'center':
          left = (trigger.width - tooltip.width) / 2;
          break;
        case 'end':
          left = trigger.width - tooltip.width;
          break;
        default:
          left = (trigger.width - tooltip.width) / 2;
      }
    }

    // Adjust vertical alignment
    if (side === 'left' || side === 'right') {
      switch (align) {
        case 'start':
          top = 0;
          break;
        case 'center':
          top = (trigger.height - tooltip.height) / 2;
          break;
        case 'end':
          top = trigger.height - tooltip.height;
          break;
        default:
          top = (trigger.height - tooltip.height) / 2;
      }
    }

    // Apply position
    setTooltipPosition({ top, left });
  };

  // Update position when content changes
  useEffect(() => {
    if (isVisible) {
      calculatePosition();
    }
  }, [content, isVisible]);

  // Show tooltip with delay - SOLO SI NO ES MÓVIL
  const handleMouseEnter = () => {
    // Si es móvil, no mostrar tooltip
    if (isMobile) return;

    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      // Use RAF to ensure the tooltip is rendered before calculating position
      requestAnimationFrame(() => {
        calculatePosition();
      });
    }, delay);
  };

  // Hide tooltip with delay
  const handleMouseLeave = () => {
    // Si es móvil, no hay tooltip que ocultar
    if (isMobile) return;

    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, delay);
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Get arrow position styles
  const getArrowStyles = () => {
    const arrowStyles = {
      position: 'absolute',
      width: '10px',
      height: '10px',
      backgroundColor: 'white',
      transform: 'rotate(45deg)',
      boxShadow: '1px 1px 3px rgba(0, 0, 0, 0.1)',
    };

    switch (side) {
      case 'top':
        return {
          ...arrowStyles,
          bottom: '-5px',
          left:
            align === 'center'
              ? 'calc(50% - 5px)'
              : align === 'start'
                ? '10px'
                : 'calc(100% - 15px)',
        };
      case 'bottom':
        return {
          ...arrowStyles,
          top: '-5px',
          left:
            align === 'center'
              ? 'calc(50% - 5px)'
              : align === 'start'
                ? '10px'
                : 'calc(100% - 15px)',
        };
      case 'left':
        return {
          ...arrowStyles,
          right: '-5px',
          top:
            align === 'center'
              ? 'calc(50% - 5px)'
              : align === 'start'
                ? '10px'
                : 'calc(100% - 15px)',
        };
      case 'right':
        return {
          ...arrowStyles,
          left: '-5px',
          top:
            align === 'center'
              ? 'calc(50% - 5px)'
              : align === 'start'
                ? '10px'
                : 'calc(100% - 15px)',
        };
      default:
        return arrowStyles;
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative inline-block"
    >
      {children}
      {/* Solo mostrar tooltip si no es móvil Y está visible */}
      {!isMobile && isVisible && (
        <div
          ref={tooltipRef}
          className="absolute z-50 bg-white shadow-md rounded-lg p-2 text-sm text-gray-700 min-w-[120px] animate-fade-in"
          style={{
            top: tooltipPosition.top,
            left: tooltipPosition.left,
            animation: 'fadeIn 0.2s ease-in-out',
          }}
        >
          {content}
          {showArrow && <div style={getArrowStyles()} />}
        </div>
      )}
    </div>
  );
}

// CSS animations for the component
if (typeof document !== 'undefined') {
  // Only run on client side
  if (!document.querySelector('#tooltip-animations')) {
    const style = document.createElement('style');
    style.id = 'tooltip-animations';
    style.innerHTML = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(${-5}px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .animate-fade-in {
        animation: fadeIn 0.2s ease-in-out forwards;
      }
    `;
    document.head.appendChild(style);
  }
}
