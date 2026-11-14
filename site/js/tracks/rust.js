import { md, mod, lesson, choice, predict, fill, bug, defineTrack } from './_dsl.js';

export default defineTrack({
  id: 'rust',
  name: 'Rust',
  short: 'Rs',
  color: '#e0a37a',
  level: 'extra',
  lang: 'rust',
  category: 'Sistemas',
  tagline: 'Desempenho de C com segurança de memória garantida pelo compilador.',
  description: 'Variáveis e mutabilidade, controle de fluxo, ownership e borrowing, structs, enums, Option/Result, traits e coleções.',
}, [
  mod('intro', 'Primeiros passos', 'Cargo, println!, variáveis e mutabilidade.', [
    lesson('Olá, Rust', md`
      **Rust** é uma linguagem de sistemas que entrega a velocidade de C/C++ **sem** os bugs clássicos de memória — o compilador impede que eles existam. É usada no Firefox, no kernel do Linux, no Discord e na AWS, e é eleita há anos a linguagem "mais amada" pelos desenvolvedores.

      ~~~rust
      fn main() {
          println!("Olá, mundo!");
      }
      ~~~

      - \`fn\` declara funções; \`main\` é o ponto de entrada.
      - \`println!\` tem um \`!\` porque é uma **macro**, não uma função comum.

      ~~~bash
      cargo new meu_app     # cria o projeto
      cd meu_app
      cargo run             # compila e roda
      ~~~

      **Cargo** é o gerenciador de projetos e pacotes (chamados *crates*) do Rust.

      ## Formatação

      ~~~rust
      let nome = "Ana";
      let idade = 30;
      println!("{} tem {} anos", nome, idade);
      println!("{nome} tem {idade} anos");   // forma moderna
      println!("{:?}", vec![1, 2, 3]);       // {:?} = formato de depuração
      ~~~
    `, [
      predict('Qual é a saída?', 'let a = 3;\nlet b = 4;\nprintln!("{} + {} = {}", a, b, a + b);', '3 + 4 = 7', 'Cada `{}` recebe um argumento.'),
    ]),
    lesson('Variáveis são imutáveis por padrão', md`
      ~~~rust
      let x = 5;
      x = 6;            // ERRO: x é imutável

      let mut y = 5;    // mut = mutável
      y = 6;            // ok
      ~~~

      Isso força você a deixar claro o que muda — menos surpresas.

      ## Tipos

      | Tipo | Exemplo |
      |---|---|
      | \`i32\`, \`i64\` (inteiros com sinal) | \`-7\` |
      | \`u32\`, \`usize\` (sem sinal) | \`42\` |
      | \`f64\` | \`3.14\` |
      | \`bool\` | \`true\` |
      | \`char\` | \`'🦀'\` |
      | \`&str\` / \`String\` | \`"texto"\` |

      ## Shadowing

      Você pode declarar de novo uma variável com o mesmo nome (até com outro tipo):

      ~~~rust
      let entrada = "42";
      let entrada: i32 = entrada.parse().unwrap();
      ~~~
    `, [
      bug('Qual linha não compila?', md`
        fn main() {
            let pontos = 10;
            println!("{}", pontos);
            pontos = 20;
        }
      `, 4, '`pontos` é imutável. Declare com `let mut pontos`.'),
      fill('Complete para tornar a variável mutável:', 'let ___ contador = 0;', 'mut', '`let mut`.'),
    ]),
  ], [
    choice('Por que `println!` tem exclamação?', ['É obrigatório em toda função', 'Porque é uma macro', 'Indica erro', 'Indica que é perigoso'], 1, 'Macros em Rust terminam com `!`.'),
    choice('Qual ferramenta cria e roda projetos Rust?', ['npm', 'pip', 'cargo', 'make'], 2, '`cargo new`, `cargo run`.'),
    predict('Qual é a saída?', 'let x = 5;\nlet x = x * 2;\nlet x = x + 1;\nprintln!("{}", x);', '11', 'Shadowing: cada `let` cria uma nova variável.'),
    predict('Qual é a saída?', 'let v = vec![1, 2, 3];\nprintln!("{:?}", v);', '[1, 2, 3]', '`{:?}` usa o formato de depuração.'),
    choice('Por padrão, variáveis em Rust são:', ['Mutáveis', 'Imutáveis', 'Globais', 'Nulas'], 1, 'Use `mut` para permitir alterações.'),
  ]),

  mod('controle', 'Controle de fluxo e funções', 'if como expressão, loop, while, for e funções.', [
    lesson('if, loop, while e for', md`
      Em Rust, \`if\` é uma **expressão**: ele devolve um valor.

      ~~~rust
      let idade = 20;
      let tipo = if idade >= 18 { "adulto" } else { "menor" };
      ~~~

      ## Laços

      ~~~rust
      for i in 1..=3 {          // 1, 2, 3 (..= inclui o fim)
          println!("{i}");
      }
      for i in 0..3 { }         // 0, 1, 2

      let mut n = 1;
      while n < 100 { n *= 2; }

      let resultado = loop {    // loop infinito que devolve valor
          n += 1;
          if n % 7 == 0 { break n; }
      };
      ~~~

      ## match

      ~~~rust
      let nota = 8;
      let conceito = match nota {
          10 => "A+",
          8 | 9 => "A",
          5..=7 => "B",
          _ => "C",
      };
      ~~~

      O \`match\` precisa cobrir **todos** os casos — o \`_\` pega o resto.
    `, [
      predict('Qual é a saída?', 'let mut s = 0;\nfor i in 1..=4 {\n    s += i;\n}\nprintln!("{}", s);', '10', '`1..=4` inclui o 4.'),
      predict('Qual é a saída?', 'let n = 6;\nlet r = match n {\n    1..=5 => "baixo",\n    6 | 7 => "médio",\n    _ => "alto",\n};\nprintln!("{}", r);', 'médio', '6 casa com `6 | 7`.'),
    ]),
    lesson('Funções', md`
      ~~~rust
      fn quadrado(x: i32) -> i32 {
          x * x          // sem ponto e vírgula: é o valor retornado
      }

      fn saudar(nome: &str) {
          println!("Olá, {nome}!");
      }
      ~~~

      - Os tipos dos parâmetros são **obrigatórios**.
      - \`-> i32\` indica o tipo de retorno.
      - A **última expressão** sem \`;\` é retornada automaticamente. Também existe \`return\` para sair antes.

      > ⚠️ Colocar \`;\` na última linha (\`x * x;\`) transforma a expressão em instrução, e a função passa a retornar \`()\` — erro de tipo.
    `, [
      predict('Qual é a saída?', 'fn dobro(x: i32) -> i32 {\n    x * 2\n}\nfn main() {\n    println!("{}", dobro(dobro(4)));\n}', '16', 'dobro(4) = 8; dobro(8) = 16.'),
    ]),
  ], [
    choice('O que significa `1..5` num `for`?', ['1 a 5, incluindo o 5', '1 a 4 (o 5 não entra)', '5 vezes o número 1', 'Erro'], 1, 'Use `1..=5` para incluir o 5.'),
    bug('Qual linha impede a função de retornar o valor?', md`
      fn soma(a: i32, b: i32) -> i32 {
          a + b;
      }
    `, 2, 'Com `;`, a linha não é mais uma expressão de retorno. Remova o `;`.'),
    fill('Complete o caso "qualquer outro" do match:', 'match x {\n    1 => "um",\n    ___ => "outro",\n}', '_', '`_` cobre os casos restantes.'),
    predict('Qual é a saída?', 'let x = 7;\nlet par = if x % 2 == 0 { "par" } else { "ímpar" };\nprintln!("{}", par);', 'ímpar', '`if` como expressão.'),
    choice('O que `match` exige?', ['Um `default` obrigatório', 'Que todos os casos possíveis sejam cobertos', 'Só números', 'Que seja usado dentro de loop'], 1, 'O compilador verifica a exaustividade.'),
  ]),

  mod('ownership', 'Ownership e borrowing', 'O sistema que torna Rust seguro.', [
    lesson('Ownership', md`
      Este é o conceito mais importante do Rust. Três regras:

      1. Cada valor tem **um único dono** (uma variável).
      2. Quando o dono sai de escopo, o valor é **liberado** automaticamente.
      3. Atribuir ou passar o valor para uma função **move** a posse.

      ~~~rust
      let s1 = String::from("olá");
      let s2 = s1;              // a posse MOVEU para s2
      println!("{}", s1);       // ERRO: s1 não é mais válido
      ~~~

      Assim, nunca há duas variáveis tentando liberar a mesma memória — e não precisa de *garbage collector*.

      Para duplicar de verdade, use \`.clone()\`:

      ~~~rust
      let s2 = s1.clone();      // agora os dois são válidos
      ~~~

      > ℹ️ Tipos simples como \`i32\`, \`f64\`, \`bool\` e \`char\` são **copiados** em vez de movidos (implementam o trait \`Copy\`).
    `, [
      bug('Qual linha não compila?', md`
        fn main() {
            let a = String::from("rust");
            let b = a;
            println!("{} {}", a, b);
        }
      `, 4, 'A posse de `a` foi movida para `b`; `a` não pode mais ser usada.'),
    ]),
    lesson('Referências e borrowing', md`
      Para usar um valor **sem tomar a posse**, empreste com \`&\`:

      ~~~rust
      fn tamanho(s: &String) -> usize {
          s.len()
      }

      let nome = String::from("Ana");
      let n = tamanho(&nome);   // empresta
      println!("{nome} tem {n} letras"); // nome continua válido
      ~~~

      Para alterar, use uma referência **mutável**:

      ~~~rust
      fn exclamar(s: &mut String) {
          s.push('!');
      }

      let mut msg = String::from("Oi");
      exclamar(&mut msg);       // "Oi!"
      ~~~

      ## As regras do empréstimo

      Em um mesmo momento você pode ter **ou** várias referências imutáveis (\`&T\`), **ou** uma única referência mutável (\`&mut T\`) — nunca as duas. Isso elimina *data races* em tempo de compilação.
    `, [
      predict('Qual é a saída?', 'fn add(s: &mut String) {\n    s.push_str("!!");\n}\nfn main() {\n    let mut t = String::from("ok");\n    add(&mut t);\n    println!("{}", t);\n}', 'ok!!', 'A referência mutável permitiu alterar `t`.'),
      fill('Complete para emprestar sem mover:', 'let n = tamanho(___nome);', '&', '`&nome` cria uma referência.'),
    ]),
  ], [
    choice('O que acontece com `let b = a;` quando `a` é uma `String`?', ['Copia', 'Move a posse para `b`; `a` fica inválida', 'Cria uma referência', 'Erro sempre'], 1, 'Strings são movidas, não copiadas.'),
    choice('Quantas referências mutáveis a um valor podem existir ao mesmo tempo?', ['Ilimitadas', 'Uma', 'Duas', 'Nenhuma'], 1, 'Uma única `&mut`, sem outras referências simultâneas.'),
    predict('Qual é a saída?', 'let a = 5;\nlet b = a;\nprintln!("{} {}", a, b);', '5 5', '`i32` implementa `Copy`: é copiado, não movido.'),
    fill('Complete para duplicar a String:', 'let copia = original.___();', 'clone', '`.clone()` faz uma cópia profunda.'),
    choice('Quando a memória de uma `String` é liberada?', ['Manualmente com `free`', 'Quando o dono sai de escopo', 'Pelo garbage collector', 'Nunca'], 1, 'É a regra de ownership.'),
  ]),

  mod('tipos', 'Structs, enums e erros', 'Tipos próprios, Option, Result e o operador ?.', [
    lesson('Structs e impl', md`
      ~~~rust
      struct Retangulo {
          largura: u32,
          altura: u32,
      }

      impl Retangulo {
          fn nova(l: u32, a: u32) -> Self {   // "construtor"
              Self { largura: l, altura: a }
          }

          fn area(&self) -> u32 {
              self.largura * self.altura
          }
      }

      let r = Retangulo::nova(3, 4);
      println!("{}", r.area()); // 12
      ~~~

      - Métodos ficam num bloco \`impl\`.
      - \`&self\` = empresta o objeto; \`&mut self\` = empresta mutável.
      - Funções sem \`self\` são chamadas com \`::\` (ex.: \`Retangulo::nova\`).
    `, [
      predict('Qual é a saída?', 'struct P { x: i32, y: i32 }\nimpl P {\n    fn soma(&self) -> i32 { self.x + self.y }\n}\nfn main() {\n    let p = P { x: 2, y: 5 };\n    println!("{}", p.soma());\n}', '7', '2 + 5.'),
    ]),
    lesson('Enums, Option e Result', md`
      Rust **não tem null**. Um valor que pode faltar é um \`Option\`:

      ~~~rust
      enum Option<T> { Some(T), None }   // já vem pronto

      let nomes = vec!["Ana", "Bia"];
      match nomes.get(5) {
          Some(n) => println!("achei {n}"),
          None => println!("não existe"),
      }
      ~~~

      Operações que podem falhar devolvem \`Result\`:

      ~~~rust
      fn dividir(a: f64, b: f64) -> Result<f64, String> {
          if b == 0.0 {
              return Err(String::from("divisão por zero"));
          }
          Ok(a / b)
      }

      match dividir(10.0, 2.0) {
          Ok(v) => println!("{v}"),
          Err(e) => println!("erro: {e}"),
      }
      ~~~

      ## O operador ?

      Dentro de uma função que retorna \`Result\`, \`?\` devolve o erro automaticamente ou extrai o valor:

      ~~~rust
      fn ler_numero(s: &str) -> Result<i32, std::num::ParseIntError> {
          let n = s.trim().parse::<i32>()?;
          Ok(n * 2)
      }
      ~~~

      \`.unwrap()\` extrai o valor ou **derruba o programa** se for \`None\`/\`Err\`. Use só em protótipos.
    `, [
      predict('Qual é a saída?', 'let v = vec![10, 20];\nlet r = match v.get(3) {\n    Some(x) => *x,\n    None => -1,\n};\nprintln!("{}", r);', '-1', 'O índice 3 não existe, então `get` devolve `None`.'),
    ]),
  ], [
    choice('Como Rust representa "talvez não exista valor"?', ['`null`', '`Option<T>` com `Some` e `None`', '`undefined`', '`-1`'], 1, 'Rust não tem null.'),
    choice('O que `Result<T, E>` representa?', ['Um número', 'Sucesso (`Ok`) ou erro (`Err`)', 'Uma lista', 'Um ponteiro'], 1, 'Erros são valores.'),
    fill('Complete o bloco onde ficam os métodos:', '___ Conta {\n    fn saldo(&self) -> f64 { 0.0 }\n}', 'impl', '`impl Tipo { ... }`.'),
    predict('Qual é a saída?', 'let r: Result<i32, String> = Ok(3);\nmatch r {\n    Ok(v) => println!("{}", v * 10),\n    Err(e) => println!("{}", e),\n}', '30', 'É `Ok(3)`.'),
    choice('O que acontece com `.unwrap()` num `None`?', ['Retorna 0', 'O programa entra em pânico (encerra)', 'Retorna None', 'Nada'], 1, 'Use `match`, `if let` ou `?` em código real.'),
  ]),

  mod('colecoes', 'Coleções, traits e iteradores', 'Vec, HashMap, traits e closures.', [
    lesson('Vec, HashMap e iteradores', md`
      ~~~rust
      let mut nums = vec![3, 1, 4];
      nums.push(1);
      nums.sort();
      println!("{:?}", nums);   // [1, 1, 3, 4]

      use std::collections::HashMap;
      let mut estoque = HashMap::new();
      estoque.insert("caneta", 10);
      *estoque.entry("lápis").or_insert(0) += 5;
      ~~~

      ## Iteradores e closures

      ~~~rust
      let v = vec![1, 2, 3, 4, 5];
      let pares_dobrados: Vec<i32> = v.iter()
          .filter(|x| *x % 2 == 0)
          .map(|x| x * 2)
          .collect();
      println!("{:?}", pares_dobrados); // [4, 8]

      let total: i32 = v.iter().sum();
      ~~~

      \`|x| x * 2\` é uma **closure** (função anônima). Iteradores em Rust são "preguiçosos" e tão rápidos quanto um laço escrito à mão.
    `, [
      predict('Qual é a saída?', 'let v = vec![1, 2, 3, 4];\nlet s: i32 = v.iter().map(|x| x * x).sum();\nprintln!("{}", s);', '30', '1 + 4 + 9 + 16.'),
    ]),
    lesson('Traits', md`
      Um **trait** define comportamento compartilhado — parecido com interfaces:

      ~~~rust
      trait Falante {
          fn falar(&self) -> String;
      }

      struct Cachorro;
      struct Gato;

      impl Falante for Cachorro {
          fn falar(&self) -> String { String::from("Au!") }
      }
      impl Falante for Gato {
          fn falar(&self) -> String { String::from("Miau!") }
      }

      fn apresentar(a: &impl Falante) {
          println!("{}", a.falar());
      }
      ~~~

      Traits da biblioteca padrão aparecem o tempo todo: \`Debug\` (para \`{:?}\`), \`Clone\`, \`PartialEq\` (para \`==\`). Muitos podem ser gerados com \`#[derive(Debug, Clone, PartialEq)]\`.

      🎉 Parabéns! Para continuar, leia o livro oficial gratuito "The Rust Programming Language" e experimente criar uma ferramenta de linha de comando.
    `, [
      fill('Complete para implementar o trait para o tipo:', 'impl Falante ___ Pato {\n    fn falar(&self) -> String { String::from("Quack") }\n}', 'for', '`impl Trait for Tipo`.'),
    ]),
  ], [
    predict('Qual é a saída?', 'let mut v = vec![5, 2, 8];\nv.sort();\nprintln!("{:?}", v);', '[2, 5, 8]', '`sort` ordena no lugar.'),
    choice('O que é `|x| x + 1`?', ['Um operador lógico', 'Uma closure (função anônima)', 'Um comentário', 'Um tipo'], 1, 'Closures usam barras verticais para os parâmetros.'),
    fill('Complete para transformar o iterador numa coleção:', 'let v: Vec<i32> = it.map(|x| x * 2).___();', 'collect', '`collect` materializa o resultado.'),
    choice('Para que serve `#[derive(Debug)]`?', ['Debugar no navegador', 'Gerar automaticamente a implementação do trait Debug', 'Desativar erros', 'Criar testes'], 1, 'Permite usar `{:?}`.'),
    predict('Qual é a saída?', 'let n = vec![3, 6, 9, 12];\nlet c = n.iter().filter(|x| **x > 5).count();\nprintln!("{}", c);', '3', '6, 9 e 12.'),
  ]),
]);
