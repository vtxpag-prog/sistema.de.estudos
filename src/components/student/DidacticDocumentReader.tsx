import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  BookOpen,
  Maximize2,
  Minimize2,
  Eye,
  Glasses,
  Palette,
  Type,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Bookmark,
  Search,
  Plus,
  FileText,
  Sliders,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  AlignLeft,
  Layers,
  HelpCircle,
  Lightbulb,
  Copy,
  Check,
  ZoomIn,
  ZoomOut,
  Moon,
  Sun,
  ShieldCheck,
  Share2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  DidacticDocument,
  DidacticDocumentSection,
  DyslexiaOverlayColor,
  DocumentReaderSettings,
  KnowledgeArea,
} from '../../types';
import { INITIAL_DIDACTIC_DOCUMENTS } from '../../data/didacticMaterials';

const OVERLAY_COLORS: {
  id: DyslexiaOverlayColor;
  label: string;
  desc: string;
  previewBg: string;
  tintRgba: (opacity: number) => string;
  textColor: string;
  borderSample: string;
}[] = [
  {
    id: 'none',
    label: 'Padrão (Sem Filtro)',
    desc: 'Fundo neutro convencional sem sobreposição cromática.',
    previewBg: 'bg-white',
    tintRgba: () => 'transparent',
    textColor: 'text-slate-900',
    borderSample: 'border-slate-300',
  },
  {
    id: 'cream',
    label: 'Creme Suave',
    desc: 'O mais recomendado para dislexia: elimina o brilho excessivo do papel branco.',
    previewBg: 'bg-[#FFFBEB]',
    tintRgba: (op) => `rgba(254, 243, 199, ${op / 100})`,
    textColor: 'text-amber-950',
    borderSample: 'border-amber-400',
  },
  {
    id: 'yellow',
    label: 'Amarelo Suave',
    desc: 'Aquece a leitura, reduz fadiga retiniana e desacelera o cansaço visual.',
    previewBg: 'bg-[#FEF9C3]',
    tintRgba: (op) => `rgba(254, 240, 138, ${op / 100})`,
    textColor: 'text-amber-950',
    borderSample: 'border-yellow-400',
  },
  {
    id: 'peach',
    label: 'Pêssego / Rosa Suave',
    desc: 'Suaviza o contraste duro entre letras e fundo, excelente para leitura prolongada.',
    previewBg: 'bg-[#FFEDD5]',
    tintRgba: (op) => `rgba(254, 215, 170, ${op / 100})`,
    textColor: 'text-orange-950',
    borderSample: 'border-orange-400',
  },
  {
    id: 'green',
    label: 'Verde Menta / Sálvia',
    desc: 'Relaxa o músculo ciliar ocular e auxilia na fixação contínua da linha de leitura.',
    previewBg: 'bg-[#DCFCE7]',
    tintRgba: (op) => `rgba(187, 247, 208, ${op / 100})`,
    textColor: 'text-emerald-950',
    borderSample: 'border-emerald-400',
  },
  {
    id: 'blue',
    label: 'Azul Celeste / Céu',
    desc: 'Estabiliza a ilusão de letras que parecem tremer ou flutuar na página.',
    previewBg: 'bg-[#E0F2FE]',
    tintRgba: (op) => `rgba(186, 230, 253, ${op / 100})`,
    textColor: 'text-sky-950',
    borderSample: 'border-sky-400',
  },
  {
    id: 'purple',
    label: 'Lavanda / Lilás',
    desc: 'Eficaz contra a hipersensibilidade escotópica e dispersão de luz brilhante.',
    previewBg: 'bg-[#F3E8FF]',
    tintRgba: (op) => `rgba(233, 213, 255, ${op / 100})`,
    textColor: 'text-purple-950',
    borderSample: 'border-purple-400',
  },
  {
    id: 'dark',
    label: 'Noturno Conforto',
    desc: 'Modo escuro com texto quente leve para diminuir em 90% a emissão de luz.',
    previewBg: 'bg-[#0F172A]',
    tintRgba: (op) => `rgba(15, 23, 42, ${Math.min(0.95, (op / 100) * 1.8)})`,
    textColor: 'text-amber-100',
    borderSample: 'border-slate-600',
  },
];

const DEFAULT_SETTINGS: DocumentReaderSettings = {
  fontSize: 'medium',
  fontFamily: 'lexend',
  letterSpacing: 'wide',
  lineHeight: 'relaxed',
  columnWidth: 'medium',
  colorOverlay: 'cream',
  overlayOpacity: 35,
  readingRuler: true,
  readingRulerHeight: 65,
  bionicReading: false,
  paragraphFocus: false,
  ambientLight: 'warm-paper',
  audioRate: 1.0,
};

export const DidacticDocumentReader: React.FC = () => {
  const { accessibility } = useApp();

  // Documents state (includes initial and user-created custom documents)
  const [documents, setDocuments] = useState<DidacticDocument[]>(() => {
    try {
      const saved = localStorage.getItem('enem_custom_didactic_docs');
      if (saved) {
        const parsed = JSON.parse(saved);
        return [...INITIAL_DIDACTIC_DOCUMENTS, ...parsed];
      }
    } catch {
      // fallback
    }
    return INITIAL_DIDACTIC_DOCUMENTS;
  });

  // Active reading document (null means library view)
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState<number>(0);

  // Settings
  const [settings, setSettings] = useState<DocumentReaderSettings>(() => {
    try {
      const saved = localStorage.getItem('enem_document_reader_settings');
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch {
      // fallback
    }
    // If user already has dyslexiaMode on, initialize with cream overlay and ruler
    return {
      ...DEFAULT_SETTINGS,
      colorOverlay: accessibility.dyslexiaMode ? 'cream' : 'cream',
      fontFamily: accessibility.dyslexiaMode ? 'lexend' : 'lexend',
      letterSpacing: accessibility.dyslexiaMode ? 'wide' : 'wide',
    };
  });

  // Save settings
  useEffect(() => {
    try {
      localStorage.setItem('enem_document_reader_settings', JSON.stringify(settings));
    } catch {}
  }, [settings]);

  // Read progress saved per document
  const [readProgress, setReadProgress] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('enem_doc_read_progress');
      if (saved) return JSON.parse(saved);
    } catch {}
    return { 'mat-01': 35, 'mat-02': 15 };
  });

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFocusModeActive, setIsFocusModeActive] = useState(false);
  const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(false);
  const [isTocDrawerOpen, setIsTocDrawerOpen] = useState(false);

  // Search & filter in library
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Custom text creator modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newCategory, setNewCategory] = useState<KnowledgeArea | 'Redação ENEM' | 'Guia Neuroinclusivo'>('Linguagens, Códigos e suas Tecnologias');
  const [newContent, setNewContent] = useState('');

  // Reading Ruler position
  const [rulerTop, setRulerTop] = useState<number>(200);
  const readingAreaRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Audio / TTS state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [speakingParagraphIndex, setSpeakingParagraphIndex] = useState<number | null>(null);
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Quick word lookup / dictionary popover
  const [selectedWordDefinition, setSelectedWordDefinition] = useState<{
    word: string;
    simpleMeaning: string;
  } | null>(null);

  // Active document object
  const activeDocument = useMemo(() => {
    return documents.find((d) => d.id === activeDocId) || null;
  }, [documents, activeDocId]);

  // Current section
  const currentSection: DidacticDocumentSection | null = useMemo(() => {
    if (!activeDocument) return null;
    return activeDocument.sections[currentSectionIndex] || activeDocument.sections[0] || null;
  }, [activeDocument, currentSectionIndex]);

  // Filtered documents
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchesCategory =
        selectedCategory === 'Todas' ||
        doc.category === selectedCategory ||
        (selectedCategory === 'Redação' && doc.category === 'Redação ENEM') ||
        (selectedCategory === 'Neurodiversidade' && doc.category === 'Guia Neuroinclusivo');

      const matchesSearch =
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesSearch;
    });
  }, [documents, selectedCategory, searchQuery]);

  // Handle Fullscreen Toggle
  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (containerRef.current) {
          await containerRef.current.requestFullscreen();
          setIsFullscreen(true);
        }
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      // Fallback: internal state
      setIsFullscreen(!isFullscreen);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Update Reading Ruler on mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!settings.readingRuler || !readingAreaRef.current) return;
    const rect = readingAreaRef.current.getBoundingClientRect();
    const relativeY = e.clientY - rect.top;
    if (relativeY >= 0 && relativeY <= rect.height) {
      setRulerTop(relativeY);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activeDocId) return;

      // Escape exits focus mode or settings
      if (e.key === 'Escape') {
        if (isSettingsPanelOpen) setIsSettingsPanelOpen(false);
        else if (isTocDrawerOpen) setIsTocDrawerOpen(false);
        else if (isFocusModeActive) setIsFocusModeActive(false);
      }

      // Arrow keys for ruler or sections
      if (e.altKey && e.key === 'ArrowRight') {
        goToNextSection();
      } else if (e.altKey && e.key === 'ArrowLeft') {
        goToPrevSection();
      } else if (e.key === 'r' && e.ctrlKey) {
        e.preventDefault();
        setSettings((prev) => ({ ...prev, readingRuler: !prev.readingRuler }));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeDocId, isSettingsPanelOpen, isTocDrawerOpen, isFocusModeActive, currentSectionIndex, activeDocument]);

  // Mark section progress
  const updateProgress = (docId: string, secIdx: number, totalSecs: number) => {
    const percentage = Math.min(100, Math.round(((secIdx + 1) / totalSecs) * 100));
    setReadProgress((prev) => {
      const updated = { ...prev, [docId]: Math.max(prev[docId] || 0, percentage) };
      try {
        localStorage.setItem('enem_doc_read_progress', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const goToNextSection = () => {
    if (!activeDocument) return;
    if (currentSectionIndex < activeDocument.sections.length - 1) {
      const nextIdx = currentSectionIndex + 1;
      setCurrentSectionIndex(nextIdx);
      updateProgress(activeDocument.id, nextIdx, activeDocument.sections.length);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      stopAudio();
    }
  };

  const goToPrevSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      stopAudio();
    }
  };

  // Text-To-Speech (TTS)
  const stopAudio = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
    setSpeakingParagraphIndex(null);
  };

  const playSectionAudio = () => {
    if (!currentSection || !('speechSynthesis' in window)) return;

    if (isPlayingAudio) {
      stopAudio();
      return;
    }

    const fullText = [
      currentSection.title,
      currentSection.subheading || '',
      ...currentSection.paragraphs,
      currentSection.keyConcept ? `Conceito chave: ${currentSection.keyConcept}` : '',
      currentSection.enemTip ? `Dica ENEM: ${currentSection.enemTip}` : '',
    ]
      .filter(Boolean)
      .join('. ');

    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.lang = 'pt-BR';
    utterance.rate = settings.audioRate;

    utterance.onstart = () => {
      setIsPlayingAudio(true);
      setSpeakingParagraphIndex(0);
    };

    utterance.onend = () => {
      setIsPlayingAudio(false);
      setSpeakingParagraphIndex(null);
    };

    utterance.onerror = () => {
      setIsPlayingAudio(false);
      setSpeakingParagraphIndex(null);
    };

    speechSynthRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  // Quick word definition mock lookup for student comfort
  const handleWordSelect = () => {
    const selection = window.getSelection()?.toString().trim().toLowerCase();
    if (!selection || selection.length < 3 || selection.length > 25) return;

    const commonGlossary: Record<string, string> = {
      intencionalidade: 'A intenção ou objetivo final que o autor deseja alcançar ao produzir a mensagem.',
      polifonia: 'Presença de múltiplas vozes ou opiniões dialogando dentro do mesmo texto.',
      intertextualidade: 'Quando um texto faz referência, cita ou dialoga com outro texto já conhecido.',
      anóxia: 'Ausência total ou crítica de oxigênio em um ambiente aquático.',
      eutrofização: 'Excesso de nutrientes na água gerando multiplicação de algas e sufocamento biológico.',
      bioacumulação: 'Acúmulo progressivo de substâncias tóxicas no organismo ao longo da vida.',
      magnificação: 'Aumento da concentração de toxinas à medida que subimos na cadeia alimentar.',
      proporcionalidade: 'Relação constante entre duas medidas onde uma varia em proporção direta ou inversa à outra.',
      escala: 'Relação matemática entre a medida de um desenho ou mapa e o tamanho real do objeto.',
      detalhamento: 'Explicação minuciosa com exemplos adicionais para enriquecer a proposta de intervenção.',
      sádico: 'Movimento ocular rápido e involuntário entre pontos de fixação durante a leitura.',
      bimodal: 'Estímulo duplo simultâneo: ler visualmente acompanhando a voz auditiva.',
    };

    const found = commonGlossary[selection];
    if (found) {
      setSelectedWordDefinition({ word: selection, simpleMeaning: found });
    }
  };

  // Bionic reading helper: bold first 2-3 characters of each word
  const formatBionicText = (text: string) => {
    if (!settings.bionicReading) return text;

    return text.split(' ').map((word, wIdx) => {
      if (word.length <= 3) {
        return (
          <span key={wIdx}>
            <strong className="font-extrabold">{word.slice(0, 1)}</strong>
            {word.slice(1)}{' '}
          </span>
        );
      }
      const mid = Math.ceil(word.length / 2);
      return (
        <span key={wIdx}>
          <strong className="font-black text-indigo-900">{word.slice(0, mid)}</strong>
          {word.slice(mid)}{' '}
        </span>
      );
    });
  };

  // Active overlay object
  const activeOverlay = useMemo(() => {
    return OVERLAY_COLORS.find((c) => c.id === settings.colorOverlay) || OVERLAY_COLORS[0];
  }, [settings.colorOverlay]);

  // Typography class calculations
  const typographyStyles = useMemo(() => {
    // Font family
    let fontClass = 'font-sans';
    if (settings.fontFamily === 'lexend') fontClass = 'font-serif'; // mapped to Lexend in index.css
    else if (settings.fontFamily === 'serif') fontClass = 'font-serif';

    // Font size
    let sizeClass = 'text-lg leading-relaxed';
    if (settings.fontSize === 'small') sizeClass = 'text-base leading-normal';
    if (settings.fontSize === 'large') sizeClass = 'text-xl leading-loose';
    if (settings.fontSize === 'extralarge') sizeClass = 'text-2xl leading-loose';

    // Letter spacing
    let letterSpacingClass = 'tracking-normal';
    if (settings.letterSpacing === 'wide') letterSpacingClass = 'tracking-wide';
    if (settings.letterSpacing === 'extra') letterSpacingClass = 'tracking-widest';

    // Line height
    let lineHeightClass = 'leading-relaxed';
    if (settings.lineHeight === 'loose') lineHeightClass = 'leading-loose';
    if (settings.lineHeight === 'normal') lineHeightClass = 'leading-normal';

    // Column max-width (narrower columns prevent saccadic eye fatigue for dyslexia)
    let columnWidthClass = 'max-w-3xl';
    if (settings.columnWidth === 'narrow') columnWidthClass = 'max-w-xl';
    if (settings.columnWidth === 'wide') columnWidthClass = 'max-w-4xl';
    if (settings.columnWidth === 'full') columnWidthClass = 'max-w-full';

    return { fontClass, sizeClass, letterSpacingClass, lineHeightClass, columnWidthClass };
  }, [settings]);

  // Add custom student document
  const handleCreateDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    // Parse content into sections or paragraphs
    const rawParagraphs = newContent
      .split('\n\n')
      .map((p) => p.trim())
      .filter(Boolean);

    const createdDoc: DidacticDocument = {
      id: `custom-${Date.now()}`,
      title: newTitle.trim(),
      subtitle: newSubtitle.trim() || 'Material personalizado importado pelo estudante.',
      category: newCategory,
      areaShort: newCategory === 'Redação ENEM' ? 'RED' : newCategory === 'Guia Neuroinclusivo' ? 'NEURO' : 'LC',
      estimatedMinutes: Math.max(3, Math.ceil(newContent.split(/\s+/).length / 120)),
      wordCount: newContent.split(/\s+/).length,
      difficulty: 'Intermediário',
      coverColor: 'from-slate-700 to-indigo-800',
      tags: ['Personalizado', 'Meu Material', 'Anotações'],
      isCustom: true,
      summary: rawParagraphs[0]?.slice(0, 160) + '...' || 'Documento pessoal para leitura adaptada.',
      sections: [
        {
          id: `sec-${Date.now()}`,
          title: '1. Conteúdo Completo',
          subheading: 'Texto formatado para leitura acessível',
          paragraphs: rawParagraphs,
        },
      ],
    };

    const updated = [createdDoc, ...documents];
    setDocuments(updated);

    // Save custom docs to localStorage
    try {
      const customOnes = updated.filter((d) => d.isCustom);
      localStorage.setItem('enem_custom_didactic_docs', JSON.stringify(customOnes));
    } catch {}

    setIsCreateModalOpen(false);
    setNewTitle('');
    setNewSubtitle('');
    setNewContent('');

    // Open newly created document directly
    setActiveDocId(createdDoc.id);
    setCurrentSectionIndex(0);
  };

  // Delete custom document
  const handleDeleteCustomDoc = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = documents.filter((d) => d.id !== id);
    setDocuments(updated);
    try {
      const customOnes = updated.filter((d) => d.isCustom);
      localStorage.setItem('enem_custom_didactic_docs', JSON.stringify(customOnes));
    } catch {}
    if (activeDocId === id) {
      setActiveDocId(null);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`min-h-[85vh] transition-colors duration-300 relative ${
        isFullscreen || isFocusModeActive ? 'fixed inset-0 z-50 overflow-y-auto bg-slate-900' : 'space-y-8'
      }`}
    >
      {/* =========================================================================
          VIEW 1: LIBRARY OF MATERIALS (WHEN NO DOCUMENT IS OPEN)
      ========================================================================= */}
      {!activeDocument ? (
        <div className="space-y-8 animate-fadeIn">
          {/* Header Banner */}
          <div className="bg-linear-to-r from-teal-900 via-indigo-900 to-slate-950 text-white p-8 sm:p-10 rounded-3xl shadow-lg border border-teal-500/20 relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-teal-500/10 to-transparent pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-teal-400/20 text-teal-300 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 border border-teal-400/30">
                    <BookOpen className="w-3.5 h-3.5 text-teal-300" />
                    Leitor Adaptado ENEM
                  </span>
                  <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 font-bold text-xs flex items-center gap-1 border border-amber-400/30">
                    <Eye className="w-3.5 h-3.5" />
                    Modo Foco & Dislexia
                  </span>
                  <span className="px-3 py-1 rounded-full bg-purple-400/20 text-purple-300 font-bold text-xs border border-purple-400/30">
                    Sobreposição Cromática
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
                  Materiais Didáticos & Leitor em Modo Foco
                </h1>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  Leia apostilas, resumos e conteúdos essenciais em <strong>tela cheia sem distrações laterais</strong>.
                  Projetado com <strong>sobreposições cromáticas</strong> para conforto visual na dislexia, régua guia de leitura,
                  e suporte à narração por voz (TTS).
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition flex items-center justify-center gap-2 border border-white/20 backdrop-blur-xs"
                >
                  <Plus className="w-4 h-4 text-teal-300" />
                  <span>Colar / Criar Meu Texto</span>
                </button>

                <button
                  onClick={() => {
                    setActiveDocId(documents[0].id);
                    setCurrentSectionIndex(0);
                    setIsFocusModeActive(true);
                  }}
                  className="px-6 py-3.5 rounded-2xl bg-linear-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-slate-950 font-black text-sm transition shadow-lg flex items-center justify-center gap-2"
                >
                  <Maximize2 className="w-4 h-4" />
                  <span>Abrir Modo Foco Rápido</span>
                </button>
              </div>
            </div>

            {/* Quick Feature Badges */}
            <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                <span>6 Filtros Cromáticos para Dislexia</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-teal-400" />
                <span>Régua de Foco Guiada (Sem Perda de Linha)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-sky-400" />
                <span>Fonte Lexend & Espaçamento Confortável</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-400" />
                <span>Áudio Bimodal Integrado (Ouvir + Ler)</span>
              </div>
            </div>
          </div>

          {/* Filter Bar & Search */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="relative w-full sm:w-96">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar material didático, tema ou palavra-chave..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="text-xs text-slate-500 font-semibold self-start sm:self-auto">
                Mostrando <strong>{filteredDocuments.length}</strong> materiais disponíveis
              </div>
            </div>

            {/* Area Category Pills */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
              {[
                'Todas',
                'Linguagens, Códigos e suas Tecnologias',
                'Ciências Humanas e suas Tecnologias',
                'Ciências da Natureza e suas Tecnologias',
                'Matemática e suas Tecnologias',
                'Redação',
                'Neurodiversidade',
              ].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                    selectedCategory === cat
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat === 'Linguagens, Códigos e suas Tecnologias'
                    ? 'Linguagens'
                    : cat === 'Ciências Humanas e suas Tecnologias'
                    ? 'Humanas'
                    : cat === 'Ciências da Natureza e suas Tecnologias'
                    ? 'Natureza'
                    : cat === 'Matemática e suas Tecnologias'
                    ? 'Matemática'
                    : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.map((doc) => {
              const progress = readProgress[doc.id] || 0;
              return (
                <div
                  key={doc.id}
                  onClick={() => {
                    setActiveDocId(doc.id);
                    setCurrentSectionIndex(0);
                    setIsFocusModeActive(false);
                  }}
                  className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md hover:border-teal-400 transition cursor-pointer flex flex-col justify-between group"
                >
                  {/* Card Header Strip */}
                  <div className={`p-5 bg-linear-to-r ${doc.coverColor} text-white relative`}>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-xs text-[11px] font-black uppercase tracking-wider">
                        {doc.areaShort}
                      </span>
                      <div className="flex items-center gap-2">
                        {doc.isCustom && (
                          <button
                            onClick={(e) => handleDeleteCustomDoc(doc.id, e)}
                            title="Excluir material próprio"
                            className="p-1 rounded-lg bg-black/20 hover:bg-red-500/80 text-white transition"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <span className="text-[11px] font-semibold text-white/90 flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5" />
                          {doc.estimatedMinutes} min de leitura
                        </span>
                      </div>
                    </div>
                    <h3 className="text-lg font-extrabold text-white leading-snug line-clamp-2">
                      {doc.title}
                    </h3>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                        {doc.summary}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {doc.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Progress Bar & Actions */}
                    <div className="pt-4 border-t border-slate-100 space-y-3">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                        <span>Progresso de Leitura</span>
                        <span className={progress === 100 ? 'text-emerald-600 font-bold' : 'text-slate-700 font-bold'}>
                          {progress}% {progress === 100 && '✓ Lido'}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            progress === 100 ? 'bg-emerald-500' : 'bg-teal-600'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveDocId(doc.id);
                            setCurrentSectionIndex(0);
                            setIsFocusModeActive(true);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs transition flex items-center gap-1.5"
                        >
                          <Maximize2 className="w-3 h-3 text-teal-600" />
                          <span>Modo Foco</span>
                        </button>

                        <span className="text-xs font-bold text-indigo-600 flex items-center gap-1 group-hover:translate-x-1 transition">
                          <span>Ler Material</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* =========================================================================
            VIEW 2: DOCUMENT READER IN FOCUS MODE (READING EXPERIENCE)
        ========================================================================= */
        <div
          onMouseMove={handleMouseMove}
          onMouseUp={handleWordSelect}
          className={`min-h-screen transition-colors duration-200 relative flex flex-col ${
            settings.colorOverlay === 'dark' ? 'bg-slate-950 text-amber-100' : 'bg-stone-50 text-slate-900'
          }`}
          style={{
            backgroundColor:
              settings.colorOverlay !== 'none' && settings.colorOverlay !== 'dark'
                ? activeOverlay.tintRgba(settings.overlayOpacity * 0.45)
                : undefined,
          }}
        >
          {/* FLOATING AMBIENT TINT OVERLAY FOR DYSLEXIA */}
          {settings.colorOverlay !== 'none' && (
            <div
              className="fixed inset-0 pointer-events-none z-30 transition-opacity duration-300"
              style={{
                backgroundColor: activeOverlay.tintRgba(settings.overlayOpacity),
                mixBlendMode: settings.colorOverlay === 'dark' ? 'multiply' : 'multiply',
              }}
            />
          )}

          {/* DYSLEXIA GUIDED READING RULER (RÉGUA DE LEITURA GUIADA) */}
          {settings.readingRuler && (
            <div
              className="fixed left-0 right-0 pointer-events-none z-35 transition-all duration-75"
              style={{
                top: `${Math.max(80, rulerTop - settings.readingRulerHeight / 2)}px`,
                height: `${settings.readingRulerHeight}px`,
                boxShadow:
                  settings.colorOverlay === 'dark'
                    ? '0 0 0 9999px rgba(0, 0, 0, 0.55)'
                    : '0 0 0 9999px rgba(15, 23, 42, 0.18)',
                borderTop: '2px solid rgba(20, 184, 166, 0.65)',
                borderBottom: '2px solid rgba(20, 184, 166, 0.65)',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
              }}
            >
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-teal-600 bg-white/80 px-2 py-0.5 rounded-md shadow-xs opacity-60">
                Régua Guia (Dislexia)
              </div>
            </div>
          )}

          {/* TOP READER CONTROLS HEADER (Clean & Distraction Free) */}
          <header className="sticky top-0 z-40 backdrop-blur-md bg-white/80 border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 transition shadow-xs">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  stopAudio();
                  setActiveDocId(null);
                  setIsFocusModeActive(false);
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-1.5"
                title="Voltar para a biblioteca de materiais"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Biblioteca</span>
              </button>

              <div className="h-5 w-px bg-slate-200" />

              <div className="space-y-0.5 max-w-md">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 block truncate">
                  {activeDocument.category}
                </span>
                <h2 className="text-sm sm:text-base font-extrabold text-slate-900 truncate">
                  {activeDocument.title}
                </h2>
              </div>
            </div>

            {/* Quick Toolbar */}
            <div className="flex items-center gap-2">
              {/* Audio TTS Button */}
              <button
                onClick={playSectionAudio}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  isPlayingAudio
                    ? 'bg-amber-500 text-slate-950 animate-pulse font-black'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                }`}
                title="Ouvir parágrafos em voz alta (TTS)"
              >
                {isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-teal-600" />}
                <span className="hidden sm:inline">{isPlayingAudio ? 'Parar Leitura' : 'Ouvir Texto'}</span>
              </button>

              {/* Toggle Reading Ruler */}
              <button
                onClick={() => setSettings((s) => ({ ...s, readingRuler: !s.readingRuler }))}
                className={`p-2 rounded-xl text-xs font-bold transition ${
                  settings.readingRuler
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                title="Alternar Régua de Leitura Guiada (R)"
              >
                <Glasses className="w-4 h-4" />
              </button>

              {/* Color Overlay Settings Button */}
              <button
                onClick={() => setIsSettingsPanelOpen(!isSettingsPanelOpen)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  settings.colorOverlay !== 'none' || isSettingsPanelOpen
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                title="Configurar sobreposição de cores e tipografia para dislexia"
              >
                <Palette className="w-4 h-4 text-amber-700" />
                <span className="hidden sm:inline">Filtro & Fonte</span>
              </button>

              {/* Fullscreen Toggle */}
              <button
                onClick={toggleFullscreen}
                className={`p-2 rounded-xl text-xs font-bold transition ${
                  isFullscreen
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                title="Alternar Tela Cheia sem Distrações"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </header>

          {/* READING PROGRESS INDICATOR BAR */}
          <div className="w-full h-1 bg-slate-200">
            <div
              className="h-full bg-linear-to-r from-teal-500 to-indigo-600 transition-all duration-300"
              style={{
                width: `${Math.round(((currentSectionIndex + 1) / activeDocument.sections.length) * 100)}%`,
              }}
            />
          </div>

          {/* SETTINGS DRAWER / POPOVER FOR DYSLEXIA */}
          {isSettingsPanelOpen && (
            <div className="fixed top-16 right-4 sm:right-8 z-50 w-84 sm:w-96 bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-2xl border border-slate-200 animate-scaleUp space-y-6 text-slate-900">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-teal-600" />
                  <h3 className="font-extrabold text-sm text-slate-900">Ajustes para Dislexia & Foco</h3>
                </div>
                <button
                  onClick={() => setIsSettingsPanelOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* 1. Color Overlays (Sobreposição de Cores) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span>Sobreposição de Cor (Filtro)</span>
                  </label>
                  <span className="text-[11px] font-semibold text-teal-700">{activeOverlay.label}</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Alivia o estresse visual e previne a sensação de palavras em movimento na página.
                </p>

                <div className="grid grid-cols-4 gap-2 pt-1">
                  {OVERLAY_COLORS.map((overlay) => (
                    <button
                      key={overlay.id}
                      onClick={() => setSettings((s) => ({ ...s, colorOverlay: overlay.id }))}
                      className={`h-11 rounded-xl border-2 flex flex-col items-center justify-center p-1 transition relative ${
                        overlay.previewBg
                      } ${overlay.borderSample} ${
                        settings.colorOverlay === overlay.id ? 'ring-2 ring-teal-500 ring-offset-2 scale-105' : ''
                      }`}
                    >
                      <span className="text-[10px] font-bold text-slate-800 truncate px-1">
                        {overlay.label.split(' ')[0]}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Opacity slider */}
                {settings.colorOverlay !== 'none' && (
                  <div className="pt-2 space-y-1">
                    <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                      <span>Intensidade da Sobreposição</span>
                      <span>{settings.overlayOpacity}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="60"
                      value={settings.overlayOpacity}
                      onChange={(e) =>
                        setSettings((s) => ({ ...s, overlayOpacity: Number(e.target.value) }))
                      }
                      className="w-full accent-teal-600 cursor-pointer"
                    />
                  </div>
                )}
              </div>

              {/* 2. Reading Ruler Controls */}
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Glasses className="w-3.5 h-3.5 text-teal-600" />
                    <span>Régua de Leitura Guiada</span>
                  </label>
                  <button
                    onClick={() => setSettings((s) => ({ ...s, readingRuler: !s.readingRuler }))}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                      settings.readingRuler
                        ? 'bg-teal-600 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {settings.readingRuler ? 'Ativa' : 'Desligada'}
                  </button>
                </div>
                {settings.readingRuler && (
                  <div className="flex gap-2 pt-1">
                    {[45, 65, 95].map((h) => (
                      <button
                        key={h}
                        onClick={() => setSettings((s) => ({ ...s, readingRulerHeight: h }))}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border ${
                          settings.readingRulerHeight === h
                            ? 'bg-teal-50 border-teal-500 text-teal-900'
                            : 'border-slate-200 text-slate-600'
                        }`}
                      >
                        {h === 45 ? '1 Linha' : h === 65 ? '2 Linhas' : '3 Linhas'}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. Typography Adjustments */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-800 block">
                  Tipografia Acessível
                </label>

                {/* Font family */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setSettings((s) => ({ ...s, fontFamily: 'lexend' }))}
                    className={`py-1.5 rounded-xl text-xs font-bold border ${
                      settings.fontFamily === 'lexend'
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-900'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Lexend (Dislexia)
                  </button>
                  <button
                    onClick={() => setSettings((s) => ({ ...s, fontFamily: 'sans' }))}
                    className={`py-1.5 rounded-xl text-xs font-bold border ${
                      settings.fontFamily === 'sans'
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-900'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Sans Limpa
                  </button>
                  <button
                    onClick={() => setSettings((s) => ({ ...s, fontFamily: 'serif' }))}
                    className={`py-1.5 rounded-xl text-xs font-bold border ${
                      settings.fontFamily === 'serif'
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-900'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Serif Amigável
                  </button>
                </div>

                {/* Font Size & Spacing */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-500 block mb-1">Tamanho</span>
                    <div className="flex border border-slate-200 rounded-xl overflow-hidden">
                      {(['small', 'medium', 'large', 'extralarge'] as const).map((sz, i) => (
                        <button
                          key={sz}
                          onClick={() => setSettings((s) => ({ ...s, fontSize: sz }))}
                          className={`flex-1 py-1 text-xs font-bold ${
                            settings.fontSize === sz ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {i === 0 ? 'P' : i === 1 ? 'M' : i === 2 ? 'G' : 'XG'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-semibold text-slate-500 block mb-1">Espaço entre Letras</span>
                    <div className="flex border border-slate-200 rounded-xl overflow-hidden">
                      {(['normal', 'wide', 'extra'] as const).map((sp) => (
                        <button
                          key={sp}
                          onClick={() => setSettings((s) => ({ ...s, letterSpacing: sp }))}
                          className={`flex-1 py-1 text-xs font-bold ${
                            settings.letterSpacing === sp ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {sp === 'normal' ? 'Norm' : sp === 'wide' ? 'Ampl' : 'Extra'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Column width */}
                <div>
                  <span className="text-[10px] font-semibold text-slate-500 block mb-1">Largura da Coluna</span>
                  <div className="flex border border-slate-200 rounded-xl overflow-hidden">
                    {(['narrow', 'medium', 'wide'] as const).map((w) => (
                      <button
                        key={w}
                        onClick={() => setSettings((s) => ({ ...s, columnWidth: w }))}
                        className={`flex-1 py-1 text-xs font-bold ${
                          settings.columnWidth === w ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {w === 'narrow' ? 'Estreita (Foco)' : w === 'medium' ? 'Equilibrada' : 'Larga'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bionic reading toggle */}
                <div className="pt-2 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Fixação Visual Bionica</span>
                    <span className="text-[10px] text-slate-500">Negrito inicial para direcionar os olhos</span>
                  </div>
                  <button
                    onClick={() => setSettings((s) => ({ ...s, bionicReading: !s.bionicReading }))}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                      settings.bionicReading
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {settings.bionicReading ? 'Ligado' : 'Desligado'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MAIN CENTERING READING CONTAINER (DISTRACTION-FREE CANVAS) */}
          <main
            ref={readingAreaRef}
            className={`flex-1 mx-auto w-full px-5 sm:px-10 py-10 sm:py-16 transition-all duration-200 ${
              typographyStyles.columnWidthClass
            }`}
          >
            {currentSection && (
              <article className="space-y-8 animate-fadeIn">
                {/* Section Index & Subtitle */}
                <div className="space-y-2 border-b border-slate-200/60 pb-6">
                  <div className="flex items-center justify-between gap-4">
                    <span className="px-3 py-1 rounded-full bg-teal-100 text-teal-900 text-xs font-extrabold uppercase tracking-wider">
                      Seção {currentSectionIndex + 1} de {activeDocument.sections.length}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">
                      Dica: selecione qualquer palavra complexa para ver o significado
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 leading-snug">
                    {currentSection.title}
                  </h1>

                  {currentSection.subheading && (
                    <p className="text-base sm:text-lg text-slate-600 font-medium">
                      {currentSection.subheading}
                    </p>
                  )}
                </div>

                {/* Paragraphs */}
                <div
                  className={`space-y-6 ${typographyStyles.fontClass} ${typographyStyles.sizeClass} ${typographyStyles.letterSpacingClass} ${typographyStyles.lineHeightClass}`}
                >
                  {currentSection.paragraphs.map((para, pIdx) => {
                    const isSpeakingThis = isPlayingAudio && speakingParagraphIndex === pIdx;
                    return (
                      <p
                        key={pIdx}
                        className={`transition-all duration-200 rounded-xl p-2 -mx-2 ${
                          isSpeakingThis
                            ? 'bg-amber-200/60 font-semibold ring-2 ring-amber-400'
                            : 'hover:bg-black/[0.02]'
                        }`}
                      >
                        {formatBionicText(para)}
                      </p>
                    );
                  })}
                </div>

                {/* Key Concept Box */}
                {currentSection.keyConcept && (
                  <div className="p-6 rounded-2xl bg-teal-50 border-l-4 border-teal-500 shadow-xs space-y-2">
                    <div className="flex items-center gap-2 text-teal-900 font-extrabold text-sm uppercase tracking-wide">
                      <Sparkles className="w-4 h-4 text-teal-600" />
                      <span>Conceito Chave para Fixação</span>
                    </div>
                    <p className="text-sm sm:text-base text-teal-950 font-medium leading-relaxed">
                      {currentSection.keyConcept}
                    </p>
                  </div>
                )}

                {/* ENEM Tip Box */}
                {currentSection.enemTip && (
                  <div className="p-6 rounded-2xl bg-amber-50 border-l-4 border-amber-500 shadow-xs space-y-2">
                    <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm uppercase tracking-wide">
                      <Lightbulb className="w-4 h-4 text-amber-600" />
                      <span>Dica Prática para o ENEM</span>
                    </div>
                    <p className="text-sm sm:text-base text-amber-950 font-medium leading-relaxed">
                      {currentSection.enemTip}
                    </p>
                  </div>
                )}

                {/* Example Box if present */}
                {currentSection.exampleBox && (
                  <div className="p-6 rounded-2xl bg-indigo-50 border border-indigo-200 shadow-xs space-y-2">
                    <div className="flex items-center gap-2 text-indigo-900 font-extrabold text-sm">
                      <BookOpen className="w-4 h-4 text-indigo-600" />
                      <span>{currentSection.exampleBox.title}</span>
                    </div>
                    <p className="text-sm text-indigo-950 font-normal leading-relaxed">
                      {currentSection.exampleBox.text}
                    </p>
                  </div>
                )}

                {/* Bottom Navigation between sections */}
                <div className="pt-10 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <button
                    onClick={goToPrevSection}
                    disabled={currentSectionIndex === 0}
                    className={`w-full sm:w-auto px-5 py-3 rounded-2xl font-bold text-sm transition flex items-center justify-center gap-2 ${
                      currentSectionIndex === 0
                        ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400'
                        : 'bg-white border border-slate-200 text-slate-800 hover:bg-slate-100 shadow-xs'
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Seção Anterior</span>
                  </button>

                  <div className="text-xs font-semibold text-slate-500">
                    Seção {currentSectionIndex + 1} de {activeDocument.sections.length}
                  </div>

                  {currentSectionIndex < activeDocument.sections.length - 1 ? (
                    <button
                      onClick={goToNextSection}
                      className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-sm transition shadow-md flex items-center justify-center gap-2"
                    >
                      <span>Próxima Seção</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        updateProgress(activeDocument.id, currentSectionIndex, activeDocument.sections.length);
                        stopAudio();
                        setActiveDocId(null);
                      }}
                      className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm transition shadow-md flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Concluir Leitura do Material</span>
                    </button>
                  )}
                </div>
              </article>
            )}
          </main>

          {/* QUICK WORD DEFINITION TOAST / MODAL */}
          {selectedWordDefinition && (
            <div className="fixed bottom-6 right-6 z-50 max-w-sm bg-white p-5 rounded-2xl shadow-2xl border border-teal-300 animate-scaleUp space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-teal-800 uppercase tracking-wide">
                  Significado Rápido: "{selectedWordDefinition.word}"
                </span>
                <button
                  onClick={() => setSelectedWordDefinition(null)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {selectedWordDefinition.simpleMeaning}
              </p>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          MODAL: CREATE / PASTE CUSTOM STUDY MATERIAL
      ========================================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 animate-scaleUp">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg">
                    Importar ou Colar Meu Material
                  </h3>
                  <p className="text-xs text-slate-500">
                    Leia qualquer resumo, anotação ou capítulo com Modo Foco e sobreposição de cores.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDocument} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">Título do Material *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Resumo de Termodinâmica - Aula 04"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800">Subtítulo ou Resumo Breve</label>
                  <input
                    type="text"
                    placeholder="Ex: Foco nas leis da termodinâmica e máquinas térmicas"
                    value={newSubtitle}
                    onChange={(e) => setNewSubtitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800">Área do Conhecimento</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  >
                    <option value="Linguagens, Códigos e suas Tecnologias">Linguagens e Códigos</option>
                    <option value="Ciências Humanas e suas Tecnologias">Ciências Humanas</option>
                    <option value="Ciências da Natureza e suas Tecnologias">Ciências da Natureza</option>
                    <option value="Matemática e suas Tecnologias">Matemática e TRI</option>
                    <option value="Redação ENEM">Redação ENEM</option>
                    <option value="Guia Neuroinclusivo">Guia Neuroinclusivo</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">
                  Conteúdo do Documento (Cole o texto aqui) *
                </label>
                <textarea
                  required
                  rows={8}
                  placeholder="Cole aqui o texto da sua apostila, anotações de aula ou artigo. Pressione Enter duas vezes para separar parágrafos..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full p-4 rounded-xl border border-slate-200 text-sm font-sans focus:ring-2 focus:ring-teal-500 focus:outline-hidden leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs transition shadow-md flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Salvar e Abrir no Modo Foco</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
