import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MessageCircle, X, Send, User, Bot, Package, Headphones } from 'lucide-react';
import { useChat } from '@/contexts/ChatContext';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  hasButtons?: boolean;
}

export function ChatWidget() {
  const location = useLocation();
  const { isChatEnabled } = useChat();
  const [isOpen, setIsOpen] = useState(false);
  
  // Log para debug
  console.log('ChatWidget - location:', location.pathname);
  const [isOpening, setIsOpening] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Olá! Bem-vindo ao Suporte JadLog.\n\nSou seu assistente virtual e estou aqui para ajudá-lo com suas dúvidas sobre rastreamento, entrega e serviços logísticos.\n\nComo posso ser útil hoje?',
      sender: 'bot',
      timestamp: new Date(),
      hasButtons: true
    }
  ]);
  const [inputValue, setInputValue] = useState('');

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setMessageCount(prev => prev + 1);

    // Verificar se a mensagem contém palavras relacionadas à alfândega
    const alfandegaKeywords = ['alfandega', 'alfândega', 'retido', 'retenção', 'receita federal', 'taxa', 'imposto', 'bloqueado', 'parado'];
    const hasAlfandegaKeyword = alfandegaKeywords.some(keyword => 
      inputValue.toLowerCase().includes(keyword.toLowerCase())
    );

    // Verificar se a mensagem contém palavras relacionadas a golpes
    const golpeKeywords = ['golpe', 'falso', 'fake', 'fraude', 'scam', 'site falso', 'site fake', 'não confio', 'não confio', 'suspeito', 'estranho'];
    const hasGolpeKeyword = golpeKeywords.some(keyword => 
      inputValue.toLowerCase().includes(keyword.toLowerCase())
    );

    // Verificar se a mensagem contém palavras relacionadas ao WhatsApp
    const whatsappKeywords = ['whatsapp', 'zap', 'zapzap', 'wpp', 'whats', 'telegram', 'mensagem', 'notificação'];
    const hasWhatsappKeyword = whatsappKeywords.some(keyword => 
      inputValue.toLowerCase().includes(keyword.toLowerCase())
    );

    // Simular resposta automática com indicador de digitação
    setIsTyping(true);
    
    // Array para armazenar todas as mensagens que devem ser enviadas
    const messagesToSend: string[] = [];
    
    // Adicionar mensagens baseadas nas palavras-chave encontradas
    if (hasGolpeKeyword) {
      messagesToSend.push('Entendemos sua preocupação com a segurança.\n\nEste é o site oficial da JadLog, empresa brasileira com mais de 30 anos de experiência no mercado logístico.\n\nNossa plataforma é segura e todos os dados são protegidos. Você pode verificar nossa legitimidade no site da ANTT (Agência Nacional de Transportes Terrestres) e em nossos canais oficiais.');
    }
    
    if (hasWhatsappKeyword) {
      messagesToSend.push('Sim! Alguns status de rastreio podem ser enviados via WhatsApp, como por exemplo, remessas retidas ou status de pedido entregue.\n\nEssas notificações são enviadas automaticamente para manter você informado sobre o progresso da sua entrega.');
    }
    
    if (hasAlfandegaKeyword) {
      messagesToSend.push('Algumas remessas podem ser retidas pela Receita Federal e liberadas somente após o pagamento das taxas.\n\nPara verificar a situação do seu pedido e efetuar o pagamento, insira o seu código de rastreio no menu inicial.');
    }
    
    // Se não encontrou palavras-chave específicas, usar mensagens padrão
    if (messagesToSend.length === 0) {
      if (messageCount === 0) {
        messagesToSend.push('Perfeito! Recebi sua solicitação.\n\nEstou transferindo você para nossa equipe de atendimento especializada.\n\nTempo estimado de espera: 3-5 minutos.\n\nUm de nossos consultores entrará em contato em breve.');
      } else {
        messagesToSend.push('Agradecemos sua paciência.\n\nNossa equipe de atendimento está com alta demanda no momento.\n\nRecomendamos aguardar alguns minutos ou tentar novamente em horário alternativo.\n\nSua compreensão é muito importante para nós.');
      }
    }
    
    // Enviar mensagens em sequência com delay
    let delay = 2000; // Delay inicial
    
    messagesToSend.forEach((messageText, index) => {
      setTimeout(() => {
        if (index === 0) {
          setIsTyping(false); // Parar o indicador de digitação na primeira mensagem
        }
        
        const botMessage: Message = {
          id: (Date.now() + index).toString(),
          text: messageText,
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
      }, delay);
      
      delay += 1500; // Adicionar 1.5 segundos de delay entre cada mensagem
    });
  };

  const handleButtonClick = (buttonType: 'remessa' | 'atendimento') => {
    let botMessageText = '';
    
    if (buttonType === 'remessa') {
      botMessageText = 'Algumas remessas podem ser retidas pela Receita Federal e liberadas somente após o pagamento das taxas.\n\nPara verificar a situação do seu pedido e efetuar o pagamento, insira o seu código de rastreio no menu inicial.';
    } else {
      botMessageText = 'Perfeito! Estou transferindo você para nossa equipe de atendimento especializada.\n\nTempo estimado de espera: 3-5 minutos.\n\nUm de nossos consultores entrará em contato em breve.';
    }

    const botMessage: Message = {
      id: Date.now().toString(),
      text: botMessageText,
      sender: 'bot',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, botMessage]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleOpenChat = () => {
    setIsOpen(true);
    setIsOpening(true);
    setTimeout(() => {
      setIsOpening(false);
    }, 300); // Tempo da animação de abertura
  };

  const handleCloseChat = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 300); // Tempo da animação de fechamento
  };

  // Função para fazer scroll automático para a última mensagem
  const scrollToBottom = () => {
    const chatMessages = document.getElementById('chat-messages');
    if (chatMessages) {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  };

  // Scroll automático quando novas mensagens são adicionadas
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Controlar animação de abertura
  useEffect(() => {
    if (isOpen && !isOpening) {
      // Chat já está aberto e não está mais abrindo
      setIsOpening(false);
    }
  }, [isOpen, isOpening]);

  // Só mostrar o chat se estiver na página inicial E estiver ativado
  if (location.pathname !== '/' || !isChatEnabled) {
    console.log('Chat não renderizando:', { pathname: location.pathname, isChatEnabled });
    return null;
  }

  return (
    <>
      {/* Botão flutuante do chat */}
      <Button
        onClick={handleOpenChat}
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-white/20 hover:bg-white/40 text-gray-400/50 hover:text-gray-500/70 border border-gray-200/30 hover:border-gray-300/50 shadow-sm hover:shadow-md transition-all duration-300 z-50 backdrop-blur-sm"
        size="icon"
      >
        <img 
          src="https://img.icons8.com/ios-glyphs/30/online-support.png" 
          alt="Suporte Online" 
          className="w-5 h-5 opacity-40 hover:opacity-70 transition-opacity duration-300"
        />
      </Button>

      {/* Modal do chat */}
      {isOpen && (
        <div className={`fixed inset-0 z-50 flex items-end justify-end p-4 transition-all duration-300 ${
          isClosing ? 'bg-black/0' : 'bg-black/20'
        }`}>
          <Card className={`w-96 h-[500px] flex flex-col shadow-2xl transition-all duration-300 rounded-2xl ${
            isClosing 
              ? 'opacity-0 translate-y-8 scale-95' 
              : 'opacity-100 translate-y-0 scale-100'
          }`}>
            <CardHeader className="bg-primary text-primary-foreground pb-3 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">
                  Atendimento Online
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCloseChat}
                  className="text-primary-foreground hover:bg-primary/80"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
              {/* Área de mensagens */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3" id="chat-messages">
                {messages.map((message, index) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div
                      className={`flex items-start space-x-2 max-w-[80%] chat-message-container ${
                        message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
                        message.sender === 'user' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {message.sender === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                      </div>
                      <div
                        className={`px-3 py-2 rounded-lg text-sm break-words whitespace-pre-line max-w-full ${
                          message.sender === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-foreground'
                        }`}
                      >
                        {message.text}
                        
                        {/* Botões para mensagem inicial */}
                        {message.hasButtons && (
                          <div className="mt-3 space-y-2">
                            <Button
                              onClick={() => handleButtonClick('remessa')}
                              variant="outline"
                              size="sm"
                              className="w-full justify-start bg-background hover:bg-red-500 hover:text-white border-primary/20 hover:border-red-500 transition-colors duration-200"
                            >
                              <Package className="w-4 h-4 mr-2" />
                              Remessa Retida
                            </Button>
                            <Button
                              onClick={() => handleButtonClick('atendimento')}
                              variant="outline"
                              size="sm"
                              className="w-full justify-start bg-background hover:bg-red-500 hover:text-white border-primary/20 hover:border-red-500 transition-colors duration-200"
                            >
                              <Headphones className="w-4 h-4 mr-2" />
                              Atendimento Humanizado
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Indicador de digitação */}
                {isTyping && (
                  <div className="flex justify-start animate-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-start space-x-2 max-w-[80%]">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs bg-muted text-muted-foreground">
                        <Bot className="w-3 h-3" />
                      </div>
                      <div className="px-3 py-2 rounded-lg text-sm bg-muted text-foreground">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Área de input */}
              <div className="p-4 border-t bg-background rounded-b-2xl">
                <div className="flex space-x-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Digite sua mensagem..."
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    size="icon"
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
