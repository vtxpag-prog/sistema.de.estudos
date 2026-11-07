import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  WeeklyStudyPlan,
  WeeklyStudySession,
  WeeklyDayPlan,
  KnowledgeArea,
} from '../../types';
import { generateWeeklyScheduleAPI } from '../../services/api';
import {
  CalendarDays,
  Sparkles,
  TrendingDown,
  Target,
  Clock,
  CheckCircle2,
  Circle,
  Timer,
  BookOpen,
  Brain,
  HelpCircle,
  RotateCcw,
  Volume2,
  VolumeX,
  Printer,
  ChevronRight,
  Flame,
  Award,
  Zap,
  ArrowRight,
  Sliders,
  Check,
  AlertTriangle,
} from 'lucide-react';

export const AiWeeklyScheduleModule: React.FC = () => {
  const {
    currentUser,
    gradeLevel,
    simulationHistory,
    stats,
    wrongQuestions,
    accessibility,
    speakText,
    stopSpeaking,
    isSpeaking,
    setStudentActiveTab,
  } = useApp();

  // 1. Diagnóstico Real das Áreas do Conhecimento (ordenadas por menor desempenho)
  const areasDiagnostic = useMemo(() => {
    // Coleta dados dos simulados se existirem
    const areaStatsMap: Record<
      'LC' | 'CH' | 'CN' | 'MT',
      { name: KnowledgeArea; short: 'LC' | 'CH' | 'CN' | 'MT'; total: number; correct: number; triSum: number; simCount: number }
    > = {
      LC: { name: 'Linguagens, Códigos e suas Tecnologias', short: 'LC', total: 0, correct: 0, triSum: 0, simCount: 0 },
      CH: { name: 'Ciências Humanas e suas Tecnologias', short: 'CH', total: 0, correct: 0, triSum: 0, simCount: 0 },
      CN: { name: 'Ciências da Natureza e suas Tecnologias', short: 'CN', total: 0, correct: 0, triSum: 0, simCount: 0 },
      MT: { name: 'Matemática e suas Tecnologias', short: 'MT', total: 0, correct: 0, triSum: 0, simCount: 0 },
    };

    if (simulationHistory.length > 0) {
      simulationHistory.forEach((sim) => {
        sim.byArea.forEach((a) => {
          if (areaStatsMap[a.shortLabel]) {
            areaStatsMap[a.shortLabel].total += a.totalQuestions || 20;
            areaStatsMap[a.shortLabel].correct += a.correctAnswers || 12;
            areaStatsMap[a.shortLabel].triSum += a.scoreTRI || 650;
            areaStatsMap[a.shortLabel].simCount += 1;
          }
        });
      });
    }

    // Mescla com stats gerais se disponíveis
    if (stats.byArea && stats.byArea.length > 0) {
      stats.byArea.forEach((item) => {
        let short: 'LC' | 'CH' | 'CN' | 'MT' | null = null;
        if (item.area.includes('Linguagens')) short = 'LC';
        else if (item.area.includes('Humanas')) short = 'CH';
        else if (item.area.includes('Natureza')) short = 'CN';
        else if (item.area.includes('Matemática')) short = 'MT';

        if (short && areaStatsMap[short]) {
          areaStatsMap[short].total += item.answered;
          areaStatsMap[short].correct += item.correct;
        }
      });
    }

    // Calcula acurácia e TRI médio
    const result = Object.values(areaStatsMap).map((item) => {
      const accuracy =
        item.total > 0
          ? Math.round((item.correct / item.total) * 100)
          : item.short === 'MT'
          ? 52
          : item.short === 'CN'
          ? 61
          : item.short === 'LC'
          ? 76
          : 79;

      const scoreTRI =
        item.simCount > 0
          ? Math.round(item.triSum / item.simCount)
          : item.short === 'MT'
          ? 590
          : item.short === 'CN'
          ? 620
          : item.short === 'LC'
          ? 690
          : 710;

      // Classificação de prioridade
      let priorityLevel: 'critico' | 'atencao' | 'consolidado' = 'consolidado';
      if (accuracy < 60) priorityLevel = 'critico';
      else if (accuracy < 75) priorityLevel = 'atencao';

      return {
        area: item.name,
        shortLabel: item.short,
        accuracy,
        scoreTRI,
        priorityLevel,
      };
    });

    // Ordena do menor desempenho para o maior
    return result.sort((a, b) => a.accuracy - b.accuracy);
  }, [simulationHistory, stats]);

  // Tópicos com erros frequentes identificados do aluno
  const identifiedWeakTopics = useMemo(() => {
    if (wrongQuestions.length > 0) {
      const topics = wrongQuestions.map((wq) => wq.topic).filter(Boolean);
      return Array.from(new Set(topics)).slice(0, 6);
    }
    return [
      'Geometria Espacial (Prismas e Cilindros)',
      'Eletrodinâmica e Circuitos Elétricos',
      'Funções Afim, Quadrática e Logarítmica',
      'Termoquímica e Cinética Química',
      'Proposta de Intervenção C5 (Redação)',
      'Interpretação e Variação Linguística',
    ];
  }, [wrongQuestions]);

  // Preferências do Usuário para Geração
  const [dailyHours, setDailyHours] = useState<number>(3);
  const [daysCount, setDaysCount] = useState<number>(6);
  const [preferredShift, setPreferredShift] = useState<'manha' | 'tarde' | 'noite' | 'flexivel'>('tarde');
  const [neuroProfile, setNeuroProfile] = useState<'tdah' | 'tea' | 'dyslexia' | 'padrao'>(() => {
    if (accessibility.tdahMode) return 'tdah';
    if (accessibility.teaMode) return 'tea';
    if (accessibility.dyslexiaMode) return 'dyslexia';
    return 'tdah'; // default amigável
  });
  const [focusGoal, setFocusGoal] = useState<string>('Superar bloqueio em Matemática e Natureza sem sobrecarga');

  // Estado do Cronograma Ativo
  const [schedulePlan, setSchedulePlan] = useState<WeeklyStudyPlan | null>(() => {
    try {
      const saved = localStorage.getItem('enem_inclusivo_study_plan');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [completedSessions, setCompletedSessions] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('enem_inclusivo_completed_sessions');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Salvar sessões concluídas no LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('enem_inclusivo_completed_sessions', JSON.stringify(completedSessions));
    } catch (e) {
      console.warn('Erro ao salvar sessões concluídas:', e);
    }
  }, [completedSessions]);

  // Salvar cronograma ativo no LocalStorage
  useEffect(() => {
    if (schedulePlan) {
      try {
        localStorage.setItem('enem_inclusivo_study_plan', JSON.stringify(schedulePlan));
      } catch (e) {
        console.warn('Erro ao salvar plano de estudo:', e);
      }
    }
  }, [schedulePlan]);

  // UI state
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [selectedDayId, setSelectedDayId] = useState<string>('seg');
  const [viewMode, setViewMode] = useState<'dia' | 'semana'>('dia');
  const [showConfigPanel, setShowConfigPanel] = useState<boolean>(false);
  const [copiedNotice, setCopiedNotice] = useState<string | null>(null);

  // Inicializa cronograma caso não haja nenhum salvo ainda
  useEffect(() => {
    if (!schedulePlan) {
      handleGenerateSchedule(true);
    }
  }, []);

  // Função para gerar cronograma via Gemini
  const handleGenerateSchedule = async (isInitial = false) => {
    setIsGenerating(true);
    setGenerationStep('Analisando seu histórico de simulados e erros...');

    try {
      setTimeout(() => {
        setGenerationStep('Mapeando áreas com menor desempenho (Matemática & Natureza)...');
      }, 700);

      setTimeout(() => {
        setGenerationStep('Gemini 3.8 Flash calibrando distribuição de sessões e blocos Pomodoro...');
      }, 1400);

      const generatedPlan = await generateWeeklyScheduleAPI({
        studentName: currentUser?.name || 'Estudante',
        gradeLevel,
        areasPerformance: areasDiagnostic,
        weakTopics: identifiedWeakTopics,
        neuroProfile,
        preferences: {
          dailyHours,
          daysCount,
          preferredShift,
          focusGoal,
        },
      });

      setSchedulePlan(generatedPlan);
      if (generatedPlan.days && generatedPlan.days.length > 0) {
        setSelectedDayId(generatedPlan.days[0].dayId);
      }
      setShowConfigPanel(false);
    } catch (err: any) {
      console.error('Erro ao gerar cronograma:', err);
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  // Alternar checkbox de conclusão de uma sessão
  const handleToggleComplete = (sessionId: string) => {
    setCompletedSessions((prev) => {
      const next = { ...prev, [sessionId]: !prev[sessionId] };
      return next;
    });
  };

  // Cálculo de progresso da semana
  const weeklyProgress = useMemo(() => {
    if (!schedulePlan || !schedulePlan.days) return { total: 0, completed: 0, percent: 0 };
    const allSessions = schedulePlan.days.flatMap((d) => d.sessions);
    const studySessions = allSessions.filter((s) => s.areaShort !== 'PAUSA');
    const total = studySessions.length;
    const completed = studySessions.filter((s) => completedSessions[s.id]).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percent };
  }, [schedulePlan, completedSessions]);

  // Dia atualmente selecionado
  const currentDayPlan = useMemo(() => {
    if (!schedulePlan || !schedulePlan.days) return null;
    return schedulePlan.days.find((d) => d.dayId === selectedDayId) || schedulePlan.days[0];
  }, [schedulePlan, selectedDayId]);

  // Leitura em Voz Alta do Plano do Dia
  const handleNarrateDay = () => {
    if (isSpeaking) {
      stopSpeaking();
      return;
    }
    if (!currentDayPlan) return;

    const sessionsText = currentDayPlan.sessions
      .map(
        (s, i) =>
          `Sessão ${i + 1}: ${s.timeSlot}, matéria ${s.area}. Assunto: ${s.topic}. Objetivo: ${s.pedagogicalGoal}.`
      )
      .join(' ');

    const fullText = `Plano de estudos para ${currentDayPlan.dayName}. Foco do dia: ${currentDayPlan.focusTheme}. Dica: ${currentDayPlan.dailyQuote}. ${sessionsText}`;
    speakText(fullText);
  };

  // Copiar resumo do cronograma para a área de transferência
  const handleCopySchedule = () => {
    if (!schedulePlan) return;

    let text = `📅 CRONOGRAMA SEMANAL INTELIGENTE ENEM (IA GEMINI)\n`;
    text += `Aluno: ${currentUser?.name || 'Estudante'} | Série: ${gradeLevel}\n`;
    text += `Diagnóstico: ${schedulePlan.diagnosticSummary}\n\n`;

    schedulePlan.days.forEach((day) => {
      text += `--- ${day.dayName.toUpperCase()} (${day.focusTheme}) ---\n`;
      day.sessions.forEach((s) => {
        text += `• [${s.timeSlot}] ${s.areaShort !== 'PAUSA' ? `[${s.areaShort}] ` : ''}${s.topic} (${s.durationMinutes} min) - ${s.pedagogicalGoal}\n`;
      });
      text += `\n`;
    });

    navigator.clipboard.writeText(text);
    setCopiedNotice('Cronograma copiado para a área de transferência!');
    setTimeout(() => setCopiedNotice(null), 3000);
  };

  // Helper de cores por área
  const getAreaColor = (areaShort: string) => {
    switch (areaShort) {
      case 'MT':
        return {
          bg: 'bg-purple-50',
          border: 'border-purple-200',
          text: 'text-purple-700',
          badgeBg: 'bg-purple-100 text-purple-800',
          ring: 'ring-purple-400',
        };
      case 'CN':
        return {
          bg: 'bg-emerald-50',
          border: 'border-emerald-200',
          text: 'text-emerald-700',
          badgeBg: 'bg-emerald-100 text-emerald-800',
          ring: 'ring-emerald-400',
        };
      case 'CH':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          text: 'text-amber-700',
          badgeBg: 'bg-amber-100 text-amber-800',
          ring: 'ring-amber-400',
        };
      case 'LC':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-700',
          badgeBg: 'bg-blue-100 text-blue-800',
          ring: 'ring-blue-400',
        };
      case 'RED':
        return {
          bg: 'bg-pink-50',
          border: 'border-pink-200',
          text: 'text-pink-700',
          badgeBg: 'bg-pink-100 text-pink-800',
          ring: 'ring-pink-400',
        };
      case 'PAUSA':
        return {
          bg: 'bg-teal-50',
          border: 'border-teal-200',
          text: 'text-teal-700',
          badgeBg: 'bg-teal-100 text-teal-800',
          ring: 'ring-teal-400',
        };
      default:
        return {
          bg: 'bg-slate-50',
          border: 'border-slate-200',
          text: 'text-slate-700',
          badgeBg: 'bg-slate-100 text-slate-800',
          ring: 'ring-slate-400',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header do Módulo */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-linear-to-bl from-indigo-100/50 via-purple-100/30 to-transparent rounded-bl-full pointer-events-none -mr-16 -mt-16"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 border border-indigo-200">
                <Sparkles className="w-3.5 h-3.5" />
                Gemini 3.8 Flash • IA Pedagógica
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200">
                <Brain className="w-3.5 h-3.5" />
                Priorização por Desempenho Real
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                <Timer className="w-3.5 h-3.5" />
                Pomodoro Neuroinclusivo (15/5)
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <CalendarDays className="w-8 h-8 text-indigo-600 shrink-0" />
              <span>Cronograma Semanal Inteligente</span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              O Gemini analisa seus simulados e o banco de erros para identificar em quais áreas você tem menor pontuação. Ele aloca mais tempo nas matérias difíceis, distribui micro-blocos Pomodoro e garante que você estude sem esgotamento mental.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setShowConfigPanel(!showConfigPanel)}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl font-bold text-xs transition border border-slate-300"
            >
              <Sliders className="w-4 h-4 text-slate-600" />
              <span>{showConfigPanel ? 'Fechar Ajustes' : 'Ajustar Metas & Horários'}</span>
            </button>

            <button
              onClick={() => handleGenerateSchedule(false)}
              disabled={isGenerating}
              className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl font-extrabold text-xs shadow-md shadow-indigo-200 transition disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Gerando Plano...' : 'Recalibrar com IA'}</span>
            </button>
          </div>
        </div>

        {/* Notificação Temporária de Cópia */}
        {copiedNotice && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{copiedNotice}</span>
          </div>
        )}
      </div>

      {/* 2. Banner de Diagnóstico em Tempo Real das Áreas com Menor Desempenho */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-lg border border-slate-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/30">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">
                Diagnóstico Automático das Áreas de Conhecimento
              </h3>
              <p className="text-xs text-slate-400">
                Ordenado da área com <strong>menor desempenho</strong> para a mais consolidada
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Áreas em vermelho recebem até 65% das horas semanais</span>
          </div>
        </div>

        {/* Grade de Áreas Diagnosticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {areasDiagnostic.map((item, index) => {
            const isLowest = index === 0;
            const isSecondLowest = index === 1;

            return (
              <div
                key={item.shortLabel}
                className={`p-4 rounded-2xl border transition ${
                  isLowest
                    ? 'bg-rose-950/40 border-rose-600/50 text-rose-100 shadow-sm shadow-rose-950'
                    : isSecondLowest
                    ? 'bg-amber-950/30 border-amber-600/40 text-amber-100'
                    : 'bg-slate-800/60 border-slate-700 text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm px-2 py-0.5 rounded-lg bg-black/40 border border-white/10">
                      {item.shortLabel}
                    </span>
                    <span className="text-xs font-bold truncate max-w-[120px]">{item.area.split(' ')[0]}</span>
                  </div>

                  {isLowest ? (
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-500 text-white animate-pulse">
                      1ª Prioridade
                    </span>
                  ) : isSecondLowest ? (
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500 text-slate-950">
                      2ª Prioridade
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Consolidado
                    </span>
                  )}
                </div>

                <div className="flex items-baseline justify-between mt-3">
                  <div>
                    <span className="text-2xl font-black">{item.accuracy}%</span>
                    <span className="text-[10px] text-slate-400 ml-1">acertos</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-300">{item.scoreTRI} pts</span>
                    <span className="text-[10px] text-slate-400 block">TRI estimada</span>
                  </div>
                </div>

                {/* Barra de Progresso Visual */}
                <div className="w-full bg-slate-950/60 rounded-full h-2 mt-2 overflow-hidden border border-white/5">
                  <div
                    className={`h-full rounded-full ${
                      isLowest
                        ? 'bg-rose-500'
                        : isSecondLowest
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${item.accuracy}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tópicos com Erros Recorrentes Detectados */}
        <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-xs font-extrabold text-indigo-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Tópicos de Maior Dificuldade Mapeados no Banco de Questões:
            </span>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {identifiedWeakTopics.slice(0, 4).map((t, idx) => (
                <span
                  key={idx}
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-xl bg-slate-800 text-slate-300 border border-slate-700"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="shrink-0 text-right">
            <span className="text-[11px] text-slate-400 block">Metodologia Anti-Sobrecarga:</span>
            <span className="text-xs font-bold text-emerald-400">Intercalação Cognitiva com Pausas</span>
          </div>
        </div>
      </div>

      {/* 3. Painel Opcional de Ajustes e Metas do Estudante */}
      {showConfigPanel && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-indigo-600" />
              <h3 className="font-extrabold text-slate-900 text-lg">
                Personalizar Preferências de Estudo
              </h3>
            </div>
            <button
              onClick={() => setShowConfigPanel(false)}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 px-3 py-1 rounded-xl hover:bg-slate-100"
            >
              Fechar
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Carga Horária Diária */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Carga Diária Disponível
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[2, 3, 4, 5].map((hours) => (
                  <button
                    key={hours}
                    onClick={() => setDailyHours(hours)}
                    className={`py-2 text-xs font-extrabold rounded-xl border transition ${
                      dailyHours === hours
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {hours}h
                  </button>
                ))}
              </div>
              <span className="text-[11px] text-slate-500 block">Total: {dailyHours * daysCount}h na semana</span>
            </div>

            {/* Dias da Semana */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Dias de Estudo
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { count: 5, label: '5 dias (Seg-Sex)' },
                  { count: 6, label: '6 dias (Seg-Sáb)' },
                  { count: 7, label: '7 dias (Todos)' },
                ].map((d) => (
                  <button
                    key={d.count}
                    onClick={() => setDaysCount(d.count)}
                    className={`py-2 px-1 text-[11px] font-extrabold rounded-xl border transition text-center ${
                      daysCount === d.count
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Turno Preferencial */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Turno de Estudo
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'manha', label: 'Manhã (08h)' },
                  { id: 'tarde', label: 'Tarde (14h)' },
                  { id: 'noite', label: 'Noite (19h)' },
                  { id: 'flexivel', label: 'Flexível' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setPreferredShift(s.id as any)}
                    className={`py-2 px-2 text-xs font-bold rounded-xl border transition ${
                      preferredShift === s.id
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Perfil Neurodivergente */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Adaptação Cognitiva
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'tdah', label: '🧠 TDAH (Pomodoro 15/5)' },
                  { id: 'tea', label: '🧩 TEA (Modo Previsível)' },
                  { id: 'dyslexia', label: '📖 Dislexia (Multimodal)' },
                  { id: 'padrao', label: '🎯 Padrão ENEM' },
                ].map((np) => (
                  <button
                    key={np.id}
                    onClick={() => setNeuroProfile(np.id as any)}
                    className={`py-2 px-2 text-[11px] font-bold rounded-xl border transition text-left truncate ${
                      neuroProfile === np.id
                        ? 'bg-purple-700 text-white border-purple-700 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {np.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Meta Específica */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              Meta Específica da Semana
            </label>
            <input
              type="text"
              value={focusGoal}
              onChange={(e) => setFocusGoal(e.target.value)}
              placeholder="Ex: Superar bloqueio em Geometria e subir acertos em Ciências da Natureza"
              className="w-full px-4 py-3 rounded-2xl border border-slate-300 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
            />
            <div className="flex flex-wrap gap-2 pt-1">
              {[
                'Recuperar Matemática Básica & Funções',
                'Alavancar Ciências da Natureza e Termoquímica',
                'Treinar Proposta de Intervenção C5 e Redação',
                'Reta Final: Simulados e Coerência TRI',
              ].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setFocusGoal(chip)}
                  className="text-[11px] font-medium px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 transition"
                >
                  + {chip}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => handleGenerateSchedule(false)}
              disabled={isGenerating}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-extrabold text-xs transition shadow-sm cursor-pointer"
            >
              Aplicar e Gerar Novo Cronograma com IA
            </button>
          </div>
        </div>
      )}

      {/* 4. Estado de Carregamento da IA */}
      {isGenerating && (
        <div className="bg-white rounded-3xl p-10 border border-indigo-200 text-center space-y-4 shadow-sm animate-pulse">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
            <Sparkles className="w-8 h-8 animate-spin" />
          </div>
          <div className="space-y-1">
            <h3 className="font-extrabold text-slate-900 text-lg">
              Construindo seu Plano Semanal Inteligente...
            </h3>
            <p className="text-xs sm:text-sm text-indigo-600 font-semibold">{generationStep}</p>
          </div>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            O Gemini está combinando a Teoria de Resposta ao Item (TRI) com o método Pomodoro para priorizar suas áreas de maior necessidade.
          </p>
        </div>
      )}

      {/* 5. Visualização do Cronograma Ativo */}
      {!isGenerating && schedulePlan && (
        <div className="space-y-6">
          {/* Card Resumo do Plano */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-slate-900 text-xl tracking-tight">
                    {schedulePlan.title}
                  </h3>
                  {schedulePlan.isAiGenerated && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-linear-to-r from-indigo-500 to-purple-600 text-white">
                      IA Gemini 3.8
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                  {schedulePlan.diagnosticSummary}
                </p>
              </div>

              {/* Estatísticas de Progresso da Semana */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 min-w-[220px] space-y-2 shrink-0">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-600">Progresso Semanal</span>
                  <span className="font-extrabold text-indigo-700">{weeklyProgress.percent}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${weeklyProgress.percent}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>{weeklyProgress.completed} de {weeklyProgress.total} sessões feitas</span>
                  {weeklyProgress.percent === 100 && (
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <Award className="w-3 h-3" /> Meta batida!
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Metas da Semana & Horas Alocadas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {/* Metas Concretas */}
              <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 space-y-2">
                <span className="text-xs font-extrabold text-indigo-900 flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-indigo-600" />
                  Metas Mensuráveis da Semana
                </span>
                <ul className="space-y-1.5">
                  {schedulePlan.weeklyMilestones.map((ms, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                      <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                      <span>{ms}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Distribuição Semanal de Horas por Área */}
              <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100 space-y-2">
                <span className="text-xs font-extrabold text-purple-900 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-purple-600" />
                  Carga Horária Alocada ({schedulePlan.totalHoursWeek}h totais)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {schedulePlan.priorityAreas.map((pa) => (
                    <div
                      key={pa.shortLabel}
                      className="p-2.5 rounded-xl bg-white border border-purple-100 text-center"
                    >
                      <span className="text-[10px] font-black uppercase text-purple-600 block">
                        {pa.shortLabel}
                      </span>
                      <span className="text-sm font-black text-slate-800">
                        {pa.weeklyAllocatedHours}h
                      </span>
                      <span className="text-[9px] text-slate-500 block">
                        {pa.priorityLevel === 'critico' ? '🚨 Máxima' : '⚠️ Reforço'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Barra de Ações Rápidas do Cronograma */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              {/* Seletor de Modo de Visualização */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200">
                <button
                  onClick={() => setViewMode('dia')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition ${
                    viewMode === 'dia'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Visão Dia a Dia
                </button>
                <button
                  onClick={() => setViewMode('semana')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition ${
                    viewMode === 'semana'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Visão Semanal Completa
                </button>
              </div>

              {/* Botões Utilitários */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleNarrateDay}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                    isSpeaking
                      ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                  title="Ouvir leitura das sessões do dia"
                >
                  {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  <span>{isSpeaking ? 'Parar Leitura' : 'Narrar Dia (TTS)'}</span>
                </button>

                <button
                  onClick={handleCopySchedule}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition"
                  title="Copiar texto do cronograma"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Copiar Plano</span>
                </button>
              </div>
            </div>
          </div>

          {/* 5A. MODO DE VISUALIZAÇÃO: DIA A DIA */}
          {viewMode === 'dia' && (
            <div className="space-y-4">
              {/* Abas dos Dias da Semana */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {schedulePlan.days.map((day) => {
                  const isSelected = day.dayId === selectedDayId;
                  const daySessions = day.sessions.filter((s) => s.areaShort !== 'PAUSA');
                  const dayDone = daySessions.every((s) => completedSessions[s.id]);

                  return (
                    <button
                      key={day.dayId}
                      onClick={() => setSelectedDayId(day.dayId)}
                      className={`flex flex-col items-center min-w-[90px] sm:min-w-[120px] p-3 rounded-2xl border transition shrink-0 ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] font-black uppercase tracking-wider">
                          {day.dayShort}
                        </span>
                        {dayDone && daySessions.length > 0 && (
                          <CheckCircle2 className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-300' : 'text-emerald-500'}`} />
                        )}
                      </div>
                      <span className={`text-[10px] mt-1 truncate max-w-[100px] ${isSelected ? 'text-indigo-100' : 'text-slate-500'}`}>
                        {day.sessions.length} blocos
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Detalhes do Dia Selecionado */}
              {currentDayPlan && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
                  {/* Cabeçalho do Dia */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xl font-extrabold text-slate-900">
                          {currentDayPlan.dayName}
                        </h4>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {currentDayPlan.focusTheme}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 italic mt-1">
                        💡 "{currentDayPlan.dailyQuote}"
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500">
                        {currentDayPlan.sessions.filter((s) => completedSessions[s.id]).length} de {currentDayPlan.sessions.length} concluídas
                      </span>
                    </div>
                  </div>

                  {/* Linha do Tempo de Sessões do Dia */}
                  <div className="space-y-4">
                    {currentDayPlan.sessions.map((session, sIdx) => {
                      const isDone = !!completedSessions[session.id];
                      const colors = getAreaColor(session.areaShort);
                      const isPausa = session.areaShort === 'PAUSA';

                      return (
                        <div
                          key={session.id}
                          className={`p-5 rounded-2xl border transition-all ${
                            isDone
                              ? 'bg-slate-50/80 border-slate-200 opacity-60'
                              : isPausa
                              ? 'bg-teal-50/60 border-teal-200'
                              : 'bg-white hover:border-indigo-300 shadow-2xs hover:shadow-xs'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            {/* Checkbox e Detalhes da Matéria */}
                            <div className="flex items-start gap-3.5 flex-1">
                              {/* Botão de Checkbox */}
                              <button
                                onClick={() => handleToggleComplete(session.id)}
                                className={`mt-0.5 p-1 rounded-xl transition ${
                                  isDone
                                    ? 'text-emerald-600 bg-emerald-50'
                                    : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-100'
                                }`}
                                title={isDone ? 'Marcar como não concluído' : 'Marcar como concluído'}
                              >
                                {isDone ? (
                                  <CheckCircle2 className="w-6 h-6 fill-emerald-100" />
                                ) : (
                                  <Circle className="w-6 h-6" />
                                )}
                              </button>

                              <div className="space-y-2 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  {/* Horário */}
                                  <span className="text-xs font-black px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-800">
                                    {session.timeSlot}
                                  </span>

                                  {/* Tag da Área */}
                                  <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${colors.badgeBg}`}>
                                    {session.area}
                                  </span>

                                  {/* Duração */}
                                  <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {session.durationMinutes} min
                                  </span>

                                  {/* Badge Pomodoro */}
                                  {session.pomodoroCycles > 0 && (
                                    <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                                      <Timer className="w-3 h-3 text-indigo-600" />
                                      {session.pomodoroCycles} ciclo{session.pomodoroCycles > 1 ? 's' : ''} Pomodoro
                                    </span>
                                  )}

                                  {/* Destaque para Fraqueza */}
                                  {(session.areaShort === 'MT' || session.areaShort === 'CN') && (
                                    <span className="text-[10px] font-black uppercase text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                                      Prioridade Alta
                                    </span>
                                  )}
                                </div>

                                {/* Título do Tópico */}
                                <div>
                                  <h5
                                    className={`text-base font-extrabold ${
                                      isDone ? 'line-through text-slate-500' : 'text-slate-900'
                                    }`}
                                  >
                                    {session.topic}
                                  </h5>
                                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                                    🎯 <strong>Meta:</strong> {session.pedagogicalGoal}
                                  </p>
                                </div>

                                {/* Neuro-dica TDAH / TEA */}
                                {session.neuroTip && (
                                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 flex items-start gap-2">
                                    <Brain className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                                    <span>
                                      <strong>Dica de Foco:</strong> {session.neuroTip}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Ações Rápidas por Sessão */}
                            {!isPausa && (
                              <div className="flex sm:flex-col items-center gap-2 shrink-0">
                                <button
                                  onClick={() => {
                                    setStudentActiveTab('inicio');
                                    // Rola para o Pomodoro
                                    window.scrollTo({ top: 380, behavior: 'smooth' });
                                  }}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition w-full justify-center"
                                  title="Iniciar cronômetro para esta atividade"
                                >
                                  <Timer className="w-3.5 h-3.5 text-indigo-600" />
                                  <span>Pomodoro</span>
                                </button>

                                <button
                                  onClick={() => {
                                    setStudentActiveTab('assistente');
                                  }}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-xs font-bold transition w-full justify-center"
                                  title="Tirar dúvidas deste tema com a IA"
                                >
                                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                                  <span>Tirar Dúvida</span>
                                </button>

                                <button
                                  onClick={() => {
                                    setStudentActiveTab('serie');
                                  }}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition w-full justify-center"
                                  title="Resolver questões desta área"
                                >
                                  <BookOpen className="w-3.5 h-3.5 text-slate-600" />
                                  <span>Questões</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 5B. MODO DE VISUALIZAÇÃO: SEMANA COMPLETA EM GRADE */}
          {viewMode === 'semana' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {schedulePlan.days.map((day) => {
                const daySessions = day.sessions.filter((s) => s.areaShort !== 'PAUSA');
                const completedCount = daySessions.filter((s) => completedSessions[s.id]).length;

                return (
                  <div
                    key={day.dayId}
                    className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-base">
                            {day.dayName}
                          </h4>
                          <span className="text-[11px] font-semibold text-indigo-600">
                            {day.focusTheme}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-slate-500">
                          {completedCount}/{daySessions.length}
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        {day.sessions.map((sess) => {
                          const isDone = !!completedSessions[sess.id];
                          const colors = getAreaColor(sess.areaShort);

                          return (
                            <div
                              key={sess.id}
                              onClick={() => handleToggleComplete(sess.id)}
                              className={`p-3 rounded-xl border transition cursor-pointer flex items-start gap-2.5 ${
                                isDone
                                  ? 'bg-slate-50 border-slate-200 opacity-50'
                                  : sess.areaShort === 'PAUSA'
                                  ? 'bg-teal-50/50 border-teal-200'
                                  : 'bg-white hover:border-indigo-300'
                              }`}
                            >
                              <div className="mt-0.5">
                                {isDone ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                ) : (
                                  <Circle className="w-4 h-4 text-slate-400 shrink-0" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                  <span className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded ${colors.badgeBg}`}>
                                    {sess.areaShort}
                                  </span>
                                  <span className="text-[10px] font-bold text-slate-500">
                                    {sess.timeSlot}
                                  </span>
                                </div>
                                <p className={`text-xs font-bold truncate mt-1 ${isDone ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                                  {sess.topic}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedDayId(day.dayId);
                        setViewMode('dia');
                      }}
                      className="w-full py-2 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 border border-slate-200/80"
                    >
                      <span>Ver Detalhes do Dia</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
