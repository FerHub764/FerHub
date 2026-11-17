// Catálogo de formas de ganhar dinheiro em casa.
// Faixas de valor/hora são estimativas de mercado brasileiro para quem está começando
// e servem só como ponto de partida, nunca como promessa.

export const PERFIS = {
  comunicacao: 'Escrever e conversar',
  visual: 'Criar coisas bonitas',
  tecnico: 'Tecnologia e computador',
  manual: 'Trabalho com as mãos',
  cozinha: 'Cozinhar',
  ensino: 'Explicar e ensinar',
  organizacao: 'Organizar e planejar',
};

export const CATEGORIAS = {
  servico: 'Serviço digital',
  produto: 'Produto físico',
  ensino: 'Ensino',
  conteudo: 'Conteúdo e audiência',
};

export const METODOS = [
  {
    id: 'redacao',
    nome: 'Redação e revisão de textos',
    categoria: 'servico',
    resumo: 'Escreva artigos, descrições de produtos e revise textos para empresas e blogs.',
    investimento: 0,
    semanasPrimeiraRenda: 2,
    hora: [25, 70],
    perfis: ['comunicacao', 'organizacao'],
    plataformas: ['Workana', '99Freelas', 'LinkedIn', 'Agências de conteúdo'],
    passos: [
      'Escreva 3 textos de amostra sobre temas diferentes',
      'Monte um portfólio gratuito (Google Drive ou Notion)',
      'Crie perfil em 2 plataformas e mande 5 propostas por dia',
      'Peça depoimento a cada cliente satisfeito',
    ],
    cuidado: 'Desconfie de “testes” longos não pagos. Um teste justo tem até 300 palavras.',
  },
  {
    id: 'design',
    nome: 'Design para pequenos negócios',
    categoria: 'servico',
    resumo: 'Posts, logotipos, cardápios e cartões para comércios do seu bairro e da internet.',
    investimento: 1,
    semanasPrimeiraRenda: 3,
    hora: [30, 90],
    perfis: ['visual', 'tecnico'],
    plataformas: ['Canva', 'Instagram', 'Workana', 'Indicações locais'],
    passos: [
      'Aprenda o básico de Canva ou Figma (ambos têm versão gratuita)',
      'Refaça a identidade de 3 negócios reais como estudo',
      'Ofereça um pacote fechado: “10 posts por mês”',
      'Visite ou mande mensagem a 10 comércios locais',
    ],
    cuidado: 'Use apenas imagens e fontes com licença livre para uso comercial.',
  },
  {
    id: 'programacao',
    nome: 'Programação freelancer',
    categoria: 'servico',
    resumo: 'Sites, automações e pequenos sistemas. Paga bem, mas exige estudo antes.',
    investimento: 1,
    semanasPrimeiraRenda: 12,
    hora: [50, 150],
    perfis: ['tecnico', 'organizacao'],
    plataformas: ['Workana', 'GitHub', 'LinkedIn', 'Upwork'],
    passos: [
      'Estude HTML, CSS e JavaScript por 2–3 meses com projetos reais',
      'Publique 3 projetos no GitHub com explicação',
      'Comece com sites simples para negócios locais',
      'Suba o preço a cada 3 clientes entregues',
    ],
    cuidado: 'Combine o escopo por escrito antes de começar e cobre parte adiantada.',
  },
  {
    id: 'assistente',
    nome: 'Assistente virtual',
    categoria: 'servico',
    resumo: 'Cuide de agenda, e-mails, planilhas e atendimento para profissionais ocupados.',
    investimento: 0,
    semanasPrimeiraRenda: 3,
    hora: [20, 50],
    perfis: ['organizacao', 'comunicacao'],
    plataformas: ['LinkedIn', 'Grupos de empreendedores', 'Workana'],
    passos: [
      'Liste o que você já sabe fazer: planilhas, e-mail, agenda, atendimento',
      'Crie um pacote mensal de horas (ex.: 20h/mês)',
      'Ofereça para médicos, advogados e lojistas da sua rede',
      'Use um contrato simples com confidencialidade',
    ],
    cuidado: 'Nunca aceite usar sua conta bancária para “repassar pagamentos” de terceiros.',
  },
  {
    id: 'aulas',
    nome: 'Aulas particulares online',
    categoria: 'ensino',
    resumo: 'Reforço escolar, idiomas, música ou preparação para concursos por videochamada.',
    investimento: 0,
    semanasPrimeiraRenda: 1,
    hora: [30, 100],
    perfis: ['ensino', 'comunicacao'],
    plataformas: ['Superprof', 'Profes', 'WhatsApp', 'Google Meet'],
    passos: [
      'Escolha uma matéria e um público (ex.: matemática do 6º ao 9º ano)',
      'Prepare uma aula experimental de 30 minutos',
      'Divulgue para pais em grupos da escola e do bairro',
      'Venda pacotes de 4 aulas com desconto',
    ],
    cuidado: 'Combine a política de faltas e remarcações antes da primeira aula.',
  },
  {
    id: 'doces',
    nome: 'Doces, bolos e marmitas',
    categoria: 'produto',
    resumo: 'Comida caseira por encomenda. Rápido para começar, exige cuidado com custo e higiene.',
    investimento: 2,
    semanasPrimeiraRenda: 1,
    hora: [15, 45],
    perfis: ['cozinha', 'manual', 'organizacao'],
    plataformas: ['WhatsApp Business', 'Instagram', 'iFood', 'Vizinhança'],
    passos: [
      'Escolha 3 produtos que você faz muito bem',
      'Calcule o custo de cada receita até o último grama',
      'Faça uma degustação para vizinhos e colegas',
      'Trabalhe com encomendas e dia fixo de entrega',
    ],
    cuidado: 'Procure a vigilância sanitária da sua cidade e considere se formalizar como MEI.',
  },
  {
    id: 'artesanato',
    nome: 'Artesanato e personalizados',
    categoria: 'produto',
    resumo: 'Velas, crochê, papelaria, lembrancinhas. Venda em marketplaces e redes sociais.',
    investimento: 2,
    semanasPrimeiraRenda: 4,
    hora: [12, 40],
    perfis: ['manual', 'visual'],
    plataformas: ['Elo7', 'Shopee', 'Instagram', 'Feiras locais'],
    passos: [
      'Escolha um nicho estreito (ex.: lembrancinhas de maternidade)',
      'Fotografe com luz natural e fundo neutro',
      'Precifique: material + horas × valor/hora + taxa da plataforma',
      'Faça kits com prazo de produção claro',
    ],
    cuidado: 'Inclua a taxa do marketplace e o frete no preço, senão o lucro some.',
  },
  {
    id: 'revenda',
    nome: 'Loja online e revenda',
    categoria: 'produto',
    resumo: 'Compre de fornecedores e revenda pela internet. Exige capital de giro e paciência.',
    investimento: 2,
    semanasPrimeiraRenda: 6,
    hora: [10, 40],
    perfis: ['organizacao', 'comunicacao'],
    plataformas: ['Mercado Livre', 'Shopee', 'Instagram', 'Nuvemshop'],
    passos: [
      'Pesquise produtos com demanda e pouca concorrência',
      'Comece com estoque pequeno, de 1 a 3 produtos',
      'Responda clientes em até 1 hora',
      'Reinvista o lucro dos primeiros 3 meses',
    ],
    cuidado: 'Fuja de “fornecedores” que exigem pagar um kit caro antes de você vender.',
  },
  {
    id: 'social',
    nome: 'Gestão de redes sociais',
    categoria: 'servico',
    resumo: 'Planeje e publique conteúdo para negócios que não têm tempo de cuidar do Instagram.',
    investimento: 0,
    semanasPrimeiraRenda: 4,
    hora: [25, 70],
    perfis: ['comunicacao', 'visual', 'organizacao'],
    plataformas: ['Instagram', 'Meta Business Suite', 'Canva', 'Indicações'],
    passos: [
      'Cuide do perfil de um conhecido por 30 dias como estudo de caso',
      'Meça seguidores, alcance e mensagens antes e depois',
      'Ofereça um plano mensal com número fixo de posts',
      'Envie relatório simples todo mês',
    ],
    cuidado: 'Nunca prometa número de seguidores ou vendas. Prometa constância e relatório.',
  },
  {
    id: 'video',
    nome: 'Edição de vídeo',
    categoria: 'servico',
    resumo: 'Cortes para Reels, TikTok e YouTube. Muita demanda de criadores e empresas.',
    investimento: 1,
    semanasPrimeiraRenda: 4,
    hora: [30, 80],
    perfis: ['visual', 'tecnico'],
    plataformas: ['CapCut', 'DaVinci Resolve', 'Workana', 'Criadores no Instagram'],
    passos: [
      'Aprenda CapCut ou DaVinci Resolve (gratuitos)',
      'Edite 5 vídeos de exemplo com estilos diferentes',
      'Ofereça cortes semanais para criadores pequenos',
      'Cobre por vídeo, não por hora, quando ganhar ritmo',
    ],
    cuidado: 'Use trilhas sonoras liberadas para não derrubar o vídeo do cliente.',
  },
  {
    id: 'conteudo',
    nome: 'Criação de conteúdo e afiliados',
    categoria: 'conteudo',
    resumo: 'Produza vídeos ou textos sobre um tema e ganhe com indicações e parcerias. Lento no início.',
    investimento: 0,
    semanasPrimeiraRenda: 24,
    hora: [0, 100],
    perfis: ['comunicacao', 'visual', 'ensino'],
    plataformas: ['YouTube', 'Instagram', 'TikTok', 'Programas de afiliados'],
    passos: [
      'Escolha um tema que você conseguiria falar por 100 vídeos',
      'Publique 3 vezes por semana durante 6 meses',
      'Indique só produtos que você usou de verdade',
      'Trate como negócio: anote o que funciona',
    ],
    cuidado: 'É a opção com renda mais incerta. Não dependa dela no começo.',
  },
  {
    id: 'costura',
    nome: 'Costura e consertos',
    categoria: 'produto',
    resumo: 'Ajustes de roupa, barras e reformas. Clientela local fiel e recorrente.',
    investimento: 2,
    semanasPrimeiraRenda: 1,
    hora: [20, 50],
    perfis: ['manual', 'organizacao'],
    plataformas: ['WhatsApp', 'Grupos do bairro', 'Lojas de roupa parceiras'],
    passos: [
      'Monte uma tabela de preços por tipo de serviço',
      'Deixe cartões em lavanderias e lojas de roupa',
      'Trabalhe com prazo de entrega fixo',
      'Fotografe antes e depois para divulgar',
    ],
    cuidado: 'Anote cada peça recebida com foto e nome do cliente para evitar trocas.',
  },
];

export const NIVEL_INVESTIMENTO = ['Nenhum', 'Baixo', 'Médio'];

export const PERGUNTAS = [
  {
    id: 'horas',
    texto: 'Quantas horas por semana você consegue dedicar?',
    opcoes: [
      { valor: 5, rotulo: 'Até 5 horas' },
      { valor: 15, rotulo: 'De 5 a 15 horas' },
      { valor: 30, rotulo: 'Mais de 15 horas' },
    ],
  },
  {
    id: 'investimento',
    texto: 'Quanto você pode investir para começar?',
    opcoes: [
      { valor: 0, rotulo: 'Nada por enquanto' },
      { valor: 1, rotulo: 'Até R$ 300' },
      { valor: 2, rotulo: 'Mais de R$ 300' },
    ],
  },
  {
    id: 'perfis',
    texto: 'Do que você mais gosta? Escolha até três.',
    multiplo: true,
    opcoes: Object.entries(PERFIS).map(([valor, rotulo]) => ({ valor, rotulo })),
  },
  {
    id: 'urgencia',
    texto: 'Em quanto tempo você precisa do primeiro dinheiro?',
    opcoes: [
      { valor: 2, rotulo: 'Nas próximas 2 semanas' },
      { valor: 8, rotulo: 'Em até 2 meses' },
      { valor: 52, rotulo: 'Posso construir com calma' },
    ],
  },
];

/** Pontua e ordena os métodos conforme as respostas do teste. */
export function recomendar(respostas, metodos = METODOS) {
  const perfis = respostas.perfis || [];
  const invest = respostas.investimento ?? 2;
  const urgencia = respostas.urgencia ?? 52;
  const horas = respostas.horas ?? 15;
  return metodos
    .map((m) => {
      let pontos = 0;
      for (const p of perfis) if (m.perfis.includes(p)) pontos += 30;
      if (m.investimento <= invest) pontos += 15;
      else pontos -= 25 * (m.investimento - invest);
      if (m.semanasPrimeiraRenda <= urgencia) pontos += 15;
      else pontos -= Math.min(30, (m.semanasPrimeiraRenda - urgencia) * 2);
      if (horas <= 5 && m.semanasPrimeiraRenda > 12) pontos -= 10;
      return { metodo: m, pontos };
    })
    .sort((a, b) => b.pontos - a.pontos);
}

/** Renda mensal estimada. */
export function calcularRenda({ horasSemana, valorHora, taxaPct = 0, custoMensal = 0 }) {
  const bruto = horasSemana * valorHora * 4.33;
  const taxa = bruto * (taxaPct / 100);
  const liquido = Math.max(0, bruto - taxa - custoMensal);
  return { bruto, taxa, custo: custoMensal, liquido };
}
