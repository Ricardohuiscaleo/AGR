export const measurePerformance = () => {
  if (!window.performance) return;

  // Esperar a que la página se cargue completamente
  Promise.all([
    document.readyState === 'complete'
      ? Promise.resolve()
      : new Promise((resolve) => window.addEventListener('load', resolve, { once: true })),
  ]).then(() => {
    setTimeout(() => {
      const paint = performance.getEntriesByType('paint');
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;
      const memory = (performance as any).memory;

      console.group('🚀 Métricas de Rendimiento');
      console.table({
        'First Paint (ms)': paint[0]?.startTime?.toFixed(2),
        'First Contentful Paint (ms)': paint[1]?.startTime?.toFixed(2),
        'DOM Interactive (ms)': navigation.domInteractive?.toFixed(2),
        'DOM Content Loaded (ms)': navigation.domContentLoadedEventEnd?.toFixed(2),
        'Load Complete (ms)': navigation.loadEventEnd?.toFixed(2),
        'TTFB (ms)': navigation.responseStart?.toFixed(2),
        'Memoria Usada (MB)': memory
          ? (memory.usedJSHeapSize / 1048576).toFixed(2)
          : 'No disponible',
      });

      // Métricas de recursos
      const resources = performance.getEntriesByType('resource');
      const resourceStats = resources.reduce(
        (acc, resource) => {
          const type = (resource as PerformanceResourceTiming).initiatorType;
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      console.log('📦 Recursos Cargados:', resourceStats);
      console.groupEnd();
    }, 0);
  });
};

export const enhancedPerformanceMeasure = () => {
  // Añadir monitoreo de FPS para detectar caídas de rendimiento
  let lastTime = performance.now();
  let frames = 0;
  let fps = 0;

  const measureFPS = () => {
    const now = performance.now();
    frames++;

    if (now >= lastTime + 1000) {
      fps = frames;
      frames = 0;
      lastTime = now;
      console.log(`📊 FPS: ${fps}`);

      // Alertar si el rendimiento es bajo
      if (fps < 30) {
        console.warn('⚠️ Rendimiento bajo detectado - considerar desactivar efectos visuales');
      }
    }

    requestAnimationFrame(measureFPS);
  };

  // Iniciar medición de FPS
  requestAnimationFrame(measureFPS);
};
