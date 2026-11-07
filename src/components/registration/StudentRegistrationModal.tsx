import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GradeLevel, LearningProfileType } from '../../types';
import {
  GraduationCap,
  X,
  User,
  Mail,
  Phone,
  Lock,
  Calendar,
  Building,
  Brain,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Info,
  KeyRound,
  Sparkles,
  Eye,
  EyeOff
} from 'lucide-react';

export const StudentRegistrationModal: React.FC = () => {
  const {
    isStudentRegisterModalOpen,
    setIsStudentRegisterModalOpen,
    setIsLoginModalOpen,
    registerStudentDirectly,
  } = useApp();

  // Form Fields as specified in Prompt Mestre (Nível 2 — Aluno)
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [currentGrade, setCurrentGrade] = useState<GradeLevel>('2º ano');
  const [contactInfo, setContactInfo] = useState(''); // E-mail ou Telefone
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [schoolCode, setSchoolCode] = useState(''); // Opcional
  const [learningProfile, setLearningProfile] = useState<LearningProfileType>('Padrão');
  const [dataSharing, setDataSharing] = useState<boolean>(true);
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [createdStudentName, setCreatedStudentName] = useState('');

  if (!isStudentRegisterModalOpen) return null;

  const handleClose = () => {
    setIsStudentRegisterModalOpen(false);
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic Validations
    if (!fullName.trim()) {
      setError('Por favor, informe seu nome completo.');
      return;
    }
    if (!birthDate.trim()) {
      setError('A data de nascimento é obrigatória.');
      return;
    }
    if (!contactInfo.trim()) {
      setError('Informe seu e-mail ou telefone para contato.');
      return;
    }
    if (!username.trim()) {
      setError('Escolha um nome de usuário (login).');
      return;
    }
    if (!password || password.length < 6) {
      setError('A senha deve conter no mínimo 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setError('A confirmação de senha não confere.');
      return;
    }
    if (!termsAccepted) {
      setError('É obrigatório aceitar os Termos de Uso e Política de Privacidade para prosseguir.');
      return;
    }

    const res = registerStudentDirectly({
      fullName: fullName.trim(),
      birthDate: birthDate.trim(),
      currentGrade,
      contactInfo: contactInfo.trim(),
      username: username.trim().toLowerCase(),
      password,
      schoolCode: schoolCode.trim() || undefined,
      learningProfile,
      dataSharing,
      termsAccepted,
    });

    if (res.success) {
      setCreatedStudentName(fullName.trim());
      setSuccess(true);
    } else {
      setError(res.error || 'Não foi possível concluir o cadastro.');
    }
  };

  const handleGoToLogin = () => {
    handleClose();
    setIsLoginModalOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-scaleUp">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 relative">
          <button
            onClick={handleClose}
            className="absolute top-5 right-5 text-indigo-300 hover:text-white p-1 rounded-xl hover:bg-white/10 transition"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/50 backdrop-blur-md flex items-center justify-center border border-indigo-400/30 shadow-inner">
              <GraduationCap className="w-6 h-6 text-indigo-200" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 block">
                Inscrição Independente • 100% Gratuito
              </span>
              <h3 className="text-xl font-extrabold tracking-tight">
                Cadastro de Aluno no Sistema ENEM
              </h3>
            </div>
          </div>
          <p className="text-xs text-indigo-100/90 mt-2 leading-relaxed">
            Cadastre-se para acessar simulados na proporção oficial da sua série, laboratório de redação com IA e recursos inclusivos.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-5">
          {success ? (
            <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-4 animate-fadeIn">
              <div className="w-14 h-14 rounded-full bg-emerald-600 text-white mx-auto flex items-center justify-center shadow-md">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-lg font-extrabold text-emerald-950">
                  Cadastro Concluído com Sucesso! 🎉
                </h4>
                <p className="text-xs text-emerald-800 mt-1">
                  Parabéns, <strong>{createdStudentName}</strong>! Seu registro foi salvo no banco de dados com segurança.
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-emerald-200 text-left text-xs space-y-1.5 text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Usuário (login):</span>
                  <span className="font-bold text-indigo-900">{username.toLowerCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Série Cadastrada:</span>
                  <span className="font-bold text-slate-800">{currentGrade} E.M.</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Perfil de Aprendizagem:</span>
                  <span className="font-bold text-amber-700">{learningProfile}</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 italic">
                Ao entrar no sistema, você poderá explorar o painel completo de estudos e iniciar seus simulados imediatamente.
              </p>

              <button
                type="button"
                onClick={handleGoToLogin}
                className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
              >
                <span>Fazer Login Agora</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {error && (
                <div className="p-3.5 bg-rose-50 text-rose-800 rounded-2xl border border-rose-200 flex items-start gap-2.5 animate-shake">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span className="font-semibold text-xs leading-relaxed">{error}</span>
                </div>
              )}

              {/* Informações Pessoais */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-indigo-900 font-bold border-b border-slate-100 pb-1.5">
                  <User className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs uppercase tracking-wider">Dados Pessoais do Aluno</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nome Completo <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Mariana Silva de Oliveira"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Data de Nascimento <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        required
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        className="w-full p-2.5 pl-9 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-xs"
                      />
                      <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      Dado bloqueado para edição posterior por segurança.
                    </span>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Série Atual <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={currentGrade}
                      onChange={(e) => setCurrentGrade(e.target.value as GradeLevel)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-xs bg-white"
                    >
                      <option value="1º ano">1º ano do Ensino Médio</option>
                      <option value="2º ano">2º ano do Ensino Médio</option>
                      <option value="3º ano">3º ano do Ensino Médio</option>
                    </select>
                    <span className="text-[10px] text-emerald-600 font-medium mt-0.5 block">
                      ✓ Altera direto pelo painel a qualquer momento.
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    E-mail ou Telefone (WhatsApp) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="seu.email@exemplo.com ou (11) 99999-9999"
                      value={contactInfo}
                      onChange={(e) => setContactInfo(e.target.value)}
                      className="w-full p-2.5 pl-9 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-xs"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                </div>
              </div>

              {/* Credenciais de Acesso */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 text-indigo-900 font-bold border-b border-slate-100 pb-1.5">
                  <KeyRound className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs uppercase tracking-wider">Acesso e Senha</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Usuário de Login (sem espaços) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: mariana.silva"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Senha <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Mínimo 6 caracteres"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-2.5 pl-9 pr-9 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-xs"
                      />
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-2 p-0.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition"
                        title={showPassword ? 'Ocultar senha' : 'Ver senha'}
                        aria-label={showPassword ? 'Ocultar senha' : 'Ver senha'}
                      >
                        {showPassword ? (
                          <EyeOff className="w-3.5 h-3.5" />
                        ) : (
                          <Eye className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Confirmar Senha <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        placeholder="Repita a senha"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full p-2.5 pl-9 pr-9 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-xs"
                      />
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2.5 top-2 p-0.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition"
                        title={showConfirmPassword ? 'Ocultar confirmação' : 'Ver confirmação'}
                        aria-label={showConfirmPassword ? 'Ocultar confirmação de senha' : 'Ver confirmação de senha'}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-3.5 h-3.5" />
                        ) : (
                          <Eye className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vínculo Escolar & Neuroinclusão */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 text-indigo-900 font-bold border-b border-slate-100 pb-1.5">
                  <Brain className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs uppercase tracking-wider">Vínculo Escolar & Acessibilidade</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Código da Instituição de Vínculo <span className="text-slate-400 font-normal">(Opcional)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Ex: ESC-SP-2025 ou deixe vazio se for independente"
                      value={schoolCode}
                      onChange={(e) => setSchoolCode(e.target.value)}
                      className="w-full p-2.5 pl-9 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-xs"
                    />
                    <Building className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                  <span className="text-[10px] text-emerald-600 font-medium mt-0.5 block">
                    ✓ Altera direto no perfil a qualquer momento sem necessidade de liberação.
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Perfil de Aprendizagem (Confidencial) <span className="text-slate-400 font-normal">(Opcional)</span>
                  </label>
                  <select
                    value={learningProfile}
                    onChange={(e) => setLearningProfile(e.target.value as LearningProfileType)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-xs bg-white"
                  >
                    <option value="Padrão">Padrão (Sem adaptações específicas)</option>
                    <option value="TDAH">TDAH (Blocos curtos de 15-20 min, 1 questão por vez, confirmação)</option>
                    <option value="TEA">TEA (Estrutura previsível, linguagem literal e objetiva)</option>
                    <option value="Dislexia">Dislexia (Fonte Lexend adaptada, áudio TTS, ortografia acolhedora)</option>
                    <option value="Combinado">Combinado (Adaptações integradas)</option>
                  </select>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    🔒 Dado protegido por sigilo. Não é compartilhado como diagnóstico médico. Altera direto.
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dataSharing}
                      onChange={(e) => setDataSharing(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 mt-0.5"
                    />
                    <span className="text-[11px] text-slate-700 leading-relaxed">
                      <strong>Compartilhamento de dados com escola:</strong> Autorizo o compartilhamento de métricas agregadas de rendimento com professores e coordenação vinculada. (Altera direto).
                    </span>
                  </label>
                </div>
              </div>

              {/* Termo de Uso Obrigatório */}
              <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-200/80">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 mt-0.5"
                  />
                  <span className="text-[11px] text-indigo-950 leading-relaxed">
                    <strong className="text-rose-600">*</strong> Declaro que li e concordo com os <strong>Termos de Uso e Política de Privacidade</strong> da Plataforma de Estudos ENEM. Entendo que o sistema não envia e-mails automáticos e qualquer alteração de dados restritos exige solicitação manual ao suporte. (Aceite registrado e bloqueado).
                  </span>
                </label>
              </div>

              {/* Botões de Ação */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold transition text-xs"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition shadow-sm flex items-center justify-center gap-2 text-xs"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Concluir Cadastro de Aluno</span>
                </button>
              </div>

              <div className="text-center pt-1 border-t border-slate-100">
                <span className="text-slate-500 text-[11px]">
                  Já possui uma conta de aluno?{' '}
                  <button
                    type="button"
                    onClick={handleGoToLogin}
                    className="text-indigo-600 font-bold hover:underline"
                  >
                    Fazer Login
                  </button>
                </span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
