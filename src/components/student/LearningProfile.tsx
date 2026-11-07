import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Brain,
  CheckCircle2,
  Type,
  ShieldCheck,
  Eye,
  Sliders,
  Sparkles,
  Compass,
  Maximize2,
  Volume2
} from 'lucide-react';

export const LearningProfile: React.FC = () => {
  const { accessibility, updateAccessibility } = useApp();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Confidentiality Privacy Banner */}
      <div className="bg-emerald-900 text-white rounded-3xl p-6 shadow-sm border border-emerald-800">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-emerald-800/80 rounded-2xl shrink-0">
            <ShieldCheck className="w-6 h-6 text-emerald-300" />
          </div>
          <div className="space-y-1">
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
              Princípios 3 e 5 • Privacidade e Inclusão Plena
            </span>
            <h3 className="text-lg font-bold">Perfil de Aprendizagem 100% Confidencial</h3>
            <p className="text-xs text-emerald-100 leading-relaxed max-w-2xl">
              Suas escolhas de acessibilidade e neurodivergência são estritamente suas. O sistema nunca expõe diagnósticos médicos, laudos ou rótulos para professores, escolas ou colegas. Você tem total autonomia para ativar ou desativar qualquer recurso quando desejar.
            </p>
          </div>
        </div>
      </div>

      {/* Modo Foco (TEA & Neuroinclusão) */}
      <div className={`rounded-3xl p-6 sm:p-8 border-2 transition ${
        accessibility.focusMode
          ? 'bg-emerald-50/80 border-emerald-500 shadow-sm'
          : 'bg-white border-slate-200 hover:border-emerald-300'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-start gap-3">
            <div className={`p-3 rounded-2xl shrink-0 ${
              accessibility.focusMode ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-800'
            }`}>
              <Maximize2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-slate-900">Modo Foco (TEA & Redução de Sobrecarga Sensorial)</h3>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Especial TEA
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-2xl">
                Desenvolvido especificamente para atender estudantes com Transtorno do Espectro Autista (TEA) e alta sensibilidade visual. Ao ser ativado, reorganiza toda a experiência do aluno com foco em previsibilidade e calma.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <span className={`text-xs font-bold ${accessibility.focusMode ? 'text-emerald-700' : 'text-slate-500'}`}>
              {accessibility.focusMode ? 'Ativado' : 'Desativado'}
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={accessibility.focusMode}
                onChange={(e) => updateAccessibility({ focusMode: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[3px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-5">
          <div className="p-4 rounded-2xl bg-white border border-emerald-200/80 shadow-2xs">
            <h5 className="font-bold text-xs text-emerald-950 flex items-center gap-1.5 mb-1.5">
              <Eye className="w-4 h-4 text-emerald-600" />
              1. Sem Distrações Visuais
            </h5>
            <p className="text-xs text-slate-600 leading-relaxed">
              Oculta banners decorativos, ícones com animações pulsantes e faixas coloridas concorrentes que causam distração.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-emerald-200/80 shadow-2xs">
            <h5 className="font-bold text-xs text-emerald-950 flex items-center gap-1.5 mb-1.5">
              <Sliders className="w-4 h-4 text-emerald-600" />
              2. Baixa Densidade de Dados
            </h5>
            <p className="text-xs text-slate-600 leading-relaxed">
              Apresenta apenas as informações essenciais para a etapa atual de estudo, sem sobrecarregar com gráficos complexos ou dados secundários.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-emerald-200/80 shadow-2xs">
            <h5 className="font-bold text-xs text-emerald-950 flex items-center gap-1.5 mb-1.5">
              <Compass className="w-4 h-4 text-emerald-600" />
              3. Espaçamento Ampliado
            </h5>
            <p className="text-xs text-slate-600 leading-relaxed">
              Amplia o espaçamento e margens entre botões e textos, proporcionando uma experiência visual limpa, organizada e previsível.
            </p>
          </div>
        </div>
      </div>

      {/* Main Adaptations Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* TDAH */}
        <div className={`p-6 rounded-3xl border transition ${
          accessibility.tdahMode
            ? 'border-purple-500 bg-purple-50/50 shadow-md ring-2 ring-purple-200'
            : 'border-slate-200 bg-white hover:border-slate-300'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Brain className="w-5 h-5" />
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={accessibility.tdahMode}
                onChange={(e) => updateAccessibility({ tdahMode: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          <h4 className="font-bold text-slate-900 text-sm mb-1.5">Adaptações para TDAH</h4>
          <p className="text-xs text-slate-600 leading-relaxed mb-4">
            Projetado para reduzir a sobrecarga cognitiva e apoiar a regulação da atenção.
          </p>

          <ul className="text-xs text-slate-700 space-y-2 border-t border-slate-100 pt-3">
            <li className="flex items-start gap-1.5">
              <span className="text-purple-600 font-bold">•</span>
              <span><strong>Cronômetro Pomodoro TDAH (15/5 min):</strong> Micro-ciclos com avisos visuais e sonoros suaves (tigela tibetana, carrilhão zen e ruído marrom ambiente).</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-purple-600 font-bold">•</span>
              <span><strong>Cronograma Semanal IA (Priorização de Fraquezas):</strong> O Gemini detecta suas áreas com menor desempenho e aloca micro-blocos Pomodoro intercalados para evitar fadiga cognitiva.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-purple-600 font-bold">•</span>
              <span><strong>Estacionamento de Distrações (Brain Dump):</strong> Guarde pensamentos imediatos para a pausa sem perder o foco.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-purple-600 font-bold">•</span>
              <span><strong>Uma tarefa por vez:</strong> Interface sem poluição visual ou sobrecarga de notificações.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-purple-600 font-bold">•</span>
              <span><strong>Confirmação anti-impulso:</strong> Pausa amigável antes de enviar para evitar cliques acidentais.</span>
            </li>
          </ul>
        </div>

        {/* TEA */}
        <div className={`p-6 rounded-3xl border transition ${
          accessibility.teaMode
            ? 'border-teal-500 bg-teal-50/50 shadow-md ring-2 ring-teal-200'
            : 'border-slate-200 bg-white hover:border-slate-300'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={accessibility.teaMode}
                onChange={(e) => updateAccessibility({ teaMode: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
            </label>
          </div>

          <h4 className="font-bold text-slate-900 text-sm mb-1.5">Adaptações para TEA</h4>
          <p className="text-xs text-slate-600 leading-relaxed mb-4">
            Focado em previsibilidade de rotina, clareza lógica e baixo ruído sensorial.
          </p>

          <ul className="text-xs text-slate-700 space-y-2 border-t border-slate-100 pt-3">
            <li className="flex items-start gap-1.5">
              <span className="text-teal-600 font-bold">•</span>
              <span><strong>Estrutura fixa:</strong> Layout previsível sem surpresas ou popups invasivos.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-teal-600 font-bold">•</span>
              <span><strong>Linguagem direta:</strong> Tradução instantânea de enunciados longos para fatos objetivos.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-teal-600 font-bold">•</span>
              <span><strong>Sem duplo sentido:</strong> Eliminação de metáforas soltas no comando da questão.</span>
            </li>
          </ul>
        </div>

        {/* Dislexia */}
        <div className={`p-6 rounded-3xl border transition ${
          accessibility.dyslexiaMode
            ? 'border-amber-500 bg-amber-50/50 shadow-md ring-2 ring-amber-200'
            : 'border-slate-200 bg-white hover:border-slate-300'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Type className="w-5 h-5" />
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={accessibility.dyslexiaMode}
                onChange={(e) => updateAccessibility({ dyslexiaMode: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
            </label>
          </div>

          <h4 className="font-bold text-slate-900 text-sm mb-1.5">Adaptações para Dislexia</h4>
          <p className="text-xs text-slate-600 leading-relaxed mb-4">
            Conforto visual fonético, síntese de voz e avaliação redacional justa.
          </p>

          <ul className="text-xs text-slate-700 space-y-2 border-t border-slate-100 pt-3">
            <li className="flex items-start gap-1.5">
              <span className="text-amber-600 font-bold">•</span>
              <span><strong>Leitor em Modo Foco & Sobreposição de Cores:</strong> Leitura em tela cheia sem distrações laterais, com 6 opções de filtros cromáticos (creme, pêssego, menta, etc.), régua de foco guiada e fixação biônica.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-amber-600 font-bold">•</span>
              <span><strong>Fonte de alta legibilidade:</strong> Espaçamento maior entre letras e linhas.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-amber-600 font-bold">•</span>
              <span><strong>Áudio narrado (TTS):</strong> Botão de leitura por voz para enunciados, redações e respostas do Assistente IA.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-amber-600 font-bold">•</span>
              <span><strong>Ditado por Voz no Assistente IA:</strong> Dite suas dúvidas sobre o ENEM falando pelo microfone sem cansaço de digitação.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-amber-600 font-bold">•</span>
              <span><strong>Ortografia acolhedora:</strong> Erros gráficos são orientados e jamais punidos com notas desqualificantes.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Additional Controls */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-4">
        <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-indigo-600" />
          <span>Preferências Adicionais de Exibição</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Régua de leitura */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5 mb-1">
                <Compass className="w-4 h-4 text-indigo-600" />
                Régua de Foco
              </span>
              <p className="text-[11px] text-slate-500">
                Acompanha a linha de leitura com o cursor do mouse.
              </p>
            </div>
            <button
              onClick={() => updateAccessibility({ readingRuler: !accessibility.readingRuler })}
              className={`mt-3 w-full py-2 rounded-xl text-xs font-bold transition ${
                accessibility.readingRuler
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {accessibility.readingRuler ? 'Ativada' : 'Desativada'}
            </button>
          </div>

          {/* Foco sem distrações */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5 mb-1">
                <Maximize2 className="w-4 h-4 text-indigo-600" />
                Modo Zen
              </span>
              <p className="text-[11px] text-slate-500">
                Oculta elementos periféricos durante os exercícios.
              </p>
            </div>
            <button
              onClick={() => updateAccessibility({ distractionFree: !accessibility.distractionFree })}
              className={`mt-3 w-full py-2 rounded-xl text-xs font-bold transition ${
                accessibility.distractionFree
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {accessibility.distractionFree ? 'Ativo' : 'Desativado'}
            </button>
          </div>

          {/* Alto contraste */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5 mb-1">
                <Eye className="w-4 h-4 text-indigo-600" />
                Alto Contraste
              </span>
              <p className="text-[11px] text-slate-500">
                Maximiza legibilidade para baixa visão ou sensibilidade à luz.
              </p>
            </div>
            <button
              onClick={() => updateAccessibility({ highContrast: !accessibility.highContrast })}
              className={`mt-3 w-full py-2 rounded-xl text-xs font-bold transition ${
                accessibility.highContrast
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {accessibility.highContrast ? 'Ativado' : 'Desativado'}
            </button>
          </div>

          {/* Tamanho da Fonte */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5 mb-1">
                <Type className="w-4 h-4 text-indigo-600" />
                Escala de Texto
              </span>
              <p className="text-[11px] text-slate-500">
                Tamanho das letras e enunciados.
              </p>
            </div>
            <div className="mt-3 flex gap-1">
              {(['normal', 'large', 'extralarge'] as const).map((sz) => (
                <button
                  key={sz}
                  onClick={() => updateAccessibility({ fontSize: sz })}
                  className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition ${
                    accessibility.fontSize === sz
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {sz === 'normal' ? '1x' : sz === 'large' ? '1.2x' : '1.5x'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
