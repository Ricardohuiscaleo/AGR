// Utilidades de animación con GSAP
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Asegurarse de que GSAP está disponible en el entorno del navegador
let isGsapAvailable = false;

// Inicializar GSAP y sus plugins de forma perezosa (lazy loading)
export const initGsap = async () => {
  try {
    // Importar GSAP solo cuando sea necesario
    gsap.registerPlugin(ScrollTrigger);
    isGsapAvailable = true;
    return true;
  } catch (error) {
    console.warn('GSAP no pudo ser inicializado:', error);
    document.documentElement.classList.add('gsap-fallback');
    return false;
  }
};

// Animaciones de entrada para elementos específicos por selector
export const animateElement = (selector: string, animationProps: gsap.TweenVars) => {
  if (!isGsapAvailable) return null;

  const elements = document.querySelectorAll(selector);
  if (elements.length === 0) return null;

  return gsap.from(elements, animationProps);
};

// Animación para elementos con ScrollTrigger
export const createScrollAnimation = (
  selector: string,
  animationProps: gsap.TweenVars,
  triggerProps: ScrollTrigger.Vars
) => {
  if (!isGsapAvailable) return null;

  const elements = document.querySelectorAll(selector);
  if (elements.length === 0) return null;

  return gsap.from(elements, {
    ...animationProps,
    scrollTrigger: {
      trigger: selector,
      start: 'top 80%',
      end: 'bottom 20%',
      toggleActions: 'play none none reverse',
      ...triggerProps,
    },
  });
};

// Función para actualizar los colores de gradiente según el tema
export const setupThemeColorUpdater = (selector: string) => {
  const gradientTextElement = document.querySelector(selector) as HTMLElement;
  if (!gradientTextElement) return;

  // Función para actualizar los colores según el tema
  const updateGradientColors = () => {
    const isDarkMode =
      document.documentElement.getAttribute('data-theme') === 'dark' ||
      (!document.documentElement.hasAttribute('data-theme') &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);

    const lightColors = JSON.parse(
      gradientTextElement.getAttribute('data-light-colors') ||
        '["#00a6ff", "#10b981", "#f97316", "#ec4899", "#0099ff", "#10b981"]'
    );

    const darkColors = JSON.parse(
      gradientTextElement.getAttribute('data-dark-colors') ||
        '["#06b6d4", "#22c55e", "#fb923c", "#d946ef", "#00b8ff", "#22c55e"]'
    );

    const colorsToUse = isDarkMode ? darkColors : lightColors;
    gradientTextElement.style.backgroundImage = `linear-gradient(to right, ${colorsToUse.join(', ')})`;
  };

  // Observar cambios en el atributo data-theme
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'data-theme') {
        updateGradientColors();
      }
    });
  });

  observer.observe(document.documentElement, { attributes: true });

  // También escuchar cambios en el esquema de colores del sistema
  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', updateGradientColors);

  // Establecer los colores iniciales
  updateGradientColors();

  return updateGradientColors;
};

// Configurar el contenedor de blur para el header
export const setupHeaderBlurContainer = () => {
  const headerBlurContainer = document.getElementById('header-blur-container');
  const header = document.getElementById('site-header');
  const hamburgerInput = document.querySelector('.hamburger input');

  if (!headerBlurContainer || !header) return;

  // Función para actualizar el contenedor de blur basado en el estado del header
  const updateBlurContainer = () => {
    // Sincronizar con estado sticky
    if (header.classList.contains('sticky')) {
      headerBlurContainer.classList.add('sticky');
    } else {
      headerBlurContainer.classList.remove('sticky');
    }

    // Sincronizar con estado expandido
    if (header.classList.contains('is-expanded')) {
      headerBlurContainer.classList.add('expanded');
    } else {
      headerBlurContainer.classList.remove('expanded');
    }

    // Sincronizar con estado oculto
    if (header.classList.contains('hide')) {
      headerBlurContainer.classList.add('hidden');
    } else {
      headerBlurContainer.classList.remove('hidden');
    }
  };

  // Observar cambios en las clases del header
  const headerObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'class') {
        updateBlurContainer();
      }
    });
  });

  // Iniciar observación del header
  headerObserver.observe(header, { attributes: true });

  // También conectar directamente al evento change del hamburger
  if (hamburgerInput && hamburgerInput instanceof HTMLInputElement) {
    hamburgerInput.addEventListener('change', () => {
      updateBlurContainer();
    });
  }

  // Estado inicial
  setTimeout(updateBlurContainer, 100);

  // También actualizar cuando cambie el tamaño de la ventana
  window.addEventListener('resize', updateBlurContainer);

  // Escuchar eventos de scroll para asegurar sincronización
  window.addEventListener(
    'scroll',
    () => {
      requestAnimationFrame(updateBlurContainer);
    },
    { passive: true }
  );

  return updateBlurContainer;
};
