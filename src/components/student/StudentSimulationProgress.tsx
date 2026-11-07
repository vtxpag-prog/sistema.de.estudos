import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { SimulationAttempt, KnowledgeArea } from '../../types';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  Award,
  Target,
  Clock,
  BookOpen,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  BarChart3,
  Radar as RadarIcon,
  PlusCircle,
  Volume2,
  VolumeX,
  Share2,
  RotateCcw,
  Info,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  Filter,
} from 'lucide-react';

type ChartMode = 'line' | 'area' | 'bar' | 'radar';
type MetricType = 'scoreTRI' | 'percentage';

interface AreaConfig {
  key: string;
  name: KnowledgeArea;
  shortLabel: 'LC' | 'CH' | 'CN' | 'MT';
  color: string;
  gradientId: string;
  bgLight: string;
  borderColor: string;
  textColor: string;
  icon: string;
}

const AREA_CONFIGS: AreaConfig[] = [
  {
    key: 'LC',
    name: 'Linguagens, Códigos e suas Tecnologias',
    shortLabel: 'LC',
    color: '#3b82f6', // blue-500
    gradientId: 'gradLC',
    bgLight: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700',
    icon: '📘',
  },
  {
    key: 'CH',
    name: 'Ciências Humanas e suas Tecnologias',
    shortLabel: 'CH',
    color: '#f59e0b', // amber-500
    gradientId: 'gradCH',
    bgLight: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-700',
    icon: '📙',
  },
  {
    key: 'CN',
    name: 'Ciências da Natureza e suas Tecnologias',
    shortLabel: 'CN',
    color: '#10b981', // emerald-500
    gradientId: 'gradCN',
    bgLight: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-700',
    icon: '📗',
  },
  {
    key: 'MT',
    name: 'Matemática e suas Tecnologias',
    shortLabel: 'MT',
    color: '#8b5cf6', // purple-500
    gradientId: 'gradMT',
    bgLight: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-700',
    icon: '📐',
  },
];

export const StudentSimulationProgress: React.FC = () => {
  const {
    simulationHistory,
    addSimulationAttempt,
    resetSimulationHistory,
    accessibility,
    speakText,
    stopSpeaking,
    isSpeaking,
    gradeLevel,
    setStudentActiveTab,
  } = useApp();

  // Controls & Filters State
  const [chartMode, setChartMode] = useState<ChartMode>('line');
  const [metric, setMetric] = useState<MetricType>('scoreTRI');
  const [selectedAreaFilter, setSelectedAreaFilter] = useState<'all' | 'LC' | 'CH' | 'CN' | 'MT'>('all');
  const [includeEssay, setIncludeEssay] = useState<boolean>(true);
  const [timeRangeFilter, setTimeRangeFilter] = useState<'all' | 'last4' | 'last3'>('all');
  const [expandedSimId, setExpandedSimId] = useState<string | null>(null);
  const [isNewSimModalOpen, setIsNewSimModalOpen] = useState<boolean>(false);
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  // Form state for creating a new simulation attempt
  const [newSimTitle, setNewSimTitle] = useState('Simulado Diagnóstico Especial');
  const [newSimLCScore, setNewSimLCScore] = useState(740);
  const [newSimCHScore, setNewSimCHScore] = useState(780);
  const [newSimCNScore, setNewSimCNScore] = useState(710);
  const [newSimMTScore, setNewSimMTScore] = useState(820);
  const [newSimEssayScore, setNewSimEssayScore] = useState(900);
  const [newSimDuration, setNewSimDuration] = useState(210);

  // Filtered chronologically (oldest to newest for charts)
  const chronologicalHistory = useMemo(() => {
    const sorted = [...simulationHistory].sort((a, b) => a.timestamp - b.timestamp);
    if (timeRangeFilter === 'last3') {
      return sorted.slice(-3);
    }
    if (timeRangeFilter === 'last4') {
      return sorted.slice(-4);
    }
    return sorted;
  }, [simulationHistory, timeRangeFilter]);

  // Reverse list (newest to oldest for table view)
  const newestFirstHistory = useMemo(() => {
    return [...simulationHistory].sort((a, b) => b.timestamp - a.timestamp);
  }, [simulationHistory]);

  const latestSim = chronologicalHistory[chronologicalHistory.length - 1];
  const firstSim = chronologicalHistory[0];

  // Prepare chart dataset
  const chartData = useMemo(() => {
    return chronologicalHistory.map((sim, index) => {
      const lc = sim.byArea.find((a) => a.shortLabel === 'LC');
      const ch = sim.byArea.find((a) => a.shortLabel === 'CH');
      const cn = sim.byArea.find((a) => a.shortLabel === 'CN');
      const mt = sim.byArea.find((a) => a.shortLabel === 'MT');

      return {
        id: sim.id,
        name: sim.displayDate || `Sim #${index + 1}`,
        fullTitle: sim.title,
        date: sim.date,
        overallScoreTRI: sim.overallScoreTRI,
        essayScore: sim.essayScore || 0,
        // Area scores TRI
        scoreLC: lc?.scoreTRI || 0,
        scoreCH: ch?.scoreTRI || 0,
        scoreCN: cn?.scoreTRI || 0,
        scoreMT: mt?.scoreTRI || 0,
        // Area percentages
        percentLC: lc?.percentage || 0,
        percentCH: ch?.percentage || 0,
        percentCN: cn?.percentage || 0,
        percentMT: mt?.percentage || 0,
        // Totals
        totalCorrect: sim.totalCorrect,
        totalQuestions: sim.totalQuestions,
        overallPercent: Math.round((sim.totalCorrect / (sim.totalQuestions || 1)) * 100),
      };
    });
  }, [chronologicalHistory]);

  // Prepare Radar Chart dataset (comparing first vs latest simulation)
  const radarData = useMemo(() => {
    if (!firstSim || !latestSim) return [];

    const baseAreas: {
      subject: string;
      fullArea: string;
      primeiroSimulado: number;
      ultimoSimulado: number;
      fullMark: number;
    }[] = AREA_CONFIGS.map((cfg) => {
      const firstArea = firstSim.byArea.find((a) => a.shortLabel === cfg.shortLabel);
      const latestArea = latestSim.byArea.find((a) => a.shortLabel === cfg.shortLabel);

      return {
        subject: `${cfg.icon} ${cfg.shortLabel}`,
        fullArea: cfg.name,
        primeiroSimulado: metric === 'scoreTRI' ? (firstArea?.scoreTRI || 0) : (firstArea?.percentage || 0),
        ultimoSimulado: metric === 'scoreTRI' ? (latestArea?.scoreTRI || 0) : (latestArea?.percentage || 0),
        fullMark: metric === 'scoreTRI' ? 1000 : 100,
      };
    });

    if (includeEssay) {
      baseAreas.push({
        subject: '✍️ Redação',
        fullArea: 'Redação Oficial ENEM',
        primeiroSimulado:
          metric === 'scoreTRI'
            ? (firstSim.essayScore || 0)
            : Math.round(((firstSim.essayScore || 0) / 1000) * 100),
        ultimoSimulado:
          metric === 'scoreTRI'
            ? (latestSim.essayScore || 0)
            : Math.round(((latestSim.essayScore || 0) / 1000) * 100),
        fullMark: metric === 'scoreTRI' ? 1000 : 100,
      });
    }

    return baseAreas;
  }, [firstSim, latestSim, metric, includeEssay]);

  // Area Evolution metrics (Delta between first and latest)
  const areaPerformanceSummary = useMemo(() => {
    if (!firstSim || !latestSim) return [];

    return AREA_CONFIGS.map((cfg) => {
      const initialArea = firstSim.byArea.find((a) => a.shortLabel === cfg.shortLabel);
      const currentArea = latestSim.byArea.find((a) => a.shortLabel === cfg.shortLabel);

      const initScore = initialArea?.scoreTRI || 0;
      const currScore = currentArea?.scoreTRI || 0;
      const deltaScore = currScore - initScore;

      const initPct = initialArea?.percentage || 0;
      const currPct = currentArea?.percentage || 0;
      const deltaPct = currPct - initPct;

      return {
        ...cfg,
        initialScore: initScore,
        currentScore: currScore,
        deltaScore,
        initialPct: initPct,
        currentPct: currPct,
        deltaPct,
        currentCorrect: currentArea?.correctAnswers || 0,
        currentTotal: currentArea?.totalQuestions || 0,
      };
    });
  }, [firstSim, latestSim]);

  // Overall statistics
  const overallStats = useMemo(() => {
    if (!chronologicalHistory.length) {
      return {
        totalSims: 0,
        currentTRI: 0,
        initialTRI: 0,
        deltaTRI: 0,
        averageAccuracy: 0,
        totalHours: 0,
        latestEssay: 0,
      };
    }

    const currentTRI = latestSim?.overallScoreTRI || 0;
    const initialTRI = firstSim?.overallScoreTRI || 0;
    const deltaTRI = currentTRI - initialTRI;

    const totalQuestions = chronologicalHistory.reduce((sum, s) => sum + s.totalQuestions, 0);
    const totalCorrect = chronologicalHistory.reduce((sum, s) => sum + s.totalCorrect, 0);
    const averageAccuracy = Math.round((totalCorrect / (totalQuestions || 1)) * 100);

    const totalMinutes = chronologicalHistory.reduce((sum, s) => sum + s.durationMinutes, 0);
    const totalHours = (totalMinutes / 60).toFixed(1);

    const latestEssay = latestSim?.essayScore || 0;

    return {
      totalSims: chronologicalHistory.length,
      currentTRI,
      initialTRI,
      deltaTRI,
      averageAccuracy,
      totalHours,
      latestEssay,
    };
  }, [chronologicalHistory, latestSim, firstSim]);

  // Area with highest growth
  const topGrowingArea = useMemo(() => {
    if (!areaPerformanceSummary.length) return null;
    return [...areaPerformanceSummary].sort((a, b) => b.deltaScore - a.deltaScore)[0];
  }, [areaPerformanceSummary]);

  // Priority area (lowest current score)
  const priorityArea = useMemo(() => {
    if (!areaPerformanceSummary.length) return null;
    return [...areaPerformanceSummary].sort((a, b) => a.currentScore - b.currentScore)[0];
  }, [areaPerformanceSummary]);

  // Handle Add New Simulation
  const handleCreateSimulation = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const displayDate = `${months[now.getMonth()]}/${now.getFullYear()}`;

    const totalQuestions = 90;
    const lcCorrect = Math.round((newSimLCScore / 1000) * 25);
    const chCorrect = Math.round((newSimCHScore / 1000) * 25);
    const cnCorrect = Math.round((newSimCNScore / 1000) * 20);
    const mtCorrect = Math.round((newSimMTScore / 1000) * 20);
    const totalCorrect = lcCorrect + chCorrect + cnCorrect + mtCorrect;

    const overallScoreTRI = Math.round(
      (newSimLCScore + newSimCHScore + newSimCNScore + newSimMTScore + newSimEssayScore) / 5
    );

    const newAttempt: SimulationAttempt = {
      id: `sim-${Date.now()}`,
      title: newSimTitle,
      date: dateStr,
      displayDate,
      timestamp: now.getTime(),
      totalQuestions,
      totalCorrect,
      overallScoreTRI,
      durationMinutes: newSimDuration,
      status: 'Concluído',
      essayScore: newSimEssayScore,
      targetGoalTRI: 780,
      notes: 'Simulado registrado para monitoramento do avanço curricular e preparação ENEM.',
      byArea: [
        {
          area: 'Linguagens, Códigos e suas Tecnologias',
          shortLabel: 'LC',
          totalQuestions: 25,
          correctAnswers: lcCorrect,
          percentage: Math.round((lcCorrect / 25) * 100),
          scoreTRI: newSimLCScore,
        },
        {
          area: 'Ciências Humanas e suas Tecnologias',
          shortLabel: 'CH',
          totalQuestions: 25,
          correctAnswers: chCorrect,
          percentage: Math.round((chCorrect / 25) * 100),
          scoreTRI: newSimCHScore,
        },
        {
          area: 'Ciências da Natureza e suas Tecnologias',
          shortLabel: 'CN',
          totalQuestions: 20,
          correctAnswers: cnCorrect,
          percentage: Math.round((cnCorrect / 20) * 100),
          scoreTRI: newSimCNScore,
        },
        {
          area: 'Matemática e suas Tecnologias',
          shortLabel: 'MT',
          totalQuestions: 20,
          correctAnswers: mtCorrect,
          percentage: Math.round((mtCorrect / 20) * 100),
          scoreTRI: newSimMTScore,
        },
      ],
    };

    addSimulationAttempt(newAttempt);
    setIsNewSimModalOpen(false);
    setCopiedNotification('Novo simulado adicionado com sucesso! Os gráficos foram atualizados.');
    setTimeout(() => setCopiedNotification(null), 4000);
  };

  // Quick voice narration of diagnostic
  const handleNarrateSummary = () => {
    if (isSpeaking) {
      stopSpeaking();
      return;
    }

    const textToSpeak = `Relatório de Progresso Acumulado nos Simulados do ENEM. Você realizou ${overallStats.totalSims} simulados. Sua nota média estimada na TRI atual é de ${overallStats.currentTRI} pontos, representando um ganho de ${overallStats.deltaTRI} pontos desde o início. Sua área de maior evolução foi ${topGrowingArea?.name}, com crescimento de ${topGrowingArea?.deltaScore} pontos. Sua nota mais recente de redação foi de ${overallStats.latestEssay} pontos. Parabéns pela dedicação aos estudos!`;
    speakText(textToSpeak);
  };

  // Copy report to clipboard
  const handleCopyReport = () => {
    const summaryText = `📊 RELATÓRIO DE PROGRESSO EM SIMULADOS DO ENEM
Série: ${gradeLevel} do Ensino Médio
Total de Simulados Realizados: ${overallStats.totalSims}
Nota TRI Atual: ${overallStats.currentTRI} pts (Evolução: +${overallStats.deltaTRI} pts)
Taxa Global de Acertos: ${overallStats.averageAccuracy}%
Horas de Simulado: ${overallStats.totalHours} horas
Última Redação: ${overallStats.latestEssay} pts

DESEMPENHO POR ÁREA DO CONHECIMENTO (Evolução TRI):
${areaPerformanceSummary
  .map(
    (a) =>
      `• ${a.shortLabel} (${a.name}): ${a.initialScore} pts ➔ ${a.currentScore} pts (+${a.deltaScore} pts) | Acertos: ${a.currentPct}%`
  )
  .join('\n')}

Destaque: Área de maior salto foi ${topGrowingArea?.name} (+${topGrowingArea?.deltaScore} pts).
Ponto de atenção: ${priorityArea?.name} (${priorityArea?.currentScore} pts).`;

    navigator.clipboard.writeText(summaryText);
    setCopiedNotification('Relatório copiado para a área de transferência!');
    setTimeout(() => setCopiedNotification(null), 3000);
  };

  // Custom Recharts Tooltip
  const CustomChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl border border-slate-700 max-w-xs text-xs space-y-2">
          <div className="border-b border-slate-800 pb-2">
            <span className="font-extrabold text-sm text-indigo-300 block">{dataPoint.fullTitle}</span>
            <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
              <Calendar className="w-3 h-3" /> {dataPoint.date} ({label})
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-300 py-1 border-b border-slate-800">
            <span className="font-semibold">Média TRI Geral:</span>
            <span className="font-bold text-amber-400 text-sm">{dataPoint.overallScoreTRI} pts</span>
          </div>

          <div className="space-y-1.5 pt-1">
            {AREA_CONFIGS.map((cfg) => {
              if (selectedAreaFilter !== 'all' && selectedAreaFilter !== cfg.shortLabel) {
                return null;
              }
              const scoreVal = dataPoint[`score${cfg.shortLabel}`];
              const pctVal = dataPoint[`percent${cfg.shortLabel}`];
              return (
                <div key={cfg.shortLabel} className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-medium text-slate-300">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cfg.color }}></span>
                    {cfg.shortLabel}:
                  </span>
                  <span className="font-bold text-white">
                    {metric === 'scoreTRI' ? `${scoreVal} pts` : `${pctVal}%`}
                    <span className="text-[10px] text-slate-400 font-normal ml-1">
                      ({metric === 'scoreTRI' ? `${pctVal}% acertos` : `${scoreVal} TRI`})
                    </span>
                  </span>
                </div>
              );
            })}

            {includeEssay && (
              <div className="flex items-center justify-between text-pink-300 pt-1 border-t border-slate-800">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span>
                  Redação:
                </span>
                <span className="font-bold">{dataPoint.essayScore} pts</span>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex justify-between">
            <span>Acertos totais: {dataPoint.totalCorrect}/{dataPoint.totalQuestions}</span>
            <span>{dataPoint.overallPercent}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Toast notification */}
      {copiedNotification && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce text-xs font-bold">
          <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          <span>{copiedNotification}</span>
        </div>
      )}

      {/* TOP HERO BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute left-1/3 bottom-0 w-60 h-60 bg-purple-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
              <span>Painel de Desempenho e Evolução • {gradeLevel}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Progresso Acumulado nos Simulados ENEM
            </h2>
            <p className="text-xs sm:text-sm text-indigo-200 leading-relaxed">
              Acompanhe a curva de evolução da sua pontuação TRI oficial e taxa de acertos em cada área do conhecimento ao longo do ano letivo. Identifique seus pontos fortes e onde focar sua revisão.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => setIsNewSimModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-md transition active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Registrar Novo Simulado</span>
              </button>

              <button
                onClick={() => setStudentActiveTab('redacao')}
                className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-2 shadow-md transition active:scale-95"
                title="Ver evolução nas 5 Competências do ENEM com gráficos Recharts"
              >
                <Award className="w-4 h-4 text-slate-950" />
                <span>Evolução nas 5 Competências</span>
              </button>

              <button
                onClick={handleCopyReport}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 border border-white/20 transition active:scale-95"
              >
                <Share2 className="w-4 h-4" />
                <span>Exportar Relatório</span>
              </button>

              <button
                onClick={handleNarrateSummary}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 border transition ${
                  isSpeaking
                    ? 'bg-amber-500/30 text-amber-300 border-amber-400/50'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                }`}
                title="Ouvir diagnóstico com leitor de tela"
              >
                {isSpeaking ? <VolumeX className="w-4 h-4 text-amber-400" /> : <Volume2 className="w-4 h-4" />}
                <span>{isSpeaking ? 'Pausar Áudio' : 'Ouvir Síntese'}</span>
              </button>
            </div>
          </div>

          {/* Quick Score Highlight Card */}
          <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/15 flex flex-col justify-between min-w-[240px] space-y-3">
            <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              Última Nota Geral TRI
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-amber-400 tracking-tight">
                {overallStats.currentTRI}
              </span>
              <span className="text-xs font-bold text-slate-300">/ 1000 pts</span>
            </div>

            <div className="flex items-center gap-2 pt-1 border-t border-white/10 text-xs">
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold text-[11px] flex items-center gap-0.5">
                <ArrowUpRight className="w-3.5 h-3.5" />
                +{overallStats.deltaTRI} pts
              </span>
              <span className="text-[11px] text-slate-300">
                desde o Simulado Diagnóstico
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* METRIC KPI SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Simulados */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 block leading-tight">
              {overallStats.totalSims}
            </span>
            <span className="text-xs font-semibold text-slate-500">Simulados Realizados</span>
          </div>
        </div>

        {/* Taxa de Acertos */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-slate-900 block leading-tight">
                {overallStats.averageAccuracy}%
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                +32%
              </span>
            </div>
            <span className="text-xs font-semibold text-slate-500">Aproveitamento Médio</span>
          </div>
        </div>

        {/* Tempo Acumulado */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 block leading-tight">
              {overallStats.totalHours}h
            </span>
            <span className="text-xs font-semibold text-slate-500">Horas de Treino Real</span>
          </div>
        </div>

        {/* Última Redação */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-purple-950 block leading-tight">
              {overallStats.latestEssay}
            </span>
            <span className="text-xs font-semibold text-purple-700">Redação Mais Recente</span>
          </div>
        </div>
      </div>

      {/* CONTROLS AND CHART TOOLBAR */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Chart Type Selector */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
            <button
              onClick={() => setChartMode('line')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition ${
                chartMode === 'line'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Linhas (Evolução)</span>
            </button>

            <button
              onClick={() => setChartMode('area')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition ${
                chartMode === 'area'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Área Acumulada</span>
            </button>

            <button
              onClick={() => setChartMode('bar')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition ${
                chartMode === 'bar'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Barras Comparativas</span>
            </button>

            <button
              onClick={() => setChartMode('radar')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition ${
                chartMode === 'radar'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <RadarIcon className="w-3.5 h-3.5" />
              <span>Radar (Teia ENEM)</span>
            </button>
          </div>

          {/* Metric and Range Selectors */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Metric Switch */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-700">
              <button
                onClick={() => setMetric('scoreTRI')}
                className={`px-3 py-1 rounded-lg transition ${
                  metric === 'scoreTRI'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Nota TRI (0-1000)
              </button>
              <button
                onClick={() => setMetric('percentage')}
                className={`px-3 py-1 rounded-lg transition ${
                  metric === 'percentage'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Taxa de Acertos (%)
              </button>
            </div>

            {/* Time range */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-700">
              <button
                onClick={() => setTimeRangeFilter('all')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  timeRangeFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Todos ({chronologicalHistory.length})
              </button>
              <button
                onClick={() => setTimeRangeFilter('last4')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  timeRangeFilter === 'last4'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Últimos 4
              </button>
              <button
                onClick={() => setTimeRangeFilter('last3')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  timeRangeFilter === 'last3'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Últimos 3
              </button>
            </div>
          </div>
        </div>

        {/* Area Filter Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-500 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filtrar Área:
            </span>

            <button
              onClick={() => setSelectedAreaFilter('all')}
              className={`px-3 py-1 rounded-xl font-bold transition ${
                selectedAreaFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todas as 4 Áreas
            </button>

            {AREA_CONFIGS.map((cfg) => (
              <button
                key={cfg.shortLabel}
                onClick={() => setSelectedAreaFilter(cfg.shortLabel)}
                className={`px-3 py-1 rounded-xl font-bold flex items-center gap-1.5 transition ${
                  selectedAreaFilter === cfg.shortLabel
                    ? 'text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                style={{
                  backgroundColor: selectedAreaFilter === cfg.shortLabel ? cfg.color : undefined,
                }}
              >
                <span>{cfg.icon}</span>
                <span>{cfg.shortLabel}</span>
              </button>
            ))}
          </div>

          {/* Toggle Redação */}
          <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 select-none">
            <input
              type="checkbox"
              checked={includeEssay}
              onChange={(e) => setIncludeEssay(e.target.checked)}
              className="w-4 h-4 rounded text-pink-600 focus:ring-pink-500"
            />
            <span className="text-pink-700">✍️ Exibir Redação</span>
          </label>
        </div>

        {/* MAIN CHART CONTAINER */}
        <div className="pt-2">
          {/* 1. LINE CHART */}
          {chartMode === 'line' && (
            <div className="h-80 sm:h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 20, right: 25, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="name"
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: '#cbd5e1' }}
                  />
                  <YAxis
                    domain={metric === 'scoreTRI' ? [400, 1000] : [0, 100]}
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickFormatter={(val) => (metric === 'scoreTRI' ? `${val}p` : `${val}%`)}
                  />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Legend
                    verticalAlign="top"
                    height={36}
                    wrapperStyle={{ fontSize: '12px', fontWeight: 600 }}
                  />

                  {/* Reference line for 700 pts in TRI */}
                  {metric === 'scoreTRI' && (
                    <ReferenceLine
                      y={700}
                      stroke="#94a3b8"
                      strokeDasharray="4 4"
                      label={{
                        value: 'Corte Geral Federal (700 pts)',
                        fill: '#64748b',
                        fontSize: 10,
                        position: 'top',
                      }}
                    />
                  )}

                  {/* Lines for each area */}
                  {(selectedAreaFilter === 'all' || selectedAreaFilter === 'LC') && (
                    <Line
                      type="monotone"
                      dataKey={metric === 'scoreTRI' ? 'scoreLC' : 'percentLC'}
                      name="📘 Linguagens (LC)"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      activeDot={{ r: 7 }}
                      dot={{ r: 4 }}
                    />
                  )}

                  {(selectedAreaFilter === 'all' || selectedAreaFilter === 'CH') && (
                    <Line
                      type="monotone"
                      dataKey={metric === 'scoreTRI' ? 'scoreCH' : 'percentCH'}
                      name="📙 Humanas (CH)"
                      stroke="#f59e0b"
                      strokeWidth={3}
                      activeDot={{ r: 7 }}
                      dot={{ r: 4 }}
                    />
                  )}

                  {(selectedAreaFilter === 'all' || selectedAreaFilter === 'CN') && (
                    <Line
                      type="monotone"
                      dataKey={metric === 'scoreTRI' ? 'scoreCN' : 'percentCN'}
                      name="📗 Natureza (CN)"
                      stroke="#10b981"
                      strokeWidth={3}
                      activeDot={{ r: 7 }}
                      dot={{ r: 4 }}
                    />
                  )}

                  {(selectedAreaFilter === 'all' || selectedAreaFilter === 'MT') && (
                    <Line
                      type="monotone"
                      dataKey={metric === 'scoreTRI' ? 'scoreMT' : 'percentMT'}
                      name="📐 Matemática (MT)"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      activeDot={{ r: 7 }}
                      dot={{ r: 4 }}
                    />
                  )}

                  {includeEssay && (
                    <Line
                      type="monotone"
                      dataKey={metric === 'scoreTRI' ? 'essayScore' : 'percentLC'}
                      name="✍️ Redação"
                      stroke="#ec4899"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ r: 4, fill: '#ec4899' }}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* 2. AREA CHART */}
          {chartMode === 'area' && (
            <div className="h-80 sm:h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 20, right: 25, left: -10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorLC" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorCH" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorCN" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorMT" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
                  <YAxis
                    domain={metric === 'scoreTRI' ? [400, 1000] : [0, 100]}
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    tickFormatter={(val) => (metric === 'scoreTRI' ? `${val}p` : `${val}%`)}
                  />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px', fontWeight: 600 }} />

                  {(selectedAreaFilter === 'all' || selectedAreaFilter === 'LC') && (
                    <Area
                      type="monotone"
                      dataKey={metric === 'scoreTRI' ? 'scoreLC' : 'percentLC'}
                      name="📘 Linguagens"
                      stroke="#3b82f6"
                      fillOpacity={1}
                      fill="url(#colorLC)"
                      strokeWidth={2}
                    />
                  )}

                  {(selectedAreaFilter === 'all' || selectedAreaFilter === 'CH') && (
                    <Area
                      type="monotone"
                      dataKey={metric === 'scoreTRI' ? 'scoreCH' : 'percentCH'}
                      name="📙 Humanas"
                      stroke="#f59e0b"
                      fillOpacity={1}
                      fill="url(#colorCH)"
                      strokeWidth={2}
                    />
                  )}

                  {(selectedAreaFilter === 'all' || selectedAreaFilter === 'CN') && (
                    <Area
                      type="monotone"
                      dataKey={metric === 'scoreTRI' ? 'scoreCN' : 'percentCN'}
                      name="📗 Natureza"
                      stroke="#10b981"
                      fillOpacity={1}
                      fill="url(#colorCN)"
                      strokeWidth={2}
                    />
                  )}

                  {(selectedAreaFilter === 'all' || selectedAreaFilter === 'MT') && (
                    <Area
                      type="monotone"
                      dataKey={metric === 'scoreTRI' ? 'scoreMT' : 'percentMT'}
                      name="📐 Matemática"
                      stroke="#8b5cf6"
                      fillOpacity={1}
                      fill="url(#colorMT)"
                      strokeWidth={2}
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* 3. BAR CHART */}
          {chartMode === 'bar' && (
            <div className="h-80 sm:h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 25, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
                  <YAxis
                    domain={metric === 'scoreTRI' ? [0, 1000] : [0, 100]}
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    tickFormatter={(val) => (metric === 'scoreTRI' ? `${val}p` : `${val}%`)}
                  />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px', fontWeight: 600 }} />

                  {(selectedAreaFilter === 'all' || selectedAreaFilter === 'LC') && (
                    <Bar
                      dataKey={metric === 'scoreTRI' ? 'scoreLC' : 'percentLC'}
                      name="📘 Linguagens"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                    />
                  )}

                  {(selectedAreaFilter === 'all' || selectedAreaFilter === 'CH') && (
                    <Bar
                      dataKey={metric === 'scoreTRI' ? 'scoreCH' : 'percentCH'}
                      name="📙 Humanas"
                      fill="#f59e0b"
                      radius={[4, 4, 0, 0]}
                    />
                  )}

                  {(selectedAreaFilter === 'all' || selectedAreaFilter === 'CN') && (
                    <Bar
                      dataKey={metric === 'scoreTRI' ? 'scoreCN' : 'percentCN'}
                      name="📗 Natureza"
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                    />
                  )}

                  {(selectedAreaFilter === 'all' || selectedAreaFilter === 'MT') && (
                    <Bar
                      dataKey={metric === 'scoreTRI' ? 'scoreMT' : 'percentMT'}
                      name="📐 Matemática"
                      fill="#8b5cf6"
                      radius={[4, 4, 0, 0]}
                    />
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* 4. RADAR CHART */}
          {chartMode === 'radar' && (
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 py-4">
              <div className="h-80 sm:h-96 w-full md:w-2/3">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                    <PolarGrid stroke="#cbd5e1" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#334155', fontSize: 13, fontWeight: 700 }} />
                    <PolarRadiusAxis
                      angle={30}
                      domain={metric === 'scoreTRI' ? [400, 1000] : [0, 100]}
                      stroke="#94a3b8"
                      fontSize={10}
                    />
                    <Radar
                      name="Simulado Inicial (Diagnóstico)"
                      dataKey="primeiroSimulado"
                      stroke="#94a3b8"
                      fill="#94a3b8"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                    <Radar
                      name="Simulado Mais Recente"
                      dataKey="ultimoSimulado"
                      stroke="#4f46e5"
                      fill="#6366f1"
                      fillOpacity={0.5}
                      strokeWidth={3}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 600, paddingTop: '10px' }} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Radar commentary */}
              <div className="bg-indigo-50/70 p-5 rounded-2xl border border-indigo-100 max-w-sm space-y-3 text-xs text-indigo-950">
                <div className="flex items-center gap-2 font-bold text-indigo-900">
                  <RadarIcon className="w-4 h-4 text-indigo-600" />
                  <span>Análise de Amplitude das Áreas</span>
                </div>
                <p className="leading-relaxed">
                  O gráfico radar compara sua base de conhecimento inicial (área cinza) com sua amplitude atual (área roxa/azul).
                </p>
                <div className="p-3 bg-white rounded-xl border border-indigo-200/70 space-y-1.5">
                  <span className="font-bold text-indigo-900 block">Equilíbrio da Teia:</span>
                  <span className="text-[11px] text-slate-600 block">
                    Seu polígono expandiu de forma homogênea. O maior avanço angular ocorreu em <strong>Matemática (+{topGrowingArea?.deltaScore} pts)</strong>, diminuindo a assimetria com Humanas.
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* COMPARATIVE AREA CARDS WITH EVOLUTION INDICATORS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <span>Diagnóstico Detalhado por Área do Conhecimento</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">
              Base Oficial ENEM
            </span>
          </h3>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            Comparação: Simulado Diagnóstico vs Último Simulado
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {areaPerformanceSummary.map((area) => (
            <div
              key={area.shortLabel}
              className={`p-5 rounded-3xl border bg-white shadow-xs space-y-3 transition hover:shadow-md ${area.borderColor}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">{area.icon}</span>
                <span
                  className="px-2.5 py-0.5 rounded-full font-bold text-xs"
                  style={{ backgroundColor: `${area.color}20`, color: area.color }}
                >
                  {area.shortLabel}
                </span>
              </div>

              <div>
                <h4 className="font-extrabold text-slate-900 text-sm leading-tight line-clamp-1" title={area.name}>
                  {area.name}
                </h4>
                <span className="text-[11px] text-slate-500 font-medium">
                  {area.currentCorrect} de {area.currentTotal} questões acertadas
                </span>
              </div>

              {/* Score Evolution Bar */}
              <div className="pt-1 border-t border-slate-100 space-y-1.5">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-bold text-slate-700">Nota TRI Atual:</span>
                  <span className="text-lg font-black text-slate-900">{area.currentScore} pts</span>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Inicial: {area.initialScore} pts</span>
                  <span className="font-bold text-emerald-600 flex items-center">
                    +{area.deltaScore} pts ({area.deltaPct > 0 ? `+${area.deltaPct}%` : `${area.deltaPct}%`})
                  </span>
                </div>

                {/* Mini progress bar */}
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${(area.currentScore / 1000) * 100}%`,
                      backgroundColor: area.color,
                    }}
                  />
                </div>
              </div>

              {/* Pedagogical insight badge */}
              <div className="pt-2 text-[11px] leading-tight text-slate-600">
                {area.shortLabel === 'MT' && (
                  <span className="text-indigo-800 font-medium">
                    🚀 <strong>Maior salto da trilha:</strong> Ganho substancial em funções e geometria.
                  </span>
                )}
                {area.shortLabel === 'CH' && (
                  <span className="text-amber-800 font-medium">
                    🏆 <strong>Domínio consolidado:</strong> Alto índice de acertos em sociologia e história.
                  </span>
                )}
                {area.shortLabel === 'LC' && (
                  <span className="text-blue-800 font-medium">
                    📘 <strong>Leitura crítica afiada:</strong> Interpretação semântica excelente.
                  </span>
                )}
                {area.shortLabel === 'CN' && (
                  <span className="text-emerald-800 font-medium">
                    🎯 <strong>Foco prioritário:</strong> Revisar termodinâmica e genética para atingir 750+.
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PEDAGOGICAL TRI DIAGNOSTIC BANNER */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-50 to-slate-50 border border-indigo-100/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
              Coerência Pedagógica TRI (Teoria de Resposta ao Item)
            </h4>
            <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
              Diferente de uma contagem linear simples, o algoritmo do ENEM avalia a coerência das suas respostas.
              Sua curva acumulada demonstra <strong>alta consistência</strong>: você acerta com firmeza os itens fáceis e médios antes dos complexos, o que alavanca sua nota final para cima de 750 pontos.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setStudentActiveTab('cronograma')}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shrink-0 transition flex items-center gap-1.5 shadow-sm"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Gerar Cronograma IA para Áreas Fracas</span>
          </button>

          <button
            onClick={() => setStudentActiveTab('enem')}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shrink-0 transition"
          >
            Praticar Modo ENEM
          </button>
        </div>
      </div>

      {/* SIMULATION HISTORY TABLE & ACTION LIST */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">
              Histórico Cronológico dos Simulados
            </h3>
            <span className="text-xs text-slate-500">
              Registros detalhados de cada aplicação com divisão por área
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsNewSimModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-xs flex items-center gap-1.5 transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Novo Registro</span>
            </button>

            <button
              onClick={() => {
                if (window.confirm('Deseja restaurar o histórico padrão de simulados?')) {
                  resetSimulationHistory();
                }
              }}
              className="px-3 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold text-xs flex items-center gap-1.5 transition"
              title="Restaurar dados originais"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Restaurar</span>
            </button>
          </div>
        </div>

        {/* Table / Accordion */}
        <div className="divide-y divide-slate-100">
          {newestFirstHistory.map((sim) => {
            const isExpanded = expandedSimId === sim.id;
            return (
              <div key={sim.id} className="transition hover:bg-slate-50/50">
                <div
                  onClick={() => setExpandedSimId(isExpanded ? null : sim.id)}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-black text-sm shrink-0">
                      {sim.displayDate.split('/')[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-sm">
                          {sim.title}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          {sim.status}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                        <span>📅 {sim.date}</span>
                        <span>•</span>
                        <span>⏱️ {sim.durationMinutes} min</span>
                        <span>•</span>
                        <span>✅ {sim.totalCorrect}/{sim.totalQuestions} acertos</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-5">
                    <div className="text-right">
                      <span className="text-xs font-medium text-slate-500 block">Nota TRI Total</span>
                      <span className="text-lg font-black text-indigo-700">{sim.overallScoreTRI} pts</span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-medium text-slate-500 block">Redação</span>
                      <span className="text-lg font-black text-pink-600">{sim.essayScore || '--'} pts</span>
                    </div>

                    <div className="text-slate-400">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 bg-slate-50/70 border-t border-slate-100 text-xs space-y-4 animate-fadeIn">
                    {sim.notes && (
                      <div className="p-3 bg-white rounded-xl border border-slate-200/80 flex items-start gap-2.5">
                        <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                        <span className="text-slate-700 leading-relaxed font-medium">
                          <strong>Anotação Pedagógica:</strong> {sim.notes}
                        </span>
                      </div>
                    )}

                    {/* Area breakdown pills */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {sim.byArea.map((area) => {
                        const cfg = AREA_CONFIGS.find((c) => c.shortLabel === area.shortLabel);
                        return (
                          <div
                            key={area.shortLabel}
                            className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-800">
                                {cfg?.icon} {area.shortLabel}
                              </span>
                              <span className="font-black text-sm text-slate-900">{area.scoreTRI} pts</span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-slate-500">
                              <span>Acertos:</span>
                              <span className="font-bold text-slate-700">
                                {area.correctAnswers}/{area.totalQuestions} ({area.percentage}%)
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL: REGISTRAR NOVO SIMULADO */}
      {isNewSimModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-indigo-600" />
                <h3 className="font-extrabold text-slate-900 text-lg">Registrar Novo Simulado</h3>
              </div>
              <button
                onClick={() => setIsNewSimModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSimulation} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Título do Simulado</label>
                <input
                  type="text"
                  value={newSimTitle}
                  onChange={(e) => setNewSimTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  placeholder="Ex: Simulado Nacional 2º Semestre"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-blue-700 mb-1">📘 Linguagens TRI (pts)</label>
                  <input
                    type="number"
                    min={300}
                    max={1000}
                    value={newSimLCScore}
                    onChange={(e) => setNewSimLCScore(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-blue-200 font-bold focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-amber-700 mb-1">📙 Humanas TRI (pts)</label>
                  <input
                    type="number"
                    min={300}
                    max={1000}
                    value={newSimCHScore}
                    onChange={(e) => setNewSimCHScore(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-amber-200 font-bold focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-emerald-700 mb-1">📗 Natureza TRI (pts)</label>
                  <input
                    type="number"
                    min={300}
                    max={1000}
                    value={newSimCNScore}
                    onChange={(e) => setNewSimCNScore(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-emerald-200 font-bold focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-purple-700 mb-1">📐 Matemática TRI (pts)</label>
                  <input
                    type="number"
                    min={300}
                    max={1000}
                    value={newSimMTScore}
                    onChange={(e) => setNewSimMTScore(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-purple-200 font-bold focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-pink-700 mb-1">✍️ Redação (0 a 1000)</label>
                  <input
                    type="number"
                    min={0}
                    max={1000}
                    value={newSimEssayScore}
                    onChange={(e) => setNewSimEssayScore(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-pink-200 font-bold focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">⏱️ Duração (minutos)</label>
                  <input
                    type="number"
                    min={30}
                    max={360}
                    value={newSimDuration}
                    onChange={(e) => setNewSimDuration(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewSimModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition shadow-md"
                >
                  Salvar e Atualizar Gráficos
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
