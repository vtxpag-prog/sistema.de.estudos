import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { isValidCNPJ, normalizeDocument } from '../../utils/documentValidation';
import {
  Landmark,
  Building2,
  CheckCircle2,
  Clock,
  Search,
  Copy,
  Check,
  Eye,
  EyeOff,
  AlertTriangle,
  X,
  PlusCircle,
  History,
  Lock,
} from 'lucide-react';

export const SecretariatRelationshipsModule: React.FC = () => {
  const {
    currentUser,
    relationships,
    auditLogs,
    requestRelationship,
    revokeRelationship,
    lookupUniversalUser,
    getAggregatedSecretariatMetrics,
  } = useApp();

  const [copiedDoc, setCopiedDoc] = useState<boolean>(false);
  const [showFullCnpj, setShowFullCnpj] = useState<boolean>(false);
  const [showAddSchoolModal, setShowAddSchoolModal] = useState<boolean>(false);

  // Estados de busca de escola por CNPJ
  const [searchDoc, setSearchDoc] = useState<string>('');
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchedUser, setSearchedUser] = useState<{
    id: string;
    technicalId: string;
    maskedName: string;
    maskedDocument: string;
    role: string;
  } | null>(null);
  const [assignedDistrict, setAssignedDistrict] = useState<string>('Diretoria Regional Campinas / SP');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  if (!currentUser) {
    return null;
  }

  // Métricas consolidadas da secretaria
  const networkMetrics = getAggregatedSecretariatMetrics(currentUser.id);

  // Relacionamentos da secretaria
  const secretariatRels = relationships.filter(
    (rel) => rel.sourceUserId === currentUser.id || rel.targetUserId === currentUser.id
  );

  const schoolRels = secretariatRels.filter((rel) => rel.relationshipType === 'ESCOLA_SECRETARIA');
  const activeSchoolRels = schoolRels.filter((rel) => rel.status === 'aprovado');
  const pendingSchoolRels = schoolRels.filter((rel) => rel.status === 'pendente');

  const handleCopyDoc = () => {
    if (currentUser.documentNumber) {
      navigator.clipboard?.writeText(currentUser.documentNumber);
      setCopiedDoc(true);
      setTimeout(() => setCopiedDoc(false), 2500);
    }
  };

  const handleSearchSchool = async () => {
    setSearchError(null);
    setSearchedUser(null);

    const clean = normalizeDocument(searchDoc);
    if (!clean && !searchDoc.startsWith('INST-')) {
      setSearchError('Por favor, informe o CNPJ da escola ou o ID técnico.');
      return;
    }

    if (clean.length > 0 && clean.length !== 14 && !searchDoc.startsWith('INST-')) {
      setSearchError('O CNPJ deve conter exatamente 14 dígitos numéricos.');
      return;
    }

    if (clean.length === 14 && !isValidCNPJ(clean)) {
      setSearchError('CNPJ inválido pelo algoritmo de dígitos verificadores oficiais (módulo 11).');
      return;
    }

    const found = await lookupUniversalUser(searchDoc);
    if (!found) {
      setSearchError('Nenhuma instituição escolar cadastrada com este documento no portal.');
      return;
    }

    if (found.role !== 'escola') {
      setSearchError(`O documento informado pertence a um perfil do tipo "${found.role}", não a uma escola.`);
      return;
    }

    // Verificar se já existe vínculo
    const alreadyLinked = schoolRels.find(
      (r) =>
        r.relationshipType === 'ESCOLA_SECRETARIA' &&
        (r.targetUserId === found.id || r.sourceUserId === found.id) &&
        (r.status === 'aprovado' || r.status === 'pendente')
    );

    if (alreadyLinked) {
      setSearchError(
        alreadyLinked.status === 'aprovado'
          ? 'Esta escola já está vinculada e integrada à rede da Secretaria!'
          : 'Já existe uma solicitação pendente de aprovação com esta unidade escolar.'
      );
      return;
    }

    setSearchedUser(found);
  };

  const handleSendSchoolRequest = async () => {
    if (!searchedUser) return;
    setIsSubmitting(true);

    try {
      const res = await requestRelationship(
        searchedUser.id,
        'ESCOLA_SECRETARIA',
        {
          viewPerformance: true,
          viewSimulations: true,
          viewEssays: true,
          viewAttendance: true,
          viewDifficulties: true,
          viewDetailedReports: true,
        },
        assignedDistrict
      );

      if (res && !res.success) {
        setSearchError(res.error || 'Erro ao enviar solicitação.');
        return;
      }

      setSuccessMessage(
        `Solicitação institucional enviada com sucesso para ${searchedUser.maskedName}! A escola deverá aprovar o vínculo no painel dela para integrar os dados à rede.`
      );
      setShowAddSchoolModal(false);
      setSearchDoc('');
      setSearchedUser(null);
      setTimeout(() => setSuccessMessage(null), 6000);
    } catch (err: any) {
      setSearchError(err?.message || 'Erro ao enviar solicitação.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevoke = (relationshipId: string) => {
    revokeRelationship(relationshipId, 'Vínculo encerrado pela Secretaria de Educação.');
    setRevokingId(null);
    setSuccessMessage('Vínculo com a escola revogado com sucesso. O acesso aos dados da unidade foi interrompido.');
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Banner Superior Secretaria com ID Universal */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-purple-50 text-purple-600">
                <Landmark className="w-5 h-5" />
              </span>
              <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">
                Rede Integrada ENEM • Gestão Macropolítica da Educação
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Identificação da Secretaria & Escolas Integradas
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
              Vincule escolas pelo CNPJ oficial. O acesso aos indicadores educacionais da unidade só é concedido após a aprovação expressa da escola, garantindo a autonomia pedagógica e conformidade com a LGPD.
            </p>
          </div>

          <button
            onClick={() => {
              setShowAddSchoolModal(true);
              setSearchError(null);
              setSearchedUser(null);
              setSearchDoc('');
            }}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold transition shadow-sm cursor-pointer self-start md:self-auto shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Vincular Escola à Rede</span>
          </button>
        </div>

        {/* Feedback visual */}
        {successMessage && (
          <div className="mt-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm flex items-center gap-3 animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Cartão de Identificador Universal da Secretaria (CNPJ) */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-6 rounded-3xl bg-linear-to-br from-purple-950 via-slate-900 to-indigo-950 text-white shadow-md relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div>
                <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wider block">
                  Identificador Oficial da Secretaria (CNPJ)
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
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white text-purple-950 hover:bg-purple-50 text-xs font-bold transition shadow-xs cursor-pointer self-start sm:self-auto"
              >
                {copiedDoc ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedDoc ? 'CNPJ Copiado!' : 'Copiar CNPJ Oficial'}</span>
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">ID Técnico Institucional:</span>
                <span className="font-mono font-semibold text-purple-200">
                  {currentUser.technicalId || 'INST-SEC-0001'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Órgão Responsável:</span>
                <span className="font-semibold text-white">{currentUser.name}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/10 flex items-start gap-2.5 text-[11px] text-slate-300">
              <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                Regra Institucional: A Secretaria visualiza <strong>somente as escolas que aceitaram expressamente o vínculo</strong>. Escolas não vinculadas permanecem inacessíveis.
              </span>
            </div>
          </div>

          {/* Resumo da Jurisdição */}
          <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between space-y-4">
            <div>
              <span className="text-xs font-bold text-slate-700 block mb-2">Rede Autorizada:</span>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-purple-600" />
                    Escolas Vinculadas
                  </span>
                  <span className="font-bold text-slate-900 bg-white px-2.5 py-0.5 rounded-full border border-slate-200">
                    {activeSchoolRels.length}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-500" />
                    Convites Pendentes
                  </span>
                  <span className="font-bold text-slate-900 bg-white px-2.5 py-0.5 rounded-full border border-slate-200">
                    {pendingSchoolRels.length}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-purple-50 text-[11px] text-purple-900 border border-purple-100 leading-snug">
              Os dados consolidados da rede são gerados a partir do desempenho real dos alunos nas escolas aprovadas.
            </div>
          </div>
        </div>
      </div>

      {/* Indicadores Agregados da Rede */}
      {networkMetrics && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg">
                Consolidado Macropolítico da Rede Jurisdicional
              </h3>
              <p className="text-xs text-slate-500">
                Indicadores gerados a partir de {networkMetrics.totalSchoolsLinked} escola(s) vinculada(s), englobando {networkMetrics.totalTeachersLinked} professores e {networkMetrics.totalStudentsAuthorized} estudantes autorizados.
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-50 text-purple-800 border border-purple-200 self-start sm:self-auto">
              Índice de Prontidão ENEM: {networkMetrics.enemReadinessIndex}%
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200/80">
              <span className="text-xs font-bold text-purple-950 block">Média Geral TRI da Rede</span>
              <span className="text-2xl font-extrabold text-purple-900 block mt-1">
                {networkMetrics.networkAverageTRI}
              </span>
              <span className="text-[11px] text-purple-700">Previsão Oficial INEP</span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80">
              <span className="text-xs font-bold text-emerald-950 block">Taxa de Participação</span>
              <span className="text-2xl font-extrabold text-emerald-900 block mt-1">
                {networkMetrics.participationRate}%
              </span>
              <span className="text-[11px] text-emerald-700">Adesão aos Simulados</span>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/80">
              <span className="text-xs font-bold text-indigo-950 block">Média de Redação</span>
              <span className="text-2xl font-extrabold text-indigo-900 block mt-1">
                {networkMetrics.networkAverageEssayScore}
              </span>
              <span className="text-[11px] text-indigo-700">Competências 1 a 5</span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80">
              <span className="text-xs font-bold text-amber-950 block">Alunos com Acesso</span>
              <span className="text-2xl font-extrabold text-amber-900 block mt-1">
                {networkMetrics.totalStudentsAuthorized}
              </span>
              <span className="text-[11px] text-amber-700">Base Ativa Integrada</span>
            </div>
          </div>
        </div>
      )}

      {/* Convites Pendentes Enviados a Escolas */}
      {pendingSchoolRels.length > 0 && (
        <div className="bg-amber-50/60 rounded-3xl p-6 border-2 border-amber-300 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-amber-950 text-base">
              Aguardando Aprovação das Unidades Escolares ({pendingSchoolRels.length})
            </h3>
          </div>
          <p className="text-xs text-amber-800">
            A direção da escola precisa autorizar o vínculo institucional no painel dela para que os indicadores sejam exibidos na Secretaria.
          </p>

          <div className="space-y-2 pt-2">
            {pendingSchoolRels.map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-2xl bg-white border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <span className="font-bold text-slate-900 text-sm block">
                    {req.targetName || 'Unidade Escolar'}
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    Região: {req.assignedClass || 'Jurisdição Padrão'} • Enviado em {req.requestedAt}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 font-semibold text-[11px]">
                    Aguardando Direção Escolar
                  </span>
                  <button
                    onClick={() => handleRevoke(req.id)}
                    className="text-slate-400 hover:text-rose-600 text-[11px] font-semibold cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabela Comparativa de Escolas Autorizadas */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg">
              Escolas Autorizadas da Rede ({activeSchoolRels.length})
            </h3>
            <p className="text-xs text-slate-500">
              Unidades escolares com vínculo aprovado. Apenas estas instituições compartilham indicadores com a Secretaria.
            </p>
          </div>
        </div>

        {networkMetrics.schoolsComparison.length === 0 ? (
          <div className="p-10 rounded-2xl bg-slate-50 border border-dashed border-slate-300 text-center space-y-3">
            <Building2 className="w-10 h-10 text-slate-400 mx-auto" />
            <h4 className="font-bold text-slate-700 text-sm">Nenhuma escola vinculada no momento</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Clique em "Vincular Escola à Rede" acima e informe o CNPJ da escola para enviar a solicitação.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {networkMetrics.schoolsComparison.map((school) => {
              const rel = activeSchoolRels.find(
                (r) => r.targetUserId === school.schoolId || r.sourceUserId === school.schoolId
              );

              return (
                <div
                  key={school.schoolId}
                  className="p-5 rounded-2xl border border-slate-200 hover:border-purple-300 bg-white shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-slate-900 text-base">
                        {school.schoolName}
                      </h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        school.status === 'Excelente'
                          ? 'bg-emerald-100 text-emerald-800'
                          : school.status === 'Consolidada'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {school.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>{school.city}</span>
                      <span>•</span>
                      <span>{school.studentsCount} alunos integrados</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-xs">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-medium">Média TRI</span>
                      <span className="text-base font-extrabold text-purple-900 block">
                        {school.averageTRI}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-medium">Redação</span>
                      <span className="text-base font-extrabold text-indigo-900 block">
                        {school.averageEssay}
                      </span>
                    </div>

                    {rel && (
                      revokingId === rel.id ? (
                        <div className="flex items-center gap-1.5">
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
                          Encerrar
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

      {/* Registro de Auditoria e Conformidade LGPD */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <History className="w-5 h-5 text-purple-400" />
            <div>
              <h3 className="font-extrabold text-base">
                Livro de Registro e Auditoria de Vínculos da Jurisdição
              </h3>
              <p className="text-xs text-slate-400">
                Rastreabilidade de consentimento e governança em conformidade com a LGPD e Marco Legal da Educação
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/10 text-slate-300">
            {auditLogs.length} Registros
          </span>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
          {auditLogs.slice(0, 10).map((log) => (
            <div
              key={log.id}
              className="p-3 rounded-2xl bg-white/5 border border-white/10 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2.5">
                <span className={`w-2 h-2 rounded-full ${
                  log.action === 'VINCULO_APROVADO'
                    ? 'bg-emerald-400'
                    : log.action === 'VINCULO_REVOGADO' || log.action === 'VINCULO_RECUSADO'
                    ? 'bg-rose-400'
                    : 'bg-amber-400'
                }`} />
                <div>
                  <span className="font-mono text-purple-300 font-bold uppercase text-[11px]">
                    [{log.action}]
                  </span>
                  <span className="text-slate-300 ml-2">
                    {log.details || `Operação realizada por ${log.actorName}`}
                  </span>
                </div>
              </div>

              <span className="text-[10px] text-slate-400 font-mono shrink-0">
                {log.timestamp}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Vincular Escola */}
      {showAddSchoolModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 animate-scaleUp space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg">
                    Vincular Escola à Rede
                  </h3>
                  <p className="text-xs text-slate-500">
                    Localize a escola pelo CNPJ oficial
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddSchoolModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Informe o CNPJ da Escola ou ID Técnico:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchDoc}
                    onChange={(e) => setSearchDoc(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchSchool()}
                    placeholder="Ex: 46.384.111/0001-40 ou INST-ESC-0001"
                    className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="button"
                    onClick={handleSearchSchool}
                    className="px-5 py-3 rounded-2xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Search className="w-4 h-4" />
                    <span>Buscar</span>
                  </button>
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Dica de teste: a escola padrão possui o CNPJ <strong>46.384.111/0001-40</strong>.
                </span>
              </div>

              {searchError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{searchError}</span>
                </div>
              )}

              {searchedUser && (
                <div className="p-5 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800">
                      Unidade Escolar Localizada
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-purple-200 text-purple-900 text-[10px] font-bold">
                      {searchedUser.role.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-700 text-white font-extrabold flex items-center justify-center text-sm">
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
                      Região / Diretoria de Ensino:
                    </label>
                    <input
                      type="text"
                      value={assignedDistrict}
                      onChange={(e) => setAssignedDistrict(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>

                  <div className="text-[11px] text-purple-900 bg-white p-3 rounded-xl border border-purple-200">
                    🔒 A escola receberá uma notificação institucional e deverá aprovar o vínculo em seu painel antes que qualquer dado da unidade seja liberado para a Secretaria.
                  </div>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleSendSchoolRequest}
                    className="w-full py-3 rounded-2xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isSubmitting ? 'Enviando...' : 'Enviar Solicitação de Vínculo à Escola'}</span>
                  </button>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowAddSchoolModal(false)}
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
