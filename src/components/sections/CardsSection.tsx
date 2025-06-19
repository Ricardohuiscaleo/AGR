'use client';

import React, { useEffect, useRef } from 'react';
import { Card } from '../ui/card';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Registrar plugins de GSAP
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const servicios = [
  {
    icon: '🤖',
    title: 'Automatización Inteligente',
    description:
      'Simplifica procesos y tareas repetitivas con soluciones basadas en IA que aprenden y se adaptan a tus necesidades específicas.',
    iconClass: 'text-blue-500',
  },
  {
    icon: '📊',
    title: 'Análisis de Datos',
    description:
      'Transforma tus datos en insights accionables con nuestro sistema de análisis potenciado por tecnología RAG.',
    iconClass: 'text-green-500',
  },
  {
    icon: '🔍',
    title: 'Búsqueda Semántica',
    description:
      'Encuentra información relevante instantáneamente en tus documentos y bases de datos con búsquedas que entienden el contexto.',
    iconClass: 'text-purple-500',
  },
  {
    icon: '💬',
    title: 'Atención al Cliente 24/7',
    description:
      'Ofrece respuestas precisas a tus clientes en cualquier momento con asistentes virtuales que conocen tu negocio.',
    iconClass: 'text-yellow-500',
  },
  {
    icon: '📝',
    title: 'Generación de Contenido',
    description:
      'Crea contenido relevante y personalizado automáticamente para diferentes canales basado en tus propios datos.',
    iconClass: 'text-red-500',
  },
  {
    icon: '🔄',
    title: 'Integración con Sistemas',
    description:
      'Conecta tus herramientas existentes con nuestra plataforma para potenciar tu infraestructura actual.',
    iconClass: 'text-indigo-500',
  },
];

interface CardsSectionProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

export function CardsSection({
  title = 'Nuestros Servicios',
  subtitle = 'Soluciones de IA adaptadas a las necesidades de tu empresa',
  className = '',
}: CardsSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const cards = cardsRef.current;

    if (!section || !cards) return;

    // Animación para el título y subtítulo
    gsap.fromTo(
      section.querySelector('.section-header'),
      {
        y: 50,
        opacity: 0,
      },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
        },
      }
    );

    // Animación para las tarjetas con efecto escalonado
    gsap.fromTo(
      cards.querySelectorAll('.card-container'),
      {
        y: 100,
        opacity: 0,
      },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: cards,
          start: 'top 85%',
        },
      }
    );

    return () => {
      // Limpiar ScrollTriggers al desmontar
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <section ref={sectionRef} className={`cards-section py-16 px-4 ${className}`}>
      <div className="section-header text-center mb-12">
        <h2 className="section-title text-3xl md:text-4xl font-bold mb-3">{title}</h2>
        <p className="section-subtitle text-lg opacity-80 max-w-2xl mx-auto">{subtitle}</p>
      </div>

      <div
        ref={cardsRef}
        className="cards-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 container mx-auto"
      >
        {servicios.map((servicio, index) => (
          <Card
            key={index}
            title={servicio.title}
            description={servicio.description}
            icon={servicio.icon}
            iconClass={servicio.iconClass}
            className="h-full"
          />
        ))}
      </div>

      <style jsx>{`
        .cards-section {
          position: relative;
          overflow: hidden;
        }

        .section-title {
          background: linear-gradient(90deg, #3b82f6, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-fill-color: transparent;
        }

        .cards-grid {
          max-width: 1200px;
        }

        /* Estilos para tema oscuro */
        :global(html[data-theme='dark']) .section-title {
          background: linear-gradient(90deg, #60a5fa, #a78bfa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-fill-color: transparent;
        }

        :global(html[data-theme='dark']) .section-subtitle {
          color: rgba(255, 255, 255, 0.8);
        }

        /* Estilos para tema claro */
        :global(html[data-theme='light']) .section-subtitle {
          color: rgba(30, 30, 50, 0.8);
        }
      `}</style>
    </section>
  );
}
