import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  LogIn,
  X,
  User,
  Lock,
  Eye,
  EyeOff,
  GraduationCap,
  Users,
  School,
  Building2,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  KeyRound,
  ArrowRight,
  Landmark,
  Cpu,
  UserPlus
} from 'lucide-react';

export const LoginModal: React.FC = () => {
  const {
    isLoginModalOpen,
    setIsLoginModalOpen,
    setIsStudentRegisterModalOpen,
    login,
  } = useApp();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('mudar123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isLoginModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = login(username, password);
      if (!res.success) {
        setError(res.error || 'Credenciais inválidas.');
      }
    } catch (err: any) {
      setError('Erro ao processar autenticação.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (u: string, p: string = 'mudar123') => {
    setUsername(u);
    setPassword(p);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-scaleUp">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 relative">
          <button
            onClick={() => setIsLoginModalOpen(false)}
            className="absolute top-5 right-5 text-indigo-300 hover:text-white p-1 rounded-xl hover:bg-white/10 transition"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/60 border border-indigo-400/40 flex items-center justify-center font-black text-xl shadow-md">
              ENEM
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 block">
                Acesso Seguro • Sistema Inclusivo
              </span>
              <h3 className="text-xl font-extrabold tracking-tight">
                Entrar na Plataforma
              </h3>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Quick profile fillers */}
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Acesso Rápido por Perfil (Clique para preencher):
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {/* Usuários */}
              <button
                type="button"
                onClick={() => handleQuickFill('aluno')}
                className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition flex items-center gap-2 ${
                  username === 'aluno'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-950'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <GraduationCap className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="truncate">Aluno</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('professor')}
                className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition flex items-center gap-2 ${
                  username === 'professor'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-950'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Users className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="truncate">Professor</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('escola')}
                className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition flex items-center gap-2 ${
                  username === 'escola'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-950'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <School className="w-4 h-4 text-sky-600 shrink-0" />
                <span className="truncate">Escola</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('secretaria')}
                className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition flex items-center gap-2 ${
                  username === 'secretaria'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-950'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Landmark className="w-4 h-4 text-purple-600 shrink-0" />
                <span className="truncate">Secretaria Educ.</span>
              </button>

              {/* Gerenciadores */}
              <button
                type="button"
                onClick={() => handleQuickFill('operador')}
                className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition flex items-center gap-2 ${
                  username === 'operador'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-950'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Cpu className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="truncate">Operador</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('admin')}
                className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition flex items-center gap-2 ${
                  username === 'admin'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-950 ring-1 ring-indigo-500'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="truncate">Admin Geral</span>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Nome de Usuário (Login):
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Ex: admin, aluno, professor"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-3 pl-10 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Senha:
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Senha cadastrada"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 pl-10 pr-11 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                  title={showPassword ? 'Ocultar senha' : 'Ver senha'}
                  aria-label={showPassword ? 'Ocultar senha' : 'Ver senha'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-[11px] text-amber-900 leading-relaxed flex items-start gap-2">
              <KeyRound className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Regra de Primeiro Acesso:</strong> Senha inicial do Administrador é <code className="bg-white px-1.5 py-0.5 rounded font-mono font-bold">mudar123</code>.
                Sempre que o usuário entrar pela primeira vez, o sistema exigirá a troca imediata de senha por segurança.
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Entrar no Sistema</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </form>

          {/* Área de Primeiro Acesso do Aluno - Botão de Cadastro */}
          <div className="pt-4 border-t border-slate-200">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 border border-emerald-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="space-y-0.5 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-1.5">
                  <GraduationCap className="w-4 h-4 text-emerald-700" />
                  <span className="text-xs font-extrabold text-slate-900">
                    É sua primeira vez como Aluno?
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Faça sua inscrição gratuita e independente para começar agora mesmo.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsLoginModalOpen(false);
                  setIsStudentRegisterModalOpen(true);
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5 shrink-0"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Cadastro</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
