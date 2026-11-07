/**
 * Utilitários de Validação, Normalização e Formatação de CPF e CNPJ
 * Conforme requisitos do Sistema de Identificação Universal do Portal ENEM
 * e Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
 */

import { UserRole } from '../types';

/**
 * Remove todos os caracteres não numéricos.
 */
export function normalizeDocument(doc: string): string {
  if (!doc) return '';
  return doc.replace(/\D/g, '');
}

/**
 * Validação algorítmica rigorosa de CPF (11 dígitos com cálculo dos 2 dígitos verificadores).
 */
export function isValidCPF(cpf: string): boolean {
  const clean = normalizeDocument(cpf);
  if (clean.length !== 11) return false;

  // Rejeita sequências de dígitos idênticos (ex: 000.000.000-00, 111.111.111-11, etc.)
  if (/^(\d)\1{10}$/.test(clean)) return false;

  // Validação do 1º dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(clean.charAt(i), 10) * (10 - i);
  }
  let rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(clean.charAt(9), 10)) return false;

  // Validação do 2º dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(clean.charAt(i), 10) * (11 - i);
  }
  rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(clean.charAt(10), 10)) return false;

  return true;
}

/**
 * Validação algorítmica rigorosa de CNPJ (14 dígitos com cálculo dos 2 dígitos verificadores).
 */
export function isValidCNPJ(cnpj: string): boolean {
  const clean = normalizeDocument(cnpj);
  if (clean.length !== 14) return false;

  // Rejeita sequências de dígitos idênticos
  if (/^(\d)\1{13}$/.test(clean)) return false;

  // Validação do 1º dígito verificador
  const weightsFirst = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(clean.charAt(i), 10) * weightsFirst[i];
  }
  let rev = sum % 11;
  const dig1 = rev < 2 ? 0 : 11 - rev;
  if (dig1 !== parseInt(clean.charAt(12), 10)) return false;

  // Validação do 2º dígito verificador
  const weightsSecond = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(clean.charAt(i), 10) * weightsSecond[i];
  }
  rev = sum % 11;
  const dig2 = rev < 2 ? 0 : 11 - rev;
  if (dig2 !== parseInt(clean.charAt(13), 10)) return false;

  return true;
}

/**
 * Formata CPF para apresentação padrão: 000.000.000-00
 */
export function formatCPF(cpf: string): string {
  const clean = normalizeDocument(cpf);
  if (clean.length !== 11) return cpf;
  return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Formata CNPJ para apresentação padrão: 00.000.000/0000-00
 */
export function formatCNPJ(cnpj: string): string {
  const clean = normalizeDocument(cnpj);
  if (clean.length !== 14) return cnpj;
  return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

/**
 * Mascara CPF para conformidade com a LGPD em telas compartilhadas ou relatórios:
 * Ex: ***.456.789-**
 */
export function maskCPF(cpf: string): string {
  const clean = normalizeDocument(cpf);
  if (clean.length !== 11) return '***.***.***-**';
  return `***.${clean.slice(3, 6)}.${clean.slice(6, 9)}-**`;
}

/**
 * Mascara CNPJ para conformidade com a LGPD em telas compartilhadas ou relatórios:
 * Ex: **.384.111/****-40
 */
export function maskCNPJ(cnpj: string): string {
  const clean = normalizeDocument(cnpj);
  if (clean.length !== 14) return '**.***.***/****-**';
  return `**.${clean.slice(2, 5)}.${clean.slice(5, 8)}/****-${clean.slice(12, 14)}`;
}

/**
 * Gera Identificador Técnico Interno Único (independente de CPF/CNPJ):
 * Ex: USR-ALU-001, USR-PRF-042, INST-ESC-015, INST-SEC-003
 */
export function generateTechnicalId(role: UserRole, idNumber: number | string): string {
  const prefixMap: Record<UserRole, string> = {
    aluno: 'USR-ALU',
    professor: 'USR-PRF',
    escola: 'INST-ESC',
    secretaria_educacao: 'INST-SEC',
    responsavel: 'USR-RES',
    parceiro: 'INST-PAR',
    operador: 'ADM-OPR',
    admin: 'ADM-GLB',
  };
  const prefix = prefixMap[role] || 'USR-GEN';
  const padded = typeof idNumber === 'number' ? String(idNumber).padStart(4, '0') : String(idNumber);
  return `${prefix}-${padded}`;
}

/**
 * Validação abrangente de documento de acordo com o papel (role) do usuário.
 */
export function validateDocumentForRole(
  document: string,
  role: UserRole
): {
  valid: boolean;
  documentType: 'CPF' | 'CNPJ';
  normalized: string;
  formatted: string;
  masked: string;
  error?: string;
} {
  const normalized = normalizeDocument(document);

  if (role === 'aluno' || role === 'professor') {
    if (normalized.length !== 11) {
      return {
        valid: false,
        documentType: 'CPF',
        normalized,
        formatted: document,
        masked: '***.***.***-**',
        error: `O CPF deve conter exatamente 11 dígitos numéricos (informados: ${normalized.length}).`,
      };
    }
    if (!isValidCPF(normalized)) {
      return {
        valid: false,
        documentType: 'CPF',
        normalized,
        formatted: formatCPF(normalized),
        masked: maskCPF(normalized),
        error: 'CPF inválido: os dígitos verificadores não conferem com o algoritmo da Receita Federal.',
      };
    }
    return {
      valid: true,
      documentType: 'CPF',
      normalized,
      formatted: formatCPF(normalized),
      masked: maskCPF(normalized),
    };
  }

  if (role === 'escola' || role === 'secretaria_educacao') {
    if (normalized.length !== 14) {
      return {
        valid: false,
        documentType: 'CNPJ',
        normalized,
        formatted: document,
        masked: '**.***.***/****-**',
        error: `O CNPJ deve conter exatamente 14 dígitos numéricos (informados: ${normalized.length}).`,
      };
    }
    if (!isValidCNPJ(normalized)) {
      return {
        valid: false,
        documentType: 'CNPJ',
        normalized,
        formatted: formatCNPJ(normalized),
        masked: maskCNPJ(normalized),
        error: 'CNPJ inválido: os dígitos verificadores não conferem com o algoritmo da Receita Federal.',
      };
    }
    return {
      valid: true,
      documentType: 'CNPJ',
      normalized,
      formatted: formatCNPJ(normalized),
      masked: maskCNPJ(normalized),
    };
  }

  // Outros papéis
  return {
    valid: true,
    documentType: normalized.length > 11 ? 'CNPJ' : 'CPF',
    normalized,
    formatted: normalized.length > 11 ? formatCNPJ(normalized) : formatCPF(normalized),
    masked: normalized.length > 11 ? maskCNPJ(normalized) : maskCPF(normalized),
  };
}

/**
 * Função utilitária para gerar um CPF matematicamente válido para testes ou migração
 */
export function generateValidCPFSeed(baseNum: number = 123456789): string {
  const n = String(baseNum).padStart(9, '0').slice(-9);
  const d: number[] = n.split('').map(Number);
  
  // 1st digit
  let s1 = 0;
  for (let i = 0; i < 9; i++) s1 += d[i] * (10 - i);
  let r1 = 11 - (s1 % 11);
  if (r1 >= 10) r1 = 0;
  d.push(r1);

  // 2nd digit
  let s2 = 0;
  for (let i = 0; i < 10; i++) s2 += d[i] * (11 - i);
  let r2 = 11 - (s2 % 11);
  if (r2 >= 10) r2 = 0;
  d.push(r2);

  return d.join('');
}

/**
 * Função utilitária para gerar um CNPJ matematicamente válido para testes ou migração
 */
export function generateValidCNPJSeed(baseNum: number = 12345678, filial: number = 1): string {
  const n = String(baseNum).padStart(8, '0').slice(-8) + String(filial).padStart(4, '0');
  const d: number[] = n.split('').map(Number);

  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let s1 = 0;
  for (let i = 0; i < 12; i++) s1 += d[i] * w1[i];
  let r1 = s1 % 11;
  const dig1 = r1 < 2 ? 0 : 11 - r1;
  d.push(dig1);

  const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let s2 = 0;
  for (let i = 0; i < 13; i++) s2 += d[i] * w2[i];
  let r2 = s2 % 11;
  const dig2 = r2 < 2 ? 0 : 11 - r2;
  d.push(dig2);

  return d.join('');
}
