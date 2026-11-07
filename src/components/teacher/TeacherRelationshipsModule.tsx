import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { isValidCPF, formatCPF, maskCPF, normalizeDocument } from '../../utils/documentValidation';
import {
  Users,
  UserPlus,
  ShieldCheck,
  Building2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Search,
  Copy,
  Check,
  Eye,
  EyeOff,
  GraduationCap,
  PenTool,
  TrendingUp,
  X,
  Target,
  FileText,
  AlertCircle
} from 'lucide-react';

export const TeacherRelationshipsModule: React.FC = () => {
  const {
    currentUser,
    relationships,
    requestRelationship,
    revokeRelationship,
    lookupUniversalUser,
    getAuthorizedStudentsForTeacher,
  } = useApp();

  const [copiedDoc, setCopiedDoc] = useState<boolean>(false);
  const [showFullCpf, setShowFullCpf] = useState<boolean>(false);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Estados do formulário de busca e solicitação
  const [searchDoc, setSearchDoc] = useState<string>('');
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchedUser, setSearchedUser] = useState<{
    id: string;
    technicalId: string;
    maskedName: string;
    maskedDocument: string;
    role: string;
  } | null>(null);
  const [selectedClass, setSelectedClass] = useState<string>('Turma 3º Ano A - Matutino');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [requestSuccessMessage, setRequestSuccessMessage] = useState<string | null>(null);
  const [revokingRelId, setRevokingRelId] = useState<string | null>(null);

  if (!currentUser) return null;

  // Alunos autorizados
  const authorizedStudents = getAuthorizedStudentsForTeacher(currentUser.id);

  // Relacionamentos do professor
  const teacherRels = relationships.filter(
    (rel) => rel.sourceUserId === currentUser.id || rel.targetUserId === currentUser.id
  );

  // Solicitações pendentes enviadas a alunos
  const pendingStudentRequests = teacherRels.filter(
    (rel) =>
      rel.relationshipType === 'ALUNO_PROFESSOR' &&
      rel.sourceUserId === currentUser.id &&
      rel.status === 'pendente'
  );

  // Vínculo com escola
  const schoolRelationship = teacherRels.find(
    (rel) => rel.relationshipType === 'PROFESSOR_ESCOLA' && (rel.status === 'aprovado' || rel.status === 'pendente')
  );

  const handleCopyDoc = () => {
    navigator.clipboard?.writeText(currentUser.documentNumber);
    setCopiedDoc(true);
    setTimeout(() => setCopiedDoc(false), 2500);
  };

  const handleSearchStudent = async () => {
    setSearchError(null);
    setSearchedUser(null);

    const clean = normalizeDocument(searchDoc);
    if (!clean && !searchDoc.startsWith('USR-')) {
      setSearchError('Por favor, informe o CPF do aluno ou o ID técnico.');
      return;
    }

    if (clean.length > 0 && clean.length !== 11 && !searchDoc.startsWith('USR-')) {
      setSearchError('O CPF deve conter exatamente 11 dígitos.');
      return;
    }

    if (clean.length === 11 && !isValidCPF(clean)) {
      setSearchError('CPF inválido pelo algoritmo de dígitos verificadores oficiais.');
      return;
    }

    const found = await lookupUniversalUser(searchDoc);
    if (!found) {
      setSearchError(
        'Nenhum estudante cadastrado com este documento. O aluno precisa primeiro criar seu cadastro gratuito no portal.'
      );
      return;
    }

    if (found.role !== 'aluno') {
      setSearchError(`O documento informado pertence a um perfil do tipo "${found.role}", não a um aluno.`);
      return;
    }

    // Verificar se já existe vínculo
    const alreadyLinked = teacherRels.find(
      (r) =>
        r.relationshipType === 'ALUNO_PROFESSOR' &&
        (r.targetUserId === found.id || r.sourceUserId === found.id) &&
        (r.status === 'aprovado' || r.status === 'pendente')
    );

    if (alreadyLinked) {
      setSearchError(
        alreadyLinked.status === 'aprovado'
          ? 'Este aluno já está na sua lista de monitorados!'
          : 'Já existe uma solicitação pendente de aprovação para este aluno.'
      );
      return;
    }

    setSearchedUser(found);
  };

  const handleSendRequest = async () => {
    if (!searchedUser) return;
    setIsSubmitting(true);

    try {
      const res = await requestRelationship(
        searchedUser.id,
        'ALUNO_PROFESSOR',
        {
          viewPerformance: true,
          viewSimulations: true,
          viewEssays: true,
          viewAttendance: true,
          viewDifficulties: true,
          viewDetailedReports: true,
        },
        selectedClass
      );

      if (!res.success) {
        setSearchError(res.error || 'Erro ao enviar solicitação.');
        return;
      }

      setRequestSuccessMessage(
        `Solicitação enviada com sucesso para ${searchedUser.maskedName}! O aluno receberá uma notificação e os indicadores serão liberados após a aprovação dele.`
      );
      setShowAddModal(false);
      setSearchDoc('');
      setSearchedUser(null);
      setTimeout(() => setRequestSuccessMessage(null), 6000);
    } catch (err: any) {
      setSearchError(err?.message || 'Erro ao enviar solicitação.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevoke = (relationshipId: string) => {
    revokeRelationship(relationshipId, 'Vínculo encerrado pelo professor no painel docente.');
    setRevokingRelId(null);
    setRequestSuccessMessage('Vínculo de acompanhamento encerrado com sucesso.');
    setTimeout(() => setRequestSuccessMessage(null), 5000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner Docente com ID Universal */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                Rede Integrada ENEM • Acompanhamento Docente
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Identificação do Professor & Alunos Monitorados
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
              Adicione alunos monitorados através do CPF oficial deles. Os dados acadêmicos são sincronizados em tempo real assim que o estudante autoriza o vínculo.
            </p>
          </div>

          <button
            onClick={() => {
              setShowAddModal(true);
              setSearchError(null);
              setSearchedUser(null);
              setSearchDoc('');
            }}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm cursor-pointer self-start md:self-auto shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Adicionar Aluno Monitorado</span>
          </button>
        </div>

        {/* Feedback visual */}
        {requestSuccessMessage && (
          <div className="mt-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm flex items-center gap-3 animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{requestSuccessMessage}</span>
          </div>
        )}

        {/* Cartão de Identificador Universal do Professor & Vínculo com Escola */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-6 rounded-3xl bg-linear-to-br from-indigo-950 via-slate-900 to-slate-900 text-white shadow-md relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div>
                <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider block">
                  Identificador Oficial do Professor (CPF)
                </span>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-2xl sm:text-3xl font-mono font-extrabold tracking-wider">
                    {showFullCpf ? currentUser.formattedDocument : currentUser.maskedDocument}
                  </span>
                  <button
                    onClick={() => setShowFullCpf((prev) => !prev)}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 transition cursor-pointer"
                    title={showFullCpf ? 'Ocultar dígitos centrais' : 'Exibir CPF completo'}
                  >
                    {showFullCpf ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                onClick={handleCopyDoc}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white text-indigo-950 hover:bg-indigo-50 text-xs font-bold transition shadow-xs cursor-pointer self-start sm:self-auto"
              >
                {copiedDoc ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedDoc ? 'CPF Copiado!' : 'Copiar CPF'}</span>
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">ID Técnico Único:</span>
                <span className="font-mono font-semibold text-indigo-200">
                  {currentUser.technicalId || 'USR-PRF-0001'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Professor(a):</span>
                <span className="font-semibold text-white">{currentUser.name}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/10 flex items-start gap-2.5 text-[11px] text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                Compartilhe seu CPF com a Escola para solicitar ou confirmar seu vínculo institucional.
              </span>
            </div>
          </div>

          {/* Vínculo Institucional com Escola */}
          <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700">Escola Vinculada:</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                  {schoolRelationship?.status === 'aprovado' ? 'Vínculo Ativo' : 'Pendente'}
                </span>
              </div>
              <div className="flex items-start gap-3 mt-2">
                <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700 shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    {schoolRelationship?.sourceName || 'E.E. Professora Maria da Glória'}
                  </h4>
                  <span className="text-[11px] text-slate-500 block">
                    CNPJ: 46.384.111/0001-40
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white border border-slate-200 text-[11px] text-slate-600">
              A escola recebe os indicadores consolidados das suas turmas para relatórios institucionais da Secretaria de Educação.
            </div>
          </div>
        </div>
      </div>

      {/* Solicitações Pendentes de Alunos */}
      {pendingStudentRequests.length > 0 && (
        <div className="bg-amber-50/60 rounded-3xl p-6 border-2 border-amber-300 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-amber-950 text-base">
              Aguardando Aprovação dos Alunos ({pendingStudentRequests.length})
            </h3>
          </div>
          <p className="text-xs text-amber-800">
            Estes alunos já receberam a solicitação em seus painéis. Os dados só serão visíveis após o aluno aceitar.
          </p>

          <div className="space-y-2 pt-2">
            {pendingStudentRequests.map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-2xl bg-white border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <span className="font-bold text-slate-900 text-sm block">
                    {req.targetName || 'Aluno Convidado'}
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    Turma: {req.assignedClass || 'Geral'} • Enviado em {req.requestedAt}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 font-semibold text-[11px]">
                    Pendente no painel do aluno
                  </span>
                  <button
                    onClick={() => handleRevoke(req.id)}
                    className="text-slate-400 hover:text-rose-600 text-[11px] font-semibold cursor-pointer"
                  >
                    Cancelar Solicitação
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista de Alunos Monitorados Autorizados */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg">
              Alunos Monitorados com Acesso Autorizado ({authorizedStudents.length})
            </h3>
            <p className="text-xs text-slate-500">
              Métricas reais e consolidadas sincronizadas a partir dos simulados, exercícios e redações feitos pelos alunos.
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 self-start sm:self-auto">
            Fonte Única de Verdade Pedagógica
          </span>
        </div>

        {authorizedStudents.length === 0 ? (
          <div className="p-10 rounded-2xl bg-slate-50 border border-dashed border-slate-300 text-center space-y-3">
            <Users className="w-10 h-10 text-slate-400 mx-auto" />
            <h4 className="font-bold text-slate-700 text-sm">Nenhum aluno autorizado no momento</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Utilize o botão "Adicionar Aluno Monitorado" acima para convidar seus alunos pelo CPF.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {authorizedStudents.map((student) => {
              const rel = teacherRels.find(
                (r) =>
                  r.relationshipType === 'ALUNO_PROFESSOR' &&
                  r.status === 'aprovado' &&
                  (r.targetUserId === student.studentUserId || r.sourceUserId === student.studentUserId)
              );

              return (
                <div
                  key={student.studentUserId}
                  className="p-5 rounded-3xl border border-slate-200 hover:border-indigo-300 bg-white shadow-2xs space-y-4 transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 font-extrabold flex items-center justify-center text-base shrink-0">
                        {student.studentName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-base">
                          {student.studentName}
                        </h4>
                        <span className="text-[11px] font-mono text-slate-500 block">
                          ID Técnico: {student.technicalId}
                        </span>
                        <span className="text-[11px] font-semibold text-indigo-700 block mt-0.5">
                          {student.assignedClass || 'Turma ENEM'} • {student.gradeLevel}
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                      Autorizado
                    </span>
                  </div>

                  {/* Métricas Reais do Aluno */}
                  <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-2xl text-center">
                    <div>
                      <span className="text-[10px] text-slate-500 block font-medium">Nota TRI Est.</span>
                      <span className="text-base font-extrabold text-indigo-900 block">
                        {student.triScoreEstimated}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block font-medium">Aproveitamento</span>
                      <span className="text-base font-extrabold text-emerald-800 block">
                        {student.accuracyRate}%
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block font-medium">Redações IA</span>
                      <span className="text-base font-extrabold text-purple-900 block">
                        {student.essaysCount} ({student.latestEssayScore || 800} pts)
                      </span>
                    </div>
                  </div>

                  {/* Fraquezas Pedagógicas identificadas */}
                  {student.weakestArea && (
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-rose-800 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-rose-600" />
                        Área de maior vulnerabilidade:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 text-[10px] font-semibold border border-rose-200">
                          {student.weakestArea}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Rodapé e Encerramento de Vínculo */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {Math.round(student.totalStudyTimeMinutes / 60)}h dedicadas
                    </span>

                    {rel && (
                      revokingRelId === rel.id ? (
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-rose-700 font-bold">Encerrar?</span>
                          <button
                            onClick={() => handleRevoke(rel.id)}
                            className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold cursor-pointer"
                          >
                            Confirmar
                          </button>
                          <button
                            onClick={() => setRevokingRelId(null)}
                            className="px-2 py-1 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-semibold cursor-pointer"
                          >
                            Voltar
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setRevokingRelId(rel.id)}
                          className="text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
                        >
                          Encerrar Vínculo
                        </button>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Adicionar Aluno Monitorado */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 animate-scaleUp space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg">
                    Adicionar Aluno Monitorado
                  </h3>
                  <p className="text-xs text-slate-500">
                    Localize pelo CPF oficial e envie uma solicitação
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Informe o CPF do Aluno ou ID Técnico:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchDoc}
                    onChange={(e) => setSearchDoc(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchStudent()}
                    placeholder="Ex: 529.982.247-25 ou USR-ALU-0001"
                    className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleSearchStudent}
                    className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Search className="w-4 h-4" />
                    <span>Buscar</span>
                  </button>
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Dica de teste: o aluno cadastrado possui o CPF <strong>529.982.247-25</strong>.
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
                      Estudante Localizado (Protegido por LGPD)
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

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Vincular à Turma Docente:
                    </label>
                    <select
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white text-slate-800"
                    >
                      <option value="Turma 3º Ano A - Matutino">Turma 3º Ano A - Matutino</option>
                      <option value="Turma 3º Ano B - Vespertino">Turma 3º Ano B - Vespertino</option>
                      <option value="Turma 2º Ano A - Matutino">Turma 2º Ano A - Matutino</option>
                      <option value="Turma 1º Ano A - Matutino">Turma 1º Ano A - Matutino</option>
                      <option value="Acompanhamento Individual">Acompanhamento Individual</option>
                    </select>
                  </div>

                  <div className="text-[11px] text-emerald-900 bg-white p-3 rounded-xl border border-emerald-200">
                    🔒 O envio da solicitação não expõe notas imediatamente. O aluno precisará aprovar no painel dele para conceder a visualização.
                  </div>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleSendRequest}
                    className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isSubmitting ? 'Enviando...' : 'Enviar Solicitação de Monitoramento'}</span>
                  </button>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
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
