import React, { createContext, useContext, useState, useEffect } from 'react';

interface ChatContextType {
  isChatEnabled: boolean;
  toggleChat: () => void;
  enableChat: () => void;
  disableChat: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [isChatEnabled, setIsChatEnabled] = useState(true);

  // Carregar estado do chat do localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('chatEnabled');
    if (savedState !== null) {
      setIsChatEnabled(JSON.parse(savedState));
    }
  }, []);

  // Salvar estado no localStorage quando mudar
  useEffect(() => {
    localStorage.setItem('chatEnabled', JSON.stringify(isChatEnabled));
  }, [isChatEnabled]);

  const toggleChat = () => {
    setIsChatEnabled(prev => !prev);
  };

  const enableChat = () => {
    setIsChatEnabled(true);
  };

  const disableChat = () => {
    setIsChatEnabled(false);
  };

  return (
    <ChatContext.Provider value={{ isChatEnabled, toggleChat, enableChat, disableChat }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
