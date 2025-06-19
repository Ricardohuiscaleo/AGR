import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const messages = {
  calendar: ['Analizando calendario...', 'Calculando disponibilidad...', 'Optimizando horarios...'],
  form: ['Validando información...', 'Protegiendo datos...', 'Creando perfil...'],
  booking: [
    'Confirmando con el servidor...',
    'Sincronizando calendarios...',
    'Finalizando reserva...',
  ],
};

export const IntelligentLoader: React.FC<{ stage: keyof typeof messages }> = ({ stage }) => {
  const [messageIndex, setMessageIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages[stage].length);
    }, 1500);
    return () => clearInterval(interval);
  }, [stage]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center space-y-4 p-8"
    >
      <div className="relative w-16 h-16">
        <motion.div
          className="absolute inset-0 border-4 border-blue-200 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        <div className="absolute inset-0 flex items-center justify-center text-2xl">🤖</div>
      </div>
      <p className="text-center text-gray-600 font-medium">{messages[stage][messageIndex]}</p>
    </motion.div>
  );
};
