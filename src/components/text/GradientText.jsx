import './GradientText.css';
import { useEffect, useRef, useState } from 'react';

export default function GradientText({
  children,
  className = '',
  colors = ['#40ffaa', '#4079ff', '#40ffaa', '#4079ff', '#40ffaa'], // Default colors for light mode
  darkModeColors, // New prop for dark mode colors
  animationSpeed = 15, // Default animation speed in seconds
  showBorder = false, // Default overlay visibility (ahora siempre falso)
  showShimmer = false, // New prop to enable the shimmer effect
  shimmerIntensity = 'low', // Puede ser 'low', 'medium', 'high'
  enhancedContrast = true, // Nueva propiedad para mejorar visibilidad
  id, // Prop opcional para pasar un ID específico desde el componente padre
}) {
  const textContentRef = useRef(null);
  const containerRef = useRef(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Generar ID estable - solo usar ID proporcionado o uno por defecto
  const uniqueId = id || 'gradient-text-default';

  // Parse colors de forma segura y determinística
  let lightColors, darkColors;

  try {
    lightColors = Array.isArray(colors) ? colors : JSON.parse(colors);
    if (darkModeColors) {
      darkColors = Array.isArray(darkModeColors) ? darkModeColors : JSON.parse(darkModeColors);
    } else {
      darkColors = lightColors;
    }
  } catch (error) {
    // Fallback seguro
    lightColors = ['#40ffaa', '#4079ff', '#40ffaa', '#4079ff', '#40ffaa'];
    darkColors = lightColors;
  }

  // Asegurar que son arrays válidos
  if (!Array.isArray(lightColors) || lightColors.length === 0) {
    lightColors = ['#40ffaa', '#4079ff', '#40ffaa', '#4079ff', '#40ffaa'];
  }
  if (!Array.isArray(darkColors) || darkColors.length === 0) {
    darkColors = lightColors;
  }

  // Pre-calcular todas las clases de forma determinística
  const shimmerClass = showShimmer ? `shimmer shimmer-${shimmerIntensity}` : '';
  const contrastClass = enhancedContrast ? 'enhanced-contrast' : '';

  // Construir className de forma consistente
  const classNameParts = [
    'animated-gradient-text',
    className,
    shimmerClass,
    'clean-gradient',
    'no-shadow',
  ].filter((part) => part && part.trim() !== '');

  const fullClassName = classNameParts.join(' ');

  // Estilo base que NUNCA cambia durante la hidratación inicial
  const baseGradientStyle = {
    backgroundImage: `linear-gradient(to right, ${lightColors.join(', ')})`,
    animationDuration: `${animationSpeed}s`,
    padding: 0,
    border: 'none',
  };

  // Efecto para marcar como hidratado después del montaje
  useEffect(() => {
    // Pequeño delay para asegurar que la hidratación termine
    const hydrationTimer = setTimeout(() => {
      setIsHydrated(true);
    }, 50);

    return () => clearTimeout(hydrationTimer);
  }, []);

  // Efecto para configurar el componente SOLO después de la hidratación
  useEffect(() => {
    if (!isHydrated || !textContentRef.current) return;

    // Configuraciones post-hidratación
    if (enhancedContrast) {
      textContentRef.current.classList.add('enhanced-contrast');
    }

    // Almacenar colores como atributos de datos
    textContentRef.current.setAttribute('data-light-colors', JSON.stringify(lightColors));
    textContentRef.current.setAttribute('data-dark-colors', JSON.stringify(darkColors));

    // Solo aplicar lógica de temas si se requiere
    if (!className.includes('theme-aware')) return;

    // Aplicar tema después de la hidratación
    const applyTheme = () => {
      if (!textContentRef.current) return;

      try {
        const isDarkMode =
          document.documentElement.getAttribute('data-theme') === 'dark' ||
          (!document.documentElement.hasAttribute('data-theme') &&
            window.matchMedia('(prefers-color-scheme: dark)').matches);

        const colorsToUse = isDarkMode ? darkColors : lightColors;
        textContentRef.current.style.backgroundImage = `linear-gradient(to right, ${colorsToUse.join(', ')})`;
      } catch (error) {
        console.warn('Error applying theme to GradientText:', error);
      }
    };

    // Aplicar tema de forma segura
    const themeTimer = setTimeout(applyTheme, 100);

    return () => clearTimeout(themeTimer);
  }, [isHydrated, className, darkColors, enhancedContrast, lightColors]);

  // Renderizado completamente estático y determinístico
  return (
    <div
      className={fullClassName}
      ref={containerRef}
      id={uniqueId}
      style={{ position: 'relative', zIndex: 5 }}
      suppressHydrationWarning={true}
    >
      <div
        ref={textContentRef}
        className={`text-content ${contrastClass}`}
        style={baseGradientStyle}
        suppressHydrationWarning={true}
      >
        {children}
      </div>
    </div>
  );
}
