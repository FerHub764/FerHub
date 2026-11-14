import { md, mod, lesson, choice, predict, fill, bug, run } from '../_dsl.js';

export default [
  mod('intro', 'Primeiros passos', 'Onde o JavaScript roda, console.log e variáveis.', [
    lesson('O que é JavaScript?', md`
      JavaScript (JS) é **a linguagem de programação da web**. Todo navegador — Chrome, Firefox, Safari — sabe executar JavaScript. Ele é o que faz um site reagir a cliques, validar formulários, carregar dados sem recarregar a página.

      Hoje o JS vai muito além do navegador:

      - **Servidores** com Node.js
      - **Apps de celular** com React Native
      - **Programas de computador** com Electron (o VS Code é feito assim!)

      > ℹ️ JavaScript **não** tem relação com Java. O nome foi uma jogada de marketing dos anos 90.

      ## O trio da web

      | Tecnologia | Papel | Analogia |
      |---|---|---|
      | HTML | estrutura | esqueleto |
      | CSS | aparência | roupas |
      | JavaScript | comportamento | músculos |

      ## Seu primeiro código

      \`console.log()\` mostra valores no **console** (a "saída" do programa):

      ~~~js
      console.log("Olá, mundo!");
      console.log(2 + 3);
      ~~~

      O ponto e vírgula \`;\` no fim da linha é opcional na maioria dos casos, mas é um bom hábito usá-lo.
    `, [
      run('Mostre no console a frase **Eu estou aprendendo JavaScript**.', '// escreva aqui\n', 'Eu estou aprendendo JavaScript', {
        hint: 'console.log("...")',
        solution: 'console.log("Eu estou aprendendo JavaScript");',
      }),
    ]),
    lesson('Variáveis com let e const', md`
      Variáveis guardam valores. Em JavaScript moderno usamos duas palavras:

      - \`const\` — para valores que **não serão reatribuídos**.
      - \`let\` — para valores que **vão mudar**.

      ~~~js
      const nome = "Ana";
      let pontos = 0;
      pontos = pontos + 10;
      console.log(nome, pontos); // Ana 10
      ~~~

      Tentar reatribuir uma \`const\` gera erro:

      ~~~js
      const pi = 3.14;
      pi = 3; // TypeError: Assignment to constant variable.
      ~~~

      > 💡 Regra prática: comece com \`const\`. Troque para \`let\` só se precisar mudar o valor.

      Você ainda vai ver \`var\` em códigos antigos. Ele tem regras de escopo confusas — evite.

      ## Nomes

      A convenção em JS é **camelCase**: \`precoTotal\`, \`nomeDoUsuario\`. Nomes não podem começar com número nem ter espaços.
    `, [
      predict('Qual é a saída?', 'let x = 5;\nx = x + 2;\nx = x * 3;\nconsole.log(x);', '21', '(5 + 2) × 3 = 21.'),
      choice('Qual palavra usar para um valor que **nunca** será reatribuído?', ['`let`', '`var`', '`const`', '`fixed`'], 2, '`const` impede reatribuição.'),
    ]),
    lesson('Comentários e erros', md`
      ~~~js
      // comentário de uma linha

      /*
        comentário de
        várias linhas
      */
      ~~~

      ## Lendo erros

      Quando algo dá errado, o console mostra o **tipo** e a **mensagem** do erro:

      | Erro | Quando acontece |
      |---|---|
      | \`SyntaxError\` | código mal escrito (falta parêntese, chave...) |
      | \`ReferenceError\` | variável que não existe |
      | \`TypeError\` | operação inválida para o tipo (ex.: chamar algo que não é função) |

      ~~~js
      console.log(nomee); // ReferenceError: nomee is not defined
      ~~~

      Leia a mensagem com calma: quase sempre ela diz exatamente o que corrigir.
    `, [
      bug('Qual linha causa um ReferenceError?', md`
        const cidade = "Recife";
        const estado = "PE";
        console.log(cidade, Estado);
      `, 3, '`Estado` com E maiúsculo não existe — JavaScript diferencia maiúsculas de minúsculas.'),
    ]),
  ], [
    choice('Onde o JavaScript **não** costuma rodar?', ['No navegador', 'Em servidores com Node.js', 'Dentro de uma planilha impressa', 'Em apps de celular'], 2, 'JS roda em navegadores, servidores (Node.js) e apps.'),
    predict('Qual é a saída?', 'console.log("5" + 3);', '53', 'Texto + número vira concatenação de texto.'),
    fill('Complete para mostrar o valor no console:', 'console.___("oi");', 'log', '`console.log()` imprime no console.'),
    bug('Qual linha gera erro?', md`
      const limite = 10;
      let atual = 3;
      atual = 4;
      limite = 20;
    `, 4, 'Não se pode reatribuir uma `const`.'),
    choice('Qual é a convenção de nomes mais usada em JavaScript?', ['snake_case', 'camelCase', 'kebab-case', 'MAIÚSCULAS'], 1, 'Ex.: `precoTotal`.'),
    predict('Qual é a saída?', 'const a = 2;\nlet b = a * 4;\nb -= 3;\nconsole.log(a, b);', '2 5', 'b = 8 - 3 = 5.'),
  ]),

  mod('tipos', 'Tipos e operadores', 'Números, strings, booleanos, template literals e comparações.', [
    lesson('Tipos primitivos', md`
      | Tipo | Exemplos |
      |---|---|
      | \`number\` | \`42\`, \`3.14\`, \`-7\` |
      | \`string\` | \`"oi"\`, \`'oi'\`, \`\`oi\`\` |
      | \`boolean\` | \`true\`, \`false\` |
      | \`undefined\` | variável sem valor |
      | \`null\` | "nada", intencionalmente vazio |

      O operador \`typeof\` diz o tipo:

      ~~~js
      console.log(typeof 10);       // number
      console.log(typeof "texto");  // string
      console.log(typeof true);     // boolean
      let x;
      console.log(typeof x);        // undefined
      ~~~

      ## Números

      JS tem um só tipo de número (inteiros e decimais). Operadores: \`+ - * / %\` e \`**\` (potência).

      ~~~js
      console.log(7 / 2);   // 3.5
      console.log(7 % 2);   // 1
      console.log(2 ** 10); // 1024
      console.log(0.1 + 0.2); // 0.30000000000000004 😱
      ~~~

      > ⚠️ O último exemplo não é bug do JS: quase todas as linguagens têm essa imprecisão com decimais. Para dinheiro, use centavos inteiros ou \`toFixed(2)\` na hora de mostrar.
    `, [
      predict('Qual é a saída?', 'console.log(typeof 3.5, typeof "3.5");', 'number string', 'Com aspas é string; sem aspas é number.'),
    ]),
    lesson('Strings e template literals', md`
      Template literals usam **crase** e permitem colocar expressões com \`\${ }\`:

      ~~~js
      const nome = "Bia";
      const idade = 19;
      console.log(\`\${nome} tem \${idade} anos\`);
      console.log(\`Em 2 anos: \${idade + 2}\`);
      ~~~

      Métodos e propriedades úteis:

      ~~~js
      const s = "JavaScript";
      console.log(s.length);          // 10
      console.log(s.toUpperCase());   // JAVASCRIPT
      console.log(s.slice(0, 4));     // Java
      console.log(s.includes("Script")); // true
      console.log("a-b-c".split("-"));   // ["a", "b", "c"]
      console.log("  oi  ".trim());      // "oi"
      ~~~

      ## Conversões

      ~~~js
      console.log(Number("42") + 1); // 43
      console.log(String(10) + 1);   // "101"
      console.log(parseInt("12px")); // 12
      console.log((9.456).toFixed(2)); // "9.46"
      ~~~
    `, [
      run('Usando template literal, mostre `Olá, Carla! Você tem 3 mensagens.` a partir das variáveis.', 'const nome = "Carla";\nconst msgs = 3;\n', 'Olá, Carla! Você tem 3 mensagens.', {
        hint: 'console.log(`Olá, ${nome}! Você tem ${msgs} mensagens.`)',
        solution: 'const nome = "Carla";\nconst msgs = 3;\nconsole.log(`Olá, ${nome}! Você tem ${msgs} mensagens.`);',
      }),
      predict('Qual é a saída?', 'console.log("banana".slice(1, 4));', 'ana', 'Do índice 1 até antes do 4.'),
    ]),
    lesson('Comparações: == versus ===', md`
      JavaScript tem dois tipos de igualdade:

      - \`===\` (**estrita**): compara valor **e** tipo. ✅ Use esta.
      - \`==\` (frouxa): converte os tipos antes de comparar. Gera surpresas.

      ~~~js
      console.log(5 === "5"); // false
      console.log(5 == "5");  // true  (converteu!)
      console.log(0 == "");   // true  😬
      console.log(null == undefined); // true
      ~~~

      O mesmo vale para diferença: prefira \`!==\` a \`!=\`.

      ## Operadores lógicos

      ~~~js
      const idade = 20;
      const temCarteira = false;
      console.log(idade >= 18 && temCarteira); // false (E)
      console.log(idade >= 18 || temCarteira); // true  (OU)
      console.log(!temCarteira);               // true  (NÃO)
      ~~~

      ## Valores "falsy"

      Em condições, estes valores contam como falso: \`false\`, \`0\`, \`""\`, \`null\`, \`undefined\`, \`NaN\`. Todo o resto é verdadeiro ("truthy").
    `, [
      predict('Qual é a saída?', 'console.log(1 === "1", 1 == "1");', 'false true', '`===` não converte tipos; `==` converte.'),
      choice('Qual destes é **truthy**?', ['`0`', '`""`', '`"0"`', '`null`'], 2, '`"0"` é uma string não vazia, então é verdadeira.'),
    ]),
  ], [
    predict('Qual é a saída?', 'console.log(10 % 3 + 2 ** 2);', '5', '10 % 3 = 1; 2² = 4; 1 + 4 = 5.'),
    choice('Qual operador compara valor **e** tipo?', ['`=`', '`==`', '`===`', '`=>`'], 2, '`===` é a igualdade estrita.'),
    predict('Qual é a saída?', 'const p = "Rio";\nconsole.log(`${p.length} letras`);', '3 letras', '"Rio" tem 3 caracteres.'),
    fill('Complete para obter o tipo da variável:', 'console.log(___ valor);', 'typeof', '`typeof` devolve o tipo como string.'),
    predict('Qual é a saída?', 'console.log(Number("7") + Number("3"));', '10', 'Convertidos para número, somam 10.'),
    bug('Este código deveria mostrar "Olá, Ana", mas mostra literalmente ${nome}. Qual linha está errada?', md`
      const nome = "Ana";
      const msg = "Olá, \${nome}";
      console.log(msg);
    `, 2, 'Interpolação só funciona com **crases** (template literal), não com aspas duplas.'),
  ]),

  mod('condicionais', 'Decisões', 'if/else, switch e o operador ternário.', [
    lesson('if, else if e else', md`
      ~~~js
      const nota = 7.5;
      if (nota >= 9) {
        console.log("Excelente");
      } else if (nota >= 6) {
        console.log("Aprovado");
      } else {
        console.log("Reprovado");
      }
      ~~~

      - A condição vai entre **parênteses**.
      - O bloco vai entre **chaves** \`{ }\`.
      - Só o primeiro bloco verdadeiro executa.

      A indentação em JS é só para leitura (quem define os blocos são as chaves), mas **sempre indente** — seu eu do futuro agradece.
    `, [
      run('Dado um número, mostre `positivo`, `negativo` ou `zero`. O valor de teste é **-4**.', 'const n = -4;\n', 'negativo', {
        hint: 'if (n > 0) ... else if (n < 0) ... else ...',
        solution: 'const n = -4;\nif (n > 0) {\n  console.log("positivo");\n} else if (n < 0) {\n  console.log("negativo");\n} else {\n  console.log("zero");\n}',
      }),
    ]),
    lesson('switch', md`
      Quando você compara **uma variável** com vários valores fixos, \`switch\` fica mais legível:

      ~~~js
      const dia = 3;
      switch (dia) {
        case 1:
          console.log("Domingo");
          break;
        case 2:
          console.log("Segunda");
          break;
        case 3:
          console.log("Terça");
          break;
        default:
          console.log("Outro dia");
      }
      ~~~

      > ⚠️ Não esqueça o \`break\`! Sem ele, a execução "cai" para o próximo \`case\` (isso se chama *fall-through*).

      O \`switch\` compara com \`===\`.
    `, [
      predict('Qual é a saída? (escreva as linhas separadas por espaço)', 'const x = 2;\nswitch (x) {\n  case 1: console.log("um");\n  case 2: console.log("dois");\n  case 3: console.log("três");\n}', ['dois três'], 'Sem `break`, o código continua executando os cases seguintes.'),
    ]),
    lesson('Ternário e operadores de atalho', md`
      ## Ternário

      \`condição ? valorSeVerdadeiro : valorSeFalso\`

      ~~~js
      const idade = 15;
      const tipo = idade >= 18 ? "adulto" : "menor";
      console.log(tipo); // menor
      ~~~

      ## && e || como atalhos

      ~~~js
      const usuario = "";
      const nomeExibido = usuario || "Visitante";
      console.log(nomeExibido); // Visitante
      ~~~

      ## ?? (nullish coalescing)

      \`??\` só usa o valor padrão se o da esquerda for \`null\` ou \`undefined\` — diferente de \`||\`, que também troca \`0\` e \`""\`:

      ~~~js
      const volume = 0;
      console.log(volume || 50); // 50  (0 é falsy)
      console.log(volume ?? 50); // 0   (0 não é null)
      ~~~

      ## Optional chaining ?.

      Acessa propriedades sem quebrar se algo for \`undefined\`:

      ~~~js
      const pessoa = {};
      console.log(pessoa.endereco?.cidade); // undefined (sem erro)
      ~~~
    `, [
      predict('Qual é a saída?', 'const estoque = 0;\nconsole.log(estoque ?? 10, estoque || 10);', '0 10', '`??` mantém o 0; `||` troca porque 0 é falsy.'),
    ]),
  ], [
    predict('Qual é a saída?', 'const t = 25;\nconsole.log(t > 30 ? "quente" : t > 20 ? "agradável" : "frio");', 'agradável', '25 não é > 30, mas é > 20.'),
    choice('O que acontece num `switch` sem `break`?', ['Dá erro', 'Para no primeiro case', 'Continua executando os cases seguintes', 'Volta ao início'], 2, 'É o chamado *fall-through*.'),
    fill('Complete com o operador que usa o padrão **só** para null/undefined:', 'const x = valor ___ "padrão";', '??', '`??` é o nullish coalescing.'),
    bug('Qual linha tem erro de sintaxe?', md`
      const idade = 20;
      if idade >= 18 {
        console.log("maior");
      }
    `, 2, 'Em JS a condição do `if` precisa estar entre parênteses: `if (idade >= 18)`.'),
    predict('Qual é a saída?', 'const nome = "";\nconsole.log(nome || "Anônimo");', 'Anônimo', 'String vazia é falsy.'),
    choice('Qual expressão **não** quebra se `user` for undefined?', ['`user.nome`', '`user?.nome`', '`user!.nome`', '`user::nome`'], 1, '`?.` é o optional chaining.'),
  ]),

  mod('lacos', 'Repetições', 'for, while, for...of e controle de laços.', [
    lesson('for clássico e while', md`
      ~~~js
      for (let i = 1; i <= 3; i++) {
        console.log("Volta", i);
      }
      ~~~

      O \`for\` tem três partes separadas por \`;\`:

      1. **início**: \`let i = 1\`
      2. **condição**: \`i <= 3\` (continua enquanto for verdadeira)
      3. **passo**: \`i++\` (soma 1 a cada volta)

      ## while

      ~~~js
      let saldo = 100;
      let meses = 0;
      while (saldo < 200) {
        saldo *= 1.1;
        meses++;
      }
      console.log(\`Dobrou em \${meses} meses\`);
      ~~~

      Use \`while\` quando não souber quantas voltas serão necessárias.

      > ⚠️ Cuidado com loops infinitos: garanta que a condição em algum momento fique falsa.
    `, [
      run('Use um `for` para somar os números de 1 a 50 e mostre `Soma: 1275`.', 'let soma = 0;\n', 'Soma: 1275', {
        hint: 'for (let i = 1; i <= 50; i++) soma += i;',
        solution: 'let soma = 0;\nfor (let i = 1; i <= 50; i++) {\n  soma += i;\n}\nconsole.log("Soma:", soma);',
      }),
    ]),
    lesson('for...of, break e continue', md`
      \`for...of\` percorre os **valores** de um array ou string — mais simples que o \`for\` com índice:

      ~~~js
      const frutas = ["maçã", "uva", "kiwi"];
      for (const fruta of frutas) {
        console.log(fruta);
      }
      ~~~

      ## break e continue

      ~~~js
      for (const n of [3, 8, -1, 5]) {
        if (n < 0) break;     // para tudo
        console.log(n);
      }
      // 3, 8

      for (let i = 1; i <= 5; i++) {
        if (i === 3) continue; // pula o 3
        console.log(i);
      }
      // 1, 2, 4, 5
      ~~~

      > 💡 Existe também \`for...in\`, que percorre as **chaves** de um objeto. Para arrays, prefira \`for...of\`.
    `, [
      run('Percorra a lista com `for...of` e mostre apenas os nomes com **mais de 3 letras**, um por linha.', 'const nomes = ["Ana", "Bruno", "Lia", "Carla", "Edu"];\n', 'Bruno\nCarla', {
        hint: 'if (nome.length > 3) console.log(nome);',
        solution: 'const nomes = ["Ana", "Bruno", "Lia", "Carla", "Edu"];\nfor (const nome of nomes) {\n  if (nome.length > 3) console.log(nome);\n}',
      }),
    ]),
  ], [
    predict('Qual é a saída? (tudo numa linha)', 'let s = "";\nfor (let i = 0; i < 4; i++) s += i;\nconsole.log(s);', '0123', '`s` é string, então cada número é concatenado.'),
    choice('Em `for (let i = 0; i < 5; i++)`, quantas vezes o bloco executa?', ['4', '5', '6', 'Infinitas'], 1, 'i vale 0, 1, 2, 3 e 4.'),
    predict('Qual é a saída?', 'let n = 1;\nwhile (n < 100) n *= 3;\nconsole.log(n);', '243', '1 → 3 → 9 → 27 → 81 → 243.'),
    fill('Complete para pular para a próxima volta:', 'for (const x of lista) {\n  if (x === 0) ___;\n  console.log(x);\n}', 'continue', '`continue` pula o resto da volta atual.'),
    bug('Este laço nunca termina. Qual linha está errada?', md`
      let i = 10;
      while (i > 0) {
        console.log(i);
        i++;
      }
    `, 4, '`i++` faz o número crescer; deveria ser `i--` para chegar a 0.'),
    choice('Qual laço percorre **valores** de um array diretamente?', ['`for...in`', '`for...of`', '`do...while`', '`foreach...as`'], 1, '`for...of` itera sobre valores.'),
  ]),

  mod('funcoes', 'Funções', 'Declarações, arrow functions, parâmetros e closures.', [
    lesson('Declarando funções', md`
      ~~~js
      function saudar(nome) {
        return \`Olá, \${nome}!\`;
      }

      console.log(saudar("Rui"));
      ~~~

      - \`nome\` é o **parâmetro**; \`"Rui"\` é o **argumento**.
      - \`return\` devolve o resultado e encerra a função.
      - Sem \`return\`, a função devolve \`undefined\`.

      ## Arrow functions

      Uma sintaxe mais curta, muito usada no JS moderno:

      ~~~js
      const dobro = (n) => n * 2;
      const soma = (a, b) => a + b;
      const ola = () => console.log("olá");

      console.log(dobro(4), soma(2, 3)); // 8 5
      ~~~

      Se o corpo tem uma única expressão, o \`return\` é implícito. Com chaves, você precisa escrever \`return\`:

      ~~~js
      const media = (a, b) => {
        const total = a + b;
        return total / 2;
      };
      ~~~
    `, [
      run('Crie a arrow function `areaCirculo(r)` que retorna `Math.PI * r ** 2` arredondado com `toFixed(2)`. Teste já incluído.', 'const areaCirculo = (r) => 0; // corrija\n\nconsole.log(areaCirculo(1));\nconsole.log(areaCirculo(3));', '3.14\n28.27', {
        hint: 'const areaCirculo = (r) => (Math.PI * r ** 2).toFixed(2);',
        solution: 'const areaCirculo = (r) => (Math.PI * r ** 2).toFixed(2);\n\nconsole.log(areaCirculo(1));\nconsole.log(areaCirculo(3));',
      }),
    ]),
    lesson('Parâmetros padrão, rest e escopo', md`
      ## Valor padrão

      ~~~js
      function juros(valor, taxa = 0.05) {
        return valor * (1 + taxa);
      }
      console.log(juros(100));      // 105
      console.log(juros(100, 0.1)); // 110
      ~~~

      ## Rest parameters

      \`...nums\` junta todos os argumentos extras num array:

      ~~~js
      function somaTudo(...nums) {
        let total = 0;
        for (const n of nums) total += n;
        return total;
      }
      console.log(somaTudo(1, 2, 3, 4)); // 10
      ~~~

      ## Escopo de bloco

      Variáveis com \`let\` e \`const\` só existem dentro das chaves onde foram criadas:

      ~~~js
      if (true) {
        const segredo = 42;
      }
      console.log(segredo); // ReferenceError
      ~~~
    `, [
      predict('Qual é a saída?', 'function f(a, b = 10) {\n  return a + b;\n}\nconsole.log(f(1), f(1, 2));', '11 3', 'Sem o segundo argumento, b vale 10.'),
    ]),
    lesson('Funções como valores e closures', md`
      Funções são valores: podem ser guardadas em variáveis, passadas como argumento e retornadas.

      ~~~js
      function aplicar(fn, valor) {
        return fn(valor);
      }
      console.log(aplicar((x) => x * 10, 5)); // 50
      ~~~

      Funções passadas como argumento são chamadas de **callbacks**.

      ## Closures

      Uma função "lembra" das variáveis do lugar onde foi criada, mesmo depois que esse lugar terminou:

      ~~~js
      function criarContador() {
        let contagem = 0;
        return () => {
          contagem++;
          return contagem;
        };
      }

      const contar = criarContador();
      console.log(contar()); // 1
      console.log(contar()); // 2
      console.log(contar()); // 3
      ~~~

      A variável \`contagem\` fica protegida: ninguém de fora consegue mexer nela, só a função retornada. Esse padrão é a base de muita coisa no JavaScript.
    `, [
      run('Crie `criarMultiplicador(fator)` que **retorna uma função** que multiplica um número pelo fator. Teste incluído.', 'function criarMultiplicador(fator) {\n  // retorne uma função aqui\n}\n\nconst triplo = criarMultiplicador(3);\nconsole.log(triplo(5));\nconsole.log(criarMultiplicador(10)(7));', '15\n70', {
        hint: 'return (n) => n * fator;',
        solution: 'function criarMultiplicador(fator) {\n  return (n) => n * fator;\n}\n\nconst triplo = criarMultiplicador(3);\nconsole.log(triplo(5));\nconsole.log(criarMultiplicador(10)(7));',
      }),
    ]),
  ], [
    predict('Qual é a saída?', 'const f = (x) => x + 1;\nconsole.log(f(f(f(0))));', '3', 'Aplica +1 três vezes.'),
    choice('O que uma função sem `return` devolve?', ['`null`', '`0`', '`undefined`', 'Um erro'], 2, 'Sem `return`, o resultado é `undefined`.'),
    predict('Qual é a saída? (escreva as linhas separadas por espaço)', 'function g() {\n  console.log("A");\n  return "B";\n  console.log("C");\n}\nconsole.log(g());', ['A B'], 'Imprime A, retorna "B" (que é impresso); "C" nunca roda.'),
    fill('Complete a arrow function que retorna o quadrado:', 'const quadrado = (n) ___ n * n;', '=>', 'Arrow functions usam `=>`.'),
    predict('Qual é a saída?', 'function total(...v) {\n  return v.length;\n}\nconsole.log(total(4, 5, 6));', '3', '`v` é o array [4, 5, 6].'),
    bug('A função deveria retornar o dobro, mas retorna undefined. Qual linha está errada?', md`
      const dobro = (n) => {
        n * 2;
      };
      console.log(dobro(4));
    `, 2, 'Com chaves, o `return` é obrigatório: `return n * 2;`.'),
  ]),
];
