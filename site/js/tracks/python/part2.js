import { md, mod, lesson, choice, predict, fill, bug, run } from '../_dsl.js';

export default [
  mod('colecoes', 'Listas, tuplas e dicionários', 'Guardar muitos valores e encontrá-los rapidamente.', [
    lesson('Listas', md`
      Uma **lista** guarda vários valores em ordem, entre colchetes:

      ~~~python
      frutas = ["maçã", "banana", "uva"]
      print(frutas[0])     # maçã
      print(len(frutas))   # 3
      ~~~

      Listas são **mutáveis** — você pode mudar o conteúdo:

      ~~~python
      frutas.append("manga")      # adiciona no fim
      frutas.insert(0, "kiwi")    # adiciona na posição 0
      frutas.remove("banana")     # remove pelo valor
      ultimo = frutas.pop()       # remove e devolve o último
      frutas[1] = "pera"          # troca um item
      print(frutas)               # ['kiwi', 'pera', 'uva']
      ~~~

      ## Percorrendo

      ~~~python
      notas = [7.5, 9.0, 6.0]
      for nota in notas:
          print(nota)
      print("Média:", sum(notas) / len(notas))
      ~~~

      Funções úteis: \`sum()\`, \`min()\`, \`max()\`, \`sorted()\`, e o operador \`in\` para testar se algo está na lista: \`"uva" in frutas\`.
    `, [
      run('Dada a lista de preços, mostre o **maior** preço, o **menor** e o **total**, no formato `Maior: 30`, `Menor: 5`, `Total: 70`.', 'precos = [12, 5, 30, 23]\n', 'Maior: 30\nMenor: 5\nTotal: 70', {
        hint: 'max(precos), min(precos), sum(precos).',
        solution: 'precos = [12, 5, 30, 23]\nprint("Maior:", max(precos))\nprint("Menor:", min(precos))\nprint("Total:", sum(precos))',
      }),
      predict('Qual é a saída?', 'nums = [3, 1, 2]\nnums.append(5)\nprint(nums[-1] + nums[0])', '8', 'O último é 5 e o primeiro é 3.'),
    ]),
    lesson('Fatias, compreensão de listas e tuplas', md`
      ## Fatias

      ~~~python
      n = [10, 20, 30, 40, 50]
      print(n[1:3])   # [20, 30]
      print(n[:2])    # [10, 20]
      print(n[::-1])  # [50, 40, 30, 20, 10] (invertida)
      ~~~

      ## List comprehension

      Um jeito curto de criar listas a partir de outras:

      ~~~python
      quadrados = [x ** 2 for x in range(1, 6)]
      print(quadrados)  # [1, 4, 9, 16, 25]

      pares = [x for x in range(10) if x % 2 == 0]
      print(pares)      # [0, 2, 4, 6, 8]
      ~~~

      ## Tuplas

      Tuplas são como listas, mas **imutáveis** e com parênteses. Ótimas para dados que andam juntos:

      ~~~python
      ponto = (3, 4)
      x, y = ponto        # desempacotamento
      print(x + y)        # 7
      ~~~
    `, [
      run('Use uma *list comprehension* para criar a lista com o **dobro** de cada número e mostre-a.', 'numeros = [1, 2, 3, 4]\n', '[2, 4, 6, 8]', {
        hint: 'dobros = [n * 2 for n in numeros]',
        solution: 'numeros = [1, 2, 3, 4]\ndobros = [n * 2 for n in numeros]\nprint(dobros)',
      }),
    ]),
    lesson('Dicionários e conjuntos', md`
      Um **dicionário** guarda pares **chave → valor**. Em vez de posição, você acessa pela chave:

      ~~~python
      aluno = {"nome": "Ana", "idade": 20, "curso": "TI"}
      print(aluno["nome"])        # Ana
      aluno["idade"] = 21         # altera
      aluno["cidade"] = "Natal"   # adiciona
      print(aluno.get("email", "não informado"))
      ~~~

      Percorrendo:

      ~~~python
      estoque = {"maçã": 10, "pera": 4}
      for fruta, qtd in estoque.items():
          print(f"{fruta}: {qtd}")
      ~~~

      ## Contando coisas

      ~~~python
      texto = "banana"
      contagem = {}
      for letra in texto:
          contagem[letra] = contagem.get(letra, 0) + 1
      print(contagem)  # {'b': 1, 'a': 3, 'n': 2}
      ~~~

      ## Conjuntos (set)

      Um \`set\` guarda valores **sem repetição** e sem ordem:

      ~~~python
      cores = {"azul", "verde", "azul"}
      print(len(cores))  # 2
      print(set([1, 1, 2, 3, 3]))  # {1, 2, 3}
      ~~~
    `, [
      run('Percorra o dicionário de notas e mostre cada aluno no formato `Ana: 9`, um por linha, na ordem em que aparecem.', 'notas = {"Ana": 9, "Bruno": 7, "Carla": 10}\n', 'Ana: 9\nBruno: 7\nCarla: 10', {
        hint: 'for nome, nota in notas.items(): print(f"{nome}: {nota}")',
        solution: 'notas = {"Ana": 9, "Bruno": 7, "Carla": 10}\nfor nome, nota in notas.items():\n    print(f"{nome}: {nota}")',
      }),
      choice('Qual estrutura é melhor para buscar o telefone de alguém pelo nome?', ['Lista', 'Tupla', 'Dicionário', 'String'], 2, 'Dicionários acessam valores diretamente pela chave (o nome).'),
    ]),
  ], [
    predict('Qual é a saída?', 'l = [1, 2, 3, 4, 5]\nprint(l[1:4])', '[2, 3, 4]', 'Do índice 1 até antes do 4.'),
    choice('Qual é a diferença principal entre lista e tupla?', ['Tuplas não guardam números', 'Listas são imutáveis', 'Tuplas são imutáveis', 'Não há diferença'], 2, 'Tuplas não podem ser alteradas depois de criadas.'),
    predict('Qual é a saída?', 'd = {"a": 1, "b": 2}\nd["a"] = 5\nprint(d["a"] + d["b"])', '7', '`d["a"]` passou a valer 5.'),
    fill('Complete para adicionar "uva" no fim da lista:', 'frutas = ["maçã"]\nfrutas.___("uva")', 'append', '`append()` adiciona ao final.'),
    predict('Qual é a saída?', 'print(len({1, 2, 2, 3, 3, 3}))', '3', 'Conjuntos não guardam repetidos: {1, 2, 3}.'),
    bug('Qual linha gera erro?', md`
      cores = ["azul", "verde", "vermelho"]
      print(cores[0])
      print(cores[3])
    `, 3, 'A lista tem índices 0, 1 e 2. `cores[3]` gera **IndexError**.'),
    predict('Qual é a saída?', 'print([x * 10 for x in range(3)])', '[0, 10, 20]', 'range(3) gera 0, 1, 2; cada um vezes 10.'),
  ]),

  mod('funcoes', 'Funções', 'Organizar código em blocos reutilizáveis.', [
    lesson('Criando funções', md`
      Uma **função** é um bloco de código com nome. Você define uma vez e usa quantas vezes quiser:

      ~~~python
      def saudar(nome):
          print(f"Olá, {nome}!")

      saudar("Ana")
      saudar("Bruno")
      ~~~

      - \`def\` inicia a definição.
      - \`nome\` é um **parâmetro**: uma variável que recebe o valor passado.
      - \`"Ana"\` é o **argumento** passado na chamada.

      ## return: devolvendo um resultado

      \`print\` só mostra na tela. \`return\` **devolve** o valor para quem chamou, para você usar em outras contas:

      ~~~python
      def area_retangulo(base, altura):
          return base * altura

      a = area_retangulo(3, 4)
      print(a + 1)  # 13
      ~~~

      Quando o Python encontra \`return\`, a função termina na hora.

      > 💡 Funções evitam repetir código e deixam o programa fácil de ler: \`calcular_frete(peso)\` diz muito mais do que 10 linhas de contas soltas.
    `, [
      run('Crie a função `celsius_para_fahrenheit(c)` que **retorna** `c * 9 / 5 + 32`. O código de teste já está pronto.', 'def celsius_para_fahrenheit(c):\n    pass  # troque esta linha\n\nprint(celsius_para_fahrenheit(0))\nprint(celsius_para_fahrenheit(100))\nprint(celsius_para_fahrenheit(37))', '32.0\n212.0\n98.6', {
        hint: 'return c * 9 / 5 + 32',
        solution: 'def celsius_para_fahrenheit(c):\n    return c * 9 / 5 + 32\n\nprint(celsius_para_fahrenheit(0))\nprint(celsius_para_fahrenheit(100))\nprint(celsius_para_fahrenheit(37))',
      }),
    ]),
    lesson('Parâmetros padrão, nomeados e escopo', md`
      ## Valores padrão

      ~~~python
      def potencia(base, expoente=2):
          return base ** expoente

      print(potencia(5))      # 25 (usa o padrão 2)
      print(potencia(2, 10))  # 1024
      ~~~

      ## Argumentos nomeados

      ~~~python
      def apresentar(nome, cidade):
          print(f"{nome} mora em {cidade}")

      apresentar(cidade="Belém", nome="Rui")
      ~~~

      ## Retornando vários valores

      ~~~python
      def min_max(lista):
          return min(lista), max(lista)

      menor, maior = min_max([4, 9, 1])
      print(menor, maior)  # 1 9
      ~~~

      ## Escopo

      Variáveis criadas **dentro** de uma função só existem lá dentro:

      ~~~python
      def f():
          x = 10
      f()
      print(x)  # NameError: x não existe aqui fora
      ~~~

      Isso é bom: cada função fica isolada e não bagunça o resto do programa.
    `, [
      run('Crie `desconto(preco, pct=10)` que retorna o preço com desconto de `pct` por cento. Teste já incluído.', 'def desconto(preco, pct=10):\n    pass\n\nprint(desconto(200))\nprint(desconto(200, 25))', '180.0\n150.0', {
        hint: 'return preco - preco * pct / 100',
        solution: 'def desconto(preco, pct=10):\n    return preco - preco * pct / 100\n\nprint(desconto(200))\nprint(desconto(200, 25))',
      }),
      predict('Qual é a saída?', 'def f(a, b=3):\n    return a * b\nprint(f(2) + f(2, 1))', '8', 'f(2) = 6 e f(2, 1) = 2.'),
    ]),
    lesson('Funções como valores, lambda e recursão', md`
      Em Python, funções são valores: podem ir em variáveis e ser passadas para outras funções.

      ~~~python
      nomes = ["bia", "Carlos", "ana"]
      print(sorted(nomes, key=str.lower))  # ['ana', 'bia', 'Carlos']
      ~~~

      ## lambda: funções de uma linha

      ~~~python
      dobro = lambda x: x * 2
      print(dobro(4))  # 8

      produtos = [("caneta", 3), ("livro", 40), ("lápis", 1)]
      produtos.sort(key=lambda p: p[1])
      print(produtos[0])  # ('lápis', 1)
      ~~~

      ## Recursão

      Uma função **recursiva** chama a si mesma, resolvendo um problema menor a cada vez. Precisa de um **caso base** para parar:

      ~~~python
      def fatorial(n):
          if n <= 1:          # caso base
              return 1
          return n * fatorial(n - 1)

      print(fatorial(5))  # 120
      ~~~

      \`fatorial(5)\` = 5 × \`fatorial(4)\` = 5 × 4 × \`fatorial(3)\` ... até chegar em 1.
    `, [
      run('Escreva a função recursiva `soma_ate(n)` que retorna 1 + 2 + ... + n (com caso base `n == 0` retornando 0).', 'def soma_ate(n):\n    pass\n\nprint(soma_ate(4))\nprint(soma_ate(10))', '10\n55', {
        hint: 'if n == 0: return 0 — senão return n + soma_ate(n - 1).',
        solution: 'def soma_ate(n):\n    if n == 0:\n        return 0\n    return n + soma_ate(n - 1)\n\nprint(soma_ate(4))\nprint(soma_ate(10))',
      }),
    ]),
  ], [
    choice('Qual palavra-chave cria uma função em Python?', ['`function`', '`func`', '`def`', '`fn`'], 2, 'Funções em Python são definidas com `def`.'),
    predict('Qual é a saída?', 'def soma(a, b):\n    return a + b\nprint(soma(soma(1, 2), 3))', '6', 'soma(1, 2) = 3; soma(3, 3) = 6.'),
    choice('Qual a diferença entre `print` e `return` numa função?', ['Nenhuma', '`return` devolve o valor para quem chamou; `print` só mostra na tela', '`print` é mais rápido', '`return` mostra na tela'], 1, 'Com `return` o valor pode ser guardado e usado em outras contas.'),
    predict('Qual é a saída?', 'def f():\n    print("A")\n    return\n    print("B")\nf()', 'A', 'O `return` encerra a função antes do segundo print.'),
    fill('Complete a lambda que soma 1:', 'mais_um = ___ x: x + 1', 'lambda', '`lambda parametros: expressão`.'),
    bug('A função deveria devolver o quadrado, mas imprime `None`. Qual linha está errada?', md`
      def quadrado(n):
          resultado = n * n
          print(resultado)

      print(quadrado(4))
    `, 3, 'A função usa `print` em vez de `return resultado`, então devolve `None`.'),
  ]),

  mod('erros-modulos', 'Erros, arquivos e módulos', 'Tratar exceções, ler arquivos e usar bibliotecas.', [
    lesson('Tratando erros com try/except', md`
      Alguns erros acontecem por causa de dados externos, como o usuário digitar "abc" quando você esperava um número. Em vez de deixar o programa quebrar, você pode **tratar** o erro:

      ~~~python
      try:
          idade = int(input("Idade: "))
          print("Ano que vem:", idade + 1)
      except ValueError:
          print("Isso não é um número!")
      ~~~

      - O código "arriscado" vai no \`try\`.
      - Se der o erro indicado, o bloco \`except\` roda no lugar.

      ## Vários tipos de erro

      ~~~python
      try:
          a = int(input())
          b = int(input())
          print(a / b)
      except ValueError:
          print("Digite números inteiros")
      except ZeroDivisionError:
          print("Não dá para dividir por zero")
      finally:
          print("Fim do cálculo")   # roda sempre
      ~~~

      ## Lançando seus próprios erros

      ~~~python
      def sacar(saldo, valor):
          if valor > saldo:
              raise ValueError("Saldo insuficiente")
          return saldo - valor
      ~~~

      > ⚠️ Evite \`except:\` sozinho, sem tipo. Ele esconde todos os erros, até os bugs que você precisa ver.
    `, [
      run('O usuário digita (simulado) `abc`. Tente converter para `int`; se der `ValueError`, mostre `Entrada inválida`.', 'texto = input()\n', 'abc\nEntrada inválida', {
        stdin: 'abc',
        hint: 'try: n = int(texto) ... except ValueError: print("Entrada inválida")',
        solution: 'texto = input()\ntry:\n    n = int(texto)\n    print(n)\nexcept ValueError:\n    print("Entrada inválida")',
      }),
    ]),
    lesson('Lendo e escrevendo arquivos', md`
      Para salvar dados entre execuções, usamos arquivos. O jeito recomendado é com \`with\`, que fecha o arquivo automaticamente:

      ~~~python
      # escrever ("w" apaga o conteúdo anterior)
      with open("notas.txt", "w") as arquivo:
          arquivo.write("Ana,9\n")
          arquivo.write("Bruno,7\n")

      # ler linha por linha
      with open("notas.txt") as arquivo:
          for linha in arquivo:
              nome, nota = linha.strip().split(",")
              print(f"{nome} tirou {nota}")
      ~~~

      | Modo | Significa |
      |---|---|
      | \`"r"\` | ler (padrão) |
      | \`"w"\` | escrever (apaga o que havia) |
      | \`"a"\` | acrescentar no final |

      > 💡 \`split(",")\` quebra um texto em lista: \`"Ana,9".split(",")\` vira \`["Ana", "9"]\`. É assim que se lê um arquivo CSV simples.

      Aqui no navegador os arquivos vivem num sistema de arquivos temporário em memória — tudo funciona igual, mas some quando a página recarrega.
    `, [
      run('Escreva as linhas `maçã`, `banana` e `uva` no arquivo `lista.txt` e depois leia o arquivo mostrando cada linha com o número dela: `1 maçã`, `2 banana`, `3 uva`.', 'with open("lista.txt", "w") as f:\n    f.write("maçã\\nbanana\\nuva\\n")\n\n# leia aqui\n', '1 maçã\n2 banana\n3 uva', {
        hint: 'Use enumerate(f, start=1) e linha.strip().',
        solution: 'with open("lista.txt", "w") as f:\n    f.write("maçã\\nbanana\\nuva\\n")\n\nwith open("lista.txt") as f:\n    for i, linha in enumerate(f, start=1):\n        print(i, linha.strip())',
      }),
    ]),
    lesson('Módulos e a biblioteca padrão', md`
      Python vem com "baterias incluídas": centenas de módulos prontos. Use \`import\`:

      ~~~python
      import math
      print(math.sqrt(16))   # 4.0
      print(math.pi)         # 3.141592653589793

      from random import randint, choice
      print(randint(1, 6))           # número de 1 a 6
      print(choice(["pedra", "papel", "tesoura"]))

      from datetime import date
      print(date.today().year)
      ~~~

      Módulos populares:

      | Módulo | Para quê |
      |---|---|
      | \`math\` | funções matemáticas |
      | \`random\` | números aleatórios |
      | \`datetime\` | datas e horas |
      | \`json\` | ler e gerar JSON |
      | \`os\`, \`pathlib\` | arquivos e pastas |

      ## Pacotes externos

      Fora do navegador, você instala bibliotecas da comunidade com \`pip\`: \`pip install requests\`. Assim nascem projetos de dados (\`pandas\`), sites (\`django\`, \`flask\`) e IA (\`scikit-learn\`).

      ## Seus próprios módulos

      Qualquer arquivo \`.py\` é um módulo. Se você tem \`util.py\` com uma função \`dobro\`, em outro arquivo basta \`from util import dobro\`.
    `, [
      run('Use o módulo `math` para mostrar a raiz quadrada de 144 e o valor de `math.floor(7.8)`, um por linha.', 'import math\n', '12.0\n7', {
        hint: 'math.sqrt(144) e math.floor(7.8).',
        solution: 'import math\nprint(math.sqrt(144))\nprint(math.floor(7.8))',
      }),
    ]),
  ], [
    choice('Qual bloco roda quando ocorre um erro tratado?', ['`try`', '`except`', '`else`', '`def`'], 1, 'O `except` captura o erro lançado dentro do `try`.'),
    predict('Qual é a saída?', 'try:\n    print(10 / 0)\nexcept ZeroDivisionError:\n    print("erro")', 'erro', 'Dividir por zero lança `ZeroDivisionError`, que é capturado.'),
    choice('O que o modo `"a"` faz em `open("x.txt", "a")`?', ['Apaga o arquivo', 'Acrescenta conteúdo no final', 'Só lê', 'Cria uma pasta'], 1, '`"a"` (append) escreve no final sem apagar o que existe.'),
    predict('Qual é a saída?', 'print("a,b,c".split(","))', "['a', 'b', 'c']", '`split` divide o texto no separador.'),
    fill('Complete para importar só a função `sqrt` do módulo `math`:', '___ math import sqrt', 'from', '`from módulo import nome`.'),
    choice('Quando o bloco `finally` executa?', ['Só se der erro', 'Só se não der erro', 'Sempre', 'Nunca'], 2, '`finally` roda sempre, com ou sem erro.'),
  ]),

  mod('poo', 'Orientação a objetos', 'Classes, objetos, métodos e herança.', [
    lesson('Classes e objetos', md`
      Uma **classe** é um molde. Um **objeto** é algo criado a partir desse molde.

      ~~~python
      class Cachorro:
          def __init__(self, nome, idade):
              self.nome = nome      # atributo
              self.idade = idade

          def latir(self):          # método
              print(f"{self.nome} diz: Au au!")

      rex = Cachorro("Rex", 3)
      bob = Cachorro("Bob", 5)
      rex.latir()
      print(bob.idade)
      ~~~

      - \`__init__\` é o **construtor**: roda quando o objeto é criado.
      - \`self\` é o próprio objeto. É por ele que cada cachorro guarda o *seu* nome.
      - **Atributos** são os dados (\`nome\`, \`idade\`); **métodos** são as ações (\`latir\`).

      > 💡 Pense em classe como a planta de uma casa e objetos como as casas construídas a partir dela.
    `, [
      run('Complete a classe `Conta` com o método `depositar(valor)` que soma ao saldo. O teste já está escrito.', 'class Conta:\n    def __init__(self, titular):\n        self.titular = titular\n        self.saldo = 0\n\n    def depositar(self, valor):\n        pass\n\nc = Conta("Ana")\nc.depositar(100)\nc.depositar(50)\nprint(c.titular, c.saldo)', 'Ana 150', {
        hint: 'self.saldo += valor',
        solution: 'class Conta:\n    def __init__(self, titular):\n        self.titular = titular\n        self.saldo = 0\n\n    def depositar(self, valor):\n        self.saldo += valor\n\nc = Conta("Ana")\nc.depositar(100)\nc.depositar(50)\nprint(c.titular, c.saldo)',
      }),
    ]),
    lesson('Herança', md`
      Uma classe pode **herdar** de outra, reaproveitando atributos e métodos:

      ~~~python
      class Animal:
          def __init__(self, nome):
              self.nome = nome

          def falar(self):
              return "..."

          def apresentar(self):
              print(f"{self.nome}: {self.falar()}")

      class Gato(Animal):
          def falar(self):          # sobrescreve o método
              return "Miau"

      class Vaca(Animal):
          def falar(self):
              return "Muuu"

      for bicho in [Gato("Mimi"), Vaca("Mimosa")]:
          bicho.apresentar()
      ~~~

      ~~~text
      Mimi: Miau
      Mimosa: Muuu
      ~~~

      Isso se chama **polimorfismo**: o mesmo método (\`falar\`) se comporta diferente em cada classe.

      ## super()

      Para estender o construtor da classe-mãe:

      ~~~python
      class Funcionario:
          def __init__(self, nome, salario):
              self.nome = nome
              self.salario = salario

      class Gerente(Funcionario):
          def __init__(self, nome, salario, equipe):
              super().__init__(nome, salario)
              self.equipe = equipe
      ~~~
    `, [
      predict('Qual é a saída?', 'class A:\n    def oi(self):\n        return "A"\nclass B(A):\n    pass\nprint(B().oi())', 'A', '`B` herda `oi` de `A`.'),
    ]),
    lesson('Métodos especiais e boas práticas', md`
      Métodos com dois sublinhados (*dunder*) dão superpoderes às classes.

      ~~~python
      class Produto:
          def __init__(self, nome, preco):
              self.nome = nome
              self.preco = preco

          def __str__(self):
              return f"{self.nome} (R$ {self.preco:.2f})"

      p = Produto("Café", 18.5)
      print(p)  # Café (R$ 18.50)
      ~~~

      | Método | Quando é chamado |
      |---|---|
      | \`__init__\` | ao criar o objeto |
      | \`__str__\` | em \`print(obj)\` e \`str(obj)\` |
      | \`__len__\` | em \`len(obj)\` |
      | \`__eq__\` | em \`obj1 == obj2\` |

      ## dataclass: menos código repetido

      ~~~python
      from dataclasses import dataclass

      @dataclass
      class Ponto:
          x: int
          y: int

      print(Ponto(1, 2))  # Ponto(x=1, y=2)
      ~~~

      ## Próximos passos

      Parabéns por chegar até aqui! Com o que você aprendeu já dá para criar jogos de texto, automatizar planilhas e começar em ciência de dados. Faça a prova final e pegue seu certificado. 🎓
    `, [
      run('Adicione o método `__str__` à classe `Livro` para que `print(livro)` mostre `Dom Casmurro, de Machado de Assis`.', 'class Livro:\n    def __init__(self, titulo, autor):\n        self.titulo = titulo\n        self.autor = autor\n\nlivro = Livro("Dom Casmurro", "Machado de Assis")\nprint(livro)', 'Dom Casmurro, de Machado de Assis', {
        hint: 'def __str__(self): return f"{self.titulo}, de {self.autor}"',
        solution: 'class Livro:\n    def __init__(self, titulo, autor):\n        self.titulo = titulo\n        self.autor = autor\n\n    def __str__(self):\n        return f"{self.titulo}, de {self.autor}"\n\nlivro = Livro("Dom Casmurro", "Machado de Assis")\nprint(livro)',
      }),
    ]),
  ], [
    choice('O que é `self` dentro de um método?', ['Uma palavra reservada sem uso', 'O próprio objeto que chamou o método', 'A classe-mãe', 'Uma variável global'], 1, '`self` referencia a instância atual.'),
    choice('Qual método é o construtor em Python?', ['`__str__`', '`__new__`', '`__init__`', '`constructor`'], 2, '`__init__` inicializa o objeto ao ser criado.'),
    predict('Qual é a saída?', 'class C:\n    def __init__(self):\n        self.n = 1\n    def inc(self):\n        self.n += 1\nc = C()\nc.inc()\nc.inc()\nprint(c.n)', '3', 'Começa em 1 e incrementa duas vezes.'),
    fill('Complete para `Carro` herdar de `Veiculo`:', 'class Carro(___):\n    pass', 'Veiculo', 'A classe-mãe vai entre parênteses.'),
    bug('Qual linha tem erro?', md`
      class Pessoa:
          def __init__(nome):
              self.nome = nome
      p = Pessoa("Ana")
    `, 2, 'Todo método precisa receber `self` como primeiro parâmetro: `def __init__(self, nome):`.'),
    choice('O que é polimorfismo?', ['Uma classe com muitos atributos', 'Classes diferentes respondendo ao mesmo método de jeitos diferentes', 'Um erro de herança', 'Copiar código entre classes'], 1, 'Ex.: `Gato.falar()` e `Vaca.falar()` retornam coisas diferentes.'),
  ]),
];
