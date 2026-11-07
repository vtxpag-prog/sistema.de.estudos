import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Volume2,
  VolumeX,
  Eye,
  Type,
  Brain,
  Sparkles,
  Sliders,
  X,
  Compass,
  CheckCircle2,
  Maximize2
} from 'lucide-react';

export const AccessibilityToolbar: React.FC = () => {
  const { accessibility, updateAccessibility, isSpeaking, stopSpeaking } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating trigger button */}
      <div className="fixed bottom-5 right-5 z-40 flex items-center gap-2">
        {isSpeaking && (
          <button
            onClick={stopSpeaking}
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-3 py-2 rounded-full shadow-lg font-medium text-xs animate-pulse transition"
            title="Parar áudio"
          >
            <VolumeX className="w-4 h-4" />
            Parar Voz
          </button>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-full shadow-xl font-semibold text-sm transition transform hover:scale-105"
          aria-label="Abrir recursos de acessibilidade e neuroinclusão"
        >
          <Sliders className="w-4 h-4" />
          <span>Acessibilidade</span>
          {(accessibility.tdahMode || accessibility.teaMode || accessibility.dyslexiaMode || accessibility.focusMode) && (
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
          )}
          {accessibility.focusMode && (
            <span className="text-[10px] bg-emerald-500/20 text-emerald-200 px-1.5 py-0.5 rounded font-bold border border-emerald-400/40 hidden sm:inline">
              Foco ON
            </span>
          )}
        </button>
      </div>

      {/* Floating panel modal */}
      {isOpen && (
        <div className="fixed bottom-20 right-5 z-50 w-96 max-w-[calc(100vw-2rem)] bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-2xl p-5 text-slate-800 transition">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-base text-slate-900">Acessibilidade Inclusiva</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
              aria-label="Fechar painel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-4 space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            {/* Perfis Rápidos */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Adaptações Específicas (Confidenciais)
              </p>

              {/* Modo Foco (TEA) */}
              <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                accessibility.focusMode
                  ? 'border-emerald-500 bg-emerald-50/80 shadow-xs'
                  : 'border-slate-200 hover:bg-emerald-50/40'
              }`}>
                <input
                  type="checkbox"
                  checked={accessibility.focusMode}
                  onChange={(e) => updateAccessibility({ focusMode: e.target.checked })}
                  className="mt-1 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900">
                    <Maximize2 className="w-4 h-4 text-emerald-600" />
                    <span>Modo Foco (TEA & Neuroinclusão)</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                      Recomendado TEA
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Simplifica a interface, remove distrações visuais e animações, diminui a densidade de informações e amplia o espaçamento entre elementos.
                  </p>
                </div>
              </label>

              {/* TDAH */}
              <label className="flex items-start gap-3 p-2.5 rounded-xl border border-slate-200 hover:bg-indigo-50/50 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={accessibility.tdahMode}
                  onChange={(e) => updateAccessibility({ tdahMode: e.target.checked })}
                  className="mt-1 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <div className="flex items-center gap-1.5 font-semibold text-sm text-slate-900">
                    <Brain className="w-4 h-4 text-purple-600" />
                    Modo TDAH
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Blocos de 15-20 min, 1 questão por vez, aviso de confirmação anti-impulso.
                  </p>
                </div>
              </label>

              {/* TEA */}
              <label className="flex items-start gap-3 p-2.5 rounded-xl border border-slate-200 hover:bg-indigo-50/50 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={accessibility.teaMode}
                  onChange={(e) => updateAccessibility({ teaMode: e.target.checked })}
                  className="mt-1 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <div className="flex items-center gap-1.5 font-semibold text-sm text-slate-900">
                    <CheckCircle2 className="w-4 h-4 text-teal-600" />
                    Modo TEA
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Estrutura fixa, previsibilidade, linguagem direta e versão simplificada do enunciado.
                  </p>
                </div>
              </label>

              {/* Dislexia */}
              <label className="flex items-start gap-3 p-2.5 rounded-xl border border-slate-200 hover:bg-indigo-50/50 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={accessibility.dyslexiaMode}
                  onChange={(e) => updateAccessibility({ dyslexiaMode: e.target.checked })}
                  className="mt-1 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <div className="flex items-center gap-1.5 font-semibold text-sm text-slate-900">
                    <Type className="w-4 h-4 text-amber-600" />
                    Modo Dislexia
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Fonte adaptada, espaçamento ampliado, áudio integrado e ortografia acolhedora não punida.
                  </p>
                </div>
              </label>
            </div>

            {/* Ajustes de Leitura e Visualização */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Leitura e Visual
              </p>

              {/* Tamanho da Fonte */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-700 flex items-center gap-1">
                  <Type className="w-3.5 h-3.5" /> Tamanho do texto:
                </span>
                <div className="flex gap-1">
                  {(['normal', 'large', 'extralarge'] as const).map((size) => (
                    <button
                      key={size}
                      onClick={() => updateAccessibility({ fontSize: size })}
                      className={`px-2.5 py-1 text-xs rounded-lg font-medium transition ${
                        accessibility.fontSize === size
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {size === 'normal' ? 'Padrão' : size === 'large' ? 'Grande' : 'Muito Grande'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Régua de Leitura */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-700 flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 text-indigo-500" /> Régua visual de leitura:
                </span>
                <button
                  onClick={() => updateAccessibility({ readingRuler: !accessibility.readingRuler })}
                  className={`px-3 py-1 text-xs rounded-lg font-medium transition ${
                    accessibility.readingRuler
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {accessibility.readingRuler ? 'Ativada' : 'Desativada'}
                </button>
              </div>

              {/* Modo Sem Distrações */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-700 flex items-center gap-1">
                  <Maximize2 className="w-3.5 h-3.5 text-indigo-500" /> Foco sem distrações:
                </span>
                <button
                  onClick={() => updateAccessibility({ distractionFree: !accessibility.distractionFree })}
                  className={`px-3 py-1 text-xs rounded-lg font-medium transition ${
                    accessibility.distractionFree
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {accessibility.distractionFree ? 'Ativo' : 'Desligado'}
                </button>
              </div>

              {/* Alto Contraste */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-700 flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-indigo-500" /> Alto contraste:
                </span>
                <button
                  onClick={() => updateAccessibility({ highContrast: !accessibility.highContrast })}
                  className={`px-3 py-1 text-xs rounded-lg font-medium transition ${
                    accessibility.highContrast
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {accessibility.highContrast ? 'Ativo' : 'Padrão'}
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 text-center leading-relaxed">
              🔒 Princípio 5: Todas as escolhas de acessibilidade são anônimas e nunca expostas em dados clínicos escolares.
            </div>
          </div>
        </div>
      )}
    </>
  );
};
