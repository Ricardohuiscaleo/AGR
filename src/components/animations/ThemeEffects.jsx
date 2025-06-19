import { useEffect } from 'react';
import {
  setupThemeColorUpdater,
  setupHeaderBlurContainer,
} from '../../utils/animations/gsap-animations';

/**
 * Componente para manejar efectos relacionados con el tema y el header
 * Este componente no renderiza nada visible, solo se encarga de los efectos
 */
export default function ThemeEffects() {
  useEffect(() => {
    // Configurar actualizador de colores para tema
    setupThemeColorUpdater('.theme-aware .text-content');

    // Configurar el contenedor de blur para el header
    setupHeaderBlurContainer();
  }, []);

  // Este componente no renderiza nada visible
  return null;
}
