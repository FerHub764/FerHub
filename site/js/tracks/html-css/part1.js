import { md, mod, lesson, choice, fill, bug, web } from '../_dsl.js';

export default [
  mod('html-intro', 'Primeira página', 'Tags, estrutura de um documento e textos.', [
    lesson('O que é HTML?', md`
      **HTML** (*HyperText Markup Language*) é a linguagem que descreve a **estrutura** de uma página: o que é título, o que é parágrafo, onde há uma imagem ou um link. Não é uma linguagem de programação — é uma linguagem de **marcação**.

      Você marca o conteúdo com **tags**:

      ~~~html
      <p>Este é um parágrafo.</p>
      ~~~

      - \`<p>\` é a tag de **abertura**.
      - \`</p>\` é a tag de **fechamento** (com barra).
      - O conjunto todo é um **elemento**.

      Algumas tags não têm conteúdo e não fecham, como \`<br>\` (quebra de linha) e \`<img>\`.

      ## Títulos e parágrafos

      ~~~html
      <h1>Título principal</h1>
      <h2>Subtítulo</h2>
      <p>Um parágrafo de texto.</p>
      ~~~

      Existem seis níveis: \`<h1>\` (mais importante) até \`<h6>\`. Use **um único \`<h1>\`** por página e siga a hierarquia, como num sumário.
    `, [
      web('Crie um título `<h1>` com o texto **Meu primeiro site** e, abaixo, um parágrafo `<p>` com qualquer texto.', {
        html: '<!-- escreva seu HTML aqui -->\n',
        checks: [
          { selector: 'h1', text: 'Meu primeiro site', message: 'Crie um <h1> com o texto "Meu primeiro site".' },
          { selector: 'p', message: 'Adicione um parágrafo <p>.' },
        ],
        hint: '<h1>Meu primeiro site</h1>\n<p>Olá!</p>',
        solution: { html: '<h1>Meu primeiro site</h1>\n<p>Bem-vindo à minha página.</p>\n' },
      }),
    ]),
    lesson('Estrutura de um documento', md`
      Todo arquivo HTML completo segue este esqueleto:

      ~~~html
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Minha página</title>
        </head>
        <body>
          <h1>Olá!</h1>
        </body>
      </html>
      ~~~

      | Parte | Para quê |
      |---|---|
      | \`<!DOCTYPE html>\` | avisa que é HTML moderno (HTML5) |
      | \`<html lang="pt-BR">\` | raiz da página, com o idioma |
      | \`<head>\` | informações *sobre* a página (não aparecem no corpo) |
      | \`<meta charset="UTF-8">\` | permite acentos e emojis |
      | \`<title>\` | texto da aba do navegador |
      | \`<body>\` | tudo o que aparece na tela |

      > 💡 Nos exercícios daqui você escreve só o conteúdo do \`<body>\` — o restante já está pronto.

      ## Atributos

      Tags podem ter **atributos**, que dão informações extras: \`<html lang="pt-BR">\`. O formato é sempre \`nome="valor"\`.
    `, [
      choice('Onde fica o conteúdo **visível** da página?', ['`<head>`', '`<title>`', '`<body>`', '`<meta>`'], 2, 'Tudo que aparece na tela fica dentro de `<body>`.'),
      fill('Complete a tag que define o texto da aba do navegador:', '<___>Loja da Ana</___>', 'title', 'A tag `<title>` fica dentro do `<head>`.'),
    ]),
    lesson('Formatando textos', md`
      ~~~html
      <p>Texto com <strong>importância forte</strong> e <em>ênfase</em>.</p>
      <p>Primeira linha<br>Segunda linha</p>
      <hr>
      <p>Fórmula da água: H<sub>2</sub>O · Área: m<sup>2</sup></p>
      <blockquote>Uma citação longa de alguém.</blockquote>
      <p>Use o comando <code>git status</code>.</p>
      ~~~

      | Tag | Significado |
      |---|---|
      | \`<strong>\` | importante (aparece em negrito) |
      | \`<em>\` | ênfase (aparece em itálico) |
      | \`<br>\` | quebra de linha |
      | \`<hr>\` | linha divisória temática |
      | \`<code>\` | trecho de código |

      > ℹ️ HTML descreve **significado**, não aparência. \`<strong>\` diz "isto é importante"; leitores de tela até mudam o tom de voz. A aparência fica a cargo do CSS.

      ## Comentários

      ~~~html
      <!-- isto não aparece na página -->
      ~~~
    `, [
      web('Escreva um parágrafo com a frase **Estudar todo dia faz diferença**, deixando a palavra *diferença* dentro de `<strong>`.', {
        html: '<p>Estudar todo dia faz diferença</p>\n',
        checks: [
          { selector: 'p', text: 'Estudar todo dia faz', message: 'Mantenha o parágrafo com a frase.' },
          { selector: 'p strong', text: 'diferença', message: 'Coloque a palavra "diferença" dentro de <strong>, dentro do parágrafo.' },
        ],
        solution: { html: '<p>Estudar todo dia faz <strong>diferença</strong></p>\n' },
      }),
    ]),
  ], [
    choice('O que significa HTML?', ['HyperText Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language', 'Hyperlink Text Machine Language'], 0, 'HTML = HyperText Markup Language.'),
    choice('Qual tag representa o título **mais importante**?', ['`<h6>`', '`<head>`', '`<h1>`', '`<title>`'], 2, '`<h1>` é o nível mais alto de título.'),
    bug('Qual linha está com a tag mal fechada?', md`
      <h1>Receitas</h1>
      <p>Bolo de cenoura</p>
      <p>Pão de queijo<p>
      <p>Brigadeiro</p>
    `, 3, 'O fechamento precisa da barra: `</p>`.'),
    fill('Complete para deixar o texto com importância forte:', '<___>Atenção!</___>', 'strong', '`<strong>` indica importância.'),
    choice('Para que serve `<meta charset="UTF-8">`?', ['Mudar a cor da página', 'Permitir acentos e caracteres especiais', 'Criar um link', 'Definir o título'], 1, 'UTF-8 cobre praticamente todos os caracteres do mundo.'),
    choice('Qual é a forma correta de um atributo?', ['`<html lang:pt-BR>`', '`<html lang="pt-BR">`', '`<html (lang pt-BR)>`', '`<html pt-BR=lang>`'], 1, 'Atributos seguem `nome="valor"`.'),
  ]),

  mod('links-midia', 'Links, imagens e listas', 'Ligando páginas, mostrando imagens e organizando itens.', [
    lesson('Links', md`
      A tag \`<a>\` (*anchor*) cria links. O destino vai no atributo \`href\`:

      ~~~html
      <a href="https://www.wikipedia.org">Visite a Wikipédia</a>
      <a href="contato.html">Página de contato</a>
      <a href="#rodape">Ir para o rodapé</a>
      <a href="mailto:oi@exemplo.com">Mande um e-mail</a>
      ~~~

      - **Absoluto**: endereço completo, com \`https://\`.
      - **Relativo**: arquivo do seu próprio site (\`contato.html\`).
      - **Âncora**: \`#id\` pula para um elemento da mesma página que tenha \`id="rodape"\`.

      Para abrir em nova aba:

      ~~~html
      <a href="https://exemplo.com" target="_blank" rel="noopener">Abrir em nova aba</a>
      ~~~

      > 💡 Escreva textos de link que façam sentido sozinhos. "Veja o cardápio" é melhor que "clique aqui".
    `, [
      web('Crie um link com o texto **Documentação do HTML** apontando para `https://developer.mozilla.org` e que abra em **nova aba**.', {
        html: '',
        checks: [
          { selector: 'a', text: 'Documentação do HTML', message: 'Crie um <a> com o texto "Documentação do HTML".' },
          { selector: 'a', attr: { href: 'https://developer.mozilla.org' }, message: 'O href deve ser https://developer.mozilla.org' },
          { selector: 'a', attr: { target: '_blank' }, message: 'Use target="_blank" para abrir em nova aba.' },
        ],
        solution: { html: '<a href="https://developer.mozilla.org" target="_blank" rel="noopener">Documentação do HTML</a>\n' },
      }),
    ]),
    lesson('Imagens', md`
      ~~~html
      <img src="gato.jpg" alt="Gato laranja dormindo no sofá" width="300">
      ~~~

      - \`src\`: caminho ou endereço da imagem.
      - \`alt\`: **texto alternativo**. Aparece se a imagem não carregar e é lido por leitores de tela para pessoas cegas. É obrigatório para acessibilidade.
      - \`width\` / \`height\`: tamanho em pixels (evita a página "pular" enquanto carrega).

      > ⚠️ Escreva o \`alt\` descrevendo o conteúdo da imagem, não "imagem" ou "foto". Se a imagem for só decorativa, use \`alt=""\`.

      ## Imagem com legenda

      ~~~html
      <figure>
        <img src="grafico.png" alt="Vendas subindo de janeiro a junho">
        <figcaption>Vendas no 1º semestre</figcaption>
      </figure>
      ~~~

      Formatos comuns: **JPG** (fotos), **PNG** (transparência), **SVG** (ícones e logos que não perdem qualidade), **WebP** (moderno e leve).
    `, [
      web('Adicione uma imagem com `src="https://placehold.co/200x120"` e um `alt` descrevendo-a (qualquer texto não vazio).', {
        html: '',
        checks: [
          { selector: 'img', attr: { src: 'https://placehold.co/200x120' }, message: 'Crie um <img> com o src indicado.' },
          { selector: 'img[alt]:not([alt=""])', message: 'Toda imagem com conteúdo precisa de um alt descritivo.' },
        ],
        solution: { html: '<img src="https://placehold.co/200x120" alt="Retângulo cinza de exemplo">\n' },
      }),
    ]),
    lesson('Listas', md`
      ## Lista não ordenada (marcadores)

      ~~~html
      <ul>
        <li>Arroz</li>
        <li>Feijão</li>
        <li>Farofa</li>
      </ul>
      ~~~

      ## Lista ordenada (números)

      ~~~html
      <ol>
        <li>Ferva a água</li>
        <li>Coloque o macarrão</li>
        <li>Espere 8 minutos</li>
      </ol>
      ~~~

      Cada item é um \`<li>\` (*list item*). Listas podem ser **aninhadas**: coloque uma \`<ul>\` dentro de um \`<li>\`.

      > 💡 Menus de navegação geralmente são listas de links: \`<ul><li><a href="...">Início</a></li>...</ul>\`.
    `, [
      web('Crie uma **lista ordenada** com exatamente **3 passos** para fazer café.', {
        html: '',
        checks: [
          { selector: 'ol', message: 'Use uma lista ordenada <ol>.' },
          { selector: 'ol > li', count: 3, message: 'A lista precisa ter exatamente 3 itens <li>.' },
        ],
        solution: { html: '<ol>\n  <li>Ferva a água</li>\n  <li>Coloque o pó no filtro</li>\n  <li>Despeje a água devagar</li>\n</ol>\n' },
      }),
    ]),
  ], [
    choice('Qual atributo define o destino de um link?', ['`src`', '`href`', '`link`', '`to`'], 1, '`<a href="...">`.'),
    choice('Por que o atributo `alt` é importante?', ['Deixa a imagem maior', 'Descreve a imagem para leitores de tela e quando ela não carrega', 'Muda o formato', 'É obrigatório para links'], 1, 'Acessibilidade e fallback.'),
    fill('Complete a lista com marcadores:', '<___>\n  <li>Item</li>\n</___>', 'ul', '`<ul>` = unordered list.'),
    bug('Qual linha tem erro?', md`
      <ol>
        <li>Primeiro</li>
        <item>Segundo</item>
        <li>Terceiro</li>
      </ol>
    `, 3, 'Itens de lista usam `<li>`, não `<item>`.'),
    choice('Como fazer um link abrir em nova aba?', ['`new="tab"`', '`target="_blank"`', '`open="new"`', '`href="_blank"`'], 1, '`target="_blank"` (com `rel="noopener"` por segurança).'),
    choice('Qual formato é melhor para um logo que precisa ficar nítido em qualquer tamanho?', ['JPG', 'PNG', 'SVG', 'GIF'], 2, 'SVG é vetorial: não perde qualidade ao ampliar.'),
  ]),

  mod('semantica', 'HTML semântico e tabelas', 'Organizar a página com significado e exibir dados.', [
    lesson('Tags semânticas', md`
      Antes, tudo era feito com \`<div>\` (uma caixa genérica). O HTML5 trouxe tags que **dizem o que o conteúdo é**:

      ~~~html
      <header>
        <h1>Blog da Ana</h1>
        <nav>
          <a href="/">Início</a>
          <a href="/sobre">Sobre</a>
        </nav>
      </header>
      <main>
        <article>
          <h2>Como aprendi a programar</h2>
          <p>...</p>
        </article>
        <aside>Posts relacionados</aside>
      </main>
      <footer>© 2026 Ana</footer>
      ~~~

      | Tag | Uso |
      |---|---|
      | \`<header>\` | cabeçalho (da página ou de uma seção) |
      | \`<nav>\` | navegação principal |
      | \`<main>\` | conteúdo principal (um por página) |
      | \`<article>\` | conteúdo independente: post, notícia, card de produto |
      | \`<section>\` | seção temática com título |
      | \`<aside>\` | conteúdo complementar |
      | \`<footer>\` | rodapé |

      Por que importa? **Acessibilidade** (leitores de tela navegam por essas regiões), **SEO** (o Google entende melhor a página) e **código mais legível**.
    `, [
      web('Monte o esqueleto semântico: um `<header>` com um `<h1>`, um `<main>` com um `<article>` e um `<footer>`.', {
        html: '',
        checks: [
          { selector: 'header h1', message: 'Coloque um <h1> dentro de <header>.' },
          { selector: 'main article', message: 'Coloque um <article> dentro de <main>.' },
          { selector: 'footer', message: 'Adicione um <footer>.' },
        ],
        solution: { html: '<header>\n  <h1>Meu blog</h1>\n</header>\n<main>\n  <article>\n    <h2>Primeiro post</h2>\n    <p>Olá!</p>\n  </article>\n</main>\n<footer>© 2026</footer>\n' },
      }),
    ]),
    lesson('div e span', md`
      Quando nenhuma tag semântica serve, use as genéricas:

      - \`<div>\`: caixa de **bloco** (ocupa a linha inteira). Usada para agrupar e montar layout.
      - \`<span>\`: caixa **em linha** (fica no meio do texto). Usada para estilizar um trecho.

      ~~~html
      <div class="card">
        <p>Preço: <span class="preco">R$ 49,90</span></p>
      </div>
      ~~~

      ## class e id

      - \`class\`: um "rótulo" que **vários** elementos podem compartilhar. Usado pelo CSS e pelo JavaScript.
      - \`id\`: identificador **único** na página.

      ~~~html
      <p class="alerta">Atenção</p>
      <p class="alerta">Cuidado</p>
      <section id="contato">...</section>
      ~~~
    `, [
      choice('Qual a diferença entre `class` e `id`?', ['Não há diferença', '`id` deve ser único; `class` pode se repetir', '`class` é única; `id` se repete', '`id` só funciona em `<div>`'], 1, 'Um `id` identifica um único elemento.'),
    ]),
    lesson('Tabelas', md`
      Tabelas servem para **dados tabulares** (não para montar layout!):

      ~~~html
      <table>
        <caption>Notas do bimestre</caption>
        <thead>
          <tr>
            <th>Aluno</th>
            <th>Nota</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Ana</td>
            <td>9</td>
          </tr>
          <tr>
            <td>Bruno</td>
            <td>7</td>
          </tr>
        </tbody>
      </table>
      ~~~

      | Tag | Papel |
      |---|---|
      | \`<table>\` | a tabela |
      | \`<tr>\` | linha (*table row*) |
      | \`<th>\` | célula de cabeçalho |
      | \`<td>\` | célula de dados |
      | \`<thead>\` / \`<tbody>\` | agrupam cabeçalho e corpo |
      | \`<caption>\` | título da tabela |

      Para uma célula ocupar várias colunas: \`<td colspan="2">\`.
    `, [
      web('Crie uma tabela com uma linha de cabeçalho (`<th>`: **Produto** e **Preço**) e **2 linhas** de dados com `<td>`.', {
        html: '<table>\n\n</table>\n',
        checks: [
          { selector: 'table th', count: 2, message: 'Crie exatamente 2 células de cabeçalho <th>.' },
          { selector: 'table th', text: 'Produto', message: 'Um dos cabeçalhos deve ser "Produto".' },
          { selector: 'table tr td', count: 4, message: 'São 2 linhas de dados com 2 células <td> cada (4 no total).' },
        ],
        solution: { html: '<table>\n  <tr><th>Produto</th><th>Preço</th></tr>\n  <tr><td>Café</td><td>R$ 18</td></tr>\n  <tr><td>Pão</td><td>R$ 1</td></tr>\n</table>\n' },
      }),
    ]),
  ], [
    choice('Qual tag representa o conteúdo **principal** da página?', ['`<section>`', '`<main>`', '`<body>`', '`<div>`'], 1, '`<main>` deve aparecer uma vez por página.'),
    choice('Qual tag é adequada para um post de blog independente?', ['`<aside>`', '`<article>`', '`<nav>`', '`<span>`'], 1, '`<article>` é para conteúdo que faz sentido sozinho.'),
    fill('Complete com a tag de célula de cabeçalho da tabela:', '<tr>\n  <___>Nome</___>\n</tr>', 'th', '`<th>` = table header.'),
    choice('Qual é **em linha** (não quebra a linha)?', ['`<div>`', '`<p>`', '`<span>`', '`<section>`'], 2, '`<span>` é inline; os outros são blocos.'),
    bug('Qual linha está errada para uma tabela?', md`
      <table>
        <tr>
          <td>Ana</td>
          <li>9</li>
        </tr>
      </table>
    `, 4, 'Células de dados usam `<td>`; `<li>` é item de lista.'),
    choice('Por que usar tags semânticas?', ['Deixam a página colorida', 'Melhoram acessibilidade, SEO e legibilidade', 'São obrigatórias para o CSS', 'Fazem a página carregar sem internet'], 1, 'Elas comunicam o significado do conteúdo.'),
  ]),

  mod('formularios', 'Formulários', 'Campos, rótulos, botões e validação nativa.', [
    lesson('Formulários e campos', md`
      Formulários coletam dados do usuário:

      ~~~html
      <form action="/cadastro" method="post">
        <label for="nome">Nome</label>
        <input id="nome" name="nome" type="text">

        <label for="email">E-mail</label>
        <input id="email" name="email" type="email">

        <button type="submit">Cadastrar</button>
      </form>
      ~~~

      - \`<label for="x">\` liga o rótulo ao campo com \`id="x"\`. Clicar no rótulo foca o campo, e leitores de tela anunciam o nome certo. **Sempre use labels.**
      - \`name\` é o nome com que o dado é enviado.

      ## Tipos de input

      | type | Para |
      |---|---|
      | \`text\` | texto curto |
      | \`email\` | e-mail (valida o formato) |
      | \`password\` | senha (esconde os caracteres) |
      | \`number\` | números |
      | \`date\` | data (abre calendário) |
      | \`checkbox\` | marcar várias opções |
      | \`radio\` | escolher uma entre várias |

      Para textos longos: \`<textarea>\`. Para listas de opções: \`<select>\` com \`<option>\`.
    `, [
      web('Crie um formulário com um campo de **e-mail** (`type="email"`) que tenha um `<label>` ligado a ele (via `for`/`id`) e um botão de envio.', {
        html: '<form>\n\n</form>\n',
        checks: [
          { selector: 'form input[type="email"][id]', message: 'Crie um <input type="email"> com um id.' },
          { selector: 'form label[for]', message: 'Crie um <label> com o atributo for.' },
          { selector: 'form button, form input[type="submit"]', message: 'Adicione um botão de envio.' },
        ],
        hint: 'O valor de for no label deve ser igual ao id do input.',
        solution: { html: '<form>\n  <label for="email">E-mail</label>\n  <input id="email" name="email" type="email">\n  <button type="submit">Enviar</button>\n</form>\n' },
      }),
    ]),
    lesson('Validação nativa', md`
      O HTML já valida muita coisa sozinho, antes de enviar:

      ~~~html
      <input type="email" required>
      <input type="text" minlength="3" maxlength="40">
      <input type="number" min="1" max="10">
      <input type="text" pattern="[0-9]{5}-[0-9]{3}" placeholder="00000-000">
      ~~~

      | Atributo | Efeito |
      |---|---|
      | \`required\` | campo obrigatório |
      | \`minlength\` / \`maxlength\` | tamanho do texto |
      | \`min\` / \`max\` | limites numéricos |
      | \`pattern\` | expressão regular (formato) |
      | \`placeholder\` | dica dentro do campo |

      > ⚠️ \`placeholder\` **não substitui** o \`<label>\`: ele some quando a pessoa começa a digitar.

      > ⚠️ Validação no navegador é conforto para o usuário, não segurança. O servidor **sempre** precisa validar de novo.
    `, [
      web('Crie um campo de texto para **nome** que seja **obrigatório** e tenha **no mínimo 3 caracteres**, com label.', {
        html: '<form>\n  <label for="nome">Nome</label>\n  <input id="nome" type="text">\n  <button>Enviar</button>\n</form>\n',
        checks: [
          { selector: '#nome', attr: { required: true }, message: 'Torne o campo obrigatório com required.' },
          { selector: '#nome', attr: { minlength: '3' }, message: 'Use minlength="3".' },
        ],
        solution: { html: '<form>\n  <label for="nome">Nome</label>\n  <input id="nome" type="text" required minlength="3">\n  <button>Enviar</button>\n</form>\n' },
      }),
    ]),
  ], [
    choice('Qual `type` esconde os caracteres digitados?', ['`hidden`', '`secret`', '`password`', '`private`'], 2, '`type="password"`.'),
    choice('Para escolher **uma** opção entre várias, use:', ['checkbox', 'radio', 'textarea', 'range'], 1, 'Radios com o mesmo `name` permitem só uma escolha.'),
    fill('Complete para tornar o campo obrigatório:', '<input type="email" ___>', 'required', '`required` impede o envio vazio.'),
    choice('Por que ligar `<label for>` ao `id` do campo?', ['Para mudar a cor', 'Acessibilidade e clique no rótulo focar o campo', 'Para enviar mais rápido', 'É só estética'], 1, 'Leitores de tela anunciam o rótulo correto.'),
    bug('Qual linha tem o rótulo desconectado do campo?', md`
      <form>
        <label for="cidade">Cidade</label>
        <input id="city" type="text">
        <button>OK</button>
      </form>
    `, 3, 'O `id` deveria ser `cidade`, igual ao `for` do label.'),
    choice('A validação do HTML garante segurança?', ['Sim, totalmente', 'Não, o servidor também precisa validar', 'Só com `pattern`', 'Só em celulares'], 1, 'Qualquer pessoa pode burlar o navegador.'),
  ]),
];
