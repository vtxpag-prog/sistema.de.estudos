import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { isValidCPF, formatCPF, normalizeDocument } from '../../utils/documentValidation';
import {
  Building2,
  Users,
  UserPlus,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Search,
  Copy,
  Check,
  Eye,
  EyeOff,
  Landmark,
  TrendingUp,
  AlertTriangle,
  X,
  Target,
  FileText,
  AlertCircle,
  GraduationCap
} from 'lucide-react';

export const SchoolRelationshipsModule: React.FC = () => {
  const {
    currentUser,
    relationships,
    requestRelationship,
    approveRelationship,
    rejectRelationship,
    revokeRelationship,
    lookupUniversalUser,
    getAuthorizedTeachersForSchool,
    getAggregatedSchoolMetrics,
  } = useApp();

  const [copiedDoc, setCopiedDoc] = useState<boolean>(false);
  const [showFullCnpj, setShowFullCnpj] = useState<boolean>(false);
  const [showAddTeacherModal, setShowAddTeacherModal] = useState<boolean>(false);

  // Estados de busca de professor
  const [searchDoc, setSearchDoc] = useState<string>('');
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchedUser, setSearchedUser] = useState<{
    id: string;
    technicalId: string;
    maskedName: string;
    maskedDocument: string;
    role: string;
  } | null>(null);
  const [assignedSubject, setAssignedSubject] = useState<string>('Biologia e Ciências da Natureza');
  const [assignedClass, setAssignedClass] = useState<string>('3º Ano A e 3º Ano B');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  if (!currentUser) return null;

  // Professores autorizados da escola
  const authorizedTeachers = getAuthorizedTeachersForSchool(currentUser.id);

  // Métricas consolidadas da escola (Single Source of Truth)
  const schoolMetrics = getAggregatedSchoolMetrics(currentUser.id);

  // Relacionamentos da escola
  const schoolRels = relationships.filter(
    (rel) => rel.sourceUserId === currentUser.id || rel.targetUserId === currentUser.id
  );

  // Vínculos com Professores
  const teacherRels = schoolRels.filter((rel) => rel.relationshipType === 'PROFESSOR_ESCOLA');
  const activeTeacherRels = teacherRels.filter((rel) => rel.status === 'aprovado');
  const pendingTeacherRels = teacherRels.filter((rel) => rel.status === 'pendente');

  // Vínculo com a Secretaria
  const secretariatRel = schoolRels.find((rel) => rel.relationshipType === 'ESCOLA_SECRETARIA');

  const handleCopyDoc = () => {
    navigator.clipboard?.writeText(currentUser.documentNumber);
    setCopiedDoc(true);
    setTimeout(() => setCopiedDoc(false), 2500);
  };

  const handleSearchTeacher = async () => {
    setSearchError(null);
    setSearchedUser(null);

    const clean = normalizeDocument(searchDoc);
    if (!clean && !searchDoc.startsWith('USR-')) {
      setSearchError('Por favor, informe o CPF do professor ou ID técnico.');
      return;
    }

    if (clean.length > 0 && clean.length !== 11 && !searchDoc.startsWith('USR-')) {
      setSearchError('O CPF do professor deve conter 11 dígitos.');
      return;
    }

    if (clean.length === 11 && !isValidCPF(clean)) {
      setSearchError('CPF inválido pelo algoritmo de dígitos verificadores oficiais.');
      return;
    }

    const found = await lookupUniversalUser(searchDoc);
    if (!found) {
      setSearchError('Nenhum professor cadastrado com este documento. O professor precisa criar o cadastro no portal primeiro.');
      return;
    }

    if (found.role !== 'professor') {
      setSearchError(`O documento informado pertence a um usuário do tipo "${found.role}", não a um professor.`);
      return;
    }

    // Verificar se já existe vínculo
    const alreadyLinked = schoolRels.find(
      (r) =>
        r.relationshipType === 'PROFESSOR_ESCOLA' &&
        (r.targetUserId === found.id || r.sourceUserId === found.id) &&
        (r.status === 'aprovado' || r.status === 'pendente')
    );

    if (alreadyLinked) {
      setSearchError(
        alreadyLinked.status === 'aprovado'
          ? 'Este professor já faz parte do corpo docente da escola!'
          : 'Já existe uma solicitação pendente de aprovação com este professor.'
      );
      return;
    }

    setSearchedUser(found);
  };

  const handleSendTeacherRequest = async () => {
    if (!searchedUser) return;
    setIsSubmitting(true);

    try {
      const res = await requestRelationship(
        searchedUser.id,
        'PROFESSOR_ESCOLA',
        {
          viewPerformance: true,
          viewSimulations: true,
          viewEssays: true,
          viewAttendance: true,
          viewDifficulties: true,
          viewDetailedReports: true,
        },
        `${assignedSubject} • ${assignedClass}`
      );

      if (!res.success) {
        setSearchError(res.error || 'Erro ao enviar solicitação.');
        return;
      }

      setSuccessMessage(
        `Solicitação institucional enviada com sucesso para ${searchedUser.maskedName}! O professor receberá o convite no painel dele para confirmação.`
      );
      setShowAddTeacherModal(false);
      setSearchDoc('');
      setSearchedUser(null);
      setTimeout(() => setSuccessMessage(null), 6000);
    } catch (err: any) {
      setSearchError(err?.message || 'Erro ao enviar solicitação.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproveSecretariat = (relationshipId: string) => {
    approveRelationship(relationshipId);
    setSuccessMessage('Vínculo com a Secretaria de Educação APROVADO! Indicadores consolidados da unidade agora estão integrados à rede.');
    setTimeout(() => setSuccessMessage(null), 6000);
  };

  const handleRejectSecretariat = (relationshipId: string) => {
    rejectRelationship(relationshipId);
    setSuccessMessage('Solicitação da Secretaria recusada. Seus dados institucionais permanecem restritos à escola.');
    setTimeout(() => setSuccessMessage(null), 6000);
  };

  const handleRevoke = (relationshipId: string) => {
    revokeRelationship(relationshipId, 'Vínculo encerrado pela direção escolar no painel institucional.');
    setRevokingId(null);
    setSuccessMessage('Vínculo revogado com sucesso. Acesso encerrado de imediato.');
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner da Instituição com ID Universal */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                <Building2 className="w-5 h-5" />
              </span>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                Rede Integrada ENEM • Gestão Escolar Institucional
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Identificação da Escola & Rede Docente
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
              Vincule professores pelo CPF oficial para acompanhar os indicadores consolidados das turmas e autorize o compartilhamento seguro de médias com a Secretaria de Educação.
            </p>
          </div>

          <button
            onClick={() => {
              setShowAddTeacherModal(true);
              setSearchError(null);
              setSearchedUser(null);
              setSearchDoc('');
            }}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm cursor-pointer self-start md:self-auto shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Vincular Novo Professor</span>
          </button>
        </div>

        {/* Feedback visual */}
        {successMessage && (
          <div className="mt-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm flex items-center gap-3 animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Cartão de Identificador Universal da Escola (CNPJ) */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-6 rounded-3xl bg-linear-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-md relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div>
                <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider block">
                  Identificador Oficial da Escola (CNPJ)
                </span>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-2xl sm:text-3xl font-mono font-extrabold tracking-wider">
                    {showFullCnpj ? currentUser.formattedDocument : currentUser.maskedDocument}
                  </span>
                  <button
                    onClick={() => setShowFullCnpj((prev) => !prev)}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 transition cursor-pointer"
                    title={showFullCnpj ? 'Ocultar dígitos centrais' : 'Exibir CNPJ completo'}
                  >
                    {showFullCnpj ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                onClick={handleCopyDoc}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white text-indigo-950 hover:bg-indigo-50 text-xs font-bold transition shadow-xs cursor-pointer self-start sm:self-auto"
              >
                {copiedDoc ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedDoc ? 'CNPJ Copiado!' : 'Copiar CNPJ Oficial'}</span>
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">ID Técnico Institucional:</span>
                <span className="font-mono font-semibold text-indigo-200">
                  {currentUser.technicalId || 'INST-ESC-0001'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Unidade Escolar:</span>
                <span className="font-semibold text-white">{currentUser.name}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/10 flex items-start gap-2.5 text-[11px] text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                Compartilhe este CNPJ com a Secretaria de Educação para solicitação de vínculo à rede pública ou regional de ensino.
              </span>
            </div>
          </div>

          {/* Vínculo com a Secretaria de Educação */}
          <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700">Secretaria de Educação:</span>
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                  secretariatRel?.status === 'aprovado'
                    ? 'bg-emerald-100 text-emerald-800'
                    : secretariatRel?.status === 'pendente'
                    ? 'bg-amber-100 text-amber-900'
                    : 'bg-slate-200 text-slate-700'
                }`}>
                  {secretariatRel?.status === 'aprovado'
                    ? 'Vinculada'
                    : secretariatRel?.status === 'pendente'
                    ? 'Pendente de Resposta'
                    : 'Não Vinculada'}
                </span>
              </div>

              <div className="flex items-start gap-3 mt-2">
                <div className="p-2 rounded-xl bg-purple-100 text-purple-700 shrink-0">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    {secretariatRel?.sourceName || 'Secretaria Estadual de Educação'}
                  </h4>
                  <span className="text-[11px] text-slate-500 block">
                    CNPJ: 46.384.111/0002-20
                  </span>
                </div>
              </div>
            </div>

            {secretariatRel?.status === 'pendente' && secretariatRel.targetUserId === currentUser.id ? (
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <span className="text-[11px] font-semibold text-amber-900 block">
                  A Secretaria solicitou vínculo com sua unidade. Autorizar?
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRejectSecretariat(secretariatRel.id)}
                    className="flex-1 py-1.5 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold hover:bg-rose-100 cursor-pointer"
                  >
                    Recusar
                  </button>
                  <button
                    onClick={() => handleApproveSecretariat(secretariatRel.id)}
                    className="flex-1 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-xs cursor-pointer"
                  >
                    Autorizar
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-white border border-slate-200 text-[11px] text-slate-600">
                Apenas dados estatísticos agregados da escola são disponibilizados para o acompanhamento macropolítico da Secretaria.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Indicadores Consolidados da Escola */}
      {schoolMetrics && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg">
                Indicadores Institucionais Consolidados da Unidade
              </h3>
              <p className="text-xs text-slate-500">
                Métricas calculadas a partir dos {schoolMetrics.totalStudentsAuthorized} alunos autorizados pelos {schoolMetrics.totalTeachersLinked} professores vinculados.
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 self-start sm:self-auto">
              Sincronização em Tempo Real
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/80">
              <span className="text-xs font-bold text-indigo-950 block">Média Geral TRI</span>
              <span className="text-2xl font-extrabold text-indigo-900 block mt-1">
                {schoolMetrics.averageTRI}
              </span>
              <span className="text-[11px] text-indigo-700">Previsão Oficial ENEM</span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80">
              <span className="text-xs font-bold text-emerald-950 block">Simulados Feitos</span>
              <span className="text-2xl font-extrabold text-emerald-900 block mt-1">
                {schoolMetrics.simulationsCompleted}
              </span>
              <span className="text-[11px] text-emerald-700">Participação da Unidade</span>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200/80">
              <span className="text-xs font-bold text-purple-950 block">Média Redação</span>
              <span className="text-2xl font-extrabold text-purple-900 block mt-1">
                {schoolMetrics.averageEssayScore}
              </span>
              <span className="text-[11px] text-purple-700">5 Competências ENEM</span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80">
              <span className="text-xs font-bold text-amber-950 block">Turmas Ativas</span>
              <span className="text-2xl font-extrabold text-amber-900 block mt-1">
                {schoolMetrics.classesCount}
              </span>
              <span className="text-[11px] text-amber-700">Turmas Monitoradas</span>
            </div>
          </div>
        </div>
      )}

      {/* Professores Vinculados */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg">
              Corpo Docente Vinculado ({activeTeacherRels.length})
            </h3>
            <p className="text-xs text-slate-500">
              Professores vinculados à escola cujos alunos integram a base pedagógica da unidade.
            </p>
          </div>
        </div>

        {activeTeacherRels.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-50 border border-dashed border-slate-300 text-center space-y-3">
            <Users className="w-10 h-10 text-slate-400 mx-auto" />
            <h4 className="font-bold text-slate-700 text-sm">Nenhum professor vinculado ainda</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Utilize o botão "Vincular Novo Professor" para convidar docentes pelo CPF.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeTeacherRels.map((rel) => {
              const teacherName = rel.sourceUserId === currentUser.id ? rel.targetName : rel.sourceName;

              return (
                <div
                  key={rel.id}
                  className="p-5 rounded-2xl border border-slate-200 hover:border-indigo-200 bg-white shadow-2xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 font-extrabold flex items-center justify-center shrink-0">
                        {teacherName?.charAt(0) || 'P'}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm">{teacherName}</h4>
                        <span className="text-[11px] font-mono text-slate-500 block">
                          ID: {rel.targetTechnicalId}
                        </span>
                        <span className="text-[11px] font-semibold text-indigo-700 block mt-0.5">
                          {rel.assignedClass || 'Docente Responsável'}
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                      Ativo
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-slate-400 font-mono">
                      Ref: {rel.id}
                    </span>

                    {revokingId === rel.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-rose-700 font-bold">Desvincular?</span>
                        <button
                          onClick={() => handleRevoke(rel.id)}
                          className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold cursor-pointer"
                        >
                          Confirmar
                        </button>
                        <button
                          onClick={() => setRevokingId(null)}
                          className="px-2 py-1 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-semibold cursor-pointer"
                        >
                          Voltar
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setRevokingId(rel.id)}
                        className="text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
                      >
                        Encerrar Vínculo
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Vincular Novo Professor */}
      {showAddTeacherModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 animate-scaleUp space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg">
                    Vincular Professor à Escola
                  </h3>
                  <p className="text-xs text-slate-500">
                    Localize o professor pelo CPF oficial
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddTeacherModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Informe o CPF do Professor ou ID Técnico:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchDoc}
                    onChange={(e) => setSearchDoc(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchTeacher()}
                    placeholder="Ex: 111.444.777-35 ou USR-PRF-0001"
                    className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleSearchTeacher}
                    className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Search className="w-4 h-4" />
                    <span>Buscar</span>
                  </button>
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Dica de teste: o professor padrão possui o CPF <strong>111.444.777-35</strong>.
                </span>
              </div>

              {searchError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{searchError}</span>
                </div>
              )}

              {searchedUser && (
                <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                      Docente Localizado (Protegido por LGPD)
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 text-[10px] font-bold">
                      {searchedUser.role.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-extrabold flex items-center justify-center text-sm">
                      {searchedUser.maskedName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">
                        {searchedUser.maskedName}
                      </h4>
                      <span className="text-[11px] font-mono text-slate-600">
                        {searchedUser.maskedDocument} • {searchedUser.technicalId}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Disciplina / Área:
                      </label>
                      <input
                        type="text"
                        value={assignedSubject}
                        onChange={(e) => setAssignedSubject(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Turmas Atribuídas:
                      </label>
                      <input
                        type="text"
                        value={assignedClass}
                        onChange={(e) => setAssignedClass(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleSendTeacherRequest}
                    className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isSubmitting ? 'Enviando...' : 'Enviar Solicitação de Vínculo Docente'}</span>
                  </button>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowAddTeacherModal(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
