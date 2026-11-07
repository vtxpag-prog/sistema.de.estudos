import { ClassTopicDiagnostic, GradeLevel, KnowledgeArea, ReinforcementListRecord } from '../types';

export const CLASS_TOPIC_DIAGNOSTICS: Record<string, ClassTopicDiagnostic[]> = {
  // 1º Ano A - Matutino (34 alunos)
  'class-1a': [
    {
      id: 'diag-101',
      topic: 'Cinemática Escalar e Equação de Torricelli',
      area: 'Ciências da Natureza e suas Tecnologias',
      gradeLevel: '1º ano',
      bnccSkill: 'EM13CNT301',
      accuracyRate: 38,
      errorRate: 62,
      strugglingCount: 21,
      totalAssessed: 34,
      severity: 'critico',
      mainMisconceptions: [
        'Confusão entre velocidade média e instantânea em trajetórias retilíneas',
        'Erro na conversão de unidades (km/h para m/s multiplicando por 3,6 em vez de dividir)',
        'Dificuldade em identificar quando o termo v₀² é nulo partindo do repouso'
      ],
      pedagogicalInsight:
        'A turma aplica a fórmula mecanicamente. Recomenda-se trabalhar primeiro a interpretação física de enunciados com números inteiros antes de propor cálculos com raízes não exatas.',
      suggestedQuestionsCount: 8,
      reinforcementListSuggestion: {
        title: 'Lista de Reforço: Cinemática & Equação de Torricelli Passo a Passo',
        focusDescription: 'Exercícios guiados com ênfase em leitura de grandezas e conversão de unidades sem sobressaltos.',
        suggestedQuestionsCount: 8,
        proportionNote: '70% exercícios diretos de fixação + 20% contextualizados + 10% padrão ENEM',
        neuroinclusiveAdaptations: [
          'Enunciados com dados destacados em caixas visuais',
          'Tópicos objetivos sem metáforas para estudantes com TEA',
          'Divisão do cálculo em 3 etapas sequenciais numeradas'
        ]
      }
    },
    {
      id: 'diag-102',
      topic: 'Função do 1º Grau e Modelagem de Custos',
      area: 'Matemática e suas Tecnologias',
      gradeLevel: '1º ano',
      bnccSkill: 'EM13MAT101',
      accuracyRate: 44,
      errorRate: 56,
      strugglingCount: 19,
      totalAssessed: 34,
      severity: 'critico',
      mainMisconceptions: [
        'Inversão entre coeficiente angular (taxa variável) e coeficiente linear (custo fixo)',
        'Dificuldade em isolar a incógnita ao resolver f(x) = k em problemas do cotidiano',
        'Interpretação do ponto de interseção com os eixos cartesianos'
      ],
      pedagogicalInsight:
        '60% dos estudantes acertam o gráfico, mas erram a tradução da linguagem verbal para a equação matemática algébrica.',
      suggestedQuestionsCount: 8,
      reinforcementListSuggestion: {
        title: 'Lista de Reforço: Funções Afins e Situações-Problema Cotidianas',
        focusDescription: 'Modelagem de planos telefônicos, corridas por aplicativo e cooperativas comunitárias.',
        suggestedQuestionsCount: 8,
        proportionNote: '65% modelagem básica + 25% interpretação gráfica + 10% interdisciplinar',
        neuroinclusiveAdaptations: [
          'Destaque com cores para o valor fixo vs. valor por unidade',
          'Instruções curtas sem textos prolixos para evitar fadiga em TDAH',
          'Calculadora pedagógica de apoio opcional'
        ]
      }
    },
    {
      id: 'diag-103',
      topic: 'Grécia Antiga e Democracia Ateniense',
      area: 'Ciências Humanas e suas Tecnologias',
      gradeLevel: '1º ano',
      bnccSkill: 'EM13CHS101',
      accuracyRate: 50,
      errorRate: 50,
      strugglingCount: 17,
      totalAssessed: 34,
      severity: 'critico',
      mainMisconceptions: [
        'Suposição ingênua de que a democracia ateniense era inclusiva para toda a população',
        'Confusão entre a condição jurídica dos metecos (estrangeiros livres) e dos escravizados',
        'Anacronismo ao comparar a Ágora ateniense com os parlamentos representativos modernos'
      ],
      pedagogicalInsight:
        'Metade da turma tende a escolher alternativas que usam palavras idealistas como "igualdade universal" sem atentar para o recorte censitário de gênero e origem social.',
      suggestedQuestionsCount: 6,
      reinforcementListSuggestion: {
        title: 'Lista de Reforço: Democracia Ateniense vs. Cidadania Contemporânea',
        focusDescription: 'Análise de fontes históricas e quadros comparativos sobre exclusão e direitos políticos.',
        suggestedQuestionsCount: 6,
        proportionNote: '70% fixação conceitual + 30% questões clássicas do ENEM com textos de apoio',
        neuroinclusiveAdaptations: [
          'Quadro sinóptico de inclusos vs excluídos em formato de tabela',
          'Glossário explicativo de termos históricos (metecos, pólis, ágora)',
          'Opção de narração por voz para estudantes com dislexia'
        ]
      }
    },
    {
      id: 'diag-104',
      topic: 'Citologia e Papel do Retículo Endoplasmático',
      area: 'Ciências da Natureza e suas Tecnologias',
      gradeLevel: '1º ano',
      bnccSkill: 'EM13CNT202',
      accuracyRate: 68,
      errorRate: 32,
      strugglingCount: 11,
      totalAssessed: 34,
      severity: 'atencao',
      mainMisconceptions: [
        'Diferenciação entre síntese de lipídios (liso) e síntese de proteínas (rugoso)',
        'Confusão entre secreção celular e excreção celular'
      ],
      pedagogicalInsight:
        'Tópico em evolução positiva, com dúvidas concentradas na rota de exportação com o Complexo Golgiense.',
      suggestedQuestionsCount: 5,
      reinforcementListSuggestion: {
        title: 'Lista de Reforço: Organelas Celulares e Rota de Secreção',
        focusDescription: 'Fixação de organelas membranosas e suas funções fisiológicas principais.',
        suggestedQuestionsCount: 5,
        proportionNote: '80% identificação direta de função + 20% situações fisiológicas reais',
        neuroinclusiveAdaptations: [
          'Ilustrações celulares esquemáticas de alto contraste',
          'Linguagem direta com 1 organela por bloco de estudo'
        ]
      }
    },
    {
      id: 'diag-105',
      topic: 'Figuras de Linguagem e Gênero Publicitário',
      area: 'Linguagens, Códigos e suas Tecnologias',
      gradeLevel: '1º ano',
      bnccSkill: 'EM13LP01',
      accuracyRate: 82,
      errorRate: 18,
      strugglingCount: 6,
      totalAssessed: 34,
      severity: 'consolidado',
      mainMisconceptions: [
        'Diferenciar pontualmente metáfora de metonímia em campanhas visuais'
      ],
      pedagogicalInsight:
        'Habilidade bem consolidada na turma, servindo de alavanca motivacional e autoeficácia acadêmica.',
      suggestedQuestionsCount: 5,
      reinforcementListSuggestion: {
        title: 'Lista de Manutenção: Recursos Expressivos na Propaganda Social',
        focusDescription: 'Manutenção de repertório interpretativo com foco em campanhas de saúde pública.',
        suggestedQuestionsCount: 5,
        proportionNote: '50% interpretação de texto misto + 50% formato ENEM',
        neuroinclusiveAdaptations: ['Descrição textual alternativa das imagens publicitárias']
      }
    }
  ],

  // 2º Ano B - Vespertino (38 alunos)
  'class-2b': [
    {
      id: 'diag-201',
      topic: 'Termodinâmica, Ciclo de Carnot e 2ª Lei',
      area: 'Ciências da Natureza e suas Tecnologias',
      gradeLevel: '2º ano',
      bnccSkill: 'EM13CNT102',
      accuracyRate: 34,
      errorRate: 66,
      strugglingCount: 25,
      totalAssessed: 38,
      severity: 'critico',
      mainMisconceptions: [
        'Acreditar que uma máquina térmica pode atingir 100% de rendimento (violação da 2ª Lei)',
        'Erro na aplicação de calor fornecido pela fonte quente vs rejeitado para a fonte fria: Q₁ = W + Q₂',
        'Confusão no cálculo de rendimento η = 1 - (T₂ / T₁) usando temperatura em Celsius em vez de Kelvin'
      ],
      pedagogicalInsight:
        'Alerta Crítico Máximo: Mais de 65% dos estudantes cometem o erro grave de usar temperatura em °C na fórmula de Carnot, invalidando as respostas.',
      suggestedQuestionsCount: 10,
      reinforcementListSuggestion: {
        title: 'Lista de Reforço Prioritário: Termodinâmica & Máquinas Térmicas no ENEM',
        focusDescription: 'Treino intensivo da conversão de escala termométrica absoluta e balanço energético da 1ª e 2ª leis.',
        suggestedQuestionsCount: 10,
        proportionNote: '70% exercícios conceituais guiados + 20% cálculos passo a passo + 10% TRI avançada',
        neuroinclusiveAdaptations: [
          'Alerta visual piscante "Sempre converta para Kelvin (+273) antes de calcular"',
          'Divisão da resolução em 4 cartões com progresso visual',
          'Enunciados com esquemas térmicos em cores padronizadas (vermelho = quente, azul = frio)'
        ]
      }
    },
    {
      id: 'diag-202',
      topic: 'Estatística Descritiva: Médias Ponderadas e Mediana',
      area: 'Matemática e suas Tecnologias',
      gradeLevel: '2º ano',
      bnccSkill: 'EM13MAT402',
      accuracyRate: 42,
      errorRate: 58,
      strugglingCount: 22,
      totalAssessed: 38,
      severity: 'critico',
      mainMisconceptions: [
        'Cálculo de mediana sem ordenar os dados previamente em Rol crescente/decrescente',
        'Confusão entre a soma dos pesos e o número de classes ao calcular a média ponderada',
        'Interpretação errônea de mediana em conjuntos com número par de termos'
      ],
      pedagogicalInsight:
        'Mais da metade da turma erra questões de mediana em tabelas de frequência acumulada porque não ordena o rol antes de extrair o termo central.',
      suggestedQuestionsCount: 8,
      reinforcementListSuggestion: {
        title: 'Lista de Reforço: Estatística Básica, Média Ponderada e Mediana ENEM',
        focusDescription: 'Exercícios práticos com tabelas do IBGE, notas de simulados e pirâmides etárias.',
        suggestedQuestionsCount: 8,
        proportionNote: '70% organização de Rol e cálculo mecânico + 20% análise de tabelas + 10% interpretação gráfica',
        neuroinclusiveAdaptations: [
          'Dica mnemônica fixa: "Passo 1: Sempre organize em ordem crescente"',
          'Tabelas com espaçamento duplo para alunos com dislexia e baixa acuidade',
          'Opção de marcar com cor os termos já ordenados'
        ]
      }
    },
    {
      id: 'diag-203',
      topic: 'Le Chatelier e Deslocamento do Equilíbrio Químico',
      area: 'Ciências da Natureza e suas Tecnologias',
      gradeLevel: '2º ano',
      bnccSkill: 'EM13CNT205',
      accuracyRate: 48,
      errorRate: 52,
      strugglingCount: 20,
      totalAssessed: 38,
      severity: 'critico',
      mainMisconceptions: [
        'Achar que o catalisador altera o rendimento ou desloca a posição do equilíbrio químico',
        'Dificuldade em prever o efeito do aumento de pressão sobre o lado de menor volume gasoso',
        'Confusão no impacto da variação de temperatura em reações endotérmicas vs exotérmicas'
      ],
      pedagogicalInsight:
        '52% da turma apresenta bloqueio conceitual em prever o sentido do deslocamento (esquerda ou direita). Analogia de compensação da gangorra é altamente recomendada.',
      suggestedQuestionsCount: 8,
      reinforcementListSuggestion: {
        title: 'Lista de Reforço: Princípio de Le Chatelier & Fatores de Equilíbrio',
        focusDescription: 'Regras práticas de temperatura, pressão e concentração aplicadas a sínteses industriais (Haber-Bosch).',
        suggestedQuestionsCount: 8,
        proportionNote: '60% identificação qualitativa de sentido + 30% gráficos de concentração + 10% ENEM',
        neuroinclusiveAdaptations: [
          'Ícones de seta visual indicando sentido de deslocamento (⬅️ ou ➡️)',
          'Estrutura em tópicos "Se aumenta X ➔ sistema faz o oposto"',
          'Ausência de pegadinhas linguísticas'
        ]
      }
    },
    {
      id: 'diag-204',
      topic: 'Cidadania e Direitos Sociais na Era Vargas',
      area: 'Ciências Humanas e suas Tecnologias',
      gradeLevel: '2º ano',
      bnccSkill: 'EM13CHS201',
      accuracyRate: 71,
      errorRate: 29,
      strugglingCount: 11,
      totalAssessed: 38,
      severity: 'consolidado',
      mainMisconceptions: [
        'Diferenciar cidadania regulada (Wanderley Guilherme) do conceito clássico de cidadania plena'
      ],
      pedagogicalInsight:
        'A turma compreende bem a CLT e a propaganda do DIP. Pequeno reforço focado apenas nas limitações do voto rural.',
      suggestedQuestionsCount: 5,
      reinforcementListSuggestion: {
        title: 'Lista de Consolidação: Estado Novo, CLT e Propaganda Política',
        focusDescription: 'Análise de cartazes da Era Vargas e charges de época.',
        suggestedQuestionsCount: 5,
        proportionNote: '80% interpretação de documentos históricos + 20% síntese',
        neuroinclusiveAdaptations: ['Cartazes históricos com transcrição em áudio']
      }
    },
    {
      id: 'diag-205',
      topic: 'Coesão Interparágrafos e Operadores Argumentativos',
      area: 'Linguagens, Códigos e suas Tecnologias',
      gradeLevel: '2º ano',
      bnccSkill: 'EM13LP05',
      accuracyRate: 76,
      errorRate: 24,
      strugglingCount: 9,
      totalAssessed: 38,
      severity: 'consolidado',
      mainMisconceptions: [
        'Repetição dos mesmos conectivos (além disso, portanto) em todos os parágrafos'
      ],
      pedagogicalInsight:
        'Boa estrutura argumentativa na redação. Oportunidade de enriquecer o repertório de operadores adversativos e conclusivos.',
      suggestedQuestionsCount: 5,
      reinforcementListSuggestion: {
        title: 'Oficina de Conectivos para Redação Nota 1000',
        focusDescription: 'Exercícios práticos de substituição de conectivos com manutenção de sentido.',
        suggestedQuestionsCount: 5,
        proportionNote: '100% focado na Competência 4 da Redação ENEM',
        neuroinclusiveAdaptations: ['Tabela visual de conectivos classificados por valor semântico']
      }
    }
  ],

  // 3º Ano C - Regular Integral (41 alunos)
  'class-3c': [
    {
      id: 'diag-301',
      topic: 'Eletrodinâmica: Circuitos Mistos e Leis de Kirchhoff',
      area: 'Ciências da Natureza e suas Tecnologias',
      gradeLevel: '3º ano',
      bnccSkill: 'EM13CNT308',
      accuracyRate: 36,
      errorRate: 64,
      strugglingCount: 26,
      totalAssessed: 41,
      severity: 'critico',
      mainMisconceptions: [
        'Identificar erroneamente ramos em paralelo como se estivessem em série',
        'Confusão no cálculo da resistência equivalente quando há fio em curto-circuito',
        'Cálculo de potência elétrica dissipada P = U²/R quando a tensão não é constante'
      ],
      pedagogicalInsight:
        'Dificuldade crítica para 63.4% da turma. A representação esquemática dos nós gera sobrecarga visual em alunos neurodivergentes e insegurança nos cálculos.',
      suggestedQuestionsCount: 10,
      reinforcementListSuggestion: {
        title: 'Lista de Reforço Urgente: Circuitos Elétricos, Nós e Potência no ENEM',
        focusDescription: 'Método visual das letras nos nós para simplificação de malhas e cálculo de consumo em kWh.',
        suggestedQuestionsCount: 10,
        proportionNote: '70% simplificação de circuitos por nós + 20% consumo doméstico + 10% interdisciplinar',
        neuroinclusiveAdaptations: [
          'Marcação dos nós com círculos coloridos (A em vermelho, B em azul)',
          'Passo a passo com no máximo 2 operações matemáticas por tela',
          'Tabelas de apoio com as 3 fórmulas de potência (P=Ui, P=Ri², P=U²/R)'
        ]
      }
    },
    {
      id: 'diag-302',
      topic: 'Geometria Espacial: Troncos e Relação de Áreas e Volumes',
      area: 'Matemática e suas Tecnologias',
      gradeLevel: '3º ano',
      bnccSkill: 'EM13MAT309',
      accuracyRate: 40,
      errorRate: 60,
      strugglingCount: 25,
      totalAssessed: 41,
      severity: 'critico',
      mainMisconceptions: [
        'Esquecer que a razão de áreas varia com k² e a de volumes varia com k³',
        'Dificuldade na visualização tridimensional de cortes em pirâmides e cones',
        'Confusão entre geratriz, raio e altura nos cálculos de sólidos de revolução'
      ],
      pedagogicalInsight:
        '60% dos estudantes erram a questão clássica de encher copos cônicos porque usam proporção linear direta de volume em vez de cúbica.',
      suggestedQuestionsCount: 8,
      reinforcementListSuggestion: {
        title: 'Lista de Reforço: Geometria Espacial e Razão de Semelhança (k, k², k³)',
        focusDescription: 'Situações concretas de reservatórios, embalagens e recipientes comerciais.',
        suggestedQuestionsCount: 8,
        proportionNote: '70% sólidos fundamentais + 20% troncos práticos + 10% problemas de otimização ENEM',
        neuroinclusiveAdaptations: [
          'Vistas ortogonais claras (vista superior e frontal) ao lado de cada sólido 3D',
          'Enunciados diretos sem digressões ou metáforas poéticas',
          'Régua de fórmulas com ilustrações geométricas correspondentes'
        ]
      }
    },
    {
      id: 'diag-303',
      topic: 'Genética Mendeliana e Heredogramas Familiares',
      area: 'Ciências da Natureza e suas Tecnologias',
      gradeLevel: '3º ano',
      bnccSkill: 'EM13CNT203',
      accuracyRate: 46,
      errorRate: 54,
      strugglingCount: 22,
      totalAssessed: 41,
      severity: 'critico',
      mainMisconceptions: [
        'Cálculo de probabilidade conjunta esquecendo de multiplicar pelo sexo da criança (1/2)',
        'Dificuldade em identificar se um padrão de herança é autossômico recessivo ou dominante a partir de pais iguais com filhos diferentes',
        'Confusão na interpretação de indivíduos heterozigotos portadores assintomáticos'
      ],
      pedagogicalInsight:
        'O erro mais comum (presente em 78% das folhas de cálculo) é não identificar o cruzamento de casal com mesmo fenótipo gerando filho com fenótipo diferente (recessivo).',
      suggestedQuestionsCount: 8,
      reinforcementListSuggestion: {
        title: 'Lista de Reforço: Heredogramas, Genótipos e Probabilidade Genética ENEM',
        focusDescription: 'Exercícios práticos de aconselhamento genético e identificação visual de padrões.',
        suggestedQuestionsCount: 8,
        proportionNote: '65% identificação de genótipos + 25% probabilidade simples e composta + 10% doenças raras',
        neuroinclusiveAdaptations: [
          'Legenda visual fixa em todos os exercícios (quadrado = homem, círculo = mulher, preto = afetado)',
          'Espaço extra para rascunho do quadro de Punnett',
          'Linguagem direta com passos numerados para análise de genealogia'
        ]
      }
    },
    {
      id: 'diag-304',
      topic: 'Sintaxe da Oração e Pontuação Formal (Competência 1)',
      area: 'Linguagens, Códigos e suas Tecnologias',
      gradeLevel: '3º ano',
      bnccSkill: 'EM13LP02',
      accuracyRate: 65,
      errorRate: 35,
      strugglingCount: 14,
      totalAssessed: 41,
      severity: 'atencao',
      mainMisconceptions: [
        'Emprego incorreto de vírgula separando sujeito e predicado',
        'Truncamento sintático em períodos subordinados muito extensos'
      ],
      pedagogicalInsight:
        'A maioria escreve bem, mas pontua com base na "respiração" oral em vez das regras sintáticas formais.',
      suggestedQuestionsCount: 6,
      reinforcementListSuggestion: {
        title: 'Lista de Reforço: Pontuação e Sintaxe Fina para a Competência 1',
        focusDescription: 'Treino de reescrita e identificação de truncamento frasal no texto dissertativo.',
        suggestedQuestionsCount: 6,
        proportionNote: '70% exercícios de pontuação orientada + 30% análise de trechos reais de redação',
        neuroinclusiveAdaptations: ['Exemplos com destaque em negrito da oração principal']
      }
    },
    {
      id: 'diag-305',
      topic: 'Revolução Industrial e Divisão Internacional do Trabalho',
      area: 'Ciências Humanas e suas Tecnologias',
      gradeLevel: '3º ano',
      bnccSkill: 'EM13CHS103',
      accuracyRate: 80,
      errorRate: 20,
      strugglingCount: 8,
      totalAssessed: 41,
      severity: 'consolidado',
      mainMisconceptions: [
        'Diferenciar pontualmente Taylorismo, Fordismo e Toyotismo em modelos de produção'
      ],
      pedagogicalInsight:
        'Excelente retenção histórica. Turma apta a articular o tema como repertório sociocultural na redação.',
      suggestedQuestionsCount: 5,
      reinforcementListSuggestion: {
        title: 'Lista de Aprofundamento: Modelos Produtivos e Impactos Socioespaciais',
        focusDescription: 'Questões interdisciplinares ligando geografia industrial e sociologia do trabalho.',
        suggestedQuestionsCount: 5,
        proportionNote: '100% questões de nível médio e difícil do ENEM',
        neuroinclusiveAdaptations: ['Linha do tempo visual integrada com marcos industriais']
      }
    }
  ]
};

// Funções utilitárias de diagnóstico para o professor
export function getClassDiagnostics(classId: string): ClassTopicDiagnostic[] {
  return CLASS_TOPIC_DIAGNOSTICS[classId] || CLASS_TOPIC_DIAGNOSTICS['class-1a'] || [];
}

export function getClassDiagnosticSummary(classId: string) {
  const diagnostics = getClassDiagnostics(classId);
  const totalTopics = diagnostics.length;
  const criticalTopics = diagnostics.filter((d) => d.severity === 'critico');
  const warningTopics = diagnostics.filter((d) => d.severity === 'atencao');
  const consolidatedTopics = diagnostics.filter((d) => d.severity === 'consolidado');

  const averageAccuracy = Math.round(
    diagnostics.reduce((acc, curr) => acc + curr.accuracyRate, 0) / (totalTopics || 1)
  );

  const highestDifficultyTopic = [...diagnostics].sort((a, b) => a.accuracyRate - b.accuracyRate)[0];

  return {
    totalTopics,
    criticalCount: criticalTopics.length,
    warningCount: warningTopics.length,
    consolidatedCount: consolidatedTopics.length,
    averageAccuracy,
    highestDifficultyTopic,
    criticalTopics,
    warningTopics,
    consolidatedTopics
  };
}
