import React from 'react';
import { useApp } from '../../context/AppContext';
import { AlertTriangle, ArrowLeft, Play, X } from 'lucide-react';

export const LeavePracticeConfirmModal: React.FC = () => {
  const {
    showLeavePracticeModal,
    executeLeavePracticeConfirm,
    cancelLeavePractice,
  } = useApp();

  if (!showLeavePracticeModal) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-scaleUp">
        {/* Header with warning style */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-100 block">
                Atividade de Questões em Andamento
              </span>
              <h3 className="text-base font-extrabold leading-tight">
                Deseja realmente voltar ao Início?
              </h3>
            </div>
          </div>

          <button
            onClick={cancelLeavePractice}
            className="text-white/80 hover:text-white p-1 rounded-xl hover:bg-white/10 transition"
            aria-label="Fechar e continuar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-950 leading-relaxed space-y-1.5">
            <p className="font-bold text-sm text-amber-900">
              Aviso: Seu progresso nesta sessão não foi concluído!
            </p>
            <p className="text-xs text-amber-800">
              Se você voltar para a página inicial agora, <strong>você perderá o que foi feito nesta atividade até agora</strong> (respostas selecionadas e tempo do bloco).
            </p>
          </div>

          <p className="text-slate-600 leading-relaxed">
            Deseja retomar de onde você estava ou confirmar a saída e voltar à tela inicial do seu painel?
          </p>

          {/* Action buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={cancelLeavePractice}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition flex items-center justify-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Retomar de onde estava</span>
            </button>

            <button
              type="button"
              onClick={executeLeavePracticeConfirm}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Sim, voltar ao Início</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
