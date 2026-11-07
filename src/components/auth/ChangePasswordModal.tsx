import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { KeyRound, ShieldAlert, CheckCircle2, Lock, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';

export const ChangePasswordModal: React.FC = () => {
  const { pendingPasswordChangeUser, changePassword, setPendingPasswordChangeUser } = useApp();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!pendingPasswordChangeUser) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError('A nova senha deve possuir no mínimo 6 caracteres.');
      return;
    }

    if (newPassword === 'mudar123') {
      setError('A nova senha não pode ser a senha inicial padrão ("mudar123").');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('A confirmação não coincide com a nova senha digitada.');
      return;
    }

    const res = changePassword(pendingPasswordChangeUser.id, newPassword);
    if (!res.success) {
      setError(res.error || 'Erro ao alterar a senha.');
      return;
    }

    setIsSuccess(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-scaleUp">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
              <KeyRound className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-200 block">
                Segurança Obrigatória
              </span>
              <h3 className="text-lg font-extrabold leading-tight">
                Troca Obrigatória de Senha
              </h3>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-950 leading-relaxed flex items-start gap-2.5">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Primeiro Acesso Detectado:</strong> Você entrou com a senha padrão temporária (<code className="bg-white px-1.5 py-0.5 rounded font-mono font-bold">mudar123</code>).
              Para proteger sua conta, crie sua senha pessoal definitiva para continuar.
            </div>
          </div>

          <div className="text-xs text-slate-600 space-y-1">
            <p>
              Usuário: <strong className="text-slate-900">{pendingPasswordChangeUser.name}</strong>
            </p>
            <p>
              Login: <span className="font-mono text-slate-800">@{pendingPasswordChangeUser.username}</span> ({pendingPasswordChangeUser.role})
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Nova Senha (mínimo 6 caracteres):
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  placeholder="Digite sua nova senha"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-3 pl-10 pr-11 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-2.5 p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                  title={showNewPassword ? 'Ocultar senha' : 'Ver senha'}
                  aria-label={showNewPassword ? 'Ocultar nova senha' : 'Ver nova senha'}
                >
                  {showNewPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Confirmar Nova Senha:
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  placeholder="Repita exatamente a nova senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-3 pl-10 pr-11 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2.5 p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                  title={showConfirmPassword ? 'Ocultar confirmação' : 'Ver confirmação'}
                  aria-label={showConfirmPassword ? 'Ocultar confirmação de senha' : 'Ver confirmação de senha'}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setPendingPasswordChangeUser(null)}
                className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
              >
                Cancelar Login
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-md transition flex items-center gap-2"
              >
                <span>Salvar Nova Senha</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
