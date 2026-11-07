import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AiStudyAssistantModule } from './AiStudyAssistantModule';
import {
  Sparkles,
  X,
  Maximize2,
  Mic,
  MessageSquare,
  Bot,
} from 'lucide-react';

interface AiStudyAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
}

export const AiStudyAssistantDrawer: React.FC<AiStudyAssistantDrawerProps> = ({
  isOpen,
  onClose,
  onOpen,
}) => {
  const { studentActiveTab, setStudentActiveTab, accessibility } = useApp();

  // If the student is already in the full 'assistente' tab, don't show the floating launcher
  if (studentActiveTab === 'assistente') {
    return null;
  }

  return (
    <>
      {/* Floating launcher trigger button at bottom-right */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2 animate-bounce-subtle">
          <button
            onClick={onOpen}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-full font-black text-xs text-white shadow-xl transition transform hover:scale-105 cursor-pointer border ${
              accessibility.focusMode
                ? 'bg-teal-700 hover:bg-teal-800 border-teal-500 shadow-teal-900/30'
                : 'bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 border-indigo-400/40 shadow-indigo-600/30'
            }`}
            title="Abrir Assistente de Estudos com IA (Tirar Dúvidas ENEM)"
            aria-label="Abrir assistente de estudos com IA"
          >
            <div className="relative">
              <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
              <span className="w-2 h-2 rounded-full bg-emerald-400 absolute -top-1 -right-1 ring-2 ring-indigo-900"></span>
            </div>
            <span>Dúvidas com IA</span>
            <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[10px] font-bold">
              Gemini + Voz
            </span>
          </button>
        </div>
      )}

      {/* Slide-out modal drawer overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs transition-opacity animate-fadeIn">
          {/* Backdrop click to close */}
          <div className="absolute inset-0" onClick={onClose} />

          {/* Drawer Panel */}
          <div className="relative z-10 w-full max-w-2xl h-full bg-white shadow-2xl flex flex-col overflow-hidden animate-slideInRight">
            {/* Drawer Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-linear-to-tr from-indigo-500 to-purple-500 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold flex items-center gap-2">
                    Tutor Rápido ENEM
                    <span className="px-1.5 py-0.5 rounded bg-indigo-500/30 text-indigo-200 text-[10px] font-bold">
                      Gemini
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Tire dúvidas instantâneas sem sair da sua atividade atual
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Maximize to full tab */}
                <button
                  onClick={() => {
                    onClose();
                    setStudentActiveTab('assistente');
                  }}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                  title="Expandir para tela cheia na aba do Assistente"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>

                {/* Close drawer */}
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                  title="Fechar assistente rápido"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Drawer Body (Content) */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
              <AiStudyAssistantModule />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
