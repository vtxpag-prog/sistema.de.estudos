import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  KnowledgeArea,
  GradeLevel,
  LearningPathNode,
  TopicDifficulty,
} from '../../types';
import {
  Trophy,
  Flame,
  Zap,
  CheckCircle2,
  Lock,
  Star,
  Play,
  ArrowRight,
  BookOpen,
  Filter,
  Layers,
  Sparkles,
  Award,
  ChevronRight,
  Volume2,
  VolumeX,
  RefreshCw,
  X,
  Target,
  Compass,
  Check,
  Maximize2
} from 'lucide-react';

export const LearningTrailModule: React.FC = () => {
  const {
    learningPathNodes,
    learningPathProgress,
    completeLearningNode,
    resetLearningPath,
    accessibility,
    speakText,
    stopSpeaking,
    isSpeaking,
    setStudentActiveTab,
    confirmLeaveIfPracticing,
  } = useApp();

  const [selectedArea, setSelectedArea] = useState<string>('todas');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('todas');
  const [selectedGrade, setSelectedGrade] = useState<string>('todas');
  const [selectedNode, setSelectedNode] = useState<LearningPathNode | null>(null);
  const [celebrationModal, setCelebrationModal] = useState<LearningPathNode | null>(null);

  // Filtragem dos nós da trilha
  const filteredNodes = useMemo(() => {
    return learningPathNodes.filter((node) => {
      const matchArea = selectedArea === 'todas' || node.area === selectedArea;
      const matchDiff = selectedDifficulty === 'todas' || node.difficulty === selectedDifficulty;
      const matchGrade = selectedGrade === 'todas' || node.gradeLevel === selectedGrade;
      return matchArea && matchDiff && matchGrade;
    });
  }, [learningPathNodes, selectedArea, selectedDifficulty, selectedGrade]);

  // Agrupamento dos nós por Fase / Stage
  const stagesGrouped = useMemo(() => {
    const groups: { [key: string]: LearningPathNode[] } = {};
    filteredNodes.forEach((node) => {
      const stage = node.stageName || 'Trilha Geral';
      if (!groups[stage]) groups[stage] = [];
      groups[stage].push(node);
    });
    return groups;
  }, [filteredNodes]);

  // Encontrar o nó ativo que é o "Próximo Passo Recomendado"
  const nextRecommendedStep = useMemo(() => {
    return (
      filteredNodes.find((n) => n.status === 'em_andamento') ||
      filteredNodes.find((n) => n.status === 'bloqueado') ||
      filteredNodes[0]
    );
  }, [filteredNodes]);

  // Total de marcos conquistados e percentual
  const totalInFilter = filteredNodes.length;
  const completedInFilter = filteredNodes.filter((n) => n.status === 'conquistado').length;
  const trailCompletionPercent =
    totalInFilter > 0 ? Math.round((completedInFilter / totalInFilter) * 100) : 0;

  // Próximo nível de XP
  const xpForNextLevel = learningPathProgress.currentLevel * 500;
  const xpCurrentInLevel = learningPathProgress.totalXp % 500;
  const levelProgressPercent = Math.min(100, Math.round((xpCurrentInLevel / 500) * 100));

  const areasList: KnowledgeArea[] = [
    'Linguagens, Códigos e suas Tecnologias',
    'Ciências Humanas e suas Tecnologias',
    'Ciências da Natureza e suas Tecnologias',
    'Matemática e suas Tecnologias',
  ];

  // Helper de badges de dificuldade
  const getDifficultyMeta = (diff: TopicDifficulty) => {
    switch (diff) {
      case 'basico':
        return { label: 'Básico (Fundamentos)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
      case 'intermediario':
        return { label: 'Intermediário (Aplicação)', color: 'text-sky-700 bg-sky-50 border-sky-200' };
      case 'avancado':
        return { label: 'Avançado (Aprofundamento)', color: 'text-purple-700 bg-purple-50 border-purple-200' };
      case 'desafio_tri':
        return { label: 'Desafio TRI (Boss Milestone)', color: 'text-amber-800 bg-amber-50 border-amber-300' };
    }
  };

  // Handler de simulação de conclusão do marco
  const handleCompleteNode = (node: LearningPathNode) => {
    completeLearningNode(node.id, 95);
    setCelebrationModal(node);
    setSelectedNode(null);
  };

  return (
    <div className={`space-y-6 ${accessibility.focusMode ? 'space-y-8 sm:space-y-10' : ''}`}>
      {/* MODAL FESTIVO DE MARCO CONQUISTADO */}
      {celebrationModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 border-2 border-amber-400 shadow-2xl text-center space-y-5">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-white flex items-center justify-center mx-auto text-3xl shadow-lg ring-8 ring-amber-100">
              {celebrationModal.badge ? celebrationModal.badge.icon : '🏆'}
            </div>

            <div className="space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-widest text-amber-600 block">
                Marco Conquistado com Sucesso!
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                {celebrationModal.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Você conquistou este tópico essencial do ENEM e ganhou{' '}
                <strong className="text-amber-600 font-extrabold">+{celebrationModal.xpReward} XP</strong> para seu perfil de estudante!
              </p>
            </div>

            {celebrationModal.badge && (
              <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200 text-left flex items-center gap-3">
                <span className="text-2xl">{celebrationModal.badge.icon}</span>
                <div>
                  <h4 className="font-bold text-xs text-amber-950">
                    Insígnia: {celebrationModal.badge.name}
                  </h4>
                  <p className="text-[11px] text-amber-800">
                    {celebrationModal.badge.description}
                  </p>
                </div>
              </div>
            )}

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => setCelebrationModal(null)}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-2xl font-bold text-xs shadow-md transition"
              >
                Continuar Jornada na Trilha
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALHADO DO NÓ SELECIONADO */}
      {selectedNode && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-5">
            <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getDifficultyMeta(selectedNode.difficulty).color}`}>
                    {getDifficultyMeta(selectedNode.difficulty).label}
                  </span>
                  <span className="text-[11px] font-medium text-slate-500">
                    {selectedNode.gradeLevel} • Passo #{selectedNode.stepNumber}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                  {selectedNode.title}
                </h3>
              </div>

              <button
                onClick={() => {
                  stopSpeaking();
                  setSelectedNode(null);
                }}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Descrição e Habilidade BNCC */}
            <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <p>{selectedNode.description}</p>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <span>Habilidade BNCC:</span>
                <span className="font-mono bg-slate-100 px-2 py-0.5 rounded-md text-slate-800">
                  {selectedNode.bnccSkill}
                </span>
              </div>
            </div>

            {/* Pontos-Chave do Conceito */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Conceitos Fundamentais deste Marco:
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-600">
                {selectedNode.summaryKeyPoints.map((pt, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Status e Estatísticas do Marco */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-slate-500 block mb-0.5">Progresso Atual:</span>
                <span className="font-extrabold text-slate-900 text-sm">
                  {selectedNode.completedQuestions} / {selectedNode.totalQuestions} questões ({selectedNode.progressPercent}%)
                </span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-slate-500 block mb-0.5">Recompensa:</span>
                <span className="font-extrabold text-amber-600 text-sm flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" /> +{selectedNode.xpReward} XP
                </span>
              </div>
            </div>

            {/* Ações Funcionais */}
            <div className="space-y-2 pt-2">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => {
                    const text = `${selectedNode.title}. ${selectedNode.description}. Pontos principais: ${selectedNode.summaryKeyPoints.join('. ')}`;
                    if (isSpeaking) stopSpeaking();
                    else speakText(text);
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5"
                  title="Ouvir leitura narrada (Acessibilidade)"
                >
                  {isSpeaking ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4" />}
                  <span>{isSpeaking ? 'Parar Leitura' : 'Ouvir Explicação'}</span>
                </button>

                {selectedNode.status !== 'conquistado' && (
                  <button
                    onClick={() => handleCompleteNode(selectedNode)}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Conquistar Marco (+{selectedNode.xpReward} XP)</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => {
                    setSelectedNode(null);
                    confirmLeaveIfPracticing(() => {
                      setStudentActiveTab('serie');
                    });
                  }}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition shadow-xs flex items-center justify-center gap-2"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Praticar Questões deste Tópico</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedNode(null);
                    confirmLeaveIfPracticing(() => {
                      setStudentActiveTab('flashcards');
                    });
                  }}
                  className="py-3 px-4 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl font-bold text-xs transition"
                >
                  ⚡ Flashcards
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HEADER DA TRILHA DE APRENDIZADO GAMIFICADA */}
      <div className={`bg-white rounded-3xl border shadow-xs ${
        accessibility.focusMode ? 'p-8 sm:p-10 border-2 border-slate-300' : 'p-6 border-slate-200'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pb-6 border-b border-slate-100">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" />
                Trilha de Aprendizado Gamificada
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                Nível {learningPathProgress.currentLevel} • {learningPathProgress.levelTitle}
              </span>
            </div>
            <h2 className={`font-extrabold text-slate-900 tracking-tight ${
              accessibility.focusMode ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'
            }`}>
              Do Básico aos Tópicos Avançados do ENEM
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              Mapeamento passo a passo com pré-requisitos lógicos. Cada marco conquistado desbloqueia novas competências pedagógicas com recompensas de XP e medalhas de maestria.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={resetLearningPath}
              className="px-3.5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition border border-slate-200 flex items-center gap-1.5"
              title="Restaurar dados de demonstração da trilha"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Resetar Trilha</span>
            </button>
          </div>
        </div>

        {/* ESTATÍSTICAS GAMIFICADAS: XP, NÍVEL, STREAK & PROGRESSO GERAL */}
        {!accessibility.focusMode ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6">
            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-indigo-900">Nível & Título</span>
                <Trophy className="w-4 h-4 text-indigo-600" />
              </div>
              <span className="text-xl font-black text-indigo-950 block mt-1">
                Nível {learningPathProgress.currentLevel}
              </span>
              <span className="text-[11px] text-indigo-700 truncate block">
                {learningPathProgress.levelTitle}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-900">XP Pedagógico</span>
                <Zap className="w-4 h-4 text-amber-600" />
              </div>
              <span className="text-xl font-black text-amber-950 block mt-1">
                {learningPathProgress.totalXp} XP
              </span>
              <div className="w-full bg-amber-200/70 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="bg-amber-600 h-full rounded-full"
                  style={{ width: `${levelProgressPercent}%` }}
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-rose-900">Sequência Ativa</span>
                <Flame className="w-4 h-4 text-rose-600" />
              </div>
              <span className="text-xl font-black text-rose-950 block mt-1">
                {learningPathProgress.streakDays} dias 🔥
              </span>
              <span className="text-[11px] text-rose-700">Constância de estudos</span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-900">Marcos Conquistados</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="text-xl font-black text-emerald-950 block mt-1">
                {completedInFilter} de {totalInFilter}
              </span>
              <span className="text-[11px] text-emerald-700">
                {trailCompletionPercent}% da trilha concluída
              </span>
            </div>
          </div>
        ) : (
          /* Modo Foco: Visualização Limpa e Sem Ruído */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
            <div className="p-5 rounded-2xl bg-slate-50 border-2 border-slate-200 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-teal-700 text-white flex items-center justify-center font-bold text-lg">
                {completedInFilter}
              </div>
              <div>
                <span className="font-extrabold text-slate-900 text-lg block">
                  Marcos Conquistados ({trailCompletionPercent}%)
                </span>
                <span className="text-xs text-slate-600">
                  {completedInFilter} de {totalInFilter} tópicos dominados no seu ritmo.
                </span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border-2 border-slate-200 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold text-lg">
                {learningPathProgress.totalXp}
              </div>
              <div>
                <span className="font-extrabold text-slate-900 text-lg block">Pontos de Conquista (XP)</span>
                <span className="text-xs text-slate-600">Nível {learningPathProgress.currentLevel} • {learningPathProgress.levelTitle}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CARD DO PRÓXIMO PASSO RECOMENDADO */}
      {nextRecommendedStep && (
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-amber-400 text-slate-950 uppercase tracking-wider inline-flex items-center gap-1.5 shadow-2xs">
                <Target className="w-3.5 h-3.5" />
                Seu Próximo Passo Recomendado
              </span>
              <span className="text-indigo-200 text-xs">
                Passo #{nextRecommendedStep.stepNumber} • {nextRecommendedStep.stageName}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight">
              {nextRecommendedStep.title}
            </h3>
            <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed">
              {nextRecommendedStep.description}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setSelectedNode(nextRecommendedStep)}
              className="px-5 py-3.5 bg-white text-indigo-950 hover:bg-indigo-50 font-extrabold text-xs rounded-2xl transition shadow-xs flex items-center gap-2"
            >
              <span>Ver Detalhes do Marco</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* BARRA DE FILTROS POR ÁREA, DIFICULDADE E SÉRIE */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-slate-700 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-indigo-600" /> Área:
          </span>
          <select
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-indigo-500"
          >
            <option value="todas">Todas as Áreas (Trilha Integrada)</option>
            {areasList.map((a) => (
              <option key={a} value={a}>
                {a.split(' e ')[0]}
              </option>
            ))}
          </select>

          <span className="font-bold text-slate-700 ml-2">Dificuldade:</span>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-indigo-500"
          >
            <option value="todas">Todos os Níveis</option>
            <option value="basico">Básico (Fundamentos)</option>
            <option value="intermediario">Intermediário</option>
            <option value="avancado">Avançado</option>
            <option value="desafio_tri">Desafio TRI (Boss)</option>
          </select>

          <span className="font-bold text-slate-700 ml-2">Série:</span>
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-indigo-500"
          >
            <option value="todas">Todas as Séries</option>
            <option value="1º ano">1º Ano E.M.</option>
            <option value="2º ano">2º Ano E.M.</option>
            <option value="3º ano">3º Ano E.M.</option>
          </select>
        </div>

        <div className="text-slate-500 font-medium">
          {filteredNodes.length} marcos mapeados
        </div>
      </div>

      {/* MAPA VISUAL DA TRILHA DE APRENDIZADO (ESTRUTURA GAMIFICADA) */}
      <div className="space-y-8">
        {Object.entries(stagesGrouped).map(([stageName, nodesInStage], stageIdx) => (
          <div
            key={stageName}
            className={`bg-white rounded-3xl border shadow-xs overflow-hidden ${
              accessibility.focusMode ? 'p-6 sm:p-8 border-2 border-slate-300' : 'p-6 border-slate-200'
            }`}
          >
            {/* Cabeçalho da Fase */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm ${
                  stageIdx === 0
                    ? 'bg-emerald-100 text-emerald-800'
                    : stageIdx === 1
                    ? 'bg-sky-100 text-sky-800'
                    : stageIdx === 2
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {stageIdx + 1}
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                    {stageName}
                  </h3>
                  <span className="text-xs text-slate-500">
                    {nodesInStage.filter((n) => n.status === 'conquistado').length} de {nodesInStage.length} marcos concluídos
                  </span>
                </div>
              </div>

              <div className="text-xs font-semibold text-slate-500">
                Fase {stageIdx + 1} de {Object.keys(stagesGrouped).length}
              </div>
            </div>

            {/* Visual Road / Nós Conectados */}
            <div className="pt-6">
              {accessibility.focusMode ? (
                /* MODO FOCO: Lista Linear Acolhedora Sem Distrações */
                <div className="space-y-4">
                  {nodesInStage.map((node) => (
                    <div
                      key={node.id}
                      onClick={() => setSelectedNode(node)}
                      className={`p-5 rounded-2xl border-2 transition cursor-pointer flex items-center justify-between gap-4 ${
                        node.status === 'conquistado'
                          ? 'bg-emerald-50/60 border-emerald-300 hover:bg-emerald-50'
                          : node.status === 'em_andamento'
                          ? 'bg-amber-50/60 border-amber-400 hover:bg-amber-50 ring-2 ring-amber-300'
                          : 'bg-slate-50/60 border-slate-200 text-slate-400 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                          node.status === 'conquistado'
                            ? 'bg-emerald-600 text-white'
                            : node.status === 'em_andamento'
                            ? 'bg-amber-500 text-white'
                            : 'bg-slate-200 text-slate-500'
                        }`}>
                          {node.status === 'conquistado' ? (
                            <Check className="w-5 h-5" />
                          ) : node.status === 'em_andamento' ? (
                            <Play className="w-5 h-5" />
                          ) : (
                            <Lock className="w-4 h-4" />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-800">
                              Passo #{node.stepNumber}: {node.title}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getDifficultyMeta(node.difficulty).color}`}>
                              {getDifficultyMeta(node.difficulty).label.split(' ')[0]}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5">
                            {node.description}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-slate-700 block">
                          +{node.xpReward} XP
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {node.status === 'conquistado' ? 'Conquistado' : node.status === 'em_andamento' ? 'Em Andamento' : 'Bloqueado'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* MODO PADRÃO: Grade Gamificada com Nós e Conexões Visuais */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {nodesInStage.map((node) => {
                    const isConquered = node.status === 'conquistado';
                    const isInProgress = node.status === 'em_andamento';
                    const isLocked = node.status === 'bloqueado';

                    return (
                      <div
                        key={node.id}
                        onClick={() => setSelectedNode(node)}
                        className={`rounded-3xl p-5 border-2 transition-all cursor-pointer flex flex-col justify-between space-y-4 relative group ${
                          isConquered
                            ? 'bg-white border-emerald-300 hover:border-emerald-400 hover:shadow-md'
                            : isInProgress
                            ? 'bg-gradient-to-br from-white to-amber-50/50 border-amber-400 hover:border-amber-500 shadow-sm ring-2 ring-amber-400/30'
                            : 'bg-slate-50/60 border-slate-200 hover:border-slate-300 opacity-80'
                        }`}
                      >
                        {/* Indicador de Boss Milestone */}
                        {node.isBossMilestone && (
                          <div className="absolute -top-3 right-4 px-2.5 py-0.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 text-[10px] font-black rounded-full shadow-xs flex items-center gap-1 uppercase tracking-wider">
                            <Star className="w-3 h-3 fill-slate-950" />
                            <span>Desafio TRI Boss</span>
                          </div>
                        )}

                        <div className="space-y-3">
                          {/* Topo do Nó */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {/* Círculo do Nó Gamificado */}
                              <div
                                className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 transition-transform group-hover:scale-105 shadow-xs ${
                                  isConquered
                                    ? 'bg-emerald-600 text-white shadow-emerald-200'
                                    : isInProgress
                                    ? 'bg-amber-500 text-white shadow-amber-200 animate-pulse'
                                    : 'bg-slate-200 text-slate-500'
                                }`}
                              >
                                {isConquered ? (
                                  <Check className="w-5 h-5" />
                                ) : isInProgress ? (
                                  <Play className="w-5 h-5 ml-0.5" />
                                ) : (
                                  <Lock className="w-4 h-4" />
                                )}
                              </div>

                              <div>
                                <span className="text-[11px] font-bold text-slate-500 block leading-none">
                                  Passo #{node.stepNumber}
                                </span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border inline-block mt-1 ${getDifficultyMeta(node.difficulty).color}`}>
                                  {getDifficultyMeta(node.difficulty).label.split(' ')[0]}
                                </span>
                              </div>
                            </div>

                            <span className="text-xs font-black text-amber-600 flex items-center gap-0.5">
                              <Zap className="w-3.5 h-3.5" /> +{node.xpReward} XP
                            </span>
                          </div>

                          {/* Título & Descrição */}
                          <div>
                            <h4 className="font-extrabold text-sm sm:text-base text-slate-900 leading-snug group-hover:text-indigo-600 transition">
                              {node.title}
                            </h4>
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                              {node.description}
                            </p>
                          </div>

                          {/* Badge de Insígnia (se houver) */}
                          {node.badge && (
                            <div className={`p-2.5 rounded-xl border text-[11px] font-semibold flex items-center gap-2 ${
                              isConquered
                                ? 'bg-amber-50 border-amber-200 text-amber-900'
                                : 'bg-slate-100 border-slate-200 text-slate-500'
                            }`}>
                              <span className="text-base">{node.badge.icon}</span>
                              <span className="truncate">{node.badge.name}</span>
                            </div>
                          )}
                        </div>

                        {/* Barra de Progresso e Ação */}
                        <div className="pt-3 border-t border-slate-100 space-y-2">
                          <div className="flex items-center justify-between text-[11px] text-slate-500">
                            <span>
                              {isConquered
                                ? '100% Concluído'
                                : isInProgress
                                ? `${node.progressPercent}% em andamento`
                                : 'Bloqueado'}
                            </span>
                            {node.accuracyPercent && (
                              <span className="font-bold text-emerald-700">
                                {node.accuracyPercent}% precisão
                              </span>
                            )}
                          </div>

                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isConquered ? 'bg-emerald-500' : isInProgress ? 'bg-amber-500' : 'bg-slate-300'
                              }`}
                              style={{ width: `${node.progressPercent}%` }}
                            />
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[11px] font-semibold text-slate-400 font-mono">
                              {node.bnccSkill}
                            </span>
                            <span className="text-xs font-bold text-indigo-600 flex items-center gap-1 group-hover:translate-x-1 transition">
                              <span>Ver Marco</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
