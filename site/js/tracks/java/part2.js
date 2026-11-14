import { md, mod, lesson, choice, predict, fill, bug } from '../_dsl.js';

export default [
  mod('metodos', 'Métodos', 'Criar métodos, parâmetros, retorno e sobrecarga.', [
    lesson('Criando métodos', md`
      Métodos são as funções do Java. Por enquanto, vamos criá-los como \`static\` dentro da classe \`Main\`:

      ~~~java
      public class Main {
          static int somar(int a, int b) {
              return a + b;
          }

          static void saudar(String nome) {
              System.out.println("Olá, " + nome);
          }

          public static void main(String[] args) {
              int r = somar(3, 4);
              System.out.println(r);  // 7
              saudar("Leo");
          }
      }
      ~~~

      A **assinatura** do método diz tudo:

      - \`int\` antes do nome: o **tipo de retorno**. \`void\` = não retorna nada.
      - \`(int a, int b)\`: parâmetros, cada um com seu tipo.

      Se o método declara um tipo de retorno, **todo caminho** precisa terminar com \`return\` de um valor desse tipo — senão não compila.
    `, [
      predict('Qual é a saída?', 'public class Main {\n    static int dobro(int x) {\n        return x * 2;\n    }\n    public static void main(String[] args) {\n        System.out.println(dobro(dobro(3)));\n    }\n}', '12', 'dobro(3) = 6; dobro(6) = 12.'),
      fill('Complete o tipo de retorno de um método que não devolve nada:', 'static ___ imprimir(String s) {\n    System.out.println(s);\n}', 'void', '`void` = sem retorno.'),
    ]),
    lesson('Sobrecarga e passagem por valor', md`
      ## Sobrecarga (overloading)

      Vários métodos podem ter o **mesmo nome** com parâmetros diferentes:

      ~~~java
      static int area(int lado) { return lado * lado; }
      static int area(int base, int altura) { return base * altura; }

      area(4);     // 16 — chama a primeira
      area(2, 5);  // 10 — chama a segunda
      ~~~

      ## Java passa argumentos por valor

      O método recebe uma **cópia** do valor. Mudar o parâmetro não muda a variável original:

      ~~~java
      static void zerar(int n) { n = 0; }

      int x = 10;
      zerar(x);
      System.out.println(x); // 10
      ~~~

      Com objetos e arrays, a cópia é da **referência** — então o método consegue alterar o conteúdo do objeto:

      ~~~java
      static void zerarPrimeiro(int[] v) { v[0] = 0; }

      int[] dados = {5, 6};
      zerarPrimeiro(dados);
      System.out.println(dados[0]); // 0
      ~~~
    `, [
      predict('Qual é a saída?', 'public class Main {\n    static void mudar(int n) {\n        n = n + 100;\n    }\n    public static void main(String[] args) {\n        int a = 1;\n        mudar(a);\n        System.out.println(a);\n    }\n}', '1', 'O método recebeu uma cópia de `a`.'),
    ]),
  ], [
    choice('O que é sobrecarga de métodos?', ['Um método muito grande', 'Métodos com o mesmo nome e parâmetros diferentes', 'Chamar um método várias vezes', 'Um erro de compilação'], 1, 'O compilador escolhe pelo tipo/quantidade de argumentos.'),
    bug('Qual linha impede a compilação?', md`
      static int maior(int a, int b) {
          if (a > b) {
              return a;
          }
      }
    `, 5, 'Se `a <= b`, o método chega ao fim sem `return`. Falta `return b;` antes da chave final.'),
    predict('Qual é a saída?', 'public class Main {\n    static String rep(String s, int n) {\n        String r = "";\n        for (int i = 0; i < n; i++) r += s;\n        return r;\n    }\n    public static void main(String[] args) {\n        System.out.println(rep("ab", 3));\n    }\n}', 'ababab', 'Concatena "ab" três vezes.'),
    choice('O que significa `void` na assinatura?', ['O método é privado', 'O método não retorna valor', 'O método é estático', 'O método está vazio'], 1, 'Sem valor de retorno.'),
    predict('Qual é a saída?', 'public class Main {\n    static void f(int[] v) {\n        v[0] = 99;\n    }\n    public static void main(String[] args) {\n        int[] a = {1, 2};\n        f(a);\n        System.out.println(a[0]);\n    }\n}', '99', 'O método recebe a referência do array e altera o conteúdo.'),
  ]),

  mod('poo', 'Classes e objetos', 'Atributos, construtores, encapsulamento e this.', [
    lesson('Classes, objetos e construtores', md`
      ~~~java
      class ContaBancaria {
          String titular;
          double saldo;

          ContaBancaria(String titular) {   // construtor
              this.titular = titular;
              this.saldo = 0;
          }

          void depositar(double valor) {
              saldo += valor;
          }
      }

      public class Main {
          public static void main(String[] args) {
              ContaBancaria c = new ContaBancaria("Rita");
              c.depositar(250);
              System.out.println(c.titular + ": " + c.saldo);
          }
      }
      ~~~

      - **Classe**: o molde (\`ContaBancaria\`).
      - **Objeto**: a instância criada com \`new\`.
      - **Construtor**: método com o mesmo nome da classe e **sem tipo de retorno**; roda no \`new\`.
      - \`this.titular\` = o atributo do objeto; \`titular\` sozinho = o parâmetro.
    `, [
      predict('Qual é a saída?', 'class Contador {\n    int valor = 0;\n    void inc() { valor++; }\n}\npublic class Main {\n    public static void main(String[] args) {\n        Contador a = new Contador();\n        Contador b = new Contador();\n        a.inc(); a.inc(); b.inc();\n        System.out.println(a.valor + " " + b.valor);\n    }\n}', '2 1', 'Cada objeto tem seus próprios atributos.'),
    ]),
    lesson('Encapsulamento: private, getters e setters', md`
      Deixar atributos públicos permite que qualquer código faça \`conta.saldo = -1000\`. **Encapsular** é esconder os dados e controlar o acesso por métodos:

      ~~~java
      class Conta {
          private double saldo;

          public double getSaldo() {
              return saldo;
          }

          public void sacar(double valor) {
              if (valor <= 0 || valor > saldo) {
                  throw new IllegalArgumentException("Saque inválido");
              }
              saldo -= valor;
          }
      }
      ~~~

      | Modificador | Quem acessa |
      |---|---|
      | \`private\` | só a própria classe |
      | (nenhum) | classes do mesmo pacote |
      | \`protected\` | pacote + subclasses |
      | \`public\` | qualquer um |

      ## static

      Um membro \`static\` pertence à **classe**, não a cada objeto. Ex.: \`Math.sqrt(9)\` — você não precisa de \`new Math()\`.

      ## record (Java 16+)

      Para classes que só carregam dados:

      ~~~java
      record Ponto(int x, int y) {}
      Ponto p = new Ponto(1, 2);
      System.out.println(p.x()); // 1
      ~~~
    `, [
      bug('Qual linha não compila?', md`
        class Pessoa {
            private int idade;
        }
        public class Main {
            public static void main(String[] args) {
                Pessoa p = new Pessoa();
                p.idade = 30;
            }
        }
      `, 7, '`idade` é `private`; só pode ser acessada dentro de `Pessoa`.'),
      choice('Qual a principal vantagem do encapsulamento?', ['Deixa o código mais curto', 'Protege o estado do objeto contra alterações inválidas', 'Faz o programa rodar mais rápido', 'Dispensa construtores'], 1, 'Os métodos validam as mudanças.'),
    ]),
  ], [
    fill('Complete para criar um objeto:', 'Carro c = ___ Carro();', 'new', '`new` chama o construtor.'),
    choice('Qual destas afirmações sobre construtores é verdadeira?', ['Têm tipo de retorno `void`', 'Têm o mesmo nome da classe e nenhum tipo de retorno', 'São opcionais e nunca executam', 'Só existem em classes abstratas'], 1, 'Construtor = nome da classe, sem retorno.'),
    predict('Qual é a saída?', 'class P {\n    String nome;\n    P(String nome) { this.nome = nome.toUpperCase(); }\n}\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println(new P("ana").nome);\n    }\n}', 'ANA', 'O construtor guarda o nome em maiúsculas.'),
    choice('Qual modificador restringe o acesso à própria classe?', ['`public`', '`protected`', '`private`', '`static`'], 2, '`private`.'),
    choice('O que é um membro `static`?', ['Pertence à classe, não aos objetos', 'Não pode ser alterado', 'É privado', 'É apagado ao final'], 0, 'Ex.: `Math.PI`.'),
    predict('Qual é a saída?', 'record Item(String nome, int qtd) {}\npublic class Main {\n    public static void main(String[] args) {\n        Item i = new Item("lápis", 3);\n        System.out.println(i.qtd() * 2);\n    }\n}', '6', 'Records geram métodos de acesso como `qtd()`.'),
  ]),

  mod('heranca', 'Herança e interfaces', 'extends, polimorfismo, classes abstratas e interfaces.', [
    lesson('Herança e polimorfismo', md`
      ~~~java
      class Funcionario {
          protected String nome;
          protected double salario;

          Funcionario(String nome, double salario) {
              this.nome = nome;
              this.salario = salario;
          }

          double bonus() { return salario * 0.05; }
      }

      class Gerente extends Funcionario {
          Gerente(String nome, double salario) {
              super(nome, salario);          // chama o construtor da mãe
          }

          @Override
          double bonus() { return salario * 0.15; }
      }
      ~~~

      - \`extends\`: herda atributos e métodos.
      - \`super(...)\`: chama o construtor da classe-mãe.
      - \`@Override\`: indica que você está **sobrescrevendo** um método (o compilador avisa se errar a assinatura).

      ## Polimorfismo

      ~~~java
      Funcionario[] equipe = { new Funcionario("Ana", 3000), new Gerente("Bia", 8000) };
      for (Funcionario f : equipe) {
          System.out.println(f.nome + ": " + f.bonus());
      }
      ~~~

      O Java decide **em tempo de execução** qual \`bonus()\` chamar, de acordo com o objeto real.
    `, [
      predict('Qual é a saída?', 'class A {\n    String quem() { return "A"; }\n}\nclass B extends A {\n    @Override\n    String quem() { return "B"; }\n}\npublic class Main {\n    public static void main(String[] args) {\n        A x = new B();\n        System.out.println(x.quem());\n    }\n}', 'B', 'O método chamado é o do objeto real (B), mesmo com variável do tipo A.'),
    ]),
    lesson('Classes abstratas e interfaces', md`
      ## Classe abstrata

      Não pode ser instanciada; serve de base e pode ter métodos sem corpo que as filhas **devem** implementar:

      ~~~java
      abstract class Forma {
          abstract double area();
          void descrever() { System.out.println("Área: " + area()); }
      }

      class Quadrado extends Forma {
          double lado;
          Quadrado(double lado) { this.lado = lado; }
          double area() { return lado * lado; }
      }
      ~~~

      ## Interface

      Um **contrato**: lista métodos que a classe promete ter. Uma classe pode implementar **várias** interfaces (mas herdar de uma só classe):

      ~~~java
      interface Pagavel {
          double valorAPagar();
      }

      class Boleto implements Pagavel {
          public double valorAPagar() { return 120.0; }
      }
      ~~~

      Interfaces são a base de bibliotecas e frameworks Java como o Spring: você programa contra o contrato, não contra a implementação.
    `, [
      choice('Quantas classes uma classe Java pode estender (`extends`)?', ['Nenhuma', 'Uma', 'Duas', 'Quantas quiser'], 1, 'Herança simples de classe; múltiplas interfaces são permitidas.'),
      fill('Complete para uma classe cumprir o contrato de uma interface:', 'class Pix ___ Pagavel { ... }', 'implements', 'Classes `implements` interfaces.'),
    ]),
  ], [
    choice('O que `super(...)` faz no construtor?', ['Cria um objeto novo', 'Chama o construtor da classe-mãe', 'Torna o método estático', 'Encerra o construtor'], 1, 'Inicializa a parte herdada.'),
    bug('Qual linha não compila?', md`
      abstract class Animal {
          abstract String som();
      }
      public class Main {
          public static void main(String[] args) {
              Animal a = new Animal();
          }
      }
    `, 6, 'Classes abstratas não podem ser instanciadas com `new`.'),
    choice('Para que serve `@Override`?', ['Tornar o método privado', 'Indicar e verificar que o método sobrescreve um da classe-mãe', 'Acelerar o método', 'Criar um novo método'], 1, 'O compilador avisa se nada for sobrescrito.'),
    predict('Qual é a saída?', 'interface Saudacao {\n    String ola();\n}\nclass Pt implements Saudacao {\n    public String ola() { return "Olá"; }\n}\nclass En implements Saudacao {\n    public String ola() { return "Hello"; }\n}\npublic class Main {\n    public static void main(String[] args) {\n        Saudacao[] s = { new Pt(), new En() };\n        for (Saudacao x : s) System.out.print(x.ola() + " ");\n    }\n}', 'Olá Hello', 'Polimorfismo através da interface.'),
    choice('Qual diferença entre classe abstrata e interface é correta?', ['Interfaces podem ser instanciadas', 'Uma classe pode implementar várias interfaces, mas estender só uma classe', 'Classes abstratas não têm métodos', 'Não há diferença'], 1, 'Esse é o motivo mais comum para usar interfaces.'),
  ]),

  mod('colecoes', 'Coleções e exceções', 'ArrayList, HashMap, generics e tratamento de erros.', [
    lesson('ArrayList e HashMap', md`
      Arrays têm tamanho fixo. As **coleções** crescem conforme você adiciona:

      ~~~java
      import java.util.*;

      List<String> nomes = new ArrayList<>();
      nomes.add("Ana");
      nomes.add("Bruno");
      nomes.add(0, "Zé");          // insere na posição 0
      nomes.remove("Bruno");
      System.out.println(nomes);           // [Zé, Ana]
      System.out.println(nomes.size());    // 2
      System.out.println(nomes.get(1));    // Ana
      System.out.println(nomes.contains("Ana")); // true
      ~~~

      \`<String>\` é um **generic**: diz o tipo dos elementos. Coleções guardam objetos, então para números use \`Integer\`, \`Double\`...

      ## HashMap: chave → valor

      ~~~java
      Map<String, Integer> estoque = new HashMap<>();
      estoque.put("caneta", 10);
      estoque.put("caderno", 4);
      estoque.put("caneta", 12);              // substitui
      System.out.println(estoque.get("caneta"));          // 12
      System.out.println(estoque.getOrDefault("régua", 0)); // 0
      for (var e : estoque.entrySet()) {
          System.out.println(e.getKey() + " = " + e.getValue());
      }
      ~~~

      Também existem \`HashSet\` (sem repetidos) e \`LinkedList\`, entre outras.
    `, [
      predict('Qual é a saída?', 'List<Integer> v = new ArrayList<>();\nv.add(5);\nv.add(7);\nv.add(0, 1);\nSystem.out.println(v);', '[1, 5, 7]', 'O 1 entra na posição 0.'),
      predict('Qual é a saída?', 'Map<String, Integer> m = new HashMap<>();\nm.put("a", 1);\nm.put("a", m.get("a") + 5);\nSystem.out.println(m.get("a"));', '6', 'O valor de "a" é atualizado para 6.'),
    ]),
    lesson('Exceções e streams', md`
      ## try / catch / finally

      ~~~java
      try {
          int n = Integer.parseInt("12a");
          System.out.println(n);
      } catch (NumberFormatException e) {
          System.out.println("Número inválido: " + e.getMessage());
      } finally {
          System.out.println("sempre executa");
      }
      ~~~

      Exceções comuns: \`NullPointerException\` (usar algo que é \`null\`), \`ArrayIndexOutOfBoundsException\`, \`NumberFormatException\`, \`ArithmeticException\` (divisão inteira por zero).

      ## Lançando

      ~~~java
      if (idade < 0) throw new IllegalArgumentException("idade negativa");
      ~~~

      ## Streams (Java 8+)

      Processam coleções no estilo map/filter:

      ~~~java
      List<Integer> nums = List.of(1, 2, 3, 4, 5, 6);
      List<Integer> paresAoQuadrado = nums.stream()
          .filter(n -> n % 2 == 0)
          .map(n -> n * n)
          .toList();
      System.out.println(paresAoQuadrado); // [4, 16, 36]
      ~~~

      🎉 Parabéns! Com isso você domina a base do Java. Próximos passos: **Spring Boot** para back-end ou **Android** com Kotlin/Java.
    `, [
      predict('Qual é a saída? (escreva as linhas separadas por espaço)', 'try {\n    int x = 10 / 0;\n    System.out.println("A");\n} catch (ArithmeticException e) {\n    System.out.println("B");\n} finally {\n    System.out.println("C");\n}', 'B C', 'A divisão inteira por zero lança exceção antes de imprimir "A".'),
    ]),
  ], [
    fill('Complete para criar uma lista de Strings:', 'List<String> l = new ___<>();', 'ArrayList', '`ArrayList` é a implementação mais comum.'),
    choice('Por que `List<int>` não compila?', ['Porque listas não aceitam números', 'Generics exigem objetos; use `Integer`', 'Porque falta `new`', 'Compila sim'], 1, 'Tipos primitivos não podem ser usados em generics.'),
    predict('Qual é a saída?', 'List<String> l = new ArrayList<>(List.of("x", "y", "z"));\nl.remove(1);\nSystem.out.println(l.size() + l.get(1));', '2z', 'Remove "y" (índice 1); sobra [x, z].'),
    choice('Qual exceção ocorre ao chamar um método numa variável `null`?', ['`ArithmeticException`', '`NullPointerException`', '`IOException`', '`ClassNotFoundException`'], 1, 'NPE é uma das exceções mais famosas do Java.'),
    predict('Qual é a saída?', 'List<Integer> n = List.of(3, 8, 1, 6);\nSystem.out.println(n.stream().filter(x -> x > 2).count());', '3', '3, 8 e 6 passam no filtro.'),
    bug('Qual linha lança exceção ao executar?', md`
      Map<String, Integer> m = new HashMap<>();
      m.put("a", 1);
      Integer v = m.get("b");
      int dobro = v * 2;
    `, 4, '`m.get("b")` devolve `null`; desembrulhar `null` para `int` lança NullPointerException.'),
  ]),
];
