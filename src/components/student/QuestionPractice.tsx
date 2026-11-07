import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Question, GradeLevel, KnowledgeArea } from '../../types';
import {
  Volume2,
  VolumeX,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Timer,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Filter,
  RefreshCw,
  Pause,
  Play
} from 'lucide-react';
import { simplifyQuestionForTEA, explainQuestionAPI } from '../../services/api';

interface QuestionPracticeProps {
  mode: 'serie' | 'enem';
}

export const QuestionPractice: React.FC<QuestionPracticeProps> = ({ mode }) => {
  const {
    gradeLevel,
    accessibility,
    questions,
    recordQuestionAnswer,
    speakText,
    stopSpeaking,
    isSpeaking,
    setIsPracticingQuestions,
    confirmLeaveIfPracticing,
    setStudentActiveTab,
    wrongQuestions,
    generateFlashcardForWrongAnswer,
    openGlossaryForTerm,
  } = useApp();

  const [generatingFlashcard, setGeneratingFlashcard] = useState(false);
  const [flashcardCreatedSuccess, setFlashcardCreatedSuccess] = useState(false);

  useEffect(() => {
    setIsPracticingQuestions(true);
    return () => {
      setIsPracticingQuestions(false);
    };
  }, [setIsPracticingQuestions]);

  // Filter questions based on series ratio or ENEM mode
  const filteredQuestions = React.useMemo(() => {
    if (mode === 'enem') {
      return questions;
    }
    // Modo Série: Prioriza a série do estudante
    return questions.filter((q) => {
      if (gradeLevel === '1º ano') {
        return q.gradeLevel === '1º ano';
      }
      if (gradeLevel === '2º ano') {
        return q.gradeLevel === '2º ano' || q.origin === 'Revisão Série Anterior';
      }
      return q.gradeLevel === '3º ano' || q.origin === 'Revisão Série Anterior' || q.origin === 'Formato ENEM';
    });
  }, [mode, gradeLevel, questions]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSimplifiedTEA, setShowSimplifiedTEA] = useState(false);
  const [simplifiedData, setSimplifiedData] = useState<{ statement: string; goal: string } | null>(null);
  const [loadingSimplified, setLoadingSimplified] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [loadingExplanation, setLoadingExplanation] = useState(false);

  // TDAH Pomodoro/Block timer (15-20 min)
  const [timeLeftSec, setTimeLeftSec] = useState(18 * 60); // 18 min
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  const currentQ: Question | undefined = filteredQuestions[currentIndex] || filteredQuestions[0];

  useEffect(() => {
    // Reset question state on switch
    setSelectedOption(null);
    setHasConfirmed(false);
    setShowConfirmModal(false);
    setShowSimplifiedTEA(false);
    setSimplifiedData(null);
    setAiExplanation(null);
    setFlashcardCreatedSuccess(false);
    setGeneratingFlashcard(false);
    stopSpeaking();
  }, [currentIndex, mode, gradeLevel]);

  // Timer loop for TDAH block
  useEffect(() => {
    if (!accessibility.tdahMode || !isTimerRunning) return;
    const interval = setInterval(() => {
      setTimeLeftSec((prev) => {
        if (prev <= 1) {
          return 18 * 60; // reset
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [accessibility.tdahMode, isTimerRunning]);

  if (!currentQ) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
        <p className="text-slate-600">Nenhuma questão disponível para esta configuração no momento.</p>
      </div>
    );
  }

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleSelectOption = (idx: number) => {
    if (hasConfirmed) return;
    setSelectedOption(idx);
  };

  const handleTriggerConfirm = () => {
    if (selectedOption === null) return;
    // TDAH mode requires explicit double check before submission
    if (accessibility.tdahMode) {
      setShowConfirmModal(true);
    } else {
      executeConfirm();
    }
  };

  const executeConfirm = () => {
    setShowConfirmModal(false);
    setHasConfirmed(true);
    const isCorrect = selectedOption === currentQ.correctAnswer;
    recordQuestionAnswer(currentQ.id, isCorrect, currentQ.area, 60, selectedOption ?? undefined);
  };

  const handleToggleSimplifiedTEA = async () => {
    if (showSimplifiedTEA) {
      setShowSimplifiedTEA(false);
      return;
    }
    setShowSimplifiedTEA(true);

    if (currentQ.simplifiedTEA && !simplifiedData) {
      setSimplifiedData({
        statement: currentQ.simplifiedTEA,
        goal: 'Compreender o conceito factual central da questão.',
      });
      return;
    }

    if (!simplifiedData) {
      setLoadingSimplified(true);
      try {
        const res = await simplifyQuestionForTEA(currentQ.title);
        setSimplifiedData({
          statement: res.simplifiedStatement,
          goal: res.keyGoal,
        });
      } catch (err) {
        setSimplifiedData({
          statement: currentQ.simplifiedTEA || currentQ.title,
          goal: 'Identificar a alternativa correta.',
        });
      } finally {
        setLoadingSimplified(false);
      }
    }
  };

  const handleRequestAiExplanation = async () => {
    if (aiExplanation || selectedOption === null) return;
    setLoadingExplanation(true);
    try {
      const exp = await explainQuestionAPI(
        currentQ.title,
        currentQ.options,
        currentQ.correctAnswer,
        selectedOption
      );
      setAiExplanation(exp);
    } catch {
      setAiExplanation(currentQ.explanation);
    } finally {
      setLoadingExplanation(false);
    }
  };

  // Determine proportion label
  const getProportionLabel = () => {
    if (mode === 'enem') return 'Modo ENEM Oficial • Proporção Dinâmica';
    if (gradeLevel === '1º ano') {
      return currentQ.origin === 'Formato ENEM'
        ? 'Formato ENEM (20% da cota)'
        : 'Conteúdo 1º ano E.M. (80% da cota)';
    }
    if (gradeLevel === '2º ano') {
      if (currentQ.origin === 'Revisão Série Anterior') return 'Revisão 1º ano (20% da cota)';
      if (currentQ.origin === 'Formato ENEM') return 'Formato ENEM (10% da cota)';
      return 'Conteúdo 2º ano E.M. (70% da cota)';
    }
    // 3º ano
    if (currentQ.origin === 'Revisão Série Anterior') return 'Revisão 1º/2º ano (25% da cota)';
    if (currentQ.origin === 'Formato ENEM') return 'Formato ENEM (15% da cota)';
    return 'Conteúdo 3º ano E.M. (60% da cota)';
  };

  return (
    <div className="space-y-4">
      {/* Top bar of question practice */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center flex-wrap gap-2">
          {/* Botão de Voltar ao Início com confirmação */}
          <button
            type="button"
            onClick={() => confirmLeaveIfPracticing(() => setStudentActiveTab('inicio'))}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 font-bold text-xs border border-slate-200 transition shadow-2xs"
            title="Voltar à tela inicial do aluno"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-rose-500" />
            <span>Voltar ao Início</span>
          </button>

          <span className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-xs">
            Questão {currentIndex + 1} de {filteredQuestions.length}
          </span>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
            {currentQ.area}
          </span>
          <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium hidden sm:inline">
            {getProportionLabel()}
          </span>
        </div>

        {/* TDAH Timer & Audio controls */}
        <div className="flex items-center gap-2">
          {accessibility.tdahMode && (
            <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 text-purple-900 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-xs">
              <Timer className={`w-4 h-4 text-purple-600 ${accessibility.focusMode ? '' : 'animate-spin'}`} />
              <span>Bloco: {formatTimer(timeLeftSec)}</span>
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="hover:text-purple-700 p-0.5 rounded transition"
                title={isTimerRunning ? 'Pausar' : 'Continuar'}
              >
                {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}

          {/* Dyslexia audio button */}
          <button
            onClick={() => {
              if (isSpeaking) {
                stopSpeaking();
              } else {
                const textToSpeak = `${currentQ.title}. Alternativas: ${currentQ.options
                  .map((opt, i) => `Opção ${String.fromCharCode(65 + i)}: ${opt}`)
                  .join('. ')}`;
                speakText(textToSpeak);
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
              isSpeaking
                ? 'bg-amber-600 text-white border-amber-600'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
            title="Ouvir enunciado e alternativas em voz alta"
          >
            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-indigo-600" />}
            <span className="hidden sm:inline">{isSpeaking ? 'Parar Áudio' : 'Ouvir com Voz'}</span>
          </button>

          {/* TEA direct language toggle */}
          <button
            onClick={handleToggleSimplifiedTEA}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
              showSimplifiedTEA
                ? 'bg-teal-600 text-white border-teal-600'
                : 'bg-white text-teal-700 border-teal-200 hover:bg-teal-50'
            }`}
            title="Versão simplificada com linguagem direta para TEA"
          >
            <Sparkles className="w-4 h-4 text-teal-400" />
            <span>{showSimplifiedTEA ? 'Texto Original' : 'Linguagem Direta (TEA)'}</span>
          </button>
        </div>
      </div>

      {/* Simplified TEA Box if active */}
      {showSimplifiedTEA && (
        <div className="bg-teal-50/90 border-2 border-teal-300 rounded-2xl p-4 text-teal-950 transition animate-fadeIn">
          <div className="flex items-center gap-2 mb-2 font-bold text-sm text-teal-900">
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
            <span>Versão em Linguagem Direta (Previsibilidade e Sem Metáforas)</span>
          </div>
          {loadingSimplified ? (
            <div className="flex items-center gap-2 text-xs text-teal-700 py-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              Adaptando estrutura sem ruído retórico...
            </div>
          ) : (
            <div className="space-y-2 text-sm leading-relaxed">
              <p className="font-medium bg-white/70 p-3 rounded-xl border border-teal-200">
                {simplifiedData?.statement || currentQ.simplifiedTEA}
              </p>
              {simplifiedData?.goal && (
                <p className="text-xs text-teal-800 font-semibold">
                  🎯 <strong>Objetivo direto:</strong> {simplifiedData.goal}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Main Question Card */}
      <div
        className={`bg-white rounded-3xl border border-slate-200 shadow-sm transition ${
          accessibility.focusMode
            ? 'p-8 sm:p-12 border-2 border-slate-300'
            : 'p-6 sm:p-8'
        } ${
          accessibility.dyslexiaMode ? 'font-serif tracking-wide leading-loose text-base' : 'text-sm'
        } ${accessibility.highContrast ? 'bg-black text-white border-yellow-400' : ''}`}
      >
        {/* Topic & Skill tag */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
            {currentQ.topic}
          </span>
          {currentQ.bnccSkill && !accessibility.focusMode && (
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
              Habilidade: {currentQ.bnccSkill}
            </span>
          )}
          {accessibility.focusMode && (
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
              🌿 Modo Foco TEA
            </span>
          )}
        </div>

        {/* Question Statement */}
        <div
          className={`leading-relaxed text-slate-900 font-medium ${
            accessibility.focusMode ? 'mb-8 text-lg leading-loose' : 'mb-6'
          } ${
            accessibility.fontSize === 'large'
              ? 'text-lg'
              : accessibility.fontSize === 'extralarge'
              ? 'text-xl'
              : 'text-base'
          }`}
        >
          {currentQ.title}
        </div>

        {/* Options */}
        <div className={accessibility.focusMode ? 'space-y-5' : 'space-y-3'}>
          {currentQ.options.map((opt, idx) => {
            const letter = String.fromCharCode(65 + idx);
            const isSelected = selectedOption === idx;
            const isCorrect = idx === currentQ.correctAnswer;

            let optionStyle =
              'border-slate-200 bg-slate-50/50 hover:bg-slate-100/80 hover:border-slate-300 text-slate-800';

            if (isSelected && !hasConfirmed) {
              optionStyle = 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-semibold ring-2 ring-indigo-500/30';
            }

            if (hasConfirmed) {
              if (isCorrect) {
                optionStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold ring-2 ring-emerald-400';
              } else if (isSelected && !isCorrect) {
                optionStyle = 'border-rose-400 bg-rose-50 text-rose-950 line-through opacity-85';
              } else {
                optionStyle = 'border-slate-200 bg-slate-50/40 text-slate-500';
              }
            }

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectOption(idx)}
                disabled={hasConfirmed}
                className={`w-full text-left rounded-2xl border transition flex items-start gap-4 ${
                  accessibility.focusMode
                    ? 'p-5 sm:p-6 text-base leading-relaxed border-2'
                    : 'p-4 text-sm'
                } ${optionStyle}`}
              >
                <span
                  className={`rounded-xl flex items-center justify-center font-bold shrink-0 transition ${
                    accessibility.focusMode ? 'w-9 h-9 text-sm' : 'w-7 h-7 text-xs'
                  } ${
                    isSelected && !hasConfirmed
                      ? 'bg-indigo-600 text-white'
                      : hasConfirmed && isCorrect
                      ? 'bg-emerald-600 text-white'
                      : hasConfirmed && isSelected && !isCorrect
                      ? 'bg-rose-500 text-white'
                      : 'bg-white border border-slate-300 text-slate-700'
                  }`}
                >
                  {letter}
                </span>
                <span className="flex-1 pt-0.5 leading-relaxed">{opt}</span>
                {hasConfirmed && isCorrect && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                )}
                {hasConfirmed && isSelected && !isCorrect && (
                  <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                )}
              </button>
            );
          })}
        </div>

        {/* Action button */}
        {!hasConfirmed ? (
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleTriggerConfirm}
              disabled={selectedOption === null}
              className={`px-6 py-3 rounded-2xl font-bold text-sm shadow-md transition flex items-center gap-2 ${
                selectedOption !== null
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white transform hover:scale-[1.01]'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>Confirmar Resposta</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Post-answer pedagogical feedback */
          <div className="mt-6 pt-6 border-t border-slate-100 space-y-4 animate-fadeIn">
            <div
              className={`p-4 rounded-2xl flex items-start gap-3 ${
                selectedOption === currentQ.correctAnswer
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                  : 'bg-amber-50 border border-amber-200 text-amber-900'
              }`}
            >
              {selectedOption === currentQ.correctAnswer ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div>
                <h4 className="font-bold text-sm">
                  {selectedOption === currentQ.correctAnswer
                    ? 'Resposta correta! Excelente trabalho!'
                    : 'Não desanime! Toda tentativa é um aprendizado concreto.'}
                </h4>
                <p className="text-xs mt-1 leading-relaxed text-slate-700">
                  {currentQ.explanation}
                </p>
              </div>
            </div>

            {/* AI step-by-step resolution button */}
            {!aiExplanation && (
              <button
                onClick={handleRequestAiExplanation}
                disabled={loadingExplanation}
                className="flex items-center gap-2 text-xs font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl transition"
              >
                <Sparkles className="w-4 h-4" />
                {loadingExplanation
                  ? 'Consultando IA Pedagógica...'
                  : 'Ver Resolução Detalhada Passo a Passo com IA'}
              </button>
            )}

            {aiExplanation && (
              <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100 text-slate-800 text-xs space-y-2">
                <div className="font-bold text-indigo-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  Resolução Orientada Passo a Passo:
                </div>
                <div className="whitespace-pre-line leading-relaxed text-slate-700">
                  {aiExplanation}
                </div>
              </div>
            )}

            {/* Ação de Fixação: Flashcard Automático para Erro */}
            {selectedOption !== currentQ.correctAnswer && (
              <div className="p-3.5 bg-amber-50/80 border border-amber-200/90 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                    ⚡
                  </div>
                  <div>
                    <p className="text-xs font-bold text-amber-950">
                      Fixação Ativa: Extrair Conceito-Chave com IA
                    </p>
                    <p className="text-[11px] text-amber-800">
                      Transforme este erro em um Flashcard automático no Sistema de Repetição Espaçada.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {flashcardCreatedSuccess ? (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 border border-emerald-300 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Flashcard Adicionado!
                    </span>
                  ) : (
                    <button
                      onClick={async () => {
                        setGeneratingFlashcard(true);
                        const wrongMatch = wrongQuestions.find((w) => w.questionId === currentQ.id);
                        if (wrongMatch) {
                          const ok = await generateFlashcardForWrongAnswer(wrongMatch.id);
                          if (ok) setFlashcardCreatedSuccess(true);
                        }
                        setGeneratingFlashcard(false);
                      }}
                      disabled={generatingFlashcard}
                      className="text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-1.5 rounded-xl transition shadow-2xs flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      {generatingFlashcard ? 'Extraindo Conceito...' : 'Criar Flashcard Agora'}
                    </button>
                  )}

                  <button
                    onClick={() => {
                      confirmLeaveIfPracticing(() => {
                        setStudentActiveTab('flashcards');
                      });
                    }}
                    className="text-xs font-semibold text-amber-900 hover:text-amber-950 bg-white hover:bg-amber-100/80 border border-amber-300 px-3 py-1.5 rounded-xl transition"
                  >
                    Ver Meus Flashcards →
                  </button>

                  <button
                    onClick={() => {
                      confirmLeaveIfPracticing(() => {
                        openGlossaryForTerm(currentQ.topic);
                      });
                    }}
                    className="text-xs font-semibold text-teal-800 hover:text-teal-950 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-3 py-1.5 rounded-xl transition flex items-center gap-1"
                    title={`Ver definição e exemplos de ${currentQ.topic} no Glossário`}
                  >
                    <BookOpen className="w-3.5 h-3.5 text-teal-600" />
                    <span>Glossário: {currentQ.topic}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Next question button */}
            <div className="flex justify-between items-center pt-2">
              <span className="text-xs text-slate-500">
                Progresso: {currentIndex + 1} de {filteredQuestions.length} questões
              </span>
              <button
                onClick={() => {
                  if (currentIndex < filteredQuestions.length - 1) {
                    setCurrentIndex(currentIndex + 1);
                  } else {
                    setCurrentIndex(0);
                  }
                }}
                className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition"
              >
                <span>Próxima Questão</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* TDAH Anti-Impulsivity Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 animate-scaleUp">
            <div className="flex items-center gap-3 text-purple-700 mb-3">
              <div className="p-2 bg-purple-100 rounded-xl">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Pausa de Confirmação (Modo TDAH)
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Você selecionou a <strong>Alternativa {selectedOption !== null ? String.fromCharCode(65 + selectedOption) : ''}</strong>.
              Deseja reler rapidamente o comando da questão para ter certeza, ou confirmar sua resposta agora?
            </p>

            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                Quero Reler
              </button>
              <button
                onClick={executeConfirm}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-md transition"
              >
                Tenho Certeza, Confirmar!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
