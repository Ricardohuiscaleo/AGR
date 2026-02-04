// 🔍 Script de debug para detectar problemas con clicks
console.log('🔍 Click Debug Script cargado');

document.addEventListener('DOMContentLoaded', () => {
  let clickCount = 0;
  
  // Debug de clicks
  document.addEventListener('click', (e) => {
    clickCount++;
    const target = e.target;
    console.log(`🖱️ Click #${clickCount}:`, {
      tag: target?.tagName || 'unknown',
      class: target?.className || '',
      id: target?.id || '',
      x: e.clientX,
      y: e.clientY,
      prevented: e.defaultPrevented
    });
  }, true);
  
  // Fix para inputs bloqueados
  setTimeout(() => {
    const inputs = document.querySelectorAll('input, textarea, button');
    inputs.forEach(input => {
      input.style.pointerEvents = 'auto';
      input.style.position = 'relative';
      input.style.zIndex = '9999';
    });
    console.log('🔧 Fix aplicado a', inputs.length, 'elementos');
  }, 1000);
  
  // Detectar elementos con z-index alto
  setTimeout(() => {
    const elements = document.querySelectorAll('*');
    const highZ = [];
    elements.forEach(el => {
      const zIndex = parseInt(window.getComputedStyle(el).zIndex);
      if (zIndex > 1000) {
        highZ.push({
          tag: el.tagName,
          class: el.className,
          zIndex: zIndex
        });
      }
    });
    if (highZ.length > 0) {
      console.log('🔝 Elementos con z-index alto:', highZ);
    }
  }, 1500);
  
  console.log('🔍 Debug activado. Haz click para ver logs.');
});