import React, { useEffect, useRef } from 'react';
import './scroll-reveal.css'; // Vamos a crear este archivo después

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  textClassName?: string;
  delay?: number;
}

const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  className = '',
  textClassName = '',
  delay = 0,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Función simple para verificar si un elemento está en el viewport
    const isInViewport = (el: HTMLElement) => {
      const rect = el.getBoundingClientRect();
      return (
        rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.8 &&
        rect.bottom >= 0
      );
    };

    // Función para activar la animación cuando el elemento es visible
    const handleScroll = () => {
      if (containerRef.current && isInViewport(containerRef.current)) {
        containerRef.current.classList.add('scroll-reveal-visible');
        window.removeEventListener('scroll', handleScroll);
      }
    };

    // Comprobamos inmediatamente y luego en cada scroll
    setTimeout(() => {
      handleScroll();
      window.addEventListener('scroll', handleScroll);
    }, 100);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [delay]);

  // Preparar las palabras con spans
  const renderContent = () => {
    if (typeof children !== 'string') return children;

    return children.split(' ').map((word, index) => (
      <span
        key={index}
        className="scroll-reveal-word"
        style={{
          transitionDelay: `${delay + index * 0.05}s`,
        }}
      >
        {word}&nbsp;
      </span>
    ));
  };

  return (
    <div ref={containerRef} className={`scroll-reveal ${className}`}>
      <div className={`scroll-reveal-content ${textClassName}`}>{renderContent()}</div>
    </div>
  );
};

export default ScrollReveal;
