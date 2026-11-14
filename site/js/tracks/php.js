import { md, mod, lesson, choice, predict, fill, bug, defineTrack } from './_dsl.js';

export default defineTrack({
  id: 'php',
  name: 'PHP',
  short: 'PHP',
  color: '#8b93d6',
  level: 'extra',
  lang: 'php',
  category: 'Back-end',
  tagline: 'Move boa parte da web: WordPress, Laravel e milhões de sites.',
  description: 'Sintaxe, variáveis, arrays, funções, formulários, orientação a objetos e acesso a banco de dados com PDO.',
}, [
  mod('intro', 'Primeiros passos', 'Como o PHP funciona, echo e variáveis.', [
    lesson('PHP no servidor', md`
      **PHP** roda no **servidor**: quando alguém acessa a página, o PHP monta o HTML e envia pronto para o navegador. Cerca de 3 em cada 4 sites que usam linguagem de servidor usam PHP — incluindo tudo que é feito em **WordPress**.

      ~~~php
      <?php
      echo "Olá, mundo!";
      ~~~

      O código PHP fica entre \`<?php\` e \`?>\` (o fechamento pode ser omitido em arquivos só com PHP). Ele também pode ser misturado ao HTML:

      ~~~php
      <h1>Bem-vindo, <?php echo $nome; ?>!</h1>
      <p>Hoje é <?= date('d/m/Y') ?></p>
      ~~~

      \`<?= ... ?>\` é um atalho para \`<?php echo ... ?>\`.

      Para testar no seu computador: \`php -S localhost:8000\` sobe um servidor de desenvolvimento na pasta atual.
    `, [
      choice('Onde o código PHP é executado?', ['No navegador do usuário', 'No servidor, antes de enviar a página', 'No banco de dados', 'No celular'], 1, 'O navegador recebe só o HTML resultante.'),
    ]),
    lesson('Variáveis e tipos', md`
      Toda variável começa com **\`$\`**:

      ~~~php
      $nome = "Ana";
      $idade = 30;
      $preco = 9.90;
      $ativo = true;

      echo "Nome: $nome, idade: $idade\n";   // aspas duplas interpretam variáveis
      echo 'Nome: $nome';                     // aspas simples NÃO interpretam
      echo "Total: " . $preco * 2 . "\n";     // . concatena
      ~~~

      - O tipo é dinâmico: a variável assume o tipo do valor.
      - O operador de concatenação é o **ponto** \`.\`, não o \`+\`.
      - \`var_dump($x)\` mostra tipo e valor — ótimo para depurar.
    `, [
      predict('Qual é a saída?', '$a = "PHP";\n$b = 8;\necho "$a $b";', 'PHP 8', 'Aspas duplas substituem as variáveis.'),
      predict('Qual é a saída?', '$x = 5;\necho \'$x\';', '$x', 'Aspas simples mostram o texto literal.'),
    ]),
  ], [
    fill('Complete: toda variável em PHP começa com', '___nome = "Rui";', '$', 'Ex.: `$nome`.'),
    predict('Qual é a saída?', 'echo "A" . "B" . 1 + 2;', 'AB3', 'Em PHP 8, `+` tem precedência maior que `.`: 1 + 2 = 3, depois concatena.'),
    choice('Qual operador concatena textos em PHP?', ['`+`', '`&`', '`.`', '`,`'], 2, 'O ponto.'),
    bug('Qual linha tem erro de sintaxe?', md`
      <?php
      $cidade = "Natal";
      echo "Cidade: $cidade"
      echo "Fim";
    `, 3, 'Falta `;` no fim da linha 3.'),
    choice('O que `<?= $x ?>` faz?', ['Compara com $x', 'Imprime o valor de $x', 'Apaga $x', 'Declara $x'], 1, 'É o atalho de `echo`.'),
  ]),

  mod('controle', 'Controle e funções', 'if, match, laços e funções.', [
    lesson('Decisões e laços', md`
      ~~~php
      $nota = 8;
      if ($nota >= 7) {
          echo "Aprovado";
      } elseif ($nota >= 5) {
          echo "Recuperação";
      } else {
          echo "Reprovado";
      }

      // match (PHP 8): compara com ===, devolve valor
      $texto = match (true) {
          $nota >= 9 => "Excelente",
          $nota >= 7 => "Bom",
          default => "Precisa melhorar",
      };

      for ($i = 1; $i <= 3; $i++) { echo $i; }
      while ($n < 10) { $n++; }
      ~~~

      ## == x ===

      \`==\` converte tipos antes de comparar; \`===\` compara valor **e** tipo. Prefira \`===\`.

      ~~~php
      var_dump("10" == 10);   // bool(true)
      var_dump("10" === 10);  // bool(false)
      ~~~
    `, [
      predict('Qual é a saída?', '$x = 15;\necho match (true) {\n    $x < 10 => "pequeno",\n    $x < 20 => "médio",\n    default => "grande",\n};', 'médio', 'O primeiro braço verdadeiro é `$x < 20`.'),
    ]),
    lesson('Funções', md`
      ~~~php
      function saudar(string $nome, string $saudacao = "Olá"): string {
          return "$saudacao, $nome!";
      }

      echo saudar("Bia");               // Olá, Bia!
      echo saudar("Bia", "Bom dia");    // Bom dia, Bia!
      echo saudar(saudacao: "Oi", nome: "Leo");  // argumentos nomeados

      $dobro = fn($x) => $x * 2;        // arrow function
      echo $dobro(21);                  // 42
      ~~~

      Os tipos (\`string\`, \`int\`, \`float\`, \`bool\`, \`array\`) em parâmetros e retorno são opcionais, mas ajudam a evitar bugs. Coloque \`declare(strict_types=1);\` no topo do arquivo para o PHP não converter tipos automaticamente.
    `, [
      predict('Qual é a saída?', 'function area(int $l, int $a = 2): int {\n    return $l * $a;\n}\necho area(5) + area(2, 3);', '16', '10 + 6.'),
    ]),
  ], [
    choice('Qual comparação verifica valor **e** tipo?', ['`==`', '`===`', '`=`', '`<>`'], 1, '`===` é a comparação estrita.'),
    fill('Complete a arrow function:', '$triplo = ___($x) => $x * 3;', 'fn', '`fn($x) => expressão`.'),
    predict('Qual é a saída?', '$s = 0;\nfor ($i = 0; $i < 5; $i++) {\n    if ($i % 2 == 0) continue;\n    $s += $i;\n}\necho $s;', '4', '1 + 3.'),
    choice('Em PHP, o "senão se" se escreve:', ['`else if` apenas', '`elseif` (ou `else if`)', '`elif`', '`elsif`'], 1, '`elseif` é o mais comum.'),
    predict('Qual é a saída?', 'var_dump(0 == "a");', 'bool(false)', 'No PHP 8, comparar número com texto não numérico compara como texto.'),
  ]),

  mod('arrays', 'Arrays', 'Arrays indexados, associativos e funções úteis.', [
    lesson('Arrays indexados e associativos', md`
      Em PHP, \`array\` faz o papel de lista **e** de dicionário:

      ~~~php
      $frutas = ["maçã", "uva", "pera"];
      $frutas[] = "kiwi";              // adiciona no fim
      echo count($frutas);             // 4
      echo $frutas[1];                 // uva

      $pessoa = [
          "nome" => "Ana",
          "idade" => 30,
      ];
      echo $pessoa["nome"];

      foreach ($pessoa as $chave => $valor) {
          echo "$chave: $valor\n";
      }
      ~~~

      \`print_r($array)\` mostra o conteúdo de forma legível.
    `, [
      predict('Qual é a saída?', '$a = [10, 20];\n$a[] = 30;\necho count($a) . "-" . $a[2];', '3-30', 'Três elementos; o índice 2 é 30.'),
    ]),
    lesson('Funções de array', md`
      ~~~php
      $nums = [5, 3, 8, 1];

      sort($nums);                                   // [1, 3, 5, 8]
      echo array_sum($nums);                         // 17
      echo max($nums);                               // 8
      echo in_array(3, $nums) ? "tem" : "não tem";

      $dobros = array_map(fn($n) => $n * 2, $nums);
      $grandes = array_filter($nums, fn($n) => $n > 4);
      echo implode(", ", $nums);                     // 1, 3, 5, 8
      $partes = explode("-", "a-b-c");               // ["a", "b", "c"]
      ~~~

      | Função | Faz |
      |---|---|
      | \`count\` | quantidade |
      | \`array_map\` | transforma |
      | \`array_filter\` | filtra |
      | \`implode\` / \`explode\` | junta / separa textos |
      | \`array_key_exists\` | testa uma chave |
    `, [
      predict('Qual é a saída?', '$v = [1, 2, 3, 4];\necho implode(",", array_map(fn($x) => $x * 10, $v));', '10,20,30,40', '`array_map` multiplica e `implode` junta com vírgula.'),
    ]),
  ], [
    fill('Complete para percorrer chave e valor:', 'foreach ($dados as $k ___ $v) {\n    echo "$k=$v";\n}', '=>', '`foreach ($array as $chave => $valor)`.'),
    predict('Qual é a saída?', 'echo count(explode(" ", "eu amo php"));', '3', 'Três palavras.'),
    predict('Qual é a saída?', '$p = ["a" => 1, "b" => 2];\n$p["c"] = 3;\necho array_sum($p);', '6', '1 + 2 + 3.'),
    choice('Qual função junta os elementos de um array numa string?', ['`explode`', '`implode`', '`split`', '`concat`'], 1, '`implode(", ", $array)`.'),
    choice('Como adicionar um item ao final de um array?', ['`$a.push(x)`', '`$a[] = x`', '`add($a, x)`', '`$a + x`'], 1, 'Também existe `array_push`.'),
  ]),

  mod('web', 'PHP na web', 'Formulários, segurança e sessões.', [
    lesson('Recebendo formulários', md`
      ~~~html
      <form method="post" action="contato.php">
        <input name="email" type="email">
        <button>Enviar</button>
      </form>
      ~~~

      ~~~php
      <?php
      // contato.php
      $email = $_POST['email'] ?? '';
      if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
          echo "E-mail inválido";
          exit;
      }
      echo "Recebemos: " . htmlspecialchars($email);
      ~~~

      - \`$_GET\` traz parâmetros da URL (\`?busca=livros\`); \`$_POST\` traz dados de formulários com \`method="post"\`.
      - \`??\` usa um valor padrão se a chave não existir.

      > ⚠️ **Nunca** imprima dados do usuário sem \`htmlspecialchars()\`. Caso contrário, alguém pode enviar \`<script>\` e atacar outros visitantes (XSS).
    `, [
      choice('Por que usar `htmlspecialchars` ao exibir dados do usuário?', ['Para deixar bonito', 'Para evitar que o texto seja interpretado como HTML/JS (XSS)', 'Para salvar no banco', 'Para traduzir'], 1, 'Ele transforma `<` em `&lt;` etc.'),
    ]),
    lesson('Sessões e cookies', md`
      HTTP não "lembra" de quem você é entre uma página e outra. **Sessões** resolvem isso:

      ~~~php
      <?php
      session_start();                   // sempre no topo, antes de qualquer saída
      $_SESSION['usuario'] = 'ana';

      // em outra página
      session_start();
      if (!isset($_SESSION['usuario'])) {
          header('Location: login.php');
          exit;
      }
      echo "Olá, " . htmlspecialchars($_SESSION['usuario']);
      ~~~

      ## Senhas

      ~~~php
      $hash = password_hash($senha, PASSWORD_DEFAULT);   // ao cadastrar
      if (password_verify($tentativa, $hash)) { ... }     // ao fazer login
      ~~~

      > ⚠️ Nunca guarde senhas em texto puro nem com \`md5\`. Use sempre \`password_hash\`.
    `, [
      fill('Complete para iniciar a sessão:', '___();\n$_SESSION["tema"] = "escuro";', 'session_start', 'Precisa vir antes de qualquer saída.'),
    ]),
  ], [
    choice('Qual superglobal contém dados de um formulário com `method="post"`?', ['`$_GET`', '`$_POST`', '`$_FORM`', '`$_DATA`'], 1, '`$_POST["campo"]`.'),
    choice('Qual a forma correta de guardar senhas?', ['Texto puro', '`md5($senha)`', '`password_hash($senha, PASSWORD_DEFAULT)`', '`base64_encode($senha)`'], 2, 'Gera um hash seguro com salt.'),
    bug('Qual linha tem uma falha de segurança?', md`
      <?php
      $nome = $_GET['nome'] ?? 'visitante';
      $limpo = htmlspecialchars($nome);
      echo "<h1>Olá, $nome</h1>";
    `, 4, 'Imprime `$nome` sem escapar; deveria usar `$limpo`.'),
    predict('Qual é a saída?', '$dados = [];\necho $dados["cidade"] ?? "não informada";', 'não informada', '`??` usa o padrão quando a chave não existe.'),
    choice('Para que serve `session_start()`?', ['Conectar ao banco', 'Iniciar ou retomar a sessão do usuário', 'Enviar e-mails', 'Encerrar o script'], 1, 'Permite usar `$_SESSION`.'),
  ]),

  mod('poo-banco', 'Orientação a objetos e banco de dados', 'Classes e PDO com consultas preparadas.', [
    lesson('Classes', md`
      ~~~php
      class Produto {
          public function __construct(
              public string $nome,
              private float $preco,
          ) {}

          public function precoComDesconto(float $pct): float {
              return $this->preco * (1 - $pct / 100);
          }
      }

      $p = new Produto("Fone", 200);
      echo $p->nome;                     // Fone
      echo $p->precoComDesconto(10);     // 180
      ~~~

      - \`->\` acessa propriedades e métodos do objeto; \`$this\` é o próprio objeto.
      - No PHP 8, o construtor pode declarar as propriedades direto nos parâmetros (*constructor promotion*).
      - Herança com \`extends\`, interfaces com \`implements\`.

      ## Composer

      O **Composer** é o gerenciador de pacotes do PHP. Frameworks como **Laravel** e **Symfony** são instalados com ele.
    `, [
      predict('Qual é a saída?', 'class C {\n    public function __construct(public int $n = 0) {}\n    public function inc(): static { $this->n++; return $this; }\n}\n$c = new C();\necho $c->inc()->inc()->n;', '2', 'Cada `inc()` soma 1 e devolve o próprio objeto.'),
    ]),
    lesson('Banco de dados com PDO', md`
      **PDO** é a forma padrão de acessar bancos (MySQL, PostgreSQL, SQLite...):

      ~~~php
      $pdo = new PDO('mysql:host=localhost;dbname=loja', 'usuario', 'senha', [
          PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
      ]);

      // consulta PREPARADA: o valor nunca vira parte do SQL
      $stmt = $pdo->prepare('SELECT nome, preco FROM produtos WHERE preco < :max');
      $stmt->execute(['max' => 50]);

      foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $linha) {
          echo $linha['nome'] . "\n";
      }
      ~~~

      > ⚠️ Jamais faça \`"... WHERE id = " . $_GET['id']\`. Isso permite **SQL Injection**. Sempre use \`prepare\` + \`execute\` com parâmetros.

      🎉 Parabéns! Próximo passo: construir uma aplicação completa com o framework **Laravel**.
    `, [
      choice('Como evitar SQL Injection com PDO?', ['Usar aspas duplas', 'Usar consultas preparadas com parâmetros', 'Usar `echo`', 'Desligar erros'], 1, '`prepare()` + `execute([...])`.'),
    ]),
  ], [
    fill('Complete para acessar a propriedade do objeto:', 'echo $produto___nome;', '->', 'Objetos usam `->`.'),
    choice('O que é o Composer?', ['Um editor de código', 'O gerenciador de pacotes do PHP', 'Um banco de dados', 'Um servidor web'], 1, 'Instala bibliotecas e frameworks.'),
    bug('Qual linha é vulnerável a SQL Injection?', md`
      $id = $_GET['id'];
      $sql = "SELECT * FROM usuarios WHERE id = " . $id;
      $stmt = $pdo->query($sql);
    `, 2, 'Concatenar entrada do usuário no SQL é perigoso. Use `prepare` com parâmetro.'),
    choice('Dentro de um método, como acessar o próprio objeto?', ['`self`', '`$this`', '`this`', '`me`'], 1, '`$this->propriedade`.'),
    choice('Qual framework PHP é o mais popular atualmente?', ['Django', 'Laravel', 'Rails', 'Express'], 1, 'Django é Python, Rails é Ruby, Express é JavaScript.'),
  ]),
]);
