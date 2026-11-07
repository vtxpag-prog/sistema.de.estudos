import React, { useState, useMemo } from 'react';
import {
  Search,
  BookOpen,
  Volume2,
  VolumeX,
  Bookmark,
  Sparkles,
  Lightbulb,
  AlertTriangle,
  Compass,
  CheckCircle2,
  Share2,
  Copy,
  Check,
  Eye,
  Filter,
  RefreshCw,
  PlusCircle,
  HelpCircle,
  Zap,
  ArrowRight,
  Sliders,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GlossaryCategory, GlossaryTerm } from '../../types';

const CATEGORIES: Array<GlossaryCategory | 'Todos' | 'Favoritos'> = [
  'Todos',
  'Siglas & Regulamentação',
  'Linguagens & Redação',
  'Ciências Humanas',
  'Ciências da Natureza',
  'Matemática & TRI',
  'Metodologia & BNCC',
  'Favoritos',
];

const POPULAR_SEARCH_CHIPS = [
  'TRI',
  'BNCC',
  'Eutrofização',
  'Proposta de Intervenção',
  'Distrator',
  'Gentrificação',
  'Le Chatelier',
  'Desvio Padrão',
  'Toyotismo',
  'Magnificação Trófica',
];

export const InteractiveGlossaryModule: React.FC = () => {
  const {
    glossaryTerms,
    bookmarkedTermIds,
    toggleBookmarkTerm,
    requestAiTermExplanation,
    selectedGlossarySearch,
    setSelectedGlossarySearch,
    accessibility,
    speakText,
    stopSpeaking,
    isSpeaking,
  } = useApp();

  const [activeCategory, setActiveCategory] = useState<GlossaryCategory | 'Todos' | 'Favoritos'>('Todos');
  const [searchTerm, setSearchTerm] = useState<string>(selectedGlossarySearch || '');
  const [customTermInput, setCustomTermInput] = useState<string>('');
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [showAiModal, setShowAiModal] = useState<boolean>(false);
  const [copiedTermId, setCopiedTermId] = useState<string | null>(null);
  const [speakingTermId, setSpeakingTermId] = useState<string | null>(null);
  const [teaModeOverride, setTeaModeOverride] = useState<boolean>(accessibility.teaMode);

  // Sync external search term if changed
  React.useEffect(() => {
    if (selectedGlossarySearch) {
      setSearchTerm(selectedGlossarySearch);
      setSelectedGlossarySearch('');
    }
  }, [selectedGlossarySearch, setSelectedGlossarySearch]);

  // Filtered terms list
  const filteredTerms = useMemo(() => {
    return glossaryTerms.filter((item) => {
      // Category filter
      if (activeCategory === 'Favoritos') {
        if (!bookmarkedTermIds.includes(item.id)) return false;
      } else if (activeCategory !== 'Todos') {
        if (item.category !== activeCategory) return false;
      }

      // Search term filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const matchesTerm = item.term.toLowerCase().includes(query);
        const matchesAcronym = item.acronym && item.acronym.toLowerCase().includes(query);
        const matchesDefinition = item.simplifiedDefinition.toLowerCase().includes(query);
        const matchesTea = item.teaSimplifiedExplanation.toLowerCase().includes(query);
        const matchesRelated = item.relatedTerms?.some((r) => r.toLowerCase().includes(query));
        return matchesTerm || matchesAcronym || matchesDefinition || matchesTea || matchesRelated;
      }

      return true;
    });
  }, [glossaryTerms, activeCategory, searchTerm, bookmarkedTermIds]);

  // AI Generation Handler
  const handleRequestAiTerm = async (termToExplain?: string) => {
    const target = (termToExplain || customTermInput || searchTerm).trim();
    if (!target) return;

    setIsGeneratingAi(true);
    setAiError(null);

    try {
      const generated = await requestAiTermExplanation(target);
      setSearchTerm(generated.term);
      setShowAiModal(false);
      setCustomTermInput('');
    } catch (err: any) {
      setAiError('Não foi possível gerar a explicação no momento. Tente novamente.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Copy definition to clipboard
  const handleCopyDefinition = (term: GlossaryTerm) => {
    const textToCopy = `[ENEM Inclusivo - Glossário] ${term.term}\n\nDefinição Pedagógica: ${term.simplifiedDefinition}\n\nExemplo Prático: ${term.contextualExample}\n\nComo cai no ENEM: ${term.enemApplication}${term.mnemonicsOrMemoryHook ? `\nPulo do Gato: ${term.mnemonicsOrMemoryHook}` : ''}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedTermId(term.id);
    setTimeout(() => setCopiedTermId(null), 2500);
  };

  // Audio Speech Handler
  const handleToggleSpeak = (term: GlossaryTerm) => {
    if (speakingTermId === term.id && isSpeaking) {
      stopSpeaking();
      setSpeakingTermId(null);
    } else {
      stopSpeaking();
      setSpeakingTermId(term.id);
      const narrationText = teaModeOverride
        ? `${term.term}. Explicação direta: ${term.teaSimplifiedExplanation}. Exemplo prático: ${term.contextualExample}.`
        : `${term.term}. Definição: ${term.simplifiedDefinition}. Exemplo no cotidiano: ${term.contextualExample}. Aplicação na prova do ENEM: ${term.enemApplication}.${term.mnemonicsOrMemoryHook ? ` Dica mnemônica: ${term.mnemonicsOrMemoryHook}.` : ''}`;
      speakText(narrationText);
    }
  };

  // Stop speaking when unmounting
  React.useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, [stopSpeaking]);

  const totalTermsCount = glossaryTerms.length;
  const acronymsCount = glossaryTerms.filter((t) => !!t.acronym).length;
  const bookmarkedCount = bookmarkedTermIds.length;
  const aiGeneratedCount = glossaryTerms.filter((t) => t.isAiGenerated).length;

  return (
    <div className={`space-y-8 animate-fadeIn ${accessibility.focusMode ? 'max-w-4xl mx-auto' : ''}`}>
      {/* HEADER PRINCIPAL DO GLOSSÁRIO */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-indigo-900 via-slate-900 to-teal-950 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 rounded-full bg-teal-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-10 w-72 h-72 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-teal-300 text-xs font-bold tracking-wide uppercase">
              <BookOpen className="w-4 h-4 text-teal-400" />
              <span>Dicionário Pedagógico & Desmistificador de Conceitos</span>
            </div>

            <div className="flex items-center gap-2">
              {/* Botão de Alternar Modo TEA (Linguagem Direta) */}
              <button
                onClick={() => setTeaModeOverride(!teaModeOverride)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                  teaModeOverride
                    ? 'bg-teal-500/30 border-teal-400 text-teal-200 shadow-xs'
                    : 'bg-white/10 border-white/20 text-slate-300 hover:bg-white/15'
                }`}
                title="Alterna entre definições com repertório amplo ou linguagem direta e literal sem metáforas"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Modo Direto TEA: {teaModeOverride ? 'ATIVADO' : 'DESATIVADO'}</span>
              </button>

              {/* Botão para solicitar explicação com IA */}
              <button
                onClick={() => setShowAiModal(true)}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-linear-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black text-xs transition shadow-md hover:shadow-teal-500/20"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Consultar Gemini IA</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              Glossário Interativo ENEM
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm max-w-3xl leading-relaxed">
              Consulte termos complexos, siglas da legislação educacional (TRI, BNCC, DCN) e conceitos curriculares recorrentes. Cada verbete traz definições simplificadas, exemplos práticos da vida cotidiana e alertas sobre as armadilhas dos distratores nas provas.
            </p>
          </div>

          {/* INDICADORES EM MINI-CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3 border border-white/10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/30 text-indigo-300 flex items-center justify-center font-bold">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Total no Acervo</span>
                <span className="text-lg font-black text-white">{totalTermsCount} termos</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3 border border-white/10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/30 text-teal-300 flex items-center justify-center font-bold">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Siglas Oficiais</span>
                <span className="text-lg font-black text-white">{acronymsCount} siglas</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3 border border-white/10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/30 text-amber-300 flex items-center justify-center font-bold">
                <Bookmark className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Salvos / Favoritos</span>
                <span className="text-lg font-black text-white">{bookmarkedCount} termos</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3 border border-white/10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/30 text-emerald-300 flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Explicados por IA</span>
                <span className="text-lg font-black text-white">{aiGeneratedCount} ativos</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BARRA DE PESQUISA & SUGESTÕES POPULARES */}
      <div className="space-y-4">
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Digite um termo, conceito ou sigla (ex: TRI, Eutrofização, Coesão, BNCC, Desvio Padrão...)"
            className="w-full pl-12 pr-28 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-900 text-sm placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 shadow-xs transition"
          />
          {searchTerm ? (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-4 px-2.5 py-1 text-xs font-semibold text-slate-400 hover:text-slate-600 bg-slate-100 rounded-lg transition"
            >
              Limpar
            </button>
          ) : (
            <span className="absolute right-4 text-xs font-bold text-slate-400 hidden sm:inline">
              {filteredTerms.length} verbetes
            </span>
          )}
        </div>

        {/* CHIPS DE PESQUISA POPULAR */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            Populares:
          </span>
          {POPULAR_SEARCH_CHIPS.map((chip) => (
            <button
              key={chip}
              onClick={() => {
                setSearchTerm(chip);
                setActiveCategory('Todos');
              }}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                searchTerm.toLowerCase() === chip.toLowerCase()
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* ABAS DE CATEGORIA */}
        <div className="flex items-center overflow-x-auto pb-1.5 gap-2 border-b border-slate-100">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                activeCategory === cat
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat === 'Favoritos' && <Bookmark className="w-3.5 h-3.5 text-amber-400" />}
              <span>{cat}</span>
              {cat === 'Favoritos' && bookmarkedCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400 text-slate-950 font-black">
                  {bookmarkedCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* FEEDBACK SE RESULTADO VAZIO COM CALL TO ACTION DO GEMINI */}
      {filteredTerms.length === 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-4 max-w-xl mx-auto shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <HelpCircle className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-extrabold text-slate-900">
              Nenhum termo encontrado para &quot;{searchTerm}&quot;
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Não encontramos esse conceito cadastrado no acervo padrão. Deseja que a inteligência pedagógica do Gemini explique agora mesmo com definições simplificadas e exemplos práticos?
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => handleRequestAiTerm(searchTerm)}
              disabled={isGeneratingAi}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-linear-to-r from-teal-500 to-emerald-600 text-slate-950 font-black text-xs hover:from-teal-400 hover:to-emerald-500 transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isGeneratingAi ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Gerando explicação com Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Explicar &quot;{searchTerm}&quot; com IA</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                setSearchTerm('');
                setActiveCategory('Todos');
              }}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition"
            >
              Ver todos os termos
            </button>
          </div>

          {aiError && (
            <p className="text-xs text-rose-600 font-semibold pt-2">{aiError}</p>
          )}
        </div>
      )}

      {/* LISTAGEM DE CARDS DO GLOSSÁRIO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredTerms.map((term) => {
          const isBookmarked = bookmarkedTermIds.includes(term.id);
          const isSpeakingThis = speakingTermId === term.id && isSpeaking;
          const isCopied = copiedTermId === term.id;

          // Categorização com cores distintas
          const getCategoryTheme = (category: string) => {
            switch (category) {
              case 'Siglas & Regulamentação':
                return { badge: 'bg-teal-50 text-teal-700 border-teal-200', border: 'hover:border-teal-400' };
              case 'Linguagens & Redação':
                return { badge: 'bg-rose-50 text-rose-700 border-rose-200', border: 'hover:border-rose-400' };
              case 'Ciências Humanas':
                return { badge: 'bg-amber-50 text-amber-700 border-amber-200', border: 'hover:border-amber-400' };
              case 'Ciências da Natureza':
                return { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', border: 'hover:border-emerald-400' };
              case 'Matemática & TRI':
                return { badge: 'bg-blue-50 text-blue-700 border-blue-200', border: 'hover:border-blue-400' };
              default:
                return { badge: 'bg-indigo-50 text-indigo-700 border-indigo-200', border: 'hover:border-indigo-400' };
            }
          };

          const theme = getCategoryTheme(term.category);

          return (
            <div
              key={term.id}
              className={`bg-white rounded-3xl border border-slate-200 p-6 shadow-xs transition-all flex flex-col justify-between space-y-5 ${theme.border} hover:shadow-md relative group`}
            >
              {/* TOPO DO CARD: CATEGORIA, SIGLA E AÇÕES RÁPIDAS */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[11px] font-extrabold px-3 py-1 rounded-full border ${theme.badge}`}>
                      {term.category}
                    </span>

                    {term.acronym && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200 uppercase tracking-wider">
                        Sigla Oficial
                      </span>
                    )}

                    {term.difficulty && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          term.difficulty === 'Básico'
                            ? 'bg-emerald-50 text-emerald-700'
                            : term.difficulty === 'Intermediário'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-purple-50 text-purple-700'
                        }`}
                      >
                        Nível {term.difficulty}
                      </span>
                    )}

                    {term.isAiGenerated && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                        <Sparkles className="w-2.5 h-2.5 text-teal-500" />
                        Gerado por IA
                      </span>
                    )}
                  </div>

                  {/* AÇÕES: ÁUDIO, FAVORITO, COPIAR */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleSpeak(term)}
                      className={`p-2 rounded-xl transition ${
                        isSpeakingThis
                          ? 'bg-indigo-600 text-white animate-pulse'
                          : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                      }`}
                      title={isSpeakingThis ? 'Parar narração de voz' : 'Ouvir leitura em voz alta'}
                    >
                      {isSpeakingThis ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => toggleBookmarkTerm(term.id)}
                      className={`p-2 rounded-xl transition ${
                        isBookmarked
                          ? 'bg-amber-50 text-amber-500'
                          : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100'
                      }`}
                      title={isBookmarked ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
                    >
                      <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400 text-amber-500' : ''}`} />
                    </button>

                    <button
                      onClick={() => handleCopyDefinition(term)}
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                      title="Copiar verbete completo"
                    >
                      {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* TÍTULO DO TERMO */}
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    {term.term}
                  </h3>
                </div>

                {/* DEFINIÇÃO PEDAGÓGICA (OU VERSÃO TEA) */}
                <div className="space-y-3">
                  {teaModeOverride ? (
                    <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-2xl space-y-1">
                      <div className="flex items-center gap-1.5 text-teal-900 font-bold text-xs uppercase tracking-wider">
                        <Eye className="w-3.5 h-3.5 text-teal-600" />
                        <span>Definição Direta & Literal (Modo Foco)</span>
                      </div>
                      <p className="text-slate-800 text-xs sm:text-sm font-semibold leading-relaxed">
                        {term.teaSimplifiedExplanation}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-slate-700 text-xs sm:text-sm leading-relaxed">
                        {term.simplifiedDefinition}
                      </p>
                    </div>
                  )}

                  {/* BLOCO: EXEMPLO CONTEXTUAL DA VIDA REAL */}
                  {term.contextualExample && (
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
                      <div className="flex items-center gap-1.5 text-slate-900 font-bold text-xs">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                        <span>Exemplo no Cotidiano / Aplicação Prática:</span>
                      </div>
                      <p className="text-slate-600 text-xs leading-relaxed italic">
                        &quot;{term.contextualExample}&quot;
                      </p>
                    </div>
                  )}

                  {/* BLOCO: COMO CAI NO ENEM & DISTRATORES */}
                  {term.enemApplication && (
                    <div className="p-3.5 bg-indigo-50/60 border border-indigo-100 rounded-2xl space-y-1.5">
                      <div className="flex items-center gap-1.5 text-indigo-950 font-bold text-xs">
                        <AlertTriangle className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Como Aparece nas Provas do ENEM:</span>
                      </div>
                      <p className="text-slate-700 text-xs leading-relaxed">
                        {term.enemApplication}
                      </p>
                    </div>
                  )}

                  {/* BLOCO: PULINHO DO GATO / MNEMÔNICO */}
                  {term.mnemonicsOrMemoryHook && (
                    <div className="px-3.5 py-2.5 bg-amber-50/80 border border-amber-200 rounded-xl flex items-start gap-2">
                      <Zap className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[11px] font-black text-amber-900 block uppercase">
                          Pulo do Gato para Lembrar na Prova
                        </span>
                        <p className="text-xs text-amber-800 font-medium leading-relaxed">
                          {term.mnemonicsOrMemoryHook}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* RODAPÉ DO CARD: TERMOS RELACIONADOS */}
              {term.relatedTerms && term.relatedTerms.length > 0 && (
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Conceitos Relacionados:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {term.relatedTerms.map((rel) => (
                      <button
                        key={rel}
                        onClick={() => {
                          setSearchTerm(rel);
                          setActiveCategory('Todos');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 text-[11px] font-semibold transition"
                      >
                        {rel}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* MODAL / DIALOG PARA CONSULTAR QUALQUER TERMO COM GEMINI */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    Consultar Termo com Gemini
                  </h3>
                  <span className="text-xs text-slate-500 font-medium">
                    Explicação pedagógica adaptada para o ENEM
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowAiModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-xs font-bold transition"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-600 leading-relaxed">
                Digite qualquer sigla, jargão, teoria ou palavra complexa que você encontrou em um simulado ou texto de apoio. O Gemini irá gerar a definição simplificada, o exemplo prático e os cuidados na prova.
              </p>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Qual termo ou sigla deseja desmistificar?
                </label>
                <input
                  type="text"
                  value={customTermInput}
                  onChange={(e) => setCustomTermInput(e.target.value)}
                  placeholder="Ex: Entropia, Isomeria Óptica, Anáfora, PISA, DCN..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRequestAiTerm();
                  }}
                  autoFocus
                />
              </div>

              {aiError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
                  {aiError}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowAiModal(false)}
                disabled={isGeneratingAi}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
              >
                Cancelar
              </button>

              <button
                onClick={() => handleRequestAiTerm()}
                disabled={!customTermInput.trim() || isGeneratingAi}
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-black transition shadow-md flex items-center gap-2 disabled:opacity-50"
              >
                {isGeneratingAi ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processando Pedagógico...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Gerar Verbete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
