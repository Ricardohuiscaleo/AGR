import { useEffect, useState } from 'react';

// Splatch effect - animates elements with splash/ripple effects
export const useSplatch = (
  options: {
    duration?: number;
    color?: string;
    size?: number;
    targetRef?: React.RefObject<HTMLElement>;
    autoTrigger?: boolean;
    triggerDelay?: number;
  } = {}
) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const {
    duration = 600,
    color = 'rgba(56, 189, 248, 0.5)',
    size = 150,
    targetRef = null,
    autoTrigger = false,
    triggerDelay = 0,
  } = options;

  // Function to trigger the splash animation
  const triggerSplash = (x?: number, y?: number) => {
    if (isAnimating) return;

    if (typeof x === 'number' && typeof y === 'number') {
      setPosition({ x, y });
    } else if (targetRef && targetRef.current) {
      // If no coordinates provided, use the center of the target element
      const rect = targetRef.current.getBoundingClientRect();
      setPosition({
        x: rect.width / 2,
        y: rect.height / 2,
      });
    }

    setIsAnimating(true);

    // Reset animation after duration
    setTimeout(() => {
      setIsAnimating(false);
    }, duration);
  };

  // Auto-trigger effect if enabled
  useEffect(() => {
    if (autoTrigger) {
      const timeout = setTimeout(() => {
        triggerSplash();
      }, triggerDelay);

      return () => clearTimeout(timeout);
    }
  }, [autoTrigger, triggerDelay]);

  return {
    isAnimating,
    position,
    triggerSplash,
    duration,
    color,
    size,
  };
};

export default useSplatch;
