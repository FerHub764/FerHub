import { md, mod, lesson, choice, predict, fill, bug } from '../_dsl.js';

export default [
  mod('intro', 'Primeiros passos', 'JVM, estrutura de um programa e saída na tela.', [
    lesson('O que é Java?', md`
      Java é uma linguagem **orientada a objetos** e **fortemente tipada**, criada em 1995. É uma das mais usadas do mundo em sistemas de empresas, bancos, governo e no Android.

      ## Escreva uma vez, rode em qualquer lugar

      Java não é traduzido direto para a linguagem da máquina. O processo é:

      1. Você escreve \`Main.java\` (código-fonte).
      2. O compilador \`javac\` gera \`Main.class\` (**bytecode**).
      3. A **JVM** (*Java Virtual Machine*) executa o bytecode em Windows, Linux, Mac...

      ~~~bash
      javac Main.java
      java Main
      ~~~

      > 💡 Para instalar: baixe um **JDK** (por exemplo, o Eclipse Temurin) e use uma IDE como IntelliJ IDEA ou VS Code. Para experimentar sem instalar, procure por "Java online compiler".

      > ℹ️ Nesta trilha o código não roda no navegador. Você vai treinar **lendo código, prevendo a saída e encontrando erros** — habilidades que todo programador usa o tempo todo.
    `, [
      choice('O que a JVM executa?', ['O arquivo .java diretamente', 'Bytecode (.class)', 'Código em C', 'HTML'], 1, 'O `javac` gera bytecode, que a JVM executa.'),
      choice('Qual comando compila um arquivo Java?', ['`java Main.java`', '`javac Main.java`', '`jvm Main`', '`run Main`'], 1, '`javac` é o compilador.'),
    ]),
    lesson('Estrutura de um programa', md`
      ~~~java
      public class Main {
          public static void main(String[] args) {
              System.out.println("Olá, mundo!");
          }
      }
      ~~~

      Parece muita coisa para um "olá"! Vamos por partes:

      | Trecho | Significado |
      |---|---|
      | \`public class Main\` | todo código Java vive dentro de uma **classe**; o arquivo deve se chamar \`Main.java\` |
      | \`public static void main(String[] args)\` | o **ponto de entrada**: o programa começa aqui |
      | \`System.out.println(...)\` | imprime e pula linha |
      | \`;\` | **toda** instrução termina com ponto e vírgula |
      | \`{ }\` | delimitam blocos |

      ## print x println

      ~~~java
      System.out.print("A");
      System.out.print("B");
      System.out.println("C");
      System.out.println("D");
      ~~~

      ~~~text
      ABC
      D
      ~~~

      \`print\` não pula linha; \`println\` pula depois de imprimir.

      ## Comentários

      ~~~java
      // uma linha
      /* várias
         linhas */
      ~~~
    `, [
      predict('Qual é a saída? (escreva as linhas separadas por espaço)', 'System.out.print("Oi ");\nSystem.out.println("Java");\nSystem.out.println("!");', 'Oi Java !', '`print` não quebra a linha; `println` quebra.'),
      bug('Qual linha não compila?', md`
        public class Main {
            public static void main(String[] args) {
                System.out.println("Linha 1")
                System.out.println("Linha 2");
            }
        }
      `, 3, 'Falta o ponto e vírgula no fim da linha 3.'),
    ]),
  ], [
    choice('Onde um programa Java começa a executar?', ['Na primeira linha do arquivo', 'No método `main`', 'No construtor', 'Na classe `System`'], 1, '`public static void main(String[] args)` é o ponto de entrada.'),
    fill('Complete para imprimir e pular linha:', 'System.out.___("Olá");', 'println', '`println` = print line.'),
    choice('Como deve se chamar o arquivo que contém `public class Pedido`?', ['`pedido.java`', '`Pedido.java`', '`Pedido.class`', 'Qualquer nome'], 1, 'O nome do arquivo precisa ser igual ao da classe pública.'),
    predict('Qual é a saída?', 'System.out.println("Soma: " + 2 + 3);', 'Soma: 23', 'Da esquerda para a direita: "Soma: " + 2 vira texto, depois + 3 concatena.'),
    predict('Qual é a saída?', 'System.out.println(2 + 3 + " é a soma");', '5 é a soma', 'Primeiro soma 2 + 3 = 5 (números), depois concatena.'),
    choice('O que significa dizer que Java é "fortemente tipado"?', ['Que o código é difícil', 'Que cada variável tem um tipo definido e verificado', 'Que só aceita números', 'Que roda mais rápido'], 1, 'O compilador verifica os tipos antes de rodar.'),
  ]),

  mod('tipos', 'Variáveis e tipos', 'Tipos primitivos, String, conversões e entrada de dados.', [
    lesson('Tipos primitivos e String', md`
      Em Java você declara o **tipo** de cada variável:

      ~~~java
      int idade = 25;
      double altura = 1.75;
      boolean ativo = true;
      char inicial = 'A';
      String nome = "Carla";
      ~~~

      | Tipo | Guarda | Exemplo |
      |---|---|---|
      | \`int\` | inteiros (até ~2 bilhões) | \`42\` |
      | \`long\` | inteiros grandes | \`8000000000L\` |
      | \`double\` | decimais | \`3.14\` |
      | \`boolean\` | verdadeiro/falso | \`true\` |
      | \`char\` | um caractere (aspas **simples**) | \`'x'\` |
      | \`String\` | texto (aspas **duplas**) | \`"oi"\` |

      \`String\` começa com maiúscula porque não é primitivo: é uma **classe**.

      ## var e final

      ~~~java
      var cidade = "Belém";   // o compilador deduz que é String
      final double PI = 3.14159; // constante: não pode mudar
      ~~~

      ## Divisão inteira!

      ~~~java
      System.out.println(7 / 2);    // 3   (int / int = int)
      System.out.println(7 / 2.0);  // 3.5
      System.out.println(7 % 2);    // 1
      ~~~
    `, [
      predict('Qual é a saída?', 'int a = 10;\nint b = 4;\nSystem.out.println(a / b);', '2', 'Divisão entre `int` descarta a parte decimal.'),
      choice('Qual declaração está correta?', ['`char c = "a";`', '`String s = \'oi\';`', '`char c = \'a\';`', '`int n = 2.5;`'], 2, '`char` usa aspas simples; `String` usa aspas duplas.'),
    ]),
    lesson('Conversões e entrada com Scanner', md`
      ## Casting

      ~~~java
      double preco = 9.99;
      int inteiro = (int) preco;     // 9 (corta, não arredonda)
      double d = 5;                  // int vira double automaticamente
      ~~~

      ## Texto ↔ número

      ~~~java
      int n = Integer.parseInt("42");
      double x = Double.parseDouble("3.5");
      String s = String.valueOf(100);
      ~~~

      ## Lendo do teclado

      ~~~java
      import java.util.Scanner;

      public class Main {
          public static void main(String[] args) {
              Scanner sc = new Scanner(System.in);
              System.out.print("Seu nome: ");
              String nome = sc.nextLine();
              System.out.print("Sua idade: ");
              int idade = sc.nextInt();
              System.out.println(nome + " tem " + idade + " anos");
          }
      }
      ~~~

      > ⚠️ Depois de \`nextInt()\`, a quebra de linha fica "sobrando". Se for ler texto em seguida, chame \`sc.nextLine()\` uma vez para descartá-la.
    `, [
      predict('Qual é a saída?', 'double v = 7.9;\nint i = (int) v;\nSystem.out.println(i);', '7', 'O cast para `int` descarta a parte decimal.'),
      fill('Complete para converter texto em inteiro:', 'int n = Integer.___("15");', 'parseInt', '`Integer.parseInt`.'),
    ]),
  ], [
    choice('Qual tipo é adequado para guardar `19.90`?', ['`int`', '`boolean`', '`double`', '`char`'], 2, 'Valores com decimais usam `double`.'),
    predict('Qual é a saída?', 'System.out.println(9 / 2 + 9 % 2);', '5', '9 / 2 = 4 e 9 % 2 = 1.'),
    bug('Qual linha não compila?', md`
      int quantidade = 3;
      double preco = 2.5;
      int total = quantidade * preco;
      System.out.println(total);
    `, 3, '`int * double` resulta em `double`, que não cabe em `int` sem cast.'),
    fill('Complete para declarar uma constante:', '___ int MAX = 100;', 'final', '`final` impede reatribuição.'),
    predict('Qual é a saída?', 'String s = "Java";\nchar c = s.charAt(0);\nSystem.out.println(c);', 'J', '`charAt(0)` é o primeiro caractere.'),
    choice('Qual classe lê dados do teclado?', ['`Reader`', '`Input`', '`Scanner`', '`Console.read`'], 2, '`new Scanner(System.in)`.'),
  ]),

  mod('controle', 'Decisões', 'Operadores, if/else e switch.', [
    lesson('Operadores e if/else', md`
      ## Comparação e lógica

      \`== != > < >= <=\` comparam; \`&&\` (E), \`||\` (OU) e \`!\` (NÃO) combinam.

      ~~~java
      int nota = 72;
      if (nota >= 90) {
          System.out.println("A");
      } else if (nota >= 70) {
          System.out.println("B");
      } else {
          System.out.println("C");
      }
      ~~~

      ## Comparando Strings

      > ⚠️ Para comparar o **conteúdo** de textos, use \`.equals()\`, nunca \`==\`. O \`==\` compara se são o **mesmo objeto** na memória.

      ~~~java
      String a = "sim";
      String b = new String("sim");
      System.out.println(a == b);       // false
      System.out.println(a.equals(b));  // true
      System.out.println("SIM".equalsIgnoreCase(a)); // true
      ~~~

      ## Ternário

      ~~~java
      int idade = 17;
      String tipo = idade >= 18 ? "adulto" : "menor";
      ~~~
    `, [
      predict('Qual é a saída?', 'int x = 15;\nif (x > 10 && x < 20) {\n    System.out.println("dentro");\n} else {\n    System.out.println("fora");\n}', 'dentro', '15 está entre 10 e 20.'),
      choice('Como comparar o conteúdo de duas Strings `a` e `b`?', ['`a == b`', '`a.equals(b)`', '`a = b`', '`a.compare(b) == true`'], 1, '`.equals` compara o conteúdo.'),
    ]),
    lesson('switch', md`
      O **switch moderno** (Java 14+) usa setas e não precisa de \`break\`:

      ~~~java
      int dia = 6;
      String nome = switch (dia) {
          case 1, 7 -> "Fim de semana";
          case 2, 3, 4, 5, 6 -> "Dia útil";
          default -> "Inválido";
      };
      System.out.println(nome); // Dia útil
      ~~~

      O **switch clássico** ainda é comum em códigos antigos:

      ~~~java
      switch (opcao) {
          case 'a':
              System.out.println("Adicionar");
              break;
          case 'r':
              System.out.println("Remover");
              break;
          default:
              System.out.println("Opção inválida");
      }
      ~~~

      No clássico, esquecer o \`break\` faz a execução continuar no próximo \`case\`.
    `, [
      predict('Qual é a saída?', 'int n = 3;\nString r = switch (n) {\n    case 1 -> "um";\n    case 2, 3 -> "dois ou três";\n    default -> "outro";\n};\nSystem.out.println(r);', 'dois ou três', 'O `case 2, 3` cobre o valor 3.'),
    ]),
  ], [
    predict('Qual é a saída?', 'int a = 5;\nSystem.out.println(a > 3 ? "grande" : "pequeno");', 'grande', '5 > 3.'),
    predict('Qual é a saída?', 'boolean x = true;\nboolean y = false;\nSystem.out.println(x && !y);', 'true', '`!y` é true; true && true = true.'),
    bug('Qual linha tem erro de lógica ao comparar textos?', md`
      Scanner sc = new Scanner(System.in);
      String senha = sc.nextLine();
      if (senha == "1234") {
          System.out.println("ok");
      }
    `, 3, 'Use `senha.equals("1234")` para comparar conteúdo.'),
    fill('Complete o operador lógico "E":', 'if (idade >= 18 ___ temCnh) { ... }', '&&', '`&&` é o E lógico.'),
    choice('No switch clássico, o que acontece sem `break`?', ['Erro de compilação', 'Continua executando os próximos cases', 'Para o programa', 'Nada'], 1, 'É o *fall-through*.'),
    predict('Qual é a saída?', 'int v = 0;\nif (v > 0) System.out.println("positivo");\nelse if (v < 0) System.out.println("negativo");\nelse System.out.println("zero");', 'zero', 'Nem maior nem menor que zero.'),
  ]),

  mod('lacos', 'Repetições', 'for, while, do-while e for-each.', [
    lesson('for, while e do-while', md`
      ~~~java
      for (int i = 1; i <= 5; i++) {
          System.out.println("Volta " + i);
      }
      ~~~

      ~~~java
      int n = 1;
      while (n < 1000) {
          n *= 2;
      }
      System.out.println(n); // 1024
      ~~~

      ## do-while

      Executa o bloco **pelo menos uma vez** e só depois testa:

      ~~~java
      int tentativa = 0;
      do {
          tentativa++;
          System.out.println("Tentativa " + tentativa);
      } while (tentativa < 3);
      ~~~

      Útil para menus: mostra as opções primeiro, depois pergunta se deve repetir.

      ## break e continue

      Funcionam como em outras linguagens: \`break\` sai do laço, \`continue\` pula para a próxima volta.
    `, [
      predict('Qual é a saída?', 'int soma = 0;\nfor (int i = 1; i <= 4; i++) {\n    soma += i * i;\n}\nSystem.out.println(soma);', '30', '1 + 4 + 9 + 16 = 30.'),
      predict('Qual é a saída?', 'int k = 10;\ndo {\n    k++;\n} while (k < 5);\nSystem.out.println(k);', '11', 'O do-while executa uma vez antes de testar a condição.'),
    ]),
    lesson('for-each e laços aninhados', md`
      O **for-each** percorre todos os elementos de um array ou coleção:

      ~~~java
      String[] frutas = {"maçã", "uva", "pera"};
      for (String f : frutas) {
          System.out.println(f);
      }
      ~~~

      Leia \`for (String f : frutas)\` como "para cada \`f\` em \`frutas\`".

      ## Aninhados: tabuada

      ~~~java
      for (int i = 1; i <= 3; i++) {
          for (int j = 1; j <= 3; j++) {
              System.out.print(i * j + "\t");
          }
          System.out.println();
      }
      ~~~

      ~~~text
      1	2	3
      2	4	6
      3	6	9
      ~~~
    `, [
      fill('Complete o for-each:', 'for (int n ___ numeros) {\n    System.out.println(n);\n}', ':', 'A sintaxe é `for (Tipo item : colecao)`.'),
    ]),
  ], [
    predict('Qual é a saída?', 'for (int i = 10; i > 0; i -= 3) {\n    System.out.print(i + " ");\n}', '10 7 4 1', 'Subtrai 3 enquanto i > 0.'),
    choice('Qual laço garante executar o bloco ao menos uma vez?', ['`for`', '`while`', '`do-while`', '`for-each`'], 2, 'O `do-while` testa a condição no final.'),
    predict('Qual é a saída?', 'int c = 0;\nfor (int i = 0; i < 3; i++)\n    for (int j = 0; j < 4; j++)\n        c++;\nSystem.out.println(c);', '12', '3 × 4 = 12 voltas.'),
    bug('Este laço deveria imprimir 0 a 4. Qual linha causa um laço infinito?', md`
      int i = 0;
      while (i < 5) {
          System.out.println(i);
          i--;
      }
    `, 4, '`i--` faz `i` diminuir; nunca chega a 5. Deveria ser `i++`.'),
    predict('Qual é a saída?', 'for (int i = 1; i <= 10; i++) {\n    if (i % 4 == 0) break;\n    System.out.print(i);\n}', '123', 'Para quando i = 4.'),
    fill('Complete para pular os números pares:', 'for (int i = 1; i <= 9; i++) {\n    if (i % 2 == 0) ___;\n    System.out.println(i);\n}', 'continue', '`continue` pula para a próxima volta.'),
  ]),

  mod('arrays', 'Arrays e Strings', 'Arrays, métodos de String e StringBuilder.', [
    lesson('Arrays', md`
      Um array guarda vários valores do **mesmo tipo**, com **tamanho fixo**:

      ~~~java
      int[] notas = {8, 7, 10, 6};
      System.out.println(notas[0]);       // 8
      System.out.println(notas.length);   // 4

      double[] precos = new double[3];    // [0.0, 0.0, 0.0]
      precos[1] = 9.90;
      ~~~

      > ⚠️ Acessar uma posição fora do array (\`notas[4]\` acima) lança \`ArrayIndexOutOfBoundsException\`. Os índices vão de 0 até \`length - 1\`.

      ## Utilitários

      ~~~java
      import java.util.Arrays;

      int[] v = {5, 2, 9, 1};
      Arrays.sort(v);
      System.out.println(Arrays.toString(v)); // [1, 2, 5, 9]
      ~~~

      ## Matrizes

      ~~~java
      int[][] m = { {1, 2}, {3, 4} };
      System.out.println(m[1][0]); // 3
      ~~~
    `, [
      predict('Qual é a saída?', 'int[] v = {4, 8, 15, 16};\nSystem.out.println(v[1] + v[v.length - 1]);', '24', 'v[1] = 8 e o último é 16.'),
      bug('Qual linha lança exceção ao executar?', md`
        int[] dias = new int[7];
        dias[0] = 1;
        dias[6] = 7;
        dias[7] = 8;
      `, 4, 'Um array de tamanho 7 tem índices de 0 a 6.'),
    ]),
    lesson('Métodos de String e StringBuilder', md`
      ~~~java
      String s = "  Programação Java  ";
      String t = s.trim();                 // "Programação Java"
      System.out.println(t.length());      // 16
      System.out.println(t.toUpperCase()); // PROGRAMAÇÃO JAVA
      System.out.println(t.substring(0, 4)); // Prog
      System.out.println(t.contains("Java"));  // true
      System.out.println(t.replace("a", "@")); // Progr@m@ção J@v@
      System.out.println(t.indexOf("J"));      // 12
      String[] partes = "a,b,c".split(",");
      ~~~

      ## Strings são imutáveis

      Métodos como \`toUpperCase\` **não mudam** a string original: devolvem uma nova. Por isso, concatenar muitas vezes num laço cria vários objetos. Use \`StringBuilder\`:

      ~~~java
      StringBuilder sb = new StringBuilder();
      for (int i = 0; i < 3; i++) {
          sb.append(i).append("-");
      }
      System.out.println(sb.toString()); // 0-1-2-
      ~~~
    `, [
      predict('Qual é a saída?', 'String s = "banana";\nSystem.out.println(s.substring(1, 3) + s.length());', 'an6', '`substring(1, 3)` = "an"; o tamanho é 6.'),
      predict('Qual é a saída?', 'String s = "oi";\ns.toUpperCase();\nSystem.out.println(s);', 'oi', 'Strings são imutáveis: o resultado de `toUpperCase` foi descartado.'),
    ]),
  ], [
    choice('Qual propriedade dá o tamanho de um array?', ['`size()`', '`length`', '`length()`', '`count`'], 1, 'Arrays usam `length` (sem parênteses); Strings usam `length()`.'),
    predict('Qual é a saída?', 'int[] a = new int[3];\nSystem.out.println(a[2]);', '0', 'Arrays de `int` começam preenchidos com 0.'),
    predict('Qual é a saída?', 'System.out.println("Java".indexOf("v"));', '2', 'J=0, a=1, v=2.'),
    fill('Complete para juntar textos eficientemente num laço:', '___ sb = new StringBuilder();', 'StringBuilder', 'StringBuilder é mutável.'),
    choice('O que significa String ser imutável?', ['Não pode ser impressa', 'Seus métodos devolvem novas Strings sem alterar a original', 'Só aceita letras', 'Não pode ser comparada'], 1, 'O objeto original nunca muda.'),
    predict('Qual é a saída?', 'int[][] m = {{1, 2, 3}, {4, 5, 6}};\nSystem.out.println(m[1][2]);', '6', 'Linha 1, coluna 2.'),
  ]),
];
