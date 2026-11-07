import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Cpu,
  Activity,
  Server,
  AlertTriangle,
  CheckCircle2,
  Users,
  KeyRound,
  Sparkles,
  HelpCircle,
  Clock,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

export const OperatorDashboard: React.FC = () => {
  const { usersList, questions, startOnboarding } = useApp();
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'resolved'>('all');

  const [tickets, setTickets] = useState([
    {
      id: 'tk-101',
      sender: 'E.E. Maria da Glória (Campinas/SP)',
      subject: 'Liberação de novo bloco de 120 alunos do 1º ano',
      status: 'Concluído',
      priority: 'Normal',
      time: 'Há 12 min',
    },
    {
      id: 'tk-102',
      sender: 'Prof. Carlos Eduardo',
      subject: 'Dúvida sobre proporção 70/20/10 no simulado do 2º ano',
      status: 'Em Análise',
      priority: 'Baixa',
      time: 'Há 45 min',
    },
    {
      id: 'tk-103',
      sender: 'Secretaria Regional Campinas',
      subject: 'Geração de relatório consolidado para conselho escolar',
      status: 'Concluído',
      priority: 'Média',
      time: 'Há 2 horas',
    },
  ]);

  const pendingUsersCount = usersList.filter((u) => u.mustChangePassword).length;

  return (
    <div className="space-y-6">
      {/* Operator Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Cpu className="w-4 h-4 text-amber-400" />
              <span>Gerenciador do Sistema • Operadores</span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight">
              Monitoramento Operacional e Suporte Pedagógico
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 max-w-2xl leading-relaxed">
              Painel de triagem em tempo real, monitoramento da integridade da IA Gemini e auditoria de segurança das contas de usuários.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={startOnboarding}
              className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition shadow-sm"
              title="Abrir o tour explicativo do Operador"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-900" />
              <span>Tour do Operador</span>
            </button>

            <div className="flex items-center gap-2 bg-emerald-950/80 border border-emerald-500/40 px-3.5 py-2 rounded-2xl text-xs text-emerald-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-bold">Serviços 100%</span>
            </div>
          </div>
        </div>

        {/* Live System Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-5 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span>IA Pedagógica (Gemini)</span>
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <span className="text-base font-bold text-white">Gemini 3.8 Flash</span>
            <span className="text-[10px] text-emerald-400 block mt-0.5">Latência média: 420ms</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span>Contas Auditadas</span>
              <Users className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <span className="text-base font-bold text-white">{usersList.length} Usuários</span>
            <span className="text-[10px] text-amber-300 block mt-0.5">
              {pendingUsersCount} aguardando 1º login
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span>Banco de Questões</span>
              <Activity className="w-3.5 h-3.5 text-sky-400" />
            </div>
            <span className="text-base font-bold text-white">{questions.length} Questões</span>
            <span className="text-[10px] text-sky-300 block mt-0.5">Com versão TEA e BNCC</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span>Nível de Segurança</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <span className="text-base font-bold text-white">Troca Obrigatória Ativa</span>
            <span className="text-[10px] text-emerald-400 block mt-0.5">Senha mudar123 protegida</span>
          </div>
        </div>
      </div>

      {/* Account Security Audit List */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-amber-600" />
            <span>Auditoria de Contas de Acesso e Status de Senha</span>
          </h3>
          <span className="text-xs text-slate-500 font-semibold">
            {usersList.length} contas cadastradas
          </span>
        </div>

        <div className="space-y-2.5">
          {usersList.map((user) => (
            <div
              key={user.id}
              className="p-3.5 rounded-2xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{user.name}</span>
                  <span className="font-mono text-[11px] bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded">
                    @{user.username}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 uppercase">
                    {user.role}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">{user.organization || user.email}</p>
              </div>

              <div className="flex items-center gap-3">
                {user.mustChangePassword ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-100 text-amber-900 font-bold text-[11px]">
                    <Clock className="w-3 h-3 text-amber-600" />
                    Pendente Troca Obrigatória (mudar123)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-900 font-bold text-[11px]">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Senha Pessoal Ativa
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Operational Tickets Queue */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-600" />
            <span>Fila de Chamados e Demandas das Escolas</span>
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            Atendimento imediato
          </span>
        </div>

        <div className="space-y-2.5 text-xs">
          {tickets.map((tk) => (
            <div
              key={tk.id}
              className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-500 text-[10px]">{tk.id}</span>
                  <strong className="text-slate-900">{tk.subject}</strong>
                </div>
                <p className="text-[11px] text-slate-500">
                  Origem: {tk.sender} • {tk.time}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                  tk.status === 'Concluído' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {tk.status}
                </span>
                <button
                  onClick={() => alert(`Chamado ${tk.id} atualizado!`)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700"
                >
                  Gerenciar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
