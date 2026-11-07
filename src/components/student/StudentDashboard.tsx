import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GradeLevel, StudentActiveTab } from '../../types';
import { QuestionPractice } from './QuestionPractice';
import { EssayPractice } from './EssayPractice';
import { LearningProfile } from './LearningProfile';
import { StudentSimulationProgress } from './StudentSimulationProgress';
import { StudentEvolutionChartPanel } from './StudentEvolutionChartPanel';
import { AutomaticFlashcardsModule } from './AutomaticFlashcardsModule';
import { LearningTrailModule } from './LearningTrailModule';
import { InteractiveGlossaryModule } from './InteractiveGlossaryModule';
import { PomodoroTimer } from './PomodoroTimer';
import { AiStudyAssistantModule } from './AiStudyAssistantModule';
import { AiStudyAssistantDrawer } from './AiStudyAssistantDrawer';
import { AiWeeklyScheduleModule } from './AiWeeklyScheduleModule';
import { DidacticDocumentReader } from './DidacticDocumentReader';
import { StudentRelationshipsModule } from './StudentRelationshipsModule';
import { UserProfileEditor } from '../registration/UserProfileEditor';
import {
  Flame,
  Award,
  BookOpen,
  GraduationCap,
  PenTool,
  Settings,
  Target,
  Clock,
  Timer,
  Sparkles,
  ChevronRight,
  PieChart,
  CheckCircle,
  Home,
  ArrowRight,
  Brain,
  ArrowLeft,
  UserCheck,
  TrendingUp,
  Maximize2,
  Zap,
  Compass,
  MessageSquare,
  Mic,
  CalendarDays,
  ShieldCheck,
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const {
    gradeLevel,
    setGradeLevel,
    stats,
    accessibility,
    updateAccessibility,
    studentActiveTab,
    setStudentActiveTab,
    confirmLeaveIfPracticing,
    startOnboarding,
    pendingFlashcardsCount,
    currentUser,
    relationships,
  } = useApp();

  const pendingRelationshipsCount = currentUser
    ? relationships.filter(
        (r) => (r.targetUserId === currentUser.id || r.sourceUserId === currentUser.id) && r.status === 'pendente'
      ).length
    : 0;

  // Exibição do Cronômetro Pomodoro Neuroinclusivo
  const [showPomodoro, setShowPomodoro] = useState<boolean>(true);

  // Assistente de Estudos com IA (Gaveta Rápida)
  const [isAssistantDrawerOpen, setIsAssistantDrawerOpen] = useState<boolean>(false);

  const accuracyPercent =
    stats.totalAnswered > 0
      ? Math.round((stats.totalCorrect / stats.totalAnswered) * 100)
      : 0;

  // Grade proportion details
  const getProportionBreakdown = (grade: GradeLevel) => {
    if (grade === '1º ano') {
      return [
        { label: 'Conteúdo 1º Ano E.M.', percent: 80, color: 'bg-indigo-600 text-indigo-700' },
        { label: 'Formato Oficial ENEM', percent: 20, color: 'bg-emerald-500 text-emerald-700' },
      ];
    }
    if (grade === '2º ano') {
      return [
        { label: 'Conteúdo 2º Ano E.M.', percent: 70, color: 'bg-indigo-600 text-indigo-700' },
        { label: 'Revisão 1º Ano', percent: 20, color: 'bg-sky-500 text-sky-700' },
        { label: 'Formato ENEM', percent: 10, color: 'bg-emerald-500 text-emerald-700' },
      ];
    }
    return [
      { label: 'Conteúdo 3º Ano E.M.', percent: 60, color: 'bg-indigo-600 text-indigo-700' },
      { label: 'Revisão 1º e 2º Anos', percent: 25, color: 'bg-sky-500 text-sky-700' },
      { label: 'Formato ENEM Intensivo', percent: 15, color: 'bg-emerald-500 text-emerald-700' },
    ];
  };

  const proportions = getProportionBreakdown(gradeLevel);

  const handleTabChange = (targetTab: StudentActiveTab) => {
    if (targetTab === studentActiveTab) return;
    // Se estiver saindo de modo de questões, aciona confirmação segura
    confirmLeaveIfPracticing(() => {
      setStudentActiveTab(targetTab);
    });
  };

  return (
    <div className={accessibility.focusMode ? 'space-y-8 sm:space-y-10' : 'space-y-6'}>
      {/* Banner de Status do Modo Foco (se ativado) */}
      {accessibility.focusMode && (
        <div className="bg-teal-50 border-2 border-teal-400/80 rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="p-3.5 bg-teal-600 text-white rounded-2xl shrink-0 shadow-xs">
                <Maximize2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-teal-950 text-base sm:text-lg">
                    Modo Foco Ativado (Apoio TEA & Baixo Ruído Sensorial)
                  </h3>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-teal-200 text-teal-900 font-bold border border-teal-300">
                    Interface Simplificada
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-teal-800 leading-relaxed max-w-2xl">
                  As distrações visuais foram removidas, a densidade de dados foi reduzida ao essencial e o espaçamento entre elementos foi aumentado para oferecer um ambiente de estudo calmo e previsível.
                </p>
              </div>
            </div>

            <button
              onClick={() => updateAccessibility({ focusMode: false })}
              className="px-5 py-3 bg-white hover:bg-teal-100 text-teal-900 border-2 border-teal-300 rounded-2xl font-bold text-xs transition shrink-0 shadow-2xs"
            >
              Voltar à Visualização Padrão
            </button>
          </div>
        </div>
      )}

      {/* Student Overview Header & Series Switcher */}
      {accessibility.focusMode ? (
        /* MODO FOCO: Header Calmo, Espaçado e com Baixa Densidade de Informações */
        <div className="bg-white rounded-3xl p-8 sm:p-10 border-2 border-slate-300 shadow-xs space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200">
            <div className="space-y-2">
              <span className="text-xs font-bold text-teal-700 uppercase tracking-wider block">
                Painel do Estudante • Modo Foco TEA
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Olá, Estudante! Bom estudo.
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Você está estudando o conteúdo de <strong>{gradeLevel}</strong> do Ensino Médio. Realize uma tarefa por vez, sem pressa.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Botão Assistente IA Gemini + Voz */}
              <button
                onClick={() => handleTabChange('assistente')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl font-bold text-xs bg-linear-to-r from-teal-800 to-indigo-900 text-white hover:brightness-110 transition border border-teal-600/50 shadow-xs cursor-pointer"
                title="Abrir Assistente de Estudos com IA (Gemini + Voz)"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Dúvidas com IA (Gemini)</span>
              </button>

              {/* Botão Cronômetro Pomodoro TDAH */}
              <button
                onClick={() => setShowPomodoro((prev) => !prev)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl font-bold text-xs transition border cursor-pointer ${
                  showPomodoro
                    ? 'bg-teal-700 text-white border-teal-800 shadow-xs'
                    : 'bg-white hover:bg-teal-50 text-teal-900 border-teal-300'
                }`}
                title="Mostrar ou ocultar Cronômetro Pomodoro adaptado para TDAH"
              >
                <Timer className="w-3.5 h-3.5" />
                <span>Pomodoro TDAH {showPomodoro ? '(Ativo)' : ''}</span>
              </button>

              {studentActiveTab !== 'inicio' && (
                <button
                  onClick={() => handleTabChange('inicio')}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition border border-slate-300"
                >
                  <ArrowLeft className="w-4 h-4 text-slate-700" />
                  <span>Voltar ao Início</span>
                </button>
              )}

              {/* Seletor de Série com espaçamento generoso */}
              <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
                <span className="text-xs font-bold text-slate-600 px-3 py-1">Sua Série:</span>
                {(['1º ano', '2º ano', '3º ano'] as GradeLevel[]).map((g) => (
                  <button
                    key={g}
                    onClick={() => setGradeLevel(g)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                      gradeLevel === g
                        ? 'bg-teal-700 text-white shadow-xs'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* MODO FOCO: Apenas 2 métricas essenciais, sem animações ou ruídos secundários */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 border-2 border-slate-200 flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-teal-700 text-white flex items-center justify-center shrink-0">
                <Target className="w-7 h-7" />
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 block leading-tight">
                  {stats.totalAnswered}
                </span>
                <span className="text-xs font-semibold text-slate-600">Questões Respondidas no Total</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border-2 border-slate-200 flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shrink-0">
                <CheckCircle className="w-7 h-7" />
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 block leading-tight">
                  {accuracyPercent}%
                </span>
                <span className="text-xs font-semibold text-slate-600">Aproveitamento Geral</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* MODO PADRÃO: Header Completo com métricas detalhadas e barra de proporção */
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                  Painel do Estudante
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  100% Gratuito & Sem Limites
                </span>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Olá, Estudante! Rumo ao ENEM 🎓
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Preparação gradual, passo a passo, no seu ritmo e com acolhimento pleno.
              </p>
            </div>

            <div className="flex items-center flex-wrap gap-2">
              {/* Botão Assistente IA Gemini + Voz */}
              <button
                onClick={() => handleTabChange('assistente')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                title="Tirar dúvidas rápidas sobre conceitos do ENEM com IA Gemini e voz-para-texto"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
                <span>Dúvidas IA (Gemini + Voz)</span>
              </button>

              {/* Botão Cronômetro Pomodoro TDAH */}
              <button
                onClick={() => setShowPomodoro((prev) => !prev)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl border text-xs font-bold transition shadow-2xs cursor-pointer ${
                  showPomodoro
                    ? 'bg-indigo-600 text-white border-indigo-700 shadow-indigo-200'
                    : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border-indigo-200'
                }`}
                title="Abrir Cronômetro Pomodoro com ciclos curtos 15/5 e avisos suaves"
              >
                <Timer className="w-3.5 h-3.5" />
                <span>Pomodoro TDAH (15/5)</span>
              </button>

              {/* Botão de ativação do Modo Foco TEA */}
              <button
                onClick={() => updateAccessibility({ focusMode: true })}
                className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 text-xs font-bold transition shadow-2xs"
                title="Ativar Modo Foco para simplificar a interface (Ideal para TEA)"
              >
                <Maximize2 className="w-3.5 h-3.5 text-teal-600" />
                <span>Modo Foco (TEA)</span>
              </button>

              {/* Botão de voltar ao início se estiver em outra aba */}
              {studentActiveTab !== 'inicio' && (
                <button
                  onClick={() => handleTabChange('inicio')}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition border border-slate-200"
                  title="Voltar à página inicial do aluno"
                >
                  <ArrowLeft className="w-4 h-4 text-rose-500" />
                  <span>Voltar ao Início</span>
                </button>
              )}

              {/* Series selector pill */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 self-start md:self-auto">
                <span className="text-xs font-bold text-slate-500 px-2.5 py-1">Sua Série:</span>
                {(['1º ano', '2º ano', '3º ano'] as GradeLevel[]).map((g) => (
                  <button
                    key={g}
                    onClick={() => setGradeLevel(g)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      gradeLevel === g
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                    }`}
                  >
                    {g} E.M.
                  </button>
                ))}
              </div>

              {/* Tour Guide Button */}
              <button
                onClick={startOnboarding}
                className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition shadow-2xs"
                title="Abrir o tour explicativo do perfil de Aluno"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden sm:inline">Tour do Aluno</span>
              </button>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5">
            {/* Streak */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/70 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                <Flame className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <span className="text-lg font-extrabold text-amber-950 block leading-tight">
                  {stats.streakDays} dias
                </span>
                <span className="text-[11px] font-medium text-amber-800">Sequência Ativa</span>
              </div>
            </div>

            {/* Questions answered */}
            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/70 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-extrabold text-indigo-950 block leading-tight">
                  {stats.totalAnswered}
                </span>
                <span className="text-[11px] font-medium text-indigo-800">Questões Feitas</span>
              </div>
            </div>

            {/* Accuracy */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/70 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-extrabold text-emerald-950 block leading-tight">
                  {accuracyPercent}%
                </span>
                <span className="text-[11px] font-medium text-emerald-800">Aproveitamento</span>
              </div>
            </div>

            {/* Essays */}
            <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200/70 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
                <PenTool className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-extrabold text-purple-950 block leading-tight">
                  {stats.essaysSubmitted}
                </span>
                <span className="text-[11px] font-medium text-purple-800">Redações com IA</span>
              </div>
            </div>
          </div>

          {/* Dynamic series proportion banner */}
          <div className="mt-5 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <PieChart className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-slate-800">
                  Proporção Curricular Oficial do {gradeLevel}:
                </span>
              </div>
              <span className="text-[11px] text-slate-500">
                Garante que você aprenda a matéria escolar já no formato da prova do ENEM
              </span>
            </div>

            {/* Proportion progress bar */}
            <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden flex">
              {proportions.map((p, idx) => (
                <div
                  key={idx}
                  className={`${p.color.split(' ')[0]} transition-all duration-500`}
                  style={{ width: `${p.percent}%` }}
                  title={`${p.label}: ${p.percent}%`}
                />
              ))}
            </div>

            {/* Badges legend */}
            <div className="flex flex-wrap items-center gap-3 mt-2.5 text-[11px]">
              {proportions.map((p, idx) => (
                <div key={idx} className="flex items-center gap-1.5 font-medium text-slate-700">
                  <span className={`w-2.5 h-2.5 rounded-full ${p.color.split(' ')[0]}`}></span>
                  <span>
                    <strong>{p.percent}%</strong> {p.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Cronômetro Pomodoro Neuroinclusivo TDAH com ciclos curtos (15/5), avisos suaves e som ambiente */}
      {showPomodoro && (
        <div className="transition-all duration-300 animate-fadeIn">
          <PomodoroTimer />
        </div>
      )}

      {/* Navigation Tabs */}
      <div className={`flex items-center overflow-x-auto pb-1.5 ${accessibility.focusMode ? 'gap-3 sm:gap-4' : 'gap-2'}`}>
        {/* ⏱️ Botão Rápido Pomodoro */}
        <button
          onClick={() => setShowPomodoro((prev) => !prev)}
          className={`flex items-center gap-2 rounded-2xl font-bold whitespace-nowrap transition shadow-xs cursor-pointer ${
            accessibility.focusMode ? 'px-5 py-3.5 text-sm border-2' : 'px-4 py-3 text-xs border'
          } ${
            showPomodoro
              ? accessibility.focusMode
                ? 'bg-teal-100 text-teal-900 border-teal-300'
                : 'bg-indigo-50 text-indigo-900 border-indigo-300'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
          title="Alternar exibição do Cronômetro Pomodoro TDAH"
        >
          <Timer className={accessibility.focusMode ? 'w-5 h-5 text-teal-700' : 'w-4 h-4 text-indigo-600'} />
          <span>Pomodoro {showPomodoro ? 'Ativo' : 'Oculto'}</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        </button>

        {/* 🏠 Botão Início (Primeira Página de Uso do Aluno) */}
        <button
          onClick={() => handleTabChange('inicio')}
          className={`flex items-center gap-2 rounded-2xl font-bold whitespace-nowrap transition shadow-xs ${
            accessibility.focusMode ? 'px-6 py-3.5 text-sm border-2' : 'px-5 py-3 text-xs border'
          } ${
            studentActiveTab === 'inicio'
              ? accessibility.focusMode
                ? 'bg-teal-700 text-white border-teal-800 shadow-teal-200'
                : 'bg-indigo-600 text-white border-indigo-600 shadow-indigo-200'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Home className={accessibility.focusMode ? 'w-5 h-5' : 'w-4 h-4'} />
          <span>Início do Aluno</span>
        </button>

        <button
          onClick={() => handleTabChange('serie')}
          className={`flex items-center gap-2 rounded-2xl font-bold whitespace-nowrap transition shadow-xs ${
            accessibility.focusMode ? 'px-6 py-3.5 text-sm border-2' : 'px-5 py-3 text-xs border'
          } ${
            studentActiveTab === 'serie'
              ? accessibility.focusMode
                ? 'bg-teal-700 text-white border-teal-800 shadow-teal-200'
                : 'bg-indigo-600 text-white border-indigo-600 shadow-indigo-200'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <BookOpen className={accessibility.focusMode ? 'w-5 h-5' : 'w-4 h-4'} />
          <span>Modo Série ({gradeLevel})</span>
        </button>

        <button
          onClick={() => handleTabChange('enem')}
          className={`flex items-center gap-2 rounded-2xl font-bold whitespace-nowrap transition shadow-xs ${
            accessibility.focusMode ? 'px-6 py-3.5 text-sm border-2' : 'px-5 py-3 text-xs border'
          } ${
            studentActiveTab === 'enem'
              ? accessibility.focusMode
                ? 'bg-teal-700 text-white border-teal-800 shadow-teal-200'
                : 'bg-indigo-600 text-white border-indigo-600 shadow-indigo-200'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <GraduationCap className={accessibility.focusMode ? 'w-5 h-5' : 'w-4 h-4'} />
          <span>Modo ENEM (Simulado Geral)</span>
        </button>

        <button
          onClick={() => handleTabChange('redacao')}
          className={`flex items-center gap-2 rounded-2xl font-bold whitespace-nowrap transition shadow-xs ${
            accessibility.focusMode ? 'px-6 py-3.5 text-sm border-2' : 'px-5 py-3 text-xs border'
          } ${
            studentActiveTab === 'redacao'
              ? accessibility.focusMode
                ? 'bg-teal-700 text-white border-teal-800 shadow-teal-200'
                : 'bg-indigo-600 text-white border-indigo-600 shadow-indigo-200'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <PenTool className={accessibility.focusMode ? 'w-5 h-5' : 'w-4 h-4'} />
          <span>Redação com IA (5 Competências)</span>
        </button>

        <button
          onClick={() => handleTabChange('progresso')}
          className={`flex items-center gap-2 rounded-2xl font-bold whitespace-nowrap transition shadow-xs ${
            accessibility.focusMode ? 'px-6 py-3.5 text-sm border-2' : 'px-5 py-3 text-xs border'
          } ${
            studentActiveTab === 'progresso'
              ? accessibility.focusMode
                ? 'bg-teal-700 text-white border-teal-800 shadow-teal-200'
                : 'bg-indigo-600 text-white border-indigo-600 shadow-indigo-200'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <TrendingUp className={accessibility.focusMode ? 'w-5 h-5' : 'w-4 h-4'} />
          <span>Progresso & Gráficos</span>
        </button>

        <button
          onClick={() => handleTabChange('flashcards')}
          className={`flex items-center gap-2 rounded-2xl font-bold whitespace-nowrap transition shadow-xs ${
            accessibility.focusMode ? 'px-6 py-3.5 text-sm border-2' : 'px-5 py-3 text-xs border'
          } ${
            studentActiveTab === 'flashcards'
              ? accessibility.focusMode
                ? 'bg-amber-600 text-white border-amber-700 shadow-amber-200'
                : 'bg-amber-500 text-white border-amber-500 shadow-amber-200'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Zap className={accessibility.focusMode ? 'w-5 h-5 text-amber-300' : 'w-4 h-4 text-amber-500'} />
          <span>Flashcards Automáticos</span>
          {pendingFlashcardsCount > 0 && (
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                studentActiveTab === 'flashcards'
                  ? 'bg-white text-amber-800'
                  : 'bg-rose-500 text-white'
              }`}
            >
              {pendingFlashcardsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => handleTabChange('trilha')}
          className={`flex items-center gap-2 rounded-2xl font-bold whitespace-nowrap transition shadow-xs ${
            accessibility.focusMode ? 'px-6 py-3.5 text-sm border-2' : 'px-5 py-3 text-xs border'
          } ${
            studentActiveTab === 'trilha'
              ? accessibility.focusMode
                ? 'bg-teal-700 text-white border-teal-800 shadow-teal-200'
                : 'bg-indigo-600 text-white border-indigo-600 shadow-indigo-200'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Compass className={accessibility.focusMode ? 'w-5 h-5 text-indigo-300' : 'w-4 h-4 text-indigo-600'} />
          <span>Trilha de Aprendizado</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
            studentActiveTab === 'trilha' ? 'bg-amber-400 text-slate-950' : 'bg-indigo-100 text-indigo-800'
          }`}>
            Gamificada
          </span>
        </button>

        <button
          onClick={() => handleTabChange('glossario')}
          className={`flex items-center gap-2 rounded-2xl font-bold whitespace-nowrap transition shadow-xs ${
            accessibility.focusMode ? 'px-6 py-3.5 text-sm border-2' : 'px-5 py-3 text-xs border'
          } ${
            studentActiveTab === 'glossario'
              ? accessibility.focusMode
                ? 'bg-teal-700 text-white border-teal-800 shadow-teal-200'
                : 'bg-indigo-600 text-white border-indigo-600 shadow-indigo-200'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <BookOpen className={accessibility.focusMode ? 'w-5 h-5 text-teal-300' : 'w-4 h-4 text-teal-600'} />
          <span>Glossário Interativo</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
            studentActiveTab === 'glossario' ? 'bg-teal-400 text-slate-950' : 'bg-teal-100 text-teal-800'
          }`}>
            Siglas & IA
          </span>
        </button>

        <button
          onClick={() => handleTabChange('perfil')}
          className={`flex items-center gap-2 rounded-2xl font-bold whitespace-nowrap transition shadow-xs ${
            accessibility.focusMode ? 'px-6 py-3.5 text-sm border-2' : 'px-5 py-3 text-xs border'
          } ${
            studentActiveTab === 'perfil'
              ? accessibility.focusMode
                ? 'bg-teal-700 text-white border-teal-800 shadow-teal-200'
                : 'bg-indigo-600 text-white border-indigo-600 shadow-indigo-200'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Settings className={accessibility.focusMode ? 'w-5 h-5' : 'w-4 h-4'} />
          <span>Perfil & Acessibilidade</span>
          {(accessibility.tdahMode || accessibility.teaMode || accessibility.dyslexiaMode || accessibility.focusMode) && (
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
          )}
        </button>

        {/* 🤖 Assistente de Estudos com IA (Gemini + Voz) */}
        <button
          onClick={() => handleTabChange('assistente')}
          className={`flex items-center gap-2 rounded-2xl font-bold whitespace-nowrap transition shadow-xs ${
            accessibility.focusMode ? 'px-6 py-3.5 text-sm border-2' : 'px-5 py-3 text-xs border'
          } ${
            studentActiveTab === 'assistente'
              ? accessibility.focusMode
                ? 'bg-teal-700 text-white border-teal-800 shadow-teal-200'
                : 'bg-linear-to-r from-indigo-600 to-purple-600 text-white border-indigo-500 shadow-indigo-300'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Sparkles className={accessibility.focusMode ? 'w-5 h-5 text-amber-300' : 'w-4 h-4 text-amber-500'} />
          <span>Assistente IA (Dúvidas ENEM)</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
            studentActiveTab === 'assistente' ? 'bg-amber-400 text-slate-950' : 'bg-indigo-100 text-indigo-800'
          }`}>
            Voz & Gemini
          </span>
        </button>

        {/* 📅 Cronograma Semanal Inteligente (IA Gemini + Fraquezas) */}
        <button
          onClick={() => handleTabChange('cronograma')}
          className={`flex items-center gap-2 rounded-2xl font-bold whitespace-nowrap transition shadow-xs ${
            accessibility.focusMode ? 'px-6 py-3.5 text-sm border-2' : 'px-5 py-3 text-xs border'
          } ${
            studentActiveTab === 'cronograma'
              ? accessibility.focusMode
                ? 'bg-teal-700 text-white border-teal-800 shadow-teal-200'
                : 'bg-linear-to-r from-purple-600 to-indigo-600 text-white border-purple-500 shadow-purple-300'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <CalendarDays className={accessibility.focusMode ? 'w-5 h-5 text-purple-300' : 'w-4 h-4 text-purple-600'} />
          <span>Cronograma Semanal IA</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
            studentActiveTab === 'cronograma' ? 'bg-amber-400 text-slate-950' : 'bg-purple-100 text-purple-800'
          }`}>
            Novo • Fraquezas
          </span>
        </button>

        {/* 📖 Leitor de Documentos em Modo Foco (Tela Cheia + Sobreposição de Cores Dislexia) */}
        <button
          onClick={() => handleTabChange('leitor')}
          className={`flex items-center gap-2 rounded-2xl font-bold whitespace-nowrap transition shadow-xs ${
            accessibility.focusMode ? 'px-6 py-3.5 text-sm border-2' : 'px-5 py-3 text-xs border'
          } ${
            studentActiveTab === 'leitor'
              ? accessibility.focusMode
                ? 'bg-teal-700 text-white border-teal-800 shadow-teal-200'
                : 'bg-linear-to-r from-teal-600 to-emerald-600 text-white border-teal-500 shadow-teal-300'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <BookOpen className={accessibility.focusMode ? 'w-5 h-5 text-teal-300' : 'w-4 h-4 text-teal-600'} />
          <span>Leitor de Documentos</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
            studentActiveTab === 'leitor' ? 'bg-amber-400 text-slate-950' : 'bg-teal-100 text-teal-900'
          }`}>
            Modo Foco • Dislexia
          </span>
        </button>

        {/* 🔗 Vínculos Institucionais & Identificador Universal (CPF) */}
        <button
          onClick={() => handleTabChange('vinculos')}
          className={`flex items-center gap-2 rounded-2xl font-bold whitespace-nowrap transition shadow-xs ${
            accessibility.focusMode ? 'px-6 py-3.5 text-sm border-2' : 'px-5 py-3 text-xs border'
          } ${
            studentActiveTab === 'vinculos'
              ? accessibility.focusMode
                ? 'bg-teal-700 text-white border-teal-800 shadow-teal-200'
                : 'bg-indigo-600 text-white border-indigo-600 shadow-indigo-200'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <ShieldCheck className={accessibility.focusMode ? 'w-5 h-5 text-teal-300' : 'w-4 h-4 text-indigo-600'} />
          <span>Vínculos & Instituições</span>
          {pendingRelationshipsCount > 0 ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950 animate-pulse">
              {pendingRelationshipsCount} Pendente{pendingRelationshipsCount > 1 ? 's' : ''}
            </span>
          ) : (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              studentActiveTab === 'vinculos' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              CPF Oficial
            </span>
          )}
        </button>
      </div>

      {/* PRIMEIRA PÁGINA DE USO DO ALUNO (INÍCIO) */}
      {studentActiveTab === 'inicio' && (
        accessibility.focusMode ? (
          /* MODO FOCO: Visão Simplificada, Baixa Densidade de Dados e Espaçamento Ampliado */
          <div className="space-y-8 sm:space-y-10 animate-fadeIn">
            {/* Mensagem direta sem floreios */}
            <div className="bg-slate-900 text-white p-8 sm:p-10 rounded-3xl shadow-xs space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-300 block">
                Plano de Estudo Passo a Passo • Modo Foco TEA
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Escolha uma atividade para realizar agora
              </h3>
              <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                As tarefas estão organizadas em etapas sequenciais e claras. Faça uma de cada vez, no seu próprio ritmo e com tranquilidade.
              </p>
            </div>

            {/* Lista Sequencial de Atividades com espaçamento amplo */}
            <div className="space-y-6 sm:space-y-8">
              {/* Etapa 1 */}
              <div className="bg-white p-8 sm:p-10 rounded-3xl border-2 border-slate-200 hover:border-teal-500 shadow-xs transition flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-teal-100 text-teal-900 border border-teal-200 inline-block">
                    ETAPA 1: Conteúdo Escolar
                  </span>
                  <h4 className="text-xl font-extrabold text-slate-900">
                    Praticar Questões do {gradeLevel}
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Exercícios selecionados para o seu ano escolar. Responda uma questão por vez, com opção de leitura por voz e linguagem direta sem metáforas.
                  </p>
                </div>

                <button
                  onClick={() => handleTabChange('serie')}
                  className="px-6 py-4 bg-teal-700 hover:bg-teal-800 text-white rounded-2xl font-bold text-sm transition shadow-sm flex items-center justify-center gap-2 shrink-0"
                >
                  <span>Iniciar Questões do {gradeLevel}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Etapa 2 */}
              <div className="bg-white p-8 sm:p-10 rounded-3xl border-2 border-slate-200 hover:border-emerald-500 shadow-xs transition flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200 inline-block">
                    ETAPA 2: Treino Geral
                  </span>
                  <h4 className="text-xl font-extrabold text-slate-900">
                    Simulado Geral Oficial do ENEM
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Pratique a prova oficial com questões padronizadas e estrutura previsível para se habituar ao exame nacional.
                  </p>
                </div>

                <button
                  onClick={() => handleTabChange('enem')}
                  className="px-6 py-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-bold text-sm transition shadow-sm flex items-center justify-center gap-2 shrink-0"
                >
                  <span>Iniciar Simulado ENEM</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Etapa 3 */}
              <div className="bg-white p-8 sm:p-10 rounded-3xl border-2 border-slate-200 hover:border-purple-500 shadow-xs transition flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-100 text-purple-900 border border-purple-200 inline-block">
                    ETAPA 3: Produção Textual
                  </span>
                  <h4 className="text-xl font-extrabold text-slate-900">
                    Redação & Análise Gramatical (Competência 1)
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Escreva sua redação com calma. Receba retorno pontual e orientações acolhedoras sobre norma padrão da língua, sem notas punitivas.
                  </p>
                </div>

                <button
                  onClick={() => handleTabChange('redacao')}
                  className="px-6 py-4 bg-purple-700 hover:bg-purple-800 text-white rounded-2xl font-bold text-sm transition shadow-sm flex items-center justify-center gap-2 shrink-0"
                >
                  <span>Abrir Espaço de Redação</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Etapa 4 */}
              <div className="bg-white p-8 sm:p-10 rounded-3xl border-2 border-slate-200 hover:border-blue-500 shadow-xs transition flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-100 text-blue-900 border border-blue-200 inline-block">
                    ETAPA 4: Acompanhamento
                  </span>
                  <h4 className="text-xl font-extrabold text-slate-900">
                    Acompanhar Meu Progresso & Gráficos
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Visualize a evolução acumulada por área do conhecimento (Linguagens, Humanas, Natureza e Matemática) de maneira clara.
                  </p>
                </div>

                <button
                  onClick={() => handleTabChange('progresso')}
                  className="px-6 py-4 bg-blue-700 hover:bg-blue-800 text-white rounded-2xl font-bold text-sm transition shadow-sm flex items-center justify-center gap-2 shrink-0"
                >
                  <span>Ver Todos os Gráficos</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Etapa 5 (Modo Foco): Flashcards Automáticos */}
              <div className="bg-white p-8 sm:p-10 rounded-3xl border-2 border-slate-200 hover:border-amber-500 shadow-xs transition flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-200 inline-block">
                    ETAPA 5: Fixação de Conteúdo & Memória
                  </span>
                  <h4 className="text-xl font-extrabold text-slate-900">
                    Flashcards Automáticos de Questões Erradas
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Revise no seu próprio ritmo os conceitos das questões que você errou nos simulados. O Sistema de Leitner agenda revisões espaçadas sem sobrecarga cognitiva.
                  </p>
                </div>

                <button
                  onClick={() => handleTabChange('flashcards')}
                  className="px-6 py-4 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-bold text-sm transition shadow-sm flex items-center justify-center gap-2 shrink-0"
                >
                  <Zap className="w-4 h-4" />
                  <span>Revisar Flashcards</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Etapa 6 (Modo Foco): Trilha de Aprendizado Gamificada */}
              <div className="bg-white p-8 sm:p-10 rounded-3xl border-2 border-slate-200 hover:border-indigo-500 shadow-xs transition flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-100 text-indigo-900 border border-indigo-200 inline-block">
                    ETAPA 6: Progressão Curricular (Básico a Avançado)
                  </span>
                  <h4 className="text-xl font-extrabold text-slate-900">
                    Trilha de Aprendizado Gamificada
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Siga o mapa passo a passo dos tópicos do ENEM. Veja seus marcos já conquistados e qual é o próximo passo sem pressa e no seu próprio ritmo.
                  </p>
                </div>

                <button
                  onClick={() => handleTabChange('trilha')}
                  className="px-6 py-4 bg-indigo-700 hover:bg-indigo-800 text-white rounded-2xl font-bold text-sm transition shadow-sm flex items-center justify-center gap-2 shrink-0"
                >
                  <Compass className="w-4 h-4" />
                  <span>Abrir Trilha de Estudos</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Etapa 7 (Modo Foco): Glossário Interativo ENEM */}
              <div className="bg-white p-8 sm:p-10 rounded-3xl border-2 border-slate-200 hover:border-teal-500 shadow-xs transition flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-teal-100 text-teal-900 border border-teal-200 inline-block">
                    ETAPA 7: Consulta & Desmistificação de Siglas
                  </span>
                  <h4 className="text-xl font-extrabold text-slate-900">
                    Glossário Interativo ENEM & Modo Direto TEA
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Consulte siglas (TRI, BNCC, DCN) e termos complexos explicados com definições simplificadas, sem metáforas e com exemplos da vida real gerados pelo Gemini IA.
                  </p>
                </div>

                <button
                  onClick={() => handleTabChange('glossario')}
                  className="px-6 py-4 bg-teal-700 hover:bg-teal-800 text-white rounded-2xl font-bold text-sm transition shadow-sm flex items-center justify-center gap-2 shrink-0"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Consultar Glossário</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Etapa 8 (Modo Foco): Cronômetro Pomodoro TDAH */}
              <div className="bg-white p-8 sm:p-10 rounded-3xl border-2 border-slate-200 hover:border-indigo-500 shadow-xs transition flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-100 text-indigo-900 border border-indigo-200 inline-block">
                    ETAPA 8: Ritmo de Estudo & Concentração
                  </span>
                  <h4 className="text-xl font-extrabold text-slate-900">
                    Cronômetro Pomodoro TDAH (Ciclos Curtos 15/5 min)
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Estude em micro-blocos de 15 minutos com pausas de 5 minutos, som suave de tigela tibetana, ruído marrom ambiente e estacionamento de pensamentos para evitar dispersão.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setShowPomodoro(true);
                    window.scrollTo({ top: 120, behavior: 'smooth' });
                  }}
                  className="px-6 py-4 bg-indigo-700 hover:bg-indigo-800 text-white rounded-2xl font-bold text-sm transition shadow-sm flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                >
                  <Timer className="w-4 h-4" />
                  <span>Ativar Cronômetro</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Etapa 9 (Modo Foco): Assistente de Estudos com IA (Gemini + Voz) */}
              <div className="bg-white p-8 sm:p-10 rounded-3xl border-2 border-slate-200 hover:border-purple-500 shadow-xs transition flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-100 text-purple-900 border border-purple-200 inline-block">
                    ETAPA 9: Tirar Dúvidas com Inteligência Artificial
                  </span>
                  <h4 className="text-xl font-extrabold text-slate-900">
                    Assistente de Estudos Gemini com Ditado por Voz
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Tire dúvidas conceituais rápidas de Biologia, Física, Química, História, Matemática ou Redação. Fale pelo microfone e receba explicações didáticas em tópicos claros.
                  </p>
                </div>

                <button
                  onClick={() => handleTabChange('assistente')}
                  className="px-6 py-4 bg-purple-700 hover:bg-purple-800 text-white rounded-2xl font-bold text-sm transition shadow-sm flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Tirar Dúvidas com IA</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Etapa 10 (Modo Foco): Cronograma Semanal Inteligente Baseado em Fraquezas */}
              <div className="bg-white p-8 sm:p-10 rounded-3xl border-2 border-slate-200 hover:border-indigo-500 shadow-xs transition flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-100 text-indigo-900 border border-indigo-200 inline-block">
                    ETAPA 10: Organização Semanal Personalizada
                  </span>
                  <h4 className="text-xl font-extrabold text-slate-900">
                    Cronograma Semanal Inteligente (Foco em Menor Desempenho)
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    O Gemini cria uma rotina semanal equilibrada dando prioridade máxima às matérias onde seus acertos foram menores, intercalando blocos curtos Pomodoro e pausas cognitivas.
                  </p>
                </div>

                <button
                  onClick={() => handleTabChange('cronograma')}
                  className="px-6 py-4 bg-indigo-700 hover:bg-indigo-800 text-white rounded-2xl font-bold text-sm transition shadow-sm flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                >
                  <CalendarDays className="w-4 h-4 text-indigo-200" />
                  <span>Ver Meu Cronograma IA</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Etapa 11 (Modo Foco): Leitor de Documentos em Tela Cheia com Sobreposição de Cores (Dislexia) */}
              <div className="bg-white p-8 sm:p-10 rounded-3xl border-2 border-slate-200 hover:border-teal-500 shadow-xs transition flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-teal-100 text-teal-900 border border-teal-200 inline-block">
                    ETAPA 11: Leitura Acessível & Conforto Visual
                  </span>
                  <h4 className="text-xl font-extrabold text-slate-900">
                    Leitor de Documentos em Modo Foco & Sobreposição de Cores (Dislexia)
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Leia materiais didáticos, resumos e apostilas em tela cheia sem distrações laterais.
                    Aplique sobreposições cromáticas suaves (creme, pêssego, menta ou azul celeste) para evitar o ofuscamento visual,
                    e use a régua guia interativa para acompanhar linha por linha sem se perder.
                  </p>
                </div>

                <button
                  onClick={() => handleTabChange('leitor')}
                  className="px-6 py-4 bg-teal-700 hover:bg-teal-800 text-white rounded-2xl font-bold text-sm transition shadow-sm flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-teal-200" />
                  <span>Abrir Leitor em Modo Foco</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Painel de Evolução por Área integrado e espaçado */}
            <div className="pt-4">
              <StudentEvolutionChartPanel onGoToFullSimulation={() => handleTabChange('progresso')} />
            </div>
          </div>
        ) : (
          /* MODO PADRÃO: Grid com 6 Cards coloridos */
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 uppercase tracking-wider inline-flex items-center gap-1.5 shadow-2xs">
                    <Compass className="w-3.5 h-3.5" />
                    Trilha de Aprendizado Gamificada
                  </span>
                  <span className="text-xs text-indigo-200">
                    Nível 4 • 1.840 XP • 9 marcos conquistados
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black tracking-tight">
                  Mapeamento Completo: Do Básico ao Avançado
                </h3>
                <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed">
                  Acompanhe seus nós de conhecimento por área, desbloqueie novos passos e conquiste insígnias oficiais para o ENEM.
                </p>
              </div>

              <button
                onClick={() => handleTabChange('trilha')}
                className="px-5 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-2xl transition shadow-xs flex items-center justify-center gap-2 shrink-0 cursor-pointer"
              >
                <span>Explorar Trilha de Estudos</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Action Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {/* Card 1: Modo Série */}
              <div
                onClick={() => handleTabChange('serie')}
                className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-indigo-400 hover:shadow-md cursor-pointer transition flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold group-hover:scale-105 transition">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-base">Modo Série</h4>
                    <span className="text-[11px] font-semibold text-indigo-600">{gradeLevel} E.M.</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Pratique questões na proporção oficial da sua série. Aprenda a matéria escolar já no formato do ENEM.
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs font-bold text-indigo-600 pt-2 border-t border-slate-100">
                  <span>Começar Agora</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </div>
              </div>

              {/* Card 2: Modo ENEM */}
              <div
                onClick={() => handleTabChange('enem')}
                className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-emerald-400 hover:shadow-md cursor-pointer transition flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold group-hover:scale-105 transition">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-base">Modo ENEM</h4>
                    <span className="text-[11px] font-semibold text-emerald-600">Simulado Geral</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Simulado dinâmico com proporção completa, cronômetro oficial e treino de velocidade para o dia da prova.
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs font-bold text-emerald-600 pt-2 border-t border-slate-100">
                  <span>Iniciar Simulado</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </div>
              </div>

              {/* Card 3: Redação com IA e 5 Competências */}
              <div
                onClick={() => handleTabChange('redacao')}
                className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-purple-400 hover:shadow-md cursor-pointer transition flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold group-hover:scale-105 transition">
                    <PenTool className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-base">Redação com IA</h4>
                    <span className="text-[11px] font-semibold text-purple-600">5 Competências • Ditado por Voz</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Escreva ou dite seu texto por voz com avaliação das 5 competências do ENEM, checklist TDAH e análise de proposta C5.
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs font-bold text-purple-600 pt-2 border-t border-slate-100">
                  <span>Escrever ou Ditar</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </div>
              </div>

              {/* Card 4: Progresso e Gráficos de Simulados */}
              <div
                onClick={() => handleTabChange('progresso')}
                className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-blue-400 hover:shadow-md cursor-pointer transition flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold group-hover:scale-105 transition">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-base">Progresso & TRI</h4>
                    <span className="text-[11px] font-semibold text-blue-600">Gráficos por Área</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Acompanhe gráficos interativos de evolução temporal (LC, CH, CN e MT) e equilíbrio radar nos simulados.
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs font-bold text-blue-600 pt-2 border-t border-slate-100">
                  <span>Ver Gráficos</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </div>
              </div>

              {/* Card 5: Flashcards Automáticos com IA */}
              <div
                onClick={() => handleTabChange('flashcards')}
                className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-amber-400 hover:shadow-md cursor-pointer transition flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold group-hover:scale-105 transition">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-base">Flashcards IA</h4>
                    <span className="text-[11px] font-semibold text-amber-600">Repetição Espaçada SRS</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    O Gemini extrai conceitos-chave das questões que você errou nos simulados para fixação definitiva.
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs font-bold text-amber-600 pt-2 border-t border-slate-100">
                  <span>Revisar Cards</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </div>
              </div>

              {/* Card 6: Perfil de Aprendizagem */}
              <div
                onClick={() => handleTabChange('perfil')}
                className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-indigo-400 hover:shadow-md cursor-pointer transition flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold group-hover:scale-105 transition">
                    <Brain className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-base">Acessibilidade</h4>
                    <span className="text-[11px] font-semibold text-indigo-600">TDAH • TEA • Dislexia</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Ative blocos curtos, linguagem direta, fonte amigável ou leitura narrada com total sigilo médico.
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs font-bold text-indigo-600 pt-2 border-t border-slate-100">
                  <span>Ajustar Perfil</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </div>
              </div>

              {/* Card 7: Glossário Interativo & Siglas do ENEM */}
              <div
                onClick={() => handleTabChange('glossario')}
                className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-teal-400 hover:shadow-md cursor-pointer transition flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold group-hover:scale-105 transition">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-base">Glossário ENEM</h4>
                    <span className="text-[11px] font-semibold text-teal-600">Siglas • TRI • IA Gemini</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Termos complexos e siglas oficiais do exame explicados com clareza pedagógica e modo direto TEA.
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs font-bold text-teal-600 pt-2 border-t border-slate-100">
                  <span>Consultar Termos</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </div>
              </div>

              {/* Card 8: Cronômetro Pomodoro TDAH */}
              <div
                onClick={() => {
                  setShowPomodoro(true);
                  window.scrollTo({ top: 350, behavior: 'smooth' });
                }}
                className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-indigo-400 hover:shadow-md cursor-pointer transition flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold group-hover:scale-105 transition">
                    <Timer className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-base">Pomodoro TDAH</h4>
                    <span className="text-[11px] font-semibold text-indigo-600">Ciclos 15/5 • Sons Suaves</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Cronômetro com micro-blocos de ativação rápida, som de tigela tibetana, ruído marrom e estacionamento de ideias.
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs font-bold text-indigo-600 pt-2 border-t border-slate-100">
                  <span>Abrir Cronômetro</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </div>
              </div>

              {/* Card 9: Assistente de Estudos com IA (Gemini + Voz) */}
              <div
                onClick={() => handleTabChange('assistente')}
                className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-purple-400 hover:shadow-md cursor-pointer transition flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold group-hover:scale-105 transition">
                    <Sparkles className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-base">Assistente IA Gemini</h4>
                    <span className="text-[11px] font-semibold text-purple-600">Dúvidas Rápidas • Voz-para-Texto</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Converse com o tutor de IA, dite sua pergunta por voz e receba explicações didáticas com analogias e pegadinhas do ENEM.
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs font-bold text-purple-600 pt-2 border-t border-slate-100">
                  <span>Tirar Dúvida com IA</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </div>
              </div>

              {/* Card 10: Gerador de Cronograma Semanal Inteligente com Gemini */}
              <div
                onClick={() => handleTabChange('cronograma')}
                className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-indigo-400 hover:shadow-md cursor-pointer transition flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold group-hover:scale-105 transition">
                    <CalendarDays className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-base">Cronograma Semanal IA</h4>
                    <span className="text-[11px] font-semibold text-indigo-600">Foco em Menor Desempenho</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    O Gemini prioriza automaticamente suas áreas mais frágeis (como Matemática e Natureza) com sessões calibradas e pausas Pomodoro.
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs font-bold text-indigo-600 pt-2 border-t border-slate-100">
                  <span>Gerar Plano de Estudos</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </div>
              </div>

              {/* Card 11: Leitor de Documentos em Modo Foco (Tela Cheia + Sobreposição de Cores para Dislexia) */}
              <div
                onClick={() => handleTabChange('leitor')}
                className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-teal-400 hover:shadow-md cursor-pointer transition flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold group-hover:scale-105 transition">
                    <BookOpen className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-base">Leitor em Modo Foco</h4>
                    <span className="text-[11px] font-semibold text-teal-600">Tela Cheia & Dislexia</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Leia materiais didáticos em tela cheia sem distrações laterais. Aplique sobreposição de cores (creme, menta, pêssego) e régua de leitura para estabilizar as letras.
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs font-bold text-teal-600 pt-2 border-t border-slate-100">
                  <span>Abrir Leitor Adaptado</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </div>
              </div>

              {/* Card 12: Vínculos Institucionais & Identificador Oficial (CPF) */}
              <div
                onClick={() => handleTabChange('vinculos')}
                className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-indigo-400 hover:shadow-md cursor-pointer transition flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold group-hover:scale-105 transition">
                    <ShieldCheck className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-base">Vínculos & Instituições</h4>
                    <span className="text-[11px] font-semibold text-indigo-600">
                      CPF Oficial • Controle de Acesso LGPD
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Copie seu CPF oficial para compartilhar com professores, aprove ou recuse pedidos de monitoramento e revogue acessos a qualquer momento com total segurança.
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs font-bold text-indigo-600 pt-2 border-t border-slate-100">
                  <span>Gerenciar Meus Vínculos</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </div>
              </div>
            </div>

            {/* Painel de Visualização de Dados Recharts: Evolução por Área do Conhecimento */}
            <StudentEvolutionChartPanel onGoToFullSimulation={() => handleTabChange('progresso')} />
          </div>
        )
      )}

      {/* Content depending on selected tab */}
      {studentActiveTab === 'serie' && <QuestionPractice mode="serie" />}
      {studentActiveTab === 'enem' && <QuestionPractice mode="enem" />}
      {studentActiveTab === 'redacao' && <EssayPractice />}
      {studentActiveTab === 'progresso' && <StudentSimulationProgress />}
      {studentActiveTab === 'flashcards' && <AutomaticFlashcardsModule />}
      {studentActiveTab === 'trilha' && <LearningTrailModule />}
      {studentActiveTab === 'glossario' && <InteractiveGlossaryModule />}
      {studentActiveTab === 'perfil' && <LearningProfile />}
      {studentActiveTab === 'assistente' && <AiStudyAssistantModule />}
      {studentActiveTab === 'cronograma' && <AiWeeklyScheduleModule />}
      {studentActiveTab === 'leitor' && <DidacticDocumentReader />}
      {studentActiveTab === 'vinculos' && <StudentRelationshipsModule />}

      {/* Gaveta Flutuante / Botão de Acesso Rápido ao Assistente */}
      <AiStudyAssistantDrawer
        isOpen={isAssistantDrawerOpen}
        onClose={() => setIsAssistantDrawerOpen(false)}
        onOpen={() => setIsAssistantDrawerOpen(true)}
      />
    </div>
  );
};
