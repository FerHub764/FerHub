import { md, mod, lesson, choice, predict, fill, bug, defineTrack } from './_dsl.js';

export default defineTrack({
  id: 'go',
  name: 'Go',
  short: 'Go',
  color: '#29c4e8',
  level: 'extra',
  lang: 'go',
  category: 'Back-end',
  tagline: 'Simples, rápida e feita para servidores e nuvem.',
  description: 'Sintaxe enxuta, tipos, funções com múltiplos retornos, slices, maps, structs, interfaces, erros e goroutines.',
}, [
  mod('intro', 'Primeiros passos', 'Pacotes, fmt, variáveis e tipos.', [
    lesson('Olá, Go', md`
      **Go** (ou Golang) foi criada no Google para ser **simples**, **rápida para compilar** e ótima para **servidores**. Docker, Kubernetes e Terraform são escritos em Go.

      ~~~go
      package main

      import "fmt"

      func main() {
          fmt.Println("Olá, mundo!")
      }
      ~~~

      - Todo arquivo pertence a um **pacote**; o executável começa no pacote \`main\`, função \`main\`.
      - \`fmt.Println\` imprime e pula linha (valores separados por espaço).
      - Não há ponto e vírgula no fim das linhas.

      ~~~bash
      go run main.go      # compila e roda
      go build            # gera o executável
      ~~~

      > 💡 Go é rígido com organização: **importar um pacote e não usar é erro de compilação**, assim como declarar uma variável local e não usar.
    `, [
      predict('Qual é a saída?', 'fmt.Println("Go", 1, true)', 'Go 1 true', '`Println` separa os valores com espaço.'),
    ]),
    lesson('Variáveis e tipos', md`
      ~~~go
      var nome string = "Ana"
      var idade = 30          // tipo deduzido (int)
      cidade := "Recife"      // declaração curta (só dentro de funções)
      const PI = 3.14159

      var contador int        // valor zero: 0
      var texto string        // valor zero: ""
      var ativo bool          // valor zero: false
      ~~~

      Em Go, toda variável sem valor recebe o **valor zero** do tipo — não existe lixo de memória.

      | Tipo | Exemplo |
      |---|---|
      | \`int\`, \`int64\` | \`42\` |
      | \`float64\` | \`3.14\` |
      | \`string\` | \`"oi"\` |
      | \`bool\` | \`true\` |

      Conversões são sempre **explícitas**: \`float64(n)\`, \`int(x)\`. Para texto ↔ número use o pacote \`strconv\`.

      ## Printf

      ~~~go
      fmt.Printf("%s tem %d anos e %.1f m\n", "Ana", 30, 1.68)
      fmt.Printf("%v\n", []int{1, 2})  // %v = qualquer valor
      ~~~
    `, [
      predict('Qual é a saída?', 'var n int\nvar s string\nfmt.Println(n, s == "")', '0 true', 'Valores zero: 0 para int e "" para string.'),
      fill('Complete a declaração curta:', 'total ___ 10', ':=', '`:=` declara e atribui.'),
    ]),
  ], [
    choice('Onde um programa Go começa a executar?', ['Na função `init` de qualquer pacote', 'Na função `main` do pacote `main`', 'No primeiro arquivo', 'Em `start()`'], 1, '`package main` + `func main()`.'),
    predict('Qual é a saída?', 'a := 7\nb := 2\nfmt.Println(a/b, a%b)', '3 1', 'Divisão inteira e resto.'),
    bug('Qual linha impede a compilação?', md`
      package main
      import "fmt"
      func main() {
          x := 5
          y := 10
          fmt.Println(x)
      }
    `, 5, 'Em Go, variável declarada e não usada (`y`) é erro de compilação.'),
    predict('Qual é a saída?', 'x := 10\nf := float64(x) / 4\nfmt.Println(f)', '2.5', 'Convertido para float64, a divisão é decimal.'),
    choice('O que é o "valor zero" em Go?', ['Sempre o número 0', 'O valor padrão de cada tipo quando não inicializado', 'Um erro', 'O valor `nil` sempre'], 1, '0, "", false, nil...'),
  ]),

  mod('controle', 'Controle e funções', 'if, for, switch e funções com múltiplos retornos.', [
    lesson('if, for e switch', md`
      ~~~go
      if idade >= 18 {
          fmt.Println("adulto")
      } else {
          fmt.Println("menor")
      }

      // if com declaração curta
      if n := len(nome); n > 3 {
          fmt.Println("nome longo")
      }
      ~~~

      Go tem **um único laço**: o \`for\`.

      ~~~go
      for i := 0; i < 3; i++ { }      // clássico
      for x < 100 { x *= 2 }          // "while"
      for { break }                    // infinito
      for i, v := range []string{"a", "b"} {
          fmt.Println(i, v)            // índice e valor
      }
      ~~~

      ## switch

      ~~~go
      switch dia {
      case "sab", "dom":
          fmt.Println("fim de semana")
      default:
          fmt.Println("dia útil")
      }
      ~~~

      No \`switch\` de Go **não precisa de break**: cada case para sozinho.
    `, [
      predict('Qual é a saída?', 'soma := 0\nfor i := 1; i <= 4; i++ {\n    soma += i\n}\nfmt.Println(soma)', '10', '1 + 2 + 3 + 4.'),
    ]),
    lesson('Funções e múltiplos retornos', md`
      ~~~go
      func somar(a, b int) int {
          return a + b
      }

      func dividir(a, b float64) (float64, error) {
          if b == 0 {
              return 0, errors.New("divisão por zero")
          }
          return a / b, nil
      }

      resultado, err := dividir(10, 2)
      if err != nil {
          fmt.Println("erro:", err)
          return
      }
      fmt.Println(resultado)
      ~~~

      - O tipo vem **depois** do nome: \`a int\`.
      - Funções podem retornar **vários valores**. O padrão em Go é devolver \`(resultado, error)\`.
      - Use \`_\` para ignorar um retorno: \`valor, _ := f()\`.

      > 💡 Go não tem exceções como try/catch. Erros são **valores** que você verifica logo após a chamada com \`if err != nil\`.
    `, [
      predict('Qual é a saída?', 'package main\n\nimport "fmt"\n\nfunc minmax(a, b int) (int, int) {\n    if a < b {\n        return a, b\n    }\n    return b, a\n}\n\nfunc main() {\n    mi, ma := minmax(9, 4)\n    fmt.Println(mi, ma)\n}', '4 9', 'A função devolve dois valores.'),
    ]),
  ], [
    choice('Quantos tipos de laço Go tem?', ['Três (for, while, do)', 'Um (for)', 'Dois (for, while)', 'Nenhum'], 1, 'O `for` cobre todos os casos.'),
    predict('Qual é a saída?', 'x := 3\nswitch x {\ncase 1, 2:\n    fmt.Println("baixo")\ncase 3:\n    fmt.Println("três")\ndefault:\n    fmt.Println("alto")\n}', 'três', 'Sem fall-through: só o case 3 executa.'),
    fill('Complete o teste de erro idiomático:', 'v, err := strconv.Atoi(s)\nif err ___ nil {\n    return err\n}', '!=', '`if err != nil`.'),
    predict('Qual é a saída?', 'for i, c := range "ab" {\n    fmt.Print(i, string(c))\n}', '0a1b', '`range` numa string devolve índice e caractere.'),
    choice('Como Go trata erros normalmente?', ['Com try/catch', 'Retornando um valor `error` que deve ser verificado', 'Encerrando o programa sempre', 'Ignorando'], 1, 'Erros são valores.'),
  ]),

  mod('colecoes', 'Slices e maps', 'Arrays, slices, append e maps.', [
    lesson('Slices', md`
      Arrays em Go têm tamanho fixo (\`[3]int\`). No dia a dia usamos **slices**, que crescem:

      ~~~go
      nums := []int{3, 1, 4}
      nums = append(nums, 1, 5)    // append devolve o novo slice!
      fmt.Println(len(nums))        // 5
      fmt.Println(nums[1:3])        // [1 4]

      nomes := make([]string, 0, 10) // tamanho 0, capacidade 10
      for _, n := range nums {
          fmt.Println(n)
      }
      ~~~

      > ⚠️ Sempre reatribua o resultado: \`nums = append(nums, x)\`. Chamar \`append\` sem guardar o retorno não altera nada.

      Ordenação: \`slices.Sort(nums)\` (pacote \`slices\`, Go 1.21+).
    `, [
      predict('Qual é a saída?', 's := []int{1, 2}\ns = append(s, 3)\nfmt.Println(s, len(s))', '[1 2 3] 3', '`Println` mostra slices entre colchetes, separados por espaço.'),
    ]),
    lesson('Maps', md`
      ~~~go
      idades := map[string]int{
          "Ana": 30,
          "Bia": 25,
      }
      idades["Caio"] = 19
      delete(idades, "Bia")

      v, existe := idades["Zé"]   // "comma ok"
      fmt.Println(v, existe)       // 0 false

      for nome, idade := range idades {
          fmt.Println(nome, idade)
      }
      ~~~

      - Buscar uma chave inexistente devolve o **valor zero**, não erro. Use o segundo retorno (\`ok\`) para saber se existe.
      - A ordem de iteração de um map é **aleatória** de propósito.
    `, [
      predict('Qual é a saída?', 'm := map[string]int{"a": 1}\nm["a"] += 5\n_, ok := m["b"]\nfmt.Println(m["a"], ok)', '6 false', '"a" vale 6 e "b" não existe.'),
    ]),
  ], [
    fill('Complete para adicionar ao slice:', 'lista = ___(lista, 42)', 'append', '`append` devolve o slice atualizado.'),
    predict('Qual é a saída?', 'v := []string{"a", "b", "c", "d"}\nfmt.Println(v[1:3])', '[b c]', 'Do índice 1 até antes do 3.'),
    predict('Qual é a saída?', 'm := map[string]int{}\nfmt.Println(m["x"])', '0', 'Chave inexistente devolve o valor zero.'),
    bug('Este código deveria adicionar 4 ao slice. Qual linha está errada?', md`
      nums := []int{1, 2, 3}
      append(nums, 4)
      fmt.Println(nums)
    `, 2, 'O retorno de `append` precisa ser guardado: `nums = append(nums, 4)`. Ignorar o resultado de `append` é inclusive erro de compilação.'),
    choice('Qual função remove uma chave de um map?', ['`remove`', '`delete`', '`pop`', '`m.drop`'], 1, '`delete(m, chave)`.'),
  ]),

  mod('tipos', 'Structs, métodos e interfaces', 'Tipos próprios, métodos, ponteiros e interfaces.', [
    lesson('Structs e métodos', md`
      ~~~go
      type Conta struct {
          Titular string
          Saldo   float64
      }

      func (c *Conta) Depositar(v float64) {
          c.Saldo += v
      }

      func (c Conta) Resumo() string {
          return fmt.Sprintf("%s: %.2f", c.Titular, c.Saldo)
      }

      c := Conta{Titular: "Rita"}
      c.Depositar(100)
      fmt.Println(c.Resumo())   // Rita: 100.00
      ~~~

      - Métodos são funções com um **receptor**: \`(c *Conta)\`.
      - Receptor **ponteiro** (\`*Conta\`) permite alterar o struct; receptor valor (\`Conta\`) trabalha numa cópia.
      - Nomes que começam com **maiúscula** são exportados (públicos para outros pacotes); com minúscula, privados.

      Go **não tem classes nem herança**. Você combina structs (composição) e interfaces.
    `, [
      predict('Qual é a saída?', 'package main\n\nimport "fmt"\n\ntype C struct{ n int }\n\nfunc (c C) IncValor() { c.n++ }\nfunc (c *C) IncPtr()  { c.n++ }\n\nfunc main() {\n    c := C{}\n    c.IncValor()\n    c.IncPtr()\n    c.IncPtr()\n    fmt.Println(c.n)\n}', '2', 'O receptor por valor altera uma cópia; só os dois `IncPtr` contam.'),
    ]),
    lesson('Interfaces', md`
      Uma interface lista métodos. Qualquer tipo que tenha esses métodos **implementa a interface automaticamente** — sem escrever \`implements\`:

      ~~~go
      type Forma interface {
          Area() float64
      }

      type Retangulo struct{ L, A float64 }
      func (r Retangulo) Area() float64 { return r.L * r.A }

      type Circulo struct{ R float64 }
      func (c Circulo) Area() float64 { return 3.14 * c.R * c.R }

      formas := []Forma{Retangulo{2, 3}, Circulo{1}}
      for _, f := range formas {
          fmt.Println(f.Area())
      }
      ~~~

      A interface mais famosa é \`error\`: qualquer tipo com o método \`Error() string\` é um erro.
    `, [
      choice('Como um tipo implementa uma interface em Go?', ['Com a palavra `implements`', 'Tendo todos os métodos da interface', 'Herdando da interface', 'Registrando num arquivo'], 1, 'A implementação é implícita.'),
    ]),
  ], [
    choice('Qual receptor permite que o método altere o struct?', ['Receptor por valor', 'Receptor ponteiro (`*T`)', 'Nenhum', 'Receptor `const`'], 1, 'Com ponteiro, o método acessa o original.'),
    choice('O que indica um nome começando com maiúscula, como `Saldo`?', ['É uma constante', 'É exportado (visível fora do pacote)', 'É privado', 'É um tipo'], 1, 'Visibilidade em Go é definida pela primeira letra.'),
    fill('Complete para declarar um novo tipo struct:', '___ Ponto struct {\n    X, Y int\n}', 'type', '`type Nome struct { ... }`.'),
    predict('Qual é a saída?', 'package main\n\nimport "fmt"\n\ntype P struct{ X, Y int }\n\nfunc main() {\n    p := P{X: 1}\n    q := p\n    q.X = 5\n    fmt.Println(p.X, q.X, q.Y)\n}', '1 5 0', 'Atribuir struct copia; Y tem valor zero.'),
    choice('Go tem herança de classes?', ['Sim, com `extends`', 'Não; usa composição e interfaces', 'Sim, com `inherits`', 'Só para interfaces'], 1, 'Composição é o caminho em Go.'),
  ]),

  mod('concorrencia', 'Concorrência', 'goroutines, channels e WaitGroup.', [
    lesson('goroutines e channels', md`
      Concorrência é o ponto forte do Go. Uma **goroutine** é uma função rodando em paralelo, leve o bastante para você criar milhares:

      ~~~go
      go enviarEmail("ana@exemplo.com")   // roda em segundo plano
      ~~~

      **Channels** são canos por onde goroutines trocam valores com segurança:

      ~~~go
      ch := make(chan int)

      go func() {
          ch <- 42          // envia
      }()

      valor := <-ch         // recebe (espera até chegar)
      fmt.Println(valor)    // 42
      ~~~

      ## Esperando várias goroutines

      ~~~go
      var wg sync.WaitGroup
      for i := 1; i <= 3; i++ {
          wg.Add(1)
          go func(n int) {
              defer wg.Done()
              fmt.Println("tarefa", n)
          }(i)
      }
      wg.Wait()   // bloqueia até todas terminarem
      ~~~

      \`defer\` agenda uma chamada para o fim da função — muito usado para fechar arquivos e liberar recursos.

      > 💡 Lema do Go: "não comunique compartilhando memória; compartilhe memória comunicando".

      🎉 Parabéns! Próximos passos: criar uma API com o pacote \`net/http\` da biblioteca padrão.
    `, [
      predict('Qual é a saída?', 'ch := make(chan string)\ngo func() { ch <- "pong" }()\nfmt.Println(<-ch)', 'pong', 'A main espera o valor chegar pelo channel.'),
      fill('Complete para iniciar uma goroutine:', '___ processar(dados)', 'go', 'A palavra `go` antes da chamada.'),
    ]),
  ], [
    choice('O que é uma goroutine?', ['Um tipo de variável', 'Uma função executando de forma concorrente, gerenciada pelo Go', 'Um pacote', 'Um erro'], 1, 'São muito leves.'),
    choice('Para que serve um channel?', ['Guardar arquivos', 'Comunicar valores entre goroutines com segurança', 'Importar pacotes', 'Criar structs'], 1, '`ch <- v` envia; `<-ch` recebe.'),
    choice('O que `defer f()` faz?', ['Executa f imediatamente', 'Executa f quando a função atual terminar', 'Executa f em paralelo', 'Cancela f'], 1, 'Útil para liberar recursos.'),
    predict('Qual é a saída? (escreva as linhas separadas por espaço)', 'package main\n\nimport "fmt"\n\nfunc main() {\n    defer fmt.Println("fim")\n    fmt.Println("início")\n}', 'início fim', 'O `defer` roda ao final de `main`.'),
    choice('Qual tipo espera um grupo de goroutines terminar?', ['`sync.Mutex`', '`sync.WaitGroup`', '`time.Sleep`', '`chan bool`'], 1, '`Add`, `Done` e `Wait`.'),
  ]),
]);
