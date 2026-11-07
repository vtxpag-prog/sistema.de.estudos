import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { EssayCorrectionResult, EssayTheme, TdahActionableStep } from '../../types';
import { gradeEssayAPI } from '../../services/api';
import {
  PenTool,
  Mic,
  MicOff,
  Sparkles,
  BookOpen,
  Award,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  RefreshCw,
  FileText,
  Volume2,
  VolumeX,
  Lightbulb,
  Heart,
  SpellCheck,
  Check,
  Copy,
  ChevronDown,
  ChevronUp,
  Layers,
  ListTodo,
  Eye,
  SlidersHorizontal,
  ArrowRight,
  ShieldAlert,
  Flame,
} from 'lucide-react';

export const AiEssayGraderModule: React.FC = () => {
  const {
    gradeLevel,
    accessibility,
    essayThemes,
    incrementEssayCount,
    addEssaySubmission,
    speakText,
    isSpeaking,
    stopSpeaking,
  } = useApp();

  // Selected Theme
  const [selectedThemeId, setSelectedThemeId] = useState<string>(essayThemes[0].id);
  const [customThemeTitle, setCustomThemeTitle] = useState<string>('');
  const [isUsingCustomTheme, setIsUsingCustomTheme] = useState<boolean>(false);

  // Editor mode: 'continuous' (folha oficial ENEM) vs 'guided_blocks' (4 blocos TDAH)
  const [editorMode, setEditorMode] = useState<'continuous' | 'guided_blocks'>('guided_blocks');

  // Text inputs
  const [essayText, setEssayText] = useState<string>('');
  // Guided blocks state
  const [introBlock, setIntroBlock] = useState<string>('');
  const [dev1Block, setDev1Block] = useState<string>('');
  const [dev2Block, setDev2Block] = useState<string>('');
  const [conclBlock, setConclBlock] = useState<string>('');

  // Web Speech API Voice Dictation State
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);
  const recognitionRef = useRef<any>(null);

  // Correction evaluation state
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<EssayCorrectionResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedFeedback, setCopiedFeedback] = useState<boolean>(false);

  // TDAH Checklist interactive completion state
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  // Active theme reference
  const activeTheme = essayThemes.find((t) => t.id === selectedThemeId) || essayThemes[0];
  const effectiveTheme = isUsingCustomTheme && customThemeTitle.trim() ? customThemeTitle.trim() : activeTheme.title;

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'pt-BR';

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          let transcriptText = item[0].transcript;

          // Process spoken punctuation helpers in Portuguese
          transcriptText = transcriptText
            .replace(/\bvírgula\b/gi, ',')
            .replace(/\bponto final\b/gi, '.')
            .replace(/\bponto de interrogação\b/gi, '?')
            .replace(/\bponto de exclamação\b/gi, '!')
            .replace(/\bdois pontos\b/gi, ':')
            .replace(/\bnovo parágrafo\b/gi, '\n\n')
            .replace(/\bparágrafo\b/gi, '\n\n');

          if (item.isFinal) {
            finalTranscript += transcriptText + ' ';
          } else {
            currentInterim += transcriptText;
          }
        }

        setInterimTranscript(currentInterim);

        if (finalTranscript) {
          setEssayText((prev) => {
            const separator = prev && !prev.endsWith(' ') && !prev.endsWith('\n') ? ' ' : '';
            return prev + separator + finalTranscript;
          });
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setSpeechError('Permissão para uso do microfone não concedida pelo navegador.');
        } else if (event.error === 'no-speech') {
          // ignore no speech timeout
        } else {
          setSpeechError(`Aviso de voz: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimTranscript('');
      };

      recognitionRef.current = recognition;
    } catch (e) {
      console.warn('Error setting up Web Speech API:', e);
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, []);

  // Toggle voice dictation
  const toggleListening = () => {
    if (!speechSupported) {
      alert('Seu navegador não possui suporte à Web Speech API. Recomendamos o Google Chrome ou Edge.');
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch {}
      setIsListening(false);
    } else {
      setSpeechError(null);
      try {
        recognitionRef.current?.start();
      } catch (err: any) {
        console.warn('Could not start recognition:', err);
      }
    }
  };

  // Sync guided blocks to continuous text
  useEffect(() => {
    if (editorMode === 'guided_blocks') {
      const parts = [introBlock, dev1Block, dev2Block, conclBlock].filter((p) => p.trim().length > 0);
      setEssayText(parts.join('\n\n'));
    }
  }, [introBlock, dev1Block, dev2Block, conclBlock, editorMode]);

  // Synchronize when switching to guided blocks from continuous
  const switchToGuidedBlocks = () => {
    const paragraphs = essayText
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    if (paragraphs.length >= 1) setIntroBlock(paragraphs[0] || '');
    if (paragraphs.length >= 2) setDev1Block(paragraphs[1] || '');
    if (paragraphs.length >= 3) setDev2Block(paragraphs[2] || '');
    if (paragraphs.length >= 4) setConclBlock(paragraphs.slice(3).join('\n\n') || '');

    setEditorMode('guided_blocks');
  };

  // Metrics
  const wordCount = essayText.trim() ? essayText.trim().split(/\s+/).length : 0;
  const characterCount = essayText.length;
  const estimatedLines = Math.max(1, Math.ceil(characterCount / 70));
  const paragraphsCount = essayText
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0).length;

  // Evaluate Essay with Gemini API
  const handleEvaluateEssay = async () => {
    if (wordCount < 20) {
      setErrorMsg('Escreva ou dite pelo menos 20 palavras para que a IA possa avaliar as 5 competências do ENEM.');
      return;
    }
    setErrorMsg(null);
    setLoading(true);

    try {
      const evaluation = await gradeEssayAPI(
        essayText,
        effectiveTheme,
        gradeLevel,
        accessibility
      );
      setResult(evaluation);
      setCompletedSteps(new Set());
      incrementEssayCount();

      // Determinar área do conhecimento pedagógica vinculada ao tema
      let inferredArea: 'Linguagens, Códigos e suas Tecnologias' | 'Ciências Humanas e suas Tecnologias' | 'Ciências da Natureza e suas Tecnologias' | 'Matemática e suas Tecnologias' = 'Ciências Humanas e suas Tecnologias';
      let inferredShort: 'LC' | 'CH' | 'CN' | 'MT' = 'CH';

      const lowerTheme = effectiveTheme.toLowerCase();
      if (lowerTheme.includes('digital') || lowerTheme.includes('linguag') || lowerTheme.includes('comunica') || lowerTheme.includes('leitura') || lowerTheme.includes('literatur') || lowerTheme.includes('sinais')) {
        inferredArea = 'Linguagens, Códigos e suas Tecnologias';
        inferredShort = 'LC';
      } else if (lowerTheme.includes('natureza') || lowerTheme.includes('meio ambiente') || lowerTheme.includes('biodiversidade') || lowerTheme.includes('sustentab') || lowerTheme.includes('saúde') || lowerTheme.includes('clima')) {
        inferredArea = 'Ciências da Natureza e suas Tecnologias';
        inferredShort = 'CN';
      } else if (lowerTheme.includes('matemática') || lowerTheme.includes('financeir') || lowerTheme.includes('dados') || lowerTheme.includes('estatístic') || lowerTheme.includes('algoritmo')) {
        inferredArea = 'Matemática e suas Tecnologias';
        inferredShort = 'MT';
      }

      const now = new Date();
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const displayDate = `${monthNames[now.getMonth()]}/${now.getFullYear()}`;

      addEssaySubmission({
        id: `essay-${Date.now()}`,
        themeTitle: effectiveTheme,
        date: now.toISOString().split('T')[0],
        displayDate,
        timestamp: now.getTime(),
        knowledgeArea: inferredArea,
        knowledgeAreaShort: inferredShort,
        totalScore: evaluation.totalScore,
        c1: evaluation.competencies.find((c) => c.number === 1)?.score || 0,
        c2: evaluation.competencies.find((c) => c.number === 2)?.score || 0,
        c3: evaluation.competencies.find((c) => c.number === 3)?.score || 0,
        c4: evaluation.competencies.find((c) => c.number === 4)?.score || 0,
        c5: evaluation.competencies.find((c) => c.number === 5)?.score || 0,
        interventionElementsCount: evaluation.interventionElements?.totalIdentified || 0,
        feedbackSummary: evaluation.encouragementMessage || 'Redação corrigida com sucesso!',
        mode: isListening ? 'Voz' : 'IA',
      });
    } catch (err: any) {
      setErrorMsg('Houve uma instabilidade na conexão com o avaliador. Tente novamente em instantes.');
    } finally {
      setLoading(false);
    }
  };

  // Toggle step in TDAH checklist
  const toggleStepCompleted = (stepId: string) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepId)) {
        next.delete(stepId);
      } else {
        next.add(stepId);
      }
      return next;
    });
  };

  // Copy full feedback to clipboard
  const handleCopyFeedback = () => {
    if (!result) return;
    const reportText = `[AVALIAÇÃO OFICIAL DE REDAÇÃO ENEM - 5 COMPETÊNCIAS]
Tema: ${effectiveTheme}
Nota Total Estimada: ${result.totalScore} / 1000 pts

COMPETÊNCIAS:
${result.competencies.map((c) => `• C${c.number} - ${c.name}: ${c.score}/200 pts\n  ${c.feedback}`).join('\n')}

PONTOS FORTES:
${result.strengths.map((s) => `+ ${s}`).join('\n')}

OPORTUNIDADES DE MELHORIA:
${result.improvements.map((i) => `* ${i}`).join('\n')}

MENSAGEM PEDAGÓGICA:
${result.encouragementMessage}`;

    navigator.clipboard.writeText(reportText);
    setCopiedFeedback(true);
    setTimeout(() => setCopiedFeedback(false), 2500);
  };

  // Load sample model text
  const handleLoadSample = () => {
    const sample = `No contexto contemporâneo brasileiro, a garantia dos direitos fundamentais ainda enfrenta entraves estruturais de grande magnitude. Nesse sentido, a Constituição Federal de 1988 — apelidada de "Constituição Cidadã" — promulgou a dignidade humana como cláusula pétrea inegociável da República.\n\nContudo, constata-se que a omissão estatal e a desinformação coletiva afastam parcelas expressivas da população desse ideal. Sob a perspectiva do sociólogo Gilberto Dimenstein em "O Cidadão de Papel", leis perfeitas no papel não garantem emancipação quando a aplicabilidade prática é negligenciada pelo poder público.\n\nAdemais, a ausência de debates aprofundados nas escolas perpetua estigmas e invisibilidades sociais, impedindo que a juventude compreenda a importância da cidadania participativa.\n\nPortanto, medidas urgentes são necessárias. Cabe ao Ministério da Educação, em parceria com as Secretarias Estaduais, implementar oficinas curriculares contínuas e produzir cartilhas informativas digitais, com o intuito de conscientizar os estudantes e consolidar uma cidadania substantiva.`;

    setEssayText(sample);
    const paragraphs = sample.split('\n\n');
    setIntroBlock(paragraphs[0] || '');
    setDev1Block(paragraphs[1] || '');
    setDev2Block(paragraphs[2] || '');
    setConclBlock(paragraphs[3] || '');
    setResult(null);
    setErrorMsg(null);
  };

  return (
    <div className={`space-y-8 animate-fadeIn ${accessibility.focusMode ? 'max-w-4xl mx-auto' : ''}`}>
      {/* HEADER PRINCIPAL */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-indigo-950 via-slate-900 to-indigo-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-10 w-72 h-72 rounded-full bg-teal-500/10 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-teal-300 text-xs font-bold tracking-wide uppercase">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Avaliação Formativa • 5 Competências do ENEM ({gradeLevel})</span>
            </div>

            <div className="flex items-center gap-2">
              {/* Badge de Acolhimento Neurodivergente */}
              <span className="px-3 py-1 rounded-xl text-xs font-bold bg-white/10 border border-white/20 text-slate-200">
                Acessível para TDAH & TEA
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              Correção de Redação com IA
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm max-w-3xl leading-relaxed">
              Escreva por partes ou dite sua redação pelo microfone via Web Speech API. O Gemini analisa os 5 eixos da banca oficial do ENEM (C1 a C5), fornecendo checklist rápido contra sobrecarga mental e retorno detalhado da proposta de intervenção.
            </p>
          </div>
        </div>
      </div>

      {/* PAINEL DE SELEÇÃO DE TEMA & TEXTOS MOTIVADORES */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            <h3 className="font-extrabold text-sm text-slate-900">
              Tema da Proposta de Redação
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsUsingCustomTheme(!isUsingCustomTheme)}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-bold underline"
            >
              {isUsingCustomTheme ? 'Escolher temas sugeridos' : 'Digitar outro tema'}
            </button>
          </div>
        </div>

        {isUsingCustomTheme ? (
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Título do Tema Personalizado:
            </label>
            <input
              type="text"
              value={customThemeTitle}
              onChange={(e) => setCustomThemeTitle(e.target.value)}
              placeholder="Ex: Desafios para a inclusão de pessoas neurodivergentes no mercado de trabalho"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {essayThemes.map((th) => (
                <button
                  key={th.id}
                  onClick={() => {
                    setSelectedThemeId(th.id);
                    setResult(null);
                  }}
                  className={`text-left p-3 rounded-2xl border text-xs font-bold transition flex items-center justify-between ${
                    selectedThemeId === th.id
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-950 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="line-clamp-2">{th.title}</span>
                  {selectedThemeId === th.id && (
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 shrink-0 ml-1"></span>
                  )}
                </button>
              ))}
            </div>

            {/* Texto Motivador do Tema Ativo */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                  Texto Motivador:
                </span>
                <button
                  onClick={() => {
                    if (isSpeaking) {
                      stopSpeaking();
                    } else {
                      speakText(`${activeTheme.title}. ${activeTheme.contextText}`);
                    }
                  }}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{isSpeaking ? 'Parar leitura' : 'Ouvir texto'}</span>
                </button>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed italic">
                &quot;{activeTheme.contextText}&quot;
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase mr-1">
                  Repertórios sugeridos:
                </span>
                {activeTheme.suggestedRepertoire.map((rep, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-lg bg-indigo-100/70 text-indigo-800 text-[11px] font-semibold"
                  >
                    {rep}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ÁREA DE ESCRITA & DITADO POR VOZ */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
        {/* BARRA SUPERIOR DO EDITOR: MODO DE ESCRITA & DITADO POR VOZ */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          {/* Alternador de Modo: Blocos TDAH vs Folha Contínua */}
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl">
            <button
              onClick={switchToGuidedBlocks}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                editorMode === 'guided_blocks'
                  ? 'bg-white text-indigo-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>Escrita Guiada em 4 Blocos (TDAH/TEA)</span>
            </button>

            <button
              onClick={() => setEditorMode('continuous')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                editorMode === 'continuous'
                  ? 'bg-white text-indigo-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PenTool className="w-3.5 h-3.5 text-indigo-600" />
              <span>Folha Oficial ENEM (Contínuo)</span>
            </button>
          </div>

          {/* CONTROLE DE DITADO POR VOZ (WEB SPEECH API) */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleListening}
              className={`px-4 py-2 rounded-2xl text-xs font-black transition flex items-center gap-2 shadow-xs cursor-pointer ${
                isListening
                  ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-200'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
              title="Clique para ditar seu texto por voz pelo microfone"
            >
              {isListening ? (
                <>
                  <MicOff className="w-4 h-4" />
                  <span>Gravando Fala (Clique para Pausar)</span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4" />
                  <span>Ditar Redação por Voz (Web Speech)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* FEEDBACK DE VOZ AO VIVO */}
        {isListening && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between text-xs text-rose-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
              <strong>Microfone Ativo:</strong>
              <span className="italic">{interimTranscript || 'Fale pausadamente... (Diga "ponto", "vírgula" ou "novo parágrafo")'}</span>
            </div>
            <button
              onClick={toggleListening}
              className="text-[11px] font-bold underline text-rose-900"
            >
              Finalizar Ditado
            </button>
          </div>
        )}

        {speechError && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{speechError}</span>
          </div>
        )}

        {/* MÉTRICAS EM TEMPO REAL: LINHAS, PALAVRAS, PARÁGRAFOS */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
          <div className="flex items-center gap-4 text-slate-700 font-semibold">
            <span>
              <strong>{wordCount}</strong> palavras
            </span>
            <span>•</span>
            <span
              className={
                estimatedLines > 30
                  ? 'text-rose-600 font-bold'
                  : estimatedLines < 7 && estimatedLines > 1
                  ? 'text-amber-600 font-bold'
                  : 'text-slate-700'
              }
            >
              ~<strong>{estimatedLines}</strong> / 30 linhas oficiais
            </span>
            <span>•</span>
            <span>
              <strong>{paragraphsCount}</strong> / 4 parágrafos recomendados
            </span>
          </div>

          <div className="text-[11px] text-slate-500 font-medium">
            {estimatedLines > 30 ? (
              <span className="text-rose-600 font-bold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Atenção: O ENEM permite no máximo 30 linhas!
              </span>
            ) : estimatedLines < 7 && wordCount > 10 ? (
              <span className="text-amber-600 font-bold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Redações com menos de 7 linhas são zeradas no ENEM!
              </span>
            ) : (
              <span>Estrutura dentro do padrão do ENEM</span>
            )}
          </div>
        </div>

        {/* RENDERIZAÇÃO DOS CAMPOS DE TEXTO: GUIADO EM 4 BLOCOS VS CONTÍNUO */}
        {editorMode === 'guided_blocks' ? (
          <div className="space-y-4">
            <div className="p-3.5 bg-indigo-50/60 rounded-2xl border border-indigo-100 text-xs text-indigo-900 leading-relaxed">
              💡 <strong>Modo Guiado para TDAH & TEA:</strong> Em vez de encarar uma folha em branco inteira, divida seu pensamento em 4 blocos objetivos. Conforme você digita ou dita em cada caixa, o texto completo é montado automaticamente!
            </div>

            {/* Bloco 1: Introdução */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-indigo-950 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">1</span>
                  Parágrafo 1: Introdução & Tese Central
                </span>
                <span className="text-[11px] text-slate-500">Apresente o tema e 2 argumentos centrais</span>
              </div>
              <textarea
                value={introBlock}
                onChange={(e) => setIntroBlock(e.target.value)}
                rows={3}
                placeholder="No contexto brasileiro contemporâneo, a garantia dos direitos... Nesse sentido, observa-se que a omissão estatal e a desinformação..."
                className="w-full p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-xs text-slate-900"
              />
            </div>

            {/* Bloco 2: Desenvolvimento 1 */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-indigo-950 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">2</span>
                  Parágrafo 2: Desenvolvimento 1 (Causa 1 + Repertório)
                </span>
                <span className="text-[11px] text-slate-500">Defenda a 1ª causa com um filósofo ou dado histórico</span>
              </div>
              <textarea
                value={dev1Block}
                onChange={(e) => setDev1Block(e.target.value)}
                rows={3}
                placeholder="Em primeira análise, constata-se que... Sob a ótica do pensador X, quando a sociedade ignora tal fator..."
                className="w-full p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-xs text-slate-900"
              />
            </div>

            {/* Bloco 3: Desenvolvimento 2 */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-indigo-950 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">3</span>
                  Parágrafo 3: Desenvolvimento 2 (Causa 2 / Consequência)
                </span>
                <span className="text-[11px] text-slate-500">Aprofunde a 2ª causa com conectivo interparágrafo</span>
              </div>
              <textarea
                value={dev2Block}
                onChange={(e) => setDev2Block(e.target.value)}
                rows={3}
                placeholder="Ademais, é imperioso pontuar que... Esse cenário gera como consequência direta o agravamento de..."
                className="w-full p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-xs text-slate-900"
              />
            </div>

            {/* Bloco 4: Conclusão & Proposta */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-indigo-950 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">4</span>
                  Parágrafo 4: Conclusão & Proposta de Intervenção (C5)
                </span>
                <span className="text-[11px] text-emerald-700 font-bold">5 Elementos: Quem + O que + Como + Para que + Detalhe</span>
              </div>
              <textarea
                value={conclBlock}
                onChange={(e) => setConclBlock(e.target.value)}
                rows={3}
                placeholder="Portanto, medidas urgentes são necessárias. Cabe ao Ministério da Educação, por meio de verbas públicas direcionadas, implementar..."
                className="w-full p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-xs text-slate-900"
              />
            </div>
          </div>
        ) : (
          /* MODO CONTÍNUO: TEXTAREA OFICIAL */
          <div className="relative">
            <textarea
              value={essayText}
              onChange={(e) => setEssayText(e.target.value)}
              placeholder="Digite ou dite sua redação completa aqui. Organize seu texto em cerca de 4 parágrafos bem espaçados..."
              rows={14}
              className={`w-full p-4 rounded-2xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 resize-y leading-relaxed text-slate-800 transition ${
                accessibility.dyslexiaMode
                  ? 'font-serif tracking-wide leading-loose text-base'
                  : 'text-sm'
              } ${accessibility.highContrast ? 'bg-black text-white border-yellow-400' : 'bg-slate-50/40'}`}
            />
          </div>
        )}

        {/* ERROS OU AVISOS */}
        {errorMsg && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* BOTÕES DE AÇÃO: EXEMPLO E ENVIAR PARA CORREÇÃO IA */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={handleLoadSample}
            className="text-xs text-slate-500 hover:text-indigo-600 font-semibold underline"
          >
            Carregar Exemplo Modelo do ENEM (900+ pts)
          </button>

          <button
            onClick={handleEvaluateEssay}
            disabled={loading || wordCount < 20}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-7 py-3 rounded-2xl font-black text-xs shadow-md hover:shadow-indigo-500/20 transition flex items-center justify-center gap-2 disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Analisando as 5 Competências com IA...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Avaliar Redação nas 5 Competências</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* PAINEL DE RESULTADOS DA CORREÇÃO OFICIAL COM IA */}
      {result && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-lg space-y-8 animate-fadeIn">
          {/* HEADER DA NOTA: PONTUAÇÃO GERAL (0 A 1000) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 p-6 rounded-3xl bg-linear-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white shadow-md">
            <div className="space-y-1">
              <span className="text-xs font-bold text-teal-300 uppercase tracking-wider block">
                Parecer Oficial ENEM ({gradeLevel})
              </span>
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Nota Total: {result.totalScore} / 1000 pontos
              </h3>
              <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                Avaliação calibrada pela Cartilha do Participante ENEM, considerando as adaptações inclusivas do seu perfil.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-20 h-20 rounded-2xl bg-teal-500 text-slate-950 flex flex-col items-center justify-center font-black shadow-lg shrink-0">
                <span className="text-2xl leading-none">{result.totalScore}</span>
                <span className="text-[10px] uppercase font-bold tracking-wider mt-1">Pontos</span>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    if (isSpeaking) {
                      stopSpeaking();
                    } else {
                      speakText(
                        `Nota total: ${result.totalScore} pontos de mil. Mensagem do avaliador: ${result.encouragementMessage}.`
                      );
                    }
                  }}
                  className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-1.5"
                  title="Ouvir resultado da correção"
                >
                  {isSpeaking ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-teal-300" />}
                  <span>{isSpeaking ? 'Parar' : 'Ouvir Parecer'}</span>
                </button>

                <button
                  onClick={handleCopyFeedback}
                  className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-1.5"
                  title="Copiar relatório completo"
                >
                  {copiedFeedback ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedFeedback ? 'Copiado!' : 'Copiar'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* CHECKLIST DE MICRO-TAREFAS TDAH (QUICK WINS) */}
          {result.tdahChecklist && result.tdahChecklist.length > 0 && (
            <div className="p-6 bg-amber-50/80 rounded-3xl border border-amber-200/90 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                    ⚡
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-amber-950">
                      Checklist TDAH: Micro-Tarefas de Melhoria Rápida
                    </h4>
                    <p className="text-[11px] text-amber-800">
                      Passos curtos e diretos (5 a 10 min) para aumentar sua pontuação sem cansaço mental.
                    </p>
                  </div>
                </div>

                <span className="text-xs font-extrabold text-amber-900 px-2.5 py-1 rounded-full bg-amber-200/60">
                  {completedSteps.size} de {result.tdahChecklist.length} concluídos
                </span>
              </div>

              <div className="space-y-2.5">
                {result.tdahChecklist.map((step) => {
                  const isDone = completedSteps.has(step.id);
                  return (
                    <div
                      key={step.id}
                      onClick={() => toggleStepCompleted(step.id)}
                      className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-start gap-3 ${
                        isDone
                          ? 'bg-emerald-50/80 border-emerald-300 opacity-80'
                          : 'bg-white border-amber-200/90 hover:border-amber-400 shadow-2xs'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isDone}
                        onChange={() => {}}
                        className="w-4 h-4 rounded-md text-emerald-600 focus:ring-emerald-500 mt-0.5 cursor-pointer"
                      />
                      <div className="space-y-1 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-1">
                          <span
                            className={`text-xs font-bold ${
                              isDone ? 'line-through text-slate-500' : 'text-slate-900'
                            }`}
                          >
                            Passo {step.order}: {step.task}
                          </span>
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                            Competência {step.competenceRef} • ~{step.estimatedMinutes} min
                          </span>
                        </div>
                        <p className="text-[11px] text-amber-900 font-medium">
                          🎯 Impacto: {step.quickWin}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* FEEDBACK LITERAL & DIRETO PARA O MODO TEA */}
          {result.teaLiteralFeedback && (
            <div className="p-6 bg-teal-50/80 rounded-3xl border border-teal-200/90 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-teal-950">
                    Modo Direto TEA: Pontos Claros & Literais
                  </h4>
                  <p className="text-[11px] text-teal-800">
                    Comunicação objetiva sem metáforas ou interpretações implícitas.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-teal-100 space-y-2">
                  <span className="text-xs font-black text-emerald-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    O que está correto e deve ser mantido:
                  </span>
                  <ul className="text-xs text-slate-700 space-y-1.5">
                    {result.teaLiteralFeedback.positiveDirect.map((p, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-500 font-bold">•</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-teal-100 space-y-2">
                  <span className="text-xs font-black text-rose-700 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    O que você deve alterar no próximo rascunho:
                  </span>
                  <ul className="text-xs text-slate-700 space-y-1.5">
                    {result.teaLiteralFeedback.toChangeDirect.map((p, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-rose-500 font-bold">•</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {result.teaLiteralFeedback.whatToDoNext && (
                <div className="p-3.5 bg-teal-100/70 rounded-2xl text-xs text-teal-950 font-semibold flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-teal-700 shrink-0" />
                  <span>
                    <strong>Próximo passo literal:</strong> {result.teaLiteralFeedback.whatToDoNext}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* RAIO-X DA COMPETÊNCIA 5: OS 5 ELEMENTOS OBRIGATÓRIOS DA PROPOSTA */}
          {result.interventionElements && (
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                    C5
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">
                      Raio-X da Proposta de Intervenção (Competência 5)
                    </h4>
                    <p className="text-[11px] text-slate-600">
                      Critério oficial da Cartilha do ENEM: cada elemento vale 40 pontos (total = 200).
                    </p>
                  </div>
                </div>

                <span className="text-xs font-black px-3 py-1 rounded-full bg-purple-100 text-purple-900 border border-purple-200">
                  {result.interventionElements.totalIdentified} de 5 Elementos Identificados
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                {[
                  { key: 'agente', label: '1. Agente (Quem?)', data: result.interventionElements.agente },
                  { key: 'acao', label: '2. Ação (O que?)', data: result.interventionElements.acao },
                  { key: 'modoMeio', label: '3. Meio/Modo (Como?)', data: result.interventionElements.modoMeio },
                  { key: 'efeitoFinalidade', label: '4. Efeito (Para que?)', data: result.interventionElements.efeitoFinalidade },
                  { key: 'detalhamento', label: '5. Detalhe (Extra)', data: result.interventionElements.detalhamento },
                ].map((item) => (
                  <div
                    key={item.key}
                    className={`p-3.5 rounded-2xl border text-xs flex flex-col justify-between space-y-2 ${
                      item.data.identified
                        ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                        : 'bg-rose-50/70 border-rose-300 text-rose-950'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between font-black">
                        <span>{item.label}</span>
                        {item.data.identified ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-rose-600" />
                        )}
                      </div>
                      <p className="text-[11px] font-semibold italic">
                        &quot;{item.data.text || 'Não encontrado'}&quot;
                      </p>
                    </div>
                    <p className="text-[10px] leading-tight text-slate-600">
                      {item.data.feedback}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DETALHAMENTO DAS 5 COMPETÊNCIAS COM BARRAS DE NOTA */}
          <div className="space-y-4">
            <h4 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-600" />
              Detalhamento das 5 Competências do ENEM
            </h4>

            <div className="space-y-3">
              {result.competencies.map((comp) => {
                const percent = Math.round((comp.score / 200) * 100);
                return (
                  <div
                    key={comp.number}
                    className="p-5 rounded-3xl border border-slate-200 bg-white hover:border-indigo-300 shadow-2xs space-y-3 transition"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xs font-black shadow-2xs">
                          C{comp.number}
                        </span>
                        <div>
                          <h5 className="font-extrabold text-sm text-slate-900">{comp.name}</h5>
                          {comp.levelTitle && (
                            <span className="text-[11px] font-semibold text-indigo-600">
                              {comp.levelTitle}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-32 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              comp.score >= 160
                                ? 'bg-emerald-500'
                                : comp.score >= 120
                                ? 'bg-indigo-600'
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                        <span className="font-black text-sm text-slate-900 min-w-16 text-right">
                          {comp.score} / 200
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      {comp.feedback}
                    </p>

                    {comp.practicalTip && (
                      <div className="flex items-center gap-2 text-xs text-indigo-900 font-semibold pt-1">
                        <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>
                          <strong>Dica Prática:</strong> {comp.practicalTip}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* SUGESTÃO DE REESCRITA EXEMPLAR (MODELO CONCRETO) */}
          {result.exemplaryRewriteSnippet && (
            <div className="p-6 bg-indigo-50/70 rounded-3xl border border-indigo-200 space-y-3">
              <div className="flex items-center gap-2 font-extrabold text-sm text-indigo-950">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Exemplo Prático de Reescrita Pedagógica</span>
              </div>
              <p className="text-xs text-indigo-900">
                Veja como transformar um trecho do seu texto para atingir a pontuação máxima:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                <div className="p-3.5 bg-white rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 block uppercase">
                    Trecho Original Analisado:
                  </span>
                  <p className="text-xs text-slate-700 italic">
                    &quot;{result.exemplaryRewriteSnippet.originalFragment}&quot;
                  </p>
                </div>

                <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1">
                  <span className="text-[11px] font-bold text-emerald-800 block uppercase">
                    Sugestão de Reescrita Padrão ENEM:
                  </span>
                  <p className="text-xs text-emerald-950 font-semibold">
                    &quot;{result.exemplaryRewriteSnippet.improvedSuggestion}&quot;
                  </p>
                </div>
              </div>

              <p className="text-xs text-indigo-900 font-medium pt-1">
                💡 <strong>Por que melhora a nota:</strong> {result.exemplaryRewriteSnippet.pedagogicalReason}
              </p>
            </div>
          )}

          {/* MENSAGEM FINAL DE MOTIVAÇÃO E EMPATIA */}
          <div className="p-5 rounded-3xl bg-slate-900 text-white flex items-start gap-3.5 text-xs leading-relaxed">
            <Heart className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-black text-rose-300 block mb-0.5">
                Apoio e Valorização Pedagógica:
              </span>
              <span>{result.encouragementMessage}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
