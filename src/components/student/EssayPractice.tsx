import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { EssayTheme, EssayCorrectionResult } from '../../types';
import { gradeEssayAPI } from '../../services/api';
import { EssayCompetence1Submission } from './EssayCompetence1Submission';
import { AiEssayGraderModule } from './AiEssayGraderModule';
import { EssayCompetenciesEvolutionModule } from './EssayCompetenciesEvolutionModule';
import {
  PenTool,
  Sparkles,
  BookOpen,
  Award,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  RefreshCw,
  FileText,
  Volume2,
  Lightbulb,
  Heart,
  SpellCheck,
  Mic,
  TrendingUp,
} from 'lucide-react';

export const EssayPractice: React.FC = () => {
  const {
    gradeLevel,
    accessibility,
    essayThemes,
    incrementEssayCount,
    speakText,
    isSpeaking,
    stopSpeaking,
  } = useApp();

  const [subMode, setSubMode] = useState<'completa' | 'competencia1' | 'evolucao'>('completa');

  return (
    <div className="space-y-6">
      {/* Submode Selector Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 bg-slate-200/80 rounded-2xl">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSubMode('completa')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 ${
              subMode === 'completa'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-300/50'
            }`}
          >
            <Award className="w-4 h-4 text-emerald-300" />
            <span>Correção com IA: 5 Competências ENEM</span>
            <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-emerald-500/30 text-emerald-200 uppercase font-extrabold">
              Voz & TDAH/TEA
            </span>
          </button>

          <button
            onClick={() => setSubMode('competencia1')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              subMode === 'competencia1'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-300/50'
            }`}
          >
            <SpellCheck className="w-4 h-4 text-amber-300" />
            <span>Laboratório Competência 1 (Gramática & Desvios)</span>
          </button>

          <button
            onClick={() => setSubMode('evolucao')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 ${
              subMode === 'evolucao'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-300/50'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-indigo-300" />
            <span>Evolução nas 5 Competências</span>
            <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-amber-400 text-slate-950 uppercase font-black">
              Recharts
            </span>
          </button>
        </div>

        <div className="text-xs text-slate-600 font-semibold px-2 hidden sm:block">
          Modo: <strong className="text-indigo-900">{gradeLevel} do E.M.</strong>
        </div>
      </div>

      {/* RENDER SELECTED SUBMODE */}
      {subMode === 'completa' ? (
        <AiEssayGraderModule />
      ) : subMode === 'competencia1' ? (
        <EssayCompetence1Submission />
      ) : (
        <EssayCompetenciesEvolutionModule />
      )}
    </div>
  );
};
