export type UserRole = 
  | 'aluno'                 // Usuário: Aluno
  | 'professor'             // Usuário: Professor
  | 'escola'                // Usuário: Escola / Coordenação
  | 'secretaria_educacao'   // Usuário: Secretaria de Educação (Municipal / Estadual)
  | 'responsavel'           // Usuário: Família / Responsável
  | 'parceiro'              // Usuário: Parceiro Educacional
  | 'operador'              // Gerenciador: Operador do Sistema
  | 'admin';                // Gerenciador: Administrador Principal

export interface UserAccount {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  email: string;
  mustChangePassword: boolean; // Sempre que o usuário entrar pela primeira vez, deve mudar a senha
  organization?: string;
  createdAt: string;
  lastLogin?: string;

  // Identificador Universal Oficial (Módulo 2)
  technicalId: string; // Ex: USR-ALU-0001, USR-PRF-0001, INST-ESC-0001, INST-SEC-0001
  documentType: 'CPF' | 'CNPJ'; // ALUNO: CPF, PROFESSOR: CPF, ESCOLA: CNPJ, SECRETARIA: CNPJ
  documentNumber: string; // Apenas números, normalizado
  formattedDocument: string; // Formatado para exibição (ex: 123.456.789-00)
  maskedDocument?: string; // Mascarado para conformidade com a LGPD
}

export type RegistrationLevel =
  | 'Nível 0 — Administrador Global'
  | 'Nível 1 — Operador / Gestor'
  | 'Nível 2 — Aluno'
  | 'Nível 3 — Professor'
  | 'Nível 4 — Escola Pública Independente / Particular'
  | 'Nível 5 — Escola Vinculada à Rede'
  | 'Nível 6 — Prefeitura / Secretaria';

export type RegistrationStatus = 'Ativo' | 'Inativo' | 'Pendente' | 'Bloqueado';

export type LearningProfileType = 'Padrão' | 'TDAH' | 'TEA' | 'Dislexia' | 'Combinado';

export interface UserRegistrationRecord {
  id: number; // ID único sequencial
  level: RegistrationLevel;
  status: RegistrationStatus;
  editUnlocked: boolean; // Não / Sim
  editUnlockedUntil?: string; // até data/hora
  editUnlockedAt?: string;
  editUnlockedBy?: string;
  lastModified: {
    date: string;
    time: string;
    by: string;
  };
  dataSharing: boolean; // Sim / Não (aluno)
  learningProfile: LearningProfileType; // confidencial

  // Nível 0 — Administrador Global
  fullName: string;
  email: string;
  password?: string;
  phone: string;
  cpf?: string; // bloqueado após validação
  jobTitle?: string; // Cargo/Função
  internalNotes?: string;

  // Nível 1 — Operador / Gestor
  linkedInstitution?: string;
  roleScope?: string; // Escopo de atuação

  // Nível 2 — Aluno
  birthDate?: string; // bloqueado
  currentGrade?: GradeLevel; // livre
  schoolLinkCode?: string; // opcional - livre
  termsAccepted?: boolean; // bloqueado

  // Nível 3 — Professor
  teachingSubjects?: string[]; // livre
  assignedClasses?: string[]; // definido pela escola
  teacherStatus?: 'Ativo' | 'Inativo' | 'Afastado';

  // Nível 4 — Escola Independente / Particular
  corporateReason?: string; // Razão social [bloqueado]
  tradeName?: string; // Nome fantasia
  cnpj?: string; // CNPJ [bloqueado]
  fullAddress?: string;
  legalRepresentative?: string; // Diretor
  estimatedStudents?: number;
  pedagogicalCoordinator?: string;
  symbolicFeeRegistered?: boolean;
  schoolCode?: string; // gerado automático [bloqueado]
  customQuestionBank?: boolean; // Sim / Não [livre]

  // Nível 5 — Escola Vinculada à Rede
  networkCode?: string; // Código da rede [bloqueado]

  // Nível 6 — Prefeitura / Secretaria
  federativeEntity?: string; // Ente federativo [bloqueado]
  responsibleSecretary?: string;
  totalNetworkSchools?: number;
  allowIndependentSchoolEnrollment?: boolean; // Sim / Não [livre]
}

export interface InternalAlert {
  id: string;
  type: 'cadastro_incompleto' | 'inconsistencia_documento' | 'prazo_expirado' | 'solicitacao_exclusao' | 'capacidade';
  message: string;
  date: string;
  targetRecordId?: number;
  targetName?: string;
  severity: 'info' | 'warning' | 'critical';
  resolved: boolean;
}

export type GradeLevel = '1º ano' | '2º ano' | '3º ano';

export type KnowledgeArea = 
  | 'Linguagens, Códigos e suas Tecnologias'
  | 'Ciências Humanas e suas Tecnologias'
  | 'Ciências da Natureza e suas Tecnologias'
  | 'Matemática e suas Tecnologias';

export interface AccessibilitySettings {
  tdahMode: boolean;          // Blocos 15-20 min, 1 questão por vez, confirmação prévia
  teaMode: boolean;           // Estrutura fixa, previsível, linguagem direta sem metáforas
  dyslexiaMode: boolean;      // Fonte adaptada (Lexend), áudio TTS, espaçamento ampliado, ortografia acolhedora
  highContrast: boolean;      // Alto contraste para acessibilidade visual
  fontSize: 'normal' | 'large' | 'extralarge'; // Tamanho do texto
  readingRuler: boolean;      // Régua de leitura visual
  distractionFree: boolean;   // Ocultar menus e distrações durante o estudo
  audioNarration: boolean;    // Leitura automática ou botão de ouvir
  focusMode: boolean;         // Modo Foco TEA: simplifica a interface, remove distrações visuais, diminui densidade e amplia espaçamento
}

export interface Question {
  id: string;
  title: string;
  area: KnowledgeArea;
  gradeLevel: GradeLevel | 'ENEM Geral';
  origin: 'Conteúdo Série' | 'Revisão Série Anterior' | 'Formato ENEM';
  bnccSkill?: string;
  topic: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  simplifiedTEA?: string;
  year?: number;
}

export interface EssayTheme {
  id: string;
  title: string;
  contextText: string;
  motivatingPoints: string[];
  suggestedRepertoire: string[];
}

export interface CompetencyEvaluation {
  number: number;
  name: string;
  score: number;
  feedback: string;
  levelTitle?: string;
  practicalTip?: string;
  subCriteria?: { label: string; passed: boolean }[];
}

export interface InterventionFiveElements {
  agente: { identified: boolean; text?: string; feedback: string };
  acao: { identified: boolean; text?: string; feedback: string };
  modoMeio: { identified: boolean; text?: string; feedback: string };
  efeitoFinalidade: { identified: boolean; text?: string; feedback: string };
  detalhamento: { identified: boolean; text?: string; feedback: string };
  totalIdentified: number;
}

export interface TdahActionableStep {
  id: string;
  order: number;
  task: string;
  competenceRef: number;
  quickWin: string;
  estimatedMinutes: number;
  completed?: boolean;
}

export interface EssayCorrectionResult {
  totalScore: number;
  competencies: CompetencyEvaluation[];
  strengths: string[];
  improvements: string[];
  encouragementMessage: string;
  // Acessibilidade Neurodivergente TDAH & TEA
  interventionElements?: InterventionFiveElements;
  tdahChecklist?: TdahActionableStep[];
  teaLiteralFeedback?: {
    positiveDirect: string[];
    toChangeDirect: string[];
    whatToDoNext: string;
  };
  exemplaryRewriteSnippet?: {
    originalFragment: string;
    improvedSuggestion: string;
    pedagogicalReason: string;
  };
  structuralSummary?: {
    hasIntroduction: boolean;
    hasDevelopment: boolean;
    hasConclusion: boolean;
    estimatedLines: number;
    wordCount: number;
  };
}

export type GrammarIssueCategory =
  | 'concordancia'
  | 'regencia'
  | 'pontuacao'
  | 'crase'
  | 'ortografia'
  | 'sintaxe'
  | 'registro_informal'
  | 'outro';

export interface Competence1GrammarIssue {
  id: string;
  originalSnippet: string;
  type: GrammarIssueCategory;
  typeLabel: string;
  severity: 'leve' | 'moderada' | 'grave';
  explanation: string;
  suggestion: string;
  paragraphIndex?: number;
}

export interface Competence1ReviewResult {
  score: number; // 0, 40, 80, 120, 160 ou 200
  levelDescription: string;
  summaryFeedback: string;
  issues: Competence1GrammarIssue[];
  positiveHighlights: string[];
  improvementTips: string[];
  exemplaryRewrite?: string;
  dyslexiaConsideration?: string;
  stats: {
    wordCount: number;
    sentenceCount: number;
    issueCount: number;
  };
}

export interface StudentStats {
  streakDays: number;
  totalAnswered: number;
  totalCorrect: number;
  timeSpentMinutes: number;
  essaysSubmitted: number;
  byArea: {
    area: KnowledgeArea;
    answered: number;
    correct: number;
  }[];
}

export interface SimulationAreaResult {
  area: KnowledgeArea;
  shortLabel: 'LC' | 'CH' | 'CN' | 'MT';
  totalQuestions: number;
  correctAnswers: number;
  percentage: number;
  scoreTRI: number;
}

export interface SimulationAttempt {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  displayDate: string; // e.g. "Março / 2026"
  timestamp: number;
  totalQuestions: number;
  totalCorrect: number;
  overallScoreTRI: number;
  durationMinutes: number;
  byArea: SimulationAreaResult[];
  essayScore?: number;
  status: 'Concluído' | 'Em Andamento';
  targetGoalTRI?: number;
  notes?: string;
}

export interface ClassGroup {
  id: string;
  name: string;
  grade: GradeLevel;
  totalStudents: number;
  averageAccuracy: number;
  methodologicalNeeds: {
    extendedTimeOrBlocks: number;
    visualDirectStructure: number;
    audioOrDyslexiaSupport: number;
  };
}

export interface ClassTopicDiagnostic {
  id: string;
  topic: string;
  area: KnowledgeArea;
  gradeLevel: GradeLevel;
  bnccSkill: string;
  accuracyRate: number; // Porcentagem de acertos
  errorRate: number;    // Porcentagem de erros
  strugglingCount: number; // Quantidade de alunos com dificuldades recorrentes
  totalAssessed: number;   // Total de alunos avaliados
  severity: 'critico' | 'atencao' | 'consolidado'; // crítico se >50% erram
  mainMisconceptions: string[];
  pedagogicalInsight: string;
  suggestedQuestionsCount: number;
  reinforcementListSuggestion: {
    title: string;
    focusDescription: string;
    suggestedQuestionsCount: number;
    proportionNote: string;
    neuroinclusiveAdaptations: string[];
  };
}

export interface ReinforcementListRecord {
  id: string;
  title: string;
  classId: string;
  className: string;
  topic: string;
  area: KnowledgeArea;
  grade: GradeLevel;
  count: number;
  date: string;
  status: 'Atribuída' | 'Em Andamento' | 'Concluída';
  neuroinclusiveFeatures: string[];
}

export type SpacedRepetitionLevel = 1 | 2 | 3 | 4;

export interface StudentWrongAnswer {
  id: string;
  questionId: string;
  questionTitle: string;
  area: KnowledgeArea;
  topic: string;
  bnccSkill?: string;
  gradeLevel: GradeLevel | 'ENEM Geral';
  studentChoice: number;
  correctAnswer: number;
  options: string[];
  explanation: string;
  dateAnswered: string;
  flashcardGenerated?: boolean;
}

export interface AutomaticFlashcard {
  id: string;
  questionId?: string;
  sourceQuestionTitle?: string;
  area: KnowledgeArea;
  topic: string;
  keyConcept: string;
  front: string;
  back: string;
  mnemonicTip: string;
  whyItWasWrong?: string;
  boxLevel: SpacedRepetitionLevel; // 1: Revisar Hoje/Amanhã, 2: Em 3 dias, 3: Em 7 dias, 4: Dominado (14+ dias)
  intervalDays: number;
  nextReviewDate: string; // YYYY-MM-DD
  lastReviewedAt?: string;
  reviewCount: number;
  consecutiveSuccesses: number;
  status: 'para_revisar' | 'aprendendo' | 'dominado';
  createdAt: string;
}

export type TopicDifficulty = 'basico' | 'intermediario' | 'avancado' | 'desafio_tri';

export interface LearningPathNode {
  id: string;
  title: string;
  area: KnowledgeArea;
  gradeLevel: GradeLevel;
  difficulty: TopicDifficulty;
  stepNumber: number;
  stageName: string;
  bnccSkill: string;
  description: string;
  summaryKeyPoints: string[];
  status: 'conquistado' | 'em_andamento' | 'bloqueado';
  progressPercent: number;
  accuracyPercent?: number;
  totalQuestions: number;
  completedQuestions: number;
  xpReward: number;
  unlockedAt?: string;
  completedAt?: string;
  badge?: {
    name: string;
    icon: string;
    description: string;
  };
  isBossMilestone?: boolean;
  prerequisiteNodeId?: string;
}

export interface LearningPathProgress {
  totalXp: number;
  currentLevel: number;
  levelTitle: string;
  streakDays: number;
  conqueredMilestonesCount: number;
  totalMilestonesCount: number;
  activeNodeId: string;
}

export interface EducationalPartner {
  id: string;
  name: string;
  tagline: string;
  logo: string;
  type: 'Universidade' | 'Fundação Social' | 'Instituto Educacional';
  freeScholarships: number;
  sponsoredHours: number;
  opportunitiesOffered: string[];
}

export interface SchoolData {
  id: string;
  name: string;
  inepCode: string;
  type: 'Pública Estadual' | 'Pública Municipal' | 'Federal / IF' | 'Particular Comunitária';
  city: string;
  state: string;
  activeStudents: number;
  activeTeachers: number;
  autonomousAccessCode: string;
  joinedAt: string;
}

export type GlossaryCategory =
  | 'Siglas & Regulamentação'
  | 'Linguagens & Redação'
  | 'Ciências Humanas'
  | 'Ciências da Natureza'
  | 'Matemática & TRI'
  | 'Metodologia & BNCC';

export interface GlossaryTerm {
  id: string;
  term: string;
  acronym?: string;
  category: GlossaryCategory;
  simplifiedDefinition: string;
  contextualExample: string;
  enemApplication: string;
  teaSimplifiedExplanation: string;
  mnemonicsOrMemoryHook?: string;
  relatedTerms?: string[];
  isAiGenerated?: boolean;
  bookmarked?: boolean;
  difficulty?: 'Básico' | 'Intermediário' | 'Avançado';
  audioNarrationText?: string;
  createdAt?: string;
}

export interface EssaySubmissionHistoryItem {
  id: string;
  themeTitle: string;
  date: string;
  displayDate: string;
  timestamp: number;
  knowledgeArea: KnowledgeArea;
  knowledgeAreaShort: 'LC' | 'CH' | 'CN' | 'MT';
  totalScore: number;
  c1: number;
  c2: number;
  c3: number;
  c4: number;
  c5: number;
  interventionElementsCount?: number;
  feedbackSummary?: string;
  mode?: 'IA' | 'Simulado' | 'Voz';
}

export type StudentActiveTab =
  | 'inicio'
  | 'serie'
  | 'enem'
  | 'redacao'
  | 'perfil'
  | 'cadastro'
  | 'progresso'
  | 'flashcards'
  | 'trilha'
  | 'glossario'
  | 'assistente'
  | 'cronograma'
  | 'leitor'
  | 'vinculos';

// ==========================================
// MÓDULO DE RELACIONAMENTOS & REDE INTEGRADA (MÓDULOS 2, 3, 8, 9, 11)
// ==========================================

export type RelationshipCategory =
  | 'ALUNO_PROFESSOR'      // Aluno ↔ Professor
  | 'PROFESSOR_ESCOLA'     // Professor ↔ Escola
  | 'ESCOLA_SECRETARIA';   // Escola ↔ Secretaria de Educação

export type RelationshipStatus =
  | 'pendente'   // Solicitação enviada aguardando aprovação
  | 'aprovado'   // Vínculo ativo com permissão de acompanhamento concedida
  | 'recusado'   // Solicitação negada pelo destinatário
  | 'suspenso'   // Vínculo pausado temporariamente
  | 'encerrado';  // Vínculo revogado/cancelado (preserva histórico)

export interface RelationshipPermissions {
  viewPerformance: boolean;     // Visualizar métricas de acertos, erros e aproveitamento
  viewSimulations: boolean;     // Visualizar histórico e notas TRI de simulados
  viewEssays: boolean;          // Visualizar redações e notas por competência C1-C5
  viewAttendance: boolean;      // Visualizar frequência e tempo de estudo
  viewDifficulties: boolean;    // Visualizar diagnóstico de fraquezas e tópicos críticos
  viewDetailedReports: boolean; // Emitir relatórios detalhados individuais
}

export type AuditActionType =
  | 'CADASTRO_INICIAL'
  | 'SOLICITACAO_CRIADA'
  | 'VINCULO_APROVADO'
  | 'VINCULO_RECUSADO'
  | 'VINCULO_REVOGADO'
  | 'VINCULO_SUSPENSO'
  | 'PERMISSOES_ALTERADAS'
  | 'CONSULTA_INDICADORES';

export interface RelationshipAuditLog {
  id: string;
  action: AuditActionType;
  actorId: string;       // ID técnico ou username de quem agiu
  actorName: string;
  actorRole: UserRole;
  targetId: string;      // ID técnico ou username do afetado
  timestamp: string;     // ISO String ou data legível
  details: string;       // Descrição detalhada da operação
}

export interface EducationalRelationship {
  id: string;                     // Identificador único do vínculo (ex: REL-0001)
  relationshipType: RelationshipCategory;
  status: RelationshipStatus;

  // Origem (Quem solicitou)
  sourceTechnicalId: string;      // Ex: USR-PRF-0001
  sourceUserId: string;           // user-prof-1
  sourceName: string;
  sourceRole: UserRole;
  sourceDocument: string;         // Normalizado

  // Destino (Quem aprova/recusa/autoriza)
  targetTechnicalId: string;      // Ex: USR-ALU-0001
  targetUserId: string;           // user-aluno-1
  targetName: string;
  targetRole: UserRole;
  targetDocument: string;         // Normalizado

  // Metadados temporais
  requestedAt: string;
  approvedAt?: string;
  endedAt?: string;

  // Responsáveis formais
  requestedBy: string;            // Nome ou ID
  approvedBy?: string;            // Nome ou ID

  // Turma / Matéria associada (quando aplicável)
  assignedClass?: string;         // Ex: "3º Ano A - Matutino"
  subject?: string;               // Ex: "Física & Ciências da Natureza"

  // Permissões associadas
  permissions: RelationshipPermissions;

  // Histórico de auditoria do vínculo (LGPD)
  history: RelationshipAuditLog[];
  notes?: string;
}

export interface StudentAcademicSnapshot {
  studentUserId: string;
  technicalId: string;
  studentName: string;
  gradeLevel: GradeLevel;
  totalStudyTimeMinutes: number;
  totalAnswered: number;
  totalCorrect: number;
  accuracyRate: number;
  triScoreEstimated: number;
  consecutiveDaysStreak: number;
  simulationsCount: number;
  latestSimulationTRI?: number;
  essaysCount: number;
  latestEssayScore?: number;
  weakestArea?: string;
  strongestArea?: string;
  lastActiveDate: string;
  assignedClass?: string;
  authorizedAt: string;
  relationshipId: string;
}

export interface ConsolidatedClassMetrics {
  className: string;
  totalStudents: number;
  averageTRI: number;
  averageAccuracy: number;
  averageStudyHours: number;
  essaysSubmitted: number;
  strugglingCount: number;
  topSubject: string;
  criticalSubject: string;
}

export interface ConsolidatedSchoolMetrics {
  schoolId: string;
  schoolName: string;
  inepCode: string;
  cnpjFormatted: string;
  totalTeachersLinked: number;
  totalStudentsAuthorized: number;
  averageTRI: number;
  averageEssayScore: number;
  simulationsCompleted: number;
  triByArea: {
    LC: number;
    CH: number;
    CN: number;
    MT: number;
  };
  classesCount: number;
}

export interface ConsolidatedSecretariatMetrics {
  secretariatName: string;
  totalSchoolsLinked: number;
  totalTeachersLinked: number;
  totalStudentsAuthorized: number;
  networkAverageTRI: number;
  networkAverageEssayScore: number;
  networkSimulationsCount: number;
  participationRate: number;
  enemReadinessIndex: number; // 0 a 100
  schoolsComparison: Array<{
    schoolId: string;
    schoolName: string;
    city: string;
    studentsCount: number;
    averageTRI: number;
    averageEssay: number;
    status: 'Consolidada' | 'Atenção' | 'Excelente';
  }>;
}

export type DyslexiaOverlayColor =
  | 'none'
  | 'cream'
  | 'yellow'
  | 'peach'
  | 'green'
  | 'blue'
  | 'purple'
  | 'dark';

export interface DidacticDocumentSection {
  id: string;
  title: string;
  subheading?: string;
  paragraphs: string[];
  keyConcept?: string;
  enemTip?: string;
  exampleBox?: {
    title: string;
    text: string;
  };
}

export interface DidacticDocument {
  id: string;
  title: string;
  subtitle: string;
  category: KnowledgeArea | 'Redação ENEM' | 'Guia Neuroinclusivo';
  areaShort: 'LC' | 'CH' | 'CN' | 'MT' | 'RED' | 'NEURO';
  estimatedMinutes: number;
  wordCount: number;
  difficulty: 'Iniciante' | 'Intermediário' | 'Aprofundamento';
  summary: string;
  tags: string[];
  coverColor: string;
  isCustom?: boolean;
  sections: DidacticDocumentSection[];
}

export interface DocumentReaderSettings {
  fontSize: 'small' | 'medium' | 'large' | 'extralarge';
  fontFamily: 'lexend' | 'opendyslexic' | 'sans' | 'serif';
  letterSpacing: 'normal' | 'wide' | 'extra';
  lineHeight: 'normal' | 'relaxed' | 'loose';
  columnWidth: 'narrow' | 'medium' | 'wide' | 'full';
  colorOverlay: DyslexiaOverlayColor;
  overlayOpacity: number; // 10 - 50
  readingRuler: boolean;
  readingRulerHeight: number;
  bionicReading: boolean;
  paragraphFocus: boolean;
  ambientLight: 'white' | 'warm-paper' | 'dark-soft';
  audioRate: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  area?: string;
  isVoiceInput?: boolean;
  conceptTitle?: string;
  quickSummary?: string;
  enemTip?: string;
}

export type ScheduleActivityType =
  | 'teoria_ativa'
  | 'questoes_tri'
  | 'revisao_flashcards'
  | 'redacao_c5'
  | 'pausa_pomodoro';

export interface WeeklyStudySession {
  id: string;
  timeSlot: string;
  durationMinutes: number;
  area: KnowledgeArea | 'Redação ENEM' | 'Pausa & Descanso';
  areaShort: 'LC' | 'CH' | 'CN' | 'MT' | 'RED' | 'PAUSA';
  topic: string;
  activityType: ScheduleActivityType;
  pedagogicalGoal: string;
  pomodoroCycles: number;
  neuroTip: string;
  completed?: boolean;
}

export interface WeeklyDayPlan {
  dayId: 'seg' | 'ter' | 'qua' | 'qui' | 'sex' | 'sab' | 'dom';
  dayName: string;
  dayShort: 'SEG' | 'TER' | 'QUA' | 'QUI' | 'SEX' | 'SÁB' | 'DOM';
  focusTheme: string;
  dailyQuote: string;
  isRestDay?: boolean;
  sessions: WeeklyStudySession[];
}

export interface WeeklyPriorityArea {
  area: KnowledgeArea | 'Redação ENEM';
  shortLabel: 'LC' | 'CH' | 'CN' | 'MT' | 'RED';
  currentAccuracy: number;
  currentTRI?: number;
  priorityLevel: 'critico' | 'atencao' | 'consolidado';
  weeklyAllocatedHours: number;
  targetedWeakTopics: string[];
}

export interface WeeklyStudyPlan {
  id: string;
  title: string;
  createdAt: string;
  diagnosticSummary: string;
  totalHoursWeek: number;
  priorityAreas: WeeklyPriorityArea[];
  days: WeeklyDayPlan[];
  weeklyMilestones: string[];
  isAiGenerated: boolean;
  studentProfile: {
    neuroType: string;
    dailyHours: number;
    preferredShift: string;
    daysCount: number;
  };
}
