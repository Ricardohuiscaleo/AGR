'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

export interface FlipWordsProps {
  words?: string[];
  texts?: string[];
  rotationInterval?: number;
  duration?: number;
  className?: string;
}

export const FlipWords = ({
  words = [],
  texts = [],
  rotationInterval = 2500,
  duration,
  className = '',
}: FlipWordsProps) => {
  const textArray = texts.length > 0 ? texts : words;
  const interval = duration || rotationInterval;
  const [index, setIndex] = useState(0);

  // Auto-rotate words
  useEffect(() => {
    if (textArray.length <= 1) return;

    const timer = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % textArray.length);
    }, interval);

    return () => clearInterval(timer);
  }, [textArray, interval]);

  // Simple render with minimal styling
  return (
    <span className={cn('inline-block relative', className)}>
      <div className="relative inline-block h-[1.2em]">
        {textArray.map((text, i) => (
          <motion.span
            key={text}
            className="absolute left-0 top-0 whitespace-nowrap"
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: i === index ? 1 : 0,
              y: i === index ? 0 : -20,
            }}
            transition={{
              opacity: { duration: 0.2 },
              y: { type: 'spring', stiffness: 100, damping: 15 },
            }}
          >
            {text}
          </motion.span>
        ))}
      </div>
    </span>
  );
};
