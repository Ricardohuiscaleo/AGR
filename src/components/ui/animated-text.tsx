'use client';

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface AnimatedLetterProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  effectType?: 'rotate' | 'pulse' | 'scale' | 'float' | 'shake' | 'bounce' | 'random';
  intensity?: 'light' | 'medium' | 'strong';
  className?: string;
  hoverEffect?: boolean;
  repeating?: boolean;
}

const getAnimationByType = (type: string, intensity: string) => {
  // Factores de intensidad
  const factors = {
    light: 0.5,
    medium: 1,
    strong: 1.5,
  };
  const factor = factors[intensity as keyof typeof factors];

  switch (type) {
    case 'rotate':
      return {
        animate: {
          rotate: [0, 5 * factor, -5 * factor, 0],
          transition: { repeat: Infinity, repeatType: 'loop' as const, duration: 3 },
        },
        hover: {
          rotate: 15 * factor,
          transition: { duration: 0.3 },
        },
      };
    case 'pulse':
      return {
        animate: {
          scale: [1, 1 + 0.1 * factor, 1],
          transition: { repeat: Infinity, repeatType: 'loop' as const, duration: 2 },
        },
        hover: {
          scale: 1 + 0.2 * factor,
          transition: { duration: 0.3 },
        },
      };
    case 'scale':
      return {
        animate: {
          scaleX: [1, 1 + 0.15 * factor, 1 - 0.05 * factor, 1],
          transition: { repeat: Infinity, repeatType: 'loop' as const, duration: 3 },
        },
        hover: {
          scaleX: 1.3 * factor,
          transition: { duration: 0.3 },
        },
      };
    case 'float':
      return {
        animate: {
          y: [0, -4 * factor, 0],
          transition: { repeat: Infinity, repeatType: 'loop' as const, duration: 2.5 },
        },
        hover: {
          y: -8 * factor,
          transition: { duration: 0.3 },
        },
      };
    case 'shake':
      return {
        animate: {
          x: [0, 2 * factor, -2 * factor, 0],
          transition: { repeat: Infinity, repeatType: 'loop' as const, duration: 0.5 },
        },
        hover: {
          x: [0, 5 * factor, -5 * factor, 0],
          transition: { duration: 0.3, repeat: 3, repeatType: 'loop' as const },
        },
      };
    case 'bounce':
      return {
        animate: {
          y: [0, 5 * factor, 0],
          transition: {
            repeat: Infinity,
            repeatType: 'loop' as const,
            duration: 1,
            ease: 'easeInOut',
          },
        },
        hover: {
          y: [-10 * factor, 0],
          transition: { duration: 0.5, repeat: 1, repeatType: 'reverse' as const, ease: 'easeOut' },
        },
      };
    default:
      return {};
  }
};

export const AnimatedLetter: React.FC<AnimatedLetterProps> = ({
  children,
  delay = 0,
  duration = 1,
  effectType = 'pulse',
  intensity = 'medium',
  className = '',
  hoverEffect = true,
  repeating = true,
}) => {
  const randomEffect = useRef<string>(
    effectType === 'random'
      ? ['rotate', 'pulse', 'scale', 'float', 'shake', 'bounce'][Math.floor(Math.random() * 6)]
      : effectType
  );

  const animation = getAnimationByType(randomEffect.current, intensity);

  return (
    <motion.span
      className={`inline-block ${className}`}
      initial={repeating ? undefined : { opacity: 0, y: 10 }}
      animate={repeating ? (animation.animate ?? {}) : { opacity: 1, y: 0 }}
      whileHover={hoverEffect ? (animation.hover ?? undefined) : undefined}
      transition={{
        delay: delay,
        duration: duration,
      }}
    >
      {children}
    </motion.span>
  );
};

interface AnimatedTextProps {
  text: string;
  effectType?: 'rotate' | 'pulse' | 'scale' | 'float' | 'shake' | 'bounce' | 'mixed' | 'random';
  intensity?: 'light' | 'medium' | 'strong';
  staggerChildren?: boolean;
  delayBetween?: number;
  animationDuration?: number;
  className?: string;
  charClassName?: string;
  hoverEffect?: boolean;
  repeating?: boolean;
}

export const AnimatedText: React.FC<AnimatedTextProps> = ({
  text,
  effectType = 'pulse',
  intensity = 'medium',
  staggerChildren = true,
  delayBetween = 0.1,
  animationDuration = 1,
  className = '',
  charClassName = '',
  hoverEffect = true,
  repeating = true,
}) => {
  return (
    <span className={`inline-block ${className}`}>
      {Array.from(text).map((char, index) => {
        // Elegir un efecto para cada letra si es 'mixed'
        const effect =
          effectType === 'mixed'
            ? ['rotate', 'pulse', 'scale', 'float', 'shake', 'bounce'][index % 6]
            : effectType;

        return (
          <AnimatedLetter
            key={`${index}-${char}`}
            delay={staggerChildren ? index * delayBetween : 0}
            duration={animationDuration}
            effectType={effect as any}
            intensity={intensity}
            className={charClassName}
            hoverEffect={hoverEffect}
            repeating={repeating}
          >
            {char === ' ' ? '\u00A0' : char}
          </AnimatedLetter>
        );
      })}
    </span>
  );
};
