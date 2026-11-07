import {
  Question,
  EssayTheme,
  ClassGroup,
  EducationalPartner,
  SchoolData,
  SimulationAttempt,
} from '../types';

export const INITIAL_QUESTIONS: Question[] = [
  // 1º ANO - CONTEÚDO 1º ANO (80% da trilha do 1º ano)
  {
    id: 'q-101',
    title: 'Na física clássica estudada no 1º ano do Ensino Médio, um veículo parte do repouso e mantém aceleração escalar constante de 2 m/s² em uma via reta. Um estudante deseja calcular a velocidade do veículo após percorrer uma distância de 100 metros. Qual é o valor aproximado dessa velocidade?',
    area: 'Ciências da Natureza e suas Tecnologias',
    gradeLevel: '1º ano',
    origin: 'Conteúdo Série',
    topic: 'Cinemática Escalar e Equação de Torricelli',
    bnccSkill: 'EM13CNT301',
    options: [
      '10 m/s',
      '20 m/s',
      '25 m/s',
      '40 m/s',
      '50 m/s'
    ],
    correctAnswer: 1,
    explanation: 'Aplicando a Equação de Torricelli: v² = v₀² + 2·a·Δs. Como o veículo parte do repouso (v₀ = 0), temos: v² = 0 + 2 · (2 m/s²) · (100 m) = 400. Logo, v = √400 = 20 m/s.',
    simplifiedTEA: 'Dado do problema: Início parado (0). Aceleração = 2. Distância = 100 metros. Fórmula: v² = 2 × 2 × 100 = 400. Resposta: raiz de 400 = 20 m/s.'
  },
  {
    id: 'q-102',
    title: 'No estudo de Citologia no 1º ano, as organelas celulares desempenham papéis fundamentais. Em células eucarióticas animais com intensa atividade de síntese proteica destinada à exportação (como células glandulares pancreáticas), nota-se um desenvolvimento expressivo de qual organela celular?',
    area: 'Ciências da Natureza e suas Tecnologias',
    gradeLevel: '1º ano',
    origin: 'Conteúdo Série',
    topic: 'Citologia e Organelas Celulares',
    bnccSkill: 'EM13CNT202',
    options: [
      'Retículo Endoplasmático Granuloso (Rugoso)',
      'Peroxissomo',
      'Centríolos',
      'Cloroplastos',
      'Vacúolo de suco celular'
    ],
    correctAnswer: 0,
    explanation: 'O Retículo Endoplasmático Rugoso (Granuloso) é coberto por ribossomos e é o principal responsável pela síntese de proteínas voltadas para secreção externa ou membranas.',
    simplifiedTEA: 'Pergunta direta: Qual parte da célula fabrica proteínas para enviar para fora? Resposta: Retículo Endoplasmático Rugoso (Granuloso).'
  },
  {
    id: 'q-103',
    title: 'Na Grécia Antiga, o modelo de cidadania desenvolvido na pólis de Atenas durante o século V a.C. distinguia-se por valorizar o debate direto na Ágora. No entanto, esse sistema democrático era excludente em sua base porque:',
    area: 'Ciências Humanas e suas Tecnologias',
    gradeLevel: '1º ano',
    origin: 'Conteúdo Série',
    topic: 'Grécia Antiga e Democracia Ateniense',
    bnccSkill: 'EM13CHS101',
    options: [
      'Exigia a aprovação prévia de monarcas espartanos para cada decisão tomada.',
      'Concedia direito de voto apenas a homens livres, filhos de pais atenienses e maiores de idade, excluindo mulheres, escravizados e estrangeiros.',
      'Permitia somente que generais das guerras médicas exercessem funções públicas.',
      'Adotava voto censitário baseado na produção de ouro e prata.',
      'Proibia comerciantes e artesãos de comparecerem às praças públicas.'
    ],
    correctAnswer: 1,
    explanation: 'A democracia ateniense era direta para os cidadãos, porém extremamente restrita: mulheres, metecos (estrangeiros) e pessoas escravizadas (a grande maioria da população) não possuíam direitos políticos.',
    simplifiedTEA: 'Fato histórico: Em Atenas antiga, apenas homens atenienses adultos livres votavam. Mulheres, estrangeiros e escravos não podiam votar.'
  },
  {
    id: 'q-104',
    title: 'No 1º ano de Matemática, as Funções Afins (1º grau) f(x) = ax + b modelam situações do dia a dia. Uma cooperativa de catadores de materiais recicláveis recebe um valor fixo de R$ 50,00 por dia mais R$ 1,50 por cada quilograma de papelão recolhido. Para obter uma remuneração diária de R$ 140,00, a cooperativa precisará recolher:',
    area: 'Matemática e suas Tecnologias',
    gradeLevel: '1º ano',
    origin: 'Conteúdo Série',
    topic: 'Função do 1º Grau e Aplicações',
    bnccSkill: 'EM13MAT101',
    options: [
      '45 kg de papelão',
      '50 kg de papelão',
      '60 kg de papelão',
      '75 kg de papelão',
      '90 kg de papelão'
    ],
    correctAnswer: 2,
    explanation: 'Equação: 140 = 50 + 1,50 · x => 1,50 · x = 140 - 50 = 90 => x = 90 / 1,5 = 60 kg.',
    simplifiedTEA: 'Cálculo passo a passo: Meta total = 140. Subtraia o valor fixo (50): sobra 90. Divida 90 por 1,50 = 60 kg.'
  },
  // 1º ANO - FORMATO ENEM (20% da trilha do 1º ano)
  {
    id: 'q-105',
    title: '(ENEM Adaptado) Textos publicitários institucionais frequentemente empregam recursos verbais e visuais para conscientizar sobre a preservação ambiental. Em uma campanha do Ministério do Meio Ambiente, a frase "Gota a gota, o futuro seca" utiliza qual figura de linguagem e efeito expressivo principal?',
    area: 'Linguagens, Códigos e suas Tecnologias',
    gradeLevel: '1º ano',
    origin: 'Formato ENEM',
    topic: 'Figuras de Linguagem e Gênero Publicitário',
    bnccSkill: 'EM13LP01',
    options: [
      'Ironia, com o objetivo de ridicularizar os consumidores residenciais de água.',
      'Metáfora e gradação, alertando para o esgotamento progressivo do recurso hídrico.',
      'Eufemismo, para suavizar a gravidade da seca nos grandes centros urbanos.',
      'Pleonasmo redundante, sem finalidade persuasiva.',
      'Antítese semântica sem relação com o tema ambiental.'
    ],
    correctAnswer: 1,
    explanation: 'A expressão "gota a gota" constrói uma gradação temporal e a metáfora do "futuro secando" enfatiza a urgência da crise hídrica caso o desperdício continue.',
    simplifiedTEA: 'Significado direto da frase: Cada gota desperdiçada hoje reduz a água do amanhã. É uma metáfora para alertar sobre o risco de falta de água.'
  },

  // 2º ANO - CONTEÚDO 2º ANO (70% da trilha do 2º ano)
  {
    id: 'q-201',
    title: 'No estudo de Termodinâmica no 2º ano do Ensino Médio, a Segunda Lei da Termodinâmica estabelece restrições fundamentais sobre as conversões de energia. Segundo o enunciado de Kelvin-Planck, uma máquina térmica operando em ciclos:',
    area: 'Ciências da Natureza e suas Tecnologias',
    gradeLevel: '2º ano',
    origin: 'Conteúdo Série',
    topic: 'Termodinâmica e Máquinas Térmicas',
    bnccSkill: 'EM13CNT306',
    options: [
      'Consegue converter integralmente todo o calor recebido da fonte quente em trabalho útil sem perdas.',
      'Não pode ter rendimento de 100%, necessitando obrigatoriamente rejeitar parte do calor para uma fonte fria.',
      'Sempre cria energia adicional durante o processo de expansão adiabática.',
      'Aumenta o calor da fonte quente espontaneamente sem realização de trabalho externo.',
      'Opera com rendimento superior ao ciclo ideal de Carnot.'
    ],
    correctAnswer: 1,
    explanation: 'A 2ª Lei da Termodinâmica afirma que é impossível construir uma máquina térmica que, operando em ciclos, transforme integralmente calor em trabalho (rendimento < 100%). Uma fração é sempre rejeitada à fonte fria.',
    simplifiedTEA: 'Regra física fixa: Nenhuma máquina a calor funciona com 100% de aproveitamento. Parte do calor é sempre perdida.'
  },
  {
    id: 'q-202',
    title: 'Em Química do 2º ano, o Princípio de Le Chatelier descreve o comportamento de sistemas em equilíbrio químico quando submetidos a perturbações externas. Para a síntese da amônia (N₂ + 3H₂ ⇌ 2NH₃ + calor), o aumento da pressão sobre o sistema provoca:',
    area: 'Ciências da Natureza e suas Tecnologias',
    gradeLevel: '2º ano',
    origin: 'Conteúdo Série',
    topic: 'Equilíbrio Químico e Le Chatelier',
    bnccSkill: 'EM13CNT104',
    options: [
      'Deslocamento do equilíbrio para a esquerda, favorecendo os reagentes gasosos.',
      'Deslocamento do equilíbrio para a direita, favorecendo a formação de amônia (menor volume gasoso).',
      'Inativação completa da reação por congelamento cinético.',
      'Nenhuma alteração, pois a pressão só altera reações em meio líquido.',
      'Aumento da constante de equilíbrio sem alterar concentrações.'
    ],
    correctAnswer: 1,
    explanation: 'No lado dos reagentes temos 1 + 3 = 4 mols de gás. No lado do produto temos 2 mols de gás. O aumento de pressão desloca o equilíbrio para o lado de menor volume gasoso (lado direito, formando mais NH₃).',
    simplifiedTEA: 'Regra de equilíbrio: Mais pressão empurra o gás para o lado que ocupa menos espaço (lado da amônia, com 2 mols em vez de 4).'
  },
  {
    id: 'q-203',
    title: 'Na Literatura do 2º ano, o Realismo brasileiro tem como marco fundador a obra "Memórias Póstumas de Brás Cubas" (1881), de Machado de Assis. A grande inovação narrativa dessa obra reside principalmente em:',
    area: 'Linguagens, Códigos e suas Tecnologias',
    gradeLevel: '2º ano',
    origin: 'Conteúdo Série',
    topic: 'Realismo e Machado de Assis',
    bnccSkill: 'EM13LP46',
    options: [
      'Idealizar os heróis nacionais à semelhança da prosa indianista romântica.',
      'Utilizar um narrador defunto (autor defunto) com ironia mordaz, que dialoga livremente com o leitor e desconstrói a hipocrisia da elite.',
      'Adotar a métrica clássica parnasiana em versos decassílabos heroicos.',
      'Defender a moral rígida patriarcal como modelo inabalável de virtude social.',
      'Narrar acontecimentos fantásticos em mundos medievais imaginários.'
    ],
    correctAnswer: 1,
    explanation: 'Machado inova com a voz de Brás Cubas, um "defunto autor", que por já estar morto não teme o julgamento social e expõe com humor cáustico as vaidades e privilégios da classe dominante.',
    simplifiedTEA: 'Característica principal do livro: O narrador já morreu antes de escrever a história. Por isso, ele fala a verdade sobre as pessoas com muita ironia.'
  },
  // 2º ANO - REVISÃO DO 1º ANO (20% da trilha do 2º ano)
  {
    id: 'q-204',
    title: '[Revisão 1º ano para 2º ano] Em Genética mendeliana introdutória, o cruzamento entre dois indivíduos heterozigotos para uma característica com dominância completa (Aa x Aa) gera qual proporção fenotípica esperada na descendência?',
    area: 'Ciências da Natureza e suas Tecnologias',
    gradeLevel: '2º ano',
    origin: 'Revisão Série Anterior',
    topic: '1ª Lei de Mendel',
    bnccSkill: 'EM13CNT205',
    options: [
      '1 dominante para 1 recessivo (1:1)',
      '3 dominantes para 1 recessivo (3:1)',
      '9 dominantes para 3 recessivos (9:3)',
      '100% de indivíduos recessivos',
      '2 dominantes para 2 recessivos com codominância'
    ],
    correctAnswer: 1,
    explanation: 'O cruzamento Aa x Aa gera 1 AA, 2 Aa e 1 aa. Os genótipos AA e Aa manifestam o fenótipo dominante (3/4 ou 75%), e aa manifesta o recessivo (1/4 ou 25%), totalizando a razão 3:1.',
    simplifiedTEA: 'Cruzamento Aa x Aa: 3 filhotes terão o traço dominante e 1 terá o traço recessivo. Proporção: 3 para 1.'
  },
  // 2º ANO - FORMATO ENEM (10% da trilha do 2º ano)
  {
    id: 'q-205',
    title: '(ENEM Oficial) O feudalismo na Europa medieval caracterizou-se pela descentralização política e pelas relações de suserania e vassalagem. A principal obrigação assumida pelo vassalo perante seu suserano no juramento de fidelidade era:',
    area: 'Ciências Humanas e suas Tecnologias',
    gradeLevel: '2º ano',
    origin: 'Formato ENEM',
    topic: 'Idade Média e Relações Feudais',
    bnccSkill: 'EM13CHS201',
    options: [
      'Auxílio militar (auxilium) e conselho político (consilium) em tempos de guerra e paz.',
      'Pagamento de impostos em ouro diretamente ao imperador bizantino.',
      'Conversão obrigatória a religiões politeístas do norte europeu.',
      'Entrega de todos os seus filhos como servos da gleba.',
      'Construção de frotas mercantis transatlânticas.'
    ],
    correctAnswer: 0,
    explanation: 'No pacto de vassalagem, o vassalo prometia lealdade, serviço militar armado ao suserano e aconselhamento nas decisões da corte feudal em troca de proteção e feudo.',
    simplifiedTEA: 'Compromisso do vassalo: Lutar na guerra quando o suserano precisasse e dar conselhos políticos.'
  },

  // 3º ANO - CONTEÚDO 3º ANO (60% da trilha do 3º ano)
  {
    id: 'q-301',
    title: 'No 3º ano do Ensino Médio em Física, o Efeito Fotoelétrico — explicado por Albert Einstein em 1905 — demonstrou a natureza corpuscular da radiação eletromagnética. A emissão de elétrons da superfície de uma placa metálica ocorre quando:',
    area: 'Ciências da Natureza e suas Tecnologias',
    gradeLevel: '3º ano',
    origin: 'Conteúdo Série',
    topic: 'Física Quântica e Efeito Fotoelétrico',
    bnccSkill: 'EM13CNT308',
    options: [
      'A luz incidente tem frequência superior à frequência de corte (frequência limite) característica do metal.',
      'Aumenta-se a temperatura do ambiente sem incidir fótons.',
      'A intensidade luminosa é baixa, independentemente do comprimento de onda.',
      'A placa metálica é conectada a um campo magnético constante e nulo.',
      'A velocidade da luz no vácuo é reduzida pela metade.'
    ],
    correctAnswer: 0,
    explanation: 'Cada metal possui uma função trabalho (energia mínima necessária para liberar o elétron). O fóton incidente deve ter energia E = h·f maior ou igual à função trabalho, logo a frequência da luz deve superar a frequência de corte f₀.',
    simplifiedTEA: 'Regra fotoelétrica: Para arrancar elétrons do metal, a luz precisa ter energia/frequência acima de um valor mínimo fixo.'
  },
  {
    id: 'q-302',
    title: 'Em Geometria Espacial no 3º ano, uma cooperativa de agricultura familiar armazena grãos em um silo cilíndrico reto com raio da base medindo 3 metros e altura de 10 metros. Adotando π = 3,14, qual é a capacidade máxima de armazenamento de grãos desse silo em metros cúbicos?',
    area: 'Matemática e suas Tecnologias',
    gradeLevel: '3º ano',
    origin: 'Conteúdo Série',
    topic: 'Geometria Espacial - Cilindros e Volumes',
    bnccSkill: 'EM13MAT303',
    options: [
      '94,2 m³',
      '188,4 m³',
      '282,6 m³',
      '314,0 m³',
      '376,8 m³'
    ],
    correctAnswer: 2,
    explanation: 'Volume do cilindro = Área da base × Altura = π × r² × h = 3,14 × 3² × 10 = 3,14 × 9 × 10 = 282,6 m³.',
    simplifiedTEA: 'Cálculo do volume: 3,14 × 3 × 3 × 10 = 3,14 × 90 = 282,6 m³.'
  },
  {
    id: 'q-303',
    title: 'Na História do Brasil contemporâneo (3º ano), o processo de redemocratização que culminou na promulgação da Constituição Cidadã de 1988 foi impulsionado pela mobilização cívica da campanha das "Diretas Já" (1983-1984). Essa emenda constitucional (Emenda Dante de Oliveira) propunha:',
    area: 'Ciências Humanas e suas Tecnologias',
    gradeLevel: '3º ano',
    origin: 'Conteúdo Série',
    topic: 'Redemocratização e Constituição de 1988',
    bnccSkill: 'EM13CHS601',
    options: [
      'A prorrogação do mandato dos generais militares por mais duas décadas.',
      'O restabelecimento do voto direto do povo para a presidência da República no Brasil.',
      'A dissolução permanente do Congresso Nacional.',
      'A censura prévia de jornais e emissoras de televisão.',
      'A separação dos estados do sul em federação independente.'
    ],
    correctAnswer: 1,
    explanation: 'A Emenda Dante de Oliveira visava restabelecer eleições diretas para presidente da República no Brasil após duas décadas de ditadura militar. Embora não tenha atingido os 2/3 no Congresso, gerou enorme comoção popular.',
    simplifiedTEA: 'Objetivo das Diretas Já: Permitir que o povo brasileiro pudesse votar diretamente para escolher o presidente da República.'
  },
  // 3º ANO - REVISÃO 1º E 2º ANOS (25% da trilha do 3º ano)
  {
    id: 'q-304',
    title: '[Revisão 1º e 2º anos para o 3º ano] A Revolução Industrial, iniciada na Inglaterra na segunda metade do século XVIII, alterou profundamente as relações socioeconômicas e espaciais. A passagem da manufatura para a maquinofatura acarretou:',
    area: 'Ciências Humanas e suas Tecnologias',
    gradeLevel: '3º ano',
    origin: 'Revisão Série Anterior',
    topic: 'Revolução Industrial e Relações de Trabalho',
    bnccSkill: 'EM13CHS204',
    options: [
      'A descentralização das cidades e a volta da maior parte da população aos feudos rurais.',
      'A separação definitiva entre o trabalhador e os meios de produção, além da consolidação do trabalho assalariado e da divisão técnica de tarefas.',
      'A valorização exclusiva do trabalho artesanal de alfaiates independentes.',
      'O controle operário imediato de todas as fábricas inglesas.',
      'A extinção do comércio marítimo global.'
    ],
    correctAnswer: 1,
    explanation: 'Com a fábrica e as máquinas a vapor, o trabalhador deixou de ser dono das ferramentas e da matéria-prima, passando a vender sua força de trabalho em jornadas intensas e tarefas fragmentadas.',
    simplifiedTEA: 'Mudança histórica central: Os trabalhadores deixaram de ter suas próprias oficinas e passaram a trabalhar nas fábricas dos donos das máquinas por salário.'
  },
  // 3º ANO - FORMATO ENEM (15% da trilha do 3º ano)
  {
    id: 'q-305',
    title: '(ENEM Oficial - Matriz de Competências) O descarte inadequado de pilhas e baterias em lixões representa risco à saúde pública devido à lixiviação de metais pesados (chumbo, cádmio e mercúrio) no lençol freático. O princípio químico que fundamenta o tratamento por reciclagem e logística reversa desses materiais é:',
    area: 'Ciências da Natureza e suas Tecnologias',
    gradeLevel: '3º ano',
    origin: 'Formato ENEM',
    topic: 'Química Ambiental e Metais Pesados',
    bnccSkill: 'EM13CNT303',
    options: [
      'A biodegradação espontânea dos metais pesados pela ação de bactérias fermentadoras comuns.',
      'A não degradabilidade de elementos metálicos no meio ambiente e sua tendência à bioacumulação e biomagnificação trófica.',
      'A neutralização espontânea do mercúrio ao entrar em contato com água potável.',
      'A rápida evaporação e desintegração radioativa do cádmio em temperatura ambiente.',
      'A transformação de metais pesados em nutrientes fertilizantes para a agricultura.'
    ],
    correctAnswer: 1,
    explanation: 'Metais pesados não são degradados biologicamente. Eles persistem no meio ambiente, contaminam a água e os organismos, acumulando-se ao longo da cadeia alimentar (biomagnificação). Por isso, exigem descarte especial e logística reversa.',
    simplifiedTEA: 'Fato sobre poluição: Metais pesados de pilhas não apodrecem nem somem na natureza. Eles acumulam no corpo dos animais e das pessoas, causando doenças.'
  }
];

export const ESSAY_THEMES: EssayTheme[] = [
  {
    id: 'theme-1',
    title: 'Desafios para a valorização de comunidades e povos tradicionais no Brasil',
    contextText: 'O Brasil abriga povos indígenas, quilombolas, ribeirinhos e comunidades extrativistas detentoras de patrimônio cultural e de práticas sustentáveis. No entanto, a invasão de territórios, a falta de titulação oficial e a invisibilidade socioeconômica ameaçam a sua sobrevivência e memória.',
    motivatingPoints: [
      'Artigo 231 da Constituição Federal de 1988 garante direitos territoriais originários.',
      'Papel vital na preservação da biodiversidade dos biomas Amazônia e Cerrado.',
      'Necessidade de políticas públicas integradas de saúde, educação diferenciada e demarcação.'
    ],
    suggestedRepertoire: [
      'Constituição Federal de 1988 (Art. 215 e 231)',
      'Ailton Krenak ("Ideias para adiar o fim do mundo")',
      'Conceito de Cidadania de Papel de Gilberto Dimenstein'
    ]
  },
  {
    id: 'theme-2',
    title: 'Caminhos para combater a evasão escolar e garantir a permanência no Ensino Médio',
    contextText: 'Milhares de jovens de famílias de baixa renda abandonam a escola pública precocemente pela necessidade de inserção no mercado de trabalho informal ou pela falta de atratividade curricular. A evasão perpetua o ciclo intergeracional de pobreza.',
    motivatingPoints: [
      'Programa Pé-de-Meia como incentivo financeiro para permanência estudantil.',
      'Importância da infraestrutura escolar: laboratórios, biblioteca e internet rápida.',
      'Acolhimento às diversidades e saúde mental na juventude.'
    ],
    suggestedRepertoire: [
      'Paulo Freire ("Pedagogia da Autonomia")',
      'Meta 3 do Plano Nacional de Educação (PNE)',
      'Teoria da Reprodução Social de Pierre Bourdieu'
    ]
  },
  {
    id: 'theme-3',
    title: 'Inclusão digital e inteligência artificial no combate às desigualdades educacionais',
    contextText: 'A revolução tecnológica pode ampliar ou reduzir abismos sociais. Enquanto estudantes com recursos acessam ferramentas de ponta, jovens de escolas periféricas muitas vezes enfrentam barreiras de conectividade e letramento digital crítico.',
    motivatingPoints: [
      'Acesso à internet de qualidade como direito fundamental do século XXI.',
      'Oportunidade da IA como tutora personalizada e gratuita para quem mais precisa.',
      'Proteção de dados e soberania tecnológica nas escolas públicas.'
    ],
    suggestedRepertoire: [
      'Milton Santos e a Cidadania Mutilada',
      'Declaração Universal dos Direitos Humanos (Art. 26 - Direito à Educação)',
      'Marco Civil da Internet (Lei nº 12.965/2014)'
    ]
  }
];

export const MOCK_CLASS_GROUPS: ClassGroup[] = [
  {
    id: 'class-1a',
    name: '1º Ano A - Matutino',
    grade: '1º ano',
    totalStudents: 34,
    averageAccuracy: 72,
    methodologicalNeeds: {
      extendedTimeOrBlocks: 6,
      visualDirectStructure: 4,
      audioOrDyslexiaSupport: 5
    }
  },
  {
    id: 'class-2b',
    name: '2º Ano B - Vespertino',
    grade: '2º ano',
    totalStudents: 38,
    averageAccuracy: 68,
    methodologicalNeeds: {
      extendedTimeOrBlocks: 8,
      visualDirectStructure: 5,
      audioOrDyslexiaSupport: 4
    }
  },
  {
    id: 'class-3c',
    name: '3º Ano C - Regular Integral',
    grade: '3º ano',
    totalStudents: 41,
    averageAccuracy: 76,
    methodologicalNeeds: {
      extendedTimeOrBlocks: 7,
      visualDirectStructure: 6,
      audioOrDyslexiaSupport: 6
    }
  }
];

export const MOCK_EDUCATIONAL_PARTNERS: EducationalPartner[] = [
  {
    id: 'partner-1',
    name: 'Universidade Aberta do Brasil & Rede Federal',
    tagline: 'Democratização do Ensino Superior e Vagas Sociais',
    logo: '🎓',
    type: 'Universidade',
    freeScholarships: 1250,
    sponsoredHours: 48000,
    opportunitiesOffered: [
      'Bolsas integrais 100% para cursos de tecnologia e saúde',
      'Isenção total na taxa de inscrição do vestibular',
      'Mentoria individual com estudantes universitários cotistas'
    ]
  },
  {
    id: 'partner-2',
    name: 'Fundação Futuro Inclusivo',
    tagline: 'Garantia de Gratuidade Real e Tecnologia Assistiva',
    logo: '🤝',
    type: 'Fundação Social',
    freeScholarships: 820,
    sponsoredHours: 35000,
    opportunitiesOffered: [
      'Doação de chips com pacote de dados 4G para estudantes de baixa renda',
      'Apoio a adaptações para TDAH, TEA e Dislexia',
      'Premiação social para melhores evoluções na redação'
    ]
  },
  {
    id: 'partner-3',
    name: 'Instituto Tech pelo Bem Comum',
    tagline: 'Sustentabilidade Tecnológica e Servidores Cloud Gratuitos',
    logo: '⚡',
    type: 'Instituto Educacional',
    freeScholarships: 540,
    sponsoredHours: 24000,
    opportunitiesOffered: [
      'Infraestrutura computacional gratuita para a plataforma',
      'Oficinas gratuitas de programação e IA ética para escolas públicas',
      'Apoio à acessibilidade em Libras e leitor de tela'
    ]
  }
];

export const MOCK_SCHOOLS: SchoolData[] = [
  {
    id: 'school-1',
    name: 'E.E. Professora Maria da Glória',
    inepCode: '35091248',
    type: 'Pública Estadual',
    city: 'Campinas',
    state: 'SP',
    activeStudents: 420,
    activeTeachers: 24,
    autonomousAccessCode: 'GLORIA-ENEM-LIVRE',
    joinedAt: '12/03/2025'
  },
  {
    id: 'school-2',
    name: 'Instituto Federal da Educação, Ciência e Tecnologia (IF)',
    inepCode: '23018471',
    type: 'Federal / IF',
    city: 'Fortaleza',
    state: 'CE',
    activeStudents: 680,
    activeTeachers: 38,
    autonomousAccessCode: 'IFCE-ENEM-INCLUSIVO',
    joinedAt: '05/02/2025'
  },
  {
    id: 'school-3',
    name: 'Colégio Comunitário Esperança Cidadã',
    inepCode: '41088921',
    type: 'Particular Comunitária',
    city: 'Curitiba',
    state: 'PR',
    activeStudents: 290,
    activeTeachers: 18,
    autonomousAccessCode: 'ESPERANCA-ENEM-COM',
    joinedAt: '20/04/2025'
  }
];

export const MOCK_SIMULATION_HISTORY: SimulationAttempt[] = [
  {
    id: 'sim-1',
    title: 'Simulado Diagnóstico Inicial',
    date: '2026-03-15',
    displayDate: 'Mar/2026',
    timestamp: new Date('2026-03-15T14:00:00Z').getTime(),
    totalQuestions: 90,
    totalCorrect: 44,
    overallScoreTRI: 598,
    durationMinutes: 240,
    status: 'Concluído',
    targetGoalTRI: 700,
    essayScore: 680,
    notes: 'Avaliação diagnóstica de entrada. Identificada necessidade de fortalecimento em Natureza e Matemática.',
    byArea: [
      {
        area: 'Linguagens, Códigos e suas Tecnologias',
        shortLabel: 'LC',
        totalQuestions: 25,
        correctAnswers: 16,
        percentage: 64,
        scoreTRI: 580,
      },
      {
        area: 'Ciências Humanas e suas Tecnologias',
        shortLabel: 'CH',
        totalQuestions: 25,
        correctAnswers: 15,
        percentage: 60,
        scoreTRI: 610,
      },
      {
        area: 'Ciências da Natureza e suas Tecnologias',
        shortLabel: 'CN',
        totalQuestions: 20,
        correctAnswers: 7,
        percentage: 35,
        scoreTRI: 540,
      },
      {
        area: 'Matemática e suas Tecnologias',
        shortLabel: 'MT',
        totalQuestions: 20,
        correctAnswers: 6,
        percentage: 30,
        scoreTRI: 560,
      },
    ],
  },
  {
    id: 'sim-2',
    title: 'Simulado 1º Bimestre',
    date: '2026-04-28',
    displayDate: 'Abr/2026',
    timestamp: new Date('2026-04-28T14:00:00Z').getTime(),
    totalQuestions: 90,
    totalCorrect: 51,
    overallScoreTRI: 635,
    durationMinutes: 230,
    status: 'Concluído',
    targetGoalTRI: 700,
    essayScore: 720,
    notes: 'Avanço expressivo em interpretação de textos e cartografia em Humanas.',
    byArea: [
      {
        area: 'Linguagens, Códigos e suas Tecnologias',
        shortLabel: 'LC',
        totalQuestions: 25,
        correctAnswers: 18,
        percentage: 72,
        scoreTRI: 620,
      },
      {
        area: 'Ciências Humanas e suas Tecnologias',
        shortLabel: 'CH',
        totalQuestions: 25,
        correctAnswers: 17,
        percentage: 68,
        scoreTRI: 645,
      },
      {
        area: 'Ciências da Natureza e suas Tecnologias',
        shortLabel: 'CN',
        totalQuestions: 20,
        correctAnswers: 9,
        percentage: 45,
        scoreTRI: 575,
      },
      {
        area: 'Matemática e suas Tecnologias',
        shortLabel: 'MT',
        totalQuestions: 20,
        correctAnswers: 7,
        percentage: 35,
        scoreTRI: 610,
      },
    ],
  },
  {
    id: 'sim-3',
    title: 'Simulado Intermediário Semestral',
    date: '2026-06-18',
    displayDate: 'Jun/2026',
    timestamp: new Date('2026-06-18T14:00:00Z').getTime(),
    totalQuestions: 90,
    totalCorrect: 58,
    overallScoreTRI: 682,
    durationMinutes: 220,
    status: 'Concluído',
    targetGoalTRI: 720,
    essayScore: 800,
    notes: 'Redação ultrapassou a marca de 800 pontos com proposta de intervenção completa.',
    byArea: [
      {
        area: 'Linguagens, Códigos e suas Tecnologias',
        shortLabel: 'LC',
        totalQuestions: 25,
        correctAnswers: 19,
        percentage: 76,
        scoreTRI: 655,
      },
      {
        area: 'Ciências Humanas e suas Tecnologias',
        shortLabel: 'CH',
        totalQuestions: 25,
        correctAnswers: 19,
        percentage: 76,
        scoreTRI: 690,
      },
      {
        area: 'Ciências da Natureza e suas Tecnologias',
        shortLabel: 'CN',
        totalQuestions: 20,
        correctAnswers: 11,
        percentage: 55,
        scoreTRI: 620,
      },
      {
        area: 'Matemática e suas Tecnologias',
        shortLabel: 'MT',
        totalQuestions: 20,
        correctAnswers: 9,
        percentage: 45,
        scoreTRI: 670,
      },
    ],
  },
  {
    id: 'sim-4',
    title: 'Simulado Intensivo de Férias',
    date: '2026-08-12',
    displayDate: 'Ago/2026',
    timestamp: new Date('2026-08-12T14:00:00Z').getTime(),
    totalQuestions: 90,
    totalCorrect: 64,
    overallScoreTRI: 718,
    durationMinutes: 215,
    status: 'Concluído',
    targetGoalTRI: 750,
    essayScore: 840,
    notes: 'Consistência excelente. Matemática saltou com resolução de geometria plana e proporções.',
    byArea: [
      {
        area: 'Linguagens, Códigos e suas Tecnologias',
        shortLabel: 'LC',
        totalQuestions: 25,
        correctAnswers: 20,
        percentage: 80,
        scoreTRI: 685,
      },
      {
        area: 'Ciências Humanas e suas Tecnologias',
        shortLabel: 'CH',
        totalQuestions: 25,
        correctAnswers: 20,
        percentage: 80,
        scoreTRI: 725,
      },
      {
        area: 'Ciências da Natureza e suas Tecnologias',
        shortLabel: 'CN',
        totalQuestions: 20,
        correctAnswers: 12,
        percentage: 60,
        scoreTRI: 660,
      },
      {
        area: 'Matemática e suas Tecnologias',
        shortLabel: 'MT',
        totalQuestions: 20,
        correctAnswers: 12,
        percentage: 60,
        scoreTRI: 730,
      },
    ],
  },
  {
    id: 'sim-5',
    title: 'Simulado Reta Final ENEM',
    date: '2026-09-20',
    displayDate: 'Set/2026',
    timestamp: new Date('2026-09-20T14:00:00Z').getTime(),
    totalQuestions: 90,
    totalCorrect: 69,
    overallScoreTRI: 748,
    durationMinutes: 210,
    status: 'Concluído',
    targetGoalTRI: 760,
    essayScore: 880,
    notes: 'Todas as 4 áreas acima de 690 pontos na TRI. Excelente coerência pedagógica.',
    byArea: [
      {
        area: 'Linguagens, Códigos e suas Tecnologias',
        shortLabel: 'LC',
        totalQuestions: 25,
        correctAnswers: 21,
        percentage: 84,
        scoreTRI: 710,
      },
      {
        area: 'Ciências Humanas e suas Tecnologias',
        shortLabel: 'CH',
        totalQuestions: 25,
        correctAnswers: 21,
        percentage: 84,
        scoreTRI: 750,
      },
      {
        area: 'Ciências da Natureza e suas Tecnologias',
        shortLabel: 'CN',
        totalQuestions: 20,
        correctAnswers: 13,
        percentage: 65,
        scoreTRI: 695,
      },
      {
        area: 'Matemática e suas Tecnologias',
        shortLabel: 'MT',
        totalQuestions: 20,
        correctAnswers: 14,
        percentage: 70,
        scoreTRI: 785,
      },
    ],
  },
  {
    id: 'sim-6',
    title: 'Simulado Pré-ENEM Oficial Integrado',
    date: '2026-10-05',
    displayDate: 'Out/2026',
    timestamp: new Date('2026-10-05T14:00:00Z').getTime(),
    totalQuestions: 90,
    totalCorrect: 73,
    overallScoreTRI: 772,
    durationMinutes: 205,
    status: 'Concluído',
    targetGoalTRI: 780,
    essayScore: 920,
    notes: 'Recorde pessoal com nota TRI estimada em 772 e Redação nota 920. Domínio consolidado da Competência 1 e 5.',
    byArea: [
      {
        area: 'Linguagens, Códigos e suas Tecnologias',
        shortLabel: 'LC',
        totalQuestions: 25,
        correctAnswers: 22,
        percentage: 88,
        scoreTRI: 730,
      },
      {
        area: 'Ciências Humanas e suas Tecnologias',
        shortLabel: 'CH',
        totalQuestions: 25,
        correctAnswers: 22,
        percentage: 88,
        scoreTRI: 775,
      },
      {
        area: 'Ciências da Natureza e suas Tecnologias',
        shortLabel: 'CN',
        totalQuestions: 20,
        correctAnswers: 14,
        percentage: 70,
        scoreTRI: 720,
      },
      {
        area: 'Matemática e suas Tecnologias',
        shortLabel: 'MT',
        totalQuestions: 20,
        correctAnswers: 15,
        percentage: 75,
        scoreTRI: 815,
      },
    ],
  },
];
