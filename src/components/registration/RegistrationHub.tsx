import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  RegistrationLevel,
  UserRegistrationRecord,
  InternalAlert,
} from '../../types';
import {
  TOTAL_CAPACITY,
  CAPACITY_WARNING_THRESHOLD,
  CAPACITY_CRITICAL_THRESHOLD,
} from '../../data/registrationDatabase';
import {
  Database,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Lock,
  Unlock,
  Terminal,
  Search,
  Filter,
  UserPlus,
  RefreshCw,
  KeyRound,
  CheckCircle2,
  XCircle,
  Eye,
  Edit3,
  Clock,
  Layers,
  Sparkles,
  Info,
  Sliders,
  Send,
  X
} from 'lucide-react';

export const RegistrationHub: React.FC = () => {
  const {
    currentUser,
    registrationRecords,
    capacityCount,
    simulateCapacity,
    internalAlerts,
    dismissAlert,
    unlockEditForRecord,
    saveEditedRecord,
    addRegistrationRecord,
    blockUserAccess,
    unblockUserAccess,
    resetUserPasswordManual,
    processTerminalCommand,
  } = useApp();

  // Filters & Search
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<string>('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('Todos');

  // Terminal state
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalHistory, setTerminalHistory] = useState<
    { command: string; output: string; time: string }[]
  >([
    {
      command: '[status-banco]',
      output: `Capacidade Total: 200.000 posições | Registros ativos: ${capacityCount} | Limite de alerta: 180.000`,
      time: '08:00',
    },
  ]);

  // Modals
  const [showNewRecordModal, setShowNewRecordModal] = useState(false);
  const [viewingRecord, setViewingRecord] = useState<UserRegistrationRecord | null>(null);
  const [editingDuration, setEditingDuration] = useState<number>(24);
  const [notificationBanner, setNotificationBanner] = useState<string | null>(null);

  // New Record Form State
  const [newLevel, setNewLevel] = useState<RegistrationLevel>('Nível 2 — Aluno');
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newCpf, setNewCpf] = useState('');
  const [newCnpj, setNewCnpj] = useState('');
  const [newBirthDate, setNewBirthDate] = useState('15/03/2008');
  const [newInstitution, setNewInstitution] = useState('');
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newLearningProfile, setNewLearningProfile] = useState<'Padrão' | 'TDAH' | 'TEA' | 'Dislexia' | 'Combinado'>('Padrão');

  // Capacity threshold logic
  const remainingSlots = TOTAL_CAPACITY - capacityCount;
  const isWarningCapacity = capacityCount >= CAPACITY_WARNING_THRESHOLD && capacityCount < CAPACITY_CRITICAL_THRESHOLD;
  const isCriticalCapacity = capacityCount >= CAPACITY_CRITICAL_THRESHOLD && capacityCount < TOTAL_CAPACITY;
  const isBlockedCapacity = capacityCount >= TOTAL_CAPACITY;

  // Filtered records
  const filteredRecords = registrationRecords.filter((rec) => {
    const matchesLevel = selectedLevelFilter === 'Todos' || rec.level === selectedLevelFilter;
    const matchesStatus = selectedStatusFilter === 'Todos' || rec.status === selectedStatusFilter;
    const matchesSearch =
      rec.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(rec.id).includes(searchTerm) ||
      (rec.cpf && rec.cpf.includes(searchTerm)) ||
      (rec.cnpj && rec.cnpj.includes(searchTerm));
    return matchesLevel && matchesStatus && matchesSearch;
  });

  const handleRunCommand = (cmdToRun?: string) => {
    const command = (cmdToRun || terminalInput).trim();
    if (!command) return;

    const res = processTerminalCommand(command);
    const nowTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    setTerminalHistory((prev) => [
      { command, output: res.output, time: nowTime },
      ...prev,
    ]);

    if (!cmdToRun) setTerminalInput('');

    if (res.actionResult?.action === 'open_new_modal') {
      setShowNewRecordModal(true);
    }
  };

  const handleUnlockEdit = (recordId: number, duration: number) => {
    const res = unlockEditForRecord(recordId, duration);
    setNotificationBanner(res.message);
    setTimeout(() => setNotificationBanner(null), 6000);
  };

  const handleCreateRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (isBlockedCapacity) {
      alert('🛑 CADASTRO SUSPENSO — Capacidade máxima atingida. Aguardar ampliação.');
      return;
    }

    const res = addRegistrationRecord({
      level: newLevel,
      fullName: newFullName,
      email: newEmail,
      phone: newPhone,
      cpf: newCpf,
      cnpj: newCnpj,
      birthDate: newBirthDate,
      linkedInstitution: newInstitution,
      jobTitle: newJobTitle,
      learningProfile: newLearningProfile,
      termsAccepted: true,
      dataSharing: true,
    });

    if (res.success && res.record) {
      setNotificationBanner(`Registro [ID #${res.record.id} - ${res.record.fullName}] criado com sucesso no banco. Edição bloqueada por padrão.`);
      setShowNewRecordModal(false);
      setNewFullName('');
      setNewEmail('');
      setNewPhone('');
      setNewCpf('');
      setNewCnpj('');
    } else {
      alert(res.error || 'Erro ao registrar.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Module 1.3 Introduction & Database Capacity */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Database className="w-4 h-4 text-indigo-400" />
              <span>Módulo: Cadastro, Liberação de Edição e Banco de Dados (Versão 1.3)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Gestão Central de Registros e Dimensionamento
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Operação manual, segura e transparente. <strong>Sem e-mails automáticos</strong> de nenhum tipo. Edição bloqueada por padrão com liberação direta pelo Administrador.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
            <button
              onClick={() => handleRunCommand('[iniciar-cadastro]')}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-xs text-white shadow-md transition flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>[iniciar-cadastro]</span>
            </button>

            <button
              onClick={() => handleRunCommand('[status-banco]')}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-xs text-slate-300 border border-slate-700 transition flex items-center gap-1.5"
            >
              <RefreshCw className="w-4 h-4 text-slate-400" />
              <span>[status-banco]</span>
            </button>
          </div>
        </div>

        {/* Capacity Monitor & Real-Time Alerts (Parte 2) */}
        <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-200">Capacidade Dimensionada do Banco:</span>
              <span className="font-mono text-sm font-black text-indigo-400">
                {capacityCount.toLocaleString('pt-BR')} / {TOTAL_CAPACITY.toLocaleString('pt-BR')} posições
              </span>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span>Vagas restantes: <strong className="text-white">{remainingSlots.toLocaleString('pt-BR')}</strong></span>
              <span>•</span>
              <span>Alerta em: 180.000</span>
            </div>
          </div>

          {/* Progress Bar with 180k (warning) and 195k (critical) markers */}
          <div className="relative h-4 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                isBlockedCapacity
                  ? 'bg-rose-600'
                  : isCriticalCapacity
                  ? 'bg-rose-500 animate-pulse'
                  : isWarningCapacity
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, (capacityCount / TOTAL_CAPACITY) * 100)}%` }}
            />
            {/* 180.000 marker line */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-10"
              style={{ left: '90%' }}
              title="Marcador de Alerta: 180.000 (90%)"
            />
            {/* 195.000 marker line */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-rose-400 z-10"
              style={{ left: '97.5%' }}
              title="Marcador Crítico: 195.000 (97.5%)"
            />
          </div>

          {/* Capacity Alert Box if triggered */}
          {isWarningCapacity && (
            <div className="p-3.5 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-200 text-xs font-semibold flex items-start gap-2.5 animate-fadeIn">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong>⚠️ ALERTA DE CAPACIDADE — Banco de Dados:</strong> 180.000 registros atingidos. Restam {remainingSlots.toLocaleString('pt-BR')} vagas. Solicitar ampliação imediata.
              </div>
            </div>
          )}

          {isCriticalCapacity && (
            <div className="p-3.5 rounded-xl bg-rose-500/20 border border-rose-500/60 text-rose-200 text-xs font-bold flex items-start gap-2.5 animate-pulse">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong>🔴 CAPACIDADE CRÍTICA — {capacityCount.toLocaleString('pt-BR')} registros:</strong> Restam menos de 5.000 vagas. Ampliação urgente.
              </div>
            </div>
          )}

          {isBlockedCapacity && (
            <div className="p-3.5 rounded-xl bg-rose-600 text-white text-xs font-black flex items-start gap-2.5 animate-bounce">
              <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                🛑 CADASTRO SUSPENSO — Capacidade máxima atingida (200.000 registros). Novos cadastros bloqueados até ampliação.
              </div>
            </div>
          )}

          {/* Capacity Simulator for Testing */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 border-t border-slate-800">
            <span className="font-semibold text-slate-300">Simulação de carga para teste dos alertas:</span>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => simulateCapacity(registrationRecords.length)}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono"
              >
                Padrão ({registrationRecords.length})
              </button>
              <button
                onClick={() => simulateCapacity(180000)}
                className="px-2.5 py-1 rounded bg-amber-900/60 hover:bg-amber-800 text-amber-200 font-mono border border-amber-600/40"
              >
                180.000 (Alerta)
              </button>
              <button
                onClick={() => simulateCapacity(196500)}
                className="px-2.5 py-1 rounded bg-rose-900/60 hover:bg-rose-800 text-rose-200 font-mono border border-rose-600/40"
              >
                196.500 (Crítico)
              </button>
              <button
                onClick={() => simulateCapacity(200000)}
                className="px-2.5 py-1 rounded bg-rose-950 hover:bg-rose-900 text-white font-mono border border-rose-500"
              >
                200.000 (Suspenso)
              </button>
            </div>
          </div>
        </div>

        {/* 5 Core Operational Principles Bar (Parte 1) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs text-slate-300">
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-indigo-400 font-bold block mb-0.5">1. Zero E-mails</span>
            <p className="text-[11px] text-slate-400">Nenhum envio automático de confirmação, link ou aviso.</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-amber-400 font-bold block mb-0.5">2. Edição Bloqueada</span>
            <p className="text-[11px] text-slate-400">Botão [Editar] inativo para todos até liberação manual.</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-emerald-400 font-bold block mb-0.5">3. Liberação Direta</span>
            <p className="text-[11px] text-slate-400">Admin habilita a edição sem mensagem de aviso ao usuário.</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-sky-400 font-bold block mb-0.5">4. Contato Manual</span>
            <p className="text-[11px] text-slate-400">Comunicação externa apenas por e-mail manual ou telefone.</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-purple-400 font-bold block mb-0.5">5. Limite 200k</span>
            <p className="text-[11px] text-slate-400">Banco dimensionado com bloqueio rígido e alertas 180k/195k.</p>
          </div>
        </div>
      </div>

      {/* Notification banner if action was performed */}
      {notificationBanner && (
        <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-300 text-indigo-950 text-xs font-semibold flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />
            <span>{notificationBanner}</span>
          </div>
          <button
            onClick={() => setNotificationBanner(null)}
            className="text-xs font-bold text-indigo-700 hover:underline"
          >
            Dispensar
          </button>
        </div>
      )}

      {/* Internal Alerts Section (Parte 5 - Avisos APENAS dentro da plataforma, sem gerar e-mails) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <h3 className="font-bold text-sm text-slate-900">
              Alertas Internos do Sistema (Visíveis apenas ao Operador/Administrador)
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Parte 5: Nenhum alerta gera e-mail. Resolução manual obrigatória.
          </span>
        </div>

        <div className="space-y-2">
          {internalAlerts.filter((a) => !a.resolved).map((alt) => (
            <div
              key={alt.id}
              className={`p-3.5 rounded-2xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition ${
                alt.severity === 'warning'
                  ? 'bg-amber-50/80 border-amber-200 text-amber-950'
                  : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block">{alt.message}</span>
                  <span className="text-[10px] text-slate-500">{alt.date}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {alt.targetRecordId && (
                  <button
                    onClick={() => {
                      const found = registrationRecords.find((r) => r.id === alt.targetRecordId);
                      if (found) setViewingRecord(found);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 font-bold text-[11px] text-slate-700"
                  >
                    Examinar Cadastro
                  </button>
                )}
                <button
                  onClick={() => dismissAlert(alt.id)}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 font-bold text-[11px] text-white"
                >
                  Marcar como Resolvido
                </button>
              </div>
            </div>
          ))}
          {internalAlerts.filter((a) => !a.resolved).length === 0 && (
            <div className="text-center py-3 text-xs text-slate-500">
              ✅ Nenhum alerta pendente no momento. Todos os cadastros verificados manualmente.
            </div>
          )}
        </div>
      </div>

      {/* Terminal de Comandos Interativo (Parte 6) */}
      <div className="bg-slate-950 text-slate-100 rounded-3xl p-6 border border-slate-800 shadow-md space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <h3 className="font-mono font-bold text-xs text-emerald-400">
              Terminal Operacional do Sistema (Parte 6 — Comandos de Interação)
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Execute comandos digitando ou clicando nos atalhos
          </span>
        </div>

        {/* Command Shortcuts */}
        <div className="flex flex-wrap gap-2 text-xs font-mono">
          <button
            onClick={() => handleRunCommand('[iniciar-cadastro]')}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-sky-300 border border-slate-800 transition"
          >
            [iniciar-cadastro]
          </button>
          <button
            onClick={() => handleRunCommand('[novo-cadastro]')}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-sky-300 border border-slate-800 transition"
          >
            [novo-cadastro]
          </button>
          <button
            onClick={() => handleRunCommand('[status-banco]')}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-800 transition"
          >
            [status-banco]
          </button>
          <button
            onClick={() => handleRunCommand('[listar-pendentes]')}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-purple-300 border border-slate-800 transition"
          >
            [listar-pendentes]
          </button>
          <button
            onClick={() => handleRunCommand('[liberar-edicao-3]')}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-slate-800 transition"
          >
            [liberar-edicao-3]
          </button>
          <button
            onClick={() => handleRunCommand('[bloquear-usuario-2]')}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-rose-300 border border-slate-800 transition"
          >
            [bloquear-usuario-2]
          </button>
          <button
            onClick={() => handleRunCommand('[alterar-senha-4]')}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-800 transition"
          >
            [alterar-senha-4]
          </button>
        </div>

        {/* Terminal Input */}
        <div className="flex items-center gap-2">
          <span className="text-emerald-400 font-mono font-bold text-sm">$</span>
          <input
            type="text"
            placeholder="Digite um comando, ex: [status-banco] ou [liberar-edicao-ID] e pressione Enter..."
            value={terminalInput}
            onChange={(e) => setTerminalInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRunCommand();
            }}
            className="flex-1 bg-slate-900 text-slate-100 font-mono text-xs p-3 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500"
          />
          <button
            onClick={() => handleRunCommand()}
            className="px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs rounded-xl transition flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Executar</span>
          </button>
        </div>

        {/* Terminal Output Log */}
        <div className="max-h-48 overflow-y-auto space-y-2 bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 font-mono text-xs">
          {terminalHistory.map((item, idx) => (
            <div key={idx} className="space-y-0.5 border-b border-slate-800/60 pb-2 last:border-0 last:pb-0">
              <div className="flex items-center justify-between text-slate-400 text-[10px]">
                <span className="text-emerald-400 font-bold">$ {item.command}</span>
                <span>{item.time}</span>
              </div>
              <pre className="text-slate-200 whitespace-pre-wrap leading-relaxed text-[11px]">
                {item.output}
              </pre>
            </div>
          ))}
        </div>
      </div>

      {/* Main Table: Database Records (Parte 2, 3, 4) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              <span>Registros do Banco de Dados ({filteredRecords.length} listados)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Edição bloqueada por padrão. Liberação manual pelo Administrador por prazo definido.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por ID, nome, CPF/CNPJ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="p-2.5 pl-8 rounded-xl border border-slate-200 text-xs w-60 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
            </div>

            {/* Level Filter */}
            <select
              value={selectedLevelFilter}
              onChange={(e) => setSelectedLevelFilter(e.target.value)}
              className="p-2.5 rounded-xl border border-slate-200 text-xs text-slate-700 font-medium"
            >
              <option value="Todos">Todos os Níveis (0 a 6)</option>
              <option value="Nível 0 — Administrador Global">Nível 0 — Admin Global</option>
              <option value="Nível 1 — Operador / Gestor">Nível 1 — Operador</option>
              <option value="Nível 2 — Aluno">Nível 2 — Aluno</option>
              <option value="Nível 3 — Professor">Nível 3 — Professor</option>
              <option value="Nível 4 — Escola Pública Independente / Particular">Nível 4 — Escola Independente</option>
              <option value="Nível 5 — Escola Vinculada à Rede">Nível 5 — Escola Vinculada</option>
              <option value="Nível 6 — Prefeitura / Secretaria">Nível 6 — Secretaria / Prefeitura</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="p-2.5 rounded-xl border border-slate-200 text-xs text-slate-700 font-medium"
            >
              <option value="Todos">Todos os Status</option>
              <option value="Ativo">Ativo</option>
              <option value="Inativo">Inativo</option>
              <option value="Pendente">Pendente</option>
              <option value="Bloqueado">Bloqueado</option>
            </select>

            <button
              onClick={() => setShowNewRecordModal(true)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>Novo Registro</span>
            </button>
          </div>
        </div>

        {/* Records Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Nome / Entidade</th>
                <th className="p-3">Nível</th>
                <th className="p-3">Status</th>
                <th className="p-3">Edição Liberada?</th>
                <th className="p-3">Última Alteração</th>
                <th className="p-3 text-right">Ações Administrativas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-50/80 transition">
                  <td className="p-3 font-mono font-bold text-indigo-700">
                    #{String(rec.id).padStart(6, '0')}
                  </td>
                  <td className="p-3">
                    <strong className="text-slate-900 block">{rec.fullName}</strong>
                    <span className="text-[11px] text-slate-500">{rec.email || rec.phone}</span>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-medium text-[11px]">
                      {rec.level}
                    </span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        rec.status === 'Ativo'
                          ? 'bg-emerald-100 text-emerald-800'
                          : rec.status === 'Bloqueado'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {rec.status}
                    </span>
                  </td>
                  <td className="p-3">
                    {rec.editUnlocked ? (
                      <div className="space-y-0.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                          <Unlock className="w-3 h-3 text-emerald-600" />
                          LIBERADA
                        </span>
                        <span className="block text-[10px] text-slate-500 font-mono">
                          até {rec.editUnlockedUntil}
                        </span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold text-[10px]">
                        <Lock className="w-3 h-3 text-slate-400" />
                        Bloqueada
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-[11px] text-slate-500">
                    <span className="block font-medium text-slate-700">{rec.lastModified.date} às {rec.lastModified.time}</span>
                    <span className="text-[10px] text-slate-400">por {rec.lastModified.by}</span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Unlock button */}
                      {!rec.editUnlocked ? (
                        <button
                          onClick={() => handleUnlockEdit(rec.id, editingDuration)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold border border-emerald-200 transition text-[11px] flex items-center gap-1"
                          title="Liberar edição manual (Parte 4)"
                        >
                          <Unlock className="w-3 h-3 text-emerald-600" />
                          <span>Liberar ({editingDuration}h)</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            saveEditedRecord(rec.id, {}, 'Administrador (Bloqueio Antecipado)');
                            setNotificationBanner(`Edição bloqueada manualmente para [ID #${rec.id}].`);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold border border-amber-200 transition text-[11px] flex items-center gap-1"
                          title="Bloquear edição antes do prazo"
                        >
                          <Lock className="w-3 h-3 text-amber-600" />
                          <span>Bloquear</span>
                        </button>
                      )}

                      {/* View & Edit details */}
                      <button
                        onClick={() => setViewingRecord(rec)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition text-[11px] flex items-center gap-1"
                        title="Ver detalhes do cadastro"
                      >
                        <Eye className="w-3 h-3 text-slate-500" />
                        <span>Ver</span>
                      </button>

                      {/* Block/Unblock status */}
                      {rec.status === 'Ativo' ? (
                        <button
                          onClick={() => blockUserAccess(rec.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          title="Suspender acesso [bloquear-usuario-ID]"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => unblockUserAccess(rec.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                          title="Reativar acesso"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Visualizar / Editar Cadastro Individual (Parte 3 e 4) */}
      {viewingRecord && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-scaleUp max-h-[90vh] flex flex-col">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-mono font-bold text-sm">
                  #{String(viewingRecord.id).padStart(4, '0')}
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 block">
                    {viewingRecord.level}
                  </span>
                  <h3 className="text-base font-extrabold leading-tight">
                    {viewingRecord.fullName}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setViewingRecord(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto text-xs flex-1">
              {/* Edit status indicator & prompt rule */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    {viewingRecord.editUnlocked ? (
                      <>
                        <Unlock className="w-4 h-4 text-emerald-600" />
                        <span className="text-emerald-700">Edição Liberada (Válida até {viewingRecord.editUnlockedUntil})</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 text-slate-500" />
                        <span className="text-slate-700">Edição Bloqueada por Padrão</span>
                      </>
                    )}
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Última alteração: {viewingRecord.lastModified.date} às {viewingRecord.lastModified.time} por {viewingRecord.lastModified.by}
                  </p>
                </div>

                {!viewingRecord.editUnlocked ? (
                  <button
                    onClick={() => {
                      unlockEditForRecord(viewingRecord.id, 24);
                      const updated = registrationRecords.find((r) => r.id === viewingRecord.id);
                      if (updated) setViewingRecord({ ...updated, editUnlocked: true });
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm shrink-0"
                  >
                    🔓 Liberar Edição (24h)
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      saveEditedRecord(viewingRecord.id, {}, 'Administrador');
                      setViewingRecord({ ...viewingRecord, editUnlocked: false });
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs shrink-0"
                  >
                    🔒 Bloquear Agora
                  </button>
                )}
              </div>

              {/* Status explanation notice from Parte 4 */}
              {!viewingRecord.editUnlocked && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-950 text-[11px] leading-relaxed">
                  🔒 <strong>Regra do Sistema:</strong> "Edição bloqueada. Envie e-mail para <code className="font-mono font-bold text-amber-900">suporte@sistemaenem.com.br</code> solicitando a alteração."
                  Campos livres (como série do aluno, disciplinas do professor ou banco próprio da escola) continuam editáveis diretamente.
                </div>
              )}

              {/* Specific fields display */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Nome Completo / Entidade</span>
                  <span className="font-semibold text-slate-900">{viewingRecord.fullName}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">E-mail de Contato</span>
                  <span className="font-semibold text-slate-900">{viewingRecord.email || 'Não informado'}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Telefone</span>
                  <span className="font-semibold text-slate-900">{viewingRecord.phone || 'Não informado'}</span>
                </div>

                {viewingRecord.cpf && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block flex items-center justify-between">
                      <span>CPF</span>
                      <span className="text-rose-600 font-mono text-[9px]">[BLOQUEADO]</span>
                    </span>
                    <span className="font-mono font-semibold text-slate-900">{viewingRecord.cpf}</span>
                  </div>
                )}

                {viewingRecord.cnpj && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block flex items-center justify-between">
                      <span>CNPJ</span>
                      <span className="text-rose-600 font-mono text-[9px]">[BLOQUEADO]</span>
                    </span>
                    <span className="font-mono font-semibold text-slate-900">{viewingRecord.cnpj}</span>
                  </div>
                )}

                {viewingRecord.birthDate && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block flex items-center justify-between">
                      <span>Data de Nascimento</span>
                      <span className="text-rose-600 font-mono text-[9px]">[BLOQUEADO]</span>
                    </span>
                    <span className="font-semibold text-slate-900">{viewingRecord.birthDate}</span>
                  </div>
                )}

                {viewingRecord.currentGrade && (
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                    <span className="text-[10px] text-emerald-700 font-bold uppercase block flex items-center justify-between">
                      <span>Série Atual (Aluno)</span>
                      <span className="text-emerald-700 font-mono text-[9px]">[ALTERA DIRETO]</span>
                    </span>
                    <span className="font-bold text-emerald-950">{viewingRecord.currentGrade}</span>
                  </div>
                )}

                <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
                  <span className="text-[10px] text-purple-700 font-bold uppercase block flex items-center justify-between">
                    <span>Perfil de Aprendizagem</span>
                    <span className="text-purple-700 font-mono text-[9px]">[CONFIDENCIAL • LIVRE]</span>
                  </span>
                  <span className="font-bold text-purple-950">{viewingRecord.learningProfile}</span>
                </div>
              </div>

              {/* Reset Password Manual by Operator */}
              <div className="p-3.5 bg-slate-100 rounded-2xl flex items-center justify-between gap-3 text-xs">
                <div>
                  <strong className="text-slate-900 block">Redefinição Manual de Senha</strong>
                  <span className="text-[11px] text-slate-500">Comando [alterar-senha-ID] para suporte presencial/telefônico.</span>
                </div>
                <button
                  onClick={() => {
                    resetUserPasswordManual(viewingRecord.id, 'mudar123');
                    alert(`Senha do usuário #${viewingRecord.id} redefinida para "mudar123". Ele deverá alterar no próximo login.`);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 font-bold text-slate-700 text-xs"
                >
                  Redefinir para "mudar123"
                </button>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2 shrink-0">
              <button
                onClick={() => setViewingRecord(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
              >
                Fechar Visualização
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Novo Cadastro (Parte 3 — Campos de Cadastro por Nível) */}
      {showNewRecordModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-scaleUp max-h-[90vh] flex flex-col">
            <div className="bg-indigo-900 text-white p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <UserPlus className="w-5 h-5 text-indigo-300" />
                <h3 className="font-extrabold text-base">[novo-cadastro] • Registro Conforme Nível</h3>
              </div>
              <button
                onClick={() => setShowNewRecordModal(false)}
                className="text-indigo-300 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRecord} className="p-6 space-y-4 overflow-y-auto text-xs flex-1">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Selecione o Nível de Acesso:</label>
                <select
                  value={newLevel}
                  onChange={(e) => setNewLevel(e.target.value as RegistrationLevel)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Nível 0 — Administrador Global">Nível 0 — Administrador Global</option>
                  <option value="Nível 1 — Operador / Gestor">Nível 1 — Operador / Gestor</option>
                  <option value="Nível 2 — Aluno">Nível 2 — Aluno</option>
                  <option value="Nível 3 — Professor">Nível 3 — Professor</option>
                  <option value="Nível 4 — Escola Pública Independente / Particular">Nível 4 — Escola Independente / Particular</option>
                  <option value="Nível 5 — Escola Vinculada à Rede">Nível 5 — Escola Vinculada à Rede</option>
                  <option value="Nível 6 — Prefeitura / Secretaria">Nível 6 — Prefeitura / Secretaria</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nome Completo / Razão Social [obrigatório]:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: João da Silva Santos"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">E-mail [obrigatório]:</label>
                  <input
                    type="email"
                    required
                    placeholder="email@instituicao.gov.br"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Telefone [obrigatório]:</label>
                  <input
                    type="text"
                    required
                    placeholder="(11) 98765-4321"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Conditional level fields */}
              {(newLevel.includes('Nível 0') || newLevel.includes('Nível 1') || newLevel.includes('Nível 3')) && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">CPF [obrigatório — bloqueado após validação]:</label>
                  <input
                    type="text"
                    placeholder="000.000.000-00"
                    value={newCpf}
                    onChange={(e) => setNewCpf(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              )}

              {newLevel.includes('Nível 2 — Aluno') && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Data de Nascimento [bloqueado]:</label>
                    <input
                      type="text"
                      placeholder="DD/MM/AAAA"
                      value={newBirthDate}
                      onChange={(e) => setNewBirthDate(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Perfil de Aprendizagem [confidencial]:</label>
                    <select
                      value={newLearningProfile}
                      onChange={(e) => setNewLearningProfile(e.target.value as any)}
                      className="w-full p-3 rounded-xl border border-slate-200 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Padrão">Padrão</option>
                      <option value="TDAH">TDAH</option>
                      <option value="TEA">TEA</option>
                      <option value="Dislexia">Dislexia</option>
                      <option value="Combinado">Combinado</option>
                    </select>
                  </div>
                </div>
              )}

              {(newLevel.includes('Nível 4') || newLevel.includes('Nível 6')) && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">CNPJ [obrigatório — bloqueado]:</label>
                  <input
                    type="text"
                    placeholder="00.000.000/0001-00"
                    value={newCnpj}
                    onChange={(e) => setNewCnpj(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              )}

              <div className="p-3 bg-slate-50 rounded-xl text-slate-600 text-[11px] leading-relaxed border border-slate-200">
                🔒 <strong>Princípio 2 e 4:</strong> Ao criar o registro, o botão [Editar] será configurado como <strong>bloqueado por padrão</strong>. Nenhuma mensagem ou e-mail automático será disparado.
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewRecordModal(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md"
                >
                  Gravar Registro no Banco
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
