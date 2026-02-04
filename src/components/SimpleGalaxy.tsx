import { useEffect, useRef } from 'react';

export default function SimpleGalaxy() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (rect) {
        canvas.width = rect.width;
        canvas.height = rect.height;
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Crear estrellas más visibles
    const stars: Array<{x: number, y: number, size: number, opacity: number, speed: number}> = [];
    
    for (let i = 0; i < 100; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 4 + 2, // Estrellas más grandes
        opacity: Math.random() * 0.6 + 0.4, // Más opacas
        speed: Math.random() * 1 + 0.2 // Más rápidas
      });
    }
    
    console.log('SimpleGalaxy: Creadas', stars.length, 'estrellas');

    let animationId: number;

    const animate = () => {
      // Limpiar con fondo semi-transparente
      ctx.fillStyle = 'rgba(12, 12, 12, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      let visibleStars = 0;
      stars.forEach(star => {
        // Actualizar posición
        star.y += star.speed;
        if (star.y > canvas.height + star.size) {
          star.y = -star.size;
          star.x = Math.random() * canvas.width;
        }

        // Dibujar estrella principal (más brillante)
        ctx.save();
        ctx.globalAlpha = star.opacity;
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = star.size * 2;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Efecto de brillo azul
        ctx.save();
        ctx.globalAlpha = star.opacity * 0.5;
        ctx.fillStyle = '#4fc3f7';
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size * 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        
        visibleStars++;
      });
      
      // Debug info
      if (visibleStars > 0) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.fillText(`Stars: ${visibleStars}`, 10, 20);
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        background: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%)'
      }}
    />
  );
}