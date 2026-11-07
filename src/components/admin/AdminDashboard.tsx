import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Question, KnowledgeArea, GradeLevel } from '../../types';
import { generateQuestionAPI } from '../../services/api';
import { RegistrationHub } from '../registration/RegistrationHub';
import {
  Sparkles,
  Database,
  Sliders,
  PlusCircle,
  RefreshCw,
  CheckCircle2,
  Filter,
  Layers,
  BookOpen,
  Brain,
  ShieldAlert,
  Award,
  Users
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { questions, addQuestion, capacityCount, startOnboarding } = useApp();
  const [activeAdminTab, setActiveAdminTab] = useState<'banco_cadastros' | 'itens_ia'>('banco_cadastros');
  const [filterArea, setFilterArea] = useState<string>('Todas');
  const [filterGrade, setFilterGrade] = useState<string>('Todas');

  // Question generator state
  const [genArea, setGenArea] = useState<KnowledgeArea>('Ciências da Natureza e suas Tecnologias');
  const [genGrade, setGenGrade] = useState<GradeLevel>('1º ano');
  const [genTopic, setGenTopic] = useState<string>('Ecologia e Sustentabilidade');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [genSuccessMsg, setGenSuccessMsg] = useState<string | null>(null);

  const filteredQuestions = questions.filter((q) => {
    if (filterArea !== 'Todas' && q.area !== filterArea) return false;
    if (filterGrade !== 'Todas' && q.gradeLevel !== filterGrade) return false;
    return true;
  });

  const handleGenerateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setGenSuccessMsg(null);

    try {
      const generated = await generateQuestionAPI(genArea, genGrade, genTopic);
      const newQuestion: Question = {
        id: `gen-${Date.now()}`,
        title: generated.title || 'Questão inédita gerada',
        area: (generated.area as KnowledgeArea) || genArea,
        gradeLevel: generated.gradeLevel || genGrade,
        origin: 'Formato ENEM',
        topic: generated.topic || genTopic,
        bnccSkill: generated.bnccSkill || 'EM13CNT301',
        options: generated.options || [
          'Alternativa A',
          'Alternativa B',
          'Alternativa C',
          'Alternativa D',
          'Alternativa E',
        ],
        correctAnswer: generated.correctAnswer ?? 0,
        explanation: generated.explanation || 'Resolução comentada da questão.',
        simplifiedTEA: generated.simplifiedTEA,
      };

      addQuestion(newQuestion);
      setGenSuccessMsg(`Nova questão sobre "${genTopic}" gerada com sucesso e adicionada ao banco!`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Admin Top Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Nível 6 • Administração Central do Sistema</span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight">
              Calibragem Pedagógica e Banco de Questões
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 max-w-2xl leading-relaxed">
              Supervisão de parâmetros das redes neurais (Gemini 3.8 Flash), expansão contínua do banco de questões por habilidades da BNCC e monitoramento de acessibilidade.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={startOnboarding}
              className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition shadow-sm"
              title="Abrir o tour explicativo do Administrador"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-900" />
              <span>Tour do Admin</span>
            </button>

            <div className="flex items-center gap-2 bg-slate-800/80 px-4 py-2 rounded-2xl border border-slate-700 text-xs">
              <Database className="w-4 h-4 text-indigo-400" />
              <span className="font-bold text-white">{questions.length} questões</span>
              <span className="text-slate-400">no banco ativo</span>
            </div>
          </div>
        </div>

        {/* Global System Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-5 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-slate-400 block mb-0.5 font-medium">Capacidade do Banco</span>
            <span className="text-sm font-bold text-amber-300">200.000 Posições</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-slate-400 block mb-0.5 font-medium">Modelo Principal de IA</span>
            <span className="text-sm font-bold text-indigo-300">Gemini 3.8 Flash</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-slate-400 block mb-0.5 font-medium">Regras de Redação Ativas</span>
            <span className="text-sm font-bold text-emerald-300">C1 a C5 Gradual (1º a 3º ano)</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-slate-400 block mb-0.5 font-medium">Regra de Edição</span>
            <span className="text-sm font-bold text-purple-300">Bloqueada por Padrão</span>
          </div>
        </div>
      </div>

      {/* Admin Tab Switcher */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveAdminTab('banco_cadastros')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-xs whitespace-nowrap transition shadow-xs ${
            activeAdminTab === 'banco_cadastros'
              ? 'bg-indigo-600 text-white shadow-indigo-200'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Módulo 1.3: Banco de Dados & Liberação de Edição</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('itens_ia')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-xs whitespace-nowrap transition shadow-xs ${
            activeAdminTab === 'itens_ia'
              ? 'bg-indigo-600 text-white shadow-indigo-200'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Banco de Itens & Gerador ENEM (IA)</span>
        </button>
      </div>

      {activeAdminTab === 'banco_cadastros' ? (
        <RegistrationHub />
      ) : (
        <>
          {/* AI Question Generator Section */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-sm text-slate-900">
              Gerador Inteligente de Questões no Formato ENEM (com IA)
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Gera enunciado, 5 alternativas, gabarito e versão TEA direta
          </span>
        </div>

        <form onSubmit={handleGenerateQuestion} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Área do Conhecimento:</label>
              <select
                value={genArea}
                onChange={(e) => setGenArea(e.target.value as KnowledgeArea)}
                className="w-full p-3 rounded-xl border border-slate-200 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Linguagens, Códigos e suas Tecnologias">Linguagens e Códigos</option>
                <option value="Ciências Humanas e suas Tecnologias">Ciências Humanas</option>
                <option value="Ciências da Natureza e suas Tecnologias">Ciências da Natureza</option>
                <option value="Matemática e suas Tecnologias">Matemática</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Série Curricular Alvo:</label>
              <select
                value={genGrade}
                onChange={(e) => setGenGrade(e.target.value as GradeLevel)}
                className="w-full p-3 rounded-xl border border-slate-200 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="1º ano">1º ano (Conteúdo inicial + formato ENEM)</option>
                <option value="2º ano">2º ano (Aprofundamento intermediário)</option>
                <option value="3º ano">3º ano (Consolidação pré-ENEM)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Tópico Pedagógico / Tema:</label>
              <input
                type="text"
                required
                value={genTopic}
                onChange={(e) => setGenTopic(e.target.value)}
                placeholder="Ex: Ciclo do Carbono e Aquecimento Global"
                className="w-full p-3 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
              </input>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-500">
              ⚡ A questão gerada segue o padrão de itens do Inep/BNCC com contextualização realista.
            </span>

            <button
              type="submit"
              disabled={isGenerating}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-md transition flex items-center gap-2 disabled:bg-slate-300"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Gerando Item Pedagógico...</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  <span>Gerar e Inserir no Banco</span>
                </>
              )}
            </button>
          </div>
        </form>

        {genSuccessMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{genSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* Questions Bank Explorer */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-sm text-slate-900">Explorador do Banco de Questões</h3>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <select
              value={filterArea}
              onChange={(e) => setFilterArea(e.target.value)}
              className="p-2 rounded-xl border border-slate-200 text-slate-700 font-medium"
            >
              <option value="Todas">Todas as Áreas</option>
              <option value="Linguagens, Códigos e suas Tecnologias">Linguagens</option>
              <option value="Ciências Humanas e suas Tecnologias">Humanas</option>
              <option value="Ciências da Natureza e suas Tecnologias">Natureza</option>
              <option value="Matemática e suas Tecnologias">Matemática</option>
            </select>

            <select
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value)}
              className="p-2 rounded-xl border border-slate-200 text-slate-700 font-medium"
            >
              <option value="Todas">Todas as Séries</option>
              <option value="1º ano">1º ano</option>
              <option value="2º ano">2º ano</option>
              <option value="3º ano">3º ano</option>
            </select>
          </div>
        </div>

        <div className="space-y-3">
          {filteredQuestions.map((q) => (
            <div
              key={q.id}
              className="p-4 rounded-2xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 transition text-xs space-y-2"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                    {q.gradeLevel}
                  </span>
                  <span className="text-slate-500 font-medium">{q.area}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-600 font-semibold">{q.topic}</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-medium">
                  {q.origin}
                </span>
              </div>

              <p className="text-slate-800 leading-relaxed font-medium line-clamp-2">
                {q.title}
              </p>

              <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px] text-slate-500">
                <span>Gabarito: Letra {String.fromCharCode(65 + q.correctAnswer)}</span>
                {q.simplifiedTEA && (
                  <span className="text-teal-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Adaptação TEA disponível
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      </>
      )}
    </div>
  );
};
