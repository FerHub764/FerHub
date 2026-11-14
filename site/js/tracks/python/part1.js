import { md, mod, lesson, choice, predict, fill, bug, run } from '../_dsl.js';

export default [
  mod('intro', 'Primeiros passos', 'O que é programar, seu primeiro programa e como ler erros.', [
    lesson('O que é programar?', md`
      Programar é **dar instruções a um computador** em uma linguagem que ele entende. O computador é rápido, mas não adivinha nada: ele executa exatamente o que você escreve, na ordem em que escreve.

      Pense numa receita de bolo. Cada passo precisa estar claro: "misture 2 xícaras de farinha", "asse por 40 minutos". Um programa é uma receita para o computador.

      ## Por que Python?

      - **Sintaxe limpa:** parece quase inglês. Menos símbolos para decorar.
      - **Usado de verdade:** Google, Netflix, NASA e Instagram usam Python.
      - **Serve para tudo:** automação, sites, ciência de dados, inteligência artificial.

      ## Como um programa roda

      Você escreve o **código-fonte** (um texto). Um programa chamado **interpretador** lê esse texto linha por linha, de cima para baixo, e executa cada instrução.

      ~~~python
      print("Primeira linha")
      print("Segunda linha")
      ~~~

      Saída:

      ~~~text
      Primeira linha
      Segunda linha
      ~~~

      > 💡 Aqui no DevTrilhas o Python roda direto no seu navegador. Na primeira execução ele leva alguns segundos para carregar.
    `, [
      choice('Em que ordem o Python executa as linhas de um programa simples?', ['Em ordem aleatória', 'De baixo para cima', 'De cima para baixo, uma por vez', 'Todas ao mesmo tempo'], 2, 'O interpretador lê e executa as instruções **de cima para baixo**.'),
    ]),
    lesson('Seu primeiro programa: print()', md`
      A função \`print()\` mostra algo na tela. Tudo que estiver entre os parênteses é exibido.

      ~~~python
      print("Olá, mundo!")
      ~~~

      Textos precisam estar entre **aspas** — simples \`'...'\` ou duplas \`"..."\`. Números podem ir sem aspas:

      ~~~python
      print(42)
      print(3.14)
      print("Python", "é", "legal")
      ~~~

      Saída:

      ~~~text
      42
      3.14
      Python é legal
      ~~~

      Quando você passa vários valores separados por vírgula, o \`print\` os junta com **um espaço** entre eles.

      ## Linhas em branco e caracteres especiais

      - \`print()\` vazio imprime uma linha em branco.
      - Dentro de um texto, \`\n\` significa "quebra de linha".

      ~~~python
      print("Linha 1\nLinha 2")
      ~~~

      > ⚠️ Python diferencia maiúsculas e minúsculas: \`Print("oi")\` dá erro, porque o nome certo é \`print\`.
    `, [
      run('Escreva um programa que mostre exatamente a frase **Olá, mundo!** na tela.', '# escreva seu código abaixo\n', 'Olá, mundo!', {
        hint: 'Use print("...") com o texto entre aspas.',
        solution: 'print("Olá, mundo!")',
      }),
      run('Mostre seu "cartão de visitas" em **três linhas**: `Nome: Ana`, `Idade: 20` e `Cidade: Recife`.', 'print("Nome: Ana")\n', 'Nome: Ana\nIdade: 20\nCidade: Recife', {
        hint: 'Um print para cada linha.',
        solution: 'print("Nome: Ana")\nprint("Idade: 20")\nprint("Cidade: Recife")',
      }),
    ]),
    lesson('Comentários e mensagens de erro', md`
      ## Comentários

      Tudo depois de \`#\` numa linha é **comentário**: o Python ignora. Use para explicar o *porquê* do código.

      ~~~python
      # Este programa cumprimenta o usuário
      print("Bem-vindo!")  # mostra a saudação
      ~~~

      ## Erros não são o fim do mundo

      Todo programador vê erros o dia inteiro. O segredo é **ler a mensagem**. Ela diz *onde* e *o quê*.

      ~~~python
      print("Olá"
      ~~~

      ~~~text
      SyntaxError: '(' was never closed
      ~~~

      Os erros mais comuns no começo:

      | Erro | Significa |
      |---|---|
      | \`SyntaxError\` | Código mal escrito: falta parêntese, aspas, dois-pontos... |
      | \`NameError\` | Você usou um nome que não existe (ex.: \`prnt\`). |
      | \`IndentationError\` | Espaços no começo da linha estão errados. |
      | \`TypeError\` | Operação com tipos incompatíveis, como \`"5" + 3\`. |

      > 💡 Leia a **última linha** do erro primeiro. Ela tem o tipo e a descrição do problema.
    `, [
      bug('Qual linha tem um erro?', md`
        print("Bom dia")
        print("Boa tarde)
        print("Boa noite")
      `, 2, 'Na linha 2 falta fechar as aspas: `"Boa tarde"`.'),
      choice('Que tipo de erro aparece ao executar `prnt("oi")`?', ['SyntaxError', 'NameError', 'TypeError', 'Nenhum erro'], 1, '`prnt` não é um nome conhecido, então o Python lança **NameError**.'),
    ]),
  ], [
    choice('O que faz a função `print()`?', ['Lê o que o usuário digita', 'Mostra valores na tela', 'Salva um arquivo', 'Desliga o programa'], 1, '`print()` exibe valores na saída.'),
    predict('Qual é a saída?', 'print("A", "B", "C")', 'A B C', 'Valores separados por vírgula são impressos com um espaço entre eles.'),
    choice('Qual linha é um comentário em Python?', ['`// comentário`', '`# comentário`', '`<!-- comentário -->`', '`-- comentário`'], 1, 'Em Python, comentários começam com `#`.'),
    bug('Encontre a linha com erro:', md`
      # meu programa
      print("início")
      Print("meio")
      print("fim")
    `, 3, '`Print` com P maiúsculo não existe; o certo é `print`.'),
    predict('Quantas linhas este código imprime?', 'print("um\\ndois")\nprint()', '3', '`\\n` quebra a linha (2 linhas) e `print()` vazio imprime mais uma linha em branco.'),
    fill('Complete para mostrar **Oi** na tela:', '___("Oi")', 'print', 'A função que mostra na tela é `print`.'),
  ]),

  mod('variaveis', 'Variáveis e tipos', 'Guardar valores, os tipos básicos e ler dados do usuário.', [
    lesson('Variáveis: caixinhas com nome', md`
      Uma **variável** guarda um valor para usar depois. Você cria com o sinal \`=\` (atribuição):

      ~~~python
      nome = "Ana"
      idade = 20
      print(nome)
      print(idade)
      ~~~

      Leia \`idade = 20\` como "**idade recebe** 20". Não é uma igualdade matemática!

      ## Mudando o valor

      ~~~python
      pontos = 10
      pontos = pontos + 5
      print(pontos)  # 15
      ~~~

      O lado direito é calculado primeiro (\`10 + 5\`) e depois guardado em \`pontos\`.

      ## Regras para nomes

      - Podem ter letras, números e \`_\`, mas **não podem começar com número**.
      - Sem espaços nem acentos (por convenção): use \`nome_completo\`, não \`nome completo\`.
      - Maiúsculas importam: \`Idade\` e \`idade\` são variáveis diferentes.
      - Escolha nomes que digam o que guardam: \`preco_total\` é melhor que \`x\`.
    `, [
      run('Crie a variável `cidade` com o valor `"Salvador"` e mostre na tela a frase `Eu moro em Salvador` usando a variável.', 'cidade = \n', 'Eu moro em Salvador', {
        hint: 'print("Eu moro em", cidade) junta os textos com um espaço.',
        solution: 'cidade = "Salvador"\nprint("Eu moro em", cidade)',
      }),
      predict('Qual é a saída?', 'x = 3\nx = x * 2\nx = x + 1\nprint(x)', '7', '3 → 6 → 7.'),
    ]),
    lesson('Tipos de dados', md`
      Todo valor tem um **tipo**. Os quatro básicos:

      | Tipo | Nome | Exemplos |
      |---|---|---|
      | \`int\` | inteiro | \`10\`, \`-3\`, \`0\` |
      | \`float\` | decimal | \`3.14\`, \`-0.5\`, \`2.0\` |
      | \`str\` | texto (string) | \`"Olá"\`, \`'123'\` |
      | \`bool\` | lógico | \`True\`, \`False\` |

      A função \`type()\` mostra o tipo de um valor:

      ~~~python
      print(type(10))      # <class 'int'>
      print(type(2.5))     # <class 'float'>
      print(type("oi"))    # <class 'str'>
      print(type(True))    # <class 'bool'>
      ~~~

      > ⚠️ Em Python o separador decimal é o **ponto**: \`3.5\`, nunca \`3,5\`.

      ## "10" não é 10

      \`"10"\` com aspas é **texto**. \`10\` sem aspas é **número**. Isso muda tudo:

      ~~~python
      print("10" + "5")  # 105  (junta textos)
      print(10 + 5)      # 15   (soma números)
      ~~~

      ## Convertendo

      - \`int("42")\` → \`42\`
      - \`float("2.5")\` → \`2.5\`
      - \`str(99)\` → \`"99"\`
    `, [
      choice('Qual é o tipo de `"3.14"`?', ['`float`', '`int`', '`str`', '`bool`'], 2, 'Está entre aspas, então é texto (`str`).'),
      predict('Qual é a saída?', 'print("2" + "2")', '22', 'Dois textos somados são concatenados: "22".'),
    ]),
    lesson('Lendo dados com input()', md`
      A função \`input()\` pausa o programa e espera o usuário digitar algo. O que ele digitar vira uma **string**.

      ~~~python
      nome = input("Qual é o seu nome? ")
      print("Prazer,", nome)
      ~~~

      > 💡 Nos exercícios daqui, a "digitação" do usuário é simulada. Você verá a entrada aparecer no console.

      ## Cuidado: input sempre devolve texto

      ~~~python
      idade = input("Idade: ")     # "20" (texto!)
      print(idade + 1)              # TypeError!
      ~~~

      Converta antes de fazer contas:

      ~~~python
      idade = int(input("Idade: "))
      print("Ano que vem você terá", idade + 1)
      ~~~

      O \`int(...)\` envolve o \`input(...)\`: primeiro lê o texto, depois converte para inteiro.
    `, [
      run('O usuário vai digitar a idade (o exercício simula **17**). Leia com `input()`, converta para inteiro e mostre `Daqui a 5 anos você terá 22 anos` (calculando, não escrevendo 22 direto).', 'idade = input()\n', '17\nDaqui a 5 anos você terá 22 anos', {
        stdin: '17',
        hint: 'Converta com int(...) e use print("Daqui a 5 anos você terá", idade + 5, "anos").',
        solution: 'idade = int(input())\nprint("Daqui a 5 anos você terá", idade + 5, "anos")',
      }),
    ]),
  ], [
    choice('Qual nome de variável é **inválido** em Python?', ['`nota_final`', '`_total`', '`2lugar`', '`valorMaximo`'], 2, 'Nomes de variáveis não podem começar com número.'),
    predict('Qual é a saída?', 'a = 5\nb = a\na = 10\nprint(b)', '5', '`b` recebeu o valor 5 antes de `a` mudar.'),
    choice('O que `input()` devolve?', ['Sempre um `int`', 'Sempre uma `str`', 'Depende do que foi digitado', 'Um `bool`'], 1, 'O valor de `input()` é **sempre texto**; converta com `int()` ou `float()` quando precisar.'),
    fill('Complete para converter o texto em número inteiro:', 'n = ___("42")', 'int', '`int()` converte para inteiro.'),
    predict('Qual é a saída?', 'print(type(7.0))', "<class 'float'>", '`7.0` tem ponto decimal, então é `float`.'),
    bug('Este programa não dá erro, mas calcula os meses errado. Qual linha tem o bug?', md`
      anos = input("Quantos anos? ")
      meses = anos * 12
      dias = int(anos) * 365
      print(dias)
    `, 2, 'Na linha 2, `anos` ainda é texto; `"20" * 12` repete o texto em vez de multiplicar. O resultado não é o número de meses (é um bug lógico). Converta antes: `int(anos) * 12`.'),
  ]),

  mod('operadores', 'Operadores e textos', 'Contas, comparações, lógica e como manipular strings.', [
    lesson('Operadores aritméticos', md`
      | Operador | Operação | Exemplo | Resultado |
      |---|---|---|---|
      | \`+\` | soma | \`7 + 2\` | \`9\` |
      | \`-\` | subtração | \`7 - 2\` | \`5\` |
      | \`*\` | multiplicação | \`7 * 2\` | \`14\` |
      | \`/\` | divisão | \`7 / 2\` | \`3.5\` |
      | \`//\` | divisão inteira | \`7 // 2\` | \`3\` |
      | \`%\` | resto | \`7 % 2\` | \`1\` |
      | \`**\` | potência | \`7 ** 2\` | \`49\` |

      ## Ordem das operações

      Igual à matemática: \`**\` primeiro, depois \`*\`, \`/\`, \`//\`, \`%\`, e por último \`+\` e \`-\`. Use parênteses para deixar claro:

      ~~~python
      print(2 + 3 * 4)    # 14
      print((2 + 3) * 4)  # 20
      ~~~

      ## O resto (%) é muito útil

      - \`n % 2 == 0\` → \`n\` é par.
      - \`n % 10\` → último dígito de \`n\`.

      ## Atalhos de atribuição

      ~~~python
      saldo = 100
      saldo += 50   # o mesmo que saldo = saldo + 50
      saldo -= 30   # saldo = saldo - 30
      print(saldo)  # 120
      ~~~
    `, [
      run('Uma pizza custa 45 reais e será dividida entre 4 amigos. Calcule e mostre quanto cada um paga: `Cada um paga 11.25`.', 'preco = 45\npessoas = 4\n', 'Cada um paga 11.25', {
        hint: 'Use / para dividir.',
        solution: 'preco = 45\npessoas = 4\nprint("Cada um paga", preco / pessoas)',
      }),
      predict('Qual é a saída?', 'print(17 // 5, 17 % 5)', '3 2', '17 dividido por 5 dá 3 e sobra 2.'),
    ]),
    lesson('Comparações e lógica', md`
      Comparações respondem **sim ou não** — o resultado é um \`bool\`:

      | Operador | Pergunta |
      |---|---|
      | \`==\` | é igual? |
      | \`!=\` | é diferente? |
      | \`>\` / \`<\` | maior / menor? |
      | \`>=\` / \`<=\` | maior ou igual / menor ou igual? |

      ~~~python
      print(5 > 3)      # True
      print(5 == 3)     # False
      print("a" != "b") # True
      ~~~

      > ⚠️ \`=\` **atribui** um valor. \`==\` **compara**. Confundir os dois é um erro clássico.

      ## Operadores lógicos

      - \`and\`: verdadeiro se **as duas** partes forem verdadeiras.
      - \`or\`: verdadeiro se **pelo menos uma** for verdadeira.
      - \`not\`: inverte.

      ~~~python
      idade = 20
      tem_ingresso = True
      print(idade >= 18 and tem_ingresso)  # True
      print(idade < 12 or idade > 65)      # False
      print(not tem_ingresso)              # False
      ~~~
    `, [
      predict('Qual é a saída?', 'x = 7\nprint(x > 5 and x < 10)', 'True', '7 é maior que 5 **e** menor que 10.'),
      choice('Qual expressão verifica se `n` é par?', ['`n / 2 == 0`', '`n % 2 == 0`', '`n // 2 == 1`', '`n = 2`'], 1, 'Um número é par quando o resto da divisão por 2 é zero.'),
    ]),
    lesson('Trabalhando com strings', md`
      ## f-strings: o jeito moderno de montar textos

      Coloque um \`f\` antes das aspas e escreva variáveis entre \`{}\`:

      ~~~python
      nome = "Ana"
      idade = 20
      print(f"{nome} tem {idade} anos")
      print(f"Em 10 anos: {idade + 10}")
      ~~~

      Você pode formatar números: \`{preco:.2f}\` mostra 2 casas decimais.

      ~~~python
      preco = 7.5
      print(f"Total: R$ {preco:.2f}")  # Total: R$ 7.50
      ~~~

      ## Métodos úteis

      ~~~python
      texto = "  Python é Legal  "
      print(texto.strip())        # "Python é Legal" (tira espaços das pontas)
      print(texto.upper())        # tudo maiúsculo
      print(texto.lower())        # tudo minúsculo
      print("banana".replace("a", "o"))  # bonono
      print(len("Python"))        # 6  (tamanho)
      ~~~

      ## Índices e fatias

      Cada caractere tem uma posição, **começando em 0**:

      ~~~python
      p = "Python"
      print(p[0])    # P
      print(p[-1])   # n (último)
      print(p[0:3])  # Pyt (do 0 até antes do 3)
      ~~~
    `, [
      run('Usando f-string, mostre `Produto: Caderno | Preço: R$ 12.90` a partir das variáveis dadas (use `:.2f` no preço).', 'produto = "Caderno"\npreco = 12.9\n', 'Produto: Caderno | Preço: R$ 12.90', {
        hint: 'print(f"Produto: {produto} | Preço: R$ {preco:.2f}")',
        solution: 'produto = "Caderno"\npreco = 12.9\nprint(f"Produto: {produto} | Preço: R$ {preco:.2f}")',
      }),
      predict('Qual é a saída?', 'palavra = "programar"\nprint(palavra[3:7])', 'gram', 'Índices 3, 4, 5 e 6: g, r, a, m.'),
    ]),
  ], [
    predict('Qual é a saída?', 'print(2 ** 3 + 1)', '9', '2 elevado a 3 é 8; mais 1 dá 9.'),
    predict('Qual é a saída?', 'print(10 / 4)', '2.5', 'A divisão `/` sempre devolve `float`.'),
    choice('Qual é o resultado de `True and False`?', ['`True`', '`False`', 'Erro', '`None`'], 1, '`and` só é verdadeiro se as duas partes forem verdadeiras.'),
    predict('Qual é a saída?', 'n = "Maria"\nprint(f"Oi, {n}! Seu nome tem {len(n)} letras.")', 'Oi, Maria! Seu nome tem 5 letras.', '`len("Maria")` é 5.'),
    fill('Complete para mostrar o texto todo em maiúsculas:', 'print("olá".___())', 'upper', '`upper()` converte para maiúsculas.'),
    bug('Qual linha tem erro?', md`
      total = 50
      if total = 50:
          print("cinquenta")
    `, 2, 'Para **comparar** use `==`. Um único `=` é atribuição e gera erro de sintaxe no `if`.'),
  ]),

  mod('condicionais', 'Tomando decisões', 'if, elif, else e como o programa escolhe caminhos.', [
    lesson('if e else', md`
      Com \`if\` o programa executa um bloco **só se** a condição for verdadeira:

      ~~~python
      idade = 20
      if idade >= 18:
          print("Pode dirigir")
      else:
          print("Ainda não pode dirigir")
      ~~~

      Repare em três detalhes obrigatórios:

      1. **Dois-pontos** \`:\` no fim da linha do \`if\` e do \`else\`.
      2. **Indentação**: as linhas de dentro do bloco começam com 4 espaços.
      3. O \`else\` (senão) é opcional e não tem condição.

      > 💡 Em Python a indentação não é só estética: ela **define** o que está dentro do \`if\`.

      ~~~python
      nota = 5
      if nota >= 7:
          print("Aprovado")
          print("Parabéns!")   # também dentro do if
      print("Fim")             # fora do if: sempre roda
      ~~~
    `, [
      run('O programa recebe uma temperatura (simulada: **31**). Se for maior que 30, mostre `Calor!`; senão, mostre `Clima agradável`.', 'temp = int(input())\n', '31\nCalor!', {
        stdin: '31',
        hint: 'if temp > 30: ... else: ...',
        solution: 'temp = int(input())\nif temp > 30:\n    print("Calor!")\nelse:\n    print("Clima agradável")',
      }),
    ]),
    lesson('elif: várias possibilidades', md`
      Quando há mais de dois caminhos, use \`elif\` ("senão, se"):

      ~~~python
      nota = 8.5
      if nota >= 9:
          print("A")
      elif nota >= 7:
          print("B")
      elif nota >= 5:
          print("C")
      else:
          print("Reprovado")
      ~~~

      O Python testa **de cima para baixo** e executa **apenas o primeiro** bloco cuja condição for verdadeira. Com nota 8.5, imprime \`B\` e pula o resto.

      ## Condições compostas

      ~~~python
      hora = 14
      if hora >= 12 and hora < 18:
          print("Boa tarde")
      ~~~

      Python permite comparações encadeadas, que ficam mais legíveis:

      ~~~python
      if 12 <= hora < 18:
          print("Boa tarde")
      ~~~
    `, [
      run('Classifique o IMC (simulado: **27.3**): abaixo de 18.5 → `Abaixo do peso`; até 24.9 → `Normal`; até 29.9 → `Sobrepeso`; acima → `Obesidade`.', 'imc = float(input())\n', '27.3\nSobrepeso', {
        stdin: '27.3',
        hint: 'Use if / elif imc <= 24.9 / elif imc <= 29.9 / else.',
        solution: 'imc = float(input())\nif imc < 18.5:\n    print("Abaixo do peso")\nelif imc <= 24.9:\n    print("Normal")\nelif imc <= 29.9:\n    print("Sobrepeso")\nelse:\n    print("Obesidade")',
      }),
      predict('Qual é a saída?', 'x = 15\nif x > 10:\n    print("A")\nelif x > 5:\n    print("B")\nelse:\n    print("C")', 'A', 'Só o primeiro bloco verdadeiro executa.'),
    ]),
    lesson('Valores verdadeiros, falsos e o operador ternário', md`
      Em um \`if\`, qualquer valor pode virar verdadeiro ou falso. São considerados **falsos**:

      - \`False\`, \`0\`, \`0.0\`
      - texto vazio \`""\`
      - listas e dicionários vazios \`[]\`, \`{}\`
      - \`None\`

      Todo o resto é verdadeiro. Isso permite escrever:

      ~~~python
      nome = input("Nome: ")
      if nome:
          print(f"Olá, {nome}")
      else:
          print("Você não digitou nada")
      ~~~

      ## Expressão condicional (ternário)

      Para escolher entre dois valores numa linha só:

      ~~~python
      idade = 16
      status = "maior" if idade >= 18 else "menor"
      print(status)  # menor
      ~~~

      Leia como: "\`status\` é \`"maior"\` **se** idade ≥ 18, **senão** \`"menor"\`".
    `, [
      choice('Qual destes valores é considerado **falso** num `if`?', ['`"0"`', '`[0]`', '`0`', '`"False"`'], 2, 'O número `0` é falso. Já `"0"` e `"False"` são textos não vazios (verdadeiros), e `[0]` é uma lista com um item.'),
      predict('Qual é a saída?', 'n = 7\nprint("par" if n % 2 == 0 else "ímpar")', 'ímpar', '7 % 2 é 1, então a condição é falsa.'),
    ]),
  ], [
    choice('O que está faltando em `if x > 3` para o código funcionar?', ['Parênteses', 'Dois-pontos no final', 'Ponto e vírgula', 'A palavra `then`'], 1, 'Toda linha de `if`, `elif` e `else` termina com `:`.'),
    predict('Qual é a saída?', 'idade = 18\nif idade > 18:\n    print("adulto")\nelse:\n    print("quase")', 'quase', '18 não é **maior** que 18.'),
    bug('Qual linha tem erro de indentação?', md`
      saldo = 100
      if saldo > 0:
      print("positivo")
      print("fim")
    `, 3, 'A linha 3 deveria estar indentada (4 espaços) para ficar dentro do `if`.'),
    predict('Qual é a saída?', 'x = 0\nif x:\n    print("sim")\nelse:\n    print("não")', 'não', '0 é considerado falso.'),
    fill('Complete com a palavra que significa "senão, se":', 'if n > 0:\n    print("positivo")\n___ n < 0:\n    print("negativo")', 'elif', '`elif` testa outra condição quando a anterior é falsa.'),
    choice('Quantos blocos de uma cadeia `if/elif/else` podem executar de uma vez?', ['Todos que forem verdadeiros', 'No máximo um', 'Sempre dois', 'Nenhum'], 1, 'O Python executa apenas o primeiro bloco verdadeiro (ou o `else`).'),
  ]),

  mod('lacos', 'Repetições', 'while, for, range, break e continue.', [
    lesson('O laço while', md`
      \`while\` repete um bloco **enquanto** a condição for verdadeira:

      ~~~python
      contador = 1
      while contador <= 3:
          print("Volta", contador)
          contador += 1
      print("Acabou")
      ~~~

      ~~~text
      Volta 1
      Volta 2
      Volta 3
      Acabou
      ~~~

      A cada volta (iteração), o Python checa a condição de novo. Quando ela fica falsa, o laço termina.

      > ⚠️ Se você esquecer de mudar a variável (\`contador += 1\`), a condição nunca fica falsa: é um **loop infinito**. Aqui no site, o código é interrompido depois de 5 segundos.

      ## Acumuladores

      Um padrão muito comum é somar valores dentro do laço:

      ~~~python
      soma = 0
      n = 1
      while n <= 100:
          soma += n
          n += 1
      print(soma)  # 5050
      ~~~
    `, [
      run('Use `while` para mostrar uma contagem regressiva de **5 até 1**, um número por linha, e depois `Decolar!`.', 'n = 5\n', '5\n4\n3\n2\n1\nDecolar!', {
        hint: 'while n >= 1: print(n); n -= 1',
        solution: 'n = 5\nwhile n >= 1:\n    print(n)\n    n -= 1\nprint("Decolar!")',
      }),
    ]),
    lesson('O laço for e o range()', md`
      O \`for\` percorre os itens de uma sequência, um de cada vez:

      ~~~python
      for letra in "abc":
          print(letra)
      ~~~

      Para repetir um número de vezes, use \`range()\`:

      | Chamada | Gera |
      |---|---|
      | \`range(5)\` | 0, 1, 2, 3, 4 |
      | \`range(2, 6)\` | 2, 3, 4, 5 |
      | \`range(0, 10, 3)\` | 0, 3, 6, 9 |
      | \`range(5, 0, -1)\` | 5, 4, 3, 2, 1 |

      > 💡 O valor final do \`range\` **nunca** é incluído.

      ~~~python
      for i in range(1, 4):
          print(f"{i} x 7 = {i * 7}")
      ~~~

      ~~~text
      1 x 7 = 7
      2 x 7 = 14
      3 x 7 = 21
      ~~~

      **Quando usar cada um?** \`for\` quando você sabe quantas vezes (ou tem uma sequência); \`while\` quando depende de uma condição (ex.: "até o usuário digitar sair").
    `, [
      run('Mostre a tabuada do **9** de 1 a 10 no formato `9 x 1 = 9`, usando `for` e `range`.', '', Array.from({ length: 10 }, (_, i) => `9 x ${i + 1} = ${9 * (i + 1)}`).join('\n'), {
        hint: 'for i in range(1, 11): print(f"9 x {i} = {9 * i}")',
        solution: 'for i in range(1, 11):\n    print(f"9 x {i} = {9 * i}")',
      }),
      predict('Qual é a saída? (tudo numa linha)', 'for i in range(3):\n    print(i, end=" ")', '0 1 2', '`range(3)` gera 0, 1 e 2. O `end=" "` troca a quebra de linha por espaço.'),
    ]),
    lesson('break, continue e laços aninhados', md`
      - \`break\` **sai** do laço imediatamente.
      - \`continue\` **pula** para a próxima volta.

      ~~~python
      for n in range(1, 10):
          if n == 5:
              break
          print(n)
      # imprime 1, 2, 3, 4
      ~~~

      ~~~python
      for n in range(1, 6):
          if n % 2 == 0:
              continue
          print(n)
      # imprime 1, 3, 5
      ~~~

      ## while True + break

      Padrão comum para menus e validação de entrada:

      ~~~python
      while True:
          senha = input("Senha: ")
          if senha == "1234":
              print("Acesso liberado")
              break
          print("Senha incorreta")
      ~~~

      ## Laços dentro de laços

      ~~~python
      for linha in range(1, 4):
          print("*" * linha)
      ~~~

      ~~~text
      *
      **
      ***
      ~~~
    `, [
      run('Some apenas os números **ímpares** de 1 a 20 (use `continue` para pular os pares) e mostre `Soma: 100`.', 'soma = 0\nfor n in range(1, 21):\n    # seu código aqui\n    pass\nprint("Soma:", soma)', 'Soma: 100', {
        hint: 'if n % 2 == 0: continue — depois soma += n.',
        solution: 'soma = 0\nfor n in range(1, 21):\n    if n % 2 == 0:\n        continue\n    soma += n\nprint("Soma:", soma)',
      }),
    ]),
  ], [
    predict('Qual é a saída? (tudo numa linha)', 'for i in range(2, 10, 3):\n    print(i, end=" ")', '2 5 8', 'Começa em 2 e soma 3 até antes de 10.'),
    choice('O que acontece com `while True:` sem `break`?', ['Executa uma vez', 'Dá erro de sintaxe', 'Repete para sempre (loop infinito)', 'Não executa'], 2, 'A condição `True` nunca fica falsa.'),
    predict('Qual é a saída?', 'total = 0\nfor x in range(1, 5):\n    total += x\nprint(total)', '10', '1 + 2 + 3 + 4 = 10.'),
    fill('Complete para sair do laço quando `n` for 3:', 'for n in range(10):\n    if n == 3:\n        ___\n    print(n)', 'break', '`break` encerra o laço.'),
    bug('Este código deveria contar de 1 a 5, mas trava. Qual linha tem o problema?', md`
      i = 1
      while i <= 5:
          print(i)
      i += 1
    `, 4, 'O `i += 1` está fora do laço (sem indentação), então `i` nunca muda: loop infinito.'),
    predict('Quantas vezes "oi" é impresso?', 'for i in range(3):\n    for j in range(2):\n        print("oi")', '6', 'O laço interno roda 2 vezes para cada uma das 3 voltas do externo: 3 × 2 = 6.'),
  ]),
];
