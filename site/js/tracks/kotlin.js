import { md, mod, lesson, choice, predict, fill, bug, defineTrack } from './_dsl.js';

export default defineTrack({
  id: 'kotlin',
  name: 'Kotlin',
  short: 'Kt',
  color: '#d06cff',
  level: 'extra',
  lang: 'kotlin',
  category: 'Mobile',
  tagline: 'A linguagem oficial do Android. Moderna, concisa e segura contra nulos.',
  description: 'val e var, tipos, null safety, funções, coleções, classes, data classes e uma introdução ao Android.',
}, [
  mod('intro', 'Primeiros passos', 'main, println, val, var e tipos.', [
    lesson('Olá, Kotlin', md`
      **Kotlin** foi criada pela JetBrains e é a linguagem **recomendada pelo Google para Android**. Ela roda na JVM (convive com código Java) e também compila para outras plataformas.

      ~~~kotlin
      fun main() {
          println("Olá, mundo!")
      }
      ~~~

      Sem ponto e vírgula, sem classe obrigatória. Para experimentar sem instalar nada, use o **Kotlin Playground** (play.kotlinlang.org); para Android, o **Android Studio**.

      ## String templates

      ~~~kotlin
      val nome = "Ana"
      val idade = 30
      println("$nome tem $idade anos")
      println("Ano que vem: \${idade + 1}")
      ~~~

      \`$variavel\` insere o valor; \`\${expressão}\` insere o resultado de uma expressão.
    `, [
      predict('Qual é a saída?', 'val x = 3\nprintln("O triplo de $x é ${x * 3}")', 'O triplo de 3 é 9', 'String templates com `$` e `${}`.'),
    ]),
    lesson('val, var e tipos', md`
      ~~~kotlin
      val pi = 3.14        // val: não pode ser reatribuído (como final/const)
      var pontos = 0       // var: pode mudar
      pontos += 10

      val idade: Int = 25  // tipo explícito (opcional, o Kotlin deduz)
      ~~~

      > 💡 Prefira \`val\`. Use \`var\` só quando o valor realmente precisar mudar.

      | Tipo | Exemplo |
      |---|---|
      | \`Int\`, \`Long\` | \`42\`, \`42L\` |
      | \`Double\` | \`3.14\` |
      | \`Boolean\` | \`true\` |
      | \`Char\` | \`'a'\` |
      | \`String\` | \`"oi"\` |

      Conversões são explícitas: \`"42".toInt()\`, \`7.toDouble()\`, \`3.9.toInt()\` (dá 3).
    `, [
      bug('Qual linha não compila?', md`
        fun main() {
            val limite = 10
            var atual = 2
            atual = 5
            limite = 20
        }
      `, 5, '`limite` é `val` (não pode ser reatribuído).'),
    ]),
  ], [
    fill('Complete para declarar uma variável que pode mudar:', '___ contador = 0\ncontador++', 'var', '`var` é mutável; `val` não.'),
    predict('Qual é a saída?', 'val a = 7\nval b = 2\nprintln(a / b)', '3', 'Divisão entre Int descarta a parte decimal.'),
    choice('Qual empresa criou o Kotlin?', ['Google', 'JetBrains', 'Apple', 'Oracle'], 1, 'O Google o adotou como linguagem oficial do Android.'),
    predict('Qual é a saída?', 'val s = "Kotlin"\nprintln("${s.length} letras")', '6 letras', '"Kotlin" tem 6 caracteres.'),
    choice('Por que preferir `val` a `var`?', ['É mais rápido de digitar', 'Evita alterações acidentais e deixa o código mais previsível', 'É obrigatório', 'Ocupa menos memória sempre'], 1, 'Imutabilidade reduz bugs.'),
  ]),

  mod('controle', 'Controle e funções', 'if e when como expressões, laços e funções.', [
    lesson('if, when e laços', md`
      \`if\` e \`when\` são **expressões** (devolvem valor):

      ~~~kotlin
      val idade = 17
      val tipo = if (idade >= 18) "adulto" else "menor"

      val nota = 8
      val conceito = when (nota) {
          10 -> "A+"
          in 8..9 -> "A"
          in 5..7 -> "B"
          else -> "C"
      }
      ~~~

      \`when\` substitui o \`switch\` com muito mais poder: aceita intervalos (\`in 1..5\`), tipos (\`is String\`) e condições.

      ## Laços

      ~~~kotlin
      for (i in 1..3) println(i)            // 1, 2, 3
      for (i in 0 until 3) println(i)       // 0, 1, 2
      for (i in 10 downTo 0 step 5) println(i) // 10, 5, 0
      for (fruta in listOf("maçã", "uva")) println(fruta)

      var n = 1
      while (n < 100) n *= 2
      ~~~
    `, [
      predict('Qual é a saída?', 'val n = 6\nval r = when (n) {\n    in 1..5 -> "baixo"\n    in 6..10 -> "médio"\n    else -> "alto"\n}\nprintln(r)', 'médio', '6 está em `6..10`.'),
      predict('Qual é a saída?', 'var s = 0\nfor (i in 1..4) s += i\nprintln(s)', '10', '`1..4` inclui o 4.'),
    ]),
    lesson('Funções', md`
      ~~~kotlin
      fun somar(a: Int, b: Int): Int {
          return a + b
      }

      fun dobro(x: Int) = x * 2     // função de expressão única

      fun saudar(nome: String = "visitante") = "Olá, $nome!"

      println(saudar())              // Olá, visitante!
      println(saudar(nome = "Leo"))  // argumento nomeado
      ~~~

      ## Lambdas

      ~~~kotlin
      val quadrado = { x: Int -> x * x }
      println(quadrado(5))           // 25

      listOf(1, 2, 3).forEach { println(it) }
      ~~~

      Quando a lambda tem um único parâmetro, você pode chamá-lo de \`it\`.
    `, [
      predict('Qual é a saída?', 'fun f(a: Int, b: Int = 10) = a * b\nprintln(f(2) + f(2, 3))', '26', '20 + 6.'),
    ]),
  ], [
    choice('O que `when` substitui em Kotlin?', ['O `for`', 'O `switch` de outras linguagens', 'O `try`', 'O `class`'], 1, 'E vai além, com intervalos e tipos.'),
    predict('Qual é a saída?', 'for (i in 0 until 3) print(i)', '012', '`until` não inclui o 3.'),
    fill('Complete o parâmetro implícito da lambda:', 'listOf(1, 2, 3).map { ___ * 2 }', 'it', '`it` é o parâmetro único.'),
    predict('Qual é a saída?', 'val x = 4\nprintln(if (x % 2 == 0) "par" else "ímpar")', 'par', '`if` como expressão.'),
    choice('O que `10 downTo 0 step 5` gera?', ['0, 5, 10', '10, 5, 0', '10, 9, ..., 0', '5'], 1, 'Decrescente, de 5 em 5.'),
  ]),

  mod('null-safety', 'Segurança contra nulos', 'Tipos anuláveis, ?., ?: e !!.', [
    lesson('Tipos anuláveis', md`
      O erro mais famoso do Java é o \`NullPointerException\`. Kotlin resolve isso no **sistema de tipos**: por padrão, nada pode ser nulo.

      ~~~kotlin
      var nome: String = "Ana"
      nome = null          // ERRO de compilação

      var apelido: String? = "Aninha"   // o ? permite null
      apelido = null       // ok
      ~~~

      Para usar um valor anulável, o compilador **obriga** você a tratar o caso nulo:

      ~~~kotlin
      println(apelido.length)    // ERRO: pode ser null
      println(apelido?.length)   // safe call: null se apelido for null
      println(apelido?.length ?: 0)  // Elvis: valor padrão
      ~~~
    `, [
      predict('Qual é a saída?', 'val s: String? = null\nprintln(s?.length ?: -1)', '-1', 'A safe call devolve null e o Elvis usa -1.'),
    ]),
    lesson('Smart cast, let e !!', md`
      Depois de checar que não é nulo, o Kotlin "entende" isso sozinho (*smart cast*):

      ~~~kotlin
      fun tamanho(s: String?): Int {
          if (s == null) return 0
          return s.length      // aqui s já é String, não String?
      }
      ~~~

      \`let\` executa um bloco só se o valor não for nulo:

      ~~~kotlin
      email?.let { enviar(it) }
      ~~~

      \`!!\` diz ao compilador "confie em mim, não é nulo". Se for, lança \`NullPointerException\`:

      ~~~kotlin
      val n = apelido!!.length   // perigoso
      ~~~

      > ⚠️ Cada \`!!\` no código é um possível crash. Use com muita moderação.
    `, [
      choice('O que o operador `?:` (Elvis) faz?', ['Compara valores', 'Fornece um valor padrão quando a expressão à esquerda é null', 'Lança exceção', 'Converte tipos'], 1, '`a ?: b` = a, ou b se a for null.'),
    ]),
  ], [
    fill('Complete para permitir que a variável seja nula:', 'var cidade: String___ = null', '?', '`String?` é anulável.'),
    choice('O que `texto?.length` retorna se `texto` for null?', ['0', 'null', 'Lança exceção', '-1'], 1, 'A safe call não chama nada e devolve null.'),
    choice('Qual operador pode lançar NullPointerException em Kotlin?', ['`?.`', '`?:`', '`!!`', '`as?`'], 2, '`!!` força o valor a ser não nulo.'),
    bug('Qual linha não compila?', md`
      fun main() {
          val nome: String? = lerNome()
          println(nome?.uppercase())
          println(nome.length)
      }
    `, 4, '`nome` é anulável; é preciso `nome?.length` ou tratar o null antes.'),
    predict('Qual é a saída?', 'val lista: List<String>? = null\nprintln(lista?.size ?: 0)', '0', 'Lista nula → Elvis devolve 0.'),
  ]),

  mod('colecoes', 'Coleções', 'listOf, mutableListOf, mapOf e operações funcionais.', [
    lesson('Listas, mapas e conjuntos', md`
      Kotlin separa coleções **somente leitura** e **mutáveis**:

      ~~~kotlin
      val frutas = listOf("maçã", "uva")            // não pode adicionar
      val compras = mutableListOf("arroz")
      compras.add("feijão")
      compras.remove("arroz")

      val idades = mapOf("Ana" to 30, "Bia" to 25)
      println(idades["Ana"])                        // 30

      val estoque = mutableMapOf<String, Int>()
      estoque["caneta"] = 10

      val unicos = setOf(1, 2, 2, 3)                // [1, 2, 3]
      ~~~

      \`"Ana" to 30\` cria um par (\`Pair\`).
    `, [
      predict('Qual é a saída?', 'val l = mutableListOf(1, 2, 3)\nl.add(4)\nl.removeAt(0)\nprintln(l)', '[2, 3, 4]', 'Adiciona 4 e remove o índice 0.'),
    ]),
    lesson('Operações funcionais', md`
      ~~~kotlin
      val nums = listOf(5, 12, 8, 3, 20)

      println(nums.filter { it > 6 })          // [12, 8, 20]
      println(nums.map { it * 2 })             // [10, 24, 16, 6, 40]
      println(nums.sum())                      // 48
      println(nums.sorted())                   // [3, 5, 8, 12, 20]
      println(nums.first { it > 10 })          // 12
      println(nums.any { it > 15 })            // true
      println(nums.count { it % 2 == 0 })      // 3

      val nomes = listOf("ana", "bruno", "carla")
      println(nomes.joinToString(", ") { it.uppercase() })  // ANA, BRUNO, CARLA
      ~~~

      Essas operações devolvem **novas** coleções, sem alterar a original.
    `, [
      predict('Qual é a saída?', 'val v = listOf(1, 2, 3, 4, 5, 6)\nprintln(v.filter { it % 2 == 0 }.map { it * it })', '[4, 16, 36]', 'Pares ao quadrado.'),
    ]),
  ], [
    choice('Qual função cria uma lista que pode receber novos itens?', ['`listOf`', '`mutableListOf`', '`arrayOf`', '`setOf`'], 1, '`listOf` é somente leitura.'),
    predict('Qual é a saída?', 'println(listOf(3, 1, 2).sorted())', '[1, 2, 3]', '`sorted()` devolve uma nova lista ordenada.'),
    fill('Complete para criar um par chave-valor no mapa:', 'val m = mapOf("a" ___ 1)', 'to', '`"a" to 1`.'),
    predict('Qual é a saída?', 'println(setOf("a", "b", "a").size)', '2', 'Conjuntos não têm repetidos.'),
    predict('Qual é a saída?', 'println(listOf("x", "y", "z").joinToString("-"))', 'x-y-z', 'Junta com o separador.'),
  ]),

  mod('classes', 'Classes e Android', 'Classes, data classes, herança e o primeiro app.', [
    lesson('Classes e data classes', md`
      ~~~kotlin
      class Conta(val titular: String, saldoInicial: Double = 0.0) {
          var saldo = saldoInicial
              private set           // só a classe altera

          fun depositar(valor: Double) {
              require(valor > 0) { "valor inválido" }
              saldo += valor
          }
      }

      val c = Conta("Rita")
      c.depositar(100.0)
      println(c.saldo)   // 100.0
      ~~~

      O **construtor primário** fica na própria declaração da classe. \`val\`/\`var\` nos parâmetros já criam as propriedades.

      ## data class

      ~~~kotlin
      data class Usuario(val nome: String, val idade: Int)

      val u1 = Usuario("Ana", 30)
      val u2 = u1.copy(idade = 31)
      println(u1)              // Usuario(nome=Ana, idade=30)
      println(u1 == Usuario("Ana", 30))  // true
      ~~~

      Data classes geram \`toString\`, \`equals\`, \`hashCode\` e \`copy\` automaticamente.

      ## Herança

      Classes são **finais** por padrão. Para permitir herança, use \`open\`:

      ~~~kotlin
      open class Animal(val nome: String) {
          open fun som() = "..."
      }
      class Gato(nome: String) : Animal(nome) {
          override fun som() = "miau"
      }
      ~~~
    `, [
      predict('Qual é a saída?', 'data class P(val x: Int, val y: Int)\nval a = P(1, 2)\nval b = a.copy(y = 5)\nprintln(b)', 'P(x=1, y=5)', '`copy` cria uma cópia alterando só `y`; data classes têm `toString` pronto.'),
    ]),
    lesson('Seu primeiro app Android', md`
      Apps Android modernos usam **Jetpack Compose**: a interface é escrita em Kotlin, com funções marcadas com \`@Composable\`:

      ~~~kotlin
      @Composable
      fun Contador() {
          var cliques by remember { mutableStateOf(0) }

          Column(modifier = Modifier.padding(16.dp)) {
              Text("Você clicou $cliques vezes")
              Button(onClick = { cliques++ }) {
                  Text("Clique aqui")
              }
          }
      }
      ~~~

      - \`mutableStateOf\` guarda um estado; quando ele muda, a tela é redesenhada automaticamente.
      - \`Column\` empilha elementos na vertical; \`Row\`, na horizontal.

      Para começar: instale o **Android Studio**, crie um projeto "Empty Activity" e rode no emulador ou no seu celular.

      🎉 Parabéns! Você concluiu a base de Kotlin.
    `, [
      choice('O que acontece quando um `mutableStateOf` muda no Compose?', ['Nada', 'A interface é redesenhada automaticamente', 'O app fecha', 'É salvo no banco'], 1, 'É a ideia central da UI declarativa.'),
    ]),
  ], [
    choice('Por padrão, classes em Kotlin são:', ['Abertas para herança', 'Finais (não podem ser herdadas)', 'Abstratas', 'Estáticas'], 1, 'Use `open` para permitir herança.'),
    choice('O que uma `data class` gera automaticamente?', ['Telas', '`toString`, `equals`, `hashCode` e `copy`', 'Um banco de dados', 'Testes'], 1, 'Ideal para modelos de dados.'),
    fill('Complete para permitir sobrescrever o método:', '___ fun som() = "..."', 'open', 'Métodos também são finais por padrão.'),
    predict('Qual é a saída?', 'data class U(val n: String)\nprintln(U("a") == U("a"))', 'true', 'Data classes comparam pelo conteúdo.'),
    choice('Qual é a forma moderna de criar interfaces Android com Kotlin?', ['XML apenas', 'Jetpack Compose', 'HTML', 'Swing'], 1, 'Funções `@Composable`.'),
  ]),
]);
