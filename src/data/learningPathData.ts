import { LearningPathNode, LearningPathProgress, KnowledgeArea, GradeLevel } from '../types';

export const INITIAL_LEARNING_PATH_NODES: LearningPathNode[] = [
  // =========================================================================
  // CIÊNCIAS DA NATUREZA E SUAS TECNOLOGIAS (Trilha Progressiva)
  // =========================================================================
  {
    id: 'cn-1',
    title: 'Cinemática Escalar & Equação de Torricelli',
    area: 'Ciências da Natureza e suas Tecnologias',
    gradeLevel: '1º ano',
    difficulty: 'basico',
    stepNumber: 1,
    stageName: 'Fase 1: Fundamentos & Mecânica Básica',
    bnccSkill: 'EM13CNT301',
    description: 'Compreensão de velocidade média, aceleração escalar e cálculo de trajetórias sem variável tempo.',
    summaryKeyPoints: [
      'Equação de Torricelli: v² = v₀² + 2·a·Δs (usada quando o tempo não é fornecido)',
      'Distinção entre Movimento Uniforme (MU) e Uniformemente Variado (MUV)',
      'Aceleração constante e interpretação de gráficos v vs. t'
    ],
    status: 'conquistado',
    progressPercent: 100,
    accuracyPercent: 92,
    totalQuestions: 10,
    completedQuestions: 10,
    xpReward: 150,
    unlockedAt: '2026-09-01',
    completedAt: '2026-09-12',
    badge: {
      name: 'Mestre da Cinemática',
      icon: '🚀',
      description: 'Dominou o movimento uniforme e acelerado sem depender do tempo!'
    }
  },
  {
    id: 'cn-2',
    title: 'Citologia, Membrana & Organelas Celulares',
    area: 'Ciências da Natureza e suas Tecnologias',
    gradeLevel: '1º ano',
    difficulty: 'basico',
    stepNumber: 2,
    stageName: 'Fase 1: Fundamentos & Vida Celular',
    bnccSkill: 'EM13CNT202',
    description: 'Estrutura celular eucariótica e especialização das organelas na síntese e secreção.',
    summaryKeyPoints: [
      'Retículo Endoplasmático Granuloso (Rugoso): síntese proteica de exportação',
      'Complexo Golgiense: empacotamento, glicosilação e formação de vesículas',
      'Mitocôndrias: respiração celular e conversão de energia em ATP'
    ],
    status: 'conquistado',
    progressPercent: 100,
    accuracyPercent: 88,
    totalQuestions: 10,
    completedQuestions: 10,
    xpReward: 150,
    unlockedAt: '2026-09-13',
    completedAt: '2026-09-24',
    badge: {
      name: 'Explorador Citológico',
      icon: '🔬',
      description: 'Desvendou as funções das organelas em células glandulares e musculares!'
    },
    prerequisiteNodeId: 'cn-1'
  },
  {
    id: 'cn-3',
    title: 'Leis de Newton & Dinâmica dos Corpos',
    area: 'Ciências da Natureza e suas Tecnologias',
    gradeLevel: '1º ano',
    difficulty: 'basico',
    stepNumber: 3,
    stageName: 'Fase 1: Fundamentos & Forças',
    bnccSkill: 'EM13CNT302',
    description: 'Princípios fundamentais da inércia, ação-reação e equilíbrio dinâmico no cotidiano.',
    summaryKeyPoints: [
      '1ª Lei (Inércia): ausência de força resultante mantém repouso ou MRU',
      '2ª Lei: Força Resultante = m · a',
      '3ª Lei: pares de ação e reação nunca se anulam no mesmo corpo'
    ],
    status: 'conquistado',
    progressPercent: 100,
    accuracyPercent: 85,
    totalQuestions: 12,
    completedQuestions: 12,
    xpReward: 200,
    unlockedAt: '2026-09-25',
    completedAt: '2026-10-02',
    badge: {
      name: 'Guardião de Newton',
      icon: '⚖️',
      description: 'Conquistou as 3 leis fundamentais e o equilíbrio de forças no ENEM!'
    },
    prerequisiteNodeId: 'cn-2'
  },
  {
    id: 'cn-4',
    title: 'Termodinâmica & Segunda Lei (Máquinas Térmicas)',
    area: 'Ciências da Natureza e suas Tecnologias',
    gradeLevel: '2º ano',
    difficulty: 'intermediario',
    stepNumber: 4,
    stageName: 'Fase 2: Consolidação & Energia',
    bnccSkill: 'EM13CNT306',
    description: 'Conservação da energia, rendimento de máquinas térmicas e o ciclo de Carnot.',
    summaryKeyPoints: [
      '2ª Lei (Kelvin-Planck): nenhuma máquina térmica operando em ciclos atinge 100% de rendimento',
      'Rejeição obrigatória de calor para a fonte fria: Q₁ = W + Q₂',
      'Rendimento teórico máximo dado pelo ciclo de Carnot: η = 1 - (T₂/T₁)'
    ],
    status: 'em_andamento',
    progressPercent: 70,
    accuracyPercent: 75,
    totalQuestions: 10,
    completedQuestions: 7,
    xpReward: 250,
    unlockedAt: '2026-10-03',
    prerequisiteNodeId: 'cn-3'
  },
  {
    id: 'cn-5',
    title: 'Equilíbrio Químico & Princípio de Le Chatelier',
    area: 'Ciências da Natureza e suas Tecnologias',
    gradeLevel: '2º ano',
    difficulty: 'intermediario',
    stepNumber: 5,
    stageName: 'Fase 2: Consolidação & Reações',
    bnccSkill: 'EM13CNT104',
    description: 'Perturbações de pressão, temperatura e concentração em sistemas reversíveis.',
    summaryKeyPoints: [
      'Aumento de pressão: desloca o equilíbrio para o lado de menor volume gasoso',
      'Aumento de temperatura: favorece a reação endotérmica (absorve calor)',
      'Catalisadores aumentam a velocidade, mas NÃO alteram o rendimento do equilíbrio'
    ],
    status: 'bloqueado',
    progressPercent: 0,
    totalQuestions: 10,
    completedQuestions: 0,
    xpReward: 280,
    prerequisiteNodeId: 'cn-4'
  },
  {
    id: 'cn-6',
    title: 'Genética Mendeliana, DNA & Síntese Proteica',
    area: 'Ciências da Natureza e suas Tecnologias',
    gradeLevel: '2º ano',
    difficulty: 'avancado',
    stepNumber: 6,
    stageName: 'Fase 3: Aprofundamento ENEM',
    bnccSkill: 'EM13CNT203',
    description: 'Hereditariedade, segregação independente, transcrição de RNAm e tradução de códons.',
    summaryKeyPoints: [
      'Primeira e Segunda Lei de Mendel (monoibridismo e diibridismo)',
      'Código genético degenerado e universalidade dos códons',
      'Interpretação de heredogramas e probabilidade genética combinada'
    ],
    status: 'bloqueado',
    progressPercent: 0,
    totalQuestions: 12,
    completedQuestions: 0,
    xpReward: 320,
    prerequisiteNodeId: 'cn-5'
  },
  {
    id: 'cn-7',
    title: 'Ecologia Integrada & Impactos Antrópicos (Boss)',
    area: 'Ciências da Natureza e suas Tecnologias',
    gradeLevel: '3º ano',
    difficulty: 'desafio_tri',
    stepNumber: 7,
    stageName: 'Fase 4: Domínio Avançado & Simulado TRI',
    bnccSkill: 'EM13CNT302',
    description: 'Ciclos biogeoquímicos, biomagnificação trófica e intervenções ecológicas sustentáveis.',
    summaryKeyPoints: [
      'Eutrofização artificial de corpos hídricos e proliferação de algas',
      'Bioacumulação e magnificação trófica em níveis superiores da cadeia',
      'Manejo de matas ciliares e controle biológico de pragas'
    ],
    status: 'bloqueado',
    progressPercent: 0,
    totalQuestions: 15,
    completedQuestions: 0,
    xpReward: 500,
    isBossMilestone: true,
    badge: {
      name: 'Lorde Supremo da Natureza',
      icon: '👑',
      description: 'Conquistou a trilha completa de Ciências da Natureza com excelência na TRI!'
    },
    prerequisiteNodeId: 'cn-6'
  },

  // =========================================================================
  // MATEMÁTICA E SUAS TECNOLOGIAS (Trilha Progressiva)
  // =========================================================================
  {
    id: 'mt-1',
    title: 'Razão, Proporção & Regra de Três Composta',
    area: 'Matemática e suas Tecnologias',
    gradeLevel: '1º ano',
    difficulty: 'basico',
    stepNumber: 1,
    stageName: 'Fase 1: Fundamentos Algébricos',
    bnccSkill: 'EM13MAT101',
    description: 'Grandezas direta e inversamente proporcionais, escalas cartográficas e porcentagem.',
    summaryKeyPoints: [
      'Identificação correta de grandezas inversas antes da multiplicação cruzada',
      'Escala numérica: D = d · E (conversão entre cm, m e km)',
      'Aumentos e descontos sucessivos através de fatores multiplicativos'
    ],
    status: 'conquistado',
    progressPercent: 100,
    accuracyPercent: 94,
    totalQuestions: 10,
    completedQuestions: 10,
    xpReward: 150,
    unlockedAt: '2026-09-02',
    completedAt: '2026-09-15',
    badge: {
      name: 'Arquiteto da Proporção',
      icon: '📐',
      description: 'Domina escalas e proporcionalidade direta/inversa com destreza!'
    }
  },
  {
    id: 'mt-2',
    title: 'Função Afim (1º Grau) & Modelagem Linear',
    area: 'Matemática e suas Tecnologias',
    gradeLevel: '1º ano',
    difficulty: 'basico',
    stepNumber: 2,
    stageName: 'Fase 1: Fundamentos Algébricos',
    bnccSkill: 'EM13MAT101',
    description: 'Equações da forma f(x) = ax + b, taxa de variação (coeficiente angular) e intercepto.',
    summaryKeyPoints: [
      'Interpretação do termo fixo (b) como ponto de partida no eixo y',
      'Taxa constante de variação (a = Δy / Δx)',
      'Resolução de problemas práticos de custos fixos e remuneração variável'
    ],
    status: 'conquistado',
    progressPercent: 100,
    accuracyPercent: 90,
    totalQuestions: 10,
    completedQuestions: 10,
    xpReward: 150,
    unlockedAt: '2026-09-16',
    completedAt: '2026-09-28',
    badge: {
      name: 'Mestre da Reta',
      icon: '📈',
      description: 'Modelou situações financeiras e geográficas através de funções lineares!'
    },
    prerequisiteNodeId: 'mt-1'
  },
  {
    id: 'mt-3',
    title: 'Função Quadrática (2º Grau) & Vértice Máximo/Mínimo',
    area: 'Matemática e suas Tecnologias',
    gradeLevel: '1º ano',
    difficulty: 'intermediario',
    stepNumber: 3,
    stageName: 'Fase 2: Geometria & Otimização',
    bnccSkill: 'EM13MAT201',
    description: 'Parábolas, determinação de raízes e problemas clássicos de lucro máximo e área máxima.',
    summaryKeyPoints: [
      'Coordenadas do vértice: Xv = -b / (2a) e Yv = -Δ / (4a)',
      'Identificação se a parábola possui ponto de máximo (a < 0) ou mínimo (a > 0)',
      'Interpretação geométrica das raízes reais e simetria do gráfico'
    ],
    status: 'em_andamento',
    progressPercent: 50,
    accuracyPercent: 70,
    totalQuestions: 10,
    completedQuestions: 5,
    xpReward: 220,
    unlockedAt: '2026-09-29',
    prerequisiteNodeId: 'mt-2'
  },
  {
    id: 'mt-4',
    title: 'Geometria Plana: Áreas, Triângulos & Pitágoras',
    area: 'Matemática e suas Tecnologias',
    gradeLevel: '2º ano',
    difficulty: 'intermediario',
    stepNumber: 4,
    stageName: 'Fase 2: Geometria & Otimização',
    bnccSkill: 'EM13MAT301',
    description: 'Cálculo de áreas compostas, semelhança de triângulos e relações métricas fundamentais.',
    summaryKeyPoints: [
      'Razão de semelhança entre áreas é proporcional a k²',
      'Teorema de Pitágoras e triângulos notáveis (3-4-5 e 30º-60º-90º)',
      'Decomposição de polígonos irregulares em triângulos e retângulos'
    ],
    status: 'bloqueado',
    progressPercent: 0,
    totalQuestions: 12,
    completedQuestions: 0,
    xpReward: 260,
    prerequisiteNodeId: 'mt-3'
  },
  {
    id: 'mt-5',
    title: 'Geometria Espacial: Prismas, Cilindros & Volumes',
    area: 'Matemática e suas Tecnologias',
    gradeLevel: '2º ano',
    difficulty: 'avancado',
    stepNumber: 5,
    stageName: 'Fase 3: Aprofundamento ENEM',
    bnccSkill: 'EM13MAT303',
    description: 'Planificação de sólidos, cálculo de capacidade em litros e razão entre volumes.',
    summaryKeyPoints: [
      'Volume de prismas e cilindros: V = Área da Base · Altura',
      'Conversão de 1 m³ = 1000 L e 1 dm³ = 1 L',
      'Razão entre volumes de sólidos semelhantes é proporcional a k³'
    ],
    status: 'bloqueado',
    progressPercent: 0,
    totalQuestions: 10,
    completedQuestions: 0,
    xpReward: 300,
    prerequisiteNodeId: 'mt-4'
  },
  {
    id: 'mt-6',
    title: 'Análise Combinatória & Princípio Multiplicativo',
    area: 'Matemática e suas Tecnologias',
    gradeLevel: '2º ano',
    difficulty: 'avancado',
    stepNumber: 6,
    stageName: 'Fase 3: Aprofundamento ENEM',
    bnccSkill: 'EM13MAT310',
    description: 'Agrupamentos com e sem repetição: arranjos, permutações e combinações simples.',
    summaryKeyPoints: [
      'Diferença crucial: ordem importa? (Arranjo/Permutação) ou ordem não importa? (Combinação)',
      'Combinação simples: C(n, p) = n! / [p! · (n - p)!]',
      'Contagem indireta: calcular o total e subtrair os casos indesejados'
    ],
    status: 'bloqueado',
    progressPercent: 0,
    totalQuestions: 12,
    completedQuestions: 0,
    xpReward: 340,
    prerequisiteNodeId: 'mt-5'
  },
  {
    id: 'mt-7',
    title: 'Probabilidade Condicional & Estatística TRI (Boss)',
    area: 'Matemática e suas Tecnologias',
    gradeLevel: '3º ano',
    difficulty: 'desafio_tri',
    stepNumber: 7,
    stageName: 'Fase 4: Domínio Avançado & Simulado TRI',
    bnccSkill: 'EM13MAT311',
    description: 'Eventos dependentes, probabilidade condicional, desvio padrão e média ponderada.',
    summaryKeyPoints: [
      'Probabilidade condicional: P(A | B) = P(A ∩ B) / P(B)',
      'Desvio padrão e variância como medidas de regularidade e homogeneidade',
      'Distribuição normal e interpretação de gráficos estatísticos complexos'
    ],
    status: 'bloqueado',
    progressPercent: 0,
    totalQuestions: 15,
    completedQuestions: 0,
    xpReward: 500,
    isBossMilestone: true,
    badge: {
      name: 'Mago dos Números & TRI',
      icon: '🏆',
      description: 'Superou as questões mais temidas de probabilidade e estatística do ENEM!'
    },
    prerequisiteNodeId: 'mt-6'
  },

  // =========================================================================
  // CIÊNCIAS HUMANAS E SUAS TECNOLOGIAS (Trilha Progressiva)
  // =========================================================================
  {
    id: 'ch-1',
    title: 'Grécia Antiga & Cidadania Ateniense',
    area: 'Ciências Humanas e suas Tecnologias',
    gradeLevel: '1º ano',
    difficulty: 'basico',
    stepNumber: 1,
    stageName: 'Fase 1: Sociedade & Cidadania',
    bnccSkill: 'EM13CHS101',
    description: 'Nascimento da política na Ágora ateniense e o caráter restrito do corpo de cidadãos.',
    summaryKeyPoints: [
      'Democracia direta na Ágora, com oratória e isonomia entre os iguais',
      'Base excludente: exclusão de mulheres, estrangeiros (metecos) e escravizados',
      'Comparação com os conceitos contemporâneos de direitos universais'
    ],
    status: 'conquistado',
    progressPercent: 100,
    accuracyPercent: 95,
    totalQuestions: 10,
    completedQuestions: 10,
    xpReward: 150,
    unlockedAt: '2026-09-03',
    completedAt: '2026-09-14',
    badge: {
      name: 'Filósofo da Ágora',
      icon: '🏛️',
      description: 'Compreendeu as contradições históricas da cidadania grega!'
    }
  },
  {
    id: 'ch-2',
    title: 'Revolução Industrial & Urbanização',
    area: 'Ciências Humanas e suas Tecnologias',
    gradeLevel: '1º ano',
    difficulty: 'basico',
    stepNumber: 2,
    stageName: 'Fase 1: Sociedade & Cidadania',
    bnccSkill: 'EM13CHS102',
    description: 'Transformações no mundo do trabalho, divisão técnica e crescimento desordenado das cidades.',
    summaryKeyPoints: [
      'Transição da manufatura artesanal para a maquinofatura a vapor',
      'Alienação do trabalhador e surgimento do proletariado urbano',
      'Impactos ambientais precoces e segregação socioespacial nas metrópoles'
    ],
    status: 'conquistado',
    progressPercent: 100,
    accuracyPercent: 90,
    totalQuestions: 10,
    completedQuestions: 10,
    xpReward: 160,
    unlockedAt: '2026-09-15',
    completedAt: '2026-09-29',
    badge: {
      name: 'Pioneiro Industrial',
      icon: '🏭',
      description: 'Analisou as raízes históricas do trabalho assalariado e da urbanização!'
    },
    prerequisiteNodeId: 'ch-1'
  },
  {
    id: 'ch-3',
    title: 'Iluminismo, Liberalismo & Revoluções Burguesas',
    area: 'Ciências Humanas e suas Tecnologias',
    gradeLevel: '2º ano',
    difficulty: 'intermediario',
    stepNumber: 3,
    stageName: 'Fase 2: Pensamento Político & Estado',
    bnccSkill: 'EM13CHS201',
    description: 'Crítica ao Antigo Regime, divisão dos três poderes (Montesquieu) e contrato social.',
    summaryKeyPoints: [
      'Racionalismo e combate ao absolutismo monárquico de direito divino',
      'Montesquieu (Executivo, Legislativo, Judiciário) e Rousseau (vontade geral)',
      'Declaração dos Direitos do Homem e do Cidadão (1789)'
    ],
    status: 'em_andamento',
    progressPercent: 60,
    accuracyPercent: 80,
    totalQuestions: 10,
    completedQuestions: 6,
    xpReward: 240,
    unlockedAt: '2026-09-30',
    prerequisiteNodeId: 'ch-2'
  },
  {
    id: 'ch-4',
    title: 'Brasil República, Era Vargas & Trabalhismo',
    area: 'Ciências Humanas e suas Tecnologias',
    gradeLevel: '2º ano',
    difficulty: 'avancado',
    stepNumber: 4,
    stageName: 'Fase 3: Brasil Contemporâneo',
    bnccSkill: 'EM13CHS301',
    description: 'Cidadania regulada, industrialização por substituição de importações e a CLT.',
    summaryKeyPoints: [
      'Estado Novo (1937-1945), propaganda política e controle sindical (peleguismo)',
      'Consolidação das Leis do Trabalho (CLT) e direitos sociais urbanos',
      'Criação de indústrias de base (CSN, Vale, Petrobras)'
    ],
    status: 'bloqueado',
    progressPercent: 0,
    totalQuestions: 12,
    completedQuestions: 0,
    xpReward: 320,
    prerequisiteNodeId: 'ch-3'
  },
  {
    id: 'ch-5',
    title: 'Direitos Humanos & Geopolítica Global (Boss)',
    area: 'Ciências Humanas e suas Tecnologias',
    gradeLevel: '3º ano',
    difficulty: 'desafio_tri',
    stepNumber: 5,
    stageName: 'Fase 4: Domínio Avançado & Simulado TRI',
    bnccSkill: 'EM13CHS304',
    description: 'Conflitos globais contemporâneos, fluxos migratórios e a Constituição Cidadã de 1988.',
    summaryKeyPoints: [
      'Constituição de 1988: ampliação dos direitos fundamentais e dignidade da pessoa humana',
      'Crise dos refugiados e xenofobia no mundo pós-Guerra Fria',
      'Desafios socioambientais dos povos originários e comunidades tradicionais'
    ],
    status: 'bloqueado',
    progressPercent: 0,
    totalQuestions: 15,
    completedQuestions: 0,
    xpReward: 500,
    isBossMilestone: true,
    badge: {
      name: 'Embaixador dos Direitos Humanos',
      icon: '🌐',
      description: 'Conquistou maestria nas questões interdisciplinares de Ciências Humanas!'
    },
    prerequisiteNodeId: 'ch-4'
  },

  // =========================================================================
  // LINGUAGENS, CÓDIGOS E SUAS TECNOLOGIAS (Trilha Progressiva)
  // =========================================================================
  {
    id: 'lc-1',
    title: 'Gêneros Textuais & Intencionalidade Discursiva',
    area: 'Linguagens, Códigos e suas Tecnologias',
    gradeLevel: '1º ano',
    difficulty: 'basico',
    stepNumber: 1,
    stageName: 'Fase 1: Leitura Crítica & Gêneros',
    bnccSkill: 'EM13LP01',
    description: 'Identificação de texto publicitário, crônica, notícia, cartum e estratégias de persuasão.',
    summaryKeyPoints: [
      'A função social do texto e seu público-alvo presumido',
      'Articulação entre linguagem verbal e não-verbal em cartuns e infográficos',
      'Reconhecimento da tese central e argumentos de sustentação'
    ],
    status: 'conquistado',
    progressPercent: 100,
    accuracyPercent: 91,
    totalQuestions: 10,
    completedQuestions: 10,
    xpReward: 150,
    unlockedAt: '2026-09-01',
    completedAt: '2026-09-10',
    badge: {
      name: 'Leitor Perspicaz',
      icon: '📖',
      description: 'Decifrou intencionalidades discursivas em múltiplos gêneros do ENEM!'
    }
  },
  {
    id: 'lc-2',
    title: 'Figuras de Linguagem & Recursos Expressivos',
    area: 'Linguagens, Códigos e suas Tecnologias',
    gradeLevel: '1º ano',
    difficulty: 'basico',
    stepNumber: 2,
    stageName: 'Fase 1: Leitura Crítica & Gêneros',
    bnccSkill: 'EM13LP02',
    description: 'Metáfora, metonímia, antítese, ironia, paradoxo e efeitos de sentido no poema e na prosa.',
    summaryKeyPoints: [
      'Metáfora e comparação: transferência de sentido por analogia',
      'Gradação e hipérbole como intensificadores dramáticos ou argumentativos',
      'Ironia como crítica social ou subversão de expectativas'
    ],
    status: 'conquistado',
    progressPercent: 100,
    accuracyPercent: 88,
    totalQuestions: 10,
    completedQuestions: 10,
    xpReward: 150,
    unlockedAt: '2026-09-11',
    completedAt: '2026-09-22',
    badge: {
      name: 'Mestre da Metáfora',
      icon: '🎭',
      description: 'Identificou recursos estilísticos e conotações nos textos do ENEM!'
    },
    prerequisiteNodeId: 'lc-1'
  },
  {
    id: 'lc-3',
    title: 'Realismo, Naturalismo & Machado de Assis',
    area: 'Linguagens, Códigos e suas Tecnologias',
    gradeLevel: '2º ano',
    difficulty: 'intermediario',
    stepNumber: 3,
    stageName: 'Fase 2: Literatura & Estética',
    bnccSkill: 'EM13LP46',
    description: 'Ruptura com o Romantismo, autor defunto, ironia machadiana e crítica aos costumes.',
    summaryKeyPoints: [
      'Machado de Assis e Memórias Póstumas: narrador não confiável e humor reflexivo',
      'Desconstrução da hipocrisia e das convenções da sociedade burguesa do séc. XIX',
      'Distinção do Naturalismo (zoomorfismo, determinismo biológico e social)'
    ],
    status: 'em_andamento',
    progressPercent: 40,
    accuracyPercent: 75,
    totalQuestions: 10,
    completedQuestions: 4,
    xpReward: 230,
    unlockedAt: '2026-09-23',
    prerequisiteNodeId: 'lc-2'
  },
  {
    id: 'lc-4',
    title: 'Sintaxe do Período Composto, Coesão & Crase',
    area: 'Linguagens, Códigos e suas Tecnologias',
    gradeLevel: '2º ano',
    difficulty: 'avancado',
    stepNumber: 4,
    stageName: 'Fase 3: Gramática & Competência 1',
    bnccSkill: 'EM13LP15',
    description: 'Conectivos interparágrafos, regência verbal/nominal e domínio da norma culta formal.',
    summaryKeyPoints: [
      'Orações coordenadas adversativas e o emprego obrigatório da pontuação',
      'Regras prohibitivas de crase: antes de verbos, palavras masculinas e pronomes indefinidos',
      'Paralelismo sintático e coesão sequencial de alto impacto'
    ],
    status: 'bloqueado',
    progressPercent: 0,
    totalQuestions: 12,
    completedQuestions: 0,
    xpReward: 320,
    prerequisiteNodeId: 'lc-3'
  },
  {
    id: 'lc-5',
    title: 'Modernismo Brasileiro & Vanguardas Europeias (Boss)',
    area: 'Linguagens, Códigos e suas Tecnologias',
    gradeLevel: '3º ano',
    difficulty: 'desafio_tri',
    stepNumber: 5,
    stageName: 'Fase 4: Domínio Avançado & Simulado TRI',
    bnccSkill: 'EM13LP48',
    description: 'Semana de Arte Moderna de 1922, Antropofagia, geração de 30 (Drummond, Graciliano) e poesia social.',
    summaryKeyPoints: [
      'Ruptura radical com o parnasianismo e valorização da identidade nacional e da oralidade',
      'Manifesto Antropófago: deglutição da cultura estrangeira para criar arte autenticamente brasileira',
      'Poesia de combate e romance regionalista da geração de 1930'
    ],
    status: 'bloqueado',
    progressPercent: 0,
    totalQuestions: 15,
    completedQuestions: 0,
    xpReward: 500,
    isBossMilestone: true,
    badge: {
      name: 'Antropófago Modernista',
      icon: '🌟',
      description: 'Conquistou a vanguarda e o domínio estético máximo em Linguagens!'
    },
    prerequisiteNodeId: 'lc-4'
  }
];

export const INITIAL_LEARNING_PATH_PROGRESS: LearningPathProgress = {
  totalXp: 1840,
  currentLevel: 4,
  levelTitle: 'Explorador Audaz do ENEM',
  streakDays: 6,
  conqueredMilestonesCount: 9,
  totalMilestonesCount: 24,
  activeNodeId: 'cn-4'
};
