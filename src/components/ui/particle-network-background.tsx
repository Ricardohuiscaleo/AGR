'use client';

import React, { useEffect, useRef } from 'react';
import { cn } from '../../utils/cn';

interface ParticleNetworkBackgroundProps {
  className?: string;
  children?: React.ReactNode;
}

export const ParticleNetworkBackground: React.FC<ParticleNetworkBackgroundProps> = ({
  className,
  children,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const particlesRef = useRef<any[]>([]);
  const mouseRef = useRef({ x: null as number | null, y: null as number | null });
  const isVisibleRef = useRef(true);

  const concepts = [
    'IA (Inteligencia Artificial)',
    'Machine Learning',
    'Deep Learning',
    'PLN (Procesamiento del Lenguaje Natural)',
    'Transformers',
    'Embeddings',
    'Recuperación de Información',
    'Generación de Lenguaje Natural',
    'Indexación',
    'Búsqueda Semántica',
    'Semántica',
    'Tokenización',
    'Fine-Tuning',
    'Contextualización',
    'Conocimiento',
    'Inferencia',
    'Redes',
    'Modelos',
    'Arquitectura',
    'In-context Learning',
    'Webhook',
    'Gemini',
    'Claude',
    'DeepSeek',
    'OpenAI',
    'API',
    'Sub-Agente RAG',
    'Output Parser',
    '.json',
    '.Tsx',
    '.jsx',
    '.py',
    '.Astro',
    'HTML5',
    'n8n',
    'Langflow',
    'Flowise',
    'LangChain',
    'LlamaIndex',
    'Grok',
    'Zapier',
    'Node-RED',
    'Supabase',
    'Docker',
    'Kubernetes',
    'TensorFlow',
    'PyTorch',
    'Pinecone',
    'Qdrant',
    'PostgreSQL',
    'Redis',
    'Apache Airflow',
    'Elasticsearch',
    'Kafka',
    'Streamlit',
    'FastAPI',
    'Flask',
    'HuggingFace Transformers',
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const speedMultiplier = 1.3;
    const interactionForce = 0.5;
    const lineColor = 'rgba(100, 150, 255, 0.4)';
    const highlightColor = 'rgba(255, 100, 150, 0.8)';
    const particleColor = 'rgba(120, 180, 255, 0.9)';
    const reactionColor = 'rgba(255, 120, 180, 0.9)';
    const dataPacketColor = 'rgba(255, 255, 255, 0.8)';

    class Particle {
      x: number;
      y: number;
      size: number;
      baseSize: number;
      color: string;
      speedX: number;
      speedY: number;
      maxSpeed: number;
      touchCreated: boolean;
      creationTime: number;
      concept: string;

      constructor(
        x: number,
        y: number,
        size: number,
        color: string,
        speedX: number,
        speedY: number,
        concept?: string
      ) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.baseSize = size;
        this.color = color;
        this.speedX = speedX * speedMultiplier;
        this.speedY = speedY * speedMultiplier;
        this.maxSpeed = 1 * speedMultiplier;
        this.touchCreated = false;
        this.creationTime = 0;
        this.concept = concept || this.getRandomConcept();
      }

      getRandomConcept() {
        const usedConcepts = particlesRef.current.map((p) => p.concept);
        const available = concepts.filter((c) => c !== 'Agente RAG' && !usedConcepts.includes(c));
        return available.length > 0
          ? available[Math.floor(Math.random() * available.length)]
          : concepts.filter((c) => c !== 'Agente RAG')[
              Math.floor(Math.random() * (concepts.length - 1))
            ];
      }

      draw() {
        if (!ctx) return;

        ctx.fillStyle = this.color;
        ctx.beginPath();
        if (this.touchCreated && performance.now() - this.creationTime < 1000) {
          const elapsed = performance.now() - this.creationTime;
          const pulse = 1 + 0.5 * Math.sin((2 * Math.PI * elapsed) / 500);
          ctx.arc(this.x, this.y, this.baseSize * pulse, 0, Math.PI * 2);
        } else {
          this.touchCreated = false;
          ctx.arc(this.x, this.y, this.baseSize, 0, Math.PI * 2);
        }
        ctx.closePath();
        ctx.fill();

        if (this.concept === 'Agente RAG') {
          ctx.fillStyle = '#FFD700';
          ctx.font = 'bold 11px sans-serif';
        } else {
          ctx.fillStyle = '#E5E7EB';
          ctx.font = '10px sans-serif';
        }
        ctx.fillText(this.concept, this.x, this.y + 12);
      }

      update() {
        const rect = canvas!.getBoundingClientRect();

        if (mouseRef.current.x !== null && mouseRef.current.y !== null) {
          const dx = mouseRef.current.x - this.x;
          const dy = mouseRef.current.y - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 75) {
            const forceX = dx / distance;
            const forceY = dy / distance;
            this.speedX -= forceX * interactionForce;
            this.speedY -= forceY * interactionForce;
          }
        }

        const speed = Math.sqrt(this.speedX ** 2 + this.speedY ** 2);
        if (speed > this.maxSpeed) {
          this.speedX = (this.speedX / speed) * this.maxSpeed;
          this.speedY = (this.speedY / speed) * this.maxSpeed;
        }
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x + this.baseSize > rect.width || this.x - this.baseSize < 0) {
          this.speedX = -this.speedX;
        }
        if (this.y + this.baseSize > rect.height || this.y - this.baseSize < 0) {
          this.speedY = -this.speedY;
        }
        this.draw();
      }
    }

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const init = () => {
      particlesRef.current = [];
      const rect = canvas.getBoundingClientRect();
      const numberOfParticles = window.innerWidth < 768 ? 25 : 30;

      for (let i = 0; i < numberOfParticles; i++) {
        const size = Math.random() * (rect.width / 200) + 1;
        const x = Math.random() * (rect.width - size * 2);
        const y = Math.random() * (rect.height - size * 2);
        const baseSpeedX = Math.random() * 0.2 - 0.1;
        const baseSpeedY = Math.random() * 0.2 - 0.1;
        particlesRef.current.push(new Particle(x, y, size, particleColor, baseSpeedX, baseSpeedY));
      }

      // Agente RAG permanente en magenta con tamaño fijo (30% del máximo)
      const maxSize = rect.width / 200 + 1;
      const ragSize = maxSize * 0.3;
      const x = rect.width / 2;
      const y = rect.height / 2;
      const baseSpeedX = Math.random() * 0.2 - 0.1;
      const baseSpeedY = Math.random() * 0.2 - 0.1;
      particlesRef.current.push(
        new Particle(x, y, ragSize, 'rgba(255, 215, 0, 0.9)', baseSpeedX, baseSpeedY, 'Agente RAG')
      );
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particlesRef.current.length; i++) {
        for (let j = i; j < particlesRef.current.length; j++) {
          const dx = particlesRef.current[i].x - particlesRef.current[j].x;
          const dy = particlesRef.current[i].y - particlesRef.current[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // Agente RAG tiene 50% más alcance de conexión
          const connectionRange =
            particlesRef.current[i].concept === 'Agente RAG' ||
            particlesRef.current[j].concept === 'Agente RAG'
              ? 500
              : 200;

          if (distance < connectionRange) {
            ctx.beginPath();
            const now = performance.now();
            if (
              (particlesRef.current[i].touchCreated &&
                now - particlesRef.current[i].creationTime < 1000) ||
              (particlesRef.current[j].touchCreated &&
                now - particlesRef.current[j].creationTime < 1000)
            ) {
              ctx.strokeStyle = highlightColor;
              ctx.lineWidth = 1.0;
            } else {
              ctx.strokeStyle = lineColor;
              ctx.lineWidth = 0.5;
            }
            ctx.moveTo(particlesRef.current[i].x, particlesRef.current[i].y);
            ctx.lineTo(particlesRef.current[j].x, particlesRef.current[j].y);
            ctx.stroke();

            const offset = ((i * 37 + j * 19) % 100) / 100;
            const t = (performance.now() / 2000 + offset) % 1;
            const packetX =
              particlesRef.current[i].x +
              t * (particlesRef.current[j].x - particlesRef.current[i].x);
            const packetY =
              particlesRef.current[i].y +
              t * (particlesRef.current[j].y - particlesRef.current[i].y);
            const angle = Math.atan2(
              particlesRef.current[j].y - particlesRef.current[i].y,
              particlesRef.current[j].x - particlesRef.current[i].x
            );

            ctx.save();
            ctx.translate(packetX, packetY);
            ctx.rotate(angle);
            ctx.fillStyle = dataPacketColor;
            ctx.fillRect(-2, -1, 4, 2);
            ctx.restore();
          }
        }
      }

      particlesRef.current.forEach((p) => p.update());
      animationRef.current = requestAnimationFrame(draw);
    };

    const createInteractionParticle = (x: number, y: number) => {
      particlesRef.current.forEach((particle) => {
        const dx = x - particle.x;
        const dy = y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 75) {
          const forceX = dx / distance;
          const forceY = dy / distance;
          particle.speedX -= forceX * interactionForce;
          particle.speedY -= forceY * interactionForce;
          particle.color = reactionColor;
          setTimeout(() => {
            particle.color = particleColor;
          }, 200);
        }
      });

      particlesRef.current = particlesRef.current.filter(
        (p) => !p.touchCreated || p.concept === 'Agente RAG'
      );

      const rect = canvas.getBoundingClientRect();
      const size = Math.random() * (rect.width / 200) + 1;
      const baseSpeedX = Math.random() * 0.2 - 0.1;
      const baseSpeedY = Math.random() * 0.2 - 0.1;

      const newParticle = new Particle(x, y, size, reactionColor, baseSpeedX, baseSpeedY);
      newParticle.touchCreated = true;
      newParticle.creationTime = performance.now();
      particlesRef.current.push(newParticle);

      const maxParticles = window.innerWidth < 768 ? 15 : 30;
      while (particlesRef.current.length > maxParticles) {
        const index = particlesRef.current.findIndex((p) => p.concept !== 'Agente RAG');
        if (index !== -1) {
          particlesRef.current.splice(index, 1);
        } else {
          break;
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
    };

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      createInteractionParticle(x, y);
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.changedTouches[0];
      const rect = canvas.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      createInteractionParticle(x, y);
    };

    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        resizeCanvas();
        // Solo reinicializar si el cambio de tamaño es significativo
        const rect = canvas.getBoundingClientRect();
        if (
          Math.abs(rect.width - canvas.offsetWidth) > 50 ||
          Math.abs(rect.height - canvas.offsetHeight) > 50
        ) {
          init();
        }
      }, 150);
    };

    // Intersection Observer para auto-stop/start
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisibleRef.current = entry.isIntersecting;
          if (entry.isIntersecting && !animationRef.current) {
            draw();
          }
        });
      },
      { threshold: 0.1 }
    );

    if (container) {
      observer.observe(container);
    }

    resizeCanvas();
    init();
    draw();

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      observer.disconnect();
      clearTimeout(resizeTimeout);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div ref={containerRef} className={cn('relative w-full h-full bg-gray-800', className)}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full bg-transparent pointer-events-auto"
        style={{ zIndex: 1 }}
      />
      <div className="relative z-10 w-full h-full">{children}</div>
    </div>
  );
};
