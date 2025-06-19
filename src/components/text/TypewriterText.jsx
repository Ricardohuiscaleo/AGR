import { useState, useEffect, useRef } from 'react';

/**
 * Componente que crea un efecto de máquina de escribir en el texto
 * Puede alternar entre múltiples frases si se proporciona un array de textos
 */
export default function TypewriterText({
  text,
  speed = 50,
  startDelay = 0,
  cursor = true,
  className = '',
  loop = false,
  loopDelay = 2000,
  blinkCursor = true,
  deleteSpeed = 30,
  staticText = '',
}) {
  const [currentText, setCurrentText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [maxWidth, setMaxWidth] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(0);
  const containerRef = useRef(null);
  const hiddenTextRef = useRef(null);
  const textArray = Array.isArray(text) ? text : [text];
  const wrapperRef = useRef(null);
  const visibleCharsRef = useRef(0);

  // Safely initialize refs for browser environment
  const isMobileView = useRef(false);
  const isMobileCentered = useRef(false);

  // Track if component is mounted (client-side only)
  const isMounted = useRef(false);

  // Check for browser environment safely
  const isClient = typeof window !== 'undefined';

  // Detectar si estamos en vista móvil - solo en el cliente
  useEffect(() => {
    if (!isClient) return;

    isMounted.current = true;

    // Now that we're in the client, we can check window size
    isMobileView.current = window.innerWidth <= 768;

    // Verificar si tiene la clase mobile-centered
    isMobileCentered.current =
      className.includes('mobile-centered') ||
      wrapperRef.current?.closest('.mobile-centered') !== null;

    const checkMobile = () => {
      if (!isMounted.current) return;

      isMobileView.current = window.innerWidth <= 768;
      isMobileCentered.current =
        className.includes('mobile-centered') ||
        wrapperRef.current?.closest('.mobile-centered') !== null;
    };

    window.addEventListener('resize', checkMobile);

    return () => {
      isMounted.current = false;
      window.removeEventListener('resize', checkMobile);
    };
  }, [className, isClient]);

  // Calcular el ancho máximo de todas las frases cuando se monta el componente
  useEffect(() => {
    if (!isClient || !wrapperRef.current) return;

    // Capturar los estilos del wrapper para mantener consistencia
    const computedStyle = window.getComputedStyle(wrapperRef.current);

    // Función para calcular el ancho de un texto
    const calculateTextWidth = (text) => {
      const tempSpan = document.createElement('span');
      tempSpan.style.visibility = 'hidden';
      tempSpan.style.position = 'absolute';
      tempSpan.style.whiteSpace = 'nowrap';
      tempSpan.style.fontFamily = computedStyle.fontFamily;
      tempSpan.style.fontSize = computedStyle.fontSize;
      tempSpan.style.fontWeight = computedStyle.fontWeight;
      tempSpan.style.lineHeight = computedStyle.lineHeight;
      tempSpan.style.letterSpacing = computedStyle.letterSpacing;
      tempSpan.innerText = text;
      document.body.appendChild(tempSpan);

      const width = tempSpan.offsetWidth;
      document.body.removeChild(tempSpan);
      return width;
    };

    // Encontrar la frase más larga para determinar el ancho máximo
    let calculatedMaxWidth = 0;
    textArray.forEach((phrase) => {
      const width = calculateTextWidth(phrase);
      if (width > calculatedMaxWidth) {
        calculatedMaxWidth = width;
      }
    });

    // Agregar un pequeño margen para evitar problemas con algunos tipos de fuente
    setMaxWidth(calculatedMaxWidth + 5);
  }, [textArray, isClient]);

  // Implementación manual del efecto typewriter en lugar de usar CSS animations
  useEffect(() => {
    if (!isClient || !containerRef.current || maxWidth === 0 || textArray.length === 0) return;

    let currentPhraseIndex = 0;
    let isTyping = true; // true = escribiendo, false = borrando
    let charIndex = 0;
    let currentPhrase = '';
    let timeoutId = null;

    const updateText = () => {
      // Limpiar cualquier timeout pendiente
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      const phrase = textArray[currentPhraseIndex];

      if (isTyping) {
        // Escribiendo
        charIndex++;
        if (charIndex > phrase.length) {
          // Hemos terminado de escribir esta frase
          if (loop || currentPhraseIndex < textArray.length - 1) {
            // Esperar antes de empezar a borrar
            timeoutId = setTimeout(() => {
              isTyping = false;
              updateText();
            }, loopDelay);
            return;
          } else {
            // Es la última frase y no estamos en modo loop, mantenemos el texto
            return;
          }
        }

        // Mostrar los primeros charIndex caracteres
        currentPhrase = phrase.substring(0, charIndex);
        setCurrentText(currentPhrase);
        visibleCharsRef.current = charIndex;

        // Actualizar posición del cursor
        updateCursorPosition();

        // Programar la siguiente letra
        timeoutId = setTimeout(updateText, speed);
      } else {
        // Borrando
        charIndex--;
        if (charIndex <= 0) {
          // Hemos terminado de borrar
          charIndex = 0;
          isTyping = true;
          currentPhraseIndex = (currentPhraseIndex + 1) % textArray.length;

          // Empezar a escribir la siguiente frase
          timeoutId = setTimeout(updateText, speed);
          return;
        }

        // Mostrar los primeros charIndex caracteres mientras borramos
        currentPhrase = phrase.substring(0, charIndex);
        setCurrentText(currentPhrase);
        visibleCharsRef.current = charIndex;

        // Actualizar posición del cursor
        updateCursorPosition();

        // Programar el borrado de la siguiente letra
        timeoutId = setTimeout(updateText, deleteSpeed);
      }
    };

    const updateCursorPosition = () => {
      if (!containerRef.current) return;

      // En vista móvil con clase específica, no es necesario calcular posición
      if (isMobileView.current && isMobileCentered.current) {
        setCursorPosition(0); // El cursor será manejado con CSS
        return;
      }

      // Calcular el ancho del texto actual
      const tempSpan = document.createElement('span');
      tempSpan.style.visibility = 'hidden';
      tempSpan.style.position = 'absolute';
      tempSpan.style.whiteSpace = 'nowrap';
      tempSpan.style.font = window.getComputedStyle(containerRef.current).font;
      tempSpan.innerText = currentText;
      document.body.appendChild(tempSpan);

      const textWidth = tempSpan.offsetWidth;
      document.body.removeChild(tempSpan);

      // Actualizar la posición del cursor
      setCursorPosition(textWidth);
    };

    // Iniciar la animación con el retraso especificado
    timeoutId = setTimeout(updateText, startDelay);

    // Limpieza
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [textArray, speed, deleteSpeed, loopDelay, loop, startDelay, maxWidth, isClient]);

  // Determinar si estamos en modo centrado móvil - safely
  const isMobileCenteredMode = isClient && isMobileView.current && isMobileCentered.current;

  return (
    <span
      ref={wrapperRef}
      className={`typewriter-wrapper ${className}`}
      style={{
        position: 'relative',
        display: isMobileCenteredMode ? 'flex' : 'inline-flex',
        justifyContent: isMobileCenteredMode ? 'center' : 'flex-start',
        whiteSpace: 'nowrap',
        width: isMobileCenteredMode ? '100%' : 'auto',
      }}
    >
      {staticText && (
        <span className="static-text" style={{ marginRight: 0 }}>
          {staticText}
        </span>
      )}

      <span
        className="typewriter-container"
        style={{
          position: 'relative',
          display: 'inline-block',
          width: isMobileCenteredMode ? 'auto' : maxWidth ? `${maxWidth}px` : 'auto',
          height: '100%',
          verticalAlign: 'bottom',
          marginLeft: 0,
          marginRight: 0,
          padding: 0,
          textAlign: isMobileCenteredMode ? 'center' : 'left',
        }}
      >
        {/* Texto real visible con efecto typewriter */}
        <span
          ref={containerRef}
          className="typewriter-visible-text"
          style={{
            display: 'inline-block',
            whiteSpace: 'nowrap',
            textAlign: isMobileCenteredMode ? 'center' : 'left',
            verticalAlign: 'bottom',
            marginLeft: 0,
          }}
        >
          {currentText}
        </span>

        {/* Texto oculto para mantener el tamaño del contenedor */}
        <span
          ref={hiddenTextRef}
          aria-hidden="true"
          style={{
            position: 'absolute',
            visibility: 'hidden',
            height: 0,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          {/* Un espacio para mantener el contenedor ocupando espacio mínimo */}
          &nbsp;
        </span>

        {/* Cursor parpadeante */}
        {cursor && (
          <span
            className={`typewriter-cursor ${blinkCursor ? 'blinking-cursor' : ''}`}
            style={{
              position: isMobileCenteredMode ? 'relative' : 'relative',
              display: 'inline-block',
              left: isMobileCenteredMode ? 'auto' : 'auto',
              marginLeft: '-2px', // Pequeño ajuste para acercar el cursor al texto
              top: 0,
            }}
          >
            |
          </span>
        )}
      </span>

      <style jsx="true">{`
        .blinking-cursor {
          animation: blink 1s step-end infinite;
        }

        @keyframes blink {
          from,
          to {
            opacity: 1;
          }
          50% {
            opacity: 0;
          }
        }

        /* Ajustes específicos para mejorar el cursor en PC */
        @media (min-width: 769px) {
          .typewriter-cursor {
            display: inline-block;
            position: relative;
            margin-left: -2px;
            vertical-align: baseline;
          }
        }
      `}</style>
    </span>
  );
}
