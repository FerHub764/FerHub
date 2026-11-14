import { md, mod, lesson, choice, predict, fill, bug, defineTrack } from './_dsl.js';

export default defineTrack({
  id: 'swift',
  name: 'Swift',
  short: 'Sw',
  color: '#ffa24a',
  level: 'extra',
  lang: 'swift',
  category: 'Mobile',
  tagline: 'A linguagem da Apple para apps de iPhone, iPad e Mac.',
  description: 'let e var, tipos, optionals, controle de fluxo, funções, coleções, structs, classes, protocolos e SwiftUI.',
}, [
  mod('intro', 'Primeiros passos', 'print, let, var, tipos e interpolação.', [
    lesson('Olá, Swift', md`
      **Swift** é a linguagem criada pela Apple em 2014 para apps de **iPhone, iPad, Mac, Apple Watch e Apple TV**. É moderna, segura e rápida.

      ~~~swift
      print("Olá, mundo!")
      ~~~

      Para programar para iOS você precisa de um Mac com o **Xcode**. Para aprender a linguagem em qualquer sistema, há o compilador Swift para Linux e Windows (swift.org) e o app **Swift Playgrounds** no iPad.

      ## Interpolação

      ~~~swift
      let nome = "Ana"
      let idade = 30
      print("\(nome) tem \(idade) anos")
      print("Ano que vem: \(idade + 1)")
      ~~~

      Em Swift, valores entram no texto com \`\( )\`.
    `, [
      predict('Qual é a saída?', 'let x = 5\nprint("O dobro de \\(x) é \\(x * 2)")', 'O dobro de 5 é 10', 'Interpolação com `\\( )`.'),
    ]),
    lesson('let, var e tipos', md`
      ~~~swift
      let pi = 3.14159       // constante
      var pontos = 0         // variável
      pontos += 10

      let idade: Int = 25    // tipo explícito (opcional)
      ~~~

      > 💡 O próprio Xcode avisa quando uma \`var\` nunca muda e sugere trocar por \`let\`.

      | Tipo | Exemplo |
      |---|---|
      | \`Int\` | \`42\` |
      | \`Double\` | \`3.14\` |
      | \`Bool\` | \`true\` |
      | \`String\` | \`"oi"\` |
      | \`Character\` | \`"a"\` |

      Swift **nunca** converte tipos automaticamente:

      ~~~swift
      let a = 5
      let b = 2.5
      let c = Double(a) * b   // 12.5 — conversão explícita
      ~~~
    `, [
      bug('Qual linha não compila?', md`
        let quantidade = 3
        let preco = 2.5
        let total = quantidade * preco
        print(total)
      `, 3, 'Não se multiplica `Int` por `Double` diretamente. Use `Double(quantidade) * preco`.'),
    ]),
  ], [
    fill('Complete para declarar uma constante:', '___ maximo = 100', 'let', '`let` = constante; `var` = variável.'),
    predict('Qual é a saída?', 'let a = 7\nlet b = 2\nprint(a / b)', '3', 'Divisão entre Int descarta a parte decimal.'),
    choice('Qual ferramenta é usada para criar apps iOS?', ['Android Studio', 'Xcode', 'Visual Studio', 'Eclipse'], 1, 'Xcode, no macOS.'),
    bug('Qual linha não compila?', md`
      let nome = "Bia"
      var idade = 20
      idade = 21
      nome = "Ana"
    `, 4, '`nome` é `let` (constante).'),
    predict('Qual é a saída?', 'var n = 10\nn -= 3\nn *= 2\nprint(n)', '14', '(10 - 3) × 2.'),
  ]),

  mod('optionals', 'Optionals', 'Valores que podem não existir: ?, if let, guard e ??.', [
    lesson('O que é um Optional', md`
      Em Swift, uma variável comum **nunca** é nula. Quando um valor pode faltar, o tipo ganha \`?\`:

      ~~~swift
      var apelido: String? = nil     // pode ser nil
      apelido = "Ninha"

      let numero = Int("42")         // Int? — a conversão pode falhar
      let invalido = Int("abc")      // nil
      ~~~

      Para usar o valor, você precisa **desembrulhá-lo** (*unwrap*):

      ~~~swift
      if let n = numero {
          print("Número: \(n)")
      } else {
          print("Não é número")
      }

      let tamanho = apelido?.count ?? 0   // ?. encadeia; ?? dá um padrão
      ~~~
    `, [
      predict('Qual é a saída?', 'let v = Int("12a")\nprint(v ?? -1)', '-1', 'A conversão falha e devolve nil; `??` usa -1.'),
    ]),
    lesson('guard e !', md`
      \`guard\` verifica uma condição e **sai cedo** se ela falhar. Deixa o caminho principal sem aninhamento:

      ~~~swift
      func saudar(_ nome: String?) {
          guard let nome = nome, !nome.isEmpty else {
              print("Sem nome")
              return
          }
          print("Olá, \(nome)!")   // aqui nome já é String
      }
      ~~~

      O \`!\` força o desembrulho (*force unwrap*):

      ~~~swift
      let n = Int("42")!
      ~~~

      > ⚠️ Se o valor for \`nil\`, o app **trava**. Use \`!\` só quando tiver certeza absoluta.
    `, [
      choice('O que `guard let ... else { return }` faz?', ['Repete o código', 'Desembrulha o optional ou sai da função se for nil', 'Cria uma classe', 'Ignora erros'], 1, 'Padrão de "saída antecipada".'),
    ]),
  ], [
    fill('Complete para declarar uma String que pode ser nil:', 'var email: String___ = nil', '?', '`String?` é um optional.'),
    choice('O que acontece com `valor!` quando `valor` é nil?', ['Retorna 0', 'O app trava (erro em tempo de execução)', 'Retorna nil', 'Nada'], 1, 'Force unwrap em nil é fatal.'),
    predict('Qual é a saída?', 'let nome: String? = nil\nprint(nome?.count ?? 0)', '0', 'Optional chaining devolve nil; `??` devolve 0.'),
    choice('Qual construção desembrulha um optional dentro de um if?', ['`if var!`', '`if let`', '`if some`', '`if not nil`'], 1, '`if let x = opcional { ... }`.'),
    predict('Qual é a saída?', 'if let n = Int("7") {\n    print(n * 3)\n} else {\n    print("erro")\n}', '21', '"7" é convertido com sucesso.'),
  ]),

  mod('controle', 'Controle de fluxo e funções', 'if, switch, laços, funções e closures.', [
    lesson('switch e laços', md`
      ~~~swift
      let nota = 8
      switch nota {
      case 10:
          print("A+")
      case 8...9:
          print("A")
      case 5..<8:
          print("B")
      default:
          print("C")
      }
      ~~~

      O \`switch\` em Swift **não precisa de break**, aceita intervalos e precisa ser **exaustivo** (cobrir todos os casos, por isso o \`default\`).

      | Intervalo | Significa |
      |---|---|
      | \`1...5\` | 1 a 5 (inclui o 5) |
      | \`1..<5\` | 1 a 4 |

      ~~~swift
      for i in 1...3 { print(i) }
      for fruta in ["maçã", "uva"] { print(fruta) }
      var n = 1
      while n < 100 { n *= 2 }
      ~~~
    `, [
      predict('Qual é a saída?', 'var s = 0\nfor i in 1..<5 {\n    s += i\n}\nprint(s)', '10', '1 + 2 + 3 + 4 (o 5 não entra).'),
    ]),
    lesson('Funções e closures', md`
      ~~~swift
      func somar(_ a: Int, _ b: Int) -> Int {
          return a + b
      }
      somar(2, 3)

      func saudar(pessoa nome: String, saudacao: String = "Olá") -> String {
          "\(saudacao), \(nome)!"
      }
      saudar(pessoa: "Leo")            // Olá, Leo!
      ~~~

      - Swift usa **rótulos de argumento**: \`pessoa\` é o rótulo usado na chamada; \`nome\` é o nome interno.
      - \`_\` dispensa o rótulo.
      - Se o corpo é uma única expressão, o \`return\` é opcional.

      ## Closures

      ~~~swift
      let dobro = { (x: Int) -> Int in x * 2 }
      let nums = [3, 1, 2]
      let ordenados = nums.sorted { $0 < $1 }   // $0, $1 = parâmetros
      ~~~
    `, [
      predict('Qual é a saída?', 'func f(_ a: Int, vezes b: Int = 2) -> Int {\n    a * b\n}\nprint(f(5) + f(5, vezes: 3))', '25', '10 + 15.'),
    ]),
  ], [
    choice('O que `1..<5` representa?', ['1 a 5', '1 a 4', '0 a 5', 'Somente 1 e 5'], 1, 'Intervalo semiaberto.'),
    choice('O `switch` em Swift precisa de `break` em cada case?', ['Sim, sempre', 'Não, cada case para sozinho', 'Só no default', 'Só com números'], 1, 'Sem fall-through implícito.'),
    fill('Complete para chamar sem rótulo de argumento:', 'func quadrado(___ x: Int) -> Int { x * x }\nquadrado(4)', '_', 'O `_` dispensa o rótulo.'),
    predict('Qual é a saída?', 'let n = 15\nswitch n {\ncase 0..<10:\n    print("baixo")\ncase 10...20:\n    print("médio")\ndefault:\n    print("alto")\n}', 'médio', '15 está em `10...20`.'),
    predict('Qual é a saída?', 'print([4, 1, 3].sorted { $0 > $1 })', '[4, 3, 1]', 'Ordem decrescente.'),
  ]),

  mod('colecoes', 'Coleções', 'Arrays, dicionários, sets e map/filter/reduce.', [
    lesson('Arrays, dicionários e sets', md`
      ~~~swift
      var frutas = ["maçã", "uva"]
      frutas.append("pera")
      print(frutas.count)        // 3
      print(frutas[0])           // maçã
      frutas.remove(at: 1)

      var idades = ["Ana": 30, "Bia": 25]
      idades["Caio"] = 19
      if let idade = idades["Ana"] { print(idade) }   // dicionário devolve optional

      let unicos: Set = [1, 2, 2, 3]   // {1, 2, 3}
      ~~~

      Coleções declaradas com \`let\` são **imutáveis**: não aceitam \`append\`.
    `, [
      predict('Qual é a saída?', 'var v = [10, 20, 30]\nv.append(40)\nv.remove(at: 0)\nprint(v)', '[20, 30, 40]', 'Adiciona 40 e remove o índice 0.'),
    ]),
    lesson('map, filter e reduce', md`
      ~~~swift
      let nums = [5, 12, 8, 3, 20]

      print(nums.filter { $0 > 6 })        // [12, 8, 20]
      print(nums.map { $0 * 2 })           // [10, 24, 16, 6, 40]
      print(nums.reduce(0, +))             // 48
      print(nums.contains(8))              // true
      print(nums.first { $0 > 10 } ?? 0)   // 12

      let nomes = ["ana", "bia"]
      print(nomes.map { $0.uppercased() }.joined(separator: ", "))  // ANA, BIA
      ~~~
    `, [
      predict('Qual é a saída?', 'let v = [1, 2, 3, 4, 5, 6]\nprint(v.filter { $0 % 2 == 0 }.reduce(0, +))', '12', '2 + 4 + 6.'),
    ]),
  ], [
    fill('Complete para adicionar ao array:', 'nomes.___("Rui")', 'append', '`append` adiciona no fim.'),
    choice('O que `dicionario["chave"]` devolve em Swift?', ['O valor diretamente', 'Um optional (pode ser nil)', 'Sempre 0', 'Um erro se não existir'], 1, 'A chave pode não existir.'),
    predict('Qual é a saída?', 'print([1, 2, 3].map { $0 * $0 })', '[1, 4, 9]', 'Cada item ao quadrado.'),
    predict('Qual é a saída?', 'print(["a", "b", "c"].joined(separator: "-"))', 'a-b-c', 'Junta com hífen.'),
    bug('Qual linha não compila?', md`
      let cores = ["azul", "verde"]
      print(cores.count)
      cores.append("roxo")
    `, 3, 'O array foi declarado com `let`, então é imutável.'),
  ]),

  mod('tipos', 'Structs, classes e SwiftUI', 'Tipos de valor e de referência, protocolos e interfaces.', [
    lesson('struct, class e protocol', md`
      ~~~swift
      struct Ponto {
          var x: Int
          var y: Int
          func distanciaDaOrigem() -> Double {
              (Double(x * x + y * y)).squareRoot()
          }
      }

      var a = Ponto(x: 3, y: 4)
      var b = a        // struct: COPIA
      b.x = 100
      print(a.x)       // 3
      ~~~

      - **struct** é um tipo de **valor**: atribuir copia. É o padrão recomendado em Swift.
      - **class** é um tipo de **referência**: atribuir compartilha o mesmo objeto. Suporta herança.

      ~~~swift
      class Contador { var n = 0 }
      let c1 = Contador()
      let c2 = c1      // mesma instância
      c2.n = 5
      print(c1.n)      // 5
      ~~~

      ## Protocolos

      ~~~swift
      protocol Forma {
          func area() -> Double
      }
      struct Quadrado: Forma {
          let lado: Double
          func area() -> Double { lado * lado }
      }
      ~~~
    `, [
      predict('Qual é a saída?', 'struct S { var n: Int }\nvar a = S(n: 1)\nvar b = a\nb.n = 9\nprint(a.n, b.n)', '1 9', 'Structs são copiadas na atribuição.'),
    ]),
    lesson('Uma tela com SwiftUI', md`
      **SwiftUI** é o framework moderno de interfaces da Apple. Você descreve a tela, e ela se atualiza sozinha quando o estado muda:

      ~~~swift
      import SwiftUI

      struct ContadorView: View {
          @State private var cliques = 0

          var body: some View {
              VStack(spacing: 16) {
                  Text("Você clicou \(cliques) vezes")
                      .font(.title2)
                  Button("Clique aqui") {
                      cliques += 1
                  }
                  .buttonStyle(.borderedProminent)
              }
              .padding()
          }
      }
      ~~~

      - \`@State\` guarda um valor que, ao mudar, redesenha a view.
      - \`VStack\` empilha na vertical; \`HStack\`, na horizontal.
      - Modificadores (\`.font\`, \`.padding\`) são encadeados.

      🎉 Parabéns! Próximo passo: abrir o Xcode, criar um projeto "App" e rodar no simulador de iPhone.
    `, [
      choice('Para que serve `@State` em SwiftUI?', ['Criar uma classe', 'Guardar um estado que redesenha a view quando muda', 'Conectar à internet', 'Definir cores'], 1, 'UI declarativa: estado → tela.'),
    ]),
  ], [
    choice('Qual é a diferença principal entre struct e class em Swift?', ['Nenhuma', 'Struct é tipo de valor (copia); class é tipo de referência (compartilha)', 'Class é mais rápida sempre', 'Struct não tem métodos'], 1, 'E só classes têm herança.'),
    predict('Qual é a saída?', 'class C { var n = 0 }\nlet a = C()\nlet b = a\nb.n = 7\nprint(a.n)', '7', 'Classes são tipos de referência.'),
    fill('Complete para o tipo adotar o protocolo:', 'struct Circulo___ Forma { ... }', ':', '`struct Nome: Protocolo`.'),
    choice('Qual container empilha views na vertical em SwiftUI?', ['`HStack`', '`VStack`', '`ZStack`', '`List`'], 1, 'V = vertical.'),
    choice('Em Swift, qual é geralmente a escolha padrão para modelar dados?', ['class', 'struct', 'enum sempre', 'protocol'], 1, 'Structs são seguras e eficientes.'),
  ]),
]);
