// Componente Tooltip mejorado para el chat - Versión que evita la expansión del textarea
import React, { useState, useRef, useEffect } from 'react';
import './tooltip.css'; // Importar los estilos específicos para el tooltip

/**
 * Tooltip simple y directo para el botón de la bombilla que evita interferir con el textarea
 * Con aparición instantánea (0ms)
 */
const SimpleTooltip = ({ children, text }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef(null);

  // Función para evitar la propagación de eventos
  const stopPropagation = (e) => {
    // Detener que el evento burbujee hacia arriba en el DOM
    e.stopPropagation();
    // También cancelar el evento por completo
    e.preventDefault();
    e.nativeEvent.stopImmediatePropagation();
  };

  // Asegurar que el tooltip se muestre inmediatamente
  useEffect(() => {
    if (tooltipRef.current && showTooltip) {
      // Forzar la aparición inmediata
      tooltipRef.current.style.animation = 'none';
      tooltipRef.current.style.transition = 'none';
      tooltipRef.current.style.opacity = '1';
      tooltipRef.current.style.transform = 'translateX(-50%)';
    }
  }, [showTooltip]);

  return (
    <div
      className="tooltip-button-container"
      onMouseEnter={(e) => {
        stopPropagation(e);
        setShowTooltip(true);
      }}
      onMouseLeave={(e) => {
        stopPropagation(e);
        setShowTooltip(false);
      }}
      onClick={(e) => {
        // Solo detener la propagación, no prevenir el evento para que el botón funcione
        e.stopPropagation();
      }}
    >
      {children}

      {showTooltip && (
        <div
          ref={tooltipRef}
          className="tooltip-content instant-tooltip"
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginBottom: '10px',
            backgroundColor: '#333',
            color: '#fff',
            padding: '6px 10px',
            borderRadius: '4px',
            fontSize: '12px',
            whiteSpace: 'nowrap',
            zIndex: 1000,
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            pointerEvents: 'none',
            opacity: 1,
            // Sin transiciones o animaciones para que sea inmediato
          }}
        >
          {text}
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              borderWidth: '5px',
              borderStyle: 'solid',
              borderColor: '#333 transparent transparent transparent',
            }}
          ></div>
        </div>
      )}
    </div>
  );
};

export default SimpleTooltip;
