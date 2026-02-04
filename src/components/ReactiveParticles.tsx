import { useEffect, useRef } from 'react';

export default function ReactiveParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  useEffect(() => {
    console.log('🎆 ReactiveParticles: Component mounted');
    const canvas = canvasRef.current;
    if (!canvas) {
      console.warn('🎆 ReactiveParticles: Canvas not found');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.warn('🎆 ReactiveParticles: Context not found');
      return;
    }
    
    console.log('🎆 ReactiveParticles: Canvas and context ready');

    const resizeCanvas = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (rect) {
        canvas.width = rect.width;
        canvas.height = rect.height;
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Sistema de partículas reactivas
    const particles: Array<{
      x: number, y: number, vx: number, vy: number, 
      size: number, baseSize: number, energy: number,
      hue: number, saturation: number, brightness: number,
      connections: number[], pulsePhase: number
    }> = [];

    const particleCount = 60;
    let mouseX = canvas.width / 2;
    let mouseY = canvas.height / 2;
    let mousePressed = false;
    let time = 0;

    // Crear partículas
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: 2,
        baseSize: 1 + Math.random() * 3,
        energy: Math.random(),
        hue: 280 + Math.random() * 40, // Púrpura base
        saturation: 70 + Math.random() * 30,
        brightness: 50 + Math.random() * 50,
        connections: [],
        pulsePhase: Math.random() * Math.PI * 2
      });
    }

    // Event listeners
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };

    const handleMouseDown = () => { mousePressed = true; };
    const handleMouseUp = () => { mousePressed = false; };

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch) {
        touchStartRef.current = {
          x: touch.clientX,
          y: touch.clientY,
          time: Date.now()
        };
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch || !touchStartRef.current) return;
      
      const deltaX = Math.abs(touch.clientX - touchStartRef.current.x);
      const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);
      const deltaTime = Date.now() - touchStartRef.current.time;
      
      // Si es un gesto vertical rápido (scroll), no prevenir el comportamiento por defecto
      if (deltaY > deltaX && deltaY > 10 && deltaTime < 300) {
        return; // Permitir scroll
      }
      
      // Si es interacción con partículas (tap o movimiento horizontal)
      if (deltaTime > 100 || deltaX > deltaY) {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        mouseX = touch.clientX - rect.left;
        mouseY = touch.clientY - rect.top;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current) return;
      
      const touch = e.changedTouches[0];
      if (!touch) return;
      
      const deltaX = Math.abs(touch.clientX - touchStartRef.current.x);
      const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);
      const deltaTime = Date.now() - touchStartRef.current.time;
      
      // Si es un tap (poco movimiento y tiempo corto), activar interacción
      if (deltaX < 10 && deltaY < 10 && deltaTime < 300) {
        e.preventDefault();
        mousePressed = true;
        const rect = canvas.getBoundingClientRect();
        mouseX = touch.clientX - rect.left;
        mouseY = touch.clientY - rect.top;
        
        // Simular un click corto
        setTimeout(() => {
          mousePressed = false;
        }, 100);
      }
      
      touchStartRef.current = null;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });

    let animationId: number;

    const animate = () => {
      time += 0.016;
      
      // Limpieza completa del canvas (optimizado para rendimiento)
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Fondo sólido
      ctx.fillStyle = 'rgb(15, 15, 35)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Actualizar partículas
      particles.forEach((particle, i) => {
        // Calcular distancia al mouse
        const dx = mouseX - particle.x;
        const dy = mouseY - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Reactividad al mouse
        if (distance < 120) {
          const force = (120 - distance) / 120;
          const angle = Math.atan2(dy, dx);
          
          if (mousePressed) {
            // Atracción fuerte cuando se presiona
            particle.vx += Math.cos(angle) * force * 0.3;
            particle.vy += Math.sin(angle) * force * 0.3;
            particle.energy = Math.min(1, particle.energy + 0.05);
          } else {
            // Repulsión suave normalmente
            particle.vx -= Math.cos(angle) * force * 0.1;
            particle.vy -= Math.sin(angle) * force * 0.1;
            particle.energy = Math.min(1, particle.energy + 0.02);
          }
        }

        // Física básica
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vx *= 0.98; // Fricción
        particle.vy *= 0.98;

        // Rebote en bordes con efecto
        if (particle.x < 0 || particle.x > canvas.width) {
          particle.vx *= -0.7;
          particle.energy += 0.2;
        }
        if (particle.y < 0 || particle.y > canvas.height) {
          particle.vy *= -0.7;
          particle.energy += 0.2;
        }
        
        particle.x = Math.max(0, Math.min(canvas.width, particle.x));
        particle.y = Math.max(0, Math.min(canvas.height, particle.y));

        // Actualizar propiedades visuales
        particle.energy *= 0.99; // Decaimiento de energía
        particle.size = particle.baseSize + particle.energy * 4;
        particle.pulsePhase += 0.1;
        
        // Color reactivo basado en energía
        const energyHue = particle.hue + particle.energy * 60;
        const energySat = particle.saturation + particle.energy * 30;
        const energyBright = particle.brightness + particle.energy * 40;
        
        // Dibujar partícula con efectos
        ctx.save();
        
        // Pulso basado en energía
        const pulse = 1 + Math.sin(particle.pulsePhase) * particle.energy * 0.3;
        const finalSize = particle.size * pulse;
        
        // Sombra/glow
        ctx.shadowColor = `hsl(${energyHue}, ${energySat}%, ${energyBright}%)`;
        ctx.shadowBlur = finalSize * 2 + particle.energy * 10;
        
        // Núcleo de la partícula
        ctx.fillStyle = `hsl(${energyHue}, ${energySat}%, ${energyBright}%)`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, finalSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Anillo exterior si tiene mucha energía
        if (particle.energy > 0.5) {
          ctx.strokeStyle = `hsla(${energyHue + 30}, ${energySat}%, ${energyBright + 20}%, ${particle.energy})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, finalSize * 2, 0, Math.PI * 2);
          ctx.stroke();
        }
        
        ctx.restore();

        // Conexiones dinámicas
        particle.connections = [];
        particles.forEach((other, j) => {
          if (i >= j) return;
          
          const dx = other.x - particle.x;
          const dy = other.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 200) {
            particle.connections.push(j);
            
            const opacity = (1 - distance / 200) * 0.3;
            const avgEnergy = (particle.energy + other.energy) / 2;
            
            ctx.save();
            ctx.strokeStyle = `hsla(${(particle.hue + other.hue) / 2}, 60%, 70%, ${opacity + avgEnergy * 0.3})`;
            ctx.lineWidth = 0.5 + avgEnergy;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
            ctx.restore();
          }
        });
      });

      // Efecto de ondas desde el mouse si está presionado
      if (mousePressed) {
        const waveRadius = (time * 100) % 150;
        ctx.save();
        ctx.strokeStyle = `hsla(300, 80%, 60%, ${1 - waveRadius / 150})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, waveRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      animationId = requestAnimationFrame(animate);
    };

    console.log('🎆 ReactiveParticles: Starting animation with', particleCount, 'particles');
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: -1,
      background: 'radial-gradient(circle at 20% 30%, rgba(139, 92, 246, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(168, 85, 247, 0.1) 0%, transparent 50%), linear-gradient(135deg, #0f0f23 0%, #1a1a3a 50%, #2d1b69 100%)',
      borderRadius: '1rem',
      overflow: 'hidden'
    }}>
      <canvas 
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          touchAction: 'auto'
        }}
      />

    </div>
  );
}