import { EssaySubmissionHistoryItem } from '../types';

export const INITIAL_ESSAY_HISTORY: EssaySubmissionHistoryItem[] = [
  {
    id: 'essay-hist-1',
    themeTitle: 'Desafios para a valorização de comunidades e povos tradicionais no Brasil',
    date: '2026-03-20',
    displayDate: 'Mar/2026',
    timestamp: new Date('2026-03-20T10:00:00Z').getTime(),
    knowledgeArea: 'Ciências Humanas e suas Tecnologias',
    knowledgeAreaShort: 'CH',
    totalScore: 640,
    c1: 120, // Norma culta: desvios leves de pontuação e concordância
    c2: 140, // Repertório: citação da CF/88 pouco produtiva
    c3: 120, // Argumentação: lacunas de autoria e projeto de texto
    c4: 120, // Coesão: repetição de conectivos ("além disso")
    c5: 140, // Proposta: faltou detalhamento do meio/modo
    interventionElementsCount: 3,
    feedbackSummary: 'Diagnóstico inicial. Excelente sensibilidade temática; necessidade de diversificar conectivos e estruturar a proposta com 5 elementos completos.',
    mode: 'Simulado',
  },
  {
    id: 'essay-hist-2',
    themeTitle: 'Caminhos para combater a evasão escolar e garantir a permanência no Ensino Médio',
    date: '2026-04-22',
    displayDate: 'Abr/2026',
    timestamp: new Date('2026-04-22T15:30:00Z').getTime(),
    knowledgeArea: 'Ciências Humanas e suas Tecnologias',
    knowledgeAreaShort: 'CH',
    totalScore: 720,
    c1: 140,
    c2: 160, // Repertório legítimo e produtivo (Paulo Freire)
    c3: 140,
    c4: 140,
    c5: 140,
    interventionElementsCount: 4,
    feedbackSummary: 'Evolução notável na C2 com repertório de Paulo Freire bem articulado. Proposta de intervenção avançou com agente governamental claro.',
    mode: 'IA',
  },
  {
    id: 'essay-hist-3',
    themeTitle: 'Inclusão digital e inteligência artificial no combate às desigualdades educacionais',
    date: '2026-05-30',
    displayDate: 'Mai/2026',
    timestamp: new Date('2026-05-30T11:00:00Z').getTime(),
    knowledgeArea: 'Linguagens, Códigos e suas Tecnologias',
    knowledgeAreaShort: 'LC',
    totalScore: 780,
    c1: 160, // Pouquíssimos desvios gramaticais
    c2: 160,
    c3: 140,
    c4: 160, // Excelente coesão interparágrafos
    c5: 160, // Proposta quase completa
    interventionElementsCount: 4,
    feedbackSummary: 'Salto na coesão (C4) e na norma padrão (C1). Uso consistente de operadores argumentativos entre os parágrafos de desenvolvimento.',
    mode: 'IA',
  },
  {
    id: 'essay-hist-4',
    themeTitle: 'Preservação da biodiversidade e transição energética justa nos biomas brasileiros',
    date: '2026-07-08',
    displayDate: 'Jul/2026',
    timestamp: new Date('2026-07-08T16:00:00Z').getTime(),
    knowledgeArea: 'Ciências da Natureza e suas Tecnologias',
    knowledgeAreaShort: 'CN',
    totalScore: 820,
    c1: 160,
    c2: 180, // Conceitos ecológicos sólidos e referência à matriz energética
    c3: 160,
    c4: 160,
    c5: 160,
    interventionElementsCount: 4,
    feedbackSummary: 'Domínio científico evidente em Ciências da Natureza. Discussão equilibrada entre conservação biológica e justiça socioeconômica.',
    mode: 'Simulado',
  },
  {
    id: 'essay-hist-5',
    themeTitle: 'Alfabetização financeira e proteção contra endividamento na era dos pagamentos digitais',
    date: '2026-08-19',
    displayDate: 'Ago/2026',
    timestamp: new Date('2026-08-19T14:15:00Z').getTime(),
    knowledgeArea: 'Matemática e suas Tecnologias',
    knowledgeAreaShort: 'MT',
    totalScore: 860,
    c1: 160,
    c2: 180,
    c3: 180, // Argumentação consistente com dados estatísticos e lógica dedutiva
    c4: 160,
    c5: 180, // Proposta completa com 5 elementos
    interventionElementsCount: 5,
    feedbackSummary: 'Argumentação impecável com raciocínio lógico e contextualização matemática. Primeira redação com todos os 5 elementos da intervenção validados!',
    mode: 'IA',
  },
  {
    id: 'essay-hist-6',
    themeTitle: 'O impacto da desinformação científica e o papel da divulgação na saúde pública',
    date: '2026-09-14',
    displayDate: 'Set/2026',
    timestamp: new Date('2026-09-14T09:40:00Z').getTime(),
    knowledgeArea: 'Ciências da Natureza e suas Tecnologias',
    knowledgeAreaShort: 'CN',
    totalScore: 900,
    c1: 180, // Norma culta excelente
    c2: 180,
    c3: 180,
    c4: 180, // Coesão rica e sem repetições
    c5: 180,
    interventionElementsCount: 5,
    feedbackSummary: 'Barreira dos 900 pontos superada com louvor! Texto com projeto autoral, fluidez oracional e defesa de ponto de vista convicta.',
    mode: 'Simulado',
  },
  {
    id: 'essay-hist-7',
    themeTitle: 'Acessibilidade comunicativa e valorização das línguas de sinais e tecnologia assistiva',
    date: '2026-10-05',
    displayDate: 'Out/2026',
    timestamp: new Date('2026-10-05T13:20:00Z').getTime(),
    knowledgeArea: 'Linguagens, Códigos e suas Tecnologias',
    knowledgeAreaShort: 'LC',
    totalScore: 940,
    c1: 180,
    c2: 200, // Nível 5: Repertório altamente produtivo e autoral
    c3: 180,
    c4: 180,
    c5: 200, // Nível 5: Proposta perfeita (Agente, Ação, Meio, Efeito e Detalhamento minucioso)
    interventionElementsCount: 5,
    feedbackSummary: 'Nota 940! Nota máxima nas Competências 2 e 5. Texto com profundidade sociolinguística e proposta de intervenção de referência nacional.',
    mode: 'Voz',
  },
];
