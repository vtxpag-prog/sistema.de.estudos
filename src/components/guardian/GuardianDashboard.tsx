import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Heart,
  ShieldCheck,
  Calendar,
  Sparkles,
  Flame,
  Award,
  BookOpen,
  Coffee,
  CheckCircle2,
  Smile,
  AlertCircle
} from 'lucide-react';

export const GuardianDashboard: React.FC = () => {
  const { stats, gradeLevel } = useApp();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Guardian Welcome Banner */}
      <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-indigo-950 text-white rounded-3xl p-6 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-rose-300 text-xs font-bold uppercase tracking-wider">
              <Heart className="w-4 h-4 text-rose-300 fill-rose-300" />
              <span>Nível 4 • Família & Responsáveis</span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight">
              Acompanhamento Afetuoso e Sem Pressão
            </h2>
            <p className="text-xs text-rose-100 max-w-2xl leading-relaxed">
              O sucesso no ENEM é construído com constância, carinho e respeito ao ritmo de cada jovem. Este espaço foi desenhado para você celebrar o esforço diário do seu filho.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-xs text-center self-start md:self-auto">
            <span className="block text-rose-200 font-semibold mb-0.5">Ano Escolar Atual</span>
            <span className="text-lg font-black text-white">{gradeLevel} do E.M.</span>
          </div>
        </div>
      </div>

      {/* Strict Health Privacy Assurance for Parents */}
      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="text-xs text-emerald-950 leading-relaxed">
          <span className="font-bold text-emerald-900 block mb-0.5">
            Privacidade e Respeito (Princípio 5):
          </span>
          Dados clínicos ou escolhas de adaptação neurológica não geram relatórios rotuladores. O estudante estuda com autonomia e você acompanha o que realmente importa: a construção saudável do hábito de aprender.
        </div>
      </div>

      {/* Positive Activity Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Hábito de Estudo</span>
            <h4 className="text-xl font-extrabold text-slate-900">
              {stats.streakDays} dias seguidos
            </h4>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
              Constância admirável!
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Dedicação Prática</span>
            <h4 className="text-xl font-extrabold text-slate-900">
              {stats.totalAnswered} exercícios
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Feitos no formato oficial do ENEM
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
            <Smile className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Produção Textual</span>
            <h4 className="text-xl font-extrabold text-slate-900">
              {stats.essaysSubmitted} redações
            </h4>
            <p className="text-[11px] text-indigo-600 font-semibold mt-0.5">
              Com orientação de IA pedagógica
            </p>
          </div>
        </div>
      </div>

      {/* Practical Family Guidance Cards */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <Coffee className="w-4 h-4 text-rose-600" />
          <span>Guia Prático: Como Apoiar nos Estudos em Casa</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Valorize a Constância, Não a Perfeição</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Praticar 20 a 30 minutos todos os dias gera resultados muito melhores do que estudar 6 horas seguidas na véspera. Elogie a persistência do seu jovem em abrir a plataforma.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Ambiente Calmo e Sem Comparações</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Evite comparações com primos ou colegas de classe. Para jovens com TDAH ou TEA, um ambiente silencioso e com pausas programadas faz toda a diferença para evitar estresse.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Errar Faz Parte do Aprendizado</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              No formato ENEM, distratores e pegadinhas exigem treino. Quando seu filho errar uma questão, pergunte: "O que a explicação pedagógica ensinou para a próxima vez?"
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Acolhimento na Redação</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              A redação do ENEM é um processo gradual: no 1º ano o foco é estrutura, no 2º é argumentar e só no 3º ano exige-se a proposta completa de intervenção. Incentive cada rascunho!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
