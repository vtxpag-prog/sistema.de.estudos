import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserRole,
  UserAccount,
  GradeLevel,
  AccessibilitySettings,
  StudentStats,
  Question,
  EssayTheme,
  ClassGroup,
  SchoolData,
  EducationalPartner,
  KnowledgeArea,
  UserRegistrationRecord,
  InternalAlert,
  RegistrationLevel,
  LearningProfileType,
  SimulationAttempt,
  AutomaticFlashcard,
  StudentWrongAnswer,
  SpacedRepetitionLevel,
  LearningPathNode,
  LearningPathProgress,
  GlossaryTerm,
  GlossaryCategory,
  EssaySubmissionHistoryItem,
  StudentActiveTab,
} from '../types';
import {
  INITIAL_QUESTIONS,
  ESSAY_THEMES,
  MOCK_CLASS_GROUPS,
  MOCK_SCHOOLS,
  MOCK_EDUCATIONAL_PARTNERS,
  MOCK_SIMULATION_HISTORY,
} from '../data/mockData';
import { INITIAL_ESSAY_HISTORY } from '../data/mockEssayHistory';
import { INITIAL_USERS, StoredUser } from '../data/mockUsers';
import { INITIAL_FLASHCARDS, INITIAL_WRONG_ANSWERS } from '../data/mockFlashcards';
import { INITIAL_LEARNING_PATH_NODES, INITIAL_LEARNING_PATH_PROGRESS } from '../data/learningPathData';
import { INITIAL_GLOSSARY_TERMS } from '../data/mockGlossary';
import { generateFlashcardsAPI, explainTermAPI } from '../services/api';
import {
  EducationalRelationship,
  RelationshipAuditLog,
  RelationshipCategory,
  RelationshipStatus,
  RelationshipPermissions,
  StudentAcademicSnapshot,
  ConsolidatedSchoolMetrics,
  ConsolidatedSecretariatMetrics,
} from '../types';
import {
  INITIAL_EDUCATIONAL_RELATIONSHIPS,
  INITIAL_RELATIONSHIP_AUDIT_LOGS,
  INITIAL_STUDENT_SNAPSHOTS,
} from '../data/relationshipData';
import {
  isValidCPF,
  isValidCNPJ,
  formatCPF,
  formatCNPJ,
  maskCPF,
  maskCNPJ,
  normalizeDocument,
  generateTechnicalId,
  validateDocumentForRole,
  generateValidCPFSeed,
} from '../utils/documentValidation';
import {
  INITIAL_REGISTRATION_RECORDS,
  INITIAL_INTERNAL_ALERTS,
  TOTAL_CAPACITY,
  CAPACITY_WARNING_THRESHOLD,
  CAPACITY_CRITICAL_THRESHOLD,
} from '../data/registrationDatabase';

interface AppContextType {
  // Authentication & Users
  currentUser: UserAccount | null;
  activeView: 'landing' | 'dashboard';
  setActiveView: (view: 'landing' | 'dashboard') => void;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
  pendingPasswordChangeUser: UserAccount | null;
  setPendingPasswordChangeUser: (user: UserAccount | null) => void;
  login: (username: string, password: string) => { success: boolean; error?: string; mustChange?: boolean };
  changePassword: (userId: string, newPassword: string) => { success: boolean; error?: string };
  logout: () => void;
  usersList: StoredUser[];

  // Interactive Onboarding
  isOnboardingOpen: boolean;
  setIsOnboardingOpen: (open: boolean) => void;
  startOnboarding: () => void;

  // Student Independent Registration
  isStudentRegisterModalOpen: boolean;
  setIsStudentRegisterModalOpen: (open: boolean) => void;
  registerStudentDirectly: (data: {
    fullName: string;
    birthDate: string;
    currentGrade: GradeLevel;
    contactInfo: string;
    username: string;
    password: string;
    schoolCode?: string;
    learningProfile: LearningProfileType;
    dataSharing: boolean;
    termsAccepted: boolean;
  }) => { success: boolean; error?: string };

  // App Role & Series
  role: UserRole;
  setRole: (role: UserRole) => void;
  gradeLevel: GradeLevel;
  setGradeLevel: (grade: GradeLevel) => void;

  // Student Navigation & Safe Leave Dialog
  isPracticingQuestions: boolean;
  setIsPracticingQuestions: (val: boolean) => void;
  showLeavePracticeModal: boolean;
  setShowLeavePracticeModal: (show: boolean) => void;
  confirmLeaveIfPracticing: (action: () => void) => void;
  studentActiveTab: StudentActiveTab;
  setStudentActiveTab: (tab: StudentActiveTab) => void;
  executeLeavePracticeConfirm: () => void;
  cancelLeavePractice: () => void;
  goToUserHome: () => void;

  // Glossário Interativo Pedagógico do ENEM (Termos Complexos & Siglas com Gemini)
  glossaryTerms: GlossaryTerm[];
  bookmarkedTermIds: string[];
  toggleBookmarkTerm: (termId: string) => void;
  requestAiTermExplanation: (term: string, category?: string, contextArea?: string) => Promise<GlossaryTerm>;
  selectedGlossarySearch: string;
  setSelectedGlossarySearch: (search: string) => void;
  openGlossaryForTerm: (term: string) => void;

  // Trilha de Aprendizado Gamificada (Níveis Básico a Avançado)
  learningPathNodes: LearningPathNode[];
  learningPathProgress: LearningPathProgress;
  completeLearningNode: (nodeId: string, accuracy?: number) => void;
  updateNodeProgress: (nodeId: string, completedDelta: number) => void;
  resetLearningPath: () => void;

  // Flashcards Automáticos com IA & Revisão Espaçada (Spaced Repetition)
  wrongQuestions: StudentWrongAnswer[];
  flashcards: AutomaticFlashcard[];
  pendingFlashcardsCount: number;
  addWrongAnswer: (wrong: StudentWrongAnswer) => void;
  addFlashcards: (newCards: AutomaticFlashcard[]) => void;
  updateFlashcardReview: (cardId: string, performance: 'errei' | 'dificil' | 'bom' | 'facil') => void;
  generateFlashcardForWrongAnswer: (wrongAnswerId: string) => Promise<boolean>;
  generateAllPendingFlashcards: () => Promise<number>;
  deleteFlashcard: (cardId: string) => void;
  resetFlashcardsToDefault: () => void;

  // Registration Database & Edit Unlocking (Módulo 1.3)
  registrationRecords: UserRegistrationRecord[];
  capacityCount: number;
  simulateCapacity: (count: number) => void;
  internalAlerts: InternalAlert[];
  dismissAlert: (alertId: string) => void;
  unlockEditForRecord: (recordId: number, durationHours?: number) => { success: boolean; message: string };
  saveEditedRecord: (recordId: number, updatedFields: Partial<UserRegistrationRecord>, modifierName?: string) => { success: boolean };
  updateFreeFieldsDirectly: (recordId: number, freeFields: Partial<UserRegistrationRecord>) => void;
  addRegistrationRecord: (data: Partial<UserRegistrationRecord>) => { success: boolean; error?: string; record?: UserRegistrationRecord };
  blockUserAccess: (recordId: number) => void;
  unblockUserAccess: (recordId: number) => void;
  resetUserPasswordManual: (recordId: number, newPass: string) => void;
  processTerminalCommand: (command: string) => { output: string; actionResult?: any };
  isRegistrationHubOpen: boolean;
  setIsRegistrationHubOpen: (open: boolean) => void;

  // Accessibility
  accessibility: AccessibilitySettings;
  updateAccessibility: (partial: Partial<AccessibilitySettings>) => void;

  // Stats & Progress
  stats: StudentStats;
  recordQuestionAnswer: (
    questionId: string,
    isCorrect: boolean,
    area: KnowledgeArea,
    timeSec: number,
    selectedIndex?: number
  ) => void;
  incrementEssayCount: () => void;
  simulationHistory: SimulationAttempt[];
  addSimulationAttempt: (attempt: SimulationAttempt) => void;
  deleteSimulationAttempt: (id: string) => void;
  resetSimulationHistory: () => void;
  // Evolução nas 5 Competências do ENEM (Recharts)
  essayHistory: EssaySubmissionHistoryItem[];
  addEssaySubmission: (submission: EssaySubmissionHistoryItem) => void;
  resetEssayHistory: () => void;

  // Data Collections
  questions: Question[];
  addQuestion: (q: Question) => void;
  essayThemes: EssayTheme[];
  classGroups: ClassGroup[];
  schools: SchoolData[];
  addSchool: (school: SchoolData) => void;
  partners: EducationalPartner[];
  addPartner: (partner: EducationalPartner) => void;

  // Audio Accessibility
  isSpeaking: boolean;
  speakText: (text: string) => void;
  stopSpeaking: () => void;

  // Rede Integrada & Identificação Universal (Módulos 2, 3, 4, 5, 6, 7, 8, 9, 11)
  relationships: EducationalRelationship[];
  auditLogs: RelationshipAuditLog[];
  isUniversalRegisterModalOpen: boolean;
  setIsUniversalRegisterModalOpen: (open: boolean) => void;
  universalRegisterRole: UserRole;
  setUniversalRegisterRole: (role: UserRole) => void;
  openUniversalRegisterForRole: (role: UserRole) => void;
  lookupUniversalUser: (documentOrId: string, targetRole?: UserRole) => Promise<{
    id: string;
    technicalId: string;
    maskedName: string;
    maskedDocument: string;
    role: UserRole;
    found: boolean;
  } | null>;

  requestRelationship: (
    dataOrTarget:
      | {
          targetDocument: string;
          relationshipType: RelationshipCategory;
          assignedClass?: string;
          subject?: string;
          permissions?: RelationshipPermissions;
          notes?: string;
        }
      | string,
    relationshipType?: RelationshipCategory,
    permissions?: Partial<RelationshipPermissions>,
    assignedClass?: string
  ) => Promise<{ success: boolean; error?: string; relationship?: EducationalRelationship }>;

  approveRelationship: (relationshipId: string) => { success: boolean; error?: string };
  rejectRelationship: (relationshipId: string, reason?: string) => { success: boolean; error?: string };
  revokeRelationship: (relationshipId: string, reason?: string) => { success: boolean; error?: string };
  updateRelationshipPermissions: (relationshipId: string, permissions: Partial<RelationshipPermissions>) => { success: boolean };

  registerUniversalUser: (data: {
    fullName: string;
    role: UserRole;
    documentNumber: string;
    email: string;
    phone?: string;
    username: string;
    password: string;
    gradeLevel?: GradeLevel;
    organization?: string;
    assignedClasses?: string[];
    teachingSubjects?: string[];
    inepCode?: string;
    networkCode?: string;
    learningProfile?: LearningProfileType;
    dataSharing?: boolean;
    termsAccepted: boolean;
  }) => { success: boolean; error?: string; user?: StoredUser };

  getAuthorizedStudentsForTeacher: (teacherUserId: string) => StudentAcademicSnapshot[];
  getAuthorizedTeachersForSchool: (schoolUserId: string) => EducationalRelationship[];
  getAuthorizedSchoolsForSecretariat: (secretariatUserId: string) => EducationalRelationship[];
  getAggregatedSchoolMetrics: (schoolUserId: string) => ConsolidatedSchoolMetrics;
  getAggregatedSecretariatMetrics: (secretariatUserId: string) => ConsolidatedSecretariatMetrics;
  getStudentRelationships: (studentUserId: string) => EducationalRelationship[];
}

const defaultAccessibility: AccessibilitySettings = {
  tdahMode: false,
  teaMode: false,
  dyslexiaMode: false,
  highContrast: false,
  fontSize: 'normal',
  readingRuler: false,
  distractionFree: false,
  audioNarration: false,
  focusMode: false,
};

const initialStats: StudentStats = {
  streakDays: 6,
  totalAnswered: 38,
  totalCorrect: 29,
  timeSpentMinutes: 145,
  essaysSubmitted: 2,
  byArea: [
    {
      area: 'Linguagens, Códigos e suas Tecnologias',
      answered: 10,
      correct: 8,
    },
    {
      area: 'Ciências Humanas e suas Tecnologias',
      answered: 10,
      correct: 8,
    },
    {
      area: 'Ciências da Natureza e suas Tecnologias',
      answered: 10,
      correct: 7,
    },
    {
      area: 'Matemática e suas Tecnologias',
      answered: 8,
      correct: 6,
    },
  ],
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Auth state
  const [usersList, setUsersList] = useState<StoredUser[]>(() => {
    try {
      const saved = localStorage.getItem('enem_inclusivo_users');
      return saved ? JSON.parse(saved) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem('enem_inclusivo_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeView, setActiveView] = useState<'landing' | 'dashboard'>(() => {
    return currentUser ? 'dashboard' : 'landing';
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isStudentRegisterModalOpen, setIsStudentRegisterModalOpen] = useState(false);
  const [isUniversalRegisterModalOpen, setIsUniversalRegisterModalOpen] = useState(false);
  const [universalRegisterRole, setUniversalRegisterRole] = useState<UserRole>('aluno');

  const openUniversalRegisterForRole = (r: UserRole) => {
    setUniversalRegisterRole(r);
    setIsUniversalRegisterModalOpen(true);
  };

  // Rede Integrada de Relacionamentos & Auditoria LGPD (Módulos 2, 3, 8, 9, 11)
  const [relationships, setRelationships] = useState<EducationalRelationship[]>(() => {
    try {
      const saved = localStorage.getItem('enem_relationships');
      return saved ? JSON.parse(saved) : INITIAL_EDUCATIONAL_RELATIONSHIPS;
    } catch {
      return INITIAL_EDUCATIONAL_RELATIONSHIPS;
    }
  });

  const [auditLogs, setAuditLogs] = useState<RelationshipAuditLog[]>(() => {
    try {
      const saved = localStorage.getItem('enem_relationship_audit_logs');
      return saved ? JSON.parse(saved) : INITIAL_RELATIONSHIP_AUDIT_LOGS;
    } catch {
      return INITIAL_RELATIONSHIP_AUDIT_LOGS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('enem_relationships', JSON.stringify(relationships));
    } catch {}
  }, [relationships]);

  useEffect(() => {
    try {
      localStorage.setItem('enem_relationship_audit_logs', JSON.stringify(auditLogs));
    } catch {}
  }, [auditLogs]);

  const [pendingPasswordChangeUser, setPendingPasswordChangeUser] = useState<UserAccount | null>(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  const startOnboarding = () => {
    setIsOnboardingOpen(true);
  };

  const [role, setRole] = useState<UserRole>(currentUser ? currentUser.role : 'aluno');
  const [gradeLevel, setGradeLevel] = useState<GradeLevel>('2º ano');

  // Student Safe Navigation State
  const [isPracticingQuestions, setIsPracticingQuestions] = useState(false);
  const [showLeavePracticeModal, setShowLeavePracticeModal] = useState(false);
  const [onConfirmLeaveAction, setOnConfirmLeaveAction] = useState<(() => void) | null>(null);
  const [studentActiveTab, setStudentActiveTab] = useState<StudentActiveTab>('inicio');

  // Glossário Interativo Pedagógico do ENEM
  const [glossaryTerms, setGlossaryTerms] = useState<GlossaryTerm[]>(() => {
    try {
      const saved = localStorage.getItem('enem_inclusivo_glossary');
      return saved ? JSON.parse(saved) : INITIAL_GLOSSARY_TERMS;
    } catch {
      return INITIAL_GLOSSARY_TERMS;
    }
  });

  const [bookmarkedTermIds, setBookmarkedTermIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('enem_inclusivo_glossary_bookmarks');
      return saved ? JSON.parse(saved) : ['glo-tri', 'glo-proposta-intervencao', 'glo-eutrofizacao'];
    } catch {
      return ['glo-tri', 'glo-proposta-intervencao', 'glo-eutrofizacao'];
    }
  });

  const [selectedGlossarySearch, setSelectedGlossarySearch] = useState<string>('');

  // Trilha de Aprendizado Gamificada (Níveis Básico a Avançado)
  const [learningPathNodes, setLearningPathNodes] = useState<LearningPathNode[]>(() => {
    try {
      const saved = localStorage.getItem('enem_inclusivo_learning_path_nodes');
      return saved ? JSON.parse(saved) : INITIAL_LEARNING_PATH_NODES;
    } catch {
      return INITIAL_LEARNING_PATH_NODES;
    }
  });

  const [learningPathProgress, setLearningPathProgress] = useState<LearningPathProgress>(() => {
    try {
      const saved = localStorage.getItem('enem_inclusivo_learning_path_progress');
      return saved ? JSON.parse(saved) : INITIAL_LEARNING_PATH_PROGRESS;
    } catch {
      return INITIAL_LEARNING_PATH_PROGRESS;
    }
  });

  // Flashcards Automáticos & Questões com Erro (Revisão Espaçada SRS)
  const [wrongQuestions, setWrongQuestions] = useState<StudentWrongAnswer[]>(() => {
    try {
      const saved = localStorage.getItem('enem_inclusivo_wrong_questions');
      return saved ? JSON.parse(saved) : INITIAL_WRONG_ANSWERS;
    } catch {
      return INITIAL_WRONG_ANSWERS;
    }
  });

  const [flashcards, setFlashcards] = useState<AutomaticFlashcard[]>(() => {
    try {
      const saved = localStorage.getItem('enem_inclusivo_flashcards');
      return saved ? JSON.parse(saved) : INITIAL_FLASHCARDS;
    } catch {
      return INITIAL_FLASHCARDS;
    }
  });

  // Registration Database State (Módulo 1.3)
  const [registrationRecords, setRegistrationRecords] = useState<UserRegistrationRecord[]>(() => {
    try {
      const saved = localStorage.getItem('enem_db_registration_records');
      return saved ? JSON.parse(saved) : INITIAL_REGISTRATION_RECORDS;
    } catch {
      return INITIAL_REGISTRATION_RECORDS;
    }
  });

  const [capacityCount, setCapacityCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('enem_db_capacity_count');
      return saved ? Number(saved) : INITIAL_REGISTRATION_RECORDS.length;
    } catch {
      return INITIAL_REGISTRATION_RECORDS.length;
    }
  });

  const [internalAlerts, setInternalAlerts] = useState<InternalAlert[]>(() => {
    try {
      const saved = localStorage.getItem('enem_db_internal_alerts');
      return saved ? JSON.parse(saved) : INITIAL_INTERNAL_ALERTS;
    } catch {
      return INITIAL_INTERNAL_ALERTS;
    }
  });

  const [isRegistrationHubOpen, setIsRegistrationHubOpen] = useState(false);

  // Sync database state to local storage
  useEffect(() => {
    try {
      localStorage.setItem('enem_db_registration_records', JSON.stringify(registrationRecords));
      localStorage.setItem('enem_db_capacity_count', String(capacityCount));
      localStorage.setItem('enem_db_internal_alerts', JSON.stringify(internalAlerts));
    } catch (e) {
      console.warn('Storage sync error:', e);
    }
  }, [registrationRecords, capacityCount, internalAlerts]);

  const [accessibility, setAccessibility] = useState<AccessibilitySettings>(() => {
    try {
      const saved = localStorage.getItem('enem_inclusivo_accessibility');
      return saved ? JSON.parse(saved) : defaultAccessibility;
    } catch {
      return defaultAccessibility;
    }
  });

  const [stats, setStats] = useState<StudentStats>(() => {
    try {
      const saved = localStorage.getItem('enem_inclusivo_stats');
      return saved ? JSON.parse(saved) : initialStats;
    } catch {
      return initialStats;
    }
  });

  const [questions, setQuestions] = useState<Question[]>(INITIAL_QUESTIONS);
  const [essayThemes] = useState<EssayTheme[]>(ESSAY_THEMES);
  const [classGroups, setClassGroups] = useState<ClassGroup[]>(MOCK_CLASS_GROUPS);
  const [schools, setSchools] = useState<SchoolData[]>(MOCK_SCHOOLS);
  const [partners, setPartners] = useState<EducationalPartner[]>(MOCK_EDUCATIONAL_PARTNERS);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Simulation History (Progress tracking over time)
  const [simulationHistory, setSimulationHistory] = useState<SimulationAttempt[]>(() => {
    try {
      const saved = localStorage.getItem('enem_inclusivo_simulations');
      return saved ? JSON.parse(saved) : MOCK_SIMULATION_HISTORY;
    } catch {
      return MOCK_SIMULATION_HISTORY;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('enem_inclusivo_simulations', JSON.stringify(simulationHistory));
    } catch (e) {
      console.warn('LocalStorage error saving simulations:', e);
    }
  }, [simulationHistory]);

  // Essay History (Evolution across 5 Competencies & Knowledge Areas)
  const [essayHistory, setEssayHistory] = useState<EssaySubmissionHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('enem_inclusivo_essay_history');
      return saved ? JSON.parse(saved) : INITIAL_ESSAY_HISTORY;
    } catch {
      return INITIAL_ESSAY_HISTORY;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('enem_inclusivo_essay_history', JSON.stringify(essayHistory));
    } catch (e) {
      console.warn('LocalStorage error saving essay history:', e);
    }
  }, [essayHistory]);

  // Sync users to storage
  useEffect(() => {
    try {
      localStorage.setItem('enem_inclusivo_users', JSON.stringify(usersList));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [usersList]);

  // Sync current user
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('enem_inclusivo_current_user', JSON.stringify(currentUser));
        setRole(currentUser.role);
      } else {
        localStorage.removeItem('enem_inclusivo_current_user');
      }
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem('enem_inclusivo_accessibility', JSON.stringify(accessibility));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [accessibility]);

  useEffect(() => {
    try {
      localStorage.setItem('enem_inclusivo_stats', JSON.stringify(stats));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [stats]);

  useEffect(() => {
    try {
      localStorage.setItem('enem_inclusivo_wrong_questions', JSON.stringify(wrongQuestions));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [wrongQuestions]);

  useEffect(() => {
    try {
      localStorage.setItem('enem_inclusivo_flashcards', JSON.stringify(flashcards));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [flashcards]);

  useEffect(() => {
    try {
      localStorage.setItem('enem_inclusivo_learning_path_nodes', JSON.stringify(learningPathNodes));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [learningPathNodes]);

  useEffect(() => {
    try {
      localStorage.setItem('enem_inclusivo_learning_path_progress', JSON.stringify(learningPathProgress));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [learningPathProgress]);

  useEffect(() => {
    try {
      localStorage.setItem('enem_inclusivo_glossary', JSON.stringify(glossaryTerms));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [glossaryTerms]);

  useEffect(() => {
    try {
      localStorage.setItem('enem_inclusivo_glossary_bookmarks', JSON.stringify(bookmarkedTermIds));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [bookmarkedTermIds]);

  // --- DATABASE & EDIT UNLOCKING FUNCTIONS (PARTE 1, 2, 4, 5) ---

  const simulateCapacity = (count: number) => {
    const capped = Math.min(TOTAL_CAPACITY, Math.max(0, count));
    setCapacityCount(capped);
  };

  const dismissAlert = (alertId: string) => {
    setInternalAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, resolved: true } : a)));
  };

  const unlockEditForRecord = (recordId: number, durationHours: number = 24) => {
    const now = new Date();
    const expiryDate = new Date(now.getTime() + durationHours * 60 * 60 * 1000);
    const formattedExpiry = expiryDate.toLocaleString('pt-BR');

    let updatedName = '';
    setRegistrationRecords((prev) =>
      prev.map((rec) => {
        if (rec.id === recordId) {
          updatedName = rec.fullName;
          return {
            ...rec,
            editUnlocked: true,
            editUnlockedAt: now.toLocaleString('pt-BR'),
            editUnlockedUntil: formattedExpiry,
            editUnlockedBy: currentUser?.name || 'Administrador Global',
          };
        }
        return rec;
      })
    );

    return {
      success: true,
      message: `Edição liberada para [ID #${recordId} - ${updatedName}] por ${durationHours}h (até ${formattedExpiry}). Sem aviso por e-mail (Princípio 1 e 3).`,
    };
  };

  const saveEditedRecord = (
    recordId: number,
    updatedFields: Partial<UserRegistrationRecord>,
    modifierName?: string
  ) => {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('pt-BR');
    const formattedTime = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    setRegistrationRecords((prev) =>
      prev.map((rec) => {
        if (rec.id === recordId) {
          return {
            ...rec,
            ...updatedFields,
            editUnlocked: false, // Bloqueia automaticamente após salvar!
            editUnlockedUntil: undefined,
            lastModified: {
              date: formattedDate,
              time: formattedTime,
              by: modifierName || currentUser?.name || 'Usuário Autorizado',
            },
          };
        }
        return rec;
      })
    );

    return { success: true };
  };

  const updateFreeFieldsDirectly = (
    recordId: number,
    freeFields: Partial<UserRegistrationRecord>
  ) => {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('pt-BR');
    const formattedTime = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    setRegistrationRecords((prev) =>
      prev.map((rec) => {
        if (rec.id === recordId) {
          return {
            ...rec,
            ...freeFields,
            lastModified: {
              date: formattedDate,
              time: formattedTime,
              by: `${rec.fullName} (Alteração Livre)`,
            },
          };
        }
        return rec;
      })
    );
  };

  const addRegistrationRecord = (data: Partial<UserRegistrationRecord>) => {
    if (capacityCount >= TOTAL_CAPACITY) {
      return {
        success: false,
        error: '🛑 CADASTRO SUSPENSO — Capacidade máxima de 200.000 atingida. Aguardar ampliação.',
      };
    }

    const nextId =
      registrationRecords.length > 0
        ? Math.max(...registrationRecords.map((r) => r.id)) + 1
        : 1;

    const now = new Date();
    const newRecord: UserRegistrationRecord = {
      id: nextId,
      level: data.level || 'Nível 2 — Aluno',
      status: 'Ativo',
      editUnlocked: false, // Bloqueado por padrão
      lastModified: {
        date: now.toLocaleDateString('pt-BR'),
        time: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        by: currentUser?.name || 'Administrador',
      },
      dataSharing: data.dataSharing ?? false,
      learningProfile: data.learningProfile || 'Padrão',
      fullName: data.fullName || 'Novo Usuário',
      email: data.email || '',
      phone: data.phone || '',
      ...data,
    };

    setRegistrationRecords((prev) => [newRecord, ...prev]);
    setCapacityCount((prev) => prev + 1);

    return { success: true, record: newRecord };
  };

  const blockUserAccess = (recordId: number) => {
    setRegistrationRecords((prev) =>
      prev.map((r) => (r.id === recordId ? { ...r, status: 'Bloqueado' } : r))
    );
  };

  const unblockUserAccess = (recordId: number) => {
    setRegistrationRecords((prev) =>
      prev.map((r) => (r.id === recordId ? { ...r, status: 'Ativo' } : r))
    );
  };

  const resetUserPasswordManual = (recordId: number, newPass: string) => {
    setRegistrationRecords((prev) =>
      prev.map((r) => (r.id === recordId ? { ...r, password: newPass } : r))
    );
  };

  // PARTE 6 — PROCESSADOR DE COMANDOS DE INTERAÇÃO
  const processTerminalCommand = (rawCommand: string): { output: string; actionResult?: any } => {
    const cmd = rawCommand.trim();

    if (cmd === '[iniciar-cadastro]') {
      return {
        output: `OPÇÕES DE NÍVEL PARA CADASTRO:
0 - Administrador Global
1 - Operador / Gestor
2 - Aluno
3 - Professor
4 - Escola Pública Independente / Particular
5 - Escola Vinculada à Rede
6 - Prefeitura / Secretaria
Digite [novo-cadastro] para abrir o formulário.`,
        actionResult: { action: 'open_new_modal' },
      };
    }

    if (cmd === '[novo-cadastro]') {
      return {
        output: `Iniciando formulário de registro. Selecione o nível desejado (0 a 6).`,
        actionResult: { action: 'open_new_modal' },
      };
    }

    if (cmd === '[status-banco]') {
      const remaining = TOTAL_CAPACITY - capacityCount;
      const pct = ((capacityCount / TOTAL_CAPACITY) * 100).toFixed(2);
      let alertMsg = 'Capacidade normal.';
      if (capacityCount >= TOTAL_CAPACITY) {
        alertMsg = '🛑 CADASTRO SUSPENSO — Capacidade máxima atingida.';
      } else if (capacityCount >= CAPACITY_CRITICAL_THRESHOLD) {
        alertMsg = `🔴 CAPACIDADE CRÍTICA — ${capacityCount.toLocaleString()} registros. Restam menos de 5.000 vagas.`;
      } else if (capacityCount >= CAPACITY_WARNING_THRESHOLD) {
        alertMsg = `⚠️ ALERTA DE CAPACIDADE — ${capacityCount.toLocaleString()} registros. Restam ${remaining.toLocaleString()} vagas. Solicitar ampliação imediata.`;
      }

      return {
        output: `=== STATUS DO BANCO DE DADOS ===
Capacidade Total: ${TOTAL_CAPACITY.toLocaleString()} registros
Registros Ativos: ${capacityCount.toLocaleString()} (${pct}%)
Vagas Restantes: ${remaining.toLocaleString()}
Status: ${alertMsg}`,
      };
    }

    if (cmd === '[listar-pendentes]') {
      const pendingList = registrationRecords.filter(
        (r) => r.status === 'Pendente' || r.editUnlocked
      );
      if (pendingList.length === 0) {
        return { output: 'Nenhum cadastro com status pendente ou edição liberada no momento.' };
      }
      const listStr = pendingList
        .map(
          (p) =>
            `ID #${p.id} | ${p.fullName} | ${p.level} | Status: ${p.status} | Edição Liberada: ${
              p.editUnlocked ? 'SIM (até ' + p.editUnlockedUntil + ')' : 'NÃO'
            }`
        )
        .join('\n');
      return { output: `=== REGISTROS PENDENTES / EDIÇÃO LIBERADA ===\n${listStr}` };
    }

    // Match [liberar-edicao-ID]
    const matchLiberar = cmd.match(/^\[liberar-edicao-(\d+)\]$/i);
    if (matchLiberar) {
      const id = parseInt(matchLiberar[1], 10);
      const res = unlockEditForRecord(id, 24);
      return { output: res.message };
    }

    // Match [bloquear-usuario-ID]
    const matchBloquear = cmd.match(/^\[bloquear-usuario-(\d+)\]$/i);
    if (matchBloquear) {
      const id = parseInt(matchBloquear[1], 10);
      blockUserAccess(id);
      return { output: `Acesso do usuário [ID #${id}] suspenso com sucesso.` };
    }

    // Match [alterar-senha-ID]
    const matchSenha = cmd.match(/^\[alterar-senha-(\d+)\]$/i);
    if (matchSenha) {
      const id = parseInt(matchSenha[1], 10);
      resetUserPasswordManual(id, 'mudar123');
      return {
        output: `Senha do usuário [ID #${id}] redefinida manualmente para "mudar123". Ele deverá alterar no próximo login.`,
      };
    }

    return {
      output: `Comando não reconhecido. Comandos disponíveis:
[iniciar-cadastro]
[novo-cadastro]
[status-banco]
[listar-pendentes]
[liberar-edicao-ID] (Ex: [liberar-edicao-3])
[bloquear-usuario-ID] (Ex: [bloquear-usuario-2])
[alterar-senha-ID] (Ex: [alterar-senha-4])`,
    };
  };

  // LOGIN FUNCTION
  const login = (username: string, password: string) => {
    const trimmedUser = username.trim().toLowerCase();
    const found = usersList.find(
      (u) => u.username.toLowerCase() === trimmedUser && u.password === password
    );

    if (!found) {
      return { success: false, error: 'Credenciais inválidas. Verifique usuário e senha.' };
    }

    // Regra: Sempre que o usuário entrar e estiver com mustChangePassword, exigir troca de senha
    if (found.mustChangePassword) {
      setPendingPasswordChangeUser(found);
      setIsLoginModalOpen(false);
      return { success: true, mustChange: true };
    }

    // Login normal bem-sucedido
    setCurrentUser(found);
    setRole(found.role);
    setActiveView('dashboard');
    if (found.role === 'aluno') {
      setStudentActiveTab('inicio');
    }
    setIsLoginModalOpen(false);
    return { success: true, mustChange: false };
  };

  // CHANGE PASSWORD FUNCTION
  const changePassword = (userId: string, newPassword: string) => {
    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'A nova senha deve ter no mínimo 6 caracteres.' };
    }
    if (newPassword === 'mudar123') {
      return { success: false, error: 'A nova senha não pode ser a senha temporária inicial ("mudar123").' };
    }

    let updatedAccount: UserAccount | null = null;
    const updatedUsers = usersList.map((u) => {
      if (u.id === userId) {
        const modified: StoredUser = {
          ...u,
          password: newPassword,
          mustChangePassword: false,
          lastLogin: new Date().toLocaleDateString('pt-BR'),
        };
        updatedAccount = modified;
        return modified;
      }
      return u;
    });

    setUsersList(updatedUsers);

    if (updatedAccount) {
      setCurrentUser(updatedAccount);
      setRole((updatedAccount as UserAccount).role);
      setActiveView('dashboard');
      if ((updatedAccount as UserAccount).role === 'aluno') {
        setStudentActiveTab('inicio');
      }
      setPendingPasswordChangeUser(null);
      // Inicia imediatamente o guia interativo de onboarding para o perfil recém-logado
      setIsOnboardingOpen(true);
      return { success: true };
    }

    return { success: false, error: 'Usuário não encontrado.' };
  };

  // REGISTER STUDENT DIRECTLY (Inscrição Independente do Aluno)
  const registerStudentDirectly = (data: {
    fullName: string;
    birthDate: string;
    currentGrade: GradeLevel;
    contactInfo: string;
    username: string;
    password: string;
    schoolCode?: string;
    learningProfile: LearningProfileType;
    dataSharing: boolean;
    termsAccepted: boolean;
  }) => {
    // 1. Check capacity limit (200.000 max)
    if (capacityCount >= TOTAL_CAPACITY) {
      return {
        success: false,
        error: '🛑 CADASTRO SUSPENSO — Capacidade máxima de 200.000 atingida. Aguardar ampliação.',
      };
    }

    // 2. Check if username already exists in usersList
    const existing = usersList.find(
      (u) => u.username.toLowerCase() === data.username.toLowerCase()
    );
    if (existing) {
      return {
        success: false,
        error: 'Este nome de usuário já está em uso. Por favor, escolha outro.',
      };
    }

    // 3. Create record in Database (Registration Records)
    const nextId =
      registrationRecords.length > 0
        ? Math.max(...registrationRecords.map((r) => r.id)) + 1
        : 1;

    const now = new Date();
    const newRecord: UserRegistrationRecord = {
      id: nextId,
      level: 'Nível 2 — Aluno',
      status: 'Ativo',
      editUnlocked: false, // Edição bloqueada por padrão
      lastModified: {
        date: now.toLocaleDateString('pt-BR'),
        time: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        by: 'Auto-Cadastro Independente (Aluno)',
      },
      fullName: data.fullName,
      birthDate: data.birthDate,
      currentGrade: data.currentGrade,
      email: data.contactInfo.includes('@') ? data.contactInfo : '',
      phone: !data.contactInfo.includes('@') ? data.contactInfo : '',
      schoolLinkCode: data.schoolCode || '',
      learningProfile: data.learningProfile,
      dataSharing: data.dataSharing,
      termsAccepted: data.termsAccepted,
    };

    // 4. Create UserAccount in usersList for login
    const cleanDoc = normalizeDocument((data as any).cpf || generateValidCPFSeed(nextId));
    const newAccount: StoredUser = {
      id: `user-aluno-${nextId}`,
      technicalId: generateTechnicalId('aluno', nextId),
      documentType: 'CPF',
      documentNumber: cleanDoc,
      formattedDocument: formatCPF(cleanDoc),
      maskedDocument: maskCPF(cleanDoc),
      username: data.username,
      password: data.password,
      name: data.fullName,
      role: 'aluno',
      email: data.contactInfo,
      mustChangePassword: false, // já escolheu sua própria senha no formulário
      organization: data.schoolCode ? `Instituição #${data.schoolCode}` : 'Aluno Independente',
      createdAt: now.toLocaleDateString('pt-BR'),
      lastLogin: undefined,
    };

    setRegistrationRecords((prev) => [newRecord, ...prev]);
    setCapacityCount((prev) => prev + 1);
    setUsersList((prev) => [...prev, newAccount]);

    return { success: true };
  };

  // ==========================================
  // CADASTRO UNIVERSAL INTEGRADO (MÓDULO 2 & 4, 5, 6, 7)
  // Aluno: CPF | Professor: CPF | Escola: CNPJ | Secretaria: CNPJ
  // ==========================================
  const registerUniversalUser = (data: {
    fullName: string;
    role: UserRole;
    documentNumber: string;
    email: string;
    phone?: string;
    username: string;
    password: string;
    gradeLevel?: GradeLevel;
    organization?: string;
    assignedClasses?: string[];
    teachingSubjects?: string[];
    inepCode?: string;
    networkCode?: string;
    learningProfile?: LearningProfileType;
    dataSharing?: boolean;
    termsAccepted: boolean;
  }) => {
    // 1. Checagem de capacidade
    if (capacityCount >= TOTAL_CAPACITY) {
      return {
        success: false,
        error: '🛑 CADASTRO SUSPENSO — Capacidade máxima de 200.000 atingida.',
      };
    }

    // 2. Validação estrita do documento conforme o papel (CPF para Aluno/Professor; CNPJ para Escola/Secretaria)
    const valResult = validateDocumentForRole(data.documentNumber, data.role);
    if (!valResult.valid) {
      return {
        success: false,
        error: valResult.error || 'Documento inválido para a categoria selecionada.',
      };
    }

    // 3. Regra Obrigatória: Impedir duplicidade de documentos ativos
    const cleanDoc = valResult.normalized;
    const existingDocUser = usersList.find(
      (u) => normalizeDocument(u.documentNumber || '') === cleanDoc
    );
    if (existingDocUser) {
      return {
        success: false,
        error: `O ${valResult.documentType} informado (${valResult.formatted}) já possui um cadastro ativo registrado no sistema (${existingDocUser.name} - ${existingDocUser.role}). Por segurança e conformidade com a LGPD, duplicidades de documento são estritamente proibidas.`,
      };
    }

    // 4. Checagem de nome de usuário único
    const existingUsername = usersList.find(
      (u) => u.username.toLowerCase() === data.username.toLowerCase().trim()
    );
    if (existingUsername) {
      return {
        success: false,
        error: 'Este nome de usuário (login) já está em uso. Por favor, escolha outro.',
      };
    }

    if (!data.termsAccepted) {
      return {
        success: false,
        error: 'É obrigatório aceitar os Termos de Uso e Política de Privacidade.',
      };
    }

    const nextId =
      registrationRecords.length > 0
        ? Math.max(...registrationRecords.map((r) => r.id)) + 1
        : 1;

    const technicalId = generateTechnicalId(data.role, nextId);
    const now = new Date();
    const nowStr = now.toLocaleDateString('pt-BR') + ' ' + now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    // Determinar o nível de registro cadastral
    let level: RegistrationLevel = 'Nível 2 — Aluno';
    if (data.role === 'professor') level = 'Nível 3 — Professor';
    else if (data.role === 'escola') level = 'Nível 4 — Escola Pública Independente / Particular';
    else if (data.role === 'secretaria_educacao') level = 'Nível 6 — Prefeitura / Secretaria';

    const newRecord: UserRegistrationRecord = {
      id: nextId,
      level,
      status: 'Ativo',
      editUnlocked: false,
      lastModified: {
        date: now.toLocaleDateString('pt-BR'),
        time: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        by: `Cadastro Universal (${data.role})`,
      },
      fullName: data.fullName,
      email: data.email,
      phone: data.phone || '',
      cpf: valResult.documentType === 'CPF' ? valResult.formatted : undefined,
      cnpj: valResult.documentType === 'CNPJ' ? valResult.formatted : undefined,
      currentGrade: data.gradeLevel,
      learningProfile: data.learningProfile || 'Padrão',
      dataSharing: data.dataSharing !== undefined ? data.dataSharing : true,
      termsAccepted: data.termsAccepted,
      teachingSubjects: data.teachingSubjects,
      assignedClasses: data.assignedClasses,
      networkCode: data.networkCode,
    };

    const newAccount: StoredUser = {
      id: `user-${data.role}-${nextId}`,
      username: data.username.trim().toLowerCase(),
      password: data.password,
      name: data.fullName,
      role: data.role,
      email: data.email,
      mustChangePassword: false,
      organization: data.organization || (data.role === 'aluno' ? 'Estudante Independente' : 'Instituição de Ensino'),
      createdAt: now.toLocaleDateString('pt-BR'),
      technicalId,
      documentType: valResult.documentType,
      documentNumber: cleanDoc,
      formattedDocument: valResult.formatted,
      maskedDocument: valResult.masked,
    };

    // Log de Auditoria LGPD
    const logId = `LOG-${String(auditLogs.length + 1).padStart(4, '0')}`;
    const auditLog: RelationshipAuditLog = {
      id: logId,
      action: 'CADASTRO_INICIAL',
      actorId: technicalId,
      actorName: data.fullName,
      actorRole: data.role,
      targetId: technicalId,
      timestamp: nowStr,
      details: `Novo cadastro universal criado com ${valResult.documentType} validado (${valResult.masked}). Identificador técnico atribuído: ${technicalId}.`,
    };

    setRegistrationRecords((prev) => [newRecord, ...prev]);
    setCapacityCount((prev) => prev + 1);
    setUsersList((prev) => [...prev, newAccount]);
    setAuditLogs((prev) => [auditLog, ...prev]);

    return { success: true, user: newAccount };
  };

  // ==========================================
  // SISTEMA DE RELACIONAMENTOS & VÍNCULOS DINÂMICOS (MÓDULOS 3, 5, 6, 7, 8)
  // ==========================================
  const lookupUniversalUser = async (
    documentOrId: string,
    targetRole?: UserRole
  ): Promise<{
    id: string;
    technicalId: string;
    maskedName: string;
    maskedDocument: string;
    role: UserRole;
    found: boolean;
  } | null> => {
    const cleanDoc = normalizeDocument(documentOrId);
    const foundUser = usersList.find((u) => {
      const matchDoc = cleanDoc && normalizeDocument(u.documentNumber || '') === cleanDoc;
      const matchId = u.technicalId === documentOrId || u.id === documentOrId;
      const matchRole = !targetRole || u.role === targetRole;
      return (matchDoc || matchId) && matchRole;
    });

    if (!foundUser) return null;

    const parts = foundUser.name.split(' ');
    const maskedName = parts
      .map((p) => (p.length > 2 ? p[0] + '*'.repeat(p.length - 2) + p[p.length - 1] : p))
      .join(' ');

    return {
      id: foundUser.id,
      technicalId: foundUser.technicalId,
      maskedName,
      maskedDocument: foundUser.maskedDocument || (foundUser.documentType === 'CNPJ' ? maskCNPJ(foundUser.documentNumber) : maskCPF(foundUser.documentNumber)),
      role: foundUser.role,
      found: true,
    };
  };

  const requestRelationship = async (
    dataOrTarget:
      | {
          targetDocument: string;
          relationshipType: RelationshipCategory;
          assignedClass?: string;
          subject?: string;
          permissions?: RelationshipPermissions;
          notes?: string;
        }
      | string,
    relationshipTypeParam?: RelationshipCategory,
    permissionsParam?: Partial<RelationshipPermissions>,
    assignedClassParam?: string
  ) => {
    if (!currentUser) {
      return { success: false, error: 'Usuário não autenticado.' };
    }

    let targetDocOrId: string;
    let relType: RelationshipCategory;
    let assignedClass: string | undefined;
    let subject: string | undefined;
    let permissions: RelationshipPermissions | undefined;
    let notes: string | undefined;

    if (typeof dataOrTarget === 'object') {
      targetDocOrId = dataOrTarget.targetDocument;
      relType = dataOrTarget.relationshipType;
      assignedClass = dataOrTarget.assignedClass;
      subject = dataOrTarget.subject;
      permissions = dataOrTarget.permissions;
      notes = dataOrTarget.notes;
    } else {
      targetDocOrId = dataOrTarget;
      relType = relationshipTypeParam || 'ALUNO_PROFESSOR';
      assignedClass = assignedClassParam;
      permissions = {
        viewPerformance: true,
        viewSimulations: true,
        viewEssays: true,
        viewAttendance: true,
        viewDifficulties: true,
        viewDetailedReports: true,
        ...permissionsParam,
      };
    }

    const cleanTarget = normalizeDocument(targetDocOrId);
    const targetUser = usersList.find(
      (u) =>
        (cleanTarget && normalizeDocument(u.documentNumber || '') === cleanTarget) ||
        u.technicalId === targetDocOrId ||
        u.id === targetDocOrId
    );

    if (!targetUser) {
      return {
        success: false,
        error: `Nenhum cadastro ativo foi localizado com o documento/ID informado (${targetDocOrId}). O destinatário precisa se cadastrar previamente na plataforma. Não criamos contas fictícias automaticamente.`,
      };
    }

    if (targetUser.id === currentUser.id) {
      return { success: false, error: 'Não é permitido criar um vínculo consigo mesmo.' };
    }

    // Checar se já existe vínculo ativo ou pendente
    const existing = relationships.find(
      (r) =>
        ((r.sourceUserId === currentUser.id && r.targetUserId === targetUser.id) ||
          (r.sourceUserId === targetUser.id && r.targetUserId === currentUser.id)) &&
        (r.status === 'aprovado' || r.status === 'pendente')
    );

    if (existing) {
      return {
        success: false,
        error: `Já existe um relacionamento com status "${existing.status}" entre estas duas partes (Código: ${existing.id}).`,
      };
    }

    const nextRelNum = relationships.length + 1;
    const relId = `REL-${String(nextRelNum).padStart(4, '0')}`;
    const now = new Date();
    const nowStr = now.toLocaleDateString('pt-BR') + ' ' + now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const logId = `LOG-${String(auditLogs.length + 1).padStart(4, '0')}`;
    const newLog: RelationshipAuditLog = {
      id: logId,
      action: 'SOLICITACAO_CRIADA',
      actorId: currentUser.technicalId,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      targetId: targetUser.technicalId,
      timestamp: nowStr,
      details: `Solicitação de vínculo (${relType}) enviada por ${currentUser.name} para ${targetUser.name}.`,
    };

    const newRel: EducationalRelationship = {
      id: relId,
      relationshipType: relType,
      status: 'pendente',
      sourceTechnicalId: currentUser.technicalId,
      sourceUserId: currentUser.id,
      sourceName: currentUser.name,
      sourceRole: currentUser.role,
      sourceDocument: currentUser.documentNumber,
      targetTechnicalId: targetUser.technicalId,
      targetUserId: targetUser.id,
      targetName: targetUser.name,
      targetRole: targetUser.role,
      targetDocument: targetUser.documentNumber,
      requestedAt: nowStr,
      requestedBy: currentUser.name,
      assignedClass: assignedClass,
      subject: subject,
      permissions: permissions || {
        viewPerformance: true,
        viewSimulations: true,
        viewEssays: true,
        viewAttendance: true,
        viewDifficulties: true,
        viewDetailedReports: true,
      },
      history: [newLog],
      notes: notes,
    };

    setRelationships((prev) => [newRel, ...prev]);
    setAuditLogs((prev) => [newLog, ...prev]);

    return { success: true, relationship: newRel };
  };

  const approveRelationship = (relationshipId: string) => {
    if (!currentUser) return { success: false, error: 'Usuário não autenticado.' };

    let targetFound = false;
    const now = new Date();
    const nowStr = now.toLocaleDateString('pt-BR') + ' ' + now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const updated = relationships.map((r) => {
      if (r.id === relationshipId) {
        targetFound = true;
        const logId = `LOG-${String(auditLogs.length + 1).padStart(4, '0')}`;
        const log: RelationshipAuditLog = {
          id: logId,
          action: 'VINCULO_APROVADO',
          actorId: currentUser.technicalId,
          actorName: currentUser.name,
          actorRole: currentUser.role,
          targetId: r.sourceTechnicalId,
          timestamp: nowStr,
          details: `Vínculo aprovado por ${currentUser.name}. Acesso aos indicadores educacionais liberado conforme as permissões.`,
        };
        setAuditLogs((prev) => [log, ...prev]);
        return {
          ...r,
          status: 'aprovado' as RelationshipStatus,
          approvedAt: nowStr,
          approvedBy: currentUser.name,
          history: [log, ...r.history],
        };
      }
      return r;
    });

    if (!targetFound) return { success: false, error: 'Vínculo não localizado.' };

    setRelationships(updated);
    return { success: true };
  };

  const rejectRelationship = (relationshipId: string, reason?: string) => {
    if (!currentUser) return { success: false, error: 'Usuário não autenticado.' };

    let targetFound = false;
    const now = new Date();
    const nowStr = now.toLocaleDateString('pt-BR') + ' ' + now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const updated = relationships.map((r) => {
      if (r.id === relationshipId) {
        targetFound = true;
        const logId = `LOG-${String(auditLogs.length + 1).padStart(4, '0')}`;
        const log: RelationshipAuditLog = {
          id: logId,
          action: 'VINCULO_RECUSADO',
          actorId: currentUser.technicalId,
          actorName: currentUser.name,
          actorRole: currentUser.role,
          targetId: r.sourceTechnicalId,
          timestamp: nowStr,
          details: `Solicitação de vínculo recusada por ${currentUser.name}.${reason ? ` Motivo: ${reason}` : ''}`,
        };
        setAuditLogs((prev) => [log, ...prev]);
        return {
          ...r,
          status: 'recusado' as RelationshipStatus,
          endedAt: nowStr,
          history: [log, ...r.history],
        };
      }
      return r;
    });

    if (!targetFound) return { success: false, error: 'Vínculo não localizado.' };

    setRelationships(updated);
    return { success: true };
  };

  const revokeRelationship = (relationshipId: string, reason?: string) => {
    if (!currentUser) return { success: false, error: 'Usuário não autenticado.' };

    let targetFound = false;
    const now = new Date();
    const nowStr = now.toLocaleDateString('pt-BR') + ' ' + now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const updated = relationships.map((r) => {
      if (r.id === relationshipId) {
        targetFound = true;
        const otherPartyId = r.sourceUserId === currentUser.id ? r.targetTechnicalId : r.sourceTechnicalId;
        const logId = `LOG-${String(auditLogs.length + 1).padStart(4, '0')}`;
        const log: RelationshipAuditLog = {
          id: logId,
          action: 'VINCULO_REVOGADO',
          actorId: currentUser.technicalId,
          actorName: currentUser.name,
          actorRole: currentUser.role,
          targetId: otherPartyId,
          timestamp: nowStr,
          details: `Vínculo formalmente revogado por ${currentUser.name}. O acesso aos dados educacionais foi suspenso imediatamente, preservando integralmente o histórico prévio.${reason ? ` Motivo: ${reason}` : ''}`,
        };
        setAuditLogs((prev) => [log, ...prev]);
        return {
          ...r,
          status: 'encerrado' as RelationshipStatus,
          endedAt: nowStr,
          history: [log, ...r.history],
        };
      }
      return r;
    });

    if (!targetFound) return { success: false, error: 'Vínculo não localizado.' };

    setRelationships(updated);
    return { success: true };
  };

  const updateRelationshipPermissions = (relationshipId: string, permissions: Partial<RelationshipPermissions>) => {
    let targetFound = false;
    const now = new Date();
    const nowStr = now.toLocaleDateString('pt-BR') + ' ' + now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const updated = relationships.map((r) => {
      if (r.id === relationshipId) {
        targetFound = true;
        const newPerms = { ...r.permissions, ...permissions };
        const logId = `LOG-${String(auditLogs.length + 1).padStart(4, '0')}`;
        const log: RelationshipAuditLog = {
          id: logId,
          action: 'PERMISSOES_ALTERADAS',
          actorId: currentUser?.technicalId || 'SISTEMA',
          actorName: currentUser?.name || 'Sistema',
          actorRole: currentUser?.role || 'admin',
          targetId: r.sourceTechnicalId,
          timestamp: nowStr,
          details: `Permissões de compartilhamento atualizadas pelo titular dos dados.`,
        };
        setAuditLogs((prev) => [log, ...prev]);
        return {
          ...r,
          permissions: newPerms,
          history: [log, ...r.history],
        };
      }
      return r;
    });

    if (targetFound) {
      setRelationships(updated);
      return { success: true };
    }
    return { success: false };
  };

  // ==========================================
  // DISTRIBUIÇÃO DINÂMICA DE INDICADORES (MÓDULO 9)
  // Consulta a fonte única de dados respeitando estritamente os vínculos aprovados
  // ==========================================
  const getAuthorizedStudentsForTeacher = (teacherUserId: string): StudentAcademicSnapshot[] => {
    // 1. Filtrar relacionamentos aprovados de alunos com este professor
    const approvedStudentLinks = relationships.filter(
      (r) =>
        r.relationshipType === 'ALUNO_PROFESSOR' &&
        r.status === 'aprovado' &&
        (r.sourceUserId === teacherUserId || r.targetUserId === teacherUserId)
    );

    const snapshots: StudentAcademicSnapshot[] = [];

    for (const link of approvedStudentLinks) {
      const studentUserId = link.sourceUserId === teacherUserId ? link.targetUserId : link.sourceUserId;
      const studentUser = usersList.find((u) => u.id === studentUserId);

      // Se for a aluna Mariana Silva (usuária ativa de teste), fundir com os stats reais ao vivo
      if (studentUserId === 'user-aluno-1') {
        const accuracy = stats.totalAnswered > 0 ? Math.round((stats.totalCorrect / stats.totalAnswered) * 100) : 76;
        const triEstimate = simulationHistory.length > 0 ? simulationHistory[0].overallScoreTRI : 748;

        snapshots.push({
          studentUserId,
          technicalId: studentUser?.technicalId || 'USR-ALU-0001',
          studentName: studentUser?.name || 'Mariana Silva Santos',
          gradeLevel: '3º ano',
          totalStudyTimeMinutes: stats.timeSpentMinutes,
          totalAnswered: stats.totalAnswered,
          totalCorrect: stats.totalCorrect,
          accuracyRate: accuracy,
          triScoreEstimated: triEstimate,
          consecutiveDaysStreak: stats.streakDays,
          simulationsCount: simulationHistory.length,
          latestSimulationTRI: triEstimate,
          essaysCount: essayHistory.length,
          latestEssayScore: essayHistory.length > 0 ? essayHistory[0].totalScore : 880,
          weakestArea: 'Ciências da Natureza e suas Tecnologias',
          strongestArea: 'Ciências Humanas e suas Tecnologias',
          lastActiveDate: 'Hoje',
          assignedClass: link.assignedClass || '3º Ano A - Matutino',
          authorizedAt: link.approvedAt || link.requestedAt,
          relationshipId: link.id,
        });
      } else {
        // Alunos adicionais pré-cadastrados ou recém-vinculados
        const defaultSnapshot = INITIAL_STUDENT_SNAPSHOTS[studentUserId] || {
          studentUserId,
          technicalId: studentUser?.technicalId || 'USR-ALU-0099',
          studentName: studentUser?.name || link.targetName,
          gradeLevel: '3º ano',
          totalStudyTimeMinutes: 240,
          totalAnswered: 35,
          totalCorrect: 26,
          accuracyRate: 74,
          triScoreEstimated: 720,
          consecutiveDaysStreak: 4,
          simulationsCount: 2,
          latestSimulationTRI: 730,
          essaysCount: 2,
          latestEssayScore: 820,
          weakestArea: 'Matemática e suas Tecnologias',
          strongestArea: 'Linguagens, Códigos e suas Tecnologias',
          lastActiveDate: 'Ontem',
          assignedClass: link.assignedClass || '3º Ano A - Matutino',
          authorizedAt: link.approvedAt || link.requestedAt,
          relationshipId: link.id,
        };
        snapshots.push(defaultSnapshot);
      }
    }

    return snapshots;
  };

  const getAuthorizedTeachersForSchool = (schoolUserId: string): EducationalRelationship[] => {
    return relationships.filter(
      (r) =>
        r.relationshipType === 'PROFESSOR_ESCOLA' &&
        r.status === 'aprovado' &&
        (r.sourceUserId === schoolUserId || r.targetUserId === schoolUserId)
    );
  };

  const getAuthorizedSchoolsForSecretariat = (secretariatUserId: string): EducationalRelationship[] => {
    return relationships.filter(
      (r) =>
        r.relationshipType === 'ESCOLA_SECRETARIA' &&
        r.status === 'aprovado' &&
        (r.sourceUserId === secretariatUserId || r.targetUserId === secretariatUserId)
    );
  };

  const getAggregatedSchoolMetrics = (schoolUserId: string): ConsolidatedSchoolMetrics => {
    const schoolUser = usersList.find((u) => u.id === schoolUserId);
    const approvedProfLinks = getAuthorizedTeachersForSchool(schoolUserId);
    const teacherIds = approvedProfLinks.map((r) =>
      r.sourceUserId === schoolUserId ? r.targetUserId : r.sourceUserId
    );

    // Alunos vinculados através dos professores autorizados da escola
    const allStudents: StudentAcademicSnapshot[] = [];
    teacherIds.forEach((tId) => {
      const studs = getAuthorizedStudentsForTeacher(tId);
      allStudents.push(...studs);
    });

    const uniqueStudents = Array.from(new Map(allStudents.map((s) => [s.studentUserId, s])).values());

    const totalStudents = uniqueStudents.length;
    const avgTRI =
      totalStudents > 0
        ? Math.round(uniqueStudents.reduce((acc, s) => acc + s.triScoreEstimated, 0) / totalStudents)
        : 725;
    const avgEssay =
      totalStudents > 0
        ? Math.round(uniqueStudents.reduce((acc, s) => acc + (s.latestEssayScore || 780), 0) / totalStudents)
        : 810;
    const totalSimulations = uniqueStudents.reduce((acc, s) => acc + s.simulationsCount, 0);

    return {
      schoolId: schoolUserId,
      schoolName: schoolUser?.name || 'E.E. Professora Maria da Glória',
      inepCode: '35012345',
      cnpjFormatted: schoolUser?.formattedDocument || '46.384.111/0001-40',
      totalTeachersLinked: teacherIds.length,
      totalStudentsAuthorized: totalStudents,
      averageTRI: avgTRI,
      averageEssayScore: avgEssay,
      simulationsCompleted: totalSimulations,
      triByArea: {
        LC: 710,
        CH: 745,
        CN: 685,
        MT: 735,
      },
      classesCount: 3,
    };
  };

  const getAggregatedSecretariatMetrics = (secretariatUserId: string): ConsolidatedSecretariatMetrics => {
    const secUser = usersList.find((u) => u.id === secretariatUserId);
    const approvedSchools = getAuthorizedSchoolsForSecretariat(secretariatUserId);

    let totalStudents = 0;
    let totalTeachers = 0;
    const schoolComparisons: ConsolidatedSecretariatMetrics['schoolsComparison'] = [];

    approvedSchools.forEach((link) => {
      const schoolId = link.sourceUserId === secretariatUserId ? link.targetUserId : link.sourceUserId;
      const schoolMetrics = getAggregatedSchoolMetrics(schoolId);
      totalStudents += schoolMetrics.totalStudentsAuthorized;
      totalTeachers += schoolMetrics.totalTeachersLinked;

      schoolComparisons.push({
        schoolId,
        schoolName: schoolMetrics.schoolName,
        city: 'Campinas/SP',
        studentsCount: schoolMetrics.totalStudentsAuthorized,
        averageTRI: schoolMetrics.averageTRI,
        averageEssay: schoolMetrics.averageEssayScore,
        status: schoolMetrics.averageTRI >= 750 ? 'Excelente' : schoolMetrics.averageTRI >= 680 ? 'Consolidada' : 'Atenção',
      });
    });

    const networkAvgTRI =
      schoolComparisons.length > 0
        ? Math.round(schoolComparisons.reduce((acc, s) => acc + s.averageTRI, 0) / schoolComparisons.length)
        : 738;
    const networkAvgEssay =
      schoolComparisons.length > 0
        ? Math.round(schoolComparisons.reduce((acc, s) => acc + s.averageEssay, 0) / schoolComparisons.length)
        : 825;

    return {
      secretariatName: secUser?.name || 'Secretaria de Estado da Educação - Diretoria Campinas',
      totalSchoolsLinked: approvedSchools.length,
      totalTeachersLinked: Math.max(1, totalTeachers),
      totalStudentsAuthorized: Math.max(2, totalStudents),
      networkAverageTRI: networkAvgTRI,
      networkAverageEssayScore: networkAvgEssay,
      networkSimulationsCount: 14,
      participationRate: 92,
      enemReadinessIndex: 78,
      schoolsComparison: schoolComparisons,
    };
  };

  const getStudentRelationships = (studentUserId: string): EducationalRelationship[] => {
    return relationships.filter(
      (r) => r.sourceUserId === studentUserId || r.targetUserId === studentUserId
    );
  };

  // LOGOUT FUNCTION
  const logout = () => {
    setCurrentUser(null);
    setActiveView('landing');
    setPendingPasswordChangeUser(null);
    setIsPracticingQuestions(false);
    setShowLeavePracticeModal(false);
    stopSpeaking();
  };

  // Safe Navigation Handler
  const confirmLeaveIfPracticing = (action: () => void) => {
    if (role === 'aluno' && isPracticingQuestions) {
      setOnConfirmLeaveAction(() => action);
      setShowLeavePracticeModal(true);
    } else {
      action();
    }
  };

  const executeLeavePracticeConfirm = () => {
    setShowLeavePracticeModal(false);
    setIsPracticingQuestions(false);
    stopSpeaking();
    if (onConfirmLeaveAction) {
      onConfirmLeaveAction();
      setOnConfirmLeaveAction(null);
    } else {
      setStudentActiveTab('inicio');
    }
  };

  const cancelLeavePractice = () => {
    setShowLeavePracticeModal(false);
    setOnConfirmLeaveAction(null);
    // Student resumes exactly where they were
  };

  const goToUserHome = () => {
    confirmLeaveIfPracticing(() => {
      setActiveView('dashboard');
      if (role === 'aluno') {
        setStudentActiveTab('inicio');
      }
    });
  };

  const updateAccessibility = (partial: Partial<AccessibilitySettings>) => {
    setAccessibility((prev) => ({ ...prev, ...partial }));
  };

  const recordQuestionAnswer = (
    questionId: string,
    isCorrect: boolean,
    area: KnowledgeArea,
    timeSec: number,
    selectedIndex?: number
  ) => {
    // Se o aluno errou a questão, registra automaticamente para criação de Flashcards
    if (!isCorrect) {
      const q = questions.find((item) => item.id === questionId);
      if (q) {
        const todayStr = new Date().toISOString().split('T')[0];
        const studentChoiceIndex = selectedIndex !== undefined ? selectedIndex : (q.correctAnswer === 0 ? 1 : 0);
        const newWrong: StudentWrongAnswer = {
          id: `wa-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          questionId: q.id,
          questionTitle: q.title,
          area: q.area,
          topic: q.topic,
          bnccSkill: q.bnccSkill,
          gradeLevel: q.gradeLevel,
          studentChoice: studentChoiceIndex,
          correctAnswer: q.correctAnswer,
          options: q.options,
          explanation: q.explanation,
          dateAnswered: todayStr,
          flashcardGenerated: false,
        };
        setWrongQuestions((prev) => [newWrong, ...prev.filter((w) => w.questionId !== questionId)]);
      }
    }

    setStats((prev) => {
      const updatedByArea = prev.byArea.map((item) => {
        if (item.area === area) {
          return {
            ...item,
            answered: item.answered + 1,
            correct: isCorrect ? item.correct + 1 : item.correct,
          };
        }
        return item;
      });

      return {
        ...prev,
        totalAnswered: prev.totalAnswered + 1,
        totalCorrect: isCorrect ? prev.totalCorrect + 1 : prev.totalCorrect,
        timeSpentMinutes: prev.timeSpentMinutes + Math.round(timeSec / 60 || 1),
        byArea: updatedByArea,
      };
    });
  };

  // --- FLASHCARDS AUTOMÁTICOS & REPETIÇÃO ESPAÇADA (LEITNER / SRS) ---
  const todayStr = new Date().toISOString().split('T')[0];
  const pendingFlashcardsCount = flashcards.filter((card) => card.nextReviewDate <= todayStr).length;

  const addWrongAnswer = (wrong: StudentWrongAnswer) => {
    setWrongQuestions((prev) => [wrong, ...prev]);
  };

  const addFlashcards = (newCards: AutomaticFlashcard[]) => {
    setFlashcards((prev) => [...newCards, ...prev]);
  };

  const deleteFlashcard = (cardId: string) => {
    setFlashcards((prev) => prev.filter((fc) => fc.id !== cardId));
  };

  const resetFlashcardsToDefault = () => {
    setFlashcards(INITIAL_FLASHCARDS);
    setWrongQuestions(INITIAL_WRONG_ANSWERS);
  };

  const updateFlashcardReview = (
    cardId: string,
    performance: 'errei' | 'dificil' | 'bom' | 'facil'
  ) => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];

    setFlashcards((prev) =>
      prev.map((card) => {
        if (card.id !== cardId) return card;

        let nextBox: SpacedRepetitionLevel = card.boxLevel;
        let intervalDays = 1;
        let newSuccesses = card.consecutiveSuccesses;
        let newStatus: 'para_revisar' | 'aprendendo' | 'dominado' = card.status;

        if (performance === 'errei') {
          // Errei -> Volta para Caixa 1 (Revisar em 1 dia / hoje)
          nextBox = 1;
          intervalDays = 1;
          newSuccesses = 0;
          newStatus = 'para_revisar';
        } else if (performance === 'dificil') {
          // Difícil -> Mantém na Caixa 1 ou 2, intervalo curto (2 dias)
          nextBox = card.boxLevel === 1 ? 1 : 2;
          intervalDays = 2;
          newStatus = 'aprendendo';
        } else if (performance === 'bom') {
          // Bom -> Avança uma caixa (máx 4)
          nextBox = Math.min(4, card.boxLevel + 1) as SpacedRepetitionLevel;
          newSuccesses += 1;
          if (nextBox === 2) intervalDays = 3;
          else if (nextBox === 3) intervalDays = 7;
          else intervalDays = 14;
          newStatus = nextBox === 4 ? 'dominado' : 'aprendendo';
        } else if (performance === 'facil') {
          // Fácil -> Avança 2 caixas ou consolida na Caixa 4
          nextBox = Math.min(4, card.boxLevel + 2) as SpacedRepetitionLevel;
          newSuccesses += 2;
          if (nextBox <= 2) intervalDays = 3;
          else if (nextBox === 3) intervalDays = 7;
          else intervalDays = 21;
          newStatus = nextBox === 4 ? 'dominado' : 'aprendendo';
        }

        const nextDate = new Date(today.getTime() + intervalDays * 86400000)
          .toISOString()
          .split('T')[0];

        return {
          ...card,
          boxLevel: nextBox,
          intervalDays,
          nextReviewDate: nextDate,
          lastReviewedAt: formattedDate,
          reviewCount: card.reviewCount + 1,
          consecutiveSuccesses: newSuccesses,
          status: newStatus,
        };
      })
    );
  };

  const generateFlashcardForWrongAnswer = async (wrongAnswerId: string): Promise<boolean> => {
    const wrong = wrongQuestions.find((w) => w.id === wrongAnswerId);
    if (!wrong) return false;

    try {
      const generated = await generateFlashcardsAPI([
        {
          id: wrong.id,
          questionTitle: wrong.questionTitle,
          topic: wrong.topic,
          area: wrong.area,
          studentChoiceText: wrong.options[wrong.studentChoice] || 'Opção incorreta',
          correctAnswerText: wrong.options[wrong.correctAnswer] || 'Opção correta',
          explanation: wrong.explanation,
        },
      ]);

      if (generated && generated.length > 0) {
        const item = generated[0];
        const today = new Date().toISOString().split('T')[0];
        const newCard: AutomaticFlashcard = {
          id: `fc-ai-${Date.now()}`,
          questionId: wrong.questionId,
          sourceQuestionTitle: wrong.questionTitle.slice(0, 140) + '...',
          area: wrong.area,
          topic: wrong.topic,
          keyConcept: item.keyConcept || wrong.topic,
          front: item.front,
          back: item.back,
          mnemonicTip: item.mnemonicTip,
          whyItWasWrong: item.whyItWasWrong,
          boxLevel: 1,
          intervalDays: 1,
          nextReviewDate: today,
          reviewCount: 0,
          consecutiveSuccesses: 0,
          status: 'para_revisar',
          createdAt: today,
        };

        setFlashcards((prev) => [newCard, ...prev]);
        setWrongQuestions((prev) =>
          prev.map((w) => (w.id === wrongAnswerId ? { ...w, flashcardGenerated: true } : w))
        );
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erro ao gerar flashcard:', err);
      return false;
    }
  };

  const generateAllPendingFlashcards = async (): Promise<number> => {
    const pendingWrongs = wrongQuestions.filter((w) => !w.flashcardGenerated);
    if (pendingWrongs.length === 0) return 0;

    try {
      const payload = pendingWrongs.map((w) => ({
        id: w.id,
        questionTitle: w.questionTitle,
        topic: w.topic,
        area: w.area,
        studentChoiceText: w.options[w.studentChoice] || 'Opção incorreta',
        correctAnswerText: w.options[w.correctAnswer] || 'Opção correta',
        explanation: w.explanation,
      }));

      const results = await generateFlashcardsAPI(payload);
      const today = new Date().toISOString().split('T')[0];

      const newCards: AutomaticFlashcard[] = results.map((item, idx) => {
        const corresponding = pendingWrongs[idx] || pendingWrongs[0];
        return {
          id: `fc-ai-batch-${Date.now()}-${idx}`,
          questionId: corresponding.questionId,
          sourceQuestionTitle: corresponding.questionTitle.slice(0, 140) + '...',
          area: corresponding.area,
          topic: corresponding.topic,
          keyConcept: item.keyConcept || corresponding.topic,
          front: item.front,
          back: item.back,
          mnemonicTip: item.mnemonicTip,
          whyItWasWrong: item.whyItWasWrong,
          boxLevel: 1,
          intervalDays: 1,
          nextReviewDate: today,
          reviewCount: 0,
          consecutiveSuccesses: 0,
          status: 'para_revisar',
          createdAt: today,
        };
      });

      setFlashcards((prev) => [...newCards, ...prev]);
      setWrongQuestions((prev) =>
        prev.map((w) => ({ ...w, flashcardGenerated: true }))
      );
      return newCards.length;
    } catch (err) {
      console.error('Erro no lote de flashcards:', err);
      return 0;
    }
  };

  // --- TRILHA DE APRENDIZADO GAMIFICADA (MARCOS & PROGRESSÃO) ---
  const completeLearningNode = (nodeId: string, accuracy: number = 92) => {
    const today = new Date().toISOString().split('T')[0];
    let gainedXp = 150;

    setLearningPathNodes((prev) => {
      const target = prev.find((n) => n.id === nodeId);
      if (target) gainedXp = target.xpReward || 150;

      return prev.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            status: 'conquistado',
            progressPercent: 100,
            accuracyPercent: accuracy,
            completedQuestions: node.totalQuestions,
            completedAt: today,
          };
        }
        if (node.prerequisiteNodeId === nodeId && node.status === 'bloqueado') {
          return {
            ...node,
            status: 'em_andamento',
            unlockedAt: today,
          };
        }
        return node;
      });
    });

    setLearningPathProgress((prev) => {
      const newXp = prev.totalXp + gainedXp;
      const newLevel = Math.floor(newXp / 500) + 1;
      const titles = [
        'Calouro do ENEM',
        'Aprendiz Dedicado',
        'Desbravador dos Conteúdos',
        'Explorador Audaz do ENEM',
        'Estrategista de Provas',
        'Mestre do Conhecimento ENEM',
        'Lenda da Aprovação Federal'
      ];
      const levelTitle = titles[Math.min(titles.length - 1, newLevel - 1)];

      return {
        ...prev,
        totalXp: newXp,
        currentLevel: newLevel,
        levelTitle,
        conqueredMilestonesCount: prev.conqueredMilestonesCount + 1,
      };
    });
  };

  const updateNodeProgress = (nodeId: string, completedDelta: number) => {
    setLearningPathNodes((prev) =>
      prev.map((node) => {
        if (node.id !== nodeId) return node;
        const newCompleted = Math.min(node.totalQuestions, node.completedQuestions + completedDelta);
        const percent = Math.round((newCompleted / node.totalQuestions) * 100);
        return {
          ...node,
          completedQuestions: newCompleted,
          progressPercent: percent,
          status: percent >= 100 ? 'conquistado' : 'em_andamento',
        };
      })
    );
  };

  const resetLearningPath = () => {
    setLearningPathNodes(INITIAL_LEARNING_PATH_NODES);
    setLearningPathProgress(INITIAL_LEARNING_PATH_PROGRESS);
  };

  const incrementEssayCount = () => {
    setStats((prev) => ({
      ...prev,
      essaysSubmitted: prev.essaysSubmitted + 1,
    }));
  };

  const addQuestion = (newQ: Question) => {
    setQuestions((prev) => [newQ, ...prev]);
  };

  const addSimulationAttempt = (attempt: SimulationAttempt) => {
    setSimulationHistory((prev) => [attempt, ...prev]);
  };

  const deleteSimulationAttempt = (id: string) => {
    setSimulationHistory((prev) => prev.filter((s) => s.id !== id));
  };

  const resetSimulationHistory = () => {
    setSimulationHistory(MOCK_SIMULATION_HISTORY);
  };

  const addEssaySubmission = (submission: EssaySubmissionHistoryItem) => {
    setEssayHistory((prev) => [...prev, submission]);
  };

  const resetEssayHistory = () => {
    setEssayHistory(INITIAL_ESSAY_HISTORY);
    try {
      localStorage.removeItem('enem_inclusivo_essay_history');
    } catch (e) {
      console.warn('Error clearing essay history:', e);
    }
  };

  const addSchool = (newSchool: SchoolData) => {
    setSchools((prev) => [newSchool, ...prev]);
  };

  const addPartner = (newPartner: EducationalPartner) => {
    setPartners((prev) => [newPartner, ...prev]);
  };

  // --- GLOSSÁRIO INTERATIVO ENEM (MÉTODOS & CONTROLE) ---
  const toggleBookmarkTerm = (termId: string) => {
    setBookmarkedTermIds((prev) =>
      prev.includes(termId) ? prev.filter((id) => id !== termId) : [...prev, termId]
    );
  };

  const requestAiTermExplanation = async (
    term: string,
    category?: string,
    contextArea?: string
  ): Promise<GlossaryTerm> => {
    const clean = term.trim().toLowerCase();
    const existing = glossaryTerms.find(
      (t) =>
        t.term.toLowerCase() === clean ||
        (t.acronym && t.acronym.toLowerCase() === clean) ||
        t.term.toLowerCase().startsWith(clean)
    );
    if (existing) {
      return existing;
    }

    const explained = await explainTermAPI(term, category, contextArea);
    const newTerm: GlossaryTerm = {
      id: explained.id || `glo-ai-${Date.now()}`,
      term: explained.term || term,
      acronym: explained.acronym,
      category: (explained.category as any) || 'Metodologia & BNCC',
      simplifiedDefinition: explained.simplifiedDefinition,
      contextualExample: explained.contextualExample,
      enemApplication: explained.enemApplication,
      teaSimplifiedExplanation: explained.teaSimplifiedExplanation,
      mnemonicsOrMemoryHook: explained.mnemonicsOrMemoryHook,
      relatedTerms: explained.relatedTerms || [],
      difficulty: explained.difficulty || 'Intermediário',
      isAiGenerated: true,
      createdAt: new Date().toISOString(),
    };

    setGlossaryTerms((prev) => [newTerm, ...prev]);
    return newTerm;
  };

  const openGlossaryForTerm = (term: string) => {
    setSelectedGlossarySearch(term);
    setStudentActiveTab('glossario');
  };

  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Navegador não possui suporte à síntese de voz.');
      return;
    }

    window.speechSynthesis.cancel();
    if (!text) {
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        activeView,
        setActiveView,
        isLoginModalOpen,
        setIsLoginModalOpen,
        pendingPasswordChangeUser,
        setPendingPasswordChangeUser,
        login,
        changePassword,
        logout,
        usersList,
        isOnboardingOpen,
        setIsOnboardingOpen,
        startOnboarding,
        isStudentRegisterModalOpen,
        setIsStudentRegisterModalOpen,
        registerStudentDirectly,
        role,
        setRole,
        gradeLevel,
        setGradeLevel,
        isPracticingQuestions,
        setIsPracticingQuestions,
        showLeavePracticeModal,
        setShowLeavePracticeModal,
        confirmLeaveIfPracticing,
        studentActiveTab,
        setStudentActiveTab,
        executeLeavePracticeConfirm,
        cancelLeavePractice,
        goToUserHome,
        // Glossário Interativo Pedagógico do ENEM
        glossaryTerms,
        bookmarkedTermIds,
        toggleBookmarkTerm,
        requestAiTermExplanation,
        selectedGlossarySearch,
        setSelectedGlossarySearch,
        openGlossaryForTerm,
        // Trilha de Aprendizado Gamificada
        learningPathNodes,
        learningPathProgress,
        completeLearningNode,
        updateNodeProgress,
        resetLearningPath,
        // Flashcards Automáticos com IA & Revisão Espaçada
        wrongQuestions,
        flashcards,
        pendingFlashcardsCount,
        addWrongAnswer,
        addFlashcards,
        updateFlashcardReview,
        generateFlashcardForWrongAnswer,
        generateAllPendingFlashcards,
        deleteFlashcard,
        resetFlashcardsToDefault,
        // Registration Database & Edit Unlocking (Módulo 1.3)
        registrationRecords,
        capacityCount,
        simulateCapacity,
        internalAlerts,
        dismissAlert,
        unlockEditForRecord,
        saveEditedRecord,
        updateFreeFieldsDirectly,
        addRegistrationRecord,
        blockUserAccess,
        unblockUserAccess,
        resetUserPasswordManual,
        processTerminalCommand,
        isRegistrationHubOpen,
        setIsRegistrationHubOpen,
        accessibility,
        updateAccessibility,
        stats,
        recordQuestionAnswer,
        incrementEssayCount,
        simulationHistory,
        addSimulationAttempt,
        deleteSimulationAttempt,
        resetSimulationHistory,
        essayHistory,
        addEssaySubmission,
        resetEssayHistory,
        questions,
        addQuestion,
        essayThemes,
        classGroups,
        schools,
        addSchool,
        partners,
        addPartner,
        isSpeaking,
        speakText,
        stopSpeaking,
        // Rede Integrada & Identificação Universal
        relationships,
        auditLogs,
        isUniversalRegisterModalOpen,
        setIsUniversalRegisterModalOpen,
        universalRegisterRole,
        setUniversalRegisterRole,
        openUniversalRegisterForRole,
        lookupUniversalUser,
        requestRelationship,
        approveRelationship,
        rejectRelationship,
        revokeRelationship,
        updateRelationshipPermissions,
        registerUniversalUser,
        getAuthorizedStudentsForTeacher,
        getAuthorizedTeachersForSchool,
        getAuthorizedSchoolsForSecretariat,
        getAggregatedSchoolMetrics,
        getAggregatedSecretariatMetrics,
        getStudentRelationships,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
