import { AutomaticFlashcard, StudentWrongAnswer } from '../types';

// Data de hoje formatada em YYYY-MM-DD
const today = new Date().toISOString().split('T')[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
const inThreeDays = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0];
const inSevenDays = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

export const INITIAL_WRONG_ANSWERS: StudentWrongAnswer[] = [
  {
    id: 'wa-1',
    questionId: 'q-101',
    questionTitle: 'Na física clássica estudada no 1º ano do Ensino Médio, um veículo parte do repouso e mantém aceleração escalar constante de 2 m/s² em uma via reta. Um estudante deseja calcular a velocidade do veículo após percorrer uma distância de 100 metros. Qual é o valor aproximado dessa velocidade?',
    area: 'Ciências da Natureza e suas Tecnologias',
    gradeLevel: '1º ano',
    topic: 'Cinemática Escalar e Equação de Torricelli',
    bnccSkill: 'EM13CNT301',
    studentChoice: 0, // escolheu 10 m/s
    correctAnswer: 1, // correto é 20 m/s
    options: ['10 m/s', '20 m/s', '25 m/s', '40 m/s', '50 m/s'],
    explanation: 'Aplicando a Equação de Torricelli: v² = v₀² + 2·a·Δs. Como o veículo parte do repouso (v₀ = 0), temos: v² = 0 + 2 · (2 m/s²) · (100 m) = 400. Logo, v = √400 = 20 m/s.',
    dateAnswered: yesterday,
    flashcardGenerated: true,
  },
  {
    id: 'wa-2',
    questionId: 'q-202',
    questionTitle: 'Em Química do 2º ano, o Princípio de Le Chatelier descreve o comportamento de sistemas em equilíbrio químico quando submetidos a perturbações externas. Para a síntese da amônia (N₂ + 3H₂ ⇌ 2NH₃ + calor), o aumento da pressão sobre o sistema provoca:',
    area: 'Ciências da Natureza e suas Tecnologias',
    gradeLevel: '2º ano',
    topic: 'Equilíbrio Químico e Le Chatelier',
    bnccSkill: 'EM13CNT104',
    studentChoice: 0, // errou achando que desloca pra esquerda
    correctAnswer: 1, // correto é deslocamento para a direita
    options: [
      'Deslocamento do equilíbrio para a esquerda, favorecendo os reagentes gasosos.',
      'Deslocamento do equilíbrio para a direita, favorecendo a formação de amônia (menor volume gasoso).',
      'Inativação completa da reação por congelamento cinético.',
      'Nenhuma alteração, pois a pressão só altera reações em meio líquido.',
      'Aumento da constante de equilíbrio sem alterar concentrações.'
    ],
    explanation: 'No lado dos reagentes temos 1 + 3 = 4 mols de gás. No lado do produto temos 2 mols de gás. O aumento de pressão desloca o equilíbrio para o lado de menor volume gasoso (lado direito, formando mais NH₃).',
    dateAnswered: yesterday,
    flashcardGenerated: true,
  },
  {
    id: 'wa-3',
    questionId: 'q-103',
    questionTitle: 'Na Grécia Antiga, o modelo de cidadania desenvolvido na pólis de Atenas durante o século V a.C. distinguia-se por valorizar o debate direto na Ágora. No entanto, esse sistema democrático era excludente em sua base porque:',
    area: 'Ciências Humanas e suas Tecnologias',
    gradeLevel: '1º ano',
    topic: 'Grécia Antiga e Democracia Ateniense',
    bnccSkill: 'EM13CHS101',
    studentChoice: 3, // marcou voto censitário
    correctAnswer: 1, // homens livres, filhos de pais atenienses
    options: [
      'Exigia a aprovação prévia de monarcas espartanos para cada decisão tomada.',
      'Concedia direito de voto apenas a homens livres, filhos de pais atenienses e maiores de idade, excluindo mulheres, escravizados e estrangeiros.',
      'Permitia somente que generais das guerras médicas exercessem funções públicas.',
      'Adotava voto censitário baseado na produção de ouro e prata.',
      'Proibia comerciantes e artesãos de comparecerem às praças públicas.'
    ],
    explanation: 'A democracia ateniense era direta para os cidadãos, porém extremamente restrita: mulheres, metecos (estrangeiros) e pessoas escravizadas não possuíam direitos políticos.',
    dateAnswered: yesterday,
    flashcardGenerated: false,
  },
  {
    id: 'wa-4',
    questionId: 'q-104',
    questionTitle: 'No 1º ano de Matemática, as Funções Afins f(x) = ax + b modelam situações do dia a dia. Uma cooperativa de catadores recebe um valor fixo de R$ 50,00 por dia mais R$ 1,50 por cada kg de papelão recolhido. Para obter R$ 140,00, a cooperativa precisará recolher:',
    area: 'Matemática e suas Tecnologias',
    gradeLevel: '1º ano',
    topic: 'Função Afim e Equações de 1º Grau',
    bnccSkill: 'EM13MAT101',
    studentChoice: 1, // calculou 50 kg por engano
    correctAnswer: 2, // 60 kg
    options: ['45 kg de papelão', '50 kg de papelão', '60 kg de papelão', '75 kg de papelão', '90 kg de papelão'],
    explanation: 'Equação: 140 = 50 + 1,50 · x => 1,50 · x = 140 - 50 = 90 => x = 90 / 1,5 = 60 kg.',
    dateAnswered: today,
    flashcardGenerated: false,
  },
  {
    id: 'wa-5',
    questionId: 'q-105',
    questionTitle: '(ENEM Adaptado) Textos publicitários institucionais frequentemente empregam recursos verbais e visuais para conscientizar sobre a preservação ambiental. Em uma campanha do Ministério do Meio Ambiente, a frase "Gota a gota, o futuro seca" utiliza qual figura de linguagem e efeito expressivo principal?',
    area: 'Linguagens, Códigos e suas Tecnologias',
    gradeLevel: '1º ano',
    topic: 'Figuras de Linguagem e Gênero Publicitário',
    bnccSkill: 'EM13LP01',
    studentChoice: 4, // achou antítese
    correctAnswer: 1, // Metáfora e gradação
    options: [
      'Ironia, com o objetivo de ridicularizar os consumidores residenciais de água.',
      'Metáfora e gradação, alertando para o esgotamento progressivo do recurso hídrico.',
      'Eufemismo, para suavizar a gravidade da seca nos grandes centros urbanos.',
      'Pleonasmo redundante, sem finalidade persuasiva.',
      'Antítese semântica sem relação com o tema ambiental.'
    ],
    explanation: 'A expressão "gota a gota" constrói uma gradação temporal e a metáfora do "futuro secando" enfatiza a urgência da crise hídrica.',
    dateAnswered: today,
    flashcardGenerated: false,
  }
];

export const INITIAL_FLASHCARDS: AutomaticFlashcard[] = [
  {
    id: 'fc-1',
    questionId: 'q-101',
    sourceQuestionTitle: 'Na física clássica, um veículo parte do repouso e mantém aceleração escalar de 2 m/s² por 100m...',
    area: 'Ciências da Natureza e suas Tecnologias',
    topic: 'Cinemática Escalar e Equação de Torricelli',
    keyConcept: 'Equação de Torricelli (MUV sem Tempo)',
    front: 'Quando uma questão de MUV fornece distância e aceleração, mas NÃO informa nem pede o tempo (t), qual fórmula fundamental você deve aplicar imediatamente?',
    back: 'Equação de Torricelli: v² = v₀² + 2·a·Δs.\n\n• v = velocidade final\n• v₀ = velocidade inicial\n• a = aceleração escalar\n• Δs = variação de espaço\n\nSe o móvel parte do repouso, v₀ = 0, simplificando para v = √(2·a·Δs).',
    mnemonicTip: '⚡ Pulo do Gato: "Sem tempo, irmão? Use Torricelli!" Guarde esse gatilho: se não há menção a segundos ou horas, é Torricelli na cabeça!',
    whyItWasWrong: 'Você errou calculando sem elevar a velocidade ao quadrado ou esquecendo de tirar a raiz quadrada de 400 no final.',
    boxLevel: 1,
    intervalDays: 1,
    nextReviewDate: today, // Pendente para revisar hoje!
    reviewCount: 1,
    consecutiveSuccesses: 0,
    status: 'para_revisar',
    createdAt: yesterday,
  },
  {
    id: 'fc-2',
    questionId: 'q-202',
    sourceQuestionTitle: 'Para a síntese da amônia (N₂ + 3H₂ ⇌ 2NH₃ + calor), o aumento da pressão provoca...',
    area: 'Ciências da Natureza e suas Tecnologias',
    topic: 'Equilíbrio Químico e Princípio de Le Chatelier',
    keyConcept: 'Princípio de Le Chatelier (Pressão vs Volume Gasoso)',
    front: 'Como a variação de PRESSÃO desloca um sistema químico gasoso em equilíbrio segundo Le Chatelier?',
    back: '• AUMENTO DE PRESSÃO: O sistema tenta aliviar o aperto se deslocando para o lado de MENOR número de mols gasosos (menor volume).\n\n• DIMINUIÇÃO DE PRESSÃO: O sistema se expande, deslocando-se para o lado de MAIOR número de mols gasosos (maior volume).',
    mnemonicTip: '🧠 Mnemônico: "Apertou (mais pressão)? Encolhe para onde tem menos gente (menos mols gasosos)!"',
    whyItWasWrong: 'Você confundiu os lados da equação: nos reagentes havia 4 mols (1 de N₂ + 3 de H₂) e no produto apenas 2 mols (2 de NH₃). Logo, mais pressão empurra para a direita!',
    boxLevel: 2,
    intervalDays: 3,
    nextReviewDate: inThreeDays,
    reviewCount: 2,
    consecutiveSuccesses: 1,
    status: 'aprendendo',
    createdAt: yesterday,
  },
  {
    id: 'fc-3',
    questionId: 'q-102',
    sourceQuestionTitle: 'Em células eucarióticas com intensa síntese proteica para exportação...',
    area: 'Ciências da Natureza e suas Tecnologias',
    topic: 'Citologia e Organelas Celulares',
    keyConcept: 'Retículo Endoplasmático Rugoso vs Liso',
    front: 'Qual é a diferença funcional crítica entre o Retículo Endoplasmático Rugoso (RER) e o Liso (REL)?',
    back: '• RER (Granuloso): Possui ribossomos aderidos à membrana. Fabrica PROTEÍNAS voltadas para exportação celular ou secreção.\n\n• REL (Não-granuloso): Não possui ribossomos. Sintetiza LIPÍDEOS (como hormônios esteroides) e atua na desintoxicação celular (fígado).',
    mnemonicTip: '🎯 Regra de Ouro: RER = Rugoso = Ribossomos = Proteínas para exportar. REL = Liso = Lipídeos & Limpeza de toxinas.',
    whyItWasWrong: 'Confusão comum de distrator no ENEM entre síntese de lipídeos (REL) e síntese de proteínas de exportação (RER).',
    boxLevel: 3,
    intervalDays: 7,
    nextReviewDate: inSevenDays,
    reviewCount: 3,
    consecutiveSuccesses: 2,
    status: 'aprendendo',
    createdAt: yesterday,
  },
  {
    id: 'fc-4',
    questionId: 'q-301',
    sourceQuestionTitle: 'Na Competência 1 do ENEM, qual o uso correto da crase antes de pronomes?',
    area: 'Linguagens, Códigos e suas Tecnologias',
    topic: 'Sintaxe e Emprego do Acento Grave (Crase)',
    keyConcept: 'Casos Proibidos de Crase no ENEM',
    front: 'Cite as 3 situações clássicas mais recorrentes no ENEM em que o uso do acento grave (crase) é EXPRESSAMENTE PROIBIDO.',
    back: '1. Diante de palavras masculinas (ex: "andar a pé", "pagar a prazo").\n2. Diante de verbos no infinitivo (ex: "começou a escrever", "disposto a lutar").\n3. Diante de pronomes que repelem artigo, como "ela", "você", "quem" e pronomes indefinidos (ex: "pediu a ela", "referiu-se a todos").',
    mnemonicTip: '✍️ Rima Didática: "Diante de homem não há crase! Diante de verbo, crase é falta grave!"',
    whyItWasWrong: 'Crase antes de verbo ou palavra masculina é o erro que mais desconta pontos na C1 da redação e nas questões de norma culta.',
    boxLevel: 4,
    intervalDays: 14,
    nextReviewDate: '2026-10-24',
    reviewCount: 4,
    consecutiveSuccesses: 4,
    status: 'dominado',
    createdAt: '2026-10-01',
  }
];
