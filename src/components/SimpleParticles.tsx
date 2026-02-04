import { useEffect, useRef } from 'react';

export default function SimpleParticles() {
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

    // Crear partículas
    const particles: Array<{
      x: number, 
      y: number, 
      vx: number, 
      vy: number, 
      size: number, 
      opacity: number, 
      color: string,
      life: number,
      maxLife: number
    }> = [];
    
    const colors = ['#a855f7', '#c084fc', '#e879f9', '#fbbf24', '#f59e0b'];
    
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.6 + 0.4,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1,
        maxLife: 200 + Math.random() * 300
      });
    }

    let animationId: number;
    let mouseX = canvas.width / 2;
    let mouseY = canvas.height / 2;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };

    canvas.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach(particle => {
        // Atracción sutil hacia el mouse
        const dx = mouseX - particle.x;
        const dy = mouseY - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 150) {
          const force = (150 - distance) / 150 * 0.01;
          particle.vx += (dx / distance) * force;
          particle.vy += (dy / distance) * force;
        }

        // Actualizar posición
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Fricción
        particle.vx *= 0.99;
        particle.vy *= 0.99;

        // Rebote en bordes
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -0.8;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -0.8;
        
        particle.x = Math.max(0, Math.min(canvas.width, particle.x));
        particle.y = Math.max(0, Math.min(canvas.height, particle.y));

        // Actualizar vida
        particle.life = Math.max(0, particle.life - 1/particle.maxLife);
        if (particle.life <= 0) {
          particle.x = Math.random() * canvas.width;
          particle.y = Math.random() * canvas.height;
          particle.vx = (Math.random() - 0.5) * 0.5;
          particle.vy = (Math.random() - 0.5) * 0.5;
          particle.life = 1;
          particle.color = colors[Math.floor(Math.random() * colors.length)];
        }

        // Dibujar partícula
        ctx.save();
        ctx.globalAlpha = particle.opacity * particle.life;
        ctx.fillStyle = particle.color;
        ctx.shadowColor = particle.color;
        ctx.shadowBlur = particle.size * 3;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Efecto de conexión entre partículas cercanas
        particles.forEach(other => {
          if (other === particle) return;
          const dx = other.x - particle.x;
          const dy = other.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            ctx.save();
            ctx.globalAlpha = (1 - distance / 100) * 0.1 * particle.life * other.life;
            ctx.strokeStyle = particle.color;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
            ctx.restore();
          }
        });
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
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
        background: 'radial-gradient(circle at 30% 40%, rgba(168, 85, 247, 0.1) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(192, 132, 252, 0.1) 0%, transparent 50%), linear-gradient(135deg, #581c87 0%, #7c3aed 50%, #a855f7 100%)'
      }}
    />
  );
}