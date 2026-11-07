import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SchoolRelationshipsModule } from './SchoolRelationshipsModule';
import { SchoolData } from '../../types';
import {
  School,
  Building,
  CheckCircle2,
  KeyRound,
  Download,
  Users,
  Award,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  MapPin,
  FileCheck
} from 'lucide-react';

export const SchoolDashboard: React.FC = () => {
  const { schools, addSchool, startOnboarding } = useApp();
  const [schoolTab, setSchoolTab] = useState<'rede' | 'autonoma'>('rede');
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [schoolName, setSchoolName] = useState('');
  const [inepCode, setInepCode] = useState('');
  const [schoolType, setSchoolType] = useState<SchoolData['type']>('Pública Estadual');
  const [city, setCity] = useState('');
  const [state, setState] = useState('SP');
  const [successCode, setSuccessCode] = useState<string | null>(null);

  const handleJoinSchool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolName.trim()) return;

    const generatedCode = `${schoolName.slice(0, 4).toUpperCase().replace(/\s/g, '')}-ENEM-LIVRE`;
    const newSchool: SchoolData = {
      id: `school-${Date.now()}`,
      name: schoolName,
      inepCode: inepCode || '12345678',
      type: schoolType,
      city: city || 'São Paulo',
      state: state || 'SP',
      activeStudents: 1,
      activeTeachers: 1,
      autonomousAccessCode: generatedCode,
      joinedAt: new Date().toLocaleDateString('pt-BR'),
    };

    addSchool(newSchool);
    setSuccessCode(generatedCode);
    setSchoolName('');
    setInepCode('');
    setShowJoinModal(false);
  };

  return (
    <div className="space-y-6">
      {/* School Top Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                Nível 3 • Gestão Escolar & Coordenação
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                Princípio 4: Autonomia Escolar Plena
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Adesão Autônoma e Painel Institucional
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Qualquer escola pública ou comunitária pode aderir imediatamente sem burocracia ou convênio governamental. Acesso 100% idêntico às escolas particulares.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={startOnboarding}
              className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 px-3.5 py-2.5 rounded-2xl font-bold text-xs transition shadow-2xs"
              title="Abrir o tour explicativo da Escola"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Tour da Escola</span>
            </button>

            <button
              onClick={() => setShowJoinModal(true)}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-2xl font-bold text-xs shadow-md transition"
            >
              <KeyRound className="w-4 h-4" />
              <span>Aderir Minha Escola Gratuitamente</span>
            </button>
          </div>
        </div>

        {/* Success code alert if just registered */}
        {successCode && (
          <div className="mt-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs flex items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                Escola cadastrada com sucesso! Código de acesso gerado para seus alunos: 
                <strong className="font-mono text-sm ml-1 bg-white px-2 py-0.5 rounded border border-emerald-300">
                  {successCode}
                </strong>
              </span>
            </div>
            <button
              onClick={() => setSuccessCode(null)}
              className="text-xs font-bold text-emerald-800 hover:underline"
            >
              Fechar
            </button>
          </div>
        )}
      </div>

      {/* Navegação de Abas da Escola */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSchoolTab('rede')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-xs whitespace-nowrap transition border ${
            schoolTab === 'rede'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Gestão da Rede Institucional & Vínculos</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            schoolTab === 'rede' ? 'bg-indigo-700 text-white' : 'bg-emerald-100 text-emerald-800'
          }`}>
            CNPJ Oficial
          </span>
        </button>

        <button
          onClick={() => setSchoolTab('autonoma')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-xs whitespace-nowrap transition border ${
            schoolTab === 'autonoma'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Adesão Autônoma & Chaves de Acesso</span>
          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
            schoolTab === 'autonoma' ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            {schools.length} Unidades
          </span>
        </button>
      </div>

      {/* ABA 1: REDE DE PROFESSORES, TURMAS & SECRETARIA */}
      {schoolTab === 'rede' && <SchoolRelationshipsModule />}

      {/* ABA 2: ADESÃO AUTÔNOMA & RECURSOS */}
      {schoolTab === 'autonoma' && (
        <div className="space-y-6">
          {/* Principle 4 Feature Highlight */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-3xl bg-indigo-50/70 border border-indigo-200/80 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                <Building className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Autonomia Total da Direção</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                A escola não depende de autorizações lentas de secretarias. A coordenação clica, gera a chave de acesso e distribui aos professores em menos de 1 minuto.
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-emerald-50/70 border border-emerald-200/80 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                <Award className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Equidade Sem Distinção</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Uma escola rural ou da periferia acessa rigorosamente a mesma inteligência artificial, banco de questões e recursos adaptados que colégios privados de elite.
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-purple-50/70 border border-purple-200/80 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Métricas Pedagógicas BNCC</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Relatórios prontos para os conselhos de classe indicando quais competências da Matriz do ENEM precisam de reforço intensivo na unidade escolar.
              </p>
            </div>
          </div>

          {/* Registered Schools List */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <School className="w-4 h-4 text-indigo-600" />
                <span>Unidades Escolares Integradas à Plataforma</span>
              </h3>
              <span className="text-xs font-semibold text-slate-500">
                {schools.length} instituições ativas
              </span>
            </div>

            <div className="space-y-3">
              {schools.map((sch) => (
                <div
                  key={sch.id}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{sch.name}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                        {sch.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {sch.city} - {sch.state}
                      </span>
                      <span>•</span>
                      <span>Código INEP: {sch.inepCode}</span>
                      <span>•</span>
                      <span>Adesão: {sch.joinedAt}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <div className="text-right">
                      <span className="font-bold text-slate-900 block">{sch.activeStudents} alunos</span>
                      <span className="text-[11px] text-slate-500">{sch.activeTeachers} professores</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-slate-200 font-mono font-bold text-indigo-700 text-xs shadow-2xs">
                      {sch.autonomousAccessCode}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Join School */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 animate-scaleUp space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <School className="w-5 h-5 text-emerald-600" />
                Adesão Autônoma da Escola
              </h3>
              <button
                onClick={() => setShowJoinModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleJoinSchool} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nome da Escola:</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: E.E. Raul Brasil"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Código INEP (opcional):</label>
                  <input
                    type="text"
                    placeholder="Ex: 35012345"
                    value={inepCode}
                    onChange={(e) => setInepCode(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tipo de Gestão:</label>
                  <select
                    value={schoolType}
                    onChange={(e) => setSchoolType(e.target.value as any)}
                    className="w-full p-3 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                  >
                    <option value="Pública Estadual">Pública Estadual</option>
                    <option value="Pública Municipal">Pública Municipal</option>
                    <option value="Federal / IF">Federal / IF</option>
                    <option value="Particular Comunitária">Particular Comunitária</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Cidade:</label>
                  <input
                    type="text"
                    placeholder="Ex: Salvador"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Estado (UF):</label>
                  <input
                    type="text"
                    maxLength={2}
                    placeholder="Ex: BA"
                    value={state}
                    onChange={(e) => setState(e.target.value.toUpperCase())}
                    className="w-full p-3 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase"
                  />
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-950 leading-relaxed text-[11px]">
                ✅ <strong>Princípio 1 & 4:</strong> Nenhum dado financeiro será solicitado, agora ou no futuro. A liberação institucional é instantânea.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md"
                >
                  Concluir Adesão Gratuita
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
