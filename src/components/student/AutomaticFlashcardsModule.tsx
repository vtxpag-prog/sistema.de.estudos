import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  AutomaticFlashcard,
  KnowledgeArea,
  SpacedRepetitionLevel,
  StudentWrongAnswer
} from '../../types';
import {
  Sparkles,
  RotateCw,
  Volume2,
  VolumeX,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  Layers,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Filter,
  Check,
  X,
  Flame,
  ChevronRight,
  RefreshCw,
  Trash2,
  Lightbulb,
  Award,
  Zap,
  Target,
  FileQuestion,
  Maximize2
} from 'lucide-react';

export const AutomaticFlashcardsModule: React.FC = () => {
  const {
    flashcards,
    wrongQuestions,
    pendingFlashcardsCount,
    updateFlashcardReview,
    generateFlashcardForWrongAnswer,
    generateAllPendingFlashcards,
    deleteFlashcard,
    resetFlashcardsToDefault,
    accessibility,
    speakText,
    stopSpeaking,
    isSpeaking,
    setStudentActiveTab,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'revisao' | 'erros' | 'biblioteca'>('revisao');
  const [selectedAreaFilter, setSelectedAreaFilter] = useState<string>('todas');
  const [selectedBoxFilter, setSelectedBoxFilter] = useState<string>('todas');
  const [searchQuery, setSearchQuery] = useState('');

  // Estados da Sessão Ativa de Revisão
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [reviewFilterMode, setReviewFilterMode] = useState<'pendentes' | 'todos'>('pendentes');
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [sessionStats, setSessionStats] = useState({ reviewed: 0, successes: 0 });

  // Estados de Carregamento de IA
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [generatingCardId, setGeneratingCardId] = useState<string | null>(null);
  const [successNotification, setSuccessNotification] = useState<string | null>(null);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Flashcards elegíveis para a revisão ativa
  const cardsForReview = useMemo(() => {
    let list = flashcards;
    if (selectedAreaFilter !== 'todas') {
      list = list.filter((c) => c.area === selectedAreaFilter);
    }
    if (reviewFilterMode === 'pendentes') {
      list = list.filter((c) => c.nextReviewDate <= todayStr);
    }
    return list;
  }, [flashcards, selectedAreaFilter, reviewFilterMode, todayStr]);

  const activeReviewCard: AutomaticFlashcard | undefined = cardsForReview[currentCardIndex];

  // Métricas gerais do Sistema de Leitner
  const statsSummary = useMemo(() => {
    const total = flashcards.length;
    const dueToday = flashcards.filter((c) => c.nextReviewDate <= todayStr).length;
    const box1 = flashcards.filter((c) => c.boxLevel === 1).length;
    const box2 = flashcards.filter((c) => c.boxLevel === 2).length;
    const box3 = flashcards.filter((c) => c.boxLevel === 3).length;
    const box4 = flashcards.filter((c) => c.boxLevel === 4).length;
    const mastered = box4;
    const learning = box1 + box2 + box3;

    return { total, dueToday, box1, box2, box3, box4, mastered, learning };
  }, [flashcards, todayStr]);

  // Lista de questões erradas não geradas
  const ungeneratedWrongs = useMemo(() => {
    return wrongQuestions.filter((w) => !w.flashcardGenerated);
  }, [wrongQuestions]);

  const showNotification = (msg: string) => {
    setSuccessNotification(msg);
    setTimeout(() => setSuccessNotification(null), 4000);
  };

  // Avaliação de desempenho na sessão de revisão
  const handleRateCard = (rating: 'errei' | 'dificil' | 'bom' | 'facil') => {
    if (!activeReviewCard) return;

    stopSpeaking();
    updateFlashcardReview(activeReviewCard.id, rating);

    const isSuccess = rating === 'bom' || rating === 'facil';
    setSessionStats((prev) => ({
      reviewed: prev.reviewed + 1,
      successes: isSuccess ? prev.successes + 1 : prev.successes,
    }));

    setIsFlipped(false);

    if (currentCardIndex < cardsForReview.length - 1) {
      setCurrentCardIndex((prev) => prev + 1);
    } else {
      setSessionCompleted(true);
    }
  };

  const handleRestartSession = () => {
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setSessionCompleted(false);
    setSessionStats({ reviewed: 0, successes: 0 });
    stopSpeaking();
  };

  // Gerar para uma questão específica
  const handleGenerateSingle = async (wrongId: string) => {
    setGeneratingCardId(wrongId);
    const success = await generateFlashcardForWrongAnswer(wrongId);
    setGeneratingCardId(null);
    if (success) {
      showNotification('✨ Flashcard gerado com sucesso usando Gemini e adicionado à Caixa 1!');
    }
  };

  // Gerar lote com Gemini
  const handleGenerateAll = async () => {
    setIsGeneratingAll(true);
    const count = await generateAllPendingFlashcards();
    setIsGeneratingAll(false);
    if (count > 0) {
      showNotification(`🚀 ${count} novo(s) Flashcard(s) gerado(s) com sucesso a partir dos seus erros!`);
    } else {
      showNotification('Não há erros pendentes sem flashcard.');
    }
  };

  // Helpers de cores para caixas
  const getBoxBadge = (level: SpacedRepetitionLevel) => {
    switch (level) {
      case 1:
        return { label: 'Caixa 1 • Diário (1 dia)', color: 'bg-rose-100 text-rose-800 border-rose-300' };
      case 2:
        return { label: 'Caixa 2 • Em Fixação (3 dias)', color: 'bg-amber-100 text-amber-800 border-amber-300' };
      case 3:
        return { label: 'Caixa 3 • Boa Retenção (7 dias)', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case 4:
        return { label: 'Caixa 4 • Dominado (14+ dias)', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' };
    }
  };

  const areasList: KnowledgeArea[] = [
    'Linguagens, Códigos e suas Tecnologias',
    'Ciências Humanas e suas Tecnologias',
    'Ciências da Natureza e suas Tecnologias',
    'Matemática e suas Tecnologias',
  ];

  return (
    <div className={`space-y-6 ${accessibility.focusMode ? 'space-y-8 sm:space-y-10' : ''}`}>
      {/* Notificação Flutuante */}
      {successNotification && (
        <div className="bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-lg flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>{successNotification}</span>
          </div>
          <button
            onClick={() => setSuccessNotification(null)}
            className="text-white hover:text-emerald-100 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header do Módulo */}
      <div className={`bg-white rounded-3xl border shadow-xs ${
        accessibility.focusMode ? 'p-8 sm:p-10 border-2 border-slate-300' : 'p-6 border-slate-200'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pb-6 border-b border-slate-100">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                Módulo de Fixação Ativa • Repetição Espaçada (SRS)
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                Alimentado com Gemini 3.8
              </span>
            </div>
            <h2 className={`font-extrabold text-slate-900 tracking-tight ${
              accessibility.focusMode ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'
            }`}>
              Flashcards Automáticos de Questões Erradas
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              O Gemini analisa seus erros nos simulados, extrai o conceito-chave que causou a dúvida e cria perguntas-gatilho com a regra de ouro para fixação definitiva na memória de longo prazo.
            </p>
          </div>

          {/* Botão de Ação Rápida: Gerar Pendentes */}
          <div className="flex flex-wrap items-center gap-2.5">
            {ungeneratedWrongs.length > 0 && (
              <button
                onClick={handleGenerateAll}
                disabled={isGeneratingAll}
                className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-60"
              >
                <Sparkles className="w-4 h-4 animate-spin-slow" />
                <span>
                  {isGeneratingAll
                    ? 'Extraindo com Gemini...'
                    : `Gerar ${ungeneratedWrongs.length} Flashcard(s) com IA`}
                </span>
              </button>
            )}

            <button
              onClick={resetFlashcardsToDefault}
              className="px-3.5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition border border-slate-200 flex items-center gap-1.5"
              title="Restaurar dados de demonstração dos flashcards"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Resetar Mock</span>
            </button>
          </div>
        </div>

        {/* Métricas e Sistema de Leitner (Caixas 1 a 4) */}
        {!accessibility.focusMode ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6">
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-900">Revisar Hoje</span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <span className="text-2xl font-extrabold text-amber-950 block mt-1">
                {statsSummary.dueToday}
              </span>
              <span className="text-[11px] text-amber-700">Cards devidos no intervalo</span>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-indigo-900">Total de Flashcards</span>
                <Layers className="w-4 h-4 text-indigo-600" />
              </div>
              <span className="text-2xl font-extrabold text-indigo-950 block mt-1">
                {statsSummary.total}
              </span>
              <span className="text-[11px] text-indigo-700">Gerados e ativos</span>
            </div>

            <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-sky-900">Em Aprendizado</span>
                <Flame className="w-4 h-4 text-sky-600" />
              </div>
              <span className="text-2xl font-extrabold text-sky-950 block mt-1">
                {statsSummary.learning}
              </span>
              <span className="text-[11px] text-sky-700">Caixas 1, 2 e 3</span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-900">Dominados (Caixa 4)</span>
                <Award className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="text-2xl font-extrabold text-emerald-950 block mt-1">
                {statsSummary.mastered}
              </span>
              <span className="text-[11px] text-emerald-700">Retenção de longo prazo</span>
            </div>
          </div>
        ) : (
          /* Modo Foco: Informação simplificada */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
            <div className="p-5 rounded-2xl bg-slate-50 border-2 border-slate-200 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-teal-700 text-white flex items-center justify-center font-bold text-lg">
                {statsSummary.dueToday}
              </div>
              <div>
                <span className="font-extrabold text-slate-900 text-lg block">Cards para Revisar Hoje</span>
                <span className="text-xs text-slate-600">Revisão no seu próprio ritmo, sem pressa.</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border-2 border-slate-200 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-lg">
                {statsSummary.mastered}
              </div>
              <div>
                <span className="font-extrabold text-slate-900 text-lg block">Conceitos Já Dominados</span>
                <span className="text-xs text-slate-600">Fixados na memória de longo prazo.</span>
              </div>
            </div>
          </div>
        )}

        {/* Visualizador das 4 Caixas do Sistema de Leitner */}
        {!accessibility.focusMode && (
          <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-600" />
                Estrutura das Caixas de Leitner (Repetição Espaçada Científica):
              </span>
              <span className="text-[11px] text-slate-500">
                Quanto mais você acerta, mais espaçado é o intervalo de revisão.
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 bg-white rounded-xl border border-rose-200">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-rose-700">Caixa 1 • 1 dia</span>
                  <span className="text-xs font-extrabold text-slate-900">{statsSummary.box1}</span>
                </div>
                <div className="w-full bg-rose-100 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-rose-500 h-full rounded-full"
                    style={{ width: `${statsSummary.total > 0 ? (statsSummary.box1 / statsSummary.total) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-amber-200">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-amber-700">Caixa 2 • 3 dias</span>
                  <span className="text-xs font-extrabold text-slate-900">{statsSummary.box2}</span>
                </div>
                <div className="w-full bg-amber-100 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full"
                    style={{ width: `${statsSummary.total > 0 ? (statsSummary.box2 / statsSummary.total) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-emerald-200">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-700">Caixa 3 • 7 dias</span>
                  <span className="text-xs font-extrabold text-slate-900">{statsSummary.box3}</span>
                </div>
                <div className="w-full bg-emerald-100 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{ width: `${statsSummary.total > 0 ? (statsSummary.box3 / statsSummary.total) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-indigo-200">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-indigo-700">Caixa 4 • 14+ dias</span>
                  <span className="text-xs font-extrabold text-slate-900">{statsSummary.box4}</span>
                </div>
                <div className="w-full bg-indigo-100 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-indigo-500 h-full rounded-full"
                    style={{ width: `${statsSummary.total > 0 ? (statsSummary.box4 / statsSummary.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navegação entre Abas do Módulo */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => {
            setActiveTab('revisao');
            handleRestartSession();
          }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs transition ${
            activeTab === 'revisao'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <RotateCw className="w-4 h-4" />
          <span>Sessão de Revisão Ativa ({cardsForReview.length})</span>
          {statsSummary.dueToday > 0 && (
            <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
              {statsSummary.dueToday}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('erros')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs transition ${
            activeTab === 'erros'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <FileQuestion className="w-4 h-4" />
          <span>Questões Erradas & IA ({wrongQuestions.length})</span>
          {ungeneratedWrongs.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
              {ungeneratedWrongs.length} pendentes
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('biblioteca')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs transition ${
            activeTab === 'biblioteca'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Biblioteca de Cards ({flashcards.length})</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* ABA 1: SESSÃO DE REVISÃO ATIVA (FLIP CARD & ACTIVE RECALL)     */}
      {/* ============================================================== */}
      {activeTab === 'revisao' && (
        <div className="space-y-6">
          {/* Barra de Filtros da Sessão */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-600">Modo de Sessão:</span>
              <button
                onClick={() => {
                  setReviewFilterMode('pendentes');
                  handleRestartSession();
                }}
                className={`px-3 py-1.5 rounded-xl font-bold transition ${
                  reviewFilterMode === 'pendentes'
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Apenas Devidos Hoje ({statsSummary.dueToday})
              </button>
              <button
                onClick={() => {
                  setReviewFilterMode('todos');
                  handleRestartSession();
                }}
                className={`px-3 py-1.5 rounded-xl font-bold transition ${
                  reviewFilterMode === 'todos'
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Todos os Flashcards ({flashcards.length})
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-600">Área:</span>
              <select
                value={selectedAreaFilter}
                onChange={(e) => {
                  setSelectedAreaFilter(e.target.value);
                  handleRestartSession();
                }}
                className="p-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-indigo-500"
              >
                <option value="todas">Todas as Áreas</option>
                {areasList.map((a) => (
                  <option key={a} value={a}>
                    {a.split(' e ')[0]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* SESSÃO CONCLUÍDA */}
          {sessionCompleted ? (
            <div className="bg-white rounded-3xl p-8 sm:p-12 border-2 border-emerald-300 text-center space-y-5 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-2 max-w-lg mx-auto">
                <h3 className="text-2xl font-extrabold text-slate-900">
                  Parabéns! Sessão de Revisão Concluída 🎉
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Você revisou <strong>{sessionStats.reviewed} flashcard(s)</strong> nesta sessão com um aproveitamento de{' '}
                  <strong>
                    {sessionStats.reviewed > 0
                      ? Math.round((sessionStats.successes / sessionStats.reviewed) * 100)
                      : 100}
                    %
                  </strong>
                  . A repetição espaçada está fortalecendo suas conexões neurais para o ENEM.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleRestartSession}
                  className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-2xl shadow-xs transition flex items-center gap-2"
                >
                  <RotateCw className="w-4 h-4" />
                  <span>Revisar Novamente</span>
                </button>
                <button
                  onClick={() => setActiveTab('erros')}
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-2xl transition"
                >
                  Ver Questões com Erro
                </button>
              </div>
            </div>
          ) : !activeReviewCard ? (
            /* Nenhum card para revisar */
            <div className="bg-white rounded-3xl p-10 border border-slate-200 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="font-extrabold text-lg text-slate-900">
                Nenhum Flashcard Pendente para Revisão Agora!
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Excelente disciplina! Você já revisou todos os flashcards agendados para hoje. Seus conceitos estão sendo consolidados no tempo ideal.
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setReviewFilterMode('todos');
                    handleRestartSession();
                  }}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition"
                >
                  Revisar Todos Mesmo Assim
                </button>
                <button
                  onClick={() => setActiveTab('erros')}
                  className="px-5 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-xs rounded-xl transition"
                >
                  Gerar Mais Cards dos Meus Erros
                </button>
              </div>
            </div>
          ) : (
            /* CARD INTERATIVO DE REVISÃO ESPAÇADA */
            <div className="space-y-4 max-w-3xl mx-auto">
              {/* Barra de Progresso da Sessão */}
              <div className="flex items-center justify-between text-xs text-slate-600 px-1">
                <span className="font-semibold">
                  Card {currentCardIndex + 1} de {cardsForReview.length}
                </span>
                <span className="font-medium text-amber-700">
                  {getBoxBadge(activeReviewCard.boxLevel).label}
                </span>
              </div>

              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${((currentCardIndex + 1) / cardsForReview.length) * 100}%` }}
                />
              </div>

              {/* O FLASHCARD (INTERATIVO COM FLIP) */}
              <div
                className={`min-h-[360px] sm:min-h-[400px] rounded-3xl border-2 transition-all p-6 sm:p-8 flex flex-col justify-between shadow-md relative ${
                  isFlipped
                    ? 'bg-slate-900 border-slate-700 text-white'
                    : 'bg-white border-slate-200 text-slate-900'
                } ${accessibility.focusMode ? 'p-8 sm:p-10 border-3' : ''}`}
              >
                {/* Cabeçalho do Card */}
                <div>
                  <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-200/40">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] font-bold px-3 py-1 rounded-full border ${
                          isFlipped
                            ? 'bg-slate-800 text-amber-300 border-slate-700'
                            : getBoxBadge(activeReviewCard.boxLevel).color
                        }`}
                      >
                        {getBoxBadge(activeReviewCard.boxLevel).label}
                      </span>
                      <span className={`text-[11px] font-medium ${isFlipped ? 'text-slate-400' : 'text-slate-500'}`}>
                        {activeReviewCard.area.split(' e ')[0]}
                      </span>
                    </div>

                    {/* Botão de Narração TTS (Acessibilidade) */}
                    <button
                      onClick={() => {
                        if (isSpeaking) {
                          stopSpeaking();
                        } else {
                          const textToRead = isFlipped
                            ? `${activeReviewCard.back}. Dica de memorização: ${activeReviewCard.mnemonicTip}`
                            : `${activeReviewCard.keyConcept}. Pergunta: ${activeReviewCard.front}`;
                          speakText(textToRead);
                        }
                      }}
                      className={`p-2 rounded-xl border transition ${
                        isFlipped
                          ? 'bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-700'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                      title="Ouvir leitura por voz (Acessibilidade)"
                    >
                      {isSpeaking ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Nome do Conceito-Chave */}
                  <div className="mt-4 flex items-center gap-2">
                    <Sparkles className={`w-4 h-4 ${isFlipped ? 'text-amber-400' : 'text-amber-600'}`} />
                    <span className={`text-xs font-bold uppercase tracking-wider ${isFlipped ? 'text-amber-400' : 'text-amber-700'}`}>
                      {activeReviewCard.keyConcept}
                    </span>
                  </div>
                </div>

                {/* CORPO DO CARD (FRENTE vs VERSO) */}
                <div className="py-6 sm:py-8 my-auto space-y-4">
                  {!isFlipped ? (
                    /* FRENTE: PERGUNTA-GATILHO */
                    <div className="space-y-4 text-center sm:text-left">
                      <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400 block">
                        Frente • Resgate Ativo (Active Recall)
                      </span>
                      <p className={`font-bold leading-relaxed ${
                        accessibility.focusMode ? 'text-xl sm:text-2xl text-slate-900 leading-loose' : 'text-lg sm:text-xl text-slate-900'
                      }`}>
                        {activeReviewCard.front}
                      </p>
                      <p className="text-xs text-slate-400 italic">
                        Tente lembrar a resposta antes de virar o card para consolidar a memória.
                      </p>
                    </div>
                  ) : (
                    /* VERSO: RESPOSTA EXPLICATIVA + PULO DO GATO */
                    <div className="space-y-5 animate-fadeIn">
                      <div>
                        <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400 block mb-1.5">
                          Verso • Resposta & Explicação Concisa
                        </span>
                        <div className={`font-medium whitespace-pre-line leading-relaxed ${
                          accessibility.focusMode ? 'text-base sm:text-lg text-slate-100 leading-loose' : 'text-sm sm:text-base text-slate-200'
                        }`}>
                          {activeReviewCard.back}
                        </div>
                      </div>

                      {/* O Pulo do Gato (Mnemônico do ENEM) */}
                      {activeReviewCard.mnemonicTip && (
                        <div className="p-3.5 bg-amber-950/70 border border-amber-500/40 rounded-2xl text-amber-200 text-xs sm:text-sm font-semibold flex items-start gap-2.5">
                          <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                          <div className="leading-relaxed">
                            {activeReviewCard.mnemonicTip}
                          </div>
                        </div>
                      )}

                      {/* Por que errou */}
                      {activeReviewCard.whyItWasWrong && (
                        <div className="text-[11px] text-slate-400 italic border-l-2 border-slate-700 pl-3">
                          {activeReviewCard.whyItWasWrong}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* BOTÃO VIRAR CARD */}
                <div className="pt-4 border-t border-slate-200/40 flex items-center justify-between">
                  <span className={`text-[11px] ${isFlipped ? 'text-slate-400' : 'text-slate-500'}`}>
                    Tópico: {activeReviewCard.topic}
                  </span>

                  <button
                    onClick={() => setIsFlipped(!isFlipped)}
                    className={`px-5 py-2.5 rounded-2xl font-bold text-xs transition flex items-center gap-2 shadow-xs cursor-pointer ${
                      isFlipped
                        ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-600'
                        : 'bg-amber-500 hover:bg-amber-600 text-white'
                    }`}
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>{isFlipped ? 'Ver Pergunta Novamente' : 'Virar Card (Ver Resposta)'}</span>
                  </button>
                </div>
              </div>

              {/* BOTÕES DE AVALIAÇÃO DE DESEMPENHO (SÓ APARECEM APÓS VIRAR) */}
              {isFlipped ? (
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">
                      Como foi sua lembrança deste conceito? (Selecione para agendar próximo intervalo):
                    </span>
                    <span className="text-[11px] text-slate-400">Sistema Leitner SRS</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {/* Errei */}
                    <button
                      onClick={() => handleRateCard('errei')}
                      className="p-3 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-900 border-2 border-rose-300 font-bold text-xs transition flex flex-col items-center gap-1 shadow-2xs"
                    >
                      <span className="text-base">🔴 Errei</span>
                      <span className="text-[10px] text-rose-700 font-normal">Revisar amanhã (Caixa 1)</span>
                    </button>

                    {/* Difícil */}
                    <button
                      onClick={() => handleRateCard('dificil')}
                      className="p-3 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 border-2 border-amber-300 font-bold text-xs transition flex flex-col items-center gap-1 shadow-2xs"
                    >
                      <span className="text-base">🟡 Difícil</span>
                      <span className="text-[10px] text-amber-700 font-normal">Revisar em 2 dias</span>
                    </button>

                    {/* Bom */}
                    <button
                      onClick={() => handleRateCard('bom')}
                      className="p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-2 border-emerald-300 font-bold text-xs transition flex flex-col items-center gap-1 shadow-2xs"
                    >
                      <span className="text-base">🟢 Bom</span>
                      <span className="text-[10px] text-emerald-700 font-normal">Avançar caixa (3-7 dias)</span>
                    </button>

                    {/* Fácil */}
                    <button
                      onClick={() => handleRateCard('facil')}
                      className="p-3 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border-2 border-indigo-300 font-bold text-xs transition flex flex-col items-center gap-1 shadow-2xs"
                    >
                      <span className="text-base">🌟 Fácil</span>
                      <span className="text-[10px] text-indigo-700 font-normal">Dominado (14+ dias)</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center p-3 bg-slate-100/70 rounded-2xl text-xs text-slate-500">
                  💡 Clique no botão <strong>"Virar Card"</strong> para conferir o verso e avaliar sua memorização.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* ABA 2: QUESTÕES QUE O ALUNO ERROU & GERADOR COM GEMINI         */}
      {/* ============================================================== */}
      {activeTab === 'erros' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                Histórico de Erros nos Simulados e Exercícios
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Cada erro no ENEM é uma oportunidade de ouro para construir um ponto cego superado. O Gemini transforma esses tropeços em memorização duradoura.
              </p>
            </div>

            {ungeneratedWrongs.length > 0 && (
              <button
                onClick={handleGenerateAll}
                disabled={isGeneratingAll}
                className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition shadow-xs flex items-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  {isGeneratingAll
                    ? 'Extraindo com Gemini...'
                    : `Extrair Todos (${ungeneratedWrongs.length}) com IA`}
                </span>
              </button>
            )}
          </div>

          {wrongQuestions.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 border border-slate-200 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h4 className="font-bold text-base text-slate-900">Nenhum erro registrado ainda!</h4>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                À medida que você resolve simulados nos modos Série ou ENEM, todas as questões com erro serão listadas aqui automaticamente.
              </p>
              <button
                onClick={() => setStudentActiveTab('serie')}
                className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl transition"
              >
                Praticar Questões Agora
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {wrongQuestions.map((wrong, idx) => (
                <div
                  key={wrong.id || idx}
                  className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4 hover:border-slate-300 transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {wrong.area.split(' e ')[0]}
                      </span>
                      <span className="text-xs font-semibold text-slate-800">
                        {wrong.topic}
                      </span>
                      {wrong.bnccSkill && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          {wrong.bnccSkill}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {wrong.flashcardGenerated ? (
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Flashcard Ativo no SRS
                        </span>
                      ) : (
                        <button
                          onClick={() => handleGenerateSingle(wrong.id)}
                          disabled={generatingCardId === wrong.id}
                          className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-2xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>
                            {generatingCardId === wrong.id
                              ? 'Extraindo...'
                              : '⚡ Gerar Flashcard com Gemini'}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Enunciado */}
                  <div className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                    {wrong.questionTitle}
                  </div>

                  {/* Comparativo: Alternativa do Aluno vs Gabarito */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl">
                      <span className="font-bold text-rose-900 block mb-1 flex items-center gap-1">
                        <X className="w-3.5 h-3.5 text-rose-600" /> Sua Resposta (Opção {String.fromCharCode(65 + wrong.studentChoice)}):
                      </span>
                      <span className="text-rose-800">
                        {wrong.options[wrong.studentChoice] || 'Alternativa assinalada'}
                      </span>
                    </div>

                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl">
                      <span className="font-bold text-emerald-900 block mb-1 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-600" /> Gabarito Oficial (Opção {String.fromCharCode(65 + wrong.correctAnswer)}):
                      </span>
                      <span className="text-emerald-800">
                        {wrong.options[wrong.correctAnswer] || 'Alternativa correta'}
                      </span>
                    </div>
                  </div>

                  {/* Explicação */}
                  {wrong.explanation && (
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-700 leading-relaxed">
                      <strong className="text-slate-900">Justificativa Pedagógica:</strong> {wrong.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* ABA 3: BIBLIOTECA COMPLETA DE FLASHCARDS                       */}
      {/* ============================================================== */}
      {activeTab === 'biblioteca' && (
        <div className="space-y-6">
          {/* Filtros e Busca */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1 flex flex-wrap items-center gap-3">
              <input
                type="text"
                placeholder="Buscar por conceito-chave ou tópico..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="p-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 w-full sm:w-64 focus:outline-indigo-500"
              />

              <select
                value={selectedAreaFilter}
                onChange={(e) => setSelectedAreaFilter(e.target.value)}
                className="p-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-700 focus:outline-indigo-500"
              >
                <option value="todas">Todas as Áreas</option>
                {areasList.map((a) => (
                  <option key={a} value={a}>
                    {a.split(' e ')[0]}
                  </option>
                ))}
              </select>

              <select
                value={selectedBoxFilter}
                onChange={(e) => setSelectedBoxFilter(e.target.value)}
                className="p-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-700 focus:outline-indigo-500"
              >
                <option value="todas">Todas as Caixas Leitner</option>
                <option value="1">Caixa 1 • 1 dia</option>
                <option value="2">Caixa 2 • 3 dias</option>
                <option value="3">Caixa 3 • 7 dias</option>
                <option value="4">Caixa 4 • 14+ dias (Dominado)</option>
              </select>
            </div>

            <div className="text-xs text-slate-500">
              Exibindo {flashcards.length} flashcard(s) cadastrado(s)
            </div>
          </div>

          {/* Grid de Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {flashcards
              .filter((card) => {
                const matchesArea = selectedAreaFilter === 'todas' || card.area === selectedAreaFilter;
                const matchesBox = selectedBoxFilter === 'todas' || card.boxLevel.toString() === selectedBoxFilter;
                const matchesQuery =
                  card.keyConcept.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  card.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  card.front.toLowerCase().includes(searchQuery.toLowerCase());
                return matchesArea && matchesBox && matchesQuery;
              })
              .map((card) => {
                const isDue = card.nextReviewDate <= todayStr;
                return (
                  <div
                    key={card.id}
                    className="bg-white rounded-3xl p-5 border border-slate-200 hover:border-slate-300 shadow-xs space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getBoxBadge(card.boxLevel).color}`}>
                          {getBoxBadge(card.boxLevel).label}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {isDue ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                              Revisão Hoje
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-500">
                              Próx: {card.nextReviewDate}
                            </span>
                          )}

                          <button
                            onClick={() => deleteFlashcard(card.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition"
                            title="Excluir flashcard"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5 text-amber-700 text-xs font-bold">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{card.keyConcept}</span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 mt-1 leading-snug">
                          {card.front}
                        </h4>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-2xl text-xs text-slate-700 leading-relaxed">
                        <strong className="text-slate-900 block mb-0.5">Resposta-Chave:</strong>
                        {card.back}
                      </div>

                      {card.mnemonicTip && (
                        <div className="text-[11px] font-medium text-amber-900 bg-amber-50/70 p-2.5 rounded-xl border border-amber-200/80">
                          {card.mnemonicTip}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Revisões: {card.reviewCount}</span>
                      <button
                        onClick={() => {
                          const idx = cardsForReview.findIndex((c) => c.id === card.id);
                          if (idx >= 0) setCurrentCardIndex(idx);
                          setActiveTab('revisao');
                          setIsFlipped(false);
                        }}
                        className="text-indigo-600 hover:text-indigo-800 font-bold transition flex items-center gap-1"
                      >
                        <span>Praticar Agora</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};
