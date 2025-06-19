// src/components/ChatInterface.jsx
import React, { useEffect, useRef, useState } from 'react';
import { SimpleAnimatedTooltip } from './ui/animated-tooltip';

const ChatInterface = () => {
  // Referencias a elementos del DOM usando useRef
  const chatMessagesRef = useRef(null);
  const userInputRef = useRef(null);
  const sendBtnRef = useRef(null);
  const dropdownBtnRef = useRef(null);
  const dropdownContentRef = useRef(null);
  const quickButtonRef = useRef(null);
  // Eliminar referencias relacionadas con texto dinámico que ya no se usará
  const dynamicTextElementRef = useRef(null);
  const dynamicContainerRef = useRef(null);
  const seoDynamicKeywordsElementRef = useRef(null);

  // Estado para controlar la visibilidad del dropdown
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  // Estado para controlar si el bot está escribiendo
  const [isBotTyping, setIsBotTyping] = useState(false);
  // Estado para controlar el índice actual de los iniciadores de conversación
  const [starterIndex, setStarterIndex] = useState(0);

  // Referencias para manejar el indicador de typing del bot
  const botStatusTimerRef = useRef(null);
  const currentBotStatusTextElementRef = useRef(null);
  const currentTypingIndicatorMsgRef = useRef(null);

  // URL del webhook (mantener como en el original por simplicidad de migración)
  const N8N_WEBHOOK_URL =
    'https://primary-production-33e8.up.railway.app/webhook/8e1404f9-1d5d-4126-b321-df21a22bc27c';

  // Lista de iniciadores de conversación en secuencia
  const conversationStarters = [
    'Hola, ¿cómo están? Me gustaría agendar una reunión con el área comercial. Mi nombre es:',
    'Me gustaría conocer más sobre los servicios que ofrecen para mi empresa. Mi nombre es:',
    'Estoy interesado en aprender más sobre Agente RAG para implementarlo en mi negocio. Mi nombre es:',
    'Quisiera conocer los costos asociados con la implementación de sus soluciones. Mi nombre es:',
    'Necesito automatizar procesos en mi empresa y estoy buscando asesoría. Mi nombre es:',
    'Me interesa conocer qué tipos de integraciones ofrecen con sistemas existentes. Mi nombre es:',
    'Estoy buscando mejorar la experiencia de mis clientes con herramientas de IA. Mi nombre es:',
  ];

  // Función para insertar el siguiente iniciador de conversación
  const insertNextConversationStarter = () => {
    if (userInputRef.current) {
      phStopEffect();
      // Insertar el texto del iniciador actual
      userInputRef.current.value = conversationStarters[starterIndex];
      autoExpandTextarea();
      userInputRef.current.focus();

      // Avanzar al siguiente iniciador para la próxima vez
      setStarterIndex((prevIndex) => (prevIndex + 1) % conversationStarters.length);
    }
  };

  // --- CÓDIGO PLACEHOLDER DINÁMICO (Adaptado a React) ---
  const phPhrases = [
    'Hola, ¿cómo estás?',
    'Pregúntame sobre IA RAG',
    'Agenda una reunión',
    'Consulta por servicios',
    'Necesito ayuda',
    'Conversemos sobre tu negocio',
  ];
  const phOriginalPlaceholder = 'Escribe tu mensaje...';
  const phIndexRef = useRef(0);
  const phCurrentTextRef = useRef('');
  const phIntervalRef = useRef(null);
  const phCursorIntervalRef = useRef(null);

  const phBlinkCursor = () => {
    const userInput = userInputRef.current;
    if (!userInput) return;
    // Solo parpadear si el campo está vacío y no tiene el foco
    if (
      userInput.value === '' &&
      document.activeElement !== userInput &&
      !userInput.classList.contains('placeholder-blur-transition')
    ) {
      const p = userInput.placeholder;
      userInput.placeholder = p.endsWith('|')
        ? phCurrentTextRef.current
        : phCurrentTextRef.current + '|';
    }
  };

  const phChangePhraseWithBlur = () => {
    const userInput = userInputRef.current;
    if (!userInput) return;

    if (userInput.value === '' && document.activeElement !== userInput) {
      userInput.classList.add('placeholder-blur-transition');
      if (phCursorIntervalRef.current) clearInterval(phCursorIntervalRef.current);
      phCursorIntervalRef.current = null;
      userInput.placeholder = phCurrentTextRef.current; // Eliminar el cursor
      setTimeout(() => {
        phIndexRef.current = (phIndexRef.current + 1) % phPhrases.length;
        phCurrentTextRef.current = phPhrases[phIndexRef.current];
        userInput.placeholder = phCurrentTextRef.current;
        setTimeout(() => {
          userInput.classList.remove('placeholder-blur-transition');
          phStartCursorBlink(); // Reiniciar parpadeo después del cambio
        }, 250); // Duración del desenfoque de salida
      }, 150); // Duración del desenfoque de entrada
    } else {
      // Si el usuario escribe o enfoca, detener el efecto
      if (phIntervalRef.current) clearInterval(phIntervalRef.current);
      phIntervalRef.current = null;
      if (userInput.value === '') userInput.placeholder = phOriginalPlaceholder;
    }
  };

  const phStartCursorBlink = () => {
    const userInput = userInputRef.current;
    if (!userInput) return;
    if (phCursorIntervalRef.current) clearInterval(phCursorIntervalRef.current);
    // Solo iniciar si el campo está vacío y no tiene el foco
    if (
      userInput.value === '' &&
      document.activeElement !== userInput &&
      !userInput.classList.contains('placeholder-blur-transition')
    ) {
      phCurrentTextRef.current = phPhrases[phIndexRef.current];
      userInput.placeholder = phCurrentTextRef.current + '|'; // Añadir cursor inicial
      phCursorIntervalRef.current = setInterval(phBlinkCursor, 530);
    }
  };

  const phStartEffect = () => {
    const userInput = userInputRef.current;
    if (!userInput) return;
    phStopEffect(); // Asegurar que no haya efectos duplicados
    // Solo iniciar si el campo está vacío
    if (userInput.value === '' && document.activeElement !== userInput) {
      phIndexRef.current = Math.floor(Math.random() * phPhrases.length);
      phCurrentTextRef.current = phPhrases[phIndexRef.current];
      phStartCursorBlink(); // Inicia el parpadeo con la frase inicial
      phIntervalRef.current = setInterval(phChangePhraseWithBlur, 3800); // Cambia la frase periódicamente
    }
  };

  const phStopEffect = () => {
    const userInput = userInputRef.current;
    if (!userInput) return;
    clearInterval(phCursorIntervalRef.current);
    clearInterval(phIntervalRef.current);
    phCursorIntervalRef.current = null;
    phIntervalRef.current = null;
    userInput.classList.remove('placeholder-blur-transition');
    // Restaurar placeholder original solo si el campo está vacío
    if (userInput.value === '') {
      userInput.placeholder = phOriginalPlaceholder;
    }
  };
  // --- FIN CÓDIGO PLACEHOLDER DINÁMICO ---

  // --- Lógica del Chat (Adaptada a React) ---

  // Función para expandir el textarea automáticamente (reactivada)
  const autoExpandTextarea = () => {
    const textarea = userInputRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  };

  // Función para mostrar indicador de typing y estado
  const showBotTyping = () => {
    const chatMessages = chatMessagesRef.current;
    if (!chatMessages) return;

    const welcomeH2 = chatMessages.querySelector('h2');
    if (welcomeH2) {
      welcomeH2.style.display = 'none';
    }

    // Evitar duplicados
    if (currentTypingIndicatorMsgRef.current) return;

    const msgElem = document.createElement('div');
    msgElem.classList.add('message', 'bot');
    chatMessages.appendChild(msgElem); // Añadir el contenedor inmediatamente
    currentTypingIndicatorMsgRef.current = msgElem; // Guardar referencia al contenedor del mensaje

    const statusContainer = document.createElement('div');
    statusContainer.classList.add('bot-typing-status-container');
    msgElem.appendChild(statusContainer); // Añadir contenedor de estado al mensaje

    const indicator = document.createElement('span');
    indicator.classList.add('bot-typing-indicator');
    statusContainer.appendChild(indicator);

    const botStatusText = document.createElement('span');
    botStatusText.classList.add('bot-status-text');
    botStatusText.textContent = 'Pensando...';
    botStatusText.classList.add('shimmer-animation'); // Aplicar shimmer
    statusContainer.appendChild(botStatusText);
    currentBotStatusTextElementRef.current = botStatusText; // Guardar referencia al texto

    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Iniciar timer para cambiar SOLO el texto de estado
    let elapsedSeconds = 0;
    if (botStatusTimerRef.current) clearInterval(botStatusTimerRef.current);
    botStatusTimerRef.current = setInterval(() => {
      if (!currentBotStatusTextElementRef.current) {
        clearInterval(botStatusTimerRef.current);
        return;
      }
      elapsedSeconds++;
      let statusMsg = '';
      if (elapsedSeconds >= 19) statusMsg = 'Elaborando respuesta';
      else if (elapsedSeconds >= 15) statusMsg = 'Revisando trabajo Agentes RAG';
      else if (elapsedSeconds >= 10) statusMsg = 'Consultando Agentes RAG';
      else if (elapsedSeconds >= 4) statusMsg = 'Buscando conversaciones';
      else statusMsg = 'Pensando...';

      // SOLO ACTUALIZAR TEXTO, el shimmer es continuo vía CSS
      if (currentBotStatusTextElementRef.current.textContent !== statusMsg) {
        currentBotStatusTextElementRef.current.textContent = statusMsg;
      }
    }, 1000);
  };

  // Función para ocultar indicador
  const hideBotTyping = () => {
    if (botStatusTimerRef.current) clearInterval(botStatusTimerRef.current);
    botStatusTimerRef.current = null;
    if (currentTypingIndicatorMsgRef.current) {
      currentTypingIndicatorMsgRef.current.remove();
      currentTypingIndicatorMsgRef.current = null; // Limpiar referencia
    }
    currentBotStatusTextElementRef.current = null;
  };

  // Función para enviar mensaje
  const sendMessage = async () => {
    const userInput = userInputRef.current;
    const sendBtn = sendBtnRef.current;
    const chatMessages = chatMessagesRef.current;

    if (!userInput || !sendBtn || !chatMessages) return;

    if (sendBtn.disabled || isBotTyping) return;

    const text = userInput.value.trim();
    if (!text) return;

    phStopEffect(); // Detener efecto placeholder

    addUserMessage(text); // Añadir mensaje del usuario inmediatamente

    userInput.value = ''; // Limpiar input
    autoExpandTextarea(); // Ajustar altura del input
    userInput.placeholder = phOriginalPlaceholder; // Restaurar placeholder original

    sendBtn.classList.add('plane-flying'); // Animación del botón
    sendBtn.disabled = true; // Deshabilitar botón
    setIsBotTyping(true); // Actualizar estado de typing
    showBotTyping(); // Mostrar indicador de typing

    try {
      // Obtener o crear session_id
      let sessionId = localStorage.getItem('session_id');
      if (!sessionId) {
        sessionId = crypto.randomUUID().replace(/-/g, '');
        localStorage.setItem('session_id', sessionId);
      }

      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': sessionId,
        },
        body: JSON.stringify({ message: text }),
      });

      hideBotTyping(); // Ocultar indicador ANTES de mostrar respuesta

      if (response.ok) {
        const data = await response.json();
        let botResponse =
          data.output || (Array.isArray(data) && data.length > 0 && data[0].output) || '';
        // Llamar a typeWriterMessageHTML para mostrar la respuesta con efecto
        await typeWriterMessageHTML(botResponse || '...', 'bot');
      } else {
        console.error('Server error:', response.status);
        await typeWriterMessageHTML('Error al obtener respuesta del servidor.', 'bot');
      }
    } catch (error) {
      console.error('Fetch Error:', error);
      hideBotTyping(); // Asegurar ocultar en error
      await typeWriterMessageHTML('Error de conexión. Inténtalo de nuevo.', 'bot');
    } finally {
      sendBtn.classList.remove('plane-flying');
      sendBtn.disabled = false;
      setIsBotTyping(false); // Asegurar reseteo del estado
      // Reiniciar efecto placeholder si el input está vacío después de enviar
      if (userInput.value === '' && document.activeElement !== userInput) {
        phStartEffect();
      }
      userInput.focus(); // Volver a enfocar el input
    }
  };

  // Función para añadir mensaje del usuario al DOM
  const addUserMessage = (text) => {
    const chatMessages = chatMessagesRef.current;
    if (!chatMessages) return;

    // Ocultar mensaje de bienvenida si está visible
    const welcomeH2 = chatMessages.querySelector('h2');
    if (welcomeH2 && welcomeH2.style.display !== 'none') {
      welcomeH2.style.display = 'none';
    }

    const msgElem = document.createElement('div');
    msgElem.classList.add('message', 'user');
    msgElem.textContent = text;
    chatMessages.appendChild(msgElem);
    // Desplazar hacia abajo
    chatMessages.scrollTop = chatMessages.scrollHeight;
  };

  // *** FUNCIÓN typeWriterMessageHTML (Adaptada para trabajar con referencias y DOM directo) ***
  // NOTA: Manipular el DOM directamente así dentro de React puede ser frágil.
  // Se hace para replicar el efecto original. Una alternativa React-idiomática
  // implicaría manejar el texto y la estructura en el estado y animar via CSS/JS.
  const typeWriterMessageHTML = (htmlStr, sender) => {
    return new Promise((resolve) => {
      const chatMessages = chatMessagesRef.current;
      if (!chatMessages) {
        resolve();
        return;
      }

      const msgElem = document.createElement('div');
      msgElem.classList.add('message', sender);
      chatMessages.appendChild(msgElem); // Añadir el contenedor del mensaje

      // Usar un contenedor temporal para parsear el HTML de forma segura
      const tempContainer = document.createElement('div');
      // Eliminación básica de scripts - ¡Ojo! No es una solución de seguridad completa.
      tempContainer.innerHTML = htmlStr.replace(/<script.*?>.*?<\/script>/gi, '');

      const nodesToProcess = Array.from(tempContainer.childNodes);

      // Función recursiva para procesar nodos (texto y elementos)
      function processNodeRecursive(node, container, onCompleteCallback) {
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent || '';
          if (text.trim() === '') {
            // Saltar nodos de texto vacíos
            onCompleteCallback();
            return;
          }
          const textSpan = document.createElement('span'); // Usar span para el efecto
          container.appendChild(textSpan);
          let charIndex = 0;
          function typeChar() {
            if (charIndex < text.length) {
              textSpan.textContent += text.charAt(charIndex++);
              chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll mientras escribe
              setTimeout(typeChar, 12); // Velocidad de escritura
            } else {
              onCompleteCallback(); // Nodo procesado
            }
          }
          typeChar(); // Iniciar escritura
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const newElem = document.createElement(node.tagName);
          // Copiar atributos
          for (let attr of node.attributes) {
            newElem.setAttribute(attr.name, attr.value);
          }
          container.appendChild(newElem); // Añadir el elemento 'vacío'

          const childNodes = Array.from(node.childNodes);
          // Procesar hijos recursivamente *dentro* del nuevo elemento
          processChildNodes(childNodes, newElem, onCompleteCallback); // Pasar el callback original
        } else {
          // Ignorar otros tipos de nodos (comentarios, etc.)
          onCompleteCallback();
        }
      }

      // Ayudante para procesar una lista de nodos hijos secuencialmente
      function processChildNodes(nodes, container, onAllCompleteCallback) {
        let index = 0;
        function nextChild() {
          if (index < nodes.length) {
            // Procesar el siguiente hijo cuando el actual termine
            processNodeRecursive(nodes[index++], container, nextChild);
          } else {
            onAllCompleteCallback(); // Todos los hijos procesados
          }
        }
        nextChild(); // Iniciar con el primer hijo
      }

      // Iniciar el proceso con los nodos de nivel superior
      processChildNodes(nodesToProcess, msgElem, resolve); // Resolver la promesa cuando todo termine
    });
  };
  // --- FIN FUNCIÓN TYPEWRITER ---

  // --- Lógica de Animación de Texto Central (Adaptada a React) ---
  const centralPhrases = [
    'Chatbots con IA RAG',
    'Google Calendar',
    'Atención en WhatsApp',
    'Atención en Messenger',
    'Atención en Gmail',
    'Llamadas Eficientes',
    'Contratos',
    'Cotizaciones',
    'Emails Efectivos',
    'Seguimiento Ágil',
    'Facturas',
    'Ordenes de Compra',
    'Documentos',
    'Ventas y Atención',
    'Inventario al día',
    'Auditorias internas',
    'Marketing digital',
    'WhatsApp Business',
    'Calidad ISO',
    'Inducción',
    'Reclutamiento',
    'Entrevistas',
    'Contabilidad',
    'Gestión CRM',
    'Gestión NPS',
    'Redes Sociales',
    'Datos en Tiempo Real',
    'IA en Website',
    'Optimiza Recursos',
    'La Transformación Digital',
  ];
  const centralPhraseIndexRef = useRef(0); // Usar ref para el índice

  const animateTextCentral = () => {
    const dynamicTextElement = dynamicTextElementRef.current;
    const dynamicContainer = dynamicContainerRef.current;
    const seoDynamicKeywordsElement = seoDynamicKeywordsElementRef.current;

    if (!dynamicTextElement || !dynamicContainer) return;

    dynamicTextElement.style.animation = 'none'; // Reset animation
    const phrase = centralPhrases[centralPhraseIndexRef.current];
    dynamicTextElement.textContent = phrase;

    // Calcular ancho objetivo
    dynamicTextElement.style.width = 'auto'; // Permitir que tome su ancho natural
    const targetWidth = dynamicTextElement.scrollWidth; // Obtener ancho
    dynamicContainer.style.width = targetWidth + 'px'; // Establecer ancho del contenedor
    dynamicTextElement.style.setProperty('--target-width', targetWidth + 'px'); // Establecer variable CSS

    // Aplicar animaciones
    const stepsCount = phrase.length || 1;
    dynamicTextElement.style.width = '0'; // Resetear ancho para la animación
    void dynamicTextElement.offsetWidth; // Trigger reflow
    dynamicTextElement.style.animation = `typing-dynamic 0.5s steps(${stepsCount}, end) forwards, erase-dynamic 0.2s steps(${stepsCount}, end) forwards 2.45s, hide-caret 0.35s forwards 4.55s`;

    // Actualizar texto SEO oculto
    if (seoDynamicKeywordsElement) seoDynamicKeywordsElement.textContent = phrase;
  };

  const changePhraseCentral = () => {
    centralPhraseIndexRef.current = (centralPhraseIndexRef.current + 1) % centralPhrases.length;
    animateTextCentral();
  };

  // --- useEffect para inicializar lógicas al montar el componente ---
  useEffect(() => {
    const userInput = userInputRef.current;
    const sendBtn = sendBtnRef.current;
    const dropdownBtn = dropdownBtnRef.current;
    const dropdownContent = dropdownContentRef.current;
    const quickButton = quickButtonRef.current;

    // Inicializar efecto placeholder si el input está vacío
    if (userInput && userInput.value === '') {
      phStartEffect();
    }

    // --- Configurar Event Listeners (Adaptados a React) ---
    // Nota: Muchos eventos comunes como 'click', 'input', 'keydown', 'focus', 'blur'
    // se manejan mejor directamente en el JSX (onClick, onInput, etc.).
    // Sin embargo, algunos listeners globales o en elementos específicos
    // pueden requerir useEffect.

    // Listener para cerrar dropdown al hacer clic fuera
    const handleOutsideClick = (e) => {
      if (
        dropdownBtn &&
        dropdownContent &&
        !dropdownBtn.contains(e.target) &&
        !dropdownContent.contains(e.target)
      ) {
        setIsDropdownVisible(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);

    // Listener para redimensionar textarea al cargar (y posiblemente al redimensionar ventana)
    autoExpandTextarea();
    window.addEventListener('resize', autoExpandTextarea);

    // --- Función de limpieza ---
    return () => {
      console.log('ChatInterface: Limpiando efectos y listeners...');
      // Limpiar intervalos del placeholder
      phStopEffect();

      // Remover listener global de click
      document.removeEventListener('click', handleOutsideClick);
      // Remover listener de resize
      window.removeEventListener('resize', autoExpandTextarea);

      // Asegurar que el indicador de typing del bot se oculte si está visible
      hideBotTyping();
    };
  }, []); // Array vacío asegura que se ejecute solo al montar y limpiar al desmontar

  // --- Renderizado JSX ---
  return (
    // Estilos originales del chat - Aplicados directamente o via className
    <div
      className="chat-container"
      style={{
        width: '100%',
        height: '600px', // Altura base
        margin: '0', // Eliminar margen
        background: 'transparent',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        overflow: 'hidden',
        position: 'relative',
        border: 'none', // Asegurar que no hay bordes
        boxSizing: 'border-box',
        paddingLeft: '10px',
        paddingRight: '10px',
      }}
    >
      {/* Media Query para altura en pantallas grandes */}
      {/* En React/JSX, los media queries CSS son la forma estándar */}
      {/* Puedes usar CSS modules o un archivo CSS separado para esto */}
      {/* O aplicar estilos condicionalmente con JS si es complejo */}
      {/* Por ahora, mantenemos los estilos CSS en un archivo separado o en el componente Astro */}

      {/* Área de mensajes */}
      <div
        className="chat-messages"
        id="chatMessages"
        ref={chatMessagesRef}
        style={{
          flex: 1,
          padding: '10px',
          overflowY: 'auto',
          background: 'transparent',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          boxSizing: 'border-box',
          paddingLeft: '5px',
          paddingRight: '5px',
        }}
      >
        {/* Los mensajes del chat se añadirán aquí dinámicamente por el JS */}
      </div>

      {/* Nuevo diseño con botones integrados en el área del textarea */}
      <div
        className="chat-input-container"
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: 'calc(100% - 20px)',
          marginLeft: '18px',
          marginRight: '18px',
          marginBottom: '10px',
          position: 'relative',
        }}
      >
        {/* Contenedor del textarea con los botones integrados */}
        <div
          className="textarea-container"
          style={{
            background: '#fff',
            border: '1px solid #e2e8f0', // Borde sutil pero visible
            borderRadius: '30px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.06)', // Sombra más definida con múltiples capas
            padding: '10px',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {/* Botón bombilla (izquierda) con SimpleAnimatedTooltip */}
          <SimpleAnimatedTooltip content="Iniciadores de conversación">
            <button
              className="quick-button"
              ref={quickButtonRef}
              onClick={(e) => {
                e.stopPropagation();
                insertNextConversationStarter();
              }}
              aria-label="Iniciadores de conversación"
              style={{
                background: '#000',
                border: 'none',
                borderRadius: '50%',
                padding: '8px',
                width: '34px',
                height: '34px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                color: '#fff',
                marginRight: '8px',
                flexShrink: 0,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Emojis de bombilla con efecto de iluminación */}
              <div
                className="bulb-container"
                style={{
                  position: 'relative',
                  zIndex: 2,
                }}
              >
                <span
                  role="img"
                  aria-label="light bulb"
                  style={{
                    fontSize: '16px',
                    position: 'relative',
                    zIndex: 2,
                  }}
                  className="bulb-emoji"
                >
                  💡
                </span>
              </div>

              {/* Efecto de brillo/gradiente */}
              <div
                className="glow-effect"
                style={{
                  position: 'absolute',
                  top: '-10%',
                  left: '-10%',
                  width: '120%',
                  height: '120%',
                  background: 'radial-gradient(circle, rgba(255,255,0,0.5) 0%, rgba(0,0,0,0) 70%)',
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                  zIndex: 1,
                }}
              ></div>
            </button>
          </SimpleAnimatedTooltip>

          {/* Textarea con margen para evitar que el texto quede tras los iconos */}
          <textarea
            id="userInput"
            ref={userInputRef}
            rows="1"
            placeholder={phOriginalPlaceholder}
            onInput={autoExpandTextarea}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (!sendBtnRef.current.disabled) {
                  sendMessage();
                }
              }
            }}
            onFocus={() => phStopEffect()}
            onBlur={() => {
              if (userInputRef.current.value === '') {
                phStartEffect();
              }
            }}
            style={{
              flex: '1 1 auto',
              border: 'none',
              resize: 'none',
              fontSize: '14px',
              outline: 'none',
              background: 'transparent',
              color: '#333',
              boxSizing: 'border-box',
              padding: '6px',
              paddingRight: '44px', // Espacio para el botón de envío
              minHeight: '40px',
              height: 'auto',
              overflowY: 'auto',
              lineHeight: '1.4',
            }}
          ></textarea>

          {/* Botón de envío (derecha) - Versión mejorada para asegurar cursor pointer */}
          <div
            style={{
              position: 'absolute',
              right: '10px',
              width: '34px',
              height: '34px',
              cursor:
                'pointer' /* Esta es la clave: el contenedor padre siempre tendrá cursor pointer */,
              zIndex: 10000 /* Reducido de 10000 a un valor más normalizado */,
            }}
          >
            <button
              className={`send-icon-container ${isBotTyping ? 'plane-flying' : ''}`}
              id="sendBtn"
              ref={sendBtnRef}
              onClick={sendMessage}
              disabled={isBotTyping}
              style={{
                width: '100%',
                height: '100%',
                background: '#000',
                border: 'none',
                color: '#fff',
                borderRadius: '50%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden',
                padding: 0,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                cursor: 'pointer !important',
              }}
            >
              {/* SVG de avión de papel simplificado y optimizado para evitar el punto negro */}
              <svg
                className="send-icon"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  display: 'block',
                  transition: 'transform 0.3s ease',
                }}
              >
                <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/*
        Estilos CSS originales.
        Puedes mover estos estilos a un archivo CSS separado e importarlo,
        o mantenerlos aquí si prefieres estilos en el componente.
      */}
      <style jsx="true">{`
        /* Estilos originales del chat - Mantenidos */
        .chat-container {
          /* width, height, margin, padding, etc. están en inline style */
        }
        /* Media queries para altura en pantallas grandes - Mover a CSS global o archivo .css */
        /* @media (min-width: 1024px) { .chat-container { height: 900px; } } */

        .chat-messages {
          /* flex, padding, overflow, etc. están en inline style */
        }

        .message {
          margin-bottom: 10px;
          padding: 10px 15px;
          border-radius: 8px;
          max-width: 100%;
          word-wrap: break-word;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          font-size: 0.95rem;
          line-height: 1.4;
          position: relative;
          box-sizing: border-box;
        }
        .message.user {
          background: #e1e1e1;
          color: #000;
          align-self: flex-end;
          border-bottom-right-radius: 5px;
        }
        .message.bot {
          background: transparent !important; /* Asegurar transparencia */
          box-shadow: none; /* Eliminar sombra */
          color: #000;
          align-self: flex-start;
          border-radius: 0; /* Eliminar border-radius por defecto */
        }
        .message.bot strong,
        .message.bot b {
          color: #007bff;
        }

        /* --- ESTILOS PLACEHOLDER DINÁMICO --- */
        #userInput::placeholder {
          color: #999;
          transition:
            color 0.2s ease-in-out,
            filter 0.25s ease-out;
          vertical-align: middle;
          filter: blur(0px);
        }
        #userInput.placeholder-blur-transition::placeholder {
          filter: blur(3px);
          transition:
            filter 0.15s ease-in,
            color 0.15s ease-in;
          color: rgba(153, 153, 153, 0.5);
        }
        #userInput {
          /* transition y filter controlados por JS/clase */
          transition: filter 0.25s ease-out;
          filter: blur(0px);
        }
        /* --- FIN ESTILOS PLACEHOLDER --- */

        /* Animación del avión de papel */
        @keyframes planeFlight {
          0% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(-40deg);
          }
          50% {
            transform: rotate(10deg);
          }
          75% {
            transform: rotate(-40deg);
          }
          100% {
            transform: rotate(0deg);
          }
        }
        .plane-flying .send-icon {
          animation: planeFlight 1.2s infinite ease-in-out;
        }

        .chat-input {
          /* background, border, radius, shadow, etc. están en inline style */
        }
        .input-top {
          /* display, width están en inline style */
        }
        .input-top textarea {
          /* flex, border, resize, etc. están en inline style */
        }
        .input-bottom {
          /* display, justify, align, etc. están en inline style */
        }
        .left-buttons {
          /* display, gap, position están en inline style */
        }

        .quick-button {
          position: relative;
          overflow: hidden;
        }

        .quick-button:hover .glow-effect {
          opacity: 1;
        }

        /* Animación de brillo para la bombilla */
        @keyframes pulse-glow {
          0% {
            filter: drop-shadow(0 0 2px rgba(255, 255, 0, 0.7));
          }
          50% {
            filter: drop-shadow(0 0 5px rgba(255, 255, 0, 0.9));
          }
          100% {
            filter: drop-shadow(0 0 2px rgba(255, 255, 0, 0.7));
          }
        }

        .quick-button:hover .bulb-emoji {
          animation: pulse-glow 2s infinite;
        }

        .send-icon-container {
          /* background, border, color, radius, etc. están en inline style */
          transition: background-color 0.2s ease; /* Mantener transición de hover */
          position: relative; /* Mantener position */
          overflow: hidden; /* Mantener overflow */
        }
        .send-icon-container:hover:not(:disabled) {
          background-color: #333;
        } /* Hover solo si no está deshabilitado */
        .send-icon-container:disabled {
          cursor: not-allowed;
          opacity: 0.8;
        } /* Estilo para deshabilitado */

        .send-icon {
          font-size: 16px;
          transition: transform 0.3s ease;
        }
        .send-icon-container:hover .send-icon {
          transform: scale(1.2);
          transform: rotate(-40deg);
        } /* Hover para icono de envío */

        /* Texto SEO oculto */
        .seo-text-container {
          position: absolute;
          left: -10000px;
          top: auto;
          width: 1px;
          height: 1px;
          overflow: hidden;
        }
        .seo-text-container p,
        .seo-text-container ul {
          margin: 0;
          padding: 0;
          list-style: none;
        }

        /* Indicador de typing del bot */
        .bot-typing-indicator {
          display: inline-block;
          width: 1em;
          height: 1em;
          background-color: #007bff;
          border-radius: 50%;
          vertical-align: bottom;
          margin-left: 0.2em;
          animation: typingBlink 1s infinite ease-in-out;
        }
        @keyframes typingBlink {
          0%,
          100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.3;
            transform: scale(1.2);
          }
        }

        /* Contenedor para el indicador y texto de estado */
        .bot-typing-status-container {
          display: flex;
          align-items: center;
          min-height: 1.5em;
        }
        /* Clase para el texto de estado del bot (se le aplicará shimmer) */
        .bot-status-text {
          margin-left: 10px;
          /* El estilo shimmer se aplicará/quitará dinámicamente */
        }

        /* Animación shimmer - Debe estar en CSS */
        .shimmer-animation {
          font-style: italic;
          background: linear-gradient(
            90deg,
            rgba(0, 0, 0, 0.3) 30%,
            rgba(120, 120, 130, 0.6) 50%,
            rgba(0, 0, 0, 0.3) 70%
          );
          background-size: 200% auto;
          color: transparent;
          background-clip: text;
          -webkit-background-clip: text;
          animation: shimmer 2.4s linear infinite; /* Animación continua */
        }
        @keyframes shimmer {
          from {
            background-position: 200% 0;
          }
          to {
            background-position: -200% 0;
          }
        }
      `}</style>
    </div>
  );
};

export default ChatInterface;
