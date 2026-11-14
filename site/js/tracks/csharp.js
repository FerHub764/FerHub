import { md, mod, lesson, choice, predict, fill, bug, defineTrack } from './_dsl.js';

export default defineTrack({
  id: 'csharp',
  name: 'C#',
  short: 'C#',
  color: '#b07cff',
  level: 'extra',
  lang: 'csharp',
  category: 'Back-end',
  tagline: 'A linguagem da Microsoft para web, desktop e jogos com Unity.',
  description: 'Sintaxe moderna, tipos, controle de fluxo, métodos, coleções, orientação a objetos, LINQ e async/await.',
}, [
  mod('intro', 'Primeiros passos', '.NET, top-level statements, variáveis e tipos.', [
    lesson('C# e .NET', md`
      **C#** (lê-se "C sharp") é uma linguagem moderna da Microsoft que roda na plataforma **.NET**. É usada em:

      - APIs e sites com **ASP.NET Core**
      - jogos com **Unity** (uma das engines mais populares do mundo)
      - aplicativos de desktop e mobile (.NET MAUI)

      Com o .NET instalado, você cria e roda um projeto assim:

      ~~~bash
      dotnet new console -o MeuApp
      cd MeuApp
      dotnet run
      ~~~

      No C# moderno, o programa mais simples tem **uma linha** (*top-level statements*):

      ~~~csharp
      Console.WriteLine("Olá, mundo!");
      ~~~

      - \`Console.WriteLine\` imprime e pula linha; \`Console.Write\` não pula.
      - Toda instrução termina com \`;\`.

      ## Interpolação

      ~~~csharp
      string nome = "Lia";
      int idade = 22;
      Console.WriteLine($"{nome} tem {idade} anos");
      ~~~

      O \`$\` antes das aspas permite colocar variáveis entre \`{}\`.
    `, [
      predict('Qual é a saída?', 'int x = 4;\nConsole.WriteLine($"O dobro de {x} é {x * 2}");', 'O dobro de 4 é 8', 'Expressões dentro de `{}` são avaliadas.'),
    ]),
    lesson('Tipos e var', md`
      | Tipo | Exemplo |
      |---|---|
      | \`int\` | \`42\` |
      | \`double\` | \`3.14\` |
      | \`decimal\` | \`19.90m\` (dinheiro!) |
      | \`bool\` | \`true\` |
      | \`char\` | \`'a'\` |
      | \`string\` | \`"texto"\` |

      ~~~csharp
      var cidade = "Manaus";   // o compilador deduz string
      const double PI = 3.14159;
      decimal preco = 9.99m;   // use decimal para valores monetários
      ~~~

      ## Conversões

      ~~~csharp
      int n = int.Parse("42");
      bool ok = int.TryParse("abc", out int valor); // false, sem lançar erro
      string s = 10.ToString();
      int i = (int)7.9;  // 7
      ~~~

      > 💡 \`TryParse\` é o jeito seguro de converter o que o usuário digitou: em vez de quebrar, ele devolve \`false\`.
    `, [
      choice('Qual tipo é o mais indicado para valores em dinheiro em C#?', ['`float`', '`double`', '`decimal`', '`int`'], 2, '`decimal` evita erros de arredondamento binário.'),
      predict('Qual é a saída?', 'int a = 7;\nint b = 2;\nConsole.WriteLine(a / b);', '3', 'Divisão entre inteiros descarta a parte decimal.'),
    ]),
  ], [
    fill('Complete para imprimir com quebra de linha:', 'Console.___("Oi");', 'WriteLine', '`Console.WriteLine`.'),
    predict('Qual é a saída?', 'string n = "C#";\nConsole.WriteLine($"{n.Length} caracteres");', '2 caracteres', '"C#" tem 2 caracteres.'),
    choice('O que `int.TryParse("x1", out int v)` retorna?', ['Lança exceção', '`false`', '`true`', '0'], 1, 'TryParse retorna se conseguiu converter.'),
    choice('Qual comando cria um novo projeto de console?', ['`dotnet new console`', '`csharp init`', '`npm init`', '`dotnet build web`'], 0, '`dotnet new console -o Nome`.'),
    bug('Qual linha não compila?', md`
      string nome = "Ana";
      int idade = "30";
      Console.WriteLine(nome);
    `, 2, 'Não é possível atribuir uma string a um int; use `int.Parse("30")` ou o número 30.'),
  ]),

  mod('controle', 'Controle de fluxo', 'if, switch expressions e laços.', [
    lesson('Decisões', md`
      ~~~csharp
      int temp = 31;
      if (temp > 30)
      {
          Console.WriteLine("Calor");
      }
      else if (temp > 18)
      {
          Console.WriteLine("Agradável");
      }
      else
      {
          Console.WriteLine("Frio");
      }
      ~~~

      Em C# é convenção colocar a chave de abertura em **linha própria**.

      ## switch expression

      ~~~csharp
      int dia = 7;
      string tipo = dia switch
      {
          1 or 7 => "Fim de semana",
          >= 2 and <= 6 => "Dia útil",
          _ => "Inválido"
      };
      ~~~

      O \`_\` é o caso "qualquer outro valor". Strings se comparam com \`==\` normalmente em C#.
    `, [
      predict('Qual é a saída?', 'int n = 15;\nstring r = n switch\n{\n    < 10 => "pequeno",\n    < 20 => "médio",\n    _ => "grande"\n};\nConsole.WriteLine(r);', 'médio', '15 não é < 10, mas é < 20.'),
    ]),
    lesson('Laços', md`
      ~~~csharp
      for (int i = 1; i <= 3; i++)
      {
          Console.WriteLine($"Volta {i}");
      }

      int n = 1;
      while (n < 100) n *= 2;     // 128

      string[] frutas = { "maçã", "uva" };
      foreach (var f in frutas)
      {
          Console.WriteLine(f);
      }
      ~~~

      \`foreach\` é o jeito mais legível de percorrer arrays e coleções. \`break\` e \`continue\` funcionam como em outras linguagens.
    `, [
      predict('Qual é a saída?', 'int s = 0;\nforeach (var x in new[] { 2, 4, 6 })\n{\n    s += x;\n}\nConsole.WriteLine(s);', '12', '2 + 4 + 6.'),
    ]),
  ], [
    choice('O que `_` significa numa switch expression?', ['Erro', 'Qualquer outro valor (caso padrão)', 'Valor nulo', 'Variável temporária'], 1, 'Equivale ao `default`.'),
    fill('Complete para percorrer a lista:', '___ (var item in lista)\n{\n    Console.WriteLine(item);\n}', 'foreach', '`foreach (var x in colecao)`.'),
    predict('Qual é a saída?', 'for (int i = 0; i < 5; i++)\n{\n    if (i == 3) break;\n    Console.Write(i);\n}', '012', 'Para quando i chega a 3.'),
    predict('Qual é a saída?', 'string s = "abc";\nConsole.WriteLine(s == "abc" ? "igual" : "diferente");', 'igual', 'Em C#, `==` compara o conteúdo de strings.'),
    bug('O laço deveria parar. Qual linha está errada?', md`
      int i = 0;
      while (i < 10)
      {
          Console.WriteLine(i);
      }
    `, 4, 'Nada altera `i` dentro do laço. Faltou `i++` (o laço é infinito).'),
  ]),

  mod('colecoes', 'Métodos e coleções', 'Métodos, List, Dictionary e tratamento de exceções.', [
    lesson('Métodos', md`
      ~~~csharp
      static int Somar(int a, int b) => a + b;

      static void Saudar(string nome = "visitante")
      {
          Console.WriteLine($"Olá, {nome}!");
      }

      Console.WriteLine(Somar(2, 3)); // 5
      Saudar();                        // Olá, visitante!
      Saudar(nome: "Rui");             // argumento nomeado
      ~~~

      - Em C#, métodos usam **PascalCase**: \`CalcularTotal\`.
      - \`=>\` define um método de uma expressão só (*expression-bodied*).
      - Parâmetros podem ter valor padrão.

      ## ref e out

      \`out\` permite devolver mais de um valor; \`ref\` passa a variável por referência. Hoje é mais comum devolver **tuplas**:

      ~~~csharp
      static (int min, int max) Extremos(int[] v) => (v.Min(), v.Max());
      var (mi, ma) = Extremos(new[] { 4, 9, 1 });
      ~~~
    `, [
      predict('Qual é a saída?', 'static int Dobro(int x) => x * 2;\nConsole.WriteLine(Dobro(Dobro(5)));', '20', 'Dobro(5) = 10; Dobro(10) = 20.'),
    ]),
    lesson('List, Dictionary e exceções', md`
      ~~~csharp
      var nomes = new List<string> { "Ana", "Bia" };
      nomes.Add("Caio");
      nomes.Remove("Ana");
      Console.WriteLine(nomes.Count);   // 2
      Console.WriteLine(nomes[0]);      // Bia

      var estoque = new Dictionary<string, int>
      {
          ["caneta"] = 10,
          ["lápis"] = 3
      };
      estoque["caneta"] -= 1;
      if (estoque.TryGetValue("borracha", out int qtd)) Console.WriteLine(qtd);
      ~~~

      ## try/catch

      ~~~csharp
      try
      {
          int x = int.Parse("12a");
      }
      catch (FormatException ex)
      {
          Console.WriteLine($"Formato inválido: {ex.Message}");
      }
      finally
      {
          Console.WriteLine("fim");
      }
      ~~~
    `, [
      predict('Qual é a saída?', 'var l = new List<int> { 1, 2, 3 };\nl.Add(4);\nl.RemoveAt(0);\nConsole.WriteLine(l.Count + l[0]);', '5', 'Fica [2, 3, 4]: Count = 3 e l[0] = 2.'),
    ]),
  ], [
    choice('Qual convenção de nome se usa para métodos em C#?', ['camelCase', 'snake_case', 'PascalCase', 'kebab-case'], 2, 'Ex.: `CalcularTotal`.'),
    fill('Complete para adicionar à lista:', 'nomes.___("Rita");', 'Add', '`List<T>.Add`.'),
    predict('Qual é a saída?', 'var d = new Dictionary<string, int>();\nd["a"] = 1;\nd["a"] = 5;\nConsole.WriteLine(d.Count + d["a"]);', '6', 'Uma única chave ("a") com valor 5.'),
    choice('Qual exceção `int.Parse("abc")` lança?', ['`NullReferenceException`', '`FormatException`', '`IndexOutOfRangeException`', '`DivideByZeroException`'], 1, 'O texto não está no formato numérico.'),
    choice('O que o bloco `finally` faz?', ['Só roda se der erro', 'Sempre roda', 'Nunca roda', 'Relança o erro'], 1, 'Útil para liberar recursos.'),
  ]),

  mod('poo', 'Orientação a objetos', 'Classes, propriedades, herança e interfaces.', [
    lesson('Classes e propriedades', md`
      ~~~csharp
      public class Produto
      {
          public string Nome { get; set; }
          public decimal Preco { get; private set; }

          public Produto(string nome, decimal preco)
          {
              Nome = nome;
              Preco = preco;
          }

          public void AplicarDesconto(decimal pct) => Preco -= Preco * pct / 100;
      }

      var p = new Produto("Fone", 200m);
      p.AplicarDesconto(10);
      Console.WriteLine($"{p.Nome}: {p.Preco}");
      ~~~

      **Propriedades** (\`{ get; set; }\`) são o jeito C# de encapsular: parecem campos, mas você controla quem lê e quem escreve. \`private set\` permite ler de fora, mas alterar só por dentro da classe.

      ## record

      ~~~csharp
      public record Ponto(int X, int Y);
      var a = new Ponto(1, 2);
      var b = a with { Y = 5 };   // cópia com alteração
      Console.WriteLine(a == new Ponto(1, 2)); // True — compara valores
      ~~~
    `, [
      bug('Qual linha não compila?', md`
        var c = new Conta();
        c.Saldo = 100;

        public class Conta
        {
            public decimal Saldo { get; private set; }
        }
      `, 2, '`Saldo` tem `private set`: não pode ser alterado de fora da classe.'),
    ]),
    lesson('Herança e interfaces', md`
      ~~~csharp
      public interface IForma
      {
          double Area();
      }

      public abstract class Animal
      {
          public string Nome { get; }
          protected Animal(string nome) => Nome = nome;
          public abstract string Som();
          public virtual string Apresentar() => $"{Nome} faz {Som()}";
      }

      public class Gato : Animal
      {
          public Gato(string nome) : base(nome) { }
          public override string Som() => "miau";
      }

      Animal a = new Gato("Mimi");
      Console.WriteLine(a.Apresentar()); // Mimi faz miau
      ~~~

      - \`: Animal\` herda; \`: base(nome)\` chama o construtor da mãe.
      - Métodos só podem ser sobrescritos se forem \`virtual\` ou \`abstract\`; a filha usa \`override\`.
      - Por convenção, nomes de interfaces começam com **I**: \`IForma\`, \`IRepositorio\`.
    `, [
      fill('Complete para sobrescrever um método virtual:', 'public ___ string Som() => "au";', 'override', 'Em C#, a sobrescrita é explícita.'),
    ]),
  ], [
    choice('O que `{ get; private set; }` permite?', ['Ninguém lê nem escreve', 'Ler de fora, mas só alterar dentro da classe', 'Só escrever', 'Nada, é inválido'], 1, 'Encapsulamento com propriedades.'),
    choice('Para que um método possa ser sobrescrito, ele deve ser:', ['`static`', '`virtual` ou `abstract`', '`private`', '`sealed`'], 1, 'Por padrão, métodos em C# não são sobrescrevíveis.'),
    choice('Qual é a convenção de nome para interfaces em C#?', ['Terminar com Interface', 'Começar com I', 'Tudo minúsculo', 'Começar com _'], 1, 'Ex.: `IDisposable`.'),
    choice('O que `a with { Y = 5 }` faz com um record?', ['Altera `a`', 'Cria uma cópia de `a` com Y = 5', 'Compara', 'Lança erro'], 1, 'Records são imutáveis por padrão.'),
    fill('Complete para chamar o construtor da classe-mãe:', 'public Cachorro(string n) : ___(n) { }', 'base', '`base(...)`.'),
  ]),

  mod('linq', 'LINQ e async', 'Consultas em coleções e programação assíncrona.', [
    lesson('LINQ', md`
      **LINQ** permite consultar coleções com métodos encadeados:

      ~~~csharp
      using System.Linq;

      var numeros = new List<int> { 5, 12, 8, 3, 20 };

      var grandes = numeros
          .Where(n => n > 6)       // filtra
          .OrderBy(n => n)         // ordena
          .Select(n => n * 10)     // transforma
          .ToList();
      // [80, 120, 200]

      Console.WriteLine(numeros.Sum());      // 48
      Console.WriteLine(numeros.Max());      // 20
      Console.WriteLine(numeros.Count(n => n % 2 == 0)); // 3
      Console.WriteLine(numeros.Any(n => n > 15));       // True
      var primeiro = numeros.FirstOrDefault(n => n > 100); // 0 (padrão)
      ~~~

      \`n => n > 6\` é uma **expressão lambda**: uma função curta passada como argumento.
    `, [
      predict('Qual é a saída?', 'var v = new List<int> { 1, 2, 3, 4, 5, 6 };\nConsole.WriteLine(v.Where(x => x % 2 == 0).Sum());', '12', '2 + 4 + 6.'),
    ]),
    lesson('async e await', md`
      Operações demoradas (rede, disco, banco de dados) não devem travar o programa:

      ~~~csharp
      using var http = new HttpClient();

      async Task<int> ContarCaracteresAsync(string url)
      {
          string html = await http.GetStringAsync(url);
          return html.Length;
      }

      int total = await ContarCaracteresAsync("https://example.com");
      Console.WriteLine(total);
      ~~~

      - Métodos assíncronos retornam \`Task\` ou \`Task<T>\` e, por convenção, terminam com **Async**.
      - \`await\` espera o resultado **sem bloquear** a thread: o servidor continua atendendo outras requisições enquanto isso.

      🎉 Parabéns! Próximos passos: criar uma API com **ASP.NET Core** ou um jogo com **Unity**.
    `, [
      choice('O que um método `async` normalmente retorna?', ['`void` sempre', '`Task` ou `Task<T>`', '`Thread`', '`Promise`'], 1, '`Task<T>` representa o resultado futuro.'),
    ]),
  ], [
    fill('Complete para filtrar com LINQ:', 'var adultos = pessoas.___(p => p.Idade >= 18);', 'Where', '`Where` filtra.'),
    predict('Qual é a saída?', 'var nomes = new[] { "ana", "bia", "caio" };\nConsole.WriteLine(nomes.Select(n => n.Length).Max());', '4', 'Tamanhos 3, 3 e 4.'),
    choice('O que `Any(x => x > 10)` retorna?', ['Uma lista', 'Um número', '`True` se algum item satisfizer a condição', 'O primeiro item'], 2, '`Any` responde sim ou não.'),
    choice('Qual palavra espera uma Task sem bloquear a thread?', ['`wait`', '`await`', '`yield`', '`sleep`'], 1, '`await`.'),
    predict('Qual é a saída?', 'var v = new List<int> { 3, 1, 2 };\nConsole.WriteLine(string.Join(",", v.OrderBy(x => x)));', '1,2,3', '`OrderBy` ordena; `Join` junta com vírgula.'),
  ]),
]);
