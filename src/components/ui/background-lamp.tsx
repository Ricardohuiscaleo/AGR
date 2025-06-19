'use client';
import React from 'react';
import { motion } from 'motion/react';

export const BackgroundLampEffect = ({
  children,
  className = '',
  containerClassName = '',
  lightColor = 'cyan', // cyan, blue, purple, teal, orange
}: {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  lightColor?: string;
}) => {
  // Configuración de colores
  const colors: Record<string, { from: string; bg: string }> = {
    cyan: { from: 'rgb(56, 189, 248)', bg: 'rgb(6, 182, 212)' },
    blue: { from: 'rgb(59, 130, 246)', bg: 'rgb(37, 99, 235)' },
    purple: { from: 'rgb(168, 85, 247)', bg: 'rgb(147, 51, 234)' },
    teal: { from: 'rgb(45, 212, 191)', bg: 'rgb(20, 184, 166)' },
    orange: { from: 'rgb(251, 146, 60)', bg: 'rgb(249, 115, 22)' },
  };

  const color = colors[lightColor] || colors.cyan;

  return (
    <div
      className={`relative w-full pointer-events-none ${containerClassName}`}
      style={{ zIndex: 2 }}
    >
      {/* Efecto de luz */}
      <div className="absolute inset-0 w-full overflow-hidden" style={{ zIndex: -1 }}>
        <motion.div
          initial={{ opacity: 0.5, width: '15rem' }}
          animate={{ opacity: 0.8, width: '30rem' }}
          transition={{
            duration: 2,
            ease: 'easeInOut',
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            top: '10%',
            background: `radial-gradient(circle at center, ${color.from} 0%, transparent 70%)`,
            height: '20rem',
            width: '30rem',
            borderRadius: '50%',
            filter: 'blur(40px)',
            opacity: 0.8,
          }}
        />

        <motion.div
          initial={{ width: '8rem' }}
          animate={{ width: '16rem' }}
          transition={{
            duration: 3,
            ease: 'easeInOut',
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            top: '12%',
            background: `${color.bg}`,
            height: '6rem',
            width: '16rem',
            borderRadius: '50%',
            filter: 'blur(60px)',
            opacity: 0.5,
          }}
        />

        {/* Línea de luz horizontal */}
        <motion.div
          initial={{ width: '15rem', opacity: 0.3 }}
          animate={{ width: '25rem', opacity: 0.5 }}
          transition={{
            duration: 2.5,
            ease: 'easeInOut',
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            top: '24%',
            background: `${color.from}`,
            height: '2px',
            width: '25rem',
            opacity: 0.5,
          }}
        />
      </div>

      {/* Contenido */}
      <div className={className}>{children}</div>
    </div>
  );
};
