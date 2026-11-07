import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  GraduationCap,
  Users,
  School,
  Landmark,
  Cpu,
  Sparkles,
  Award,
  BookOpen,
  Brain,
  CheckCircle2,
  HeartHandshake,
  ShieldCheck,
  ArrowRight,
  LogIn,
  KeyRound,
  FileText,
  Volume2,
  Clock,
  Layers,
  ChevronRight,
  Lock,
  UserPlus
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setIsLoginModalOpen, setIsStudentRegisterModalOpen, openUniversalRegisterForRole, login } = useApp();

  const handleQuickLogin = (username: string) => {
    login(username, 'mudar123');
  };

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 text-white p-8 sm:p-12 lg:p-16 shadow-2xl border border-indigo-800/40">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl pointer-events-none"></div>

        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Plataforma Inclusiva e Gratuita • Rede Integrada</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            Sistema de Estudos para o{' '}
            <span className="bg-gradient-to-r from-amber-300 via-emerald-300 to-sky-300 bg-clip-text text-transparent">
              ENEM
            </span>
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-indigo-100 max-w-2xl mx-auto leading-relaxed">
            Preparação gradual desde o 1º ano do Ensino Médio até a prova, com inclusão plena de estudantes neurodivergentes (TDAH, TEA e Dislexia), rede integrada entre Alunos, Professores, Escolas e Secretarias.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <button
              onClick={() => openUniversalRegisterForRole('aluno')}
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-xl shadow-emerald-700/30 transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <ShieldCheck className="w-5 h-5" />
              <span>Novo Cadastro Oficial (CPF/CNPJ)</span>
            </button>

            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/30 transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <LogIn className="w-5 h-5" />
              <span>Entrar no Sistema</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              onClick={() => {
                const el = document.getElementById('perfis');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm backdrop-blur-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Conhecer os 4 Perfis</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* 6 Core Principles quick tags */}
          <div className="pt-6 border-t border-indigo-800/60 flex flex-wrap items-center justify-center gap-3 text-xs text-indigo-200">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10">
              <Award className="w-3.5 h-3.5 text-emerald-400" /> Gratuidade Real (Sem Anúncios)
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10">
              <BookOpen className="w-3.5 h-3.5 text-sky-400" /> Preparação Gradual (1º ao 3º ano)
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10">
              <Brain className="w-3.5 h-3.5 text-purple-400" /> TDAH, TEA e Dislexia
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10">
              <School className="w-3.5 h-3.5 text-amber-400" /> Autonomia Escolar Pública
            </span>
          </div>
        </div>
      </section>

      {/* Profiles & Access Levels Section */}
      <section id="perfis" className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
            Arquitetura de Acesso
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Perfis de Usuários e Gerenciadores do Sistema
          </h2>
          <p className="text-xs text-slate-500">
            Cada integrante possui sua interface personalizada. Ao fazer login, você é encaminhado diretamente ao seu ambiente.
          </p>
        </div>

        {/* 4 Usuários */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-lg bg-indigo-100 text-indigo-800 font-bold text-xs uppercase tracking-wider">
              Usuários do Sistema
            </span>
            <span className="text-xs text-slate-500">
              Estudantes, educadores, unidades escolares e secretarias regionais
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Aluno */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-indigo-400 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Aluno</h3>
                  <span className="text-[11px] font-semibold text-indigo-600">Nível 1 • Estudante E.M.</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Modo Série na proporção exata, Modo ENEM dinâmico, Redação avaliada por IA (C1 a C5) e perfil de neuroinclusão confidencial.
                </p>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => handleQuickLogin('aluno')}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <span>Acessar como Aluno</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => openUniversalRegisterForRole('aluno')}
                  className="w-full py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/90 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Cadastrar Aluno com CPF"
                >
                  <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Cadastrar Aluno (CPF)</span>
                </button>
              </div>
            </div>

            {/* 2. Professor */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-emerald-400 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Professor</h3>
                  <span className="text-[11px] font-semibold text-emerald-600">Nível 2 • Docente</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Acompanhamento de turmas, criação de listas com proporção oficial e métricas metodológicas agregadas sem violar sigilo médico.
                </p>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => handleQuickLogin('professor')}
                  className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-emerald-600 hover:text-white font-bold text-xs text-slate-700 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Acessar como Professor</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => openUniversalRegisterForRole('professor')}
                  className="w-full py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/90 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Cadastrar Professor com CPF"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Cadastrar Professor (CPF)</span>
                </button>
              </div>
            </div>

            {/* 3. Escola */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-sky-400 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
                  <School className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Escola</h3>
                  <span className="text-[11px] font-semibold text-sky-600">Nível 3 • Gestão Escolar</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Adesão autônoma em 1 clique (escola pública com acesso idêntico à particular), chaves institucionais e relatórios pedagógicos.
                </p>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => handleQuickLogin('escola')}
                  className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-sky-600 hover:text-white font-bold text-xs text-slate-700 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Acessar como Escola</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => openUniversalRegisterForRole('escola')}
                  className="w-full py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200/90 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Cadastrar Escola com CNPJ"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
                  <span>Cadastrar Escola (CNPJ)</span>
                </button>
              </div>
            </div>

            {/* 4. Secretaria de Educação */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-purple-400 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                  <Landmark className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Secretaria de Educação</h3>
                  <span className="text-[11px] font-semibold text-purple-600">Usuário • Regional / Estadual</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Visão consolidada da rede escolar jurisdicional, auditoria de adesões, equidade regional e exportação de indicadores oficiais.
                </p>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => handleQuickLogin('secretaria')}
                  className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-purple-600 hover:text-white font-bold text-xs text-slate-700 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Acessar como Secretaria</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => openUniversalRegisterForRole('secretaria_educacao')}
                  className="w-full py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200/90 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Cadastrar Secretaria com CNPJ"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                  <span>Cadastrar Secretaria (CNPJ)</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 2 Gerenciadores do Sistema */}
        <div className="pt-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-lg bg-slate-900 text-amber-300 font-bold text-xs uppercase tracking-wider">
              Gerenciadores do Sistema
            </span>
            <span className="text-xs text-slate-500">
              Administração central, calibragem de IA e monitoramento operacional
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Operadores */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-amber-400 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                  <Cpu className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Operadores</h3>
                  <span className="text-[11px] font-semibold text-amber-600">Gerenciador • Operações & Suporte</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Monitoramento em tempo real do sistema, fila de chamados das escolas, auditoria de contas e verificação de latência do Gemini.
                </p>
              </div>

              <button
                onClick={() => handleQuickLogin('operador')}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-amber-600 hover:text-white font-bold text-xs text-slate-700 transition flex items-center justify-center gap-1.5"
              >
                <span>Acessar como Operador</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Administrador Principal */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-md flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center justify-center font-bold">
                  <Sparkles className="w-6 h-6 text-amber-300" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">Administrador Principal</h3>
                  <span className="text-[11px] font-semibold text-indigo-400">Gerenciador • Admin Central</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Gestão global do banco de questões por habilidades da BNCC, gerador de itens com IA (Gemini 3.8 Flash), calibragem pedagógica e parâmetros do sistema.
                </p>
              </div>

              <button
                onClick={() => handleQuickLogin('admin')}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-md"
              >
                <span>Acessar como Admin (admin / mudar123)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Progressive Preparation Feature Showcase */}
      <section className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-xs space-y-8">
        <div className="max-w-2xl space-y-1">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
            Princípio 2 • Preparação Gradual
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Estude o Conteúdo da sua Série Sempre no Formato do ENEM
          </h2>
          <p className="text-xs text-slate-500">
            Evita o choque de deixar a preparação para o 3º ano. O aluno domina a matriz de habilidades ano a ano.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 1º ano */}
          <div className="p-6 rounded-2xl bg-indigo-50/60 border border-indigo-200/80 space-y-3">
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-600 text-white inline-block">
              1º Ano do Ensino Médio
            </span>
            <div className="text-sm font-extrabold text-indigo-950">
              80% Conteúdo 1º Ano + 20% Formato ENEM
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Foco na base sólida curricular. Na redação, ênfase na <strong>estrutura básica do texto dissertativo</strong> (Competências C1 - norma padrão e C3 - projeto de texto).
            </p>
          </div>

          {/* 2º ano */}
          <div className="p-6 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-3">
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-600 text-white inline-block">
              2º Ano do Ensino Médio
            </span>
            <div className="text-sm font-extrabold text-emerald-950">
              70% Conteúdo 2º Ano + 20% Revisão 1º + 10% ENEM
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Aprofundamento temático. Na redação, foco em <strong>argumentação consistente e coesão textual</strong> (Competências C3 e C4 - conectivos).
            </p>
          </div>

          {/* 3º ano */}
          <div className="p-6 rounded-2xl bg-purple-50/60 border border-purple-200/80 space-y-3">
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-600 text-white inline-block">
              3º Ano do Ensino Médio
            </span>
            <div className="text-sm font-extrabold text-purple-950">
              60% Conteúdo 3º Ano + 25% Revisão + 15% ENEM
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Simulado intensivo e TRI estimada. Na redação, <strong>proposta de intervenção completa com os 5 elementos</strong> (C1 a C5 na íntegra).
            </p>
          </div>
        </div>
      </section>

      {/* Neuroinclusion Feature Showcase */}
      <section className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-8 sm:p-10 shadow-xl space-y-6">
        <div className="max-w-2xl space-y-1">
          <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
            Princípios 3 e 5 • Inclusão Plena e Sigilo Confidencial
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Tecnologia Assistiva Nativamente Integrada
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Dados clínicos nunca são expostos. O estudante ativa suas preferências livremente e estuda sem sobrecarga.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-2">
            <div className="flex items-center gap-2 font-bold text-purple-300 text-sm">
              <Brain className="w-5 h-5" />
              <span>Adaptações para TDAH</span>
            </div>
            <p className="text-slate-200 leading-relaxed">
              Blocos de estudo de 15 a 20 minutos (timer de foco visual), uma questão por vez sem poluição na tela e confirmação anti-impulso antes de responder.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-2">
            <div className="flex items-center gap-2 font-bold text-teal-300 text-sm">
              <CheckCircle2 className="w-5 h-5" />
              <span>Adaptações para TEA</span>
            </div>
            <p className="text-slate-200 leading-relaxed">
              Rotina previsível, layout estável e botão de <strong>Versão Simplificada do Enunciado</strong> que converte textos ambíguos em fatos diretos e objetivos.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-300 text-sm">
              <Volume2 className="w-5 h-5" />
              <span>Adaptações para Dislexia</span>
            </div>
            <p className="text-slate-200 leading-relaxed">
              Fonte Lexend de alta legibilidade, leitura narrada em áudio (TTS integrado) e <strong>ortografia orientada e acolhedora, jamais punida</strong> na redação.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action Final */}
      <section className="bg-indigo-50 border border-indigo-200 rounded-3xl p-8 text-center space-y-4">
        <h3 className="text-xl sm:text-2xl font-black text-slate-900">
          Pronto para Começar sua Jornada Rumo ao ENEM?
        </h3>
        <p className="text-xs text-slate-600 max-w-xl mx-auto">
          Faça login agora com as credenciais iniciais ou selecione seu perfil de acesso.
        </p>
        <button
          onClick={() => setIsLoginModalOpen(true)}
          className="px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-md transition inline-flex items-center gap-2"
        >
          <LogIn className="w-4 h-4" />
          <span>Fazer Login Agora</span>
        </button>
      </section>
    </div>
  );
};
