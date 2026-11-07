import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRegistrationRecord, GradeLevel, LearningProfileType } from '../../types';
import {
  Lock,
  Unlock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Save,
  Mail,
  User,
  BookOpen,
  Brain,
  School,
  Landmark,
  Layers
} from 'lucide-react';

interface UserProfileEditorProps {
  recordId?: number;
}

export const UserProfileEditor: React.FC<UserProfileEditorProps> = ({ recordId }) => {
  const {
    currentUser,
    registrationRecords,
    saveEditedRecord,
    updateFreeFieldsDirectly,
  } = useApp();

  // Find record: either provided ID or matched by current user role
  const record: UserRegistrationRecord | undefined =
    (recordId ? registrationRecords.find((r) => r.id === recordId) : undefined) ||
    registrationRecords.find((r) => {
      if (currentUser?.role === 'aluno') return r.level.includes('Aluno');
      if (currentUser?.role === 'professor') return r.level.includes('Professor');
      if (currentUser?.role === 'escola') return r.level.includes('Escola');
      if (currentUser?.role === 'secretaria_educacao') return r.level.includes('Prefeitura');
      if (currentUser?.role === 'operador') return r.level.includes('Operador');
      return r.level.includes('Administrador');
    }) ||
    registrationRecords[0];

  const [isEditingProtected, setIsEditingProtected] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Protected fields state
  const [fullName, setFullName] = useState(record?.fullName || '');
  const [email, setEmail] = useState(record?.email || '');
  const [phone, setPhone] = useState(record?.phone || '');

  // Free fields state (Exceções — alteração direta sem liberação)
  const [currentGrade, setCurrentGrade] = useState<GradeLevel>(record?.currentGrade || '2º ano');
  const [schoolLinkCode, setSchoolLinkCode] = useState(record?.schoolLinkCode || '');
  const [learningProfile, setLearningProfile] = useState<LearningProfileType>(record?.learningProfile || 'Padrão');
  const [dataSharing, setDataSharing] = useState<boolean>(record?.dataSharing ?? true);
  const [customQuestionBank, setCustomQuestionBank] = useState<boolean>(record?.customQuestionBank ?? false);
  const [allowIndependent, setAllowIndependent] = useState<boolean>(record?.allowIndependentSchoolEnrollment ?? true);
  const [teachingSubjects, setTeachingSubjects] = useState<string>(
    record?.teachingSubjects ? record.teachingSubjects.join(', ') : 'Física'
  );

  if (!record) return null;

  const handleSaveFreeFields = () => {
    updateFreeFieldsDirectly(record.id, {
      currentGrade,
      schoolLinkCode,
      learningProfile,
      dataSharing,
      customQuestionBank,
      allowIndependentSchoolEnrollment: allowIndependent,
      teachingSubjects: teachingSubjects.split(',').map((s) => s.trim()),
    });
    setSuccessMsg('Dados livres atualizados com sucesso e registrados no sistema.');
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleSaveProtectedFields = (e: React.FormEvent) => {
    e.preventDefault();
    if (!record.editUnlocked) return;

    saveEditedRecord(
      record.id,
      {
        fullName,
        email,
        phone,
      },
      currentUser?.name || record.fullName
    );

    setIsEditingProtected(false);
    setSuccessMsg('Alterações salvas! Conforme a regra da Parte 4, o botão de edição foi automaticamente bloqueado.');
    setTimeout(() => setSuccessMsg(null), 5000);
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
      {/* Header of Profile */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
              Registro #{String(record.id).padStart(6, '0')}
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-xs font-bold text-slate-700">{record.level}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Dados Cadastrais Oficiais & Liberação de Edição
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Última alteração: <strong>{record.lastModified.date} às {record.lastModified.time}</strong> por {record.lastModified.by}
          </p>
        </div>

        {/* Lock status indicator */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {record.editUnlocked ? (
            <div className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-900 font-bold text-xs border border-emerald-300 flex items-center gap-1.5 shadow-xs animate-pulse">
              <Unlock className="w-4 h-4 text-emerald-700" />
              <span>Edição Liberada (até {record.editUnlockedUntil})</span>
            </div>
          ) : (
            <div className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-slate-500" />
              <span>Edição Bloqueada por Padrão</span>
            </div>
          )}
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-950 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* PART 4 NOTICE BANNER */}
      {!record.editUnlocked && (
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-950 text-xs leading-relaxed space-y-1">
          <div className="flex items-center gap-2 font-bold text-amber-900">
            <Lock className="w-4 h-4 text-amber-600" />
            <span>Regra de Edição (Parte 4 do Sistema):</span>
          </div>
          <p className="text-amber-800">
            <strong>"Edição bloqueada. Envie e-mail para <code className="font-mono bg-white px-1.5 py-0.5 rounded text-amber-950 font-bold">suporte@sistemaenem.com.br</code> solicitando a alteração."</strong>
          </p>
          <p className="text-[11px] text-amber-700 pt-0.5">
            O Administrador localizará seu cadastro e liberará o botão manualmente dentro do sistema. Nenhuma confirmação automática é enviada por e-mail.
          </p>
        </div>
      )}

      {/* SECTION 1: PROTECTED FIELDS (Require admin unlock to edit) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-600" />
            <span>Dados Principais (Edição Mediada pelo Administrador)</span>
          </h3>

          {record.editUnlocked ? (
            <button
              onClick={() => setIsEditingProtected(!isEditingProtected)}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>{isEditingProtected ? 'Cancelar Edição' : 'Editar Dados Liberados'}</span>
            </button>
          ) : (
            <button
              disabled
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-400 font-bold text-xs border border-slate-200 flex items-center gap-1.5 cursor-not-allowed"
              title="Edição bloqueada. Envie e-mail para suporte@sistemaenem.com.br solicitando a alteração."
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Editar (Bloqueado)</span>
            </button>
          )}
        </div>

        {isEditingProtected && record.editUnlocked ? (
          <form onSubmit={handleSaveProtectedFields} className="space-y-3.5 text-xs bg-emerald-50/30 p-4 rounded-2xl border border-emerald-200">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nome Completo:</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">E-mail Institucional:</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Telefone:</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditingProtected(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md transition flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Salvar e Concluir Edição</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Nome Completo / Entidade</span>
              <span className="font-semibold text-slate-900">{record.fullName}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">E-mail</span>
              <span className="font-semibold text-slate-900">{record.email || 'Não informado'}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Telefone</span>
              <span className="font-semibold text-slate-900">{record.phone || 'Não informado'}</span>
            </div>
          </div>
        )}

        {/* Readonly verified documents */}
        {(record.cpf || record.cnpj || record.birthDate) && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
            {record.cpf && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase block flex items-center justify-between">
                  <span>CPF</span>
                  <span className="text-rose-600 font-mono text-[9px]">[BLOQUEADO DEFINITIVO]</span>
                </span>
                <span className="font-mono font-semibold text-slate-900">{record.cpf}</span>
              </div>
            )}
            {record.cnpj && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase block flex items-center justify-between">
                  <span>CNPJ</span>
                  <span className="text-rose-600 font-mono text-[9px]">[BLOQUEADO DEFINITIVO]</span>
                </span>
                <span className="font-mono font-semibold text-slate-900">{record.cnpj}</span>
              </div>
            )}
            {record.birthDate && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase block flex items-center justify-between">
                  <span>Data de Nascimento</span>
                  <span className="text-rose-600 font-mono text-[9px]">[BLOQUEADO]</span>
                </span>
                <span className="font-semibold text-slate-900">{record.birthDate}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* SECTION 2: EXCEÇÕES — ALTERAÇÃO DIRETA SEM LIBERAÇÃO (PARTE 4) */}
      <div className="space-y-4 pt-3 border-t border-slate-100">
        <div className="flex items-center justify-between pb-1">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Campos de Alteração Direta (Livres sem Necessidade de Liberação)</span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Conforme a Parte 4, estes campos podem ser alterados pelo próprio usuário a qualquer momento.
            </p>
          </div>

          <button
            onClick={handleSaveFreeFields}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Salvar Alterações Livres</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
          {/* Aluno: Série, vínculo, perfil, compartilhamento */}
          {record.level.includes('Aluno') && (
            <>
              <div className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-200 space-y-1.5">
                <label className="font-bold text-indigo-950 block">
                  Série Atual [Altera Direto]:
                </label>
                <select
                  value={currentGrade}
                  onChange={(e) => setCurrentGrade(e.target.value as GradeLevel)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-bold"
                >
                  <option value="1º ano">1º ano do Ensino Médio</option>
                  <option value="2º ano">2º ano do Ensino Médio</option>
                  <option value="3º ano">3º ano do Ensino Médio</option>
                </select>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50/40 border border-purple-200 space-y-1.5">
                <label className="font-bold text-purple-950 block">
                  Perfil de Aprendizagem [Confidencial • Altera Direto]:
                </label>
                <select
                  value={learningProfile}
                  onChange={(e) => setLearningProfile(e.target.value as LearningProfileType)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-bold"
                >
                  <option value="Padrão">Padrão</option>
                  <option value="TDAH">TDAH</option>
                  <option value="TEA">TEA</option>
                  <option value="Dislexia">Dislexia</option>
                  <option value="Combinado">Combinado</option>
                </select>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <label className="font-bold text-slate-900 block">
                  Código de Vínculo com a Escola [Altera Direto]:
                </label>
                <input
                  type="text"
                  placeholder="Ex: GLORIA-ENEM-LIVRE"
                  value={schoolLinkCode}
                  onChange={(e) => setSchoolLinkCode(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-mono"
                />
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">Compartilhamento de Dados com Escola</span>
                  <span className="text-[11px] text-slate-500">Permite à escola ver seu progresso de estudos</span>
                </div>
                <button
                  type="button"
                  onClick={() => setDataSharing(!dataSharing)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                    dataSharing ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {dataSharing ? 'Sim (Ativo)' : 'Não (Desativado)'}
                </button>
              </div>
            </>
          )}

          {/* Professor: Disciplinas */}
          {record.level.includes('Professor') && (
            <div className="sm:col-span-2 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <label className="font-bold text-slate-900 block">
                Disciplinas Ministradas [Altera Direto]:
              </label>
              <input
                type="text"
                placeholder="Ex: Física, Química, Biologia"
                value={teachingSubjects}
                onChange={(e) => setTeachingSubjects(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium"
              />
            </div>
          )}

          {/* Escola: Banco de questões próprio */}
          {record.level.includes('Escola') && (
            <div className="sm:col-span-2 p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block">Banco de Questões Próprio da Escola [Altera Direto]</span>
                <span className="text-[11px] text-slate-500">Habilita a criação de itens institucionais pelos docentes da unidade</span>
              </div>
              <button
                type="button"
                onClick={() => setCustomQuestionBank(!customQuestionBank)}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                  customQuestionBank ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {customQuestionBank ? 'Sim (Ativo)' : 'Não (Desativado)'}
              </button>
            </div>
          )}

          {/* Secretaria: Permitir adesão independente */}
          {record.level.includes('Prefeitura') && (
            <div className="sm:col-span-2 p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block">Permitir Adesão Independente de Escolas da Rede [Altera Direto]</span>
                <span className="text-[11px] text-slate-500">Garante autonomia conforme Princípio 4 da plataforma</span>
              </div>
              <button
                type="button"
                onClick={() => setAllowIndependent(!allowIndependent)}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                  allowIndependent ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {allowIndependent ? 'Sim (Permitido)' : 'Não (Bloqueado)'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
