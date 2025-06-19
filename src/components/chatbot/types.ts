// Tipos y interfaces para los componentes del chatbot

// Representa un mensaje en la conversación
export interface ChatMessage {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

// Props para el componente Chatbot principal
export interface ChatbotProps {
  title?: string;
  description?: string;
  icon?: string;
  color?: string;
  initialMessages?: ChatMessage[];
}

// Props para componentes relacionados (como el ChatbotCard)
export interface ChatbotCardProps {
  title?: string;
  description?: string;
  icon?: string;
  color?: string;
}
