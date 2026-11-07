import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { KnowledgeArea } from '../../types';
import { EssayCompetenciesEvolutionModule } from './EssayCompetenciesEvolutionModule';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
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
  BookOpen,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Calendar,
  CheckCircle2,
  Filter,
  BarChart2,
  Activity,
  Maximize2,
} from 'lucide-react';

interface AreaConfig {
  key: string;
  name: KnowledgeArea;
  shortLabel: 'LC' | 'CH' | 'CN' | 'MT';
  color: string;
  lightBg: string;
  borderColor: string;
  textColor: string;
  icon: string;
  description: string;
}

const AREAS: AreaConfig[] = [
  {
    key: 'LC',
    name: 'Linguagens, Códigos e suas Tecnologias',
    shortLabel: 'LC',
    color: '#3b82f6', // blue-500
    lightBg: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700',
    icon: '📘',
    description: 'Interpretação de texto, literatura, artes e língua estrangeira',
  },
  {
    key: 'CH',
    name: 'Ciências Humanas e suas Tecnologias',
    shortLabel: 'CH',
    color: '#f59e0b', // amber-500
    lightBg: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-700',
    icon: '📙',
    description: 'História, geografia, filosofia e sociologia crítica',
  },
  {
    key: 'CN',
    name: 'Ciências da Natureza e suas Tecnologias',
    shortLabel: 'CN',
    color: '#10b981', // emerald-500
    lightBg: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-700',
    icon: '📗',
    description: 'Física, química e biologia aplicadas ao cotidiano',
  },
  {
    key: 'MT',
    name: 'Matemática e suas Tecnologias',
    shortLabel: 'MT',
    color: '#8b5cf6', // purple-500
    lightBg: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-700',
    icon: '📐',
    description: 'Cálculo, estatística, geometria e funções analíticas',
  },
];

type VisualChartType = 'line' | 'area' | 'bar';
type ScoreType = 'scoreTRI' | 'percentage';

interface StudentEvolutionChartPanelProps {
  onGoToFullSimulation?: () => void;
}

export const StudentEvolutionChartPanel: React.FC<StudentEvolutionChartPanelProps> = ({
  onGoToFullSimulation,
}) => {
  const { simulationHistory } = useApp();

  const [datasetScope, setDatasetScope] = useState<'competencias' | 'areas'>('competencias');
  const [visualType, setVisualType] = useState<VisualChartType>('line');
  const [metricMode, setMetricMode] = useState<ScoreType>('scoreTRI');
  const [activeAreas, setActiveAreas] = useState<Record<string, boolean>>({
    LC: true,
    CH: true,
    CN: true,
    MT: true,
  });

  // Sort chronological (oldest to newest)
  const sortedHistory = useMemo(() => {
    return [...simulationHistory].sort((a, b) => a.timestamp - b.timestamp);
  }, [simulationHistory]);

  // Transform data for Recharts
  const chartData = useMemo(() => {
    return sortedHistory.map((sim, index) => {
      const lc = sim.byArea.find((a) => a.shortLabel === 'LC');
      const ch = sim.byArea.find((a) => a.shortLabel === 'CH');
      const cn = sim.byArea.find((a) => a.shortLabel === 'CN');
      const mt = sim.byArea.find((a) => a.shortLabel === 'MT');

      return {
        id: sim.id,
        name: sim.displayDate || `Sim #${index + 1}`,
        title: sim.title,
        date: sim.date,
        overallScoreTRI: sim.overallScoreTRI,
        essayScore: sim.essayScore || 0,
        // Scores TRI
        LC: lc?.scoreTRI || 0,
        CH: ch?.scoreTRI || 0,
        CN: cn?.scoreTRI || 0,
        MT: mt?.scoreTRI || 0,
        // Percentages
        LC_pct: lc?.percentage || 0,
        CH_pct: ch?.percentage || 0,
        CN_pct: cn?.percentage || 0,
        MT_pct: mt?.percentage || 0,
        // Overall
        overallPercent: Math.round((sim.totalCorrect / (sim.totalQuestions || 1)) * 100),
      };
    });
  }, [sortedHistory]);

  const toggleArea = (key: string) => {
    setActiveAreas((prev) => {
      const activeCount = Object.values(prev).filter(Boolean).length;
      // Prevent disabling all
      if (prev[key] && activeCount <= 1) return prev;
      return { ...prev, [key]: !prev[key] };
    });
  };

  const selectAllAreas = () => {
    setActiveAreas({ LC: true, CH: true, CN: true, MT: true });
  };

  // First and latest for delta calculations
  const firstSim = sortedHistory[0];
  const latestSim = sortedHistory[sortedHistory.length - 1];

  const areaSummaries = useMemo(() => {
    if (!firstSim || !latestSim) return [];

    return AREAS.map((area) => {
      const firstArea = firstSim.byArea.find((a) => a.shortLabel === area.shortLabel);
      const latestArea = latestSim.byArea.find((a) => a.shortLabel === area.shortLabel);

      const scoreFirst = firstArea?.scoreTRI || 0;
      const scoreLatest = latestArea?.scoreTRI || 0;
      const scoreDelta = scoreLatest - scoreFirst;

      const pctFirst = firstArea?.percentage || 0;
      const pctLatest = latestArea?.percentage || 0;
      const pctDelta = pctLatest - pctFirst;

      return {
        ...area,
        scoreFirst,
        scoreLatest,
        scoreDelta,
        pctFirst,
        pctLatest,
        pctDelta,
      };
    });
  }, [firstSim, latestSim]);

  // Best improved area
  const highestGainArea = useMemo(() => {
    if (areaSummaries.length === 0) return null;
    return [...areaSummaries].sort((a, b) => b.scoreDelta - a.scoreDelta)[0];
  }, [areaSummaries]);

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const itemData = payload[0]?.payload;
      return (
        <div className="bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-xl border border-slate-700 text-xs min-w-[240px]">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
            <span className="font-bold text-slate-200">{itemData?.title || label}</span>
            <span className="text-[10px] text-indigo-400 font-mono">{label}</span>
          </div>

          <div className="space-y-1.5">
            {payload.map((entry: any) => {
              const areaCfg = AREAS.find(
                (a) => a.shortLabel === entry.dataKey || `${a.shortLabel}_pct` === entry.dataKey
              );
              if (!areaCfg) return null;

              const isPct = metricMode === 'percentage';
              const displayVal = isPct ? `${entry.value}%` : `${entry.value} pts`;

              return (
                <div key={entry.dataKey} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-slate-300 font-medium">
                      {areaCfg.icon} {areaCfg.shortLabel}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-white">{displayVal}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>Média TRI Geral:</span>
            <span className="font-bold text-emerald-400 font-mono">
              {itemData?.overallScoreTRI} pts
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Switcher entre 5 Competências e Áreas do Conhecimento */}
      <div className="bg-slate-100/90 p-1.5 rounded-2xl flex flex-wrap items-center justify-between gap-2 border border-slate-200">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setDatasetScope('competencias')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition ${
              datasetScope === 'competencias'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Award className="w-4 h-4 text-amber-300" />
            <span>5 Competências do ENEM (Redação)</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-black ${
                datasetScope === 'competencias' ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 text-slate-700'
              }`}
            >
              Recharts
            </span>
          </button>

          <button
            onClick={() => setDatasetScope('areas')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition ${
              datasetScope === 'areas'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Activity className="w-4 h-4 text-emerald-300" />
            <span>4 Áreas do Conhecimento (TRI)</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-black ${
                datasetScope === 'areas' ? 'bg-emerald-400 text-slate-950' : 'bg-slate-200 text-slate-700'
              }`}
            >
              LC • CH • CN • MT
            </span>
          </button>
        </div>

        {onGoToFullSimulation && (
          <button
            onClick={onGoToFullSimulation}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-indigo-700 hover:underline mr-1"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Ver Painel Completo</span>
          </button>
        )}
      </div>

      {datasetScope === 'competencias' ? (
        <EssayCompetenciesEvolutionModule />
      ) : (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-6">
          {/* Header with Title & Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-indigo-600" />
                  Painel de Visualização de Dados Recharts
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Evolução Temporal por Área
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                Evolução por Área do Conhecimento
                <span className="text-xs font-normal text-slate-500 hidden sm:inline">
                  (Linguagens, Humanas, Natureza, Matemática)
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Compare o histórico de pontuações acumuladas e visualize seu progresso contínuo em cada eixo do ENEM.
              </p>
            </div>

            {/* Action Controls Toolbar */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Chart visual type toggle */}
              <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
                <button
                  onClick={() => setVisualType('line')}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-bold transition ${
                    visualType === 'line'
                      ? 'bg-white text-indigo-600 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Gráfico de Linhas"
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Linhas</span>
                </button>
                <button
                  onClick={() => setVisualType('area')}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-bold transition ${
                    visualType === 'area'
                      ? 'bg-white text-indigo-600 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Gráfico de Áreas Preenchidas"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Áreas</span>
                </button>
                <button
                  onClick={() => setVisualType('bar')}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-bold transition ${
                    visualType === 'bar'
                      ? 'bg-white text-indigo-600 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Gráfico de Barras Agrupadas"
                >
                  <BarChart2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Barras</span>
                </button>
              </div>

              {/* Metric toggle: TRI vs Percentage */}
              <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
                <button
                  onClick={() => setMetricMode('scoreTRI')}
                  className={`px-2.5 py-1.5 rounded-lg font-bold transition ${
                    metricMode === 'scoreTRI'
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Escala Oficial Teoria de Resposta ao Item (0 a 1000)"
                >
                  Nota TRI (0-1000)
                </button>
                <button
                  onClick={() => setMetricMode('percentage')}
                  className={`px-2.5 py-1.5 rounded-lg font-bold transition ${
                    metricMode === 'percentage'
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Aproveitamento em porcentagem de acertos"
                >
                  % Acertos
                </button>
              </div>

              {onGoToFullSimulation && (
                <button
                  onClick={onGoToFullSimulation}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl border border-indigo-200 text-xs transition"
                  title="Ver painel completo de simulados e histórico"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Ver Completo</span>
                </button>
              )}
            </div>
          </div>

      {/* Filter Pills for Knowledge Areas */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1 pl-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            Exibir Áreas:
          </span>
          {AREAS.map((area) => {
            const isActive = activeAreas[area.shortLabel];
            return (
              <button
                key={area.shortLabel}
                onClick={() => toggleArea(area.shortLabel)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                  isActive
                    ? `${area.lightBg} ${area.textColor} ${area.borderColor} shadow-2xs`
                    : 'bg-white text-slate-400 border-slate-200 opacity-60 hover:opacity-100'
                }`}
              >
                <span>{area.icon}</span>
                <span>{area.shortLabel}</span>
                <span className="hidden sm:inline text-[11px] font-normal">
                  ({area.shortLabel === 'LC' ? 'Linguagens' : area.shortLabel === 'CH' ? 'Humanas' : area.shortLabel === 'CN' ? 'Natureza' : 'Matemática'})
                </span>
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: isActive ? area.color : '#94a3b8' }}
                />
              </button>
            );
          })}
        </div>

        <button
          onClick={selectAllAreas}
          className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 underline pr-1"
        >
          Selecionar Todas
        </button>
      </div>

      {/* Recharts Canvas */}
      <div className="h-72 sm:h-80 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {visualType === 'line' ? (
            <LineChart data={chartData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
              <defs>
                {AREAS.map((a) => (
                  <linearGradient key={a.shortLabel} id={`lineGrad_${a.shortLabel}`} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={a.color} stopOpacity={0.8} />
                    <stop offset="100%" stopColor={a.color} stopOpacity={1} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
                tickLine={false}
                axisLine={{ stroke: '#cbd5e1' }}
              />
              <YAxis
                domain={metricMode === 'scoreTRI' ? [450, 950] : [0, 100]}
                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
                tickLine={false}
                axisLine={false}
                unit={metricMode === 'scoreTRI' ? '' : '%'}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                formatter={(value) => {
                  const labelMap: Record<string, string> = {
                    LC: 'Linguagens (LC)',
                    CH: 'Humanas (CH)',
                    CN: 'Natureza (CN)',
                    MT: 'Matemática (MT)',
                    LC_pct: 'Linguagens (LC)',
                    CH_pct: 'Humanas (CH)',
                    CN_pct: 'Natureza (CN)',
                    MT_pct: 'Matemática (MT)',
                  };
                  return <span className="font-semibold text-slate-700">{labelMap[value] || value}</span>;
                }}
              />
              {metricMode === 'scoreTRI' && (
                <ReferenceLine
                  y={700}
                  stroke="#cbd5e1"
                  strokeDasharray="4 4"
                  label={{ value: 'Meta TRI 700+', fill: '#94a3b8', fontSize: 10, position: 'insideTopRight' }}
                />
              )}

              {AREAS.map((a) => {
                if (!activeAreas[a.shortLabel]) return null;
                const dataKey = metricMode === 'scoreTRI' ? a.shortLabel : `${a.shortLabel}_pct`;
                return (
                  <Line
                    key={a.shortLabel}
                    type="monotone"
                    dataKey={dataKey}
                    name={dataKey}
                    stroke={a.color}
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2, fill: '#ffffff', stroke: a.color }}
                    activeDot={{ r: 6, stroke: '#ffffff', strokeWidth: 2, fill: a.color }}
                    animationDuration={900}
                  />
                );
              })}
            </LineChart>
          ) : visualType === 'area' ? (
            <AreaChart data={chartData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
              <defs>
                {AREAS.map((a) => (
                  <linearGradient key={a.shortLabel} id={`fillArea_${a.shortLabel}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={a.color} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={a.color} stopOpacity={0.02} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
                tickLine={false}
                axisLine={{ stroke: '#cbd5e1' }}
              />
              <YAxis
                domain={metricMode === 'scoreTRI' ? [450, 950] : [0, 100]}
                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
                tickLine={false}
                axisLine={false}
                unit={metricMode === 'scoreTRI' ? '' : '%'}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                formatter={(value) => {
                  const labelMap: Record<string, string> = {
                    LC: 'Linguagens (LC)',
                    CH: 'Humanas (CH)',
                    CN: 'Natureza (CN)',
                    MT: 'Matemática (MT)',
                    LC_pct: 'Linguagens (LC)',
                    CH_pct: 'Humanas (CH)',
                    CN_pct: 'Natureza (CN)',
                    MT_pct: 'Matemática (MT)',
                  };
                  return <span className="font-semibold text-slate-700">{labelMap[value] || value}</span>;
                }}
              />
              {AREAS.map((a) => {
                if (!activeAreas[a.shortLabel]) return null;
                const dataKey = metricMode === 'scoreTRI' ? a.shortLabel : `${a.shortLabel}_pct`;
                return (
                  <Area
                    key={a.shortLabel}
                    type="monotone"
                    dataKey={dataKey}
                    name={dataKey}
                    stroke={a.color}
                    fillOpacity={1}
                    fill={`url(#fillArea_${a.shortLabel})`}
                    strokeWidth={2.5}
                    animationDuration={900}
                  />
                );
              })}
            </AreaChart>
          ) : (
            <BarChart data={chartData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
                tickLine={false}
                axisLine={{ stroke: '#cbd5e1' }}
              />
              <YAxis
                domain={metricMode === 'scoreTRI' ? [0, 1000] : [0, 100]}
                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
                tickLine={false}
                axisLine={false}
                unit={metricMode === 'scoreTRI' ? '' : '%'}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                formatter={(value) => {
                  const labelMap: Record<string, string> = {
                    LC: 'Linguagens (LC)',
                    CH: 'Humanas (CH)',
                    CN: 'Natureza (CN)',
                    MT: 'Matemática (MT)',
                    LC_pct: 'Linguagens (LC)',
                    CH_pct: 'Humanas (CH)',
                    CN_pct: 'Natureza (CN)',
                    MT_pct: 'Matemática (MT)',
                  };
                  return <span className="font-semibold text-slate-700">{labelMap[value] || value}</span>;
                }}
              />
              {AREAS.map((a) => {
                if (!activeAreas[a.shortLabel]) return null;
                const dataKey = metricMode === 'scoreTRI' ? a.shortLabel : `${a.shortLabel}_pct`;
                return (
                  <Bar
                    key={a.shortLabel}
                    dataKey={dataKey}
                    name={dataKey}
                    fill={a.color}
                    radius={[6, 6, 0, 0]}
                    animationDuration={900}
                  />
                );
              })}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Comparative Cards for Knowledge Areas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
        {areaSummaries.map((area) => {
          const isPositive = area.scoreDelta >= 0;
          return (
            <div
              key={area.shortLabel}
              className={`p-4 rounded-2xl border transition ${
                activeAreas[area.shortLabel]
                  ? `${area.lightBg} ${area.borderColor}`
                  : 'bg-slate-50/50 border-slate-200 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-base">{area.icon}</span>
                  <span className={`text-xs font-extrabold ${area.textColor}`}>
                    {area.shortLabel}
                  </span>
                </div>
                <div
                  className={`flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full ${
                    isPositive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {isPositive ? (
                    <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <ArrowDownRight className="w-3.5 h-3.5 text-rose-600" />
                  )}
                  <span>
                    {isPositive ? '+' : ''}
                    {metricMode === 'scoreTRI' ? `${area.scoreDelta} pts` : `${area.pctDelta}%`}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-slate-700 block truncate" title={area.name}>
                  {area.shortLabel === 'LC' ? 'Linguagens e Códigos' : area.shortLabel === 'CH' ? 'Ciências Humanas' : area.shortLabel === 'CN' ? 'Ciências da Natureza' : 'Matemática'}
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-xl font-extrabold text-slate-900 font-mono">
                    {metricMode === 'scoreTRI' ? `${area.scoreLatest} pts` : `${area.pctLatest}%`}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Inicial: {metricMode === 'scoreTRI' ? `${area.scoreFirst} pts` : `${area.pctFirst}%`}
                  </span>
                </div>
              </div>

              {/* Progress visual bar */}
              <div className="mt-2.5 h-1.5 w-full bg-slate-200/80 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    backgroundColor: area.color,
                    width: `${Math.min(100, Math.max(10, (area.scoreLatest / 1000) * 100))}%`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytical Callout Summary */}
      {highestGainArea && (
        <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="font-extrabold text-indigo-950">
                Maior salto de aprendizado em {highestGainArea.name}!
              </p>
              <p className="text-indigo-800 text-[11px] mt-0.5">
                Você conquistou um ganho de <strong>+{highestGainArea.scoreDelta} pontos TRI</strong> ({highestGainArea.scoreFirst} → {highestGainArea.scoreLatest}) desde o primeiro simulado.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <span className="text-[11px] font-semibold text-slate-500">
              Total de simulados analisados: <strong>{sortedHistory.length}</strong>
            </span>
          </div>
        </div>
      )}
        </div>
      )}
    </div>
  );
};
