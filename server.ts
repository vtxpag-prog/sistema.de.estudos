import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import {
  isValidCPF,
  isValidCNPJ,
  formatCPF,
  formatCNPJ,
  maskCPF,
  maskCNPJ,
  normalizeDocument,
  generateTechnicalId,
  validateDocumentForRole,
} from './src/utils/documentValidation';
import {
  INITIAL_EDUCATIONAL_RELATIONSHIPS,
  INITIAL_RELATIONSHIP_AUDIT_LOGS,
  INITIAL_STUDENT_SNAPSHOTS,
} from './src/data/relationshipData';
import { INITIAL_USERS } from './src/data/mockUsers';
import { EducationalRelationship, RelationshipAuditLog, StudentAcademicSnapshot } from './src/types';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // Gemini client initialization with standard telemetry header
  const apiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  // --- API ROUTE: HEALTH CHECK & STATUS ---
  app.get('/api/health', (req, res) => {
    return res.json({
      status: 'ok',
      service: 'Plataforma de Estudos ENEM Inclusiva',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      aiAvailable: !!ai,
    });
  });

  // =========================================================================
  // MÓDULO 2, 3, 9, 11: IDENTIFICAÇÃO UNIVERSAL & RELACIONAMENTOS INSTITUCIONAIS
  // =========================================================================

  // In-memory persistent database across requests
  const backendUsers = [...INITIAL_USERS];
  const backendRelationships: EducationalRelationship[] = [...INITIAL_EDUCATIONAL_RELATIONSHIPS];
  const backendAuditLogs: RelationshipAuditLog[] = [...INITIAL_RELATIONSHIP_AUDIT_LOGS];
  const backendStudentSnapshots: Record<string, StudentAcademicSnapshot> = { ...INITIAL_STUDENT_SNAPSHOTS };

  // 1. Validar CPF ou CNPJ conforme a regra do papel (Aluno/Professor: CPF | Escola/Secretaria: CNPJ)
  app.post('/api/universal-id/validate', (req, res) => {
    try {
      const { document, role } = req.body;
      if (!document || !role) {
        return res.status(400).json({ error: 'Documento e papel (role) são obrigatórios.' });
      }

      const result = validateDocumentForRole(String(document), role);
      return res.json(result);
    } catch (error: any) {
      return res.status(500).json({ error: 'Erro ao validar identificador universal.', details: error.message });
    }
  });

  // 2. Verificar se documento já possui cadastro ativo (impede duplicidades)
  app.post('/api/universal-id/check-duplicate', (req, res) => {
    try {
      const { document, currentUserId } = req.body;
      if (!document) {
        return res.status(400).json({ error: 'Documento é obrigatório.' });
      }

      const clean = normalizeDocument(String(document));
      const duplicate = backendUsers.find(
        (u) => normalizeDocument(u.documentNumber || '') === clean && u.id !== currentUserId
      );

      if (duplicate) {
        return res.json({
          isDuplicate: true,
          error: `O documento informado já possui cadastro ativo na plataforma vinculado a outro usuário. Por segurança e conformidade com a LGPD, o documento deve ser único.`,
        });
      }

      return res.json({ isDuplicate: false });
    } catch (error: any) {
      return res.status(500).json({ error: 'Erro ao checar duplicidade de documento.' });
    }
  });

  // 3. Localizar usuário/instituição por documento com proteção LGPD (retorna dados mínimos)
  app.post('/api/universal-id/lookup', (req, res) => {
    try {
      const { document, targetRole } = req.body;
      if (!document) {
        return res.status(400).json({ error: 'Documento não fornecido.' });
      }

      const clean = normalizeDocument(String(document));
      const user = backendUsers.find(
        (u) => normalizeDocument(u.documentNumber || '') === clean && (!targetRole || u.role === targetRole)
      );

      if (!user) {
        return res.status(404).json({
          found: false,
          error: `Nenhum cadastro ativo encontrado para o documento informado na categoria selecionada. Não foi criado cadastro fictício.`,
        });
      }

      // Retorna APENAS dados mínimos para confirmação de identidade sem vazar dados desnecessários (LGPD)
      return res.json({
        found: true,
        technicalId: user.technicalId,
        id: user.id,
        name: user.name,
        role: user.role,
        maskedDocument: user.maskedDocument || maskCPF(clean),
        organization: user.organization,
      });
    } catch (error: any) {
      return res.status(500).json({ error: 'Erro ao localizar cadastro.' });
    }
  });

  // 4. Listar relacionamentos por usuário ou perfil
  app.get('/api/relationships', (req, res) => {
    try {
      const { userId, technicalId, status } = req.query;

      let list = [...backendRelationships];

      if (userId) {
        list = list.filter((r) => r.sourceUserId === userId || r.targetUserId === userId);
      } else if (technicalId) {
        list = list.filter((r) => r.sourceTechnicalId === technicalId || r.targetTechnicalId === technicalId);
      }

      if (status) {
        list = list.filter((r) => r.status === status);
      }

      return res.json({
        total: list.length,
        relationships: list,
      });
    } catch (error: any) {
      return res.status(500).json({ error: 'Erro ao listar relacionamentos.' });
    }
  });

  // 5. Criar solicitação de relacionamento
  app.post('/api/relationships/request', (req, res) => {
    try {
      const {
        sourceUserId,
        targetDocument,
        relationshipType,
        assignedClass,
        subject,
        permissions,
        notes,
      } = req.body;

      const sourceUser = backendUsers.find((u) => u.id === sourceUserId);
      if (!sourceUser) {
        return res.status(404).json({ error: 'Usuário solicitante não encontrado.' });
      }

      const cleanTargetDoc = normalizeDocument(targetDocument || '');
      const targetUser = backendUsers.find(
        (u) => normalizeDocument(u.documentNumber || '') === cleanTargetDoc
      );

      if (!targetUser) {
        return res.status(404).json({
          error: 'Destinatário não localizado pelo documento informado. O destinatário precisa se cadastrar previamente na plataforma.',
        });
      }

      if (sourceUser.id === targetUser.id) {
        return res.status(400).json({ error: 'Não é permitido criar um vínculo consigo mesmo.' });
      }

      // Checa se já existe vínculo ativo ou pendente entre as duas partes
      const existing = backendRelationships.find(
        (r) =>
          ((r.sourceUserId === sourceUser.id && r.targetUserId === targetUser.id) ||
            (r.sourceUserId === targetUser.id && r.targetUserId === sourceUser.id)) &&
          (r.status === 'aprovado' || r.status === 'pendente')
      );

      if (existing) {
        return res.status(409).json({
          error: `Já existe um relacionamento ${existing.status} registrado entre estas partes (ID: ${existing.id}).`,
        });
      }

      const relId = `REL-${String(backendRelationships.length + 1).padStart(4, '0')}`;
      const nowStr = new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

      const logId = `LOG-${String(backendAuditLogs.length + 1).padStart(4, '0')}`;
      const auditLog: RelationshipAuditLog = {
        id: logId,
        action: 'SOLICITACAO_CRIADA',
        actorId: sourceUser.technicalId,
        actorName: sourceUser.name,
        actorRole: sourceUser.role,
        targetId: targetUser.technicalId,
        timestamp: nowStr,
        details: `Solicitação de vínculo (${relationshipType}) enviada para ${targetUser.name}.`,
      };

      const newRel: EducationalRelationship = {
        id: relId,
        relationshipType,
        status: 'pendente',
        sourceTechnicalId: sourceUser.technicalId,
        sourceUserId: sourceUser.id,
        sourceName: sourceUser.name,
        sourceRole: sourceUser.role,
        sourceDocument: sourceUser.documentNumber,
        targetTechnicalId: targetUser.technicalId,
        targetUserId: targetUser.id,
        targetName: targetUser.name,
        targetRole: targetUser.role,
        targetDocument: targetUser.documentNumber,
        requestedAt: nowStr,
        requestedBy: sourceUser.name,
        assignedClass: assignedClass || undefined,
        subject: subject || undefined,
        permissions: permissions || {
          viewPerformance: true,
          viewSimulations: true,
          viewEssays: true,
          viewAttendance: true,
          viewDifficulties: true,
          viewDetailedReports: true,
        },
        history: [auditLog],
        notes: notes || undefined,
      };

      backendRelationships.unshift(newRel);
      backendAuditLogs.unshift(auditLog);

      return res.status(201).json({
        success: true,
        message: 'Solicitação de vínculo criada com sucesso. Aguardando aprovação do destinatário.',
        relationship: newRel,
      });
    } catch (error: any) {
      return res.status(500).json({ error: 'Erro ao solicitar relacionamento.', details: error.message });
    }
  });

  // 6. Aprovar solicitação de relacionamento
  app.post('/api/relationships/:id/approve', (req, res) => {
    try {
      const { id } = req.params;
      const { approverUserId } = req.body;

      const rel = backendRelationships.find((r) => r.id === id);
      if (!rel) {
        return res.status(404).json({ error: 'Vínculo não localizado.' });
      }

      const approver = backendUsers.find((u) => u.id === approverUserId);
      const approverName = approver ? approver.name : rel.targetName;

      const nowStr = new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

      rel.status = 'aprovado';
      rel.approvedAt = nowStr;
      rel.approvedBy = approverName;

      const logId = `LOG-${String(backendAuditLogs.length + 1).padStart(4, '0')}`;
      const log: RelationshipAuditLog = {
        id: logId,
        action: 'VINCULO_APROVADO',
        actorId: approver ? approver.technicalId : rel.targetTechnicalId,
        actorName: approverName,
        actorRole: approver ? approver.role : rel.targetRole,
        targetId: rel.sourceTechnicalId,
        timestamp: nowStr,
        details: `Vínculo aprovado por ${approverName}. Permissões educacionais concedidas conforme configurado.`,
      };

      rel.history.unshift(log);
      backendAuditLogs.unshift(log);

      return res.json({
        success: true,
        message: 'Vínculo aprovado com sucesso! Os indicadores autorizados agora podem ser consultados.',
        relationship: rel,
      });
    } catch (error: any) {
      return res.status(500).json({ error: 'Erro ao aprovar relacionamento.' });
    }
  });

  // 7. Recusar solicitação de relacionamento
  app.post('/api/relationships/:id/reject', (req, res) => {
    try {
      const { id } = req.params;
      const { rejecterUserId, reason } = req.body;

      const rel = backendRelationships.find((r) => r.id === id);
      if (!rel) {
        return res.status(404).json({ error: 'Vínculo não localizado.' });
      }

      const rejecter = backendUsers.find((u) => u.id === rejecterUserId);
      const rejecterName = rejecter ? rejecter.name : rel.targetName;

      const nowStr = new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

      rel.status = 'recusado';
      rel.endedAt = nowStr;

      const logId = `LOG-${String(backendAuditLogs.length + 1).padStart(4, '0')}`;
      const log: RelationshipAuditLog = {
        id: logId,
        action: 'VINCULO_RECUSADO',
        actorId: rejecter ? rejecter.technicalId : rel.targetTechnicalId,
        actorName: rejecterName,
        actorRole: rejecter ? rejecter.role : rel.targetRole,
        targetId: rel.sourceTechnicalId,
        timestamp: nowStr,
        details: `Solicitação de vínculo recusada por ${rejecterName}.${reason ? ` Motivo: ${reason}` : ''}`,
      };

      rel.history.unshift(log);
      backendAuditLogs.unshift(log);

      return res.json({
        success: true,
        message: 'Solicitação de vínculo recusada.',
        relationship: rel,
      });
    } catch (error: any) {
      return res.status(500).json({ error: 'Erro ao recusar relacionamento.' });
    }
  });

  // 8. Revogar / Encerrar relacionamento ativo (Aluno revoga Professor, Professor revoga Escola, etc.)
  app.post('/api/relationships/:id/revoke', (req, res) => {
    try {
      const { id } = req.params;
      const { revokerUserId, reason } = req.body;

      const rel = backendRelationships.find((r) => r.id === id);
      if (!rel) {
        return res.status(404).json({ error: 'Vínculo não localizado.' });
      }

      const revoker = backendUsers.find((u) => u.id === revokerUserId);
      const revokerName = revoker ? revoker.name : 'Titular da autorização';

      const nowStr = new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

      rel.status = 'encerrado';
      rel.endedAt = nowStr;

      const logId = `LOG-${String(backendAuditLogs.length + 1).padStart(4, '0')}`;
      const log: RelationshipAuditLog = {
        id: logId,
        action: 'VINCULO_REVOGADO',
        actorId: revoker ? revoker.technicalId : rel.targetTechnicalId,
        actorName: revokerName,
        actorRole: revoker ? revoker.role : rel.targetRole,
        targetId: rel.sourceTechnicalId,
        timestamp: nowStr,
        details: `Vínculo formalmente revogado por ${revokerName}. O acesso a dados educacionais foi suspenso imediatamente, com histórico preservado.${reason ? ` Motivo: ${reason}` : ''}`,
      };

      rel.history.unshift(log);
      backendAuditLogs.unshift(log);

      return res.json({
        success: true,
        message: 'Vínculo revogado com sucesso. O acesso aos dados educacionais foi interrompido conforme as regras de LGPD.',
        relationship: rel,
      });
    } catch (error: any) {
      return res.status(500).json({ error: 'Erro ao revogar relacionamento.' });
    }
  });

  // 9. Consulta segura de Indicadores Educacionais com Validação Rígida de Vínculo Aprovado no Backend (LGPD)
  app.get('/api/relationships/indicators/:targetId', (req, res) => {
    try {
      const { targetId } = req.params;
      const { requesterUserId, requesterRole } = req.query;

      if (!requesterUserId) {
        return res.status(401).json({ error: 'Identificação do solicitante ausente.' });
      }

      // Regra 1: O próprio aluno sempre pode ver seus dados integrais
      if (requesterUserId === targetId) {
        const ownSnapshot = backendStudentSnapshots[targetId] || {
          studentUserId: targetId,
          technicalId: 'USR-ALU-0001',
          studentName: 'Mariana Silva',
          gradeLevel: '3º ano',
          totalStudyTimeMinutes: 340,
          totalAnswered: 48,
          totalCorrect: 37,
          accuracyRate: 77,
          triScoreEstimated: 742,
          consecutiveDaysStreak: 8,
          simulationsCount: 3,
          essaysCount: 4,
          lastActiveDate: 'Hoje',
          authorizedAt: 'Ativo',
          relationshipId: 'SELF',
        };
        return res.json(ownSnapshot);
      }

      // Regra 2: Para terceiros (Professor, Escola, Secretaria), verificar se há vínculo 'aprovado'
      const hasDirectApproval = backendRelationships.some(
        (r) =>
          ((r.sourceUserId === requesterUserId && r.targetUserId === targetId) ||
            (r.targetUserId === requesterUserId && r.sourceUserId === targetId)) &&
          r.status === 'aprovado'
      );

      // Verificação transitiva: Escola visualiza aluno através de Professor vinculado aprovado
      let hasSchoolTransitiveApproval = false;
      if (!hasDirectApproval && requesterRole === 'escola') {
        const approvedProfLinks = backendRelationships.filter(
          (r) =>
            r.relationshipType === 'PROFESSOR_ESCOLA' &&
            r.status === 'aprovado' &&
            (r.sourceUserId === requesterUserId || r.targetUserId === requesterUserId)
        );
        const approvedTeacherIds = approvedProfLinks.map((r) =>
          r.sourceUserId === requesterUserId ? r.targetUserId : r.sourceUserId
        );

        hasSchoolTransitiveApproval = backendRelationships.some(
          (r) =>
            r.relationshipType === 'ALUNO_PROFESSOR' &&
            r.status === 'aprovado' &&
            (r.targetUserId === targetId || r.sourceUserId === targetId) &&
            (approvedTeacherIds.includes(r.sourceUserId) || approvedTeacherIds.includes(r.targetUserId))
        );
      }

      // Verificação transitiva: Secretaria visualiza através de Escola vinculada aprovada
      let hasSecretariatTransitiveApproval = false;
      if (!hasDirectApproval && !hasSchoolTransitiveApproval && requesterRole === 'secretaria_educacao') {
        const approvedSchoolLinks = backendRelationships.filter(
          (r) =>
            r.relationshipType === 'ESCOLA_SECRETARIA' &&
            r.status === 'aprovado' &&
            (r.sourceUserId === requesterUserId || r.targetUserId === requesterUserId)
        );
        const approvedSchoolIds = approvedSchoolLinks.map((r) =>
          r.sourceUserId === requesterUserId ? r.targetUserId : r.sourceUserId
        );

        const approvedTeachersInSchools = backendRelationships
          .filter(
            (r) =>
              r.relationshipType === 'PROFESSOR_ESCOLA' &&
              r.status === 'aprovado' &&
              (approvedSchoolIds.includes(r.sourceUserId) || approvedSchoolIds.includes(r.targetUserId))
          )
          .map((r) => (approvedSchoolIds.includes(r.sourceUserId) ? r.targetUserId : r.sourceUserId));

        hasSecretariatTransitiveApproval = backendRelationships.some(
          (r) =>
            r.relationshipType === 'ALUNO_PROFESSOR' &&
            r.status === 'aprovado' &&
            (r.targetUserId === targetId || r.sourceUserId === targetId) &&
            (approvedTeachersInSchools.includes(r.sourceUserId) || approvedTeachersInSchools.includes(r.targetUserId))
        );
      }

      if (!hasDirectApproval && !hasSchoolTransitiveApproval && !hasSecretariatTransitiveApproval) {
        return res.status(403).json({
          error:
            'Acesso negado: vínculo educacional não aprovado ou inexistente. Em observância à LGPD (Lei nº 13.709/2018), dados educacionais individuais só podem ser visualizados com consentimento explícito e vínculo ativo.',
        });
      }

      const snapshot = backendStudentSnapshots[targetId] || {
        studentUserId: targetId,
        technicalId: 'USR-ALU-0001',
        studentName: 'Estudante Autorizado',
        gradeLevel: '3º ano',
        totalStudyTimeMinutes: 280,
        totalAnswered: 42,
        totalCorrect: 31,
        accuracyRate: 74,
        triScoreEstimated: 715,
        consecutiveDaysStreak: 5,
        simulationsCount: 2,
        essaysCount: 3,
        lastActiveDate: 'Hoje',
        authorizedAt: 'Vínculo Ativo',
        relationshipId: 'AUTHORIZED',
      };

      // Registrar consulta em log de auditoria
      const logId = `LOG-${String(backendAuditLogs.length + 1).padStart(4, '0')}`;
      backendAuditLogs.unshift({
        id: logId,
        action: 'CONSULTA_INDICADORES',
        actorId: String(requesterUserId),
        actorName: `Usuário (${requesterRole || 'Autorizado'})`,
        actorRole: (requesterRole as any) || 'professor',
        targetId,
        timestamp: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        details: `Consulta de indicadores educacionais realizada com autorização válida.`,
      });

      return res.json(snapshot);
    } catch (error: any) {
      return res.status(500).json({ error: 'Erro ao consultar indicadores.', details: error.message });
    }
  });

  // 10. Listar trilha de auditoria (LGPD)
  app.get('/api/relationships/audit-logs', (req, res) => {
    try {
      return res.json({
        total: backendAuditLogs.length,
        logs: backendAuditLogs,
      });
    } catch (error: any) {
      return res.status(500).json({ error: 'Erro ao listar logs de auditoria.' });
    }
  });

  // --- API ROUTE: CORREÇÃO DE REDAÇÃO PEDAGÓGICA POR NÍVEL ---
  app.post('/api/ai/grade-essay', async (req, res) => {
    try {
      const { text, theme, gradeLevel, adaptations } = req.body;

      if (!text || text.trim().length < 50) {
        return res.status(400).json({
          error: 'O texto da redação deve ter pelo menos 50 caracteres para avaliação.',
        });
      }

      // If Gemini is available, call gemini-3.8-flash
      if (ai) {
        const prompt = `Você é um avaliador pedagógico sênior da banca oficial do ENEM (INEP/MEC) especializado em neuroeducação inclusiva (TDAH, TEA e Dislexia).
O estudante é do: ${gradeLevel || '3º ano'} do Ensino Médio.
Tema da Redação: "${theme || 'Desafios para a valorização de comunidades tradicionais no Brasil'}"
Adaptações de acessibilidade do aluno: ${JSON.stringify(adaptations || {})}

DIRETRIZES DA BANCA DO ENEM & INCLUSÃO PEDAGÓGICA:
1. Avalie as 5 COMPETÊNCIAS OFICIAIS DO ENEM (0 a 200 pontos cada, notas típicas: 0, 40, 80, 120, 160, 200):
   - C1: Domínio da norma culta da língua escrita.
   - C2: Compreensão da proposta e repertório sociocultural (legitimado, pertinente e produtivo).
   - C3: Seleção, relação e organização de informações/argumentos (Projeto de texto e defesa de tese).
   - C4: Mecanismos linguísticos de coesão (conectivos interparágrafos e intraparágrafos sem repetições).
   - C5: Proposta de intervenção completa com os 5 elementos: 1. Agente, 2. Ação, 3. Meio/Modo, 4. Efeito/Finalidade, 5. Detalhamento.
2. ACESSIBILIDADE TDAH:
   - Forneça "tdahChecklist": 3 a 4 micro-tarefas claras e práticas ("Quick Wins", com tempo estimado de 5 a 10 min cada) para o aluno aplicar imediatamente sem sobrecarga cognitiva ou paralisia por volume de texto.
3. ACESSIBILIDADE TEA (Modo Foco e Comunicação Direta):
   - Forneça "teaLiteralFeedback": Linguagem direta, concreta e LITERAL (sem figuras de linguagem, ironias ou metáforas subjetivas), informando exatamente o que funcionou e o que modificar na próxima versão.
4. ACESSIBILIDADE DISLEXIA:
   - Se o aluno tiver dislexia, desvios ortográficos devem ser acolhidos com orientações amigáveis sem penalização vexatória. Destaque o progresso de raciocínio.

Texto do aluno:
"""
${text}
"""

Responda ESTRITAMENTE em formato JSON com o seguinte esquema:
{
  "totalScore": <número de 0 a 1000>,
  "competencies": [
    {
      "number": 1,
      "name": "Domínio da norma culta",
      "score": <0 a 200>,
      "levelTitle": "<ex: Nível 4 - Bom domínio (160 pts)>",
      "feedback": "<comentário construtivo acolhedor>",
      "practicalTip": "<dica prática de 1 frase para subir de nível>"
    },
    {
      "number": 2,
      "name": "Compreensão do tema e repertório sociocultural",
      "score": <0 a 200>,
      "levelTitle": "<ex: Nível 5 - Repertório produtivo e legítimo (200 pts)>",
      "feedback": "<comentário construtivo>",
      "practicalTip": "<dica prática de 1 frase>"
    },
    {
      "number": 3,
      "name": "Projeto de texto e argumentação",
      "score": <0 a 200>,
      "levelTitle": "<ex: Nível 4 - Argumentação consistente (160 pts)>",
      "feedback": "<comentário construtivo>",
      "practicalTip": "<dica prática de 1 frase>"
    },
    {
      "number": 4,
      "name": "Coesão e conectivos",
      "score": <0 a 200>,
      "levelTitle": "<ex: Nível 4 - Coesão diversificada (160 pts)>",
      "feedback": "<comentário construtivo>",
      "practicalTip": "<dica prática de 1 frase>"
    },
    {
      "number": 5,
      "name": "Proposta de intervenção",
      "score": <0 a 200>,
      "levelTitle": "<ex: Nível 4 - 4 elementos identificados (160 pts)>",
      "feedback": "<comentário construtivo>",
      "practicalTip": "<dica prática de 1 frase>"
    }
  ],
  "interventionElements": {
    "agente": { "identified": <true|false>, "text": "<trecho ou 'Não identificado'>", "feedback": "<análise pedagógica do agente>" },
    "acao": { "identified": <true|false>, "text": "<trecho ou 'Não identificado'>", "feedback": "<análise da ação>" },
    "modoMeio": { "identified": <true|false>, "text": "<trecho ou 'Não identificado'>", "feedback": "<análise do modo/meio>" },
    "efeitoFinalidade": { "identified": <true|false>, "text": "<trecho ou 'Não identificado'>", "feedback": "<análise do efeito/finalidade>" },
    "detalhamento": { "identified": <true|false>, "text": "<trecho ou 'Não identificado'>", "feedback": "<análise do detalhamento>" },
    "totalIdentified": <número de 0 a 5>
  },
  "tdahChecklist": [
    {
      "id": "step_1",
      "order": 1,
      "task": "<micro-tarefa prática e objetiva>",
      "competenceRef": <1 a 5>,
      "quickWin": "<por que isso eleva a nota rapidamente>",
      "estimatedMinutes": 5
    }
  ],
  "teaLiteralFeedback": {
    "positiveDirect": ["<ponto direto positivo 1>", "<ponto direto positivo 2>"],
    "toChangeDirect": ["<instrução literal e direta de mudança 1>", "<instrução literal 2>"],
    "whatToDoNext": "<passo concreto para a próxima escrita>"
  },
  "exemplaryRewriteSnippet": {
    "originalFragment": "<trecho do texto do aluno que pode ser aprimorado>",
    "improvedSuggestion": "<como reescrever mantendo a ideia do aluno>",
    "pedagogicalReason": "<por que essa versão atende melhor aos critérios do ENEM>"
  },
  "strengths": ["<ponto forte 1>", "<ponto forte 2>"],
  "improvements": ["<orientação prática 1>", "<orientação prática 2>"],
  "encouragementMessage": "<mensagem afetuosa e motivadora para o estudante>"
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.5,
          },
        });

        const rawText = response.text || '{}';
        const parsed = JSON.parse(rawText);
        return res.json(parsed);
      }

      // Fallback pedagógico se GEMINI_API_KEY não estiver ativa
      const wordCount = text.trim().split(/\s+/).length;
      const baseScore = Math.min(920, Math.max(560, Math.floor(wordCount * 2.8) + 400));
      return res.json({
        totalScore: baseScore,
        competencies: [
          {
            number: 1,
            name: 'Domínio da norma culta',
            score: Math.min(200, Math.max(80, Math.round(baseScore * 0.18 / 40) * 40)),
            levelTitle: 'Nível 4 - Bom domínio formal',
            feedback: 'Boa estrutura formal. Atenção especial à concordância verbal e pontuação de orações subordinadas.',
            practicalTip: 'Revise vírgulas antes de conjunções adversativas (mas, contudo, todavia).'
          },
          {
            number: 2,
            name: 'Compreensão do tema e repertório sociocultural',
            score: Math.min(200, Math.max(80, Math.round(baseScore * 0.22 / 40) * 40)),
            levelTitle: 'Nível 4 - Repertório pertinente',
            feedback: 'O tema foi abordado de forma legítima, relacionando desafios sociais à realidade brasileira.',
            practicalTip: 'Conecte explicitamente o repertório filosófico à causa direta do problema.'
          },
          {
            number: 3,
            name: 'Projeto de texto e argumentação',
            score: Math.min(200, Math.max(80, Math.round(baseScore * 0.20 / 40) * 40)),
            levelTitle: 'Nível 4 - Tese defendida nos parágrafos',
            feedback: 'Tese clara na introdução com argumentos estruturados em dois eixos de discussão.',
            practicalTip: 'Use o primeiro período de cada parágrafo (tópico frasal) para resumir o argumento.'
          },
          {
            number: 4,
            name: 'Coesão e conectivos',
            score: Math.min(200, Math.max(80, Math.round(baseScore * 0.20 / 40) * 40)),
            levelTitle: 'Nível 4 - Repertório diversificado de conectivos',
            feedback: 'Boa transição interparágrafos com operadores argumentativos pertinentes.',
            practicalTip: 'Inicie os parágrafos de desenvolvimento e conclusão com conectivos formais (Ademais, Outrossim, Portanto).'
          },
          {
            number: 5,
            name: 'Proposta de intervenção',
            score: Math.min(200, Math.max(80, Math.round(baseScore * 0.20 / 40) * 40)),
            levelTitle: 'Nível 4 - 4 elementos obrigatórios presentes',
            feedback: 'Proposta articulada respeitando os Direitos Humanos e direcionada ao problema central.',
            practicalTip: 'Acrescente uma frase extra de detalhamento explicando como o meio de execução atuará na prática.'
          },
        ],
        interventionElements: {
          agente: { identified: true, text: 'Ministério da Educação e entidades parceiras', feedback: 'Agente público legítimo identificado.' },
          acao: { identified: true, text: 'implementar programas formativos e campanhas contínuas', feedback: 'Ação prática condizente com o tema.' },
          modoMeio: { identified: true, text: 'por meio de oficinas escolares e canais de mídia pública', feedback: 'Meio viável e articulado.' },
          efeitoFinalidade: { identified: true, text: 'a fim de conscientizar a sociedade e erradicar as desigualdades', feedback: 'Finalidade social positiva.' },
          detalhamento: { identified: false, text: 'Não identificado', feedback: 'Falta uma oração explicativa ou exemplificativa sobre o agente ou o modo.' },
          totalIdentified: 4,
        },
        tdahChecklist: [
          {
            id: 'tdah_1',
            order: 1,
            task: 'Adicionar 1 detalhamento na proposta de intervenção (ex: "com foco nas regiões periféricas")',
            competenceRef: 5,
            quickWin: '+40 pontos imediatos na Competência 5',
            estimatedMinutes: 5,
            completed: false,
          },
          {
            id: 'tdah_2',
            order: 2,
            task: 'Inserir conectivo interparágrafo no início do segundo parágrafo (ex: "Nesse contexto,", "Ademais,")',
            competenceRef: 4,
            quickWin: 'Garante nota máxima de fluidez na Competência 4',
            estimatedMinutes: 3,
            completed: false,
          },
          {
            id: 'tdah_3',
            order: 3,
            task: 'Revisar vírgulas entre sujeito e verbo no 1º parágrafo',
            competenceRef: 1,
            quickWin: 'Evita perda de pontos bobos na norma culta',
            estimatedMinutes: 5,
            completed: false,
          },
        ],
        teaLiteralFeedback: {
          positiveDirect: [
            'O texto tem início, meio e fim bem divididos.',
            'A proposta não viola nenhuma lei ou direito humano.',
            'O vocabulário usado é respeitoso e formal.'
          ],
          toChangeDirect: [
            'No último parágrafo, adicione uma frase extra explicando como o projeto vai funcionar.',
            'Troque palavras repetidas no desenvolvimento por sinônimos simples.'
          ],
          whatToDoNext: 'Reescreva apenas o parágrafo da proposta de intervenção adicionando o detalhamento.'
        },
        exemplaryRewriteSnippet: {
          originalFragment: 'Portanto medidas são necessárias para melhorar a educação.',
          improvedSuggestion: 'Portanto, medidas conjuntas são urgentes. Cabe ao Ministério da Educação, por meio de verbas federais direcionadas, implementar oficinas práticas nas escolas, com o intuito de emancipar os estudantes.',
          pedagogicalReason: 'A versão sugerida apresenta todos os 5 elementos formais da Cartilha do ENEM com precisão sintática.'
        },
        strengths: [
          'Clareza na formulação da tese introdutória',
          'Vocabulário adequado ao gênero dissertativo-argumentativo',
          'Respeito aos Direitos Humanos e sensibilidade social'
        ],
        improvements: [
          'Amplie o repertório sociocultural produtivo (dados, filósofos ou referências históricas)',
          'Detalhe ainda mais o efeito prático ou o modo de execução da proposta de intervenção'
        ],
        encouragementMessage: 'Excelente dedicação! A escrita é um músculo que se desenvolve a cada rascunho. Continue firme na sua jornada para o ENEM!'
      });
    } catch (error: any) {
      console.error('Erro ao avaliar redação:', error);
      res.status(500).json({
        error: 'Não foi possível gerar a avaliação no momento. Tente novamente.',
        details: error.message,
      });
    }
  });

  // --- API ROUTE: CORREÇÃO GRAMATICAL & SUGESTÕES - COMPETÊNCIA 1 ENEM COM GEMINI ---
  app.post('/api/ai/check-competence1', async (req, res) => {
    try {
      const { text, theme, gradeLevel, adaptations } = req.body;

      if (!text || text.trim().length < 30) {
        return res.status(400).json({
          error: 'O texto deve conter pelo menos 30 caracteres para uma análise gramatical precisa.',
        });
      }

      if (ai) {
        const prompt = `Você é um avaliador e linguista sênior da banca oficial do ENEM (INEP/MEC), especialista na COMPETÊNCIA 1: "Demonstrar domínio da modalidade escrita formal da língua portuguesa".

SUA MISSÃO:
Analisar minuciosamente o texto submetido pelo estudante com base nas diretrizes oficiais da Cartilha do Participante ENEM para a Competência 1:
1. Desvios gramaticais: Concordância (verbal/nominal), Regência (verbal/nominal), Pontuação (especialmente vírgulas entre sujeito e predicado, orações adjetivas explicativas, vírgula antes de conjunções adversativas), Crase (uso obrigatório, facultativo e proibido), Colocação Pronominal (próclise, mesóclise, ênclise) e Acentuação/Ortografia.
2. Estrutura sintática: Presença de truncamento de períodos, períodos justapostos ou excessivamente longos sem pontuação, paralelismo sintático quebrado.
3. Escolha de registro: Marcas de oralidade, gírias, expressões coloquiais ou informalidades incompatíveis com o texto dissertativo-argumentativo formal.
4. Escala oficial de notas da C1: 200 (Excelente domínio, no máx. 2 desvios aceitos como falha incidental), 160 (Bom domínio, poucos desvios), 120 (Domínio mediano), 80 (Domínio insuficiente), 40 (Domínio precário), 0 (Desconhecimento da norma padrão).
5. Acessibilidade Pedagógica (IMPORTANTE):
   - Aluno com Dislexia: ${adaptations?.dyslexiaMode ? 'SIM' : 'NÃO'}. Se SIM, forneça explicações acolhedoras para trocas ortográficas e fonéticas, explicando o porquê da grafia com carinho pedagógico e técnicas mnemônicas, sem penalizar de forma desproporcional.
   - Série do Aluno: ${gradeLevel || 'Ensino Médio'}. Dê orientações progressivas para a sua série.

Tema (se houver): "${theme || 'Tema Livre / Geral'}"

Texto a ser avaliado:
"""
${text}
"""

Responda ESTRITAMENTE em formato JSON com o seguinte formato:
{
  "score": <0, 40, 80, 120, 160 ou 200>,
  "levelDescription": "<ex: 'Excelente domínio da norma padrão (200 pts)' | 'Bom domínio da norma padrão (160 pts)' | 'Domínio mediano (120 pts)' | 'Domínio insuficiente (80 pts)' | 'Domínio precário (40 pts)'>",
  "summaryFeedback": "<parágrafo com visão geral calorosa, técnica e motivadora da competência 1 do aluno>",
  "issues": [
    {
      "id": "1",
      "originalSnippet": "<trecho exato com o desvio>",
      "type": "<concordancia | regencia | pontuacao | crase | ortografia | sintaxe | registro_informal | outro>",
      "typeLabel": "<ex: Concordância Verbal | Uso da Vírgula | Crase Indevida | Regência Nominal | Quebra de Paralelismo>",
      "severity": "<leve | moderada | grave>",
      "explanation": "<explicação didática clara da regra gramatical>",
      "suggestion": "<como reescrever o trecho na norma culta>",
      "paragraphIndex": <número do parágrafo: 1, 2, ...>
    }
  ],
  "positiveHighlights": [
    "<ponto forte gramatical ou sintático observado 1>",
    "<ponto forte 2>"
  ],
  "improvementTips": [
    "<dica prática e acionável para alcançar a nota 200 na C1 1>",
    "<dica prática e acionável para alcançar a nota 200 na C1 2>"
  ],
  "exemplaryRewrite": "<um parágrafo ou período do texto do aluno reescrito de forma elegante e impecável na norma padrão formal>",
  "dyslexiaConsideration": "<orientação pedagógica acolhedora se houver necessidade especial, ou string vazia>",
  "stats": {
    "wordCount": <número de palavras>,
    "sentenceCount": <número estimado de frases>,
    "issueCount": <total de desvios identificados>
  }
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.3,
          },
        });

        const rawText = response.text || '{}';
        const parsed = JSON.parse(rawText);
        return res.json(parsed);
      }

      // Fallback analítico inteligente baseado nas regras do Inep
      const words = text.trim().split(/\s+/);
      const wordCount = words.length;
      const sentences = text.split(/[.!?]+/).filter((s: string) => s.trim().length > 0);
      const detectedIssues = [];

      // Checagem de vírgula antes de conjunções adversativas
      if (/\b(mas|porém|contudo|todavia|entretanto)\b/i.test(text) && !/,\s*(mas|porém|contudo|todavia|entretanto)/i.test(text)) {
        detectedIssues.push({
          id: 'fb-1',
          originalSnippet: 'conjunção adversativa sem vírgula prévia',
          type: 'pontuacao',
          typeLabel: 'Pontuação / Conjunção Adversativa',
          severity: 'moderada',
          explanation: 'No padrão culto do ENEM, orações coordenadas adversativas iniciadas por "mas, porém, contudo" exigem vírgula antecedente.',
          suggestion: 'Adicione vírgula antes da conjunção. Ex: "... sociedade justa, contudo ainda há barreiras."',
          paragraphIndex: 1
        });
      }

      // Checagem de expressão informal "a nível de" ou "onde" indicando ideia abstrata
      if (/\ba nível de\b/i.test(text)) {
        detectedIssues.push({
          id: 'fb-2',
          originalSnippet: 'a nível de',
          type: 'registro_informal',
          typeLabel: 'Registro Informal / Expressão Condenada',
          severity: 'grave',
          explanation: 'A locução "a nível de" é considerada vício de linguagem no ENEM. O correto é "em nível de" ou preferencialmente "no âmbito de" / "no contexto de".',
          suggestion: 'Substitua por "no âmbito de" ou "em termos de".',
          paragraphIndex: 1
        });
      }

      // Checagem de pleonasmo "há ... atrás"
      if (/\bhá\b.{1,30}\batrás\b/i.test(text)) {
        detectedIssues.push({
          id: 'fb-3',
          originalSnippet: 'há ... atrás',
          type: 'concordancia',
          typeLabel: 'Redundância Temporal',
          severity: 'moderada',
          explanation: 'O verbo "haver" com sentido de tempo transcorrido já denota passado; o uso conjunto com "atrás" constitui pleonasmo vicioso.',
          suggestion: 'Utilize apenas "Há cinco anos" ou "Cinco anos atrás".',
          paragraphIndex: 1
        });
      }

      // Checagem básica de parágrafo longo
      if (sentences.some((s: string) => s.split(/\s+/).length > 45)) {
        detectedIssues.push({
          id: 'fb-4',
          originalSnippet: 'período excessivamente longo',
          type: 'sintaxe',
          typeLabel: 'Estrutura Sintática / Extensão Frasal',
          severity: 'moderada',
          explanation: 'Períodos com mais de 4 linhas sem ponto final aumentam o risco de truncamento sintático e perda de clareza argumentativa no ENEM.',
          suggestion: 'Divida o período longo em duas orações coordenadas ou use ponto final seguido de conectivo interfrasal.',
          paragraphIndex: 2
        });
      }

      const issueCount = detectedIssues.length;
      let calculatedScore = 200;
      if (issueCount === 1) calculatedScore = 160;
      else if (issueCount === 2) calculatedScore = 120;
      else if (issueCount >= 3) calculatedScore = 80;

      return res.json({
        score: calculatedScore,
        levelDescription: calculatedScore === 200
          ? 'Excelente domínio da norma padrão (200 pts)'
          : calculatedScore === 160
          ? 'Bom domínio da norma padrão (160 pts)'
          : 'Domínio mediano com desvios pontuais (120 pts)',
        summaryFeedback: `Seu texto apresenta uma boa base na modalidade formal escrita, com vocabulário adequado para o ${gradeLevel || 'Ensino Médio'}. A atenção às regras de pontuação e paralelismo garantirá a pontuação máxima na Competência 1 do ENEM.`,
        issues: detectedIssues,
        positiveHighlights: [
          'Emprego coerente de operadores argumentativos na articulação frasal',
          'Ausência de gírias e marcas visíveis de oralidade na redação',
          'Construção oracional fluida e condizente com o gênero dissertativo'
        ],
        improvementTips: [
          'Revise o emprego da vírgula antes de conjunções adversativas e subordinadas adverbiais deslocadas',
          'Atente-se ao uso de pronomes relativos: use "onde" exclusivamente para lugares físicos concretos',
          'Mantenha períodos médios (de 2 a 3 linhas) para garantir paralelismo sintático exemplar'
        ],
        exemplaryRewrite: text.slice(0, 240) + '...',
        dyslexiaConsideration: adaptations?.dyslexiaMode
          ? 'Nota de Inclusão: Seus desvios ortográficos foram analisados construtivamente. No ENEM, avaliadores capacitados acolhem o projeto pedagógico inclusivo com foco na inteligibilidade.'
          : '',
        stats: {
          wordCount,
          sentenceCount: sentences.length,
          issueCount
        }
      });
    } catch (error: any) {
      console.error('Erro na análise da Competência 1:', error);
      res.status(500).json({
        error: 'Não foi possível concluir a análise da Competência 1 no momento.',
        details: error.message
      });
    }
  });

  // --- API ROUTE: SIMPLIFICAÇÃO DE ENUNCIADO PARA TEA (LINGUAGEM DIRETA) ---
  app.post('/api/ai/simplify-question', async (req, res) => {
    try {
      const { text, promptContext } = req.body;
      if (!text) return res.status(400).json({ error: 'Texto não fornecido.' });

      if (ai) {
        const prompt = `Você é um assistente de acessibilidade pedagógica para estudantes com Transtorno do Espectro Autista (TEA).
Sua missão: Transformar o enunciado complexo de uma questão do ENEM em uma VERSÃO COM LINGUAGEM DIRETA E PREVISÍVEL:
- Elimine ambiguidades, figuras de linguagem ou floreios retóricos.
- Mantenha estritamente todos os fatos, dados e a essência da pergunta.
- Use sentenças curtas, ordenadas em tópicos lógicos se necessário.
- Destaque o objetivo direto: O que a questão quer que o aluno encontre?

Texto original:
"""
${text}
"""

Responda em formato JSON:
{
  "simplifiedStatement": "<enunciado simplificado em linguagem direta>",
  "keyGoal": "<o que exatamente você precisa descobrir nesta questão>"
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.3,
          },
        });

        const parsed = JSON.parse(response.text || '{}');
        return res.json(parsed);
      }

      // Fallback
      return res.json({
        simplifiedStatement: `Versão Direta: ${text.slice(0, 180)}... [Foco nos dados centrais apresentados sem metáforas].`,
        keyGoal: 'Identifique o conceito principal perguntado na última linha do comando.',
      });
    } catch (error: any) {
      console.error('Erro ao simplificar questão:', error);
      res.status(500).json({ error: 'Erro ao processar adaptação TEA.' });
    }
  });

  // --- API ROUTE: EXPLICAÇÃO PASSO A PASSO DA QUESTÃO ---
  app.post('/api/ai/explain-question', async (req, res) => {
    try {
      const { questionTitle, options, correctOptionIndex, studentChoice } = req.body;

      if (ai) {
        const prompt = `Explique de forma acolhedora, clara e pedagógica para um estudante do Ensino Médio a resolução desta questão do ENEM:
Enunciado: "${questionTitle}"
Alternativas: ${JSON.stringify(options)}
Alternativa Correta: ${correctOptionIndex !== undefined ? options[correctOptionIndex] : 'indicada'}
Escolha do Aluno: ${studentChoice !== undefined ? options[studentChoice] : 'não informada'}

Dê uma explicação em 3 passos:
1. O que o enunciado estava pedindo (o núcleo da pergunta).
2. Por que a alternativa correta é a adequada.
3. Dica rápida para memorizar ou não cair em distratores semelhantes no ENEM.

Mantenha tom encorajador e conciso.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            temperature: 0.6,
          },
        });

        return res.json({ explanation: response.text });
      }

      return res.json({
        explanation: 'Esta questão avalia a capacidade de relacionar o conceito teórico aos dados do enunciado. A alternativa correta conecta diretamente a causa ao efeito demonstrado.'
      });
    } catch (error: any) {
      console.error('Erro na explicação:', error);
      res.status(500).json({ error: 'Erro ao gerar explicação.' });
    }
  });

  // --- API ROUTE: GERADOR DE QUESTÕES NO FORMATO ENEM (PARA ADMIN/PROFESSOR) ---
  app.post('/api/ai/generate-question', async (req, res) => {
    try {
      const { area, gradeLevel, topic } = req.body;

      if (ai) {
        const prompt = `Crie uma questão inédita no formato ENEM rigoroso para o ${gradeLevel || '1º ano'} do Ensino Médio.
Área: ${area || 'Ciências da Natureza'}
Tópico pedagógico: ${topic || 'Ecologia e Ciclos Biogeoquímicos'}

Formato ENEM exigido:
- Texto-base ou contexto do cotidiano / artigo científico simplificado
- Comando claro da questão
- 5 alternativas (A, B, C, D, E), sendo 1 correta e 4 distratores plausíveis
- Habilidade BNCC/ENEM correspondente
- Versão simplificada em linguagem direta para estudantes TEA

Responda em formato JSON:
{
  "title": "<texto-base + comando>",
  "area": "${area}",
  "gradeLevel": "${gradeLevel}",
  "topic": "${topic}",
  "bnccSkill": "<Ex: EM13CNT301>",
  "options": [
    "<alternativa A>",
    "<alternativa B>",
    "<alternativa C>",
    "<alternativa D>",
    "<alternativa E>"
  ],
  "correctAnswer": <índice de 0 a 4>,
  "explanation": "<justificativa detalhada>",
  "simplifiedTEA": "<versão direta em tópicos sem metáforas>"
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.7,
          },
        });

        const parsed = JSON.parse(response.text || '{}');
        return res.json(parsed);
      }

      return res.json({
        title: `(ENEM Inédito - ${area}) No contexto de ${topic}, pesquisadores observaram que alterações no ambiente afetam os equilíbrios dinâmicos. A intervenção humana mais adequada para mitigar esse impacto é:`,
        area: area || 'Ciências da Natureza',
        gradeLevel: gradeLevel || '1º ano',
        topic: topic || 'Equilíbrio Ambiental',
        bnccSkill: 'EM13CNT302',
        options: [
          'Adoção de práticas de manejo sustentável e recuperação de matas ciliares.',
          'Intensificação do uso de aditivos sintéticos sem controle prévio.',
          'Substituição total da cobertura vegetal nativa por monocultura.',
          'Canalização irrestrita de cursos hídricos urbanos.',
          'Eliminação de barreiras biológicas de contenção.'
        ],
        correctAnswer: 0,
        explanation: 'A recuperação de matas ciliares e o manejo sustentável preservam os recursos hídricos e a biodiversidade local.',
        simplifiedTEA: 'Pergunta direta: Qual ação humana ajuda a proteger o meio ambiente? Ação: Recuperar matas ciliares e praticar manejo sustentável.'
      });
    } catch (error: any) {
      console.error('Erro ao gerar questão:', error);
      res.status(500).json({ error: 'Erro ao gerar questão inédita.' });
    }
  });

  // --- API ROUTE: GERADOR DE FLASHCARDS AUTOMÁTICOS COM GEMINI ---
  app.post('/api/ai/generate-flashcards', async (req, res) => {
    try {
      const { wrongQuestions } = req.body;

      if (!wrongQuestions || !Array.isArray(wrongQuestions) || wrongQuestions.length === 0) {
        return res.status(400).json({ error: 'Nenhuma questão incorreta fornecida.' });
      }

      if (ai) {
        const questionsSummary = wrongQuestions.map((q: any, idx: number) => `
QUESTÃO ${idx + 1}:
- Área: ${q.area || 'Geral'}
- Tópico: ${q.topic || 'Conceitos ENEM'}
- Enunciado: "${q.questionTitle || q.title}"
- Alternativa Escolhida pelo Aluno (ERRO): "${q.studentChoiceText || (q.options && q.studentChoice !== undefined ? q.options[q.studentChoice] : 'Opção incorreta')}"
- Alternativa Correta (GABARITO): "${q.correctAnswerText || (q.options && q.correctAnswer !== undefined ? q.options[q.correctAnswer] : 'Opção correta')}"
- Explicação Oficial: "${q.explanation || ''}"
`).join('\n---\n');

        const prompt = `Você é um neurocientista e tutor pedagógico de excelência do ENEM especialista em Repetição Espaçada (Spaced Repetition) e Aprendizagem Ativa (Active Recall).
Sua missão: Para CADA questão do ENEM em que o aluno errou, analisar a falha cognitiva e EXTRAIR O CONCEITO-CHAVE FUNDAMENTAL para criar um Flashcard de alto impacto para fixação definitiva na memória de longo prazo.

DIRETRIZES PEDAGÓGICAS PARA CADA FLASHCARD:
1. "keyConcept": O nome exato, curto e memorável do conceito curricular que o aluno precisa dominar (ex: "Equação de Torricelli", "Princípio de Le Chatelier", "Cidadania na Democracia Ateniense", "Células Secretoras e Retículo Rugoso").
2. "front": Pergunta-gatilho instigante, clara e desafiadora. Deve provocar o resgate ativo da memória (Active Recall), SEM dar a resposta de bandeja.
3. "back": Resposta direta, elegante e pedagógica. Explique a lógica central em 2 a 3 frases concisas, destacando como esse raciocínio resolve o problema no ENEM.
4. "mnemonicTip": Um mnemônico acolhedor, gatilho mnemotécnico ou regra prática inesquecível ("Pulo do Gato do ENEM") para fixação rápida.
5. "whyItWasWrong": Uma frase acolhedora explicando a armadilha do distrator que induziu ao erro ("Atenção: o distrator confunde X com Y porque...").

Analise estas questões com erro:
${questionsSummary}

Responda ESTRITAMENTE em formato JSON no seguinte formato:
{
  "flashcards": [
    {
      "keyConcept": "<nome do conceito>",
      "front": "<pergunta-gatilho instigante>",
      "back": "<resposta direta e explicação clara>",
      "mnemonicTip": "<dica mnemônica ou pulo do gato>",
      "whyItWasWrong": "<por que o distrator confundiu e como evitar>"
    }
  ]
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.6,
          },
        });

        const parsed = JSON.parse(response.text || '{}');
        if (parsed.flashcards && Array.isArray(parsed.flashcards)) {
          return res.json(parsed);
        }
      }

      // Fallback robusto caso Gemini offline ou chave ausente
      const fallbackFlashcards = wrongQuestions.map((q: any) => ({
        keyConcept: q.topic || 'Conceito Fundamental ENEM',
        front: `Qual é o princípio essencial de ${q.topic || 'deste tópico'} necessário para acertar a questão no ENEM?`,
        back: `Conceito central: ${q.explanation ? q.explanation.slice(0, 160) + '...' : 'A alternativa correta relaciona a teoria às evidências do enunciado.'}`,
        mnemonicTip: `Dica de Ouro: Identifique palavras-chave no comando da questão e elimine distratores com generalizações absolutas.`,
        whyItWasWrong: `Armadilha comum: Distratores frequentemente usam termos familiares fora do contexto exato exigido.`,
      }));

      return res.json({ flashcards: fallbackFlashcards });
    } catch (error: any) {
      console.error('Erro ao gerar flashcards:', error);
      res.status(500).json({ error: 'Erro ao extrair conceitos e gerar flashcards com IA.' });
    }
  });

  // ROTA DE IA: Glossário Interativo Pedagógico ENEM (Termos Complexos & Siglas)
  app.post('/api/ai/explain-term', async (req, res) => {
    try {
      const { term, category, contextArea } = req.body;

      if (!term || typeof term !== 'string' || !term.trim()) {
        return res.status(400).json({ error: 'Termo ou sigla não informada.' });
      }

      const cleanTerm = term.trim();

      if (ai) {
        const prompt = `Você é um professor pedagógico renomado do ENEM e especialista em neuroeducação inclusiva (comunicação acessível para estudantes neurodivergentes TEA/TDAH e alunos do ensino público).
O estudante está consultando o Glossário Interativo do ENEM sobre o seguinte termo ou sigla: "${cleanTerm}".
${category ? `Categoria informada: ${category}.` : ''}
${contextArea ? `Área do conhecimento: ${contextArea}.` : ''}

Sua missão é fornecer uma explicação pedagógica de alto nível, cristalina, prática e acolhedora.

DIRETRIZES ESSENCIAIS:
1. "term": O nome oficial do termo ou sigla por extenso (ex: "TRI (Teoria de Resposta ao Item)", "BNCC (Base Nacional Comum Curricular)", "Eutrofização").
2. "acronym": Se for sigla, coloque a sigla (ex: "TRI", "BNCC", "DCN", "INEP", "PISA") ou null se for um conceito substantivo.
3. "category": Classifique em UMA destas opções: "Siglas & Regulamentação", "Linguagens & Redação", "Ciências Humanas", "Ciências da Natureza", "Matemática & TRI", "Metodologia & BNCC".
4. "simplifiedDefinition": Uma definição clara, em tom acolhedor e pedagógico, explicando o conceito em linguagem acessível sem jargões desnecessários (2 a 3 frases).
5. "contextualExample": Um exemplo prático e contextualizado da vida real ou de uma situação cotidiana / histórica / científica que faça o aluno entender na hora.
6. "enemApplication": Como esse termo costuma aparecer nas provas do ENEM, pegadinhas comuns dos distratores ou em que competência da redação ele é crucial.
7. "teaSimplifiedExplanation": VERSÃO MODO FOCO / TEA: Explicação direta, literal, em 1 frase simples, SEM metáforas, com foco objetivo na função prática do termo.
8. "mnemonicsOrMemoryHook": Dica de memorização / "Pulo do Gato do ENEM" (uma frase de impacto, rima ou truque mnemônico para nunca esquecer).
9. "difficulty": Classifique em: "Básico", "Intermediário" ou "Avançado".
10. "relatedTerms": Lista com 2 a 4 termos ou conceitos do ENEM intimamente relacionados para aprofundamento.

Responda ESTRITAMENTE em formato JSON:
{
  "term": "${cleanTerm}",
  "acronym": "<sigla ou null>",
  "category": "<uma das categorias permitidas>",
  "simplifiedDefinition": "<definição pedagógica clara>",
  "contextualExample": "<exemplo prático contextual>",
  "enemApplication": "<como aparece no ENEM e distratores>",
  "teaSimplifiedExplanation": "<explicação literal de 1 frase para TEA>",
  "mnemonicsOrMemoryHook": "<truque de memorização>",
  "difficulty": "Básico" | "Intermediário" | "Avançado",
  "relatedTerms": ["termo 1", "termo 2", "termo 3"]
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.5,
          },
        });

        const parsed = JSON.parse(response.text || '{}');
        if (parsed.simplifiedDefinition) {
          return res.json({
            id: `glossary_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            ...parsed,
            isAiGenerated: true,
            createdAt: new Date().toISOString(),
          });
        }
      }

      // Fallback inteligente caso Gemini indisponível
      const fallbackTerm = {
        id: `glossary_fb_${Date.now()}`,
        term: cleanTerm,
        acronym: cleanTerm.length <= 6 && cleanTerm === cleanTerm.toUpperCase() ? cleanTerm : undefined,
        category: category || 'Metodologia & BNCC',
        simplifiedDefinition: `${cleanTerm} é um conceito fundamental avaliado no ENEM, que articula habilidades teóricas com resolução de problemas da vida cotidiana e cidadania.`,
        contextualExample: `Imagine uma situação em que você precisa tomar uma decisão prática baseada em evidências; ${cleanTerm} é o princípio que guia essa análise racional.`,
        enemApplication: `No ENEM, ${cleanTerm} costuma aparecer em enunciados interdisciplinares. Fique atento a alternativas que generalizam excessivamente ou contrariam dados de gráficos e textos motivadores.`,
        teaSimplifiedExplanation: `Conceito direto: ${cleanTerm} é uma regra ou elemento que serve para identificar e solucionar questões no exame nacional.`,
        mnemonicsOrMemoryHook: `Dica de ouro: Sublinhe ${cleanTerm} no comando da questão e ligue-o à causa e consequência do problema proposto.`,
        difficulty: 'Intermediário',
        relatedTerms: ['Matriz de Referência', 'Competências ENEM', 'Interdisciplinaridade'],
        isAiGenerated: false,
        createdAt: new Date().toISOString(),
      };

      return res.json(fallbackTerm);
    } catch (error: any) {
      console.error('Erro ao explicar termo no glossário com Gemini:', error);
      res.status(500).json({ error: 'Erro ao consultar explicação pedagógica com IA.' });
    }
  });

  // --- API ROUTE: ASSISTENTE DE ESTUDOS COM GEMINI PARA DÚVIDAS RÁPIDAS DO ENEM ---
  app.post('/api/ai/study-chat', async (req, res) => {
    try {
      const { question, history, knowledgeArea, gradeLevel, adaptations, fastMode, isVoiceInput } = req.body;

      if (!question || typeof question !== 'string' || !question.trim()) {
        return res.status(400).json({ error: 'Pergunta não fornecida.' });
      }

      const cleanQuestion = question.trim();

      if (ai) {
        const systemInstruction = `Você é o "Tutor Coruja ENEM", um assistente de estudos pedagógico de excelência, carinhoso, objetivo e especializado no ENEM (Exame Nacional do Ensino Médio) e em neuroeducação inclusiva (TDAH, TEA e Dislexia).

SUA MISSÃO:
Tirar dúvidas rápidas, descomplicadas e memoráveis sobre qualquer conceito do ENEM (Ciências da Natureza, Ciências Humanas, Matemática, Linguagens e Redação Nota 1000).

INFORMAÇÕES DO ALUNO:
- Série: ${gradeLevel || 'Ensino Médio / ENEM'}
- Área Foco: ${knowledgeArea || 'Geral / Interdisciplinar'}
- Adaptações Ativas: ${JSON.stringify(adaptations || {})}
- Modo de Leitura Rápida (TDAH): ${fastMode ? 'ATIVADO (respostas ultra-diretas em tópicos, máximo 200 palavras)' : 'PADRÃO (completa e estruturada didaticamente)'}
- Entrada por Voz: ${isVoiceInput ? 'SIM (a dúvida veio por transcrição de voz do estudante)' : 'NÃO'}

DIRETRIZES DE RESPOSTA (EM FORMATAÇÃO MARKDOWN AGRADÁVEL):
1. Inicie com uma resposta direta e acolhedora em 1 a 2 frases.
2. Utilize tópicos destacados para fácil leitura:
   - 🎯 **O Conceito em Poucas Palavras**: A ideia central explicada sem jargões desnecessários.
   - 💡 **Exemplo Prático ou Analogia**: Um exemplo visual do cotidiano, história ou experimento mental para fixar o aprendizado.
   - ⚠️ **Pulo do Gato no ENEM (Pegadinha / Como cai na prova)**: Onde a banca do Inep tenta enganar o candidato e como identificar o gabarito correto.
   - 🧩 **Mnemônico ou Frase de Ouro**: 1 frase curta para memorização definitiva.
3. Se envolver fórmulas (Matemática, Física ou Química): Mostre a fórmula em destaque, o significado de cada letra/unidade e uma dica de aplicação prática.
4. Se o aluno pedir repertório para redação: Forneça um repertório coringa (pensador/dado/constituição) com modelo de citação e tese.
5. ACESSIBILIDADE NEUROINCLUSIVA:
   - TDAH: Destaque termos-chave em **negrito**, use listas com marcadores e evite blocos maciços.
   - TEA (Modo Foco): Linguagem direta, factual, literal e sem ironias ou ambiguidades.
   - Dislexia: Frases com estrutura direta (sujeito + verbo + predicado), fluidez e acolhimento.`;

        // Format history for Gemini chat if provided
        const contents: any[] = [];
        if (Array.isArray(history) && history.length > 0) {
          // Keep up to last 8 turns to stay focused and fast
          const recentHistory = history.slice(-8);
          for (const msg of recentHistory) {
            contents.push({
              role: msg.role === 'assistant' || msg.role === 'model' ? 'model' : 'user',
              parts: [{ text: msg.text || msg.content || '' }],
            });
          }
        }

        // Add current question
        contents.push({
          role: 'user',
          parts: [{ text: cleanQuestion }],
        });

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents,
          config: {
            systemInstruction,
            temperature: 0.6,
          },
        });

        const answerText = response.text || 'Desculpe, não consegui formular a resposta no momento. Poderia repetir a pergunta?';

        return res.json({
          answer: answerText,
          conceptTitle: cleanQuestion.length > 40 ? cleanQuestion.slice(0, 37) + '...' : cleanQuestion,
          isAiGenerated: true,
        });
      }

      // Fallback inteligente contextual para dúvidas clássicas do ENEM quando offline
      const qLower = cleanQuestion.toLowerCase();
      let fallbackAnswer = '';
      let title = 'Conceito ENEM';

      if (qLower.includes('meiose') || qLower.includes('mitose')) {
        title = 'Mitose vs Meiose';
        fallbackAnswer = `🎯 **O Conceito em Poucas Palavras**:
- **Mitose**: 1 célula-mãe gera **2 células-filhas geneticamente idênticas** (mesmo número de cromossomos, 2n → 2n). Serve para crescimento tecidual, regeneração e cicatrização.
- **Meiose**: 1 célula-mãe gera **4 células-filhas com metade dos cromossomos** (2n → n). Serve para produção de gametas (espermatozoides e óvulos) e esporos.

💡 **Exemplo do Cotidiano**:
Quando você corta o dedo e a pele cicatriza, seu corpo fez **mitose**. Quando seus ancestrais geraram novas combinações genéticas para você nascer, ocorreu **meiose** com *crossing-over*.

⚠️ **Pulo do Gato no ENEM**:
O ENEM ama cobrar o **Crossing-Over (Permutação Gênica)** que ocorre na **Prófase I da Meiose**. É ele o grande responsável pela variabilidade genética que a Seleção Natural seleciona!

🧩 **Frase de Ouro**:
*"Mitose multiplica iguais; Meiose mistura e divide pela metade!"*`;
      } else if (qLower.includes('le chatelier') || qLower.includes('equilíbrio químico') || qLower.includes('equilibrio quimico')) {
        title = 'Princípio de Le Chatelier';
        fallbackAnswer = `🎯 **O Conceito em Poucas Palavras**:
Quando um sistema em equilíbrio sofre uma perturbação externa (alteração de temperatura, pressão ou concentração), ele **se desloca no sentido que minimiza essa perturbação** para restabelecer o equilíbrio.

💡 **Exemplo do Cotidiano**:
Pense num balanço de gangorra: se você adicionar peso no lado esquerdo (reagentes), o sistema escorrega para a direita (produtos) para compensar e equilibrar!

⚠️ **Pulo do Gato no ENEM**:
- **Aumento de Temperatura**: Favorece a reação **ENDOTÉRMICA** (que absorve calor).
- **Aumento de Pressão**: Favorece o lado com **MENOR número de mols de gás** (menor volume).
- **Catalisador**: NÃO desloca o equilíbrio! Apenas atinge o equilíbrio mais rápido. (Essa é a pegadinha favorita do Inep!)

🧩 **Frase de Ouro**:
*"O equilíbrio é teimoso: o que você fizer com ele, ele faz o oposto para anular!"*`;
      } else if (qLower.includes('torricelli') || qLower.includes('mruv') || qLower.includes('queda livre')) {
        title = 'Equação de Torricelli';
        fallbackAnswer = `🎯 **O Conceito em Poucas Palavras**:
A Equação de Torricelli relaciona velocidades, aceleração e distância percorrida no MRUV **sem precisar do tempo (t)**:
**V² = V₀² + 2 · a · ΔS**

💡 **Exemplo Prático**:
Um carro a 20 m/s freia com aceleração de -4 m/s² até parar (V = 0). Distância de frenagem:
0 = 20² + 2(-4)ΔS ➔ 8ΔS = 400 ➔ ΔS = 50 metros.

⚠️ **Pulo do Gato no ENEM**:
Viu uma questão de cinemática com aceleração constante onde o texto **não deu e nem pediu o tempo**? Use Torricelli de olhos fechados! Lembre-se: em lançamentos verticais para cima, a aceleração da gravidade atua no sentido contrário (negativa).

🧩 **Frase de Ouro**:
*"Sem tempo no enunciado? Chama Torricelli!"*`;
      } else if (qLower.includes('vargas') || qLower.includes('era vargas') || qLower.includes('estado novo')) {
        title = 'Era Vargas (1930 - 1945)';
        fallbackAnswer = `🎯 **O Conceito em Poucas Palavras**:
A Era Vargas marca a transição do Brasil agrário-exportador oligárquico (República do Café com Leite) para um Brasil **urbano-industrial**, centralizado pelo Estado, com forte apelo trabalhista e populista.

Dividida em 3 fases:
1. **Governo Provisório (1930-1934)**: Revolução Constitucionalista de 32 e Constituição de 34 com voto feminino e secreto.
2. **Governo Constitucional (1934-1937)**: Polarização ideológica (Integralismo AIB vs Aliança Nacional Libertadora ANL) e falso Plano Cohen.
3. **Estado Novo (1937-1945)**: Ditadura civil, DIP (censura e propaganda ufanista), CLT (1943) e criação da CSN e Vale do Rio Doce.

⚠️ **Pulo do Gato no ENEM**:
O ENEM sempre explora a ambiguidade da **legislação trabalhista (CLT)**: de um lado, concedeu direitos fundamentais reais (férias, salário mínimo, jornada de 8h); de outro, atrelou os sindicatos ao Ministério do Trabalho para sufocar greves autônomas.

🧩 **Frase de Ouro**:
*"Vargas: O 'Pai dos Pobres' que arquitetou a indústria de base e controlou o movimento operário."*`;
      } else if (qLower.includes('repertório') || qLower.includes('repertorio') || qLower.includes('redação') || qLower.includes('redacao') || qLower.includes('coringa')) {
        title = 'Repertório Coringa para Redação ENEM';
        fallbackAnswer = `🎯 **O Conceito em Poucas Palavras**:
Um repertório coringa legítimo e altamente valorizado na banca do ENEM é a **Constituição Cidadã de 1988** aliada à **Cidadania Mutilada** de Milton Santos ou à **Banalidade do Mal** de Hannah Arendt.

💡 **Modelo de Aplicação Nota 1000**:
*"A Constituição Federal de 1988 preconiza, em seu Artigo 6º, o direito universal à dignidade e ao bem-estar social. Todavia, a persistência de [TEMA DA REDAÇÃO] no Brasil contemporâneo desfigura essa garantia magna, promovendo um cenário em que cidadãos permanecem invisibilizados perante as políticas públicas."*

⚠️ **Pulo do Gato no ENEM (Competência 2)**:
Para tirar 200 pontos na C2, seu repertório DEVE ser:
1. **Legitimado**: Ter autoridade formal (filósofo, sociólogo, obra literária, artigo constitucional).
2. **Pertinente**: Ter ligação direta com a proposta.
3. **Produtivo**: Apresentar um conectivo demonstrando como a teoria explica a causa do problema no Brasil!

🧩 **Frase de Ouro**:
*"Repertório produtivo é aquele que não apenas enfeita o parágrafo, mas fundamenta o seu argumento!"*`;
      } else {
        title = cleanQuestion.slice(0, 30);
        fallbackAnswer = `🎯 **Conceito Fundamental ENEM**:
A sua dúvida sobre **"${cleanQuestion}"** aborda um ponto chave da Matriz de Referência do ENEM. O exame avalia como esse conceito se aplica na resolução de problemas do cotidiano e em debates sociais contemporâneos.

💡 **Como Estruturar o Raciocínio**:
1. Leia atentamente o comando da questão (a última linha antes das alternativas).
2. Destaque a relação de causa e consequência exigida.
3. Elimine alternativas radicais que usem termos restritivos como "apenas", "nunca" ou "totalmente desvinculado".

⚠️ **Pulo do Gato no ENEM**:
Fique muito atento aos distratores: eles frequentemente trazem afirmações verdadeiras na ciência, mas que NÃO respondem à pergunta específica formulada pelo texto-base.

🧩 **Frase de Ouro**:
*"No ENEM, a alternativa correta é a que responde com precisão ao comando, sem extrapolações!"*`;
      }

      return res.json({
        answer: fallbackAnswer,
        conceptTitle: title,
        isAiGenerated: false,
      });
    } catch (error: any) {
      console.error('Erro no assistente de estudos:', error);
      return res.status(500).json({
        error: 'Não foi possível consultar o assistente no momento.',
        details: error.message,
      });
    }
  });

  // ==========================================
  // ROTA: Gerador de Cronograma Semanal Inteligente com Gemini
  // Personalizado pelas Dificuldades / Menor Desempenho nas Áreas do ENEM
  // ==========================================
  app.post('/api/ai/weekly-schedule', async (req, res) => {
    try {
      const {
        studentName = 'Estudante',
        gradeLevel = '3º ano',
        areasPerformance = [],
        weakTopics = [],
        neuroProfile = 'padrao', // 'tdah' | 'tea' | 'dyslexia' | 'padrao'
        preferences = {},
      } = req.body;

      const dailyHours = Number(preferences.dailyHours) || 3;
      const daysCount = Number(preferences.daysCount) || 6;
      const preferredShift = preferences.preferredShift || 'tarde';
      const focusGoal = preferences.focusGoal || 'Recuperar áreas com menor desempenho e consolidar TRI';

      // 1. Identificar as áreas de menor desempenho (ordenadas da mais fraca para a mais forte)
      const sortedAreas = [...areasPerformance].sort((a: any, b: any) => {
        const scoreA = (a.accuracy !== undefined ? a.accuracy : (a.percentage || 50));
        const scoreB = (b.accuracy !== undefined ? b.accuracy : (b.percentage || 50));
        return scoreA - scoreB;
      });

      const weakestArea = sortedAreas[0] || { area: 'Matemática e suas Tecnologias', shortLabel: 'MT', accuracy: 52 };
      const secondWeakestArea = sortedAreas[1] || { area: 'Ciências da Natureza e suas Tecnologias', shortLabel: 'CN', accuracy: 58 };

      if (ai) {
        try {
          const prompt = `Você é o Coordenador Pedagógico Especialista em ENEM e Neuroinclusão da plataforma.
Sua missão é criar um CRONOGRAMA SEMANAL INTELIGENTE E PERSONALIZADO para o estudante:
- Nome: ${studentName}
- Série/Etapa: ${gradeLevel}
- Perfil Neurodivergente / Acessibilidade: ${neuroProfile.toUpperCase()} (se TDAH: ciclos Pomodoro curtos de 15 a 25 min com pausas conscientes e intercalação de matérias para evitar saturação; se TEA: rotina previsível, linguagem literal e metas diretas; se Dislexia: materiais multissensoriais, flashcards e redução de leitura densa passiva).
- Meta de Estudo: "${focusGoal}"
- Carga horária pretendida: ${dailyHours} horas/dia durante ${daysCount} dias da semana.
- Turno preferencial: ${preferredShift}.

DIAGNÓSTICO REAL DE DESEMPENHO DO ALUNO (ÁREAS COM MENOR DESEMPENHO DEVEM RECEBER MAIOR TEMPO E PRIORIDADE):
${sortedAreas.map((a: any, i: number) => `Prioridade ${i + 1}: ${a.area} (${a.shortLabel}) -> Desempenho atual: ${a.accuracy || a.percentage || 50}% (${(a.accuracy || a.percentage || 50) < 60 ? '🚨 CRÍTICO' : (a.accuracy || a.percentage || 50) < 75 ? '⚠️ ATENÇÃO' : '✅ CONSOLIDADO'})`).join('\n')}

Tópicos com erros frequentes identificados:
${weakTopics.length > 0 ? weakTopics.join(', ') : 'Eletrodinâmica, Geometria Espacial, Funções Trigonométricas, Proposta de Intervenção C5 da Redação, Genética e Termoquímica'}

REGRAS DE DISTRIBUIÇÃO PEDAGÓGICA:
1. Áreas com menor desempenho (${weakestArea.area} e ${secondWeakestArea.area}) DEVEM receber pelo menos 55% a 65% do tempo total da semana!
2. Coloque as matérias mais difíceis no início das sessões diárias, quando a energia cognitiva está alta.
3. Reserve ao menos 1 sessão semanal para Redação Nota 1000 (focando em repertório ou proposta C5).
4. Em cada dia, divida o tempo em blocos realistas com 'durationMinutes' (ex: 30 a 45 min) e especifique a quantidade recomendada de ciclos Pomodoro ('pomodoroCycles').
5. Cada sessão deve ter um 'pedagogicalGoal' concreto (ex: "Resolver 8 questões fáceis de Geometria Plana para garantir pontuação TRI") e uma 'neuroTip' prática de foco.
6. Gere exatamente ${daysCount} dias (com dayId: 'seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom' conforme os dias selecionados).

Responda ESTRITAMENTE em formato JSON com o seguinte schema:
{
  "title": "<Título dinâmico motivador do cronograma>",
  "diagnosticSummary": "<Parágrafo pedagógico direto explicando como o cronograma foi calibrado para priorizar as áreas fracas do aluno sem sobrecarregá-lo>",
  "totalHoursWeek": <número total de horas semanais>,
  "priorityAreas": [
    {
      "area": "<Nome da Área>",
      "shortLabel": "<LC | CH | CN | MT | RED>",
      "currentAccuracy": <número porcentagem>,
      "priorityLevel": "<critico | atencao | consolidado>",
      "weeklyAllocatedHours": <número de horas semanais dedicadas>,
      "targetedWeakTopics": ["<tópico prioritário 1>", "<tópico prioritário 2>"]
    }
  ],
  "days": [
    {
      "dayId": "<seg | ter | qua | qui | sex | sab | dom>",
      "dayName": "<Segunda-feira, etc>",
      "dayShort": "<SEG | TER | QUA | QUI | SEX | SÁB | DOM>",
      "focusTheme": "<Tema do dia, ex: Resgate em Matemática & Natureza>",
      "dailyQuote": "<Frase motivadora e focada>",
      "isRestDay": false,
      "sessions": [
        {
          "id": "<id único>",
          "timeSlot": "<ex: 14:00 - 14:45>",
          "durationMinutes": 45,
          "area": "<Nome da Área>",
          "areaShort": "<LC | CH | CN | MT | RED | PAUSA>",
          "topic": "<Assunto específico>",
          "activityType": "<teoria_ativa | questoes_tri | revisao_flashcards | redacao_c5 | pausa_pomodoro>",
          "pedagogicalGoal": "<Meta concreta>",
          "pomodoroCycles": 2,
          "neuroTip": "<Dica de foco e acomodação>"
        }
      ]
    }
  ],
  "weeklyMilestones": [
    "<Meta mensurável 1, ex: Subir de 52% para 70% em Geometria>",
    "<Meta mensurável 2>",
    "<Meta mensurável 3>"
  ]
}`;

          const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              temperature: 0.3,
            },
          });

          const rawText = response.text?.trim() || '{}';
          const planData = JSON.parse(rawText);

          return res.json({
            ...planData,
            id: `plan-${Date.now()}`,
            createdAt: new Date().toISOString(),
            isAiGenerated: true,
            studentProfile: {
              neuroType: neuroProfile,
              dailyHours,
              preferredShift,
              daysCount,
            },
          });
        } catch (geminiError: any) {
          console.warn('Falha no Gemini ao gerar cronograma semanal, gerando plano inteligente calibrado localmente:', geminiError.message);
        }
      }

      // Algoritmo Pedagógico Local de Calibração por Desempenho (Fallback inteligente e consistente)
      const dayDefs: Array<{ dayId: 'seg' | 'ter' | 'qua' | 'qui' | 'sex' | 'sab' | 'dom'; name: string; short: 'SEG' | 'TER' | 'QUA' | 'QUI' | 'SEX' | 'SÁB' | 'DOM' }> = [
        { dayId: 'seg', name: 'Segunda-feira', short: 'SEG' },
        { dayId: 'ter', name: 'Terça-feira', short: 'TER' },
        { dayId: 'qua', name: 'Quarta-feira', short: 'QUA' },
        { dayId: 'qui', name: 'Quinta-feira', short: 'QUI' },
        { dayId: 'sex', name: 'Sexta-feira', short: 'SEX' },
        { dayId: 'sab', name: 'Sábado', short: 'SÁB' },
        { dayId: 'dom', name: 'Domingo', short: 'DOM' },
      ];

      const selectedDays = dayDefs.slice(0, daysCount);
      const totalWeeklyHours = dailyHours * daysCount;

      const priorityAreasFormatted = [
        {
          area: weakestArea.area || 'Matemática e suas Tecnologias',
          shortLabel: (weakestArea.shortLabel || 'MT') as any,
          currentAccuracy: weakestArea.accuracy || 52,
          currentTRI: weakestArea.scoreTRI || 580,
          priorityLevel: 'critico' as const,
          weeklyAllocatedHours: Math.round(totalWeeklyHours * 0.38 * 10) / 10,
          targetedWeakTopics: weakTopics.slice(0, 3).length > 0 ? weakTopics.slice(0, 3) : ['Geometria Espacial', 'Funções Afim e Quadrática', 'Estatística e Probabilidade'],
        },
        {
          area: secondWeakestArea.area || 'Ciências da Natureza e suas Tecnologias',
          shortLabel: (secondWeakestArea.shortLabel || 'CN') as any,
          currentAccuracy: secondWeakestArea.accuracy || 61,
          currentTRI: secondWeakestArea.scoreTRI || 610,
          priorityLevel: 'atencao' as const,
          weeklyAllocatedHours: Math.round(totalWeeklyHours * 0.30 * 10) / 10,
          targetedWeakTopics: ['Eletrodinâmica & Leis de Ohm', 'Termoquímica & Cinética', 'Ecologia & Ciclos Biogeoquímicos'],
        },
        {
          area: 'Redação ENEM',
          shortLabel: 'RED' as any,
          currentAccuracy: 75,
          currentTRI: 760,
          priorityLevel: 'atencao' as const,
          weeklyAllocatedHours: Math.round(totalWeeklyHours * 0.16 * 10) / 10,
          targetedWeakTopics: ['Proposta de Intervenção C5', 'Repertório Sociocultural C2', 'Conectivos C4'],
        },
        {
          area: sortedAreas[2]?.area || 'Ciências Humanas e suas Tecnologias',
          shortLabel: (sortedAreas[2]?.shortLabel || 'CH') as any,
          currentAccuracy: sortedAreas[2]?.accuracy || 78,
          currentTRI: sortedAreas[2]?.scoreTRI || 700,
          priorityLevel: 'consolidado' as const,
          weeklyAllocatedHours: Math.round(totalWeeklyHours * 0.16 * 10) / 10,
          targetedWeakTopics: ['Cidadania & Filosofia Política', 'Geopolítica Contemporânea'],
        },
      ];

      const generatedDays = selectedDays.map((d, index) => {
        const isFocusWeakestDay = index % 2 === 0;
        const mainArea = isFocusWeakestDay ? priorityAreasFormatted[0] : priorityAreasFormatted[1];
        const secondaryArea = isFocusWeakestDay ? priorityAreasFormatted[1] : priorityAreasFormatted[2];

        const startHour = preferredShift === 'manha' ? 8 : preferredShift === 'noite' ? 19 : 14;

        return {
          dayId: d.dayId,
          dayName: d.name,
          dayShort: d.short,
          focusTheme: isFocusWeakestDay
            ? `Imersão em ${mainArea.area} (Prioridade Máxima)`
            : `Consolidação de ${mainArea.area} & Prática Ativa`,
          dailyQuote: isFocusWeakestDay
            ? 'A consistência diária em pequenas vitórias vence qualquer bloqueio no ENEM!'
            : 'Revisão ativa e alternância de matérias mantêm o cérebro engajado e focado.',
          isRestDay: false,
          sessions: [
            {
              id: `sess-${d.dayId}-1`,
              timeSlot: `${startHour}:00 - ${startHour}:45`,
              durationMinutes: 45,
              area: mainArea.area as any,
              areaShort: mainArea.shortLabel,
              topic: mainArea.targetedWeakTopics[index % mainArea.targetedWeakTopics.length],
              activityType: 'questoes_tri' as const,
              pedagogicalGoal: `Resolver 8 a 10 questões comentadas com foco em padrões de coerência TRI na área de ${mainArea.shortLabel}`,
              pomodoroCycles: 2,
              neuroTip: neuroProfile === 'tdah' ? 'Use o cronômetro Pomodoro em blocos curtos de 15 min com tigela tibetana.' : 'Foque apenas nas questões fáceis primeiro para aquecer a confiança.',
            },
            {
              id: `sess-${d.dayId}-pausa`,
              timeSlot: `${startHour}:45 - ${startHour + 1}:00`,
              durationMinutes: 15,
              area: 'Pausa & Descanso' as any,
              areaShort: 'PAUSA' as any,
              topic: 'Intervalo Regenerativo de Dopamina',
              activityType: 'pausa_pomodoro' as const,
              pedagogicalGoal: 'Alongamento, hidratação e descanso visual longe de telas',
              pomodoroCycles: 1,
              neuroTip: 'Não cheque redes sociais; respire fundo e beba um copo d’água.',
            },
            {
              id: `sess-${d.dayId}-2`,
              timeSlot: `${startHour + 1}:00 - ${startHour + 1}:45`,
              durationMinutes: 45,
              area: secondaryArea.area as any,
              areaShort: secondaryArea.shortLabel,
              topic: secondaryArea.targetedWeakTopics[0] || 'Revisão Espaçada SRS',
              activityType: 'revisao_flashcards' as const,
              pedagogicalGoal: `Revisar conceitos-chave com flashcards inteligentes e mapas conceituais`,
              pomodoroCycles: 2,
              neuroTip: 'Explique o conceito em voz alta para você mesmo como se estivesse ensinando alguém.',
            },
          ],
        };
      });

      return res.json({
        id: `plan-${Date.now()}`,
        title: `Plano Estratégico ENEM: Foco Intensivo em ${weakestArea.shortLabel} e ${secondWeakestArea.shortLabel}`,
        createdAt: new Date().toISOString(),
        diagnosticSummary: `Identificamos que seu menor índice de acertos está concentrado em ${weakestArea.area} (${weakestArea.accuracy || 52}%) e ${secondWeakestArea.area} (${secondWeakestArea.accuracy || 61}%). Seu cronograma foi calibrado para alocar aproximadamente 68% do tempo semanal nessas duas frentes com metodologia neuroinclusiva intercalada, garantindo recuperação do TRI sem estafa mental.`,
        totalHoursWeek: totalWeeklyHours,
        priorityAreas: priorityAreasFormatted,
        days: generatedDays,
        weeklyMilestones: [
          `Alcançar 70% de acerto nas listas de questões de ${weakestArea.area}`,
          `Fechar 1 proposta de redação completa com os 5 elementos da C5 validados`,
          `Cumprir 100% dos micro-ciclos Pomodoro sem interrupções evitáveis`,
        ],
        isAiGenerated: false,
        studentProfile: {
          neuroType: neuroProfile,
          dailyHours,
          preferredShift,
          daysCount,
        },
      });
    } catch (error: any) {
      console.error('Erro ao gerar cronograma semanal:', error);
      return res.status(500).json({
        error: 'Não foi possível gerar o cronograma semanal no momento.',
        details: error.message,
      });
    }
  });

  // Setup Vite in development or static serve in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Plataforma ENEM Inclusiva] Servidor rodando na porta ${PORT}`);
  });
}

startServer();
