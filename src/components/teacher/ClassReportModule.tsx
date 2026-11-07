import React, { useState, useMemo } from 'react';
import {
  ClassGroup,
  ClassTopicDiagnostic,
  GradeLevel,
  KnowledgeArea,
  Question,
  ReinforcementListRecord
} from '../../types';
import { getClassDiagnostics, getClassDiagnosticSummary } from '../../data/classPerformanceData';
import { generateQuestionAPI } from '../../services/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell
} from 'recharts';
import {
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  Sparkles,
  BarChart3,
  Search,
  Filter,
  Users,
  Brain,
  Printer,
  Eye,
  PlusCircle,
  HelpCircle,
  Clock,
  ArrowRight,
  TrendingDown,
  Layers,
  FileText,
  Share2,
  Check
} from 'lucide-react';

interface ClassReportModuleProps {
  activeGroup: ClassGroup;
  allClassGroups: ClassGroup[];
  onSelectClass: (classId: string) => void;
  onAssignReinforcementList: (listData: {
    title: string;
    grade: GradeLevel;
    count: number;
    topic: string;
    area: KnowledgeArea;
  }) => void;
  createdLists: { id: string; title: string; grade: GradeLevel; count: number; date: string }[];
}

export const ClassReportModule: React.FC<ClassReportModuleProps> = ({
  activeGroup,
  allClassGroups,
  onSelectClass,
  onAssignReinforcementList,
  createdLists
}) => {
  const [selectedAreaFilter, setSelectedAreaFilter] = useState<string>('todas');
  const [selectedSeverityFilter, setSelectedSeverityFilter] = useState<'todos' | 'critico' | 'atencao' | 'consolidado'>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(null);

  // Modal de Pré-visualização do Roteiro / Questões da Lista
  const [previewDiagnostic, setPreviewDiagnostic] = useState<ClassTopicDiagnostic | null>(null);
  
  // Modal de Personalização antes de atribuir
  const [assigningDiagnostic, setAssigningDiagnostic] = useState<ClassTopicDiagnostic | null>(null);
  const [customQuestionCount, setCustomQuestionCount] = useState<number>(8);
  const [customIncludeTEA, setCustomIncludeTEA] = useState<boolean>(true);
  const [customIncludeTDAH, setCustomIncludeTDAH] = useState<boolean>(true);
  const [customIncludeDyslexia, setCustomIncludeDyslexia] = useState<boolean>(true);

  // Estado de geração de questão inédita via IA
  const [isGeneratingAiQuestion, setIsGeneratingAiQuestion] = useState(false);
  const [generatedAiQuestion, setGeneratedAiQuestion] = useState<Partial<Question> | null>(null);
  const [aiQuestionTopic, setAiQuestionTopic] = useState<string | null>(null);

  // Notificação de sucesso de atribuição
  const [assignedSuccessMessage, setAssignedSuccessMessage] = useState<string | null>(null);

  // Diagnósticos da turma selecionada
  const diagnostics = useMemo(() => {
    return getClassDiagnostics(activeGroup.id);
  }, [activeGroup.id]);

  const summary = useMemo(() => {
    return getClassDiagnosticSummary(activeGroup.id);
  }, [activeGroup.id]);

  // Filtragem dos tópicos
  const filteredDiagnostics = useMemo(() => {
    return diagnostics.filter((diag) => {
      // Filtro de área
      if (selectedAreaFilter !== 'todas' && diag.area !== selectedAreaFilter) {
        return false;
      }
      // Filtro de severidade
      if (selectedSeverityFilter !== 'todos' && diag.severity !== selectedSeverityFilter) {
        return false;
      }
      // Busca por texto
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = diag.topic.toLowerCase().includes(query);
        const matchSkill = diag.bnccSkill.toLowerCase().includes(query);
        const matchArea = diag.area.toLowerCase().includes(query);
        if (!matchTitle && !matchSkill && !matchArea) return false;
      }
      return true;
    });
  }, [diagnostics, selectedAreaFilter, selectedSeverityFilter, searchQuery]);

  // Dados formatados para o gráfico Recharts
  const chartData = useMemo(() => {
    return diagnostics.map((d) => ({
      name: d.topic.length > 22 ? d.topic.slice(0, 20) + '...' : d.topic,
      fullName: d.topic,
      taxaAcerto: d.accuracyRate,
      taxaErro: d.errorRate,
      alunosDificuldade: d.strugglingCount,
      totalAlunos: d.totalAssessed,
      severity: d.severity,
      area: d.area
    }));
  }, [diagnostics]);

  // Função para verificar se a lista de reforço para este tópico já foi atribuída
  const isListAlreadyAssigned = (topicTitle: string) => {
    return createdLists.some((item) =>
      item.title.toLowerCase().includes(topicTitle.toLowerCase().slice(0, 15))
    );
  };

  // Atribuir lista direta
  const handleDirectAssign = (diag: ClassTopicDiagnostic) => {
    onAssignReinforcementList({
      title: diag.reinforcementListSuggestion.title,
      grade: diag.gradeLevel,
      count: diag.suggestedQuestionsCount,
      topic: diag.topic,
      area: diag.area
    });
    setAssignedSuccessMessage(`Lista de Reforço sobre "${diag.topic}" atribuída com sucesso à turma ${activeGroup.name}!`);
    setTimeout(() => {
      setAssignedSuccessMessage(null);
    }, 5000);
  };

  // Atribuir com personalização
  const handleConfirmCustomAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningDiagnostic) return;

    onAssignReinforcementList({
      title: `${assigningDiagnostic.reinforcementListSuggestion.title} (${customQuestionCount} questões)`,
      grade: assigningDiagnostic.gradeLevel,
      count: customQuestionCount,
      topic: assigningDiagnostic.topic,
      area: assigningDiagnostic.area
    });

    setAssignedSuccessMessage(
      `Lista personalizada de reforço (${customQuestionCount} questões) atribuída à turma ${activeGroup.name}!`
    );
    setAssigningDiagnostic(null);
    setTimeout(() => {
      setAssignedSuccessMessage(null);
    }, 5000);
  };

  // Gerar questão inédita com IA para o tópico
  const handleGenerateAiQuestion = async (diag: ClassTopicDiagnostic) => {
    setIsGeneratingAiQuestion(true);
    setAiQuestionTopic(diag.topic);
    try {
      const q = await generateQuestionAPI(diag.area, diag.gradeLevel, diag.topic);
      setGeneratedAiQuestion(q);
    } catch (err) {
      console.error('Erro gerando questão:', err);
    } finally {
      setIsGeneratingAiQuestion(false);
    }
  };

  // Impressão / Exportação do Relatório
  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Toast de Sucesso */}
      {assignedSuccessMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500 text-white shadow-lg flex items-center justify-between animate-scaleUp">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span className="text-xs sm:text-sm font-bold">{assignedSuccessMessage}</span>
          </div>
          <button
            onClick={() => setAssignedSuccessMessage(null)}
            className="text-emerald-100 hover:text-white text-xs font-bold px-2 py-1 rounded-lg"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header do Módulo de Relatório */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                Diagnóstico de Dificuldades & Intervenção Pedagógica
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-semibold text-slate-500">
                Dados consolidados dos simulados e exercícios
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <BarChart3 className="w-7 h-7 text-indigo-600" />
              <span>Relatório de Turma: Gargalos & Listas de Reforço</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Identifique com precisão matemática os tópicos em que a <strong>maioria da turma apresenta dificuldades recorrentes</strong>, 
              analise as raízes dos erros conceituais e gere listas de exercícios de reforço calibradas com adaptações neuroinclusivas.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <button
              onClick={handlePrintReport}
              className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 px-3.5 py-2.5 rounded-2xl font-bold text-xs transition shadow-2xs"
              title="Exportar ou Imprimir Relatório Didático da Turma"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Imprimir / PDF</span>
            </button>
          </div>
        </div>

        {/* Seletor Rápido de Turmas no Relatório */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-1">
            Turma Analisada:
          </span>
          {allClassGroups.map((group) => {
            const isSelected = activeGroup.id === group.id;
            return (
              <button
                key={group.id}
                onClick={() => onSelectClass(group.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs whitespace-nowrap transition border ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>{group.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {group.totalStudents} alunos
                </span>
              </button>
            );
          })}
        </div>

        {/* Cards de Métricas e Diagnóstico Geral */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {/* Card 1: Tópicos Críticos (Maioria com Dificuldade) */}
          <div className="p-5 rounded-2xl bg-rose-50/70 border border-rose-200 text-rose-950 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-900 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Dificuldade Crítica
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-rose-200 text-rose-900 font-extrabold">
                Taxa Erro &gt; 50%
              </span>
            </div>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-3xl font-black text-rose-700">{summary.criticalCount}</span>
              <span className="text-xs font-semibold text-rose-800">
                tópicos onde a maioria errou
              </span>
            </div>
            <p className="text-[11px] text-rose-700/90 leading-tight pt-1">
              Exigem intervenção imediata com listas de reforço e revisão em sala.
            </p>
          </div>

          {/* Card 2: Tópicos em Atenção */}
          <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-950 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingDown className="w-4 h-4 text-amber-600" />
                Atenção Pedagógica
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-extrabold">
                50% - 65% acerto
              </span>
            </div>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-3xl font-black text-amber-700">{summary.warningCount}</span>
              <span className="text-xs font-semibold text-amber-800">
                tópicos em desenvolvimento
              </span>
            </div>
            <p className="text-[11px] text-amber-700/90 leading-tight pt-1">
              Conceito parcialmente assimilado, necessitando de fixação pontual.
            </p>
          </div>

          {/* Card 3: Tópicos Consolidados */}
          <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-emerald-950 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Consolidados
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 font-extrabold">
                &gt; 65% acerto
              </span>
            </div>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-3xl font-black text-emerald-700">{summary.consolidatedCount}</span>
              <span className="text-xs font-semibold text-emerald-800">
                tópicos dominados
              </span>
            </div>
            <p className="text-[11px] text-emerald-700/90 leading-tight pt-1">
              Alto índice de retenção, ideais para alavancar a autoestima da turma.
            </p>
          </div>

          {/* Card 4: Maior Gargalo da Turma */}
          <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200 text-indigo-950 space-y-1.5">
            <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider block">
              Maior Gargalo Detectado
            </span>
            {summary.highestDifficultyTopic ? (
              <>
                <div className="font-extrabold text-sm text-indigo-900 truncate">
                  {summary.highestDifficultyTopic.topic}
                </div>
                <div className="flex items-center gap-2 pt-0.5">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                    {summary.highestDifficultyTopic.accuracyRate}% acerto
                  </span>
                  <span className="text-[11px] text-indigo-700">
                    {summary.highestDifficultyTopic.strugglingCount} de {activeGroup.totalStudents} alunos erraram
                  </span>
                </div>
                <button
                  onClick={() => handleDirectAssign(summary.highestDifficultyTopic)}
                  className="w-full mt-2 py-1.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] transition flex items-center justify-center gap-1 shadow-2xs"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Atribuir Reforço Imediato</span>
                </button>
              </>
            ) : (
              <span className="text-xs text-slate-500">Nenhum dado registrado</span>
            )}
          </div>
        </div>
      </div>

      {/* Gráfico Recharts: Comparativo de Acertos por Tópico */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              <span>Desempenho da Turma por Tópico Avaliado</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              A linha tracejada indica a meta mínima pedagógica de 70% de acerto para consolidação da habilidade.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-slate-600 shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-rose-500"></span>
              <span>Crítico (&lt; 50%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-amber-500"></span>
              <span>Atenção (50-65%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-emerald-500"></span>
              <span>Consolidado (&gt; 65%)</span>
            </div>
          </div>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 15, right: 20, left: -10, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="name"
                angle={-25}
                textAnchor="end"
                tick={{ fontSize: 11, fill: '#64748b' }}
                interval={0}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: '#64748b' }}
                unit="%"
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-3.5 rounded-2xl text-xs shadow-xl space-y-1.5 border border-slate-700 max-w-xs">
                        <p className="font-extrabold text-sm">{data.fullName}</p>
                        <p className="text-slate-300 text-[11px]">{data.area}</p>
                        <div className="border-t border-slate-700 pt-1.5 space-y-1">
                          <p className="flex justify-between gap-4">
                            <span>Taxa de Acerto:</span>
                            <span className="font-bold text-emerald-400">{data.taxaAcerto}%</span>
                          </p>
                          <p className="flex justify-between gap-4">
                            <span>Taxa de Erro:</span>
                            <span className="font-bold text-rose-400">{data.taxaErro}%</span>
                          </p>
                          <p className="flex justify-between gap-4">
                            <span>Alunos com Dificuldade:</span>
                            <span className="font-bold text-amber-300">
                              {data.alunosDificuldade} de {data.totalAlunos}
                            </span>
                          </p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine
                y={70}
                stroke="#6366f1"
                strokeDasharray="4 4"
                label={{
                  value: 'Meta de Consolidação (70%)',
                  position: 'insideTopRight',
                  fill: '#6366f1',
                  fontSize: 10,
                  fontWeight: 'bold'
                }}
              />
              <Bar dataKey="taxaAcerto" radius={[8, 8, 0, 0]} name="Taxa de Acerto">
                {chartData.map((entry, index) => {
                  let fillColor = '#10b981'; // emerald
                  if (entry.taxaAcerto < 50) fillColor = '#f43f5e'; // rose
                  else if (entry.taxaAcerto <= 65) fillColor = '#f59e0b'; // amber
                  return <Cell key={`cell-${index}`} fill={fillColor} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Controles de Filtro e Busca */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Filtro por Área do Conhecimento */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <button
            onClick={() => setSelectedAreaFilter('todas')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              selectedAreaFilter === 'todas'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todas as Áreas
          </button>
          <button
            onClick={() => setSelectedAreaFilter('Ciências da Natureza e suas Tecnologias')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              selectedAreaFilter === 'Ciências da Natureza e suas Tecnologias'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            Natureza
          </button>
          <button
            onClick={() => setSelectedAreaFilter('Matemática e suas Tecnologias')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              selectedAreaFilter === 'Matemática e suas Tecnologias'
                ? 'bg-blue-600 text-white'
                : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
            }`}
          >
            Matemática
          </button>
          <button
            onClick={() => setSelectedAreaFilter('Ciências Humanas e suas Tecnologias')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              selectedAreaFilter === 'Ciências Humanas e suas Tecnologias'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            Humanas
          </button>
          <button
            onClick={() => setSelectedAreaFilter('Linguagens, Códigos e suas Tecnologias')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              selectedAreaFilter === 'Linguagens, Códigos e suas Tecnologias'
                ? 'bg-purple-600 text-white'
                : 'bg-purple-50 text-purple-800 hover:bg-purple-100'
            }`}
          >
            Linguagens
          </button>
        </div>

        {/* Filtro por Severidade e Busca */}
        <div className="flex items-center gap-3">
          <select
            value={selectedSeverityFilter}
            onChange={(e) => setSelectedSeverityFilter(e.target.value as any)}
            className="text-xs p-2.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="todos">Todos os Níveis de Severidade</option>
            <option value="critico">🚨 Apenas Dificuldades Críticas (&gt;50% erro)</option>
            <option value="atencao">⚠️ Apenas em Atenção Pedagógica</option>
            <option value="consolidado">✅ Apenas Tópicos Consolidados</option>
          </select>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar tópico ou código BNCC..."
              className="pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-44 sm:w-56"
            />
          </div>
        </div>
      </div>

      {/* Listagem de Diagnósticos dos Tópicos com Proposta de Reforço */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
            <Brain className="w-4 h-4 text-indigo-600" />
            <span>Detalhamento dos Tópicos & Listas de Reforço Sugeridas</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {filteredDiagnostics.length} tópicos encontrados
            </span>
          </h3>

          <span className="text-xs text-slate-500">
            Turma: <strong>{activeGroup.name}</strong> ({activeGroup.grade})
          </span>
        </div>

        {filteredDiagnostics.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
            <HelpCircle className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">Nenhum tópico encontrado com os filtros selecionados.</p>
            <button
              onClick={() => {
                setSelectedAreaFilter('todas');
                setSelectedSeverityFilter('todos');
                setSearchQuery('');
              }}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
            >
              Limpar todos os filtros
            </button>
          </div>
        ) : (
          filteredDiagnostics.map((diag) => {
            const isAssigned = isListAlreadyAssigned(diag.topic);
            const isExpanded = expandedTopicId === diag.id;
            const isCritical = diag.severity === 'critico';
            const isWarning = diag.severity === 'atencao';

            return (
              <div
                key={diag.id}
                className={`bg-white rounded-3xl p-6 border transition-all ${
                  isCritical
                    ? 'border-rose-200/90 shadow-xs hover:border-rose-300'
                    : isWarning
                    ? 'border-amber-200/90 shadow-xs hover:border-amber-300'
                    : 'border-slate-200/90 shadow-xs hover:border-slate-300'
                }`}
              >
                {/* Cabeçalho do Card */}
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {isCritical && (
                        <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Dificuldade Crítica (Maioria com Dificuldade)
                        </span>
                      )}
                      {isWarning && (
                        <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                          <TrendingDown className="w-3.5 h-3.5" />
                          Atenção Pedagógica
                        </span>
                      )}
                      {!isCritical && !isWarning && (
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Conteúdo Consolidado
                        </span>
                      )}

                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                        BNCC {diag.bnccSkill}
                      </span>

                      <span className="text-xs text-slate-500 font-medium">
                        {diag.area}
                      </span>
                    </div>

                    <h4 className="text-lg font-black text-slate-900 tracking-tight">
                      {diag.topic}
                    </h4>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      <strong>Diagnóstico Pedagógico:</strong> {diag.pedagogicalInsight}
                    </p>
                  </div>

                  {/* Indicadores Numéricos */}
                  <div className="flex items-center gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">
                        Taxa de Acerto
                      </span>
                      <span
                        className={`text-2xl font-black ${
                          isCritical
                            ? 'text-rose-600'
                            : isWarning
                            ? 'text-amber-600'
                            : 'text-emerald-600'
                        }`}
                      >
                        {diag.accuracyRate}%
                      </span>
                    </div>

                    <div className="w-px h-8 bg-slate-200"></div>

                    <div className="text-left">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">
                        Alunos com Dificuldade
                      </span>
                      <span className="text-base font-extrabold text-slate-900">
                        {diag.strugglingCount}{' '}
                        <span className="text-xs font-normal text-slate-500">
                          / {diag.totalAssessed} ({diag.errorRate}% da turma)
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Barra de Progresso Visual de Acertos vs Erros */}
                <div className="mt-4 space-y-1">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-emerald-700">
                      Acertos: {diag.accuracyRate}% ({diag.totalAssessed - diag.strugglingCount} alunos)
                    </span>
                    <span className="text-rose-700">
                      Erros recorrentes: {diag.errorRate}% ({diag.strugglingCount} alunos)
                    </span>
                  </div>
                  <div className="w-full bg-rose-200 h-2.5 rounded-full overflow-hidden flex">
                    <div
                      className="bg-emerald-500 h-full rounded-l-full transition-all duration-500"
                      style={{ width: `${diag.accuracyRate}%` }}
                    />
                    <div
                      className="bg-rose-500 h-full rounded-r-full transition-all duration-500"
                      style={{ width: `${diag.errorRate}%` }}
                    />
                  </div>
                </div>

                {/* Seção de Raízes dos Erros (Misconceptions) */}
                <div className="mt-4 p-4 rounded-2xl bg-slate-50/80 border border-slate-200 text-xs space-y-2">
                  <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span>Equívocos Conceituais mais Frequentes na Turma:</span>
                  </span>
                  <ul className="space-y-1.5 pl-5 list-disc text-slate-700 leading-relaxed">
                    {diag.mainMisconceptions.map((item, idx) => (
                      <li key={idx} className="marker:text-amber-500">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Seção de Sugestão de Lista de Reforço Integrada */}
                <div className="mt-4 p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200/90 text-xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-indigo-200 text-indigo-900 font-extrabold text-[10px] uppercase tracking-wider">
                          Sugestão de Intervenção Pedagógica
                        </span>
                        <span className="font-bold text-indigo-950 text-sm">
                          {diag.reinforcementListSuggestion.title}
                        </span>
                      </div>
                      <p className="text-indigo-800 text-xs mt-1">
                        {diag.reinforcementListSuggestion.focusDescription}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                      <span className="px-2.5 py-1 rounded-xl bg-white border border-indigo-200 font-bold text-indigo-900 text-xs shadow-2xs">
                        {diag.suggestedQuestionsCount} questões sugeridas
                      </span>
                    </div>
                  </div>

                  {/* Proporção e Adaptações Neuroinclusivas */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 border-t border-indigo-100 text-[11px]">
                    <div>
                      <span className="font-bold text-indigo-950 block mb-0.5">
                        📐 Proporção Curricular Calibrada:
                      </span>
                      <p className="text-indigo-800">
                        {diag.reinforcementListSuggestion.proportionNote}
                      </p>
                    </div>

                    <div>
                      <span className="font-bold text-indigo-950 block mb-0.5">
                        🧠 Recursos Neuroinclusivos Inclusos:
                      </span>
                      <ul className="list-disc pl-4 text-indigo-800 space-y-0.5">
                        {diag.reinforcementListSuggestion.neuroinclusiveAdaptations.map((adapt, i) => (
                          <li key={i}>{adapt}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Ações: Atribuir Lista, Visualizar Roteiro, Gerar com IA */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-indigo-100">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPreviewDiagnostic(diag)}
                        className="px-3.5 py-2 rounded-xl bg-white hover:bg-indigo-100/60 text-indigo-800 border border-indigo-200 font-bold text-xs transition flex items-center gap-1.5 shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver Roteiro / Questões</span>
                      </button>

                      <button
                        onClick={() => handleGenerateAiQuestion(diag)}
                        disabled={isGeneratingAiQuestion}
                        className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 font-bold text-xs transition flex items-center gap-1.5 shadow-2xs"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                        <span>Gerar Questão Inédita com IA</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      {isAssigned ? (
                        <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-300">
                          <Check className="w-4 h-4" />
                          <span>Lista Já Atribuída à Turma</span>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setAssigningDiagnostic(diag);
                              setCustomQuestionCount(diag.suggestedQuestionsCount);
                            }}
                            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs transition"
                          >
                            Personalizar
                          </button>

                          <button
                            onClick={() => handleDirectAssign(diag)}
                            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs transition flex items-center gap-1.5 shadow-md"
                          >
                            <PlusCircle className="w-4 h-4" />
                            <span>Atribuir Lista à Turma</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Exibição de Questão Inédita Gerada por IA se requisitada */}
                {aiQuestionTopic === diag.topic && generatedAiQuestion && (
                  <div className="mt-4 p-5 rounded-2xl bg-purple-50 border border-purple-200 text-xs space-y-3 animate-scaleUp">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-purple-900 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        <span>Questão Inédita Gerada pelo Assistente IA (Formato ENEM):</span>
                      </span>
                      <button
                        onClick={() => setGeneratedAiQuestion(null)}
                        className="text-purple-600 hover:text-purple-900 font-bold"
                      >
                        Fechar ✕
                      </button>
                    </div>

                    <p className="font-semibold text-slate-800 leading-relaxed">
                      {generatedAiQuestion.title}
                    </p>

                    {generatedAiQuestion.options && (
                      <div className="space-y-1.5 pl-2">
                        {generatedAiQuestion.options.map((opt, oIdx) => (
                          <div
                            key={oIdx}
                            className={`p-2 rounded-xl border text-[11px] ${
                              oIdx === generatedAiQuestion.correctAnswer
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                                : 'bg-white border-slate-200 text-slate-700'
                            }`}
                          >
                            <span className="font-bold mr-1.5">{String.fromCharCode(65 + oIdx)})</span>
                            {opt}
                            {oIdx === generatedAiQuestion.correctAnswer && (
                              <span className="ml-2 text-emerald-600 font-extrabold">(Gabarito)</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {generatedAiQuestion.simplifiedTEA && (
                      <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-teal-900 text-[11px]">
                        <strong>Adaptação TEA em Linguagem Direta:</strong> {generatedAiQuestion.simplifiedTEA}
                      </div>
                    )}

                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => {
                          handleDirectAssign(diag);
                          setGeneratedAiQuestion(null);
                        }}
                        className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs"
                      >
                        Incluir Esta Questão na Lista e Atribuir
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* MODAL: Pré-visualização do Roteiro / Questões da Lista */}
      {previewDiagnostic && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block">
                  Roteiro Pedagógico de Reforço
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  {previewDiagnostic.reinforcementListSuggestion.title}
                </h3>
              </div>
              <button
                onClick={() => setPreviewDiagnostic(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-950 space-y-1">
                <span className="font-bold block">🎯 Objetivo Didático da Lista:</span>
                <p className="leading-relaxed">
                  Superar a taxa de erro de {previewDiagnostic.errorRate}% registrada na turma{' '}
                  {activeGroup.name}, com mediação nos equívocos de{' '}
                  {previewDiagnostic.mainMisconceptions[0]}.
                </p>
              </div>

              {/* Estrutura Pedagógica Passo a Passo */}
              <div className="space-y-3">
                <span className="font-extrabold text-slate-900 block text-sm">
                  Estrutura Sequencial das Questões:
                </span>

                <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 space-y-1">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span>Etapa 1: Questões de Fixação Direta (70%)</span>
                    <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded-full">
                      Carga Cognitiva Controlada
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Exercícios com dados explícitos e sem armadilhas textuais. Foco na absorção dos princípios básicos de {previewDiagnostic.topic}.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 space-y-1">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span>Etapa 2: Contextualização do Cotidiano (20%)</span>
                    <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded-full">
                      Aplicação Prática
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Problemas envolvendo situações reais brasileiras (economia, saúde pública, meio ambiente) para criar conexão significativa.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 space-y-1">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span>Etapa 3: Padrão ENEM Integrado (10%)</span>
                    <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded-full">
                      Habilidade BNCC {previewDiagnostic.bnccSkill}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Questão no rigor clássico da matriz de referência do ENEM para consolidar a segurança do estudante no exame.
                  </p>
                </div>
              </div>

              {/* Adaptações Inclusivas */}
              <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-teal-950 space-y-2">
                <span className="font-extrabold block text-teal-900">
                  ✨ Adaptações de Acessibilidade Pré-Configuradas:
                </span>
                <ul className="list-disc pl-5 space-y-1 text-teal-900 text-[11px]">
                  {previewDiagnostic.reinforcementListSuggestion.neuroinclusiveAdaptations.map(
                    (ad, idx) => (
                      <li key={idx}>{ad}</li>
                    )
                  )}
                </ul>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPreviewDiagnostic(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-xs"
              >
                Voltar
              </button>

              <button
                type="button"
                onClick={() => {
                  handleDirectAssign(previewDiagnostic);
                  setPreviewDiagnostic(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Atribuir Esta Lista Agora</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Personalização de Lista de Reforço */}
      {assigningDiagnostic && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block">
                  Personalizar Intervenção
                </span>
                <h3 className="text-base font-black text-slate-900">
                  Ajustar Parâmetros da Lista de Reforço
                </h3>
              </div>
              <button
                onClick={() => setAssigningDiagnostic(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmCustomAssign} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tópico Focado:
                </label>
                <input
                  type="text"
                  disabled
                  value={assigningDiagnostic.topic}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Quantidade de Questões na Lista:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[5, 8, 10, 15].map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setCustomQuestionCount(cnt)}
                      className={`py-2 rounded-xl border font-bold text-xs transition ${
                        customQuestionCount === cnt
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {cnt} questões
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Recomendado para esta turma: <strong>8 a 10 questões</strong> (permite pausas ativas a cada 20 minutos).
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="font-bold text-slate-800 block">
                  Adaptações Metodológicas Ativas nesta Lista:
                </span>

                <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={customIncludeTEA}
                    onChange={(e) => setCustomIncludeTEA(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  />
                  <div>
                    <span className="font-bold text-slate-800 block">Linguagem Direta para TEA</span>
                    <span className="text-[10px] text-slate-500">Enunciados objetivos e sem metáforas ambíguas.</span>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={customIncludeTDAH}
                    onChange={(e) => setCustomIncludeTDAH(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  />
                  <div>
                    <span className="font-bold text-slate-800 block">Modo Fracionado para TDAH</span>
                    <span className="text-[10px] text-slate-500">Divisão em blocos curtos com pausas programadas.</span>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={customIncludeDyslexia}
                    onChange={(e) => setCustomIncludeDyslexia(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  />
                  <div>
                    <span className="font-bold text-slate-800 block">Acolhimento à Dislexia & Áudio</span>
                    <span className="text-[10px] text-slate-500">Espaçamento aumentado e botão de narração por voz.</span>
                  </div>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAssigningDiagnostic(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md flex items-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Publicar e Atribuir à Turma</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
