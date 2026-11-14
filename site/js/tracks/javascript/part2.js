import { md, mod, lesson, choice, predict, fill, bug, run } from '../_dsl.js';

export default [
  mod('arrays', 'Arrays', 'Listas de valores e os métodos map, filter e reduce.', [
    lesson('Criando e modificando arrays', md`
      ~~~js
      const cores = ["azul", "verde", "roxo"];
      console.log(cores[0]);      // azul
      console.log(cores.length);  // 3
      ~~~

      | Método | O que faz |
      |---|---|
      | \`push(x)\` | adiciona no fim |
      | \`pop()\` | remove do fim |
      | \`unshift(x)\` | adiciona no início |
      | \`shift()\` | remove do início |
      | \`includes(x)\` | \`true\` se existe |
      | \`indexOf(x)\` | posição (ou -1) |
      | \`join(sep)\` | junta em string |

      ~~~js
      cores.push("amarelo");
      cores.shift();
      console.log(cores.join(", ")); // verde, roxo, amarelo
      ~~~

      > 💡 Um array declarado com \`const\` **pode** ter o conteúdo alterado. O \`const\` só impede trocar o array inteiro por outro.

      ## Spread

      \`...\` "espalha" os itens de um array:

      ~~~js
      const a = [1, 2];
      const b = [...a, 3, 4];       // [1, 2, 3, 4]
      console.log(Math.max(...b));  // 4
      ~~~
    `, [
      predict('Qual é a saída?', 'const n = [5, 10];\nn.push(15);\nn.unshift(0);\nconsole.log(n);', '[0, 5, 10, 15]', '0 entra no início e 15 no fim.'),
    ]),
    lesson('map, filter e find', md`
      Esses métodos recebem uma **função** e criam um resultado novo, sem alterar o array original.

      ## map: transforma cada item

      ~~~js
      const precos = [10, 20, 30];
      const comDesconto = precos.map((p) => p * 0.9);
      console.log(comDesconto); // [9, 18, 27]
      ~~~

      ## filter: mantém só o que passa no teste

      ~~~js
      const idades = [12, 25, 17, 40];
      const adultos = idades.filter((i) => i >= 18);
      console.log(adultos); // [25, 40]
      ~~~

      ## find: devolve o primeiro que passa

      ~~~js
      const usuarios = [{ nome: "Ana", ativo: false }, { nome: "Bia", ativo: true }];
      console.log(usuarios.find((u) => u.ativo).nome); // Bia
      ~~~

      Também existem \`some\` (algum passa?), \`every\` (todos passam?) e \`forEach\` (só percorre).
    `, [
      run('Use `filter` e depois `map` para obter os **quadrados dos números pares** e mostre o array.', 'const nums = [1, 2, 3, 4, 5, 6];\n', '[4, 16, 36]', {
        hint: 'nums.filter((n) => n % 2 === 0).map((n) => n * n)',
        solution: 'const nums = [1, 2, 3, 4, 5, 6];\nconst r = nums.filter((n) => n % 2 === 0).map((n) => n * n);\nconsole.log(r);',
      }),
    ]),
    lesson('reduce e sort', md`
      ## reduce: reduz o array a um único valor

      ~~~js
      const carrinho = [30, 15, 55];
      const total = carrinho.reduce((acumulado, item) => acumulado + item, 0);
      console.log(total); // 100
      ~~~

      O segundo argumento (\`0\`) é o valor inicial do acumulador. A cada item, a função recebe o acumulado até ali e devolve o novo acumulado.

      ## sort

      > ⚠️ Por padrão, \`sort()\` ordena como **texto**: \`[10, 9, 1].sort()\` vira \`[1, 10, 9]\`!

      Para números, passe uma função de comparação:

      ~~~js
      const n = [10, 9, 1, 25];
      n.sort((a, b) => a - b);
      console.log(n); // [1, 9, 10, 25]
      ~~~

      \`sort\` **altera** o array original. Para não alterar, use \`[...n].sort(...)\` ou \`n.toSorted(...)\`.
    `, [
      run('Use `reduce` para calcular o total de itens no estoque e mostre `Total: 42`.', 'const estoque = [{ item: "caneta", qtd: 20 }, { item: "lápis", qtd: 15 }, { item: "borracha", qtd: 7 }];\n', 'Total: 42', {
        hint: 'estoque.reduce((soma, p) => soma + p.qtd, 0)',
        solution: 'const estoque = [{ item: "caneta", qtd: 20 }, { item: "lápis", qtd: 15 }, { item: "borracha", qtd: 7 }];\nconst total = estoque.reduce((soma, p) => soma + p.qtd, 0);\nconsole.log("Total:", total);',
      }),
    ]),
  ], [
    predict('Qual é a saída?', 'console.log([1, 2, 3].map((x) => x * 2));', '[2, 4, 6]', '`map` aplica a função a cada item.'),
    predict('Qual é a saída?', 'console.log([3, 8, 1, 9].filter((x) => x > 4).length);', '2', 'Só 8 e 9 passam.'),
    predict('Qual é a saída?', 'console.log([1, 2, 3, 4].reduce((a, b) => a + b, 10));', '20', '10 + 1 + 2 + 3 + 4.'),
    choice('Qual método devolve **o primeiro** item que satisfaz uma condição?', ['`filter`', '`map`', '`find`', '`some`'], 2, '`find` retorna o item (ou undefined).'),
    fill('Complete para adicionar ao final do array:', 'lista.___("novo");', 'push', '`push` adiciona ao final.'),
    predict('Qual é a saída?', 'console.log([10, 9, 1].sort());', '[1, 10, 9]', 'Sem comparador, `sort` ordena como texto.'),
  ]),

  mod('objetos', 'Objetos e classes', 'Objetos literais, desestruturação, JSON e classes.', [
    lesson('Objetos', md`
      Objetos agrupam dados relacionados em pares **chave: valor**:

      ~~~js
      const livro = {
        titulo: "O Alquimista",
        autor: "Paulo Coelho",
        paginas: 208,
        lido: true,
      };

      console.log(livro.titulo);       // notação de ponto
      console.log(livro["autor"]);     // notação de colchetes
      livro.paginas = 210;             // altera
      livro.ano = 1988;                // adiciona
      delete livro.lido;               // remove
      ~~~

      ## Métodos

      ~~~js
      const conta = {
        saldo: 100,
        depositar(valor) {
          this.saldo += valor;
        },
      };
      conta.depositar(50);
      console.log(conta.saldo); // 150
      ~~~

      \`this\` se refere ao próprio objeto.

      ## Percorrendo

      ~~~js
      for (const [chave, valor] of Object.entries({ a: 1, b: 2 })) {
        console.log(chave, valor);
      }
      console.log(Object.keys({ a: 1, b: 2 })); // ["a", "b"]
      ~~~
    `, [
      run('Crie o objeto `filme` com `titulo: "Central do Brasil"` e `ano: 1998`, e mostre `Central do Brasil (1998)` usando template literal.', 'const filme = {};\n', 'Central do Brasil (1998)', {
        hint: 'console.log(`${filme.titulo} (${filme.ano})`)',
        solution: 'const filme = { titulo: "Central do Brasil", ano: 1998 };\nconsole.log(`${filme.titulo} (${filme.ano})`);',
      }),
    ]),
    lesson('Desestruturação, spread e JSON', md`
      ## Desestruturação

      Extrai valores para variáveis numa linha só:

      ~~~js
      const usuario = { nome: "Lia", idade: 30, cidade: "Natal" };
      const { nome, cidade } = usuario;
      console.log(nome, cidade); // Lia Natal

      const [primeiro, segundo] = [10, 20, 30];
      console.log(primeiro + segundo); // 30
      ~~~

      Funciona em parâmetros também: \`function mostrar({ nome, idade }) { ... }\`.

      ## Spread em objetos

      ~~~js
      const base = { tema: "escuro", fonte: 14 };
      const config = { ...base, fonte: 16 };
      console.log(config); // { tema: "escuro", fonte: 16 }
      ~~~

      ## JSON

      JSON é o formato de texto mais usado para trocar dados entre sistemas. É praticamente a sintaxe de objetos JS:

      ~~~js
      const texto = JSON.stringify({ id: 1, ok: true });
      console.log(texto);              // {"id":1,"ok":true}
      const obj = JSON.parse(texto);
      console.log(obj.ok);             // true
      ~~~
    `, [
      predict('Qual é a saída?', 'const { a, c } = { a: 1, b: 2, c: 3 };\nconsole.log(a + c);', '4', 'Pega só `a` (1) e `c` (3).'),
      predict('Qual é a saída?', 'console.log(JSON.stringify({ x: [1, 2] }));', '{"x":[1,2]}', '`JSON.stringify` gera texto JSON sem espaços.'),
    ]),
    lesson('Classes', md`
      Classes são moldes para criar vários objetos parecidos:

      ~~~js
      class Produto {
        constructor(nome, preco) {
          this.nome = nome;
          this.preco = preco;
        }

        comDesconto(pct) {
          return this.preco * (1 - pct / 100);
        }
      }

      const p = new Produto("Fone", 200);
      console.log(p.comDesconto(10)); // 180
      ~~~

      ## Herança

      ~~~js
      class Animal {
        constructor(nome) { this.nome = nome; }
        falar() { return \`\${this.nome} faz um som\`; }
      }

      class Cachorro extends Animal {
        falar() { return \`\${this.nome} late\`; }
      }

      console.log(new Cachorro("Rex").falar()); // Rex late
      ~~~

      Use \`super(...)\` no construtor da classe filha para chamar o construtor da mãe.
    `, [
      run('Complete a classe `Retangulo` com o método `area()`. Teste incluído.', 'class Retangulo {\n  constructor(largura, altura) {\n    this.largura = largura;\n    this.altura = altura;\n  }\n}\n\nconst r = new Retangulo(4, 5);\nconsole.log(r.area());', '20', {
        hint: 'area() { return this.largura * this.altura; }',
        solution: 'class Retangulo {\n  constructor(largura, altura) {\n    this.largura = largura;\n    this.altura = altura;\n  }\n\n  area() {\n    return this.largura * this.altura;\n  }\n}\n\nconst r = new Retangulo(4, 5);\nconsole.log(r.area());',
      }),
    ]),
  ], [
    predict('Qual é a saída?', 'const o = { n: 1 };\no.n += 4;\nconsole.log(o.n);', '5', '1 + 4.'),
    choice('O que `this` representa dentro de um método de objeto?', ['A janela do navegador', 'O próprio objeto', 'A função', 'Sempre `undefined`'], 1, 'Dentro de um método chamado como `obj.metodo()`, `this` é `obj`.'),
    fill('Complete para criar um objeto a partir da classe:', 'const c = ___ Carro("Fusca");', 'new', '`new` instancia a classe.'),
    predict('Qual é a saída?', 'const a = { x: 1, y: 2 };\nconst b = { ...a, y: 9 };\nconsole.log(b.x + b.y);', '10', '`y` foi sobrescrito para 9.'),
    choice('Qual função transforma um texto JSON em objeto?', ['`JSON.stringify`', '`JSON.parse`', '`Object.json`', '`toObject`'], 1, '`JSON.parse` lê texto e devolve objeto.'),
    bug('Qual linha tem erro?', md`
      class Pessoa {
        constructor(nome) {
          nome = nome;
        }
      }
      console.log(new Pessoa("Ana").nome);
    `, 3, 'Para guardar no objeto, use `this.nome = nome;`. Do jeito que está, `nome` fica `undefined`.'),
  ]),

  mod('dom', 'JavaScript no navegador', 'DOM, seletores, eventos e formulários.', [
    lesson('O que é o DOM', md`
      Quando o navegador carrega uma página HTML, ele monta uma **árvore de objetos** representando cada elemento. Essa árvore é o **DOM** (*Document Object Model*). Com JavaScript você lê e altera o DOM — e a página muda na hora.

      ~~~html
      <h1 id="titulo">Olá</h1>
      <p class="aviso">Primeiro aviso</p>
      <p class="aviso">Segundo aviso</p>
      ~~~

      ## Selecionando elementos

      ~~~js
      const titulo = document.querySelector("#titulo");       // por id
      const primeiro = document.querySelector(".aviso");      // primeiro da classe
      const todos = document.querySelectorAll(".aviso");      // todos (lista)
      ~~~

      \`querySelector\` aceita qualquer seletor CSS.

      ## Alterando

      ~~~js
      titulo.textContent = "Bem-vindo!";        // troca o texto
      titulo.style.color = "tomato";             // estilo inline
      titulo.classList.add("destaque");          // adiciona classe CSS
      titulo.setAttribute("title", "Saudação");  // atributo
      ~~~

      > ℹ️ Os desafios desta trilha rodam num ambiente sem página, então nesta lição você pratica com questões. Para experimentar de verdade, abra qualquer site, aperte **F12** e use a aba **Console**.
    `, [
      choice('Qual comando seleciona o elemento com `id="menu"`?', ['`document.querySelector(".menu")`', '`document.querySelector("#menu")`', '`document.get("menu")`', '`document.querySelector("menu")`'], 1, 'Em seletores CSS, `#` indica id e `.` indica classe.'),
      fill('Complete para trocar o texto do elemento:', 'titulo.___ = "Novo texto";', 'textContent', '`textContent` define o texto de um elemento.'),
    ]),
    lesson('Eventos', md`
      Eventos são coisas que acontecem na página: clique, tecla, envio de formulário, rolagem...

      ~~~html
      <button id="curtir">Curtir</button>
      <span id="contador">0</span>
      ~~~

      ~~~js
      const botao = document.querySelector("#curtir");
      const contador = document.querySelector("#contador");
      let curtidas = 0;

      botao.addEventListener("click", () => {
        curtidas++;
        contador.textContent = curtidas;
      });
      ~~~

      | Evento | Quando |
      |---|---|
      | \`click\` | clique |
      | \`input\` | texto de um campo muda |
      | \`submit\` | formulário é enviado |
      | \`keydown\` | tecla pressionada |
      | \`load\` | página terminou de carregar |

      ## Formulários

      ~~~js
      form.addEventListener("submit", (evento) => {
        evento.preventDefault();          // impede recarregar a página
        const email = form.email.value;   // valor do campo
        console.log("Enviando", email);
      });
      ~~~
    `, [
      choice('Para que serve `evento.preventDefault()` no `submit` de um formulário?', ['Apagar o formulário', 'Impedir o comportamento padrão (recarregar a página)', 'Enviar mais rápido', 'Validar o e-mail'], 1, 'Sem ele, o navegador envia o formulário e recarrega a página.'),
    ]),
    lesson('Criando elementos e boas práticas', md`
      ~~~js
      const lista = document.querySelector("#tarefas");
      const item = document.createElement("li");
      item.textContent = "Estudar JavaScript";
      lista.appendChild(item);
      ~~~

      Para remover: \`item.remove()\`.

      ## innerHTML x textContent

      - \`textContent\` trata tudo como **texto puro** — seguro.
      - \`innerHTML\` interpreta o texto como **HTML**.

      > ⚠️ Nunca coloque texto digitado pelo usuário em \`innerHTML\`. Alguém pode digitar \`<img src=x onerror="roubarDados()">\` e executar código na página de outras pessoas. Esse ataque se chama **XSS**.

      ## Onde colocar o script

      ~~~html
      <script src="app.js" defer></script>
      ~~~

      O \`defer\` faz o script rodar só depois que o HTML foi lido, então os elementos já existem quando o código tenta selecioná-los.
    `, [
      choice('Por que preferir `textContent` a `innerHTML` para mostrar texto do usuário?', ['É mais bonito', 'Evita que o texto seja interpretado como HTML (XSS)', 'É o único que funciona', 'Deixa a página mais rápida sempre'], 1, '`textContent` nunca executa HTML.'),
    ]),
  ], [
    choice('O que é o DOM?', ['Um banco de dados', 'A representação da página como árvore de objetos', 'Um framework', 'Uma linguagem'], 1, 'DOM = Document Object Model.'),
    fill('Complete para reagir a cliques:', 'botao.___("click", () => alert("oi"));', 'addEventListener', '`addEventListener(evento, função)`.'),
    choice('Qual método devolve **todos** os elementos que combinam com o seletor?', ['`querySelector`', '`querySelectorAll`', '`getElement`', '`selectAll`'], 1, '`querySelectorAll` devolve uma lista.'),
    choice('Qual evento dispara a cada letra digitada num campo?', ['`submit`', '`click`', '`input`', '`load`'], 2, '`input` dispara sempre que o valor muda.'),
    bug('Qual linha cria uma falha de segurança (XSS)?', md`
      const nome = campo.value;
      saudacao.textContent = "Olá!";
      saudacao.innerHTML = "Olá, " + nome;
      botao.disabled = false;
    `, 3, 'Colocar entrada do usuário em `innerHTML` permite injetar HTML/JS.'),
    choice('O que o atributo `defer` faz em `<script defer>`?', ['Desativa o script', 'Executa o script depois de o HTML ser lido', 'Executa duas vezes', 'Carrega só no celular'], 1, 'Garante que os elementos já existam.'),
  ]),

  mod('async', 'Programação assíncrona', 'Callbacks, Promises, async/await e fetch.', [
    lesson('Síncrono x assíncrono', md`
      Algumas tarefas demoram: baixar dados, ler arquivos, esperar um timer. Se o JavaScript ficasse parado esperando, a página congelaria. Por isso ele é **assíncrono**: agenda a tarefa e segue em frente; quando ela termina, uma função é chamada.

      ~~~js
      console.log("1. pedindo pizza");
      setTimeout(() => {
        console.log("3. pizza chegou!");
      }, 1000);
      console.log("2. arrumando a mesa");
      ~~~

      ~~~text
      1. pedindo pizza
      2. arrumando a mesa
      3. pizza chegou!
      ~~~

      \`setTimeout(fn, ms)\` executa \`fn\` depois de \`ms\` milissegundos. Mesmo com \`0\`, a função só roda **depois** do código atual terminar.
    `, [
      predict('Qual é a saída? (escreva as linhas separadas por espaço)', 'console.log("A");\nsetTimeout(() => console.log("B"), 0);\nconsole.log("C");', 'A C B', 'O callback do setTimeout só roda depois que o código atual termina.'),
    ]),
    lesson('Promises', md`
      Uma **Promise** representa um valor que vai chegar no futuro. Ela pode ser **resolvida** (deu certo) ou **rejeitada** (deu erro).

      ~~~js
      function esperar(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
      }

      esperar(500)
        .then(() => console.log("meio segundo depois"))
        .catch((erro) => console.log("deu ruim", erro))
        .finally(() => console.log("fim"));
      ~~~

      - \`.then\` recebe o resultado de sucesso.
      - \`.catch\` recebe o erro.
      - \`.finally\` roda sempre.

      ## Várias ao mesmo tempo

      \`Promise.all([...])\` espera todas terminarem e devolve um array de resultados.
    `, [
      predict('Qual é a saída?', 'Promise.resolve(5)\n  .then((n) => n * 2)\n  .then((n) => console.log(n));', '10', 'Cada `.then` recebe o valor retornado pelo anterior.'),
    ]),
    lesson('async/await e fetch', md`
      \`async/await\` deixa código assíncrono com cara de código normal:

      ~~~js
      const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

      async function preparar() {
        console.log("fervendo água...");
        await esperar(300);
        console.log("café pronto ☕");
      }

      preparar();
      ~~~

      - \`async\` antes da função faz ela devolver uma Promise.
      - \`await\` pausa **aquela função** até a Promise resolver (a página continua livre).

      ## Buscando dados com fetch

      ~~~js
      async function carregarUsuario() {
        try {
          const resposta = await fetch("https://api.exemplo.com/usuarios/1");
          if (!resposta.ok) throw new Error("HTTP " + resposta.status);
          const usuario = await resposta.json();
          console.log(usuario.nome);
        } catch (erro) {
          console.log("Falhou:", erro.message);
        }
      }
      ~~~

      Use \`try/catch\` para tratar erros de rede. Esse padrão aparece em praticamente todo app web moderno.

      🎉 Parabéns! Você cobriu os fundamentos do JavaScript. Próximos passos sugeridos: um framework como **React** ou back-end com **Node.js**.
    `, [
      run('Complete a função `async` para esperar 100 ms (com `await esperar(100)`) entre as mensagens `Carregando...` e `Pronto!`.', 'const esperar = (ms) => new Promise((r) => setTimeout(r, ms));\n\nasync function iniciar() {\n  console.log("Carregando...");\n  // espere aqui\n  console.log("Pronto!");\n}\n\niniciar();\nconsole.log("Enquanto isso...");', 'Carregando...\nEnquanto isso...\nPronto!', {
        hint: 'await esperar(100);',
        solution: 'const esperar = (ms) => new Promise((r) => setTimeout(r, ms));\n\nasync function iniciar() {\n  console.log("Carregando...");\n  await esperar(100);\n  console.log("Pronto!");\n}\n\niniciar();\nconsole.log("Enquanto isso...");',
      }),
    ]),
  ], [
    choice('O que é uma Promise?', ['Um tipo de laço', 'Um objeto que representa um valor futuro', 'Uma variável constante', 'Um evento de clique'], 1, 'Promises representam resultados que chegam depois.'),
    predict('Qual é a saída? (escreva as linhas separadas por espaço)', 'setTimeout(() => console.log(1), 0);\nPromise.resolve().then(() => console.log(2));\nconsole.log(3);', '3 2 1', 'Código síncrono primeiro (3), depois Promises (2), depois timers (1).'),
    fill('Complete para pausar até a Promise resolver:', 'const dados = ___ fetch(url);', 'await', '`await` só funciona dentro de funções `async`.'),
    choice('Qual método trata erros numa cadeia de Promises?', ['`.then`', '`.catch`', '`.error`', '`.fail`'], 1, '`.catch` recebe a rejeição.'),
    choice('O que `async` faz numa função?', ['Deixa a função mais rápida', 'Faz a função devolver uma Promise e permite usar `await`', 'Executa em outro computador', 'Nada'], 1, 'Funções `async` sempre retornam Promises.'),
    bug('Qual linha tem erro?', md`
      function buscar() {
        const r = await fetch("/api");
        return r.json();
      }
    `, 2, '`await` só pode ser usado dentro de função `async`: `async function buscar()`.'),
  ]),
];
