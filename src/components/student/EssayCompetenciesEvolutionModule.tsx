import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { KnowledgeArea, EssaySubmissionHistoryItem } from '../../types';
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
  Award,
  TrendingUp,
  Layers,
  BarChart2,
  Radar as RadarIcon,
  Filter,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  BookOpen,
  Volume2,
  VolumeX,
  Target,
  FileText,
  PlusCircle,
  RotateCcw,
  Info,
  ChevronDown,
  ChevronUp,
  Check,
  Lightbulb,
  ShieldAlert,
  Flame,
  Clock,
  Share2,
} from 'lucide-react';

export type ChartVisualMode = 'line' | 'area' | 'bar' | 'radar';

interface CompetenceMeta {
  key: 'c1' | 'c2' | 'c3' | 'c4' | 'c5';
  number: number;
  label: string;
  shortTitle: string;
  color: string;
  lightBg: string;
  borderColor: string;
  textColor: string;
  badgeBg: string;
  description: string;
  neuroFriendlyTip: string;
  officialCriterion: string;
}

const COMPETENCIES_CONFIG: CompetenceMeta[] = [
  {
    key: 'c1',
    number: 1,
    label: 'C1: Norma Culta',
    shortTitle: 'Gramática & Convenções Escritas',
    color: '#3b82f6', // blue-500
    lightBg: 'bg-blue-50/70',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700',
    badgeBg: 'bg-blue-100 text-blue-800',
    description: 'Demonstrar domínio da modalidade escrita formal da língua portuguesa.',
    neuroFriendlyTip: 'Regra de ouro: leia frases longas em voz alta. Se faltar ar, divida com ponto final e inicie nova oração.',
    officialCriterion: 'Estrutura sintática completa e desvios gramaticais pontuais e não reincidentes.',
  },
  {
    key: 'c2',
    number: 2,
    label: 'C2: Tema & Repertório',
    shortTitle: 'Compreensão Temática & Repertório',
    color: '#8b5cf6', // purple-500
    lightBg: 'bg-purple-50/70',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-700',
    badgeBg: 'bg-purple-100 text-purple-800',
    description: 'Compreender a proposta e aplicar conceitos das várias áreas do conhecimento dentro dos limites dissertativos.',
    neuroFriendlyTip: 'Conecte sempre a citação filosófica/histórica ao problema concreto do tema em 1 frase explicativa.',
    officialCriterion: 'Repertório sociocultural legitimado, pertinente e com uso produtivo autoral.',
  },
  {
    key: 'c3',
    number: 3,
    label: 'C3: Projeto de Texto',
    shortTitle: 'Seleção, Relação & Argumentação',
    color: '#f59e0b', // amber-500
    lightBg: 'bg-amber-50/70',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-700',
    badgeBg: 'bg-amber-100 text-amber-800',
    description: 'Selecionar, relacionar, organizar e interpretar informações, fatos e argumentos em defesa de um ponto de vista.',
    neuroFriendlyTip: 'Defina 2 teses na introdução. Dedique D1 à primeira e D2 à segunda, sem misturar assuntos.',
    officialCriterion: 'Projeto de texto estratégico, sem lacunas argumentativas e autoria consistente.',
  },
  {
    key: 'c4',
    number: 4,
    label: 'C4: Coesão & Conectivos',
    shortTitle: 'Mecanismos Linguísticos Coesivos',
    color: '#10b981', // emerald-500
    lightBg: 'bg-emerald-50/70',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-700',
    badgeBg: 'bg-emerald-100 text-emerald-800',
    description: 'Demonstrar conhecimento dos mecanismos linguísticos necessários para a construção da argumentação.',
    neuroFriendlyTip: 'Inicie D1, D2 e Conclusão com conectivos interparágrafos ("Em primeiro plano", "Ademais", "Portanto").',
    officialCriterion: 'Variedade expressiva de recursos coesivos inter e intraparágrafos sem repetições monótonas.',
  },
  {
    key: 'c5',
    number: 5,
    label: 'C5: Proposta de Intervenção',
    shortTitle: 'Intervenção Social & Direitos Humanos',
    color: '#f43f5e', // rose-500
    lightBg: 'bg-rose-50/70',
    borderColor: 'border-rose-200',
    textColor: 'text-rose-700',
    badgeBg: 'bg-rose-100 text-rose-800',
    description: 'Elaborar proposta de intervenção para o problema abordado, respeitando os direitos humanos.',
    neuroFriendlyTip: 'Mnemônico 5 dedos: 1. Quem faz? 2. O que faz? 3. Como faz? 4. Para que faz? 5. Detalhe um deles!',
    officialCriterion: 'Presença completa e articulada dos 5 elementos válidos: Agente, Ação, Meio, Efeito e Detalhamento.',
  },
];

interface KnowledgeAreaFilterOption {
  key: 'all' | 'LC' | 'CH' | 'CN' | 'MT';
  name: string;
  fullName: KnowledgeArea | 'Todas as Áreas';
  icon: string;
  color: string;
}

const KNOWLEDGE_AREA_FILTERS: KnowledgeAreaFilterOption[] = [
  {
    key: 'all',
    name: 'Todas as Áreas',
    fullName: 'Todas as Áreas',
    icon: '🌐',
    color: '#4f46e5',
  },
  {
    key: 'LC',
    name: 'Linguagens & Códigos',
    fullName: 'Linguagens, Códigos e suas Tecnologias',
    icon: '📘',
    color: '#3b82f6',
  },
  {
    key: 'CH',
    name: 'Ciências Humanas',
    fullName: 'Ciências Humanas e suas Tecnologias',
    icon: '📙',
    color: '#f59e0b',
  },
  {
    key: 'CN',
    name: 'Ciências da Natureza',
    fullName: 'Ciências da Natureza e suas Tecnologias',
    icon: '📗',
    color: '#10b981',
  },
  {
    key: 'MT',
    name: 'Matemática & Dados',
    fullName: 'Matemática e suas Tecnologias',
    icon: '📐',
    color: '#8b5cf6',
  },
];

export const EssayCompetenciesEvolutionModule: React.FC = () => {
  const {
    essayHistory,
    addEssaySubmission,
    resetEssayHistory,
    speakText,
    isSpeaking,
    stopSpeaking,
    accessibility,
  } = useApp();

  // Controls State
  const [visualMode, setVisualMode] = useState<ChartVisualMode>('line');
  const [selectedAreaFilter, setSelectedAreaFilter] = useState<'all' | 'LC' | 'CH' | 'CN' | 'MT'>('all');
  const [activeCompetencies, setActiveCompetencies] = useState<Record<string, boolean>>({
    c1: true,
    c2: true,
    c3: true,
    c4: true,
    c5: true,
    total: false,
  });
  const [expandedEssayId, setExpandedEssayId] = useState<string | null>(null);
  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState<boolean>(false);
  const [copiedAlert, setCopiedAlert] = useState<string | null>(null);

  // Simulation form state
  const [newTheme, setNewTheme] = useState('Desafios da transição energética e bioeconomia sustentável no Brasil');
  const [newArea, setNewArea] = useState<KnowledgeArea>('Ciências da Natureza e suas Tecnologias');
  const [newC1, setNewC1] = useState(180);
  const [newC2, setNewC2] = useState(180);
  const [newC3, setNewC3] = useState(180);
  const [newC4, setNewC4] = useState(180);
  const [newC5, setNewC5] = useState(200);

  // Filtered essays by Knowledge Area (chronological)
  const filteredHistory = useMemo(() => {
    const sorted = [...essayHistory].sort((a, b) => a.timestamp - b.timestamp);
    if (selectedAreaFilter === 'all') return sorted;
    return sorted.filter((e) => e.knowledgeAreaShort === selectedAreaFilter);
  }, [essayHistory, selectedAreaFilter]);

  // First & Latest essay in the filtered list
  const firstEssay = filteredHistory[0];
  const latestEssay = filteredHistory[filteredHistory.length - 1];

  // Toggle individual competence
  const toggleCompetence = (key: string) => {
    setActiveCompetencies((prev) => {
      const activeCount = Object.entries(prev).filter(([k, v]) => k !== 'total' && v).length;
      if (prev[key] && activeCount <= 1 && key !== 'total') return prev;
      return { ...prev, [key]: !prev[key] };
    });
  };

  const selectAllCompetencies = () => {
    setActiveCompetencies({
      c1: true,
      c2: true,
      c3: true,
      c4: true,
      c5: true,
      total: false,
    });
  };

  const focusOnlyTotal = () => {
    setActiveCompetencies({
      c1: false,
      c2: false,
      c3: false,
      c4: false,
      c5: false,
      total: true,
    });
  };

  // Recharts Chart Dataset
  const chartData = useMemo(() => {
    return filteredHistory.map((essay, idx) => ({
      id: essay.id,
      index: idx + 1,
      name: essay.displayDate || `Redação #${idx + 1}`,
      title: essay.themeTitle,
      areaShort: essay.knowledgeAreaShort,
      areaName: essay.knowledgeArea,
      total: essay.totalScore,
      c1: essay.c1,
      c2: essay.c2,
      c3: essay.c3,
      c4: essay.c4,
      c5: essay.c5,
      mode: essay.mode || 'IA',
    }));
  }, [filteredHistory]);

  // Radar Chart Dataset (First vs Latest)
  const radarData = useMemo(() => {
    if (!firstEssay || !latestEssay) return [];

    return COMPETENCIES_CONFIG.map((comp) => ({
      subject: `C${comp.number}`,
      fullName: comp.label,
      inicial: firstEssay[comp.key] || 0,
      atual: latestEssay[comp.key] || 0,
      metaEnem: 160,
      maximo: 200,
    }));
  }, [firstEssay, latestEssay]);

  // Competency Summaries & Deltas
  const competenceSummaries = useMemo(() => {
    if (!firstEssay || !latestEssay) return [];

    return COMPETENCIES_CONFIG.map((comp) => {
      const scoreFirst = firstEssay[comp.key] || 0;
      const scoreLatest = latestEssay[comp.key] || 0;
      const delta = scoreLatest - scoreFirst;

      // Average in filtered history
      const totalInFilter = filteredHistory.reduce((acc, curr) => acc + (curr[comp.key] || 0), 0);
      const avg = filteredHistory.length > 0 ? Math.round(totalInFilter / filteredHistory.length) : 0;

      // Level 1 to 5
      const level = Math.min(5, Math.max(1, Math.floor(scoreLatest / 40)));

      return {
        ...comp,
        scoreFirst,
        scoreLatest,
        delta,
        avg,
        level,
      };
    });
  }, [firstEssay, latestEssay, filteredHistory]);

  // Highest gain & Strongest competency
  const highestGain = useMemo(() => {
    if (competenceSummaries.length === 0) return null;
    return [...competenceSummaries].sort((a, b) => b.delta - a.delta)[0];
  }, [competenceSummaries]);

  const strongestComp = useMemo(() => {
    if (competenceSummaries.length === 0) return null;
    return [...competenceSummaries].sort((a, b) => b.scoreLatest - a.scoreLatest)[0];
  }, [competenceSummaries]);

  const totalDelta = (latestEssay?.totalScore || 0) - (firstEssay?.totalScore || 0);

  // Audio summary
  const handleNarrateSummary = () => {
    if (isSpeaking) {
      stopSpeaking();
      return;
    }

    if (!latestEssay) {
      speakText('Nenhuma redação registrada para narrar.');
      return;
    }

    const areaText = selectedAreaFilter === 'all' ? 'em todas as áreas do conhecimento' : `na área de ${selectedAreaFilter}`;
    const text = `Relatório de evolução nas 5 Competências do ENEM ${areaText}. Sua nota atual na redação é de ${latestEssay.totalScore} pontos, um salto de ${totalDelta >= 0 ? '+' : ''}${totalDelta} pontos desde o início. Sua competência mais forte é a ${strongestComp?.label} com ${strongestComp?.scoreLatest} pontos. A competência com maior evolução foi a ${highestGain?.label}, com aumento de ${highestGain?.delta} pontos. Continue praticando!`;
    speakText(text);
  };

  // Add simulated essay
  const handleAddSimulatedEssay = (e: React.FormEvent) => {
    e.preventDefault();

    let shortLabel: 'LC' | 'CH' | 'CN' | 'MT' = 'CN';
    if (newArea === 'Linguagens, Códigos e suas Tecnologias') shortLabel = 'LC';
    else if (newArea === 'Ciências Humanas e suas Tecnologias') shortLabel = 'CH';
    else if (newArea === 'Matemática e suas Tecnologias') shortLabel = 'MT';

    const total = newC1 + newC2 + newC3 + newC4 + newC5;
    const now = new Date();
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const displayDate = `${monthNames[now.getMonth()]}/${now.getFullYear()}`;

    const newSubmission: EssaySubmissionHistoryItem = {
      id: `essay-sim-${Date.now()}`,
      themeTitle: newTheme.trim() || 'Redação de Treino Simulada',
      date: now.toISOString().split('T')[0],
      displayDate,
      timestamp: now.getTime(),
      knowledgeArea: newArea,
      knowledgeAreaShort: shortLabel,
      totalScore: total,
      c1: newC1,
      c2: newC2,
      c3: newC3,
      c4: newC4,
      c5: newC5,
      interventionElementsCount: newC5 >= 160 ? 5 : 4,
      feedbackSummary: `Simulação registrada com sucesso! Total atingido: ${total} pontos na redação ENEM.`,
      mode: 'Simulado',
    };

    addEssaySubmission(newSubmission);
    setIsSimulateModalOpen(false);
    setCopiedAlert('Nova redação registrada! Gráficos atualizados.');
    setTimeout(() => setCopiedAlert(null), 3000);
  };

  // Custom Tooltip for Recharts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataItem = payload[0]?.payload;
      return (
        <div className="bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-xl border border-slate-700 text-xs min-w-[260px]">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
            <div>
              <p className="font-extrabold text-slate-100">{dataItem?.title || label}</p>
              <p className="text-[10px] text-indigo-400 font-medium mt-0.5">
                {dataItem?.areaName} ({dataItem?.areaShort})
              </p>
            </div>
            <span className="text-[10px] text-slate-400 font-mono bg-slate-800 px-2 py-0.5 rounded-full">
              {label}
            </span>
          </div>

          <div className="space-y-1.5">
            {payload.map((entry: any) => {
              if (entry.dataKey === 'total') {
                return (
                  <div key="total" className="flex items-center justify-between font-bold text-amber-300 pt-1 border-t border-slate-800">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      Nota Total (0-1000):
                    </span>
                    <span className="font-mono text-sm">{entry.value} pts</span>
                  </div>
                );
              }

              const compCfg = COMPETENCIES_CONFIG.find((c) => c.key === entry.dataKey);
              if (!compCfg) return null;

              return (
                <div key={entry.dataKey} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: compCfg.color }}
                    />
                    <span className="text-slate-300 font-medium">
                      {compCfg.label}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-white">
                    {entry.value} / 200 pts
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>Nota Total Calculada:</span>
            <span className="font-bold text-emerald-400 font-mono text-xs">
              {dataItem?.total} / 1000 pts
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6 animate-fadeIn">
      {/* Notifications Alert */}
      {copiedAlert && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{copiedAlert}</span>
          </div>
          <button onClick={() => setCopiedAlert(null)} className="text-emerald-700 hover:underline">
            Fechar
          </button>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-black text-indigo-700 uppercase tracking-wider flex items-center gap-1.5 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
              <Award className="w-3.5 h-3.5 text-indigo-600" />
              Recharts Analytics • Matriz Oficial ENEM
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Evolução Temporal nas 5 Competências
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Evolução nas 5 Competências do ENEM
            <span className="text-xs font-normal text-slate-500 hidden md:inline">
              (0 a 200 pts por competência • Meta 1000)
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
            Acompanhe com precisão matemática o crescimento do seu repertório, estrutura argumentativa, domínio gramatical, coesão e proposta de intervenção. Filtre por área do conhecimento para identificar correlações temáticas.
          </p>
        </div>

        {/* Action Controls & TTS */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleNarrateSummary}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition border ${
              isSpeaking
                ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200'
            }`}
            title="Ouvir resumo em áudio do seu progresso"
          >
            {isSpeaking ? <VolumeX className="w-4 h-4 text-rose-600" /> : <Volume2 className="w-4 h-4 text-indigo-600" />}
            <span>{isSpeaking ? 'Parar Leitura' : 'Ouvir Evolução'}</span>
          </button>

          <button
            onClick={() => setIsSimulateModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-2xs"
            title="Registrar nova pontuação simulada"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Simular Redação</span>
          </button>

          <button
            onClick={resetEssayHistory}
            className="p-2 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-xl transition border border-slate-200"
            title="Restaurar histórico inicial de redações"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* QUICK KPIS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-indigo-50/70 p-4 rounded-2xl border border-indigo-100">
          <span className="text-[11px] font-bold text-indigo-700 block mb-1">Nota Recente</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-indigo-950 font-mono">
              {latestEssay?.totalScore || 0}
            </span>
            <span className="text-xs text-indigo-600">/ 1000</span>
          </div>
          <span className="text-[10px] text-indigo-800 font-semibold block mt-1">
            {latestEssay?.themeTitle ? latestEssay.themeTitle.slice(0, 30) + '...' : 'Sem redações'}
          </span>
        </div>

        <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-100">
          <span className="text-[11px] font-bold text-emerald-700 block mb-1">Salto Acumulado</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-emerald-950 font-mono">
              {totalDelta >= 0 ? `+${totalDelta}` : totalDelta}
            </span>
            <span className="text-xs text-emerald-700 font-bold">pts</span>
          </div>
          <span className="text-[10px] text-emerald-800 font-semibold block mt-1">
            {firstEssay?.totalScore || 0} → {latestEssay?.totalScore || 0} ({filteredHistory.length} redações)
          </span>
        </div>

        <div className="bg-purple-50/70 p-4 rounded-2xl border border-purple-100">
          <span className="text-[11px] font-bold text-purple-700 block mb-1">Competência Forte</span>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-black text-purple-950">
              {strongestComp ? strongestComp.label : '-'}
            </span>
          </div>
          <span className="text-[10px] text-purple-800 font-semibold block mt-1">
            {strongestComp ? `${strongestComp.scoreLatest} pts (Nível ${strongestComp.level})` : '-'}
          </span>
        </div>

        <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-100">
          <span className="text-[11px] font-bold text-amber-700 block mb-1">Maior Crescimento</span>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-black text-amber-950">
              {highestGain ? highestGain.label : '-'}
            </span>
          </div>
          <span className="text-[10px] text-amber-800 font-semibold block mt-1">
            {highestGain ? `+${highestGain.delta} pts conquistados` : '-'}
          </span>
        </div>
      </div>

      {/* FILTER CONTROLS BAR: KNOWLEDGE AREA FILTER & CHART TYPE */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 bg-slate-50/90 rounded-2xl border border-slate-200/90">
        {/* Knowledge Area Pills */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <Filter className="w-3.5 h-3.5 text-indigo-600" />
            <span>Filtrar por Área do Conhecimento:</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {KNOWLEDGE_AREA_FILTERS.map((area) => {
              const isSelected = selectedAreaFilter === area.key;
              return (
                <button
                  key={area.key}
                  onClick={() => setSelectedAreaFilter(area.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-700 shadow-2xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>{area.icon}</span>
                  <span>{area.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Visual Chart Mode Toggles */}
        <div className="space-y-1.5 self-start lg:self-auto">
          <span className="text-xs font-bold text-slate-700 block">Tipo de Visualização:</span>
          <div className="flex items-center p-1 bg-slate-200/70 rounded-xl border border-slate-300/80 text-xs font-bold">
            <button
              onClick={() => setVisualMode('line')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                visualMode === 'line'
                  ? 'bg-white text-indigo-700 shadow-2xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Linhas de Evolução Temporal"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Linhas</span>
            </button>

            <button
              onClick={() => setVisualMode('area')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                visualMode === 'area'
                  ? 'bg-white text-indigo-700 shadow-2xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Áreas Preenchidas em Gradiente"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Áreas</span>
            </button>

            <button
              onClick={() => setVisualMode('bar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                visualMode === 'bar'
                  ? 'bg-white text-indigo-700 shadow-2xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Barras Comparativas"
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Barras</span>
            </button>

            <button
              onClick={() => setVisualMode('radar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                visualMode === 'radar'
                  ? 'bg-white text-indigo-700 shadow-2xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Gráfico Radar / Teia: Diagnóstico vs Atual"
            >
              <RadarIcon className="w-3.5 h-3.5" />
              <span>Radar</span>
            </button>
          </div>
        </div>
      </div>

      {/* COMPETENCY TOGGLE CHIPS */}
      {visualMode !== 'radar' && (
        <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-500 pl-1">Exibir no gráfico:</span>
            {COMPETENCIES_CONFIG.map((comp) => {
              const isActive = activeCompetencies[comp.key];
              return (
                <button
                  key={comp.key}
                  onClick={() => toggleCompetence(comp.key)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl font-bold transition border ${
                    isActive
                      ? `${comp.badgeBg} border-slate-300 shadow-2xs`
                      : 'bg-white text-slate-400 border-slate-200 opacity-50 hover:opacity-100'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: isActive ? comp.color : '#94a3b8' }}
                  />
                  <span>{comp.label}</span>
                </button>
              );
            })}

            <button
              onClick={() => toggleCompetence('total')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl font-bold transition border ${
                activeCompetencies.total
                  ? 'bg-indigo-900 text-white border-indigo-950 shadow-2xs'
                  : 'bg-white text-slate-400 border-slate-200 opacity-50 hover:opacity-100'
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: activeCompetencies.total ? '#6366f1' : '#94a3b8' }}
              />
              <span>Nota Total (0-1000)</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={selectAllCompetencies}
              className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 underline"
            >
              Ver Todas C1-C5
            </button>
            <span className="text-slate-300">•</span>
            <button
              onClick={focusOnlyTotal}
              className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 underline"
            >
              Apenas Nota Geral
            </button>
          </div>
        </div>
      )}

      {/* RECHARTS CANVAS CONTAINER */}
      <div className="w-full bg-slate-50/50 rounded-2xl p-3 border border-slate-200/80">
        <div className="h-72 sm:h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {visualMode === 'line' ? (
              <LineChart data={chartData} margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                />
                <YAxis
                  domain={activeCompetencies.total ? [0, 1000] : [0, 200]}
                  ticks={activeCompetencies.total ? [0, 200, 400, 600, 800, 1000] : [0, 40, 80, 120, 160, 200]}
                  tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
                  tickLine={false}
                  axisLine={false}
                  unit=" pts"
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  formatter={(value) => {
                    if (value === 'total') return <span className="font-bold text-indigo-900">Nota Total (0-1000)</span>;
                    const c = COMPETENCIES_CONFIG.find((item) => item.key === value);
                    return <span className="font-semibold text-slate-700">{c ? c.label : value}</span>;
                  }}
                />

                {/* Linhas de Referência de Corte ENEM */}
                {!activeCompetencies.total && (
                  <>
                    <ReferenceLine
                      y={160}
                      stroke="#10b981"
                      strokeDasharray="4 4"
                      label={{ value: 'Meta Nível 4 (160 pts)', fill: '#059669', fontSize: 10, position: 'insideTopRight' }}
                    />
                    <ReferenceLine
                      y={200}
                      stroke="#8b5cf6"
                      strokeDasharray="4 4"
                      label={{ value: 'Nível 5 Máximo (200 pts)', fill: '#7c3aed', fontSize: 10, position: 'insideTopLeft' }}
                    />
                  </>
                )}

                {/* Lines for each competency */}
                {COMPETENCIES_CONFIG.map((comp) => {
                  if (!activeCompetencies[comp.key]) return null;
                  return (
                    <Line
                      key={comp.key}
                      type="monotone"
                      dataKey={comp.key}
                      name={comp.key}
                      stroke={comp.color}
                      strokeWidth={3}
                      dot={{ r: 4.5, strokeWidth: 2, fill: '#ffffff', stroke: comp.color }}
                      activeDot={{ r: 7, stroke: '#ffffff', strokeWidth: 2.5, fill: comp.color }}
                      animationDuration={800}
                    />
                  );
                })}

                {/* Line for Total Score */}
                {activeCompetencies.total && (
                  <Line
                    type="monotone"
                    dataKey="total"
                    name="total"
                    stroke="#4f46e5"
                    strokeWidth={3.5}
                    dot={{ r: 5, strokeWidth: 2, fill: '#ffffff', stroke: '#4f46e5' }}
                    activeDot={{ r: 8, stroke: '#ffffff', strokeWidth: 2.5, fill: '#4f46e5' }}
                    animationDuration={800}
                  />
                )}
              </LineChart>
            ) : visualMode === 'area' ? (
              <AreaChart data={chartData} margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
                <defs>
                  {COMPETENCIES_CONFIG.map((comp) => (
                    <linearGradient key={comp.key} id={`areaGrad_${comp.key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={comp.color} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={comp.color} stopOpacity={0.02} />
                    </linearGradient>
                  ))}
                  <linearGradient id="areaGrad_total" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                />
                <YAxis
                  domain={activeCompetencies.total ? [0, 1000] : [0, 200]}
                  ticks={activeCompetencies.total ? [0, 200, 400, 600, 800, 1000] : [0, 40, 80, 120, 160, 200]}
                  tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
                  tickLine={false}
                  axisLine={false}
                  unit=" pts"
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  formatter={(value) => {
                    if (value === 'total') return <span className="font-bold text-indigo-900">Nota Total (0-1000)</span>;
                    const c = COMPETENCIES_CONFIG.find((item) => item.key === value);
                    return <span className="font-semibold text-slate-700">{c ? c.label : value}</span>;
                  }}
                />

                {COMPETENCIES_CONFIG.map((comp) => {
                  if (!activeCompetencies[comp.key]) return null;
                  return (
                    <Area
                      key={comp.key}
                      type="monotone"
                      dataKey={comp.key}
                      name={comp.key}
                      stroke={comp.color}
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill={`url(#areaGrad_${comp.key})`}
                      animationDuration={800}
                    />
                  );
                })}

                {activeCompetencies.total && (
                  <Area
                    type="monotone"
                    dataKey="total"
                    name="total"
                    stroke="#4f46e5"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#areaGrad_total)"
                    animationDuration={800}
                  />
                )}
              </AreaChart>
            ) : visualMode === 'bar' ? (
              <BarChart data={chartData} margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                />
                <YAxis
                  domain={activeCompetencies.total ? [0, 1000] : [0, 200]}
                  tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
                  tickLine={false}
                  axisLine={false}
                  unit=" pts"
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  formatter={(value) => {
                    if (value === 'total') return <span className="font-bold text-indigo-900">Nota Total (0-1000)</span>;
                    const c = COMPETENCIES_CONFIG.find((item) => item.key === value);
                    return <span className="font-semibold text-slate-700">{c ? c.label : value}</span>;
                  }}
                />

                {COMPETENCIES_CONFIG.map((comp) => {
                  if (!activeCompetencies[comp.key]) return null;
                  return (
                    <Bar
                      key={comp.key}
                      dataKey={comp.key}
                      name={comp.key}
                      fill={comp.color}
                      radius={[4, 4, 0, 0]}
                      animationDuration={800}
                    />
                  );
                })}

                {activeCompetencies.total && (
                  <Bar
                    dataKey="total"
                    name="total"
                    fill="#4f46e5"
                    radius={[4, 4, 0, 0]}
                    animationDuration={800}
                  />
                )}
              </BarChart>
            ) : (
              /* RADAR CHART */
              <RadarChart outerRadius="75%" data={radarData}>
                <PolarGrid stroke="#cbd5e1" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: '#334155', fontSize: 12, fontWeight: 700 }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 200]}
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  unit=" pts"
                />
                <Radar
                  name="Diagnóstico Inicial"
                  dataKey="inicial"
                  stroke="#94a3b8"
                  fill="#94a3b8"
                  fillOpacity={0.25}
                />
                <Radar
                  name="Desempenho Atual"
                  dataKey="atual"
                  stroke="#4f46e5"
                  fill="#4f46e5"
                  fillOpacity={0.45}
                />
                <Radar
                  name="Meta ENEM (Nível 4)"
                  dataKey="metaEnem"
                  stroke="#10b981"
                  strokeDasharray="4 4"
                  fill="#10b981"
                  fillOpacity={0.05}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Tooltip
                  formatter={(value: any, name: any) => [`${value} / 200 pontos`, name]}
                />
              </RadarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* DETAILED COMPETENCY CARDS GRID */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-600" />
            Diagnóstico Analítico por Competência
          </h3>
          <span className="text-xs text-slate-500 font-semibold">
            {filteredHistory.length} redações analisadas
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {competenceSummaries.map((comp) => {
            const isPositive = comp.delta >= 0;
            return (
              <div
                key={comp.key}
                className={`p-4 rounded-2xl border transition-all hover:shadow-xs flex flex-col justify-between ${comp.lightBg} ${comp.borderColor}`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className={`text-[11px] font-black px-2 py-0.5 rounded-full ${comp.badgeBg}`}>
                      {comp.label}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 ${
                        isPositive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {isPositive ? '+' : ''}{comp.delta} pts
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-800 mb-1 leading-snug">
                    {comp.shortTitle}
                  </h4>

                  <div className="flex items-baseline justify-between mt-2 mb-1.5">
                    <span className="text-2xl font-black text-slate-900 font-mono">
                      {comp.scoreLatest}
                      <span className="text-xs text-slate-500 font-normal"> / 200</span>
                    </span>
                    <span className="text-[11px] font-semibold text-slate-600">
                      Nível {comp.level} do ENEM
                    </span>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        backgroundColor: comp.color,
                        width: `${Math.min(100, Math.max(10, (comp.scoreLatest / 200) * 100))}%`,
                      }}
                    />
                  </div>

                  <p className="text-[11px] text-slate-600 leading-relaxed mb-3 line-clamp-2" title={comp.description}>
                    {comp.description}
                  </p>
                </div>

                {/* Neurodivergent tip callout */}
                <div className="pt-2 border-t border-slate-200/80 bg-white/60 p-2.5 rounded-xl text-[10px] text-slate-700 space-y-1">
                  <div className="flex items-center gap-1 font-bold text-indigo-900">
                    <Lightbulb className="w-3 h-3 text-amber-500 shrink-0" />
                    <span>Dica Prática Direta:</span>
                  </div>
                  <p className="leading-snug">{comp.neuroFriendlyTip}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* TIMELINE OF ESSAY SUBMISSIONS ACCORDING TO KNOWLEDGE AREA */}
      <div className="pt-4 border-t border-slate-100 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            Histórico de Redações na Linha do Tempo
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            Mostrando {filteredHistory.length} registros
          </span>
        </div>

        <div className="space-y-2.5">
          {filteredHistory.map((essay, index) => {
            const isExpanded = expandedEssayId === essay.id;
            return (
              <div
                key={essay.id}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-indigo-300 transition"
              >
                <div
                  onClick={() => setExpandedEssayId(isExpanded ? null : essay.id)}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/60"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 font-black text-xs flex items-center justify-center shrink-0 border border-indigo-200 font-mono">
                      #{index + 1}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-900">
                          {essay.themeTitle}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                          {essay.knowledgeAreaShort === 'LC' ? '📘 Linguagens' : essay.knowledgeAreaShort === 'CH' ? '📙 Humanas' : essay.knowledgeAreaShort === 'CN' ? '📗 Natureza' : '📐 Matemática'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {essay.date}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                        <span>C1: <strong>{essay.c1}</strong></span>
                        <span>•</span>
                        <span>C2: <strong>{essay.c2}</strong></span>
                        <span>•</span>
                        <span>C3: <strong>{essay.c3}</strong></span>
                        <span>•</span>
                        <span>C4: <strong>{essay.c4}</strong></span>
                        <span>•</span>
                        <span>C5: <strong>{essay.c5}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 self-end sm:self-auto">
                    <div className="text-right">
                      <span className="text-lg font-black text-slate-900 font-mono block">
                        {essay.totalScore} pts
                      </span>
                      <span className="text-[10px] text-emerald-600 font-bold block">
                        {essay.mode === 'Voz' ? '🎤 Ditado por Voz' : essay.mode === 'IA' ? '✨ Corrigido com IA' : '📝 Simulado'}
                      </span>
                    </div>

                    <div className="p-1 text-slate-400">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-700 space-y-3 animate-fadeIn">
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      <div className="bg-blue-50 p-2.5 rounded-xl border border-blue-200">
                        <span className="text-[10px] font-bold text-blue-700 block">C1: Norma Culta</span>
                        <span className="text-sm font-black text-blue-950 font-mono">{essay.c1} / 200</span>
                      </div>
                      <div className="bg-purple-50 p-2.5 rounded-xl border border-purple-200">
                        <span className="text-[10px] font-bold text-purple-700 block">C2: Repertório</span>
                        <span className="text-sm font-black text-purple-950 font-mono">{essay.c2} / 200</span>
                      </div>
                      <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                        <span className="text-[10px] font-bold text-amber-700 block">C3: Projeto de Texto</span>
                        <span className="text-sm font-black text-amber-950 font-mono">{essay.c3} / 200</span>
                      </div>
                      <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                        <span className="text-[10px] font-bold text-emerald-700 block">C4: Coesão</span>
                        <span className="text-sm font-black text-emerald-950 font-mono">{essay.c4} / 200</span>
                      </div>
                      <div className="bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                        <span className="text-[10px] font-bold text-rose-700 block">C5: Intervenção</span>
                        <span className="text-sm font-black text-rose-950 font-mono">{essay.c5} / 200</span>
                      </div>
                    </div>

                    {essay.feedbackSummary && (
                      <div className="p-3 bg-white rounded-xl border border-slate-200 text-slate-700 leading-relaxed">
                        <strong className="text-slate-900 block mb-0.5">Parecer Formativo da Correção:</strong>
                        <p>{essay.feedbackSummary}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL: SIMULATE NEW ESSAY */}
      {isSimulateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-indigo-600" />
                Simular Nova Redação na Linha Temporal
              </h3>
              <button
                onClick={() => setIsSimulateModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSimulatedEssay} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tema da Redação:</label>
                <input
                  type="text"
                  value={newTheme}
                  onChange={(e) => setNewTheme(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  placeholder="Ex: Impactos da crise climática na segurança alimentar"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Área do Conhecimento Mobilizada:</label>
                <select
                  value={newArea}
                  onChange={(e) => setNewArea(e.target.value as KnowledgeArea)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                >
                  <option value="Linguagens, Códigos e suas Tecnologias">📘 Linguagens, Códigos e suas Tecnologias</option>
                  <option value="Ciências Humanas e suas Tecnologias">📙 Ciências Humanas e suas Tecnologias</option>
                  <option value="Ciências da Natureza e suas Tecnologias">📗 Ciências da Natureza e suas Tecnologias</option>
                  <option value="Matemática e suas Tecnologias">📐 Matemática e suas Tecnologias</option>
                </select>
              </div>

              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">Pontuação nas 5 Competências:</span>
                  <span className="font-mono font-black text-indigo-700 text-sm">
                    Total: {newC1 + newC2 + newC3 + newC4 + newC5} / 1000 pts
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {[
                    { label: 'C1', val: newC1, set: setNewC1 },
                    { label: 'C2', val: newC2, set: setNewC2 },
                    { label: 'C3', val: newC3, set: setNewC3 },
                    { label: 'C4', val: newC4, set: setNewC4 },
                    { label: 'C5', val: newC5, set: setNewC5 },
                  ].map((item) => (
                    <div key={item.label} className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-600 block text-center">
                        {item.label}
                      </label>
                      <select
                        value={item.val}
                        onChange={(e) => item.set(Number(e.target.value))}
                        className="w-full p-2 rounded-xl border border-slate-300 font-mono font-bold text-center text-xs"
                      >
                        <option value={0}>0</option>
                        <option value={40}>40</option>
                        <option value={80}>80</option>
                        <option value={120}>120</option>
                        <option value={160}>160</option>
                        <option value={180}>180</option>
                        <option value={200}>200</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSimulateModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-2xs"
                >
                  Registrar e Atualizar Recharts
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
