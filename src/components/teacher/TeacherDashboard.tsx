import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ClassGroup, GradeLevel, KnowledgeArea } from '../../types';
import { ClassReportModule } from './ClassReportModule';
import { TeacherRelationshipsModule } from './TeacherRelationshipsModule';
import { getClassDiagnosticSummary } from '../../data/classPerformanceData';
import {
  Users,
  ShieldCheck,
  PlusCircle,
  BarChart3,
  BookOpen,
  FileText,
  Sparkles,
  CheckCircle2,
  Clock,
  Layers,
  HelpCircle,
  Brain,
  Volume2,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  UserPlus
} from 'lucide-react';

export const TeacherDashboard: React.FC = () => {
  const { classGroups, questions, startOnboarding, relationships, currentUser } = useApp();
  const [selectedClassId, setSelectedClassId] = useState<string>(classGroups[0].id);
  const [teacherTab, setTeacherTab] = useState<'relatorio' | 'geral' | 'listas' | 'vinculos'>('relatorio');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [newListGrade, setNewListGrade] = useState<GradeLevel>('1º ano');
  const [createdLists, setCreatedLists] = useState<
    { id: string; title: string; grade: GradeLevel; count: number; date: string }[]
  >([
    {
      id: 'l-1',
      title: 'Lista 1 - Termodinâmica e Le Chatelier (Proporção 70/20/10)',
      grade: '2º ano',
      count: 10,
      date: 'Hoje',
    },
    {
      id: 'l-2',
      title: 'Simulado Diagnóstico - Cinética e Cidadania Grega (Proporção 80/20)',
      grade: '1º ano',
      count: 15,
      date: 'Ontem',
    },
  ]);

  const activeGroup = classGroups.find((c) => c.id === selectedClassId) || classGroups[0];
  const diagnosticSummary = getClassDiagnosticSummary(activeGroup.id);

  const handleCreateList = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;

    setCreatedLists([
      {
        id: `list-${Date.now()}`,
        title: newListTitle,
        grade: newListGrade,
        count: 12,
        date: 'Agora mesmo',
      },
      ...createdLists,
    ]);
    setNewListTitle('');
    setShowCreateModal(false);
  };

  const handleAssignReinforcementList = (listData: {
    title: string;
    grade: GradeLevel;
    count: number;
    topic: string;
    area: KnowledgeArea;
  }) => {
    setCreatedLists([
      {
        id: `reinforce-${Date.now()}`,
        title: listData.title,
        grade: listData.grade,
        count: listData.count,
        date: 'Agora mesmo (Reforço)',
      },
      ...createdLists,
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Teacher Top Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                Nível 2 • Professor & Educador
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                Co-Piloto Pedagógico
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Gestão de Turmas e Aprendizagem Adaptativa
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Identifique tópicos críticos de dificuldade da turma, crie listas com a proporção oficial e oriente com IA.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={startOnboarding}
              className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 px-3.5 py-2.5 rounded-2xl font-bold text-xs transition shadow-2xs"
              title="Abrir o tour explicativo do Professor"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Tour do Professor</span>
            </button>

            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-2xl font-bold text-xs shadow-md transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Criar Nova Lista / Simulado</span>
            </button>
          </div>
        </div>

        {/* Confidentiality Commitment Banner for Teachers */}
        <div className="mt-4 p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs text-emerald-950 leading-relaxed">
            <span className="font-bold text-emerald-900 block mb-0.5">
              Garantia Ética de Privacidade (Princípios 3 e 5):
            </span>
            Para proteger a integridade emocional dos estudantes, o painel do professor exibe apenas 
            <strong> necessidades de suporte metodológico</strong> (ex: tempo estendido, mediação em áudio), 
            <strong> sem nunca expor laudos médicos, prontuários ou diagnósticos clínicos individuais</strong>.
          </div>
        </div>
      </div>

      {/* Navegação de Abas do Professor */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setTeacherTab('relatorio')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-xs whitespace-nowrap transition border ${
            teacherTab === 'relatorio'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Relatório de Turma & Dificuldades</span>
          {diagnosticSummary.criticalCount > 0 && (
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
              teacherTab === 'relatorio'
                ? 'bg-rose-500 text-white'
                : 'bg-rose-100 text-rose-800'
            }`}>
              {diagnosticSummary.criticalCount} críticos
            </span>
          )}
        </button>

        <button
          onClick={() => setTeacherTab('geral')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-xs whitespace-nowrap transition border ${
            teacherTab === 'geral'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Visão Geral & Adaptações da Turma</span>
        </button>

        <button
          onClick={() => setTeacherTab('listas')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-xs whitespace-nowrap transition border ${
            teacherTab === 'listas'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Listas Atribuídas à Turma</span>
          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
            teacherTab === 'listas' ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            {createdLists.length}
          </span>
        </button>

        <button
          onClick={() => setTeacherTab('vinculos')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-xs whitespace-nowrap transition border ${
            teacherTab === 'vinculos'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Vínculos & Alunos Monitorados</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            teacherTab === 'vinculos' ? 'bg-indigo-700 text-white' : 'bg-emerald-100 text-emerald-800'
          }`}>
            Rede Integrada
          </span>
        </button>
      </div>

      {/* ABA 1: RELATÓRIO DE TURMA & DIFICULDADES */}
      {teacherTab === 'relatorio' && (
        <ClassReportModule
          activeGroup={activeGroup}
          allClassGroups={classGroups}
          onSelectClass={setSelectedClassId}
          onAssignReinforcementList={handleAssignReinforcementList}
          createdLists={createdLists}
        />
      )}

      {/* ABA 2: VISÃO GERAL & ADAPTAÇÕES DA TURMA */}
      {teacherTab === 'geral' && (
        <div className="space-y-6">
          {/* Class Selector Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto">
            {classGroups.map((group) => {
              const isSelected = selectedClassId === group.id;
              return (
                <button
                  key={group.id}
                  onClick={() => setSelectedClassId(group.id)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-xs whitespace-nowrap transition border ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>{group.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      isSelected ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {group.totalStudents} alunos
                  </span>
                </button>
              );
            })}
          </div>

          {/* Banner de Atalho para o Relatório de Dificuldades */}
          <div className="p-5 rounded-3xl bg-rose-50 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-2xl bg-rose-100 text-rose-700 shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-rose-950">
                  {diagnosticSummary.criticalCount} tópicos com erro recorrente identificados em {activeGroup.name}
                </h4>
                <p className="text-xs text-rose-800 mt-0.5">
                  Gargalo principal: <strong>{diagnosticSummary.highestDifficultyTopic?.topic || 'Conteúdo prioritário'}</strong> ({diagnosticSummary.highestDifficultyTopic?.accuracyRate}% acerto).
                </p>
              </div>
            </div>

            <button
              onClick={() => setTeacherTab('relatorio')}
              className="px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-sm shrink-0 self-start sm:self-auto"
            >
              <span>Abrir Relatório Completo de Turma</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Active Class Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Class Overview & Accuracy (1 col) */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                <span>Desempenho da Turma ({activeGroup.grade})</span>
              </h3>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-xs text-slate-500 font-medium block">
                  Média Geral de Acertos nos Exercícios
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-extrabold text-slate-900">
                    {activeGroup.averageAccuracy}%
                  </span>
                  <span className="text-xs font-semibold text-emerald-600">
                    +4.2% nesta semana
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full mt-3 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${activeGroup.averageAccuracy}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100 text-slate-600">
                  <span>Total de Estudantes Ativos:</span>
                  <span className="font-bold text-slate-900">{activeGroup.totalStudents}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 text-slate-600">
                  <span>Série Curricular:</span>
                  <span className="font-bold text-slate-900">{activeGroup.grade} E.M.</span>
                </div>
                <div className="flex justify-between py-1.5 text-slate-600">
                  <span>Redações Enviadas neste mês:</span>
                  <span className="font-bold text-slate-900">68 textos</span>
                </div>
              </div>
            </div>

            {/* Methodological Support Needs (Ethical & Anonymized) (1 col) */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-600" />
                <span>Adaptações Metodológicas na Turma</span>
              </h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Métricas anônimas para orientar o ritmo didático das aulas presenciais ou atividades remotas:
              </p>

              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200 text-xs">
                  <div className="flex items-center justify-between font-bold text-purple-900 mb-1">
                    <span>Blocos Curtos / Tempo Estendido</span>
                    <span className="bg-purple-200 text-purple-900 px-2 py-0.5 rounded-full text-[10px]">
                      {activeGroup.methodologicalNeeds.extendedTimeOrBlocks} alunos
                    </span>
                  </div>
                  <p className="text-purple-800 text-[11px] leading-relaxed">
                    Recomendação: Permitir pausas ativas a cada 20 minutos e fracionar tarefas complexas.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200 text-xs">
                  <div className="flex items-center justify-between font-bold text-teal-900 mb-1">
                    <span>Linguagem Direta e Estrutura Fixa</span>
                    <span className="bg-teal-200 text-teal-900 px-2 py-0.5 rounded-full text-[10px]">
                      {activeGroup.methodologicalNeeds.visualDirectStructure} alunos
                    </span>
                  </div>
                  <p className="text-teal-800 text-[11px] leading-relaxed">
                    Recomendação: Enunciados com comandos objetivos em tópicos, evitando enunciados com metáforas ambíguas.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs">
                  <div className="flex items-center justify-between font-bold text-amber-900 mb-1">
                    <span>Suporte em Áudio / Fonte Ampliada</span>
                    <span className="bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full text-[10px]">
                      {activeGroup.methodologicalNeeds.audioOrDyslexiaSupport} alunos
                    </span>
                  </div>
                  <p className="text-amber-800 text-[11px] leading-relaxed">
                    Recomendação: Disponibilizar materiais impressos com tipografia limpa e incentivar escuta atenta.
                  </p>
                </div>
              </div>
            </div>

            {/* Assigned Lists & Simulated Exams (1 col) */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span>Listas Atribuídas à Turma</span>
              </h3>

              <div className="space-y-2.5">
                {createdLists.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 transition text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{item.title}</span>
                      <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
                        {item.grade}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>{item.count} questões calibradas</span>
                      <span>Criada: {item.date}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="w-full py-2.5 rounded-2xl border-2 border-dashed border-slate-300 hover:border-indigo-400 text-xs font-bold text-slate-600 hover:text-indigo-600 transition flex items-center justify-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Adicionar Lista com Regra Curricular</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 3: LISTAS DE EXERCÍCIOS & REFORÇO ATRIBUÍDAS */}
      {teacherTab === 'listas' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-indigo-600" />
                <span>Repositório de Listas & Simulados Atribuídos</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Todas as listas de exercícios regulares e listas de reforço pedagógico ativas para a turma {activeGroup.name}.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setTeacherTab('relatorio')}
                className="px-4 py-2.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-xs transition flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Sugerir Reforço via Relatório</span>
              </button>

              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-sm"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Criar Nova Lista Manual</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {createdLists.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-3xl border border-slate-200 hover:border-indigo-300 bg-slate-50/60 hover:bg-white transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                    {item.grade}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {item.date}
                  </span>
                </div>

                <h4 className="font-extrabold text-sm text-slate-900 leading-snug">
                  {item.title}
                </h4>

                <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <span className="font-semibold">{item.count} questões ativas</span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Publicada
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ABA 4: VÍNCULOS & ALUNOS MONITORADOS */}
      {teacherTab === 'vinculos' && <TeacherRelationshipsModule />}

      {/* Modal: Create List */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 animate-scaleUp space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                Criar Lista de Exercícios ou Simulado
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateList} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Título da Lista / Atividade:
                </label>
                <input
                  type="text"
                  required
                  value={newListTitle}
                  onChange={(e) => setNewListTitle(e.target.value)}
                  placeholder="Ex: Revisão ENEM - Ecologia e Termodinâmica"
                  className="w-full p-3 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Série Alvo (Aplica proporção automática do projeto):
                </label>
                <select
                  value={newListGrade}
                  onChange={(e) => setNewListGrade(e.target.value as GradeLevel)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                >
                  <option value="1º ano">1º ano (80% conteúdo 1º ano + 20% ENEM)</option>
                  <option value="2º ano">2º ano (70% conteúdo 2º ano + 20% revisão 1º + 10% ENEM)</option>
                  <option value="3º ano">3º ano (60% conteúdo 3º ano + 25% revisão + 15% ENEM)</option>
                </select>
              </div>

              <div className="p-3 bg-indigo-50 rounded-xl text-indigo-900 leading-relaxed">
                💡 <strong>Automação Inclusiva:</strong> Ao publicar a lista, estudantes com TDAH, TEA ou Dislexia recebem automaticamente as adaptações ativadas em seus perfis, sem nenhuma segregação de turma.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md"
                >
                  Publicar Lista
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

