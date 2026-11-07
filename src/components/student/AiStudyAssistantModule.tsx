import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useSpeechRecognition } from '../../utils/useSpeechRecognition';
import { sendStudyChatAPI } from '../../services/api';
import { ChatMessage } from '../../types';
import {
  Sparkles,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Copy,
  Check,
  RotateCcw,
  BookOpen,
  Zap,
  Brain,
  HelpCircle,
  Lightbulb,
  AlertTriangle,
  Flame,
  Award,
  ChevronDown,
  Layers,
  ArrowRight,
  Info,
} from 'lucide-react';

interface QuickPrompt {
  label: string;
  question: string;
  area: string;
  icon: string;
}

const QUICK_PROMPTS: QuickPrompt[] = [
  {
    label: 'Mitose vs Meiose',
    question: 'Qual a diferença crucial entre mitose e meiose e o que o ENEM mais cobra sobre variabilidade genética?',
    area: 'Ciências da Natureza',
    icon: '🧬',
  },
  {
    label: 'Princípio de Le Chatelier',
    question: 'Explique de forma simples o Princípio de Le Chatelier e a pegadinha clássica do catalisador no ENEM.',
    area: 'Ciências da Natureza',
    icon: '🧪',
  },
  {
    label: 'Equação de Torricelli',
    question: 'Como e quando usar a Equação de Torricelli no ENEM? Dê um macete prático para não errar.',
    area: 'Ciências da Natureza',
    icon: '⚡',
  },
  {
    label: 'Repertório Coringa Redação',
    question: 'Me dê um repertório sociocultural coringa e legítimo para a redação do ENEM com modelo de aplicação.',
    area: 'Redação',
    icon: '✍️',
  },
  {
    label: 'Era Vargas no ENEM',
    question: 'Quais são as 3 fases da Era Vargas e o que mais costuma cair na prova de Ciências Humanas?',
    area: 'Ciências Humanas',
    icon: '📜',
  },
  {
    label: 'Probabilidade & Combinação',
    question: 'Como diferenciar quando usar Combinação Simples ou Arranjo/Permutação em questões do ENEM?',
    area: 'Matemática',
    icon: '📐',
  },
  {
    label: 'Funções da Linguagem',
    question: 'Resumo rápido das 6 funções da linguagem no ENEM: emotiva, referencial, fática, conativa, metalinguística e poética.',
    area: 'Linguagens',
    icon: '📚',
  },
  {
    label: 'Democracia Ateniense vs Atual',
    question: 'Qual a diferença entre a democracia direta de Atenas e a democracia representativa moderna para o ENEM?',
    area: 'Ciências Humanas',
    icon: '🏛️',
  },
];

const INITIAL_WELCOME_MESSAGE: ChatMessage = {
  id: 'msg_welcome',
  sender: 'assistant',
  text: `Olá! Sou o seu **Tutor de Estudos do ENEM** com inteligência artificial Gemini 🌟.

Aqui você pode tirar **dúvidas rápidas** sobre qualquer conteúdo do exame nacional (Fórmulas, Biologia, História, Matemática, Gramática e Redação).

✨ **Recursos de Acessibilidade**:
- 🎙️ **Voz-para-Texto**: Clique no botão do microfone para ditar sua dúvida falando naturalmente!
- 🔊 **Leitura em Voz Alta**: Ouça a explicação falada com 1 clique.
- ⚡ **Modo Pílula Rápida TDAH**: Resumos em tópicos sem sobrecarga mental.

Qual conceito você gostaria de revisar agora? Escolha uma sugestão rápida abaixo ou pergunte o que quiser!`,
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  conceptTitle: 'Bem-vindo ao Assistente ENEM',
};

export const AiStudyAssistantModule: React.FC = () => {
  const { gradeLevel, accessibility } = useApp();

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('enem_chat_messages');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return [INITIAL_WELCOME_MESSAGE];
  });

  const [inputQuestion, setInputQuestion] = useState('');
  const [selectedArea, setSelectedArea] = useState<string>('Todas as Áreas');
  const [fastMode, setFastMode] = useState<boolean>(accessibility.tdahMode || false);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Speech-to-text hook
  const {
    isSupported: isSpeechSupported,
    isListening,
    transcript,
    error: speechError,
    isSpeaking,
    startListening,
    stopListening,
    resetTranscript,
    speakText,
    stopSpeaking,
  } = useSpeechRecognition();

  // Save messages to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('enem_chat_messages', JSON.stringify(messages));
    } catch {
      // ignore
    }
  }, [messages]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Update input when voice transcript updates
  useEffect(() => {
    if (transcript) {
      setInputQuestion(transcript);
    }
  }, [transcript]);

  // Handle send message
  const handleSendMessage = async (textToSend?: string, fromVoice = false) => {
    const rawQuestion = (textToSend || inputQuestion).trim();
    if (!rawQuestion || isLoading) return;

    if (isListening) {
      stopListening();
    }

    const userMessageId = `msg_${Date.now()}`;
    const userMessage: ChatMessage = {
      id: userMessageId,
      sender: 'user',
      text: rawQuestion,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      area: selectedArea !== 'Todas as Áreas' ? selectedArea : undefined,
      isVoiceInput: fromVoice || isListening,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuestion('');
    resetTranscript();
    setIsLoading(true);

    try {
      // Prepare history for API
      const history = messages.slice(-6).map((m) => ({
        role: (m.sender === 'assistant' ? 'assistant' : 'user') as 'user' | 'assistant',
        text: m.text,
      }));

      const response = await sendStudyChatAPI({
        question: rawQuestion,
        history,
        knowledgeArea: selectedArea !== 'Todas as Áreas' ? selectedArea : undefined,
        gradeLevel,
        adaptations: accessibility,
        fastMode,
        isVoiceInput: userMessage.isVoiceInput,
      });

      const assistantMessage: ChatMessage = {
        id: `msg_ai_${Date.now()}`,
        sender: 'assistant',
        text: response.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        conceptTitle: response.conceptTitle,
        quickSummary: response.quickSummary,
        enemTip: response.enemTip,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // If user is visually impaired or reading aloud is enabled in accessibility, auto-read
      if (accessibility.audioNarration) {
        speakText(response.answer);
        setCurrentlySpeakingId(assistantMessage.id);
      }
    } catch (err: any) {
      console.error('Erro ao enviar mensagem:', err);
      const errorMessage: ChatMessage = {
        id: `msg_err_${Date.now()}`,
        sender: 'assistant',
        text: 'Desculpe, ocorreu uma instabilidade momentânea ao consultar o assistente. Por favor, tente enviar sua pergunta novamente.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    if (window.confirm('Deseja limpar todo o histórico de conversas do assistente?')) {
      stopSpeaking();
      setMessages([INITIAL_WELCOME_MESSAGE]);
      try {
        localStorage.removeItem('enem_chat_messages');
      } catch {
        // ignore
      }
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleSpeak = (text: string, id: string) => {
    if (isSpeaking && currentlySpeakingId === id) {
      stopSpeaking();
      setCurrentlySpeakingId(null);
    } else {
      speakText(text);
      setCurrentlySpeakingId(id);
    }
  };

  // Helper to render markdown-like formatting (bold, bullet points, headers)
  const renderFormattedText = (rawText: string) => {
    const lines = rawText.split('\n');

    return (
      <div className="space-y-2 text-sm leading-relaxed text-slate-800">
        {lines.map((line, idx) => {
          const trimmed = line.trim();

          if (!trimmed) {
            return <div key={idx} className="h-1.5" />;
          }

          // Special highlight box for 🎯, 💡, ⚠️, 🧩
          const isTarget = trimmed.startsWith('🎯') || trimmed.startsWith('Conceito');
          const isExample = trimmed.startsWith('💡') || trimmed.startsWith('Exemplo');
          const isAlert = trimmed.startsWith('⚠️') || trimmed.startsWith('Pulo do Gato');
          const isMnemonic = trimmed.startsWith('🧩') || trimmed.startsWith('Frase de Ouro') || trimmed.startsWith('Mnemônico');

          if (isTarget || isExample || isAlert || isMnemonic) {
            let boxClass = 'p-3 rounded-2xl border text-xs sm:text-sm font-medium';
            if (isTarget) boxClass += ' bg-indigo-50/70 border-indigo-200 text-indigo-950';
            if (isExample) boxClass += ' bg-amber-50/70 border-amber-200 text-amber-950';
            if (isAlert) boxClass += ' bg-rose-50/70 border-rose-200 text-rose-950';
            if (isMnemonic) boxClass += ' bg-emerald-50/70 border-emerald-200 text-emerald-950';

            return (
              <div key={idx} className={boxClass}>
                {renderBoldInline(trimmed)}
              </div>
            );
          }

          // Bullet point
          if (trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.startsWith('* ')) {
            const bulletContent = trimmed.substring(2);
            return (
              <div key={idx} className="flex items-start gap-2 pl-2">
                <span className="text-indigo-600 font-black">•</span>
                <span>{renderBoldInline(bulletContent)}</span>
              </div>
            );
          }

          // Numbered list
          if (/^\d+\.\s/.test(trimmed)) {
            const match = trimmed.match(/^(\d+\.)\s(.*)/);
            if (match) {
              return (
                <div key={idx} className="flex items-start gap-2 pl-2">
                  <span className="text-indigo-700 font-bold">{match[1]}</span>
                  <span>{renderBoldInline(match[2])}</span>
                </div>
              );
            }
          }

          return <p key={idx}>{renderBoldInline(trimmed)}</p>;
        })}
      </div>
    );
  };

  const renderBoldInline = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-extrabold text-slate-950">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Banner / Header */}
      <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 right-1/4 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-300 animate-spin" />
                Gemini 3.8 Flash • Tutor ENEM
              </span>
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <Mic className="w-3 h-3 text-emerald-300" />
                Voz-para-Texto Ativo
              </span>
              {fastMode && (
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  Modo TDAH (Pílula Rápida)
                </span>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              Assistente de Estudos com IA
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed">
              Tire dúvidas rápidas sobre conceitos, fórmulas, eventos históricos e redação do ENEM. Respostas pedagógicas estruturadas com exemplos práticos, pegadinhas de prova e ditado por voz acessível.
            </p>
          </div>

          {/* Quick Controls in Header */}
          <div className="flex flex-wrap items-center gap-3 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 self-start md:self-auto">
            {/* Knowledge Area selector */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Área da Dúvida:</label>
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="bg-slate-800 text-white text-xs font-semibold px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-400 cursor-pointer"
              >
                <option value="Todas as Áreas">Todas as Áreas</option>
                <option value="Ciências da Natureza">Ciências da Natureza (CN)</option>
                <option value="Ciências Humanas">Ciências Humanas (CH)</option>
                <option value="Matemática">Matemática (MT)</option>
                <option value="Linguagens">Linguagens (LC)</option>
                <option value="Redação">Redação Nota 1000</option>
              </select>
            </div>

            {/* Fast Mode Toggle */}
            <button
              onClick={() => setFastMode((prev) => !prev)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer self-end border ${
                fastMode
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
              title="Ativar respostas mais curtas e diretas em tópicos (ideal para TDAH)"
            >
              <Zap className="w-4 h-4" />
              <span>{fastMode ? 'Pílula Rápida ON' : 'Pílula Rápida'}</span>
            </button>

            {/* Clear history */}
            <button
              onClick={handleClearChat}
              className="px-3 py-2.5 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-rose-950 text-slate-300 hover:text-rose-200 border border-slate-700 hover:border-rose-500/50 transition cursor-pointer self-end flex items-center gap-1.5"
              title="Limpar histórico de dúvidas"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Limpar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Suggestion Chips Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-600 font-bold px-1">
          <span className="flex items-center gap-1.5">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            Dúvidas mais frequentes no ENEM (clique para perguntar):
          </span>
          <span className="text-[11px] text-slate-600">8 conceitos de alta recorrência</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {QUICK_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt.question)}
              disabled={isLoading}
              className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 text-xs font-bold text-slate-700 hover:text-indigo-900 transition whitespace-nowrap shadow-2xs group cursor-pointer disabled:opacity-50"
            >
              <span className="text-sm">{prompt.icon}</span>
              <span>{prompt.label}</span>
              <span className="text-[10px] text-slate-600 group-hover:text-indigo-600 font-normal">
                • {prompt.area}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Conversation Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[600px] overflow-hidden">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-slate-50/40">
          {messages.map((message) => {
            const isUser = message.sender === 'user';

            return (
              <div
                key={message.id}
                className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {/* Avatar Icon */}
                <div
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 font-bold shadow-xs ${
                    isUser
                      ? 'bg-indigo-600 text-white'
                      : 'bg-linear-to-br from-indigo-700 to-purple-800 text-white'
                  }`}
                >
                  {isUser ? (
                    message.isVoiceInput ? (
                      <Mic className="w-4 h-4" />
                    ) : (
                      'Eu'
                    )
                  ) : (
                    <Sparkles className="w-4 h-4 text-amber-300" />
                  )}
                </div>

                {/* Message Bubble Content */}
                <div className="space-y-1.5 max-w-[85%] sm:max-w-[78%]">
                  {/* Meta sender & time */}
                  <div className={`flex items-center gap-2 text-[11px] font-semibold ${isUser ? 'justify-end text-slate-600' : 'text-slate-600'}`}>
                    <span>{isUser ? 'Você' : 'Tutor Coruja (Gemini)'}</span>
                    <span>•</span>
                    <span>{message.timestamp}</span>
                    {message.isVoiceInput && (
                      <span className="px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                        <Mic className="w-2.5 h-2.5" /> Voz
                      </span>
                    )}
                  </div>

                  {/* Bubble card */}
                  <div
                    className={`p-4 sm:p-5 rounded-3xl shadow-xs transition-all ${
                      isUser
                        ? 'bg-indigo-600 text-white rounded-tr-xs'
                        : 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-xs'
                    }`}
                  >
                    {/* Concept title badge if assistant */}
                    {!isUser && message.conceptTitle && (
                      <div className="mb-2 pb-2 border-b border-slate-100 flex items-center justify-between gap-2">
                        <span className="text-xs font-black text-indigo-700 flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                          {message.conceptTitle}
                        </span>
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                          ENEM Inclusivo
                        </span>
                      </div>
                    )}

                    {/* Formatted body */}
                    {isUser ? (
                      <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{message.text}</p>
                    ) : (
                      renderFormattedText(message.text)
                    )}

                    {/* Actions bar for assistant response */}
                    {!isUser && (
                      <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          {/* Audio narration (Text-to-Speech) */}
                          <button
                            onClick={() => handleToggleSpeak(message.text, message.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                              isSpeaking && currentlySpeakingId === message.id
                                ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                            title="Ouvir explicação narrada por voz"
                          >
                            {isSpeaking && currentlySpeakingId === message.id ? (
                              <>
                                <VolumeX className="w-3.5 h-3.5 text-indigo-600" />
                                <span>Pausar Voz</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-ping"></span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
                                <span>Ouvir Explicação</span>
                              </>
                            )}
                          </button>

                          {/* Copy button */}
                          <button
                            onClick={() => handleCopy(message.text, message.id)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition cursor-pointer"
                            title="Copiar explicação"
                          >
                            {copiedId === message.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-emerald-700">Copiado!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-slate-600" />
                                <span>Copiar</span>
                              </>
                            )}
                          </button>
                        </div>

                        <span className="text-[11px] text-slate-600">
                          Baseado na Matriz de Referência do ENEM
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex gap-3 max-w-xl mr-auto animate-fadeIn">
              <div className="w-9 h-9 rounded-2xl bg-linear-to-br from-indigo-700 to-purple-800 text-white flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 animate-spin text-amber-300" />
              </div>
              <div className="bg-white border border-slate-200 p-4 rounded-3xl rounded-tl-xs shadow-xs space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-600">
                  <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
                  <span>O Gemini está formulando a explicação pedagógica...</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Real-time Voice Activity Indicator (when mic is active) */}
        {isListening && (
          <div className="bg-rose-50 border-t border-b border-rose-200 px-4 py-2.5 flex items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-2.5 text-rose-800 text-xs font-bold">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600"></span>
              </span>
              <span>Gravando sua voz... fale com clareza. Transcrevendo em tempo real:</span>
            </div>
            <button
              onClick={stopListening}
              className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-extrabold transition cursor-pointer"
            >
              Parar Gravação
            </button>
          </div>
        )}

        {/* Speech error indicator */}
        {speechError && (
          <div className="bg-amber-50 border-t border-amber-200 px-4 py-2 text-xs text-amber-900 flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-medium">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              {speechError}
            </span>
            <button
              onClick={resetTranscript}
              className="text-amber-700 underline font-bold cursor-pointer"
            >
              Fechar
            </button>
          </div>
        )}

        {/* Input Bar with Voice-to-Text */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200 space-y-2">
          <div className="flex items-end gap-2 sm:gap-3">
            {/* 🎙️ Voice-to-Text Button */}
            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              disabled={isLoading}
              className={`p-3.5 rounded-2xl flex items-center justify-center transition cursor-pointer shrink-0 ${
                isListening
                  ? 'bg-rose-600 text-white ring-4 ring-rose-200 animate-pulse'
                  : 'bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 border border-slate-200 hover:border-indigo-300'
              }`}
              title={
                isListening
                  ? 'Clique para parar a gravação de voz'
                  : 'Ditar pergunta por voz (Acessibilidade Voz-para-Texto)'
              }
              aria-label="Ditar dúvida por voz"
            >
              {isListening ? (
                <MicOff className="w-5 h-5 text-white" />
              ) : (
                <Mic className="w-5 h-5 text-indigo-600" />
              )}
            </button>

            {/* Input textarea */}
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={inputQuestion}
                onChange={(e) => setInputQuestion(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  isListening
                    ? 'Ouvindo sua voz... fale agora'
                    : 'Digite ou dite sua dúvida sobre qualquer matéria do ENEM (Pressione Enter para enviar)...'
                }
                rows={2}
                disabled={isLoading}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:bg-white resize-none transition"
              />

              {/* Character counter / hint */}
              {inputQuestion.length > 0 && (
                <span className="absolute bottom-2 right-3 text-[10px] text-slate-600 font-medium">
                  {inputQuestion.length} carac.
                </span>
              )}
            </div>

            {/* Send Button */}
            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={!inputQuestion.trim() || isLoading}
              className={`p-3.5 rounded-2xl flex items-center justify-center font-bold transition cursor-pointer shrink-0 ${
                inputQuestion.trim() && !isLoading
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-200 text-slate-600 cursor-not-allowed'
              }`}
              title="Enviar dúvida para o assistente"
              aria-label="Enviar dúvida"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>

          {/* Bottom accessibility info line */}
          <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-600 px-1 pt-0.5">
            <span className="flex items-center gap-1">
              <Info className="w-3 h-3 text-indigo-500" />
              Pressione <strong>Enter</strong> para enviar ou <strong>Shift + Enter</strong> para quebra de linha.
            </span>
            <span>
              Respostas inclusivas preparadas para o seu nível: <strong>{gradeLevel}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Feature Cards / Tips below chat */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700 shrink-0">
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black text-indigo-950">Voz-para-Texto Integrada</h4>
            <p className="text-[11px] text-indigo-800 leading-relaxed mt-0.5">
              Ideal para estudantes com dislexia ou fadiga motora: basta clicar no microfone e ditar sua dúvida naturalmente.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-100 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-100 text-amber-700 shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black text-amber-950">Pílula Rápida TDAH</h4>
            <p className="text-[11px] text-amber-800 leading-relaxed mt-0.5">
              Ative o modo pílula para respostas ultra-diretas em tópicos, eliminando paralisia por excesso de texto.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
            <Volume2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black text-emerald-950">Áudio Narração TTS</h4>
            <p className="text-[11px] text-emerald-800 leading-relaxed mt-0.5">
              Clique em "Ouvir Explicação" em qualquer resposta do tutor para escutar o áudio sintetizado em português claro.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
