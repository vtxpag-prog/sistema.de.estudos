import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import {
  GraduationCap,
  Users,
  School,
  Landmark,
  Cpu,
  Sparkles,
  Award,
  BookOpen,
  Brain,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  X,
  Volume2,
  VolumeX,
  Compass,
  FileText,
  Sliders,
  Database,
  Terminal,
  Zap,
  Eye,
  HeartHandshake
} from 'lucide-react';

interface OnboardingStep {
  title: string;
  subtitle: string;
  description: string;
  highlightPoints: string[];
  icon: React.ReactNode;
  badge: string;
  previewType: string;
  interactiveActionLabel?: string;
  onInteractiveAction?: () => void;
}

export const InteractiveOnboardingModal: React.FC = () => {
  const {
    isOnboardingOpen,
    setIsOnboardingOpen,
    role,
    currentUser,
    setStudentActiveTab,
    gradeLevel,
    setGradeLevel,
    accessibility,
    updateAccessibility,
    setIsRegistrationHubOpen,
    speakText,
    stopSpeaking,
    isSpeaking,
  } = useApp();

  const [currentStep, setCurrentStep] = useState(0);
  const [neverShowAgain, setNeverShowAgain] = useState(false);

  // Reset step whenever opened
  useEffect(() => {
    if (isOnboardingOpen) {
      setCurrentStep(0);
      stopSpeaking();
    }
  }, [isOnboardingOpen]);

  if (!isOnboardingOpen) return null;

  // Build profile-specific onboarding steps
  const getStepsForRole = (userRole: UserRole): OnboardingStep[] => {
    switch (userRole) {
      case 'aluno':
        return [
          {
            title: 'Boas-vindas ao seu Espaço de Estudos',
            subtitle: 'Painel Central & Métricas em Tempo Real',
            description:
              'Este ambiente foi projetado para seu desenvolvimento gradual e contínuo, sem pressão excessiva e 100% gratuito. Você acompanha seus dias consecutivos de estudo, taxa de acerto e tempo dedicado.',
            highlightPoints: [
              'Contador de sequência (streak) para criar hábitos diários sem estresse',
              'Histórico de acertos segmentado pelas 4 grandes áreas do conhecimento',
              'Interface limpa, livre de anúncios e com foco pedagógico integral',
            ],
            icon: <GraduationCap className="w-6 h-6 text-indigo-600" />,
            badge: 'Passo 1 • Visão Geral',
            previewType: 'stats_preview',
            interactiveActionLabel: 'Ir para o Início do Aluno',
            onInteractiveAction: () => setStudentActiveTab('inicio'),
          },
          {
            title: 'Modo Série: Proporção Curricular Exata',
            subtitle: 'O currículo da sua série calibrado no formato ENEM',
            description:
              'Você estuda a matéria que está aprendendo na escola (1º, 2º ou 3º ano), mas as questões são formuladas com os comandos, distratores e matriz de habilidades do ENEM.',
            highlightPoints: [
              '1º ano: 80% do currículo do 1º ano + 20% no formato oficial ENEM',
              '2º ano: 70% do 2º ano + 20% revisão do 1º + 10% formato ENEM',
              '3º ano: 60% do 3º ano + 25% revisão + 15% simulação ENEM intensiva',
            ],
            icon: <BookOpen className="w-6 h-6 text-emerald-600" />,
            badge: 'Passo 2 • Matriz Pedagógica',
            previewType: 'serie_preview',
            interactiveActionLabel: 'Explorar Modo Série',
            onInteractiveAction: () => setStudentActiveTab('serie'),
          },
          {
            title: 'Modo ENEM Oficial & Gabarito Comentado',
            subtitle: 'Banco de Questões com Resolução Passo a Passo',
            description:
              'Simulados que cobrem todas as competências da matriz Inep. Cada questão conta com explicação detalhada e a opção de simplificação para leitura direta.',
            highlightPoints: [
              'Leitura de enunciado em voz alta com áudio integrado (TTS)',
              'Modo Simplificado TEA: texto direto com destaque para a meta da questão',
              'Gabarito comentado com justificativa pedagógica de cada distrator',
            ],
            icon: <Award className="w-6 h-6 text-amber-600" />,
            badge: 'Passo 3 • Simulação Real',
            previewType: 'enem_preview',
            interactiveActionLabel: 'Ver Banco do ENEM',
            onInteractiveAction: () => setStudentActiveTab('enem'),
          },
          {
            title: 'Redação Corrigida por Inteligência Artificial',
            subtitle: 'Diagnóstico Pedagógico nas 5 Competências do ENEM',
            description:
              'Pratique textos dissertativo-argumentativos com propostas oficiais e receba uma devolutiva detalhada em minutos, analisando as competências C1 a C5.',
            highlightPoints: [
              'Critérios calibrados para cada série (ênfase estrutural no 1º ano, proposta completa no 3º)',
              'Apontamento de desvios gramaticais, repertório sociocultural e coesão',
              'Sugestões práticas de aprimoramento sem custo e sem limites diários',
            ],
            icon: <FileText className="w-6 h-6 text-purple-600" />,
            badge: 'Passo 4 • Redação Nota 1000',
            previewType: 'redacao_preview',
            interactiveActionLabel: 'Praticar Redação',
            onInteractiveAction: () => setStudentActiveTab('redacao'),
          },
          {
            title: 'Acessibilidade & Neuroinclusão Confidencial',
            subtitle: 'Adaptações nativas para TDAH, TEA e Dislexia',
            description:
              'Acesse a barra flutuante no canto inferior direito para ativar recursos desenvolvidos para neurodivergências, com total garantia de sigilo e sem expor diagnósticos.',
            highlightPoints: [
              'Modo TDAH: Blocos de foco (15-20 min), confirmação anti-impulso e tela zen',
              'Modo TEA: Linguagem factual direta, previsibilidade e sem ironias/figuras de estilo ambíguas',
              'Modo Dislexia: Fonte especial Lexend, espaçamento ampliado e régua guia de leitura visual',
            ],
            icon: <Brain className="w-6 h-6 text-teal-600" />,
            badge: 'Passo 5 • Inclusão Plena',
            previewType: 'accessibility_preview',
            interactiveActionLabel: 'Abrir Perfil de Aprendizagem',
            onInteractiveAction: () => setStudentActiveTab('perfil'),
          },
        ];

      case 'professor':
        return [
          {
            title: 'Painel Docente de Turmas',
            subtitle: 'Acompanhamento Coletivo e Engajamento',
            description:
              'Visualize todas as suas turmas atribuídas (1º A, 2º B, 3º C) em um único lugar, acompanhando a evolução dos alunos sem sobrecarga de trabalho.',
            highlightPoints: [
              'Quadro de turmas com número de estudantes e atividade recente',
              'Métricas consolidadas de resolução de questões e tempo de estudo',
              'Visualização agregada sem quebra do sigilo individual dos alunos',
            ],
            icon: <Users className="w-6 h-6 text-emerald-600" />,
            badge: 'Passo 1 • Turmas',
            previewType: 'teacher_classes',
          },
          {
            title: 'Gerador de Listas com Proporção Curricular',
            subtitle: 'Atividades alinhadas à BNCC e matriz do ENEM',
            description:
              'Crie listas de exercícios sob medida escolhendo a série e a disciplina. O sistema calibra automaticamente os itens para respeitar a cota exata da série.',
            highlightPoints: [
              'Filtro por habilidades da BNCC e áreas do conhecimento',
              'Equilíbrio automático entre conteúdo curricular e formato de prova',
              'Exportação direta para resolução digital pelos estudantes',
            ],
            icon: <BookOpen className="w-6 h-6 text-indigo-600" />,
            badge: 'Passo 2 • Listas de Exercícios',
            previewType: 'teacher_lists',
          },
          {
            title: 'Correção Assistida de Redações',
            subtitle: 'Suporte de IA nas Competências C1 a C5',
            description:
              'Receba as redações dos alunos já pré-analisadas pela inteligência pedagógica do sistema, permitindo que você valide e adicione pareceres personalizados com agilidade.',
            highlightPoints: [
              'Pontuação estimada preliminar para cada uma das 5 competências',
              'Identificação de pontos fortes do repertório e proposta de intervenção',
              'Feedback docente humanizado e construtivo',
            ],
            icon: <FileText className="w-6 h-6 text-purple-600" />,
            badge: 'Passo 3 • Produção Textual',
            previewType: 'teacher_essays',
          },
          {
            title: 'Privacidade Absoluta & LGPD',
            subtitle: 'Acompanhamento pedagógico sem exposição de saúde',
            description:
              'O sistema adota o Princípio 5 de Privacidade: você recebe métricas metodológicas agregadas de aprendizagem, sem dados de prontuário ou diagnósticos médicos.',
            highlightPoints: [
              'Dados de neurodivergência mantidos em sigilo e operados pelo próprio aluno',
              'Relatórios focados exclusivamente em competências curriculares',
              'Ambiente em estrita conformidade com a legislação de proteção de dados',
            ],
            icon: <ShieldCheck className="w-6 h-6 text-sky-600" />,
            badge: 'Passo 4 • Ética & Segurança',
            previewType: 'teacher_privacy',
          },
        ];

      case 'escola':
        return [
          {
            title: 'Autonomia Escolar em 1 Clique',
            subtitle: 'Equidade Total: Escola Pública Igual à Particular',
            description:
              'Sua escola participa gratuitamente com autonomia plena. Escolas públicas e privadas têm acesso idêntico a todas as ferramentas pedagógicas da plataforma.',
            highlightPoints: [
              'Sem contratos comerciais, sem cobranças e sem burocracia de adesão',
              'Acesso simultâneo e ilimitado para corpo docente e alunos',
              'Independência na gestão pedagógica interna',
            ],
            icon: <School className="w-6 h-6 text-sky-600" />,
            badge: 'Passo 1 • Adesão Autônoma',
            previewType: 'school_autonomy',
          },
          {
            title: 'Código Institucional e Chaves de Acesso',
            subtitle: 'Conexão simples de estudantes e professores',
            description:
              'Sua escola possui um código institucional gerado automaticamente. Os alunos podem inserir esse código em seus perfis para vincular seu progresso à sua escola.',
            highlightPoints: [
              'Código exclusivo gerado de forma padronizada pelo sistema',
              'Vínculo voluntário com opção de compartilhamento autorizada pelo aluno',
              'Facilidade para organizar turmas e séries escolares',
            ],
            icon: <Compass className="w-6 h-6 text-indigo-600" />,
            badge: 'Passo 2 • Vínculos & Códigos',
            previewType: 'school_codes',
          },
          {
            title: 'Relatórios para Conselhos de Classe',
            subtitle: 'Diagnóstico Pedagógico Estruturado',
            description:
              'Acesse dados consolidados de desempenho por série e área de conhecimento para fundamentar reuniões pedagógicas e planos de ação escolar.',
            highlightPoints: [
              'Métricas de engajamento e horas dedicadas aos estudos',
              'Identificação das competências da BNCC com maior necessidade de reforço',
              'Relatórios institucionais prontos para download e apresentação',
            ],
            icon: <Award className="w-6 h-6 text-emerald-600" />,
            badge: 'Passo 3 • Gestão Pedagógica',
            previewType: 'school_reports',
          },
        ];

      case 'secretaria_educacao':
        return [
          {
            title: 'Monitoramento Territorial da Rede',
            subtitle: 'Visão Integrada de Unidades Escolares',
            description:
              'Acompanhe o mapa de adesão e participação de todas as escolas jurisdicionadas à sua Diretoria de Ensino ou Secretaria de Educação.',
            highlightPoints: [
              'Painel consolidado da rede municipal ou estadual',
              'Taxa de engajamento por polo regional e série escolar',
              'Acompanhamento contínuo da preparação para o ENEM em escala',
            ],
            icon: <Landmark className="w-6 h-6 text-purple-600" />,
            badge: 'Passo 1 • Rede de Ensino',
            previewType: 'sec_network',
          },
          {
            title: 'Equidade Educacional e Suporte Focal',
            subtitle: 'Direcionamento de Recursos e Ações',
            description:
              'Identifique unidades escolares com maiores desafios pedagógicos para implementar programas de apoio específicos e equalizar oportunidades.',
            highlightPoints: [
              'Indicadores de proficiência por área do conhecimento',
              'Comparativo de evolução temporal entre trimestres',
              'Subsídios sólidos para políticas públicas educacionais baseadas em evidências',
            ],
            icon: <Award className="w-6 h-6 text-indigo-600" />,
            badge: 'Passo 2 • Equidade',
            previewType: 'sec_equity',
          },
        ];

      case 'operador':
        return [
          {
            title: 'Centro de Operações e Moderação',
            subtitle: 'Monitoramento de Infraestrutura e Atendimento',
            description:
              'Ambiente de gestão operacional do sistema para suporte aos usuários, moderação de solicitações e fiscalização da estabilidade dos serviços.',
            highlightPoints: [
              'Monitoramento de capacidade e chamados sem envio de e-mails automáticos',
              'Comunicação direta e manual com coordenadores e gestores escolares',
              'Auditoria de registros e fluxo operacional',
            ],
            icon: <Cpu className="w-6 h-6 text-amber-600" />,
            badge: 'Passo 1 • Operações',
            previewType: 'op_center',
          },
          {
            title: 'Banco Dimensionado para 200.000 Registros',
            subtitle: 'Alertas de Capacidade e Travas Automáticas',
            description:
              'O banco de dados possui teto operacional fixo de 200.000 posições, com regras estritas de aviso preventivo.',
            highlightPoints: [
              'Aviso em 180.000 registros: Emite alerta de capacidade preventiva',
              'Alerta Crítico em 195.000: Notifica a cada novo cadastro com urgência',
              'Suspensão em 200.000: Bloqueio automático de novos cadastros até ampliação',
            ],
            icon: <Database className="w-6 h-6 text-rose-600" />,
            badge: 'Passo 2 • Capacidade',
            previewType: 'op_database',
            interactiveActionLabel: 'Abrir Painel do Banco',
            onInteractiveAction: () => setIsRegistrationHubOpen(true),
          },
          {
            title: 'Terminal de Comandos Operacionais',
            subtitle: 'Rotinas Rápidas de Gestão',
            description:
              'Utilize comandos padronizados no terminal para consultar status do banco, listar solicitações pendentes e apoiar usuários com redefinição de senhas.',
            highlightPoints: [
              '[status-banco]: Exibe contagem e porcentagem de ocupação',
              '[listar-pendentes]: Relaciona registros aguardando ação',
              '[alterar-senha-ID]: Redefine credencial para "mudar123" com troca obrigatória',
            ],
            icon: <Terminal className="w-6 h-6 text-indigo-600" />,
            badge: 'Passo 3 • Comandos',
            previewType: 'op_terminal',
          },
        ];

      case 'admin':
        return [
          {
            title: 'Governança Central & Módulo 1.3',
            subtitle: 'Controle de Edição e Dimensionamento do Banco',
            description:
              'Você é o Administrador Global do sistema. Conforme a Versão 1.3, o sistema opera de forma segura e transparente, sem envio de e-mails automáticos.',
            highlightPoints: [
              'Edição bloqueada por padrão: O botão [Editar] só fica ativo por liberação manual do Admin',
              'Janela de edição de 24 horas com rebloqueio automático pós-salvamento',
              'Capacidade para 200.000 usuários com monitoramento em tempo real',
            ],
            icon: <Sparkles className="w-6 h-6 text-indigo-600" />,
            badge: 'Passo 1 • Governança',
            previewType: 'admin_governance',
            interactiveActionLabel: 'Ver Banco de 200k',
            onInteractiveAction: () => setIsRegistrationHubOpen(true),
          },
          {
            title: 'Banco de Questões e Matriz BNCC',
            subtitle: 'Curadoria e Calibragem Pedagógica',
            description:
              'Gerencie o catálogo oficial de questões por competências, habilidades e disciplinas, garantindo o rigor metodológico das proporções por série.',
            highlightPoints: [
              'Filtro por série (1º, 2º e 3º ano) e áreas do conhecimento',
              'Classificação detalhada de habilidades e competências do ENEM',
              'Distribuição balanceada entre conteúdo escolar e matriz Inep',
            ],
            icon: <BookOpen className="w-6 h-6 text-emerald-600" />,
            badge: 'Passo 2 • Itens & BNCC',
            previewType: 'admin_items',
          },
          {
            title: 'Gerador de Questões com Inteligência Artificial',
            subtitle: 'Criação de Itens com Modelo Gemini',
            description:
              'Gere novos itens inéditos calibrados no padrão oficial do Inep com apenas 1 clique, incluindo distratores bem fundamentados e versão direta simplificada para TEA.',
            highlightPoints: [
              'Geração baseada em habilidades e temas contemporâneos relevantes',
              'Elaboração de versão simplificada direta (TEA) sem ambiguidade',
              'Gabarito justificado item por item para aprendizado imediato',
            ],
            icon: <Zap className="w-6 h-6 text-amber-600" />,
            badge: 'Passo 3 • IA Pedagógica',
            previewType: 'admin_ai',
          },
          {
            title: 'Calibragem de Correção de Redação',
            subtitle: 'Pesos e Diretrizes das Competências C1 a C5',
            description:
              'Ajuste fino dos critérios de avaliação textual da IA, garantindo retorno humanizado e acolhedor especialmente na norma culta e coesão.',
            highlightPoints: [
              'Parametrização dos pesos das 5 competências',
              'Ajuste para correções acolhedoras em estudantes disléxicos',
              'Critérios evolutivos progressivos por ano do Ensino Médio',
            ],
            icon: <Sliders className="w-6 h-6 text-purple-600" />,
            badge: 'Passo 4 • Calibrador',
            previewType: 'admin_calibrate',
          },
        ];

      default:
        return [
          {
            title: 'Bem-vindo ao Sistema de Estudos ENEM',
            subtitle: 'Plataforma Inclusiva e Gratuita',
            description:
              'Conheça os recursos da plataforma voltados para a equidade educacional e a preparação de alta qualidade.',
            highlightPoints: [
              '100% gratuito e sem custos ocultos',
              'Preparação gradual desde o 1º ano',
              'Inclusão plena e confidencialidade de dados',
            ],
            icon: <Award className="w-6 h-6 text-indigo-600" />,
            badge: 'Apresentação Geral',
            previewType: 'default',
          },
        ];
    }
  };

  const steps = getStepsForRole(role);
  const currentStepData = steps[currentStep] || steps[0];
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;

  const handleNext = () => {
    stopSpeaking();
    if (!isLast) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    stopSpeaking();
    if (!isFirst) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = () => {
    stopSpeaking();
    if (neverShowAgain) {
      try {
        localStorage.setItem(`enem_onboarding_completed_${role}`, 'true');
      } catch (e) {
        console.warn('Storage error:', e);
      }
    }
    setIsOnboardingOpen(false);
  };

  const handleListenStep = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      const fullText = `${currentStepData.title}. ${currentStepData.subtitle}. ${currentStepData.description}. ${currentStepData.highlightPoints.join('. ')}`;
      speakText(fullText);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-scaleUp flex flex-col max-h-[90vh]">
        {/* Header with Role Theme Banner */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 relative shrink-0">
          <button
            onClick={handleComplete}
            className="absolute top-5 right-5 text-indigo-200 hover:text-white p-1 rounded-xl hover:bg-white/10 transition"
            aria-label="Pular e fechar guia"
            title="Fechar guia"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-white shrink-0 shadow-sm">
              {currentStepData.icon}
            </div>

            <div className="pr-8">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
                  {currentStepData.badge}
                </span>
                <span className="text-white/40 text-xs">•</span>
                <span className="text-xs text-indigo-200 font-medium">
                  Perfil: <strong className="text-white capitalize">{role}</strong>
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold tracking-tight text-white leading-tight">
                {currentStepData.title}
              </h3>
            </div>
          </div>

          {/* Progress bar and step markers */}
          <div className="mt-4 pt-3 border-t border-indigo-700/60 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-1">
              {steps.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    stopSpeaking();
                    setCurrentStep(idx);
                  }}
                  className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                    idx === currentStep
                      ? 'bg-amber-400 ring-2 ring-amber-300/40'
                      : idx < currentStep
                      ? 'bg-indigo-400 hover:bg-indigo-300'
                      : 'bg-white/20 hover:bg-white/30'
                  }`}
                  aria-label={`Ir para passo ${idx + 1}`}
                  title={`Passo ${idx + 1}`}
                />
              ))}
            </div>
            <span className="text-xs font-mono font-bold text-indigo-200 shrink-0 ml-2">
              {currentStep + 1} de {steps.length}
            </span>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700 flex-1">
          {/* Subtitle & Narration Button */}
          <div className="flex items-start justify-between gap-3 bg-indigo-50/70 p-3.5 rounded-2xl border border-indigo-100">
            <div>
              <span className="text-xs font-extrabold text-indigo-950 block">
                {currentStepData.subtitle}
              </span>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {currentStepData.description}
              </p>
            </div>

            <button
              type="button"
              onClick={handleListenStep}
              className={`p-2.5 rounded-xl border font-bold text-xs shrink-0 transition flex items-center gap-1.5 shadow-2xs ${
                isSpeaking
                  ? 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
                  : 'bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50'
              }`}
              title={isSpeaking ? 'Pausar áudio' : 'Ouvir explicação em áudio'}
            >
              {isSpeaking ? <VolumeX className="w-4 h-4 text-amber-700" /> : <Volume2 className="w-4 h-4 text-indigo-600" />}
              <span className="hidden sm:inline">{isSpeaking ? 'Parar Áudio' : 'Ouvir Guia'}</span>
            </button>
          </div>

          {/* Highlight Points Card */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              O que você encontra nesta funcionalidade:
            </span>
            <div className="grid grid-cols-1 gap-2">
              {currentStepData.highlightPoints.map((point, pIdx) => (
                <div
                  key={pIdx}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-800 leading-relaxed hover:bg-white transition"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Feature Trigger (if applicable) */}
          {currentStepData.interactiveActionLabel && currentStepData.onInteractiveAction && (
            <div className="p-3.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-amber-950 font-medium">
                <Zap className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Experimentar esta tela agora no seu painel:</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  currentStepData.onInteractiveAction?.();
                  setIsOnboardingOpen(false);
                }}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5"
              >
                <span>{currentStepData.interactiveActionLabel}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Educational Principles Footnote */}
          <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl text-[11px] text-slate-500 flex items-center gap-2">
            <HeartHandshake className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>
              Lembre-se: este sistema é 100% gratuito, sem anúncios comerciais e sem cobranças ocultas.
            </span>
          </div>
        </div>

        {/* Footer Navigation Controls */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={neverShowAgain}
              onChange={(e) => setNeverShowAgain(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span>Não exibir automaticamente ao iniciar</span>
          </label>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {!isFirst && (
              <button
                type="button"
                onClick={handlePrev}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition flex items-center gap-1.5 shadow-2xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Anterior</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
            >
              <span>{isLast ? 'Concluir e Começar' : 'Próximo Passo'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
