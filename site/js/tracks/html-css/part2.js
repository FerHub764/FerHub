import { md, mod, lesson, choice, fill, bug, web } from '../_dsl.js';

export default [
  mod('css-basico', 'CSS: primeiros estilos', 'Seletores, cores, fontes e a cascata.', [
    lesson('Como o CSS funciona', md`
      **CSS** (*Cascading Style Sheets*) define a **aparência**: cores, tamanhos, espaçamentos, layout.

      Uma regra CSS tem um **seletor** (quem) e **declarações** (como):

      ~~~css
      h1 {
        color: navy;
        font-size: 32px;
      }
      ~~~

      - \`h1\` é o seletor.
      - \`color: navy;\` é uma declaração: **propriedade**, dois-pontos, **valor**, ponto e vírgula.

      ## Onde escrever

      O jeito recomendado é um arquivo separado ligado no \`<head>\`:

      ~~~html
      <link rel="stylesheet" href="style.css">
      ~~~

      Nos exercícios, o editor **style.css** já está conectado à página.

      ## Seletores básicos

      ~~~css
      p { }            /* todos os <p> */
      .destaque { }    /* elementos com class="destaque" */
      #topo { }        /* o elemento com id="topo" */
      nav a { }        /* <a> dentro de <nav> */
      h1, h2 { }       /* h1 e h2 */
      a:hover { }      /* link com o mouse em cima */
      ~~~
    `, [
      web('Deixe o título `<h1>` com a cor **red** usando CSS (no editor style.css).', {
        html: '<h1>Promoção</h1>\n<p>Só hoje!</p>\n',
        css: '/* escreva seu CSS aqui */\n',
        checks: [
          { selector: 'h1', style: { color: 'red' }, message: 'O <h1> deve ficar vermelho (color: red).' },
          { selector: 'p', style: { color: 'rgb(27, 31, 36)' }, message: 'Mude só o título — o parágrafo deve continuar com a cor padrão.' },
        ],
        solution: { css: 'h1 {\n  color: red;\n}\n' },
      }),
    ]),
    lesson('Cores, textos e fontes', md`
      ## Cores

      ~~~css
      color: tomato;                 /* nome */
      color: #ff6347;                /* hexadecimal */
      color: rgb(255, 99, 71);       /* RGB */
      background-color: rgb(0 0 0 / 50%); /* com transparência */
      ~~~

      \`color\` muda o texto; \`background-color\` muda o fundo.

      ## Texto e fonte

      ~~~css
      body {
        font-family: "Inter", Arial, sans-serif;  /* lista de alternativas */
        font-size: 16px;
        line-height: 1.6;       /* espaço entre linhas */
      }
      h1 {
        font-weight: 700;       /* negrito */
        text-align: center;
        text-transform: uppercase;
      }
      a {
        text-decoration: none;  /* tira o sublinhado */
      }
      ~~~

      > 💡 Contraste importa: texto cinza-claro sobre branco é difícil de ler. Busque contraste de pelo menos 4.5:1 para textos comuns.
    `, [
      web('Estilize o parágrafo com a classe `aviso`: fundo **yellow** (`background-color`) e texto **centralizado** (`text-align: center`).', {
        html: '<p class="aviso">Sistema em manutenção</p>\n<p>Outro texto</p>\n',
        css: '',
        checks: [
          { selector: '.aviso', style: { 'background-color': 'yellow' }, message: '.aviso precisa de background-color: yellow.' },
          { selector: '.aviso', style: { 'text-align': 'center' }, message: '.aviso precisa de text-align: center.' },
        ],
        hint: 'Use o seletor de classe: .aviso { ... }',
        solution: { css: '.aviso {\n  background-color: yellow;\n  text-align: center;\n}\n' },
      }),
    ]),
    lesson('Cascata e especificidade', md`
      Quando duas regras brigam pelo mesmo elemento, quem ganha?

      1. **Especificidade**: seletores mais específicos vencem. \`#id\` > \`.classe\` > \`tag\`.
      2. **Ordem**: com a mesma especificidade, a regra que vem **depois** vence.

      ~~~css
      p { color: gray; }
      .nota { color: blue; }    /* vence o "p" para <p class="nota"> */
      p { color: green; }       /* não vence .nota (classe é mais específica) */
      ~~~

      ## Herança

      Algumas propriedades (como \`color\` e \`font-family\`) são **herdadas** pelos filhos. Por isso é comum definir a fonte no \`body\` e ela valer para a página toda.

      > ⚠️ Evite \`!important\`. Ele "fura a fila" da cascata e deixa o CSS difícil de manter.
    `, [
      choice('Dado `<p id="a" class="b">`, qual regra define a cor?', ['`p { color: red }`', '`.b { color: green }`', '`#a { color: blue }`', 'A última escrita, sempre'], 2, 'Seletores de id têm maior especificidade.'),
    ]),
  ], [
    fill('Complete a propriedade que muda a cor do **fundo**:', '.caixa {\n  ___: black;\n}', 'background-color', 'Também vale o atalho `background`.'),
    choice('Qual seletor escolhe elementos com `class="menu"`?', ['`#menu`', '`.menu`', '`menu`', '`*menu`'], 1, 'Classe usa ponto.'),
    bug('Qual linha tem erro de sintaxe CSS?', md`
      h2 {
        color: purple;
        font-size 24px;
        margin: 0;
      }
    `, 3, 'Faltam os dois-pontos: `font-size: 24px;`.'),
    choice('Qual tag liga um arquivo CSS externo?', ['`<style src>`', '`<css>`', '`<link rel="stylesheet">`', '`<script>`'], 2, '`<link rel="stylesheet" href="style.css">` no `<head>`.'),
    choice('Com a mesma especificidade, qual regra vence?', ['A primeira', 'A última', 'A mais curta', 'Nenhuma'], 1, 'A cascata favorece a que vem por último.'),
    choice('Qual propriedade tira o sublinhado dos links?', ['`text-style: none`', '`underline: false`', '`text-decoration: none`', '`font-line: 0`'], 2, '`text-decoration: none`.'),
  ]),

  mod('box-model', 'Modelo de caixa', 'margin, padding, border, display e unidades.', [
    lesson('Toda tag é uma caixa', md`
      Para o CSS, cada elemento é uma **caixa** com quatro camadas, de dentro para fora:

      1. **content** — o conteúdo (texto, imagem)
      2. **padding** — espaço interno, entre o conteúdo e a borda
      3. **border** — a borda
      4. **margin** — espaço externo, separando de outros elementos

      ~~~css
      .card {
        padding: 16px;
        border: 2px solid #333;
        margin: 24px;
        border-radius: 12px;  /* cantos arredondados */
      }
      ~~~

      ## Atalhos

      ~~~css
      margin: 10px;              /* os 4 lados */
      margin: 10px 20px;         /* vertical | horizontal */
      margin: 5px 10px 15px 20px;/* topo | direita | baixo | esquerda (sentido horário) */
      margin-top: 8px;           /* só um lado */
      margin: 0 auto;            /* centraliza um bloco com largura definida */
      ~~~

      ## box-sizing

      Por padrão, \`width\` mede só o conteúdo, e padding e borda são somados por fora — confuso! Quase todo projeto começa com:

      ~~~css
      *, *::before, *::after { box-sizing: border-box; }
      ~~~

      Assim, \`width: 300px\` significa 300px **incluindo** padding e borda.
    `, [
      web('Transforme a `.caixa` num card: `padding` de **20px**, borda `2px solid black` e `border-radius` de **8px**.', {
        html: '<div class="caixa">Conteúdo do card</div>\n',
        css: '.caixa {\n\n}\n',
        checks: [
          { selector: '.caixa', style: { 'padding-top': '20px', 'padding-left': '20px' }, message: 'Use padding: 20px.' },
          { selector: '.caixa', style: { 'border-top-width': '2px', 'border-top-style': 'solid' }, message: 'Use border: 2px solid black.' },
          { selector: '.caixa', style: { 'border-top-left-radius': '8px' }, message: 'Use border-radius: 8px.' },
        ],
        solution: { css: '.caixa {\n  padding: 20px;\n  border: 2px solid black;\n  border-radius: 8px;\n}\n' },
      }),
    ]),
    lesson('display: block, inline e none', md`
      | Valor | Comportamento | Exemplos padrão |
      |---|---|---|
      | \`block\` | ocupa a linha toda, aceita largura/altura | \`div\`, \`p\`, \`h1\`, \`section\` |
      | \`inline\` | fica no fluxo do texto, ignora largura/altura | \`span\`, \`a\`, \`strong\` |
      | \`inline-block\` | fica em linha, mas aceita largura/altura | botões |
      | \`none\` | some da página (não ocupa espaço) | — |

      ~~~css
      .menu a {
        display: inline-block;
        padding: 8px 12px;
      }
      .escondido { display: none; }
      ~~~

      Ainda veremos \`display: flex\` e \`display: grid\`, que organizam os **filhos** de um elemento.

      ## Unidades

      | Unidade | Relativa a |
      |---|---|
      | \`px\` | pixels (fixa) |
      | \`%\` | o elemento pai |
      | \`rem\` | tamanho da fonte da raiz (normalmente 16px) |
      | \`em\` | tamanho da fonte do próprio elemento |
      | \`vw\` / \`vh\` | 1% da largura / altura da janela |

      > 💡 Use \`rem\` para fontes e espaçamentos: respeita a preferência de tamanho de texto do usuário.
    `, [
      web('Esconda o elemento com a classe `.oculto` usando `display`.', {
        html: '<p>Visível</p>\n<p class="oculto">Não deveria aparecer</p>\n',
        css: '',
        checks: [{ selector: '.oculto', style: { display: 'none' }, message: 'Use display: none em .oculto.' }],
        solution: { css: '.oculto {\n  display: none;\n}\n' },
      }),
    ]),
  ], [
    choice('Qual camada fica **entre o conteúdo e a borda**?', ['margin', 'padding', 'outline', 'border'], 1, 'padding é o espaço interno.'),
    choice('`margin: 10px 20px` aplica:', ['10px em cima e 20px embaixo', '10px vertical e 20px horizontal', '10px à esquerda e 20px à direita', '30px em todos'], 1, 'Dois valores: vertical | horizontal.'),
    fill('Complete para incluir padding e borda na largura:', '* {\n  box-sizing: ___;\n}', 'border-box', '`border-box` facilita o cálculo de tamanhos.'),
    choice('Qual `display` faz o elemento sumir sem ocupar espaço?', ['`hidden`', '`invisible`', '`none`', '`0`'], 2, '`display: none`.'),
    choice('`1rem` normalmente equivale a:', ['1px', '10px', '16px', '100%'], 2, 'A fonte padrão da raiz costuma ser 16px.'),
    bug('Qual linha não tem efeito num `<span>` comum (inline)?', md`
      span {
        color: blue;
        width: 200px;
        font-weight: bold;
      }
    `, 3, 'Elementos inline ignoram `width`. Use `display: inline-block` para aceitar largura.'),
  ]),

  mod('flexbox', 'Flexbox', 'Alinhar e distribuir elementos em uma direção.', [
    lesson('Introdução ao Flexbox', md`
      Flexbox organiza os **filhos** de um contêiner em linha ou coluna, com alinhamento fácil:

      ~~~html
      <div class="barra">
        <span>Logo</span>
        <span>Menu</span>
        <span>Entrar</span>
      </div>
      ~~~

      ~~~css
      .barra {
        display: flex;
        justify-content: space-between; /* eixo principal */
        align-items: center;            /* eixo cruzado */
        gap: 16px;                      /* espaço entre os itens */
      }
      ~~~

      ## Os dois eixos

      - **Eixo principal**: a direção do \`flex-direction\` (\`row\`, padrão = horizontal; \`column\` = vertical).
      - \`justify-content\` alinha no eixo principal: \`flex-start\`, \`center\`, \`flex-end\`, \`space-between\`, \`space-around\`, \`space-evenly\`.
      - \`align-items\` alinha no eixo cruzado: \`stretch\` (padrão), \`center\`, \`flex-start\`, \`flex-end\`.

      > 💡 Centralizar qualquer coisa, vertical e horizontalmente: \`display: flex; justify-content: center; align-items: center;\`.
    `, [
      web('Use Flexbox na `.nav` para colocar os itens lado a lado com `justify-content: space-between` e `align-items: center`.', {
        html: '<nav class="nav">\n  <strong>Loja</strong>\n  <a href="#">Produtos</a>\n  <a href="#">Carrinho</a>\n</nav>\n',
        css: '.nav {\n  padding: 12px;\n  background: #eee;\n}\n',
        checks: [
          { selector: '.nav', style: { display: 'flex' }, message: '.nav precisa de display: flex.' },
          { selector: '.nav', style: { 'justify-content': 'space-between' }, message: 'Use justify-content: space-between.' },
          { selector: '.nav', style: { 'align-items': 'center' }, message: 'Use align-items: center.' },
        ],
        solution: { css: '.nav {\n  padding: 12px;\n  background: #eee;\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}\n' },
      }),
    ]),
    lesson('flex-wrap, flex-grow e flex-direction', md`
      ## Quebrando linha

      ~~~css
      .galeria {
        display: flex;
        flex-wrap: wrap;   /* itens descem para a próxima linha se não couberem */
        gap: 12px;
      }
      ~~~

      ## Crescendo para ocupar espaço

      ~~~css
      .busca input { flex: 1; }   /* ocupa todo o espaço que sobrar */
      ~~~

      \`flex: 1\` é um atalho para \`flex-grow: 1\`. Se dois itens têm \`flex: 1\` e um terceiro \`flex: 2\`, o terceiro fica com o dobro do espaço livre.

      ## Coluna

      ~~~css
      .lateral {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      ~~~

      Com \`flex-direction: column\`, os eixos trocam: \`justify-content\` passa a agir na vertical.
    `, [
      web('Faça os cards da `.lista` ficarem lado a lado **com quebra de linha** (`flex-wrap: wrap`) e um espaço (`column-gap` via `gap`) de **10px**.', {
        html: '<div class="lista">\n  <div class="card">1</div>\n  <div class="card">2</div>\n  <div class="card">3</div>\n</div>\n',
        css: '.card {\n  width: 120px;\n  padding: 20px;\n  background: #ffd8a8;\n}\n',
        checks: [
          { selector: '.lista', style: { display: 'flex' }, message: 'Use display: flex em .lista.' },
          { selector: '.lista', style: { 'flex-wrap': 'wrap' }, message: 'Use flex-wrap: wrap.' },
          { selector: '.lista', style: { 'column-gap': '10px' }, message: 'Use gap: 10px.' },
        ],
        solution: { css: '.card {\n  width: 120px;\n  padding: 20px;\n  background: #ffd8a8;\n}\n.lista {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 10px;\n}\n' },
      }),
    ]),
  ], [
    choice('Qual propriedade alinha no **eixo principal**?', ['`align-items`', '`justify-content`', '`align-content`', '`flex-wrap`'], 1, '`justify-content` atua no eixo principal.'),
    fill('Complete para transformar o contêiner em flex:', '.menu {\n  display: ___;\n}', 'flex', '`display: flex`.'),
    choice('Como centralizar um item vertical e horizontalmente num contêiner flex?', ['`text-align: center`', '`justify-content: center; align-items: center`', '`margin: center`', '`vertical-align: middle`'], 1, 'Os dois eixos centralizados.'),
    choice('O que `flex: 1` faz num item?', ['Esconde o item', 'Faz o item ocupar o espaço livre', 'Dá 1px de largura', 'Coloca em primeiro'], 1, '`flex-grow: 1` distribui o espaço restante.'),
    choice('Com `flex-direction: column`, `justify-content` age em qual direção?', ['Horizontal', 'Vertical', 'Nenhuma', 'Diagonal'], 1, 'O eixo principal passa a ser vertical.'),
    bug('Os itens não ficam lado a lado. Qual linha deveria estar no contêiner, mas está no item?', md`
      .container {
        gap: 8px;
      }
      .item {
        display: flex;
      }
    `, 5, '`display: flex` deve ir no **contêiner** (pai), não nos itens.'),
  ]),

  mod('grid', 'CSS Grid', 'Layouts em duas dimensões: linhas e colunas.', [
    lesson('Grid básico', md`
      Flexbox pensa em **uma** direção. Grid pensa em **linhas e colunas** ao mesmo tempo — perfeito para layouts de página e galerias.

      ~~~css
      .galeria {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;  /* 3 colunas iguais */
        gap: 16px;
      }
      ~~~

      A unidade \`fr\` significa "fração do espaço disponível". \`2fr 1fr\` cria uma coluna com o dobro da outra.

      ~~~css
      grid-template-columns: repeat(4, 1fr);          /* 4 colunas iguais */
      grid-template-columns: 250px 1fr;                /* barra lateral fixa + conteúdo */
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); /* responsivo! */
      ~~~

      A última linha é mágica: cria quantas colunas de no mínimo 200px couberem, sem precisar de media queries.
    `, [
      web('Transforme `.grade` num grid de **3 colunas iguais** (`repeat(3, 1fr)`) com `gap` de **12px**.', {
        html: '<div class="grade">\n  <div>A</div><div>B</div><div>C</div>\n  <div>D</div><div>E</div><div>F</div>\n</div>\n',
        css: '.grade div {\n  background: #a5d8ff;\n  padding: 16px;\n  text-align: center;\n}\n',
        checks: [
          { selector: '.grade', style: { display: 'grid' }, message: 'Use display: grid em .grade.' },
          { selector: '.grade', style: { 'column-gap': '12px', 'row-gap': '12px' }, message: 'Use gap: 12px.' },
          { selector: '.grade div:nth-child(4)', message: 'Mantenha os 6 itens.' },
        ],
        solution: { css: '.grade div {\n  background: #a5d8ff;\n  padding: 16px;\n  text-align: center;\n}\n.grade {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 12px;\n}\n' },
      }),
    ]),
    lesson('Posicionando itens e áreas', md`
      ## Ocupando várias células

      ~~~css
      .destaque {
        grid-column: span 2;   /* ocupa 2 colunas */
      }
      .banner {
        grid-column: 1 / -1;   /* da primeira à última linha de coluna */
      }
      ~~~

      ## grid-template-areas

      Desenhe o layout com nomes:

      ~~~css
      .pagina {
        display: grid;
        grid-template-columns: 220px 1fr;
        grid-template-areas:
          "topo   topo"
          "lado   conteudo"
          "rodape rodape";
        gap: 16px;
      }
      header { grid-area: topo; }
      aside  { grid-area: lado; }
      main   { grid-area: conteudo; }
      footer { grid-area: rodape; }
      ~~~

      ## Flexbox ou Grid?

      - **Flexbox**: itens em uma linha (menus, barras, botões alinhados).
      - **Grid**: estrutura em duas dimensões (páginas, galerias, dashboards).

      Eles combinam: um grid na página e flex dentro de cada card.
    `, [
      choice('Qual regra faz um item ocupar **duas colunas** do grid?', ['`grid-row: 2`', '`grid-column: span 2`', '`columns: 2`', '`flex: 2`'], 1, '`span 2` estende o item por duas trilhas.'),
    ]),
  ], [
    choice('O que significa `1fr`?', ['1 pixel', '1 fração do espaço disponível', '1 fonte', '1% da tela'], 1, '`fr` divide o espaço livre.'),
    fill('Complete para criar 4 colunas iguais:', 'grid-template-columns: ___(4, 1fr);', 'repeat', '`repeat(n, tamanho)`.'),
    choice('Para um layout de página com cabeçalho, lateral, conteúdo e rodapé, o mais indicado é:', ['float', 'Grid', 'tabelas', 'position: absolute'], 1, 'Grid é ideal para estruturas bidimensionais.'),
    choice('O que `grid-column: 1 / -1` faz?', ['Esconde o item', 'Ocupa da primeira à última coluna', 'Ocupa só a coluna 1', 'Inverte a ordem'], 1, '`-1` representa a última linha de grade.'),
    choice('O que `repeat(auto-fill, minmax(200px, 1fr))` permite?', ['Colunas fixas de 200px', 'Quantas colunas couberem, com no mínimo 200px', 'Uma única coluna', 'Linhas de 200px'], 1, 'Grid responsivo sem media query.'),
    bug('Qual linha impede o grid de funcionar?', md`
      .galeria {
        display: block;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
      }
    `, 2, 'É preciso `display: grid` para as outras propriedades terem efeito.'),
  ]),

  mod('responsivo', 'Design responsivo e acabamento', 'Media queries, mobile first, transições e acessibilidade.', [
    lesson('Media queries e mobile first', md`
      Um site **responsivo** se adapta a qualquer tela: celular, tablet, monitor.

      Primeiro, a meta tag obrigatória no \`<head>\`:

      ~~~html
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      ~~~

      ## Media queries

      Aplicam CSS só quando uma condição é verdadeira:

      ~~~css
      /* estilo base: celular (mobile first) */
      .produtos {
        display: grid;
        grid-template-columns: 1fr;
        gap: 12px;
      }

      /* telas a partir de 700px */
      @media (min-width: 700px) {
        .produtos { grid-template-columns: repeat(2, 1fr); }
      }

      /* telas a partir de 1100px */
      @media (min-width: 1100px) {
        .produtos { grid-template-columns: repeat(4, 1fr); }
      }
      ~~~

      **Mobile first** = escrever primeiro para telas pequenas e ir *adicionando* para as grandes com \`min-width\`. O CSS fica mais simples e o celular carrega menos regras.

      ## Imagens flexíveis

      ~~~css
      img { max-width: 100%; height: auto; }
      ~~~
    `, [
      web('Use uma **media query** com `max-width: 2000px` (sempre verdadeira aqui) para deixar o `h1` com `font-size` de **40px**.', {
        html: '<h1>Responsivo</h1>\n',
        css: 'h1 {\n  font-size: 24px;\n}\n',
        checks: [{ selector: 'h1', style: { 'font-size': '40px' }, message: 'Dentro de @media (max-width: 2000px) { ... } defina h1 { font-size: 40px; }.' }],
        hint: '@media (max-width: 2000px) {\n  h1 { font-size: 40px; }\n}',
        solution: { css: 'h1 {\n  font-size: 24px;\n}\n@media (max-width: 2000px) {\n  h1 {\n    font-size: 40px;\n  }\n}\n' },
      }),
    ]),
    lesson('Transições, variáveis e acessibilidade', md`
      ## Transições

      ~~~css
      .botao {
        background: #2f6fed;
        transition: background 0.2s ease, transform 0.2s ease;
      }
      .botao:hover {
        background: #1d4fbf;
        transform: translateY(-2px);
      }
      ~~~

      ## Variáveis CSS

      ~~~css
      :root {
        --cor-primaria: #2f6fed;
        --espaco: 16px;
      }
      .botao { background: var(--cor-primaria); padding: var(--espaco); }
      ~~~

      Mude a variável num lugar e todo o site acompanha — é assim que se faz **tema escuro**.

      ## Acessibilidade visual

      - Nunca remova o contorno de foco (\`outline\`) sem colocar outro: quem navega pelo teclado precisa vê-lo.
      - Não use **só cor** para passar informação (ex.: erro só em vermelho). Adicione texto ou ícone.
      - Respeite \`prefers-reduced-motion\` para quem passa mal com animações.

      ~~~css
      :focus-visible { outline: 3px solid var(--cor-primaria); }
      ~~~

      🎉 Você terminou a trilha de HTML & CSS! Próximo passo natural: **JavaScript**, para dar comportamento às suas páginas.
    `, [
      web('Crie a variável `--destaque` com valor `orange` em `:root` e use-a como `color` do `.titulo`.', {
        html: '<h2 class="titulo">Ofertas</h2>\n',
        css: ':root {\n\n}\n',
        checks: [{ selector: '.titulo', style: { color: 'orange' }, message: 'Defina --destaque: orange em :root e use color: var(--destaque) em .titulo.' }],
        solution: { css: ':root {\n  --destaque: orange;\n}\n.titulo {\n  color: var(--destaque);\n}\n' },
      }),
    ]),
  ], [
    choice('Qual meta tag é essencial para sites responsivos?', ['`<meta charset>`', '`<meta name="viewport">`', '`<meta name="mobile">`', '`<meta responsive>`'], 1, 'Sem ela, o celular simula uma tela larga e reduz tudo.'),
    choice('O que significa *mobile first*?', ['Fazer só a versão de celular', 'Escrever o CSS base para telas pequenas e ampliar com `min-width`', 'Usar apenas `max-width`', 'Carregar o site primeiro no celular'], 1, 'Base para o celular, camadas para telas maiores.'),
    fill('Complete para usar uma variável CSS:', 'color: ___(--cor-primaria);', 'var', '`var(--nome)`.'),
    choice('Qual regra deixa imagens flexíveis?', ['`img { width: 1000px }`', '`img { max-width: 100%; height: auto }`', '`img { display: none }`', '`img { float: left }`'], 1, 'Nunca ultrapassam a largura do contêiner.'),
    choice('Por que não remover o `outline` de foco?', ['Ele deixa o site lento', 'Quem usa teclado precisa ver onde está', 'É obrigatório pelo HTML', 'Não tem motivo'], 1, 'O foco visível é essencial para acessibilidade.'),
    bug('Qual linha tem erro na media query?', md`
      .card { padding: 8px; }
      @media min-width: 600px {
        .card { padding: 24px; }
      }
    `, 2, 'A condição vai entre parênteses: `@media (min-width: 600px)`.'),
  ]),
];
