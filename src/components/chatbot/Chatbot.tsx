import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage, ChatbotProps } from './types';

const Chatbot: React.FC<ChatbotProps> = ({
  title = 'Asistente Virtual',
  description = 'Chatbot inteligente que responde preguntas basadas en tus datos',
  icon = '💬',
  color = '#4079ff',
  initialMessages = [],
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Simular respuestas del chatbot
  const botResponses = [
    'Hola, ¿en qué puedo ayudarte hoy?',
    'Interesante pregunta. Déjame buscar información sobre eso.',
    'Podemos ayudarte con implementación de agentes RAG para tu empresa.',
    'Nuestras soluciones de IA están optimizadas para PyMEs chilenas.',
    '¿Tienes alguna otra pregunta sobre nuestros servicios?',
    'Puedo proporcionarte más información sobre nuestras tecnologías.',
    '¿Quieres agendar una demostración con nuestro equipo?',
  ];

  // Función para generar ID único para mensajes
  const generateId = () => {
    return Date.now() + Math.floor(Math.random() * 1000);
  };

  // Función para simular respuesta del chatbot
  const simulateBotResponse = (userMessage: string) => {
    setIsTyping(true);

    // Simular tiempo de respuesta
    setTimeout(
      () => {
        // Aquí podrías implementar lógica más compleja o conectar a un servicio real
        const randomIndex = Math.floor(Math.random() * botResponses.length);
        const botMessage: ChatMessage = {
          id: generateId(),
          text: botResponses[randomIndex],
          isUser: false,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, botMessage]);
        setIsTyping(false);
      },
      1000 + Math.random() * 1000
    ); // Simular tiempo variable de respuesta
  };

  // Manejar envío de mensajes
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (inputValue.trim() === '') return;

    const userMessage: ChatMessage = {
      id: generateId(),
      text: inputValue,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');

    // Simular respuesta del chatbot
    simulateBotResponse(inputValue);
  };

  // Auto-scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="chatbot-container">
      {/* Botón para abrir el chat */}
      <button
        className="chatbot-trigger"
        onClick={() => setIsOpen(!isOpen)}
        style={{ backgroundColor: color }}
      >
        <span>{icon}</span>
        {!isOpen && <div className="tooltip">{title}</div>}
      </button>

      {/* Ventana de chat */}
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header" style={{ backgroundColor: color }}>
            <div className="chatbot-title">
              <span className="chatbot-icon">{icon}</span>
              <div>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
            </div>
            <button className="close-btn" onClick={() => setIsOpen(false)}>
              ×
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.length === 0 ? (
              <div className="welcome-message">
                <p>¡Hola! ¿En qué puedo ayudarte hoy?</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`message ${msg.isUser ? 'user-message' : 'bot-message'}`}
                >
                  {!msg.isUser && (
                    <div className="bot-avatar" style={{ backgroundColor: color }}>
                      {icon}
                    </div>
                  )}
                  <div className="message-content">
                    <div className="message-text">{msg.text}</div>
                    <div className="message-time">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))
            )}

            {isTyping && (
              <div className="message bot-message">
                <div className="bot-avatar" style={{ backgroundColor: color }}>
                  {icon}
                </div>
                <div className="message-content">
                  <div className="message-text typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form className="chatbot-input" onSubmit={handleSendMessage}>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Escribe tu mensaje aquí..."
              disabled={isTyping}
            />
            <button type="submit" disabled={isTyping || inputValue.trim() === ''}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                width="24"
                height="24"
              >
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
              </svg>
            </button>
          </form>
        </div>
      )}

      <style jsx>{`
        .chatbot-container {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 1000;
          font-family:
            -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell,
            'Open Sans', 'Helvetica Neue', sans-serif;
        }

        .chatbot-trigger {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          cursor: pointer;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
          border: none;
          position: relative;
          transition: transform 0.3s ease;
        }

        .chatbot-trigger:hover {
          transform: scale(1.1);
        }

        .tooltip {
          position: absolute;
          right: 70px;
          background-color: #333;
          color: white;
          padding: 5px 10px;
          border-radius: 4px;
          font-size: 14px;
          white-space: nowrap;
          opacity: 1; /* Cambiado de 0 a 1 para hacerlo visible por defecto */
          /* Se eliminó la transición para que aparezca instantáneamente */
          visibility: hidden; /* Inicialmente oculto, pero sin afectar la opacidad */
        }

        .chatbot-trigger:hover .tooltip {
          opacity: 1;
          visibility: visible; /* Se muestra inmediatamente al hacer hover */
        }

        .chatbot-window {
          position: absolute;
          bottom: 80px;
          right: 0;
          width: 350px;
          height: 500px;
          border-radius: 16px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          background-color: var(--card-bg, white);
          box-shadow: 0 5px 25px rgba(0, 0, 0, 0.2);
          border: 1px solid var(--card-border, rgba(255, 255, 255, 0.1));
        }

        .chatbot-header {
          padding: 15px;
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .chatbot-title {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .chatbot-title h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
        }

        .chatbot-title p {
          margin: 0;
          font-size: 12px;
          opacity: 0.8;
        }

        .chatbot-icon {
          font-size: 20px;
        }

        .close-btn {
          background: none;
          border: none;
          color: white;
          font-size: 24px;
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
        }

        .chatbot-messages {
          flex: 1;
          padding: 15px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .welcome-message {
          text-align: center;
          margin: auto 0;
          padding: 20px;
          color: #888;
        }

        .message {
          display: flex;
          margin-bottom: 10px;
          max-width: 80%;
        }

        .bot-message {
          align-self: flex-start;
        }

        .user-message {
          align-self: flex-end;
          flex-direction: row-reverse;
        }

        .bot-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          margin-right: 8px;
          flex-shrink: 0;
        }

        .message-content {
          display: flex;
          flex-direction: column;
        }

        .message-text {
          padding: 10px 12px;
          border-radius: 12px;
          font-size: 14px;
          line-height: 1.4;
        }

        .bot-message .message-text {
          background-color: #f1f1f1;
          color: #333;
          border-top-left-radius: 4px;
        }

        .user-message .message-text {
          background-color: #4079ff;
          color: white;
          border-top-right-radius: 4px;
        }

        .message-time {
          font-size: 10px;
          color: #999;
          margin-top: 4px;
          align-self: flex-end;
        }

        .chatbot-input {
          display: flex;
          padding: 10px;
          border-top: 1px solid #eee;
        }

        .chatbot-input input {
          flex: 1;
          padding: 10px 12px;
          border: 1px solid #ddd;
          border-radius: 20px;
          font-size: 14px;
          outline: none;
        }

        .chatbot-input button {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: #4079ff;
          color: white;
          border: none;
          margin-left: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .chatbot-input button:disabled {
          background-color: #cccccc;
          cursor: not-allowed;
        }

        .typing-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 10px 12px;
        }

        .typing-indicator span {
          height: 8px;
          width: 8px;
          background-color: #888;
          border-radius: 50%;
          display: inline-block;
          margin: 0 2px;
          opacity: 0.4;
          animation: typing 1s infinite alternate;
        }

        .typing-indicator span:nth-child(1) {
          animation-delay: 0s;
        }

        .typing-indicator span:nth-child(2) {
          animation-delay: 0.3s;
        }

        .typing-indicator span:nth-child(3) {
          animation-delay: 0.6s;
        }

        @keyframes typing {
          0% {
            opacity: 0.4;
            transform: translateY(0);
          }
          100% {
            opacity: 1;
            transform: translateY(-5px);
          }
        }

        /* Adaptaciones para tema oscuro */
        :global(html[data-theme='dark']) .chatbot-window {
          --card-bg: rgba(30, 30, 35, 0.9);
          --card-border: rgba(255, 255, 255, 0.1);
        }

        :global(html[data-theme='dark']) .bot-message .message-text {
          background-color: rgba(60, 60, 65, 0.8);
          color: #f0f0f0;
        }

        :global(html[data-theme='dark']) .chatbot-input {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        :global(html[data-theme='dark']) .chatbot-input input {
          background-color: rgba(60, 60, 65, 0.8);
          color: #f0f0f0;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        :global(html[data-theme='dark']) .welcome-message {
          color: #aaa;
        }

        @media (max-width: 480px) {
          .chatbot-window {
            width: 300px;
            height: 450px;
            bottom: 70px;
            right: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default Chatbot;
