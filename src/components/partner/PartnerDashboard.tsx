import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { EducationalPartner } from '../../types';
import {
  Building2,
  HeartHandshake,
  Award,
  Globe,
  Sparkles,
  Users,
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  PlusCircle,
  ShieldCheck,
  Compass
} from 'lucide-react';

export const PartnerDashboard: React.FC = () => {
  const { partners, addPartner } = useApp();
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [type, setType] = useState<EducationalPartner['type']>('Universidade');
  const [scholarships, setScholarships] = useState(250);
  const [sponsoredHours, setSponsoredHours] = useState(10000);

  const totalScholarships = partners.reduce((acc, p) => acc + p.freeScholarships, 0);
  const totalHours = partners.reduce((acc, p) => acc + p.sponsoredHours, 0);

  const handleRegisterPartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newP: EducationalPartner = {
      id: `partner-${Date.now()}`,
      name,
      tagline: tagline || 'Apoiador Oficial da Educação Inclusiva no Brasil',
      logo: type === 'Universidade' ? '🎓' : type === 'Fundação Social' ? '🤝' : '⚡',
      type,
      freeScholarships: Number(scholarships) || 100,
      sponsoredHours: Number(sponsoredHours) || 5000,
      opportunitiesOffered: [
        'Isenções completas no processo seletivo',
        'Vagas sociais com acompanhamento pedagógico',
        'Cotas integrais garantidas por mérito de evolução no ENEM',
      ],
    };

    addPartner(newP);
    setName('');
    setTagline('');
    setShowPartnerModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Partner Hero Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-indigo-800/80">
          <div>
            <div className="flex items-center gap-2 text-sky-300 text-xs font-bold uppercase tracking-wider mb-1">
              <Globe className="w-4 h-4 text-sky-400" />
              <span>Nível 5 • Parceiros Educacionais & Sustentabilidade</span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight">
              Sustentabilidade que Garante Gratuidade Real
            </h2>
            <p className="text-xs text-indigo-200 mt-1 max-w-2xl leading-relaxed">
              O Princípio 1 e 6 garantem que o aluno <strong>nunca pague nada</strong> e nunca veja publicidade nociva. Universidades, fundações e institutos mantêm a infraestrutura e conectam estudantes a bolsas de estudo.
            </p>
          </div>

          <button
            onClick={() => setShowPartnerModal(true)}
            className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-5 py-2.5 rounded-2xl font-bold text-xs shadow-md transition self-start md:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Cadastrar Instituição Parceira</span>
          </button>
        </div>

        {/* Global Social Impact Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5">
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
            <span className="text-xs text-sky-200 font-medium block">
              Bolsas 100% Universitárias Ofertadas
            </span>
            <span className="text-2xl font-black text-white mt-1 block">
              {totalScholarships.toLocaleString('pt-BR')} vagas
            </span>
            <span className="text-[10px] text-emerald-300 font-semibold">
              Destinadas exclusivamente a baixa renda e escola pública
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
            <span className="text-xs text-sky-200 font-medium block">
              Horas de Estudo Gratuito Mantidas
            </span>
            <span className="text-2xl font-black text-white mt-1 block">
              {totalHours.toLocaleString('pt-BR')} horas
            </span>
            <span className="text-[10px] text-sky-300 font-semibold">
              Sem custo de servidores ou IA para o estudante
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
            <span className="text-xs text-sky-200 font-medium block">
              Compromisso ODS 4 da ONU
            </span>
            <span className="text-2xl font-black text-white mt-1 block">
              Educação Inclusiva
            </span>
            <span className="text-[10px] text-amber-300 font-semibold">
              Meta 4.1 e 4.5: Igualdade de gênero e neuroinclusão
            </span>
          </div>
        </div>
      </div>

      {/* Partners List & Opportunities Showcase */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-600" />
            <span>Instituições Parceiras Mantenedoras</span>
          </h3>
          <span className="text-xs font-semibold text-slate-500">
            {partners.length} parceiros credenciados
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {partners.map((partner) => (
            <div
              key={partner.id}
              className="p-5 rounded-3xl border border-slate-200 hover:border-indigo-300 bg-slate-50/50 transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
                    {partner.logo}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                    {partner.type}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-slate-900">{partner.name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{partner.tagline}</p>
                </div>

                <div className="pt-2 border-t border-slate-200/60 space-y-1.5 text-xs text-slate-700">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Oportunidades Oferecidas:
                  </span>
                  {partner.opportunitiesOffered.map((op, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-[11px] text-slate-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{op}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                <span className="font-bold text-indigo-700">
                  {partner.freeScholarships} bolsas sociais
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  {partner.sponsoredHours.toLocaleString()}h financiadas
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Register Partner */}
      {showPartnerModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 animate-scaleUp space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-indigo-600" />
                Cadastrar Nova Instituição Parceira
              </h3>
              <button
                onClick={() => setShowPartnerModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegisterPartner} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nome da Instituição ou Universidade:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Pontifícia Universidade Social"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tipo de Parceria:</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                >
                  <option value="Universidade">Universidade (Bolsas e Vagas Sociais)</option>
                  <option value="Fundação Social">Fundação Social (Conectividade e Inclusão)</option>
                  <option value="Instituto Educacional">Instituto Educacional (Apoio Pedagógico)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Lema / Missão Social de Apoio:
                </label>
                <input
                  type="text"
                  placeholder="Ex: Oportunidade real para a juventude da escola pública"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Vagas/Bolsas Sociais:
                  </label>
                  <input
                    type="number"
                    value={scholarships}
                    onChange={(e) => setScholarships(Number(e.target.value))}
                    className="w-full p-3 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Horas Financiadas:
                  </label>
                  <input
                    type="number"
                    value={sponsoredHours}
                    onChange={(e) => setSponsoredHours(Number(e.target.value))}
                    className="w-full p-3 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-indigo-50 rounded-xl text-indigo-950 text-[11px] leading-relaxed">
                🤝 <strong>Princípio 6:</strong> O apoio garante que os dados dos estudantes nunca sejam comercializados e que a gratuidade permaneça vitalícia.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPartnerModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md"
                >
                  Confirmar Parceria
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
