import { useState, useEffect } from 'react';

// Componente de loader inteligente que muestra qué está haciendo la IA
export const IntelligentLoader = ({ step, loadingState, progress = 0 }) => {
  const [currentMessage, setCurrentMessage] = useState('');
  const [dots, setDots] = useState('');
  const [currentPhase, setCurrentPhase] = useState(0);

  // Mensajes específicos para cada tipo de carga
  const loadingMessages = {
    calendar: [
      '🤖 IA analizando disponibilidad de horarios...',
      '📅 Procesando eventos del calendario...',
      '⚡ Calculando slots disponibles...',
      '🔍 Verificando conflictos de horarios...',
      '✨ Optimizando horarios disponibles...',
      '🎯 Encontrando las mejores opciones para ti...',
      '⏰ Sincronizando con el calendario principal...',
    ],
    timeSlots: [
      '🧠 IA calculando horarios óptimos...',
      '⏰ Analizando ventanas de tiempo...',
      '📊 Evaluando disponibilidad...',
      '🎯 Encontrando mejores opciones...',
      '🔄 Actualizando disponibilidad en tiempo real...',
      '✅ Validando horarios seleccionables...',
    ],
    tempBlock: [
      '🔒 IA reservando temporalmente tu horario...',
      '⚡ Creando bloqueo de seguridad...',
      '🛡️ Protegiendo tu selección...',
      '✅ Confirmando reserva temporal...',
      '⏱️ Iniciando contador de tiempo protegido...',
      '🔐 Asegurando tu horario elegido...',
    ],
    formProcessing: [
      '🤖 IA validando tus datos personales...',
      '📝 Procesando información de contacto...',
      '🔍 Verificando formato de email...',
      '✨ Preparando tu perfil de reserva...',
      '🛡️ Protegiendo tu información personal...',
      '📋 Completando validación de datos...',
    ],
    finalBooking: [
      '🚀 IA creando tu reserva definitiva...',
      '📧 Generando confirmación por email...',
      '📅 Sincronizando con calendario principal...',
      '🎉 Completando tu asesoría RAG...',
      '✅ Finalizando proceso de reserva...',
      '📬 Preparando notificaciones automáticas...',
      '🔔 Configurando recordatorios inteligentes...',
    ],
  };

  const stepTitles = {
    1: 'Paso 1: Selección de Horario',
    2: 'Paso 2: Datos Personales',
    3: 'Paso 3: Confirmación y Pago',
  };

  const stepDescriptions = {
    1: 'Analizando calendario',
    2: 'Procesando información personal de forma segura',
    3: 'Finalizando reserva',
  };

  useEffect(() => {
    const messages = loadingMessages[loadingState] || ['🤖 IA procesando...'];
    let messageIndex = 0;

    const messageInterval = setInterval(() => {
      setCurrentMessage(messages[messageIndex]);
      messageIndex = (messageIndex + 1) % messages.length;
      setCurrentPhase(messageIndex);
    }, 2000);

    const dotsInterval = setInterval(() => {
      setDots((prev) => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 500);

    return () => {
      clearInterval(messageInterval);
      clearInterval(dotsInterval);
    };
  }, [loadingState]);

  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 space-y-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
      {/* Título del paso actual */}
      {step && (
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">{stepTitles[step]}</h3>
          <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 mx-auto rounded-full"></div>
        </div>
      )}

      {/* Loader animado con IA brain */}
      <div className="relative">
        <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center animate-pulse">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
            </svg>
          </div>
        </div>
        {/* Anillo de progreso externo */}
        <div className="absolute -inset-2">
          <div className="w-24 h-24 border-2 border-purple-200 rounded-full animate-ping opacity-60"></div>
        </div>
      </div>

      {/* Mensaje de la IA */}
      <div className="text-center max-w-md">
        <p className="text-gray-700 font-medium mb-2 text-lg">
          {currentMessage}
          {dots}
        </p>

        {/* Barra de progreso */}
        {progress > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300 relative overflow-hidden"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
              {/* Línea de actividad */}
              <div className="absolute top-0 right-0 w-2 h-full bg-white opacity-50 animate-pulse"></div>
            </div>
          </div>
        )}

        <p className="text-sm text-gray-500">{step && stepDescriptions[step]}</p>
      </div>

      {/* Indicadores visuales de fases */}
      <div className="flex space-x-2">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentPhase % 3
                ? 'bg-blue-600 animate-bounce scale-125'
                : index === (currentPhase - 1) % 3
                  ? 'bg-blue-400 scale-110'
                  : 'bg-blue-200'
            }`}
            style={{ animationDelay: `${index * 0.1}s` }}
          ></div>
        ))}
      </div>

      {/* Mensaje de confianza */}
      <div className="text-center">
        <p className="text-xs text-gray-500 max-w-sm">
          <span className="font-medium text-blue-600">Tu asistente IA personal</span> está
          optimizando cada detalle para garantizar la mejor experiencia en tu asesoría RAG
        </p>
      </div>
    </div>
  );
};

// Componente de loader específico para procesamiento de formulario
export const FormProcessingLoader = ({ stage = 'validating' }) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const stages = {
    validating: {
      title: '🔍 IA Validando Datos',
      message: 'Verificando y protegiendo tu información personal...',
      steps: [
        'Verificando nombre completo',
        'Validando email corporativo',
        'Confirmando teléfono',
        'Protegiendo datos',
      ],
    },
    creating: {
      title: '🚀 IA Creando Reserva',
      message: 'Procesando tu solicitud de asesoría...',
      steps: [
        'Procesando solicitud',
        'Generando confirmación',
        'Preparando email',
        'Sincronizando calendario',
      ],
    },
    finalizing: {
      title: '✨ IA Finalizando',
      message: 'Completando tu asesoría RAG...',
      steps: [
        'Sincronizando calendario',
        'Configurando recordatorios',
        'Preparando notificaciones',
        'Finalizando reserva',
      ],
    },
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + Math.random() * 8;
        if (newProgress >= 100) {
          return 100;
        }

        // Actualizar paso actual basado en el progreso
        const newStep = Math.floor((newProgress / 100) * stages[stage].steps.length);
        setCurrentStep(newStep);

        return newProgress;
      });
    }, 400);

    return () => clearInterval(interval);
  }, [stage]);

  const currentStage = stages[stage];

  return (
    <div className="flex flex-col items-center justify-center py-10 px-6 space-y-8 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 rounded-xl border border-purple-200 shadow-lg">
      {/* Título e icono principal */}
      <div className="text-center">
        <div className="relative mb-4">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-xl">
            <svg
              className="w-12 h-12 text-white animate-pulse"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
            </svg>
          </div>
          {/* Indicador de actividad */}
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
            <div className="w-4 h-4 bg-white rounded-full animate-ping"></div>
          </div>
          {/* Anillos de actividad */}
          <div className="absolute -inset-4">
            <div className="w-32 h-32 border-2 border-purple-300 rounded-full animate-ping opacity-60"></div>
          </div>
        </div>

        <h3 className="text-xl font-bold text-gray-800 mb-2">{currentStage.title}</h3>
        <p className="text-gray-600 text-sm">{currentStage.message}</p>
      </div>

      {/* Barra de progreso principal */}
      <div className="w-full max-w-md">
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>Progreso</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500 relative"
            style={{ width: `${Math.min(progress, 100)}%` }}
          >
            {/* Efecto de brillo */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
            {/* Línea de actividad */}
            <div className="absolute top-0 right-0 w-2 h-full bg-white opacity-50 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Pasos del proceso */}
      <div className="space-y-3 w-full max-w-md">
        {currentStage.steps.map((step, index) => {
          const isCompleted = currentStep > index;
          const isActive = currentStep === index;

          return (
            <div key={index} className="flex items-center space-x-3 text-sm">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isCompleted
                    ? 'bg-green-500 text-white'
                    : isActive
                      ? 'bg-blue-500 text-white animate-pulse'
                      : 'bg-gray-200 text-gray-400'
                }`}
              >
                {isCompleted ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <span className="text-xs font-bold">{index + 1}</span>
                )}
              </div>
              <span
                className={`transition-all duration-300 ${
                  isCompleted
                    ? 'text-green-600 font-medium line-through'
                    : isActive
                      ? 'text-blue-600 font-medium'
                      : 'text-gray-500'
                }`}
              >
                {step}
              </span>
              {isActive && (
                <div className="flex space-x-1">
                  <div
                    className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"
                    style={{ animationDelay: '0ms' }}
                  ></div>
                  <div
                    className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"
                    style={{ animationDelay: '150ms' }}
                  ></div>
                  <div
                    className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"
                    style={{ animationDelay: '300ms' }}
                  ></div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mensaje de confianza actualizado */}
      <div className="text-center bg-white/50 rounded-lg p-4 max-w-md">
        <p className="text-sm text-gray-600">
          <span className="font-bold text-purple-600">Sistema IA Avanzado</span> procesando tu
          información con máxima seguridad y precisión para optimizar tu experiencia de asesoría RAG
        </p>
      </div>
    </div>
  );
};
