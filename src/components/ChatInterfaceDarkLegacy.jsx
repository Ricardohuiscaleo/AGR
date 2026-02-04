import React, { useState, useRef, useEffect, useCallback } from 'react';

// URLs de los agentes
const GABY_API_URL = 'https://api.agenterag.com/php-apis/gaby-agent.php';

// Componente de Tooltip Animado Simple
const SimpleAnimatedTooltip = ({ children, content }) => {
  const [visible, setVisible] = useState(false);
  return (
    <div
      className="relative"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div className="absolute bottom-full mb-2 w-max px-3 py-1.5 text-sm font-medium text-white bg-black rounded-md shadow-sm opacity-100 transition-opacity duration-300 z-10">
          {content}
        </div>
      )}
    </div>
  );
};

// Componente principal del chat
const ChatInterfaceDark = ({ onShowConfetti }) => {
  // --- REFERENCIAS Y ESTADOS ---
  const chatMessagesRef = useRef(null);
  const userInputRef = useRef(null);
  const sendBtnRef = useRef(null);
  const footerRef = useRef(null);

  // Función para cerrar el chat
  const closeChatModal = () => {
    const modal = document.getElementById('full-screen-chat-modal');
    if (modal) {
      modal.classList.remove('full-screen-chat-modal-visible');
      modal.classList.add('full-screen-chat-modal-hidden');
      document.body.style.overflow = '';
      document.body.classList.remove('modal-open');
    }
  };
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [starterIndex, setStarterIndex] = useState(0);
  // Estados eliminados: smartReplies, loadingReplies
  const botStatusTimerRef = useRef(null);
  const currentBotStatusTextElementRef = useRef(null);
  const currentTypingIndicatorMsgRef = useRef(null);

  // Estados del componente - SIEMPRE GABY CON PODERES DE FAQ
  const [currentAgent, setCurrentAgent] = useState('gaby');

  // GABY SIEMPRE - Sin detección de botones
  useEffect(() => {
    console.log('💜 GABY LEGACY - Siempre Gaby con poderes de FAQ e Ignacio');
    setCurrentAgent('gaby');

    // Cargar nombre del usuario si existe
    const sessionId = localStorage.getItem('session_id');
    if (sessionId) {
      const savedName = localStorage.getItem(`user_name_${sessionId}`);
      if (savedName && savedName !== 'Usuario') {
        setUserName(savedName);
        console.log('💜 Nombre cargado:', savedName);
      }
    }
  }, []);
  const [agentContext, setAgentContext] = useState(null);
  const [agentStatus, setAgentStatus] = useState('online'); // 'online', 'offline', 'switching'
  const [userName, setUserName] = useState('Usuario'); // Nombre dinámico del usuario

  const conversationStarters = [
    'Hola, ¿cómo están? Me gustaría agendar una reunión con el área comercial. Mi nombre es: ',
    'Me gustaría conocer más sobre los servicios que ofrecen para mi empresa. Mi nombre es: ',
    'Estoy interesado en aprender más sobre Agente RAG para implementarlo en mi negocio. Mi nombre es: ',
  ];

  const autoExpandTextarea = useCallback(() => {
    const textarea = userInputRef.current;
    if (textarea) {
      // COMPORTAMIENTO UNIFORME - igual en móvil y desktop
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 80);
      textarea.style.height = `${newHeight}px`;
    }
  }, []);

  const insertNextConversationStarter = () => {
    if (userInputRef.current) {
      phStopEffect();
      userInputRef.current.value = conversationStarters[starterIndex];
      autoExpandTextarea();
      userInputRef.current.focus();
      setStarterIndex((prevIndex) => (prevIndex + 1) % conversationStarters.length);

      // Efecto visual al presionar la ampolleta
      const ampolletas = document.querySelectorAll('.quick-button-dark');
      ampolletas.forEach((button) => {
        button.classList.add('ampolleta-active');
        setTimeout(() => {
          button.classList.remove('ampolleta-active');
        }, 1500); // Duración del efecto
      });
    }
  };

  const phPhrases = [
    'Pregunta sobre costos de RAG',
    'Agenda una reunión comercial',
    'Consulta por automatización',
  ];
  const phOriginalPlaceholder = 'Escribe tu mensaje...';
  const phIndexRef = useRef(0);
  const phCurrentTextRef = useRef('');
  const phIntervalRef = useRef(null);
  const phCursorIntervalRef = useRef(null);

  const phBlinkCursor = useCallback(() => {
    const userInput = userInputRef.current;
    if (!userInput || userInput.value !== '' || document.activeElement === userInput) return;
    const p = userInput.placeholder;
    userInput.placeholder = p.endsWith('|')
      ? phCurrentTextRef.current
      : phCurrentTextRef.current + '|';
  }, []);

  const phStartCursorBlink = useCallback(() => {
    const userInput = userInputRef.current;
    if (!userInput || phCursorIntervalRef.current) return;
    if (userInput.value === '' && document.activeElement !== userInput) {
      phCurrentTextRef.current = phPhrases[phIndexRef.current];
      userInput.placeholder = phCurrentTextRef.current + '|';
      phCursorIntervalRef.current = setInterval(phBlinkCursor, 530);
    }
  }, [phBlinkCursor]);

  const phChangePhraseWithBlur = useCallback(() => {
    const userInput = userInputRef.current;
    if (!userInput || userInput.value !== '' || document.activeElement === userInput) {
      if (phIntervalRef.current) clearInterval(phIntervalRef.current);
      if (userInput && userInput.value === '') userInput.placeholder = phOriginalPlaceholder;
      return;
    }
    userInput.classList.add('placeholder-blur-transition');
    if (phCursorIntervalRef.current) clearInterval(phCursorIntervalRef.current);
    userInput.placeholder = phCurrentTextRef.current;
    setTimeout(() => {
      phIndexRef.current = (phIndexRef.current + 1) % phPhrases.length;
      phCurrentTextRef.current = phPhrases[phIndexRef.current];
      userInput.placeholder = phCurrentTextRef.current;
      setTimeout(() => {
        userInput.classList.remove('placeholder-blur-transition');
        phStartCursorBlink();
      }, 250);
    }, 150);
  }, [phStartCursorBlink]);

  const phStartEffect = useCallback(() => {
    const userInput = userInputRef.current;
    if (!userInput || phIntervalRef.current) return;
    if (userInput.value === '' && document.activeElement !== userInput) {
      phIndexRef.current = Math.floor(Math.random() * phPhrases.length);
      phChangePhraseWithBlur();
      phIntervalRef.current = setInterval(phChangePhraseWithBlur, 3800);
    }
  }, [phChangePhraseWithBlur]);

  const phStopEffect = useCallback(() => {
    const userInput = userInputRef.current;
    if (!userInput) return;
    clearInterval(phCursorIntervalRef.current);
    clearInterval(phIntervalRef.current);
    phCursorIntervalRef.current = null;
    phIntervalRef.current = null;
    userInput.classList.remove('placeholder-blur-transition');
    if (userInput.value === '') {
      userInput.placeholder = phOriginalPlaceholder;
    }
  }, []);

  // Función simple para markdown básico
  const convertMarkdownToHTML = (text) => {
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
  };

  const addUserMessage = (text) => {
    const chatMessages = chatMessagesRef.current;
    if (!chatMessages) return;
    const welcomeMsg = chatMessages.querySelector('.welcome-message');
    if (welcomeMsg) welcomeMsg.style.display = 'none';

    // Crear contenedor del mensaje
    const msgContainer = document.createElement('div');
    msgContainer.className = 'message-container self-end flex flex-col items-end mb-3';

    // Etiqueta del usuario
    const userLabel = document.createElement('div');
    userLabel.className = 'text-xs text-gray-400 mb-1 mr-2';
    userLabel.textContent = userName;

    // Mensaje
    const msgElem = document.createElement('div');
    msgElem.className = 'message-user bg-blue-600 text-white';
    msgElem.textContent = text;

    msgContainer.appendChild(userLabel);
    msgContainer.appendChild(msgElem);
    chatMessages.appendChild(msgContainer);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  };

  const typeWriterMessageHTML = (htmlStr, sender) => {
    return new Promise((resolve) => {
      const chatMessages = chatMessagesRef.current;
      if (!chatMessages) {
        resolve();
        return;
      }

      // Crear contenedor del mensaje
      const msgContainer = document.createElement('div');
      msgContainer.className = 'message-container self-start flex flex-col items-start mb-3';

      // Etiqueta del agente
      const agentLabel = document.createElement('div');
      agentLabel.className = 'text-xs text-gray-400 mb-1 ml-2';
      agentLabel.textContent = 'Gaby';

      // Mensaje con formato HTML desde el inicio
      const msgElem = document.createElement('div');
      msgElem.className = `message-${sender} bg-gray-700 text-white`;
      msgElem.style.wordWrap = 'break-word';
      msgElem.innerHTML = htmlStr; // Aplicar formato inmediatamente

      msgContainer.appendChild(agentLabel);
      msgContainer.appendChild(msgElem);
      chatMessages.appendChild(msgContainer);
      chatMessages.scrollTop = chatMessages.scrollHeight;

      // Simular typewriter con opacidad
      msgElem.style.opacity = '0';
      setTimeout(() => {
        msgElem.style.opacity = '1';
        msgElem.style.transition = 'opacity 0.3s ease-in';
        resolve();
      }, 300);
    });
  };

  // Función para extraer nombre del usuario de la respuesta del bot
  const extractUserNameFromResponse = (response) => {
    const namePatterns = [
      /Hola \*\*([^*]+)\*\*/i,
      /\*\*([A-Z][a-z]+)\*\*/,
      /Hola ([A-Z][a-z]+)[,!]/i,
    ];

    for (const pattern of namePatterns) {
      const match = response.match(pattern);
      if (match && match[1] && match[1].length > 1 && match[1].length < 20) {
        return match[1].trim();
      }
    }
    return null;
  };

  const showBotTyping = () => {
    const chatMessages = chatMessagesRef.current;
    if (!chatMessages || currentTypingIndicatorMsgRef.current) return;
    const welcomeMsg = chatMessages.querySelector('.welcome-message');
    if (welcomeMsg) welcomeMsg.style.display = 'none';
    const msgElem = document.createElement('div');
    msgElem.className = 'message-bot-typing self-start bg-gray-700 text-white';
    const statusContainer = document.createElement('div');
    statusContainer.className = 'flex items-center';
    const indicator = document.createElement('span');
    indicator.className = 'bot-typing-indicator';
    const botStatusText = document.createElement('span');
    botStatusText.className = 'bot-status-text shimmer-animation';
    botStatusText.textContent = 'Consultando base de datos...';
    statusContainer.appendChild(indicator);
    statusContainer.appendChild(botStatusText);
    msgElem.appendChild(statusContainer);
    chatMessages.appendChild(msgElem);
    currentTypingIndicatorMsgRef.current = msgElem;
    currentBotStatusTextElementRef.current = botStatusText;
    chatMessages.scrollTop = chatMessages.scrollHeight;
    let elapsedSeconds = 0;
    if (botStatusTimerRef.current) clearInterval(botStatusTimerRef.current);
    botStatusTimerRef.current = setInterval(() => {
      if (!currentBotStatusTextElementRef.current) {
        clearInterval(botStatusTimerRef.current);
        return;
      }
      elapsedSeconds++;
      let statusMsg = '';
      if (elapsedSeconds >= 19) statusMsg = 'Finalizando respuesta...';
      else if (elapsedSeconds >= 15) statusMsg = 'Procesando con Agentes RAG...';
      else if (elapsedSeconds >= 10) statusMsg = 'Analizando información...';
      else if (elapsedSeconds >= 4) statusMsg = 'Buscando datos relevantes...';
      else statusMsg = 'Consultando base de datos...';
      currentBotStatusTextElementRef.current.textContent = statusMsg;
    }, 1000);
  };

  const hideBotTyping = () => {
    if (botStatusTimerRef.current) clearInterval(botStatusTimerRef.current);
    if (currentTypingIndicatorMsgRef.current) {
      currentTypingIndicatorMsgRef.current.remove();
      currentTypingIndicatorMsgRef.current = null;
    }
  };

  // Función generateSmartReplies eliminada
  // Función handleSmartReplyClick eliminada

  const sendMessage = async () => {
    const userInput = userInputRef.current;
    if (!userInput || userInput.value.trim() === '' || isBotTyping) return;
    const text = userInput.value.trim();
    phStopEffect();
    addUserMessage(text);
    userInput.value = '';
    autoExpandTextarea();
    userInput.placeholder = phOriginalPlaceholder;
    setIsBotTyping(true);
    setAgentStatus('offline');
    showBotTyping();
    try {
      let sessionId = localStorage.getItem('session_id');
      if (!sessionId) {
        // Función segura para generar UUID que funciona en todos los navegadores
        try {
          // Método moderno usando crypto.randomUUID()
          if (window.crypto && crypto.randomUUID) {
            sessionId = crypto.randomUUID().replace(/-/g, '');
          } else {
            // Fallback para navegadores que no soportan crypto.randomUUID
            const buf = new Uint8Array(16);
            window.crypto.getRandomValues(buf);
            sessionId = Array.from(buf)
              .map((b) => b.toString(16).padStart(2, '0'))
              .join('');
          }
        } catch (error) {
          // Último recurso: timestamp + número aleatorio
          sessionId = Date.now().toString(36) + Math.random().toString(36).substring(2);
        }
        localStorage.setItem('session_id', sessionId);
      }
      // Determinar URL del agente actual
      const apiUrl = currentAgent === 'gaby' ? GABY_API_URL : IGNACIO_API_URL;
      console.log('Using agent:', currentAgent, 'URL:', apiUrl);

      // Enviar el ID de sesión en el header para mantener persistencia con el agente RAG
      // Cambiado a GET para compatibilidad con el backend
      const queryParams = new URLSearchParams({
        message: text,
        session: sessionId
      }).toString();
      
      const response = await fetch(`${apiUrl}?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': sessionId,
        }
      });

      console.log('Request sent:', {
        url: `${apiUrl}?${queryParams}`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': sessionId,
        }
      });

      console.log('API Response status:', response.status, response.ok);
      hideBotTyping();
      if (response.ok) {
        const data = await response.json();
        console.log('API Data:', data);

        // Guardar el session_id devuelto por el backend para mantener la conversación
        if (data.session_id) {
          localStorage.setItem('session_id', data.session_id);
        }

        let botResponse = data.output || 'No he podido obtener una respuesta.';
        console.log('Bot response received:', botResponse);

        // Detectar y actualizar nombre del usuario
        try {
          const detectedName = extractUserNameFromResponse(botResponse);
          if (detectedName && detectedName !== userName && detectedName !== 'Usuario') {
            setUserName(detectedName);
            // Guardar nombre en localStorage asociado al session_id
            localStorage.setItem(`user_name_${sessionId}`, detectedName);
            console.log('💜 Nombre detectado y guardado:', detectedName);
          }
        } catch (error) {
          console.log('Error detecting name:', error);
        }

        // Manejar switch de agente
        if (data.switch_to_gaby && currentAgent !== 'gaby') {
          setAgentStatus('switching');
          await typeWriterMessageHTML(convertMarkdownToHTML(botResponse), 'bot');

          // Cambiar agente después de un breve delay
          setTimeout(() => {
            setCurrentAgent('gaby');
            setAgentContext(data.context_data);
            setAgentStatus('online');
          }, 1500);

          return; // Salir para que el usuario responda
        }

        // Convertir markdown a HTML
        botResponse = convertMarkdownToHTML(botResponse);

        await typeWriterMessageHTML(botResponse, 'bot');
      } else {
        console.error('Error response:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error details:', errorText);
        await typeWriterMessageHTML(
          `Error del servidor (${response.status}): ${response.statusText}`,
          'bot'
        );
      }
    } catch (error) {
      hideBotTyping();
      console.error('Connection error:', error);
      await typeWriterMessageHTML(
        `Error de conexión: ${error.message}. Inténtalo de nuevo.`,
        'bot'
      );
    } finally {
      setIsBotTyping(false);
      setAgentStatus('online');
      userInput.focus();
      phStartEffect();
    }
  };

  useEffect(() => {
    const userInput = userInputRef.current;
    phStartEffect();
    autoExpandTextarea();

    // Mejorar el manejo de resize para móviles
    const handleResize = () => {
      autoExpandTextarea();
      // Asegurar que el chat se mantenga scrolleado al final en móvil
      const chatMessages = chatMessagesRef.current;
      if (
        chatMessages &&
        window.visualViewport &&
        window.visualViewport.height < window.innerHeight
      ) {
        setTimeout(() => {
          chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 150);
      }
    };

    window.addEventListener('resize', handleResize);

    const handleFocus = () => {
      phStopEffect();
      // En móvil, hacer scroll después de que aparezca el teclado
      if (window.visualViewport) {
        setTimeout(() => {
          const chatMessages = chatMessagesRef.current;
          if (chatMessages) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
          }
        }, 300);
      }
    };

    const handleBlur = () => {
      if (userInput?.value === '') phStartEffect();
    };

    userInput?.addEventListener('focus', handleFocus);
    userInput?.addEventListener('blur', handleBlur);

    return () => {
      phStopEffect();
      window.removeEventListener('resize', handleResize);
      userInput?.removeEventListener('focus', handleFocus);
      userInput?.removeEventListener('blur', handleBlur);
      hideBotTyping();
    };
  }, [autoExpandTextarea, phStartEffect, phStopEffect]);

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'buen día';
    if (hour >= 12 && hour < 19) return 'buena tarde';
    return 'buena noche';
  };

  return (
    // Contenedor principal: usa flexbox para organizar el contenido verticalmente
    // La clase flex-grow asegura que este div ocupe todo el espacio disponible en su contenedor padre de Astro
    <div className="flex flex-col h-full w-full flex-grow bg-gray-900 text-white overflow-hidden">
      {/* Encabezado: No crece ni se encoge */}
      <div className="flex-shrink-0 p-3 md:p-4 border-b border-gray-900">
        <div className="flex items-start justify-between gap-3">
          {/* Contenido izquierdo - Responsive */}
          <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
            {/* Indicador de estado */}
            <div className="flex items-center gap-1">
              <div
                className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${
                  agentStatus === 'online'
                    ? 'bg-green-400 animate-pulse'
                    : agentStatus === 'offline'
                      ? 'bg-red-400'
                      : 'bg-yellow-400 animate-bounce'
                }`}
              ></div>
            </div>

            {/* Icono chat */}
            <div className="text-amber-400 flex-shrink-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 md:h-6 md:w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>

            {/* Información del agente - Responsive */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm md:text-lg font-semibold text-amber-400 truncate leading-none m-0">
                Chat con Gaby
              </h3>
              <p className="text-xs md:text-sm text-gray-400 truncate">
                Ejecutiva Comercial
                <span
                  className={`ml-2 text-xs font-medium ${
                    agentStatus === 'online'
                      ? 'text-green-400'
                      : agentStatus === 'offline'
                        ? 'text-red-400'
                        : 'text-yellow-400'
                  }`}
                >
                  {agentStatus === 'online'
                    ? 'En línea'
                    : agentStatus === 'offline'
                      ? 'Procesando...'
                      : 'Cambiando...'}
                </span>
              </p>
            </div>
          </div>

          {/* Botón cerrar - A LA DERECHA */}
          <button
            onClick={closeChatModal}
            className="ml-auto  mr-1 flex-shrink-10 w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 transition-colors border border-gray-600"
            aria-label="Cerrar chat"
            title="Cerrar chat"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Área de mensajes: Crece para ocupar el espacio disponible y tiene scroll */}
      <div
        className="flex-grow p-4 overflow-y-auto flex flex-col gap-3 min-h-0"
        ref={chatMessagesRef}
      >
        <div className="welcome-message my-auto text-center text-gray-300">
          <h2 className="text-lg">👋 ¡Hola! {getTimeGreeting()}.</h2>
          <p>Hablemos sobre cómo automatizar procesos puede ayudarte a ahorrar.</p>
        </div>
      </div>

      {/* Contenedor del pie de página: No crece ni se encoge, se mantiene abajo */}
      <div ref={footerRef} className="flex-shrink-0 backdrop-blur-sm bg-gray-900">
        {/* Área de input */}
        <div className="p-4 pt-2">
          {/* Fila de botones - solo ampolleta en móvil */}
          <div className="flex justify-start mb-2 md:hidden">
            {/* Botón ampolleta - solo móvil */}
            <SimpleAnimatedTooltip content="Iniciadores de conversación">
              <button
                className="quick-button-dark w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-700 transition-colors bg-gray-800 border border-gray-600"
                onClick={insertNextConversationStarter}
              >
                <span className="text-lg">💡</span>
              </button>
            </SimpleAnimatedTooltip>
          </div>

          {/* Contenedor del textarea */}
          <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-2xl p-2 focus-within:border-amber-400 transition-colors">
            {/* Botón ampolleta - Solo visible en desktop, dentro del textarea */}
            <SimpleAnimatedTooltip content="Iniciadores de conversación">
              <button
                className="quick-button-dark flex-shrink-0 w-8 h-8 items-center justify-center rounded-full hover:bg-gray-700 transition-colors hidden md:flex"
                onClick={insertNextConversationStarter}
              >
                <span className="text-lg">💡</span>
              </button>
            </SimpleAnimatedTooltip>

            <textarea
              ref={userInputRef}
              rows="1"
              placeholder={phOriginalPlaceholder}
              onInput={autoExpandTextarea}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              className="flex-grow bg-transparent border-none resize-none outline-none text-gray-200 placeholder-gray-500"
              style={{
                fontSize: '16px',
                minHeight: '16px',
                maxHeight: '80px', // Aumentado para PC
                lineHeight: '16px',
                padding: '4px 4px',
              }}
            />

            {/* Botón envío - Solo visible en desktop, dentro del textarea a la derecha */}
            <button
              ref={sendBtnRef}
              onClick={sendMessage}
              disabled={isBotTyping}
              className={`send-button-dark flex-shrink-0 w-8 h-8 items-center justify-center rounded-full bg-blue-600 text-white transition-all duration-300 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed hidden md:flex ${isBotTyping ? 'plane-flying' : ''}`}
            >
              <svg
                className="send-icon-dark w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente App principal que renderiza el chat a pantalla completa
export default function App() {
  return (
    <>
      <style>{`
        body, #root, .full-screen-chat-modal-content, .full-screen-chat-modal-visible, #chat-interface-dark-container {
            height: 100%;
            display: flex;
            flex-direction: column;
        }
        /* Corrección para asegurar que el componente de React se expanda */
        #chat-interface-dark-container > div {
            flex-grow: 1;
            display: flex;
            flex-direction: column;
        }
        
        /* SOLUCIÓN SIMPLE PARA EL PROBLEMA DEL TEXTAREA EN MÓVIL */
        @media (max-width: 768px) {
          /* Fijar el modal para que no se mueva con el teclado virtual */
          #full-screen-chat-modal {
            position: fixed !important;
            height: 100vh !important;
            height: 100dvh !important;
          }
          
          /* Evitar que el contenedor del chat cambie de tamaño */
          #chat-interface-dark-container {
            height: 100vh !important;
            height: 100dvh !important;
            max-height: 100vh !important;
            max-height: 100dvh !important;
            overflow: hidden !important;
          }
          
          /* Asegurar que el contenedor interno mantenga su estructura */
          #chat-interface-dark-container > div {
            height: 100% !important;
            max-height: 100% !important;
            position: relative !important;
            overflow: hidden !important;
          }
          
          /* ASEGURAR QUE EL HEADER SEA VISIBLE EN MÓVIL */
          #chat-interface-dark-container .flex-shrink-0:first-child {
            position: relative !important;
            z-index: 30 !important;
            flex-shrink: 0 !important;
            min-height: 70px !important;
            background: #111827 !important;
            border-bottom: 1px solid #374151 !important;
          }
          
          /* Fijar el área de input en la parte inferior SIN sticky - SIN línea gris */
          #chat-interface-dark-container > div > .flex-shrink-0:last-child {
            position: absolute !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            background: #111827 !important;
            z-index: 10 !important;
            border-top: 1px solid #111827 !important;
          }
          
          /* Ajustar el área de mensajes para que no se superponga */
          #chat-interface-dark-container .flex-grow {
            padding-bottom: 100px !important;
            padding-top: 10px !important;
            height: calc(100% - 170px) !important;
            overflow-y: auto !important;
          }
        }
        
        .placeholder-blur-transition::placeholder { filter: blur(3px); transition: filter 0.25s ease-out; }
        @keyframes planeFlight { 0% { transform: translate(0, 0) rotate(0deg); } 25% { transform: translate(5px, -5px) rotate(15deg); } 50% { transform: translate(0px, 0px) rotate(0deg); } 75% { transform: translate(-5px, 5px) rotate(-15deg); } 100% { transform: translate(0, 0) rotate(0deg); } }
        .plane-flying .send-icon-dark { animation: planeFlight 1.2s infinite ease-in-out; }
        @keyframes typingBlink { 0%, 100% { opacity: 0.2; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1); } }
        .bot-typing-indicator { display: inline-block; width: 8px; height: 8px; background-color: #fbbf24; border-radius: 50%; margin-right: 10px; animation: typingBlink 1.2s infinite ease-in-out; }
        @keyframes shimmer { 0% { background-position: -100% 0; } 100% { background-position: 100% 0; } }
        .shimmer-animation { background: linear-gradient(90deg, #d1d5db 25%, #fbbf24 50%, #d1d5db 75%); background-size: 200% 100%; color: transparent; background-clip: text; -webkit-background-clip: text; animation: shimmer 2s linear infinite; }
        .message-user, .message-bot, .message-bot-typing { padding: 12px 16px; border-radius: 18px; max-width: 85%; min-width: 120px; word-wrap: break-word; line-height: 1.5; position: relative; }
        .message-user { min-width: 150px; } /* Mensajes de usuario más anchos */
        .message-user { border-bottom-right-radius: 4px; }
        .message-bot, .message-bot-typing { border-bottom-left-radius: 4px; }

        .message-bot strong, .message-bot b { color: #fbbf24; }
        .message-bot p { margin: 0.5rem 0; line-height: 1.6; }
        .message-bot p:first-child { margin-top: 0; }
        .message-bot p:last-child { margin-bottom: 0; }
        .message-bot ul { margin: 0.5rem 0; padding-left: 1.2rem; }
        .message-bot li { margin: 0.3rem 0; line-height: 1.5; }
        
        /* EFECTOS PARA LA AMPOLLETA CUANDO SE PRESIONA */
        .quick-button-dark {
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        
        .quick-button-dark.ampolleta-active {
          background: #000000 !important;
          border-color: #fbbf24 !important;
          box-shadow: 0 0 20px rgba(255, 187, 36, 0.6);
        }
        
        .quick-button-dark.ampolleta-active span {
          animation: ampolleta-pulse 1.5s ease-in-out;
          filter: drop-shadow(0 0 8px #fbbf24);
        }
        
        @keyframes ampolleta-pulse {
          0% { 
            transform: scale(1);
            filter: drop-shadow(0 0 4px #fbbf24);
          }
          25% { 
            transform: scale(1.1);
            filter: drop-shadow(0 0 12px #fbbf24);
          }
          50% { 
            transform: scale(1.05);
            filter: drop-shadow(0 0 16px #fbbf24);
          }
          75% { 
            transform: scale(1.1);
            filter: drop-shadow(0 0 12px #fbbf24);
          }
          100% { 
            transform: scale(1);
            filter: drop-shadow(0 0 8px #fbbf24);
          }
        }
      `}</style>
      <div id="chat-interface-dark-container" className="w-full h-full font-sans">
        <ChatInterfaceDark />
      </div>
    </>
  );
}
