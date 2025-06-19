import { useState, useEffect, useRef } from 'react';

const BlurText = ({ text, delay = 200, className = '', duration = 450, initialBlur = 5 }) => {
  const [blurAmount, setBlurAmount] = useState(initialBlur);
  const containerRef = useRef(null);
  const isVisible = useRef(false);
  const animationTriggered = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        isVisible.current = entry.isIntersecting;

        if (isVisible.current && !animationTriggered.current) {
          animationTriggered.current = true;
          setTimeout(() => {
            if (isVisible.current) {
              const steps = 20;
              const stepDuration = duration / steps;
              let currentStep = 0;

              const timer = setInterval(() => {
                currentStep++;
                const progress = currentStep / steps;
                setBlurAmount(Math.max(0, Math.floor(initialBlur * (1 - progress))));

                if (currentStep >= steps) {
                  clearInterval(timer);
                }
              }, stepDuration);
            }
          }, delay);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [delay, duration, initialBlur]);

  return (
    <div ref={containerRef} className={className}>
      <span
        style={{
          filter: `blur(${blurAmount}px)`,
          transition: 'filter 0.3s ease',
          display: 'inline-block',
        }}
      >
        {text}
      </span>
    </div>
  );
};

export default BlurText;
