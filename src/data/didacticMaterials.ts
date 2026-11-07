import { DidacticDocument } from '../types';

export const INITIAL_DIDACTIC_DOCUMENTS: DidacticDocument[] = [
  {
    id: 'mat-01',
    title: 'Gêneros Textuais e Funções da Linguagem no ENEM',
    subtitle: 'Domínio essencial da interpretação de texto, charges, crônicas e estratégias argumentativas na Prova de Linguagens.',
    category: 'Linguagens, Códigos e suas Tecnologias',
    areaShort: 'LC',
    estimatedMinutes: 8,
    wordCount: 860,
    difficulty: 'Iniciante',
    coverColor: 'from-amber-500 to-orange-600',
    tags: ['Linguagens', 'Interpretação', 'Charges', 'Figuras de Linguagem', 'ENEM'],
    summary: 'Aprenda a identificar a intenção comunicativa de cada gênero e decifrar os comandos das questões de Linguagens sem cansaço visual.',
    sections: [
      {
        id: 'lc-s1',
        title: '1. O que o ENEM realmente avalia em Linguagens?',
        subheading: 'Competência leitora e intencionalidade discursiva',
        paragraphs: [
          'A prova de Linguagens do ENEM não cobra memorização de regras gramaticais isoladas. O exame avalia como o estudante compreende a função social de um texto e a intenção de quem o produziu.',
          'Cada texto existe em uma situação comunicativa concreta: possui um autor, um público-alvo, um suporte (jornal, rede social, outdoor) e um objetivo (informar, convencer, ironizar, emocionar).',
          'Ao ler qualquer texto na prova, a primeira pergunta que você deve se fazer é: qual é o objetivo principal deste autor com este público?'
        ],
        keyConcept: 'Intencionalidade Discursiva: Todo texto quer provocar um efeito específico no leitor. Identificar esse efeito é a chave para acertar a questão.',
        enemTip: 'Leia primeiro o comando da questão antes do texto-base. Sabendo o que o examinador procura, sua leitura será muito mais rápida e focada.',
        exampleBox: {
          title: 'Exemplo Comentado: Charge Crítica',
          text: 'Numa charge que mostra pessoas olhando para telas enquanto a cidade queima, o objetivo não é descrever um incêndio real, mas ironizar a alienação digital contemporânea.'
        }
      },
      {
        id: 'lc-s2',
        title: '2. As Seis Funções da Linguagem de Jakobson',
        subheading: 'Como cada elemento da comunicação molda o texto',
        paragraphs: [
          'Roman Jakobson mapeou que a linguagem pode enfatizar diferentes elementos do circuito comunicativo. O ENEM cobra isso em situações práticas do cotidiano.',
          'Função Emotiva ou Expressiva: Centrada no emissor (eu). Marcada por verbos em 1ª pessoa, exclamações e adjetivos que revelam sentimentos e opiniões pessoais.',
          'Função Conativa ou Apelativa: Centrada no receptor (você). Típica de anúncios publicitários e discursos políticos, utilizando verbos no imperativo ("compre", "veja", "vote").',
          'Função Referencial ou Denotativa: Centrada no referente (assunto). Predomina em notícias jornalísticas, artigos científicos e livros didáticos com linguagem objetiva e impessoal.',
          'Função Metalinguística: A linguagem explicando a própria linguagem. Ocorre em dicionários, poemas que falam sobre fazer poemas ou filmes sobre a arte do cinema.',
          'Função Fática: Centrada no canal de contato. Testa se a comunicação está aberta ("Alô?", "Entendeu?", "Está me ouvindo?").',
          'Função Poética: Centrada na mensagem e na sua forma estética. Presente em poesias, provérbios, slogans rimados e canções.'
        ],
        keyConcept: 'Lembrete prático: Anúncio publicitário = Conativa. Notícia de jornal = Referencial. Desabafo em diário = Emotiva.',
        enemTip: 'Cuidado: um mesmo texto pode conter várias funções, mas o ENEM sempre pergunta pela função predominante.'
      },
      {
        id: 'lc-s3',
        title: '3. Estratégia de Leitura Visual e Textos Híbridos',
        subheading: 'Integrando texto verbal e não verbal',
        paragraphs: [
          'Mais de 30% das questões de Linguagens trazem infográficos, tirinhas, grafites ou cartazes publicitários. Eles são chamados de textos multimodais.',
          'Em textos multimodais, a imagem não é mero enfeite: ela complementa, reforça ou muitas vezes contradiz o texto escrito para criar humor ou ironia.',
          'Observe sempre a expressão dos personagens, os planos de enquadramento, as cores e as legendas explicativas.'
        ],
        keyConcept: 'Polifonia e Intertextualidade: Textos que conversam com outros textos ou obras clássicas para enriquecer o sentido.',
        enemTip: 'Para alunos com dislexia: leia em blocos curtos e utilize a régua de leitura para isolar a fala dos personagens nos balões de quadrinhos.'
      }
    ]
  },
  {
    id: 'mat-02',
    title: 'Matemática Básica, Proporcionalidade e Escalas na TRI',
    subtitle: 'A base obrigatória para garantir notas acima de 750 pontos sem errar questões fáceis e coerentes.',
    category: 'Matemática e suas Tecnologias',
    areaShort: 'MT',
    estimatedMinutes: 9,
    wordCount: 920,
    difficulty: 'Iniciante',
    coverColor: 'from-blue-600 to-indigo-700',
    tags: ['Matemática', 'TRI', 'Regra de Três', 'Escalas', 'Porcentagem'],
    summary: 'Domine a lógica das grandezas diretamente e inversamente proporcionais, conversão de unidades e cálculo de escalas no ENEM.',
    sections: [
      {
        id: 'mt-s1',
        title: '1. O Algoritmo da TRI e a Coerência Pedagógica',
        subheading: 'Por que errar uma questão fácil prejudica mais que errar uma difícil',
        paragraphs: [
          'A Teoria de Resposta ao Item (TRI) do ENEM não soma simplesmente o número de acertos. Ela avalia o padrão de coerência de suas respostas.',
          'Se um candidato acerta uma questão considerada muito difícil de logaritmo, mas erra uma questão fácil de média aritmética, o algoritmo infere que o acerto difícil foi fruto de chute.',
          'Portanto, a chave de ouro para maximizar a nota em Matemática é garantir 100% de precisão nas questões de Matemática Básica antes de se preocupar com fórmulas complexas.'
        ],
        keyConcept: 'Coerência TRI: Construa sua nota garantindo primeiro as questões de operações básicas, porcentagem, razão, proporção e leitura de gráficos.',
        enemTip: 'Faça uma primeira varredura na prova resolvendo apenas as questões com enunciados curtos e operações diretas.'
      },
      {
        id: 'mt-s2',
        title: '2. Grandezas Diretamente e Inversamente Proporcionais',
        subheading: 'O segredo da Regra de Três sem decoreba',
        paragraphs: [
          'Duas grandezas são diretamente proporcionais quando o aumento de uma provoca o aumento proporcional da outra. Exemplo: quanto maior a quantidade de combustível comprada, maior o valor total pago.',
          'Duas grandezas são inversamente proporcionais quando o aumento de uma provoca a diminuição proporcional da outra. Exemplo: quanto maior a velocidade média de um veículo, menor o tempo necessário para percorrer o trajeto.',
          'Ao montar a tabela de proporção, sempre pergunte: "Se esta grandeza dobrar, a outra vai dobrar ou vai cair pela metade?". Se dobrar, multiplique cruzado. Se cair pela metade, multiplique em linha reta.'
        ],
        keyConcept: 'Direta: y/x = constante. Inversa: x * y = constante. Isso resolve mais de 8 questões por ano no exame.',
        enemTip: 'Atenção aos sinais: vazão de torneiras, velocidade e número de operários costumam envolver grandezas inversas.'
      },
      {
        id: 'mt-s3',
        title: '3. Escalas Cartográficas e Conversão de Dimensões',
        subheading: 'Comprimento, Área e Volume: as armadilhas mais comuns',
        paragraphs: [
          'Uma escala de 1:50.000 significa que 1 centímetro no mapa corresponde a 50.000 centímetros no mundo real (ou seja, 500 metros ou 0,5 km).',
          'Cuidado com as dimensões espaciais: para comprimentos lineares, a relação é a escala direta (E = d / D).',
          'Porém, para áreas de terrenos ou plantas, a relação é ao quadrado (E² = a / A). Para volumes ou maquetes tridimensionais, a relação é ao cubo (E³ = v / V).'
        ],
        keyConcept: 'Conversão rápida de medidas: 1 m = 100 cm | 1 m² = 10.000 cm² | 1 m³ = 1.000 litros = 1.000.000 cm³.',
        enemTip: 'Sempre converta todas as grandezas para a mesma unidade antes de iniciar qualquer operação matemática.'
      }
    ]
  },
  {
    id: 'hum-01',
    title: 'Cidadania, Direitos Humanos e Movimentos Sociais no Brasil',
    subtitle: 'Linha histórica da conquista de direitos civis, políticos e sociais até a Constituição Cidadã de 1988.',
    category: 'Ciências Humanas e suas Tecnologias',
    areaShort: 'CH',
    estimatedMinutes: 10,
    wordCount: 980,
    difficulty: 'Intermediário',
    coverColor: 'from-emerald-600 to-teal-700',
    tags: ['Humanas', 'História do Brasil', 'Cidadania', 'Constituição de 1988', 'Sociologia'],
    summary: 'Compreenda a evolução da cidadania no Brasil, o conceito de cidadão de papel e o repertório sociocultural essencial para a prova e a redação.',
    sections: [
      {
        id: 'ch-s1',
        title: '1. As Três Dimensões da Cidadania Moderna (T. H. Marshall)',
        subheading: 'Direitos civis, políticos e sociais em perspectiva',
        paragraphs: [
          'O sociólogo britânico T. H. Marshall sistematizou a cidadania moderna em três gerações consecutivas: civis (século XVIII), políticos (século XIX) e sociais (século XX).',
          'Direitos Civis: Garantem a liberdade individual, igualdade perante a lei, liberdade de expressão, de locomoção e o direito à propriedade.',
          'Direitos Políticos: Garantem a participação no governo da sociedade, como o direito de votar, ser votado e organizar manifestações públicas.',
          'Direitos Sociais: Garantem o bem-estar material e a dignidade humana, incluindo saúde, educação, previdência social, trabalho digno e moradia.'
        ],
        keyConcept: 'No Brasil, historiadores como José Murilo de Carvalho apontam que essa ordem foi invertida: os direitos sociais vieram primeiro na Era Vargas, antes da plena consolidação dos direitos civis e políticos.',
        enemTip: 'Esse conceito é um dos repertórios socioculturais mais bem avaliados tanto nas questões de Humanas quanto na Competência 2 da Redação.'
      },
      {
        id: 'ch-s2',
        title: '2. A Constituição Cidadã de 1988 e o Artigo 5º',
        subheading: 'O marco da redemocratização e a garantia formal de direitos',
        paragraphs: [
          'Promulgada após o fim da ditadura militar civil e a mobilização popular das Diretas Já, a Constituição Federal de 1988 ficou conhecida como "Constituição Cidadã".',
          'O Artigo 5º estabelece que todos são iguais perante a lei, sem distinção de qualquer natureza, garantindo a inviolabilidade do direito à vida, à liberdade, à igualdade, à segurança e à propriedade.',
          'No entanto, a sociologia contemporânea (como em Gilberto Dimenstein com "O Cidadão de Papel") destaca o abismo entre a lei promulgada e a realidade prática das populações marginalizadas.'
        ],
        keyConcept: 'Cidadania Real vs. Cidadania Formal: O ENEM cobra criticamente a contradição entre o texto da lei e o acesso efetivo a serviços públicos no Brasil.',
        enemTip: 'Para o aluno com dislexia: estruture a linha do tempo em tópicos cronológicos com palavras-chave destacadas.'
      },
      {
        id: 'ch-s3',
        title: '3. Movimentos Sociais e a Conquista de Novos Direitos',
        subheading: 'Movimento Negro, Feminista, Indígena e Trabalhador',
        paragraphs: [
          'Nenhum direito social foi concedido de forma espontânea pelas elites dominantes. Todos resultaram de lutas e tensões de movimentos sociais organizados.',
          'O Movimento Negro conquistou marcos históricos como a Lei 10.639/03 (ensino de história afro-brasileira) e as políticas de Ações Afirmativas e Cotas nas Universidades Federais.',
          'As lutas dos povos originários garantiram a demarcação de terras indígenas e o reconhecimento de sua organização social, costumes, línguas e tradições no Artigo 231 da CF/88.'
        ],
        keyConcept: 'Ação Afirmativa: Medida temporária do Estado para corrigir desigualdades históricas acumuladas e promover equidade social real.',
        enemTip: 'As questões do ENEM valorizam a perspectiva da alteridade e o respeito irrevogável aos Direitos Humanos.'
      }
    ]
  },
  {
    id: 'nat-01',
    title: 'Ecologia Aplicada: Ciclos Biogeoquímicos e Impactos Ambientais',
    subtitle: 'O tema mais cobrado de Ciências da Natureza: desequilíbrios ecológicos, ciclo do carbono e eutrofização.',
    category: 'Ciências da Natureza e suas Tecnologias',
    areaShort: 'CN',
    estimatedMinutes: 9,
    wordCount: 890,
    difficulty: 'Intermediário',
    coverColor: 'from-teal-600 to-green-700',
    tags: ['Natureza', 'Biologia', 'Ecologia', 'Ciclos', 'Meio Ambiente'],
    summary: 'Aprenda a analisar cadeias tróficas, magnificação trófica de poluentes e o mecanismo passo a passo da eutrofização nas águas.',
    sections: [
      {
        id: 'cn-s1',
        title: '1. Cadeias Tróficas e Fluxo de Energia Unidirecional',
        subheading: 'Produtores, consumidores e a perda de energia em cada nível',
        paragraphs: [
          'Em qualquer ecossistema, os produtores (organismos autotróficos como plantas e fitoplâncton) captam energia solar e convertem em matéria orgânica via fotossíntese.',
          'Diferente da matéria, que é ciclada infinitamente pelos decompositores, a energia NÃO é reciclada: o fluxo é estritamente unidirecional.',
          'Aproximadamente 90% da energia é perdida na forma de calor e processos metabólicos a cada nível trófico. Por isso, as cadeias raramente ultrapassam 4 ou 5 elos.'
        ],
        keyConcept: 'Regra dos 10%: Apenas cerca de 10% da energia acumulada em um nível trófico fica disponível para o nível seguinte.',
        enemTip: 'Se uma questão perguntar qual nível trófico acumula MENOS energia, a resposta sempre será o predador de topo.'
      },
      {
        id: 'cn-s2',
        title: '2. Bioacumulação e Magnificação Trófica',
        subheading: 'Como poluentes não biodegradáveis afetam o topo da cadeia',
        paragraphs: [
          'Substâncias tóxicas não biodegradáveis (como metais pesados, mercúrio e agrotóxicos organoclorados) não são eliminadas facilmente pelo organismo.',
          'Quando um animal consome diversos organismos do nível inferior, ele absorve todo o poluente neles acumulado. Isso gera o fenômeno da magnificação trófica.',
          'Ao contrário da energia (que diminui a cada nível), a concentração do poluente AUMENTA drasticamente à medida que subimos na cadeia trófica.'
        ],
        keyConcept: 'Predador de topo: Maior concentração do veneno por quilo de massa corporal (ex: seres humanos e gaviões).',
        enemTip: 'Diferença sutil: Bioacumulação é o acúmulo no indivíduo ao longo da vida; Magnificação Trófica é o aumento da concentração ao longo dos níveis da cadeia.'
      },
      {
        id: 'cn-s3',
        title: '3. Mecanismo Passo a Passo da Eutrofização Artificial',
        subheading: 'Um clássico absoluto das provas de Ciências da Natureza',
        paragraphs: [
          'Passo 1: Despejo de esgoto doméstico ou fertilizantes agrícolas ricos em nitrogênio e fósforo em corpos d\'água.',
          'Passo 2: Proliferação descontrolada de algas na superfície (floração algal), bloqueando a passagem de luz solar para as camadas mais profundas.',
          'Passo 3: Morte das plantas aquáticas submersas por falta de fotossíntese.',
          'Passo 4: Proliferação intensa de bactérias aeróbicas decompositoras, que consom todo o oxigênio dissolvido na água (DBO elevada).',
          'Passo 5: Anóxia (falta de O₂), morte em massa de peixes e proliferação final de bactérias anaeróbicas, gerando mau cheiro por gases como o sulfeto de hidrogênio.'
        ],
        keyConcept: 'Lembrete mental: Esgoto -> Floração -> Sombra -> Menos Fotossíntese -> Bactérias consom O₂ -> Morte dos peixes.',
        enemTip: 'Atenção: A falta de oxigênio é causada pela respiração dos decompositores bacterianos, não diretamente pelas algas da superfície.'
      }
    ]
  },
  {
    id: 'red-01',
    title: 'Manual Prático de Proposta de Intervenção Nota 1000 (C5)',
    subtitle: 'Os 5 elementos obrigatórios da Competência 5 para garantir os 200 pontos sem esquecer nenhum detalhe.',
    category: 'Redação ENEM',
    areaShort: 'RED',
    estimatedMinutes: 8,
    wordCount: 820,
    difficulty: 'Intermediário',
    coverColor: 'from-purple-600 to-pink-700',
    tags: ['Redação', 'Competência 5', 'Proposta de Intervenção', 'Nota 1000', 'Direitos Humanos'],
    summary: 'Aprenda a fórmula perfeita para redigir a proposta de intervenção social com Agente, Ação, Meio/Modo, Efeito e Detalhamento explicativo.',
    sections: [
      {
        id: 'red-s1',
        title: '1. O que os corretores do ENEM buscam na Conclusão?',
        subheading: 'Solidariedade republicana, viabilidade e respeito aos Direitos Humanos',
        paragraphs: [
          'A Competência 5 da Redação do ENEM exige que o participante elabore uma proposta de intervenção social para o problema abordado no tema.',
          'Essa proposta deve respeitar estritamente os Direitos Humanos (qualquer proposta que fira a dignidade humana ou incentive justiça com as próprias mãos zera automaticamente a competência).',
          'Para atingir os 200 pontos máximos, a banca exige a presença inequívoca de 5 elementos completos em ao menos uma proposta.'
        ],
        keyConcept: 'Fórmula Mnemônica: A²MDE -> Agente + Ação + Meio + Detalhamento + Efeito.',
        enemTip: 'Não tente fazer duas ou três propostas rasas. Faça UMA proposta principal hiperdetalhada com os 5 elementos e, se quiser, apenas mencione uma complementar.'
      },
      {
        id: 'red-s2',
        title: '2. Detalhamento dos 5 Elementos Obrigatórios',
        subheading: 'Cada elemento vale 40 pontos na grade oficial do INEP',
        paragraphs: [
          '1. AGENTE (Quem fará?): O órgão ou entidade responsável. Evite agentes genéricos como "Governo" ou "Pessoas". Prefira agentes específicos: Ministério da Educação (MEC), Ministério da Saúde (MS), Secretarias Municipais ou Poder Legislativo.',
          '2. AÇÃO (O que será feito?): O verbo principal no infinitivo que combate a causa levantada nos seus parágrafos de desenvolvimento (ex: "deve criar um programa nacional de formação continuada...").',
          '3. MODO/MEIO (Como será feito?): O mecanismo operacional, introduzido por conectivos como "por meio de", "mediante", "através de convênios com...".',
          '4. EFEITO/FINALIDADE (Para que será feito?): O objetivo a médio e longo prazo, introduzido por "a fim de", "com o fito de", "com o objetivo de...".',
          '5. DETALHAMENTO (Explicação extra de um dos elementos): Uma oração explicativa que aprofunda o agente, a ação, o meio ou o efeito. A forma mais segura é detalhar o meio ou o agente por meio de um aposto entre vírgulas.'
        ],
        keyConcept: 'O detalhamento é o elemento que os alunos mais esquecem. Coloque uma oração como: "como palestras didáticas e oficinas lúdicas em finais de semana" para garantir seus 40 pontos.',
        enemTip: 'Use sempre conectivos claros de finalidade ("a fim de que", "com o intuito de") para o corretor identificar o efeito sem dúvida.'
      },
      {
        id: 'red-s3',
        title: '3. Modelo Pronto com os 5 Elementos Destacados',
        subheading: 'Parágrafo dissertativo gabaritado para você adaptar',
        paragraphs: [
          '"Portanto, cabe ao Ministério da Educação [AGENTE], órgão responsável pelas diretrizes pedagógicas do país [DETALHAMENTO DO AGENTE], implementar oficinas semanais de letramento midiático nas escolas públicas [AÇÃO], mediante a capacitação prévia de professores em parceria com universidades [MEIO/MODO], a fim de estimular o senso crítico dos estudantes frente à desinformação digital e consolidar uma sociedade mais consciente [EFEITO]."'
        ],
        keyConcept: 'Neste parágrafo, todos os 5 elementos estão presentes de forma articulada e fluida, sem truncamentos gramaticais.',
        enemTip: 'Para alunos com TDAH e Dislexia: memorize esta estrutura visual colorida em blocos antes de escrever o rascunho.'
      }
    ]
  },
  {
    id: 'neuro-01',
    title: 'Guia de Leitura e Fixação Ativa para Mentes com Dislexia e TDAH',
    subtitle: 'Métodos cognitivos multissensoriais, estratégias de ancoragem visual e redução de sobrecarga perceptual.',
    category: 'Guia Neuroinclusivo',
    areaShort: 'NEURO',
    estimatedMinutes: 7,
    wordCount: 780,
    difficulty: 'Iniciante',
    coverColor: 'from-violet-600 to-indigo-800',
    tags: ['Neurodiversidade', 'Dislexia', 'TDAH', 'Acessibilidade', 'Método de Estudo'],
    summary: 'Entenda por que sobreposições de cores amenizam o estresse visual na dislexia e como usar a régua e o áudio integrado a seu favor.',
    sections: [
      {
        id: 'neuro-s1',
        title: '1. Por que Sobreposições de Cores Ajudam na Dislexia?',
        subheading: 'A ciência dos filtros cromáticos e o estresse visual',
        paragraphs: [
          'Estudos em neurociência cognitiva e pesquisas sobre a Síndrome de Irlen demonstram que o contraste extremo entre o texto preto puro e o fundo branco brilhante causa uma sobrecarga nos fotorreceptores da retina.',
          'Essa hipersensibilidade à luz e ao contraste alto provoca fadiga ocular rápida, dores de cabeça e a sensação ilusória de que as letras estão "dançando", borrando ou vibrando na página.',
          'Ao aplicar sobreposições em tons de creme, amarelo suave, menta ou azul celeste, reduz-se o ofuscamento sem perder a nitidez das palavras, permitindo que o cérebro processe a decodificação fonológica com muito mais conforto.'
        ],
        keyConcept: 'Filtro Cromático Individual: Cada pessoa responde melhor a uma tonalidade. O amarelo e o pêssego acalmam o brilho, enquanto o menta e o azul estabilizam as linhas.',
        enemTip: 'No dia a dia e nos simulados virtuais, configure a sobreposição na tonalidade que deixar seus olhos mais relaxados.'
      },
      {
        id: 'neuro-s2',
        title: '2. A Régua de Leitura Guiada e o Rastreamento Sacádico',
        subheading: 'Evitando a perda de linha e a regressão visual constante',
        paragraphs: [
          'Estudantes com dislexia e TDAH frequentemente sofrem com a "perda de linha": os olhos saltam involuntariamente para a linha de baixo ou de cima, exigindo releituras exaustivas.',
          'A régua de leitura atua como uma âncora perceptiva: ela isola uma ou duas linhas por vez enquanto escurece suavemente o restante do texto.',
          'Isso reduz drasticamente os movimentos sacádicos desordenados dos olhos e diminui o esforço executivo necessário para manter o foco na mensagem.'
        ],
        keyConcept: 'Leitura Linear Estabilizada: Menos regressões involuntárias = leitura até 40% mais rápida e retenção superior.',
        enemTip: 'Você pode mover a régua no leitor deste aplicativo arrastando o mouse ou usando as teclas de seta do teclado.'
      },
      {
        id: 'neuro-s3',
        title: '3. Acomodação Auditiva: Ouvir enquanto Lê (Modo Bimodal)',
        subheading: 'Integrando o córtex visual e o auditivo simultaneamente',
        paragraphs: [
          'A leitura bimodal (ouvir a voz narrando o parágrafo enquanto os olhos acompanham o texto destacado) é uma das técnicas mais eficazes comprovadas pela ciência da aprendizagem.',
          'Ela compensa dificuldades pontuais de decodificação grafema-fonema, permitindo que a atenção do estudante fique livre para a compreensão semântica profunda.',
          'Neste leitor, você pode acionar a leitura em voz alta com velocidade ajustável a qualquer momento clicando no botão "Ouvir Parágrafo".'
        ],
        keyConcept: 'Processamento Bimodal: O estímulo duplo (olhos + ouvidos) consolida a memória de longo prazo no hipocampo.',
        enemTip: 'Faça pausas de 5 minutos a cada bloco de leitura de 20 minutos (use o Pomodoro TDAH integrado).'
      }
    ]
  }
];
