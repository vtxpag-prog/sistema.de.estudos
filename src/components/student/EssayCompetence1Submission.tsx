import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Competence1ReviewResult,
  Competence1GrammarIssue,
  GrammarIssueCategory,
} from '../../types';
import { checkCompetence1API } from '../../services/api';
import {
  PenTool,
  Sparkles,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  FileText,
  Volume2,
  Copy,
  Check,
  CheckCheck,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  Lightbulb,
  Heart,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Wand2,
  Layers,
} from 'lucide-react';

export const EssayCompetence1Submission: React.FC = () => {
  const {
    gradeLevel,
    accessibility,
    essayThemes,
    incrementEssayCount,
    speakText,
    isSpeaking,
    stopSpeaking,
  } = useApp();

  const [selectedThemeId, setSelectedThemeId] = useState<string>(essayThemes[0].id);
  const [customTheme, setCustomTheme] = useState<string>('');
  const [useCustomTheme, setUseCustomTheme] = useState<boolean>(false);
  const [essayText, setEssayText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<Competence1ReviewResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeIssueId, setActiveIssueId] = useState<string | null>(null);
  const [copiedReport, setCopiedReport] = useState<boolean>(false);
  const [showGrammarGuide, setShowGrammarGuide] = useState<boolean>(false);
  const [appliedIssues, setAppliedIssues] = useState<Set<string>>(new Set());

  const activeTheme = essayThemes.find((t) => t.id === selectedThemeId) || essayThemes[0];
  const effectiveThemeTitle = useCustomTheme && customTheme.trim() ? customTheme.trim() : activeTheme.title;

  const wordCount = essayText.trim() ? essayText.trim().split(/\s+/).length : 0;
  const characterCount = essayText.length;
  const estimatedLines = Math.max(1, Math.ceil(characterCount / 70));
  const paragraphCount = essayText
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0).length;

  // Submeter para avaliação com IA Gemini
  const handleAnalyzeCompetence1 = async () => {
    if (wordCount < 10) {
      setErrorMsg('Escreva pelo menos um parágrafo (mínimo de 10 palavras) para que a IA possa analisar a gramática.');
      return;
    }
    setErrorMsg(null);
    setLoading(true);

    try {
      const evaluation = await checkCompetence1API(
        essayText,
        effectiveThemeTitle,
        gradeLevel,
        accessibility
      );
      setResult(evaluation);
      setAppliedIssues(new Set());
      incrementEssayCount();
    } catch (err: any) {
      setErrorMsg('Houve uma instabilidade temporária ao conectar com a IA do Gemini. Tente novamente em alguns segundos.');
    } finally {
      setLoading(false);
    }
  };

  // Carregar texto de exemplo com desvios pedagógicos clássicos do ENEM
  const loadExampleWithIssues = () => {
    setEssayText(
      `No Brasil contemporâneo a garantia dos direitos fundamentais ainda enfrenta desafios a nível de integração social. Com efeito a Constituição de 1988 assegura a dignidade humana como princípio basilar, contudo observa-se que parcelas vulneráveis da sociedade não tem acesso pleno à essas prerrogativas cidadãs.\n\nAdemais, faz muitos anos que existe debates acerca da desigualdade educacional no país, onde a falta de investimentos estruturais comprometem a formação crítica da juventude e perpetuam ciclos de exclusão.\n\nPortanto medidas urgentes são necessárias. Cabe ao Ministério da Educação implementar programas contínuos a fim de conscientizar a sociedade e erradicar as disparidades.`
    );
    setResult(null);
    setErrorMsg(null);
  };

  // Carregar texto modelo nota 1000
  const loadExemplaryExample = () => {
    setEssayText(
      `Na conjuntura brasileira contemporânea, a consolidação dos direitos fundamentais configura-se como pressuposto indispensável à cidadania plena. Com efeito, a Carta Magna de 1988 preconiza a dignidade da pessoa humana como alicerce inegociável da ordem democrática. Não obstante a clareza do texto constitucional, observa-se que a inoperância estatal e os estigmas históricos inviabilizam a efetivação dessa garantia a parcelas substanciais da população.\n\nSob a perspectiva do sociólogo Gilberto Dimenstein, quando os preceitos legais não se concretizam no cotidiano social, instaura-se uma "cidadania de papel", a qual marginaliza os indivíduos mais vulneráveis. Ademais, a escassez de políticas públicas focalizadas no ambiente escolar aprofunda as disparidades de oportunidades, impedindo a emancipação intelectual e econômica das futuras gerações.\n\nPortanto, torna-se imperativo desarticular esse cenário de exclusão. Cabe ao Ministério da Educação, em consonância com as secretarias estaduais e a sociedade civil, destinar dotações orçamentárias expressivas para a infraestrutura das escolas públicas, por meio de planos plurianuais participativos, com o fito de garantir o pleno exercício dos direitos civis a todo o corpo social.`
    );
    setResult(null);
    setErrorMsg(null);
  };

  // Aplicar uma correção sugerida no texto
  const handleApplyCorrection = (issue: Competence1GrammarIssue) => {
    if (!issue.originalSnippet || !issue.suggestion) return;

    if (essayText.includes(issue.originalSnippet)) {
      const updatedText = essayText.replace(issue.originalSnippet, issue.suggestion);
      setEssayText(updatedText);
      setAppliedIssues((prev) => new Set([...prev, issue.id]));
    }
  };

  // Copiar relatório
  const handleCopyReport = () => {
    if (!result) return;
    const reportText = `[RELATÓRIO DE GRAMÁTICA - COMPETÊNCIA 1 ENEM]\n` +
      `Nota: ${result.score}/200 pts - ${result.levelDescription}\n` +
      `Diagnóstico: ${result.summaryFeedback}\n\n` +
      `DESVIOS IDENTIFICADOS (${result.issues.length}):\n` +
      result.issues.map((iss, i) => `${i + 1}. [${iss.typeLabel}] Original: "${iss.originalSnippet}" -> Sugestão: "${iss.suggestion}" (${iss.explanation})`).join('\n') +
      `\n\nPONTOS FORTES:\n` +
      result.positiveHighlights.map((h) => `- ${h}`).join('\n') +
      `\n\nDICAS PARA GABARITAR C1:\n` +
      result.improvementTips.map((t) => `- ${t}`).join('\n');

    navigator.clipboard.writeText(reportText);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2500);
  };

  // Filtragem de desvios
  const filteredIssues = result?.issues.filter((iss) => {
    if (selectedCategory === 'all') return true;
    return iss.type === selectedCategory;
  }) || [];

  // Categorias disponíveis
  const categoryFilters: { key: string; label: string }[] = [
    { key: 'all', label: `Todos (${result?.issues.length || 0})` },
    { key: 'pontuacao', label: 'Pontuação / Vírgula' },
    { key: 'concordancia', label: 'Concordância' },
    { key: 'crase', label: 'Crase' },
    { key: 'regencia', label: 'Regência' },
    { key: 'ortografia', label: 'Ortografia' },
    { key: 'sintaxe', label: 'Sintaxe / Período' },
    { key: 'registro_informal', label: 'Registro Informal' },
  ];

  return (
    <div className="space-y-6">
      {/* Banner Principal com Apresentação da Competência 1 */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Módulo de Linguagem • IA Gemini Integrada</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Envio de Redação & Análise da Competência 1
            </h2>
            <p className="text-xs sm:text-sm text-indigo-200 max-w-2xl leading-relaxed">
              Submeta sua redação ou parágrafos para receber correção gramatical aprofundada,
              identificação precisa de desvios (concordância, regência, crase, pontuação) e sugestões
              práticas baseadas na grade oficial do INEP para alcançar a <strong>nota 200</strong> na C1.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-2.5 text-xs text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Padrão Oficial: <strong>Cartilha ENEM</strong></span>
            </div>
            {accessibility.dyslexiaMode && (
              <div className="bg-amber-400/20 border border-amber-300/40 rounded-2xl px-4 py-2 text-xs text-amber-200 flex items-center gap-2">
                <Heart className="w-3.5 h-3.5 text-amber-300" />
                <span>Acolhimento à Dislexia Ativo</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Coluna Esquerda: Configuração e Tema (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>Tema da Redação</span>
              </h3>
              <button
                type="button"
                onClick={() => setUseCustomTheme(!useCustomTheme)}
                className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold underline"
              >
                {useCustomTheme ? 'Ver Temas Oficiais' : 'Digitar Tema Próprio'}
              </button>
            </div>

            {useCustomTheme ? (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 block">
                  Tema Personalizado / Livre:
                </label>
                <input
                  type="text"
                  value={customTheme}
                  onChange={(e) => setCustomTheme(e.target.value)}
                  placeholder="Ex: O papel da inteligência artificial na sociedade..."
                  className="w-full p-3 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <span className="text-xs text-slate-500 font-medium block">
                  Selecione um tema com textos motivadores:
                </span>
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {essayThemes.map((th) => (
                    <button
                      key={th.id}
                      onClick={() => {
                        setSelectedThemeId(th.id);
                        setResult(null);
                      }}
                      className={`w-full text-left p-3 rounded-2xl border text-xs font-semibold transition ${
                        selectedThemeId === th.id
                          ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 ring-1 ring-indigo-500'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {th.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Contexto motivador rápido */}
            {!useCustomTheme && (
              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-700 font-bold">
                  <span>Texto Motivador Resumido:</span>
                  <button
                    onClick={() => {
                      if (isSpeaking) stopSpeaking();
                      else speakText(activeTheme.contextText);
                    }}
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    {isSpeaking ? 'Parar áudio' : 'Ouvir'}
                  </button>
                </div>
                <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200/70 text-[11px] leading-relaxed">
                  {activeTheme.contextText}
                </p>
              </div>
            )}

            {/* Guia da Competência 1 Accordion */}
            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowGrammarGuide(!showGrammarGuide)}
                className="w-full flex items-center justify-between text-xs font-bold text-slate-700 hover:text-indigo-600 transition py-1"
              >
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Critérios da C1 no ENEM</span>
                </span>
                {showGrammarGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showGrammarGuide && (
                <div className="mt-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-700 space-y-2 animate-fadeIn">
                  <p className="font-bold text-slate-900">
                    O que a banca avalia na Competência 1:
                  </p>
                  <ul className="space-y-1 list-disc list-inside text-slate-600 leading-relaxed">
                    <li><strong>Estrutura sintática:</strong> ausência de truncamentos ou períodos justapostos.</li>
                    <li><strong>Concordância e Regência:</strong> verbal e nominal impecáveis.</li>
                    <li><strong>Pontuação:</strong> separação correta de orações e vírgulas obrigatórias.</li>
                    <li><strong>Crase:</strong> domínio dos casos proibidos e obrigatórios.</li>
                    <li><strong>Precisão vocabular:</strong> registro formal sem gírias ou coloquialismos.</li>
                  </ul>
                  <div className="pt-1.5 text-slate-500 font-semibold">
                    Escala de notas: 0, 40, 80, 120, 160 e 200 pontos.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Coluna Direita: Editor de Envio e Análise com Gemini (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Editor Card */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <PenTool className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  Folha de Envio da Redação
                </h3>
              </div>

              {/* Indicadores em Tempo Real */}
              <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                <span title="Contagem de palavras">
                  <strong className="text-slate-800">{wordCount}</strong> palavras
                </span>
                <span>•</span>
                <span title="Parágrafos estruturados">
                  <strong className="text-slate-800">{paragraphCount}</strong> {paragraphCount === 1 ? 'parágrafo' : 'parágrafos'}
                </span>
                <span>•</span>
                <span
                  title="Estimativa de linhas na folha oficial"
                  className={estimatedLines > 30 ? 'text-rose-600 font-bold' : ''}
                >
                  ~{estimatedLines}/30 linhas
                </span>
              </div>
            </div>

            {/* Caixa de Texto da Redação */}
            <div className="relative">
              <textarea
                value={essayText}
                onChange={(e) => setEssayText(e.target.value)}
                placeholder="Cole ou digite sua redação completa ou parágrafos para avaliação gramatical pela Competência 1 do ENEM..."
                rows={12}
                className={`w-full rounded-2xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y text-slate-800 transition ${
                  accessibility.focusMode
                    ? 'p-6 sm:p-8 text-base leading-loose border-2 border-slate-300'
                    : 'p-4 text-sm leading-relaxed border-slate-200'
                } ${
                  accessibility.dyslexiaMode
                    ? 'font-serif tracking-wide leading-loose text-base'
                    : ''
                } ${accessibility.highContrast ? 'bg-black text-white border-yellow-400' : 'bg-slate-50/50'}`}
              />
            </div>

            {/* Mensagem de Erro / Aviso */}
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Ações Rápidas do Editor */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={loadExampleWithIssues}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition"
                  title="Carregar exemplo com desvios clássicos para testar o Gemini"
                >
                  Carregar Texto com Desvios (Teste)
                </button>
                <button
                  type="button"
                  onClick={loadExemplaryExample}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition"
                  title="Carregar texto formal nota 1000"
                >
                  Carregar Texto Modelo (200 pts)
                </button>
                {essayText && (
                  <button
                    type="button"
                    onClick={() => {
                      setEssayText('');
                      setResult(null);
                    }}
                    className="px-2.5 py-1.5 rounded-xl text-rose-600 hover:bg-rose-50 font-medium transition"
                  >
                    Limpar
                  </button>
                )}
              </div>

              {/* Botão Principal de Análise */}
              <button
                onClick={handleAnalyzeCompetence1}
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-2xl font-bold text-xs shadow-md transition flex items-center gap-2 disabled:bg-slate-300 cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Analisando com Gemini...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 text-amber-300" />
                    <span>Avaliar Competência 1 (IA Gemini)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Estado de Carregamento com Dicas Pedagógicas */}
          {loading && (
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center space-y-4 animate-fadeIn">
              <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center animate-pulse">
                <Sparkles className="w-6 h-6 animate-spin" />
              </div>
              <h4 className="font-extrabold text-slate-900 text-base">
                O modelo Gemini está examinando cada período do seu texto...
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Verificando concordância verbal, regência, paralelismo sintático, pontuação em orações
                adjetivas e casos de crase conforme o padrão do INEP.
              </p>
            </div>
          )}

          {/* PAINEL DE RESULTADOS DA COMPETÊNCIA 1 */}
          {result && !loading && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6 animate-fadeIn">
              {/* Cabeçalho do Resultado com Nota Oficial C1 */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 p-5 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-emerald-50 border border-indigo-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
                      Diagnóstico Oficial • Competência 1 ENEM
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-600 text-white">
                      {gradeLevel}
                    </span>
                  </div>
                  <h4 className="text-2xl font-black text-slate-900">
                    {result.score} de 200 pontos
                  </h4>
                  <p className="text-xs font-semibold text-slate-700">
                    Classificação: <span className="text-indigo-900">{result.levelDescription}</span>
                  </p>
                </div>

                {/* Score Gauge Visual */}
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <span className="text-[11px] text-slate-500 block">Desvios Encontrados</span>
                    <span className="text-base font-extrabold text-slate-900">
                      {result.issues.length} {result.issues.length === 1 ? 'item' : 'itens'}
                    </span>
                  </div>
                  <div
                    className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center font-black text-white shadow-md shrink-0 ${
                      result.score >= 160
                        ? 'bg-emerald-600'
                        : result.score >= 120
                        ? 'bg-amber-600'
                        : 'bg-rose-600'
                    }`}
                  >
                    <span className="text-2xl leading-none">{result.score}</span>
                    <span className="text-[9px] uppercase tracking-wider text-white/80 mt-1">/ 200</span>
                  </div>
                </div>
              </div>

              {/* Mensagem Resumo do Gemini */}
              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-xs text-slate-700 space-y-1.5 leading-relaxed">
                <div className="font-bold text-indigo-950 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-indigo-600" />
                  <span>Parecer do Avaliador Linguístico (IA Gemini):</span>
                </div>
                <p>{result.summaryFeedback}</p>
              </div>

              {/* Acolhimento à Dislexia se presente */}
              {result.dyslexiaConsideration && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-1 leading-relaxed">
                  <div className="font-bold flex items-center gap-1.5 text-amber-900">
                    <Heart className="w-4 h-4 text-rose-500" />
                    <span>Acolhimento Pedagógico Inclusivo (Dislexia / Neurodiversidade):</span>
                  </div>
                  <p>{result.dyslexiaConsideration}</p>
                </div>
              )}

              {/* Barra de Filtros por Categoria de Desvio */}
              {result.issues.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h5 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-2">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Correções Gramaticais Identificadas ({result.issues.length}):</span>
                    </h5>
                    <span className="text-[11px] text-slate-500">
                      Clique em um desvio para ver a regra e aplicar a correção
                    </span>
                  </div>

                  {/* Filtro pills */}
                  <div className="flex flex-wrap gap-1.5">
                    {categoryFilters.map((flt) => (
                      <button
                        key={flt.key}
                        onClick={() => setSelectedCategory(flt.key)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                          selectedCategory === flt.key
                            ? 'bg-indigo-600 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {flt.label}
                      </button>
                    ))}
                  </div>

                  {/* Lista de Desvios Detalhados */}
                  <div className="space-y-3 pt-1">
                    {filteredIssues.map((issue) => {
                      const isApplied = appliedIssues.has(issue.id);
                      return (
                        <div
                          key={issue.id}
                          className={`p-4 rounded-2xl border transition space-y-3 ${
                            isApplied
                              ? 'bg-emerald-50/50 border-emerald-200'
                              : 'bg-white border-slate-200 hover:border-indigo-300 shadow-2xs'
                          }`}
                        >
                          {/* Cabeçalho do Desvio */}
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 font-extrabold text-[10px]">
                                {issue.typeLabel}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-md font-semibold text-[10px] ${
                                  issue.severity === 'grave'
                                    ? 'bg-rose-100 text-rose-800'
                                    : issue.severity === 'moderada'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                Gravidade: {issue.severity}
                              </span>
                              {issue.paragraphIndex && (
                                <span className="text-[10px] text-slate-500 font-medium">
                                  Parágrafo {issue.paragraphIndex}
                                </span>
                              )}
                            </div>

                            {/* Botão de Aplicar Correção */}
                            {issue.suggestion && (
                              <button
                                type="button"
                                onClick={() => handleApplyCorrection(issue)}
                                disabled={isApplied}
                                className={`text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                                  isApplied
                                    ? 'bg-emerald-100 text-emerald-800 cursor-default'
                                    : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                                }`}
                              >
                                {isApplied ? (
                                  <>
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Corrigido no Rascunho</span>
                                  </>
                                ) : (
                                  <>
                                    <Wand2 className="w-3.5 h-3.5 text-indigo-600" />
                                    <span>Aplicar Correção no Texto</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>

                          {/* Comparativo: Trecho Original vs Sugestão */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                            <div className="p-3 rounded-xl bg-rose-50/80 border border-rose-200/80 text-rose-950 space-y-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block">
                                ❌ Trecho Original (com desvio):
                              </span>
                              <p className="font-mono text-xs font-semibold bg-white/70 p-2 rounded-lg border border-rose-200">
                                "{issue.originalSnippet}"
                              </p>
                            </div>

                            <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200/80 text-emerald-950 space-y-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                                ✅ Sugestão na Norma Padrão ENEM:
                              </span>
                              <p className="font-mono text-xs font-semibold bg-white/70 p-2 rounded-lg border border-emerald-200 text-emerald-900">
                                "{issue.suggestion}"
                              </p>
                            </div>
                          </div>

                          {/* Explicação Didática da Regra */}
                          <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200/70 space-y-0.5">
                            <span className="font-bold text-slate-900 text-[11px] block">
                              Regra Gramatical do ENEM:
                            </span>
                            <p className="leading-relaxed">{issue.explanation}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {result.issues.length === 0 && (
                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-3">
                  <CheckCheck className="w-6 h-6 text-emerald-600 shrink-0" />
                  <div>
                    <h5 className="font-bold text-sm">Nenhum desvio gramatical relevante detectado!</h5>
                    <p className="text-emerald-800 mt-0.5">
                      Seu texto demonstrou excelente domínio da norma culta formal, respeitando regras de
                      pontuação, crase, concordância e paralelismo sintático exigidas pela banca.
                    </p>
                  </div>
                </div>
              )}

              {/* Pontos Fortes e Dicas de Evolução */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {/* Pontos Fortes */}
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs space-y-2">
                  <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Pontos Fortes da Norma Padrão:</span>
                  </div>
                  <ul className="space-y-1.5 text-emerald-950">
                    {result.positiveHighlights.map((pt, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="font-bold text-emerald-600">•</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Dicas para Gabaritar a C1 */}
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs space-y-2">
                  <div className="font-bold text-blue-950 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span>Orientações Práticas para Gabaritar a C1 (200 pts):</span>
                  </div>
                  <ul className="space-y-1.5 text-blue-950">
                    {result.improvementTips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="font-bold text-blue-600">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Reescrita Modelo Exemplar com Gemini */}
              {result.exemplaryRewrite && (
                <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2 text-xs">
                  <div className="flex items-center justify-between text-indigo-300 font-bold">
                    <span className="flex items-center gap-1.5">
                      <Wand2 className="w-4 h-4 text-amber-300" />
                      <span>Reescrita Modelo com Sofisticação Sintática (IA Gemini):</span>
                    </span>
                    <span className="text-[10px] text-slate-400">Padrão Nota 1000</span>
                  </div>
                  <p className="text-slate-200 italic leading-relaxed bg-white/5 p-3 rounded-xl border border-white/10 font-serif text-xs">
                    "{result.exemplaryRewrite}"
                  </p>
                </div>
              )}

              {/* Botões de Ação do Relatório */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCopyReport}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center gap-2 cursor-pointer"
                >
                  {copiedReport ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-700">Relatório Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-600" />
                      <span>Copiar Relatório de Gramática</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleAnalyzeCompetence1}
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Reavaliar com Atualizações</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
