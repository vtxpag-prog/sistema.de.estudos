import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SecretariatRelationshipsModule } from './SecretariatRelationshipsModule';
import {
  Landmark,
  School,
  Building2,
  TrendingUp,
  Award,
  Users,
  Download,
  CheckCircle2,
  MapPin,
  ShieldCheck,
  Search,
  Filter,
  BarChart3,
  Layers,
  Sparkles
} from 'lucide-react';

export const EducationSecretariatDashboard: React.FC = () => {
  const { schools, classGroups, startOnboarding } = useApp();
  const [secretariatTab, setSecretariatTab] = useState<'rede' | 'geral'>('rede');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMunicipality, setSelectedMunicipality] = useState('Todos');
  const [exportFeedback, setExportFeedback] = useState(false);

  const filteredSchools = schools.filter((sch) => {
    const matchesSearch = sch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sch.inepCode.includes(searchTerm) ||
      sch.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMun = selectedMunicipality === 'Todos' || sch.city === selectedMunicipality;
    return matchesSearch && matchesMun;
  });

  const totalStudentsInNetwork = schools.reduce((acc, s) => acc + s.activeStudents, 0);
  const totalTeachersInNetwork = schools.reduce((acc, s) => acc + s.activeTeachers, 0);

  return (
    <div className="space-y-6">
      {/* Secretariat Top Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 shadow-md border border-purple-800/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-indigo-800/80">
          <div>
            <div className="flex items-center gap-2 text-purple-300 text-xs font-bold uppercase tracking-wider mb-1">
              <Landmark className="w-4 h-4 text-purple-400" />
              <span>Usuário Institucional • Secretaria de Educação</span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight">
              Gestão de Redes Escolares e Indicadores ENEM
            </h2>
            <p className="text-xs text-indigo-200 mt-1 max-w-2xl leading-relaxed">
              Acompanhamento centralizado das escolas públicas da jurisdição, adesão autônoma sem contratos comerciais e garantia de equidade formativa.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={startOnboarding}
              className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 px-3.5 py-2.5 rounded-2xl font-bold text-xs shadow-md transition"
              title="Abrir o tour explicativo da Secretaria"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-900" />
              <span>Tour da Secretaria</span>
            </button>

            <button
              onClick={() => {
                setExportFeedback(true);
                setTimeout(() => setExportFeedback(false), 3000);
              }}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2.5 rounded-2xl font-bold text-xs shadow-md transition"
            >
              <Download className="w-4 h-4" />
              <span>{exportFeedback ? 'Exportado com Sucesso!' : 'Exportar Dados da Rede'}</span>
            </button>
          </div>
        </div>

        {/* Aggregate Network Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-5 text-xs">
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
            <span className="text-purple-200 font-medium block">Escolas Integradas na Rede</span>
            <span className="text-2xl font-black text-white mt-1 block">{schools.length} unidades</span>
            <span className="text-[10px] text-emerald-300 font-semibold">100% acesso gratuito garantido</span>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
            <span className="text-purple-200 font-medium block">Estudantes Ativos no ENEM</span>
            <span className="text-2xl font-black text-white mt-1 block">
              {totalStudentsInNetwork.toLocaleString('pt-BR')} alunos
            </span>
            <span className="text-[10px] text-sky-300 font-semibold">Ensino Médio Regular e Noturno</span>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
            <span className="text-purple-200 font-medium block">Professores Co-Pilotos</span>
            <span className="text-2xl font-black text-white mt-1 block">
              {totalTeachersInNetwork} docentes
            </span>
            <span className="text-[10px] text-amber-300 font-semibold">Listas com proporção curricular</span>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
            <span className="text-purple-200 font-medium block">Autonomia das Unidades</span>
            <span className="text-2xl font-black text-white mt-1 block">Princípio 4</span>
            <span className="text-[10px] text-purple-200 font-semibold">Adesão idêntica a colégios privados</span>
          </div>
        </div>
      </div>

      {/* Navegação de Abas da Secretaria */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSecretariatTab('rede')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-xs whitespace-nowrap transition border ${
            secretariatTab === 'rede'
              ? 'bg-purple-700 text-white border-purple-700 shadow-sm'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Rede de Escolas da Jurisdição & Vínculos</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            secretariatTab === 'rede' ? 'bg-purple-900 text-white' : 'bg-purple-100 text-purple-800'
          }`}>
            CNPJ Oficial
          </span>
        </button>

        <button
          onClick={() => setSecretariatTab('geral')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-xs whitespace-nowrap transition border ${
            secretariatTab === 'geral'
              ? 'bg-purple-700 text-white border-purple-700 shadow-sm'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <School className="w-4 h-4" />
          <span>Diretório Geral de Unidades & Equidade</span>
          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
            secretariatTab === 'geral' ? 'bg-purple-900 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            {schools.length} Escolas
          </span>
        </button>
      </div>

      {/* ABA 1: REDE DE ESCOLAS DA JURISDIÇÃO & VÍNCULOS */}
      {secretariatTab === 'rede' && <SecretariatRelationshipsModule />}

      {/* ABA 2: DIRETÓRIO GERAL & EQUIDADE */}
      {secretariatTab === 'geral' && (
        <div className="space-y-6">
          {/* Equity and Pedagogical Health Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
            <BarChart3 className="w-4 h-4" />
            <span>Média de Redações na Rede</span>
          </div>
          <div className="text-2xl font-black text-slate-900">742 pts</div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Evolução de +85 pontos entre o 1º ano (foco C1+C3) e o 3º ano (proposta de intervenção completa C1 a C5).
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
            <ShieldCheck className="w-4 h-4" />
            <span>Inclusão Plena Monitorada</span>
          </div>
          <div className="text-2xl font-black text-slate-900">100% Confidencial</div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Adaptações automáticas para TDAH, TEA e Dislexia atendendo às diretrizes de equidade sem exposição de laudos médicos.
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-purple-700 font-bold text-sm">
            <Layers className="w-4 h-4" />
            <span>Engajamento Escolar</span>
          </div>
          <div className="text-2xl font-black text-slate-900">89.4%</div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Frequência média semanal nos exercícios graduais nos últimos 30 dias de aula.
          </p>
        </div>
      </div>

      {/* Schools Directory of the Secretariat */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <School className="w-4 h-4 text-purple-600" />
            <span>Escolas da Rede Jurisdicional</span>
          </h3>

          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar escola por nome, cidade ou INEP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="p-2 pl-8 rounded-xl border border-slate-200 text-xs w-64 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {filteredSchools.map((sch) => (
            <div
              key={sch.id}
              className="p-4 rounded-2xl border border-slate-200 hover:border-purple-300 bg-slate-50/50 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900">{sch.name}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                    {sch.type}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {sch.city} - {sch.state}
                  </span>
                  <span>•</span>
                  <span>INEP: {sch.inepCode}</span>
                  <span>•</span>
                  <span>Chave de Acesso: <strong className="font-mono text-purple-700">{sch.autonomousAccessCode}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-6 text-xs">
                <div className="text-right">
                  <span className="font-bold text-slate-900 block">{sch.activeStudents} estudantes</span>
                  <span className="text-[11px] text-slate-500">{sch.activeTeachers} professores</span>
                </div>

                <button
                  onClick={() => alert(`Acesso institucional da escola ${sch.name} validado com sucesso!`)}
                  className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold border border-purple-200 text-xs transition"
                >
                  Auditar Escola
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>
      )}
    </div>
  );
};
