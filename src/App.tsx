import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { AccessibilityToolbar } from './components/AccessibilityToolbar';
import { ReadingRuler } from './components/ReadingRuler';
import { LandingPage } from './components/landing/LandingPage';
import { LoginModal } from './components/auth/LoginModal';
import { ChangePasswordModal } from './components/auth/ChangePasswordModal';
import { InteractiveOnboardingModal } from './components/onboarding/InteractiveOnboardingModal';
import { LeavePracticeConfirmModal } from './components/student/LeavePracticeConfirmModal';
import { StudentRegistrationModal } from './components/registration/StudentRegistrationModal';
import { UniversalRegistrationModal } from './components/registration/UniversalRegistrationModal';
import { StudentDashboard } from './components/student/StudentDashboard';
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { SchoolDashboard } from './components/school/SchoolDashboard';
import { EducationSecretariatDashboard } from './components/secretariat/EducationSecretariatDashboard';
import { GuardianDashboard } from './components/guardian/GuardianDashboard';
import { PartnerDashboard } from './components/partner/PartnerDashboard';
import { OperatorDashboard } from './components/operator/OperatorDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { Award, HeartHandshake, ShieldCheck, School, BookOpen, Sparkles } from 'lucide-react';

const MainContent: React.FC = () => {
  const { role, activeView, accessibility } = useApp();

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-200 ${
        accessibility.highContrast
          ? 'bg-black text-white'
          : 'bg-slate-50/70 text-slate-900'
      }`}
    >
      <ReadingRuler />
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 sm:py-8">
        {activeView === 'landing' ? (
          <LandingPage />
        ) : (
          <>
            {/* Usuários */}
            {role === 'aluno' && <StudentDashboard />}
            {role === 'professor' && <TeacherDashboard />}
            {role === 'escola' && <SchoolDashboard />}
            {role === 'secretaria_educacao' && <EducationSecretariatDashboard />}
            {role === 'responsavel' && <GuardianDashboard />}
            {role === 'parceiro' && <PartnerDashboard />}

            {/* Gerenciadores */}
            {role === 'operador' && <OperatorDashboard />}
            {role === 'admin' && <AdminDashboard />}
          </>
        )}
      </main>

      {/* Footer with 6 Fundamental Principles */}
      <footer className="mt-12 bg-white border-t border-slate-200/80 py-8 px-4">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-1">
            <h4 className="font-extrabold text-sm text-slate-900 tracking-tight">
              SISTEMA DE ESTUDOS ENEM • PLATAFORMA INCLUSIVA E GRATUITA
            </h4>
            <p className="text-xs text-slate-500">
              Diretrizes operacionais e princípios fundamentais de equidade educacional
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs text-slate-600">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-start gap-2.5">
              <Award className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block">1. Gratuidade Real:</strong>
                O aluno nunca paga nada. Sem limites ocultos, sem cobranças e sem anúncios não educativos.
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-start gap-2.5">
              <BookOpen className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block">2. Preparação Gradual:</strong>
                Cada série estuda seu currículo escolar SEMPRE calibrado no formato e matriz do ENEM.
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block">3. Inclusão Plena:</strong>
                Adaptações automáticas para TDAH, TEA, Dislexia e outras neurodivergências.
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-start gap-2.5">
              <School className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block">4. Autonomia Escolar:</strong>
                A escola pública pode aderir sozinha em 1 clique, com acesso IDÊNTICO à escola particular.
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block">5. Privacidade Absoluta:</strong>
                Dados de saúde nunca são expostos; o aluno utiliza as ferramentas sem vínculo clínico.
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-start gap-2.5">
              <HeartHandshake className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block">6. Sustentabilidade Social:</strong>
                Apoio contínuo de universidades, fundações e parceiros educacionais mantém o sistema gratuito.
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
            <span>© {new Date().getFullYear()} Sistema de Estudos ENEM • Plataforma de Estudos Inclusiva e Gratuita</span>
            <span>Versão 1.1 — Atualizada com Parceiros Educacionais</span>
          </div>
        </div>
      </footer>

      {/* Modals & Floating Toolbar */}
      <LoginModal />
      <ChangePasswordModal />
      <StudentRegistrationModal />
      <UniversalRegistrationModal />
      <InteractiveOnboardingModal />
      <LeavePracticeConfirmModal />
      <AccessibilityToolbar />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
