import React from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import {
  GraduationCap,
  Users,
  School,
  Landmark,
  Cpu,
  Sparkles,
  Award,
  BookOpen,
  HeartHandshake,
  LogIn,
  LogOut,
  User,
  ShieldCheck,
  Building2,
  Home
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentUser,
    role,
    setRole,
    activeView,
    setActiveView,
    setIsLoginModalOpen,
    logout,
    goToUserHome,
    startOnboarding,
    accessibility,
    openUniversalRegisterForRole,
  } = useApp();

  const roleList: { id: UserRole; label: string; badge: string; icon: React.ReactNode }[] = [
    {
      id: 'aluno',
      label: 'Aluno',
      badge: 'Usuário',
      icon: <GraduationCap className="w-4 h-4" />,
    },
    {
      id: 'professor',
      label: 'Professor',
      badge: 'Usuário',
      icon: <Users className="w-4 h-4" />,
    },
    {
      id: 'escola',
      label: 'Escola',
      badge: 'Usuário',
      icon: <School className="w-4 h-4" />,
    },
    {
      id: 'secretaria_educacao',
      label: 'Secretaria',
      badge: 'Usuário',
      icon: <Landmark className="w-4 h-4" />,
    },
    {
      id: 'operador',
      label: 'Operador',
      badge: 'Gerenciador',
      icon: <Cpu className="w-4 h-4" />,
    },
    {
      id: 'admin',
      label: 'Admin',
      badge: 'Gerenciador',
      icon: <Sparkles className="w-4 h-4" />,
    },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top Banner: Core Principles Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white px-4 py-1.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between text-xs gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold tracking-wide text-[11px] sm:text-xs">
              SISTEMA DE ESTUDOS ENEM • Plataforma Inclusiva e Gratuita
            </span>
          </div>

          <div className="flex items-center flex-wrap gap-3 text-indigo-200 text-[11px]">
            <span className="flex items-center gap-1 text-emerald-300 font-medium">
              <Award className="w-3.5 h-3.5" /> 100% Gratuito
            </span>
            <span className="hidden sm:inline text-slate-500">•</span>
            <span className="hidden sm:flex items-center gap-1 text-sky-300 font-medium">
              <BookOpen className="w-3.5 h-3.5" /> 1º ao 3º ano
            </span>
            <span className="hidden md:inline text-slate-500">•</span>
            <span className="hidden md:flex items-center gap-1 text-amber-300 font-medium">
              <HeartHandshake className="w-3.5 h-3.5" /> TDAH, TEA & Dislexia
            </span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Brand */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setActiveView('landing')}
              className="flex items-center gap-3 text-left focus:outline-none group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-indigo-200 group-hover:scale-105 transition">
                ENEM
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight leading-tight flex items-center gap-2">
                  Sistema de Estudos ENEM
                  <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                    Gratuito
                  </span>
                </h1>
                <p className="text-[11px] text-slate-500">
                  Preparação gradual, redação por IA e neuroinclusão
                </p>
              </div>
            </button>

            {/* Mobile login button if not logged in */}
            {!currentUser && (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="lg:hidden px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center gap-1 shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Entrar</span>
              </button>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Landing page toggle button */}
            <button
              onClick={() => setActiveView(activeView === 'landing' ? 'dashboard' : 'landing')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                activeView === 'landing'
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>{activeView === 'landing' ? 'Apresentação' : 'Ver Apresentação'}</span>
            </button>

            {/* If user is logged in, show current role switcher and profile details */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                {/* Botão de Voltar ao Início do Painel do Usuário */}
                <button
                  type="button"
                  onClick={goToUserHome}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition shadow-xs"
                  title="Voltar à primeira página de uso do seu painel"
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>Início do Painel</span>
                </button>

                {/* Botão de Abrir Guia Interativo do Perfil */}
                <button
                  type="button"
                  onClick={startOnboarding}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition shadow-2xs"
                  title="Abrir o guia interativo com as funcionalidades do seu perfil"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span className="hidden sm:inline">Guia do Perfil</span>
                </button>

                {/* Role Switcher tabs */}
                <div className="hidden sm:flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200">
                  {roleList.map((item) => {
                    const active = role === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setRole(item.id);
                          setActiveView('dashboard');
                        }}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                          active
                            ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <span className={active ? 'text-indigo-600' : 'text-slate-400'}>
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* User tag and Logout */}
                <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                  <div className="text-right hidden md:block">
                    <span className="text-xs font-bold text-slate-900 block leading-tight">
                      {currentUser.name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {currentUser.maskedDocument || currentUser.technicalId} • {currentUser.role}
                    </span>
                  </div>

                  <button
                    onClick={logout}
                    className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition"
                    title="Sair do Sistema (Logout)"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* If NOT logged in, show Register & Login CTAs */
              <div className="hidden lg:flex items-center gap-2">
                <button
                  onClick={() => openUniversalRegisterForRole('aluno')}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl font-bold text-xs shadow-xs transition"
                  title="Criar novo cadastro gratuito com CPF ou CNPJ oficial"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Novo Cadastro (CPF/CNPJ)</span>
                </button>
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl font-bold text-xs shadow-md shadow-indigo-200 transition transform hover:scale-[1.02]"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Entrar no Sistema</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Active adaptations bar indicator if any are enabled */}
        {(accessibility.tdahMode || accessibility.teaMode || accessibility.dyslexiaMode) && (
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Adaptações ativas:</span>
            {accessibility.tdahMode && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 font-medium border border-purple-200">
                🧠 TDAH (Blocos 15-20 min, anti-impulso)
              </span>
            )}
            {accessibility.teaMode && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 font-medium border border-teal-200">
                🎯 TEA (Linguagem direta e previsível)
              </span>
            )}
            {accessibility.dyslexiaMode && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-medium border border-amber-200">
                📖 Dislexia (Fonte amigável, áudio, ortografia acolhedora)
              </span>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
