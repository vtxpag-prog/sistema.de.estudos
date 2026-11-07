import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  UserCheck,
  Building2,
  Landmark,
  Check,
  X,
  Copy,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Eye,
  EyeOff,
  History,
  Info,
  Clock,
  Layers,
  FileText
} from 'lucide-react';

export const StudentRelationshipsModule: React.FC = () => {
  const {
    currentUser,
    relationships,
    auditLogs,
    approveRelationship,
    rejectRelationship,
    revokeRelationship,
  } = useApp();

  const [copiedId, setCopiedId] = useState<boolean>(false);
  const [showFullCpf, setShowFullCpf] = useState<boolean>(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  if (!currentUser) {
    return null;
  }

  // Filtra relacionamentos em que o aluno é o destino ou origem
  const studentRelationships = relationships.filter(
    (rel) => rel.targetUserId === currentUser.id || rel.sourceUserId === currentUser.id
  );

  const pendingRequests = studentRelationships.filter((rel) => rel.status === 'pendente');
  const activeRelationships = studentRelationships.filter((rel) => rel.status === 'aprovado');

  // Filtrar logs de auditoria do aluno
  const studentLogs = auditLogs.filter(
    (log) =>
      log.actorId === currentUser.technicalId ||
      log.targetId === currentUser.technicalId ||
      log.actorId === currentUser.id ||
      log.targetId === currentUser.id
  );

  const handleCopyDocument = () => {
    const docToCopy = currentUser.documentNumber;
    navigator.clipboard?.writeText(docToCopy);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2500);
  };

  const handleApprove = (relationshipId: string) => {
    approveRelationship(relationshipId);
    setActionSuccessMessage('Vínculo aprovado com sucesso! O professor autorizado agora pode acompanhar seus simulados e redações.');
    setTimeout(() => setActionSuccessMessage(null), 5000);
  };

  const handleReject = (relationshipId: string) => {
    rejectRelationship(relationshipId);
    setActionSuccessMessage('Solicitação de vínculo recusada. Nenhum dado foi compartilhado.');
    setTimeout(() => setActionSuccessMessage(null), 5000);
  };

  const handleRevoke = (relationshipId: string) => {
    revokeRelationship(relationshipId, 'Revogado voluntariamente pelo estudante no painel de privacidade.');
    setRevokingId(null);
    setActionSuccessMessage('Vínculo revogado imediatamente! O acesso aos seus dados foi cancelado. Seu histórico acadêmico permanece 100% preservado.');
    setTimeout(() => setActionSuccessMessage(null), 5000);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Institucional */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                Rede Integrada ENEM • Gestão de Vínculos
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Identificação Universal & Vínculos Autorizados
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
              Você mantém controle integral dos seus dados. Professores e escolas só podem visualizar seus indicadores acadêmicos mediante sua prévia e expressa autorização.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 self-start md:self-auto">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span>LGPD: Dados protegidos e revogáveis</span>
          </div>
        </div>

        {/* Feedback visual de ações */}
        {actionSuccessMessage && (
          <div className="mt-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm flex items-center gap-3 animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{actionSuccessMessage}</span>
          </div>
        )}

        {/* Cartão de Identificador Universal do Aluno */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-6 rounded-3xl bg-linear-to-br from-slate-900 to-indigo-950 text-white shadow-md relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-64 h-64 bg-indigo-600/10 rounded-full blur-2xl pointer-events-none"></div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div>
                <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider block">
                  Identificador Oficial do Estudante (CPF)
                </span>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-2xl sm:text-3xl font-mono font-extrabold tracking-wider">
                    {showFullCpf ? currentUser.formattedDocument : currentUser.maskedDocument}
                  </span>
                  <button
                    onClick={() => setShowFullCpf((prev) => !prev)}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 transition cursor-pointer"
                    title={showFullCpf ? 'Ocultar dígitos centrais (LGPD)' : 'Exibir CPF completo'}
                  >
                    {showFullCpf ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                onClick={handleCopyDocument}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white text-indigo-950 hover:bg-indigo-50 text-xs font-bold transition shadow-xs cursor-pointer self-start sm:self-auto"
                title="Copiar CPF para compartilhar com seu professor"
              >
                {copiedId ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedId ? 'CPF Copiado!' : 'Copiar CPF Oficial'}</span>
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">ID Técnico Interno Único:</span>
                <span className="font-mono font-semibold text-indigo-200">
                  {currentUser.technicalId || 'USR-ALU-0001'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Nome Oficial do Aluno:</span>
                <span className="font-semibold text-white">{currentUser.name}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/10 flex items-start gap-2.5 text-[11px] text-slate-300">
              <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <span>
                Compartilhe seu CPF com o professor para que ele possa solicitar seu acompanhamento pedagógico. Nenhum professor poderá ver suas notas sem que você aprove a solicitação aqui.
              </span>
            </div>
          </div>

          {/* Resumo da Rede */}
          <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between space-y-4">
            <div>
              <span className="text-xs font-bold text-slate-700 block mb-3">Status da Sua Rede:</span>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-indigo-600" />
                    Professores Vinculados
                  </span>
                  <span className="font-bold text-slate-900 bg-white px-2.5 py-0.5 rounded-full border border-slate-200">
                    {activeRelationships.length}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-500" />
                    Solicitações Pendentes
                  </span>
                  <span className={`font-bold px-2.5 py-0.5 rounded-full border ${
                    pendingRequests.length > 0
                      ? 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
                      : 'bg-white text-slate-700 border-slate-200'
                  }`}>
                    {pendingRequests.length}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-[11px] text-indigo-900 leading-snug">
              <strong>Como funciona a cadeia:</strong> Você autoriza o <strong>Professor</strong>; se o professor estiver vinculado a uma <strong>Escola</strong> e <strong>Secretaria</strong>, eles recebem apenas métricas consolidadas de turma.
            </div>
          </div>
        </div>
      </div>

      {/* Solicitações Pendentes de Aprovação */}
      {pendingRequests.length > 0 && (
        <div className="bg-amber-50/60 rounded-3xl p-6 sm:p-8 border-2 border-amber-300 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-amber-500 text-white shadow-xs">
              <Clock className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-extrabold text-amber-950 text-lg">
                Solicitações de Monitoramento Pendentes ({pendingRequests.length})
              </h3>
              <p className="text-xs text-amber-800">
                Professores solicitaram permissão para acompanhar seu desempenho no ENEM. Analise e decida se autoriza o acesso.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-2xl p-5 border border-amber-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold">
                      {req.relationshipType === 'ALUNO_PROFESSOR' ? 'Vínculo Aluno ↔ Professor' : req.relationshipType}
                    </span>
                    {req.assignedClass && (
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-semibold">
                        Turma: {req.assignedClass}
                      </span>
                    )}
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-base">
                    {req.sourceName || 'Professor Solicitante'}
                  </h4>
                  <p className="text-xs text-slate-500">
                    Solicitado em: {req.requestedAt} • {req.sourceRole.toUpperCase()}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-2 text-[11px] text-slate-600">
                    <span className="font-semibold text-slate-700">Permissões solicitadas:</span>
                    {req.permissions.viewSimulations && (
                      <span className="px-2 py-0.5 rounded-md bg-slate-100">Simulados & TRI</span>
                    )}
                    {req.permissions.viewEssays && (
                      <span className="px-2 py-0.5 rounded-md bg-slate-100">Redações com IA</span>
                    )}
                    {req.permissions.viewDifficulties && (
                      <span className="px-2 py-0.5 rounded-md bg-slate-100">Fraquezas por Matéria</span>
                    )}
                    {req.permissions.viewAttendance && (
                      <span className="px-2 py-0.5 rounded-md bg-slate-100">Horas de Estudo</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                  <button
                    onClick={() => handleReject(req.id)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                    <span>Recusar</span>
                  </button>
                  <button
                    onClick={() => handleApprove(req.id)}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Autorizar Acesso</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vínculos Ativos */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg">
              Professores Autorizados ({activeRelationships.length})
            </h3>
            <p className="text-xs text-slate-500">
              Estes docentes têm autorização para acompanhar seu ritmo de estudo, evolução TRI e redações.
            </p>
          </div>
        </div>

        {activeRelationships.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-50 border border-dashed border-slate-300 text-center space-y-3">
            <UserCheck className="w-10 h-10 text-slate-400 mx-auto" />
            <h4 className="font-bold text-slate-700 text-sm">Nenhum professor autorizado no momento</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Você pode estudar livremente e de forma autônoma. Quando desejar vincular um professor de sua escola ou cursinho, informe a ele seu CPF oficial ({currentUser.maskedDocument || currentUser.formattedDocument}).
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeRelationships.map((rel) => {
              const teacherName = rel.sourceUserId === currentUser.id ? rel.targetName : rel.sourceName;
              return (
                <div
                  key={rel.id}
                  className="p-5 rounded-2xl border border-slate-200 hover:border-indigo-200 bg-white shadow-2xs space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0">
                        {teacherName?.charAt(0) || 'P'}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{teacherName}</h4>
                        <span className="text-[11px] text-slate-500 block">
                          Docente Responsável • {rel.assignedClass ? `Turma: ${rel.assignedClass}` : 'Acompanhamento ENEM'}
                        </span>
                        <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                          <CheckCircle2 className="w-3 h-3" />
                          Vínculo Ativo desde {rel.approvedAt || rel.requestedAt}
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                      Aprovado
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <span className="text-[11px] font-semibold text-slate-600 block">
                      Permissões Concedidas:
                    </span>
                    <div className="flex flex-wrap gap-1.5 text-[10px]">
                      {rel.permissions.viewSimulations && (
                        <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-medium">
                          Simulados & TRI
                        </span>
                      )}
                      {rel.permissions.viewEssays && (
                        <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-medium">
                          Redações com IA
                        </span>
                      )}
                      {rel.permissions.viewDifficulties && (
                        <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 font-medium">
                          Fraquezas por Área
                        </span>
                      )}
                      {rel.permissions.viewAttendance && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-medium">
                          Horas de Estudo
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-mono">
                      Ref: {rel.id}
                    </span>

                    {revokingId === rel.id ? (
                      <div className="flex items-center gap-2 animate-fadeIn">
                        <span className="text-[10px] text-rose-700 font-semibold">Confirmar?</span>
                        <button
                          onClick={() => handleRevoke(rel.id)}
                          className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold cursor-pointer"
                        >
                          Sim, Revogar
                        </button>
                        <button
                          onClick={() => setRevokingId(null)}
                          className="px-2 py-1 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-semibold"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setRevokingId(rel.id)}
                        className="text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
                        title="Encerrar este vínculo e remover o acesso do professor"
                      >
                        Revogar Autorização
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cadeia Institucional de Acompanhamento (Hierarquia Visual) */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-md space-y-6">
        <div className="space-y-1">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block">
            Transparência LGPD
          </span>
          <h3 className="text-xl font-extrabold tracking-tight">
            Como Seus Dados São Compartilhados na Rede
          </h3>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Entenda o modelo hierárquico em cascata. Escolas e Secretarias não acessam seus dados individualmente de forma arbitrária; apenas o professor autorizado tem acesso pontual, enquanto as instâncias superiores analisam dados agregados da turma.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
          {/* Nível 1: Aluno */}
          <div className="p-4 rounded-2xl bg-indigo-950/80 border border-indigo-500/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">Nível 1</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            </div>
            <h4 className="font-extrabold text-sm text-white">Você (Estudante)</h4>
            <p className="text-[11px] text-slate-300">
              Origem dos dados. Realiza exercícios, simulados e redações. Concede ou revoga permissões.
            </p>
          </div>

          {/* Nível 2: Professor */}
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Nível 2</span>
              <span className="text-[10px] text-indigo-300 font-bold">Autorizado</span>
            </div>
            <h4 className="font-extrabold text-sm text-white">Professor Monitor</h4>
            <p className="text-[11px] text-slate-300">
              Acompanha notas TRI, redações corrigidas e fraquezas para planejar aulas e intervenções pedagógicas.
            </p>
          </div>

          {/* Nível 3: Escola */}
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Nível 3</span>
              <span className="text-[10px] text-slate-400">Consolidado</span>
            </div>
            <h4 className="font-extrabold text-sm text-white">Escola</h4>
            <p className="text-[11px] text-slate-300">
              Acompanha as médias das turmas vinculadas aos professores aprovados da instituição.
            </p>
          </div>

          {/* Nível 4: Secretaria */}
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Nível 4</span>
              <span className="text-[10px] text-slate-400">Rede Pública</span>
            </div>
            <h4 className="font-extrabold text-sm text-white">Secretaria de Educação</h4>
            <p className="text-[11px] text-slate-300">
              Indicadores macropolíticos e estatísticos agregados por escola da jurisdição autorizada.
            </p>
          </div>
        </div>
      </div>

      {/* Histórico de Auditoria LGPD */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-slate-600" />
            <h3 className="font-extrabold text-slate-900 text-base">
              Histórico de Ações e Auditoria de Privacidade
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Registro imutável de consentimento
          </span>
        </div>

        {studentLogs.length === 0 ? (
          <p className="text-xs text-slate-500 py-3">
            Nenhum evento de privacidade registrado ainda.
          </p>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {studentLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2.5">
                  <span className={`w-2 h-2 rounded-full ${
                    log.action === 'VINCULO_APROVADO'
                      ? 'bg-emerald-500'
                      : log.action === 'VINCULO_RECUSADO' || log.action === 'VINCULO_REVOGADO'
                      ? 'bg-rose-500'
                      : 'bg-amber-500'
                  }`} />
                  <div>
                    <span className="font-bold text-slate-900 uppercase tracking-tight text-[11px]">
                      {log.action}
                    </span>
                    <span className="text-slate-600 ml-2">
                      por {log.actorName} ({log.actorRole})
                    </span>
                    {log.details && (
                      <p className="text-[11px] text-slate-500 mt-0.5">{log.details}</p>
                    )}
                  </div>
                </div>

                <span className="text-[10px] text-slate-400 font-mono shrink-0">
                  {log.timestamp}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
