// src/components/ChatInterfaceDark.jsx
import React, { useEffect, useRef, useState } from 'react';
import { SimpleAnimatedTooltip } from './ui/animated-tooltip';

const ChatInterfaceDark = () => {
  // Referencias a elementos del DOM usando useRef
  const chatMessagesRef = useRef(null);
  const userInputRef = useRef(null);
  const sendBtnRef = useRef(null);

  // Estado para controlar si el bot está escribiendo
  const [isBotTyping, setIsBotTyping] = useState(false);
  // Estado para controlar el índice actual de los iniciadores de conversación
  const [starterIndex, setStarterIndex] = useState(0);

  // Referencias para manejar el indicador de typing del bot
  const botStatusTimerRef = useRef(null);
  const currentBotStatusTextElementRef = useRef(null);
  const currentTypingIndicatorMsgRef = useRef(null);

  // URL del webhook
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
      userInputRef.current.value = conversationStarters[starterIndex];
      autoExpandTextarea();
      userInputRef.current.focus();
      setStarterIndex((prevIndex) => (prevIndex + 1) % conversationStarters.length);
    }
  };

  // --- CÓDIGO PLACEHOLDER DINÁMICO ---
  const phPhrases = [
    'Pregunta sobre costos de RAG',
    'Agenda una reunión comercial',
    'Consulta por automatización',
    'Necesito reducir costos',
    'Quiero implementar IA RAG',
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
    } else {
      if (phIntervalRef.current) clearInterval(phIntervalRef.current);
      phIntervalRef.current = null;
      if (userInput.value === '') userInput.placeholder = phOriginalPlaceholder;
    }
  };

  const phStartCursorBlink = () => {
    const userInput = userInputRef.current;
    if (!userInput) return;
    if (phCursorIntervalRef.current) clearInterval(phCursorIntervalRef.current);
    if (
      userInput.value === '' &&
      document.activeElement !== userInput &&
      !userInput.classList.contains('placeholder-blur-transition')
    ) {
      phCurrentTextRef.current = phPhrases[phIndexRef.current];
      userInput.placeholder = phCurrentTextRef.current + '|';
      phCursorIntervalRef.current = setInterval(phBlinkCursor, 530);
    }
  };

  const phStartEffect = () => {
    const userInput = userInputRef.current;
    if (!userInput) return;
    phStopEffect();
    if (userInput.value === '' && document.activeElement !== userInput) {
      phIndexRef.current = Math.floor(Math.random() * phPhrases.length);
      phCurrentTextRef.current = phPhrases[phIndexRef.current];
      phStartCursorBlink();
      phIntervalRef.current = setInterval(phChangePhraseWithBlur, 3800);
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
    if (userInput.value === '') {
      userInput.placeholder = phOriginalPlaceholder;
    }
  };

  // Función para expandir el textarea automáticamente
  const autoExpandTextarea = () => {
    const textarea = userInputRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  };

  // Función para mostrar indicador de typing
  const showBotTyping = () => {
    const chatMessages = chatMessagesRef.current;
    if (!chatMessages) return;

    const welcomeH2 = chatMessages.querySelector('h2');
    if (welcomeH2) {
      welcomeH2.style.display = 'none';
    }

    if (currentTypingIndicatorMsgRef.current) return;

    const msgElem = document.createElement('div');
    msgElem.classList.add('message', 'bot');
    chatMessages.appendChild(msgElem);
    currentTypingIndicatorMsgRef.current = msgElem;

    const statusContainer = document.createElement('div');
    statusContainer.classList.add('bot-typing-status-container');
    msgElem.appendChild(statusContainer);

    const indicator = document.createElement('span');
    indicator.classList.add('bot-typing-indicator');
    statusContainer.appendChild(indicator);

    const botStatusText = document.createElement('span');
    botStatusText.classList.add('bot-status-text');
    botStatusText.textContent = 'Consultando base de datos...';
    botStatusText.classList.add('shimmer-animation');
    statusContainer.appendChild(botStatusText);
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
      currentTypingIndicatorMsgRef.current = null;
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

    phStopEffect();
    addUserMessage(text);

    userInput.value = '';
    autoExpandTextarea();
    userInput.placeholder = phOriginalPlaceholder;

    sendBtn.classList.add('plane-flying');
    sendBtn.disabled = true;
    setIsBotTyping(true);
    showBotTyping();

    try {
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

      hideBotTyping();

      if (response.ok) {
        const data = await response.json();
        let botResponse =
          data.output || (Array.isArray(data) && data.length > 0 && data[0].output) || '';
        await typeWriterMessageHTML(botResponse || '...', 'bot');
      } else {
        console.error('Server error:', response.status);
        await typeWriterMessageHTML('Error al obtener respuesta del servidor.', 'bot');
      }
    } catch (error) {
      console.error('Fetch Error:', error);
      hideBotTyping();
      await typeWriterMessageHTML('Error de conexión. Inténtalo de nuevo.', 'bot');
    } finally {
      sendBtn.classList.remove('plane-flying');
      sendBtn.disabled = false;
      setIsBotTyping(false);
      if (userInput.value === '' && document.activeElement !== userInput) {
        phStartEffect();
      }
      userInput.focus();
    }
  };

  // Función para añadir mensaje del usuario
  const addUserMessage = (text) => {
    const chatMessages = chatMessagesRef.current;
    if (!chatMessages) return;

    const welcomeH2 = chatMessages.querySelector('h2');
    if (welcomeH2 && welcomeH2.style.display !== 'none') {
      welcomeH2.style.display = 'none';
    }

    const msgElem = document.createElement('div');
    msgElem.classList.add('message', 'user');
    msgElem.textContent = text;
    chatMessages.appendChild(msgElem);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  };

  // Función typeWriter para mensajes del bot
  const typeWriterMessageHTML = (htmlStr, sender) => {
    return new Promise((resolve) => {
      const chatMessages = chatMessagesRef.current;
      if (!chatMessages) {
        resolve();
        return;
      }

      const msgElem = document.createElement('div');
      msgElem.classList.add('message', sender);
      // Forzar color blanco para el texto del bot
      if (sender === 'bot') {
        msgElem.style.color = '#ffffff';
      }
      chatMessages.appendChild(msgElem);

      const tempContainer = document.createElement('div');
      tempContainer.innerHTML = htmlStr.replace(/<script.*?>.*?<\/script>/gi, '');
      const nodesToProcess = Array.from(tempContainer.childNodes);

      function processNodeRecursive(node, container, onCompleteCallback) {
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent || '';
          if (text.trim() === '') {
            onCompleteCallback();
            return;
          }
          const textSpan = document.createElement('span');
          // Asegurar que el texto sea blanco
          if (sender === 'bot') {
            textSpan.style.color = '#ffffff';
          }
          container.appendChild(textSpan);
          let charIndex = 0;
          function typeChar() {
            if (charIndex < text.length) {
              textSpan.textContent += text.charAt(charIndex++);
              chatMessages.scrollTop = chatMessages.scrollHeight;
              setTimeout(typeChar, 12);
            } else {
              onCompleteCallback();
            }
          }
          typeChar();
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const newElem = document.createElement(node.tagName);
          for (let attr of node.attributes) {
            newElem.setAttribute(attr.name, attr.value);
          }
          // Forzar color blanco en elementos HTML del bot
          if (sender === 'bot' && !newElem.style.color) {
            newElem.style.color = '#ffffff';
          }
          container.appendChild(newElem);
          const childNodes = Array.from(node.childNodes);
          processChildNodes(childNodes, newElem, onCompleteCallback);
        } else {
          onCompleteCallback();
        }
      }

      function processChildNodes(nodes, container, onAllCompleteCallback) {
        let index = 0;
        function nextChild() {
          if (index < nodes.length) {
            processNodeRecursive(nodes[index++], container, nextChild);
          } else {
            onAllCompleteCallback();
          }
        }
        nextChild();
      }

      processChildNodes(nodesToProcess, msgElem, resolve);
    });
  };

  // useEffect para inicializar
  useEffect(() => {
    const userInput = userInputRef.current;

    if (userInput && userInput.value === '') {
      phStartEffect();
    }

    autoExpandTextarea();
    window.addEventListener('resize', autoExpandTextarea);

    return () => {
      phStopEffect();
      window.removeEventListener('resize', autoExpandTextarea);
      hideBotTyping();
    };
  }, []);

  return (
    <div className="chat-dark-container">
      {/* Encabezado del chat */}
      <div className="chat-header">
        <div className="chat-title">
          <div className="chat-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <h3>Chat con Agente RAG</h3>
        </div>
        <p className="chat-subtitle">
          Consulta sobre automatización y ahorro de costos en tiempo real
        </p>
      </div>

      {/* Área de mensajes */}
      <div className="chat-messages-dark" ref={chatMessagesRef}>
        <h2 className="welcome-message">
          👋 ¡Hola, si lo que has visto recién te genera dudas.
          <br />
          Hablemos sobre costos y cómo podemos ayudarte a ahorrar!
        </h2>
      </div>

      {/* Área de input */}
      <div className="chat-input-dark-container">
        <div className="textarea-dark-container">
          {/* Botón de iniciadores */}
          <SimpleAnimatedTooltip content="Iniciadores de conversación sobre costos">
            <button
              className="quick-button-dark"
              onClick={(e) => {
                e.stopPropagation();
                insertNextConversationStarter();
              }}
              aria-label="Iniciadores de conversación"
            >
              <span role="img" aria-label="light bulb" className="bulb-emoji">
                💡
              </span>
              <div className="glow-effect-dark"></div>
            </button>
          </SimpleAnimatedTooltip>

          {/* Textarea */}
          <textarea
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
            className="textarea-dark"
          />

          {/* Botón de envío */}
          <button
            className={`send-button-dark ${isBotTyping ? 'plane-flying' : ''}`}
            ref={sendBtnRef}
            onClick={sendMessage}
            disabled={isBotTyping}
          >
            <svg
              className="send-icon-dark"
              width="16"
              height="16"
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

      {/* Estilos CSS */}
      <style jsx="true">{`
        .chat-dark-container {
          background: #111827;
          border-radius: 12px;
          border: none; /* Eliminar el borde dorado */
          box-shadow: none; /* Eliminar también la sombra para que se vea más integrado */
          padding: 4px 30px; /* Añadir padding lateral de 32px */
          margin: 2px 0;
          color: #f3f4f6;
          position: relative;
          overflow: hidden;
        }

        .chat-header {
          margin-bottom: 20px;
          border-bottom: 1px solid #374151;
          padding-bottom: 16px;
        }

        .chat-title {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }

        .chat-icon {
          color: #fbbf24;
          display: flex;
          align-items: center;
        }

        .chat-title h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0;
          color: #fbbf24;
        }

        .chat-subtitle {
          color: #d1d5db;
          font-size: 0.875rem;
          margin: 0;
          margin-left: 32px;
        }

        .chat-messages-dark {
          height: min(60vh, 600px);
          overflow-y: auto;
          margin-bottom: 20px;
          padding: 16px;
          background: transparent;
          border-radius: 8px;
          position: relative;
        }

        .welcome-message {
          color: #f3f4f6;
          font-size: 0.9rem;
          text-align: center;
          margin: 0;
          padding: 20px;
          line-height: 1.5;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: calc(100% - 40px);
        }

        .message {
          margin-bottom: 12px;
          padding: 12px 16px;
          border-radius: 8px;
          max-width: 85%;
          word-wrap: break-word;
          font-size: 0.9rem;
          line-height: 1.4;
        }

        .message.user {
          background: #fbbf24;
          color: #111827;
          align-self: flex-end;
          margin-left: auto;
          border-bottom-right-radius: 4px;
          font-weight: 500;
        }

        .message.bot {
          background: #374151;
          color: #ffffff;
          align-self: flex-start;
          border-bottom-left-radius: 4px;
        }

        .message.bot strong,
        .message.bot b {
          color: #fbbf24;
        }

        .chat-input-dark-container {
          display: flex;
          flex-direction: column;
        }

        .textarea-dark-container {
          background: #1f2937;
          border: 1px solid #374151;
          border-radius: 24px;
          padding: 12px;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: border-color 0.2s ease;
        }

        .textarea-dark-container:focus-within {
          border-color: #fbbf24;
          box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.1);
        }

        .quick-button-dark {
          background: #fbbf24;
          border: none;
          border-radius: 50%;
          padding: 8px;
          width: 34px;
          height: 34px;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #111827;
          position: relative;
          overflow: hidden;
          flex-shrink: 0;
        }

        .quick-button-dark:hover {
          background: #f59e0b;
          transform: scale(1.05);
        }

        .bulb-emoji {
          font-size: 16px;
          position: relative;
          z-index: 2;
        }

        .glow-effect-dark {
          position: absolute;
          top: -10%;
          left: -10%;
          width: 120%;
          height: 120%;
          background: radial-gradient(circle, rgba(251, 191, 36, 0.3) 0%, rgba(0, 0, 0, 0) 70%);
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: 1;
        }

        .quick-button-dark:hover .glow-effect-dark {
          opacity: 1;
        }

        .quick-button-dark:hover .bulb-emoji {
          animation: pulse-glow-dark 1.5s infinite;
        }

        @keyframes pulse-glow-dark {
          0% {
            filter: drop-shadow(0 0 2px rgba(251, 191, 36, 0.7));
          }
          50% {
            filter: drop-shadow(0 0 8px rgba(251, 191, 36, 0.9));
          }
          100% {
            filter: drop-shadow(0 0 2px rgba(251, 191, 36, 0.7));
          }
        }

        .textarea-dark {
          flex: 1;
          border: none;
          resize: none;
          font-size: 14px;
          outline: none;
          background: transparent;
          color: #f3f4f6;
          padding: 8px 12px;
          min-height: 40px;
          max-height: 120px;
          overflow-y: auto;
          line-height: 1.4;
        }

        .textarea-dark::placeholder {
          color: #9ca3af;
          transition:
            color 0.2s ease-in-out,
            filter 0.25s ease-out;
          filter: blur(0px);
        }

        .textarea-dark.placeholder-blur-transition::placeholder {
          filter: blur(3px);
          color: rgba(156, 163, 175, 0.5);
        }

        .send-button-dark {
          background: #fbbf24;
          border: none;
          color: #111827;
          border-radius: 50%;
          width: 34px;
          height: 34px;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .send-button-dark:hover:not(:disabled) {
          background: #f59e0b;
          transform: scale(1.05);
        }

        .send-button-dark:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }

        .send-icon-dark {
          transition: transform 0.3s ease;
        }

        .send-button-dark:hover .send-icon-dark {
          transform: rotate(-15deg);
        }

        @keyframes planeFlight {
          0% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(-30deg);
          }
          50% {
            transform: rotate(15deg);
          }
          75% {
            transform: rotate(-30deg);
          }
          100% {
            transform: rotate(0deg);
          }
        }

        .plane-flying .send-icon-dark {
          animation: planeFlight 1.2s infinite ease-in-out;
        }

        /* Indicador de typing del bot */
        .bot-typing-indicator {
          display: inline-block;
          width: 8px;
          height: 8px;
          background-color: #fbbf24;
          border-radius: 50%;
          vertical-align: middle;
          margin-right: 8px;
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
            transform: scale(1.3);
          }
        }

        .bot-typing-status-container {
          display: flex;
          align-items: center;
          min-height: 1.5em;
        }

        .bot-status-text {
          color: #d1d5db;
          font-style: italic;
          font-size: 0.85rem;
        }

        .shimmer-animation {
          background: linear-gradient(
            90deg,
            rgba(209, 213, 219, 0.4) 30%,
            rgba(251, 191, 36, 0.8) 50%,
            rgba(209, 213, 219, 0.4) 70%
          );
          background-size: 200% auto;
          color: transparent;
          background-clip: text;
          -webkit-background-clip: text;
          animation: shimmer 2s linear infinite;
        }

        @keyframes shimmer {
          from {
            background-position: 200% 0;
          }
          to {
            background-position: -200% 0;
          }
        }

        /* Scrollbar personalizado */
        .chat-messages-dark::-webkit-scrollbar {
          width: 6px;
        }

        .chat-messages-dark::-webkit-scrollbar-track {
          background: #1f2937;
        }

        .chat-messages-dark::-webkit-scrollbar-thumb {
          background: #4b5563;
          border-radius: 3px;
        }

        .chat-messages-dark::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }

        /* Responsividad */
        @media (max-width: 768px) {
          .chat-dark-container {
            padding: 16px 32px; /* Mantener padding lateral de 32px en tablets */
            margin: 16px 8px;
          }

          .chat-messages-dark {
            height: min(50vh, 400px); /* En móviles: 50% del viewport o máximo 400px */
            padding: 12px;
          }

          .chat-title h3 {
            font-size: 1.1rem;
          }

          .chat-subtitle {
            font-size: 0.8rem;
          }
        }

        @media (max-width: 480px) {
          .chat-dark-container {
            padding: 12px 32px; /* Mantener padding lateral de 32px en móviles */
            margin: 12px 4px;
            border-radius: 8px;
          }

          .chat-messages-dark {
            height: min(45vh, 350px); /* En móviles pequeños: 45% del viewport o máximo 350px */
            padding: 10px;
          }
        }
      `}</style>
    </div>
  );
};

export default ChatInterfaceDark;
