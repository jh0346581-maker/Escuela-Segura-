import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, ShieldCheck, HeartHandshake, Bot, Sparkles, RefreshCw, AlertTriangle } from 'lucide-react';
import { AppScreen, ChatMessage } from '../types';
import { soundFx } from '../utils/audio';

interface ChatMediationViewProps {
  onBack: () => void;
  onNavigate: (screen: AppScreen) => void;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'm1',
    sender: 'mediator',
    text: '¡Hola! Soy PazBot, tu Asistente y Mediador Escolar Inteligente de Escuela Segura. 🕊️✨\n\nEstoy aquí para escucharte con empatía, ayudarte a resolver cualquier malentendido sin violencia y guiarte en una convivencia sana. ¿Cómo te sientes hoy o qué situación te gustaría que resolvamos juntos?',
    timestamp: 'Ahora',
  },
];

const SUGGESTIONS = [
  '¿Cómo calmarme si estoy enojado con un compañero?',
  'Presencié una discusión y no sé qué hacer',
  'Me siento excluido en los recreos',
  '¿Cómo pedir una disculpa sincera?',
  'Alguien me está molestando en el aula',
];

export const ChatMediationView: React.FC<ChatMediationViewProps> = ({ onBack, onNavigate }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    soundFx.playClick();
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          history: newHistory,
        }),
      });

      if (!response.ok) {
        throw new Error('Error en el servicio de chat');
      }

      const data = await response.json();
      soundFx.playSuccess();

      const botReply: ChatMessage = {
        id: `m-${Date.now()}`,
        sender: 'mediator',
        text: data.reply || 'Estoy aquí para apoyarte. Cuéntame con tranquilidad.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botReply]);
    } catch {
      // Offline / network fallback
      soundFx.playSuccess();
      let fallbackText = 'Entiendo lo que estás pasando. En momentos de tensión escolar, lo más valioso es dar un paso atrás, respirar profundamente y no reaccionar con agresión. Si consideras que la situación es urgente, te sugiero activar el botón de SOS o avisar a tu profesor orientador.';
      
      const lower = text.toLowerCase();
      if (lower.includes('pelea') || lower.includes('golpe') || lower.includes('discusión')) {
        fallbackText = 'Hiciste muy bien en comunicarlo. Si notas riesgo de confrontación física, avisa de inmediato a un profesor o prefecto cercano sin intervenir tú solo para cuidar tu integridad. Nuestro equipo de mediación puede citar a ambas partes a una mesa de diálogo pacífico.';
      } else if (lower.includes('excluido') || lower.includes('solo') || lower.includes('triste')) {
        fallbackText = 'Lamento mucho que sientas eso. La convivencia escolar sana se basa en que nadie se quede fuera. Me gustaría invitarte al Círculo de Mediadores y Actividades de Recreo Integrador este jueves.';
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `m-${Date.now()}`,
          sender: 'mediator',
          text: fallbackText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    soundFx.playPop();
    setMessages(INITIAL_MESSAGES);
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#faf6f2] text-slate-800 overflow-hidden">
      {/* Top Header */}
      <header className="pt-10 px-4 pb-3 bg-gradient-to-r from-[#3c0e18] to-[#5a1827] text-white flex items-center justify-between shrink-0 shadow-md">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundFx.playClick();
              onBack();
            }}
            className="p-1 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 transition-all"
            title="Volver"
          >
            <ArrowLeft className="w-4 h-4 text-[#ffe1d9]" />
          </button>
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="font-cinzel text-xs font-bold tracking-wider text-[#ffe1d9]">
                PAZBOT · CHATBOT IA
              </span>
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-semibold border border-emerald-400/30">
                <Sparkles className="w-2.5 h-2.5" />
                <span>IA</span>
              </span>
            </div>
            <p className="text-[10px] text-[#e8b0bc]">Mediador Escolar Inteligente 24/7</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleResetChat}
            className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-[#ffe1d9] active:scale-95 transition-all"
            title="Reiniciar conversación"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              soundFx.playPop();
              onNavigate('report');
            }}
            className="text-[11px] text-[#ffe1d9] bg-white/10 px-2 py-1 rounded-lg hover:bg-white/20"
          >
            Reportar
          </button>
        </div>
      </header>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 custom-scrollbar">
        {/* Safe Badge */}
        <div className="flex items-center justify-center my-1">
          <span className="bg-slate-200/90 text-slate-700 text-[10px] px-3 py-1 rounded-full font-medium flex items-center gap-1.5 shadow-2xs">
            <Bot className="w-3 h-3 text-[#5a1827]" />
            <span>ChatBot de Mediación Escolar y Apoyo Emocional</span>
          </span>
        </div>

        {messages.map((m) => {
          const isMe = m.sender === 'user';
          return (
            <div
              key={m.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-fade-in`}
            >
              {!isMe && (
                <div className="flex items-center gap-1 text-[10px] text-[#5a1827] font-bold mb-1 pl-1">
                  <div className="w-4 h-4 rounded-full bg-[#5a1827] text-[#ffe1d9] flex items-center justify-center text-[9px]">
                    🕊️
                  </div>
                  <span>PazBot</span>
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs shadow-sm leading-relaxed whitespace-pre-wrap ${
                  isMe
                    ? 'bg-gradient-to-r from-[#8d2a3c] to-[#5c1626] text-white rounded-tr-xs'
                    : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs'
                }`}
              >
                {m.text}
              </div>
              <span className="text-[9px] text-slate-600 mt-1 px-1">{m.timestamp}</span>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex flex-col items-start animate-fade-in">
            <div className="flex items-center gap-1 text-[10px] text-[#5a1827] font-bold mb-1 pl-1">
              <div className="w-4 h-4 rounded-full bg-[#5a1827] text-[#ffe1d9] flex items-center justify-center text-[9px]">
                🕊️
              </div>
              <span>PazBot pensando...</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-2xl px-3.5 py-2 w-fit shadow-xs">
              <span className="w-2 h-2 bg-[#8d2a3c] rounded-full animate-bounce" />
              <span className="w-2 h-2 bg-[#8d2a3c] rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 bg-[#8d2a3c] rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Replies */}
      <div className="px-3 py-2 bg-[#f4ebe6] border-t border-slate-200 overflow-x-auto whitespace-nowrap flex gap-1.5 no-scrollbar shrink-0">
        {SUGGESTIONS.map((s, idx) => (
          <button
            key={idx}
            disabled={isLoading}
            onClick={() => handleSend(s)}
            className="inline-flex items-center gap-1 text-[10px] font-medium text-[#481624] bg-white border border-[#deb386]/60 rounded-full px-2.5 py-1 hover:bg-[#ffece8] active:scale-95 disabled:opacity-50 transition-all shrink-0 shadow-2xs cursor-pointer"
          >
            <HeartHandshake className="w-3 h-3 text-[#ca7b69]" />
            <span>{s}</span>
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          value={input}
          disabled={isLoading}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isLoading ? 'PazBot está respondiendo...' : 'Escribe tu consulta o situación...'}
          className="flex-1 bg-slate-100 border border-slate-200 rounded-full px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#8d2a3c] disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="w-9 h-9 rounded-full bg-[#8d2a3c] text-white flex items-center justify-center hover:bg-[#a63348] disabled:opacity-40 transition-all active:scale-95 cursor-pointer shadow-sm shrink-0"
        >
          <Send className="w-4 h-4 -ml-0.5" />
        </button>
      </form>
    </div>
  );
};
