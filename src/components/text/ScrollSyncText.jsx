import { useState, useEffect, useRef } from 'react';

/**
 * Componente que crea un efecto de desplazamiento sincronizado con el scroll
 * 
 * @param {Object} props - Propiedades del componente
 * @param {string} props.id - ID único del elemento
 * @param {string} props.className - Clases CSS adicionales
 * @param {string} props.text - Texto a mostrar
 * @param {string} props.direction - Dirección del desplazamiento ('left', 'right', 'top', 'bottom')
 * @param {number} props.distance - Distancia del desplazamiento en píxeles
 * @param {number} props.speed - Factor de velocidad del desplazamiento (1 = normal, 2 = doble, etc.)
 * @returns {JSX.Element} - Componente de texto con efecto desplazamiento sincronizado
 */
export default function ScrollSyncText({
  id,
  className = '',
  text,
  direction = 'right', // 'left', 'right', 'top', 'bottom'
  distance = 100,
  speed = 1,
  children,
}) {
  const textRef = useRef(null);
  const [opacity, setOpacity] = useState(0);
  
  useEffect(() => {
    if (!textRef.current) return;
    
    // Función para calcular la transformación basada en el scroll
    const calculateTransform = () => {
      // Obtener referencias al elemento y su posición
      const element = textRef.current;
      const rect = element.getBoundingClientRect();
      
      // Calcular la posición relativa en el viewport (0 = arriba, 1 = abajo)
      const windowHeight = window.innerHeight;
      const elementTop = rect.top;
      const elementBottom = rect.bottom;
      const elementHeight = rect.height;
      
      // Calcular el progreso del scroll (0 cuando el elemento está entrando, 1 cuando está saliendo)
      // Esto determina cuánto se ha desplazado el elemento dentro del viewport
      let scrollProgress = 1 - ((elementTop + elementHeight) / (windowHeight + elementHeight));
      
      // Limitar el progreso entre 0 y 1
      scrollProgress = Math.max(0, Math.min(1, scrollProgress));
      
      // Calcular la opacidad (0 al inicio, 1 a la mitad, 0 al final)
      // Queremos que sea más visible en el centro de la pantalla
      const distanceFromCenter = Math.abs(0.5 - scrollProgress);
      const visibilityFactor = 1 - (distanceFromCenter * 2);
      const newOpacity = Math.max(0, visibilityFactor * 1.5); // Multiplicamos por 1.5 para que sea más visible
      setOpacity(newOpacity);
      
      // Calcular la transformación basada en la dirección
      let transformValue = '';
      const moveDistance = (1 - scrollProgress) * distance * speed;
      
      switch (direction) {
        case 'left':
          transformValue = `translateX(-${moveDistance}px)`;
          break;
        case 'right':
          transformValue = `translateX(${moveDistance}px)`;
          break;
        case 'top':
          transformValue = `translateY(-${moveDistance}px)`;
          break;
        case 'bottom':
          transformValue = `translateY(${moveDistance}px)`;
          break;
        default:
          transformValue = `translateX(${moveDistance}px)`;
      }
      
      // Aplicar transformación y opacidad
      element.style.transform = transformValue;
      element.style.opacity = newOpacity;
    };
    
    // Calcular inicialmente
    calculateTransform();
    
    // Agregar evento de scroll
    window.addEventListener('scroll', calculateTransform);
    
    // Limpiar listener al desmontar
    return () => window.removeEventListener('scroll', calculateTransform);
  }, [direction, distance, speed]);
  
  return (
    <div 
      id={id}
      ref={textRef}
      className={`scroll-sync-text ${className}`}
      style={{
        opacity: 0,
        willChange: 'transform, opacity',
        transition: 'none', // No queremos transiciones CSS, el JavaScript controla todo
      }}
    >
      {children || text}
    </div>
  );
}