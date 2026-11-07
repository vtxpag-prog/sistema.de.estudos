import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { pomodoroAudio } from '../../utils/pomodoroAudio';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  CheckCircle2,
  Coffee,
  Brain,
  Headphones,
  Maximize2,
  Minimize2,
  Settings,
  ChevronDown,
  ChevronUp,
  X,
  Plus,
  Trash2,
  Heart,
  Wind,
  Smile,
  ShieldCheck,
  Bell
} from 'lucide-react';

export type PomodoroPreset = 'curto_tdah' | 'ultracurto' | 'classico' | 'longo' | 'custom';
export type PomodoroPhase = 'foco' | 'pausa_curta' | 'pausa_longa';

interface PresetConfig {
  id: PomodoroPreset;
  name: string;
  badge: string;
  focusMinutes: number;
  breakMinutes: number;
  longBreakMinutes: number;
  description: string;
  tdahRecommended?: boolean;
}

const PRESETS: Record<PomodoroPreset, PresetConfig> = {
  curto_tdah: {
    id: 'curto_tdah',
    name: 'Ciclo Curto TDAH',
    badge: '15 / 5 min',
    focusMinutes: 15,
    breakMinutes: 5,
    longBreakMinutes: 15,
    description: 'Micro-blocos de ativação rápida. Evita fadiga mental e reduz a procrastinação.',
    tdahRecommended: true,
  },
  ultracurto: {
    id: 'ultracurto',
    name: 'Micro-Sprint',
    badge: '10 / 3 min',
    focusMinutes: 10,
    breakMinutes: 3,
    longBreakMinutes: 10,
    description: 'Para dias de alta dispersão ou cansaço. Barreira mínima de início.',
  },
  classico: {
    id: 'classico',
    name: 'Tradicional',
    badge: '25 / 5 min',
    focusMinutes: 25,
    breakMinutes: 5,
    longBreakMinutes: 20,
    description: 'Equilíbrio clássico para sessões de estudo regulares.',
  },
  longo: {
    id: 'longo',
    name: 'Ciclo Longo',
    badge: '45 / 15 min',
    focusMinutes: 45,
    breakMinutes: 15,
    longBreakMinutes: 25,
    description: 'Imersão aprofundada para redações longas e blocos de simulados.',
  },
  custom: {
    id: 'custom',
    name: 'Personalizado',
    badge: 'Manual',
    focusMinutes: 20,
    breakMinutes: 5,
    longBreakMinutes: 15,
    description: 'Defina tempos sob medida para sua rotina de estudos.',
  },
};

export const PomodoroTimer: React.FC = () => {
  const { accessibility } = useApp();

  // Estados principais
  const [preset, setPreset] = useState<PomodoroPreset>(
    accessibility.tdahMode ? 'curto_tdah' : 'curto_tdah'
  );
  const [phase, setPhase] = useState<PomodoroPhase>('foco');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  
  // Tempos em segundos
  const currentConfig = PRESETS[preset];
  const [focusDuration, setFocusDuration] = useState<number>(currentConfig.focusMinutes * 60);
  const [breakDuration, setBreakDuration] = useState<number>(currentConfig.breakMinutes * 60);
  const [longBreakDuration, setLongBreakDuration] = useState<number>(currentConfig.longBreakMinutes * 60);
  const [timeLeft, setTimeLeft] = useState<number>(currentConfig.focusMinutes * 60);

  // Ciclos concluídos
  const [completedCycles, setCompletedCycles] = useState<number>(0);
  const [totalFocusMinutesToday, setTotalFocusMinutesToday] = useState<number>(0);

  // Configurações de som e sensoriais
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [soundType, setSoundType] = useState<'singing-bowl' | 'chime' | 'water' | 'harp'>('singing-bowl');
  const [soundVolume, setSoundVolume] = useState<number>(0.5);
  const [brownNoiseActive, setBrownNoiseActive] = useState<boolean>(false);
  const [brownNoiseVolume, setBrownNoiseVolume] = useState<number>(0.2);

  // Visual e modos de exibição
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showBrainDump, setShowBrainDump] = useState<boolean>(false);
  const [showBreathingExercise, setShowBreathingExercise] = useState<boolean>(false);
  const [breathingStep, setBreathingStep] = useState<'inhale' | 'hold' | 'exhale'>('inhale');

  // Micro-meta da sessão
  const [currentGoal, setCurrentGoal] = useState<string>('');
  const [isEditingGoal, setIsEditingGoal] = useState<boolean>(false);

  // Estacionamento de ideias / Distrações para depois (Brain Dump TDAH)
  const [distractionNotes, setDistractionNotes] = useState<string[]>([]);
  const [newNoteInput, setNewNoteInput] = useState<string>('');

  // Notificação suave na tela
  const [gentleAlert, setGentleAlert] = useState<{
    show: boolean;
    title: string;
    message: string;
    type: 'foco' | 'pausa';
  }>({
    show: false,
    title: '',
    message: '',
    type: 'foco',
  });

  // Timer interval ref
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Atualiza durações ao mudar preset
  const handleSelectPreset = (newPreset: PomodoroPreset) => {
    setPreset(newPreset);
    const cfg = PRESETS[newPreset];
    const newFocus = cfg.focusMinutes * 60;
    const newBreak = cfg.breakMinutes * 60;
    const newLongBreak = cfg.longBreakMinutes * 60;

    setFocusDuration(newFocus);
    setBreakDuration(newBreak);
    setLongBreakDuration(newLongBreak);

    setIsRunning(false);
    if (phase === 'foco') {
      setTimeLeft(newFocus);
    } else if (phase === 'pausa_curta') {
      setTimeLeft(newBreak);
    } else {
      setTimeLeft(newLongBreak);
    }
  };

  // Troca de fase
  const switchPhase = (targetPhase: PomodoroPhase, autoStart = false) => {
    setPhase(targetPhase);
    let newTime = focusDuration;
    if (targetPhase === 'pausa_curta') newTime = breakDuration;
    if (targetPhase === 'pausa_longa') newTime = longBreakDuration;
    setTimeLeft(newTime);
    setIsRunning(autoStart);
  };

  // Efeito do Timer (tick a cada segundo)
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleCycleCompletion();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, phase, completedCycles, focusDuration, breakDuration, longBreakDuration, soundEnabled, soundType, soundVolume]);

  // Ao completar o ciclo
  const handleCycleCompletion = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRunning(false);

    // Tocar som suave se habilitado
    if (soundEnabled) {
      pomodoroAudio.playAlert(soundType, soundVolume);
    }

    if (phase === 'foco') {
      const newCycles = completedCycles + 1;
      setCompletedCycles(newCycles);
      setTotalFocusMinutesToday((prev) => prev + Math.round(focusDuration / 60));

      // Se completou 4 ciclos, sugere pausa longa
      const isLongBreakTime = newCycles % 4 === 0;
      const nextPhase: PomodoroPhase = isLongBreakTime ? 'pausa_longa' : 'pausa_curta';
      const nextTime = isLongBreakTime ? longBreakDuration : breakDuration;

      setPhase(nextPhase);
      setTimeLeft(nextTime);

      setGentleAlert({
        show: true,
        title: isLongBreakTime ? '🌱 Pausa Longa Merecida!' : '🌿 Hora de Respirar e Descansar',
        message: isLongBreakTime
          ? 'Você completou 4 blocos de foco! Levante, caminhe um pouco, tome água e relaxe por 15 a 20 minutos.'
          : 'Excelente bloco de estudo! Descanse os olhos da tela, alongue os ombros e beba um copo d’água.',
        type: 'pausa',
      });
    } else {
      // Terminou a pausa, volta para o foco
      setPhase('foco');
      setTimeLeft(focusDuration);

      setGentleAlert({
        show: true,
        title: '🎯 Pronto para Recomeçar?',
        message: 'Novo ciclo de foco suave pronto. Escolha uma única meta e estude no seu ritmo acolhedor.',
        type: 'foco',
      });
    }
  };

  // Controle de ruído marrom ambiente
  const toggleBrownNoise = () => {
    if (brownNoiseActive) {
      pomodoroAudio.stopBrownNoise();
      setBrownNoiseActive(false);
    } else {
      pomodoroAudio.startBrownNoise(brownNoiseVolume);
      setBrownNoiseActive(true);
    }
  };

  const handleNoiseVolumeChange = (vol: number) => {
    setBrownNoiseVolume(vol);
    pomodoroAudio.setNoiseVolume(vol);
  };

  // Limpeza de ruído ambiente ao desmontar
  useEffect(() => {
    return () => {
      pomodoroAudio.stopBrownNoise();
    };
  }, []);

  // Exercício de respiração guiada (4-4-4)
  useEffect(() => {
    if (!showBreathingExercise) return;
    const interval = setInterval(() => {
      setBreathingStep((prev) => {
        if (prev === 'inhale') return 'hold';
        if (prev === 'hold') return 'exhale';
        return 'inhale';
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [showBreathingExercise]);

  // Formatação de tempo mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Cálculo de progresso percentual
  const currentTotal =
    phase === 'foco'
      ? focusDuration
      : phase === 'pausa_curta'
      ? breakDuration
      : longBreakDuration;
  const progressPercent = Math.max(0, Math.min(100, Math.round(((currentTotal - timeLeft) / currentTotal) * 100)));

  // Adicionar nota de distração (Brain Dump)
  const addDistractionNote = () => {
    if (!newNoteInput.trim()) return;
    setDistractionNotes((prev) => [newNoteInput.trim(), ...prev]);
    setNewNoteInput('');
  };

  const removeDistractionNote = (index: number) => {
    setDistractionNotes((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Cores de tema suaves de acordo com a fase
  const getPhaseTheme = () => {
    if (phase === 'foco') {
      return {
        bgBadge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        stroke: '#6366f1',
        label: 'Modo Foco Acolhedor',
        icon: <Brain className="w-4 h-4 text-indigo-600" />,
        ring: 'border-indigo-300',
        cardBg: 'bg-indigo-50/50',
      };
    }
    if (phase === 'pausa_curta') {
      return {
        bgBadge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        stroke: '#10b981',
        label: 'Pausa Curta Regenerativa',
        icon: <Coffee className="w-4 h-4 text-emerald-600" />,
        ring: 'border-emerald-300',
        cardBg: 'bg-emerald-50/50',
      };
    }
    return {
      bgBadge: 'bg-amber-50 text-amber-700 border-amber-200',
      stroke: '#f59e0b',
      label: 'Pausa Longa de Descanso',
      icon: <Sparkles className="w-4 h-4 text-amber-600" />,
      ring: 'border-amber-300',
      cardBg: 'bg-amber-50/50',
    };
  };

  const theme = getPhaseTheme();

  // Se minimizado, renderiza dock compacto no topo
  if (isMinimized) {
    return (
      <div className="bg-white/95 backdrop-blur-md border-2 border-indigo-200 rounded-2xl p-3 shadow-sm flex items-center justify-between gap-3 transition">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold">
            <Timer className={`w-5 h-5 ${isRunning ? 'animate-pulse text-indigo-600' : ''}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800">
                {theme.label}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${theme.bgBadge}`}>
                {currentConfig.name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-slate-900 font-mono">
                {formatTime(timeLeft)}
              </span>
              <span className="text-[11px] text-slate-500">
                • {progressPercent}% decorrido
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-2xs ${
              isRunning
                ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pausar</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Iniciar</span>
              </>
            )}
          </button>

          <button
            onClick={() => setIsMinimized(false)}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition"
            title="Expandir Cronômetro Completo"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border-2 border-indigo-100 p-5 sm:p-7 shadow-xs space-y-6 relative overflow-hidden transition">
      {/* Banner de Aviso Suave (Toast Afetuoso) */}
      {gentleAlert.show && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-50 via-emerald-50 to-teal-50 border-2 border-teal-300 flex items-start justify-between gap-3 shadow-xs animate-fadeIn">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-teal-600 text-white rounded-xl shrink-0 mt-0.5 shadow-2xs">
              <Smile className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-extrabold text-teal-950 text-sm">
                {gentleAlert.title}
              </h4>
              <p className="text-xs text-teal-800 leading-relaxed max-w-xl">
                {gentleAlert.message}
              </p>
            </div>
          </div>
          <button
            onClick={() => setGentleAlert((prev) => ({ ...prev, show: false }))}
            className="p-1 hover:bg-teal-200/60 rounded-lg text-teal-800 transition"
            title="Fechar aviso"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header do Pomodoro */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-200">
              <Timer className="w-4 h-4" />
            </span>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              Cronômetro de Foco Pomodoro
            </h3>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
              Neuroinclusivo TDAH
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Avisos visuais e sonoros suaves sem sustos. Alterne entre micro-metas e pausas de regeneração mental.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {/* Botão Ruído Marrom / Som Ambiente */}
          <button
            onClick={toggleBrownNoise}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border cursor-pointer ${
              brownNoiseActive
                ? 'bg-amber-100 border-amber-300 text-amber-900'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
            title="Ativar ruído marrom suave contínuo para bloquear distrações sonoras externas"
          >
            <Headphones className="w-3.5 h-3.5 text-amber-600" />
            <span>{brownNoiseActive ? 'Ruído Marrom: Ativo' : 'Som de Foco'}</span>
          </button>

          {/* Botão Respiração Guiada */}
          <button
            onClick={() => setShowBreathingExercise(!showBreathingExercise)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border cursor-pointer ${
              showBreathingExercise
                ? 'bg-teal-100 border-teal-300 text-teal-900'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
            title="Abrir exercício de respiração guiada 4-4-4 para desacelerar antes de focar"
          >
            <Wind className="w-3.5 h-3.5 text-teal-600" />
            <span>Respiração 4-4-4</span>
          </button>

          {/* Botão Estacionamento de Ideias */}
          <button
            onClick={() => setShowBrainDump(!showBrainDump)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border cursor-pointer ${
              showBrainDump
                ? 'bg-purple-100 border-purple-300 text-purple-900'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
            title="Anotar pensamentos repentinos para olhar depois sem sair do estudo"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Ideias & Distrações ({distractionNotes.length})</span>
          </button>

          {/* Botão Ajustes */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
              showSettings
                ? 'bg-indigo-100 border-indigo-300 text-indigo-900'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
            title="Configurar sons e duração dos ciclos"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Botão Minimizar */}
          <button
            onClick={() => setIsMinimized(true)}
            className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition"
            title="Minimizar para barra compacta"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Seletor de Ciclos (Presets) com destaque para Ciclo Curto 15/5 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Escolha o Ritmo de Estudo:
          </span>
          <span className="text-[11px] text-indigo-700 font-semibold">
            {currentConfig.description}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {(Object.keys(PRESETS) as PomodoroPreset[]).map((key) => {
            const p = PRESETS[key];
            const isSelected = preset === key;
            return (
              <button
                key={key}
                onClick={() => handleSelectPreset(key)}
                className={`p-3 rounded-2xl text-left border-2 transition relative cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-50/90 border-indigo-600 text-indigo-950 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {p.tdahRecommended && (
                  <span className="absolute -top-2.5 right-2 px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-600 text-white uppercase tracking-wider shadow-2xs">
                    TDAH ⭐
                  </span>
                )}
                <div className="font-extrabold text-xs block leading-tight">
                  {p.name}
                </div>
                <div className="text-[11px] font-bold text-indigo-700 mt-1">
                  {p.badge}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Painel Principal de Tempo com Círculo Visual Suave */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Lado Esquerdo: Seletor de Fase e Micro-Meta */}
        <div className="md:col-span-5 space-y-4">
          {/* Seletor manual de fases */}
          <div className="p-1.5 bg-slate-100 rounded-2xl border border-slate-200 flex items-center gap-1">
            <button
              onClick={() => switchPhase('foco')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                phase === 'foco'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Brain className="w-3.5 h-3.5" />
              <span>Foco</span>
            </button>

            <button
              onClick={() => switchPhase('pausa_curta')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                phase === 'pausa_curta'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Coffee className="w-3.5 h-3.5" />
              <span>Pausa 5m</span>
            </button>

            <button
              onClick={() => switchPhase('pausa_longa')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                phase === 'pausa_longa'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Pausa Longa</span>
            </button>
          </div>

          {/* Micro-Meta da Sessão (Ancora a atenção do TDAH) */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                Meta Única Deste Bloco:
              </span>
              {!isEditingGoal && currentGoal && (
                <button
                  onClick={() => setIsEditingGoal(true)}
                  className="text-[11px] text-indigo-600 font-bold hover:underline"
                >
                  Alterar
                </button>
              )}
            </div>

            {isEditingGoal || !currentGoal ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={currentGoal}
                  onChange={(e) => setCurrentGoal(e.target.value)}
                  placeholder="Ex: Fazer 3 questões de Biologia ou 1 parágrafo..."
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:border-indigo-500 bg-white"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') setIsEditingGoal(false);
                  }}
                />
                <button
                  onClick={() => setIsEditingGoal(false)}
                  className="px-3 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition"
                >
                  Definir
                </button>
              </div>
            ) : (
              <p className="text-xs font-bold text-slate-800 bg-white p-2.5 rounded-xl border border-slate-200">
                "{currentGoal}"
              </p>
            )}
          </div>

          {/* Progresso de Ciclos e Mudinhas Sem Pressão */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-extrabold text-slate-900 block">
                {completedCycles} Ciclos Completados Hoje
              </span>
              <span className="text-[11px] text-slate-500">
                Total de {totalFocusMinutesToday} minutos de foco concentrado
              </span>
            </div>

            <div className="flex items-center gap-1 text-base">
              {Array.from({ length: Math.min(4, Math.max(1, completedCycles + 1)) }).map((_, i) => (
                <span key={i} title={`Ciclo ${i + 1}`}>
                  {i < completedCycles ? '🌱' : '⚪'}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Lado Direito: Círculo SVG e Controles de Ação */}
        <div className="md:col-span-7 flex flex-col items-center justify-center space-y-5">
          <div className="relative flex items-center justify-center">
            {/* SVG Circular Progress Suave */}
            <svg className="w-56 h-56 transform -rotate-90" viewBox="0 0 200 200">
              <circle
                cx="100"
                cy="100"
                r="86"
                stroke="#f1f5f9"
                strokeWidth="12"
                fill="none"
              />
              <circle
                cx="100"
                cy="100"
                r="86"
                stroke={theme.stroke}
                strokeWidth="12"
                strokeDasharray={2 * Math.PI * 86}
                strokeDashoffset={2 * Math.PI * 86 * (1 - progressPercent / 100)}
                strokeLinecap="round"
                fill="none"
                className="transition-all duration-1000 ease-linear"
              />
            </svg>

            {/* Conteúdo central do relógio */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
              <div className="flex items-center gap-1.5 mb-1">
                {theme.icon}
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  {phase === 'foco' ? 'Foco' : phase === 'pausa_curta' ? 'Pausa' : 'Pausa Longa'}
                </span>
              </div>
              <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-slate-900">
                {formatTime(timeLeft)}
              </span>
              <span className="text-xs font-semibold text-slate-500 mt-1">
                {progressPercent}% concluído
              </span>
            </div>
          </div>

          {/* Botões de Controle Principal */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`px-8 py-3.5 rounded-2xl font-extrabold text-sm transition shadow-sm flex items-center gap-2 cursor-pointer ${
                isRunning
                  ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-5 h-5" />
                  <span>Pausar Momento</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  <span>Iniciar Foco</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                setIsRunning(false);
                setTimeLeft(currentTotal);
              }}
              className="p-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer border border-slate-200"
              title="Reiniciar este ciclo"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Painel de Exercício de Respiração Guiada 4-4-4 */}
      {showBreathingExercise && (
        <div className="p-6 rounded-3xl bg-teal-50 border-2 border-teal-300 text-center space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-teal-900 font-extrabold text-sm">
              <Wind className="w-4 h-4 text-teal-700" />
              <span>Exercício de Respiração Quadrada (4-4-4) para Foco e Calma</span>
            </div>
            <button
              onClick={() => setShowBreathingExercise(false)}
              className="p-1 hover:bg-teal-200/50 rounded-lg text-teal-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col items-center justify-center py-4 space-y-3">
            <div
              className={`w-28 h-28 rounded-full border-4 flex items-center justify-center transition-all duration-1000 ${
                breathingStep === 'inhale'
                  ? 'scale-125 bg-teal-200 border-teal-500 text-teal-950 font-black'
                  : breathingStep === 'hold'
                  ? 'scale-110 bg-emerald-200 border-emerald-500 text-emerald-950 font-black'
                  : 'scale-90 bg-sky-200 border-sky-500 text-sky-950 font-black'
              }`}
            >
              <span className="text-sm">
                {breathingStep === 'inhale' && 'Inspire (4s)'}
                {breathingStep === 'hold' && 'Segure (4s)'}
                {breathingStep === 'exhale' && 'Expire (4s)'}
              </span>
            </div>
            <p className="text-xs text-teal-800 max-w-md">
              A respiração ritmada estimula o nervo vago, diminui a ansiedade e prepara o córtex pré-frontal para o estudo sem sobrecarga.
            </p>
          </div>
        </div>
      )}

      {/* Estacionamento de Ideias / Distrações para depois (Brain Dump) */}
      {showBrainDump && (
        <div className="p-5 rounded-3xl bg-purple-50/80 border-2 border-purple-200 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-purple-950 font-extrabold text-sm">
              <Sparkles className="w-4 h-4 text-purple-700" />
              <span>Estacionamento de Pensamentos (Para olhar só na pausa)</span>
            </div>
            <button
              onClick={() => setShowBrainDump(false)}
              className="p-1 hover:bg-purple-200/50 rounded-lg text-purple-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-purple-800 leading-relaxed">
            Lembrou de algo importante ou bateu curiosidade repentina? Em vez de pausar seu estudo e abrir outra aba, anote aqui. Ficará salvo para você olhar tranquilamente quando a pausa chegar.
          </p>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newNoteInput}
              onChange={(e) => setNewNoteInput(e.target.value)}
              placeholder="Ex: responder mensagem de João, pesquisar tênis, checar horário..."
              className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-purple-200 focus:outline-hidden focus:border-purple-500 bg-white"
              onKeyDown={(e) => {
                if (e.key === 'Enter') addDistractionNote();
              }}
            />
            <button
              onClick={addDistractionNote}
              className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Guardar</span>
            </button>
          </div>

          {distractionNotes.length > 0 ? (
            <div className="space-y-1.5 max-h-40 overflow-y-auto pt-2">
              {distractionNotes.map((note, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-white border border-purple-100 flex items-center justify-between gap-2 text-xs text-slate-800"
                >
                  <span className="truncate">{note}</span>
                  <button
                    onClick={() => removeDistractionNote(idx)}
                    className="p-1 hover:bg-rose-50 text-rose-500 rounded-lg transition"
                    title="Remover nota resolvida"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-2 text-xs text-purple-600 italic">
              Nenhuma distração anotada no momento. Mente livre para focar!
            </div>
          )}
        </div>
      )}

      {/* Painel de Ajustes de Áudio Suave e Tempos Customizados */}
      {showSettings && (
        <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-5 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Settings className="w-4 h-4 text-indigo-600" />
              <span>Configurações dos Avisos Suaves & Personalização</span>
            </h4>
            <button
              onClick={() => setShowSettings(false)}
              className="p-1 hover:bg-slate-200 rounded-lg text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Sons Suaves de Alerta */}
            <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-indigo-600" />
                  Tom do Aviso Suave:
                </span>
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition ${
                    soundEnabled
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                  <span>{soundEnabled ? 'Som Ativo' : 'Mudo'}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'singing-bowl', label: 'Tigela Tibetana (432Hz)' },
                  { id: 'chime', label: 'Carrilhão Suave' },
                  { id: 'water', label: 'Gotas de Água' },
                  { id: 'harp', label: 'Arpa Serenidade' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setSoundType(s.id as any);
                      pomodoroAudio.playAlert(s.id as any, soundVolume);
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-bold text-left border transition ${
                      soundType === s.id
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-2xs'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              <div className="space-y-1 pt-2">
                <div className="flex items-center justify-between text-[11px] text-slate-600">
                  <span>Volume do Aviso:</span>
                  <span>{Math.round(soundVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={soundVolume}
                  onChange={(e) => setSoundVolume(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <button
                onClick={() => pomodoroAudio.playAlert(soundType, soundVolume)}
                className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Testar Aviso Sonoro Agora</span>
              </button>
            </div>

            {/* Ajuste do Ruído Marrom Ambiente */}
            <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Headphones className="w-3.5 h-3.5 text-amber-600" />
                Ruído Marrom de Fundo (Abafa Ruídos Externos):
              </span>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                O som aveludado de ruído marrom sintético ajuda alunos com TDAH a ancorar a atenção e silencia barulhos externos intermitentes.
              </p>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-600">
                  <span>Volume do Ruído de Fundo:</span>
                  <span>{Math.round(brownNoiseVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.6"
                  step="0.05"
                  value={brownNoiseVolume}
                  onChange={(e) => handleNoiseVolumeChange(parseFloat(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
              </div>

              <button
                onClick={toggleBrownNoise}
                className={`w-full py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  brownNoiseActive
                    ? 'bg-amber-500 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Headphones className="w-3.5 h-3.5" />
                <span>{brownNoiseActive ? 'Desativar Ruído Marrom' : 'Ativar Ruído Marrom'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
