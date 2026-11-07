import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { GradeLevel, LearningProfileType, UserRole } from '../../types';
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
} from '../../utils/documentValidation';
import {
  GraduationCap,
  Users,
  School,
  Landmark,
  X,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Lock,
  Mail,
  Phone,
  User,
  Building,
  KeyRound,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  Info,
  Copy,
  Check,
} from 'lucide-react';

export const UniversalRegistrationModal: React.FC = () => {
  const {
    isUniversalRegisterModalOpen,
    setIsUniversalRegisterModalOpen,
    universalRegisterRole,
    setUniversalRegisterRole,
    setIsLoginModalOpen,
    registerUniversalUser,
  } = useApp();

  const [activeRole, setActiveRole] = useState<UserRole>(universalRegisterRole || 'aluno');

  // Keep in sync when parent opens for specific role
  useEffect(() => {
    if (universalRegisterRole) {
      setActiveRole(universalRegisterRole);
    }
  }, [universalRegisterRole]);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [documentInput, setDocumentInput] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Role-Specific Fields
  const [gradeLevel, setGradeLevel] = useState<GradeLevel>('3º ano');
  const [learningProfile, setLearningProfile] = useState<LearningProfileType>('Padrão');
  const [dataSharing, setDataSharing] = useState(true);
  const [teachingSubject, setTeachingSubject] = useState('Ciências da Natureza & Física');
  const [assignedClass, setAssignedClass] = useState('3º Ano A - Matutino');
  const [inepCode, setInepCode] = useState('');
  const [networkCode, setNetworkCode] = useState('SEDUC-REGIONAL');
  const [organizationName, setOrganizationName] = useState('');
  const [responsibleLeader, setResponsibleLeader] = useState('');

  // Status & Feedback
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    name: string;
    role: UserRole;
    technicalId: string;
    documentFormatted: string;
    documentMasked: string;
    username: string;
  } | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  if (!isUniversalRegisterModalOpen) return null;

  const handleClose = () => {
    setIsUniversalRegisterModalOpen(false);
    setError(null);
    setSuccessData(null);
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const clean = normalizeDocument(raw);

    if (activeRole === 'aluno' || activeRole === 'professor') {
      // CPF: máx 11 dígitos
      const truncated = clean.slice(0, 11);
      setDocumentInput(truncated.length === 11 ? formatCPF(truncated) : truncated);
    } else {
      // CNPJ: máx 14 dígitos
      const truncated = clean.slice(0, 14);
      setDocumentInput(truncated.length === 14 ? formatCNPJ(truncated) : truncated);
    }
    setError(null);
  };

  const docValidation = validateDocumentForRole(documentInput, activeRole);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 1. Validações Gerais
    if (!fullName.trim()) {
      setError('Por favor, informe o nome completo ou razão social.');
      return;
    }

    if (!docValidation.valid) {
      setError(docValidation.error || 'Documento inválido.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setError('Informe um endereço de e-mail institucional ou de contato válido.');
      return;
    }

    if (!username.trim() || username.length < 3) {
      setError('O nome de usuário deve conter pelo menos 3 caracteres.');
      return;
    }

    if (!password || password.length < 6) {
      setError('A senha deve conter no mínimo 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('A confirmação da senha não confere.');
      return;
    }

    if (!termsAccepted) {
      setError('É obrigatório aceitar os Termos de Uso e Política de Privacidade (LGPD) para prosseguir.');
      return;
    }

    // 2. Executar Cadastro Universal
    const res = registerUniversalUser({
      fullName: fullName.trim(),
      role: activeRole,
      documentNumber: docValidation.normalized,
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      username: username.trim().toLowerCase(),
      password,
      gradeLevel: activeRole === 'aluno' ? gradeLevel : undefined,
      organization: organizationName.trim() || (activeRole === 'aluno' ? 'Estudante Independente' : undefined),
      assignedClasses: activeRole === 'professor' ? [assignedClass] : undefined,
      teachingSubjects: activeRole === 'professor' ? [teachingSubject] : undefined,
      inepCode: activeRole === 'escola' ? inepCode.trim() : undefined,
      networkCode: activeRole === 'secretaria_educacao' ? networkCode.trim() : undefined,
      learningProfile: activeRole === 'aluno' ? learningProfile : undefined,
      dataSharing: activeRole === 'aluno' ? dataSharing : true,
      termsAccepted: true,
    });

    if (res.success && res.user) {
      setSuccessData({
        name: res.user.name,
        role: res.user.role,
        technicalId: res.user.technicalId,
        documentFormatted: res.user.formattedDocument,
        documentMasked: res.user.maskedDocument || maskCPF(res.user.documentNumber),
        username: res.user.username,
      });
    } else {
      setError(res.error || 'Não foi possível concluir o cadastro universal.');
    }
  };

  const copyTechnicalId = () => {
    if (successData?.technicalId) {
      navigator.clipboard.writeText(successData.technicalId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleGoToLogin = () => {
    handleClose();
    setIsLoginModalOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-scaleUp">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-950 via-indigo-900 to-slate-900 text-white p-6 relative">
          <button
            onClick={handleClose}
            className="absolute top-5 right-5 text-indigo-300 hover:text-white p-1 rounded-xl hover:bg-white/10 transition"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/50 backdrop-blur-md flex items-center justify-center border border-indigo-400/30 shadow-inner">
              <ShieldCheck className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 block">
                Rede Integrada • Identificação Universal Oficial
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                Cadastro Único na Plataforma ENEM
              </h2>
            </div>
          </div>
        </div>

        {/* Success View */}
        {successData ? (
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase tracking-wide">
                Cadastro Concluído com Sucesso
              </span>
              <h3 className="text-2xl font-extrabold text-slate-900">
                Bem-vindo(a), {successData.name}!
              </h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Seu cadastro oficial na <strong>Rede Integrada de Acompanhamento Educacional</strong> foi registrado de forma segura.
              </p>
            </div>

            {/* Universal Identification Card */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-left max-w-md mx-auto space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-xs font-bold text-slate-500 uppercase">Categoria:</span>
                <span className="text-xs font-extrabold text-indigo-700 uppercase">
                  {successData.role}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-xs font-bold text-slate-500">Documento Oficial:</span>
                <span className="text-xs font-bold text-slate-900 font-mono">
                  {successData.documentFormatted}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-xs font-bold text-slate-500">Identificador Técnico Único:</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200 font-mono">
                    {successData.technicalId}
                  </span>
                  <button
                    onClick={copyTechnicalId}
                    className="p-1 rounded hover:bg-slate-200 text-slate-500"
                    title="Copiar identificador técnico"
                  >
                    {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Nome de Usuário (Login):</span>
                <span className="text-xs font-bold text-slate-900 font-mono">
                  @{successData.username}
                </span>
              </div>
            </div>

            <div className="text-xs text-slate-500 bg-amber-50 p-3.5 rounded-xl border border-amber-200 text-left max-w-md mx-auto">
              💡 <strong>Como funciona o relacionamento posterior:</strong> Você poderá compartilhar seu documento ({successData.documentMasked}) ou identificador técnico com professores, escolas ou secretarias para criar vínculos de acompanhamento a qualquer momento sem perder nenhum dado!
            </div>

            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={handleGoToLogin}
                className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm transition shadow-md flex items-center gap-2"
              >
                <span>Fazer Login Agora</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Registration Form */
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto">
            {/* 1. Escolha da Categoria de Usuário */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wide block">
                1. Selecione seu Perfil de Ingresso na Rede:
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'aluno', label: 'Aluno', docType: 'CPF', icon: <GraduationCap className="w-4 h-4" /> },
                  { id: 'professor', label: 'Professor', docType: 'CPF', icon: <Users className="w-4 h-4" /> },
                  { id: 'escola', label: 'Escola', docType: 'CNPJ', icon: <School className="w-4 h-4" /> },
                  { id: 'secretaria_educacao', label: 'Secretaria', docType: 'CNPJ', icon: <Landmark className="w-4 h-4" /> },
                ].map((item) => {
                  const isSelected = activeRole === item.id;
                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => {
                        setActiveRole(item.id as UserRole);
                        setUniversalRegisterRole(item.id as UserRole);
                        setDocumentInput('');
                        setError(null);
                      }}
                      className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition text-left cursor-pointer ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                      }`}
                    >
                      <span className={isSelected ? 'text-indigo-600' : 'text-slate-500'}>
                        {item.icon}
                      </span>
                      <span className="font-extrabold text-xs">{item.label}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        Exige {item.docType}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">{error}</div>
              </div>
            )}

            {/* 2. Documento Oficial Obrigatório (CPF ou CNPJ) */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-slate-800">
                  {activeRole === 'aluno' || activeRole === 'professor' ? 'CPF do Titular *' : 'CNPJ da Instituição *'}
                </label>
                <span className="text-[10px] text-slate-500 font-semibold">
                  {activeRole === 'aluno' || activeRole === 'professor' ? 'Identificador Oficial Aluno/Docente' : 'Identificador Institucional'}
                </span>
              </div>

              <div className="relative">
                <input
                  type="text"
                  required
                  value={documentInput}
                  onChange={handleDocumentChange}
                  placeholder={activeRole === 'aluno' || activeRole === 'professor' ? '000.000.000-00' : '00.000.000/0000-00'}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm font-mono focus:outline-hidden ${
                    documentInput.length > 0
                      ? docValidation.valid
                        ? 'border-emerald-500 ring-2 ring-emerald-100 bg-emerald-50/20'
                        : 'border-rose-400 bg-rose-50/20'
                      : 'border-slate-200 bg-white'
                  }`}
                />
                {documentInput.length > 0 && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {docValidation.valid ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        {docValidation.documentType} Válido
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                        Dígitos Incompletos
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="text-[11px] text-slate-500 flex items-center justify-between">
                <span>O documento é único por titular e protegido conforme a LGPD.</span>
                {docValidation.valid && (
                  <span className="text-slate-600 font-mono">
                    Exibição mascarada: <strong>{docValidation.masked}</strong>
                  </span>
                )}
              </div>
            </div>

            {/* 3. Identificação Pessoal / Institucional */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-slate-800">
                  {activeRole === 'aluno' || activeRole === 'professor'
                    ? 'Nome Completo do Titular *'
                    : 'Razão Social ou Nome Institucional *'}
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={
                    activeRole === 'aluno'
                      ? 'Ex: Gabriel Souza Alencar'
                      : activeRole === 'professor'
                      ? 'Ex: Prof. André Guimarães da Silva'
                      : activeRole === 'escola'
                      ? 'Ex: E.E. Dr. Salvador Toledo Piza'
                      : 'Ex: Secretaria Municipal de Educação'
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">E-mail Institucional ou Pessoal *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@educacao.gov.br"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">Telefone / WhatsApp</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 98765-4321"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* 4. Campos Específicos por Perfil */}
            {activeRole === 'aluno' && (
              <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
                  <GraduationCap className="w-4 h-4 text-indigo-600" />
                  <span>Configurações Acadêmicas do Aluno</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Série / Etapa ENEM:</label>
                    <select
                      value={gradeLevel}
                      onChange={(e) => setGradeLevel(e.target.value as GradeLevel)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                    >
                      <option value="1º ano">1º ano do Ensino Médio</option>
                      <option value="2º ano">2º ano do Ensino Médio</option>
                      <option value="3º ano">3º ano do Ensino Médio (Foco Total ENEM)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Perfil de Aprendizagem:</label>
                    <select
                      value={learningProfile}
                      onChange={(e) => setLearningProfile(e.target.value as LearningProfileType)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                    >
                      <option value="Padrão">Padrão</option>
                      <option value="TDAH">TDAH (Micro-ciclos 15 min & Anti-impulso)</option>
                      <option value="TEA">TEA (Modo Foco & Linguagem Direta)</option>
                      <option value="Dislexia">Dislexia (Fonte Lexend & Filtros Cromáticos)</option>
                      <option value="Combinado">Neurodiversidade Combinada</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeRole === 'professor' && (
              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span>Atuação Docente</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Área / Disciplina Principal:</label>
                    <input
                      type="text"
                      value={teachingSubject}
                      onChange={(e) => setTeachingSubject(e.target.value)}
                      placeholder="Ex: Física, Matemática, Redação"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Turma Inicial de Atuação:</label>
                    <input
                      type="text"
                      value={assignedClass}
                      onChange={(e) => setAssignedClass(e.target.value)}
                      placeholder="Ex: 3º Ano A - Matutino"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeRole === 'escola' && (
              <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-100 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-sky-900">
                  <School className="w-4 h-4 text-sky-600" />
                  <span>Dados da Unidade Escolar</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Código INEP (MEC):</label>
                    <input
                      type="text"
                      value={inepCode}
                      onChange={(e) => setInepCode(e.target.value)}
                      placeholder="Ex: 35012345"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Nome Fantasia / Sigla:</label>
                    <input
                      type="text"
                      value={organizationName}
                      onChange={(e) => setOrganizationName(e.target.value)}
                      placeholder="Ex: E.E. Toledo Piza"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeRole === 'secretaria_educacao' && (
              <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900">
                  <Landmark className="w-4 h-4 text-purple-600" />
                  <span>Jurisdição da Secretaria</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Ente Federativo / Rede:</label>
                    <input
                      type="text"
                      value={networkCode}
                      onChange={(e) => setNetworkCode(e.target.value)}
                      placeholder="Ex: SEDUC-SP ou Município de Campinas"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Diretoria Regional / Gestor:</label>
                    <input
                      type="text"
                      value={responsibleLeader}
                      onChange={(e) => setResponsibleLeader(e.target.value)}
                      placeholder="Ex: Diretoria de Ensino Centro"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 5. Credenciais de Acesso (Login e Senha - CPF/CNPJ nunca é a senha!) */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-slate-800 block">
                  5. Credenciais de Acesso (Login & Senha):
                </label>
                <span className="text-[10px] text-indigo-600 font-bold">
                  🛡️ CPF/CNPJ não é utilizado como senha
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Nome de Usuário (Login) *</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="ex: gabriel.souza"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Senha Pessoal *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs pr-8 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Confirmar Senha *</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a senha"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* 6. Termos de Uso e LGPD */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <input
                type="checkbox"
                id="terms-check"
                required
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <label htmlFor="terms-check" className="text-[11px] text-slate-600 leading-relaxed cursor-pointer">
                Declaro a veracidade dos dados informados e aceito os <strong>Termos de Uso</strong> e a <strong>Política de Privacidade</strong> em conformidade com a <strong>LGPD (Lei nº 13.709/2018)</strong>. Compreendo que relacionamentos e compartilhamento de indicadores educacionais com professores, escolas ou secretarias exigirão autorização e consentimento prévios.
              </label>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleGoToLogin}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
              >
                Já possui cadastro? Entrar com Login e Senha
              </button>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition w-full sm:w-auto"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs transition shadow-md flex items-center justify-center gap-2 w-full sm:w-auto cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-300" />
                  <span>Concluir Cadastro Universal</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
